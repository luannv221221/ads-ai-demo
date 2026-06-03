# Kế Hoạch Triển Khai Cải Thiện UI/UX

> **Dành cho agent triển khai:** BẮT BUỘC dùng sub-skill `superpowers:subagent-driven-development` khuyến nghị, hoặc `superpowers:executing-plans` để thực hiện kế hoạch theo từng task. Các bước dùng checkbox (`- [ ]`) để theo dõi tiến độ.

**Mục tiêu:** Nâng cấp UI/UX của Ads Manager từ trạng thái prototype chưa đồng nhất thành một ứng dụng SaaS vận hành quảng cáo rõ ràng, dễ thao tác và đáng tin cậy cho Dashboard, Campaigns, Creative và AI Insights.

**Kiến trúc:** Làm chắc phần nền trước: ngôn ngữ hiển thị, design token, layout shell, Sidebar, Header, feedback state và responsive. Sau đó polish từng workflow chính bằng các UI primitive dùng chung để các màn không tự xử lý layout và style theo nhiều kiểu khác nhau.

**Tech stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, Prisma/Supabase theo phần persistence hiện có, Meta Marketing API qua server actions.

---

## Phạm Vi

Kế hoạch này tập trung vào UI/UX, cấu trúc frontend và độ rõ ràng của trạng thái hiển thị cho người dùng. Kế hoạch không xử lý việc Meta phê duyệt quyền Ads Library API, cấp token hay business verification. Các lỗi quyền API chỉ được xử lý ở mức UI: hiển thị thông báo rõ nguyên nhân và hướng xử lý.

## Hiện Trạng Chính

- Text trong app chưa thống nhất: có tiếng Anh, tiếng Việt có dấu, tiếng Việt không dấu và một số chuỗi từng bị lỗi encoding.
- `src/app/globals.css` có token cơ bản nhưng nhiều CSS module đang dùng biến chưa được khai báo rõ như `--purple`, `--pink`, `--transition`, `--border-light`, `--shadow`.
- `MainLayout` đang cố định viewport, trong khi Creative và AI Analysis lại tự dùng layout full-height và margin âm.
- Header đang là global header nhưng chưa page-aware. Creative và AI Analysis vẫn bị ảnh hưởng bởi kiểu filter của Dashboard dù không phải lúc nào cũng cần date range.
- Sidebar có chiều rộng desktop cố định, chưa có trạng thái collapse/mobile rõ ràng.
- Dashboard và Campaigns là màn vận hành cần dense/scannable UI. Creative và AI Analysis là split-pane workflow. Layout system nên hỗ trợ rõ cả hai kiểu.
- Settings đang dùng nhiều inline style, cần chuyển sang CSS Module.
- Loading, empty, error, sync và data-source state chưa thống nhất.

## Bản Đồ File

Nền tảng dùng chung:

- Sửa `src/app/globals.css`: design token, focus style, token màu/trạng thái.
- Sửa `src/components/Layout/MainLayout.tsx`: hỗ trợ layout mode và Header theo từng page.
- Sửa `src/components/Layout/MainLayout.module.css`: mode standard, full-height và split-pane.
- Sửa `src/components/Header/Header.tsx`: date range typed, optional controls, trạng thái dữ liệu.
- Sửa `src/components/Header/Header.module.css`: đồng nhất light/dark, responsive wrap.
- Sửa `src/components/Sidebar/Sidebar.tsx`: label sạch, group navigation, thêm Settings.
- Sửa `src/components/Sidebar/Sidebar.module.css`: responsive collapse và active state.
- Tạo `src/lib/dateRange.ts`: helper date range ổn định.
- Tạo `src/lib/navigation.ts`: nguồn duy nhất cho route/label/menu.
- Tạo `src/components/ui/StatusBadge.tsx`: badge trạng thái dùng chung.
- Tạo `src/components/ui/FeedbackState.tsx`: loading, empty, error và data-source state dùng chung.
- Tạo `src/components/ui/ui.module.css`: style cho UI primitive dùng chung.

Polish theo từng màn:

