# NHIỆM VỤ: SỬA TRANG "TỔNG QUAN" (/dashboard) TẢI CHẬM + THÊM FAVICON

Bối cảnh: dự án MathMaster THCS đã qua một đợt tối ưu tốc độ (xem `PERFORMANCE_REPORT.md`), nhưng khi bấm vào **Tổng quan**, trang hiện "Đang tải bảng điều khiển cá nhân..." rất lâu. Ngoài ra web chưa có favicon.

Nguyên tắc: **ĐO TRƯỚC, SỬA SAU, ĐO LẠI SAU**; chỉ giữ thay đổi nào có số liệu cải thiện. Mọi phép đo phải chạy bằng `npm run build` rồi `npm run start` (không dùng `npm run dev`). Không đổi hành vi, không hạ bảo mật (kiểm tra phiên, phân quyền, cô lập dữ liệu giữa người dùng phải giữ nguyên). Tiếng Việt cho báo cáo và comment.

---

## PHẦN A — NGUYÊN NHÂN NGHI NGỜ (đã đọc code, CHƯA đo — hãy đo để xác nhận)

Trang `src/app/dashboard/page.tsx` là client component, sau khi tải JS mới gọi **3 API song song**: `/api/state?scope=shell`, `/api/analytics`, `/api/exams?limit=6`. Trong lúc chờ cả ba, nó hiển thị **toàn màn hình "Đang tải..."** (`if (loading && !user) return ...`) nên người dùng thấy trang trống rất lâu. Cả ba API đều gọi `requireUser()` → `readServerStateAsync()` trong `src/lib/prisma.ts`. Các điểm nghẽn nghi ngờ, xếp theo mức ảnh hưởng:

1. **Mỗi request đọc lại TOÀN BỘ dữ liệu ứng dụng từ DB.** Khi `DATABASE_URL` được cấu hình, nhánh đọc chạy `SELECT payload FROM mm_cloud_state WHERE id='main'` rồi `JSON.parse` toàn bộ "state" (hàng trăm câu hỏi, hàng nghìn công thức, mọi người dùng, mọi lượt làm bài…) và `normalizeStateObject()` **trên từng request**. Bộ nhớ đệm `cachedServerState` chỉ được dùng ở nhánh đọc file cục bộ, **không dùng ở nhánh DB**. Dashboard gọi 3 API nên tải và parse payload này **3 lần song song**. Nếu DB ở xa (Neon/Supabase) hoặc chạy trên serverless (thư mục `.vercel` cho thấy dự án đã liên kết Vercel) thì mỗi lần đều trả thêm độ trễ mạng.
2. **`normalizeStateObject()` quá nặng cho đường đọc**: duyệt toàn bộ người dùng, gọi `hashPassword()` (scrypt) cho tài khoản còn mật khẩu cũ, nạp lại thư mục `prisma/question_bank`, quét lại toàn bộ câu hỏi và hàng đợi ôn tập. Việc chuẩn hoá này chỉ cần làm **một lần khi nạp** (hoặc khi migrate), không phải mỗi request.
3. **`/api/analytics` có độ phức tạp cao**: với mỗi câu trả lời của mọi bài đã chấm, nó gọi `state.questions.find(...)` (quét tuyến tính). Dữ liệu càng nhiều lượt làm bài thì càng chậm. Nó cũng sắp xếp toàn bộ người dùng để dựng bảng xếp hạng ở mỗi lần tải.
4. **Các index trong migration `20261021150000_perf_indexes` có thể không phát huy tác dụng**, vì đường chạy thực tế dường như lưu dữ liệu trong **một dòng JSONB** (`mm_cloud_state`) thay vì các bảng quan hệ Prisma (`questions`, `sessions`…). Hãy xác nhận bằng cách đếm truy vấn thật sự chạy khi mở dashboard.
5. **Phía giao diện**: không có cache phía client; mỗi lần vào lại Tổng quan phải tải lại từ đầu; thông tin người dùng, thẻ chỉ số, biểu đồ và danh sách đề đều chờ chung một lượt tải.

