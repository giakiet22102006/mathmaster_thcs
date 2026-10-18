# MathMaster THCS — Nền tảng Luyện thi & Học Toán Lớp 6, 7, 8, 9 (Full-Stack Next.js + Prisma + PostgreSQL)

Chào mừng bạn đến với mã nguồn Full-stack hoàn chỉnh của **MathMaster THCS**! Dự án đã được thiết kế để người mới bắt đầu trên **Windows** có thể chạy ngay lập tức mà không cần tự viết bất kỳ dòng code backend nào.

---

## 1. Cấu trúc Thư mục Dự án Hoàn chỉnh

```text
mathmaster-thcs/
├── public/
│   ├── mathmaster_thcs.html       # Giao diện Web App hoàn chỉnh (Hybrid Local + API Sync)
│   └── uploads/                   # Thư mục lưu file tải lên mặc định (không cần cài S3)
├── prisma/
│   ├── schema.prisma              # Schema PostgreSQL gồm 23 bảng chuẩn hóa (Prisma 5.22)
│   ├── seed_data.json             # Dữ liệu mẫu chuẩn GDPT 2018 (Lớp 6, 7, 8, 9 - 3 bộ sách)
│   ├── seed.mjs                   # Script nạp dữ liệu mẫu tự động (npm run db:seed)
│   └── migrations/
│       ├── migration_lock.toml
│       └── 20261018000000_init/
│           └── migration.sql      # File SQL Migration thực tế khởi tạo toàn bộ 23 bảng
├── src/
│   ├── lib/
│   │   ├── prisma.ts              # Kết nối Prisma PostgreSQL + Bộ nhớ đệm dự phòng (.data/)
│   │   ├── auth.ts                # Mã hóa mật khẩu & Ký JWT Session Cookie
│   │   └── math-grader.ts         # Bộ chấm điểm Toán tương đương & Thuật toán tạo đề ma trận
│   └── app/
│       ├── layout.tsx             # Layout gốc Next.js App Router
│       ├── page.tsx               # Trang chủ hiển thị MathMaster THCS
│       └── api/
│           ├── health/route.ts    # API kiểm tra kết nối Database & trạng thái API Key
│           ├── state/route.ts     # API đồng bộ trạng thái học tập của học sinh
│           ├── auth/route.ts      # API Đăng ký, Đăng nhập, Chuyển tài khoản
│           ├── exams/route.ts     # API Tạo đề thi ngẫu nhiên có kiểm soát theo ma trận
│           ├── attempts/route.ts  # API Làm bài, Tự động lưu, Khôi phục & Nộp bài chấm điểm
│           ├── documents/route.ts # API Upload tài liệu, đọc file .TXT/.MD & kiểm tra OCR Key
│           └── ai/assistant/route.ts # API Trợ lý giải Toán từng bước (Non-AI + Gemini tùy chọn)
├── scripts/
│   └── test-flows.mjs             # Script kiểm thử tự động các luồng Tạo đề, Làm bài, Chấm điểm
├── .env.example                   # File mẫu biến môi trường giải thích chi tiết bằng tiếng Việt
├── package.json                   # Khai báo thư viện & các lệnh chạy chuẩn xác
├── next.config.mjs                # Cấu hình Next.js 14.2
├── tsconfig.json                  # Cấu hình TypeScript
└── HUONG_DAN_CAI_DAT_WINDOWS.md   # Hướng dẫn chi tiết từng bước dành riêng cho Windows
```

---

## 2. Bảng Tương thích Phiên bản Công nghệ

| Thành phần | Phiên bản sử dụng | Ghi chú tương thích |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.18.0` (Khuyến nghị **Node.js 20 LTS**) | Tương thích hoàn toàn với Next.js 14 và Prisma 5 trên Windows 10/11 |
| **Next.js** | `14.2.15` (App Router) | Ổn định, hỗ trợ cả Frontend và Backend API Routes trong 1 dự án |
| **React** | `18.3.1` | Tương thích chuẩn với Next.js 14.2.15 |
| **Prisma ORM** | `5.22.0` (`prisma` & `@prisma/client`) | Phiên bản ổn định cao, tạo migration và seed mượt mà với PostgreSQL |
| **PostgreSQL** | `15.x` hoặc `16.x` | Khuyến nghị dùng dịch vụ quản lý miễn phí **Neon.tech** hoặc **Supabase** |

---

## 3. Tóm tắt Lệnh Chạy Nhanh trên Windows (PowerShell / CMD)

 Mở **PowerShell** hoặc **Terminal trong VS Code** tại thư mục `mathmaster-thcs` và chạy lần lượt:

```powershell
# Bước 1: Tạo file cấu hình môi trường .env từ file mẫu
copy .env.example .env

# Bước 2: Cài đặt đầy đủ các thư viện
npm install

# Bước 3: Khởi tạo Prisma Client và kiểm tra tính hợp lệ của Schema
npx prisma generate
npx prisma validate

# Bước 4: Chạy Migration để tạo 23 bảng trong PostgreSQL (khi đã điền DATABASE_URL trong .env)
npx prisma migrate deploy

# Bước 5: Nạp dữ liệu mẫu (Lớp 6, 7, 8, 9, 3 bộ sách, câu hỏi, đề thi, lịch sử)
npm run db:seed

# Bước 6: Chạy kiểm thử tự động các luồng Tạo đề, Làm bài, Chấm điểm, Khôi phục bài thi
npm run test

# Bước 7: Khởi động máy chủ Website tại http://localhost:3000
npm run dev
```

👉 **Mẹo cực nhanh nếu bạn chỉ muốn mở giao diện học ngay lập tức mà chưa cài Node.js:**
Bạn có thể nhấp đúp chuột mở trực tiếp file `public/mathmaster_thcs.html` bằng trình duyệt Chrome/Edge. Toàn bộ tính năng Tạo đề, Làm bài, Chấm điểm Toán tương đương, Lưu lịch sử (IndexedDB) và Đọc file `.TXT/.MD` đều hoạt động ngay lập tức!

Xem hướng dẫn chi tiết từng bước cho người mới trên Windows tại file **`HUONG_DAN_CAI_DAT_WINDOWS.md`**.
