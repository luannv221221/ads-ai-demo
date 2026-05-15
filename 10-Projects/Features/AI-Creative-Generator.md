---
tags: feature
status: backlog
created: 2026-05-12
---
# Feature: AI Creative Generator & Copilot

## 📖 Mô tả
Trợ lý AI (Phòng Creative) hỗ trợ sáng tạo nội dung quảng cáo dựa trên tâm lý học khách hàng và dữ liệu thành công từ đối thủ cạnh tranh. Giúp đội ngũ media tiết kiệm thời gian brainstroming và A/B test hiệu quả hơn.

### Hypothesis (Giả thuyết sản phẩm)
- **We believe that** tích hợp một AI Copilot tạo nội dung ngay trong Ads Manager.
- **For** Content Creators và Media Buyers.
- **Will** giải quyết tình trạng "bí ý tưởng" và tăng tốc độ sản xuất hàng loạt (mass production) các mẫu quảng cáo.
- **We'll know we're right when** thời gian trung bình từ lúc lên ý tưởng đến lúc tạo xong chiến dịch giảm 50% và có ít nhất 60% chiến dịch mới sử dụng mẫu từ AI.

## 👤 User Stories
- **As a** Content Creator, **I want to** nhập thông tin sản phẩm và nhận được 10 tiêu đề thu hút theo khung AIDA **so that** tôi có thể test nhanh nhiều thông điệp khác nhau.
- **As a** Media Buyer, **I want to** AI gợi ý các mẫu quảng cáo tương tự như những mẫu đang "win" của đối thủ (được phân tích từ Competitor Intelligence) **so that** tôi tăng khả năng thành công cho chiến dịch mới.
- **As a** Content Creator, **I want to** chọn "Giọng điệu" (Tone of voice) cho nội dung (ví dụ: Chuyên nghiệp, Hài hước, FOMO) **so that** tôi có thể tuỳ chỉnh bài quảng cáo phù hợp với từng phân khúc khách hàng.
- **As a** Media Buyer, **I want to** dễ dàng lưu các biến thể AI sinh ra vào "Thư viện" hoặc sao chép nhanh (1-click copy) **so that** tôi chuyển ngay nội dung sang luồng thiết lập chiến dịch mà không mất công copy-paste thủ công.

## ✅ Tiêu chí chấp nhận (Acceptance Criteria)
- [ ] **Giao diện làm việc (Workspace):** Thiết kế dạng 2 cột trực quan (Cột form điền yêu cầu, cột hiển thị kết quả), hỗ trợ sinh nhiều biến thể dạng Thẻ (Cards).
- [ ] **Copywriting Frameworks:** Tích hợp các lựa chọn sinh bài theo cấu trúc: AIDA, PAS, FAB, Storytelling.
- [ ] **Tương tác nhanh (Quick Actions):** Có nút "Copy", "Chỉnh sửa" và "Lưu vào Thư viện" ở mỗi kết quả trả về.
- [ ] **Phân tích đối thủ:** Liên kết với tính năng Competitor Intelligence. Khi nhập Link Fanpage đối thủ, AI sẽ tự động quét Facebook Ad Library để tổng hợp Hook từ **tất cả quảng cáo đang chạy (Active Ads)**. 
  - Hiển thị trực quan dữ liệu thô (tổng số ads, loại media, nền tảng) và top các mẫu quảng cáo nổi bật.
  - Sử dụng **Public Indicators** (Lượt tương tác công khai, Thời gian chạy) để dán nhãn dự đoán hiệu suất (Ví dụ: `🔥 Winning Ad` cho ad chạy >30 ngày, `⏱️ Đang Test` cho ad mới). (Lưu ý: Không lấy chỉ số private như CPM/ROAS để tránh Fake Data).
  - Đưa ra điểm yếu chung và đề xuất 3 góc tiếp cận mới.
- [ ] **Hiệu suất (Performance):** Kết quả sinh nội dung (Prompt response) phải hiển thị dạng Streaming hoặc hoàn thành dưới 5 giây. Có xử lý lỗi mượt mà khi API AI bị timeout.
- [ ] **Image Prompt:** Tích hợp Image AI để gợi ý mô tả (prompt) cho hình ảnh quảng cáo đi kèm.

## 🛠️ Kỹ thuật
- Component liên quan: `AICopyWriter`, `CreativeAssistant`, `PromptGenerator`.
- API endpoints cần thiết: Gemini API (hoặc OpenAI API), Unsplash API (for stock search).
- Thay đổi schema database: `generated_creatives` table.

## 🧪 Kế hoạch Test
- Unit test: Kiểm tra tính đa dạng của nội dung sinh ra từ các khung tâm lý khác nhau.
- Integration test: Đảm bảo nội dung sinh ra không vi phạm các chính sách cơ bản của Facebook (Keywords filter).

## 📝 Ghi chú
- Kết hợp với tính năng *Competitor Intelligence* để học hỏi từ những mẫu quảng cáo đang có hiệu suất cao nhất thị trường.
