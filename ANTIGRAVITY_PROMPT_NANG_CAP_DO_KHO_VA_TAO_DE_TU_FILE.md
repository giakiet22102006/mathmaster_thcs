# NHIỆM VỤ: NÂNG CẤP ĐỘ KHÓ CÂU VẬN DỤNG / VẬN DỤNG CAO + HOÀN THIỆN "TẠO ĐỀ TỪ FILE ĐỀ CƯƠNG / BÀI TẬP" CHO "MathMaster THCS"

Bạn là kỹ sư full-stack senior kiêm giáo viên Toán THCS giàu kinh nghiệm ra đề. Dự án: Next.js 14 (App Router) + Prisma + PostgreSQL, deploy Vercel (có `.vercel/`, `vercel.json`).

**Quy trình bắt buộc**
1. Đọc kỹ các file nêu ở từng phần trước khi sửa. Tạo *Implementation Plan* + *Task List* rồi mới code.
2. Làm theo thứ tự **PHẦN A (độ khó) → PHẦN B (tạo đề từ file)**. Xong mỗi phần: chạy `npm run test`, `npm run test:engine`, `npm run bank:audit`, `npm run build`; commit riêng; báo cáo ngắn (đã làm / chưa làm được / người dùng cần cấu hình gì).
3. Không phá chức năng đang chạy. Không in nội dung `.env` ra log/báo cáo, không commit khóa bí mật.
4. Giao diện, thông báo lỗi, comment: **tiếng Việt**. Tên biến/hàm: tiếng Anh.
5. **Không giả lập thành công.** Chưa có API key / chưa trích xuất được thì báo rõ, tuyệt đối không bịa đáp án hay trả `ok: true` giả.
6. Các phát hiện dưới đây được rút ra bằng đọc code tĩnh, **hãy tự kiểm chứng lại** trước khi sửa. Ví dụ template nêu tên chỉ là mẫu: phải audit **toàn bộ** template, không chỉ danh sách này.

---

# PHẦN A — NÂNG CẤP CÂU VẬN DỤNG (VD) VÀ VẬN DỤNG CAO (VDC) ĐÚNG ĐỘ KHÓ, ĐÚNG KIẾN THỨC TỪNG LỚP

## A.0 Nguyên tắc yêu cầu từ chủ dự án
- **Sàn độ khó, không có trần:** câu gắn nhãn VD/VDC được phép khó hơn mức trung bình, **tuyệt đối không được dễ hơn** chuẩn của mức đó.
- **Đúng kiến thức lớp:** chỉ dùng kiến thức trong chương trình GDPT 2018 tới hết lớp đó (đối chiếu `docs/TEXTBOOK_MAPPING_CAN_XAC_NHAN.md` và `prisma/seed_data.json`). Khó hơn nhờ *kết hợp nhiều kiến thức, nhiều bước, biện luận*, **không** nhờ kiến thức chưa học.
- Câu thiếu hụt thì **báo thiếu**, không được lấp bằng câu dễ hơn.

## A.1 Nguyên nhân gốc đã xác định (tự kiểm chứng bằng code)

| # | Vị trí | Vấn đề |
|---|--------|--------|
| 1 | `src/lib/question-engine/index.ts` → `generateQuestions()` | Khi không có template khớp, code **nới lỏng bộ lọc**: bỏ `cognitiveLevel`, thậm chí lấy *bất kỳ* template nào của lớp. Nghĩa là slot "Vận dụng cao" có thể bị lấp bằng câu nhận biết. Đây là lỗi "đề không đúng độ khó". |
| 2 | `src/lib/math-grader.ts` → `difficultyMap` trong `generateExamFromPool` | `thong_hieu → 'easy'`, trong khi `CHANGELOG_NANG_CAP.md` ghi `thong_hieu ↔ medium`. Thang `difficulty` 3 mức không đủ phân biệt 4 mức nhận thức; `van_dung` và `thong_hieu` bị trộn. |
| 3 | `public/mathmaster_thcs.html` → `generateControlledExam` | Bản HTML cũ **không có ma trận 4 mức**. Nó chỉ ưu tiên `difficulty` rồi, nếu thiếu, lấy bất kỳ câu `verified` nào của lớp (`gradePool`). |
| 4 | Nhãn mức độ của template | Nhiều template gắn nhãn cao hơn độ khó thật (xem bảng A.2). Một nhãn `hard` thường chỉ là 1 kỹ thuật, 1–2 bước. |
| 5 | Số lượng/đa dạng | Chỉ khoảng 22–26 template VD và 24–48 template VDC mỗi lớp (trải trên 6 chương). `maxPerTemplate = 2` nhưng bản chất mỗi template chỉ đổi số, **không đổi cấu trúc bài**, nên học sinh thấy VDC lặp dạng và dễ. |
| 6 | `src/lib/question-engine/verify.ts` | Chỉ kiểm tra cú pháp KaTeX, rubric, 4 phương án khác nhau, mathjs cho biểu thức số học thuần. **Không có kiểm tra độ khó** và không giải độc lập các bài tự luận/tham số. |
| 7 | Điểm số | Câu VDC trắc nghiệm = 0.5 điểm bằng câu nhận biết; trọng số không phản ánh độ khó. |
| 8 | `prisma/question_bank/grade_*.json` | 296 câu, **100% `draft`** (mỗi mức đều nhau). Đề thực tế chủ yếu dựa vào câu engine tự gắn `verified` bằng `auto-engine`, tức độ tin cậy phụ thuộc hoàn toàn vào chất lượng template. |

