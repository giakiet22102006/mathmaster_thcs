# NHIỆM VỤ: SỬA 2 LỖI TRÊN WEB "MathMaster THCS"

Bạn là kỹ sư full-stack senior. Dự án là Next.js 14 (App Router) + Prisma + PostgreSQL, thư mục gốc chứa `package.json`.

**Quy trình bắt buộc:**
1. Đọc kỹ các file được nêu trong từng phần trước khi sửa. Tạo *Implementation Plan* + *Task List* rồi mới viết code.
2. Làm theo thứ tự: **PHẦN A (quên mật khẩu) → PHẦN B (sinh câu hỏi)**. Xong mỗi phần: chạy `npm run test` và `npm run build`, commit riêng, báo cáo ngắn (đã làm / chưa làm được / cần người dùng cấu hình gì).
3. Không phá chức năng đang chạy. Không in nội dung `.env` ra log/báo cáo, không commit khóa bí mật.
4. Ngôn ngữ giao diện, thông báo lỗi, comment: **tiếng Việt**. Tên biến/hàm: tiếng Anh.
5. Không giả lập thành công: nếu chưa cấu hình gửi mail thì phải báo rõ, không được trả `sent: true`.

---

# PHẦN A — SỬA "QUÊN MẬT KHẨU": MÃ KHÔI PHỤC KHÔNG VỀ MAIL, BẤM "LẤY MÃ" BỊ LỖI

## A.1 Nguyên nhân gốc đã xác định (hãy tự kiểm chứng lại bằng code)

| # | Vị trí | Vấn đề |
|---|--------|--------|
| 1 | `src/app/login/page.tsx` (`handleForgotPassword`, `handleResetPassword`) gửi `action: 'forgot_password'` và `action: 'reset_password'` (gạch dưới) | `src/app/api/auth/route.ts` chỉ xử lý `'forgot-password'` và `'reset-password'` (gạch ngang) → rơi xuống dòng cuối trả **400 "Hành động không hợp lệ."**. **Đây là lỗi khi bấm "Lấy mã khôi phục".** |
| 2 | `src/lib/auth.ts` → `defaultEmailService.sendPasswordResetEmail` | Chỉ `console.log` link ở môi trường dev rồi trả `{ sent: true }`. **Không có thư viện gửi mail nào** (`package.json` không có nodemailer/resend…), `.env.example` không có biến SMTP. Nên dù hết lỗi #1 thì mail cũng không bao giờ được gửi. |
| 3 | `login/page.tsx` chỉ chuyển sang màn hình nhập mã (`mode='reset'`) khi server trả `devResetToken` (chỉ có ở dev) | Ở production người dùng không có cách nào đi tiếp. |
| 4 | Mail (nếu có) chứa link `/login?resetToken=...` nhưng `login/page.tsx` chỉ đọc `searchParams.get('redirect')`, không đọc `resetToken` | Bấm link trong mail cũng không mở được form đặt lại. |
| 5 | Token là chuỗi hex 64 ký tự | Học sinh THCS khó gõ tay. Người dùng gọi đây là "mã khôi phục" nên cần mã ngắn. |

**Việc đầu tiên:** quét toàn bộ dự án (kể cả `public/mathmaster_thcs.html` và mọi `fetch('/api/...')`) để liệt kê **mọi chỗ client gửi `action` không khớp server** (không chỉ 2 chỗ trên, ví dụ `change_password` vs `change-password`). Sửa tất cả cho khớp. Để chống tái phát, tạo một hằng số/union type dùng chung cho tên action (ví dụ `src/lib/auth-actions.ts`) và dùng ở cả client lẫn server.

## A.2 Yêu cầu triển khai

### A.2.1 Gửi mail thật
- Cài `nodemailer`. Tạo `src/lib/mailer.ts` đọc cấu hình từ biến môi trường:
  `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` (true/false), `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` (vd. `MathMaster THCS <no-reply@...>`).