Nếu số đo cho thấy nguyên nhân khác, hãy bám theo số đo và nói rõ trong báo cáo.

---

## PHẦN B — CÁC BƯỚC THỰC HIỆN (làm liên tục, không dừng giữa chừng)

### Bước 1 — Đo baseline (chưa sửa code)
1. Thêm log thời gian có thể bật/tắt bằng biến môi trường `PERF_LOG=1`: thời gian `readServerStateAsync` (và nó đi nhánh DB hay nhánh file), kích thước payload (KB), thời gian `normalizeStateObject`, thời gian xử lý từng route (`/api/state`, `/api/analytics`, `/api/exams`).
2. Đo luồng thật: đăng nhập → vào `/dashboard`, ở cả **lần đầu (cold)** và **lần thứ hai (warm)**. Ghi: số truy vấn DB, tổng ms của mỗi API, thời điểm hiện thẻ chỉ số, thời điểm hiện biểu đồ. Ghi nhận DB đang là cục bộ hay từ xa và (nếu đã triển khai Vercel) vùng chạy hàm so với vùng DB.
3. Ghi kết quả vào `PERFORMANCE_DASHBOARD.md` (bảng "trước") và xếp hạng nút thắt.

### Bước 2 — Sửa lõi: không đọc lại toàn bộ dữ liệu ở mỗi request
1. **Cache trạng thái trong bộ nhớ tiến trình cho cả nhánh DB**: nạp một lần, dùng lại. Kiểm tra độ tươi bằng truy vấn rất nhẹ (`SELECT updated_at FROM mm_cloud_state WHERE id='main'`) hoặc TTL ngắn (vài giây), chỉ tải lại payload khi `updated_at` đổi. Khi ghi thì cập nhật cache và `updated_at`.
2. **Gộp request đồng thời (single-flight)**: nếu 3 request cùng cần đọc lại state thì chỉ 1 lần tải thực sự, các request còn lại chờ chung kết quả.
3. **Chuẩn hoá một lần**: `normalizeStateObject()` chỉ chạy khi nạp dữ liệu mới từ nguồn (đánh dấu `__normalized`), **tuyệt đối không băm mật khẩu trong đường đọc**. Việc băm lại mật khẩu cũ chuyển sang bước migrate/đăng nhập (đã có cơ chế băm lại khi đăng nhập thành công), và `loadExtraQuestionBankFiles()` chỉ đọc đĩa một lần.
4. **Chỉ mục trong bộ nhớ**: dựng sẵn `Map` theo `id` cho câu hỏi và đề (`getQuestionByIdMap` đã có, hãy dùng thật sự và đảm bảo vô hiệu hoá đúng khi dữ liệu đổi — hiện đang so sánh theo `size`, dễ sai khi sửa nội dung câu mà không đổi số lượng).
5. **Cập nhật `lastActiveAt` của phiên không được gây ghi toàn bộ state** (kiểm tra xem hiện có ghi không; nếu có thì giới hạn tần suất, ví dụ tối đa 1 lần/5 phút/phiên).
6. Nếu sau các bước trên đường đọc vẫn còn chậm do cấu trúc "một khối JSON": **đề xuất** (không tự ý làm) lộ trình chuyển dữ liệu nóng của từng người dùng (lượt làm bài, độ thành thạo chủ đề, hàng đợi ôn tập, phiên đăng nhập) sang các bảng quan hệ Prisma sẵn có và tận dụng các index đã tạo. Viết rõ phạm vi, rủi ro, cách migrate không mất dữ liệu và chờ tôi duyệt.