## A.2 Mẫu template gắn nhãn sai độ khó đã đọc được (cần audit rồi sửa/viết lại)

| Template | Nhãn hiện tại | Thực tế |
|----------|---------------|---------|
| `T_G7_C2_HARD_01` (cạnh hình vuông từ diện tích, √S) | van_dung | 1 bước = nhận biết/thông hiểu |
| `T_G6_C2_HARD_01` (khoảng cách độ cao đỉnh núi – tàu ngầm) | van_dung | 1 phép tính = thông hiểu |
| `T_G9_C2_MED_02` (trục căn thức `4/(√5−1)`) | van_dung | thông hiểu |
| `T_G8_C1_HARD_01` (tách hạng tử `x²+sx+p`) | van_dung_cao | thông hiểu |
| `T_G8_C1_HARD_02` (GTNN `x²−2mx+c`) | van_dung_cao | vận dụng (thấp) |
| `T_G8_C1_HARD_03` (MCQ "biểu thức luôn dương") | van_dung_cao | thông hiểu, MCQ dễ đoán |
| `T_G6_C1_HARD_03` (chứng minh `2+2²+…+2^{2k}` chia hết 3) | van_dung_cao | vận dụng |
| `T_G6_C2_HARD_02` (tìm `n` để `k/(n−1)` nguyên) | van_dung_cao | vận dụng |
| `T_G9_C1_HARD_01` (chuyển động ngược chiều, lập hệ) | van_dung_cao | vận dụng chuẩn |
| `T_G9_C1_HARD_03` (hệ chứa `m`, nghiệm nguyên) | van_dung_cao | **suy biến**: `x=2m`, `y=1−m` luôn nguyên với mọi `m` nguyên nên câu vô nghĩa |

## A.3 Chuẩn độ khó cần áp dụng (tạo `src/lib/question-engine/difficulty-standard.ts`)

Mỗi mức có **sàn** về độ phức tạp. Thêm vào `QuestionTemplate` (và `EngineQuestion`) trường `complexity`:

```ts
interface ComplexityMeta {
  steps: number;               // số bước suy luận độc lập trong lời giải
  techniques: string[];        // kỹ thuật/kiến thức khác nhau phải dùng
  crossTopic: boolean;         // kết hợp >= 2 chủ đề/chương
  modeling: boolean;           // phải tự đặt ẩn/lập mô hình từ ngữ cảnh
  needsCaseAnalysis: boolean;  // biện luận điều kiện / xét trường hợp / loại nghiệm
  estMinutes: number;          // thời gian giải ước tính của HS khá
}
```

