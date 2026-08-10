import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("결혼 준비 대시보드를 서버 렌더링한다", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /class="topbar"/);
  assert.match(html, /class="overview"/);
  assert.match(html, /class="category-grid"/);
  assert.match(html, /class="vendor-grid"/);
  assert.match(html, /8월 12일/);
  assert.match(html, /950만원/);
  assert.doesNotMatch(html, /7월 29일/);
  assert.doesNotMatch(html, /원규 스튜디오 중도금 30만원 입금/);
  assert.match(html, /원규 스튜디오/);
  assert.match(html, /슈트패브릭 렌탈센터/);
  assert.match(html, /xn--sm2b21oe3m6la\.com/);
  assert.match(html, /원규 추가비용/);
  assert.match(html, /₩55,000 \/ 1회/);
  assert.match(html, /야간 로드씬/);
  assert.match(html, /<title>혜린이랑 결혼 준비하기<\/title>/);
  assert.match(html, /더채플앳 청담/);
  assert.match(html, /본예산 예상/);
  assert.match(html, /오키나와에서 삿포로까지/);
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
  assert.match(html, /docs\.google\.com\/spreadsheets/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("스타터 자산을 제거하고 공유 이미지를 포함한다", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const nextTask = priorityTasks\.find/);
  assert.match(page, /filteredTasks\.length === 0/);
  assert.doesNotMatch(page, /7월 28일/);
  assert.match(page, /혜린이랑 결혼 준비하기/);
  assert.match(layout, /\/og\.png/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../public/og.png", import.meta.url));
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