- Các route dùng mailer phải có `export const runtime = 'nodejs'` (dự án có `.vercel/`, có thể đang deploy trên Vercel).
- Thay `defaultEmailService` trong `src/lib/auth.ts` bằng bản gọi mailer thật. Giữ nguyên interface `EmailService`.
- Nội dung mail tiếng Việt, HTML đơn giản + bản text thuần, gồm: lời chào theo `fullName`, **mã 6 số** to rõ, thời hạn, câu "Nếu bạn không yêu cầu, hãy bỏ qua email này". Nên có thêm nút/link đặt lại (xem A.2.3).
- Hàm gửi trả về `{ sent: boolean, reason?: string }` **trung thực**: thiếu cấu hình SMTP → `sent: false, reason: 'SMTP_NOT_CONFIGURED'`; lỗi mạng/xác thực → ghi log lỗi (không lộ mật khẩu SMTP) và `sent: false`.
- Cập nhật `.env.example` với khối "GỬI EMAIL (SMTP)" có hướng dẫn tiếng Việt từng bước cho **Gmail** (bật xác minh 2 bước → tạo *Mật khẩu ứng dụng* 16 ký tự → `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`) và nêu phương án thay thế (Brevo/Resend SMTP).

### A.2.2 Mã khôi phục 6 số (thay cho token dài)
- Sinh bằng `crypto.randomInt(0, 1_000_000)`, pad đủ 6 chữ số.
- **Chỉ lưu bản băm** (HMAC-SHA256 với `AUTH_SECRET`, gắn kèm `userId`), không lưu mã gốc. Hiệu lực **15 phút**, dùng **một lần**.
- Giới hạn: tối đa **5 lần nhập sai** cho mỗi mã (quá thì vô hiệu mã); **cooldown 60 giây** giữa 2 lần yêu cầu mã; tối đa vài yêu cầu/giờ cho mỗi email + IP (tái sử dụng cơ chế rate limit đã có trong `src/lib/auth.ts`).
- Yêu cầu mã mới thì vô hiệu các mã chưa dùng cũ của user đó.
- Kiểm tra dữ liệu lưu mã đang nằm ở đâu (`state.passwordResetTokens` trong JSON/hot-store và/hoặc bảng Prisma `password_reset_tokens`) và **dùng đúng một nguồn nhất quán**; bổ sung trường `attempts` nếu cần (kèm migration Prisma nếu dùng bảng).
- So sánh mã bằng `crypto.timingSafeEqual`.

### A.2.3 API (`src/app/api/auth/route.ts`)
- `forgot-password` `{ email }`: luôn trả cùng một thông báo chung ("Nếu email tồn tại trong hệ thống, mã khôi phục đã được gửi.") dù email có tồn tại hay không (chống dò tài khoản). Tuy nhiên **nếu gửi mail thất bại do hệ thống** (SMTP chưa cấu hình/lỗi) thì phải trả lỗi 503 rõ ràng, không im lặng. Bỏ qua tài khoản khách (`isGuest`).
- `reset-password` `{ email, code, newPassword }`: kiểm tra mã theo A.2.2, áp dụng `passwordPolicySchema` hiện có, băm mật khẩu bằng hàm hiện có, đánh dấu mã đã dùng, reset `failedLoginCount`/`lockedUntil`, thu hồi toàn bộ phiên cũ (đã có `revokeAllOtherSessionsInState`).
- Chỉ khi `NODE_ENV !== 'production'` **và** SMTP chưa cấu hình mới trả thêm `devCode` để dev thử nghiệm; ở production tuyệt đối không trả mã về client.
- Chấp nhận thêm link trong mail dạng `/login?mode=reset&email=...` (không nhúng mã vào URL; người dùng gõ mã 6 số).

### A.2.4 Giao diện (`src/app/login/page.tsx`)
- Luồng 2 bước rõ ràng: (1) nhập email → "Gửi mã"; (2) màn hình nhập **mã 6 số + mật khẩu mới + nhập lại mật khẩu** (có ô hiện/ẩn, thanh độ mạnh như màn đăng ký).
- Sau khi gửi mã thành công **luôn chuyển sang bước 2** (không phụ thuộc `devResetToken`), hiển thị "Đã gửi mã tới a***@gmail.com" (che bớt email), nút **"Gửi lại mã"** có đếm ngược 60 giây, nút quay lại.
- Hiển thị lỗi cụ thể: mã sai / hết hạn / quá số lần thử / chưa cấu hình gửi mail.
- Đọc `mode` và `email` từ query string để mở thẳng bước 2 khi bấm link trong mail.
- Gợi ý nhỏ: "Không thấy mail? Kiểm tra mục Spam/Quảng cáo."

### A.2.5 Kiểm thử
Thêm `scripts/test-forgot-password.mjs` (đăng ký vào `npm run test`), mock mailer, kiểm tra: (a) action đúng tên không còn trả "Hành động không hợp lệ"; (b) mã đúng đổi được mật khẩu, mật khẩu cũ hết hiệu lực, phiên cũ bị thu hồi; (c) mã sai 5 lần bị khóa; (d) mã hết hạn bị từ chối; (e) mã dùng lại lần 2 bị từ chối; (f) email không tồn tại vẫn trả thông báo chung; (g) production không rò `devCode`.