### Bước 3 — API riêng cho dashboard
1. Tạo **một endpoint duy nhất** `GET /api/dashboard` trả về mọi thứ trang cần (tóm tắt người dùng, `overview`, `scoreTrend`, `chapterMastery`, `weakestChapters`, `cognitiveMastery`, 6 đề gần nhất, `leaderboard`) trong **một** lượt, thay cho 3 lượt gọi. Giữ nguyên `/api/analytics` và `/api/exams` nếu nơi khác còn dùng.
2. Tính toán trong một lần duyệt có `Map`, không dùng `find` lồng nhau; chỉ lấy dữ liệu của đúng người dùng và đúng khối lớp; cắt `leaderboard` bằng cách chọn top-N, không sắp xếp toàn bộ.
3. **Cache kết quả theo người dùng** với TTL ngắn (30–60 giây), khoá gồm `userId` + khối lớp, **vô hiệu hoá ngay khi người đó nộp bài, đổi cài đặt ẩn danh bảng xếp hạng, hoặc đăng xuất**. Bảng xếp hạng (dữ liệu dùng chung) có thể cache riêng 60–120 giây. Không bao giờ để dữ liệu riêng của người này lọt sang người khác.
4. Có `Cache-Control: private, no-store` ở tầng HTTP cho dữ liệu cá nhân; cache chỉ nằm ở bộ nhớ máy chủ hoặc SWR phía client theo từng người dùng.

### Bước 4 — Giao diện dashboard hiện ngay, không màn hình chờ trắng
1. **Bỏ màn hình chờ toàn trang.** Hiển thị ngay `AppShell` (thanh điều hướng, tiêu đề) và các **skeleton** cho thẻ chỉ số, biểu đồ, danh sách đề; dữ liệu về đến đâu hiện đến đó.
2. Dùng **stale-while-revalidate** (SWR hoặc TanStack Query): lần vào lại hiện dữ liệu cũ tức thì rồi cập nhật ngầm. Khoá cache theo `userId`, **xoá sạch khi đăng xuất hoặc đổi tài khoản**.
3. Sau khi đăng nhập thành công: gọi `router.prefetch('/dashboard')` và làm nóng dữ liệu dashboard để lần vào đầu tiên nhanh.
4. Biểu đồ (Chart.js) nạp lười, chỉ bắt đầu sau khi các thẻ chỉ số đã hiện; không chặn hiển thị phần còn lại.
5. Lỗi mạng/lỗi API hiển thị khung thông báo kèm nút "Thử lại" thay vì kẹt ở trạng thái chờ vô hạn; đặt timeout hợp lý cho các lời gọi.

### Bước 5 — Kiểm tra hạ tầng (nếu đã triển khai trên Vercel hoặc máy chủ từ xa)
1. Xác nhận vùng chạy hàm serverless **gần vùng đặt DB** (cấu hình `regions`/`preferredRegion`); nếu khác châu lục, nêu thẳng trong báo cáo vì đây có thể là nguyên nhân chính và không sửa được bằng code.
2. Kiểm tra dữ liệu có đang rơi về file `/tmp` trên serverless không (mỗi instance một bản riêng, không chia sẻ, dễ cho dữ liệu lệch nhau). Nếu đúng, báo cáo rõ và đề xuất cách sửa.
3. Đo cold start; nếu đáng kể, đề xuất cách giảm (giảm kích thước nạp ban đầu, lazy-load phần nặng).

### Bước 6 — Nghiệm thu bằng số liệu
Đo lại đúng các phép đo ở Bước 1 (production build, cold và warm) và điền cột "sau". Mục tiêu tham khảo (nếu chưa đạt thì giải thích nguyên nhân, đặc biệt nếu do độ trễ mạng tới DB):
- `GET /api/dashboard` warm: p95 < 300 ms; chỉ 1 lần đọc state, không còn tải lại toàn bộ payload mỗi request.
- Khung trang và skeleton hiện < 1 giây; thẻ chỉ số có dữ liệu < 1,5 giây ở lần warm.
- Vào lại Tổng quan lần hai: hiện dữ liệu gần như tức thì (SWR).
- Toàn bộ test hiện có xanh (`npm run test`), `npm run build` không lỗi, không có người dùng nào thấy dữ liệu của người khác (viết thêm test cho cache theo người dùng và vô hiệu hoá cache sau khi nộp bài).

---

## PHẦN C — FAVICON

Thương hiệu hiện dùng tông **indigo** (nút `bg-indigo-600`, tên "MathMaster THCS"). Hãy tạo bộ icon đồng nhất:

