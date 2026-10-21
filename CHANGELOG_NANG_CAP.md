# BÁO CÁO & NHẬT KÝ NÂNG CẤP TOÀN DIỆN — MATHMASTER THCS (v3.0)

Tài liệu này tổng hợp toàn bộ các thay đổi kiến trúc, bảo mật, thuật toán tạo đề/chấm điểm, mở rộng ngân hàng câu hỏi và chuyển đổi giao diện theo đúng **4 Giai đoạn** trong `ANTIGRAVITY_PROMPT.md`.

---

## 1. Tổng hợp Thay đổi theo 4 Giai đoạn

### Giai đoạn 1 — Xác thực Tài khoản Chuẩn & Quản lý Phiên Đa thiết bị (`commit 20d3b4a`)
1. **Băm mật khẩu an toàn (`src/lib/auth.ts`):**
   - Sử dụng `crypto.scrypt` tích hợp sẵn của Node.js với `salt` ngẫu nhiên 16 byte riêng cho từng người dùng theo định dạng `scrypt$<N>$<r>$<p>$<saltHex>$<hashHex>`.
   - So sánh mật khẩu bằng `crypto.timingSafeEqual` để chống tấn công kênh kề thời gian (timing attack).
   - Loại bỏ hoàn toàn nhánh so sánh mật khẩu dạng văn bản thuần (`storedHash === password`).
   - Hỗ trợ cơ chế nâng cấp mật khẩu tự động (`needsRehash`) từ định dạng SHA-256 cũ (`hashed_<sha256>`) sang `scrypt` ngay sau lần đăng nhập hợp lệ đầu tiên.
2. **Xác thực đầu vào & Chống Brute-Force (`src/app/api/auth/route.ts`):**
   - Kiểm tra dữ liệu đầu vào bằng **Zod**: email hợp lệ, tên đăng nhập `3–30` ký tự `[a-zA-Z0-9_]`, mật khẩu tối thiểu 8 ký tự có cả chữ và số.
   - Giới hạn tốc độ đăng nhập (Rate Limiting): tối đa 5 lần thất bại / 15 phút trên mỗi cặp `IP + identifier`, trả mã HTTP `429 Too Many Requests` kèm `Retry-After`.
3. **JWT & Cookie Phiên (`src/lib/auth.ts`, `src/middleware.ts`):**
   - Token ký bằng HMAC-SHA256 chứa đầy đủ claims `sub` (userId), `role`, `sid` (sessionId), `iat`, `exp`, `iss: "mathmaster-thcs"`.
   - Bắt buộc khai báo `AUTH_SECRET` tối thiểu 32 ký tự trong môi trường `production`.
   - Thiết lập cookie `mm_session` với cờ `HttpOnly; SameSite=Lax; Path=/` (và `Secure` khi `NODE_ENV=production`).
4. **Cô lập Phiên theo Thiết bị & Chặn Rò rỉ Dữ liệu (`src/app/api/sessions/route.ts`, `src/app/api/state/route.ts`):**
   - Bổ sung bảng `user_sessions` lưu thiết bị, địa chỉ IP, `lastActiveAt`, `expiresAt`, `revokedAt`.
   - Hỗ trợ giới hạn số thiết bị đăng nhập đồng thời (`MAX_SESSIONS_PER_USER`, mặc định `5`); tự động thu hồi phiên cũ nhất khi vượt ngưỡng.
   - Xóa bỏ hoàn toàn biến toàn cục `currentUserId` dùng chung trong `.data/local_db_state.json`.
   - Bảo vệ toàn bộ API (`/api/state`, `/api/exams`, `/api/attempts`, `/api/documents`, `/api/ai/assistant`) bằng `requireUser(request)` / `requireRole(request, roles)`. Không bao giờ trả `passwordHash` hoặc dữ liệu của người dùng khác về phía trình duyệt.

---