- Sửa `src/app/page.tsx`: props cho dashboard shell, date range typed, refresh state rõ hơn.
- Sửa `src/components/Dashboard/Dashboard.tsx`: rõ nguồn dữ liệu, hierarchy metric, bỏ text prototype.
- Sửa `src/components/Dashboard/Dashboard.module.css`: KPI/table dễ scan hơn.
- Sửa `src/app/campaigns/page.tsx`: workflow bảng, filter, bulk toolbar, modal, date range typed.
- Sửa `src/app/campaigns/campaigns.module.css`: responsive table và action state.
- Sửa `src/app/creative/page.tsx`: không tự scan đối thủ khi đổi tab, rõ data source và thư viện đã lưu.
- Sửa `src/app/creative/creative.module.css`: dùng layout/token chung.
- Sửa `src/app/ai-analysis/page.tsx`: thêm lý do khuyến nghị, confidence, action liên quan.
- Sửa `src/app/ai-analysis/page.module.css`: bỏ margin âm, dùng shell mode.
- Sửa `src/app/settings/page.tsx`: bỏ inline style.
- Tạo `src/app/settings/settings.module.css`: style cho Settings.

Kiểm thử:

- Chạy `npm.cmd run build` sau mỗi phase.
- Chạy `npm.cmd run lint` sau mỗi phase. Nếu lint fail vì lỗi cũ không liên quan, ghi lại file/lỗi cụ thể.
- QA thủ công các route: `/`, `/campaigns`, `/creative`, `/ai-analysis`, `/settings`.

---

## Phase 0: Baseline Và Quy Tắc

### Task 0.1: Đọc Tài Liệu Next.js Cục Bộ

**File:**

