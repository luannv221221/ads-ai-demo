---
tags: feature
status: backlog
created: 2026-05-12
updated: 2026-05-15
---
# Feature: Dashboard War Room (Thời gian thực)

## 📖 Mô tả
Giao diện trung tâm "chỉ huy" dành cho Media Buyers và Marketing Managers. Cung cấp cái nhìn toàn cảnh và sâu sát về hiệu suất quảng cáo Facebook theo thời gian thực. Thiết kế "War Room" hỗ trợ theo dõi đồng thời cả hai luồng chiến dịch phổ biến: **Chạy chuyển đổi Landing Page** và **Chạy tin nhắn (Messenger)**. Hệ thống tối ưu hóa cho việc ra quyết định nhanh chóng thông qua cảnh báo (alerts) và phân tích dữ liệu đa kênh.

## 🎯 Mục tiêu kinh doanh
- Giảm thời gian phản ứng với các chiến dịch kém hiệu quả (từ vài giờ xuống tính bằng phút).
- Tăng hiệu suất ngân sách bằng cách scale kịp thời các chiến dịch đang win.
- Cung cấp một nguồn sự thật duy nhất (Single Source of Truth) đo lường chính xác cả phễu Website và phễu Chat.

## 👤 User Stories
- **As a** Media Buyer, **I want to** xem các chỉ số theo mô hình phễu Website (Drop-off, Time on Site, CVR) và phễu Messenger (Reply Rate, Phone Rate) **so that** tôi có thể biết ngay vấn đề nằm ở nội dung Ads, trang đích, hay do kịch bản chốt sale (telesale/chat).
- **As a** Media Buyer, **I want to** nhận được cảnh báo (Alerts) khi chiến dịch có dấu hiệu bất thường (vd: chi phí trên 1 tin nhắn/CPL tăng > 30%) **so that** tôi có thể can thiệp kịp thời tránh lãng phí ngân sách.
- **As a** Performance Manager, **I want to** theo dõi tiến độ tiêu tiền (Budget Pacing) và ROAS tổng **so that** tôi đảm bảo team đang đi đúng hướng KPI của ngày/tuần/tháng.

## 📊 Phân tích chuyên sâu & Chỉ số cốt lõi (Core Metrics)

### 1. Chỉ số tổng quan (High-level Metrics)
- **Spend vs Target Budget:** Tiến độ tiêu tiền trong ngày (Pacing).
- **Revenue / Leads / Purchases:** Kết quả chuyển đổi cốt lõi.
- **ROAS (Return on Ad Spend) / POAS (Profit on Ad Spend):** Đo lường hiệu quả doanh thu và lợi nhuận.
- **CPA, CPC, CPM:** Chi phí trung bình và xu hướng so với ngày hôm trước.

### 2. Phân tích nội dung quảng cáo (Creative Analysis - Dùng chung)
- **Hook Rate:** % người xem 3 giây đầu của video quảng cáo (Đánh giá độ thu hút ban đầu).
- **Hold Rate:** % người xem đến 25%, 50%, 100% video (Đánh giá khả năng giữ chân).
- **Outbound CTR:** Tỷ lệ click chuột thoát ra trang đích hoặc mở hộp thoại tin nhắn.

### 3. Phân tích Phễu Website (Landing Page Funnel)
- **Drop-off Rate (Tỷ lệ thoát trang):** (Link Clicks - Landing Page Views) / Link Clicks. (Đánh giá tốc độ tải trang).
- **Time on Site:** Thời gian trung bình người dùng ở lại xem web (Đo lường mức độ quan tâm thực sự đối với nội dung/sản phẩm).
- **CVR (Conversion Rate trên traffic):** Tỷ lệ chuyển đổi từ số người xem trang (Landing Page Views -> Purchases/Leads).
- **Heatmap (Bản đồ nhiệt):** Tích hợp dữ liệu (từ Clarity/Hotjar) hiển thị vị trí người dùng click/scroll nhiều nhất trên trang đích.

### 4. Phân tích Phễu Tin Nhắn (Messenger Funnel)
- **Messaging Conversations Started:** Số lượng hộp thoại tin nhắn mới bắt đầu thực tế.
- **Cost per Message (CPM/CPL):** Chi phí trung bình để có 1 tin nhắn mới.
- **Message Reply Rate:** Tỷ lệ khách hàng phản hồi (nhắn tin lại) sau khi nhận được tin nhắn tự động chào hỏi của Page (Đánh giá chất lượng của tập khách hàng click vào).
- **Phone Number / Lead Rate:** Tỷ lệ xin được số điện thoại thành công trên tổng số tin nhắn mới (Đo lường hiệu quả kịch bản chốt sale của đội trực page).

## ✅ Tiêu chí chấp nhận (Acceptance Criteria)
- [ ] **Giao diện & Trải nghiệm (UI/UX):** Giao diện Light/Dark Mode linh hoạt, phân tách rõ ràng khu vực theo dõi chỉ số Landing Page và Messenger.
- [ ] **Dữ liệu tức thời (Near Real-time):** Dữ liệu được đồng bộ và làm mới tự động (vd: mỗi 15-30 phút).
- [ ] **Bảng điều khiển chiến dịch (DataGrid):** Bảng dữ liệu có cột "Mục tiêu (Objective)" để phân loại chiến dịch Web vs Mess. Hỗ trợ drill-down (Campaign -> Ad Set -> Ad).
- [ ] **Hệ thống Cảnh báo (Rule-based Alerts):** Hiển thị cảnh báo trực quan khi vi phạm rule. Ví dụ: *Cost per Message > $5* hoặc *Time on site < 10s*.

## 🛠️ Kỹ thuật
- **Frontend Components:** Thiết kế bố cục dạng khối cho từng phễu (Web Funnel Block, Mess Funnel Block).
- **API Integration:**
  - Facebook Graph API (Insights Edge) để kéo dữ liệu Ads (Conversations started, Cost per message).
  - Tích hợp webhook/API từ hệ thống quản lý Fanpage (Pancake, Haravan, Sapo...) để đo lường *Message Reply Rate* và *Phone Number Rate*.
  - Tích hợp API của tool Heatmap/Analytics để kéo *Time on site*.
- **Backend & Database:** Caching Layer (Redis) để lưu trữ tạm thời dữ liệu realtime.

## 📝 Ghi chú
- Vì kết hợp dữ liệu từ nhiều nguồn (Facebook Ads, Web Analytics, Chatbot/Page Management System), backend cần một Data Aggregation Layer vững chắc để map ID của chiến dịch Ads với dữ liệu chat/web tương ứng.