### Giai đoạn 2 — Tạo Đề Thi Đúng Độ Khó, Chấm Điểm Từng Phần & Mở Rộng Ngân Hàng Câu Hỏi (`commit 2d5dfc9`)
1. **Hợp nhất nguồn sự thật duy nhất (`src/lib/math-grader.ts`):**
   - Xóa bỏ file trùng lặp `src/lib/math-grader.mjs`, giữ `src/lib/math-grader.ts` làm module duy nhất cho cả ứng dụng Next.js và bộ kiểm thử tự động.
2. **Chuẩn hóa Thang 4 Mức độ Nhận thức (GDPT 2018):**
   - Ánh xạ nhất quán 100%:
     - `nhan_biet` (Nhận biết) $\leftrightarrow$ `difficulty: "easy"`
     - `thong_hieu` (Thông hiểu) $\leftrightarrow$ `difficulty: "medium"`
     - `van_dung` (Vận dụng) $\leftrightarrow$ `difficulty: "medium"`
     - `van_dung_cao` (Vận dụng cao) $\leftrightarrow$ `difficulty: "hard"`
3. **Thuật toán Tạo đề theo Ma trận 4 Mức độ (`generateExamFromPool`):**
   - Lọc cứng theo `grade`, `semester`, `chapterIds`, `topic`, `textbook` và trạng thái `verificationStatus`.
   - Hỗ trợ 4 preset ma trận chuẩn (**Cơ bản / Nền tảng**: `50/30/20/0`, **Tiêu chuẩn kiểm tra**: `30/40/20/10`, **Nâng cao**: `15/30/35/20`, **Thi vào lớp 10 / HSG**: `10/25/35/30`) và chế độ **Tùy chỉnh thanh kéo** có tổng bằng `100%`.
   - Quy đổi tỷ lệ phần trăm sang số câu nguyên bằng **Phương pháp Số dư lớn nhất (Largest Remainder Method)** đảm bảo tổng số câu luôn khớp tuyệt đối `totalQuestions`.
   - **Không lấy bừa câu hỏi sai mức độ**: Nếu thiếu câu hỏi ở bất kỳ mức độ nhận thức hoặc hình thức (`mcq`/`essay`) nào, trả về lỗi có cấu trúc `INSUFFICIENT_QUESTIONS` kèm mảng `shortages` chi tiết.
   - **Chống lặp đề theo từng học sinh** dựa trên lịch sử câu hỏi đã làm gần đây và hỗ trợ **PRNG có hạt giống (`seed`)** giúp giáo viên tái tạo chính xác cùng một đề thi.
   - Phân bổ thang điểm theo trọng số mức độ nhận thức và chuẩn hóa tổng điểm bằng đúng **`10.0`**, trả kèm thống kê `composition.byCognitiveLevel` và `composition.byType`.
4. **Nâng cấp Bộ Chấm Điểm Toán học (`gradeExamAttempt`):**
   - Loại bỏ hoàn toàn logic gán cứng mã câu `Q9_008`.
   - Chấm câu tự luận nhiều bước dựa trên `rubricSteps` (`evaluateEssayRubricSteps`), cho điểm từng phần (partial credit) theo các bước biến đổi học sinh trình bày được.
   - Phân loại lỗi sai tự động (`CALCULATION_ERROR`, `FORMULA_ERROR`, `SIGN_ERROR`, `MISSING_CONDITION`, `METHOD_ERROR`) dựa trên `distractorTypes` và `commonMistake` của từng câu hỏi.
5. **Công cụ Kiểm toán Ngân hàng (`scripts/bank-audit.mjs`) & Khuôn mẫu Sinh câu hỏi (`src/lib/question-templates.ts`):**
   - Xây dựng lệnh `npm run bank:audit` kiểm tra trùng ID/code, cú pháp KaTeX (`throwOnError: true`), biểu thức toán học (`mathjs`), sự nhất quán giữa `difficulty` và `cognitiveLevel`, và thống kê độ phủ toàn bộ 23 chương.
   - Mở rộng ngân hàng câu hỏi trong `prisma/question_bank/grade_6.json`, `grade_7.json`, `grade_8.json`, `grade_9.json` lên tổng cộng **333 câu hỏi** (37 câu `verified` gốc + 296 câu `draft` sinh từ khuôn mẫu tham số hóa có nghiệm đẹp).