- Đọc: `AGENTS.md`
- Đọc: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- Đọc: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- Đọc: `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
- Đọc: `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`
- Đọc: `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`

- [ ] **Bước 1: Xác nhận instruction của repo**

Chạy:

```powershell
Get-Content -Path AGENTS.md
```

Kỳ vọng: output nhắc phải đọc tài liệu Next.js trong `node_modules/next/dist/docs/` trước khi viết code.

- [ ] **Bước 2: Đọc tài liệu App Router và CSS**

Chạy:

```powershell
Get-Content -Path node_modules\next\dist\docs\01-app\01-getting-started\03-layouts-and-pages.md -TotalCount 220
Get-Content -Path node_modules\next\dist\docs\01-app\01-getting-started\05-server-and-client-components.md -TotalCount 220
Get-Content -Path node_modules\next\dist\docs\01-app\01-getting-started\07-mutating-data.md -TotalCount 220
Get-Content -Path node_modules\next\dist\docs\01-app\01-getting-started\10-error-handling.md -TotalCount 220
Get-Content -Path node_modules\next\dist\docs\01-app\01-getting-started\11-css.md -TotalCount 220
```

Kỳ vọng: đủ context về App Router, client/server component, server action, error handling và CSS Module.

### Task 0.2: Ghi Nhận Baseline UI Hiện Tại

**File:**

- Đọc: `src/app/page.tsx`
- Đọc: `src/app/campaigns/page.tsx`
- Đọc: `src/app/creative/page.tsx`
- Đọc: `src/app/ai-analysis/page.tsx`
- Đọc: `src/app/settings/page.tsx`

- [ ] **Bước 1: Build trước khi sửa**

Chạy:

```powershell
npm.cmd run build
```

Kỳ vọng: build pass. Nếu fail trước khi bắt đầu sửa UI, chỉ xử lý lỗi build blocker trước.

- [ ] **Bước 2: Ghi lại baseline lint**

Chạy:

```powershell
npm.cmd run lint
```

Kỳ vọng: lint có thể fail vì repo đã có lỗi cũ. Ghi lại danh sách file fail trước khi sửa UI.

- [ ] **Bước 3: Kiểm tra thủ công các route**

Mở:

```text
http://localhost:3000/
http://localhost:3000/campaigns
http://localhost:3000/creative
http://localhost:3000/ai-analysis
http://localhost:3000/settings
```

Kỳ vọng: ghi lại lỗi layout, text, overflow, loading/empty/error state còn thiếu ở desktop, tablet và mobile.

---

## Phase 1: Nền Tảng UI Dùng Chung

### Task 1.1: Chuẩn Hóa Text Hiển Thị

**File:**

- Sửa: `src/components/Sidebar/Sidebar.tsx`
- Sửa: `src/components/Header/Header.tsx`
- Sửa: `src/components/Layout/MainLayout.tsx`
- Sửa: `src/app/settings/page.tsx`
- Sửa: `src/components/Dashboard/Dashboard.tsx`
- Sửa: `src/app/campaigns/page.tsx`
- Sửa: `src/app/creative/page.tsx`
- Sửa: `src/app/ai-analysis/page.tsx`

- [ ] **Bước 1: Tìm text lỗi hoặc chưa thống nhất**

Chạy:

```powershell
rg -n "Ã|Ä|á»|áº|â|Dang|Phan|Tao|Khong|Dong bo|Chua" src
```

Kỳ vọng: thấy toàn bộ dòng cần review copy.

- [ ] **Bước 2: Chọn quy ước ngôn ngữ**

Dùng tiếng Việt có dấu cho UI. Giữ lại các thuật ngữ sản phẩm/kỹ thuật phổ biến bằng tiếng Anh khi cần: `Dashboard`, `Creative`, `AI Insights`, `ROAS`, `CPA`, `CTR`, `Meta`.

- [ ] **Bước 3: Thay nhãn navigation**

Copy mục tiêu:

```ts
[
  { href: '/', label: 'Dashboard' },
  { href: '/campaigns', label: 'Chiến dịch' },
  { href: '/creative', label: 'Creative' },
  { href: '/ai-analysis', label: 'Phân tích AI' },
  { href: '/settings', label: 'Cài đặt' }
]
```

Kỳ vọng: Sidebar dễ đọc, thống nhất, không còn lỗi encoding.

- [ ] **Bước 4: Thay message dùng chung**

Dùng các message sau ở nơi phù hợp:

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

Kỳ vọng: layout, header, sidebar và settings không còn text mojibake.

- [ ] **Bước 5: Kiểm tra lại lỗi encoding**

Chạy:

```powershell
rg -n "Ã|Ä|á»|áº|â" src
```

Kỳ vọng: không còn match trong các file UI người dùng nhìn thấy.

### Task 1.2: Định Nghĩa Design Token

**File:**

- Sửa: `src/app/globals.css`

- [ ] **Bước 1: Thêm token semantic còn thiếu**

Thêm hoặc merge vào `:root`:

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

- [ ] **Bước 2: Thêm token cho dark mode**

Thêm hoặc merge vào `[data-theme="dark"]`:

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

- [ ] **Bước 3: Thêm focus style**

Thêm:

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

Kỳ vọng: người dùng điều hướng bằng bàn phím luôn thấy focus rõ.

- [ ] **Bước 4: Kiểm tra token**

Chạy:

```powershell
rg -n "var\(--(purple|pink|transition|border-light|shadow|focus-ring)" src
```

Kỳ vọng: các token được dùng đều đã có trong `src/app/globals.css`.

### Task 1.3: Tạo UI Primitive Cho Trạng Thái

**File:**

- Tạo: `src/components/ui/FeedbackState.tsx`
- Tạo: `src/components/ui/StatusBadge.tsx`
- Tạo: `src/components/ui/ui.module.css`

- [ ] **Bước 1: Tạo component dùng chung**

Tạo `src/components/ui/FeedbackState.tsx`:

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

Tạo `src/components/ui/StatusBadge.tsx`:

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

- [ ] **Bước 2: Tạo CSS dùng chung**

Tạo `src/components/ui/ui.module.css`:

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

- [ ] **Bước 3: Build**

Chạy:

```powershell
npm.cmd run build
```

Kỳ vọng: build pass.

---

## Phase 2: Layout, Sidebar, Header

### Task 2.1: Thêm Layout Mode Rõ Ràng

**File:**

- Sửa: `src/components/Layout/MainLayout.tsx`
- Sửa: `src/components/Layout/MainLayout.module.css`
- Sửa: `src/app/creative/page.tsx`
- Sửa: `src/app/ai-analysis/page.tsx`

- [ ] **Bước 1: Thêm prop layout mode**

Cập nhật `MainLayoutProps`:

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

Mặc định dùng `contentMode = 'standard'`.

- [ ] **Bước 2: Gắn class theo content mode**

Trong `MainLayout.tsx`:

```tsx
<main className={`${styles.content} ${contentMode === 'fullHeight' ? styles.contentFullHeight : ''}`}>
  {children}
</main>
```

- [ ] **Bước 3: Cập nhật CSS layout**

Thêm:

```css
.contentFullHeight {
  padding: 0;
  overflow: hidden;
}
```

Kỳ vọng: Creative và AI Analysis dùng `contentMode="fullHeight"` thay vì tự margin âm.

- [ ] **Bước 4: Cập nhật Creative và AI Analysis**

Đặt:

```tsx
<MainLayout
  title="..."
  contentMode="fullHeight"
  showRightSidebar={false}