| Mức | steps ≥ | techniques ≥ | Đặc điểm bắt buộc | estMinutes |
|-----|---------|--------------|-------------------|-----------|
| Nhận biết | 1 | 1 | Nhớ/nhận diện định nghĩa, công thức, tính trực tiếp | 0.5–1 |
| Thông hiểu | 2 | 1 | Hiểu bản chất, áp dụng công thức/quy tắc có hướng dẫn | 1–2 |
| **Vận dụng** | **3** | **2** hoặc `modeling` | Tình huống mới/thực tế phải tự chuyển thành toán; kết hợp ≥ 2 kiến thức; không dùng 1 công thức một dòng | 3–5 |
| **Vận dụng cao** | **5** | **2** và (`crossTopic` hoặc `needsCaseAnalysis`) | Cần *ý tưởng* (đặt ẩn phụ, đánh giá, đổi biến, kẻ đường phụ, chứng minh, cực trị, biện luận tham số, nghiệm nguyên). Mức đề HSG cấp trường / câu cuối đề tuyển sinh 10 (với lớp 9) | 6–10 |

Quy tắc bổ sung:
- **Không dùng 1 công thức một dòng** cho VD/VDC. Nếu lời giải mẫu < số bước tối thiểu thì template bị từ chối.
- **VDC trắc nghiệm** chỉ cho phép khi đáp án đòi hỏi đủ `steps` và 3 phương án nhiễu được sinh từ **lỗi sai điển hình** (thiếu điều kiện, thiếu nghiệm, nhận nghiệm ngoại lai, sai dấu khi đổi biến), có `errorType`. Cấm mẫu "luôn dương / luôn âm / không xác định" kiểu 3 lựa chọn cảm tính. Với VDC khuyến khích tự luận có `rubricSteps` từng bước.
- **Không suy biến:** tham số sinh ra phải làm bài *thật sự cần* kỹ thuật cần kiểm tra (ví dụ không để `x=2m, y=1−m` luôn nguyên). Mỗi template có hàm `isNonDegenerate(params)`.
- **Điểm:** tự luận VD ≥ 1.0, VDC ≥ 1.5 (đề tự luận); trắc nghiệm VDC ≥ 0.75. Giữ tổng đề = đúng `10.0` bằng thuật toán chuẩn hóa sẵn có.

## A.4 Phạm vi kiến thức VD/VDC từng lớp (định hướng, bắt buộc đối chiếu chương trình thật)

Chỉ là gợi ý dạng bài. Antigravity phải đọc danh sách chương/bài thực tế trong `seed_data.json`, đối chiếu `docs/TEXTBOOK_MAPPING_CAN_XAC_NHAN.md`, và **chỉ dùng kiến thức đã học trong lớp đó**.

- **Lớp 6:** bài toán chia hết/ƯCLN–BCNN có nhiều ràng buộc (chia nhóm dư khác nhau, số trong khoảng cho trước); chứng minh chia hết bằng nhóm số hạng/đồng dư mức lớp 6; tổng dãy phân số tách hiệu `1/(n(n+1))`; so sánh lũy thừa/phân số khó; số nguyên tố/hợp số có biện luận; hình học phẳng ghép hình có ẩn.
- **Lớp 7:** `|x−a|+|x−b|(+|x−c|)` min/max; dãy tỉ số bằng nhau có điều kiện; tỉ lệ thuận/nghịch nhiều đại lượng nhiều bước; chứng minh tam giác bằng nhau nhiều bước, đường phụ; bất đẳng thức tam giác, đường vuông góc–đường xiên cho cực trị.
- **Lớp 8:** phân thức tìm `x` nguyên, GTLN/GTNN dạng phân thức/bậc 2 kèm điều kiện; phân tích đa thức bậc 3–4 (nhẩm nghiệm, đặt ẩn phụ); Thalès + tam giác đồng dạng chứng minh đẳng thức/tính tỉ số diện tích; bài toán thực tế lập phương trình/bất phương trình nhiều điều kiện.
- **Lớp 9:** Viète + tham số `m` (biểu thức đối xứng giữa hai nghiệm, điều kiện nghiệm); hệ chứa tham số có biện luận; phương trình chứa căn/ẩn phụ; bài toán thực tế lập phương trình bậc hai/hệ nhiều điều kiện; hình học đường tròn (tứ giác nội tiếp, tiếp tuyến, góc nội tiếp) chứng minh + cực trị; GTNN căn thức; nghiệm nguyên (dạng ôn thi vào 10).

## A.5 Việc phải làm

