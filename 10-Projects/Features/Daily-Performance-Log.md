---
tags: feature
status: backlog
created: 2026-05-12
---
# Feature: Daily Performance Log & Smart Evaluation

## 📖 Mô tả
Hệ thống tự động tổng hợp dữ liệu quảng cáo theo từng ngày và đưa ra đánh giá thông minh về hiệu quả (ví dụ: "CPA tốt", "Chi phí tăng cao", "Duy trì ổn định").

## 👤 User Stories
- **As a** Media Buyer, **I want to** xem lại lịch sử hiệu quả theo từng ngày **so that** tôi có thể so sánh và tìm ra các điểm đột biến trong quá khứ.
- **As a** Data Analyst, **I want to** hệ thống tự động đưa ra đánh giá dựa trên CPA **so that** tôi tiết kiệm thời gian đọc số liệu thủ công hàng ngày.

## ✅ Tiêu chí chấp nhận (Acceptance Criteria)
- [ ] Bảng thống kê theo ngày với các cột: Chi tiêu, Hiển thị, Chuyển đổi, CPM, CPA.
- [ ] Cột "Đánh giá" tự động dựa trên thuật toán hoặc AI (so sánh với trung bình 7 ngày trước).
- [ ] Highlight các ngày có chỉ số đột biến (CPA thấp nhất hoặc chi phí cao bất thường).
- [ ] Khả năng xuất báo cáo này dưới dạng Markdown hoặc CSV.

## 🛠️ Kỹ thuật
- Component liên quan: `DailyStatTable`, `StatusBadge`, `PerformanceEvaluator`.
- API endpoints cần thiết: Facebook Insights API (time_increment=1).
- Thay đổi schema database: `daily_logs` table để lưu snapshot dữ liệu mỗi ngày.

## 🧪 Kế hoạch Test
- Unit test: Kiểm tra logic phân loại đánh giá (ví dụ: CPA < 50k thì đánh giá là "Hiệu quả cao").
- Integration test: Kiểm tra việc lấy dữ liệu lịch sử từ Facebook API.

## 📝 Ghi chú
- Đánh giá cần được cá nhân hóa dựa trên mục tiêu của từng chiến dịch cụ thể (ví dụ: Chiến dịch chuyển đổi vs Chiến dịch nhận diện).