>
```

Xóa margin âm và các đoạn tự bù layout padding.

### Task 2.2: Làm Header Theo Từng Page

**File:**

- Sửa: `src/components/Header/Header.tsx`
- Sửa: `src/components/Header/Header.module.css`
- Sửa: `src/components/Layout/MainLayout.tsx`
- Sửa: `src/app/page.tsx`
- Sửa: `src/app/campaigns/page.tsx`
- Sửa: `src/app/creative/page.tsx`
- Sửa: `src/app/ai-analysis/page.tsx`

- [ ] **Bước 1: Thay callback date dạng string bằng typed range**

Tạo type trong `src/components/Header/Header.tsx`:

```ts
export interface DateRange {
  start: string;
  end: string;
}
```

Đổi prop:

```ts
onDateChange?: (range: string) => void;
```

thành:

```ts
dateRange?: DateRange;
onDateRangeChange?: (range: DateRange) => void;
showDateRange?: boolean;
showAccountSelect?: boolean;
dataStatus?: 'live' | 'synced' | 'demo' | 'error' | 'idle';
dataStatusLabel?: string;
```

- [ ] **Bước 2: Bỏ `new Date()` trong render của Header**

Header chỉ dùng `dateRange` được truyền vào. Nếu không có `dateRange`, ẩn date field.

- [ ] **Bước 3: Cấu hình controls theo từng page**

Quy ước:

```ts
const headerConfigByPage = {
  dashboard: { showDateRange: true, showAccountSelect: true },
  campaigns: { showDateRange: true, showAccountSelect: true },
  creative: { showDateRange: false, showAccountSelect: true },
  aiAnalysis: { showDateRange: false, showAccountSelect: true },
  settings: { showDateRange: false, showAccountSelect: false }
};
```

- [ ] **Bước 4: Sửa visual của Header**

Bỏ hard-coded dark background ở input/select. Dùng:

```css
.dateInput,
.accountSelect {
  background: var(--bg-panel);
  color: var(--text-main);
  border: 1px solid var(--border);
}
```

- [ ] **Bước 5: QA thủ công**

Kiểm tra:

```text
Dashboard: hiện date range, account, refresh.
Campaigns: hiện date range, account, refresh.
Creative: ẩn date range, account hiện nếu còn cần.
AI Analysis: ẩn date range, account hiện.
Settings: ẩn date range và account select.
```

### Task 2.3: Sidebar Responsive

**File:**

- Sửa: `src/components/Sidebar/Sidebar.tsx`
- Sửa: `src/components/Sidebar/Sidebar.module.css`
- Tạo: `src/lib/navigation.ts`

- [ ] **Bước 1: Chuyển nav config sang `src/lib/navigation.ts`**

Tạo:

```ts
export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', group: 'Vận hành' },
  { href: '/campaigns', label: 'Chiến dịch', group: 'Vận hành' },
  { href: '/creative', label: 'Creative', group: 'AI Tools' },
  { href: '/ai-analysis', label: 'Phân tích AI', group: 'AI Tools' },
  { href: '/settings', label: 'Cài đặt', group: 'Hệ thống' }
] as const;
```

- [ ] **Bước 2: Render group trong Sidebar**

Sidebar render group label và nav item từ `NAV_ITEMS`, không hard-code rời rạc trong component.

- [ ] **Bước 3: Thêm hành vi mobile**

CSS gợi ý:

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

Nếu thêm nút mở menu trong Header, dùng button thật:

```tsx
<button type="button" aria-label="Mở menu">...</button>
```

- [ ] **Bước 4: QA thủ công**

Ở mobile width, Sidebar không được chiếm ngang màn hình vĩnh viễn và phải mở/đóng được.

---

## Phase 3: Polish Theo Từng Workflow

### Task 3.1: Polish Dashboard Theo Hướng Vận Hành

**File:**

- Sửa: `src/app/page.tsx`
- Sửa: `src/components/Dashboard/Dashboard.tsx`
- Sửa: `src/components/Dashboard/Dashboard.module.css`

- [ ] **Bước 1: Hiển thị nguồn dữ liệu**

Gần title hoặc KPI section, hiển thị:

```tsx
<StatusBadge tone={stats?.isMock ? 'warning' : 'success'}>
  {stats?.isMock ? 'Dữ liệu demo' : 'Dữ liệu Meta'}
