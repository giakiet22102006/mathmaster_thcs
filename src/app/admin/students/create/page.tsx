'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateStudentPage() {
  const router = useRouter();

  useEffect(() => {
    // Học viên tự đăng ký trực tiếp qua cổng /register với xác thực OTP Gmail
    // Tính năng thêm thủ công trong Admin đã được lược bỏ
    router.replace('/admin/students');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-400 text-sm">
      <div className="text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-2"></div>
        <p>Đang chuyển hướng về trang danh sách học viên...</p>
      </div>
    </div>
  );
}
