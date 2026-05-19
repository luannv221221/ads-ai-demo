# KẾ HOẠCH THỰC THI: [TÊN TÍNH NĂNG / TASK]

> **Liên kết Đặc tả (Spec Reference):** [docs/superpowers/specs/YYYY-MM-DD-<ten-spec>.md](file:///c:/Users/admin/Desktop/Ads-Manager/docs/superpowers/specs/YYYY-MM-DD-<ten-spec>.md)  
> **Trạng thái:** 🔴 IN PROGRESS (Đang thực hiện) / 🟢 COMPLETED (Đã hoàn thành)  
> **Nhánh Git (Git Branch):** `feature/<ten-branch>`  

---

## 🗺️ TỔNG QUAN KẾ HOẠCH
*Bản kế hoạch này chia nhỏ công việc thành các bước cực kỳ nhỏ (2-5 phút thực hiện). Chúng ta tuân thủ triệt để nguyên lý: **Viết test trước -> Chạy lỗi (Red) -> Viết code tối thiểu (Green) -> Tối ưu hóa (Refactor) -> Commit**.*

---

## 📝 BẢNG THEO DÕI TIẾN ĐỘ (TASK CHECKLIST)

### 🚀 Giai đoạn 1: Thiết lập & Viết Test lỗi ban đầu (Red Phase)
- [ ] **Task 1.1:** Tạo file test mẫu kiểm tra chức năng cốt lõi.  
  * *Đường dẫn:* `src/tests/...`  
  * *Bằng chứng đạt:* Chạy lệnh test báo **FAIL** rõ ràng.
- [ ] **Task 1.2:** Thiết lập các cấu trúc kiểu (Types/Interfaces) cơ bản nếu cần.  
  * *Đường dẫn:* `src/types/...`

### 🟢 Giai đoạn 2: Phát triển Core Logic từng bước (Green & Refactor)
- [ ] **Task 2.1:** Viết code tối thiểu để pass test case đầu tiên.  
  * *Đường dẫn:* `src/components/...`  
  * *Bằng chứng đạt:* Test suite báo **PASS** xanh.
- [ ] **Task 2.2:** Tối ưu hóa (Refactor) cấu trúc code của Task 2.1 và đảm bảo test vẫn PASS.
- [ ] **Task 2.3:** Viết test lỗi cho trường hợp biên 1 (ví dụ: lỗi validation).  
  * *Bằng chứng đạt:* Test suite báo **FAIL** tại test case mới.
- [ ] **Task 2.4:** Code xử lý lỗi validation để pass test case đó.  
  * *Bằng chứng đạt:* Toàn bộ test suite **PASS** xanh.

### 🏁 Giai đoạn 3: Kiểm tra cuối & Dọn dẹp (Integration Phase)
- [ ] **Task 3.1:** Chạy linter toàn cục để định dạng lại code sạch sẽ.  
  * *Lệnh:* `npm run lint`
- [ ] **Task 3.2:** Chạy build kiểm tra biên dịch dự án.  
  * *Lệnh:* `npm run build`
- [ ] **Task 3.3:** Xóa bỏ code nháp, console.log thừa, dọn dẹp worktree và đẩy Pull Request.

---

## 🔍 CHI TIẾT TỪNG TASK THỰC THI

### 📍 Task 1.1: Tạo file test lỗi ban đầu
* **File cần tạo/sửa:** `src/components/MyComponent.test.tsx`
* **Đoạn test mẫu mong muốn:**
  ```typescript
  import { render, screen } from '@testing-library/react';
  import MyComponent from './MyComponent';

  describe('MyComponent', () => {
    it('nên hiển thị tiêu đề chính xác', () => {
      render(<MyComponent title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });
  });
  ```
* **Lệnh chạy kiểm thử:** `npm run test` (hoặc lệnh tương đương)
* **Kết quả mong đợi:** Test chạy và lỗi (`FAIL`) do `MyComponent` chưa được tạo hoặc chưa có logic hiển thị tiêu đề.

---

### 📍 Task 2.1: Viết code tối thiểu để pass test
* **File cần tạo/sửa:** `src/components/MyComponent.tsx`
* **Đoạn code logic tối thiểu:**
  ```typescript
  export default function MyComponent({ title }: { title: string }) {
    return (
      <div>
        <h1>{title}</h1>
      </div>
    );
  }
  ```
* **Lệnh chạy kiểm thử:** `npm run test`
* **Kết quả mong đợi:** Test chạy thành công và báo xanh (`PASS`).