---

### Giai đoạn 3 — Tính Năng Học Tập, Ôn Tập SM-2, Lớp Học Giáo Viên & Quản Trị (`commit c2b8a7c`)
1. **Bảng điều khiển & Phân tích Năng lực (`src/app/api/analytics/route.ts`):**
   - Thống kê xu hướng điểm 10 đề gần nhất, độ thành thạo theo từng chương (`chapterMastery`), tỷ lệ đúng theo 4 mức độ nhận thức (`cognitiveMastery`), tự động phát hiện 2 chương yếu nhất và bảng xếp hạng ẩn danh tùy chọn (opt-in leaderboard).
2. **Sổ Tay Lỗi Sai & Lặp Lại Ngắt Quãng SM-2 (`src/app/api/review/route.ts`):**
   - Tự động lưu câu làm sai vào `review_queue` với các trường `easeFactor`, `intervalDays`, `repetitions`, `nextReviewAt`, `errorCategory`.
   - Cập nhật lịch ôn tập theo thuật toán **SM-2** với 4 mức tự đánh giá của học sinh (`0: Quên hẳn`, `1: Nhớ mang máng`, `2: Làm được nhưng chậm`, `3: Thành thạo`).
   - Hỗ trợ tạo **Mini-Đề Ôn Câu Sai (5–10 câu)** lấy từ hàng đợi cần ôn kết hợp câu hỏi cùng dạng (`problemType`).
3. **Luyện Tập Từng Chương Có Gợi Ý 3 Bước & Đề Thích Ứng (`src/app/api/practice/route.ts`):**
   - Chế độ luyện tập không giới hạn thời gian, cung cấp gợi ý từng bước (**Bước 1**: Công thức cốt lõi, **Bước 2**: Cảnh báo lỗi thường gặp, **Bước 3**: Lời giải chi tiết) và chấm điểm tức thì.
   - Chế độ tạo đề thích ứng **"Luyện điểm yếu" (`weak_topics`)**: tự động chọn câu hỏi thuộc các chương có độ thành thạo $< 60\%$ ở mức Nhận biết & Thông hiểu để củng cố gốc.
4. **Vai trò Giáo viên (`TEACHER`) & Quản lý Lớp học (`src/app/api/classrooms/route.ts`):**
   - Giáo viên tạo lớp học với mã tham gia 6 ký tự (`joinCode`), học sinh nhập mã để vào lớp.
   - Giáo viên giao đề thi cho lớp (`classroom_assignments`), xem bảng điểm cả lớp và thống kê **Top 5 câu hỏi học sinh làm sai nhiều nhất** để chữa bài trên lớp.
5. **Quản trị Ngân hàng Câu hỏi & Độ khó Thực nghiệm (`src/app/api/questions/route.ts`):**
   - Giáo viên và Quản trị viên duyệt câu hỏi từ `draft` $\rightarrow$ `verified`, chỉnh sửa nội dung, nhập/xuất file JSON.
   - Tự động cập nhật `attemptCount`, `correctCount` và `empiricalDifficulty = 1 - (correctCount / attemptCount)` sau mỗi lượt nộp bài, cảnh báo các câu hỏi có độ khó thực nghiệm lệch xa mức nhận thức khai báo.

---

