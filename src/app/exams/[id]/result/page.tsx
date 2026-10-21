'use client';

// ==============================================================================
// MathMaster THCS - Trang Kết Quả Chấm Thi, Phân Tích Rubric & Xuất PDF (/exams/[id]/result)
// Hiển thị điểm tổng, điểm từng phần RubricSteps, phân loại lỗi sai & In Đề/Đáp án A4
// ==============================================================================

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  AppShell,
  CognitiveBadge,
  MathText,
} from '@/components/MathMasterShell';

const ERROR_CATEGORY_LABELS: Record<string, string> = {
  SIGN_ERROR: 'Lỗi sai dấu (+/-)',
  MISSING_CONDITION: 'Thiếu điều kiện xác định / Quên loại nghiệm',
  FORMULA_ERROR: 'Nhầm công thức Toán học',
  CONCEPT_ERROR: 'Chưa vững khái niệm cơ bản',
  METHOD_ERROR: 'Sai hướng biến đổi đại số',
  CALCULATION_ERROR: 'Sai sót tính toán số học',
};

function ExamResultContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const examId = String(params?.id || '');
  const attemptIdParam = searchParams.get('attemptId');

  const [user, setUser] = useState<any>(null);
  const [exam, setExam] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [printMode, setPrintMode] = useState<'with_solution' | 'blank_exam'>('with_solution');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadResult() {
      setLoading(true);
      try {
        const stateRes = await fetch('/api/state');
        if (stateRes.status === 401) {
          router.push('/login');
          return;
        }
        const stateData = await stateRes.json();
        setUser(stateData?.state?.user || null);

        if (attemptIdParam) {
          const attRes = await fetch(
            `/api/attempts?id=${encodeURIComponent(attemptIdParam)}`
          );
          const attData = await attRes.json();
          if (attRes.ok && attData.ok) {
            setAttempt(attData.attempt);
            setExam(attData.exam);
            setQuestions(attData.questions || []);
            return;
          }
        }

        // Nếu không truyền attemptId, tìm bài làm gần nhất của đề này
        const [examRes, allAttRes] = await Promise.all([
          fetch(`/api/exams?id=${encodeURIComponent(examId)}`),
          fetch('/api/attempts'),
        ]);
        const examData = await examRes.json();
        const allAttData = await allAttRes.json();
        if (examData.ok) {
          setExam(examData.exam);
          setQuestions(examData.questions || []);
        }
        if (allAttData.ok && Array.isArray(allAttData.attempts)) {
          const found = allAttData.attempts.find(
            (a: any) => a.examId === examId && a.status === 'GRADED'
          );
          if (found) setAttempt(found);
        }
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [examId, attemptIdParam, router]);

  function handlePrint(mode: 'with_solution' | 'blank_exam') {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 100);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-600">
        Đang tải kết quả chấm điểm chi tiết...
      </div>
    );
  }

  if (!exam || !attempt) {
    return (
      <AppShell user={user} title="Kết quả bài thi">
        <div className="rounded-2xl bg-white p-6 border border-slate-200 text-center space-y-3">
          <div className="text-sm text-slate-600">
            Chưa tìm thấy lượt nộp bài đã chấm cho đề thi này.
          </div>
          <Link
            href={`/exams/${examId}`}
            className="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
          >
            Bắt đầu làm đề này →
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      user={user}
      title={`Kết quả: ${exam.title}`}
      subtitle={`Nộp bài lúc ${attempt.submittedAt || attempt.startedAt} • Mã đề #${
        exam.examCode || '101'
      }`}
      rightActions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handlePrint('blank_exam')}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            🖨️ In Đề Thi Trống
          </button>
          <button
            type="button"
            onClick={() => handlePrint('with_solution')}
            className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
          >
            🖨️ Xuất PDF Kèm Đáp Án & Lời Giải
          </button>
          <Link
            href="/review"
            className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
          >
            🧠 Ôn câu sai (SM-2)
          </Link>
        </div>
      }
    >
      {/* Thẻ tổng kết điểm */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
        <div className="col-span-2 md:col-span-1 rounded-2xl bg-indigo-600 text-white p-4 shadow">
          <div className="text-xs font-medium text-indigo-100">Tổng điểm đạt được</div>
          <div className="mt-1 text-3xl font-extrabold">
            {Number(attempt.totalScore || 0).toFixed(2)}{' '}
            <span className="text-xs font-normal text-indigo-200">/ 10</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">Điểm Trắc nghiệm</div>
          <div className="mt-1 text-xl font-bold text-slate-900">
            {Number(attempt.mcqScore || 0).toFixed(2)} đ
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">Điểm Tự luận (Rubric)</div>
          <div className="mt-1 text-xl font-bold text-slate-900">
            {Number(attempt.essayScore || 0).toFixed(2)} đ
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">Số câu đúng hoàn toàn</div>
          <div className="mt-1 text-xl font-bold text-emerald-600">
            {attempt.correctCount} / {questions.length} câu
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">Câu sai / Cần ôn lại</div>
          <div className="mt-1 text-xl font-bold text-rose-600">
            {attempt.wrongCount} câu
          </div>
        </div>
      </div>

      {/* Chi tiết từng câu hỏi, lời giải & RubricSteps */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const rec = attempt.answers?.[q.id] || {};
          const isRight = Boolean(rec.isCorrect);
          const isPartial = Boolean(rec.isPartial);
          const maxPts = exam.questionPoints?.[q.id] || q.points || 1;
          const awardedPts = Number(rec.points || 0);

          return (
            <div
              key={q.id}
              className={`print-card rounded-2xl bg-white p-5 border shadow-sm space-y-3 ${
                isRight
                  ? 'border-emerald-200'
                  : isPartial
                  ? 'border-amber-300'
                  : 'border-rose-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                    Câu {idx + 1}
                  </span>
                  <CognitiveBadge level={q.cognitiveLevel} size="xs" />
                  <span className="text-xs text-slate-500">
                    Chương {q.chapterId} • {q.topic}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      isRight
                        ? 'bg-emerald-100 text-emerald-800'
                        : isPartial
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isRight
                      ? `✓ Chính xác (+${awardedPts}/${maxPts}đ)`
                      : isPartial
                      ? `◐ Điểm thành phần (+${awardedPts}/${maxPts}đ)`
                      : `✗ Chưa đúng (0/${maxPts}đ)`}
                  </span>
                </div>
              </div>

              <div className="text-sm md:text-base font-medium text-slate-900">
                <MathText text={q.content} block />
              </div>

              {q.type === 'mcq' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(q.options || []).map((opt: any) => {
                    const isCorrectOpt =
                      String(opt.label).toUpperCase() ===
                      String(q.correctAnswer).toUpperCase();
                    const isChosenOpt =
                      String(opt.label).toUpperCase() ===
                      String(rec.value || '').toUpperCase();

                    return (
                      <div
                        key={opt.label}
                        className={`rounded-xl border p-2.5 flex items-center gap-2 ${
                          isCorrectOpt
                            ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-900'
                            : isChosenOpt
                            ? 'border-rose-400 bg-rose-50 font-semibold text-rose-900'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <span className="font-extrabold">{opt.label}.</span>
                        <MathText text={opt.text} />
                        {isCorrectOpt && (
                          <span className="ml-auto text-[10px] font-extrabold text-emerald-700">
                            ✓ Đáp án đúng
                          </span>
                        )}
                        {!isCorrectOpt && isChosenOpt && (
                          <span className="ml-auto text-[10px] font-extrabold text-rose-700">
                            ✗ Bạn chọn
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Khi ở chế độ in đề trống thì ẩn phần đáp án/lời giải bên dưới */}
              {printMode === 'with_solution' && (
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-slate-500">Bài làm của bạn: </span>
                      <strong className="text-slate-900">
                        {rec.value || rec.workings || '(Bỏ trống)'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Đáp án chuẩn: </span>
                      <strong className="text-emerald-700">{q.correctAnswer}</strong>
                    </div>
                  </div>

                  {rec.errorCategory && !isRight && (
                    <div className="text-rose-700 font-semibold">
                      🔍 Phân loại lỗi: {ERROR_CATEGORY_LABELS[rec.errorCategory] || rec.errorCategory}
                    </div>
                  )}

                  {/* Bảng chấm điểm từng bước RubricSteps */}
                  {Array.isArray(rec.rubricBreakdown) && rec.rubricBreakdown.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="font-bold text-slate-700">
                        Chi tiết chấm điểm từng bước (Rubric):
                      </div>
                      {rec.rubricBreakdown.map((rb: any, rIdx: number) => (
                        <div
                          key={rIdx}
                          className="flex items-center justify-between rounded bg-white px-2.5 py-1 border border-slate-200"
                        >
                          <span>
                            {rb.matched ? '✅' : '⬜'} Bước {rIdx + 1}:{' '}
                            <MathText text={rb.step} />
                          </span>
                          <span className="font-bold">
                            +{rb.awardedPoints}/{rb.maxPoints}đ
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 border-t border-slate-200 text-slate-800">
                    <strong>📖 Lời giải chi tiết: </strong>
                    <MathText text={q.solution} />
                  </div>

                  {q.commonMistake && (
                    <div className="text-amber-800">
                      <strong>⚠️ Bẫy thường gặp: </strong>
                      <MathText text={q.commonMistake} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

export default function ExamResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <ExamResultContent />
    </Suspense>
  );
}
