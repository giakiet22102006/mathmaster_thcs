'use client';

// ==============================================================================
// MathMaster THCS - Trang Đăng Ký Tài Khoản Mới (/register)
// Kiểm tra định dạng email, mật khẩu >= 8 ký tự có chữ & số, khối lớp 6-9, bộ sách
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentGrade, setCurrentGrade] = useState(8);
  const [preferredBook, setPreferredBook] = useState<'KNTT' | 'CD' | 'CTST'>('KNTT');
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      setError('Mật khẩu phải từ 8 ký tự trở lên và bao gồm cả chữ cái lẫn chữ số.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          confirmPassword,
          currentGrade,
          preferredBook,
          schoolName: schoolName.trim() || 'THCS Việt Nam',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Đăng ký không thành công.');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 md:p-8 shadow-2xl border border-slate-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl shadow">
            ∑
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Đăng ký Tài khoản Học tập</h1>
            <p className="text-xs text-slate-500">
              Lưu trữ tiến độ cá nhân, ma trận năng lực & lịch ôn tập SM-2
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên học sinh *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Minh Anh"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Địa chỉ Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="minhanh@school.edu.vn"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu (≥ 8 ký tự, chữ & số) *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ví dụ: ToanHoc123"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Xác nhận mật khẩu *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khối lớp hiện tại *
              </label>
              <select
                value={currentGrade}
                onChange={(e) => setCurrentGrade(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value={6}>Lớp 6</option>
                <option value={7}>Lớp 7</option>
                <option value={8}>Lớp 8</option>
                <option value={9}>Lớp 9 (Ôn thi vào 10)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bộ sách giáo khoa *
              </label>
              <select
                value={preferredBook}
                onChange={(e) => setPreferredBook(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="KNTT">Kết nối tri thức (KNTT)</option>
                <option value="CD">Cánh Diều (CD)</option>
                <option value="CTST">Chân trời sáng tạo (CTST)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Trường THCS (Tùy chọn)
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Ví dụ: THCS Chu Văn An"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản & Bắt đầu học'}
          </button>

          <div className="pt-2 text-center text-xs text-slate-600">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
