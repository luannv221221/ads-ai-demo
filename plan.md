# UI/UX Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the Ads Manager app UI/UX from a mixed prototype into a consistent, operational SaaS interface for dashboard review, campaign control, creative generation, and AI insights.

**Architecture:** First stabilize the shared UI foundation: copy, design tokens, layout, navigation, header, feedback states, and responsive behavior. Then polish each product workflow page using shared primitives so pages do not fight the shell layout or duplicate visual patterns.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, Prisma/Supabase where existing data persistence is already used, Meta Marketing API server actions.

---

## Scope

This plan covers UI/UX, frontend structure, and user-facing state clarity. It does not solve Meta Ads Library permission approval, token issuance, or business verification. Those API permission issues remain outside this UI/UX cleanup unless the UI must explain the error.

## Current Findings

- Text is inconsistent across the app: English, Vietnamese with accents, Vietnamese without accents, and previous mojibake strings appear in different screens.
- `src/app/globals.css` defines core colors but several modules use missing tokens such as `--purple`, `--pink`, `--transition`, `--border-light`, and `--shadow`.
- `MainLayout` uses fixed viewport behavior, while Creative and AI Analysis use their own full-height layouts and negative margins.
- Header controls are global but not page-aware. Creative and AI pages inherit dashboard-style controls even when date filters are not useful.
- Sidebar has fixed desktop width and no mobile collapsed state.
- Campaigns and Dashboard are closer to operational tools, while Creative and AI Analysis are split-pane workflows. The layout system should support both patterns explicitly.
- Settings uses inline styles and should be converted to CSS module styling.
- Error, empty, loading, sync, and data-source states are inconsistent.

## File Structure Map

Shared foundation:

- Modify `src/app/globals.css`: design tokens, focus styles, global button utilities if kept.
- Modify `src/components/Layout/MainLayout.tsx`: support layout modes and page-aware header controls.
- Modify `src/components/Layout/MainLayout.module.css`: standard, full-height, and split-pane content modes.
- Modify `src/components/Header/Header.tsx`: typed date range, optional controls, data freshness state.
- Modify `src/components/Header/Header.module.css`: light/dark consistency, responsive wrap.
- Modify `src/components/Sidebar/Sidebar.tsx`: clean labels, nav grouping, Settings link.
- Modify `src/components/Sidebar/Sidebar.module.css`: responsive collapse and active state.
- Create `src/lib/dateRange.ts`: deterministic date range helpers.
- Create `src/lib/navigation.ts`: single source for nav labels/routes/icons.
- Create `src/components/ui/StatusBadge.tsx`: shared status/tone badge.
- Create `src/components/ui/FeedbackState.tsx`: shared loading, empty, error, and data-source states.
- Create `src/components/ui/ui.module.css`: styles for shared UI primitives.

Page-specific polish:

- Modify `src/app/page.tsx`: dashboard shell props, date range type, cleaner refresh states.
- Modify `src/components/Dashboard/Dashboard.tsx`: source clarity, metric hierarchy, remove prototype text.
- Modify `src/components/Dashboard/Dashboard.module.css`: scan-friendly KPI/table styling.
- Modify `src/app/campaigns/page.tsx`: table workflow, filters, bulk toolbar, modal clarity, typed date range.
- Modify `src/app/campaigns/campaigns.module.css`: responsive table and action states.
- Modify `src/app/creative/page.tsx`: remove automatic competitor scan on tab change, clarify data source and saved library.
- Modify `src/app/creative/creative.module.css`: use shared layout and tokens.
- Modify `src/app/ai-analysis/page.tsx`: recommendation reasoning, confidence, linked actions.
- Modify `src/app/ai-analysis/page.module.css`: remove negative margin and use shell mode.
- Modify `src/app/settings/page.tsx`: remove inline styles.
- Create `src/app/settings/settings.module.css`: Settings page styles.

Verification:

