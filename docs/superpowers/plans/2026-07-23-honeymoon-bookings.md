# Honeymoon Booking Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 신혼여행 영역에 시트에서 동기화한 오키나와 출국편과 할레쿨라니 숙소의 확정 예약 상세를 개인정보 없이 표시한다.

**Architecture:** `신혼여행` 탭의 예약 메모를 허용 목록 기반 파서로 구조화해 `app/generated-data.ts`에 공개 필드만 생성한다. 페이지는 생성된 예약 배열만 받아 항공편과 숙소 카드를 렌더링하며, 데이터가 없거나 메모를 해석할 수 없으면 해당 카드만 숨긴다.

**Tech Stack:** Node.js 22, Next.js 16, React 19, TypeScript 5, CSS, Node test runner, Google Sheets CSV 동기화

## Global Constraints

- 현재 디자인과 신혼여행 일정표 흐름을 유지한다.
- 신혼여행 일정표 위에 `확정 예약` 영역을 추가한다.
- 데스크톱에서는 항공편과 숙소 카드를 2열로, 모바일에서는 1열로 표시한다.
- 예약 번호, 예약 식별자, 투숙객 및 탑승객 이름, 카드 번호, 결제 수단, 원본 PDF 링크와 파일 경로를 공개하지 않는다.
- 예약 메모를 해석할 수 없으면 해당 카드만 생략하고 기존 일정표는 정상 표시한다.
- 텍스트 파일은 UTF-8 no BOM, LF로 유지한다.
- 코드 주석을 추가할 경우 한글로 작성한다.

---

## File Structure

- Create: `scripts/honeymoon-bookings.mjs` - 시트 예약 메모에서 공개 가능한 필드만 추출하는 순수 파서
- Create: `tests/honeymoon-bookings.test.mjs` - 파서 출력, 개인정보 제외, 잘못된 입력 생략 검증
- Modify: `scripts/sync-sheet.mjs` - 예약 메모 범위를 읽고 `honeymoonBookings`를 생성 데이터에 추가
- Modify: `app/generated-data.ts` - 실제 시트 동기화로 생성되는 예약 상세 데이터
- Modify: `app/page.tsx` - 확정 예약 카드 마크업
- Modify: `app/globals.css` - 데스크톱 2열과 모바일 1열 반응형 스타일
- Modify: `tests/rendered-html.test.mjs` - 서버 렌더링 결과의 상세 표시와 개인정보 비노출 검증
- Modify: `package.json` - 두 테스트 파일을 함께 실행하도록 테스트 명령 확장

### Task 1: 공개 예약 데이터 파서와 시트 동기화

**Files:**
- Create: `scripts/honeymoon-bookings.mjs`
- Create: `tests/honeymoon-bookings.test.mjs`
- Modify: `scripts/sync-sheet.mjs:1-6,99-107,199-220`
- Modify: `package.json:9-12`
- Generated: `app/generated-data.ts`

**Interfaces:**
- Consumes: `Array<Array<string>>` 형태의 `신혼여행!A25:F41` 값
- Produces: `parseHoneymoonBookings(rows)`가 `{ kind, date, title, details }[]`를 반환
- Produces: `app/generated-data.ts`의 `export const honeymoonBookings`

- [ ] **Step 1: 파서 동작과 개인정보 제외를 검증하는 실패 테스트 작성**

