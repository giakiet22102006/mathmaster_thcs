# NHIỆM VỤ: TỐI ƯU TỐC ĐỘ WEB "MathMaster THCS"

Bạn là kỹ sư full-stack senior chuyên tối ưu hiệu năng. Dự án đã được nâng cấp (auth, tạo đề theo độ khó, tính năng mới, giao diện) và hiện **chạy chậm**. Hãy tối ưu theo đúng quy trình: **ĐO → tìm nút thắt → sửa → ĐO LẠI**.

## 0. NGUYÊN TẮC BẮT BUỘC

1. **Không đoán, phải đo.** Chưa có số liệu "trước" thì không được sửa. Mỗi thay đổi phải có số liệu "sau" chứng minh hiệu quả; thay đổi không cải thiện đáng kể thì hoàn tác.
2. **Chỉ đo bằng bản production** (`npm run build` rồi `npm run start`). Chế độ `npm run dev` luôn chậm hơn nhiều, không dùng để kết luận.
3. **Không đổi hành vi và không hạ bảo mật**: tất cả test hiện có phải còn xanh; không bỏ kiểm tra phiên (session), không cache dữ liệu riêng của người dùng ở bộ nhớ đệm dùng chung; không bỏ rate limit.
4. Làm từng nhóm, **commit riêng từng nhóm**, ghi số liệu trước/sau vào commit message. Không chạm vào dữ liệu thật; mọi thay đổi DB qua migration Prisma, chạy lại được.
5. Lập *Implementation Plan* trước khi sửa; chờ tôi duyệt phần nào đụng tới DB.

## 1. GIAI ĐOẠN 1 — ĐO BASELINE (bắt buộc làm trước)

1. Ghi lại môi trường: phiên bản Node, Next, hệ điều hành, PostgreSQL chạy ở máy nội bộ hay máy chủ ngoài (độ trễ mạng tới DB).
2. **Frontend**: chạy Lighthouse (mobile) cho các trang `/login`, `/dashboard`, `/exams/new`, trang làm bài, trang kết quả. Ghi LCP, INP, CLS, TTFB, kích thước JS tải lần đầu. Chạy `@next/bundle-analyzer` và lập danh sách 10 gói/thư viện nặng nhất.
3. **Backend**: thêm middleware đo thời gian mỗi API route (ghi p50/p95). Bật `log: ['query']` của Prisma ở môi trường đo, **đếm số truy vấn DB cho mỗi request** để phát hiện N+1 và truy vấn thừa.
4. **Các luồng cần đo riêng**: đăng nhập, tải dashboard, tạo đề (`generateExamFromPool`), tự lưu bài đang làm, nộp bài và chấm, tải lịch sử.
5. Xuất bảng baseline vào `PERFORMANCE_REPORT.md` và **xếp hạng các nút thắt theo mức ảnh hưởng**. Chỉ tối ưu theo thứ tự này.

## 2. GIAI ĐOẠN 2 — BACKEND & DATABASE

Kiểm tra và sửa các nghi vấn sau (chỉ sửa cái nào số liệu xác nhận là chậm):

1. **Đọc/ghi cả "state" một lần**: nếu còn endpoint kiểu `/api/state` đọc hoặc ghi toàn bộ dữ liệu (đặc biệt dùng `fs.readFileSync/writeFileSync` đồng bộ trong request) thì thay bằng endpoint nhỏ theo từng nhu cầu, chỉ `select` các cột cần dùng, có phân trang cho danh sách (lịch sử, câu sai, bảng điểm). Không dùng hàm I/O đồng bộ trong đường xử lý request.
2. **Index database** cho các cột hay lọc/sắp xếp: câu hỏi (`grade`, `chapterId`, `semester`, `difficulty`, `verificationStatus`), đề thi (`userId`, `createdAt`), câu trả lời (`userId`, `questionId`, `attemptId`), phiên (`userId`, thời hạn), hàng đợi ôn tập (`userId`, ngày đến hạn). Dùng `EXPLAIN ANALYZE` để chứng minh trước/sau.
3. **Tạo đề**: chỉ truy vấn các câu hỏi đã lọc bằng `where` có index (đúng lớp, bộ sách, chương, độ khó, `verified`), **không tải cả ngân hàng lên rồi lọc trong JS**. Chỉ lấy các cột cần cho việc chọn câu; lấy nội dung đầy đủ sau khi đã chọn xong.
4. **N+1 và truy vấn thừa**: gộp bằng `include`/`select` hợp lý, `createMany`, `$transaction`. Một request thông thường không nên quá ~5 truy vấn.
5. **Prisma Client dùng chung (singleton)** để không cạn kết nối; cấu hình connection pool phù hợp. Nếu DB ở xa, cân nhắc pooling.
6. **Băm mật khẩu**: dùng bản **bất đồng bộ** (`crypto.scrypt`/argon2 async), không dùng `scryptSync` làm treo cả server khi có nhiều người đăng nhập cùng lúc. Giữ nguyên độ mạnh tham số băm.
7. **Cache dữ liệu tĩnh dùng chung** (danh sách chương, công thức, cấu hình sách/lớp, metadata ngân hàng): dùng `unstable_cache`/`revalidateTag` hoặc cache trong bộ nhớ có TTL. Khi giáo viên duyệt/sửa câu hỏi thì phải làm mới cache. Kiểm tra phiên (session) có thể cache ngắn (vài chục giây) nhưng phải bị vô hiệu ngay khi đăng xuất/thu hồi phiên.
8. **Tự lưu bài đang làm**: debounce 1–2 giây, chỉ gửi phần thay đổi (diff) thay vì toàn bộ bài; bỏ qua lần lưu nếu dữ liệu không đổi.
9. Bật nén phản hồi (gzip/br), đặt header cache phù hợp cho dữ liệu tĩnh; trả JSON gọn (không trả thừa trường như lời giải khi chưa nộp bài).