**A.5.1 Sửa lỗi gốc**
1. `index.ts`: bỏ hoàn toàn việc nới lỏng `cognitiveLevel` và `grade`. Chỉ được nới `textbook` / `semester` và phải trả cờ `relaxed: ['textbook', ...]` trong `stats`. Không đủ template thì trả ít câu hơn kèm `shortage`, **không lấp bằng mức khác**.
2. `math-grader.ts`: lấy `cognitiveLevel` làm nguồn sự thật. Thay `difficultyMap` bằng bảng thống nhất với changelog (hoặc bỏ phụ thuộc `difficulty` khi chọn câu). Thêm `difficultyScore` 1–10 tính từ `complexity` và dùng để sắp xếp/giới hạn trong đề.
3. `public/mathmaster_thcs.html`: khi `APP_STATE.backendConnected`, gọi `/api/exams`; khi offline, dùng logic ma trận 4 mức và **hiện lỗi thiếu câu** thay vì lấy `gradePool` bất kỳ. Xóa nhánh lấp câu bừa.

**A.5.2 Cổng kiểm tra độ khó trong `verify.ts`**
- Thêm kiểm tra `complexity` so với sàn A.3: không đạt → `valid: false` với thông báo rõ (`"Câu van_dung_cao chỉ có 2 bước (<5)"`).
- Đếm số bước từ `rubricSteps` và `solution` (tách theo dòng/`\\implies`/`\\Rightarrow`); không đủ thì từ chối.
- Với MCQ VD/VDC: kiểm tra 3 nhiễu có `errorType` và không trùng giá trị đúng khi quy đổi số.
- Thêm `verifyFn` độc lập theo từng dạng (brute-force nghiệm nguyên trong khoảng, thử lại nghiệm vào phương trình gốc, giải hệ bằng thế/khử số học, kiểm tra Δ và Viète bằng số). Đáp án template phải khớp `verifyFn`. Dùng `mathjs` đã có.

**A.5.3 Audit và sửa toàn bộ template**
- Tạo `scripts/audit-difficulty.mjs` (`npm run audit:difficulty`): với mỗi template sinh 200 seed, tính `complexity` trung bình, so với sàn, xuất `reports/difficulty-audit.md` + `.csv` gồm: id, nhãn hiện tại, mức *thực tế đề xuất*, lý do.
- Với mỗi template "gắn nhãn quá cao": **ưu tiên viết lại cho đủ độ khó** để giữ số lượng VD/VDC; chỉ hạ nhãn khi không thể nâng một cách đúng chương trình.
- Với template suy biến (như `T_G9_C1_HARD_03`): sửa lại hoặc loại.

**A.5.4 Viết thêm template VD/VDC**
- Mục tiêu tối thiểu: **mỗi chương ≥ 4 template VD và ≥ 3 template VDC**, trong đó VDC có ≥ 2 *cấu trúc bài khác nhau* (không chỉ đổi số). Lớp 9 thêm nhóm "ôn thi vào 10".
- Mỗi template phải có ≥ 3 *biến thể cấu trúc* (đổi dữ kiện cho, đổi đại lượng cần tìm, đổi bối cảnh), không chỉ đổi hằng số.
- Ngữ cảnh đời sống lấy từ `contexts/KNTT|CD|CTST.ts` nhưng phải đòi hỏi mô hình hóa thật (không chỉ ngụy trang một phép tính).
- Ghi rõ trong mỗi template: `complexity`, `isNonDegenerate`, `verifyFn`, `commonMistake`, `rubricSteps` (≥ số bước của mức).

**A.5.5 Ghép đề**
- Trong cùng một đề, các câu VD/VDC phải **khác `problemType`** và ưu tiên khác chương.
- Preset "Nâng cao" và "Thi vào lớp 10 / HSG" phải có ít nhất 1 câu VDC `crossTopic`.
- Sắp xếp câu trong đề tăng dần theo mức độ; thông báo `composition.byCognitiveLevel` thật sự đúng với nhãn đã được cổng A.5.2 chấp nhận.

## A.6 Kiểm thử và tiêu chí nghiệm thu PHẦN A
- `npm run audit:difficulty`: **0 template** dưới sàn độ khó của mức mình gắn nhãn.
- Mỗi tổ hợp (lớp × chương × mức VD/VDC): sinh 200 seed, **100% pass `verifyQuestion`**, ≥ 95% fingerprint khác nhau, 0 câu suy biến.
- Test mới: yêu cầu VDC ở chương không đủ template → nhận `INSUFFICIENT_QUESTIONS`/`shortage`, **không** nhận câu mức thấp hơn.
- Test mới: không có đường nào trong `generateQuestions` và `generateExamFromPool` trả câu có `cognitiveLevel` khác mức được yêu cầu (trừ khi bật `allowBorrowAdjacent`, và khi đó chỉ được mượn **lên** mức cao hơn, không mượn xuống).
- Cập nhật `scripts/test-question-engine.mjs`, `scripts/bank-audit.mjs`, `CHANGELOG_NANG_CAP.md`.