### Giai đoạn 4 — Giao Diện Next.js App Router, Tailwind CSS, KaTeX & Chart.js Cục Bộ
1. **Chuyển đổi sang Next.js App Router (12 tuyến trang chuyên biệt):**
   - `/login` & `/register`: Trang đăng nhập và đăng ký tài khoản chuẩn với hiển thị lỗi trực quan theo từng trường.
   - `/dashboard`: Tổng quan năng lực cá nhân, biểu đồ xu hướng điểm số (Chart.js Line) và biểu đồ độ thành thạo theo chương (Chart.js Bar), cảnh báo 2 chương yếu nhất kèm nút luyện ngay.
   - `/exams/new`: Trình tạo đề 3 bước (Chọn phạm vi $\rightarrow$ Chỉnh ma trận 4 mức độ nhận thức với thanh hiển thị trực tiếp số câu hiện có trong kho $\rightarrow$ Xem trước cấu trúc điểm & bắt đầu thi).
   - `/exams/[id]`: Phòng làm bài thi tập trung với bảng màu câu hỏi (Question Palette), đồng hồ đếm ngược, chỉ báo tự động lưu (`Đang lưu...` / `Đã lưu lúc HH:MM:SS`), bàn phím ký hiệu Toán học ($\sqrt{x}, x^2, \frac{a}{b}, \pi, \leq, \geq, \neq, \triangle, \widehat{ABC}$) và nút **In đề PDF / In kèm đáp án** khổ A4.
   - `/exams/[id]/result`: Kết quả chấm điểm chi tiết theo 4 mức độ nhận thức, chấm từng bước tự luận (`rubricSteps`), phân tích nguyên nhân sai và đối chiếu lời giải KaTeX.
   - `/practice`: Luyện tập từng chương không giới hạn thời gian với gợi ý 3 bước.
   - `/review`: Sổ tay lỗi sai & Lặp lại ngắt quãng SM-2 + Tạo Mini-Đề ôn câu sai.
   - `/history`: Lịch sử làm bài và khôi phục đề thi đang làm dở.
   - `/formulas`: Sổ tay công thức Toán 6–9 & danh sách câu hỏi yêu thích.
   - `/teacher`: Không gian Giáo viên quản lý lớp học, mã lớp, giao bài tập và xem bảng điểm.
   - `/admin/questions`: Quản trị ngân hàng câu hỏi, duyệt `draft -> verified`, cảnh báo độ khó thực nghiệm và nhập/xuất JSON.
   - `/settings/devices`: Quản lý các thiết bị đang đăng nhập và thu hồi phiên từ xa.
2. **Thư viện Cục bộ (Không phụ thuộc CDN khi mất mạng):**
   - Sử dụng trực tiếp gói `tailwindcss`, `katex` (`katex/dist/katex.min.css`) và `chart.js` từ `node_modules`.
3. **Quyết định đối với `public/mathmaster_thcs.html`:**
   - Giữ lại `public/mathmaster_thcs.html` làm giao diện tương thích (offline/demo), nhưng **đã xóa bỏ hoàn toàn cơ chế "Chọn nhanh tài khoản có sẵn" không cần mật khẩu** và xóa toàn bộ trường `passwordHash` khỏi dữ liệu mẫu phía client, thay bằng hộp thoại đăng nhập xác thực mật khẩu qua `/api/auth` và liên kết sang các trang App Router mới.

---

## 2. Hướng dẫn Chạy Kiểm thử & Kiểm toán Ngân hàng Câu hỏi

```powershell
# 1. Kiểm toán toàn bộ Ngân hàng câu hỏi (333 câu, kiểm tra KaTeX, mathjs, ma trận độ phủ)
npm run bank:audit

# 2. Chạy 14 bộ kiểm thử tự động toàn diện (Auth, Session, Matrix Exam, Rubric Grading, SM-2, Teacher/Admin)
npm run test

# 3. Kiểm tra biên dịch Production Next.js
npm run build
```

---

## 3. Bảng Ma Trận Độ Phủ Ngân Hàng Câu Hỏi Sau Khi Mở Rộng (333 Câu Hỏi)

Kết quả trích xuất trực tiếp từ lệnh `npm run bank:audit` (**0 lỗi KaTeX, 0 lỗi mathjs, 100% chương đạt đủ 4 mức độ nhận thức & cả Trắc nghiệm + Tự luận**):

