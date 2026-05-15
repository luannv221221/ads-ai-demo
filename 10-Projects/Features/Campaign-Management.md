---
tags: feature
status: backlog
created: 2026-05-15
---
# Feature: Campaign Management (Quản Lý Chiến Dịch)

## 📖 Mô tả
Tính năng cốt lõi cho phép Media Buyers và Performance Managers khởi tạo, chỉnh sửa, nhân bản và quản lý vòng đời của các chiến dịch quảng cáo Facebook trực tiếp từ hệ thống nội bộ mà không cần mở Facebook Ads Manager. Tích hợp tính năng thao tác hàng loạt (Bulk Actions) và tự động hóa quy trình (Automated Rules) để tăng tốc độ làm việc.

### Hypothesis (Giả thuyết sản phẩm)
- **We believe that** xây dựng tính năng Quản lý Chiến dịch tích hợp thao tác hàng loạt.
- **For** Media Buyers và Performance Managers.
- **Will** giảm thiểu 40% thời gian thao tác thủ công và chuyển đổi qua lại giữa các tab trình duyệt.
- **We'll know we're right when** tỷ lệ áp dụng tính năng (Adoption Rate) đạt 80% và thời gian trung bình để setup/scale chiến dịch giảm xuống dưới 3 phút.

## 👤 User Stories
- **As a** Media Buyer, **I want to** chọn nhiều Ad Sets cùng lúc và tăng ngân sách thêm 20% chỉ bằng một click **so that** tôi có thể scale nhanh chóng các luồng đang hiệu quả.
- **As a** Media Buyer, **I want to** nhân bản (duplicate) một chiến dịch win sang một tài khoản quảng cáo khác **so that** tôi tiết kiệm thời gian thiết lập lại từ đầu.
- **As a** Performance Manager, **I want to** tạo các quy tắc (rules) tự động tắt chiến dịch nếu CPA vượt quá ngưỡng $25 **so that** tôi kiểm soát rủi ro ngân sách ngay cả khi không trực máy.
- **As a** Media Buyer, **I want to** chỉnh sửa hàng loạt trạng thái (Bật/Tắt) của nhiều quảng cáo con (Ads) **so that** tôi có thể dễ dàng kill các creative kém hiệu quả.
- **As a** Media Buyer, **I want to** chuyển đổi nhanh giữa các Tài khoản Quảng cáo (Ad Accounts) **so that** tôi có thể quản lý tập trung chiến dịch của nhiều dự án/khách hàng khác nhau.

## ✅ Tiêu chí chấp nhận (Acceptance Criteria)
- [ ] **Chỉ số chiến dịch cơ bản:** Bảng dữ liệu (DataGrid) cần hiển thị rõ các chỉ số quan trọng: Lượt hiển thị (Impressions), Chuyển đổi (Conversions), CPM, và CPA.
- [ ] **Thống kê chi tiết theo ngày (Drill-down):** Khi click vào chi tiết một Campaign, hệ thống hiển thị bảng thống kê theo ngày gồm: Chi tiêu, Hiển thị, Chuyển đổi, CPI, CPA, và cột Đánh giá trạng thái (ví dụ: Không hoạt động, Hiệu quả cao, CPA giảm sâu). Bảng này cần tích hợp **bộ lọc (Filter)** cho phép lọc theo khoảng thời gian (7 ngày qua, tháng này) hoặc lọc theo tình trạng hiệu suất.
- [ ] **Nhận xét AI theo xu hướng:** Bên dưới bảng thống kê ngày, hệ thống AI tự động tổng hợp và đưa ra nhận xét xu hướng (ví dụ: Khởi đầu, Đỉnh cao hiệu quả, Tối ưu hiển thị) giúp Media Buyer đọc vị campaign nhanh chóng.
- [ ] **Thao tác hàng loạt (Bulk Actions):** Hỗ trợ chọn nhiều Campaign/Ad Set/Ad để Bật/Tắt, chỉnh sửa ngân sách (tăng/giảm theo % hoặc số tiền cụ thể).
- [ ] **Nhân bản (Duplication):** Cho phép nhân bản Campaign/Ad Set với cấu hình giữ nguyên hoặc tùy chỉnh (chọn số lượng bản sao, chọn tài khoản đích).
- [ ] **Đồng bộ thời gian thực (Real-time Sync):** Bất kỳ thay đổi nào trên hệ thống cũng phải gọi API đến Facebook và phản hồi trạng thái thành công/thất bại trong dưới 3 giây.
- [ ] **Tự động hóa (Rule-based Automation):** UI để tạo rule cơ bản (VD: IF Metric > X THEN Action).
- [ ] **Quản lý theo Tài khoản (Account-based Management):** Có bộ lọc/selector để chọn Ad Account; dữ liệu chiến dịch và thao tác hàng loạt được giới hạn trong phạm vi tài khoản đang chọn.
- [ ] **Lịch sử thao tác (Audit Log):** Ghi lại lịch sử (ai đã thay đổi ngân sách hoặc bật/tắt chiến dịch nào vào lúc nào) để dễ dàng trace lỗi.

## 🛠️ Kỹ thuật
- **Component liên quan:**
  - `CampaignDataGrid`: Bảng dữ liệu có checkbox multi-select (kế thừa từ War Room).
  - `BulkActionToolbar`: Thanh công cụ nổi xuất hiện khi có dòng dữ liệu được chọn.
  - `RuleBuilderModal`: Giao diện thiết lập quy tắc tự động hóa.
  - `DailyStatsModal`: Giao diện chi tiết hiển thị thống kê theo ngày và nhận xét xu hướng của AI khi click vào một chiến dịch cụ thể.
- **API endpoints cần thiết:**
  - Tích hợp **Facebook Marketing API** (Graph API):
    - `POST /{ad_account_id}/campaigns` (Tạo mới)
    - `POST /{campaign_id}` (Cập nhật, Bật/Tắt, Đổi ngân sách)
  - Internal API: `/api/v1/campaigns/bulk-update` và `/api/v1/rules`.
- **Thay đổi schema database:**
  - Bảng `AuditLog` để lưu lịch sử thay đổi (user_id, action_type, target_id, old_value, new_value, timestamp).
  - Bảng `AutomationRules` để lưu trữ logic các quy tắc tự động.

## 🧪 Kế hoạch Test
- **Unit test:** Kiểm tra logic tính toán giới hạn khi tăng/giảm ngân sách theo phần trăm.
- **Integration test:** 
  - Mock Facebook Graph API để test quy trình cập nhật hàng loạt không bị dội request.
  - Test Webhook phản hồi từ Facebook khi trạng thái chiến dịch bị thay đổi từ bên ngoài (từ app Facebook).

## 📝 Ghi chú
- Tính năng này cần xử lý cẩn thận Rate Limit của Facebook Marketing API (chú ý thiết kế cơ chế Retry/Queue khi user gửi yêu cầu Bulk Update số lượng lớn > 50 records).
- Cân nhắc sử dụng kiến trúc Event-Driven kết hợp chung với hệ thống `Automated-Alerts.md` để đồng nhất luồng xử lý Rules.
