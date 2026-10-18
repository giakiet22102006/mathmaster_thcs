import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MathMaster THCS — Nền tảng Luyện thi & Học Toán Lớp 6, 7, 8, 9',
  description: 'Hệ thống tạo đề thi ngẫu nhiên theo ma trận, chấm điểm Toán tương đương và phân tích lỗ hổng kiến thức THCS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden', height: '100vh', width: '100vw' }}>
        {children}
      </body>
    </html>
  );
}
