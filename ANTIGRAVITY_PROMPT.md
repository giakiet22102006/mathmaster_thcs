# NHIỆM VỤ: NÂNG CẤP WEB ÔN THI TOÁN THCS "MathMaster THCS"

Bạn là kỹ sư full-stack senior. Hãy nâng cấp dự án này theo đúng thứ tự các Giai đoạn bên dưới.
**Trước khi sửa bất kỳ file nào**: đọc toàn bộ mã nguồn, tạo *Implementation Plan* + *Task List*, rồi mới bắt đầu. Làm xong mỗi giai đoạn thì chạy `npm run test` + `npm run build`, commit riêng (`git init` nếu chưa có), và báo cáo ngắn những gì đã làm / chưa làm được.

Ngôn ngữ giao diện, thông báo lỗi, comment trong code: **tiếng Việt**. Tên biến/hàm: tiếng Anh.

---

## 0. BỐI CẢNH DỰ ÁN (đã được kiểm tra, không cần đoán)

- Stack: Next.js 14 (App Router) + Prisma 5.22 + PostgreSQL (23 bảng), TailwindCSS đã có trong `package.json`.
- Giao diện đang chạy chủ yếu từ **một file HTML tĩnh ~3.760 dòng** `public/mathmaster_thcs.html` (≈114 hàm JS, Tailwind/KaTeX/Chart.js nạp qua CDN). Hãy kiểm tra `src/app/page.tsx` xem có đang nhúng file này không.
- Backend có **2 lớp lưu trữ song song**: Prisma/PostgreSQL và file JSON `.data/local_db_state.json` (đọc/ghi cả "state" một lần qua `/api/state`). Đây là nguồn gốc của nhiều lỗi bên dưới.
- Ngân hàng câu hỏi `prisma/seed_data.json` chỉ có **37 câu**: lớp 6 = 9, lớp 7 = 7, lớp 8 = 12, lớp 9 = 9. Theo độ khó: easy 14, medium 18, **hard 5**. Mỗi câu đã có sẵn các trường: `difficulty`, `cognitiveLevel` (nhan_biet…), `chapterId`, `semester`, `textbooks[]`, `rubricSteps`, `solution`, `commonMistake`, `verificationStatus`.

---

## 1. LỖI & LỖ HỔNG ĐÃ PHÁT HIỆN (phải sửa)

### 1.1 Bảo mật / đăng nhập (`src/lib/auth.ts`, `src/app/api/auth/route.ts`, `src/app/api/state/route.ts`)
| # | Vấn đề | Hậu quả |
|---|--------|---------|
| 1 | `hashPassword` dùng **salt cố định** `'mathmaster_salt_v1'` | Lộ 1 mật khẩu → dò được mọi tài khoản trùng mật khẩu (rainbow table) |
| 2 | `verifyPassword` có dòng `if (storedHash === password) return true` | Ai biết chuỗi hash trong DB đăng nhập được luôn; chấp nhận mật khẩu plaintext |
| 3 | Đăng nhập: `if (!user \|\| (password && !verifyPassword(...)))` | **Bỏ trống mật khẩu vẫn đăng nhập được**; còn cho đăng nhập bằng `userId` |
| 4 | Đăng ký: mật khẩu mặc định `'pass123'`, không kiểm tra email trùng, không validate, `username` sinh từ họ tên | Tài khoản yếu, trùng lặp, đoán được |
| 5 | JWT tự viết: không có `exp`, so sánh chữ ký bằng `!==` (không `timingSafeEqual`), `AUTH_SECRET` có giá trị mặc định trong code | Token sống vĩnh viễn, dễ bị tấn công timing, secret lộ trong repo |
| 6 | `verifySessionToken` **không được gọi ở route nào** | Toàn bộ API không có xác thực |
| 7 | `GET /api/state` trả **toàn bộ dữ liệu mọi người dùng kể cả `passwordHash`**; `POST /api/state` cho ghi đè toàn bộ state | Ai cũng đọc/xoá/sửa được dữ liệu của người khác |
| 8 | `action: 'delete'` xoá tài khoản bất kỳ theo `userId` gửi từ client, không cần đăng nhập | Ai cũng xoá được tài khoản người khác |
| 9 | Cookie `mm_session` thiếu `sameSite`, `secure`; `/api/exams` lấy `userId` từ body | CSRF, giả mạo danh tính |
| 10 | Không giới hạn số lần đăng nhập sai | Brute-force |
| 11 | Thông báo lỗi trả `err.message` thô | Lộ thông tin nội bộ |

