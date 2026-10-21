'use client';

// ==============================================================================
// MathMaster THCS - Trang Đăng Nhập, Quên Mật Khẩu & Chế Độ Khách (/login)
// Xác thực mật khẩu bắt buộc (scrypt + JWT HttpOnly Cookie), không lộ danh sách tài khoản
// ==============================================================================

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    if (!identifier.trim() || !password) {
      setError('Vui lòng nhập đầy đủ Email/Tên đăng nhập và Mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          identifier: identifier.trim(),
          password,
          deviceName: deviceName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
        return;
      }
      router.push(redirectPath);
      router.refresh();
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestLogin() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'guest', currentGrade: 8, preferredBook: 'KNTT' }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Không thể khởi tạo phiên Khách.');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Lỗi kết nối khi khởi tạo chế độ Khách.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    if (!identifier.trim()) {
      setError('Vui lòng nhập địa chỉ Email đã đăng ký.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot_password', email: identifier.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Không thể gửi yêu cầu khôi phục mật khẩu.');
        return;
      }
      setInfoMessage(data.message || 'Đã tạo mã khôi phục mật khẩu (hiệu lực 30 phút).');
      if (data.devResetToken) {
        setResetToken(data.devResetToken);
        setMode('reset');
      }
    } catch {
      setError('Lỗi kết nối khi gửi yêu cầu khôi phục mật khẩu.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          token: resetToken.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Không thể đặt lại mật khẩu.');
        return;
      }
      setInfoMessage('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
      setPassword('');
      setMode('login');
    } catch {
      setError('Lỗi kết nối khi đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 md:p-8 shadow-2xl border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl shadow">
            ∑
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">MathMaster THCS</h1>
            <p className="text-xs text-slate-500">
              Hệ thống Luyện thi & Học Toán Lớp 6, 7, 8, 9 chuẩn GDPT 2018
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

        {infoMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800">
            ✓ {infoMessage}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email hoặc Tên đăng nhập *
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ví dụ: minhanh.g8@mathmaster.vn"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Mật khẩu *</label>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMode('forgot');
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Tên thiết bị này (Tùy chọn, giúp quản lý phiên đăng nhập)
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Ví dụ: Laptop cá nhân ở nhà"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
            </button>

            <div className="relative my-3 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-slate-400">HOẶC</span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              👤 Dùng thử với tư cách Khách (Dữ liệu tạm thời)
            </button>

            <div className="pt-2 text-center text-xs text-slate-600">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-bold text-indigo-600 hover:underline">
                Đăng ký tài khoản mới
              </Link>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Khôi phục mật khẩu</h2>
            <p className="text-xs text-slate-500">
              Nhập địa chỉ Email của bạn để nhận mã đặt lại mật khẩu dùng một lần (hết hạn sau 30 phút).
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="email@mathmaster.edu.vn"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="flex-1 rounded-xl border border-slate-300 py-2 text-xs font-semibold text-slate-700"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white"
              >
                Lấy mã khôi phục
              </button>
            </div>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Đặt mật khẩu mới</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã khôi phục (Token 1 lần) *
              </label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu mới (Tối thiểu 8 ký tự, gồm chữ và số) *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="flex-1 rounded-xl border border-slate-300 py-2 text-xs font-semibold text-slate-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white"
              >
                Xác nhận đổi mật khẩu
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <LoginContent />
    </Suspense>
  );
}
