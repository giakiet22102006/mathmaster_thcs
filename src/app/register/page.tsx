'use client';

// ==============================================================================
// MathMaster THCS - Trang Đăng Ký Tài Khoản & Xác Thực Gmail (/register)
// Luồng 2 bước: Điền thông tin -> Gửi mã OTP 6 số tới Gmail -> Nhập mã để kích hoạt
// ==============================================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  clearDashboardClientCache,
  warmupDashboardAfterLogin,
} from '@/lib/dashboard-swr';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  // Form states
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentGrade, setCurrentGrade] = useState(8);
  const [preferredBook, setPreferredBook] = useState<'KNTT' | 'CD' | 'CTST'>('KNTT');
  const [schoolName, setSchoolName] = useState('');

  // OTP states
  const [otpCode, setOtpCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Đếm ngược 60s cooldown gửi lại mã
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // BƯỚC 1: Kiểm tra form & Gửi mã OTP tới Gmail
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

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
          action: 'send-register-otp',
          fullName: fullName.trim(),
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Không thể gửi mã xác thực. Vui lòng thử lại.');
        return;
      }

      setStep('otp');
      setResendCooldown(60);
      if (data.devCode) {
        setDevCode(data.devCode);
      }
      setSuccessMsg(data.message || 'Mã xác thực 6 số đã được gửi đến hòm thư Gmail của bạn.');
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền.');
    } finally {
      setLoading(false);
    }
  }

  // Gửi lại mã OTP
  async function handleResendOtp() {
    if (resendCooldown > 0 || loading) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-register-otp',
          fullName: fullName.trim(),
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Gửi lại mã thất bại. Vui lòng thử lại sau.');
        return;
      }

      setResendCooldown(60);
      if (data.devCode) {
        setDevCode(data.devCode);
      }
      setSuccessMsg('Đã gửi lại mã xác thực mới đến Gmail của bạn.');
    } catch {
      setError('Lỗi kết nối. Không thể gửi lại mã xác thực.');
    } finally {
      setLoading(false);
    }
  }

  // BƯỚC 2: Nhập OTP & Hoàn tất đăng ký tài khoản
  async function handleVerifyAndRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const cleanCode = otpCode.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setError('Vui lòng nhập đúng mã xác thực 6 chữ số gửi về Gmail.');
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
          verificationCode: cleanCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Xác thực không thành công. Vui lòng thử lại.');
        return;
      }

      clearDashboardClientCache();
      warmupDashboardAfterLogin(data.user);
      router.prefetch('/dashboard');
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Không thể kết nối máy chủ để hoàn tất đăng ký.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 md:p-8 shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl shadow">
            ∑
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {step === 'form' ? 'Đăng ký Tài khoản Học tập' : 'Xác thực Địa chỉ Gmail'}
            </h1>
            <p className="text-xs text-slate-500">
              {step === 'form'
                ? 'Lưu trữ tiến độ cá nhân, ma trận năng lực & lịch ôn tập SM-2'
                : `Bước 2/2: Nhập mã 6 chữ số gửi tới ${email}`}
            </p>
          </div>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 animate-fadeIn"
          >
            ⚠️ {error}
          </div>
        )}

        {/* Thông báo thành công */}
        {successMsg && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800 animate-fadeIn"
          >
            ✅ {successMsg}
          </div>
        )}

        {/* BƯỚC 1: FORM NHẬP THÔNG TIN */}
        {step === 'form' && (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
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
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Địa chỉ Gmail / Email học tập *
                </label>
                <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  Sẽ nhận mã OTP xác thực
                </span>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hocsinh@gmail.com"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none transition"
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
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none transition"
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
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none transition"
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
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Đang gửi mã xác thực...</span>
                </>
              ) : (
                <span>Tiếp tục: Gửi mã xác thực Gmail &rarr;</span>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-slate-600">
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-bold text-indigo-600 hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </form>
        )}

        {/* BƯỚC 2: NHẬP MÃ XÁC THỰC GMAIL */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-4 text-center">
              <div className="text-3xl mb-1">📬</div>
              <p className="text-sm font-bold text-indigo-950">
                Kiểm tra hòm thư Gmail của bạn
              </p>
              <p className="text-xs text-indigo-800 mt-1">
                Chúng tôi đã gửi mã xác thực 6 số đến{' '}
                <strong className="text-indigo-900 underline">{email}</strong>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                (Mã có hiệu lực trong 15 phút. Nếu không thấy, hãy kiểm tra mục Spam)
              </p>
            </div>

            {/* Gợi ý mã OTP ở chế độ dev */}
            {devCode && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-center text-xs text-amber-800">
                <span className="font-bold">⚡ [Dev Gợi Ý]:</span> Mã OTP thử nghiệm của bạn là:{' '}
                <strong className="font-mono text-sm tracking-widest text-indigo-700 bg-white px-2 py-0.5 rounded border border-amber-300">
                  {devCode}
                </strong>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 text-center mb-2">
                Nhập mã xác thực 6 chữ số *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="------"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold py-3 px-4 rounded-xl border-2 border-indigo-200 focus:border-indigo-600 focus:outline-none bg-slate-50 text-indigo-950 shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.trim().length !== 6}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Đang kích hoạt tài khoản...</span>
                </>
              ) : (
                <span>Xác nhận & Hoàn tất đăng ký &rarr;</span>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setError('');
                  setSuccessMsg('');
                }}
                className="font-medium text-slate-600 hover:text-indigo-600 transition"
              >
                &larr; Đổi địa chỉ email khác
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                className="font-bold text-indigo-600 hover:underline disabled:text-slate-400 disabled:no-underline transition"
              >
                {resendCooldown > 0 ? `Gửi lại mã sau (${resendCooldown}s)` : 'Gửi lại mã OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