---

# PHẦN B — MỞ RỘNG NGÂN HÀNG CÂU HỎI: TỰ SINH CÂU HỎI KHÔNG GIỚI HẠN, 3 BỘ SÁCH, 3 MỨC ĐỘ KHÓ

## B.1 Hiện trạng đã xác định (hãy tự kiểm chứng bằng `npm run bank:audit`)

- `prisma/seed_data.json`: 37 câu (đã `verified`). `prisma/question_bank/grade_6..9.json`: 72 / 72 / 80 / 72 câu sinh từ `generateGradeQuestionBank` trong `src/lib/question-templates.ts`. Tổng ≈ 333 câu.
- **Toàn bộ 296 câu trong `question_bank/*.json` đang ở `verificationStatus: "draft"`.** Mà `generateExamFromPool` (`src/lib/math-grader.ts`, quanh dòng 560–760) **loại mọi câu không `verified`** trừ khi `includeDraft` (chỉ TEACHER/ADMIN được bật). → Học sinh thực tế chỉ tạo đề từ **37 câu seed**, trong đó mức khó rất ít. Đây là lý do "bị giới hạn câu hỏi", và khi thiếu thì API `/api/exams` trả 422 `INSUFFICIENT_QUESTIONS`.
- Câu hỏi sinh mẫu chỉ có **3–4 biến thể cố định/chương/mức độ** (`variantsPerChapterLevel`, tham số `k = variantIndex`) → bản chất vẫn là ngân hàng tĩnh, nhỏ.
- Mọi câu đều gắn `textbooks: ["KNTT","CD","CTST"]` giống hệt nhau → bộ lọc theo sách (`config.textbook`, mặc định `KNTT`) **không có tác dụng thực**, không có câu nào "đặc trưng" cho từng bộ sách.
- `generateGradeQuestionBank` không được gọi ở đâu ngoài định nghĩa (hãy xác nhận); chưa có cơ chế sinh câu mới lúc chạy.
- `GEMINI_API_KEY` đang để trống nên **không được dựa vào AI** làm cơ chế chính.

## B.2 Mục tiêu

1. Khi tạo đề, hệ thống **tự sinh thêm câu hỏi mới** (không lặp) cho **cả 3 bộ sách** (Kết nối tri thức = `KNTT`, Cánh Diều = `CD`, Chân trời sáng tạo = `CTST`), **cả 3 mức độ khó** (`easy` / `medium` / `hard`; Vận dụng cao quy về `hard`), **cả trắc nghiệm (`mcq`) và tự luận (`essay`)**, phủ **mọi chương / cả 2 học kỳ của lớp 6, 7, 8, 9** theo `curriculum` trong `prisma/seed_data.json`.
2. **Đáp án luôn đúng 100%** vì do code tính (không để AI tự bịa đáp án).
3. Không còn lỗi 422 do thiếu câu trong các cấu hình hợp lý; chỉ trả 422 khi cấu hình vô lý, và khi đó nói rõ lý do.

## B.3 Thiết kế yêu cầu

### B.3.1 Bộ sinh câu hỏi tham số hóa (engine) — cơ chế chính, không cần AI
- Tạo thư mục `src/lib/question-engine/`:
  - `rng.ts`: bộ sinh số ngẫu nhiên **có seed** (mulberry32 hoặc tương đương) để cùng `(templateId, seed)` luôn ra đúng một câu (tái lập được).
  - `templates/grade6.ts`, `grade7.ts`, `grade8.ts`, `grade9.ts`: mỗi file là danh sách **template** theo chương. Mỗi template có: `id`, `chapterId`, `lesson`, `topic`, `problemType`, `difficulty`, `cognitiveLevel`, `type` (mcq/essay), `books` (bộ sách áp dụng), `generate(rng, book) → câu hỏi` (tham số ngẫu nhiên có ràng buộc để số đẹp/hợp lý).
  - `verify.ts`: **tự kiểm chứng độc lập** từng câu sinh ra: tính lại đáp án bằng một đường tính khác (ví dụ `mathjs`, đã có trong `package.json`), kiểm tra 4 phương án MCQ không trùng nhau và chỉ **đúng 1** phương án đúng, `acceptedAnswers` hợp lệ với bộ chấm `math-grader.ts`, tổng điểm `rubricSteps` = `points`, LaTeX hợp lệ (KaTeX parse được). Câu không qua kiểm chứng thì **loại bỏ và sinh lại**.
  - `index.ts`: `generateQuestions({ grade, textbook, chapterIds?, semester?, difficulty, type?, count, excludeFingerprints, seed? })`.
