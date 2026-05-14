---
tags: feature
status: backlog
created: 2026-05-12
---
# Feature: AI Performance Insights (Trợ lý tối ưu hóa)

## 📖 Mô tả
Sử dụng mô hình ngôn ngữ lớn (Gemini/GPT) để đọc dữ liệu quảng cáo và đưa ra các đề xuất tối ưu hóa hành động (Actionable Insights).

## 👤 User Stories
- **As a** Media Buyer, **I want to** nhận được các gợi ý tối ưu cụ thể (như tăng/giảm ngân sách) **so that** tôi có thể hành động nhanh chóng mà không cần phân tích dữ liệu quá lâu.
- **As a** Business Owner, **I want to** hỏi chatbot về tình hình kinh doanh (ví dụ: "Hôm nay lỗ hay lãi?") **so that** tôi nắm bắt được tình hình mọi lúc mọi nơi.

## ✅ Tiêu chí chấp nhận (Acceptance Criteria)
- [ ] Tự động phát hiện các chiến dịch có ROAS thấp hơn trung bình.
- [ ] Gửi đề xuất: "Tắt Ad Set X", "Tăng ngân sách cho Campaign Y".
- [ ] Phân tích nội dung quảng cáo (Creative analysis) dựa trên CTR.
- [ ] Chatbot hỗ trợ truy vấn dữ liệu bằng ngôn ngữ tự nhiên.

## 🛠️ Kỹ thuật
- Component liên quan: `AIInsightsPanel`, `ChatInterface`.
- API endpoints cần thiết: Gemini API (Vertex AI).
- Thay đổi schema database: `optimization_logs` để theo dõi lịch sử đề xuất của AI.

## 🧪 Kế hoạch Test
- Unit test: Kiểm tra prompt engineering với dữ liệu giả lập.
- Integration test: Đảm bảo AI nhận đúng context từ dữ liệu SQL/API.

## 📝 Ghi chú
- Cần cung cấp đầy đủ context về mục tiêu dự án cho AI để có đề xuất chính xác.