Create `tests/honeymoon-bookings.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import { parseHoneymoonBookings } from "../scripts/honeymoon-bookings.mjs";

const rows = [
  [
    "항공권",
    "출국편 예약 완료: 11/2 11:30 인천(ICN)→14:00 나하(OKA), 이스타항공 ZE0631, 일반석(Q), 무료수하물 15kg. 예약번호 ABC123, 탑승객 이세린",
  ],
  [
    "숙소",
    "할레쿨라니 오키나와 11/5 체크인~11/7 체크아웃 2박 예약 완료. 디럭스 오션뷰 선셋윙 킹룸, 성인 2명, 조식·Wi-Fi 포함. 10/28 전 무료 취소 가능하고 현지세가 별도 부과될 수 있음. Booking ID 1745872244, 투숙객 이세린, Visa 결제, 원본 C:\\Users\\sample\\confirmation.pdf",
  ],
];

test("항공편과 숙소의 공개 필드만 구조화한다", () => {
  assert.deepEqual(parseHoneymoonBookings(rows), [
    {
      kind: "항공편",
      date: "2026년 11월 2일",
      title: "인천(ICN) → 오키나와(OKA)",
      details: [
        { label: "시간", value: "11:30 출발 · 14:00 도착" },
        { label: "운항", value: "이스타항공 ZE0631" },
        { label: "좌석", value: "일반석 Q" },
        { label: "수하물", value: "15kg" },
      ],
    },
    {
      kind: "숙소",
      date: "2026년 11월 5일 - 11월 7일 · 2박",
      title: "할레쿨라니 오키나와",
      details: [
        { label: "객실", value: "디럭스 오션뷰 선셋윙 킹룸" },
        { label: "인원", value: "성인 2명" },
        { label: "포함", value: "조식 · Wi-Fi" },
        { label: "취소", value: "2026년 10월 28일 전 무료" },
        { label: "안내", value: "현지 세금 별도 부과 가능" },
      ],
    },
  ]);

  const serialized = JSON.stringify(parseHoneymoonBookings(rows));
  assert.doesNotMatch(
    serialized,
    /ABC123|1745872244|이세린|Visa|예약번호|Booking ID|confirmation\.pdf|C:\\Users/,
  );
});

test("필수 정보를 해석할 수 없는 카드만 생략한다", () => {
  assert.deepEqual(
    parseHoneymoonBookings([
      ["항공권", "출국편 예약 완료"],
      rows[1],
    ]),
    [
      {
        kind: "숙소",
        date: "2026년 11월 5일 - 11월 7일 · 2박",
        title: "할레쿨라니 오키나와",
        details: [
          { label: "객실", value: "디럭스 오션뷰 선셋윙 킹룸" },
          { label: "인원", value: "성인 2명" },
          { label: "포함", value: "조식 · Wi-Fi" },
          { label: "취소", value: "2026년 10월 28일 전 무료" },
          { label: "안내", value: "현지 세금 별도 부과 가능" },
        ],
      },
    ],
  );
});
```

- [ ] **Step 2: 테스트가 파서 모듈 부재로 실패하는지 확인**

Run: `node --test tests/honeymoon-bookings.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/honeymoon-bookings.mjs`.

- [ ] **Step 3: 허용 목록 기반 예약 파서 구현**

Create `scripts/honeymoon-bookings.mjs`:

```js
function findMemo(rows, label) {
  return rows.find((row) => row[0] === label)?.[1] ?? "";
}

function flightBooking(memo) {
  const route = memo.match(
    /(\d{1,2})\/(\d{1,2})\s+(\d{1,2}:\d{2})\s+인천\(ICN\)→(\d{1,2}:\d{2})\s+나하\(OKA\)/,
  );
  const carrier = memo.match(/,\s*([가-힣]+)\s+([A-Z]{2}\d{3,4}),/);
  if (!route || !carrier) return null;

  const seat = memo.match(/일반석\(([^)]+)\)/)?.[1];
  const baggage = memo.match(/무료수하물\s*([0-9]+kg)/)?.[1];
  const details = [
    { label: "시간", value: `${route[3]} 출발 · ${route[4]} 도착` },
    { label: "운항", value: `${carrier[1]} ${carrier[2]}` },
    seat ? { label: "좌석", value: `일반석 ${seat}` } : null,
    baggage ? { label: "수하물", value: baggage } : null,
  ].filter(Boolean);

  return {
    kind: "항공편",
    date: `2026년 ${Number(route[1])}월 ${Number(route[2])}일`,
    title: "인천(ICN) → 오키나와(OKA)",
    details,
  };
}

function stayBooking(memo) {
  const stay = memo.match(
    /^(.+?)\s+(\d{1,2})\/(\d{1,2})\s*체크인~(\d{1,2})\/(\d{1,2})\s*체크아웃\s+(\d+)박/,
  );
  const room = memo.match(/예약 완료\.\s*(.+?),\s*성인/)?.[1];
  if (!stay || !room) return null;

  const adults = memo.match(/성인\s*(\d+)명/)?.[1];
  const included = memo.match(/성인\s*\d+명,\s*(.+?)\s*포함\./)?.[1];
  const cancellation = memo.match(/(\d{1,2})\/(\d{1,2})\s*전 무료 취소/) ?? [];
  const details = [
    { label: "객실", value: room },
    adults ? { label: "인원", value: `성인 ${adults}명` } : null,
    included ? { label: "포함", value: included.replaceAll("·", " · ") } : null,
    cancellation[1]
      ? {
          label: "취소",
          value: `2026년 ${Number(cancellation[1])}월 ${Number(cancellation[2])}일 전 무료`,
        }
      : null,
    /현지세.*별도/.test(memo) ? { label: "안내", value: "현지 세금 별도 부과 가능" } : null,
  ].filter(Boolean);

  return {
    kind: "숙소",
    date: `2026년 ${Number(stay[2])}월 ${Number(stay[3])}일 - ${Number(stay[4])}월 ${Number(stay[5])}일 · ${stay[6]}박`,
    title: stay[1],
    details,
  };
}

export function parseHoneymoonBookings(rows) {
  return [flightBooking(findMemo(rows, "항공권")), stayBooking(findMemo(rows, "숙소"))].filter(Boolean);
}
```

