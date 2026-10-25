'use client';

// ==============================================================================
// MathMaster THCS - Sổ Tay Lỗi Sai & Ôn Tập Ngắt Quãng SM-2 (/review)
// Tự động nhắc lại câu sai sau 1, 3, 6... ngày theo thuật toán SuperMemo-2
// và hỗ trợ nút "Tạo đề ôn lại câu sai (5–10 câu)"
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppShell,
  CognitiveBadge,
  MathText,
} from '@/components/MathMasterShell';
import { AITutorWidget } from '@/components/AITutorWidget';

export default function ReviewQueuePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reviewQueue, setReviewQueue] = useState<any[]>([]);
  const [dueCount, setDueCount] = useState<number>(0);
  const [errorBreakdown, setErrorBreakdown] = useState<Record<string, number>>({});
  const [reAnswers, setReAnswers] = useState<Record<string, string>>({});
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [creatingMiniExam, setCreatingMiniExam] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiTutorOpen, setAiTutorOpen] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [wrongAnswer, setWrongAnswer] = useState<string>('');

  async function loadReviewData() {
    setLoading(true);
    try {
      const [stateRes, revRes] = await Promise.all([
        fetch('/api/state?scope=shell'),
        fetch('/api/review'),
      ]);
      if (stateRes.status === 401) {
        router.push('/login');
        return;
      }
      const stateData = await stateRes.json();
      const u = stateData?.state?.user || null;
      if (u?.role === 'ADMIN') {
        router.replace('/admin/students');
        return;
      }
      const revData = await revRes.json();
      setUser(u);
      if (revData.ok) {
        setReviewQueue(revData.reviewQueue || []);
        setDueCount(revData.dueCount || 0);
        setErrorBreakdown(revData.errorBreakdown || {});
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviewData();
  }, []);

  async function handleGradeReviewCard(reviewId: string, quality?: number) {
    const ans = reAnswers[reviewId];
    const res = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'grade_card',
        reviewId,
        answer: ans,
        quality,
      }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setFeedbackMap((prev) => ({
        ...prev,
        [reviewId]: `Đã cập nhật lịch SM-2: hẹn ôn lại sau ${data.sm2.intervalDays} ngày (Hệ số EF = ${data.sm2.easeFactor}, Lần lặp = ${data.sm2.repetitions}).`,
      }));
      loadReviewData();
    }
  }

  async function handleCreateWrongMiniExam() {
    setCreatingMiniExam(true);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_wrong_mini_exam',
          questionCount: 5,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok && data.exam?.id) {
        router.push(`/exams/${data.exam.id}`);
      }
    } finally {
      setCreatingMiniExam(false);
    }
  }

  return (
    <AppShell
      user={user}
      title="Sổ Tay Lỗi Sai & Ôn Tập Ngắt Quãng (SM-2)"
      subtitle={`Hiện có ${dueCount} câu hỏi đến hạn ôn lại hôm nay theo lịch lặp lại ngắt quãng SuperMemo-2`}
      rightActions={
        <button
          type="button"
          onClick={handleCreateWrongMiniExam}
          disabled={creatingMiniExam || reviewQueue.length === 0}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700 disabled:opacity-50"
        >
          {creatingMiniExam
            ? 'Đang tạo mini-đề...'
            : '🎯 Tạo Đề Ôn Lại Câu Sai (5–10 câu)'}
        </button>
      }
    >
      {/* Thống kê theo loại lỗi */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { key: 'CALCULATION_ERROR', label: 'Sai tính toán', color: 'text-rose-600' },
          { key: 'SIGN_ERROR', label: 'Sai dấu (+/-)', color: 'text-amber-600' },
          { key: 'MISSING_CONDITION', label: 'Thiếu điều kiện', color: 'text-purple-600' },
          { key: 'FORMULA_ERROR', label: 'Nhầm công thức', color: 'text-sky-600' },
          { key: 'CONCEPT_ERROR', label: 'Nhầm khái niệm', color: 'text-indigo-600' },
        ].map((item) => (
          <div
            key={item.key}
            className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-sm"
          >
            <div className="text-[11px] font-medium text-slate-500">{item.label}</div>
            <div className={`mt-1 text-xl font-extrabold ${item.color}`}>
              {errorBreakdown[item.key] || 0} câu
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
          Đang tải sổ tay lỗi sai...
        </div>
      ) : reviewQueue.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
          🎉 Tuyệt vời! Sổ tay lỗi sai của bạn đang trống.
        </div>
      ) : (
        <div className="space-y-4">
          {reviewQueue.map((item) => {
            const q = item.question;
            if (!q) return null;
            return (
              <div
                key={item.id}
                className={`rounded-2xl bg-white p-5 border shadow-sm space-y-3 ${
                  item.isDue ? 'border-rose-300' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        item.isDue
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.isDue ? '⏰ Đến hạn ôn hôm nay' : '✓ Đã hẹn lịch SM-2'}
                    </span>
                    <CognitiveBadge level={q.cognitiveLevel} size="xs" />
                    <span className="text-xs text-slate-500">
                      Sai {item.wrongAttempts || 1} lần • Chu kỳ SM-2: {item.intervalDays || 1} ngày (EF{' '}
                      {item.easeFactor || 2.5})
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Lịch ôn kế tiếp: {String(item.nextReviewAt || '').slice(0, 10)}
                  </span>
                </div>

                <div className="text-sm md:text-base font-medium text-slate-900">
                  <MathText text={q.content} block />
                </div>

                <div className="rounded-xl bg-rose-50/70 p-3 text-xs border border-rose-100 space-y-1">
                  <div>
                    <span className="text-slate-600">Đáp án sai lần trước của bạn: </span>
                    <strong className="text-rose-700">{item.lastWrongAnswer}</strong>
                  </div>
                  {q.commonMistake && (
                    <div className="text-amber-900">
                      <strong>⚠️ Lưu ý tránh bẫy: </strong>
                      <MathText text={q.commonMistake} />
                    </div>
                  )}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuestion(q);
                        setWrongAnswer(item.lastWrongAnswer || '');
                        setAiTutorOpen(true);
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-900 hover:bg-indigo-50 shadow-xs transition"
                    >
                      <span>🤖</span>
                      <span>Gia sư AI chẩn đoán & hướng dẫn khắc phục</span>
                    </button>
                  </div>
                </div>

                {/* Ô làm lại nhanh để cập nhật SM-2 */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={reAnswers[item.id] || ''}
                    onChange={(e) =>
                      setReAnswers((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    placeholder={
                      q.type === 'mcq'
                        ? 'Nhập lại phương án đúng (A, B, C, D)...'
                        : 'Nhập lại đáp số đúng của bài toán...'
                    }
                    className="flex-1 min-w-[200px] rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => handleGradeReviewCard(item.id)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                  >
                    Kiểm tra & Cập nhật lịch SM-2
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGradeReviewCard(item.id, 5)}
                    className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                  >
                    ✓ Đã nhớ kỹ (Tăng chu kỳ)
                  </button>
                </div>

                {feedbackMap[item.id] && (
                  <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 border border-emerald-200">
                    ✓ {feedbackMap[item.id]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedQuestion && (
        <AITutorWidget
          isOpen={aiTutorOpen}
          onClose={() => setAiTutorOpen(false)}
          question={selectedQuestion}
          initialMode="diagnose_mistake"
          studentAnswer={wrongAnswer}
        />
      )}
    </AppShell>
  );
}
