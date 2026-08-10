"use client";

import { useMemo, useState } from "react";
import {
  budgetCategories,
  dashboardMetrics,
  honeymoonBookings,
  honeymoonRoute,
  priorityTasks,
  studioExtras,
  studioPlan,
  timeline,
  vendors,
} from "./generated-data";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1hLlN5guuiRp_apkWUCCwqe_T0yQVXeAWvxKKWGgoAOg/edit";

const NAV = [
  { href: "#tasks", label: "할 일" },
  { href: "#budget", label: "예산" },
  { href: "#vendors", label: "계약" },
  { href: "#studio-options", label: "촬영옵션" },
  { href: "#schedule", label: "일정" },
  { href: "#honeymoon", label: "신혼여행" },
];

const FILTERS = ["전체", "높음", "확인", "결제", "결정", "예약"];
const numberFormat = new Intl.NumberFormat("ko-KR");

function compactWon(amount: number) {
  if (amount >= 100_000_000) {
    const eok = amount / 100_000_000;
    return `${eok % 1 === 0 ? eok : eok.toFixed(2)}억원`;
  }
  return `${numberFormat.format(Math.round(amount / 10_000))}만원`;
}

function splitAmount(amount: number) {
  const text = compactWon(amount);
  const match = text.match(/^([\d,.]+)(.*)$/);
  return match ? { value: match[1], unit: match[2] } : { value: text, unit: "" };
}

function expandedWon(amount: number) {
  const eok = Math.floor(amount / 100_000_000);
  const man = Math.round((amount % 100_000_000) / 10_000);
  if (eok === 0) return `${numberFormat.format(man)}만원`;
  return `${eok}억 ${numberFormat.format(man)}만원`;
}

function getDDay() {
  const wedding = new Date("2026-11-01T13:00:00+09:00").getTime();
  const days = Math.ceil((wedding - Date.now()) / 86_400_000);
  return days >= 0 ? `D-${days}` : `D+${Math.abs(days)}`;
}

