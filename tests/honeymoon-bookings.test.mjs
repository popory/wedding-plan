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
  assert.deepEqual(parseHoneymoonBookings([["항공권", "출국편 예약 완료"], rows[1]]), [
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
});