- [ ] **Step 4: 파서 단위 테스트 통과 확인**

Run: `node --test tests/honeymoon-bookings.test.mjs`

Expected: 2 tests PASS, 0 FAIL.

- [ ] **Step 5: 시트 동기화 스크립트에 예약 데이터 연결**

Modify `scripts/sync-sheet.mjs`:

```js
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { parseHoneymoonBookings } from "./honeymoon-bookings.mjs";
```

Change the honeymoon range and build the parsed value:

```js
  fetchRange("신혼여행", "A25:F41"),
]);

const honeymoonBookings = parseHoneymoonBookings(honeymoon);
```

Add the export before `honeymoonRoute`:

```js
  serialize("timeline", timeline),
  serialize("honeymoonBookings", honeymoonBookings),
  serialize("honeymoonRoute", honeymoonRoute),
```

Modify `package.json` so both test files run after the vinext build:

```json
"test": "npm run build && node --test tests/honeymoon-bookings.test.mjs tests/rendered-html.test.mjs"
```

- [ ] **Step 6: 실제 시트를 동기화하고 생성 데이터 확인**

Run: `npm run sync:sheet`

Expected: exit code 0 and `app/generated-data.ts` contains `export const honeymoonBookings`, `이스타항공 ZE0631`, and `할레쿨라니 오키나와`; it does not contain `1745872244`, `Booking ID`, `투숙객`, or `Visa`.

- [ ] **Step 7: 데이터 계층 변경 커밋**

```bash
git add scripts/honeymoon-bookings.mjs scripts/sync-sheet.mjs tests/honeymoon-bookings.test.mjs package.json app/generated-data.ts
git commit -m "Add honeymoon booking data parser"
```

### Task 2: 확정 예약 카드 UI와 반응형 스타일

**Files:**
- Modify: `app/page.tsx:4-11,299-331`
- Modify: `app/globals.css:780-894,941-947,1148-1186`
- Modify: `tests/rendered-html.test.mjs:21-34`

**Interfaces:**
- Consumes: `honeymoonBookings: Array<{ kind: string; date: string; title: string; details: Array<{ label: string; value: string }> }>`
- Produces: `#honeymoon-bookings` 아래의 항공편 및 숙소 예약 카드 HTML

- [ ] **Step 1: 상세 표시와 개인정보 비노출을 검증하는 실패 테스트 작성**

Add these assertions after the existing honeymoon heading assertion in `tests/rendered-html.test.mjs`:

```js
  assert.match(html, /확정 예약/);
  assert.match(html, /이스타항공 ZE0631/);
  assert.match(html, /11:30 출발 · 14:00 도착/);
  assert.match(html, /할레쿨라니 오키나와/);
  assert.match(html, /디럭스 오션뷰 선셋윙 킹룸/);
  assert.match(html, /2026년 10월 28일 전 무료/);
  assert.match(html, /현지 세금 별도 부과 가능/);
  assert.doesNotMatch(
    html,
    /1745872244|Booking ID|예약번호|투숙객|탑승객|Visa|Mastercard|카드번호|\.pdf|C:\\Users/,
  );
```

- [ ] **Step 2: 렌더링 테스트가 예약 카드 부재로 실패하는지 확인**

Run: `npm test`

Expected: FAIL in `결혼 준비 대시보드를 서버 렌더링한다` because `확정 예약` is not in the rendered HTML.

- [ ] **Step 3: 예약 데이터를 가져와 카드 마크업 추가**

Add `honeymoonBookings` to the generated-data import in `app/page.tsx`:

```tsx
import {
  budgetCategories,
  dashboardMetrics,
  honeymoonBookings,
  honeymoonRoute,
  priorityTasks,
  timeline,
  vendors,
} from "./generated-data";
```

Insert this block after `.honeymoon-heading` and before `.trip-route`:

```tsx
          {honeymoonBookings.length > 0 && (
            <section className="booking-summary" aria-labelledby="honeymoon-bookings">
              <div className="booking-summary-heading">
                <p className="eyebrow">확정 예약</p>
                <h3 id="honeymoon-bookings">예약한 항공과 숙소</h3>
              </div>
              <div className="booking-grid">
                {honeymoonBookings.map((booking) => (
                  <article className="booking-card" key={`${booking.kind}-${booking.title}`}>
                    <div className="booking-card-meta">
                      <span>{booking.kind}</span>
                      <time>{booking.date}</time>
                    </div>
                    <h4>{booking.title}</h4>
                    <dl>
                      {booking.details.map((detail) => (
                        <div key={detail.label}>
                          <dt>{detail.label}</dt>
                          <dd>{detail.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                ))}
              </div>
            </section>
          )}
```