### 1.2 Tạo đề theo độ khó (`src/lib/math-grader.ts` và `math-grader.mjs` — 2 file trùng nội dung)
| # | Vấn đề | Hậu quả |
|---|--------|---------|
| 1 | Độ khó chỉ là **điểm ưu tiên +8**, không phải bộ lọc | Chọn "Khó" vẫn ra câu dễ |
| 2 | Khi thiếu câu, code **tự lấy bất kỳ câu nào cùng lớp** (kể cả chưa `verified`, sai độ khó, sai kỳ/chương) | Đề sai mức khó mà không báo gì |
| 3 | Lọc học kỳ/chương **tự nới lỏng âm thầm** nếu pool < 3 hoặc < 2 câu | Đề lệch phạm vi người dùng chọn |
| 4 | Không lọc theo `textbook` (KNTT / CD / CTST) dù câu hỏi có `textbooks[]` | Sai bộ sách |
| 5 | Chỉ dùng `difficulty` 3 mức, bỏ qua `cognitiveLevel` | Không bám cấu trúc đề (Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao) |
| 6 | Chống trùng chỉ nhìn 2 đề gần nhất **của cả lớp**, không theo từng người dùng | Học sinh vẫn gặp câu lặp |
| 7 | Chia điểm đều, bỏ qua `q.points` và trọng số theo độ khó | Điểm không phản ánh độ khó |
| 8 | Lấy "top N" theo thứ tự cố định, không ngẫu nhiên có kiểm soát | Mọi đề cùng cấu hình gần như giống hệt nhau |
| 9 | Bộ chấm có đoạn hard-code `question.id === 'Q9_008'`; lỗi câu trắc nghiệm luôn gán `CALCULATION_ERROR` | Phân loại lỗi sai không đáng tin |
| 10 | Mặc định `userId: 'user_minhanh_01'` | Đề gán nhầm chủ sở hữu |
| 11 | **Ngân hàng quá nhỏ**: chỉ 5 câu hard toàn hệ thống; lớp 7/8/9 không có câu hard trắc nghiệm; không có câu essay mức easy | Dù code đúng cũng không thể tạo đề khó/dễ đúng chuẩn |

---

## 2. GIAI ĐOẠN 1 — AUTH CHUẨN (làm trước, vì mọi tính năng sau phụ thuộc vào nó)

