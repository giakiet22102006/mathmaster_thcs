'use client';

// ==============================================================================
// MathMaster THCS - Trang Lịch Sử Đề Đã Tạo & Bài Đã Làm (/history)
// ==============================================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell, CognitiveBadge } from '@/components/MathMasterShell';

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'attempts' | 'exams'>('attempts');
  const [attempts, setAttempts] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      try {
        const [stateRes, attRes, exRes] = await Promise.all([
          fetch('/api/state'),
          fetch('/api/attempts'),
          fetch('/api/exams'),
        ]);
        if (stateRes.status === 401) {
          router.push('/login');
          return;
        }
        const stateData = await stateRes.json();
        const attData = await attRes.json();
        const exData = await exRes.json();
        setUser(stateData?.state?.user || null);
        if (attData.ok) setAttempts(attData.attempts || []);
        if (exData.ok) setExams(exData.exams || []);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [router]);

  return (
    <AppShell
      user={user}
      title="Lịch Sử Đề Đã Tạo & Bài Đã Làm"
      subtitle="Xem lại chi tiết điểm số, phân tích Rubric và làm lại các đề kiểm tra"
      rightActions={
        <Link
          href="/exams/new"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
        >
          + Tạo đề mới
        </Link>
      }
    >
      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setTab('attempts')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            tab === 'attempts'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          📋 Lượt bài đã nộp ({attempts.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('exams')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            tab === 'exams'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          📝 Ngân hàng đề của tôi ({exams.length})
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
          Đang tải lịch sử...
        </div>
      ) : tab === 'attempts' ? (
        <div className="space-y-3">
          {attempts.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
              Bạn chưa có lượt làm bài nào. Hãy chọn một đề thi để bắt đầu!
            </div>
          ) : (
            attempts.map((att) => {
              const ex = exams.find((e) => e.id === att.examId);
              return (
                <div
                  key={att.id}
                  className="rounded-2xl bg-white p-4 md:p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          att.status === 'GRADED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {att.status === 'GRADED' ? 'Đã chấm điểm' : 'Đang làm dở'}
                      </span>
                      <span className="text-xs text-slate-500">
                        Lớp {att.grade} • {att.submittedAt || att.startedAt}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900">
                      {ex?.title || `Đề kiểm tra #${att.examId}`}
                    </div>
                    {att.status === 'GRADED' && (
                      <div className="mt-1 text-xs text-slate-600">
                        Đúng: <strong>{att.correctCount}</strong> câu • Sai:{' '}
                        <strong>{att.wrongCount}</strong> câu • Bỏ trống:{' '}
                        <strong>{att.unansweredCount}</strong> câu
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {att.status === 'GRADED' && (
                      <div className="text-right">
                        <div className="text-xl font-extrabold text-indigo-600">
                          {Number(att.totalScore || 0).toFixed(2)} đ
                        </div>
                        <div className="text-[11px] text-slate-400">Thang điểm 10</div>
                      </div>
                    )}
                    <Link
                      href={
                        att.status === 'GRADED'
                          ? `/exams/${att.examId}/result?attemptId=${att.id}`
                          : `/exams/${att.examId}`
                      }
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                      {att.status === 'GRADED' ? 'Xem lời giải & Rubric →' : 'Tiếp tục làm →'}
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((ex) => (
            <div
              key={ex.id}
              className="rounded-2xl bg-white p-4 md:p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                    Lớp {ex.grade} • {ex.textbook || 'KNTT'}
                  </span>
                  <CognitiveBadge level={ex.difficulty} size="xs" />
                  <span className="text-xs text-slate-500">
                    {(ex.questionIds || []).length} câu • {ex.durationMinutes || 45} phút
                  </span>
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900">{ex.title}</div>
                {ex.composition?.actualCounts && (
                  <div className="mt-1 text-[11px] text-slate-500">
                    Ma trận thực tế: NB {ex.composition.actualCounts.nhan_biet} • TH{' '}
                    {ex.composition.actualCounts.thong_hieu} • VD{' '}
                    {ex.composition.actualCounts.van_dung} • VDC{' '}
                    {ex.composition.actualCounts.van_dung_cao}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/exams/${ex.id}`}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Làm đề này →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
