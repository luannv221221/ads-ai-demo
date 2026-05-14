---
tags: feature
status: backlog
created: 2026-05-12
---
# Feature: Automated Alerts (Cảnh báo thông minh)

## 📖 Mô tả
Hệ thống giám sát tự động gửi cảnh báo qua Telegram/Slack khi các chỉ số quảng cáo vượt ngưỡng an toàn hoặc có biến động bất thường.

## 👤 User Stories
- **As a** Media Buyer, **I want to** nhận thông báo ngay lập tức qua Telegram khi tài khoản bị vô hiệu hóa **so that** tôi có thể xử lý kịp thời để không bị gián đoạn quảng cáo.
- **As a** Project Manager, **I want to** được cảnh báo khi ROAS của một chiến dịch quan trọng giảm dưới mức 1.5 **so that** tôi có thể điều chỉnh chiến lược ngay lập tức.

## ✅ Tiêu chí chấp nhận (Acceptance Criteria)
- [ ] Cấu hình ngưỡng cảnh báo (ví dụ: ROAS < 1.5 hoặc Spend > $1000/ngày).
- [ ] Tích hợp Webhook với Telegram/Slack.
- [ ] Thông báo ngay lập tức khi tài khoản quảng cáo bị vô hiệu hóa (Disabled).
- [ ] Báo cáo tóm tắt hàng ngày vào 8:00 AM.

## 🛠️ Kỹ thuật
- Component liên quan: `AlertSettings`, `NotificationService`.
- API endpoints cần thiết: Telegram Bot API, Slack Webhooks.
- Thay đổi schema database: `alert_configs`, `alert_history`.

## 🧪 Kế hoạch Test
- Unit test: Giả lập dữ liệu vượt ngưỡng để kích hoạt alert.
- Integration test: Kiểm tra kết nối thực tế với Telegram API.

## 📝 Ghi chú
- Cần cơ chế chống spam (Rate limiting) để tránh gửi quá nhiều cảnh báo trong thời gian ngắn.
