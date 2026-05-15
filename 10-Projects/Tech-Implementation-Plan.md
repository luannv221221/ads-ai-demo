# Kế Hoạch Triển Khai Kỹ Thuật: Ads Manager (Facebook First)

Tài liệu này xác định bộ công nghệ và lộ trình phát triển chi tiết cho hệ thống Ads Manager, tập trung tối ưu hóa dữ liệu từ Facebook Ads trước khi mở rộng sang các nền tảng khác.

## 1. Bộ Công Nghệ Đề Xuất (Tech Stack)

| Lớp (Layer) | Công nghệ | Lý do chọn |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14+ (App Router) | Tốc độ load trang cực nhanh, tối ưu cho ứng dụng quản lý dữ liệu lớn. |
| **Styling** | CSS Modules (Premium UI) | Đảm bảo giao diện đồng bộ, cao cấp và không bị giới hạn bởi component-library. |
| **State Management** | Zustand | Nhẹ, nhanh, phù hợp để quản lý trạng thái dữ liệu Ads thay đổi liên tục. |
| **Database** | Supabase (PostgreSQL) | Lưu trữ dữ liệu campaign bền vững, hỗ trợ Real-time Dashboard. |
| **Backend** | Next.js API Routes | Xử lý logic phía server, bảo mật API Key của Facebook. |
| **AI Insights** | Gemini 1.5 Pro | Phân tích hàng ngàn dòng dữ liệu để đưa ra nhận xét chiến thuật. |
| **SDK Chính** | Facebook Business SDK | Kết nối chính thống và ổn định với Meta Marketing API. |

## 2. Luồng Dữ Liệu (Data Flow)
1. **Fetch:** Hệ thống định kỳ kéo dữ liệu từ Facebook API (Spent, Reach, Conv, CPM, CPA...).
2. **Store:** Dữ liệu được chuẩn hóa và lưu vào Supabase.
3. **Analyze:** Gemini quét dữ liệu trong Database để tìm ra các Ad Set đang "đốt tiền" hoặc "thắng lớn".
4. **Present:** Dashboard Real-time cập nhật số liệu và các cảnh báo AI lên giao diện cho Media Buyer.

## 3. Lộ Trình Triển Khai (Phased Roadmap)

### Giai đoạn 1: Infrastructure & Meta Link (Tuần 1)
- [ ] Khởi tạo Boilerplate Next.js và cấu hình biến môi trường (ENV) cho Facebook API.
- [ ] Thiết lập Database Schema trên Supabase (Bảng: `fb_campaigns`, `fb_adsets`, `fb_ads`, `daily_insights`).
- [ ] Viết Module kết nối Meta Marketing API: Lấy danh sách tài khoản quảng cáo (Ad Accounts).

### Giai đoạn 2: Module Chiến Dịch (Tuần 2)
- [ ] Triển khai DataGrid cho module Campaign: Đổ dữ liệu thật từ Facebook vào bảng.
- [ ] Tính năng Side Panel: Khi click vào một Camp, hệ thống sẽ query dữ liệu breakdown theo ngày từ API.
- [ ] Tích hợp bộ lọc thời gian và bộ lọc trạng thái hiệu suất.

### Giai đoạn 3: Dashboard War Room & AI Alerts (Tuần 3)
- [ ] Xây dựng 4 phễu đo lường trên Dashboard bằng dữ liệu thực tế.
- [ ] **AI Engine:** Viết Prompt chuyên sâu cho Gemini để phân tích dữ liệu Facebook và đẩy vào khối "Nhận xét AI".
- [ ] Hệ thống Cảnh báo tự động: Tự động bắn thông báo khi CPA Facebook vượt ngưỡng cho phép.

### Giai đoạn 4: Creative & AI Insights (Tuần 4)
- [ ] Module Phân tích Video: Lấy dữ liệu 3s Video View (Hook) và 100% Video View (Hold) từ Meta.
- [ ] AI đề xuất hướng chỉnh sửa Creative dựa trên chỉ số kỹ thuật.
- [ ] Kiểm thử toàn diện và bàn giao bản Beta.

---
**Ghi chú:** Chúng ta sẽ bắt đầu thực hiện Giai đoạn 1 ngay sau khi anh xác nhận tài liệu này.
