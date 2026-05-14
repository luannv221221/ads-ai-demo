---
tags: feature
status: backlog
created: 2026-05-12
---
# Feature: Full-Funnel Analytics & CAPI Bridge

## 📖 Mô tả
Kết nối dữ liệu từ quảng cáo đến hành vi thực tế trên Landing Page và doanh thu thực tế, sử dụng Facebook Conversions API (CAPI) để khắc phục vấn đề mất dữ liệu do iOS 14+.

## 👤 User Stories
- **As a** Media Buyer, **I want to** thấy đúng số lượng đơn hàng trong dashboard giống như trong thực tế **so that** tôi có thể tối ưu hóa quảng cáo dựa trên dữ liệu chuẩn xác.
- **As a** Business Owner, **I want to** theo dõi tỷ lệ chuyển đổi từ lúc khách click vào ad đến khi mua hàng xong **so that** tôi biết được bước nào trong phễu đang bị tắc nghẽn.

## ✅ Tiêu chí chấp nhận (Acceptance Criteria)
- [ ] Thiết lập Bridge gửi sự kiện chuyển đổi (Purchase, Lead) từ Server-side sang FB.
- [ ] Dashboad phễu (Funnel) hiển thị: Clicks -> Page Views -> Adds to Cart -> Purchases.
- [ ] Tính toán chính xác ROAS dựa trên doanh thu thực tế từ database (không chỉ dựa vào Pixel).
- [ ] Hệ thống đối soát dữ liệu (Data reconciliation) giữa CRM và FB Ads Manager.

## 🛠️ Kỹ thuật
- Component liên quan: `FunnelVisualizer`, `CAPISettings`, `ConversionLog`.
- API endpoints cần thiết: Facebook Conversions API, Webhooks từ CRM/Landing Page.
- Thay đổi schema database: `conversion_events` table (store event_id, user_data_hash).

## 🧪 Kế hoạch Test
- Unit test: Kiểm tra định dạng dữ liệu payload gửi sang CAPI.
- Integration test: Sử dụng "Test Events" trong FB Events Manager để xác nhận dữ liệu đã được nhận.

## 📝 Ghi chú
- Sử dụng hashing (SHA256) cho dữ liệu người dùng trước khi gửi để đảm bảo quyền riêng tư.