1. **Băm mật khẩu**: dùng `scrypt` (Node `crypto`) hoặc `argon2`/`bcryptjs`, **salt ngẫu nhiên cho từng người dùng**, lưu dạng `thuattoan$tham_so$salt$hash`; so sánh bằng `crypto.timingSafeEqual`. Xoá nhánh `storedHash === password`.
2. **Migration người dùng cũ**: khi đăng nhập thành công bằng hash kiểu cũ → băm lại theo chuẩn mới. Tài khoản seed dùng mật khẩu plaintext/`pass123` phải bị buộc đổi mật khẩu ở lần đăng nhập đầu.
3. **Đăng ký**: validate bằng `zod` (email hợp lệ & duy nhất không phân biệt hoa/thường, mật khẩu ≥ 8 ký tự gồm chữ + số, họ tên, lớp 6–9, bộ sách). Có ô *Nhập lại mật khẩu*, hiện/ẩn mật khẩu, thanh đo độ mạnh. Không bao giờ đặt mật khẩu mặc định.
4. **Đăng nhập**: bắt buộc email/username **và** mật khẩu; thông báo lỗi chung chung ("Email hoặc mật khẩu không đúng") để tránh dò tài khoản; **rate limit** (vd. 5 lần sai / 15 phút / IP + tài khoản); có "Ghi nhớ đăng nhập".
5. **Phiên (session)**: dùng thư viện `jose` (JWT có `exp` 7 ngày, `iss`, `sub`) hoặc session lưu DB. Cookie: `httpOnly`, `sameSite: 'lax'`, `secure` ở production. Bỏ giá trị mặc định của `AUTH_SECRET`: **thiếu biến môi trường thì app báo lỗi rõ ràng và không khởi động** ở production.
6. **Bảo vệ API**: tạo `middleware.ts` + helper `requireUser(req)` / `requireRole(req, roles)`. Mọi route (`/api/state`, `/api/exams`, `/api/attempts`, `/api/documents`, `/api/ai/assistant`) phải lấy `userId` **từ session**, không tin `userId` từ body. Người dùng chỉ được đọc/ghi dữ liệu của chính mình; `ADMIN` mới được quản trị.
7. **Tài khoản**: thêm đăng xuất, đổi mật khẩu (yêu cầu mật khẩu cũ), xoá tài khoản (yêu cầu nhập lại mật khẩu), quên mật khẩu bằng token một lần có hạn 30 phút (môi trường dev thì in link ra console; viết sẵn interface gửi email để sau cắm dịch vụ thật).
8. **Vai trò**: `STUDENT`, `TEACHER`, `ADMIN` (enum `Role` đã có — kiểm tra giá trị hiện tại trong `schema.prisma`). Chế độ khách (nếu giữ) chỉ được làm đề thử, không lưu lâu dài.
9. **Thống nhất lưu trữ**: **PostgreSQL qua Prisma là nguồn dữ liệu duy nhất**. `/api/state` chỉ trả dữ liệu *của người đang đăng nhập* và **không bao giờ trả `passwordHash`**. Giữ file JSON chỉ như chế độ demo khi chưa có `DATABASE_URL`, tắt hoàn toàn ở production. Thêm migration Prisma cho các cột mới (vd. `passwordUpdatedAt`, `failedLoginCount`, `lockedUntil`), **không làm mất dữ liệu hiện có**.
10. Cập nhật `.env.example`, viết test cho: đăng ký trùng email, đăng nhập thiếu mật khẩu (phải 401), token hết hạn, truy cập dữ liệu người khác (phải 403), rate limit.
11. **Phiên đăng nhập theo từng thiết bị (bắt buộc)**: hiện `auth/route.ts` ghi `state.currentUserId` vào state dùng chung trên server và `/api/state` trả danh sách mọi tài khoản, nên đăng nhập ở thiết bị này có thể ảnh hưởng hoặc lộ tài khoản sang thiết bị khác. Phải sửa như sau:
    - Xoá hoàn toàn `currentUserId` khỏi state dùng chung trên server. "Người dùng hiện tại" chỉ được xác định từ cookie phiên của chính request đó, nên đăng nhập ở thiết bị A không ảnh hưởng thiết bị B.
    - Giao diện tuyệt đối không hiển thị danh sách tài khoản của người khác. Bỏ chức năng "Chuyển tài khoản" kiểu liệt kê mọi user; muốn đổi tài khoản thì phải đăng xuất rồi đăng nhập lại bằng mật khẩu.
    - Mỗi lần đăng nhập tạo một bản ghi phiên riêng trong DB (bảng `sessions`: id, userId, tên thiết bị/User-Agent, IP, thời điểm tạo, hạn dùng, trạng thái thu hồi) bằng migration Prisma. Cookie chỉ chứa mã phiên (hoặc JWT tham chiếu mã phiên), và mọi request phải kiểm tra phiên còn hiệu lực, chưa bị thu hồi.
    - Thêm trang "Thiết bị đăng nhập": liệt kê các phiên của chính tài khoản đó, có nút "Đăng xuất thiết bị này" và "Đăng xuất tất cả thiết bị khác". Đổi mật khẩu thì thu hồi mọi phiên khác.
    - Mặc định cho phép nhiều thiết bị cùng đăng nhập một tài khoản (điện thoại + máy tính). Để cấu hình `MAX_SESSIONS_PER_USER` trong `.env` (mặc định 5; đặt 1 nếu muốn mỗi tài khoản chỉ dùng được trên một thiết bị, đăng nhập máy mới thì máy cũ tự bị đăng xuất).
    - Thêm test: đăng nhập user A ở client 1 và user B ở client 2, mỗi client chỉ thấy dữ liệu của mình và không thấy user kia; thu hồi phiên ở thiết bị này thì thiết bị kia vẫn dùng bình thường; vượt `MAX_SESSIONS_PER_USER` thì phiên cũ nhất bị thu hồi.

---

## 3. GIAI ĐOẠN 2 — TẠO ĐỀ ĐÚNG ĐỘ KHÓ (trọng tâm)