---

# PHẦN B — TẠO ĐỀ TỪ FILE ĐỀ CƯƠNG / BÀI TẬP DO NGƯỜI DÙNG TẢI LÊN

## B.0 Kết quả kiểm tra hiện trạng: **chức năng chưa hoàn chỉnh, cần xây thêm**

Đã có: trang "Tài liệu của tôi" trong `public/mathmaster_thcs.html`, API `src/app/api/documents/route.ts` (GET/POST), tùy chọn "Nguồn học liệu" (`STANDARD_BANK / COMBINED_DOCS / ONLY_DOCS`) và nút tạo đề từ tài liệu.

Còn thiếu hoặc sai (tự kiểm chứng):

| # | Vấn đề |
|---|--------|
| 1 | Chỉ file `.txt/.md/.csv/.json` được đọc nội dung. **PDF/DOCX/XLSX/ảnh không được trích xuất**: route trả `requiresApiKey` hoặc "sẵn sàng kết nối OCR" với `extractedText: ''`. Không có thư viện nào trong `package.json` để đọc PDF/DOCX, và **không có chỗ nào gọi API Gemini/Mathpix thật** (chỉ kiểm tra biến môi trường). |
| 2 | `parseQuestionsFromRawText` (HTML) chỉ hiểu định dạng `Câu N:` + `Đáp án:`. Nếu không khớp, nó tạo **một câu với đáp án giả `'1'`**. Vi phạm nguyên tắc không bịa. |
| 3 | Mọi câu từ tài liệu bị gán cứng: `essay`, `medium`, `van_dung`, 2.0 điểm, `chapterId` = chương đầu của lớp, không theo nội dung thật. |
| 4 | "Tạo đề từ tài liệu" (`createExamFromDocument`) thực chất chỉ gọi `generateControlledExam` trên ngân hàng chung; **không sinh câu mới dựa trên nội dung file**. `ONLY_DOCS` còn **âm thầm quay về toàn bộ ngân hàng** nếu chưa có câu từ tài liệu. |
| 5 | Trang tạo đề của Next.js (`src/app/exams/new/page.tsx`) và `/api/exams` **không có lựa chọn tài liệu** (không có `documentIds`). |
| 6 | Lưu file bằng `fs.writeFileSync` vào `public/uploads`: **sẽ lỗi trên Vercel** (hệ thống file chỉ đọc) và bị bắt bởi `catch` chung thành lỗi 500 mù mờ. `UPLOAD_STORAGE_DRIVER`, `SUPABASE_*` có trong `.env.example` nhưng chưa được dùng để lưu file. |

## B.1 Thiết kế luồng

```
Tải file → Lưu trữ (Supabase Storage / Vercel Blob / local khi dev)
        → Trích xuất văn bản (theo định dạng)
        → Tách thành các mục (câu hỏi / chủ đề / dạng bài)
        → Phân loại: lớp, chương, mức nhận thức, dạng bài
        → Màn hình duyệt (người dùng xác nhận/sửa)
        → Tạo đề theo 1 trong 2 chế độ
```

**Hai chế độ tạo đề (người dùng chọn):**
- **B-1 "Dùng lại câu trong file":** lấy đúng các câu trong tài liệu. Câu thiếu đáp án/lời giải → đánh dấu `needsReview`, chỉ gợi ý đáp án bằng AI khi có `GEMINI_API_KEY` và ghi rõ "AI đề xuất, chưa xác minh". **Không bao giờ điền đáp án mặc định.**
- **B-2 "Sinh đề MỚI dựa trên file" (mặc định):** từ file rút ra *chương, dạng bài, kỹ thuật, mức độ*, rồi:
  - (a) *Không cần AI:* khớp với template của engine theo `chapterId` + `problemType` + từ khóa chủ đề, sinh câu mới cùng dạng, cùng mức độ (áp dụng chuẩn PHẦN A).
  - (b) *Có `GEMINI_API_KEY`:* nhờ LLM sinh biến thể theo **cùng prompt chuẩn độ khó ở A.3/A.4**, trả JSON theo schema `zod`, rồi **bắt buộc đi qua `verifyQuestion` + `verifyFn`** trước khi dùng; câu không qua kiểm tra bị loại, tối đa 2 lần thử lại. Gắn `source: 'AI từ tài liệu'`, `verificationStatus: 'draft'` cho tới khi giáo viên duyệt hoặc đủ kiểm chứng tự động.
  - Nếu không đủ câu: trả lỗi thiếu có cấu trúc, **không lấp bằng ngân hàng chung** trừ khi người dùng chọn "Kết hợp".

