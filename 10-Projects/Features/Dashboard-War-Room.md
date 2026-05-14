---
tags: feature
status: backlog
created: 2026-05-12
---
# Feature: Dashboard War Room (Thời gian thực)

## 📖 Mô tả
Giao diện trung tâm hiển thị toàn bộ các chỉ số quan trọng của các chiến dịch đang chạy trong thời gian thực, tập trung vào việc ra quyết định nhanh (War Room aesthetic).

## 👤 User Stories
- **As a** Media Buyer, **I want to** xem tất cả chỉ số quan trọng trên một màn hình duy nhất **so that** tôi có thể phát hiện nhanh các chiến dịch đang gặp vấn đề mà không phải mở nhiều tab.
- **As a** Project Manager, **I want to** thấy biểu đồ so sánh Spend vs Revenue **so that** tôi có thể nắm bắt nhanh xu hướng ROAS của ngày hôm nay.

## ✅ Tiêu chí chấp nhận (Acceptance Criteria)
- [ ] Hiển thị các chỉ số chính: Spend, Revenue, ROAS, CTR, CPC.
- [ ] Biểu đồ đường so sánh Spend và Revenue theo giờ.
- [ ] Danh sách top 5 chiến dịch hiệu quả nhất/kém nhất.
- [ ] Chế độ Dark mode cao cấp (High-end aesthetic).

## 🛠️ Kỹ thuật
- Component liên quan: `MetricsGrid`, `PerformanceChart`, `CampaignTable`.
- API endpoints cần thiết: Facebook Graph API (Insights edge).
- Thay đổi schema database: Lưu trữ cache insights để tăng tốc độ load.

## 🧪 Kế hoạch Test
- Unit test: Kiểm tra logic tính toán ROAS từ dữ liệu thô.
- Integration test: Đảm bảo dữ liệu từ FB API được render đúng trên UI.

## 📝 Ghi chú
- Sử dụng Shadcn UI kết hợp với Framer Motion để có hiệu ứng chuyển động mượt mà.
