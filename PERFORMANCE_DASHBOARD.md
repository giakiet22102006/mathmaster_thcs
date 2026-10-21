# 📊 BÁO CÁO ĐO LƯỜNG & TỐI ƯU CHUYÊN SÂU TRANG TỔNG QUAN (`/dashboard`), BỘ FAVICON & CHUYỂN ĐỔI DỮ LIỆU BIẾN ĐỘNG (BƯỚC 2.6)

> **Ngày hoàn thành:** 21/10/2026  
> **Nhánh sao lưu trước khi sửa:** `backup-pre-dashboard-fix` (commit `cabb29b`)  
> **Kịch bản đo kiểm Production (`next start` + `PERF_LOG=1`):**
> - Đọc Dashboard: [`scripts/benchmark-dashboard.mjs`](file:///f:/Download/mathmaster_thcs/scripts/benchmark-dashboard.mjs)
> - Ghi & Autosave: [`scripts/benchmark-writes.mjs`](file:///f:/Download/mathmaster_thcs/scripts/benchmark-writes.mjs)
> - Chuyển đổi dữ liệu: [`scripts/migrate-hot-collections.mjs`](file:///f:/Download/mathmaster_thcs/scripts/migrate-hot-collections.mjs)
> 
> **Kiểm thử tự động:** `15/15 PASS` ([`scripts/test-flows.mjs`](file:///f:/Download/mathmaster_thcs/scripts/test-flows.mjs), bao gồm Test 15 kiểm chứng cô lập cache `/api/dashboard` giữa User A & User B và tự động vô hiệu hoá cache sau khi nộp bài)

---

## 1. Bảng Tổng Hợp Trước / Sau (Đo Trên Bản Production `npm run build` $\rightarrow$ `npm run start`)

### 1.1. So Sánh Hiệu Năng Đọc Dashboard (Cold & Warm)

| Chỉ số đo lường | Trước tối ưu (Baseline) | Sau tối ưu (Bước 2 $\rightarrow$ 5 & 2.6) | Mức cải thiện | Đạt mục tiêu? |
| :--- | ---: | ---: | ---: | :---: |
| **Nhánh đọc dữ liệu trong `readServerStateAsync`** | `branch=db` (Tải lại từ Neon mỗi request) | `branch=db-cache` (Bộ nhớ đệm + kiểm tra `updated_at`) | **Loại bỏ tải lặp JSONB** | ✅ Đạt |
| **Kích thước dữ liệu tải từ DB khi mở `/dashboard`** | **`1,271.52 KB`** (`3 × 423.84 KB`) | **`0 KB`** (Cache hit) / `< 0.1 KB` (`SELECT updated_at` sau 5s) | **Giảm 100% băng thông lặp** | ✅ Đạt |
| **Số truy vấn DB khi mở `/dashboard` 1 lần** | **3 truy vấn `SELECT payload`** | **0 truy vấn** (trong TTL 5s) / **1 truy vấn nhẹ** (sau 5s) | **3 $\rightarrow$ 0 truy vấn** | ✅ Đạt |
| **Tổng số truy vấn DB sau Đăng nhập + 9 lần mở Dashboard** | **30 truy vấn** | **3–4 truy vấn** (Chỉ lúc khởi tạo phiên đăng nhập) | **-86.7% số truy vấn DB** | ✅ Đạt |
| **Thời gian `normalizeStateObject` trên mỗi request đọc** | `0.22 ms – 3.83 ms / req` | **`0.00 ms / req`** (Chỉ chạy 1 lần khi nạp mới) | **-100% CPU lặp lại** | ✅ Đạt |
| **Số HTTP Request từ trình duyệt khi mở `/dashboard`** | **3 API song song** (`/api/state`, `/api/analytics`, `/api/exams`) | **1 API hợp nhất** (`GET /api/dashboard`) | **3 $\rightarrow$ 1 HTTP Request** | ✅ Đạt |
| **Thời gian 3 API cũ chạy song song — Cold** | **`918.55 ms`** | **`17.42 ms – 18.80 ms`** | **-98.1% (Nhanh gấp 52 lần)** | ✅ Đạt |
| **Thời gian 3 API cũ chạy song song — Warm (p50 / p95)** | p50: `109.59 ms` / **p95: `685.44 ms`** | p50: `14.06 ms` / **p95: `19.92 ms`** | **p95 giảm 97.1% (34.4 lần)** | ✅ Đạt |
| **Thời gian `GET /api/dashboard` hợp nhất — Lần đầu sau Login** | *(Chưa có — tương đương `918.55 ms`)* | **`8.17 ms – 15.11 ms`** (`routeMs = 0.46 ms`, `4.82 KB`) | **-98.3% $\rightarrow$ -99.1%** | ✅ Đạt |
| **Thời gian `GET /api/dashboard` hợp nhất — Warm (min / p50 / p95)** | *(Chưa có — tương đương p95 `685.44 ms`)* | min: `1.87 ms` / p50: **`15.30 ms`** / **p95: `16.45 ms`** | **Nhanh hơn 41.7 lần** | ✅ Vượt xa mục tiêu (`p95 < 300 ms`) |
| **Màn hình chờ trắng `"Đang tải bảng điều khiển cá nhân..."`** | `true` (Chặn toàn trang cho tới khi 3 API xong) | **`false`** (Hiển thị ngay `AppShell` + Skeleton) | **Xoá bỏ hoàn toàn chặn trang** | ✅ Đạt |
| **Thời điểm hiện Khung trang (`AppShell`) + Skeleton** | **`966.15 ms`** (Cold) / **`733.00 ms`** (Warm p95) | **`40.72 ms – 46.06 ms`** (Ngay trong HTML đầu tiên) | **-95.2% $\rightarrow$ -95.8%** | ✅ Vượt mục tiêu (`< 1,000 ms`) |
| **Thời điểm 4 thẻ chỉ số (KPIs) có dữ liệu thật** | **`966.15 ms`** (Cold) / **`733.00 ms`** (Warm p95) | **`55.11 ms – 61.17 ms`** | **-93.7% $\rightarrow$ -94.3%** | ✅ Vượt mục tiêu (`< 1,500 ms`) |
| **Thời điểm Biểu đồ (`Chart.js`) hiển thị hoàn chỉnh** | **`1,031.15 ms`** (Cold) / **`798.00 ms`** (Warm p95) | **`115.11 ms – 121.17 ms`** (Nạp lười sau thẻ KPI) | **-88.2% $\rightarrow$ -88.8%** | ✅ Đạt |
| **Thời gian hiện dữ liệu khi quay lại Tổng quan lần 2 (SWR)** | `157.00 ms – 733.00 ms` (Xoá trắng & tải lại từ đầu) | **`0 ms` (Tức thì từ bộ nhớ đệm SWR theo `userId`)** | **Tức thì (0 ms chờ)** | ✅ Đạt |

---

### 1.2. So Sánh Hiệu Năng Ghi Dữ Liệu & Băng Thông Mạng (Bước 2.6 — Tách Hot Collections)

| Chỉ số đo lường ghi (`benchmark-writes.mjs`) | Trước Bước 2.6 (Legacy JSONB) | Sau Bước 2.6 (Split-Hot Relational) | Mức cải thiện |
| :--- | ---: | ---: | ---: |
| **Kích thước dữ liệu gửi lên DB mỗi lần Autosave** | **`437,986 Bytes`** (~438 KB) | **`358 Bytes`** | **-99.92% (Giảm 1,223 lần)** |
| **Kích thước gửi lên DB khi cập nhật phiên (Session touch)** | **`437,627 Bytes`** (~438 KB) | **`357 Bytes – 692 Bytes`** | **-99.84% băng thông** |
| **Tổng dung lượng mạng ghi qua 11 thao tác liên tiếp** | **`4,703.21 KB`** (~4.7 MB) | **`846.95 KB`** | **-82.0% tổng dung lượng ghi** |
| **Chế độ ghi trên Database** | Ghi đè toàn bộ cục JSONB `mm_cloud_state` | Ghi theo diff (chỉ upsert đúng 1 dòng trong `mm_exam_attempts` hoặc `mm_user_sessions`) | **Tách độc lập, không phình to theo thời gian** |
| **Bảo toàn dữ liệu & Snapshot an toàn** | Không có snapshot tự động | Tự động snapshot nguyên vẹn vào `mm_state_backups` trước khi chuyển đổi | **An toàn 100%, có thể quay lui bất cứ lúc nào** |

---

## 2. Nguyên Nhân Gốc Rễ Đã Xác Nhận Bằng Số Đo Thực Tế

Khi chạy đo trên bản Production (`next start`) có nạp biến môi trường `.env` và gắn log đo kiểm `PERF_LOG=1`, số liệu đã giải thích chính xác:

1. **[Độ trễ Đọc — Chiếm > 95% thời gian tải]:**
   - Trước đây nhánh DB trong [`readServerStateAsync()`](file:///f:/Download/mathmaster_thcs/src/lib/prisma.ts) không có cache. Mỗi lần mở `/dashboard`, 3 API gọi đồng thời làm phát sinh 3 truy vấn kéo `3 × 423.84 KB = 1,271.52 KB` từ Neon Singapore qua mạng TLS, khiến thời gian chờ vọt lên **`918.55 ms` (Cold)** và **`685.44 ms` (Warm p95)**.
2. **[Độ trễ Ghi — Phình to theo thời gian]:**
   - Mỗi lần học sinh autosave câu trả lời hay cập nhật phiên đăng nhập, hệ thống phải serialize toàn bộ `438 KB` và ghi đè toàn bộ bảng `mm_cloud_state`.
   - Với Bước 2.6, 4 tập dữ liệu biến động (`sessions`, `attempts`, `topicMastery`, `reviewQueue`) đã được tách thành các dòng quan hệ riêng; mỗi autosave chỉ truyền **`358 Bytes`** thay vì **`438 KB`**.

---

## 3. Danh Sách Chi Tiết Các Thay Đổi Đã Thực Hiện

| Bước / Nhóm | File thay đổi | Lý do & Nội dung thay đổi | Mức cải thiện đo được |
| :--- | :--- | :--- | :--- |
| **Bước 1: Đo Baseline Đọc** (`6edacac`) | [`src/lib/prisma.ts`](file:///f:/Download/mathmaster_thcs/src/lib/prisma.ts)<br>[`src/app/api/state/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/state/route.ts)<br>[`src/app/api/analytics/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/analytics/route.ts)<br>[`src/app/api/exams/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/exams/route.ts)<br>[`scripts/benchmark-dashboard.mjs`](file:///f:/Download/mathmaster_thcs/scripts/benchmark-dashboard.mjs) | Gắn đo lường chi tiết (`PERF_LOG=1` & header `x-perf-metrics`) để ghi nhận nhánh đọc (`db` vs `db-cache` vs `file`), số truy vấn DB, kích thước payload KB, thời gian `normalizeMs` và `routeMs`. | Xác định chính xác thủ phạm: nhánh DB tải `423.84 KB` × 3 lần song song (`918.55 ms`). |
| **Bước 2: Sửa lõi `prisma.ts`** (`1e7ea24`) | [`src/lib/prisma.ts`](file:///f:/Download/mathmaster_thcs/src/lib/prisma.ts) | 1. Bổ sung **In-Memory Cache + TTL 5s** cho nhánh DB (`cachedServerState`, `cachedDbUpdatedAtMs`, `cachedDbLastCheckedAtMs`); sau 5s chỉ chạy `SELECT updated_at` siêu nhẹ (`< 0.1 KB`), chỉ tải lại `payload` khi `updated_at` thay đổi.<br>2. Bổ sung **Single-Flight (`inFlightReadStatePromise`)** gộp các request đồng thời dùng chung 1 lần đọc DB.<br>3. Đánh dấu `__normalized = true` để `normalizeStateObject()` chỉ chạy 1 lần khi nạp mới; dùng `PRECOMPUTED_SEED_HASHES` thay cho `scryptSync` trên đường đọc.<br>4. Sửa `getQuestionByIdMap` & thêm `getExamByIdMap` theo dõi phiên bản mảng (`questionPoolVersion`).<br>5. Giãn tần suất cập nhật `ses.lastActiveAt` tối đa 5 phút/lần. | Thời gian 3 API song song giảm từ **`918.55 ms` $\rightarrow$ `18.79 ms` (-98.0%)** ở lần Cold và từ **`685.44 ms` $\rightarrow$ `15.22 ms` (-97.8%)** ở lần Warm p95. Số truy vấn DB giảm từ **30 $\rightarrow$ 3**. |
| **Bước 3: API hợp nhất `/api/dashboard`** (`b8abbe1`) | [`src/app/api/dashboard/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/dashboard/route.ts)<br>[`src/app/api/attempts/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/attempts/route.ts)<br>[`src/app/api/exams/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/exams/route.ts)<br>[`src/app/api/practice/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/practice/route.ts)<br>[`src/app/api/review/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/review/route.ts)<br>[`src/app/api/state/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/state/route.ts)<br>[`src/app/api/auth/route.ts`](file:///f:/Download/mathmaster_thcs/src/app/api/auth/route.ts)<br>[`src/middleware.ts`](file:///f:/Download/mathmaster_thcs/src/middleware.ts)<br>[`scripts/test-flows.mjs`](file:///f:/Download/mathmaster_thcs/scripts/test-flows.mjs) | 1. Tạo `GET /api/dashboard` trả trọn gói chỉ trong **1 lần đọc state**: thông tin user rút gọn, 4 thẻ chỉ số (`overview`), `scoreTrend`, `chapterMastery`, `weakestChapters`, `cognitiveMastery`, 6 đề gần nhất (`recentExams`) và `leaderboard` (tối ưu chọn top-10 tuyến tính $O(N)$).<br>2. Cache kết quả theo khoá riêng `userId:grade` (TTL 45s) và cache chung `leaderboard` (TTL 90s); gắn `Cache-Control: private, no-store, no-cache, must-revalidate`.<br>3. Tự động gọi `invalidateDashboardCache(userId)` ngay khi nộp bài, tạo đề, luyện tập, ôn tập SM-2 hoặc đổi chế độ ẩn danh.<br>4. Bổ sung **Test 15** kiểm thử tự động xác nhận cô lập dữ liệu tuyệt đối giữa 2 người dùng. | Gộp **3 HTTP requests $\rightarrow$ 1 request (`4.82 KB`)**. Thời gian phản hồi `GET /api/dashboard` đạt **`8.17 ms` (Cold sau login)**, Warm **`p50 = 15.25 ms`, `p95 = 16.17 ms`**, `min = 1.87 ms`. |
| **Bước 4 & 5: Giao diện tức thì, SWR & Hạ tầng** (`5441705`) | [`src/lib/dashboard-swr.ts`](file:///f:/Download/mathmaster_thcs/src/lib/dashboard-swr.ts)<br>[`src/app/dashboard/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/dashboard/page.tsx)<br>[`src/components/MathMasterShell.tsx`](file:///f:/Download/mathmaster_thcs/src/components/MathMasterShell.tsx)<br>[`src/app/login/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/login/page.tsx)<br>[`src/app/register/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/register/page.tsx)<br>[`vercel.json`](file:///f:/Download/mathmaster_thcs/vercel.json) | 1. **Bỏ hoàn toàn màn hình chờ toàn trang**: hiển thị ngay `AppShell` và các khung `Skeleton` cho thẻ chỉ số, biểu đồ, danh sách đề ngay từ mili-giây đầu tiên (`40.72 ms`).<br>2. **Cơ chế Stale-While-Revalidate (`dashboard-swr.ts`)**: lưu cache theo `userId` (RAM + `sessionStorage`), xoá sạch khi đăng xuất hoặc đổi tài khoản. Lần quay lại Tổng quan hiện dữ liệu cũ **tức thì (`0 ms`)** rồi làm mới ngầm.<br>3. **Warmup sau đăng nhập/đăng ký**: gọi `router.prefetch('/dashboard')` và `warmupDashboardAfterLogin()` ngay khi đăng nhập thành công.<br>4. **Nạp lười biểu đồ (`Chart.js`)**: chỉ mount `<DashboardCharts />` sau khi 4 thẻ KPI đã hiển thị; bổ sung khung báo lỗi mạng kèm nút **"🔄 Thử lại ngay"** và timeout `8 giây`.<br>5. **Ghim vùng Serverless `sin1` (Singapore)** trong `vercel.json` và `preferredRegion` để hàm chạy cùng vùng `ap-southeast-1` với Neon PostgreSQL. | Thời điểm hiện khung trang giảm từ **`966.15 ms` $\rightarrow$ `40.72 ms` (-95.8%)**; thời điểm hiện 4 thẻ chỉ số giảm từ **`966.15 ms` $\rightarrow$ `55.11 ms` (-94.3%)**; quay lại trang lần 2 hiện dữ liệu trong **`0 ms`**. |
| **Phần C: Bộ Favicon & PWA Đồng Nhất** (`b2cc63c`) | [`src/app/icon.svg`](file:///f:/Download/mathmaster_thcs/src/app/icon.svg)<br>[`src/app/favicon.ico`](file:///f:/Download/mathmaster_thcs/src/app/favicon.ico)<br>[`src/app/apple-icon.png`](file:///f:/Download/mathmaster_thcs/src/app/apple-icon.png)<br>[`src/app/manifest.ts`](file:///f:/Download/mathmaster_thcs/src/app/manifest.ts)<br>[`src/app/layout.tsx`](file:///f:/Download/mathmaster_thcs/src/app/layout.tsx)<br>[`public/icon-192.png`](file:///f:/Download/mathmaster_thcs/public/icon-192.png)<br>[`public/icon-512.png`](file:///f:/Download/mathmaster_thcs/public/icon-512.png)<br>[`public/icon-maskable-512.png`](file:///f:/Download/mathmaster_thcs/public/icon-maskable-512.png)<br>[`public/mathmaster_thcs.html`](file:///f:/Download/mathmaster_thcs/public/mathmaster_thcs.html)<br>[`scripts/generate-favicons.mjs`](file:///f:/Download/mathmaster_thcs/scripts/generate-favicons.mjs) | Thiết kế biểu tượng Toán học **π** trắng nét đậm kèm điểm nhấn bậc luỹ thừa vàng `#fbbf24` trên nền bo góc Indigo `#4f46e5`, căn lưới pixel sắc nét ở cỡ `16×16`. Tạo đầy đủ `icon.svg`, `favicon.ico` đa kích thước (`16/32/48`), `apple-icon.png` (`180×180` nền đặc), `manifest.ts` và bộ icon PWA (`192`, `512`, `maskable 512`). | Tất cả 7 đường dẫn icon & manifest đều trả về **`HTTP 200`** đúng `Content-Type` trên `next start`. |
| **Đo Baseline Ghi** (`86c7188`) | [`src/lib/prisma.ts`](file:///f:/Download/mathmaster_thcs/src/lib/prisma.ts)<br>[`scripts/benchmark-writes.mjs`](file:///f:/Download/mathmaster_thcs/scripts/benchmark-writes.mjs) | Bổ sung `PERF_LOG` đo lường số bytes và thời gian ghi `writeMs` trên đường ghi; tạo công cụ đo thao tác ghi thực tế (guest, start attempt, autosave 8 lần). | Xác nhận trước khi tách: mỗi autosave ghi lại **`437,986 Bytes`** lên Neon. |
| **Bước 2.6: Tách Dữ Liệu Biến Động (Split-Hot)** (`0366e85`) | [`prisma/schema.prisma`](file:///f:/Download/mathmaster_thcs/prisma/schema.prisma)<br>[`prisma/migrations/20261021170000_split_hot_collections/migration.sql`](file:///f:/Download/mathmaster_thcs/prisma/migrations/20261021170000_split_hot_collections/migration.sql)<br>[`src/lib/hot-store.ts`](file:///f:/Download/mathmaster_thcs/src/lib/hot-store.ts)<br>[`src/lib/prisma.ts`](file:///f:/Download/mathmaster_thcs/src/lib/prisma.ts)<br>[`scripts/migrate-hot-collections.mjs`](file:///f:/Download/mathmaster_thcs/scripts/migrate-hot-collections.mjs) | 1. Tạo 4 bảng riêng (`mm_user_sessions`, `mm_exam_attempts`, `mm_topic_mastery`, `mm_review_items`) cùng bảng siêu dữ liệu `mm_state_meta` và sao lưu `mm_state_backups`.<br>2. Migration an toàn chạy lại được (idempotent), không có khóa ngoại gò bó.<br>3. Ghi dữ liệu theo diff: mỗi lần autosave chỉ cập nhật đúng 1 dòng trong bảng riêng mà không ghi đè JSONB chính.<br>4. Đã chạy migration trực tiếp lên Neon DB, có snapshot ID 1 trong `mm_state_backups`. | Dữ liệu ghi mỗi lần Autosave giảm từ **`437,986 Bytes` $\rightarrow$ `358 Bytes` (-99.92%)**. Đọc Dashboard vẫn duy trì ở mức **`15.30 ms`**. Toàn bộ 15 test kiểm thử đạt `PASS`. |

---

## 4. Kết Quả Nghiệm Thu Bộ Favicon & Web App Manifest (Phần C)

Kiểm tra tự động trên máy chủ Production (`next start`) xác nhận toàn bộ các đường dẫn đều không bị chặn bởi `middleware.ts` và phản hồi `HTTP 200` chuẩn xác:

| Đường dẫn (Route) | Mã HTTP | `Content-Type` | Kích thước | Mô tả kỹ thuật |
| :--- | :---: | :--- | ---: | :--- |
| `/icon.svg` | `200 OK` | `image/svg+xml` | `1,234 B` | Vector SVG sắc nét trên mọi màn hình Retina/4K, căn lưới 16×16 |
| `/favicon.ico` | `200 OK` | `image/x-icon` | `3,750 B` | File ICO đa kích thước chứa đủ 3 tầng `16×16`, `32×32`, `48×48` |
| `/apple-icon.png` | `200 OK` | `image/png` | `7,139 B` | Ảnh PNG `180×180` nền đặc Indigo `#4f46e5` (không trong suốt) chuẩn iOS/macOS |
| `/manifest.webmanifest` | `200 OK` | `application/manifest+json` | `702 B` | Cấu hình PWA (`theme_color: #4f46e5`, `display: standalone`, `start_url: /dashboard`) |
| `/icon-192.png` | `200 OK` | `image/png` | `10,610 B` | Icon PWA chuẩn `192×192` |
| `/icon-512.png` | `200 OK` | `image/png` | `51,216 B` | Icon PWA độ phân giải cao `512×512` |
| `/icon-maskable-512.png` | `200 OK` | `image/png` | `27,069 B` | Icon PWA `512×512` vùng an toàn `maskable` 80% cho Android Adaptive Icons |

> [!TIP]
> **Lưu ý khi kiểm tra Favicon trên trình duyệt:** Trình duyệt lưu cache favicon rất lâu. Để thấy ngay biểu tượng **π Indigo** mới trên tab trình duyệt, hãy nhấn làm mới cứng (**`Ctrl + F5`** trên Windows hoặc **`Cmd + Shift + R`** trên macOS) hoặc mở bằng **Cửa sổ ẩn danh (Incognito)**.

---

## 5. Những Thay Đổi Đã Thử / Cân Nhắc Nhưng Hoàn Tác Hoặc Giữ Nguyên Có Chủ Đích

1. **Giữ nguyên các API cũ (`/api/state`, `/api/analytics`, `/api/exams`) song song với `/api/dashboard`:**
   - Dù trang `/dashboard` đã chuyển sang dùng 1 cuộc gọi hợp nhất `GET /api/dashboard`, các trang khác (`/practice`, `/exams`, `/history`, `/teacher`, và bộ test tích hợp `scripts/test-flows.mjs`) vẫn gọi `/api/state`, `/api/analytics`, `/api/exams`. Do đó chúng tôi giữ nguyên các endpoint này và tối ưu cả 3 endpoint nhờ bộ nhớ đệm ở Bước 2.
2. **Không ép buộc khóa ngoại ràng buộc cứng (Foreign Keys) lên 4 bảng mới:**
   - Nhằm bảo đảm an toàn dữ liệu 100%, không xung đột khi `users` hay `exams` vẫn nằm trong `mm_cloud_state`, 4 bảng mới (`mm_user_sessions`, `mm_exam_attempts`, `mm_topic_mastery`, `mm_review_items`) sử dụng khóa chính `id`, các cột đánh index (`user_id`, `status`, `expires_at`, `next_review_at`) và lưu nguyên vẹn bản ghi trong cột `data jsonb`.

---

## 6. Mục "Chưa Giải Quyết Được / Cần Quyết Định Của Tôi" (Báo Cáo Thẳng Thắn)

Dưới đây là các vấn đề hạ tầng thực tế còn lại:

### 6.1. Trạng thái sau Bước 2.6: ĐÃ HOÀN TẤT CHUYỂN ĐỔI AN TOÀN
- **Kết quả:** Sau khi bạn đồng ý, 4 tập dữ liệu biến động (`sessions`, `attempts`, `topicMastery`, `reviewQueue`) đã được tách thành công ra các bảng riêng trên Neon DB bằng lệnh migration `20261021170000_split_hot_collections`.
- **Dữ liệu được bảo toàn:** Toàn bộ dữ liệu trước khi chuyển đã được lưu snapshot tự động vào bảng `mm_state_backups` (ID = 1). Nếu muốn quay lại trạng thái cũ bất kỳ lúc nào, chỉ cần chạy lệnh:
  `npx tsx --env-file=.env scripts/migrate-hot-collections.mjs --rollback`.

### 6.2. Độ trễ Cold Start của kết nối đầu tiên tới Neon PostgreSQL (`~440 ms – 1,050 ms`)
- **Hiện trạng:** Khi khởi động lại hoặc sau 5 phút không có request, Neon PostgreSQL (tier Free/Launch) có thể ở trạng thái tạm nghỉ. Lần đầu tiên gọi API cần khoảng `~440 ms` để hoàn tất bắt tay TLS và đánh thức database. Ngay sau đó mọi request đều được phục vụ trong `8–16 ms` từ bộ nhớ đệm.
- **Khuyến nghị:**
  1. Trên môi trường production, nâng cấp gói Neon có tắt chế độ *Scale to Zero* để giữ database luôn nóng.
  2. Deploy code lên Vercel để file `vercel.json` (`"regions": ["sin1"]`) ghim serverless functions cùng cụm Singapore với Neon DB, loại bỏ hoàn toàn độ trễ xuyên lục địa.

### 6.3. Cơ chế dự phòng `/tmp` trên môi trường Serverless khi mất kết nối DB
- **Hiện trạng:** Ứng dụng đọc/ghi 100% vào database Neon trên PostgreSQL. Chỉ trong trường hợp mất kết nối mạng hoàn toàn tới Neon, hệ thống mới tạm thời fallback sang file local (trên serverless là `/tmp`). Cần bảo đảm chuỗi kết nối `DATABASE_URL` trên Vercel luôn hợp lệ.

---

## 7. Ghi Chú Về Việc Chuyển Đổi Model AI Trong Phiên Làm Việc

Theo yêu cầu minh bạch tiến trình, phiên làm việc này được thực hiện qua các giai đoạn với việc chuyển đổi model như sau:

1. **Giai đoạn 1 — Đo Baseline, Bước 2 (Sửa lõi `prisma.ts`), Bước 3 (API `/api/dashboard`), Bước 4 & 5 (Giao diện SWR, Skeleton, Vercel Region `sin1`), Phần C (Thiết kế & Tích hợp Bộ Favicon Indigo `π`):**
   - Được thực hiện và kiểm chứng bởi model trước đó cho đến commit `76b73e9`.
2. **Giai đoạn 2 — Đo Baseline Ghi (`86c7188`) & Khởi tạo Cấu Trúc Bảng Bước 2.6:**
   - Được tiếp nối với commit `86c7188` (`scripts/benchmark-writes.mjs`). Quá trình khởi tạo dở dang `src/lib/hot-store.ts` và migration `split_hot_collections` chạm hạn mức token context của model trước.
3. **Giai đoạn 3 (Từ thời điểm người dùng đổi sang Model hiện tại):**
   - Model hiện tại tiếp nhận phiên làm việc, kiểm tra toàn bộ trạng thái hệ thống:
     - Chạy `git status`, `git log`, `git diff` xác định các thay đổi chưa hoàn tất.
     - Chạy `npx prisma validate`, `npm run test` (15/15 PASS) và `npm run build` xác nhận tính toàn vẹn.
     - Sửa lỗi cú pháp regclass trong `src/lib/hot-store.ts`, hoàn thiện `scripts/migrate-hot-collections.mjs`.
     - Chạy `npx prisma migrate deploy` tạo an toàn các bảng mới trên Neon DB.
     - Tích hợp liền mạch cơ chế đọc/ghi `split-hot` vào [`src/lib/prisma.ts`](file:///f:/Download/mathmaster_thcs/src/lib/prisma.ts).
     - Thực thi di trú dữ liệu sống trên Neon DB (`scripts/migrate-hot-collections.mjs --apply`), tạo snapshot an toàn ID = 1.
     - Chạy lại các bài đo benchmark ghi (`benchmark-writes.mjs`) xác nhận dung lượng ghi mỗi autosave giảm từ **`438 KB`** xuống **`358 Bytes`** (-99.92%).
     - Chạy lại benchmark đọc (`benchmark-dashboard.mjs`) xác nhận tốc độ đọc trang Dashboard giữ nguyên mức siêu nhanh **`15.30 ms`** và toàn bộ favicon HTTP 200.
     - Commit toàn bộ thay đổi thành `0366e85` và hoàn thiện báo cáo này.
