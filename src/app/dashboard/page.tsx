'use client';

// ==============================================================================
// MathMaster THCS - Trang Dashboard Cá Nhân & Phân Tích Năng Lực (/dashboard)
// Tích hợp Chart.js cục bộ (Line Chart 10 đề gần nhất + Bar Chart topic_mastery),
// phát hiện 2 chương yếu nhất, tạo Đề Thích Ứng và Bảng xếp hạng tùy chọn ẩn danh.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AppShell, CognitiveBadge } from '@/components/MathMasterShell';

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
  const [creatingAdaptive, setCreatingAdaptive] = useState(false);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [stateRes, analyticsRes, examsRes] = await Promise.all([
        fetch('/api/state?scope=shell'),
        fetch('/api/analytics'),
        fetch('/api/exams?limit=6'),
      ]);

      if (stateRes.status === 401) {
        router.push('/login');
        return;
      }

      const stateData = await stateRes.json();
      const analyticsData = await analyticsRes.json();
      const examsData = await examsRes.json();

      if (stateData?.state?.user) {
        setUser(stateData.state.user);
      }
      if (analyticsData?.ok) {
        setAnalytics(analyticsData);
      }
      if (examsData?.ok && Array.isArray(examsData.exams)) {
        setRecentExams(examsData.exams.slice(0, 6));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

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
    const res = await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_anonymous_leaderboard' }),
    });
    if (res.ok) {
      loadDashboardData();
    }
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-600">
        Đang tải bảng điều khiển cá nhân...
      </div>
    );
  }

  const ov = analytics?.overview || {
    completedExams: 0,
    averageScore: 0,
    streakDays: user?.streakDays || 1,
    xp: user?.xp || 0,
    level: user?.level || 1,
    dueReviewsCount: 0,
  };

  return (
    <AppShell
      user={user}
      title={`Xin chào, ${user?.fullName || 'Học sinh'} 👋`}
      subtitle={`Bảng điều khiển năng lực Toán Lớp ${user?.currentGrade || 8} • Bộ sách ${
        user?.preferredBook || 'KNTT'
      }`}
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
      {/* 4 Thẻ chỉ số tổng quan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Điểm trung bình</div>
          <div className="mt-1.5 text-2xl font-extrabold text-indigo-600">
            {ov.averageScore.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-400">/ 10.0</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Qua {ov.completedExams} đề đã hoàn thành
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Chuỗi ngày học (Streak)</div>
          <div className="mt-1.5 text-2xl font-extrabold text-amber-600">
            🔥 {ov.streakDays} ngày
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Duy trì học tập mỗi ngày</div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Điểm kinh nghiệm & Cấp độ</div>
          <div className="mt-1.5 text-2xl font-extrabold text-emerald-600">
            ⚡ {ov.xp} XP
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Cấp độ hiện tại: Cấp {ov.level}</div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Cần ôn tập hôm nay (SM-2)</div>
          <div className="mt-1.5 text-2xl font-extrabold text-rose-600">
            🧠 {ov.dueReviewsCount} câu
          </div>
          <div className="mt-1 text-[11px]">
            <Link href="/review" className="font-semibold text-indigo-600 hover:underline">
              Mở sổ tay lỗi sai →
            </Link>
          </div>
        </div>
      </div>

      {/* 2 Biểu đồ Chart.js nạp động: Tiến độ 10 bài thi & Độ thành thạo chương */}
      <DashboardCharts
        scoreTrend={analytics?.scoreTrend}
        chapterMastery={analytics?.chapterMastery}
      />

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
        </div>
      </div>
    </AppShell>
  );
}