## 3. GIAI ĐOẠN 3 — FRONTEND

1. **Giảm JS tải lần đầu**: tách code theo trang; nạp `Chart.js`, trình soạn công thức và bất kỳ thư viện nặng nào bằng `next/dynamic` chỉ ở trang cần dùng. Dùng `optimizePackageImports` cho thư viện icon/utility. Loại bỏ thư viện không dùng và CSS Tailwind thừa (kiểm tra cấu hình `content`).
2. **KaTeX**: chỉ nạp ở trang có công thức; **render công thức theo kiểu lười** (chỉ render câu đang hiển thị hoặc gần màn hình), có cache kết quả đã render, không render lại khi người dùng chỉ chọn đáp án.
3. **Tránh render lại cả danh sách câu hỏi mỗi lần chọn đáp án**: tách state cục bộ cho từng câu, dùng `React.memo`/`useCallback`/`useTransition` đúng chỗ. Đề dài thì dùng ảo hoá danh sách hoặc phân trang theo nhóm câu.
4. **Đồng hồ đếm ngược** phải là component riêng; mỗi giây chỉ cập nhật đồng hồ, không làm render lại cả trang.
5. Dùng **Server Components** cho phần tĩnh, chỉ để `"use client"` ở phần tương tác. Thêm `loading.tsx`/skeleton để cảm giác nhanh, `prefetch` các liên kết chính.
6. Font dùng `next/font` (tự host, không chặn render); ảnh dùng `next/image` với kích thước cố định để không nhảy bố cục (CLS). Bỏ các script CDN còn sót.
7. Nếu vẫn còn trang chạy từ file HTML tĩnh lớn (`public/mathmaster_thcs.html`), liệt kê phần nào còn dùng và đề xuất lộ trình chuyển nốt sang component; không xoá nếu chưa có bản thay thế đã qua test.

## 4. GIAI ĐOẠN 4 — BUILD & CHẠY THỰC TẾ

1. Rà `next.config`: `reactStrictMode`, `compress`, `output: 'standalone'` nếu triển khai bằng Docker/máy chủ riêng; không đặt `force-dynamic` hàng loạt nếu không cần; dùng cache/ISR hợp lý cho trang tĩnh.
2. Chạy thử tải bằng `autocannon` hoặc `k6`: ~50 người đồng thời cho đăng nhập, tải dashboard, tạo đề và nộp bài. Báo lỗi, p95 và mức dùng CPU/RAM.
3. Trên Windows: nếu chỉ chậm ở chế độ `dev`, hướng dẫn tôi cách giảm (đưa thư mục dự án và `.next` vào danh sách loại trừ của Windows Defender, thử `next dev --turbo` nếu tương thích) và **nói rõ đó không phải lỗi mã nguồn**.

## 5. MỤC TIÊU NGHIỆM THU (bám theo số liệu thật, không phải cam kết)

- API thường dùng: p95 < 300 ms (không tính độ trễ mạng ngoài); tạo đề < 500 ms với ngân hàng hiện tại và vẫn đúng khi ngân hàng lớn lên hàng nghìn câu.
- Mỗi request thông thường ≤ ~5 truy vấn DB, không còn N+1.
- Lighthouse mobile ≥ 85 điểm Performance cho các trang chính; LCP < 2,5 s; INP < 200 ms; CLS < 0,1.
- JS tải lần đầu mỗi trang giảm rõ rệt so với baseline (ghi con số).
- Toàn bộ test cũ và mới xanh; `npm run build` không lỗi.

## 6. SẢN PHẨM BÀN GIAO

1. Code đã tối ưu, commit theo từng nhóm.
2. `PERFORMANCE_REPORT.md`: bảng **trước / sau** cho từng chỉ số, danh sách thay đổi (file, lý do, mức cải thiện), những thay đổi đã thử nhưng hoàn tác vì không hiệu quả.
3. Mục "Chưa tối ưu được / cần quyết định của tôi" (ví dụ: nâng cấp máy chủ DB, đổi nơi đặt DB, dùng CDN), nói thẳng, không bỏ qua.
