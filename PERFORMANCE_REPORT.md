# BÁO CÁO ĐO KIỂM & TỐI ƯU HÓA HIỆU NĂNG TOÀN DIỆN — MATHMASTER THCS

Tài liệu này ghi nhận kết quả thực hiện theo đúng quy trình kỹ thuật trong [ANTIGRAVITY_TOI_UU_TOC_DO.md](file:///f:/Download/mathmaster_thcs/ANTIGRAVITY_TOI_UU_TOC_DO.md): **Đo Baseline trên bản Production $\rightarrow$ Xếp hạng nút thắt $\rightarrow$ Tối ưu từng nhóm $\rightarrow$ Đo lại & Kiểm chứng**.

---

## 1. Cấu hình Môi trường Đo Kiểm

| Thông số | Giá trị Thực tế |
| :--- | :--- |
| **Thời điểm đo Baseline** | `2026-10-21T08:27:29.972Z` (`commit b9b9217` / nhánh sao lưu `backup-pre-perf-opt`) |
| **Hệ điều hành** | Windows 11 (`win32 10.0.26200 x64`) |
| **CPU & Bộ nhớ** | 13th Gen Intel(R) Core(TM) i7-13650HX (20 luồng xử lý), RAM 15.7 GB |
| **Node.js & Next.js** | Node.js `v24.18.0`, Next.js `14.2.15` (Production Build `npm run build` + `npm run start`) |
| **Cơ sở dữ liệu & Lưu trữ** | Prisma `5.22.0` (29 bảng PostgreSQL) + Local JSON Store (`.data/local_db_state.json`, 333 câu hỏi) |
| **Công cụ đo tự động** | [scripts/benchmark-perf.mjs](file:///f:/Download/mathmaster_thcs/scripts/benchmark-perf.mjs) |

---

## 2. Kết Quả Đo Baseline (Trước Khi Tối Ưu)

### 2.1. Baseline Backend — 6 Luồng Nghiệp Vụ Đơn Lẻ & Tải 50 Người Dùng Đồng Thời

| Luồng Nghiệp Vụ / Endpoint | p50 (ms) | p95 (ms) | Max (ms) | Payload JSON (KB) | I/O Đồng bộ Đọc / Req | I/O Đồng bộ Ghi / Req |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Đăng nhập (`POST /api/auth`)** | `38.14` | `43.83` | `43.83` | `0.70 KB` | `5.0` lần | `1.0` lần |
| **2A. Tải toàn bộ State (`GET /api/state`)** | `8.08` | `9.47` | `9.48` | `52.27 KB` | `5.0` lần | `0.0` lần |
| **2B. Tải Dashboard (`GET /api/analytics`)** | `7.17` | `9.51` | `14.26` | `2.50 KB` | `5.0` lần | `0.0` lần |
| **3. Tạo đề 12 câu theo ma trận (`POST /api/exams`)** | `11.77` | `13.69` | `13.69` | `1.03 KB` | `5.0` lần | `1.0` lần |
| **4. Tự lưu bài đang làm (`POST /api/attempts` - autosave)** | `11.31` | `13.00` | `13.30` | `0.46 KB` | `5.0` lần | `1.0` lần |
| **5. Nộp bài & Chấm điểm (`POST /api/attempts` - submit)** | `11.23` | `13.14` | `13.14` | `1.08 KB` | `5.0` lần | `1.0` lần |
| **6. Tải Lịch sử & Đề thi (`GET /api/attempts` + `/api/exams`)** | `13.89` | `17.23` | `18.05` | `5.73 KB` | `10.0` lần | `0.0` lần |
| **🔥 Tải 50 người đăng nhập đồng thời (`login50`)** | **`1817.82`** | **`1818.35`** | **`1818.53`** | `0.70 KB` | `5.0` lần | `1.0` lần |
| **🔥 Tải 50 người hỗn hợp đồng thời (`mixed50`)** | **`317.81`** | **`482.71`** | **`494.87`** | — | `5.0` lần | `0.66` lần |

### 2.2. Baseline Frontend — Kích Thước JS Tải Lần Đầu & TTFB Production Server

| Tuyến Trang (Route) | First Load JS (Next Build - Gzipped) | Tổng JS Giải Nén (`.next` Manifest) | Số Chunk JS | TTFB Production p50 (ms) | TTFB Production p95 (ms) | Kích thước HTML (KB) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **`/login`** | `96.7 kB` | `322.92 KB` | 6 | `14.51` | `15.40` | `5.56 KB` |
| **`/dashboard`** | **`248.0 kB`** | **`795.22 KB`** | 10 | `15.03` | `16.07` | `6.08 KB` |
| **`/exams/new`** | **`180.0 kB`** | **`599.55 KB`** | 8 | `15.00` | `15.83` | `18.64 KB` |
| **`/exams/[id]` (Phòng thi)** | **`179.0 kB`** | **`595.09 KB`** | 8 | **`74.91`** | **`78.97`** | `6.41 KB` |
| **`/exams/[id]/result` (Kết quả)** | **`177.0 kB`** | **`589.73 KB`** | 8 | **`89.86`** | **`92.85`** | `6.91 KB` |
| **`/history`, `/teacher`, `/settings/devices`** | `176.0 - 177.0 kB` | `585.92 - 591.89 KB` | 8 | `15.20` | `16.40` | `~6.20 KB` |

### 2.3. Top 10 Gói / Chunk Nặng Nhất Trong Bản Build Production (Baseline)

| Hạng | Tên File Chunk (`.next/static/`) | Kích thước (KB) | Nguyên nhân / Thư viện bên trong |
| :---: | :--- | :---: | :--- |
| **1** | `chunks/d3ac728e-bbdafe339ebfb309.js` | **`257.85 KB`** | **KaTeX (`katex`)** bị import tĩnh trong `MathMasterShell.tsx`, kéo vào mọi trang dùng `AppShell` |
| **2** | `chunks/fd9d1056-cdb8c6ab973c9775.js` | `168.78 KB` | React DOM (`react-dom`) client runtime |
| **3** | `chunks/ca377847-044365abace2608d.js` | **`161.71 KB`** | **Chart.js (`chart.js`)** bị import tĩnh ở đầu trang `/dashboard/page.tsx` |
| **4** | `chunks/framework-f66176bb897dc684.js` | `136.70 KB` | Next.js / React Core Framework |
| **5** | `chunks/main-edfa000f74730356.js` | `123.69 KB` | Next.js Main Client Runtime |
| **6** | `chunks/117-95b5d85b3b64a8a6.js` | `120.63 KB` | Next.js App Router Shared Chunk |
| **7** | `chunks/polyfills-42372ed130431b0a.js` | `109.96 KB` | Browser Polyfills |
| **8** | `chunks/276-a01f3bf27c64a121.js` | `40.02 KB` | Shared UI Shell (`MathMasterShell.tsx`) |
| **9** | `css/f3a3870c88ca6e0f.css` | `25.50 KB` | `katex/dist/katex.min.css` nạp toàn cục |
| **10** | `css/f5ff5a4c7332900e.css` | `25.46 KB` | Tailwind CSS stylesheet |

---

## 3. Xếp Hạng Các Nút Thắt Theo Mức Ảnh Hưởng (Bottleneck Ranking)

Dựa trên số liệu đo thực tế ở Mục 2, các nút thắt làm chậm hệ thống được xếp hạng từ nghiêm trọng nhất đến thấp hơn như sau:

1. **[Hạng 1 — Nghiêm trọng nhất] Băm mật khẩu đồng bộ (`crypto.scryptSync`) kết hợp đọc/ghi đĩa đồng bộ trong `/api/auth`**:
   - Khi 50 người đăng nhập cùng lúc (`login50`), `scryptSync` (~35 ms/lần) chặn hoàn toàn Event Loop của Node.js khiến p95 vọt lên **`1,818.35 ms`** (gần 2 giây).
2. **[Hạng 2 — Rất nghiêm trọng] Đọc đồng bộ 5 file JSON + `normalizeStateObject` trên MỌI request (`src/lib/prisma.ts`)**:
   - Mỗi lần gọi `requireUser(req)` đều thực hiện **5 lệnh `fs.readFileSync`** (`.data/local_db_state.json` + 4 file `prisma/question_bank/grade_6..9.json`) và `JSON.parse` hơn 550 KB dữ liệu, rồi chạy vòng lặp chuẩn hóa lại toàn bộ 333 câu hỏi. Khi 50 request hỗn hợp chạy đồng thời (`mixed50`), p95 lên tới **`482.71 ms`** (vượt ngưỡng nghiệm thu `< 300 ms`).
3. **[Hạng 3 — Nghiêm trọng (Frontend Bundle)] `Chart.js` (`161.71 KB`) và `KaTeX` (`257.85 KB`) bị import tĩnh vào bundle chính**:
   - Trang `/dashboard` phải tải **`248 kB` First Load JS** (`795.22 KB` giải nén) vì gộp cả `Chart.js` và `KaTeX` ngay ở luồng khởi tạo.
   - Các trang không có công thức Toán như `/settings/devices`, `/teacher`, `/history` vẫn phải tải chunk `KaTeX` `257.85 KB` vì `MathMasterShell.tsx` import tĩnh `katex`.
4. **[Hạng 4 — Trung bình–Cao (Frontend Runtime & Re-render)] Đồng hồ đếm ngược 1 giây/lần làm render lại toàn bộ Phòng thi (`/exams/[id]`) và `katex.renderToString` không có cache**:
   - Tại `src/app/exams/[id]/page.tsx`, state `remainingSec` nằm ở component cha nên mỗi giây toàn bộ câu hỏi và đáp án đều bị React reconciliation và gọi lại `katex.renderToString`.
5. **[Hạng 5 — Trung bình (Payload & Database Index)] `/api/state` trả về toàn bộ 333 câu hỏi (`52.27 KB` cho Học sinh, `>300 KB` cho Giáo viên/Admin) ngay cả khi `AppShell` chỉ cần thông tin hồ sơ người dùng (`user`)**:
   - Ngoài ra, schema PostgreSQL cần bổ sung các composite index cho truy vấn lọc đề theo ma trận và lịch ôn tập SM-2.
