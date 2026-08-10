import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { parseHoneymoonBookings } from "./honeymoon-bookings.mjs";

const spreadsheetId = "1hLlN5guuiRp_apkWUCCwqe_T0yQVXeAWvxKKWGgoAOg";
const outputPath = resolve("app/generated-data.ts");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted && char === '"' && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ",") {
      row.push(field);
      field = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

async function fetchRange(sheet, range) {
  const params = new URLSearchParams({ tqx: "out:csv", headers: "0", sheet, range });
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?${params}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${sheet} 시트를 읽지 못했습니다: ${response.status}`);
  return parseCsv(await response.text());
}

function won(value) {
  return Number(String(value ?? "").replace(/[^0-9-]/g, "")) || 0;
}

function compactWon(value) {
  return `${Math.round(value / 10_000).toLocaleString("ko-KR")}만원`;
}

function dateFromText(value) {
  const match = String(value ?? "").match(/2026-(\d{2})-(\d{2})/);
  if (!match) return null;
  return {
    iso: `2026-${match[1]}-${match[2]}`,
    label: `${Number(match[1])}월 ${Number(match[2])}일`,
    short: `${Number(match[1])}.${match[2]}`,
  };
}

function classifyTask(title) {
  if (/금|결제/.test(title)) return "결제";
  if (/예약|대여/.test(title)) return "예약";
  if (/확인|검수/.test(title)) return "확인";
  return "결정";
}

function taskRows(rows) {
  return rows
    .slice(3)
    .map((row) => ({
      title: row[3] ?? "",
      priority: row[5] ?? "중간",
      status: row[6] ?? "미정",
      deadline: dateFromText(row[7]),
      detail: row[8] ?? "",
    }))
    .filter((task) => task.title && task.status !== "완료" && task.deadline)
    .sort((a, b) => a.deadline.iso.localeCompare(b.deadline.iso));
}

function findRow(rows, first, second) {
  return rows.find((row) => row[0] === first && (second === undefined || row[1] === second)) ?? [];
}

function serialize(name, value) {
  return `export const ${name} = ${JSON.stringify(value, null, 2)};\n`;
}

const [checklist, budget, venue, studio, studioExtrasSource, suitRentalBudget, suitRentalDetails, snap, video, honeymoon] = await Promise.all([
  fetchRange("전체체크리스트", "A3:L120"),
  fetchRange("결혼예산", "A2:L4"),
  fetchRange("예식장", "A12:C19"),
  fetchRange("스튜디오", "A17:F21"),
  fetchRange("스튜디오", "A49:F57"),
  fetchRange("결혼예산", "A17:L17"),
  fetchRange("스튜디오", "A36:F37"),
  fetchRange("본식스냅", "A18:F20"),
  fetchRange("본식영상", "A10:F14"),
  fetchRange("신혼여행", "A25:F41"),
]);

const summary = checklist[0] ?? [];
const counts = checklist[1] ?? [];
const budgetSummary = budget[0] ?? [];
const budgetCategoriesRow = budget[1] ?? [];
const secondaryCategoriesRow = budget[2] ?? [];
const tasks = taskRows(checklist);

const dashboardMetrics = {
  updatedAt: new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: "Asia/Seoul" }).format(new Date()),
  progress: Number(String(summary[9] ?? "0").replace("%", "")) || 0,
  totalTasks: Number(counts[1]) || 0,
  completedTasks: Number(counts[3]) || 0,
  ongoingTasks: Number(counts[5]) || 0,
  undecidedTasks: Number(counts[7]) || 0,
  expectedBudget: won(budgetSummary[3]),
  actualBudget: won(budgetSummary[7]),
  remainingBudget: won(budgetSummary[9]),
  highIncomplete: Number(summary[11]) || 0,
  targetBudget: won(budgetSummary[1]),
  homeBudget: 766_530_000,
  furnishingsBudget: 19_232_000,
};

const budgetCategories = [
  { label: "예식장·식사", amount: won(budgetCategoriesRow[7]), color: "coral" },
  { label: "스드메·기록", amount: won(budgetCategoriesRow[9]), color: "blue" },
  { label: "신혼여행", amount: won(budgetCategoriesRow[3]), color: "green" },
  { label: "예물", amount: won(budgetCategoriesRow[11]), color: "gold" },
  { label: "가족·감사", amount: won(secondaryCategoriesRow[7]), color: "plum" },
  { label: "예비비", amount: won(secondaryCategoriesRow[11]), color: "gray" },
  { label: "청첩장·소품", amount: won(secondaryCategoriesRow[3]), color: "mint" },
  { label: "교통·행정", amount: won(secondaryCategoriesRow[9]), color: "navy" },
  { label: "의상·뷰티", amount: won(secondaryCategoriesRow[1]), color: "pink" },
];

const priorityTasks = tasks.slice(0, 4).map((task) => ({
  date: task.deadline.label,
  title: task.title,
  detail: task.detail.slice(0, 90),
  type: classifyTask(task.title),
  priority: task.priority,
}));

const venueTotal = findRow(venue, "예상 총액")[1] || "₩24,640,000";
const studioTotal = findRow(studio, "금액", "총액")[2] || "₩1,690,000";
const snapTotal = findRow(snap, "금액", "공급가")[2] || "1,500,000원";
const videoTotal = findRow(video, "금액", "최종 반영액")[2] || "₩1,520,000";

const vendors = [
  {
    name: "더채플앳 청담",
    category: "예식장",
    status: "계약 완료",
    total: compactWon(won(venueTotal)),
    next: "시식 4인·트리스스파 2회 예약 후 최종 보증인원 확정",
    date: "2026. 11. 1. 13:00",
  },
  {
    name: "원규 스튜디오",
    category: "스튜디오",
    status: "촬영 준비",
    total: compactWon(won(studioTotal)),
    next: "슈트패브릭 촬영·본식 의상 계약 완료, 8/14 드레스·포트폴리오·촬영 옵션 확정",
    date: "2026. 8. 28. 14:00",
  },
  {
    name: "아델라인스냅",
    category: "본식 스냅",
    status: "예약 완료",
    total: compactWon(won(snapTotal)),
    next: "포트폴리오/필수 컷 전달 후 예식 5일 전 잔금",
    date: "대표 + 실장 2인 촬영",
  },
  {
    name: "류필름",
    category: "본식 영상",
    status: "촬영 준비",
    total: compactWon(won(videoTotal)),
    next: "식순·축가·MR·플라워샤워 순서 전달",
    date: "다큐멘터리 풀스토리형",
  },
];

const suitRentalTask = checklist.find((row) => row[3] === "슈트패브릭 렌탈센터 방문 상담") ?? [];
const suitRentalRow = suitRentalBudget[0] ?? [];
const shootingSuit = suitRentalDetails.find((row) => row[0] === "촬영 의상") ?? [];
const ceremonySuit = suitRentalDetails.find((row) => row[0] === "본식 의상") ?? [];
const studioPlan = {
  vendor: "슈트패브릭 렌탈센터",
  visit: "촬영복 8/28 · 본식복 10/31",
  detail: `촬영복: ${shootingSuit[4] || suitRentalTask[8] || "계약 완료"} / 본식복: ${ceremonySuit[4] || "계약 완료"}`,
  budget: `${compactWon(won(suitRentalRow[2]))} 임시예산`,
  url: "https://xn--sm2b21oe3m6la.com/default/",
};

const studioExtras = studioExtrasSource
  .filter((row) => row[0] === "별도비용" || row[0] === "추가선택")
  .map((row) => ({
    kind: row[0] === "별도비용" ? "필수" : "선택",
    item: row[1] ?? "",
    price: row[2] ?? "",
    status: row[3] ?? "미정",
    note: row[4] ?? "",
  }));

const timeline = tasks.slice(0, 7).map((task) => ({
  date: task.deadline.short,
  title: task.title,
  state: task.status,
}));
timeline.push({ date: "08.28", title: "슈트패브릭 촬영복 대여 · 8/29 20:00 반납", state: "확정" });
timeline.push({ date: "10.31", title: "슈트패브릭 본식복 대여 · 11/1 20:00 반납", state: "확정" });
timeline.push({ date: "11.01", title: "더채플앳 청담 예식", state: "확정" });

const honeymoonBookings = parseHoneymoonBookings(honeymoon);

const honeymoonRoute = honeymoon
  .filter((row) => row[0] && row[2])
  .map((row) => {
    const course = row[2];
    let city = "일본";
    if (course.includes("오키나와")) city = "오키나와";
    if (course.includes("리조트/해변")) city = "오키나와";
    if (course.includes("삿포로")) city = "삿포로";
    if (course.includes("오타루")) city = "오타루";
    if (/조잔케이|노보리베츠/.test(course)) city = "홋카이도 근교";
    if (course.includes("인천 도착")) city = "귀국";
    return { date: row[0], city, plan: course, state: row[5] || "초안" };
  });

const output = [
  serialize("dashboardMetrics", dashboardMetrics),
  serialize("budgetCategories", budgetCategories),
  serialize("priorityTasks", priorityTasks),
  serialize("vendors", vendors),
  serialize("studioPlan", studioPlan),
  serialize("studioExtras", studioExtras),
  serialize("timeline", timeline),
  serialize("honeymoonBookings", honeymoonBookings),
  serialize("honeymoonRoute", honeymoonRoute),
].join("\n");

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, output.replace(/\r\n/g, "\n"), "utf8");
