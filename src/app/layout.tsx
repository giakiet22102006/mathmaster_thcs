import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MathMaster THCS — Nền tảng Luyện thi & Học Toán Lớp 6, 7, 8, 9',
  description:
    'Hệ thống tạo đề thi ngẫu nhiên theo ma trận 4 mức độ nhận thức, chấm điểm Toán tương đương, ôn tập ngắt quãng SM-2 và quản lý lớp học THCS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
