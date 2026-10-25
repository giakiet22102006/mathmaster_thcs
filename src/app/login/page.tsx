'use client';

// ==============================================================================
// MathMaster THCS - Trang Đăng Nhập, Quên Mật Khẩu (2 Bước) & Chế Độ Khách (/login)
// Xác thực an toàn: Mã khôi phục 6 số qua SMTP thật, HMAC-SHA256, HTTP 503 trung thực.
// ==============================================================================

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  clearDashboardClientCache,
  warmupDashboardAfterLogin,
} from '@/lib/dashboard-swr';
import { AUTH_ACTIONS } from '@/lib/auth-actions';

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 12) score += 1;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 2) return { score: 1, label: 'Yếu', color: 'bg-rose-500' };
  if (score <= 3) return { score: 2, label: 'Trung bình', color: 'bg-amber-500' };
  return { score: 3, label: 'Mạnh', color: 'bg-emerald-500' };
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [deviceName, setDeviceName] = useState('');

  // Luồng quên mật khẩu 2 bước
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [devCodeTip, setDevCodeTip] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Đọc tham số URL query nếu mở link từ email: /login?mode=reset&email=...
  useEffect(() => {
    const queryMode = searchParams.get('mode');
    const queryEmail = searchParams.get('email');
    if (queryMode === 'reset') {
      setMode('reset');
      if (queryEmail) {
        setForgotEmail(queryEmail.trim().toLowerCase());
      }
    }
  }, [searchParams]);

  // Bộ đếm lùi 60 giây cho nút Gửi lại mã
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

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
          action: AUTH_ACTIONS.LOGIN,
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
      clearDashboardClientCache();
      warmupDashboardAfterLogin(data.user);
      router.prefetch(redirectPath);
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
        body: JSON.stringify({ action: AUTH_ACTIONS.GUEST, currentGrade: 8, preferredBook: 'KNTT' }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Không thể khởi tạo phiên Khách.');
        return;
      }
      clearDashboardClientCache();
      warmupDashboardAfterLogin(data.user);
      router.prefetch('/dashboard');
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Lỗi kết nối khi khởi tạo chế độ Khách.');
    } finally {
      setLoading(false);
    }
  }

  // BƯỚC 1: Gửi yêu cầu mã khôi phục 6 số
  async function handleSendRecoveryCode(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError('');
    setInfoMessage('');
    setDevCodeTip('');

    const targetEmail = forgotEmail.trim() || identifier.trim();
    if (!targetEmail) {
      setError('Vui lòng nhập địa chỉ Email đã đăng ký.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: AUTH_ACTIONS.FORGOT_PASSWORD,
          email: targetEmail,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        // Xử lý lỗi 503 chưa cấu hình SMTP hoặc 429 quá tần suất
        if (res.status === 503 || data.code === 'SMTP_NOT_CONFIGURED') {
          setError(
            data.error ||
              'Hệ thống chưa cấu hình dịch vụ gửi email (SMTP). Vui lòng liên hệ quản trị viên.'
          );
        } else {
          setError(data.error || 'Không thể gửi mã khôi phục mật khẩu.');
        }
        return;
      }

      setForgotEmail(targetEmail);
      setInfoMessage(
        data.message || 'Mã khôi phục 6 số (hiệu lực 15 phút) đã được gửi đến email của bạn.'
      );
      setResendCountdown(60);

      if (data.devCode) {
        setDevCodeTip(data.devCode);
        setResetCode(data.devCode);
      }

      // Luôn chuyển sang Bước 2 nhập mã
      setMode('reset');
    } catch {
      setError('Lỗi kết nối khi gửi yêu cầu khôi phục mật khẩu.');
    } finally {
      setLoading(false);
    }
  }

  // BƯỚC 2: Nhập mã 6 số + Mật khẩu mới
  async function handleResetPasswordWithCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleanCode = resetCode.trim();
    if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setError('Vui lòng nhập đúng mã khôi phục gồm 6 chữ số.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm cả chữ và số.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: AUTH_ACTIONS.RESET_PASSWORD,
          email: forgotEmail.trim(),
          code: cleanCode,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Không thể đặt lại mật khẩu.');
        return;
      }

      setInfoMessage('✓ Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.');
      setMode('login');
      setPassword('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setDevCodeTip('');
    } catch {
      setError('Lỗi kết nối khi đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  }

  const pwdStrength = getPasswordStrength(newPassword);

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
            className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 leading-relaxed"
          >
            ⚠️ {error}
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800 leading-relaxed">
            {infoMessage}
          </div>
        )}

        {devCodeTip && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <span>🛠️</span> Chế độ thử nghiệm (DEV):
            </div>
            <div>
              Mã khôi phục tạm thời của bạn: <strong className="font-mono text-sm px-1.5 py-0.5 bg-amber-200 rounded">{devCodeTip}</strong>
            </div>
            <div className="text-[11px] text-amber-700 mt-1">
              (Chỉ hiển thị khi chạy môi trường dev và chưa cấu hình máy chủ SMTP).
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MÀN HÌNH ĐĂNG NHẬP                                           */}
        {/* ------------------------------------------------------------- */}
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
                    setInfoMessage('');
                    setForgotEmail(identifier.includes('@') ? identifier.trim() : '');
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

            <div className="pt-3 mt-2 border-t border-slate-100 text-center">
              <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition">
                <span>🛡️</span>
                <span>Cổng Đăng Nhập Quản Trị Viên (Admin) →</span>
              </Link>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* BƯỚC 1: QUÊN MẬT KHẨU - NHẬP EMAIL                           */}
        {/* ------------------------------------------------------------- */}
        {mode === 'forgot' && (
          <form onSubmit={handleSendRecoveryCode} className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Khôi phục mật khẩu (Bước 1/2)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Nhập địa chỉ Email đã đăng ký để nhận mã xác nhận 6 chữ số (hiệu lực 15 phút).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ Email tài khoản *
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Ví dụ: minhanh@school.edu.vn"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setInfoMessage('');
                  setMode('login');
                }}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Quay lại Đăng nhập
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 disabled:opacity-60 transition"
              >
                {loading ? 'Đang gửi...' : 'Gửi mã khôi phục →'}
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 leading-relaxed border border-slate-100">
              ℹ️ Nếu bạn đã có mã 6 số từ email trước đó,{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('reset');
                }}
                className="font-bold text-indigo-600 hover:underline"
              >
                bấm vào đây để nhập mã trực tiếp
              </button>.
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* BƯỚC 2: NHẬP MÃ 6 SỐ + MẬT KHẨU MỚI                           */}
        {/* ------------------------------------------------------------- */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPasswordWithCode} className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800">Đặt lại mật khẩu (Bước 2/2)</h2>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMode('forgot');
                  }}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  Đổi email khác
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {forgotEmail ? (
                  <>
                    Mã xác nhận 6 số đã được gửi tới{' '}
                    <strong className="text-indigo-950">{maskEmail(forgotEmail)}</strong>.
                  </>
                ) : (
                  'Nhập email, mã 6 số nhận được và mật khẩu mới của bạn.'
                )}
              </p>
            </div>

            {!forgotEmail && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email tài khoản *
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Mã khôi phục (6 chữ số) *
                </label>
                <button
                  type="button"
                  disabled={resendCountdown > 0 || loading}
                  onClick={() => handleSendRecoveryCode()}
                  className="text-xs font-medium text-indigo-600 hover:underline disabled:text-slate-400 disabled:no-underline"
                >
                  {resendCountdown > 0 ? `Gửi lại mã (${resendCountdown}s)` : 'Gửi lại mã'}
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]{6}"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Ví dụ: 123456"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-center text-lg font-mono tracking-[0.35em] font-bold text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Mật khẩu mới (≥ 8 ký tự, chữ & số) *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none"
              />
              {newPassword && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                      style={{ width: `${(pwdStrength.score / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">
                    Độ mạnh: {pwdStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Xác nhận mật khẩu mới *
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[11px] text-slate-500 hover:text-slate-800"
                >
                  {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setInfoMessage('');
                  setMode('login');
                }}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-60 transition"
              >
                {loading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center pt-1 leading-relaxed">
              💡 Không thấy thư chứa mã? Hãy kiểm tra mục <strong>Thư rác (Spam)</strong> hoặc <strong>Quảng cáo</strong> trong hòm thư của bạn.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-indigo-950 text-white text-sm">
          Đang tải giao diện đăng nhập...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
