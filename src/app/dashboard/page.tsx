'use client';

// ==============================================================================
// MathMaster THCS - Trang Dashboard Cá Nhân & Phân Tích Năng Lực (/dashboard)
// - Hiển thị ngay AppShell + Skeleton ở mili-giây đầu tiên (không màn hình chờ trắng).
// - Dùng API hợp nhất GET /api/dashboard kèm Stale-While-Revalidate (SWR) theo userId.
// - Biểu đồ Chart.js chỉ bắt đầu nạp sau khi các thẻ chỉ số chính đã hiển thị.
// - Có timeout hợp lý và nút "Thử lại" khi gặp lỗi mạng.
// ==============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AppShell, CognitiveBadge } from '@/components/MathMasterShell';
import {
  fetchDashboardUnifiedApi,
  getDashboardClientCache,
  setDashboardClientCache,
} from '@/lib/dashboard-swr';

const DashboardCharts = dynamic(() => import('@/components/DashboardCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
      <div className="h-72 rounded-2xl bg-white border border-slate-200 p-5 animate-pulse" />
      <div className="h-72 rounded-2xl bg-white border border-slate-200 p-5 animate-pulse" />
    </div>
  ),
});

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revalidating, setRevalidating] = useState(false);
  const [loadError, setLoadError] = useState<string>('');
  const [chartsReady, setChartsReady] = useState(false);
  const [creatingAdaptive, setCreatingAdaptive] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoadError('');
    const cached = getDashboardClientCache();
    if (cached?.user?.role === 'ADMIN') {
      router.replace('/admin/students');
      return;
    }
    if (cached?.user) {
      setUser(cached.user);
      if (cached.analytics) {
        setAnalytics(cached.analytics);
        setRecentExams(cached.recentExams || []);
        setLoading(false);
        setRevalidating(true);
      }
    } else {
      setLoading(true);
    }

    try {
      const { status, data } = await fetchDashboardUnifiedApi(8000);
      if (status === 401) {
        router.push('/login');
        return;
      }
      if (data?.user?.role === 'ADMIN') {
        router.replace('/admin/students');
        return;
      }

      if (!data?.ok) {
        setLoadError(
          data?.error || 'Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại.'
        );
        return;
      }

      if (data.user) {
        setUser(data.user);
      }
      setAnalytics({
        ok: true,
        overview: data.overview,
        scoreTrend: data.scoreTrend,
        chapterMastery: data.chapterMastery,
        cognitiveMastery: data.cognitiveMastery,
        weakestChapters: data.weakestChapters,
        leaderboard: data.leaderboard,
      });
      if (Array.isArray(data.recentExams)) {
        setRecentExams(data.recentExams.slice(0, 6));
      }
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError';
      setLoadError(
        isAbort
          ? 'Kết nối tới máy chủ mất quá nhiều thời gian (quá 8 giây). Bạn hãy bấm "Thử lại".'
          : 'Không thể kết nối tới máy chủ để tải dữ liệu Tổng quan.'
      );
    } finally {
      setLoading(false);
      setRevalidating(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Chỉ bắt đầu nạp biểu đồ Chart.js sau khi các thẻ chỉ số chính đã sẵn sàng hiển thị
  useEffect(() => {
    if (!analytics) return;
    const timer = setTimeout(() => {
      setChartsReady(true);
    }, 16);
    return () => clearTimeout(timer);
  }, [analytics]);

  async function handleCreateAdaptiveExam() {
    setCreatingAdaptive(true);
    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_adaptive_exam',
          grade: user?.currentGrade || 8,
          questionCount: 5,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok && data.exam?.id) {
        router.push(`/exams/${data.exam.id}`);
      }
    } finally {
      setCreatingAdaptive(false);
    }
  }

  async function handleToggleAnonymous() {
    const res = await fetch('/api/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_anonymous_leaderboard' }),
    });
    if (res.ok) {
      const resData = await res.json().catch(() => null);
      if (resData?.ok && user) {
        const updatedUser = {
          ...user,
          anonymousLeaderboard: Boolean(resData.anonymousLeaderboard),
        };
        setUser(updatedUser);
        setDashboardClientCache({ user: updatedUser });
      }
      loadDashboardData();
    }
  }

  const showSkeletonCards = loading && !analytics;
  const ov = analytics?.overview || {
    completedExams: 0,
    averageScore: 0,
    streakDays: user?.streakDays || 1,
    xp: user?.xp || 0,
    level: user?.level || 1,
    dueReviewsCount: 0,
    anonymousLeaderboard: Boolean(user?.anonymousLeaderboard),
  };

  return (
    <AppShell
      user={user}
      title={
        user?.fullName
          ? `Xin chào, ${user.fullName} 👋`
          : 'Bảng Điều Khiển Năng Lực Toán THCS'
      }
      subtitle={`Bảng điều khiển năng lực Toán Lớp ${user?.currentGrade || 8} • Bộ sách ${
        user?.preferredBook || 'KNTT'
      }${revalidating ? ' • Đang đồng bộ mới nhất...' : ''}`}
      rightActions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCreateAdaptiveExam}
            disabled={creatingAdaptive}
            className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
          >
            {creatingAdaptive ? 'Đang sinh đề...' : '⚡ Tạo Đề Luyện Điểm Yếu'}
          </button>
          <Link
            href="/exams/new"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700 transition"
          >
            + Tạo đề theo Ma trận
          </Link>
        </div>
      }
    >
      {/* Khung thông báo lỗi mạng / lỗi API kèm nút Thử lại */}
      {loadError && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="text-xs font-semibold text-rose-800">⚠️ {loadError}</div>
          <button
            type="button"
            onClick={loadDashboardData}
            className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
          >
            🔄 Thử lại ngay
          </button>
        </div>
      )}

      {/* 4 Thẻ chỉ số tổng quan (Hiện ngay Skeleton khi chưa có dữ liệu, không chặn màn hình) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Điểm trung bình</div>
          {showSkeletonCards ? (
            <div className="mt-2 space-y-2">
              <div className="h-7 w-20 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="mt-1.5 text-2xl font-extrabold text-indigo-600">
                {Number(ov.averageScore || 0).toFixed(1)}{' '}
                <span className="text-xs font-normal text-slate-400">/ 10.0</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Qua {ov.completedExams} đề đã hoàn thành
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Chuỗi ngày học (Streak)</div>
          {showSkeletonCards && !user ? (
            <div className="mt-2 space-y-2">
              <div className="h-7 w-24 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="mt-1.5 text-2xl font-extrabold text-amber-600">
                🔥 {ov.streakDays} ngày
              </div>
              <div className="mt-1 text-[11px] text-slate-500">Duy trì học tập mỗi ngày</div>
            </>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Điểm kinh nghiệm & Cấp độ</div>
          {showSkeletonCards && !user ? (
            <div className="mt-2 space-y-2">
              <div className="h-7 w-24 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="mt-1.5 text-2xl font-extrabold text-emerald-600">
                ⚡ {ov.xp} XP
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Cấp độ hiện tại: Cấp {ov.level}
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Cần ôn tập hôm nay (SM-2)</div>
          {showSkeletonCards ? (
            <div className="mt-2 space-y-2">
              <div className="h-7 w-20 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="mt-1.5 text-2xl font-extrabold text-rose-600">
                🧠 {ov.dueReviewsCount} câu
              </div>
              <div className="mt-1 text-[11px]">
                <Link href="/review" className="font-semibold text-indigo-600 hover:underline">
                  Mở sổ tay lỗi sai →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2 Biểu đồ Chart.js nạp lười chỉ sau khi các thẻ chỉ số đã hiển thị */}
      {chartsReady && analytics ? (
        <DashboardCharts
          scoreTrend={analytics?.scoreTrend}
          chapterMastery={analytics?.chapterMastery}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div className="h-72 rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
            <div className="h-4 w-56 rounded bg-slate-200 animate-pulse" />
            <div className="h-52 w-full rounded-xl bg-slate-100 animate-pulse" />
          </div>
          <div className="h-72 rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
            <div className="h-4 w-56 rounded bg-slate-200 animate-pulse" />
            <div className="h-52 w-full rounded-xl bg-slate-100 animate-pulse" />
          </div>
        </div>
      )}

      {/* Gợi ý 2 chương yếu nhất & Tỷ lệ đúng theo 4 mức độ nhận thức */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">
              💡 Phát hiện lỗ hổng kiến thức & Gợi ý ôn tập ưu tiên
            </h2>
            <Link
              href="/practice"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Luyện theo chủ đề →
            </Link>
          </div>
          {showSkeletonCards ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="h-28 rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-28 rounded-xl bg-slate-100 animate-pulse" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(analytics?.weakestChapters || []).map((ch: any) => (
                <div
                  key={ch.chapterId}
                  className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-amber-200/80 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                        {ch.chapterId} • HK{ch.semester}
                      </span>
                      <span className="text-xs font-bold text-rose-700">
                        Đúng {ch.accuracyPercent}% ({ch.questionsRight}/{ch.questionsDone} câu)
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs font-bold text-slate-800">{ch.title}</div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/practice?chapterId=${ch.chapterId}`}
                      className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                    >
                      Ôn chương này
                    </Link>
                    <button
                      type="button"
                      onClick={handleCreateAdaptiveExam}
                      className="rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                    >
                      Tạo đề bù lỗ hổng
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-3">
            📊 Năng lực theo 4 mức nhận thức
          </h2>
          <div className="space-y-3">
            {(['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'] as const).map((lv) => {
              const st = analytics?.cognitiveMastery?.[lv] || {
                done: 0,
                right: 0,
                accuracyPercent: 0,
              };
              return (
                <div key={lv} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <CognitiveBadge level={lv} size="xs" />
                    <span className="font-semibold text-slate-700">
                      {st.accuracyPercent}% ({st.right}/{st.done})
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${Math.min(100, st.accuracyPercent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Danh sách Đề thi sẵn sàng & Bảng xếp hạng tùy chọn ẩn danh */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">📝 Đề thi & Bài kiểm tra gần đây</h2>
            <Link href="/exams/new" className="text-xs font-bold text-indigo-600 hover:underline">
              + Tạo đề mới
            </Link>
          </div>
          {showSkeletonCards ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentExams.map((ex) => (
                <div
                  key={ex.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                        Lớp {ex.grade} • {ex.textbook || 'KNTT'}
                      </span>
                      <CognitiveBadge level={ex.difficulty} size="xs" />
                      <span className="text-xs text-slate-500">
                        {(ex.questionIds || []).length} câu • {ex.durationMinutes || 45} phút
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900">{ex.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/exams/${ex.id}`}
                      className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
                    >
                      Vào phòng thi →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-900">🏆 Bảng xếp hạng Học tập</h2>
            <button
              type="button"
              onClick={handleToggleAnonymous}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
            >
              {ov.anonymousLeaderboard ? '🙈 Đang ẩn danh' : '👁️ Hiện tên thật'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Bạn có thể bật chế độ Ẩn danh để giấu tên thật với các học sinh khác.
          </p>
          {showSkeletonCards ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-11 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(analytics?.leaderboard || []).map((item: any) => (
                <div
                  key={item.rank}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs ${
                    item.isMe
                      ? 'bg-indigo-50 border border-indigo-200 font-bold'
                      : 'bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 text-center font-extrabold text-indigo-600">
                      #{item.rank}
                    </span>
                    <div className="truncate">
                      <div className="text-slate-800 truncate">
                        {item.displayName} {item.isMe && '(Bạn)'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Lớp {item.grade} • {item.schoolName}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700 whitespace-nowrap">
                    {item.xp} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
