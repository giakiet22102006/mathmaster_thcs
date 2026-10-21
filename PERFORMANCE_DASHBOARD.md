# 📊 BÁO CÁO ĐO LƯỜNG & TỐI ƯU CHUYÊN SÂU TRANG TỔNG QUAN (`/dashboard`) & BỘ FAVICON

> **Ngày thực hiện:** 21/10/2026  
> **Nhánh sao lưu trước khi sửa:** `backup-pre-dashboard-fix` (commit `cabb29b`)  
> **Công cụ đo kiểm Production (`next start` + `PERF_LOG=1`):** [`scripts/benchmark-dashboard.mjs`](file:///f:/Download/mathmaster_thcs/scripts/benchmark-dashboard.mjs)

---

## 1. Kết Quả Đo Baseline (Bước 1 — Trước Khi Sửa Code)

### 1.1. Môi Trường & Hạ Tầng Cơ Sở Dữ Liệu Thực Tế
- **Chế độ chạy đo:** Production (`npm run build` $\rightarrow$ `npm run start`, bật `PERF_LOG=1`).
- **Cơ sở dữ liệu đang kết nối:** **PostgreSQL từ xa trên Neon Cloud** (`ap-southeast-1` Singapore, qua PgBouncer Pooler `-pooler`).
- **Cấu trúc lưu trữ thực tế:** Toàn bộ trạng thái ứng dụng đang lưu trong 1 dòng JSONB (`mm_cloud_state.payload`, kích thước **`423.84 KB`**).

### 1.2. Bảng Số Liệu Baseline (`legacy-3-apis` — Trước Tối Ưu)

| Chỉ số đo lường | Lần đầu (Cold) | Lần thứ hai trở đi (Warm) | Ghi chú kỹ thuật từ `PERF_LOG=1` |
| :--- | ---: | ---: | :--- |
| **Nhánh đọc trong `readServerStateAsync`** | `branch=db` (Neon từ xa) | `branch=db` (Neon từ xa) | **Không có cache cho nhánh DB** — 100% request đều tải lại qua mạng |
| **Kích thước `payload` tải từ DB mỗi request** | `423.84 KB / req` | `423.84 KB / req` | Mở `/dashboard` 1 lần = tải `3 × 423.84 KB = 1,271.52 KB` từ Neon |
| **Số truy vấn DB khi mở `/dashboard` 1 lần** | **3 truy vấn `SELECT payload`** | **3 truy vấn `SELECT payload`** | Cộng thêm 2 truy vấn lúc đăng nhập (tổng 30 truy vấn sau 8 lần mở) |
| **Thời gian `POST /api/auth` (Đăng nhập Cold)** | `1,074.33 ms` | — | Khởi tạo kết nối Prisma + tải `423.51 KB` (`fetchMs = 442.28 ms`) |
| **Thời gian `GET /api/state?scope=shell`** | `139.91 ms` (DB fetch `129.99 ms`) | p50: `97.15 ms` / p95: `447.74 ms` | Chỉ để lấy `0.98 KB` thông tin user nhưng phải tải `423.84 KB` từ DB |
| **Thời gian `GET /api/analytics`** | `918.25 ms` (DB fetch `903.63 ms`) | p50: `109.39 ms` / p95: `685.27 ms` | Chờ tải `423.84 KB` từ DB + duyệt tuyến tính câu hỏi/bảng xếp hạng |
| **Thời gian `GET /api/exams?limit=6`** | `911.23 ms` (DB fetch `892.90 ms`) | p50: `107.54 ms` / p95: `219.65 ms` | Chỉ lấy `3.19 KB` (6 đề) nhưng phải tải `423.84 KB` từ DB |
| **Tổng thời gian chờ 3 API song song (Wall Clock)** | **`918.55 ms`** | p50: `109.59 ms` / **p95: `685.44 ms`** | Bị nghẽn cổ chai bởi request chậm nhất trong 3 truy vấn DB song song |
| **Thời điểm hiện khung trang `AppShell`** | **`966.15 ms`** (Bị chặn trắng) | p50: `157 ms` / **p95: `733 ms`** | Do `if (loading && !user)` chặn toàn màn hình hiện *"Đang tải..."* |
| **Thời điểm hiện 4 thẻ chỉ số (KPIs)** | **`966.15 ms`** | p50: `157 ms` / **p95: `733 ms`** | Phải đợi cả 3 API xong cùng lúc |
| **Thời điểm hiện biểu đồ `Chart.js`** | **`1,031.15 ms`** | p50: `222 ms` / **p95: `798 ms`** | Nạp sau khi 3 API hoàn tất |

---

## 2. Xếp Hạng Nguyên Nhân Gốc Rễ Đã Xác Nhận Bằng Số Đo

1. **[Nguyên nhân #1 — Chiếm > 95% độ trễ API] Nhánh DB trong `readServerStateAsync()` không dùng bộ nhớ đệm và không có Single-Flight:**
   - Khi có `DATABASE_URL` (Neon Singapore `ap-southeast-1`), hàm `readServerStateAsync()` bỏ qua hoàn toàn `cachedServerState` và thực hiện `SELECT payload FROM mm_cloud_state WHERE id = 'main'` (**`423.84 KB`**) trên **từng request**.
   - Khi mở `/dashboard`, 3 API gọi song song làm phát sinh 3 truy vấn tải `423.84 KB` cùng lúc (`1.27 MB` qua mạng TLS), gây nghẽn băng thông kết nối và đẩy thời gian tải của `/api/analytics` và `/api/exams` vọt từ `130 ms` lên **`903.63 ms` (Cold)** và **`685.44 ms` (Warm p95)**.
2. **[Nguyên nhân #2 — Chặn hiển thị giao diện] Màn hình chờ toàn trang (`if (loading && !user)`) và thiếu SWR cache phía Client:**
   - Trang [`src/app/dashboard/page.tsx`](file:///f:/Download/mathmaster_thcs/src/app/dashboard/page.tsx) chặn toàn bộ `AppShell` bằng dòng chữ *"Đang tải bảng điều khiển cá nhân..."* cho đến khi cả 3 API trả về xong. Khi người dùng chuyển sang trang khác rồi quay lại **Tổng quan**, trang xóa trắng và tải lại từ đầu vì không có bộ nhớ đệm SWR phía client.
3. **[Nguyên nhân #3 — Chia nhỏ 3 HTTP Request thay vì 1 API hợp nhất]:**
   - Ba lời gọi riêng biệt (`/api/state?scope=shell`, `/api/analytics`, `/api/exams?limit=6`) đều xác thực phiên và đọc state lặp lại 3 lần.
4. **[Nguyên nhân #4 — Chuẩn hóa lặp lại & cập nhật `lastActiveAt` trên mỗi request]:**
   - `normalizeStateObject()` chạy lại mỗi lần đọc từ DB (`0.15–3.83 ms`), và `verifyActiveSessionInState()` gán lại `ses.lastActiveAt = new Date().toISOString()` trên mỗi request.
5. **[Nguyên nhân #5 — Các index trên bảng quan hệ chưa được tận dụng]:**
   - Log xác nhận 100% truy vấn hiện tại đi vào bảng `mm_cloud_state` (`SELECT payload FROM mm_cloud_state WHERE id = 'main'`), chưa truy vấn trực tiếp các bảng quan hệ (`questions`, `exam_attempts`, `topic_mastery`).
