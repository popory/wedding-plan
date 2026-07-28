# Wedding Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the supplied card-based dashboard design to the public wedding planning site while preserving Google Sheet synchronization, current interactions, honeymoon booking details, and privacy protections.

**Architecture:** Keep `app/generated-data.ts` as the presentation data boundary and replace only the page composition and visual system. The page derives the nearest priority item from synchronized tasks instead of hardcoding a payment date, while existing sync and booking parsers remain unchanged.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS import with custom CSS, Node test runner, vinext/Cloudflare build, GitHub Pages workflow

## Global Constraints

- Preserve the existing Google Sheet synchronization flow and source ranges.
- Keep all text files UTF-8 without BOM and LF line endings.
- Write code comments in Korean only.
- Do not expose booking numbers, payment data, account information, personal file paths, or new contact details.
- Use explicit responsive breakpoints; do not scale font sizes continuously with viewport width.
- Keep letter spacing at `0`.
- Preserve the current public GitHub Pages deployment flow and the configured Sites project.

---

### Task 1: Lock the redesigned rendering contract

**Files:**
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: HTML returned by `dist/server/index.js`
- Produces: Regression assertions for the redesigned page, latest studio payment date, retained booking detail, and privacy exclusions

- [ ] **Step 1: Add failing dashboard layout and current-data assertions**

Add assertions after reading the rendered HTML:

```js
assert.match(html, /class="topbar"/);
assert.match(html, /class="overview"/);
assert.match(html, /class="category-grid"/);
assert.match(html, /class="vendor-grid"/);
assert.match(html, /7월 29일/);
assert.match(html, /원규 스튜디오/);
```

Keep the existing honeymoon booking checks and sensitive-data exclusion regex.

- [ ] **Step 2: Add source-level interaction assertions**

Read `app/page.tsx` and verify the nearest task is data-driven and the empty task state exists:

```js
assert.match(page, /const nextTask = priorityTasks\[0\]/);
assert.match(page, /filteredTasks\.length === 0/);
assert.doesNotMatch(page, /7월 28일/);
```

- [ ] **Step 3: Run the focused test and verify it fails before implementation**

Run:

```bash
npm run build
node --test tests/rendered-html.test.mjs
```

Expected: FAIL because the new layout contract and `2026-07-29` display are not implemented yet.

- [ ] **Step 4: Commit the failing contract**

```bash
git add tests/rendered-html.test.mjs
git commit -m "Test wedding dashboard redesign"
```

### Task 2: Replace the page composition while preserving synchronized data

**Files:**
- Modify: `app/page.tsx`
- Test: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: `dashboardMetrics`, `budgetCategories`, `priorityTasks`, `vendors`, `timeline`, `honeymoonBookings`, `honeymoonRoute`
- Produces: `Home()` client component with task filtering, dynamic nearest-task focus, budget summaries, vendor cards, timeline, and honeymoon booking details

- [ ] **Step 1: Add robust amount helpers and task derivations**

Implement a split helper and safe category calculations:

```ts
function splitAmount(amount: number) {
  const text = compactWon(amount);
  const match = text.match(/^([\d,.]+)(.*)$/);
  return match ? { value: match[1], unit: match[2] } : { value: text, unit: "" };
}

const categoryTotal = budgetCategories.reduce((sum, item) => sum + item.amount, 0);
const nextTask = priorityTasks[0];
```

When `categoryTotal` is zero, render each stacked segment with `0%` width.

- [ ] **Step 2: Build the sticky navigation and summary cards**

Use the approved structure:

```tsx
<header className="topbar">
  <div className="topbar-inner">...</div>
</header>
<main className="shell">
  <section className="overview" id="top">...</section>
</main>
```

Render `nextTask.date` and `nextTask.title` in the focus bar. If no task exists, show `현재 예정된 우선 일정이 없습니다` without a broken link.

- [ ] **Step 3: Rebuild task, budget, vendor, and schedule sections**

Use the supplied design's panel, row, pill, stacked budget, and repeated vendor-card patterns. Preserve the existing filter logic and add this empty state inside the task rows container:

```tsx
{filteredTasks.length === 0 ? (
  <p className="empty-state">해당 조건의 할 일이 없습니다.</p>
) : (
  filteredTasks.map((task) => ...)
)}
```

