'use client';

// ==============================================================================
// MathMaster THCS - Bộ Component Dùng Chung (AppShell, MathText KaTeX, CognitiveBadge, MathKeyboard)
// Thiết kế Mobile-first (< 768px có Bottom Nav, >= 768px có Sidebar chuẩn giáo dục)
// ==============================================================================

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import katex from 'katex';

export type CognitiveLevelKey = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

export const COGNITIVE_META: Record<
  CognitiveLevelKey,
  { label: string; short: string; badgeClass: string; barColor: string }
> = {
  nhan_biet: {
    label: 'Nhận biết',
    short: 'NB',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    barColor: '#10b981',
  },
  thong_hieu: {
    label: 'Thông hiểu',
    short: 'TH',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    barColor: '#0284c7',
  },
  van_dung: {
    label: 'Vận dụng',
    short: 'VD',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    barColor: '#f59e0b',
  },
  van_dung_cao: {
    label: 'Vận dụng cao',
    short: 'VDC',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    barColor: '#e11d48',
  },
};

export function resolveCognitiveKey(raw?: string): CognitiveLevelKey {
  const s = String(raw || '').trim().toLowerCase();
  if (s === 'nhan_biet' || s === 'easy') return 'nhan_biet';
  if (s === 'thong_hieu' || s === 'medium') return 'thong_hieu';
  if (s === 'van_dung_cao' || s === 'very_hard') return 'van_dung_cao';
  if (s === 'van_dung' || s === 'hard') return 'van_dung';
  return 'thong_hieu';
}

/**
 * Nhãn độ khó có cả màu sắc lẫn chữ rõ ràng (Đảm bảo Accessibility theo Mục 5.4)
 */
export function CognitiveBadge({ level, size = 'sm' }: { level?: string; size?: 'xs' | 'sm' }) {
  const key = resolveCognitiveKey(level);
  const meta = COGNITIVE_META[key];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${
        size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs'
      } ${meta.badgeClass}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>
        {meta.label} ({meta.short})
      </span>
    </span>
  );
}

/**
 * Hiển thị văn bản Toán học kết hợp công thức LaTeX ($...$ hoặc $$...$$) bằng gói npm katex cục bộ
 */