- Use `npm.cmd run build` after each phase.
- Use `npm.cmd run lint` after each phase; if it fails on pre-existing unrelated files, record the exact failing files and keep the phase changes lint-clean.
- Manual browser QA at `http://localhost:3000/`, `/campaigns`, `/creative`, `/ai-analysis`, and `/settings`.

---

## Phase 0: Baseline And Rules

### Task 0.1: Read Next.js Local Docs

**Files:**

- Read: `AGENTS.md`
- Read: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- Read: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- Read: `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
- Read: `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`
- Read: `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`

- [ ] **Step 1: Confirm the repo instruction**

Run:

```powershell
Get-Content -Path AGENTS.md
```

Expected: the output says to read local Next.js docs before writing code.

- [ ] **Step 2: Read the App Router and CSS docs**

Run:

```powershell
Get-Content -Path node_modules\next\dist\docs\01-app\01-getting-started\03-layouts-and-pages.md -TotalCount 220
Get-Content -Path node_modules\next\dist\docs\01-app\01-getting-started\05-server-and-client-components.md -TotalCount 220
Get-Content -Path node_modules\next\dist\docs\01-app\01-getting-started\07-mutating-data.md -TotalCount 220
Get-Content -Path node_modules\next\dist\docs\01-app\01-getting-started\10-error-handling.md -TotalCount 220
Get-Content -Path node_modules\next\dist\docs\01-app\01-getting-started\11-css.md -TotalCount 220
```

Expected: enough local context is available for client/server boundaries, layouts, actions, errors, and CSS modules.

### Task 0.2: Capture Current UI Baseline

**Files:**

- Read: `src/app/page.tsx`
- Read: `src/app/campaigns/page.tsx`
- Read: `src/app/creative/page.tsx`
- Read: `src/app/ai-analysis/page.tsx`
- Read: `src/app/settings/page.tsx`

- [ ] **Step 1: Build before changes**

Run:

```powershell
npm.cmd run build
```

Expected: build succeeds. If it fails before UI work starts, stop and fix only the blocking build issue.

- [ ] **Step 2: Record lint baseline**

Run:

```powershell
npm.cmd run lint
```

Expected: lint may fail because the repo already has existing issues. Save the failing file list in the implementation notes before changing UI files.

- [ ] **Step 3: Inspect routes manually**

Open these URLs:

```text
http://localhost:3000/
http://localhost:3000/campaigns
http://localhost:3000/creative
http://localhost:3000/ai-analysis
http://localhost:3000/settings
```

Expected: note layout breaks, text issues, overflow, and missing states for desktop width, tablet width, and mobile width.

---

## Phase 1: UI Foundation

### Task 1.1: Normalize User-Facing Copy

**Files:**

- Modify: `src/components/Sidebar/Sidebar.tsx`
- Modify: `src/components/Header/Header.tsx`
- Modify: `src/components/Layout/MainLayout.tsx`
- Modify: `src/app/settings/page.tsx`
- Modify: `src/components/Dashboard/Dashboard.tsx`
- Modify: `src/app/campaigns/page.tsx`
- Modify: `src/app/creative/page.tsx`
- Modify: `src/app/ai-analysis/page.tsx`

- [ ] **Step 1: Find broken or mixed copy**

Run:

```powershell
rg -n "Ã|Ä|á»|áº|â|Dang|Phan|Tao|Khong|Dong bo|Chua" src
```

Expected: all lines that need copy review are visible.

- [ ] **Step 2: Choose the app language convention**

Use Vietnamese with accents for product UI strings. Keep technical product names in English when they are standard terms: `Dashboard`, `Creative`, `AI Insights`, `ROAS`, `CPA`, `CTR`, `Meta`.

- [ ] **Step 3: Replace navigation labels**

Use this target nav copy:

```ts
[
  { href: '/', label: 'Dashboard' },
  { href: '/campaigns', label: 'Chiến dịch' },
  { href: '/creative', label: 'Creative' },
  { href: '/ai-analysis', label: 'Phân tích AI' },
  { href: '/settings', label: 'Cài đặt' }
]
```

Expected: Sidebar labels are readable and consistent.

- [ ] **Step 4: Replace global fallback messages**

Use these exact user-facing messages where they match the existing behavior:

```ts
const messages = {
  noNotifications: 'Chưa có thông báo mới',
  syncSuccess: 'Đồng bộ dữ liệu Meta thành công',
  syncFailed: 'Đồng bộ thất bại',
  connectionFailed: 'Lỗi kết nối',
  noData: 'Chưa có dữ liệu',
  loading: 'Đang tải dữ liệu...'
};
```

Expected: no mojibake remains in shared layout, header, sidebar, and settings.

- [ ] **Step 5: Verify copy scan**

Run:

```powershell
rg -n "Ã|Ä|á»|áº|â" src
```

Expected: no mojibake matches in user-facing UI files.

### Task 1.2: Define Design Tokens

**Files:**

- Modify: `src/app/globals.css`

- [ ] **Step 1: Add missing semantic tokens**

Add or merge these variables into `:root`:

```css
:root {
  --purple: #7c3aed;
  --purple-bg: rgba(124, 58, 237, 0.1);
  --pink: #ec4899;
  --pink-bg: rgba(236, 72, 153, 0.1);
  --border-light: rgba(228, 228, 231, 0.65);
  --shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 12px 30px rgba(15, 23, 42, 0.12);
  --transition: 160ms ease;
  --focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.18);
}
```

- [ ] **Step 2: Add dark-mode equivalents**

Add or merge these variables into `[data-theme="dark"]`:

```css
[data-theme="dark"] {
  --purple: #a78bfa;
  --purple-bg: rgba(167, 139, 250, 0.16);
  --pink: #f472b6;
  --pink-bg: rgba(244, 114, 182, 0.16);
  --border-light: rgba(63, 63, 70, 0.75);
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.24), 0 1px 3px rgba(0, 0, 0, 0.28);
  --shadow-lg: 0 16px 34px rgba(0, 0, 0, 0.34);
}
```

- [ ] **Step 3: Add focus styles**

Add:

```css
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
```

Expected: keyboard focus is visible across the app.

- [ ] **Step 4: Verify token usage**

Run:

```powershell
rg -n "var\(--(purple|pink|transition|border-light|shadow|focus-ring)" src
```

Expected: these tokens are now defined in `src/app/globals.css`.

### Task 1.3: Create Shared Feedback Primitives

**Files:**

- Create: `src/components/ui/FeedbackState.tsx`
- Create: `src/components/ui/StatusBadge.tsx`
- Create: `src/components/ui/ui.module.css`

- [ ] **Step 1: Create shared types and components**

Create `src/components/ui/FeedbackState.tsx` with this public API:

```tsx
import styles from './ui.module.css';

type FeedbackTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface FeedbackStateProps {
  tone?: FeedbackTone;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function FeedbackState({ tone = 'neutral', title, description, action }: FeedbackStateProps) {
  return (
    <div className={`${styles.feedbackState} ${styles[tone]}`}>
      <div>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className={styles.feedbackAction}>{action}</div> : null}
    </div>
  );
}
```

Create `src/components/ui/StatusBadge.tsx` with this public API:

```tsx
import styles from './ui.module.css';

type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface StatusBadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
}

export function StatusBadge({ tone = 'neutral', children }: StatusBadgeProps) {
  return <span className={`${styles.statusBadge} ${styles[tone]}`}>{children}</span>;
}
```

- [ ] **Step 2: Create shared CSS**

Create `src/components/ui/ui.module.css` with:

```css
.feedbackState {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-panel);
  padding: 16px;
}

.feedbackState h3 {
  margin: 0 0 4px;
  color: var(--text-main);
  font-size: 14px;
}

.feedbackState p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.feedbackAction {
  flex-shrink: 0;
}

.statusBadge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  border: 1px solid var(--border);
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.neutral {
  color: var(--text-secondary);
  background: var(--bg-surface);
}

.info {
  color: var(--accent);
  background: var(--accent-bg);
  border-color: rgba(59, 130, 246, 0.2);
}

