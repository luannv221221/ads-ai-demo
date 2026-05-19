# KẾ HOẠCH THỰC THI: PHÂN TÍCH ĐỐI THỦ CHUYÊN SÂU & BỘ TẠO QUẢNG CÁO PHẢN ĐÒN AI

> **Liên kết Đặc tả (Spec Reference):** [docs/superpowers/specs/2026-05-18-competitor-analysis-enhancements-design.md](file:///c:/Users/admin/Desktop/Ads-Manager/docs/superpowers/specs/2026-05-18-competitor-analysis-enhancements-design.md)  
> **Trạng thái:** 🔴 IN PROGRESS (Đang thực hiện)  
> **Nhánh Git (Git Branch):** `feature/competitor-intelligence`  

---

## 🗺️ TỔNG QUAN KẾ HOẠCH
Kế hoạch này triển khai các nâng cấp giao diện tương tác cao cấp cho chức năng Phân tích Đối thủ. Chúng ta sẽ tiến hành sửa đổi lần lượt từ tầng Server Actions (logic backend), CSS (phong cách hiển thị) và cuối cùng là Page (giao diện người dùng) theo đúng nguyên lý lập trình surgical & an toàn.

---

## 📝 BẢNG THEO DÕI TIẾN ĐỘ (TASK CHECKLIST)

### 🚀 Giai đoạn 1: Tầng Server Actions (Backend Logic)
- [ ] **Task 1.1:** Thêm Server Action `generateCounterAdAction` trong [creative.ts](file:///c:/Users/admin/Desktop/Ads-Manager/src/app/actions/creative.ts). Action này sẽ gọi Gemini AI hoặc kích hoạt bộ fallback ngôn ngữ tự động (tiếng Việt) để sinh bài viết phản đòn sắc bén.  
  * *Bằng chứng đạt:* File compile thành công không có lỗi TypeScript.

### 🎨 Giai đoạn 2: Tầng CSS (Styling & Animations)
- [ ] **Task 2.1:** Cập nhật [creative.module.css](file:///c:/Users/admin/Desktop/Ads-Manager/src/app/creative/creative.module.css) để bổ sung các style:
  * Facebook Post Feed Mockup (Header, Avatar tròn, Sponsored text, Like/Comment/Share bar).
  * Modal overlays & card layouts (với hiệu ứng blur mượt mà).
  * Layout Side-by-Side cho chức năng Counter-Ad (Phản đòn).
  * Drawer slide-in & micro-animations.  
  * *Bằng chứng đạt:* Build CSS thành công.

### 💻 Giai đoạn 3: Tầng Frontend (Page UI Components)
- [ ] **Task 3.1:** Khai báo các State mới trong `CreativePage` trong [page.tsx](file:///c:/Users/admin/Desktop/Ads-Manager/src/app/creative/page.tsx):
  * `selectedAd`: Lưu thông tin quảng cáo đối thủ được chọn để xem chi tiết.
  * `counterAd`: Lưu thông tin bài viết phản đòn được tạo từ AI.
  * `isGeneratingCounterAd`: Quản lý trạng thái loading của AI Counter-Ad.
- [ ] **Task 3.2:** Viết hàm xử lý `handleGenerateCounterAd` kích hoạt Server Action và hiển thị kết quả.
- [ ] **Task 3.3:** Triển khai Component **Facebook Ad Mockup Modal**:
  * Khi click vào một Ad Card bất kỳ -> Mở Modal.
  * Render giao diện Facebook Post tuyệt đẹp và chân thực.
  * Hiển thị bảng Phân tích Chiến thuật của AI ở bên dưới/bên cạnh.
- [ ] **Task 3.4:** Triển khai **Counter-Ad Panel (Side-by-Side)**:
  * Hiển thị ngay dưới phần Góc Tiếp Cận Mới.
  * Cho phép so sánh trực diện: Bài viết gốc của đối thủ vs Bài viết phản đòn vượt trội của bạn.
  * Tích hợp nút Sao chép & Lưu trữ nhanh.  
  * *Bằng chứng đạt:* Next.js hot reload thành công, không có lỗi runtime.

### 🏁 Giai đoạn 4: Kiểm tra & Dọn dẹp
- [ ] **Task 4.1:** Chạy linter toàn cục (`npm run lint`) và kiểm tra build (`npm run build`).
- [ ] **Task 4.2:** Quay video demo/chụp ảnh màn hình các tính năng tương tác mới và báo cáo kết quả.