### 3.1 Chuẩn hoá thang độ khó
- Dùng thang 4 mức bám cấu trúc đề kiểm tra của Bộ GD&ĐT: **Nhận biết → Thông hiểu → Vận dụng → Vận dụng cao**. Ánh xạ với dữ liệu hiện có (`easy ≈ nhan_biet`, `medium ≈ thong_hieu`, `hard ≈ van_dung / van_dung_cao`). Nếu enum `Difficulty` trong Prisma chưa đủ, thêm giá trị bằng migration an toàn.
- Mỗi câu hỏi phải có **đúng một** mức độ rõ ràng, và `difficulty` phải nhất quán với `cognitiveLevel` (script kiểm tra ở 3.3 sẽ bắt mâu thuẫn).

### 3.2 Viết lại `generateExamFromPool` (một file duy nhất, bỏ bản `.mjs` trùng lặp)
Yêu cầu hành vi:
1. **Lọc cứng (hard filter)**, không nới lỏng âm thầm: `grade`, `textbook` (câu có `textbooks` chứa bộ sách đã chọn), `semester`/loại đề, `chapterIds[]` (chọn nhiều chương), `verificationStatus === 'verified'`.
2. **Ma trận độ khó theo tỉ lệ**. Có các preset và chế độ "Tuỳ chỉnh" (kéo thanh trượt tổng = 100%):
   - Cơ bản: 70% NB / 30% TH / 0 / 0
   - Trung bình: 30% / 50% / 20% / 0
   - Nâng cao: 10% / 30% / 40% / 20%
   - Thi vào 10: 10% / 30% / 35% / 25%
   Dùng thuật toán làm tròn phần dư lớn nhất (largest remainder) để tổng số câu đúng bằng `questionCount`.
3. **Không bao giờ chèn câu sai mức độ để cho đủ số lượng.** Nếu ngân hàng thiếu, trả về lỗi có cấu trúc `{ ok:false, code:'INSUFFICIENT_QUESTIONS', shortage:[{level, need, have}], suggestions:[...] }` và để giao diện cho người dùng chọn: giảm số câu / cho phép mượn mức kề cận (có gắn nhãn rõ ràng) / đổi phạm vi chương. Chỉ mượn khi người dùng đồng ý.
4. **Chống trùng theo người dùng**: ưu tiên câu người này chưa làm hoặc làm sai lâu nhất; không lặp câu của N đề gần nhất *của chính họ*.
5. **Ngẫu nhiên có kiểm soát**: dùng PRNG có `seed` (lưu `seed` vào đề). Cùng cấu hình + cùng seed → cùng đề; bấm "Tạo đề khác" → seed mới. Cân bằng chủ đề (không dồn hết vào một chương khi chọn nhiều chương).
6. **Chia điểm** theo trọng số độ khó (vd. NB 1 : TH 1.5 : VD 2 : VDC 2.5) rồi chuẩn hoá để tổng đúng 10 điểm; tôn trọng `q.points` nếu có.
7. **Trả thêm thống kê thực tế** của đề (`composition`: số câu mỗi mức/chương/dạng) và ghi vào đề để hiển thị lại.
8. Sửa bộ chấm: bỏ hard-code `Q9_008`; phân loại lỗi sai cho câu trắc nghiệm dựa trên `commonMistake`/distractor đã chọn thay vì luôn `CALCULATION_ERROR`; điểm tự luận chấm theo `rubricSteps` (cho điểm từng bước) thay vì chỉ đúng/sai toàn câu.
9. Xoá `userId` mặc định cứng; `userId` lấy từ session.

### 3.3 Công cụ kiểm định ngân hàng câu hỏi (`npm run bank:audit`)
Viết script báo cáo và **fail CI nếu có lỗi nghiêm trọng**:
- Câu thiếu `content`, `solution`, đáp án; đáp án đúng không nằm trong `options`; options trùng nhau; `rubricSteps` có tổng điểm ≠ `points`.
- `difficulty` mâu thuẫn `cognitiveLevel`.
- Công thức LaTeX/KaTeX không render được (`katex.renderToString` với `throwOnError: true`).
- Với câu tính toán số học/đại số đơn giản: tự tính lại đáp án bằng `mathjs` và so khớp.
- In **ma trận phủ** `lớp × học kỳ × chương × mức độ × dạng` để thấy ô nào còn trống.