.success {
  color: var(--success);
  background: var(--success-bg);
  border-color: rgba(16, 185, 129, 0.22);
}

.warning {
  color: var(--warning);
  background: var(--warning-bg);
  border-color: rgba(245, 158, 11, 0.22);
}

.danger {
  color: var(--danger);
  background: var(--danger-bg);
  border-color: rgba(239, 68, 68, 0.22);
}
```

- [ ] **Step 3: Build**

Run:

```powershell
npm.cmd run build
```

Expected: build succeeds.

---

## Phase 2: Layout, Sidebar, Header

### Task 2.1: Add Explicit Layout Modes

**Files:**

- Modify: `src/components/Layout/MainLayout.tsx`
- Modify: `src/components/Layout/MainLayout.module.css`
- Modify: `src/app/creative/page.tsx`
- Modify: `src/app/ai-analysis/page.tsx`

- [ ] **Step 1: Add layout mode prop**

Update `MainLayoutProps` with:

```ts
type MainLayoutMode = 'standard' | 'fullHeight';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  contentMode?: MainLayoutMode;
  showRightSidebar?: boolean;
  rightSidebarContent?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onDateChange?: (range: string) => void;
  accounts?: any[];
  selectedAccountId?: string;
  onAccountChange?: (accountId: string) => void;
}
```

Use `contentMode = 'standard'` as the default.

- [ ] **Step 2: Apply content mode class**

In `MainLayout.tsx`, set:

```tsx
<main className={`${styles.content} ${contentMode === 'fullHeight' ? styles.contentFullHeight : ''}`}>
  {children}
</main>
```

- [ ] **Step 3: Update layout CSS**

Add:

```css
.contentFullHeight {
  padding: 0;
  overflow: hidden;
}
```

Expected: Creative and AI Analysis can use `contentMode="fullHeight"` and remove negative margins.

- [ ] **Step 4: Update Creative and AI Analysis shell usage**

Set:

```tsx
<MainLayout
  title="..."
  contentMode="fullHeight"
  showRightSidebar={false}