### Tổng hợp theo Khối Lớp & Mức độ Nhận thức
| Khối Lớp | Nhận biết (`nhan_biet`) | Thông hiểu (`thong_hieu`) | Vận dụng (`van_dung`) | Vận dụng cao (`van_dung_cao`) | Tổng số câu | Đã duyệt (`verified`) | Bản nháp (`draft`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Toán Lớp 6** | 20 (V:2/D:18) | 20 (V:2/D:18) | 22 (V:4/D:18) | 19 (V:1/D:18) | **81** | 9 | 72 |
| **Toán Lớp 7** | 19 (V:1/D:18) | 21 (V:3/D:18) | 20 (V:2/D:18) | 19 (V:1/D:18) | **79** | 7 | 72 |
| **Toán Lớp 8** | 22 (V:2/D:20) | 24 (V:4/D:20) | 24 (V:4/D:20) | 22 (V:2/D:20) | **92** | 12 | 80 |
| **Toán Lớp 9** | 20 (V:2/D:18) | 20 (V:2/D:18) | 22 (V:4/D:18) | 19 (V:1/D:18) | **81** | 9 | 72 |
| **Toàn bộ THCS** | **81** | **85** | **88** | **79** | **333** | **37** | **296** |

### Chi tiết theo Lớp × Học kỳ × Chương × Mức độ × Hình thức (23/23 Chương)
| Lớp | Học kỳ | Mã Chương | Tên Chương | NB | TH | VD | VDC | Trắc nghiệm (`mcq`) | Tự luận (`essay`) | Tổng cộng |
| :---: | :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Lớp 6** | HK1 | `G6_C1` | Tập hợp các số tự nhiên | 4 | 3 | 4 | 3 | 9 | 5 | **14** |
| **Lớp 6** | HK1 | `G6_C2` | Số nguyên | 3 | 4 | 4 | 3 | 8 | 6 | **14** |
| **Lớp 6** | HK1 | `G6_C3` | Các hình phẳng trong thực tiễn | 3 | 3 | 4 | 3 | 8 | 5 | **13** |
| **Lớp 6** | HK2 | `G6_C4` | Phân số và Số thập phân | 3 | 4 | 4 | 3 | 8 | 6 | **14** |
| **Lớp 6** | HK2 | `G6_C5` | Hình học phẳng cơ bản (Điểm, Đoạn thẳng, Góc) | 4 | 3 | 3 | 3 | 8 | 5 | **13** |
| **Lớp 6** | HK2 | `G6_C6` | Thống kê và Xác suất thực nghiệm | 3 | 3 | 3 | 4 | 8 | 5 | **13** |
| **Lớp 7** | HK1 | `G7_C1` | Số hữu tỉ | 4 | 3 | 3 | 3 | 8 | 5 | **13** |
| **Lớp 7** | HK1 | `G7_C2` | Số thực và Căn bậc hai số học | 3 | 4 | 3 | 4 | 8 | 6 | **14** |
| **Lớp 7** | HK1 | `G7_C3` | Góc và Đường thẳng song song | 3 | 4 | 3 | 3 | 8 | 5 | **13** |
| **Lớp 7** | HK2 | `G7_C4` | Tỉ lệ thức và Đại lượng tỉ lệ | 3 | 3 | 4 | 3 | 7 | 6 | **13** |
| **Lớp 7** | HK2 | `G7_C5` | Biểu thức đại số và Đa thức một biến | 3 | 4 | 3 | 3 | 8 | 5 | **13** |
| **Lớp 7** | HK2 | `G7_C6` | Tam giác bằng nhau và Các đường đồng quy | 3 | 3 | 4 | 3 | 8 | 5 | **13** |
| **Lớp 8** | HK1 | `G8_C1` | Đa thức nhiều biến và Hằng đẳng thức đáng nhớ | 5 | 5 | 4 | 5 | 12 | 7 | **19** |
| **Lớp 8** | HK1 | `G8_C2` | Phân thức đại số | 5 | 4 | 5 | 4 | 11 | 7 | **18** |
| **Lớp 8** | HK1 | `G8_C3` | Tứ giác và Định lí Pythagore | 4 | 6 | 4 | 4 | 12 | 6 | **18** |
| **Lớp 8** | HK2 | `G8_C4` | Phương trình bậc nhất và Hàm số bậc nhất | 4 | 5 | 5 | 5 | 11 | 8 | **19** |
| **Lớp 8** | HK2 | `G8_C5` | Định lí Thalès và Tam giác đồng dạng | 4 | 4 | 6 | 4 | 11 | 7 | **18** |
| **Lớp 9** | HK1 | `G9_C1` | Phương trình và Hệ hai PT bậc nhất hai ẩn | 3 | 4 | 3 | 3 | 8 | 5 | **13** |
| **Lớp 9** | HK1 | `G9_C2` | Bất phương trình và Căn bậc hai, Căn bậc ba | 4 | 3 | 4 | 3 | 8 | 6 | **14** |
| **Lớp 9** | HK1 | `G9_C3` | Hệ thức lượng trong tam giác vuông và Đường tròn | 3 | 3 | 4 | 3 | 8 | 5 | **13** |
| **Lớp 9** | HK2 | `G9_C4` | Hàm số $y = ax^2$ và Phương trình bậc hai một ẩn | 3 | 4 | 4 | 3 | 8 | 6 | **14** |
| **Lớp 9** | HK2 | `G9_C5` | Tứ giác nội tiếp & Hình trụ, Hình nón, Hình cầu | 4 | 3 | 3 | 3 | 8 | 5 | **13** |
| **Lớp 9** | HK2 | `G9_C6` | Chuyên đề Tổng hợp Luyện thi vào Lớp 10 THPT | 3 | 3 | 4 | 4 | 8 | 6 | **14** |

---

## 4. Báo Cáo Nâng Cấp V2 — Quên Mật Khẩu & Parametric Question Engine (`ANTIGRAVITY_PROMPT_FIX_V2.md`)

### 4.1. Phần A — Hoàn thiện Luồng Quên Mật Khẩu & Dịch Vụ Gửi Email Thật (`commit 93cff6f`)
1. **Chuẩn hoá action và mã khôi phục 6 chữ số an toàn**:
   - Tạo module chuẩn hóa `src/lib/auth-actions.ts` (`AUTH_ACTIONS`), hỗ trợ cả `forgot_password` và `forgot-password`, `reset_password` và `reset-password`.
   - Sinh mã xác nhận 6 số ngẫu nhiên qua `crypto.randomInt(100000, 1000000)` (`src/lib/auth.ts`).
   - Băm mã xác nhận bằng `crypto.createHmac('sha256', AUTH_SECRET)` trước khi lưu trữ (`passwordResetToken`).
   - So sánh mã bằng `crypto.timingSafeEqual` (`verifyResetCode`).
   - Giới hạn 5 lần thử sai tối đa (`resetAttempts >= 5` thì vô hiệu hóa mã vĩnh viễn), thời gian hết hạn mã là 15 phút.
   - Giới hạn tốc độ gửi lại email: 60 giây giãn cách giữa hai lần gửi.
2. **Dịch vụ gửi email SMTP thật bằng `nodemailer` (`src/lib/mailer.ts`)**:
   - Tích hợp `nodemailer` với cấu hình linh hoạt từ biến môi trường (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
   - Hướng dẫn cấu hình chi tiết cho Gmail App Password, Brevo, Resend trong `.env.example`.
   - Email mẫu HTML tiếng Việt chuẩn mực, hỗ trợ fallback plain text rõ ràng.
   - Báo lỗi trung thực HTTP 503 khi chưa cấu hình SMTP hoặc lỗi gửi mail, tuyệt đối không trả `sent: true` giả.
3. **Giao diện Quên mật khẩu 2 bước (`src/app/login/page.tsx`)**:
   - Bước 1: Nhập email, hiển thị email che chắn dạng `a***@gmail.com`.
   - Bước 2: Nhập mã xác nhận 6 chữ số và mật khẩu mới kèm thước đo độ mạnh mật khẩu (Password Strength Meter).
   - Bộ đếm ngược 60 giây trước khi cho phép bấm nút "Gửi lại mã".
   - Tự động nhận diện query parameters trên URL (ví dụ: `?mode=reset&email=...`).

### 4.2. Phần B — Parametric Question Engine Không Giới Hạn & Tạo Đề Zero-422
1. **Kiến trúc Engine Độc Lập (`src/lib/question-engine/`)**:
   - `rng.ts`: Bộ sinh số ngẫu nhiên giả lập `Mulberry32 PRNG` có hạt giống (`seed`), đảm bảo tính tái lập 100%.
   - `verify.ts`: Thẩm định độc lập 4 lớp: KaTeX parse 0 lỗi, trắc nghiệm đủ 4 lựa chọn phân biệt & đúng 1 đáp án, tự luận tổng điểm `rubricSteps` bằng đúng `points`, kiểm chứng số học `mathjs`.
   - `contexts/`: Cung cấp bối cảnh thực tế đặc trưng cho 3 bộ sách (`KNTT.ts`, `CD.ts`, `CTST.ts`).
   - `templates/`: 276 template tham số hóa chi tiết:
     - Lớp 6 (`grade6.ts`): 72 templates (6 chương `G6_C1`..`G6_C6`, 4 easy, 4 med, 4 hard mỗi chương).
     - Lớp 7 (`grade7.ts`): 72 templates (6 chương `G7_C1`..`G7_C6`, 4 easy, 4 med, 4 hard mỗi chương).
     - Lớp 8 (`grade8.ts`): 60 templates (5 chương `G8_C1`..`G8_C5`, 4 easy, 4 med, 4 hard mỗi chương).
     - Lớp 9 (`grade9.ts`): 72 templates (6 chương `G9_C1`..`G9_C6`, 4 easy, 4 med, 4 hard mỗi chương).
     - Phủ 100% cả 2 hình thức: Trắc nghiệm khách quan (`mcq`) và Tự luận (`essay`).
   - `computeFingerprint`: Băm SHA-256 nội dung chuẩn hóa chống trùng lặp câu hỏi.
2. **Tích hợp Tự động Bù đắp Thiếu hụt Đề thi (`src/lib/math-grader.ts`, `src/app/api/exams/route.ts`)**:
   - Trong `generateExamFromPool`: khi phát hiện thiếu câu hỏi so với ma trận quota yêu cầu, tự động gọi engine sinh bù câu hỏi chuẩn SGK đúng mức độ nhận thức.
   - Loại bỏ triệt để lỗi 422 `INSUFFICIENT_QUESTIONS` cho mọi cấu hình đề thi hợp lý (kể cả khi kho câu hỏi tĩnh rỗng).
   - Chỉ lưu vào cơ sở dữ liệu các câu hỏi thực sự được chọn vào đề thi (tránh phình bộ nhớ).
3. **Công cụ Quản trị viên & Trải nghiệm Tạo đề**:
   - Modal "Sinh câu hỏi tự động (Engine)" tại `/admin/questions` cho phép giáo viên/admin chọn lớp, sách, độ khó, hình thức, số lượng, xem trước KaTeX trực tiếp và lưu vào ngân hàng verified.
   - Thống kê độ phủ 276 template hiển thị trực quan trong giao diện quản trị.
   - Màn hình `/exams/new` cập nhật thông báo tự động bù đắp thông minh qua Parametric Engine.
4. **Tài liệu & Kiểm thử Tự động**:
   - `docs/TEXTBOOK_MAPPING_CAN_XAC_NHAN.md`: Bảng đối chiếu chi tiết nội dung 3 bộ SGK KNTT, Cánh Diều, Chân Trời Sáng Tạo.
   - `scripts/test-question-engine.mjs`: Test suite tự động (7/7 tests pass).
   - `scripts/test-flows.mjs`: Đạt 17/17 tests pass (Test 1..17).
   - `npm run build`: 20/20 routes biên dịch thành công 100%.
