# HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN MATHMASTER THCS TRÊN WINDOWS (PHIÊN BẢN NÂNG CẤP v3.0)

Tài liệu này hướng dẫn bạn từng bước từ con số 0 trên máy tính **Windows 10 / Windows 11**. Bạn không cần tự cài đặt máy chủ cơ sở dữ liệu phức tạp hay tự viết thêm bất kỳ đoạn mã nào.

---

## BƯỚC 1: Cài đặt 2 công cụ cơ bản trên Windows

1. **Cài đặt Node.js (Bản 20 LTS):**
   - Truy cập trang chủ: [https://nodejs.org/](https://nodejs.org/)
   - Nhấn nút tải bản **LTS (Long Term Support)** dành cho Windows (`.msi`).
   - Mở file vừa tải, nhấn **Next** liên tục cho đến khi hoàn tất (**Finish**).
   - **Kiểm tra:** Nhấn phím `Windows`, gõ `PowerShell` rồi mở **Windows PowerShell**. Gõ lệnh sau và nhấn Enter:
     ```powershell
     node -v
     npm -v
     ```
     Nếu hiện ra số phiên bản (ví dụ `v20.x.x` và `10.x.x`) là bạn đã cài thành công!

2. **Cài đặt Visual Studio Code (Trình mở thư mục dự án - Khuyến nghị):**
   - Tải tại: [https://code.visualstudio.com/](https://code.visualstudio.com/) và cài đặt bình thường.

---

## BƯỚC 2: Giải nén dự án và mở Terminal

1. Giải nén thư mục dự án ra một vị trí dễ nhớ, ví dụ: `D:\mathmaster-thcs`.
2. Mở **VS Code**, chọn menu **File -> Open Folder...** và chọn thư mục `mathmaster-thcs` (thư mục bên trong có chứa trực tiếp file `package.json`).
3. Trên thanh menu của VS Code, chọn **Terminal -> New Terminal** (hoặc nhấn tổ hợp phím `` Ctrl + ` ``).

---

## BƯỚC 3: Lấy đường dẫn PostgreSQL miễn phí trên mây (Tùy chọn — có sẵn chế độ Local JSON dự phòng)

Thay vì phải tự cài đặt và cấu hình máy chủ PostgreSQL nặng nề trên Windows, bạn có thể dùng dịch vụ PostgreSQL được quản lý miễn phí **Neon.tech** (chỉ mất 1 phút):

1. Truy cập [https://neon.tech](https://neon.tech) và đăng nhập nhanh bằng tài khoản Google hoặc GitHub.
2. Nhấn **Create a project**, đặt tên là `mathmaster-thcs`, chọn khu vực Singapore (`AWS Asia Pacific (Singapore)`) rồi nhấn **Create project**.
3. Ngay trên màn hình **Dashboard** của Neon, bạn sẽ thấy ô **Connection string** có dạng:
   ```text
   postgresql://neondb_owner:AbCdEf123456@ep-cool-math-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Nhấn nút **Copy** để sao chép chuỗi kết nối này.

---

## BƯỚC 4: Cấu hình file môi trường `.env`

1. Trong cửa sổ Terminal tại thư mục `mathmaster-thcs`, chạy lệnh sau để tạo file `.env` từ file mẫu `.env.example`:
   ```powershell
   copy .env.example .env
   ```
2. Mở file `.env` vừa được tạo ra trong VS Code và kiểm tra các biến quan trọng:
   - **`DATABASE_URL`**: Dán chuỗi kết nối PostgreSQL ở Bước 3 (nếu chưa có, hệ thống sẽ tự động lưu vào `.data/local_db_state.json`).
   - **`AUTH_SECRET`**: Khóa bí mật ký JWT tối thiểu **32 ký tự** (Bắt buộc trong môi trường `production`). Bạn có thể sinh khóa ngẫu nhiên bằng lệnh:
     ```powershell
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - **`MAX_SESSIONS_PER_USER`**: Số thiết bị tối đa được phép đăng nhập đồng thời trên mỗi tài khoản (mặc định: `5`).
   - **`UPLOAD_STORAGE_DRIVER="local"`**: Khi upload tài liệu trên web, file sẽ được lưu thẳng vào thư mục `public/uploads/` ngay trong máy của bạn.
   - **`GEMINI_API_KEY` và `MATHPIX_APP_KEY`**: Các biến **TÙY CHỌN** (không bắt buộc). Khi để trống, toàn bộ các chức năng cốt lõi (Tạo đề theo ma trận 4 mức độ nhận thức, Làm bài, Chấm điểm Toán tương đương & chấm từng bước tự luận, Ôn tập SM-2, Quản lý Lớp học, Tải file `.TXT`/`.MD`/`.CSV`) vẫn hoạt động **100%**.
3. Nhấn `Ctrl + S` để lưu file `.env`.

---

## BƯỚC 5: Cài đặt thư viện, Chạy Migration & Nạp dữ liệu mẫu (333 câu hỏi)

Chạy lần lượt các lệnh sau trong cửa sổ Terminal:

```powershell
# 1. Cài đặt các gói thư viện Next.js, React, Prisma, Tailwind, KaTeX, Chart.js
npm install

# 2. Sinh mã Prisma Client tương thích với schema (29 bảng)
npx prisma generate

# 3. Đẩy file migration thực tế lên PostgreSQL (nếu dùng PostgreSQL)
npx prisma migrate deploy

# 4. Nạp dữ liệu mẫu (Lớp 6, 7, 8, 9 + 3 bộ SGK + 333 câu hỏi + 4 tài khoản mẫu)
npm run db:seed
```

### Danh sách Tài khoản Mẫu sau khi chạy `npm run db:seed`:
| Vai trò | Họ và tên | Email / Tên đăng nhập | Mật khẩu mặc định |
| :--- | :--- | :--- | :--- |
| **Học sinh Lớp 8** | Nguyễn Minh Anh | `minhanh.thcs@mathmaster.edu.vn` (`minhanh_lop8`) | `pass123` |
| **Học sinh Lớp 9** | Trần Hoàng Nam | `hoangnam.thcs@mathmaster.edu.vn` (`hoangnam_lop9`) | `pass123` |
| **Giáo viên Toán** | Cô Lê Thị Mai Hương | `giaovien.thcs@mathmaster.edu.vn` (`gv_toanthcs`) | `Teacher123` |
| **Quản trị viên** | Ban Quản Trị MathMaster | `admin.thcs@mathmaster.edu.vn` (`admin_mathmaster`) | `Admin12345` |

---

## BƯỚC 6: Kiểm toán Ngân hàng Câu hỏi, Kiểm thử Tự động & Khởi động Website

1. **Chạy công cụ kiểm toán ngân hàng câu hỏi (333 câu, 4.062 công thức KaTeX):**
   ```powershell
   npm run bank:audit
   ```
2. **Chạy kịch bản 14 bài kiểm thử tự động toàn diện:**
   ```powershell
   npm run test
   ```
   Bạn sẽ thấy thông báo: `🎉 TẤT CẢ 14 BÀI KIỂM THỬ TỰ ĐỘNG ĐỀU ĐẠT (14/14 PASS)!`.

3. **Khởi động máy chủ Website:**
   ```powershell
   npm run dev
   ```
4. Mở trình duyệt (Chrome / Edge) và truy cập địa chỉ:
   👉 **[http://localhost:3000](http://localhost:3000)**

---

## BƯỚC 7: Danh sách các Tuyến Trang (Next.js App Router) để Trải nghiệm

Sau khi mở `http://localhost:3000`, bạn có thể kiểm tra trực tiếp các trang chức năng:

1. **Đăng nhập & Đăng ký (`/login`, `/register`):**
   - Đăng nhập nhanh bằng các nút chọn tài khoản mẫu (Học sinh / Giáo viên / Quản trị viên) hoặc tự đăng ký tài khoản mới.
2. **Tổng quan & Biểu đồ Năng lực (`/dashboard`):**
   - Xem biểu đồ xu hướng điểm số 10 đề gần nhất và biểu đồ độ thành thạo từng chương (Chart.js cục bộ).
   - Xem cảnh báo 2 chương yếu nhất và bấm tạo ngay đề **"Luyện điểm yếu"**.
3. **Trình Tạo Đề 3 Bước theo Ma trận 4 Mức độ (`/exams/new`):**
   - Bước 1: Chọn Khối lớp (6–9), Bộ sách (`KNTT`, `CD`, `CTST`), Học kỳ và các Chương muốn kiểm tra.
   - Bước 2: Chọn Preset ma trận (**Cơ bản**, **Tiêu chuẩn**, **Nâng cao**, **Thi vào 10**) hoặc kéo thanh trượt tùy chỉnh tỷ lệ `% Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao` kèm hiển thị số câu khả dụng trong ngân hàng theo thời gian thực.
   - Bước 3: Xem trước cấu trúc đề và bắt đầu làm bài.
4. **Phòng Làm Bài Thi Tập Trung & Xuất Đề In A4 (`/exams/[id]`):**
   - Làm bài với đồng hồ đếm ngược, bảng màu câu hỏi, chỉ báo tự động lưu (`Đã lưu lúc HH:MM:SS`), bàn phím ký hiệu Toán học ($\sqrt{x}, x^2, \frac{a}{b}, \pi, \leq, \geq, \neq$) và nút **In đề PDF / In kèm đáp án** chuẩn khổ A4.
5. **Kết Quả Chấm Điểm Từng Bước (`/exams/[id]/result`):**
   - Xem điểm số theo từng mức độ nhận thức, bảng chấm điểm từng phần (`rubricSteps`) cho câu tự luận, phân loại lỗi sai và lời giải KaTeX.
6. **Luyện Tập Từng Chương (`/practice`) & Sổ Tay Lỗi Sai SM-2 (`/review`):**
   - Luyện từng câu không giới hạn thời gian với gợi ý 3 bước; ôn tập câu sai theo lịch lặp lại ngắt quãng SM-2 hoặc tạo **Mini-Đề ôn câu sai**.
7. **Không Gian Giáo Viên (`/teacher`) & Quản Trị Ngân Hàng Câu Hỏi (`/admin/questions`):**
   - Tạo lớp học có mã tham gia 6 ký tự (`joinCode`), giao đề thi cho lớp, xem bảng điểm và Top 5 câu học sinh sai nhiều nhất.
   - Duyệt câu hỏi từ `draft` $\rightarrow$ `verified`, kiểm tra độ khó thực nghiệm (`empiricalDifficulty`) và nhập/xuất JSON.
8. **Quản Lý Thiết Bị Đăng Nhập (`/settings/devices`):**
   - Xem danh sách các thiết bị đang đăng nhập và thu hồi phiên từ xa.

---

## BƯỚC 8: HƯỚNG DẪN CHẠY WEB TRÊN NHIỀU MÁY KHÁC (ĐIỆN THOẠI, LAPTOP, MÁY TÍNH KHÁC)

### Cách 1: Chạy trên nhiều máy trong cùng mạng Wi-Fi / Mạng LAN (Gia đình, Phòng học)
1. Trên máy tính chính của bạn, mở Terminal tại thư mục dự án và chạy lệnh:
   ```powershell
   npm run dev:lan
   ```
2. Nhìn vào cửa sổ Terminal, hệ thống sẽ tự động in ra địa chỉ IPv4 Wi-Fi/LAN của máy bạn (ví dụ `http://192.168.1.15:3000`).
3. Mở trình duyệt trên điện thoại hoặc laptop khác cùng mạng Wi-Fi để đăng nhập tài khoản riêng của từng học sinh (phiên đăng nhập của từng thiết bị được cô lập hoàn toàn).
4. **Nếu máy khác không vào được do Tường lửa Windows (Windows Firewall):**
   Mở **Windows PowerShell (Run as Administrator)** trên máy chính và chạy lệnh:
   ```powershell
   netsh advfirewall firewall add rule name="MathMaster THCS Port 3000" dir=in action=allow protocol=TCP localport=3000
   ```