>
```

Remove page-level negative margins and hard-coded compensation for layout padding.

### Task 2.2: Make Header Page-Aware

**Files:**

- Modify: `src/components/Header/Header.tsx`
- Modify: `src/components/Header/Header.module.css`
- Modify: `src/components/Layout/MainLayout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/campaigns/page.tsx`
- Modify: `src/app/creative/page.tsx`
- Modify: `src/app/ai-analysis/page.tsx`

- [ ] **Step 1: Replace string date callback with typed range**

Create this type in `src/components/Header/Header.tsx`:

```ts
export interface DateRange {
  start: string;
  end: string;
}
```

Change header prop from:

```ts
onDateChange?: (range: string) => void;
```

to:

```ts
dateRange?: DateRange;
onDateRangeChange?: (range: DateRange) => void;
showDateRange?: boolean;
showAccountSelect?: boolean;
dataStatus?: 'live' | 'synced' | 'demo' | 'error' | 'idle';
dataStatusLabel?: string;
```

- [ ] **Step 2: Remove `new Date()` from Header render**

Header must use the passed `dateRange` only. If `dateRange` is missing, hide date fields.

- [ ] **Step 3: Use page-specific controls**

Use these defaults:

```ts
const headerConfigByPage = {
  dashboard: { showDateRange: true, showAccountSelect: true },
  campaigns: { showDateRange: true, showAccountSelect: true },
  creative: { showDateRange: false, showAccountSelect: true },
  aiAnalysis: { showDateRange: false, showAccountSelect: true },
  settings: { showDateRange: false, showAccountSelect: false }
};
```

- [ ] **Step 4: Fix Header visual consistency**

Remove hard-coded dark backgrounds from inputs/selects. Use:

```css
.dateInput,
.accountSelect {
  background: var(--bg-panel);
  color: var(--text-main);
  border: 1px solid var(--border);
}
```

- [ ] **Step 5: Manual QA**

Check:

```text
Dashboard: date range visible, account visible, refresh visible.
Campaigns: date range visible, account visible, refresh visible.
Creative: account visible if useful, date range hidden.
AI Analysis: account visible, date range hidden.
Settings: no date range, no account select.
```

### Task 2.3: Responsive Sidebar

**Files:**

- Modify: `src/components/Sidebar/Sidebar.tsx`
- Modify: `src/components/Sidebar/Sidebar.module.css`
- Create: `src/lib/navigation.ts`

- [ ] **Step 1: Move nav config to `src/lib/navigation.ts`**

Create:

```ts
export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', group: 'Vận hành' },
  { href: '/campaigns', label: 'Chiến dịch', group: 'Vận hành' },
  { href: '/creative', label: 'Creative', group: 'AI Tools' },
  { href: '/ai-analysis', label: 'Phân tích AI', group: 'AI Tools' },
  { href: '/settings', label: 'Cài đặt', group: 'Hệ thống' }
] as const;
```

- [ ] **Step 2: Render groups in Sidebar**

Sidebar should render group labels and nav items from `NAV_ITEMS`.

- [ ] **Step 3: Add mobile behavior**

Add CSS behavior:

```css
@media (max-width: 900px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    z-index: 80;
  }

  .sidebarOpen {
    transform: translateX(0);
  }
}
```

If a mobile toggle is added in Header, make it a real `button` with `aria-label="Mở menu"`.

- [ ] **Step 4: Manual QA**

At mobile width, verify the sidebar does not permanently consume horizontal space and can be opened/closed.

---

## Phase 3: Workflow Page Polish

### Task 3.1: Dashboard Operational Polish

**Files:**

- Modify: `src/app/page.tsx`
- Modify: `src/components/Dashboard/Dashboard.tsx`
- Modify: `src/components/Dashboard/Dashboard.module.css`

- [ ] **Step 1: Make data source visible**

Show one badge near the dashboard title or KPI section:

```tsx
<StatusBadge tone={stats?.isMock ? 'warning' : 'success'}>
  {stats?.isMock ? 'Dữ liệu demo' : 'Dữ liệu Meta'}
