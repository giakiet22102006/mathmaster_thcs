'use client';

// ==============================================================================
// MathMaster THCS - Trang Chi Tiết Hồ Sơ & Kết Quả Học Viên (/admin/students/[id])
// Tương đương candidates/detail.pug trong Tuyển Dụng IT
// ==============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/MathMasterShell';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Modal Mật khẩu tạm thời
  const [tempPasswordModal, setTempPasswordModal] = useState<string | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  const fetchStudentDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/students/${studentId}`);
      if (res.status === 401) {
        router.push(`/login?redirect=/admin/students/${studentId}`);
        return;
      }
      if (res.status === 404) {
        setErrorMsg('Không tìm thấy học viên.');
        setLoading(false);
        return;
      }
      const json = await res.json();
      if (json.ok) {
        setData(json);
      } else {
        setErrorMsg(json.error || 'Lỗi khi tải thông tin học viên.');
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
          fetchStudentDetail();
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [fetchStudentDetail]);

  // Hành động Đặt lại mật khẩu
  async function handleResetPassword() {
    if (!window.confirm(`Bạn có chắc chắn muốn đặt lại mật khẩu ngẫu nhiên cho học viên "${data?.student?.fullName}"?`)) {
      return;
    }
    try {
      setSubmittingAction(true);
      const res = await fetch(`/api/admin/students/${studentId}/reset-password`, {
        method: 'POST',
      });
      const resData = await res.json();
      if (resData.ok) {
        setTempPasswordModal(resData.tempPassword);
        setCopiedPass(false);
        setSuccessMsg(`Đã tạo mật khẩu tạm thời mới thành công.`);
        fetchStudentDetail();
      } else {
        alert(resData.error || 'Đặt lại mật khẩu thất bại.');
      }
    } catch {
      alert('Lỗi kết nối khi đặt lại mật khẩu.');
    } finally {
      setSubmittingAction(false);
    }
  }

  // Khóa tài khoản
  async function handleConfirmBan() {
    if (!banReason.trim()) {
      alert('Vui lòng nhập lý do khóa tài khoản bắt buộc.');
      return;
    }
    try {
      setSubmittingAction(true);
      const res = await fetch(`/api/admin/students/${studentId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: banReason.trim() }),
      });
      const resData = await res.json();
      if (resData.ok) {
        setSuccessMsg(resData.message);
        setShowBanModal(false);
        setBanReason('');
        fetchStudentDetail();
      } else {
        alert(resData.error || 'Khóa tài khoản thất bại.');
      }
    } catch {
      alert('Lỗi kết nối máy chủ.');
    } finally {
      setSubmittingAction(false);
    }
  }

  // Mở khóa
  async function handleUnban() {
    if (!window.confirm('Mở khóa tài khoản học viên này?')) return;
    try {
      const res = await fetch(`/api/admin/students/${studentId}/unban`, { method: 'POST' });
      const resData = await res.json();
      if (resData.ok) {
        setSuccessMsg(resData.message);
        fetchStudentDetail();
      } else {
        alert(resData.error || 'Mở khóa thất bại.');
      }
    } catch {
      alert('Lỗi kết nối máy chủ.');
    }
  }

  // Xóa mềm / Khôi phục
  async function handleSoftDelete() {
    if (!window.confirm('Chuyển tài khoản học viên này vào danh sách xóa mềm?')) return;
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, { method: 'DELETE' });
      const resData = await res.json();
      if (resData.ok) {
        setSuccessMsg(resData.message);
        fetchStudentDetail();
      } else {
        alert(resData.error || 'Xóa mềm thất bại.');
      }
    } catch {
      alert('Lỗi kết nối máy chủ.');
    }
  }

  async function handleRestore() {
    if (!window.confirm('Khôi phục tài khoản học viên này?')) return;
    try {
      const res = await fetch(`/api/admin/students/${studentId}/restore`, { method: 'POST' });
      const resData = await res.json();
      if (resData.ok) {
        setSuccessMsg(resData.message);
        fetchStudentDetail();
      } else {
        alert(resData.error || 'Khôi phục thất bại.');
      }
    } catch {
      alert('Lỗi kết nối máy chủ.');
    }
  }

  // Xóa vĩnh viễn (Hard delete)
  async function handleHardDelete() {
    if (!window.confirm('CẢNH BÁO: Hành động này sẽ XÓA VĨNH VIỄN tài khoản học viên và toàn bộ dữ liệu phiên làm việc liên quan. Không thể khôi phục! Bạn có chắc chắn muốn xóa?')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/students/${studentId}?permanent=true`, { method: 'DELETE' });
      const resData = await res.json();
      if (resData.ok) {
        alert(resData.message);
        router.push('/admin/students');
      } else {
        alert(resData.error || 'Xóa vĩnh viễn thất bại.');
      }
    } catch {
      alert('Lỗi kết nối khi xóa vĩnh viễn.');
    }
  }

  function copyPassword(pass: string) {
    navigator.clipboard.writeText(pass);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  }

  const isAuthorized = currentUser?.role === 'ADMIN';

  if (!loading && !isAuthorized) {
    return (
      <AppShell user={currentUser} title="Chi tiết Học viên">
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-900">
          Chỉ có Quản trị viên (ADMIN) mới có quyền truy cập hồ sơ học viên.
        </div>
      </AppShell>
    );
  }

  const student = data?.student;
  const stats = data?.stats;
  const recentAttempts = data?.recentAttempts || [];
  const auditLogs = data?.auditLogs || [];

  return (
    <AppShell
      user={currentUser}
      title={student ? `Hồ Sơ Học Viên: ${student.fullName}` : 'Hồ Sơ Học Viên THCS'}
      subtitle="Xem thông tin chi tiết, lịch sử làm bài thi và nhật ký kiểm toán quản trị"
    >
      <div className="space-y-6">
        {/* Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/admin/students" className="text-indigo-600 font-medium hover:underline">
              ← Danh sách học viên
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900">{student?.fullName || 'Chi tiết'}</span>
          </div>

          {student && (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/students/${studentId}/edit`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition"
              >
                ✏️ Chỉnh sửa
              </Link>
              <button
                onClick={handleResetPassword}
                disabled={submittingAction}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
              >
                🔑 Đặt lại MK
              </button>
              {student.status === 'banned' ? (
                <button
                  onClick={handleUnban}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  🔓 Mở khóa
                </button>
              ) : (
                <button
                  onClick={() => setShowBanModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 transition"
                >
                  🚫 Khóa tài khoản
                </button>
              )}
              {student.status === 'deleted' ? (
                <button
                  onClick={handleRestore}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  🔄 Khôi phục
                </button>
              ) : (
                <button
                  onClick={handleSoftDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  🗑️ Xóa mềm
                </button>
              )}
              <button
                onClick={handleHardDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-rose-300 hover:bg-slate-800 transition"
              >
                ⚠️ Xóa vĩnh viễn
              </button>
            </div>
          )}
        </div>

        {/* Thông báo */}
        {successMsg && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 font-medium">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="text-xs font-bold hover:underline">
              Đóng
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-xs">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent mb-2"></div>
            <p>Đang tải chi tiết hồ sơ học viên...</p>
          </div>
        ) : !student ? null : (
          <div className="space-y-6">
            {/* Thẻ Thông tin cá nhân */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-sm">
                    {student.fullName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{student.fullName}</h2>
                      {student.status === 'deleted' ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-300">
                          Đã xóa mềm
                        </span>
                      ) : student.status === 'banned' ? (
                        <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-300">
                          Đã bị khóa
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-300">
                          Đang hoạt động
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      Username: @{student.username} • ID: {student.id}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 md:text-right">
                  <p>Tham gia: {new Date(student.createdAt).toLocaleDateString('vi-VN')}</p>
                  <p className="mt-0.5">
                    Thiết bị hoạt động: <span className="font-bold text-indigo-600">{stats?.activeSessionsCount || 0}</span>
                  </p>
                </div>
              </div>

              {/* Chi tiết lý do khóa nếu có */}
              {student.status === 'banned' && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900">
                  <span className="font-bold">Lý do khóa tài khoản:</span> {student.banReason || 'Không có lý do cụ thể'}
                  {student.bannedAt && (
                    <span className="text-rose-600 ml-2">
                      (vào lúc {new Date(student.bannedAt).toLocaleString('vi-VN')})
                    </span>
                  )}
                </div>
              )}

              {/* Lưới thông tin chi tiết */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                <div>
                  <p className="text-xs font-medium text-slate-500">Email đăng nhập</p>
                  <p className="mt-1 font-semibold text-slate-900 text-sm font-mono">{student.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Khối lớp THCS</p>
                  <p className="mt-1 font-bold text-indigo-700 text-sm">Lớp {student.currentGrade}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Bộ sách trọng tâm</p>
                  <p className="mt-1 font-semibold text-slate-900 text-sm">
                    {student.preferredBook === 'KNTT'
                      ? 'Kết nối tri thức'
                      : student.preferredBook === 'CD'
                      ? 'Cánh Diều'
                      : 'Chân trời sáng tạo'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Trường THCS</p>
                  <p className="mt-1 font-semibold text-slate-900 text-sm">{student.schoolName || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>

            {/* Thẻ Thống kê thành tích học tập */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-xs font-medium text-slate-500">Điểm kinh nghiệm (XP)</p>
                <p className="mt-1 text-2xl font-bold text-indigo-600">{student.xp || 0} XP</p>
                <p className="text-xs text-slate-400 mt-0.5">Cấp độ {student.level || 1}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-xs font-medium text-slate-500">Số đề thi đã làm</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{stats?.totalAttempts || 0}</p>
                <p className="text-xs text-slate-400 mt-0.5">Đạt điểm &gt;= 5.0: {stats?.passedCount || 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-xs font-medium text-slate-500">Điểm trung bình</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">{stats?.avgScore || 0} / 10</p>
                <p className="text-xs text-slate-400 mt-0.5">Cao nhất: {stats?.maxScore || 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-xs font-medium text-slate-500">Chuỗi ngày học liên tục</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">{student.streakDays || 0} ngày 🔥</p>
                <p className="text-xs text-slate-400 mt-0.5">Tỷ lệ qua: {stats?.passRate || 0}%</p>
              </div>
            </div>

            {/* Bảng Lịch sử làm bài thi gần đây */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Lịch sử làm bài thi gần đây</h3>
                  <p className="text-xs text-slate-500">
                    Danh sách các đề thi trắc nghiệm và tự luận học viên đã nộp bài
                  </p>
                </div>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                  {recentAttempts.length} lượt thi
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Tên đề thi</th>
                      <th className="py-2.5 px-3">Khối</th>
                      <th className="py-2.5 px-3 text-center">Điểm số</th>
                      <th className="py-2.5 px-3 text-center">Số câu đúng</th>
                      <th className="py-2.5 px-3">Thời gian</th>
                      <th className="py-2.5 px-3 text-right">Ngày nộp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentAttempts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Học viên chưa làm đề thi nào trên hệ thống.
                        </td>
                      </tr>
                    ) : (
                      recentAttempts.map((att: any) => (
                        <tr key={att.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 font-semibold text-slate-800">{att.examTitle}</td>
                          <td className="py-3 px-3">
                            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                              Lớp {att.grade}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`font-bold ${
                                att.score >= 8
                                  ? 'text-emerald-600'
                                  : att.score >= 5
                                  ? 'text-indigo-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {att.score} / 10
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center text-xs text-slate-600">
                            {att.correctCount} / {att.totalQuestions}
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-500">
                            {att.durationSeconds ? `${Math.round(att.durationSeconds / 60)} phút` : '---'}
                          </td>
                          <td className="py-3 px-3 text-right text-xs text-slate-500">
                            {new Date(att.submittedAt).toLocaleString('vi-VN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bảng Nhật ký kiểm toán thao tác quản trị (Audit Logs) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Nhật ký thao tác quản trị trên học viên này (Audit Logs)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ghi lại mọi tác động của Admin (Tạo, Sửa, Khóa, Mở khóa, Đặt lại mật khẩu, Xóa)
                  </p>
                </div>
                <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                  {auditLogs.length} bản ghi
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Thời gian</th>
                      <th className="py-2.5 px-3">Quản trị viên</th>
                      <th className="py-2.5 px-3">Hành động</th>
                      <th className="py-2.5 px-3">Chi tiết / Lý do</th>
                      <th className="py-2.5 px-3 text-right">Địa chỉ IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Chưa có nhật ký thao tác nào được ghi nhận cho học viên này.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 text-xs text-slate-500 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900 text-xs">
                            {log.adminName}
                            <span className="block font-normal text-slate-400">{log.adminEmail}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-bold text-slate-800">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-600">
                            {log.meta?.reason ? (
                              <span className="text-rose-600 font-medium">Lý do: {log.meta.reason}</span>
                            ) : log.meta ? (
                              <span className="font-mono text-[11px] text-slate-500">
                                {JSON.stringify(log.meta)}
                              </span>
                            ) : (
                              '---'
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-xs text-slate-400">
                            {log.ip || '127.0.0.1'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Khóa tài khoản */}
      {showBanModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-lg text-slate-900">Khóa tài khoản học viên</h3>
            <p className="text-sm text-slate-600 mt-1">
              Học viên: <span className="font-semibold text-slate-900">{student?.fullName}</span>
            </p>
            <p className="text-xs text-rose-600 mt-2 font-medium">
              * Hành động này sẽ thu hồi ngay lập tức tất cả các phiên đăng nhập trên mọi thiết bị.
            </p>

            <div className="mt-4">
              <label htmlFor="reason-textarea" className="block text-xs font-semibold text-slate-700 mb-1">
                Lý do khóa tài khoản (Bắt buộc)
              </label>
              <textarea
                id="reason-textarea"
                rows={3}
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Nhập lý do khóa..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowBanModal(false);
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

      {/* Modal Mật khẩu tạm mới sau khi Đặt lại mật khẩu */}
      {tempPasswordModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-xl mb-3">
              ✓
            </div>
            <h3 className="font-bold text-lg text-slate-900">Mật khẩu tạm mới</h3>
            <p className="text-sm text-slate-600 mt-1">
              Đã đặt lại mật khẩu cho <span className="font-semibold">{student?.fullName}</span>
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium">Mật khẩu tạm (chỉ hiển thị một lần):</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-mono text-lg font-bold text-indigo-700 tracking-wider">
                  {tempPasswordModal}
                </span>
                <button
                  onClick={() => copyPassword(tempPasswordModal)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  {copiedPass ? '✓ Đã sao chép' : '📋 Sao chép'}
                </button>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setTempPasswordModal(null)}
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
