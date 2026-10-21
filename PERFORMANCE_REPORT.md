# 📊 BÁO CÁO ĐO LƯỜNG & TỐI ƯU HÓA HIỆU NĂNG TOÀN DIỆN — MATHMASTER THCS

> **Ngày thực hiện:** 21/10/2026  
> **Nhánh sao lưu trước tối ưu:** `backup-pre-perf-opt` (commit `b9b9217`)  
> **Công cụ đo kiểm tự động:** [`scripts/benchmark-perf.mjs`](file:///f:/Download/mathmaster_thcs/scripts/benchmark-perf.mjs)  
> **Trạng thái kiểm thử:** `14/14 PASS` (`npm run test`), `npx prisma validate` hợp lệ, `npx tsc --noEmit` 0 lỗi, `npm run build` thành công 100%.

---

## 1. Thông Tin Môi Trường Đo Kiểm

| Thành phần | Thông số thực tế |
| :--- | :--- |
| **Hệ điều hành** | Windows 11 (`win32 10.0.26200 x64`) |
| **CPU** | 13th Gen Intel(R) Core(TM) i7-13650HX (20 luồng xử lý) |
| **RAM hệ thống** | 15.7 GB |
| **Node.js & Libuv** | `v24.18.0` (`UV_THREADPOOL_SIZE=16`) |
| **Framework & ORM** | Next.js `14.2.15` (App Router, Production Build) + Prisma `5.22.0` |
| **Cơ sở dữ liệu** | Schema PostgreSQL 29 bảng + Local JSON State (`.data/local_db_state.json`, kho 333 câu hỏi Toán THCS, 4.062 công thức KaTeX) |

---

## 2. Xếp Hạng Top 5 Điểm Nghẽn Thực Tế Phát Hiện Từ Baseline (Giai Đoạn 1)

Trước khi sửa bất kỳ dòng code nào, hệ thống được build production và đo kiểm bằng [`scripts/benchmark-perf.mjs`](file:///f:/Download/mathmaster_thcs/scripts/benchmark-perf.mjs). Số liệu đo chỉ ra **5 điểm nghẽn lớn nhất** theo thứ tự mức độ ảnh hưởng:

1. **[Nghiêm trọng #1 — Backend CPU Blocking] `crypto.scryptSync` chặn cứng Event Loop khi đăng nhập đồng thời (`p95 = 1,818.35 ms` ở 50 user):**
   - Trong [`src/lib/auth.ts`](file:///f:/Download/mathmaster_thcs/src/lib/auth.ts), hàm `verifyPasswordWithMigration` và `hashPassword` dùng `crypto.scryptSync` (`N=16384, r=8, p=1`, ~36 ms CPU trên luồng chính). Khi 50 học sinh đăng nhập vào đầu giờ kiểm tra cùng lúc, 50 lệnh băm xếp hàng tuần tự trên duy nhất 1 luồng Event Loop khiến người thứ 50 phải đợi **1,818 ms** và toàn bộ request khác bị đóng băng.
2. **[Nghiêm trọng #2 — Backend Disk I/O Blocking] Mỗi request API thực hiện `5 lần fs.readFileSync` và `1 lần fs.writeFileSync` (`p95 = 482.71 ms`, RAM `282.7 MB` ở 50 user):**
   - Trong [`src/lib/prisma.ts`](file:///f:/Download/mathmaster_thcs/src/lib/prisma.ts), mỗi lần gọi `requireUser(req)` hoặc `readServerState()` đều đọc lại `.data/local_db_state.json` từ ổ cứng đồng bộ, đồng thời gọi `loadExtraQuestionBankFiles()` đọc tiếp **4 file JSON** (`grade6_7_8_9_extra.json`, `grade6_7_full_coverage.json`, `grade8_9_full_coverage.json`, `grade6_7_8_9_matrix_depth.json`) và chạy `normalizeStateObject()` duyệt lại 333 câu hỏi.
3. **[Nghiêm trọng #3 — Frontend First Load JS] Import tĩnh `katex` (258 KB) và `chart.js/auto` (162 KB) làm phình bundle mọi trang:**
   - [`src/components/MathMasterShell.tsx`](file:///f:/Download/mathmaster_thcs/src/components/MathMasterShell.tsx) import tĩnh `katex` ở đầu file khiến **mọi trang có thanh điều hướng (`AppShell`)** phải tải cục JS của KaTeX ngay từ giây đầu tiên (`First Load JS = 176 kB – 248 kB`).
   - [`src/app/dashboard/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/dashboard/page.tsx) import tĩnh `chart.js/auto` (nạp toàn bộ các loại biểu đồ không dùng của Chart.js), đẩy First Load JS của `/dashboard` lên **248 kB** (`795.22 KB` uncompressed).
4. **[Nghiêm trọng #4 — Payload API Dư Thừa] Tải toàn bộ `/api/state` (`52–68 KB`) và toàn bộ đáp án đề thi trên mọi màn hình:**
   - Các trang `/dashboard`, `/history`, `/formulas`, `/review`, `/practice`, `/teacher`, `/settings/devices`, `/admin/questions` đều gọi `GET /api/state` trả về toàn bộ câu hỏi, lịch sử, tài liệu, công thức dù chỉ cần `state.user` (`0.92 KB`) để hiển thị header.
   - Trang `/exams/new` import trực tiếp [`src/lib/math-grader.ts`](file:///f:/Download/mathmaster_thcs/src/lib/math-grader.ts) (1.074 dòng bộ chấm đại số) dù chỉ cần 4 hằng số ma trận.
5. **[Nghiêm trọng #5 — Client Re-render Mỗi Giây] Đồng hồ đếm ngược 1 giây & Bản in A4 ẩn trong `/exams/[id]/page.tsx`:**
   - State `remainingSeconds` nằm trực tiếp trong component cha `ExamTakingAndPrintPage` làm toàn bộ danh sách câu hỏi, công thức KaTeX và bản in ẩn (`@media print`) re-render mỗi giây một lần.

---

## 3. Bảng So Sánh Kết Quả Trước & Sau Tối Ưu

### 3.1. Backend API — Đo Đơn Luồng (6 Luồng Chính & Scoped API)

| Luồng nghiệp vụ / Endpoint | p50 Trước | p50 Sau | p95 Trước | p95 Sau | Payload Trước | Payload Sau | Sync Read/Write Trước | Sync Read/Write Sau | Mức cải thiện (p50 / Payload) |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | :---: | :---: | :--- |
| **1. Đăng nhập** (`POST /api/auth`) | `38.14 ms` | **`29.24 ms`** | `43.83 ms` | **`29.96 ms`** | `0.70 KB` | `0.70 KB` | `5.0 / 1.0` | **`0.0 / 0.0`** | **-23.3% latency**, 0 chặn Event Loop |
| **2A. Tải State đầy đủ** (`GET /api/state`) | `8.08 ms` | **`1.02 ms`** | `9.47 ms` | **`1.54 ms`** | `52.27 KB` | `68.78 KB`* | `5.0 / 0.0` | **`0.0 / 0.0`** | **-87.4% latency** (nhanh gấp **7.9x**) |
| **2B. Tải State Shell** (`GET /api/state?scope=shell`) | `8.08 ms` | **`0.32 ms`** | `9.47 ms` | **`0.46 ms`** | `52.27 KB` | **`0.92 KB`** | `5.0 / 0.0` | **`0.0 / 0.0`** | **-96.0% latency**, **-98.2% payload** |
| **2C. Tải State Tạo đề** (`GET /api/state?scope=exam-builder`) | `8.08 ms` | **`0.50 ms`** | `9.47 ms` | **`0.63 ms`** | `52.27 KB` | **`24.22 KB`** | `5.0 / 0.0` | **`0.0 / 0.0`** | **-93.8% latency**, **-53.7% payload** |
| **2D. Tải Dashboard** (`GET /api/analytics`) | `7.17 ms` | **`0.34 ms`** | `9.51 ms` | **`0.76 ms`** | `2.50 KB` | `2.50 KB` | `5.0 / 0.0` | **`0.0 / 0.0`** | **-95.3% latency** (nhanh gấp **21.1x**) |
| **3. Tạo đề ma trận 333 câu** (`POST /api/exams`) | `11.77 ms` | **`4.00 ms`** | `13.69 ms` | **`4.86 ms`** | `1.03 KB` | `1.03 KB` | `5.0 / 1.0` | **`0.0 / 0.0`** | **-66.0% latency** (nhanh gấp **2.9x**) |
| **4. Tự lưu bài thi** (`POST /api/attempts` `answersDiff`) | `11.31 ms` | **`3.56 ms`** | `13.00 ms` | **`4.19 ms`** | `0.42 KB` | `0.42 KB` | `5.0 / 1.0` | **`0.0 / 0.0`** | **-68.5% latency** (nhanh gấp **3.2x**) |
| **5. Nộp bài & chấm điểm** (`POST /api/attempts` `submit`) | `11.23 ms` | **`3.74 ms`** | `13.14 ms` | **`5.56 ms`** | `1.08 KB` | `1.08 KB` | `5.0 / 1.0` | **`0.0 / 0.0`** | **-66.7% latency** (nhanh gấp **3.0x**) |
| **6. Tải Lịch sử & Đề** (`GET /api/attempts` + `/api/exams`) | `13.89 ms` | **`0.39 ms`** | `17.23 ms` | **`0.60 ms`** | `5.73 KB` | `5.73 KB` | `10.0 / 0.0` | **`0.0 / 0.0`** | **-97.2% latency** (nhanh gấp **35.6x**) |
| **7. Tải Đề khi đang thi** (`GET /api/exams?id=...&mode=taking`) | — | **`0.35 ms`** | — | **`0.52 ms`** | `8.27 KB` | **`7.04 KB`** | `5.0 / 0.0` | **`0.0 / 0.0`** | **-14.9% payload**, ẩn đáp án/lời giải |

*(Ghi chú `*`: `GET /api/state` đầy đủ chỉ còn dùng cho script test nội bộ và bao gồm thêm cây `curriculum`, trong khi toàn bộ các trang giao diện người dùng đã chuyển sang dùng `?scope=shell`, `?scope=history`, `?scope=curriculum`, `?scope=exam-builder`).*

---

### 3.2. Thử Tải 50 Người Dùng Đồng Thời (50 Concurrent Users Load Test)

| Kịch bản thử tải (50 Users cùng lúc) | Chỉ số | Trước tối ưu (Baseline) | Sau tối ưu (Final) | Mức cải thiện |
| :--- | :--- | ---: | ---: | :--- |
| **50 học sinh đăng nhập đồng thời** (`POST /api/auth`) | **p50** | `1,817.82 ms` | **`184.01 ms`** | **Giảm 89.9% (Nhanh gấp 9.9x)** |
| | **p95** | `1,818.35 ms` | **`213.71 ms`** | **Giảm 88.2% (Nhanh gấp 8.5x)** |
| | **Tổng thời gian (Wall Clock)** | `1,818.70 ms` | **`214.93 ms`** | **Giảm 88.2%** |
| | **Số request lỗi (5xx/4xx)** | `0` | **`0`** | **An toàn 100%** |
| **50 học sinh hỗn hợp: Mở Dashboard + Tạo đề + Autosave** | **p50** | `317.81 ms` | **`9.51 ms`** | **Giảm 97.0% (Nhanh gấp 33.4x)** |
| | **p95** | `482.71 ms` | **`19.53 ms`** | **Giảm 96.0% (Nhanh gấp 24.7x)** |
| | **Tổng thời gian (Wall Clock)** | `496.30 ms` | **`20.36 ms`** | **Giảm 95.9% (Nhanh gấp 24.4x)** |
| | **Số request lỗi (5xx/4xx)** | `0` | **`0`** | **An toàn 100%** |
| **Tài nguyên máy chủ dưới tải 50 Users** | **Bộ nhớ RSS** | `282.7 MB` | **`95.3 MB`** | **Giảm 66.3% (-187.4 MB RAM)** |
| | **Bộ nhớ Heap Used** | `165.0 MB` | **`26.1 MB`** | **Giảm 84.2% (-138.9 MB Heap)** |

---

### 3.3. Kích Thước Bundle Frontend (First Load JS & Uncompressed JS) Cho Tất Cả Các Trang

| Route (Trang giao diện) | First Load JS Trước | First Load JS Sau | Uncompressed JS Trước | Uncompressed JS Sau | Số Chunk Trước $\rightarrow$ Sau | Mức giảm First Load JS |
| :--- | ---: | ---: | ---: | ---: | :---: | :--- |
| **`/dashboard`** | `248 kB` | **`102 kB`** | `795.22 KB` | **`336.67 KB`** | `10 -> 7` | **-58.9% (-146 kB)** |
| **`/exams/new`** | `180 kB` | **`103 kB`** | `599.55 KB` | **`342.33 KB`** | `9 -> 7` | **-42.8% (-77 kB)** |
| **`/exams/[id]`** | `179 kB` | **`103 kB`** | `595.09 KB` | **`338.65 KB`** | `8 -> 7` | **-42.5% (-76 kB)** |
| **`/admin/questions`** | `178 kB` | **`101 kB`** | `591.85 KB` | **`336.20 KB`** | `8 -> 7` | **-43.3% (-77 kB)** |
| **`/exams/[id]/result`** | `177 kB` | **`101 kB`** | `589.73 KB` | **`332.51 KB`** | `8 -> 7` | **-42.9% (-76 kB)** |
| **`/practice`** | `177 kB` | **`101 kB`** | `588.82 KB` | **`331.83 KB`** | `8 -> 7` | **-42.9% (-76 kB)** |
| **`/teacher`** | `177 kB` | **`101 kB`** | `591.61 KB` | **`334.66 KB`** | `8 -> 7` | **-42.9% (-76 kB)** |
| **`/review`** | `176 kB` | **`100 kB`** | `586.52 KB` | **`329.18 KB`** | `8 -> 7` | **-43.2% (-76 kB)** |
| **`/settings/devices`** | `176 kB` | **`100 kB`** | `587.17 KB` | **`330.18 KB`** | `8 -> 7` | **-43.2% (-76 kB)** |
| **`/formulas`** | `176 kB` | **`99.7 kB`** | `585.81 KB` | **`328.53 KB`** | `8 -> 7` | **-43.4% (-76.3 kB)** |
| **`/history`** | `176 kB` | **`99.6 kB`** | `585.84 KB` | **`328.56 KB`** | `8 -> 7` | **-43.4% (-76.4 kB)** |
| **`/login`** | `96.7 kB` | **`96.9 kB`** | `322.92 KB` | **`323.09 KB`** | `6 -> 6` | Đạt chuẩn `< 100 KB` |
| **`/register`** | `96.1 kB` | **`96.2 kB`** | `319.83 KB` | **`320.00 KB`** | `6 -> 6` | Đạt chuẩn `< 100 KB` |

---

### 3.4. HTTP Production Server (TTFB & Kích Thước HTML Trên 5 Trang Chính)

| Trang kiểm tra (`next start`) | TTFB p50 Trước | TTFB p50 Sau | TTFB p95 Trước | TTFB p95 Sau | Kích thước HTML |
| :--- | ---: | ---: | ---: | ---: | ---: |
| **`/login`** | `12.69 ms` | **`15.05 ms`** | `16.41 ms` | **`17.43 ms`** | `7.68 KB` |
| **`/dashboard`** | `15.53 ms` | **`14.95 ms`** | `17.59 ms` | **`15.45 ms`** | `7.81 KB` |
| **`/exams/new`** | `15.86 ms` | **`14.85 ms`** | `16.58 ms` | **`15.72 ms`** | `20.63 KB` |
| **`/exams/[id]`** | `74.91 ms` | **`77.10 ms`** | `78.97 ms` | **`93.52 ms`** | `8.40 KB` |
| **`/exams/[id]/result`** | `89.86 ms` | **`90.63 ms`** | `92.85 ms` | **`92.58 ms`** | `8.90 KB` |

---

### 3.5. Top 10 Gói / Chunk Trong `.next/static` & Trạng Thái Tách LazyChunk

| Hạng | Tên file chunk trong `.next/static` | Kích thước (Uncompressed) | Vai trò & Trạng thái nạp sau tối ưu |
| :---: | :--- | ---: | :--- |
| 1 | `chunks/d3ac728e.*.js` (KaTeX core) | `258.35 KB` | **Đã tách khỏi First Load JS** — chỉ nạp động (`import('katex')`) khi trên màn hình xuất hiện công thức chứa ký tự `$` |
| 2 | `chunks/fd9d1056-*.js` (React DOM shared) | `168.78 KB` | Runtime React 18 chia sẻ toàn ứng dụng (`53.6 kB` gzipped) |
| 3 | `chunks/ca377847.*.js` (Chart.js controllers) | `149.29 KB` | **Đã tách khỏi First Load JS** (giảm từ `161.71 KB` xuống `149.29 KB` nhờ tree-shaking controllers) — chỉ nạp động trên `/dashboard` sau khi khung trang đã hiển thị |
| 4 | `chunks/framework-*.js` | `136.70 KB` | Next.js / React framework core |
| 5 | `chunks/main-*.js` | `123.69 KB` | Next.js client router & hydration runtime |
| 6 | `chunks/117-*.js` | `120.63 KB` | Shared App Router client chunk (`31.6 kB` gzipped) |
| 7 | `chunks/polyfills-*.js` | `109.96 KB` | Chỉ tải cho trình duyệt cũ (trình duyệt hiện đại bỏ qua nhờ `nomodule`) |
| 8 | `chunks/153.*.js` | `40.63 KB` | Lazy chunk phụ trợ cho `DashboardCharts` |
| 9 | `css/b17151ae9bba8b7b.css` | `27.68 KB` | CSS công thức Toán KaTeX |
| 10 | `css/647c802a993a97dd.css` | `25.66 KB` | Tailwind CSS đã purge chỉ giữ class thực dùng + biến font `Inter` |

---

## 4. Danh Sách Chi Tiết Các Thay Đổi Đã Thực Hiện

| STT | File thay đổi | Lý do kỹ thuật | Mức cải thiện thực tế |
| :---: | :--- | :--- | :--- |
| 1 | [`src/lib/auth.ts`](file:///f:/Download/mathmaster_thcs/src/lib/auth.ts), [`src/app/api/auth/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/auth/route.ts) | Bổ sung `hashPasswordAsync` và `verifyPasswordWithMigrationAsync` dùng `crypto.scrypt` bất đồng bộ trên libuv threadpool (`UV_THREADPOOL_SIZE=16`), giữ nguyên tham số bảo mật `N=16384, r=8, p=1` và `timingSafeEqual`. | Giảm p95 khi 50 user đăng nhập đồng thời từ **`1,818.35 ms` $\rightarrow$ `213.71 ms` (-88.2%)**, không chặn Event Loop. |
| 2 | [`src/lib/prisma.ts`](file:///f:/Download/mathmaster_thcs/src/lib/prisma.ts) | Thêm bộ nhớ đệm `cachedServerState` đối chiếu `stat.mtimeMs`, cache `cachedExtraQuestionBank` (4 file JSON ngân hàng câu hỏi chỉ đọc 1 lần duy nhất), hàng đợi gộp ghi bất đồng bộ `flushPendingDiskWrite` (`fs.promises.writeFile`), bản đồ tra cứu câu hỏi $O(1)$ `getQuestionByIdMap`, và hàm `buildScopedStateForUser` hỗ trợ `scope=shell`, `scope=history`, `scope=curriculum`, `scope=exam-builder`. | Giảm `syncReads` từ `5.0 -> 0.0`, `syncWrites` từ `1.0 -> 0.0`; giảm p95 tải hỗn hợp 50 user từ **`482.71 ms` $\rightarrow$ `19.53 ms` (-96.0%)**; giảm RAM từ **`282.7 MB` $\rightarrow$ `95.3 MB` (-66.3%)**. |
| 3 | [`prisma/schema.prisma`](file:///f:/Download/mathmaster_thcs/prisma/schema.prisma), [`prisma/migrations/20261021150000_perf_indexes/migration.sql`](file:///f:/Download/mathmaster_thcs/prisma/migrations/20261021150000_perf_indexes/migration.sql) | Bổ sung composite indexes (`@@index([grade, semester, verificationStatus, cognitiveLevel])` trên `Question`, `@@index([userId, status, startedAt])` trên `ExamAttempt`, `@@index([userId, isRevoked, expiresAt])` trên `UserSession`, `@@index([userId, grade])` trên `TopicMastery`) bằng `CREATE INDEX IF NOT EXISTS` an toàn, chạy lại được. | Tối ưu kế hoạch truy vấn PostgreSQL cho lọc câu hỏi ma trận, kiểm tra phiên và thống kê tiến độ. |
| 4 | [`src/app/api/state/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/state/route.ts), [`src/app/api/exams/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/exams/route.ts), [`src/app/api/attempts/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/attempts/route.ts), [`src/app/api/questions/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/questions/route.ts) | Hỗ trợ `?scope=...` trên `/api/state`, `?mode=taking` (ẩn đáp án/lời giải khi đang thi) và `?limit=` trên `/api/exams`, hỗ trợ `answersDiff` trên `/api/attempts` (chỉ gộp câu thay đổi), và gọi `invalidateQuestionPoolCache()` khi duyệt/sửa câu hỏi. | Giảm payload `/api/state?scope=shell` từ **`52.27 KB` $\rightarrow$ `0.92 KB` (-98.2%)**, thời gian phản hồi **`0.32 ms`**. |
| 5 | [`src/components/MathMasterShell.tsx`](file:///f:/Download/mathmaster_thcs/src/components/MathMasterShell.tsx) | Chuyển import tĩnh `katex` sang nạp động `import('katex')` chỉ khi chuỗi có ký tự `$`; thêm bộ nhớ đệm `katexHtmlCache` (tối đa 2.000 công thức) để không gọi lại `katex.renderToString` khi component re-render; bọc `CognitiveBadge`, `MathText`, `MathSymbolKeyboard` trong `React.memo`. | Giảm First Load JS của **tất cả các trang** từ **`176–180 kB` xuống `99.6–103 kB` (-43%)**. |
| 6 | [`src/components/DashboardCharts.tsx`](file:///f:/Download/mathmaster_thcs/src/components/DashboardCharts.tsx), [`src/app/dashboard/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/dashboard/page.tsx) | Tách riêng khối biểu đồ Radar & Line sang `DashboardCharts.tsx` (chỉ đăng ký đúng các controller `RadarController`, `LineController` cần thiết thay vì `chart.js/auto`) và nạp qua `next/dynamic(..., { ssr: false })` kèm khung skeleton. | Giảm First Load JS của `/dashboard` từ **`248 kB` $\rightarrow$ `102 kB` (-58.9%)**. |
| 7 | [`src/app/exams/[id]/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/exams/[id]/page.tsx) | Cô lập đồng hồ đếm ngược 1 giây vào component con `ExamCountdownTimer` (`React.memo`); chỉ mount phiếu in A4 (`showPrintSheet`) khi bấm nút In/PDF; gửi `answersDiff` khi autosave (debounce `1500 ms`) và dùng `mode=taking`. | Loại bỏ hoàn toàn hiện tượng re-render danh sách câu hỏi & công thức KaTeX mỗi giây khi đang làm bài thi. |
| 8 | [`src/lib/exam-matrix-presets.ts`](file:///f:/Download/mathmaster_thcs/src/lib/exam-matrix-presets.ts), [`src/app/exams/new/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/exams/new/page.tsx) | Tách các hằng số ma trận & hàm tính quota sang module nhẹ cho client và dùng `/api/state?scope=exam-builder`. | Giảm First Load JS của `/exams/new` từ **`180 kB` $\rightarrow$ `103 kB` (-42.8%)**, giảm payload state từ `68.8 KB -> 24.2 KB`. |
| 9 | [`src/app/history/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/history/page.tsx), [`src/app/formulas/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/formulas/page.tsx), [`src/app/teacher/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/teacher/page.tsx), [`src/app/settings/devices/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/settings/devices/page.tsx), [`src/app/review/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/review/page.tsx), [`src/app/practice/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/practice/page.tsx), [`src/app/exams/[id]/result/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/exams/[id]/result/page.tsx), [`src/app/admin/questions/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/admin/questions/page.tsx) | Chuyển từ tải toàn bộ `/api/state` sang `/api/state?scope=shell`, `/api/state?scope=history` (gộp 3 request thành 1 request duy nhất trên trang Lịch sử), `/api/state?scope=curriculum`. | Giảm băng thông JSON thừa trên mọi lần chuyển trang từ `52 KB` xuống `0.92 KB`. |
| 10 | [`src/app/loading.tsx`](file:///f:/Download/mathmaster_thcs/src/app/loading.tsx), [`src/app/layout.tsx`](file:///f:/Download/mathmaster_thcs/src/app/layout.tsx), [`next.config.mjs`](file:///f:/Download/mathmaster_thcs/next.config.mjs) | Thêm skeleton loading toàn cục khi chuyển trang; cấu hình `next/font/google` (`Inter` `display: 'swap'`, `subsets: ['latin', 'vietnamese']`); bật `compress: true`, `swcMinify: true`, `optimizePackageImports: ['chart.js', 'katex']` và `UV_THREADPOOL_SIZE=16`. | Phản hồi thị giác tức thì khi chuyển route, tránh giật bố cục (CLS) do font. |

---

## 5. Những Thay Đổi Đã Thử / Cân Nhắc Nhưng Hoàn Tác Hoặc Không Áp Dụng

1. **Thử nghiệm lưu `.data/local_db_state.json` ở dạng nén nhị phân (`zlib.gzip`) hoặc tách rời hoàn toàn khỏi cấu trúc JSON gốc:**
   - **Lý do hoàn tác / không áp dụng:** Bộ kiểm thử tự động [`scripts/test-flows.mjs`](file:///f:/Download/mathmaster_thcs/scripts/test-flows.mjs#L282) đọc và ghi trực tiếp file `.data/local_db_state.json` bằng `JSON.parse(fs.readFileSync(...))` để kiểm tra tính năng tự động nâng cấp mật khẩu cũ (`legacy_sha256`). Nếu đổi định dạng file trên đĩa sang nhị phân hoặc xóa file đó, bài kiểm thử tích hợp sẽ gãy.
   - **Giải pháp thay thế hiệu quả hơn:** Giữ định dạng JSON chuẩn trên đĩa nhưng dùng **In-memory State Cache đối chiếu `stat.mtimeMs` + Async Write Coalescing**. Khi file không bị tiến trình bên ngoài sửa, 100% thao tác đọc diễn ra trong RAM (`0.3 ms`); khi [`scripts/test-flows.mjs`](file:///f:/Download/mathmaster_thcs/scripts/test-flows.mjs) ghi đè file, `stat.mtimeMs` thay đổi nên bộ nhớ đệm tự động nạp lại chính xác.
2. **Thử nghiệm giảm hệ số chi phí `scrypt` (`N = 16384` xuống `N = 4096`):**
   - **Lý do không áp dụng:** Vi phạm Quy tắc 6 (*"Không hạ bảo mật để lấy tốc độ"*).
   - **Giải pháp thay thế:** Chuyển sang `crypto.scrypt` bất đồng bộ kết hợp mở rộng `UV_THREADPOOL_SIZE=16`. Nhờ chạy song song trên các nhân CPU, thời gian p95 khi 50 người đăng nhập cùng lúc giảm từ `1,818 ms` xuống `213 ms` mà vẫn giữ nguyên độ an toàn mật mã `N = 16384`.

---

## 6. Đối Chiếu Tiêu Chuẩn Nghiệm Thu (Mục 5 — `ANTIGRAVITY_TOI_UU_TOC_DO.md`)

| Chỉ số nghiệm thu | Mục tiêu yêu cầu | Kết quả đạt được | Đánh giá |
| :--- | :--- | :--- | :---: |
| **API Đăng nhập / Đăng ký (p95 đơn luồng)** | `< 200 ms` (không chặn luồng) | **`29.96 ms`** (`async scrypt`, `0` sync I/O) | ✅ **ĐẠT VƯỢT MỨC** |
| **API Tải Dashboard `/api/analytics` (p95)** | `< 150 ms` | **`0.76 ms`** (đơn luồng) / **`19.53 ms`** (ở tải 50 user) | ✅ **ĐẠT VƯỢT MỨC** |
| **API Tạo đề theo ma trận `/api/exams` (p95)** | `< 200 ms` | **`4.86 ms`** (trên kho 333 câu) | ✅ **ĐẠT VƯỢT MỨC** |
| **API Nộp bài & chấm điểm `/api/attempts` (p95)** | `< 250 ms` | **`5.56 ms`** (chấm đại số tương đương + Rubric + SM-2) | ✅ **ĐẠT VƯỢT MỨC** |
| **First Load JS trang `/login`, `/register`** | `< 100 KB` | **`96.9 kB`** (`/login`), **`96.2 kB`** (`/register`) | ✅ **ĐẠT** |
| **First Load JS trang `/dashboard`** | `< 150 KB` | **`102 kB`** (giảm từ `248 kB`, **-58.9%**) | ✅ **ĐẠT VƯỢT MỨC** |
| **First Load JS các trang `/exams/*`, `/practice`, `/review`...** | `< 150 KB` | **`99.6 kB – 103 kB`** (giảm từ `176–180 kB`, **-43%**) | ✅ **ĐẠT VƯỢT MỨC** |
| **Thử tải 50 người dùng đồng thời** | `0` lỗi `5xx`, không treo | **`0` lỗi**, `login50` p95 = **`213.7 ms`**, `mixed50` p95 = **`19.5 ms`** | ✅ **ĐẠT VƯỢT MỨC** |
| **Kiểm thử tự động `npm run test` & `prisma validate`** | 100% Xanh | **`14/14 PASS`**, Schema hợp lệ 100% | ✅ **ĐẠT** |

---

## 7. Hướng Dẫn Tăng Tốc Chế Độ Phát Triển (`npm run dev`) Trên Windows & Xử Lý File Legacy

### 7.1. Vì sao `npm run dev` chậm hơn `npm run build && npm run start` trên Windows?
- Trong chế độ `npm run dev`, Next.js **không tối ưu hóa sẵn bundle** mà biên dịch từng trang theo yêu cầu (Just-in-Time / On-demand compilation) ngay khi bạn bấm vào link lần đầu tiên.
- Trên Windows, dịch vụ **Windows Defender Real-time Protection** mặc định quét mọi file `.js` / `.map` nhỏ được sinh ra liên tục trong thư mục `.next` và `node_modules`, làm tăng độ trễ I/O gấp 3–5 lần so với Linux/macOS. Đây là đặc tính của môi trường phát triển trên Windows, không phải lỗi của mã nguồn ứng dụng.

### 7.2. Hai bước tăng tốc `npm run dev` trên máy Windows của bạn
1. **Chạy Next.js với Turbopack (nhanh hơn Webpack 3–5 lần khi dev):**
   ```powershell
   npx next dev --turbo -H 0.0.0.0 -p 3000
   ```
2. **Thêm thư mục dự án vào danh sách loại trừ (Exclusion) của Windows Defender** (chạy PowerShell với quyền Administrator):
   ```powershell
   Add-MpPreference -ExclusionPath "F:\Download\mathmaster_thcs"
   Add-MpPreference -ExclusionProcess "node.exe"
   ```
3. **Khi sử dụng thực tế trong lớp học / mạng LAN cho học sinh thi:** Luôn chạy bản Production đã biên dịch sẵn:
   ```powershell
   npm run build
   npm run start
   ```

### 7.3. Lộ trình cho file `public/mathmaster_thcs.html` (413 KB)
- File `public/mathmaster_thcs.html` (`413 KB`) là bản prototype HTML đơn trang ban đầu, hiện chỉ được phục vụ tĩnh khi truy cập đường dẫn phụ `/app-standalone` (qua `rewrites` trong `next.config.mjs`) và **hoàn toàn không được import vào bất kỳ route App Router nào**, nên **không làm tốn 1 byte nào** trong bundle của người dùng.
- Toàn bộ 100% tính năng của file này đã được chuyển hóa hoàn chỉnh sang các route App Router chuẩn (`/dashboard`, `/exams/new`, `/exams/[id]`, `/exams/[id]/result`, `/practice`, `/review`, `/formulas`, `/teacher`, `/admin/questions`, `/settings/devices`). Khi bạn không còn nhu cầu giữ đường dẫn `/app-standalone` để đối chiếu giao diện cũ, có thể xóa trực tiếp `public/mathmaster_thcs.html` và xóa `rewrites()` trong `next.config.mjs`.

---

## 8. Chưa Tối Ưu Được / Cần Quyết Định Của Bạn (Nói Thẳng, Minh Bạch)

1. **Chuyển từ mô hình lưu trữ trạng thái gộp (`CloudAppState` / `.data/local_db_state.json`) sang truy vấn dòng PostgreSQL thuần túy (Row-level Prisma Queries):**
   - **Hiện trạng:** Để ứng dụng chạy ngay lập tức trên máy Windows của giáo viên mà không bắt buộc cài đặt PostgreSQL Server phức tạp (hoặc khi đồng bộ nhanh lên bảng `CloudAppState`), hệ thống đang giữ trạng thái trong bộ nhớ đệm RAM (`cachedServerState`) và ghi bất đồng bộ xuống `.data/local_db_state.json` / `CloudAppState`. Với quy mô **1 trường học (50 – 500 học sinh)**, kiến trúc In-memory Cache + Async Write Coalescing hiện tại cực nhanh (`0.3 ms – 4 ms`/request, chịu tải 50 user đồng thời chỉ mất `19.5 ms`).
   - **Giới hạn & Quyết định cần bạn:** Nếu bạn dự định triển khai hệ thống lên **Cloud đa máy chủ (Serverless Vercel / nhiều container chạy song song) cho > 5.000 – 10.000 học sinh**, việc lưu chung một JSON state sẽ gặp giới hạn bộ nhớ và xung đột ghi giữa nhiều container. Khi đó, bạn cần quyết định cung cấp một cụm PostgreSQL cố định kèm **Connection Pooler (`PgBouncer` / `Neon Pooler` / `Supabase Supavisor`)** để chuyển toàn bộ các hàm trong `src/lib/prisma.ts` sang gọi trực tiếp `prisma.user.*`, `prisma.question.*`, `prisma.examAttempt.*` trên 29 bảng đã khai báo và đánh index sẵn.
2. **Bộ đếm Rate Limit đang lưu trên RAM (`Map` trong `src/lib/auth.ts`):**
   - **Hiện trạng:** Phù hợp 100% khi chạy 1 tiến trình Node.js (`next start` trên máy chủ trường học hoặc VPS đơn).
   - **Quyết định cần bạn:** Nếu triển khai lên môi trường Serverless (Vercel) có nhiều instance tự co giãn, bộ đếm trên RAM của từng instance sẽ tách rời nhau. Khi đó cần quyết định dùng thêm Redis (ví dụ `Upstash Redis`) để chia sẻ bộ đếm Rate Limit toàn cục.
3. **Cờ `typescript.ignoreBuildErrors: true` và `eslint.ignoreDuringBuilds: true` trong `next.config.mjs`:**
   - **Hiện trạng:** Đang giữ nguyên để tốc độ chạy `npm run build` nhanh nhất (chỉ ~15 giây) và việc kiểm tra kiểu đã được chạy riêng qua `npx tsc --noEmit` (0 lỗi).
   - **Quyết định cần bạn:** Nếu bạn muốn quá trình `npm run build` tự động chặn build khi có lỗi TypeScript/ESLint mà không cần chạy `npx tsc --noEmit` riêng, hãy cho phép đổi 2 cờ này thành `false` (thời gian `npm run build` sẽ tăng thêm khoảng 5–8 giây).
