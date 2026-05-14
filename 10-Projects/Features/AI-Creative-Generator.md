---
tags: feature
status: backlog
created: 2026-05-12
---
# Feature: AI Creative Generator & Copilot

## 📖 Mô tả
Trợ lý AI hỗ trợ sáng tạo nội dung quảng cáo dựa trên tâm lý học khách hàng và dữ liệu thành công từ đối thủ cạnh tranh.

## 👤 User Stories
- **As a** Content Creator, **I want to** nhập thông tin sản phẩm và nhận được 10 tiêu đề thu hút theo khung AIDA **so that** tôi có thể test nhanh nhiều thông điệp khác nhau.
- **As a** Media Buyer, **I want to** AI gợi ý các mẫu quảng cáo tương tự như những mẫu đang "win" của đối thủ **so that** tôi tăng khả năng thành công cho chiến dịch mới.

## ✅ Tiêu chí chấp nhận (Acceptance Criteria)
- [ ] Công cụ tạo Copywriting dựa trên các khung: AIDA, PAS, FAB.
- [ ] Gợi ý tiêu đề (Headline) và mô tả (Description) dựa trên Keyword/Sản phẩm.
- [ ] Phân tích "Hook" của đối thủ và đề xuất các biến thể mới.
- [ ] Tích hợp Image AI để gợi ý mô tả (prompt) cho hình ảnh quảng cáo.

## 🛠️ Kỹ thuật
- Component liên quan: `AICopyWriter`, `CreativeAssistant`, `PromptGenerator`.
- API endpoints cần thiết: Gemini API (hoặc OpenAI API), Unsplash API (for stock search).
- Thay đổi schema database: `generated_creatives` table.

## 🧪 Kế hoạch Test
- Unit test: Kiểm tra tính đa dạng của nội dung sinh ra từ các khung tâm lý khác nhau.
- Integration test: Đảm bảo nội dung sinh ra không vi phạm các chính sách cơ bản của Facebook (Keywords filter).

## 📝 Ghi chú
- Kết hợp với tính năng *Competitor Intelligence* để học hỏi từ những mẫu quảng cáo đang có hiệu suất cao nhất thị trường.
