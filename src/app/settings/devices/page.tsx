'use client';

// ==============================================================================
// MathMaster THCS - Trang Quản Lý Phiên Thiết Bị & Bảo Mật Tài Khoản (/settings/devices)
// Xem danh sách thiết bị đang đăng nhập, thu hồi từ xa từng thiết bị hoặc tất cả thiết bị khác,
// và đổi mật khẩu (tự động thu hồi các phiên thiết bị khác).
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/MathMasterShell';

export default function DevicesAndSecurityPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [maxSessions, setMaxSessions] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(true);

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  async function loadSessions() {
    setLoading(true);
    try {
      const [stateRes, sesRes] = await Promise.all([
        fetch('/api/state?scope=shell'),
        fetch('/api/sessions'),
      ]);
      if (stateRes.status === 401) {
        router.push('/login');
        return;
      }
      const stateData = await stateRes.json();
      const sesData = await sesRes.json();
      setUser(stateData?.state?.user || null);
      if (sesData.ok) {
        setSessions(sesData.sessions || []);
        setMaxSessions(sesData.maxSessionsPerUser || 5);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function handleRevokeSession(sessionId: string) {
    setErrorMsg('');
    setStatusMsg('');
    const res = await fetch('/api/sessions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setStatusMsg('Đã thu hồi phiên đăng nhập trên thiết bị được chọn.');
      loadSessions();
    } else {
      setErrorMsg(data.error || 'Không thể thu hồi phiên đăng nhập.');
    }
  }

  async function handleRevokeAllOthers() {
    setErrorMsg('');
    setStatusMsg('');
    const res = await fetch('/api/sessions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revokeAllOthers: true }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setStatusMsg(data.message || 'Đã đăng xuất toàn bộ các thiết bị khác.');
      loadSessions();
    } else {
      setErrorMsg(data.error || 'Không thể thu hồi các phiên khác.');
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Mật khẩu mới xác nhận không khớp.');
      return;
    }

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'change_password',
        currentPassword,
        newPassword,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setErrorMsg(data.error || 'Đổi mật khẩu không thành công.');
      return;
    }
    setStatusMsg(data.message || 'Đổi mật khẩu thành công! Đã thu hồi các phiên trên thiết bị khác.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    loadSessions();
  }

  const activeSessions = sessions.filter((s) => s.isActive);

  return (
    <AppShell
      user={user}
      title="Quản Lý Thiết Bị Đăng Nhập & Bảo Mật"
      subtitle={`Tài khoản hỗ trợ đăng nhập đồng thời tối đa ${maxSessions} thiết bị độc lập`}
      rightActions={
        activeSessions.length > 1 && (
          <button
            type="button"
            onClick={handleRevokeAllOthers}
            className="rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
          >
            🚪 Đăng xuất tất cả thiết bị khác ({activeSessions.length - 1})
          </button>
        )
      }
    >
      {errorMsg && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700"
        >
          ⚠️ {errorMsg}
        </div>
      )}
      {statusMsg && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800">
          ✓ {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách các phiên thiết bị (2/3) */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              💻 Danh Sách Các Thiết Bị Đã Đăng Nhập ({activeSessions.length}/{maxSessions} đang hoạt động)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mỗi thiết bị có một mã phiên (Session ID) riêng biệt. Thu hồi thiết bị này sẽ không làm văng các thiết bị còn lại.
            </p>
          </div>

          {loading ? (
            <div className="py-6 text-center text-xs text-slate-500">
              Đang tải danh sách phiên thiết bị...
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((ses) => (
                <div
                  key={ses.id}
                  className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3 ${
                    ses.isCurrent
                      ? 'border-indigo-500 bg-indigo-50/50'
                      : ses.isActive
                      ? 'border-slate-200 bg-white'
                      : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {ses.deviceName || 'Thiết bị trình duyệt'}
                      </span>
                      {ses.isCurrent && (
                        <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                          Thiết bị này
                        </span>
                      )}
                      {!ses.isCurrent && ses.isActive && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          Đang hoạt động
                        </span>
                      )}
                      {!ses.isActive && (
                        <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                          Đã thu hồi
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      IP: {ses.ipAddress} • Hoạt động cuối:{' '}
                      {String(ses.lastActiveAt || '').slice(0, 19).replace('T', ' ')}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-md">
                      {ses.userAgent}
                    </div>
                  </div>

                  {ses.isActive && !ses.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(ses.id)}
                      className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                    >
                      Thu hồi phiên này
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Đổi mật khẩu (1/3) */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm h-fit space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">🔐 Đổi Mật Khẩu Bảo Mật</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Khi đổi mật khẩu, toàn bộ các thiết bị khác sẽ tự động bị đăng xuất để đảm bảo an toàn.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu hiện tại *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu mới (≥ 8 ký tự, gồm chữ và số) *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Xác nhận mật khẩu mới *
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700"
            >
              Cập nhật mật khẩu mới
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