</StatusBadge>
```

- [ ] **Bước 2: Đơn giản hóa KPI chính**

Chỉ giữ 4 card chính:

```text
Spend
Revenue
ROAS
CPA / Result Cost
```

Metric phụ như CTR, CPM, impressions, results đưa xuống khu vực bên dưới.

- [ ] **Bước 3: Làm campaign tree dễ scan**

Mỗi campaign row nên có:

```text
Campaign name
Status badge
Spend
CPA
ROAS/performance
Action suggestion
```

Kỳ vọng: media buyer nhìn nhanh là biết campaign nào nên scale, watch hoặc kill.

- [ ] **Bước 4: Verify**

Chạy:

```powershell
npm.cmd run build
```

Kỳ vọng: build pass, Dashboard vẫn load theo account và date range đã chọn.

### Task 3.2: Campaigns Table Workflow

**File:**

- Sửa: `src/app/campaigns/page.tsx`
- Sửa: `src/app/campaigns/campaigns.module.css`
- Dùng: `src/components/ui/StatusBadge.tsx`
- Dùng: `src/components/ui/FeedbackState.tsx`

- [ ] **Bước 1: Làm filter bar gọn và ổn định**

Top control bar gồm:

```text
Search input
Objective select
Status select
Create campaign button
Rules button
```

Mỗi control có width ổn định, không làm bảng giật layout khi nhập search.

- [ ] **Bước 2: Cải thiện inline budget editing**

Trạng thái edit budget cần có:

```text
Input
Save button
Cancel button
Saving state
Error toast nếu update fail
Rollback về budget cũ nếu update fail
```

- [ ] **Bước 3: Cải thiện bulk action toolbar**

Khi chọn ít nhất một row, toolbar hiển thị:

```text
{count} selected
Pause
Duplicate
Create rule
Clear selection
```

Toolbar không được che row trên mobile. Ở màn nhỏ, toolbar dock full-width ở bottom.

- [ ] **Bước 4: Thêm empty state**

Dùng `FeedbackState` cho:

```text
Không có campaign khớp bộ lọc
Meta không trả về campaign
Lỗi Meta API
```

- [ ] **Bước 5: Verify**

Chạy:

```powershell
npm.cmd run build
```

Kỳ vọng: build pass. QA thủ công filter, select, inline budget và bulk toolbar.

### Task 3.3: Làm Rõ Workflow Creative

**File:**

- Sửa: `src/app/creative/page.tsx`
- Sửa: `src/app/creative/creative.module.css`
- Sửa: `src/app/creative/components/CompetitorResults.tsx`
- Sửa: `src/app/creative/components/CreativeLibrary.tsx`
- Dùng: `src/components/ui/StatusBadge.tsx`
- Dùng: `src/components/ui/FeedbackState.tsx`

- [ ] **Bước 1: Dừng tự scan đối thủ khi đổi tab**

Bỏ call tự động trong tab switch:

```tsx
onClick={() => {
  setActiveTab('competitor');
}}
```

Kỳ vọng: chỉ phân tích đối thủ khi user bấm nút scan/analyze.

- [ ] **Bước 2: Hiển thị rõ nguồn dữ liệu**

Competitor results hiển thị một trong các trạng thái:

```text
Dữ liệu Meta Ad Library
Lỗi quyền Meta Ad Library
Chưa quét đối thủ
```

- [ ] **Bước 3: Làm rõ thư viện đã lưu**

Card trong thư viện hiển thị:

```text
Nguồn: Copywriting / Counter-ad
Thời điểm tạo
Copy button
Edit button
Delete button
```

Nếu vẫn lưu bằng localStorage, hiển thị note nhỏ:

```text
Lưu trên trình duyệt hiện tại
```

- [ ] **Bước 4: Cải thiện competitor form**

Form phân tích đối thủ gồm:

```text
Page URL input
Audience input
Saved competitor select
Analyze button
Permission error help text area
```

Kỳ vọng: user hiểu lỗi quyền Meta là vấn đề API/app permission, không phải UI không hoạt động.

- [ ] **Bước 5: Verify**

Chạy:

```powershell
npm.cmd run build
```

Kỳ vọng: build pass. QA copy generation, lưu/xóa library, competitor scan error và không tự scan khi đổi tab.

### Task 3.4: UX Cho AI Analysis Recommendation

**File:**

- Sửa: `src/app/ai-analysis/page.tsx`
- Sửa: `src/app/ai-analysis/page.module.css`
- Sửa: `src/app/actions/aiInsights.ts`
- Dùng: `src/components/ui/StatusBadge.tsx`
- Dùng: `src/components/ui/FeedbackState.tsx`

- [ ] **Bước 1: Thêm field giải thích recommendation**

Mở rộng payload:

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

- [ ] **Bước 2: Render phần vì sao AI khuyến nghị**

Mỗi card hiển thị:

```text
Tiêu đề khuyến nghị
Impact
Confidence
Metrics
Vì sao AI khuyến nghị
Hành động tiếp theo
```

- [ ] **Bước 3: Làm rõ giới hạn chat**

Chat panel cần ghi rõ nếu đang trả lời bằng rule local thay vì LLM thật:

```text
Trả lời dựa trên dữ liệu chiến dịch đã quét
```

- [ ] **Bước 4: Verify**

Chạy:

```powershell
npm.cmd run build
```

Kỳ vọng: build pass. QA xem recommendation có dễ hiểu mà không cần đọc code hay không.

### Task 3.5: Dọn Settings Page

**File:**

- Sửa: `src/app/settings/page.tsx`
- Tạo: `src/app/settings/settings.module.css`
- Dùng: `src/components/ui/StatusBadge.tsx`
- Dùng: `src/components/ui/FeedbackState.tsx`

- [ ] **Bước 1: Bỏ inline style**

Thay inline style object bằng CSS module:

```tsx
import styles from './settings.module.css';
```

- [ ] **Bước 2: Thêm section trạng thái kết nối**

Settings hiển thị:

```text
Trạng thái token ads công ty
Trạng thái token Meta Ad Library
Kết quả sync gần nhất
Nút sync tất cả tài khoản
```

- [ ] **Bước 3: Thêm hướng dẫn lỗi quyền API**

Khi Ad Library trả code `10` và subcode `2332002`, hiển thị:

```text
Ứng dụng Meta chưa được cấp quyền Ads Library API. Token hợp lệ nhưng app chưa có quyền gọi /ads_archive.
```

- [ ] **Bước 4: Verify**

Chạy:

```powershell
npm.cmd run build
```

Kỳ vọng: build pass, Settings không còn block inline style lớn.

---

## Phase 4: Chuẩn Hóa Error, Loading, Empty Và Data Source

### Task 4.1: Tạo API Error Mapping

**File:**

- Tạo: `src/lib/apiErrorMessages.ts`
- Sửa: `src/app/actions/creative.ts`
- Sửa: `src/app/actions/facebook.ts`
- Sửa: `src/app/actions/dashboard.ts`
- Sửa: `src/app/actions/campaigns.ts`

- [ ] **Bước 1: Tạo error mapper**

Tạo:

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

- [ ] **Bước 2: Dùng mapper trong server actions**

Khi return lỗi từ action:

```ts
return {
  success: false,
  error: getFriendlyApiError(error)
};
```

- [ ] **Bước 3: Verify**

Chạy:

```powershell
npm.cmd run build
```

Kỳ vọng: build pass, lỗi quyền Meta hiển thị dễ hiểu và có hành động tiếp theo.

### Task 4.2: Chuẩn Hóa Page State

**File:**

- Sửa: `src/components/Dashboard/Dashboard.tsx`
- Sửa: `src/app/campaigns/page.tsx`
- Sửa: `src/app/creative/page.tsx`
- Sửa: `src/app/ai-analysis/page.tsx`
- Dùng: `src/components/ui/FeedbackState.tsx`

- [ ] **Bước 1: Một pattern cho loading**

Mọi page dùng:

```tsx
<FeedbackState tone="info" title="Đang tải dữ liệu..." description="Hệ thống đang lấy dữ liệu mới nhất." />
```

- [ ] **Bước 2: Một pattern cho empty**

Mọi empty list dùng:

```tsx
<FeedbackState tone="neutral" title="Chưa có dữ liệu" description="Thay đổi bộ lọc hoặc đồng bộ lại tài khoản để tải dữ liệu." />
```

- [ ] **Bước 3: Một pattern cho error**

Mọi error view dùng:

```tsx
<FeedbackState tone="danger" title="Không thể tải dữ liệu" description={error} />
```

- [ ] **Bước 4: Verify**

Chạy:

```powershell
npm.cmd run build
```

Kỳ vọng: các page chính có loading, empty và error state đồng nhất.

---

## Phase 5: Accessibility, Responsive QA Và Final Verification

### Task 5.1: Accessibility Pass

**File:**

- Sửa: `src/components/Header/Header.tsx`
- Sửa: `src/components/Sidebar/Sidebar.tsx`
- Sửa: `src/app/campaigns/page.tsx`
- Sửa: `src/app/creative/page.tsx`
- Sửa: `src/app/ai-analysis/page.tsx`

- [ ] **Bước 1: Icon-only button phải có label**

Mọi icon-only button cần có `aria-label`.

Ví dụ:

```tsx
<button type="button" aria-label="Làm mới dữ liệu" className={styles.iconButton}>
  ...
