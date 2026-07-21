"use client";

import { useMemo, useState } from "react";
import {
  budgetCategories,
  dashboardMetrics,
  honeymoonRoute,
  priorityTasks,
  timeline,
  vendors,
} from "./generated-data";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1hLlN5guuiRp_apkWUCCwqe_T0yQVXeAWvxKKWGgoAOg/edit";

const numberFormat = new Intl.NumberFormat("ko-KR");

function compactWon(amount: number) {
  if (amount >= 100_000_000) {
    const eok = amount / 100_000_000;
    return `${eok % 1 === 0 ? eok : eok.toFixed(2)}억원`;
  }
  return `${numberFormat.format(Math.round(amount / 10_000))}만원`;
}

function expandedWon(amount: number) {
  const eok = Math.floor(amount / 100_000_000);
  const man = Math.round((amount % 100_000_000) / 10_000);
  if (eok === 0) return `${numberFormat.format(man)}만원`;
  return `${eok}억 ${numberFormat.format(man)}만원`;
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
  const budgetPercent = Math.min(
    100,
    (dashboardMetrics.expectedBudget / dashboardMetrics.targetBudget) * 100,
  );

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
              <strong>{dashboardMetrics.progress}%</strong>
            </div>
            <div
              className="progress-track"
              aria-label={`전체 진행률 ${dashboardMetrics.progress}%`}
            >
              <span style={{ width: `${dashboardMetrics.progress}%` }} />
            </div>
            <p>
              {dashboardMetrics.totalTasks}개 중 {dashboardMetrics.completedTasks}개 완료 · 진행중{" "}
              {dashboardMetrics.ongoingTasks} · 미정 {dashboardMetrics.undecidedTasks}
            </p>
          </article>
          <article className="metric">
            <span>본예산 예상</span>
            <strong>{compactWon(dashboardMetrics.expectedBudget)}</strong>
            <p>
              목표 {compactWon(dashboardMetrics.targetBudget)} · 예상 잔여{" "}
              {compactWon(dashboardMetrics.remainingBudget)}
            </p>
          </article>
          <article className="metric separated">
            <span>집·혼수 별도</span>
            <strong>{expandedWon(dashboardMetrics.homeBudget + dashboardMetrics.furnishingsBudget)}</strong>
            <p>
              전세·부대비 {expandedWon(dashboardMetrics.homeBudget)} · 혼수{" "}
              {expandedWon(dashboardMetrics.furnishingsBudget)} · 입주/설치 완료
            </p>
          </article>
          <article className="metric attention">
            <span>높음 미완료</span>
            <strong>{dashboardMetrics.highIncomplete}개</strong>
            <p>새 체크리스트 반영 · 완료하면 시트에서 바로 갱신</p>
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
            <span className="updated">시트 확인 {dashboardMetrics.updatedAt}</span>
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
            <h2>{compactWon(dashboardMetrics.expectedBudget)} 안에서 준비 중</h2>
          </div>
          <div className="budget-summary-inline">
            <span>실제 입력</span>
            <strong>{compactWon(dashboardMetrics.actualBudget)}</strong>
          </div>
        </div>

        <div className="budget-layout">
          <div className="budget-visual">
            <div className="budget-scale">
              <div>
                <span>예상</span>
                <strong>{compactWon(dashboardMetrics.expectedBudget)}</strong>
              </div>
              <div>
                <span>목표</span>
                <strong>{compactWon(dashboardMetrics.targetBudget)}</strong>
              </div>
            </div>
            <div
              className="budget-track"
              aria-label={`목표 예산 대비 예상 예산 ${Math.round(budgetPercent)}%`}
            >
              <span style={{ width: `${budgetPercent}%` }} />
            </div>
            <p className="budget-note">
              예상 기준으로 목표의 {Math.round(budgetPercent)}% 사용 ·{" "}
              {compactWon(dashboardMetrics.remainingBudget)} 여유
            </p>

            <div className="separate-budget">
              <div>
                <span>인덕원 전세·부대비</span>
                <strong>{expandedWon(dashboardMetrics.homeBudget)}</strong>
              </div>
              <div>
                <span>가구·가전·혼수</span>
                <strong>{expandedWon(dashboardMetrics.furnishingsBudget)}</strong>
              </div>
              <p>본예산과 합산하지 않고 별도 관리합니다. 입주와 설치는 모두 완료됐습니다.</p>
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
                    style={{
                      width: `${Math.max(4, (category.amount / Math.max(...budgetCategories.map((item) => item.amount))) * 100)}%`,
                    }}
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
            <span className="section-stat">{vendors.length}개 업체 관리 중</span>
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
            <p className="eyebrow">예식까지 {dDay}</p>
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
              <h2>오키나와에서 삿포로까지</h2>
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
            <strong>다구간 항공 · 오키나와/삿포로 숙소 후보 확정</strong>
            <p>여권 영문명과 유효기간은 항공권 결제 전에 먼저 확인합니다.</p>
          </div>
        </div>
      </section>

      <footer>
        <div className="page-shell footer-inner">
          <div>
            <strong>혜린이랑 결혼 준비하기</strong>
            <p>Google Sheets 내용을 {dashboardMetrics.updatedAt} 기준으로 정리한 보기 전용 사이트입니다.</p>
          </div>
          <a href={SHEET_URL} target="_blank" rel="noreferrer">
            시트에서 수정하기
          </a>
        </div>
      </footer>
    </main>
  );
}