</StatusBadge>
```

- [ ] **Step 2: Simplify KPI hierarchy**

Use four primary cards only:

```text
Spend
Revenue
ROAS
CPA / Result Cost
```

Secondary metrics such as CTR, CPM, impressions, and results should move below the primary row.

- [ ] **Step 3: Improve campaign tree scan**

Campaign rows should use:

```text
Campaign name
Status badge
Spend
CPA
ROAS/performance
Action suggestion
```

Expected: a media buyer can identify scale/watch/kill candidates without reading long card text.

- [ ] **Step 4: Verify**

Run:

```powershell
npm.cmd run build
```

Expected: build succeeds and Dashboard still loads with selected account and date range.

### Task 3.2: Campaigns Table Workflow

**Files:**

- Modify: `src/app/campaigns/page.tsx`
- Modify: `src/app/campaigns/campaigns.module.css`
- Use: `src/components/ui/StatusBadge.tsx`
- Use: `src/components/ui/FeedbackState.tsx`

- [ ] **Step 1: Make filters compact and persistent**

Top control bar should contain:

```text
Search input
Objective select
Status select
Create campaign button
Rules button
```

Each control should keep a stable width and not resize the table while typing.

- [ ] **Step 2: Improve inline budget editing**

Budget edit state should show:

```text
Input
Save button
Cancel button
Saving state
Error toast if update fails
Rollback to previous budget if update fails
```

- [ ] **Step 3: Improve bulk action toolbar**

When at least one row is selected, the toolbar should show:

```text
{count} selected
Pause
Duplicate
Create rule
Clear selection
```

The toolbar must not cover table rows on mobile; on small screens it should dock to the bottom with full width.

- [ ] **Step 4: Add empty states**

Use `FeedbackState` for:

```text
No campaigns match filters
No campaigns returned by Meta
Meta API error
```

- [ ] **Step 5: Verify**

Run:

```powershell
npm.cmd run build
```

Expected: build succeeds. Manual QA verifies filter, select, inline budget, and bulk toolbar behavior.

### Task 3.3: Creative Workflow Clarity

**Files:**

- Modify: `src/app/creative/page.tsx`
- Modify: `src/app/creative/creative.module.css`
- Modify: `src/app/creative/components/CompetitorResults.tsx`
- Modify: `src/app/creative/components/CreativeLibrary.tsx`
- Use: `src/components/ui/StatusBadge.tsx`
- Use: `src/components/ui/FeedbackState.tsx`

- [ ] **Step 1: Stop automatic competitor scan on tab click**

Remove the automatic call from tab switching:

```tsx
onClick={() => {
  setActiveTab('competitor');
}}
```

Expected: analysis only runs when the user clicks the scan/analyze button.

- [ ] **Step 2: Make data source explicit**

Competitor results should show one of:

```text
Dữ liệu Meta Ad Library
Lỗi quyền Meta Ad Library
Chưa quét đối thủ
```

- [ ] **Step 3: Improve saved library clarity**

Saved creative cards should show:

```text
Source: Copywriting / Counter-ad
Created time
Copy button
Edit button
Delete button
```

If the library still uses localStorage, show a small note:

```text
Lưu trên trình duyệt hiện tại
```

- [ ] **Step 4: Improve competitor form**

The competitor form should include:

```text
Page URL input
Audience input
Saved competitor select
Analyze button
Permission error help text area
```

Expected: the user understands that Meta permission errors are caused by API access, not by the UI.

- [ ] **Step 5: Verify**

Run:

```powershell
npm.cmd run build
```

Expected: build succeeds. Manual QA verifies copy generation, save/delete library, competitor scan error, and no automatic scan on tab switch.

### Task 3.4: AI Analysis Recommendation UX

**Files:**

- Modify: `src/app/ai-analysis/page.tsx`
- Modify: `src/app/ai-analysis/page.module.css`
- Modify: `src/app/actions/aiInsights.ts`
- Use: `src/components/ui/StatusBadge.tsx`
- Use: `src/components/ui/FeedbackState.tsx`

- [ ] **Step 1: Add recommendation explanation fields**

Extend each recommendation payload with:

```ts
interface InsightRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: 'success' | 'warning' | 'danger' | 'info';
  impact: string;
  confidence: 'low' | 'medium' | 'high';
  actionLabel: string;
  actionHint: string;
  reasoning: string[];
  relatedCampaignIds: string[];
  metrics: Array<{
    label: string;
    value: string;
    tone?: 'success' | 'warning' | 'danger' | 'info';
  }>;
}
```

- [ ] **Step 2: Render why-this-matters details**

Each card should show:

```text
Recommendation title
Impact
Confidence
Metrics
Why AI recommends this
Suggested next action
```

- [ ] **Step 3: Make chat limitations clear**

The chat panel should say when it is using local rule-based replies rather than a real LLM:

```text
Trả lời dựa trên dữ liệu chiến dịch đã quét
```

- [ ] **Step 4: Verify**

Run:

```powershell
npm.cmd run build
```

Expected: build succeeds. Manual QA verifies recommendations are understandable without reading source code.

### Task 3.5: Settings Page Cleanup

**Files:**

- Modify: `src/app/settings/page.tsx`
- Create: `src/app/settings/settings.module.css`
- Use: `src/components/ui/StatusBadge.tsx`
- Use: `src/components/ui/FeedbackState.tsx`

- [ ] **Step 1: Remove inline styles**

Replace inline style objects with classes:

```tsx
import styles from './settings.module.css';
```

- [ ] **Step 2: Add connection status sections**

Settings should show:

```text
Meta company ads token status
Meta Ad Library token status
Last sync result
Sync all accounts action
```

- [ ] **Step 3: Add API permission guidance**

When Ad Library returns code `10` and subcode `2332002`, show:

```text
Ứng dụng Meta chưa được cấp quyền Ads Library API. Token hợp lệ nhưng app chưa có quyền gọi /ads_archive.
```

- [ ] **Step 4: Verify**

Run:

```powershell
npm.cmd run build
```

Expected: build succeeds and Settings no longer contains large inline style blocks.

---

## Phase 4: Error, Loading, Empty, And Source States

### Task 4.1: Create API Error Mapping

**Files:**

- Create: `src/lib/apiErrorMessages.ts`
- Modify: `src/app/actions/creative.ts`
- Modify: `src/app/actions/facebook.ts`
- Modify: `src/app/actions/dashboard.ts`
- Modify: `src/app/actions/campaigns.ts`

- [ ] **Step 1: Create error mapper**

Create:

```ts
export interface ApiErrorShape {
  message?: string;
  code?: number;
  error_subcode?: number;
  type?: string;
}