</button>
```

- [ ] **Bước 2: Interactive element phải là button hoặc link thật**

Control tạo action dùng:

```tsx
<button type="button">...</button>
```

Navigation dùng:

```tsx
<Link href="/campaigns">Chiến dịch</Link>
```

- [ ] **Bước 3: QA keyboard navigation**

QA thủ công:

```text
Tab qua Sidebar, Header controls, Campaign filters, Creative forms, AI chat.
Enter và Space phải kích hoạt button.
Focus ring phải hiển thị trên mọi control có thể focus.
```

### Task 5.2: Responsive QA

**File:**

- Sửa các CSS module đã chạm ở phase trước nếu cần.

- [ ] **Bước 1: Test desktop**

Viewport:

```text
1440 x 900
```

Kỳ vọng:

```text
Dashboard và Campaigns dễ scan.
Creative split pane dùng tốt.
AI Analysis feed và chat không overlap.
```

- [ ] **Bước 2: Test tablet**

Viewport:

```text
1024 x 768
```

Kỳ vọng:

```text
Sidebar dùng được hoặc collapse hợp lý.
Header controls wrap không overlap.
Campaigns table scroll ngang được.
```

- [ ] **Bước 3: Test mobile**

Viewport:

```text
390 x 844
```

Kỳ vọng:

```text
Sidebar không ép horizontal overflow.
Header không đè nội dung.
Creative panes stack dọc.
AI chat nằm dưới recommendations.
Campaigns table hoặc card vẫn đọc được.
```

### Task 5.3: Build Và Lint Cuối

**File:**

- Verify toàn bộ file đã sửa.

- [ ] **Bước 1: Build**

Chạy:

```powershell
npm.cmd run build
```

Kỳ vọng: build pass.

- [ ] **Bước 2: Lint**

Chạy:

```powershell
npm.cmd run lint
```

Kỳ vọng: lint pass. Nếu vẫn fail ở file cũ không liên quan, ghi lại file và lỗi cụ thể trong handoff.

- [ ] **Bước 3: Scan pattern cần loại bỏ**

Chạy:

```powershell
rg -n "Ã|Ä|á»|áº|â|margin: -24px|margin: -16px|new Date\\(" src
```

Kỳ vọng:

```text
Không còn mojibake trong UI file.
Không còn negative margin hack ở Creative hoặc AI Analysis.
Không còn new Date() trong render của Header.
Date construction chỉ còn ở server action hoặc date helper.
```

### Task 5.4: Commit Gợi Ý

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

- [ ] **Commit Phase 4 Và 5**

```powershell
git add src/lib/apiErrorMessages.ts src/app/actions src/components src/app
git commit -m "feat: standardize ui states and accessibility"
```

---

## Definition Of Done

- Text toàn app đọc được, thống nhất trên Dashboard, Campaigns, Creative, AI Analysis và Settings.
- Các token CSS được dùng bởi module đều có trong `src/app/globals.css`.
- Header page-aware, không hiện filter không liên quan.
- Sidebar dùng tốt trên desktop và không phá layout mobile.
- Creative và AI Analysis không còn dùng negative margin layout hack.
- Loading, empty, error và data-source state dùng primitive chung.
- Lỗi quyền Meta được giải thích rõ: app/token thiếu quyền API nào, user cần xử lý ở đâu.
- `npm.cmd run build` pass.
- `npm.cmd run lint` pass hoặc chỉ còn lỗi cũ không liên quan đã được ghi rõ.