- [ ] **Step 4: 기존 신혼여행 톤에 맞춘 데스크톱 카드 스타일 추가**

Add before `.trip-route` in `app/globals.css`:

```css
.booking-summary {
  margin: 30px 0;
}

.booking-summary-heading {
  margin-bottom: 14px;
}

.booking-summary-heading .eyebrow {
  margin: 0 0 5px;
  color: #f19a83;
}

.booking-summary-heading h3 {
  margin: 0;
  font-size: 18px;
}

.booking-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.booking-card {
  min-width: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.045);
  padding: 20px;
}

.booking-card-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  color: #b9c4c1;
  font-size: 11px;
}

.booking-card-meta span {
  color: #f19a83;
  font-weight: 800;
}

.booking-card-meta time {
  text-align: right;
}

.booking-card h4 {
  margin: 10px 0 16px;
  color: #fff3cf;
  font-size: 16px;
}

.booking-card dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

.booking-card dl > div {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  gap: 10px;
}

.booking-card dt {
  color: #9fb1ac;
  font-size: 11px;
  font-weight: 700;
}

.booking-card dd {
  min-width: 0;
  margin: 0;
  color: #f6f8f7;
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
```

- [ ] **Step 5: 모바일에서 한 열로 쌓이고 긴 텍스트가 겹치지 않게 조정**

Add inside `@media (max-width: 680px)` before `.trip-route`:

```css
  .booking-grid {
    grid-template-columns: 1fr;
  }

  .booking-card {
    padding: 16px;
  }

  .booking-card-meta {
    display: grid;
    gap: 4px;
  }

  .booking-card-meta time {
    text-align: left;
  }
```

- [ ] **Step 6: 렌더링 테스트, 린트, 정적 빌드 통과 확인**

Run: `npm test`

Expected: 4 tests PASS, 0 FAIL.

Run: `npm run lint`

Expected: exit code 0 with no ESLint errors.

Run: `npm run build:pages`

Expected: exit code 0 and static output generated under `out/`.

- [ ] **Step 7: UI 변경 커밋**

```bash
git add app/page.tsx app/globals.css tests/rendered-html.test.mjs
git commit -m "Show honeymoon booking details"
```

### Task 3: 화면 검증과 GitHub Pages 배포

**Files:**
- Verify: `out/index.html`
- Verify: `.github/workflows/deploy-pages.yml`

**Interfaces:**
- Consumes: Task 1과 Task 2의 커밋 및 정적 빌드 결과
- Produces: 공개 GitHub Pages의 최신 신혼여행 예약 상세 화면

- [ ] **Step 1: 정적 결과에서 공개 필드와 개인정보 제외 재확인**

Run:

```powershell
$html = Get-Content -Raw -Encoding UTF8 'out/index.html'
if ($html -notmatch '이스타항공 ZE0631|할레쿨라니 오키나와|디럭스 오션뷰 선셋윙 킹룸|2026년 10월 28일 전 무료') { throw '예약 상세 누락' }
if ($html -match '1745872244|Booking ID|예약번호|투숙객|탑승객|Visa|Mastercard|카드번호|\.pdf|C:\\Users') { throw '개인정보 노출' }
```

Expected: exit code 0 with no output.

- [ ] **Step 2: 로컬 개발 서버에서 데스크톱과 모바일 화면 확인**

Run: `npm run dev`

Expected: the terminal prints a local URL and remains running.

Open the local URL in the in-app browser and verify:

- 1440px viewport: 항공편과 숙소 카드가 2열이며 일정표 위에 표시된다.
- 390px viewport: 두 카드가 1열로 쌓이고 객실명과 취소 조건이 겹치거나 잘리지 않는다.
- 항공편이나 숙소 데이터가 빈 배열인 경우 예약 영역이 렌더링되지 않는 조건을 코드와 테스트로 확인한다.

- [ ] **Step 3: 작업 트리가 깨끗한지 확인하고 main 브랜치 푸시**

Run: `git status --short`

Expected: no output.

Run: `git push origin main`

Expected: push succeeds and triggers `Deploy wedding plan`.

- [ ] **Step 4: GitHub Actions와 공개 페이지 확인**

Run: `gh run list --repo popory/wedding-plan --workflow deploy-pages.yml --limit 1`

Expected: latest run completes with `success`.

Run:

```powershell
$commit = git rev-parse --short HEAD
$url = "https://popory.github.io/wedding-plan/?v=$commit"
Write-Output $url
```

Open the printed cache-busted URL and verify the public page contains the two detailed booking cards, then confirm `https://popory.github.io/wedding-plan/` also resolves successfully.

- [ ] **Step 5: 최종 상태 보고**

Report the deployed commit, successful test commands, public URL, displayed booking fields, and confirmation that booking IDs, names, and payment information are absent.