## B.2 Trích xuất theo định dạng (`src/lib/documents/extract.ts`, `export const runtime = 'nodejs'`)

| Định dạng | Cách xử lý |
|-----------|-----------|
| TXT/MD/CSV/JSON | Đọc UTF-8 (đã có) |
| DOCX | `mammoth`. **Lưu ý:** công thức Word (OMML) dễ bị mất; phát hiện thẻ `m:oMath` trong `word/document.xml` rồi chuyển OMML→LaTeX, hoặc cảnh báo rõ "file có công thức Word, kết quả có thể thiếu" |
| PDF có lớp chữ | `unpdf` hoặc `pdfjs-dist` (trích văn bản theo trang) |
| PDF scan / ảnh (PNG, JPG) | Gemini vision hoặc Mathpix nếu có key (**cài đặt thật**, kèm giới hạn trang, timeout, retry). Chưa có key → trả `requiresApiKey: true` + hướng dẫn dán văn bản thủ công. Không giả lập kết quả |
| XLSX | `exceljs` hoặc `xlsx`: mỗi dòng/cột câu hỏi được ánh xạ qua màn hình chọn cột |

Yêu cầu chung: kiểm tra phần mở rộng **và** magic bytes (MIME sniffing), giới hạn `MAX_UPLOAD_SIZE_MB`, giới hạn số trang/ký tự, chống zip bomb, `path` an toàn (không dùng tên file gốc để ghi đường dẫn), kiểm tra quyền sở hữu (`requireUser`), rate limit, API **xóa** tài liệu (xóa luôn file lưu trữ). Thời gian dài → `maxDuration`, trạng thái `PROCESSING → READY | FAILED` thay vì chặn request.

## B.3 Bóc tách câu hỏi (`src/lib/documents/segment.ts`)
- Nhận dạng đầu câu: `Câu 1:`, `Câu 1.`, `Bài 1`, `1)`, `1.`, `Question 1`, `Ví dụ`, kể cả khi khác khoảng trắng/ký tự đặc biệt.
- Nhận dạng phương án `A. B. C. D.` (và `A)`), bảng đáp án cuối đề (`1-A 2-C…`), mục "Đáp án/Lời giải/Hướng dẫn".
- Nhận dạng và giữ nguyên LaTeX (`$…$`, `\\(…\\)`), chuẩn hóa ký hiệu Unicode (`²`, `√`, `≤`, `×`) sang LaTeX; kiểm tra bằng KaTeX trước khi lưu.
- Với mỗi mục suy luận: `grade`, `chapterId`, `topic`, `problemType`, `cognitiveLevel`, `type`. Dùng luật từ khóa + so khớp với danh sách chương trong `seed_data.json`; có key thì thêm LLM phân loại. **Mức độ ước lượng bằng chuẩn `complexity` ở A.3**, đặt `confidence`; độ tin cậy thấp thì đánh dấu để người dùng xác nhận. **Không gán cứng `van_dung`/2.0 điểm**.
- Không tìm được cấu trúc câu: trả `parseWarnings` và để người dùng chỉnh tay, **không tạo câu rác**.