export function getFriendlyApiError(error: ApiErrorShape | string | unknown): string {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    const candidate = error as ApiErrorShape;

    if (candidate.code === 10 && candidate.error_subcode === 2332002) {
      return 'Ứng dụng Meta chưa được cấp quyền Ads Library API. Token hợp lệ nhưng app chưa có quyền gọi /ads_archive.';
    }

    if (candidate.message) return candidate.message;
  }

  return 'Không thể tải dữ liệu. Vui lòng kiểm tra cấu hình và thử lại.';
}
```

- [ ] **Step 2: Use mapper in server actions**

When returning action errors, return:

```ts
return {
  success: false,
  error: getFriendlyApiError(error)
};
```

- [ ] **Step 3: Verify**

Run:

```powershell
npm.cmd run build
```

Expected: build succeeds and Meta permission errors become actionable UI messages.

### Task 4.2: Standardize Page States

**Files:**

- Modify: `src/components/Dashboard/Dashboard.tsx`
- Modify: `src/app/campaigns/page.tsx`
- Modify: `src/app/creative/page.tsx`
- Modify: `src/app/ai-analysis/page.tsx`
- Use: `src/components/ui/FeedbackState.tsx`

- [ ] **Step 1: Use one pattern for loading**

Every page should use:

```tsx
<FeedbackState tone="info" title="Đang tải dữ liệu..." description="Hệ thống đang lấy dữ liệu mới nhất." />
```

- [ ] **Step 2: Use one pattern for empty**

Every empty list should use:

```tsx
<FeedbackState tone="neutral" title="Chưa có dữ liệu" description="Thay đổi bộ lọc hoặc đồng bộ lại tài khoản để tải dữ liệu." />
```

- [ ] **Step 3: Use one pattern for error**

Every error view should use:

```tsx
<FeedbackState tone="danger" title="Không thể tải dữ liệu" description={error} />
```

- [ ] **Step 4: Verify**

Run:

```powershell
npm.cmd run build
```

Expected: all major pages have consistent loading, empty, and error states.

---

## Phase 5: Accessibility, Responsive QA, And Final Verification

### Task 5.1: Accessibility Pass

**Files:**

- Modify: `src/components/Header/Header.tsx`
- Modify: `src/components/Sidebar/Sidebar.tsx`
- Modify: `src/app/campaigns/page.tsx`
- Modify: `src/app/creative/page.tsx`
- Modify: `src/app/ai-analysis/page.tsx`

- [ ] **Step 1: Ensure icon-only buttons have labels**

Every icon-only button must include `aria-label`.

Example:

```tsx
<button type="button" aria-label="Làm mới dữ liệu" className={styles.iconButton}>
  ...