export function MathText({
  text,
  className = '',
  block = false,
}: {
  text?: string | null;
  className?: string;
  block?: boolean;
}) {
  const html = useMemo(() => {
    if (!text) return '';
    const raw = String(text);

    // Tách theo $$...$$ hoặc $...$
    const parts = raw.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);
    return parts
      .map((part) => {
        if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
          const tex = part.slice(2, -2);
          try {
            return katex.renderToString(tex, {
              displayMode: true,
              throwOnError: false,
              strict: false,
            });
          } catch {
            return `<code>${tex}</code>`;
          }
        }
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const tex = part.slice(1, -1);
          try {
            return katex.renderToString(tex, {
              displayMode: false,
              throwOnError: false,
              strict: false,
            });
          } catch {
            return `<code>${tex}</code>`;
          }
        }
        // Escape HTML cho phần văn bản thường
        return part
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br/>');
      })
      .join('');
  }, [text]);

  if (block) {
    return (
      <div
        className={`leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <span
      className={`leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Thanh công cụ gõ nhanh ký hiệu Toán học THCS cho câu Tự luận (Mục 5.3)
 */
export function MathSymbolKeyboard({
  onInsert,
}: {
  onInsert: (snippet: string) => void;
}) {
  const buttons = [
    { label: '√x', insert: 'sqrt()' },
    { label: 'a/b', insert: '/' },
    { label: 'x²', insert: '^2' },
    { label: '≤', insert: ' <= ' },
    { label: '≥', insert: ' >= ' },
    { label: '≠', insert: ' != ' },
    { label: 'π', insert: 'pi' },
    { label: 'Δ', insert: 'Delta = ' },
    { label: '∥', insert: ' // ' },
    { label: '⊥', insert: ' _|_ ' },
    { label: 'x = ; y =', insert: 'x = ; y = ' },
    { label: '⇔', insert: ' <=> ' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100/80 p-1.5 no-print">
      <span className="px-1.5 text-xs font-medium text-slate-500">Ký hiệu Toán:</span>
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={() => onInsert(btn.insert)}
          className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95"
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Khung giao diện điều hướng chung cho toàn bộ các trang Next.js App Router
 */
export function AppShell({
  user,
  title,
  subtitle,
  rightActions,
  children,
}: {
  user: any;
  title: string;
  subtitle?: string;
  rightActions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const navItems = [
    { href: '/dashboard', label: 'Tổng quan', icon: '📊' },
    { href: '/exams/new', label: 'Tạo đề Ma trận', icon: '📝' },
    { href: '/practice', label: 'Luyện chủ đề', icon: '🎯' },
    { href: '/review', label: 'Sổ tay SM-2', icon: '🧠' },
    { href: '/history', label: 'Lịch sử làm bài', icon: '📚' },
    { href: '/formulas', label: 'Công thức & Lưu', icon: '📐' },
    {
      href: '/teacher',
      label: isTeacherOrAdmin ? 'Quản lý Lớp học' : 'Lớp học của tôi',
      icon: '🏫',
    },
    ...(isTeacherOrAdmin
      ? [{ href: '/admin/questions', label: 'Duyệt Ngân hàng', icon: '🛡️' }]
      : []),
    { href: '/settings/devices', label: 'Thiết bị & Bảo mật', icon: '🔐' },
  ];

  async function handleLogout() {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } finally {
      router.push('/login');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      {/* Sidebar cho màn hình Desktop */}
      <aside className="no-print hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 bg-white z-20">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-sm">
              ∑
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight">MathMaster</div>
              <div className="text-[11px] font-medium text-indigo-600">Toán THCS GDPT 2018</div>
            </div>
          </Link>
        </div>

        {/* Thông tin người dùng hiện tại */}
        {user && (
          <div className="mx-3 my-3 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-slate-800 truncate">
                {user.fullName}
              </span>
              <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                {user.role === 'ADMIN'
                  ? 'ADMIN'
                  : user.role === 'TEACHER'
                  ? 'GIÁO VIÊN'
                  : `LỚP ${user.currentGrade || 8}`}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500 truncate">{user.email}</div>
            <div className="mt-2 flex items-center gap-3 text-xs font-medium text-slate-700">
              <span>⚡ {user.xp || 0} XP</span>
              <span>🏆 Cấp {user.level || 1}</span>
              <span>🔥 {user.streakDays || 1} ngày</span>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 space-y-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
          >
            <span>🚪 Đăng xuất an toàn</span>
          </button>
        </div>
      </aside>

      {/* Nội dung chính */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen pb-20 md:pb-8">
        {/* Cảnh báo nếu tài khoản đang dùng mật khẩu mặc định của seed */}
        {user?.mustChangePassword && (
          <div className="no-print bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
            <span>
              ⚠️ <strong>Cảnh báo bảo mật:</strong> Tài khoản của bạn đang dùng mật khẩu khởi tạo mặc định. Hãy đổi mật khẩu mới để bảo vệ dữ liệu học tập.
            </span>
            <Link
              href="/settings/devices"
              className="rounded-lg bg-amber-600 px-3 py-1 text-white font-semibold hover:bg-amber-700"
            >
              Đổi mật khẩu ngay →
            </Link>
          </div>
        )}

        {/* Header trang */}
        <header className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur px-4 py-3.5 md:px-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-xs md:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {rightActions}
            <button
              type="button"
              onClick={handleLogout}
              className="md:hidden rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 md:px-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>

      {/* Thanh điều hướng dưới cùng (Bottom Nav) trên điện thoại < 768px */}
      <nav className="no-print md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white flex items-center justify-around py-1.5 px-1 shadow-lg">
        {navItems.slice(0, 6).map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg text-[11px] font-medium ${
                active ? 'text-indigo-600 font-bold' : 'text-slate-600'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="mt-1 truncate max-w-[64px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