1. Thiết kế biểu tượng đơn giản, rõ ở cỡ 16×16: chữ **π** hoặc chữ **M** trắng, nét đậm, trên nền bo góc màu indigo `#4f46e5` (có thể thêm một chi tiết nhỏ gợi toán học, nhưng phải đọc được khi thu nhỏ). Tự vẽ bằng SVG, không dùng hình có bản quyền.
2. Tạo file theo quy ước App Router của Next.js 14 trong `src/app/`:
   - `icon.svg` (favicon vector, hiển thị tốt trên mọi trình duyệt hiện đại),
   - `favicon.ico` (đa kích thước 16/32/48, dùng cho trình duyệt cũ — có thể sinh bằng script một lần với `sharp` + `png-to-ico` đặt trong `devDependencies`, hoặc tương đương),
   - `apple-icon.png` (180×180, nền đặc, không trong suốt).
3. Tạo `src/app/manifest.ts` (tên, tên ngắn, `theme_color` `#4f46e5`, `background_color`, `display: 'standalone'`) và hai icon PNG 192×192 và 512×512 (kèm biến thể `maskable` nếu làm được) trong `public/` để có thể "Thêm vào màn hình chính" trên điện thoại.
4. Trong `src/app/layout.tsx`: bổ sung `viewport.themeColor` và `metadata.icons` nếu cần (không bắt buộc khi đã dùng tên file chuẩn), `metadataBase`, và kiểm tra tiêu đề/mô tả vẫn đúng.
5. Nếu `public/mathmaster_thcs.html` (bản tĩnh cũ) vẫn còn dùng, thêm `<link rel="icon" href="/icon.svg" type="image/svg+xml">` và `<link rel="apple-touch-icon" href="/apple-icon.png">` vào `<head>`.
6. Nghiệm thu: mở `/icon.svg`, `/favicon.ico`, `/apple-icon.png`, `/manifest.webmanifest` đều trả 200 đúng kiểu nội dung; tab trình duyệt hiện icon ở cả trang đăng nhập và dashboard; file `middleware.ts` không chặn các đường dẫn này (hiện chỉ áp dụng cho `/api/*`). Nhắc tôi rằng trình duyệt cache favicon rất lâu nên cần làm mới cứng (Ctrl+F5) hoặc mở tab ẩn danh để thấy icon mới.

---

## QUY TẮC CHUNG

- Trước khi bắt đầu, tạo commit hoặc nhánh sao lưu trạng thái hiện tại (ví dụ `backup-pre-dashboard-fix`). Commit riêng từng bước, ghi số liệu trước/sau vào commit message.
- Thay đổi DB (nếu có) chỉ qua migration Prisma an toàn, chạy lại được, không mất dữ liệu; không chạy lệnh phá huỷ (xoá/reset database, `git reset --hard`).
- **Không in hoặc ghi giá trị trong `.env` (khoá bí mật, chuỗi kết nối DB) vào log, báo cáo hay commit.**
- Sau mỗi bước chạy `npm run test`, `npm run build`, `npx prisma validate`. Nếu test đỏ hoặc thay đổi không cải thiện đáng kể thì hoàn tác thay đổi đó, ghi vào báo cáo rồi đi tiếp.
- Chỉ dừng hỏi tôi khi thiếu thông tin hoặc khoá bí mật không có, hoặc thao tác có nguy cơ mất dữ liệu (ví dụ chuyển dữ liệu sang bảng quan hệ ở Bước 2.6).

## SẢN PHẨM BÀN GIAO

1. Mã nguồn đã sửa, chạy được bằng `npm install` → `npx prisma migrate deploy` → `npm run build` → `npm run start`.
2. `PERFORMANCE_DASHBOARD.md`: bảng trước/sau (cold/warm), nguyên nhân thật sự tìm được, danh sách thay đổi (file, lý do, mức cải thiện), thay đổi đã thử nhưng hoàn tác.
3. Bộ favicon hoàn chỉnh và danh sách file đã thêm.
4. Mục "Chưa giải quyết được / cần quyết định của tôi" (ví dụ vùng đặt DB, nâng cấp gói hạ tầng, có chuyển dữ liệu sang bảng quan hệ hay không), nói thẳng, không bỏ qua.
