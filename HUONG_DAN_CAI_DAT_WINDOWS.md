# HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN MATHMASTER THCS TRÊN WINDOWS (DÀNH CHO NGƯỜI MỚI)

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

1. Giải nén file `mathmaster_thcs_fullstack_package.zip` ra một thư mục dễ nhớ, ví dụ: `D:\mathmaster-thcs`.
2. Mở **VS Code**, chọn menu **File -> Open Folder...** và chọn thư mục `mathmaster-thcs` (thư mục bên trong có chứa trực tiếp file `package.json`).
3. Trên thanh menu của VS Code, chọn **Terminal -> New Terminal** (hoặc nhấn tổ hợp phím `` Ctrl + ` ``).

---

## BƯỚC 3: Lấy đường dẫn PostgreSQL miễn phí trên mây (Không cần cài PostgreSQL vào máy)

Thay vì phải tự cài đặt và cấu hình máy chủ PostgreSQL nặng nề trên Windows, bạn nên dùng dịch vụ PostgreSQL được quản lý miễn phí **Neon.tech** (chỉ mất 1 phút):

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
2. Mở file `.env` vừa được tạo ra trong VS Code.
3. Thay thế giá trị của dòng `DATABASE_URL=` bằng chuỗi kết nối bạn vừa copy ở Bước 3:
   ```env
   DATABASE_URL="postgresql://neondb_owner:AbCdEf123456@ep-cool-math-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```
4. **Về lưu trữ file (`UPLOAD_STORAGE_DRIVER`):** Giữ nguyên `UPLOAD_STORAGE_DRIVER="local"`. Khi bạn upload tài liệu trên web, file sẽ được lưu thẳng vào thư mục `public/uploads/` ngay trong máy của bạn, không cần cài đặt S3 hay máy chủ lưu trữ riêng!
5. **Về API Key AI (`GEMINI_API_KEY` và `MATHPIX_APP_KEY`):**
   - Đây là các biến **TÙY CHỌN** (không bắt buộc). Bạn có thể để trống `GEMINI_API_KEY=""`.
   - Khi để trống, toàn bộ các chức năng cốt lõi (Tạo đề theo ma trận, Làm bài, Chấm điểm Toán tương đương, Lưu lịch sử, Khôi phục bài thi dở dang, Tải file `.TXT`/`.MD`/`.CSV` để tách câu hỏi) vẫn hoạt động **100%**.
   - Nếu bạn bấm vào tính năng cần AI (như đọc OCR từ file PDF scan/ảnh chụp), hệ thống sẽ hiển thị thông báo rõ ràng là chưa cấu hình API Key chứ không giả lập kết quả.
6. Nhấn `Ctrl + S` để lưu file `.env`.

---

## BƯỚC 5: Cài đặt thư viện, Chạy Migration & Nạp dữ liệu mẫu

Chạy lần lượt 4 lệnh sau trong cửa sổ Terminal:

```powershell
# 1. Cài đặt các gói thư viện Next.js, React, Prisma (mất khoảng 1 - 2 phút)
npm install

# 2. Sinh mã Prisma Client tương thích với schema
npx prisma generate

# 3. Đẩy file migration thực tế lên PostgreSQL để tạo đủ 23 bảng dữ liệu
npx prisma migrate deploy

# 4. Chạy script nạp dữ liệu mẫu (Lớp 6, 7, 8, 9 + 3 bộ SGK + 36 câu hỏi + 5 đề thi mẫu)
npm run db:seed
```

> **Lưu ý hữu ích:** Ngay cả khi bạn chưa kịp điền `DATABASE_URL` ở Bước 3, lệnh `npm run db:seed` vẫn sẽ tự động tạo file cơ sở dữ liệu cục bộ `.data/local_db_state.json` để bạn có thể chạy thử website ở Bước 6 ngay lập tức mà không bị báo lỗi dừng chương trình!

---

## BƯỚC 6: Kiểm thử tự động và Khởi động Website

1. **Chạy kịch bản kiểm thử tự động các luồng nghiệp vụ:**
   ```powershell
   npm run test
   ```
   Bạn sẽ thấy thông báo `🎉 TẤT CẢ 6 BÀI KIỂM THỬ TỰ ĐỘNG ĐỀU ĐẠT (6/6 PASS)!`.

2. **Khởi động máy chủ Website:**
   ```powershell
   npm run dev
   ```
3. Mở trình duyệt (Chrome / Edge) và truy cập địa chỉ:
   👉 **[http://localhost:3000](http://localhost:3000)**

---

## BƯỚC 7: Danh sách Kiểm tra Chức năng Thực tế trên Trình duyệt

Sau khi mở `http://localhost:3000`, bạn có thể kiểm tra từng luồng chức năng sau:

1. **Kiểm tra Khôi phục bài thi đang làm dở (Luồng Resume):**
   - Ngay tại trang **Tổng quan**, bạn sẽ thấy thẻ màu vàng: *"Đang làm dở — Đề Kiểm Tra Giữa Học Kì I - Toán 8 (Đã trả lời 3/7 câu)"*.
   - Nhấn nút **"▶ Tiếp tục bài thi chưa hoàn thành"** -> Hệ thống mở lại đúng phòng thi với 3 câu đã chọn sẵn và đồng hồ đếm ngược tiếp tục chạy.
2. **Kiểm tra Chấm điểm Toán học tương đương & Lưu lịch sử (Luồng Grading & History):**
   - Trong phòng thi, chuyển tới Câu 6 (Tự luận rút gọn phân thức, đáp án chuẩn là `2/5`) -> Nhập `0,4` hoặc `2/5`.
   - Nhấn **"✓ Nộp bài & Chấm điểm"** -> Hệ thống chấm điểm tự động ngay lập tức, công nhận `0,4 = 2/5`, lưu bài thi vào mục **Lịch sử làm bài** và đưa câu làm sai vào mục **Ôn tập kiến thức yếu**.
3. **Kiểm tra Tạo đề thi mới theo Ma trận (Luồng Exam Generator):**
   - Vào menu **Tạo đề thi** -> Chọn `Lớp 9`, bộ sách `Cánh Diều`, loại đề `Đề thi thử vào lớp 10` -> Nhấn **"🚀 Tạo đề & Làm bài ngay"**.
4. **Kiểm tra Upload Tài liệu khi chưa có API Key (Luồng Document Upload):**
   - Vào menu **Tài liệu của tôi**:
     - Nhấn **"📄 Nạp thử file Đề cương (.TXT)"** (hoặc tải lên một file `.txt`/`.md` từ máy tính) -> Hệ thống đọc và tách câu hỏi trực tiếp **không cần AI**.
     - Nhấn **"📕 Nạp thử file Đề thi (.PDF)"** (hoặc tải lên file `.pdf`/`.png` khi chưa điền `GEMINI_API_KEY`) -> Hệ thống hiển thị thông báo rõ ràng rằng chức năng OCR file PDF/Ảnh cần cấu hình API Key trong `.env`, tuyệt đối **không giả lập câu hỏi thành công**.
5. **Kiểm tra Trạng thái Kết nối Backend:**
   - Vào menu **Cài đặt** -> Kéo xuống mục **"3. Trạng thái Kết nối Backend Next.js, PostgreSQL & AI API"** -> Nhấn nút **"🔌 Kiểm tra Kết nối Backend (/api/health)"**.


---

## BƯỚC 8: HƯỚNG DẪN CHẠY WEB TRÊN NHIỀU MÁY KHÁC (ĐIỆN THOẠI, LAPTOP, MÁY TÍNH KHÁC)

Có **3 cách** từ dễ nhất đến chuyên nghiệp nhất tùy theo nhu cầu của bạn:

### Cách 1: Chạy trên nhiều máy trong cùng mạng Wi-Fi / Mạng LAN (Gia đình, Phòng học)
1. Trên máy tính chính của bạn, mở Terminal tại thư mục dự án và chạy lệnh:
   ```powershell
   npm run dev:lan
   ```
   *(Hoặc `npm run dev` — dự án đã được cấu hình sẵn `-H 0.0.0.0 -p 3000` để mở kết nối cho mạng LAN).*
2. Nhìn vào cửa sổ Terminal, hệ thống sẽ tự động in ra địa chỉ IPv4 Wi-Fi/LAN của máy bạn, ví dụ:
   ```text
   👉 Trên các máy tính, laptop, điện thoại khác CÙNG MẠNG WI-FI / LAN, hãy mở:
      • http://192.168.1.15:3000   (Wi-Fi)
   ```
3. Mở trình duyệt Chrome/Safari trên máy tính hoặc điện thoại khác (đang bắt chung Wi-Fi) và nhập đúng địa chỉ `http://192.168.1.15:3000` (thay bằng số IP hiện trên máy bạn).
4. **Nếu máy khác không vào được do Tường lửa Windows (Windows Firewall):**
   Mở **Windows PowerShell** bằng quyền Quản trị (**Run as Administrator**) trên máy chính và chạy đúng 1 lệnh sau để cho phép cổng `3000`:
   ```powershell
   netsh advfirewall firewall add rule name="MathMaster THCS Port 3000" dir=in action=allow protocol=TCP localport=3000
   ```

### Cách 2: Chia sẻ nhanh qua Internet cho máy ở mạng khác (Không cùng Wi-Fi)
Nếu bạn đang bật `npm run dev` trên máy mình và muốn gửi link cho bạn bè ở nhà khác truy cập ngay lập tức:
1. Mở thêm 1 cửa sổ Terminal thứ hai trong VS Code.
2. Chạy lệnh tạo đường hầm miễn phí:
   ```powershell
   npx localtunnel --port 3000
   ```
   *(Hoặc dùng Cloudflare Tunnel không cần tài khoản: `npx cloudflared tunnel --url http://localhost:3000`)*
3. Hệ thống sẽ cấp cho bạn 1 đường link công khai dạng `https://....loca.lt` hoặc `https://....trycloudflare.com` để mở trên bất kỳ máy nào có Internet.

### Cách 3: Đưa web lên Internet chạy 24/7 miễn phí (Không cần bật máy tính của bạn)
1. Tạo tài khoản miễn phí tại [github.com](https://github.com) và đẩy thư mục `mathmaster-thcs` lên một Repository.
2. Đăng nhập [vercel.com](https://vercel.com) bằng tài khoản GitHub -> Nhấn **Add New Project** -> Chọn Repository `mathmaster-thcs`.
3. Ở mục **Environment Variables**, thêm biến `DATABASE_URL` (chuỗi PostgreSQL từ Neon.tech) và `AUTH_SECRET`.
4. Nhấn **Deploy**. Sau 1 phút, bạn sẽ có địa chỉ cố định `https://mathmaster-thcs.vercel.app` hoạt động 24/7 trên mọi máy tính, điện thoại và đồng bộ chung 1 cơ sở dữ liệu PostgreSQL!

---

## BƯỚC 9: HƯỚNG DẪN XÓA TÀI KHOẢN KHÔNG CÒN DÙNG

Bạn có thể xóa bất kỳ tài khoản nào không còn sử dụng tại **2 vị trí** trên giao diện:
1. **Cách 1 (Tại hộp thoại Tài khoản trên thanh Header):**
   - Nhấn vào nút tên tài khoản ở góc trên bên phải màn hình.
   - Ở danh sách các tài khoản, nhấn nút màu đỏ **`🗑️ Xóa`** bên cạnh tài khoản bạn muốn xóa.
   - Hộp thoại xác nhận sẽ hiển thị thống kê số lượt làm bài và tài liệu của tài khoản đó -> Nhấn **`🗑️ Xác nhận xóa vĩnh viễn`**.
2. **Cách 2 (Tại trang Cài đặt):**
   - Vào mục **`Cài đặt`** ở thanh menu bên trái -> Nhìn sang khung **`2. Kiểm thử Phân quyền Tài khoản & Mạng`**.
   - Nhấn nút **`🗑️ Xóa`** ở dòng tài khoản không còn dùng và xác nhận.
   - *(Lưu ý an toàn: Nếu bạn xóa chính tài khoản đang đăng nhập, hệ thống sẽ tự động chuyển sang tài khoản còn lại; nếu xóa hết sạch mọi tài khoản, hệ thống tự động khởi tạo một tài khoản Học sinh Mới trống để ứng dụng luôn hoạt động ổn định).*