export default function Home() {
  const [taskFilter, setTaskFilter] = useState("전체");
  const [dDay] = useState(getDDay);

  const budgetPercent =
    dashboardMetrics.targetBudget > 0
      ? Math.round(
          Math.min(
            100,
            (dashboardMetrics.expectedBudget / dashboardMetrics.targetBudget) * 100,
          ),
        )
      : 0;
  const separateTotal = dashboardMetrics.homeBudget + dashboardMetrics.furnishingsBudget;
  const categoryTotal = budgetCategories.reduce((sum, item) => sum + item.amount, 0);
  const nextTask = priorityTasks.find((task) => task.type === "결제") ?? priorityTasks[0];

  const filteredTasks = useMemo(() => {
    if (taskFilter === "전체") return priorityTasks;
    if (taskFilter === "높음") {
      return priorityTasks.filter((task) => task.priority === "높음");
    }
    return priorityTasks.filter((task) => task.type === taskFilter);
  }, [taskFilter]);

  const expected = splitAmount(dashboardMetrics.expectedBudget);
  const separate = splitAmount(separateTotal);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#top" aria-label="요약으로 이동">
            <span className="brand-mark">SH</span>
            <span className="brand-copy">
              <strong>혜린이랑 결혼 준비하기</strong>
              <small>2026. 11. 01 · 더채플앳 청담</small>
            </span>
          </a>
          <nav className="topnav" aria-label="화면 섹션">
            {NAV.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
            <a className="sheet-link" href={SHEET_URL} target="_blank" rel="noreferrer">
              시트 열기
            </a>
          </nav>
        </div>
      </header>

      <main className="shell">
        <section className="overview" id="top">
          <div className="hero">
            <div>
              <span className="tag tag-indigo">OUR WEDDING</span>
              <h1>더채플앳 청담</h1>
              <p className="hero-meta">
                2026년 11월 1일 일요일 오후 1시 · 6층 채플홀 · 보증 200명
              </p>
            </div>
            <div className="hero-dday">
              <strong>{dDay}</strong>
              <small>시트 확인 {dashboardMetrics.updatedAt}</small>
            </div>
          </div>

          <article className="stat">
            <div className="stat-head">
              <span>전체 진행률</span>
              <span className="tag tag-green">진행중 {dashboardMetrics.ongoingTasks}</span>
            </div>
            <div className="stat-value">
              {dashboardMetrics.progress}
              <em>%</em>
            </div>
            <div className="meter" aria-label={`전체 진행률 ${dashboardMetrics.progress}%`}>
              <span className="fill-green" style={{ width: `${dashboardMetrics.progress}%` }} />
            </div>
            <p>
              {dashboardMetrics.totalTasks}개 중 {dashboardMetrics.completedTasks}개 완료 · 미정{" "}
              {dashboardMetrics.undecidedTasks}
            </p>
          </article>

          <article className="stat">
            <div className="stat-head">
              <span>본예산 예상</span>
              <span className="tag tag-indigo">목표의 {budgetPercent}%</span>
            </div>
            <div className="stat-value">
              {expected.value}
              <em>{expected.unit}</em>
            </div>
            <div className="meter" aria-label={`목표 예산 대비 예상 예산 ${budgetPercent}%`}>
              <span className="fill-indigo" style={{ width: `${budgetPercent}%` }} />
            </div>
            <p>
              목표 {compactWon(dashboardMetrics.targetBudget)} · 여유{" "}
              {compactWon(dashboardMetrics.remainingBudget)}
            </p>
          </article>

          <article className="stat">
            <div className="stat-head">
              <span>집·혼수 별도</span>
              <span className="tag tag-gray">입주 완료</span>
            </div>
            <div className="stat-value">
              {separate.value}
              <em>{separate.unit}</em>
            </div>
            <div className="meter" aria-label="신혼집과 혼수 준비 완료">
              <span className="fill-gray" style={{ width: "100%" }} />
            </div>
            <p>
              전세 {expandedWon(dashboardMetrics.homeBudget)} · 혼수{" "}
              {expandedWon(dashboardMetrics.furnishingsBudget)}
            </p>
          </article>

          <article className="stat">
            <div className="stat-head">
              <span>높음 미완료</span>
              <span className="tag tag-pink">우선 처리</span>
            </div>
            <div className="stat-value accent-pink">
              {dashboardMetrics.highIncomplete}
              <em>개</em>
            </div>
            <div className="meter" aria-label={`높음 우선순위 ${dashboardMetrics.highIncomplete}개`}>
              <span className="fill-pink" style={{ width: "66%" }} />
            </div>
            <p>완료하면 시트에서 바로 갱신됩니다.</p>
          </article>

          <div className="next-focus">
            <div>
              <span className="tag tag-onDark">다음 우선 일정</span>
              <strong>
                {nextTask ? `${nextTask.date} · ${nextTask.title}` : "현재 예정된 우선 일정이 없습니다"}
              </strong>
            </div>
            {nextTask && <a href="#tasks">우선순위 보기</a>}
          </div>
        </section>

        <section className="panel" id="tasks">
          <div className="panel-head">
            <div>
              <h2>지금 챙길 것</h2>
              <p>우선순위 높은 항목부터 정리했습니다.</p>
            </div>
            <div className="filter-row" aria-label="우선순위 필터">
              {FILTERS.map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={taskFilter === filter ? "active" : ""}
                  aria-pressed={taskFilter === filter}
                  onClick={() => setTaskFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="rows">
            {filteredTasks.length === 0 ? (
              <p className="empty-state">해당 조건의 할 일이 없습니다.</p>
            ) : (
              filteredTasks.map((task) => (
                <article className="row task-row" key={task.title}>
                  <div className="task-when">
                    <strong>{task.date}</strong>
                    <small>{task.priority} 우선</small>
                  </div>
                  <div className="task-copy">
                    <strong>{task.title}</strong>
                    <p>{task.detail}</p>
                  </div>
                  <span className={`pill pill-${task.type}`}>{task.type}</span>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="panel" id="budget">
          <div className="panel-head">
            <div>
              <h2>예산</h2>
              <p>
                예상 {compactWon(dashboardMetrics.expectedBudget)} · 실제 입력{" "}
                {compactWon(dashboardMetrics.actualBudget)}
              </p>
            </div>
            <div className="panel-figure">
              <span>목표</span>
              <strong>{compactWon(dashboardMetrics.targetBudget)}</strong>
            </div>
          </div>

          <div className="stack" aria-label={`예상 예산 카테고리 구성, 목표의 ${budgetPercent}%`}>
            {budgetCategories.map((category) => (
              <div
                key={category.label}
                title={category.label}
                className={`bar-${category.color}`}
                style={{ flexBasis: `${categoryTotal > 0 ? (category.amount / categoryTotal) * 100 : 0}%` }}
              />
            ))}
          </div>
          <div className="stack-legend">
            <span>
              예상 합계 {compactWon(dashboardMetrics.expectedBudget)} · 목표의 {budgetPercent}% 사용
            </span>
            <span>{compactWon(dashboardMetrics.remainingBudget)} 여유</span>
          </div>

          <div className="category-grid">
            {budgetCategories.map((category) => (
              <div className="category-row" key={category.label}>
                <span className={`dot bar-${category.color}`} />
                <span className="category-label">{category.label}</span>
                <span className="category-amount">{compactWon(category.amount)}</span>
              </div>
            ))}
          </div>

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
        </section>

        <section className="group" id="vendors">
          <div className="group-head">
            <h2>확정 업체</h2>
            <span>{vendors.length}개 업체 관리 중</span>
          </div>
          <div className="vendor-grid">
            {vendors.map((vendor) => (
              <article className="vendor-card" key={vendor.name}>
                <div className="vendor-top">
                  <span>{vendor.category}</span>
                  <span className="pill pill-green">{vendor.status}</span>
                </div>
                <div>
                  <h3>{vendor.name}</h3>
                  <p className="vendor-date">{vendor.date}</p>
                </div>
                <div className="vendor-cost">{vendor.total}</div>
                <p className="vendor-next">{vendor.next}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="studio-options">
          <div className="panel-head">
            <div>
              <h2>원규 추가비용</h2>
              <p>선택 여부는 시트 체크박스와 상태값으로 관리합니다.</p>
            </div>
            <span className="panel-note">헬퍼비 외 항목은 선택 옵션</span>
          </div>

          <div className="studio-plan">
            <div>
              <span>의상 계약</span>
              <strong>{studioPlan.visit} · {studioPlan.vendor}</strong>
              <p>{studioPlan.detail}</p>
            </div>
            <div className="studio-plan-actions">
              <span>{studioPlan.budget}</span>
              <a href={studioPlan.url} target="_blank" rel="noreferrer">
                렌탈센터 보기
              </a>
            </div>
          </div>

          <div className="studio-extra-list">
            {studioExtras.map((extra) => (
              <article className="studio-extra-row" key={extra.item}>
                <span className={`extra-kind extra-kind-${extra.kind}`}>{extra.kind}</span>
                <div className="studio-extra-copy">
                  <strong>{extra.item}</strong>
                  <p>{extra.note}</p>
                </div>
                <strong className="studio-extra-price">{extra.price}</strong>
                <span className={`pill pill-${extra.status}`}>{extra.status}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="schedule">
          <div className="panel-head">
            <h2>주요 일정</h2>
            <span className="panel-note">예식까지 {dDay} · 11월 2일 출국</span>
          </div>
          <div className="rows">
            {timeline.map((item) => (
              <article className="row timeline-row" key={`${item.date}-${item.title}`}>
                <time>{item.date}</time>
                <span className={`node node-${item.state}`} />
                <strong>{item.title}</strong>
                <span className={`pill pill-${item.state}`}>{item.state}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="group" id="honeymoon">
          <div className="honeymoon-hero">
            <div>
              <span className="tag tag-white">9박 10일</span>
              <h2>오키나와에서 삿포로까지</h2>
              <p>2026년 11월 2일 출발 · 11월 11일 귀국</p>
            </div>
            <div className="honeymoon-budget">
              <span>확정 예산</span>
              <strong>950만원</strong>
              <small>항공·숙소 500 · 현지비 50만엔(450만원)</small>
            </div>
          </div>

          {honeymoonBookings.length > 0 && (
            <section className="booking-section" aria-labelledby="confirmed-bookings">
              <div className="booking-section-head">
                <span>확정 예약</span>
                <h3 id="confirmed-bookings">예약한 항공과 숙소</h3>
              </div>
              <div className="booking-grid">
                {honeymoonBookings.map((booking) => (
                  <article className="booking-card" key={`${booking.kind}-${booking.title}`}>
                    <div className="booking-top">
                      <span className="tag tag-indigo">{booking.kind}</span>
                      <time>{booking.date}</time>
                    </div>
                    <h3>{booking.title}</h3>
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

          <div className="panel">
            <h3 className="route-title">일별 루트</h3>
            <div className="rows">
              {honeymoonRoute.map((day) => (
                <article className="row route-row" key={day.date}>
                  <time>{day.date}</time>
                  <span className="route-city">{day.city}</span>
                  <strong>{day.plan}</strong>
                  <span className={`pill pill-${day.state}`}>{day.state}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="trip-checks">
            <span className="tag tag-pinkSolid">8월 31일까지</span>
            <div>
              <strong>전 구간 항공 · 오키나와/삿포로 숙소 후보 확정</strong>
              <p>여권 영문명과 유효기간은 항공권 결제 전에 먼저 확인합니다.</p>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          <div>
            <strong>혜린이랑 결혼 준비하기</strong>
            <p>Google Sheets 내용을 {dashboardMetrics.updatedAt} 기준으로 정리한 보기 전용 사이트입니다.</p>
          </div>
          <a href={SHEET_URL} target="_blank" rel="noreferrer">
            시트에서 수정하기
          </a>
        </footer>
      </main>
    </>
  );
}
