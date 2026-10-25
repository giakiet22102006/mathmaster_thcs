'use client';

// ==============================================================================
// MathMaster THCS - Cổng Đăng Nhập Riêng Biệt Quản Trị Viên (/admin/login)
// Thiết kế chuyên biệt cho Ban Quản trị, bảo mật cao tương tự Tuyển Dụng IT
// ==============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin/students';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tự động kiểm tra nếu đã đăng nhập Admin thì chuyển hướng ngay
  useEffect(() => {
    fetch('/api/admin/auth')
      .then((res) => {
        if (res.ok) {
          router.replace(redirectPath);
        }
      })
      .catch(() => {});
  }, [redirectPath, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Vui lòng nhập Email hoặc Tên đăng nhập Quản trị viên.');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu Quản trị viên.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          identifier: identifier.trim(),
          password,
          rememberMe,
          redirect: redirectPath,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        setErrorMsg(data.error || 'Đăng nhập không thành công.');
        return;
      }

      setSuccessMsg(data.message || 'Xác thực Quản trị viên thành công! Đang chuyển hướng...');
      setTimeout(() => {
        router.push(data.redirect || '/admin/students');
        router.refresh();
      }, 600);
    } catch {
      setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
      {/* Hiệu ứng nền bảo mật */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logo & Header Cổng Admin */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-xl shadow-indigo-500/20 mb-4 border border-indigo-400/30">
            ∑
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">MathMaster THCS</h1>
            <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-xs">
              ADMIN
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400 font-medium tracking-wide">
            CỔNG ĐĂNG NHẬP RIÊNG BIỆT DÀNH CHO BAN QUẢN TRỊ
          </p>
        </div>

        {/* Khung Form đăng nhập */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-900/90 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-800 backdrop-blur-md">
            {/* Thông báo lỗi */}
            {errorMsg && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-rose-500/30 bg-rose-950/60 p-4 text-xs font-medium text-rose-200 flex items-start gap-2.5"
              >
                <span className="text-base leading-none">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Thông báo thành công */}
            {successMsg && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-950/60 p-4 text-xs font-medium text-emerald-200 flex items-start gap-2.5"
              >
                <span className="text-base leading-none">✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="admin-identifier"
                  className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Email hoặc Tên đăng nhập Admin
                </label>
                <div className="relative">
                  <input
                    id="admin-identifier"
                    type="text"
                    required
                    autoFocus
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@mathmaster.edu.vn"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
                  >
                    Mật khẩu Quản trị viên
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-slate-400 hover:text-indigo-400 transition"
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Ghi nhớ phiên đăng nhập (30 ngày)</span>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Đang xác thực bảo mật...</span>
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      <span>Đăng nhập Cổng Quản Trị</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Cảnh báo bảo mật */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                🛡️ Khu vực được giám sát an ninh mạng. Mọi lượt truy cập và thao tác đều được ghi nhật ký kiểm toán (Audit Logs) kèm IP và thời gian thực.
              </p>
            </div>
          </div>

          {/* Điều hướng về Cổng người dùng chung */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition"
            >
              <span>←</span>
              <span>Quay lại Cổng đăng nhập Học viên / Giáo viên</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