- **Quy mô tối thiểu:** mỗi khối lớp có ≥ **4 template cho mỗi (chương × mức độ khó)**, trong đó có cả mcq và essay. Với tham số ngẫu nhiên, mỗi template phải sinh được **hàng chục biến thể khác nhau về số liệu**. Phân bố mức khó phải hợp lý: `easy` = nhận biết/áp dụng trực tiếp 1 bước; `medium` = thông hiểu, 2–3 bước; `hard` = vận dụng/vận dụng cao, nhiều bước, bài toán thực tế hoặc chứng minh/biện luận.
- **Phù hợp 3 bộ sách** (không sao chép nguyên văn nội dung sách giáo khoa — tự soạn đề gốc):
  - Dùng `bookNotes` trong `curriculum` để ánh xạ tên/thứ tự chương theo từng sách; chỉ sinh câu thuộc bài học thực sự có trong bộ sách đó.
  - Mỗi bộ sách có "phong cách" ngữ cảnh/cách diễn đạt riêng, dựa trên mô tả đã có trong `curriculum.textbooks[].description`: KNTT thiên về tình huống thực tiễn đời sống; CD thiên về bài tập phân hóa rõ mức độ; CTST thiên về hoạt động khám phá/trải nghiệm. Triển khai bằng thư viện ngữ cảnh/đề bài riêng cho từng sách (`contexts/KNTT.ts`, `CD.ts`, `CTST.ts`) chứ không chỉ đổi nhãn.
  - Câu thuộc nội dung chung thì gắn `textbooks` đúng bộ sách được sinh cho (không gắn cả 3 bừa bãi). Nội dung/ thuật ngữ khác nhau giữa các sách mà bạn **không chắc chắn** thì ghi vào `docs/TEXTBOOK_MAPPING_CAN_XAC_NHAN.md` để giáo viên xác nhận, **không tự bịa**.
- Mỗi câu sinh ra có đủ trường như câu hiện có: `id` (dạng `GEN_{grade}_{chapterId}_{templateId}_{seed}`), `code`, `grade`, `textbooks`, `semester`, `chapterId`, `lesson`, `topic`, `problemType`, `type`, `difficulty`, `cognitiveLevel`, `points`, `content`, `options` (kèm `errorType` cho phương án nhiễu — nhiễu phải là **lỗi sai thường gặp** của học sinh), `correctAnswer`, `acceptedAnswers`, `solution`, `rubricSteps`, `keyFormula`, `commonMistake`, `source: 'generator:v1'`, `verificationStatus`, `version`.
- **Trạng thái xác minh:** câu **qua `verify.ts`** được gắn `verificationStatus: 'verified'` kèm `verifiedBy: 'auto-engine'` (để dùng ngay trong đề cho học sinh). Giáo viên/Admin vẫn có thể hạ về `draft` hoặc loại bỏ trong `/admin/questions`. Câu không qua kiểm chứng không bao giờ được lưu.
- **Chống trùng:** tạo `fingerprint` = hash của nội dung đã chuẩn hóa (bỏ khoảng trắng, chuẩn hóa LaTeX). Không sinh trùng với ngân hàng hiện có, với đề đang tạo, và (tốt nhất) với các đề **gần đây của chính người dùng đó** (không chỉ 2 đề gần nhất của cả lớp).

### B.3.2 Tích hợp vào tạo đề (`src/lib/math-grader.ts` → `generateExamFromPool`, `src/app/api/exams/route.ts`)
- Giữ nguyên thứ tự ưu tiên: câu đã `verified` trong ngân hàng trước → **nếu thiếu so với ma trận yêu cầu thì tự động gọi engine sinh bù** đúng lớp / sách / chương / học kỳ / độ khó / loại câu, rồi mới tính là thiếu. Không còn "mượn" câu sai độ khó một cách âm thầm; nếu vẫn bắt buộc mượn mức kề cận thì phải ghi rõ trong `composition` và hiển thị cho người dùng.
- Chọn câu có **ngẫu nhiên có kiểm soát** (seed lưu trong đề để tái lập), đảm bảo hai đề cùng cấu hình không giống hệt nhau.
- Đề thi lưu `questionIds`; các câu sinh mới dùng trong đề **phải được lưu vào kho câu hỏi** (cùng nơi `getQuestionByIdMap(state)` đọc) để mở lại đề, nộp bài và chấm điểm vẫn tìm thấy. **Chỉ lưu những câu thực sự được đưa vào đề** (không lưu hàng nghìn câu thừa) để không làm phình file/trạng thái; hãy đọc `src/lib/hot-store.ts` và `PERFORMANCE_DASHBOARD.md` để không làm chậm các API nóng.
- Chế độ `previewOnly` vẫn dùng được: xem trước câu sinh mà chưa lưu.
- Đảm bảo `sanitizeQuestionForInProgressExam` vẫn che đáp án/lời giải với các câu sinh mới.