- [ ] **Step 4: Preserve honeymoon booking and route detail**

Render `honeymoonBookings` only when the array has items, then render `honeymoonRoute` independently. Keep the existing public fields and do not introduce booking identifiers or payment information.

- [ ] **Step 5: Run TypeScript-aware lint and the focused rendering test**

Run:

```bash
npm run lint
npm run build
node --test tests/rendered-html.test.mjs
```

Expected: PASS with the new page structure and existing booking detail.

- [ ] **Step 6: Commit the page composition**

```bash
git add app/page.tsx tests/rendered-html.test.mjs
git commit -m "Apply wedding dashboard layout"
```

### Task 3: Apply the approved visual system and responsive behavior

**Files:**
- Modify: `app/globals.css`
- Test: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: Class names emitted by `app/page.tsx`
- Produces: Desktop, tablet, reduced-motion, and mobile styling for every rendered section

- [ ] **Step 1: Replace theme tokens and base styles**

Define the approved neutral background and status palette:

```css
:root {
  --bg: #f4f6f9;
  --card: #ffffff;
  --ink: #0f1419;
  --muted: #7c8593;
  --line: #e4e8ee;
  --indigo: #4c5ff7;
  --green: #0fb183;
  --pink: #ff5c85;
}
```

Keep `letter-spacing: 0` globally and for headings.

- [ ] **Step 2: Style navigation, summary cards, panels, and repeated rows**

Implement the approved sticky top bar, white cards, restrained borders, stable status pills, progress meters, filter controls, stacked budget, vendor cards, and timeline rows. Use wrapped content and stable grid tracks so dynamic text cannot resize adjacent controls unexpectedly.

- [ ] **Step 3: Style honeymoon detail and footer**

Use a pale indigo honeymoon banner, white booking cards, compact route rows, and a simple footer. Keep booking detail labels readable and allow long values to wrap with `overflow-wrap: anywhere`.

- [ ] **Step 4: Add tablet and mobile breakpoints**

At `760px` and below:

```css
@media (max-width: 760px) {
  .shell { padding: 20px 16px 56px; }
  .overview { grid-template-columns: 1fr; }
  .hero { padding: 26px 22px; }
  .panel { padding: 22px 20px; }
  .vendor-grid, .booking-grid { grid-template-columns: 1fr; }
}
```

Allow top navigation to scroll horizontally, keep all content within the viewport, and preserve visible status text where it fits.

- [ ] **Step 5: Run the full automated suite**

Run:

```bash
npm run lint
npm test
```

Expected: PASS with zero lint errors and zero test failures.

- [ ] **Step 6: Commit the visual system**

```bash
git add app/globals.css
git commit -m "Style wedding dashboard redesign"
```

### Task 4: Verify visuals and publish both configured site targets

**Files:**
- Modify only if verification finds a defect: `app/page.tsx`, `app/globals.css`, `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: Production build and deployment configuration
- Produces: Verified local screenshots, updated GitHub Pages deployment, and updated configured Sites deployment without access-policy changes

- [ ] **Step 1: Start the local production-compatible development server**

Run:

```bash
npm run dev
```

Use the first available port and keep the process running during browser checks.

- [ ] **Step 2: Verify desktop and mobile layouts in the browser**

Check at approximately `1440x1000` and `390x844`:

- hero and D-day remain inside the first viewport
- navigation, filters, cards, and booking details do not overlap
- long Korean text wraps without horizontal overflow
- task filtering works
- the Google Sheet link opens the intended spreadsheet

- [ ] **Step 3: Re-run final verification after any visual fixes**

Run:

```bash
npm run lint
npm test
git diff --check
```

Expected: all commands exit successfully.

- [ ] **Step 4: Commit verification fixes if present**

```bash
git add app/page.tsx app/globals.css tests/rendered-html.test.mjs
git commit -m "Polish responsive wedding dashboard"
```

Skip this commit when verification required no file changes.

- [ ] **Step 5: Push and verify GitHub Pages**

Push the current branch, watch the Pages workflow, then verify the public page contains the redesigned classes and current studio date.

- [ ] **Step 6: Deploy the configured Sites project**

Use the existing `.openai/hosting.json` configuration and preserve its current access policy. Verify the Sites URL after deployment and do not change sharing permissions.