### 3.4 Mở rộng ngân hàng (vì 37 câu là quá ít)
- **Mục tiêu tối thiểu**: mỗi lớp (6–9) có ≥ 15 câu cho *mỗi* mức độ, phủ đủ các chương của cả hai học kỳ; có cả trắc nghiệm và tự luận ở các mức phù hợp. Ghi rõ nếu chưa đạt.
- Soạn câu mới vào `prisma/question_bank/*.json` theo **đúng schema câu hỏi hiện có**, kèm lời giải từng bước, `commonMistake`, `rubricSteps`.
- **Quan trọng — chất lượng toán**: mọi câu do AI soạn mới phải đặt `verificationStatus: "draft"`, **không được tự đặt `verified`**. Chỉ chuyển `verified` sau khi (a) qua `bank:audit`, và (b) giáo viên/người dùng duyệt ở màn hình Quản trị (mục 4.6). Tạo đề chỉ dùng câu `verified`.
- **Câu hỏi sinh theo mẫu (parametric templates)** cho các dạng tính toán lặp lại (lũy thừa, phân số, phương trình bậc nhất, hệ phương trình, rút gọn căn thức, diện tích/thể tích…): tham số nằm trong khoảng *quy định theo từng mức độ*, đáp án được **tính bằng code** nên luôn đúng và độ khó kiểm soát được (vd. mức NB dùng số nguyên nhỏ; mức VD có phân số/căn).
- **Hiệu chỉnh độ khó bằng dữ liệu thật**: thống kê tỉ lệ làm đúng của từng câu từ bảng `student_answers`; lưu `empiricalDifficulty`; cảnh báo ở trang Quản trị khi nhãn lệch rõ rệt (vd. nhãn "dễ" nhưng < 30% học sinh làm đúng) — chỉ đề xuất chỉnh nhãn, không tự đổi.

### 3.5 Tiêu chí nghiệm thu
- Tạo đề "Khó" cho lớp 9 → **mọi** câu có mức VD/VDC đúng tỉ lệ ma trận, hoặc nhận được thông báo thiếu câu rõ ràng. Tuyệt đối không có câu sai mức lọt vào.
- Test tự động phủ: lọc cứng, ma trận làm tròn, thiếu câu, seed tái lập, chống trùng theo người dùng, tổng điểm = 10.

---

## 4. GIAI ĐOẠN 3 — TÍNH NĂNG BỔ SUNG (ưu tiên từ trên xuống)

Chọn dùng lại các bảng đã có trong schema (`topic_mastery`, `review_queue`, `study_sessions`, `achievements`, `learning_goals`, `math_formulas`) thay vì tạo bảng mới nếu có thể.

1. **Dashboard cá nhân**: điểm theo thời gian, tiến độ từng chương, độ thành thạo theo chủ đề (từ `topic_mastery`), chuỗi ngày học, XP/cấp độ (Chart.js).
2. **Sổ tay lỗi sai + ôn tập ngắt quãng**: câu làm sai vào `review_queue`, lên lịch nhắc lại theo thuật toán kiểu SM-2; nút "Ôn lại câu sai" tạo mini-đề.
3. **Luyện tập theo chủ đề** (chế độ không tính giờ): xem đáp án và lời giải ngay sau mỗi câu, gợi ý từng bước.
4. **Đề thích ứng "Luyện điểm yếu"**: tự chọn chương/chủ đề có độ thành thạo thấp và nâng/hạ mức độ theo kết quả gần đây.
5. **In/xuất đề PDF** (đề + đáp án riêng, có mã đề) — dùng CSS print hoặc thư viện nhẹ.
6. **Vai trò giáo viên**: tạo lớp (mã lớp để học sinh tham gia), giao đề, xem bảng điểm lớp, thống kê câu nhiều học sinh sai nhất.
7. **Quản trị ngân hàng câu hỏi** (TEACHER/ADMIN): xem danh sách, lọc theo trạng thái, **duyệt `draft → verified`**, sửa câu, xem tỉ lệ làm đúng, xuất/nhập JSON.
8. **Trang Công thức** (tra cứu theo lớp/chương, dùng bảng `math_formulas`), đánh dấu/lưu câu hỏi yêu thích, bảng xếp hạng tuỳ chọn (cho phép ẩn danh).
9. Giữ tính năng sẵn có: tự lưu bài đang làm, khôi phục bài, chấm toán tương đương, trợ lý giải từng bước (Gemini là tuỳ chọn; thiếu API key thì báo rõ, **không giả lập thành công**).

---

## 5. GIAI ĐOẠN 4 — GIAO DIỆN & TRẢI NGHIỆM

