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
