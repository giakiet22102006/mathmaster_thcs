'use client';

// ==============================================================================
// MathMaster THCS - Trang Thêm Mới Tài Khoản Học Viên (/admin/students/create)
// Tương đương candidates/create.pug trong Tuyển Dụng IT
// ==============================================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/MathMasterShell';

export default function CreateStudentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Dữ liệu Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [passwordMode, setPasswordMode] = useState<'auto' | 'custom'>('auto');
  const [customPassword, setCustomPassword] = useState('');
  const [currentGrade, setCurrentGrade] = useState<number>(8);
  const [preferredBook, setPreferredBook] = useState<'KNTT' | 'CD' | 'CTST'>('KNTT');
  const [schoolName, setSchoolName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal Thành công kèm Mật khẩu tạm thời
  const [successModal, setSuccessModal] = useState<{
    show: boolean;
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentUsername: string;
    tempPassword: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/state?scope=shell')
      .then((res) => res.json())
      .then((data) => {
        const u = data?.state?.user;
        setUser(u);
        setLoadingUser(false);
      })
      .catch(() => setLoadingUser(false));
  }, []);

  // Tự sinh gợi ý username khi nhập email
  function handleEmailChange(val: string) {
    setEmail(val);
    if (!username && val.includes('@')) {
      const prefix = val.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      setUsername(prefix.toLowerCase());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên học viên.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setErrorMsg('Tên đăng nhập phải có ít nhất 3 ký tự.');
      return;
    }
    if (passwordMode === 'custom' && (!customPassword.trim() || customPassword.trim().length < 6)) {
      setErrorMsg('Mật khẩu tự tạo phải có tối thiểu 6 ký tự.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        currentGrade: Number(currentGrade),
        preferredBook,
        schoolName: schoolName.trim() || 'Trường THCS',
      };
      if (passwordMode === 'custom') {
        payload.password = customPassword.trim();
      }

      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.ok) {
        setErrorMsg(data.error || 'Tạo tài khoản học viên thất bại.');
        return;
      }

      setSuccessModal({
        show: true,
        studentId: data.student.id,
        studentName: data.student.fullName,
        studentEmail: data.student.email,
        studentUsername: data.student.username,
        tempPassword: data.tempPassword,
      });
    } catch {
      setErrorMsg('Lỗi kết nối khi gửi yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isAuthorized = user?.role === 'ADMIN';

  if (!loadingUser && !isAuthorized) {
    return (
      <AppShell user={user} title="Thêm mới Học viên">
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-900">
          Chỉ có Quản trị viên (ADMIN) mới có quyền thêm mới tài khoản học viên.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      user={user}
      title="Thêm Mới Tài Khoản Học Viên"
      subtitle="Tạo mới học sinh và cấp thông tin đăng nhập tự động"
    >
      <div className="max-w-3xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/admin/students" className="text-indigo-600 font-medium hover:underline">
            ← Danh sách học viên
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">Thêm học viên mới</span>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
            {errorMsg}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Họ và tên */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email đăng nhập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="hocvien@mathmaster.edu.vn"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Tên đăng nhập */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên đăng nhập (Username) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nguyenvanan_lop8"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Khối lớp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Khối lớp THCS
                </label>
                <select
                  value={currentGrade}
                  onChange={(e) => setCurrentGrade(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none bg-white cursor-pointer"
                >
                  <option value={6}>Toán Lớp 6</option>
                  <option value={7}>Toán Lớp 7</option>
                  <option value={8}>Toán Lớp 8</option>
                  <option value={9}>Toán Lớp 9</option>
                </select>
              </div>

              {/* Bộ sách giáo khoa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bộ sách giáo khoa trọng tâm
                </label>
                <select
                  value={preferredBook}
                  onChange={(e) => setPreferredBook(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="KNTT">Kết nối tri thức với cuộc sống</option>
                  <option value="CD">Cánh Diều</option>
                  <option value="CTST">Chân trời sáng tạo</option>
                </select>
              </div>

              {/* Tên trường */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên trường THCS
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Ví dụ: THCS Chu Văn An, Hà Nội"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Thiết lập Mật khẩu ban đầu */}
              <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Thiết lập mật khẩu ban đầu
                </label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="pwdMode"
                      checked={passwordMode === 'auto'}
                      onChange={() => setPasswordMode('auto')}
                      className="text-indigo-600"
                    />
                    <span>Tự động tạo mật khẩu ngẫu nhiên an toàn (Khuyên dùng)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="pwdMode"
                      checked={passwordMode === 'custom'}
                      onChange={() => setPasswordMode('custom')}
                      className="text-indigo-600"
                    />
                    <span>Nhập mật khẩu thủ công</span>
                  </label>
                </div>

                {passwordMode === 'custom' && (
                  <input
                    type="password"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Nhập tối thiểu 6 ký tự..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
                  />
                )}
                <p className="text-xs text-slate-500 mt-2">
                  * Mật khẩu tạm thời sẽ được hiển thị ngay sau khi tạo để bạn sao chép gửi cho học sinh.
                  Học sinh sẽ được yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Link
                href="/admin/students"
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
              >
                {submitting ? 'Đang tạo tài khoản...' : 'Tạo mới Học viên'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Thông báo Tạo thành công */}
      {successModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-2xl mb-3">
              ✓
            </div>
            <h3 className="font-bold text-xl text-slate-900">Tạo tài khoản học viên thành công!</h3>
            <p className="text-sm text-slate-600 mt-1">
              Thông tin đăng nhập đã được khởi tạo trên hệ thống MathMaster THCS:
            </p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Họ và tên:</span>
                <span className="font-bold text-slate-900">{successModal.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-800">{successModal.studentEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tên đăng nhập:</span>
                <span className="font-mono font-semibold text-slate-800">{successModal.studentUsername}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-semibold">Mật khẩu tạm thời:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-indigo-700 tracking-wider">
                    {successModal.tempPassword}
                  </span>
                  <button
                    onClick={() => handleCopy(successModal.tempPassword)}
                    className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                  >
                    {copied ? '✓ Đã chép' : 'Sao chép'}
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-amber-600 font-medium">
              * Mật khẩu tạm thời chỉ hiển thị một lần tại màn hình này. Hãy lưu lại hoặc sao chép gửi
              ngay cho học sinh/phụ huynh.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <Link
                href={`/admin/students/${successModal.studentId}`}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Xem chi tiết hồ sơ
              </Link>
              <Link
                href="/admin/students"
                className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
