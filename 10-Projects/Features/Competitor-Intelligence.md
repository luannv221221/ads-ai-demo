---
tags: feature
status: backlog
created: 2026-05-12
---
# Feature: Competitor Intelligence (Scraping & Phân tích)

## 📖 Mô tả
Tích hợp dữ liệu từ Facebook Ad Library để theo dõi các mẫu quảng cáo của đối thủ cạnh tranh và sử dụng AI để phân tích chiến thuật của họ.

## 👤 User Stories
- **As a** Creative Designer, **I want to** xem các mẫu quảng cáo mới nhất của đối thủ **so that** tôi có thêm ý tưởng thiết kế cho chiến dịch tiếp theo.
- **As a** Strategist, **I want to** AI phân tích thông điệp (Hook/Body/CTA) của đối thủ **so that** tôi có thể tìm ra lỗ hổng và lợi thế cạnh tranh của sản phẩm mình.

## ✅ Tiêu chí chấp nhận (Acceptance Criteria)
- [ ] Tích hợp Apify Actor để scrape dữ liệu từ FB Ad Library theo keyword/fanpage.
- [ ] Hiển thị danh sách mẫu quảng cáo (hình ảnh/video + nội dung).
- [ ] Phân loại mẫu quảng cáo theo định dạng (Image, Video, Carousel).
- [ ] AI Summary về thông điệp chính (Hook, Body, CTA) của đối thủ.

## 🛠️ Kỹ thuật
- Component liên quan: `AdCard`, `CompetitorGrid`, `AISummaryPanel`.
- API endpoints cần thiết: Apify API Client.
- Thay đổi schema database: `competitor_ads` table (store image URLs, text, metadata).

## 🧪 Kế hoạch Test
- Unit test: Mock Apify response để kiểm tra parser.
- Integration test: Kiểm tra luồng từ khi nhập link đối thủ đến khi hiển thị kết quả.

## 📝 Ghi chú
- Cần chú ý đến việc lưu trữ hình ảnh (S3 hoặc CDN) để tránh hotlinking từ FB.