</button>
```

- [ ] **Step 2: Ensure interactive elements are real buttons or links**

Clickable controls that trigger actions should use:

```tsx
<button type="button">...</button>
```

Navigation should use:

```tsx
<Link href="/campaigns">Chiến dịch</Link>
```

- [ ] **Step 3: Verify keyboard navigation**

Manual QA:

```text
Tab through Sidebar, Header controls, Campaign filters, Creative forms, AI chat.
Enter and Space should activate buttons.
Visible focus ring should appear on every focusable control.
```

### Task 5.2: Responsive QA

**Files:**

- Modify: CSS modules touched in earlier phases.

- [ ] **Step 1: Test desktop**

Viewport:

```text
1440 x 900
```

Expected:

```text
Dashboard and Campaigns scan well.
Creative split pane is usable.
AI Analysis feed and chat fit without overlap.
```

- [ ] **Step 2: Test tablet**

Viewport:

```text
1024 x 768
```

Expected:

```text
Sidebar is still usable or collapsed.
Header controls wrap without overlap.
Campaigns table remains horizontally scrollable.
```

- [ ] **Step 3: Test mobile**

Viewport:

```text
390 x 844
```

Expected:

```text
Sidebar does not force horizontal overflow.
Header does not overlap content.
Creative panes stack vertically.
AI chat stacks below recommendations.
Campaigns table or cards remain readable.
```

### Task 5.3: Final Build And Lint

**Files:**

- Verify all touched files.

- [ ] **Step 1: Build**

Run:

```powershell
npm.cmd run build
```

Expected: build succeeds.

- [ ] **Step 2: Lint**

Run:

```powershell
npm.cmd run lint
```

Expected: lint succeeds. If unrelated pre-existing files still fail, list exact files and errors in the handoff.

- [ ] **Step 3: Search for removed patterns**

Run:

```powershell
rg -n "Ã|Ä|á»|áº|â|margin: -24px|margin: -16px|new Date\\(" src
```

Expected:

```text
No mojibake in UI files.
No negative page margin hacks in Creative or AI Analysis.
No new Date() inside Header render.
Allowed date construction remains only in server actions or date helper utilities.
```

### Task 5.4: Suggested Commits

- [ ] **Commit Phase 1**

```powershell
git add src/app/globals.css src/components/ui src/components/Sidebar src/components/Header src/components/Layout src/app/settings src/components/Dashboard src/app/campaigns src/app/creative src/app/ai-analysis
git commit -m "style: normalize ui copy and design tokens"
```

- [ ] **Commit Phase 2**

```powershell
git add src/components/Layout src/components/Header src/components/Sidebar src/lib/navigation.ts src/lib/dateRange.ts src/app/page.tsx src/app/campaigns/page.tsx src/app/creative src/app/ai-analysis
git commit -m "refactor: clarify app shell layout and navigation"
```

- [ ] **Commit Phase 3**

```powershell
git add src/app/page.tsx src/components/Dashboard src/app/campaigns src/app/creative src/app/ai-analysis src/app/settings
git commit -m "feat: polish core ads workflows"
```

- [ ] **Commit Phase 4 and 5**

```powershell
git add src/lib/apiErrorMessages.ts src/app/actions src/components src/app
git commit -m "feat: standardize ui states and accessibility"
```

---

## Definition Of Done

- App text is readable and consistent across Dashboard, Campaigns, Creative, AI Analysis, and Settings.
- Shared tokens used by CSS modules are defined in `src/app/globals.css`.
- Header controls are page-aware and do not show irrelevant filters.
- Sidebar is usable on desktop and does not break mobile layout.
- Creative and AI Analysis no longer use negative margin layout hacks.
- Loading, empty, error, and data-source states use shared UI primitives.
- Meta permission errors explain the app permission problem clearly.
- `npm.cmd run build` passes.
- `npm.cmd run lint` passes or only reports documented unrelated pre-existing errors.
