'use client';

// ==============================================================================
// MathMaster THCS - Trang Quản Trị Danh Sách Học Viên (/admin/students)
// Thiết kế & phân luồng theo cấu trúc Tuyển Dụng IT (candidates/index.pug)
// ==============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/MathMasterShell';

interface StudentItem {
  id: string;
  fullName: string;
  email: string;
  username: string;
  currentGrade: number;
  preferredBook: string;
  schoolName: string;
  xp: number;
  level: number;
  streakDays: number;
  status: 'active' | 'banned' | 'deleted';
  banReason?: string;
  deletedAt?: string | null;
  createdAt: string;
  totalAttempts: number;
  avgScore: number;
  passedCount: number;
  latestAttemptDate?: string | null;
  activeSessionsCount: number;
}

export default function AdminStudentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [summary, setSummary] = useState({
    totalAll: 0,
    activeCount: 0,
    bannedCount: 0,
    deletedCount: 0,
  });

  // Bộ lọc
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [sortFilter, setSortFilter] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  // Chọn hàng loạt (Bulk selection)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Trạng thái Modals
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Khóa học viên
  const [banModalTarget, setBanModalTarget] = useState<StudentItem | null>(null);
  const [banReason, setBanReason] = useState('');
  const [isBulkBan, setIsBulkBan] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Modal Mật khẩu tạm thời
  const [tempPasswordModal, setTempPasswordModal] = useState<{
    show: boolean;
    studentName: string;
    studentEmail: string;
    tempPass: string;
  }>({
    show: false,
    studentName: '',
    studentEmail: '',
    tempPass: '',
  });

  const [copiedPass, setCopiedPass] = useState(false);

  // Tải thông tin phiên và danh sách học viên
  const fetchStudents = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: search.trim(),
        status: statusFilter,
        grade: gradeFilter,
        sort: sortFilter,
      });

      const res = await fetch(`/api/admin/students?${params.toString()}`);
      if (res.status === 401) {
        router.push('/login?redirect=/admin/students');
        return;
      }
      if (res.status === 403) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.ok) {
        setStudents(data.students || []);
        setSummary(data.summary || { totalAll: 0, activeCount: 0, bannedCount: 0, deletedCount: 0 });
        setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, limit: 10 });
        setSelectedIds([]);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Lỗi khi nạp danh sách học viên.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Không thể kết nối đến máy chủ.' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, gradeFilter, sortFilter, router]);

  useEffect(() => {
    fetch('/api/state?scope=shell')
      .then((res) => res.json())
      .then((data) => {
        const u = data?.state?.user;
        setUser(u);
        if (u && u.role !== 'ADMIN') {
          setLoading(false);
        } else {
          fetchStudents(1);
        }
      })
      .catch(() => setLoading(false));
  }, [fetchStudents]);

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPage(1);
    fetchStudents(1);
  }

  function handleResetFilter() {
    setSearch('');
    setStatusFilter('all');
    setGradeFilter('ALL');
    setSortFilter('newest');
    setCurrentPage(1);
    setTimeout(() => fetchStudents(1), 0);
  }

  // Xử lý chọn hàng loạt
  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(students.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  // Thao tác Đặt lại mật khẩu
  async function handleResetPassword(student: StudentItem) {
    if (!window.confirm(`Bạn có chắc chắn muốn đặt lại mật khẩu ngẫu nhiên cho học viên "${student.fullName}"?`)) {
      return;
    }
    try {
      setSubmittingAction(true);
      const res = await fetch(`/api/admin/students/${student.id}/reset-password`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.ok) {
        setTempPasswordModal({
          show: true,
          studentName: student.fullName,
          studentEmail: student.email,
          tempPass: data.tempPassword,
        });
        setCopiedPass(false);
        setStatusMsg({ type: 'success', text: `Đã cấp mật khẩu mới cho học viên ${student.fullName}.` });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Đặt lại mật khẩu thất bại.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Lỗi mạng khi đặt lại mật khẩu.' });
    } finally {
      setSubmittingAction(false);
    }
  }

  // Thao tác Khóa tài khoản
  async function handleConfirmBan() {
    if (!banReason.trim()) {
      alert('Vui lòng nhập lý do khóa tài khoản bắt buộc.');
      return;
    }

    try {
      setSubmittingAction(true);
      if (isBulkBan) {
        const res = await fetch('/api/admin/students/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ban', ids: selectedIds, reason: banReason.trim() }),
        });
        const data = await res.json();
        if (data.ok) {
          setStatusMsg({ type: 'success', text: data.message });
          setBanModalTarget(null);
          setIsBulkBan(false);
          setBanReason('');
          fetchStudents(currentPage);
        } else {
          alert(data.error || 'Khóa hàng loạt thất bại.');
        }
      } else if (banModalTarget) {
        const res = await fetch(`/api/admin/students/${banModalTarget.id}/ban`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: banReason.trim() }),
        });
        const data = await res.json();
        if (data.ok) {
          setStatusMsg({ type: 'success', text: data.message });
          setBanModalTarget(null);
          setBanReason('');
          fetchStudents(currentPage);
        } else {
          alert(data.error || 'Khóa tài khoản thất bại.');
        }
      }
    } catch {
      alert('Lỗi kết nối máy chủ.');
    } finally {
      setSubmittingAction(false);
    }
  }

  // Thao tác Mở khóa
  async function handleUnban(student: StudentItem) {
    if (!window.confirm(`Bạn có chắc muốn mở khóa cho học viên "${student.fullName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/students/${student.id}/unban`, { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setStatusMsg({ type: 'success', text: data.message });
        fetchStudents(currentPage);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Mở khóa thất bại.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Lỗi mạng khi mở khóa.' });
    }
  }

  // Thao tác Xóa mềm & Khôi phục
  async function handleSoftDelete(student: StudentItem) {
    if (!window.confirm(`Bạn có chắc muốn chuyển học viên "${student.fullName}" vào danh sách xóa mềm?`)) return;
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setStatusMsg({ type: 'success', text: data.message });
        fetchStudents(currentPage);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Xóa mềm thất bại.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Lỗi mạng khi xóa mềm.' });
    }
  }

  async function handleRestore(student: StudentItem) {
    if (!window.confirm(`Khôi phục tài khoản học viên "${student.fullName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/students/${student.id}/restore`, { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setStatusMsg({ type: 'success', text: data.message });
        fetchStudents(currentPage);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Khôi phục thất bại.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Lỗi mạng khi khôi phục.' });
    }
  }

  // Thao tác Hàng loạt (Bulk actions)
  async function handleBulkAction(action: 'unban' | 'delete' | 'restore') {
    if (selectedIds.length === 0) return;
    const actionLabels: Record<string, string> = {
      unban: 'mở khóa',
      delete: 'xóa mềm',
      restore: 'khôi phục',
    };
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionLabels[action]} ${selectedIds.length} học viên đã chọn?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedIds }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMsg({ type: 'success', text: data.message });
        fetchStudents(currentPage);
      } else {
        alert(data.error || 'Thao tác thất bại.');
      }
    } catch {
      alert('Lỗi kết nối khi thao tác hàng loạt.');
    }
  }

  function copyPasswordToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  }

  const isAuthorized = user?.role === 'ADMIN';

  if (!loading && !isAuthorized) {
    return (
      <AppShell user={user} title="Quản trị Học viên">
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-900">
          <h2 className="font-bold text-base mb-1">Quyền truy cập bị từ chối (403)</h2>
          <p>
            Phân luồng quản trị tài khoản học viên chỉ dành riêng cho Quản trị viên (ADMIN). Vui lòng
            đăng nhập bằng tài khoản Quản trị viên hệ thống để truy cập.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      user={user}
      title="Quản Trị Tài Khoản Học Viên THCS"
      subtitle="Quản lý toàn bộ thông tin học viên, kết quả học tập, khóa/mở khóa và bảo mật tài khoản"
      rightActions={
        <Link
          href="/admin/students/create"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          <span>➕</span>
          <span>Thêm Học viên mới</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Thông báo trạng thái */}
        {statusMsg && (
          <div
            className={`flex items-center justify-between rounded-xl p-4 text-sm font-medium ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{statusMsg.text}</span>
            <button
              onClick={() => setStatusMsg(null)}
              className="text-xs font-bold hover:underline ml-4"
            >
              Đóng
            </button>
          </div>
        )}

        {/* 4 Thẻ chỉ số tổng quan */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng học viên</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{summary.totalAll}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Đang hoạt động</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{summary.activeCount}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
            <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">Đã bị khóa</p>
            <p className="mt-1 text-2xl font-bold text-rose-700">{summary.bannedCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-xs">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Đã xóa mềm</p>
            <p className="mt-1 text-2xl font-bold text-slate-700">{summary.deletedCount}</p>
          </div>
        </div>

        {/* Bộ lọc tìm kiếm */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Tìm kiếm từ khóa
              </label>
              <input
                id="search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Họ tên, email, username, trường..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="status-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái tài khoản
              </label>
              <select
                id="status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white cursor-pointer"
              >
                <option value="all">-- Tất cả trạng thái --</option>
                <option value="active">Đang hoạt động</option>
                <option value="banned">Đã bị khóa</option>
                <option value="deleted">Đã xóa mềm</option>
              </select>
            </div>

            <div>
              <label htmlFor="grade-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Khối lớp THCS
              </label>
              <select
                id="grade-select"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white cursor-pointer"
              >
                <option value="ALL">-- Tất cả các khối --</option>
                <option value="6">Toán Lớp 6</option>
                <option value="7">Toán Lớp 7</option>
                <option value="8">Toán Lớp 8</option>
                <option value="9">Toán Lớp 9</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-slate-900 py-2 px-4 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                🔍 Lọc dữ liệu
              </button>
              <button
                type="button"
                onClick={handleResetFilter}
                className="rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Đặt lại
              </button>
            </div>
          </form>
        </div>

        {/* Thanh thao tác hàng loạt (Bulk Actions) */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3 text-sm text-indigo-900">
            <span className="font-semibold">
              Đã chọn {selectedIds.length} học viên trên trang này
            </span>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => {
                  setIsBulkBan(true);
                  setBanModalTarget(null);
                  setBanReason('');
                }}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition"
              >
                🚫 Khóa đã chọn
              </button>
              <button
                onClick={() => handleBulkAction('unban')}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                🔓 Mở khóa đã chọn
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 transition"
              >
                🗑️ Xóa mềm đã chọn
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* Bảng danh sách học viên */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={students.length > 0 && selectedIds.length === students.length}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Học viên</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Lớp & Sách</th>
                  <th className="py-3 px-4">Trường THCS</th>
                  <th className="py-3 px-4 text-center">Lượt thi / Điểm TB</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Ngày tạo</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-2"></div>
                      <p>Đang tải dữ liệu học viên...</p>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      Không tìm thấy tài khoản học viên nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  students.map((st) => {
                    const isSelected = selectedIds.includes(st.id);
                    return (
                      <tr
                        key={st.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(st.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                              {st.fullName.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <Link
                                href={`/admin/students/${st.id}`}
                                className="font-semibold text-slate-900 hover:text-indigo-600 transition"
                              >
                                {st.fullName}
                              </Link>
                              <p className="text-xs text-slate-400">@{st.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">{st.email}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                              Lớp {st.currentGrade}
                            </span>
                            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                              {st.preferredBook}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs">{st.schoolName}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-slate-800">{st.totalAttempts} đề</span>
                          {st.totalAttempts > 0 && (
                            <span className="block text-xs font-semibold text-emerald-600">
                              TB: {st.avgScore}/10
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {st.status === 'deleted' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-300">
                              Đã xóa mềm
                            </span>
                          ) : st.status === 'banned' ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-300 cursor-help"
                              title={st.banReason ? `Lý do: ${st.banReason}` : 'Đã bị khóa'}
                            >
                              Đã khóa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-300">
                              Hoạt động
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {new Date(st.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/students/${st.id}`}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                              title="Xem chi tiết hồ sơ & bài thi"
                            >
                              👁️
                            </Link>
                            <Link
                              href={`/admin/students/${st.id}/edit`}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition"
                              title="Chỉnh sửa thông tin"
                            >
                              ✏️
                            </Link>
                            <button
                              onClick={() => handleResetPassword(st)}
                              disabled={submittingAction}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                              title="Đặt lại mật khẩu tạm thời"
                            >
                              🔑
                            </button>
                            {st.status === 'banned' ? (
                              <button
                                onClick={() => handleUnban(st)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition"
                                title="Mở khóa tài khoản"
                              >
                                🔓
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setIsBulkBan(false);
                                  setBanModalTarget(st);
                                  setBanReason('');
                                }}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition"
                                title="Khóa tài khoản"
                              >
                                🚫
                              </button>
                            )}
                            {st.status === 'deleted' ? (
                              <button
                                onClick={() => handleRestore(st)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                                title="Khôi phục tài khoản"
                              >
                                🔄
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSoftDelete(st)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                                title="Xóa mềm"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3">
              <span className="text-xs text-slate-500">
                Hiển thị trang {pagination.currentPage} / {pagination.totalPages} (Tổng cộng{' '}
                {pagination.totalItems} học viên)
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={pagination.currentPage <= 1}
                  onClick={() => {
                    setCurrentPage((p) => p - 1);
                    fetchStudents(pagination.currentPage - 1);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Trước
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setCurrentPage(p);
                      fetchStudents(p);
                    }}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                      p === pagination.currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => {
                    setCurrentPage((p) => p + 1);
                    fetchStudents(pagination.currentPage + 1);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Khóa tài khoản (bắt buộc nhập lý do) */}
      {(banModalTarget || isBulkBan) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-lg text-slate-900">
              {isBulkBan ? `Khóa ${selectedIds.length} học viên đã chọn` : `Khóa tài khoản học viên`}
            </h3>
            {!isBulkBan && banModalTarget && (
              <p className="text-sm text-slate-600 mt-1">
                Học viên: <span className="font-semibold text-slate-900">{banModalTarget.fullName}</span> ({banModalTarget.email})
              </p>
            )}
            <p className="text-xs text-rose-600 mt-2 font-medium">
              * Hành động này sẽ thu hồi toàn bộ phiên đăng nhập hiện có của học viên trên tất cả thiết bị.
            </p>

            <div className="mt-4">
              <label htmlFor="ban-reason-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Lý do khóa tài khoản (Bắt buộc)
              </label>
              <textarea
                id="ban-reason-input"
                rows={3}
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Nhập lý do khóa (vi phạm quy chế thi, yêu cầu từ phụ huynh, nghi vấn gian lận...)"
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setBanModalTarget(null);
                  setIsBulkBan(false);
                  setBanReason('');
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmBan}
                disabled={submittingAction || !banReason.trim()}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {submittingAction ? 'Đang khóa...' : 'Xác nhận Khóa tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mật khẩu tạm thời sau khi Đặt lại mật khẩu */}
      {tempPasswordModal.show && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-xl mb-3">
              ✓
            </div>
            <h3 className="font-bold text-lg text-slate-900">Mật khẩu tạm thời mới</h3>
            <p className="text-sm text-slate-600 mt-1">
              Đã đặt lại mật khẩu cho học viên{' '}
              <span className="font-semibold text-slate-900">{tempPasswordModal.studentName}</span>
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium">Mật khẩu tạm (chỉ hiển thị một lần):</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-mono text-lg font-bold text-indigo-700 tracking-wider">
                  {tempPasswordModal.tempPass}
                </span>
                <button
                  onClick={() => copyPasswordToClipboard(tempPasswordModal.tempPass)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  {copiedPass ? '✓ Đã sao chép' : '📋 Sao chép'}
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Vui lòng gửi mật khẩu này cho học viên hoặc phụ huynh. Học viên sẽ được yêu cầu đổi mật khẩu
              ở lần đăng nhập tiếp theo.
            </p>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setTempPasswordModal({ show: false, studentName: '', studentEmail: '', tempPass: '' })}
                className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Đã hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
