"use client";

import { useMemo, useState } from "react";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1hLlN5guuiRp_apkWUCCwqe_T0yQVXeAWvxKKWGgoAOg/edit";

const budgetCategories = [
  { label: "예식장·식사", amount: 24_640_000, color: "coral" },
  { label: "스드메·기록", amount: 10_460_000, color: "blue" },
  { label: "신혼여행", amount: 7_500_000, color: "green" },
  { label: "예물", amount: 5_000_000, color: "gold" },
  { label: "가족·감사", amount: 4_600_000, color: "plum" },
  { label: "예비비", amount: 3_500_000, color: "gray" },
  { label: "청첩장·소품", amount: 1_000_000, color: "mint" },
  { label: "교통·행정", amount: 1_000_000, color: "navy" },
  { label: "의상·뷰티", amount: 800_000, color: "pink" },
];

const priorityTasks = [
  {
    date: "완료 확인",
    title: "입주청소 결과 기록",
    detail: "하자 사진, 환기, 잔금 34만원 지급 여부 확인",
    type: "확인",
    priority: "높음",
  },
  {
    date: "완료 확인",
    title: "가구·가전·인터넷 설치 정리",
    detail: "제품 상태, 영수증, 보증서, 인터넷 개통 확인",
    type: "확인",
    priority: "높음",
  },
  {
    date: "완료 확인",
    title: "상견례 실제 비용 입력",
    detail: "7월 12일 부산역 사해방, 11명 식사비 정산",
    type: "확인",
    priority: "높음",
  },
  {
    date: "7월 28일",
    title: "원규 스튜디오 중도금",
    detail: "30만원 계좌이체, 촬영일은 8월 28일 14:00",
    type: "결제",
    priority: "높음",
  },
  {
    date: "8월 14일",
    title: "스튜디오 촬영 옵션 결정",
    detail: "헬퍼비, 드레스 업그레이드, 한복·야외 촬영 여부",
    type: "결정",
    priority: "중간",
  },
  {
    date: "8월 15일",
    title: "양가 하객 1차 명단",
    detail: "보증 200명, 예상 220명 기준으로 참석 가능성 정리",
    type: "결정",
    priority: "높음",
  },
  {
    date: "8월 31일",
    title: "신혼여행 항공·숙소 예약",
    detail: "인천→오키나와→오사카→인천 다구간 비교",
    type: "예약",
    priority: "높음",
  },
];

const vendors = [
  {
    name: "더채플앳 청담",
    category: "예식장",
    status: "계약 완료",
    total: "2,464만원 예상",
    next: "최종 보증인원 확정 후 잔금 1,810만~1,964만원 정산",
    date: "2026. 11. 1. 13:00",
  },
  {
    name: "원규 스튜디오",
    category: "스튜디오",
    status: "촬영 준비",
    total: "169만원",
    next: "7월 28일 중도금 30만원 · 8월 28일 잔금 99만원",
    date: "2026. 8. 28. 14:00",
  },
  {
    name: "아델라인스냅",
    category: "본식 스냅",
    status: "예약 완료",
    total: "150만원",
    next: "10월 27일까지 잔금 120만원, 수령 즉시 데이터 백업",
    date: "대표 + 실장 2인 촬영",
  },
  {
    name: "류필름",
    category: "본식 영상",
    status: "촬영 준비",
    total: "152만원",
    next: "식순 입력, 후기 이벤트와 잔금 132만원 안내 확인",
    date: "다큐멘터리 풀스토리형",
  },
];

const timeline = [
  { date: "7.28", title: "원규 중도금 30만원", state: "예정" },
  { date: "8.14", title: "촬영 옵션·준비 확정", state: "진행중" },
  { date: "8.15", title: "양가 하객 1차 명단", state: "진행중" },
  { date: "8.28", title: "원규 스튜디오 촬영", state: "확정" },
  { date: "8.31", title: "신혼여행 항공·숙소 예약", state: "진행중" },
  { date: "9.20", title: "청첩장 문구·방향 초안", state: "미정" },
  { date: "10.18", title: "예식장 최종 미팅·보증 확정", state: "미정" },
  { date: "11.01", title: "더채플앳 청담 예식", state: "확정" },
];

const honeymoonRoute = [
  { date: "11/2", city: "오키나와", plan: "도착 · 체크인", state: "초안" },
  { date: "11/3", city: "오키나와", plan: "국제거리 · 아메리칸빌리지", state: "초안" },
  { date: "11/4", city: "오키나와", plan: "츄라우미 · 코우리대교", state: "예약필요" },
  { date: "11/5", city: "오키나와", plan: "리조트 · 해변 휴식", state: "초안" },
  { date: "11/6", city: "오사카", plan: "이동 · 도톤보리", state: "예약필요" },
  { date: "11/7", city: "오사카", plan: "난바 · 우메다", state: "초안" },
  { date: "11/8", city: "오사카", plan: "USJ 또는 자유일", state: "예약필요" },
  { date: "11/9", city: "근교", plan: "교토·나라 또는 온천", state: "초안" },
  { date: "11/10", city: "오사카", plan: "쇼핑 · 마지막 식사", state: "초안" },
  { date: "11/11", city: "귀국", plan: "오사카 → 한국", state: "확정" },
];