### B.3.3 Công cụ cho giáo viên/Admin (`/admin/questions`)
- Thêm nút **"Sinh thêm câu hỏi"**: chọn lớp, bộ sách, chương, mức độ, loại câu, số lượng (tối đa ~200/lần) → xem trước danh sách (có công thức hiển thị bằng KaTeX) → "Lưu vào ngân hàng". Chỉ `TEACHER`/`ADMIN`.
- Hiển thị thống kê ngân hàng theo lớp × sách × chương × mức độ × loại (để thấy ô nào còn thiếu), và nhãn "Tự sinh" / "Nhập tay".
- Trong trang tạo đề `/exams/new`: hiển thị nguồn câu (ngân hàng / tự sinh), và thông báo lỗi tiếng Việt rõ ràng khi cấu hình không khả thi.

### B.3.4 (Tùy chọn, chỉ làm sau khi B.3.1–B.3.3 xong và chạy ổn) Lớp AI bổ trợ
- Nếu có `GEMINI_API_KEY`: cho phép Admin yêu cầu AI **đề xuất** thêm dạng bài mới theo chương/sách. Kết quả AI **chỉ vào hàng chờ `draft`**, không bao giờ tự `verified`; đáp án phải được kiểm tra lại bằng `mathjs` khi có thể. Không có khóa thì ẩn tính năng này và báo rõ, **không giả lập**.

### B.3.5 Kiểm thử & kiểm toán
- Thêm `scripts/test-question-engine.mjs` (đăng ký vào `npm run test`) kiểm tra: (a) với mỗi **lớp × sách × mức độ × loại câu**, sinh 200 câu đều qua `verify`, ≥ 99% nội dung khác nhau; (b) cùng `(templateId, seed)` ra cùng câu; (c) tạo đề `hard` cho từng lớp/sách **không còn 422** và đủ số câu hard thật; (d) câu sinh được chấm đúng bởi `math-grader.ts` (đáp án đúng → đủ điểm, nhiễu → sai); (e) phủ **mọi chương** của curriculum.
- Cập nhật `scripts/bank-audit.mjs` để báo cáo cả số template và dung lượng sinh được theo từng ô lớp × sách × chương × mức độ, và cảnh báo ô nào có < 4 template.
- Cập nhật `README.md` và `CHANGELOG_NANG_CAP.md`: cách thêm template mới, cách chạy audit.

---

# TIÊU CHÍ NGHIỆM THU

**Phần A**
- [ ] Bấm "Lấy mã khôi phục" không còn lỗi "Hành động không hợp lệ".
- [ ] Có SMTP hợp lệ → email chứa mã 6 số về hộp thư (kể cả Gmail) trong vài giây; nhập mã + mật khẩu mới đăng nhập được.
- [ ] Chưa cấu hình SMTP → giao diện báo rõ "Hệ thống chưa cấu hình gửi email", không báo thành công giả.
- [ ] Mã sai/hết hạn/dùng lại đều bị từ chối đúng cách; production không rò mã.

**Phần B**
- [ ] Tạo đề **Khó** cho từng lớp 6–9 và từng bộ sách KNTT/CD/CTST thành công (không 422), đúng số câu hard.
- [ ] Hai lần tạo đề cùng cấu hình cho hai bộ câu khác nhau.
- [ ] Mọi câu sinh ra qua `verify`, đáp án đúng, có lời giải và rubric.
- [ ] `npm run test` và `npm run build` đều xanh; `npm run bank:audit` không còn ô trống.

**Cuối cùng, báo cáo:** liệt kê file đã sửa/tạo, các biến môi trường người dùng cần điền (SMTP_*), các mục cần giáo viên xác nhận (`docs/TEXTBOOK_MAPPING_CAN_XAC_NHAN.md`), và những gì chưa làm được.