Mục tiêu: học sinh lớp 6–9 dùng được trên **điện thoại** ngay lần đầu, không cần hướng dẫn.

1. **Chuyển dần** từ file HTML 3.760 dòng sang các trang/component Next.js (App Router) đã có sẵn trong dự án: `/login`, `/register`, `/dashboard`, `/exams/new`, `/exams/[id]` (làm bài), `/exams/[id]/result`, `/practice`, `/review`, `/history`, `/formulas`, `/teacher`, `/admin/questions`. Làm từng trang, trang nào xong mới bỏ phần tương ứng trong HTML cũ. **Không xoá HTML cũ cho đến khi mọi tính năng đã có bản mới và qua test.**
2. Cài `tailwindcss` và `katex` **qua npm** (bỏ CDN) để chạy được khi mất mạng và nhanh hơn.
3. **Trang tạo đề dạng wizard 3 bước**: (1) Lớp + bộ sách + học kỳ/loại đề → (2) Chọn chương (checkbox nhiều chương, có "chọn tất cả") + số câu + thời gian → (3) Chọn độ khó bằng preset + thanh trượt, **xem trước ma trận** ("Đề này sẽ có 3 câu Nhận biết, 4 Thông hiểu…") và cảnh báo thiếu câu *trước khi* bấm tạo. Nhớ lựa chọn lần trước.
4. **Màn làm bài**: bảng điều hướng câu (đã làm / chưa làm / đánh dấu), đồng hồ đếm ngược rõ ràng, tự lưu có chỉ báo "Đã lưu", cảnh báo trước khi nộp nếu còn câu trống, bàn phím toán học/nút chèn √, phân số, mũ khi nhập đáp án tự luận.
5. **Màn kết quả**: điểm, đúng/sai theo mức độ và chương, lời giải từng bước, nút "Luyện lại câu sai".
6. Thiết kế: mobile-first, chữ ≥ 16px, nút bấm ≥ 44px, tương phản đạt WCAG AA, dark mode, trạng thái *loading / rỗng / lỗi* cho mọi danh sách, toast thông báo, điều hướng nhất quán, onboarding 3 bước cho người dùng mới.
7. Hiển thị **nhãn mức độ** (màu + chữ, không chỉ dùng màu) trên từng câu hỏi.

---

## 6. QUY TẮC LÀM VIỆC

- **Không phá dữ liệu**: mọi thay đổi DB qua migration Prisma; sao lưu `.data/local_db_state.json` trước khi động vào; seed phải chạy lại được (idempotent).
- Không đưa secret vào code hay commit. Cập nhật `.env.example` và tài liệu `HUONG_DAN_CAI_DAT_WINDOWS.md` cho các biến/lệnh mới (người dùng dùng **Windows**, nên lệnh phải chạy được trên PowerShell).
- Mỗi giai đoạn: viết test (mở rộng `scripts/test-flows.mjs` hoặc chuyển sang Vitest), chạy `npm run test`, `npm run build`, `npx prisma validate`. Dùng trình duyệt tích hợp để tự kiểm thử luồng đăng ký → đăng nhập → tạo đề → làm bài → nộp → xem kết quả, và chụp ảnh màn hình làm bằng chứng.
- Gặp quyết định có nhiều hướng (vd. chọn thư viện băm mật khẩu, có bỏ chế độ khách hay không): chọn phương án đơn giản, ít phụ thuộc nhất, ghi rõ lý do trong báo cáo.
- Điều gì không làm được hoặc chưa chắc đúng (đặc biệt về nội dung toán): **nói thẳng trong báo cáo**, không giả vờ đã hoàn thành.

## 7. SẢN PHẨM BÀN GIAO CUỐI CÙNG

1. Mã nguồn đã nâng cấp, chạy được bằng `npm install` → `npx prisma migrate deploy` → `npm run db:seed` → `npm run dev`.
2. File `CHANGELOG_NANG_CAP.md`: liệt kê từng lỗi ở mục 1 đã sửa thế nào (kèm file/dòng), tính năng mới, những gì chưa làm.
3. Báo cáo `bank:audit`: số câu hiện có theo ma trận lớp × mức độ, các ô còn thiếu, số câu `draft` đang chờ giáo viên duyệt.
4. Hướng dẫn ngắn: cách tạo tài khoản ADMIN/TEACHER đầu tiên, cách duyệt câu hỏi, cách đặt lại mật khẩu.
