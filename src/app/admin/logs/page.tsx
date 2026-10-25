'use client';

// ==============================================================================
// MathMaster THCS - Trang Nhật Ký Hệ Thống / Kiểm Toán Quản Trị (/admin/logs)
// Tương đương views/admin/logs/index.pug trong Tuyển Dụng IT
// ==============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/MathMasterShell';

interface AuditLogItem {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName?: string;
  meta: Record<string, any>;
  ip: string;
  createdAt: string;
}

export default function AdminLogsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
  });

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        action: actionFilter,
        keyword: keyword.trim(),
      });
      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      if (res.status === 401) {
        router.push('/login?redirect=/admin/logs');
        return;
      }
      if (res.status === 403) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.ok) {
        setLogs(data.logs || []);
        setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, limit: 20 });
      }
    } catch {
      // Bỏ qua lỗi kết nối
    } finally {
      setLoading(false);
    }
  }, [actionFilter, keyword, router]);

  useEffect(() => {
    fetch('/api/state?scope=shell')
      .then((res) => res.json())
      .then((d) => {
        const u = d?.state?.user;
        setUser(u);
        if (u?.role === 'ADMIN') {
          fetchLogs(1);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [fetchLogs]);

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchLogs(1);
  }

  function handleReset() {
    setKeyword('');
    setActionFilter('ALL');
    setTimeout(() => fetchLogs(1), 0);
  }

  const isAuthorized = user?.role === 'ADMIN';

  if (!loading && !isAuthorized) {
    return (
      <AppShell user={user} title="Nhật ký hệ thống">
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-900">
          Chỉ có Quản trị viên (ADMIN) mới có quyền truy cập nhật ký kiểm toán hệ thống.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      user={user}
      title="Nhật Ký Kiểm Toán Hệ Thống (Audit Logs)"
      subtitle="Theo dõi toàn bộ lịch sử thao tác của Ban Quản trị trên học viên và hệ thống MathMaster"
    >
      <div className="space-y-6">
        {/* Bộ lọc */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="log-keyword" className="block text-xs font-semibold text-slate-700 mb-1">
                Tìm kiếm từ khóa
              </label>
              <input
                id="log-keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tên admin, email, tên học viên, IP..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="log-action" className="block text-xs font-semibold text-slate-700 mb-1">
                Loại hành động
              </label>
              <select
                id="log-action"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white cursor-pointer"
              >
                <option value="ALL">-- Tất cả hành động --</option>
                <option value="student.create">Tạo mới học viên (student.create)</option>
                <option value="student.update">Cập nhật học viên (student.update)</option>
                <option value="student.ban">Khóa tài khoản (student.ban)</option>
                <option value="student.unban">Mở khóa tài khoản (student.unban)</option>
                <option value="student.resetPassword">Đặt lại mật khẩu (student.resetPassword)</option>
                <option value="student.softDelete">Xóa mềm (student.softDelete)</option>
                <option value="student.restore">Khôi phục (student.restore)</option>
                <option value="student.hardDelete">Xóa vĩnh viễn (student.hardDelete)</option>
                <option value="student.bulk.ban">Khóa hàng loạt (student.bulk.ban)</option>
                <option value="student.bulk.unban">Mở khóa hàng loạt (student.bulk.unban)</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-slate-900 py-2 px-4 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                🔍 Lọc nhật ký
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Đặt lại
              </button>
            </div>
          </form>
        </div>

        {/* Bảng Audit Logs */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Quản trị viên</th>
                  <th className="py-3 px-4">Hành động</th>
                  <th className="py-3 px-4">Đối tượng tác động</th>
                  <th className="py-3 px-4">Chi tiết / Lý do</th>
                  <th className="py-3 px-4 text-right">Địa chỉ IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-2"></div>
                      <p>Đang tải nhật ký kiểm toán...</p>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      Không tìm thấy bản ghi nhật ký kiểm toán nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const isBan = log.action.includes('ban');
                    const isDelete = log.action.includes('Delete');
                    const isReset = log.action.includes('reset');
                    const isCreate = log.action.includes('create');

                    return (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-slate-900">
                          {log.adminName}
                          <span className="block font-normal text-slate-400">{log.adminEmail}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono font-bold ${
                              isBan
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isDelete
                                ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                : isReset
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : isCreate
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {log.targetName ? (
                            <Link
                              href={`/admin/students/${log.targetId}`}
                              className="font-semibold text-slate-900 hover:text-indigo-600 hover:underline"
                            >
                              {log.targetName}
                            </Link>
                          ) : (
                            <span className="font-mono text-slate-500">{log.targetId}</span>
                          )}
                          <span className="block text-[11px] text-slate-400">{log.targetType}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                          {log.meta?.reason ? (
                            <span className="text-rose-600 font-medium">Lý do: {log.meta.reason}</span>
                          ) : log.meta && Object.keys(log.meta).length > 0 ? (
                            <span className="font-mono text-[11px] text-slate-500">
                              {JSON.stringify(log.meta)}
                            </span>
                          ) : (
                            '---'
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs text-slate-400 whitespace-nowrap">
                          {log.ip || '127.0.0.1'}
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
                Trang {pagination.currentPage} / {pagination.totalPages} (Tổng cộng {pagination.totalItems} bản ghi)
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={pagination.currentPage <= 1}
                  onClick={() => fetchLogs(pagination.currentPage - 1)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => fetchLogs(pagination.currentPage + 1)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
