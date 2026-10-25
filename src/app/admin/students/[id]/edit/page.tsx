'use client';

// ==============================================================================
// MathMaster THCS - Trang Chỉnh Sửa Thông Tin Học Viên (/admin/students/[id]/edit)
// Tương đương candidates/edit.pug trong Tuyển Dụng IT
// ==============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/MathMasterShell';

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [currentGrade, setCurrentGrade] = useState<number>(8);
  const [preferredBook, setPreferredBook] = useState<'KNTT' | 'CD' | 'CTST'>('KNTT');
  const [schoolName, setSchoolName] = useState('');
  const [xp, setXp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchStudent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/students/${studentId}`);
      if (res.status === 401) {
        router.push(`/login?redirect=/admin/students/${studentId}/edit`);
        return;
      }
      if (res.status === 404) {
        setErrorMsg('Không tìm thấy học viên.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.ok && data.student) {
        const s = data.student;
        setFullName(s.fullName || '');
        setEmail(s.email || '');
        setUsername(s.username || '');
        setCurrentGrade(Number(s.currentGrade || 8));
        setPreferredBook(s.preferredBook || 'KNTT');
        setSchoolName(s.schoolName || '');
        setXp(Number(s.xp || 0));
        setLevel(Number(s.level || 1));
      } else {
        setErrorMsg(data.error || 'Lỗi khi tải thông tin học viên.');
      }
    } catch {
      setErrorMsg('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  }, [studentId, router]);

  useEffect(() => {
    fetch('/api/state?scope=shell')
      .then((res) => res.json())
      .then((d) => {
        const u = d?.state?.user;
        setCurrentUser(u);
        if (u?.role === 'ADMIN') {
          fetchStudent();
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [fetchStudent]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Họ tên không được để trống.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Email không hợp lệ.');
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setErrorMsg('Tên đăng nhập phải có ít nhất 3 ký tự.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          username: username.trim().toLowerCase(),
          currentGrade: Number(currentGrade),
          preferredBook,
          schoolName: schoolName.trim(),
          xp: Number(xp),
          level: Number(level),
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setSuccessMsg(data.message || 'Cập nhật thông tin thành công!');
        setTimeout(() => {
          router.push(`/admin/students/${studentId}`);
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Cập nhật thất bại.');
      }
    } catch {
      setErrorMsg('Lỗi kết nối khi cập nhật.');
    } finally {
      setSubmitting(false);
    }
  }

  const isAuthorized = currentUser?.role === 'ADMIN';

  if (!loading && !isAuthorized) {
    return (
      <AppShell user={currentUser} title="Chỉnh sửa thông tin học viên">
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-900">
          Chỉ có Quản trị viên (ADMIN) mới có quyền chỉnh sửa tài khoản học viên.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      user={currentUser}
      title={`Chỉnh Sửa Học Viên: ${fullName || '...'}`}
      subtitle="Cập nhật hồ sơ cá nhân, bộ sách, trường học và chỉ số học tập"
    >
      <div className="max-w-3xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/admin/students" className="text-indigo-600 font-medium hover:underline">
            ← Danh sách học viên
          </Link>
          <span>/</span>
          <Link href={`/admin/students/${studentId}`} className="text-indigo-600 font-medium hover:underline">
            {fullName || 'Chi tiết'}
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">Chỉnh sửa</span>
        </div>

        {successMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
            {errorMsg}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email đăng nhập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên đăng nhập (Username) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

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

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Trường THCS
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Điểm kinh nghiệm (XP)
                </label>
                <input
                  type="number"
                  min={0}
                  value={xp}
                  onChange={(e) => setXp(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cấp độ (Level)
                </label>
                <input
                  type="number"
                  min={1}
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Link
                href={`/admin/students/${studentId}`}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
              >
                {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