## B.4 Dữ liệu và API
- Xem `prisma/schema.prisma` và `src/lib/hot-store.ts`/`src/lib/prisma.ts` để quyết định nơi lưu (đang có `documents` trong state). Thêm migration Prisma nếu cần các trường: `status`, `storageKey`, `parseWarnings`, `extractedMeta`, `sourceDocId` ở câu hỏi, `confidence`, `needsReview`.
- `POST /api/documents`: nhận nhiều file, trả `documentId` + `status`.
- `GET /api/documents/[id]`: trạng thái, văn bản, danh sách mục đã bóc tách.
- `PATCH /api/documents/[id]/items`: người dùng sửa/xác nhận mục, chương, mức độ, đáp án.
- `DELETE /api/documents/[id]`.
- Mở rộng `POST /api/exams`: thêm `sourceMode: 'BANK' | 'DOCS_REUSE' | 'DOCS_SIMILAR' | 'MIXED'` và `documentIds: string[]`. Kết quả trả thêm `composition.bySource`. Lỗi thiếu dùng cấu trúc `INSUFFICIENT_QUESTIONS` sẵn có.
- Câu từ tài liệu **riêng tư theo người dùng**, không thêm vào ngân hàng chung trừ khi giáo viên/admin duyệt.

## B.5 Giao diện
- **Next.js (`src/app/exams/new/page.tsx`):** thêm bước "Nguồn đề": *Ngân hàng chuẩn / Từ file của tôi / Kết hợp*. Khi chọn file: khu vực kéo-thả + danh sách tài liệu đã tải, chọn nhiều file, chọn chế độ B-1/B-2, thanh trạng thái xử lý.
- **Màn hình duyệt kết quả trích xuất:** bảng các mục đã tách (nội dung hiển thị KaTeX, chương, mức độ, đáp án, cờ `needsReview`, `confidence`), sửa/xóa/thêm tay, cảnh báo OCR/công thức nếu có.
- Thông báo lỗi tiếng Việt, rõ nguyên nhân và cách khắc phục (chưa cấu hình key, file quá lớn, PDF scan, v.v.). Hỗ trợ tốt trên điện thoại.
- **`public/mathmaster_thcs.html`:** sửa `parseQuestionsFromRawText` (không đáp án giả), bỏ gán cứng, nối với API mới; `ONLY_DOCS` không còn âm thầm quay về ngân hàng chung mà phải báo thiếu.
- Mở khóa thành tựu `ACH_DOC_UPLOAD` chỉ khi trích xuất thành công ≥ 1 mục hợp lệ.

## B.6 Kiểm thử và tiêu chí nghiệm thu PHẦN B
Thêm vào `scripts/test-flows.mjs` hoặc file test mới (`npm run test:documents`), có file mẫu trong `scripts/fixtures/`:
1. `.txt` đúng định dạng `Câu N:` → bóc đúng số câu, đáp án, lời giải.
2. `.txt` định dạng lệch (`Bài 1.`, `1)`, phương án A–D, bảng đáp án cuối) → vẫn bóc đúng.
3. `.docx` có bảng và công thức → trích xuất hoặc cảnh báo rõ; không im lặng làm mất công thức.
4. `.pdf` có lớp chữ → đúng số trang/câu. `.pdf` scan khi không có key → `requiresApiKey`, **không** có câu giả.
5. File không nhận dạng được câu → `parseWarnings`, 0 câu giả, không có đáp án `'1'`.
6. Tạo đề B-2 từ file chương 1 lớp 8 → mọi câu đúng `grade`/`chapterId`, đúng ma trận 4 mức, đã qua `verifyQuestion`, VD/VDC đạt sàn PHẦN A.
7. `ONLY_DOCS` thiếu câu → trả `INSUFFICIENT_QUESTIONS`, không lấp ngân hàng chung.
8. Người dùng A không đọc/xóa/dùng được tài liệu của người dùng B (403).
9. Chạy `npm run build` thành công và thử lưu file với `UPLOAD_STORAGE_DRIVER` không phải `local` (mô phỏng Vercel, hệ thống file chỉ đọc).

---

# PHẦN C — BÁO CÁO CUỐI
Cập nhật `CHANGELOG_NANG_CAP.md` (mục mới) và báo cáo ngắn gồm:
1. Bảng trước/sau: số template mỗi lớp × mức, số template bị nâng/hạ/loại, kết quả `audit:difficulty`.
2. Danh sách thay đổi file và migration.
3. **Việc người dùng cần tự làm:** cấu hình `GEMINI_API_KEY` (và/hoặc `MATHPIX_APP_KEY`), tạo bucket Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`) hoặc Vercel Blob, đặt `UPLOAD_STORAGE_DRIVER`; giáo viên duyệt các câu `draft` quan trọng.
4. Những điểm chưa làm được hoặc còn rủi ro (ví dụ OCR chữ viết tay, công thức Word phức tạp, độ chính xác phân loại tự động).