const numberFormat = new Intl.NumberFormat("ko-KR");

function compactWon(amount: number) {
  if (amount >= 100_000_000) {
    const eok = amount / 100_000_000;
    return `${eok % 1 === 0 ? eok : eok.toFixed(2)}억원`;
  }
  return `${numberFormat.format(Math.round(amount / 10_000))}만원`;
}

function getDDay() {
  const wedding = new Date("2026-11-01T13:00:00+09:00").getTime();
  const now = Date.now();
  const days = Math.ceil((wedding - now) / 86_400_000);
  return days >= 0 ? `D-${days}` : `D+${Math.abs(days)}`;
}

export default function Home() {
  const [taskFilter, setTaskFilter] = useState("전체");
  const [dDay] = useState(getDDay);

  const filteredTasks = useMemo(() => {
    if (taskFilter === "전체") return priorityTasks;
    if (taskFilter === "높음") {
      return priorityTasks.filter((task) => task.priority === "높음");
    }
    return priorityTasks.filter((task) => task.type === taskFilter);
  }, [taskFilter]);

  return (
    <main>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#overview" aria-label="요약으로 이동">
            <span className="brand-mark">S · H</span>
            <span className="brand-copy">
              <strong>혜린이랑 결혼 준비하기</strong>
              <small>2026. 11. 01 · 더채플앳 청담</small>
            </span>
          </a>
          <a className="sheet-link" href={SHEET_URL} target="_blank" rel="noreferrer">
            원본 시트 열기
          </a>
        </div>
        <nav className="section-nav" aria-label="화면 섹션">
          <a href="#overview">요약</a>
          <a href="#tasks">할 일</a>
          <a href="#budget">예산</a>
          <a href="#vendors">계약</a>
          <a href="#schedule">일정</a>
          <a href="#honeymoon">신혼여행</a>
        </nav>
      </header>

      <section className="overview page-shell" id="overview">
        <div className="wedding-summary">
          <div>
            <p className="eyebrow">우리의 결혼식</p>
            <h1>더채플앳 청담</h1>
            <p className="wedding-meta">2026년 11월 1일 일요일 오후 1시 · 6층 채플홀</p>
          </div>
          <div className="dday-block">
            <span>{dDay}</span>
            <small>보증 200명 · 예상 220명</small>
          </div>
        </div>

        <div className="metrics-grid">
          <article className="metric metric-progress">
            <div className="metric-head">
              <span>전체 진행률</span>
              <strong>32%</strong>
            </div>
            <div className="progress-track" aria-label="전체 진행률 32%">
              <span style={{ width: "32%" }} />
            </div>
            <p>56개 중 18개 완료 · 진행중 19 · 미정 19</p>
          </article>
          <article className="metric">
            <span>본예산 예상</span>
            <strong>5,850만원</strong>
            <p>목표 8,000만원 · 예상 잔여 2,150만원</p>
          </article>
          <article className="metric separated">
            <span>집·혼수 별도</span>
            <strong>7억 8,576만원</strong>
            <p>전세·부대비 7억 6,653만원 · 혼수 1,923만원</p>
          </article>
          <article className="metric attention">
            <span>높음 미완료</span>
            <strong>14개</strong>
            <p>지난 일정 3건은 완료 여부 확인 필요</p>
          </article>
        </div>

        <div className="next-focus">
          <div>
            <span className="focus-label">가장 가까운 결제</span>
            <strong>7월 28일 · 원규 스튜디오 중도금 30만원</strong>
          </div>
          <a href="#tasks">우선순위 보기</a>
        </div>
      </section>

      <section className="section-band" id="tasks">
        <div className="page-shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">지금 챙길 것</p>
              <h2>우선순위</h2>
            </div>
            <span className="updated">시트 확인 2026. 7. 21.</span>
          </div>
          <div className="filter-row" aria-label="우선순위 필터">
            {["전체", "높음", "확인", "결제", "결정", "예약"].map((filter) => (
              <button
                type="button"
                key={filter}
                className={taskFilter === filter ? "active" : ""}
                onClick={() => setTaskFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="task-list">
            {filteredTasks.map((task) => (
              <article className="task-row" key={task.title}>
                <div className={`task-date ${task.date === "완료 확인" ? "overdue" : ""}`}>
                  {task.date}
                </div>
                <div className="task-copy">
                  <strong>{task.title}</strong>
                  <p>{task.detail}</p>
                </div>
                <span className={`status-pill status-${task.type}`}>{task.type}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell content-section" id="budget">
        <div className="section-heading">
          <div>
            <p className="eyebrow">본예산</p>
            <h2>5,850만원 안에서 준비 중</h2>
          </div>
          <div className="budget-summary-inline">
            <span>실제 입력</span>
            <strong>3,238.8만원</strong>
          </div>
        </div>

        <div className="budget-layout">
          <div className="budget-visual">
            <div className="budget-scale">
              <div>
                <span>예상</span>
                <strong>5,850만원</strong>
              </div>
              <div>
                <span>목표</span>
                <strong>8,000만원</strong>
              </div>
            </div>
            <div className="budget-track" aria-label="목표 예산 대비 예상 예산 73%">
              <span style={{ width: "73.125%" }} />
            </div>
            <p className="budget-note">예상 기준으로 목표의 73% 사용 · 2,150만원 여유</p>

            <div className="separate-budget">
              <div>
                <span>인덕원 전세·부대비</span>
                <strong>7억 6,653만원</strong>
              </div>
              <div>
                <span>가구·가전·혼수</span>
                <strong>1,923.2만원</strong>
              </div>
              <p>본예산과 합산하지 않고 별도 관리합니다.</p>
            </div>
          </div>

          <div className="category-list">
            {budgetCategories.map((category) => (
              <div className="category-row" key={category.label}>
                <div className="category-copy">
                  <span>{category.label}</span>
                  <strong>{compactWon(category.amount)}</strong>
                </div>
                <div className="category-track">
                  <span
                    className={`bar-${category.color}`}
                    style={{ width: `${Math.max(4, (category.amount / 24_640_000) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band" id="vendors">
        <div className="page-shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">계약과 결제</p>
              <h2>확정 업체</h2>
            </div>
            <span className="section-stat">4개 업체 관리 중</span>
          </div>
          <div className="vendor-grid">
            {vendors.map((vendor) => (
              <article className="vendor-card" key={vendor.name}>
                <div className="vendor-top">
                  <span>{vendor.category}</span>
                  <span className="vendor-status">{vendor.status}</span>
                </div>
                <h3>{vendor.name}</h3>
                <p className="vendor-date">{vendor.date}</p>
                <div className="vendor-cost">{vendor.total}</div>
                <p className="vendor-next">{vendor.next}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell content-section" id="schedule">
        <div className="section-heading">
          <div>
            <p className="eyebrow">앞으로 103일</p>
            <h2>주요 일정</h2>
          </div>
          <span className="section-stat">예식 후 11월 2일 출국</span>
        </div>
        <div className="timeline">
          {timeline.map((item, index) => (
            <article className="timeline-item" key={`${item.date}-${item.title}`}>
              <div className="timeline-marker">
                <span />
                {index < timeline.length - 1 && <i />}
              </div>
              <time>{item.date}</time>
              <strong>{item.title}</strong>
              <span className={`timeline-state state-${item.state}`}>{item.state}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="honeymoon-section" id="honeymoon">
        <div className="page-shell">
          <div className="honeymoon-heading">
            <div>
              <p className="eyebrow">9박 10일</p>
              <h2>오키나와에서 오사카까지</h2>
              <p>2026년 11월 2일 출발 · 11월 11일 귀국</p>
            </div>
            <div className="honeymoon-budget">
              <span>임시 예산</span>
              <strong>750만원</strong>
              <small>항공·숙소 500 · 현지비 250</small>
            </div>
          </div>

          <div className="trip-route">
            {honeymoonRoute.map((day) => (
              <article className="trip-day" key={day.date}>
                <time>{day.date}</time>
                <div>
                  <span>{day.city}</span>
                  <strong>{day.plan}</strong>
                </div>
                <em className={day.state === "예약필요" ? "needs-booking" : ""}>{day.state}</em>
              </article>
            ))}
          </div>

          <div className="trip-checks">
            <span>8월 31일까지</span>
            <strong>다구간 항공 · 오키나와/오사카 숙소 후보 확정</strong>
            <p>여권 영문명과 유효기간은 항공권 결제 전에 먼저 확인합니다.</p>
          </div>
        </div>
      </section>

      <footer>
        <div className="page-shell footer-inner">
          <div>
            <strong>혜린이랑 결혼 준비하기</strong>
            <p>Google Sheets 내용을 2026년 7월 21일 기준으로 정리한 보기 전용 사이트입니다.</p>
          </div>
          <a href={SHEET_URL} target="_blank" rel="noreferrer">
            시트에서 수정하기
          </a>
        </div>
      </footer>
    </main>
  );
}
