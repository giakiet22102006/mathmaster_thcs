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
import { AITutorWidget } from '@/components/AITutorWidget';

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
  const [aiTutorOpen, setAiTutorOpen] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  // Trạng thái AI Chẩn đoán điểm yếu & Lộ trình ôn tập
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [analyzingWeaknesses, setAnalyzingWeaknesses] = useState<boolean>(false);
  const [creatingWeaknessExam, setCreatingWeaknessExam] = useState<boolean>(false);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);

  async function handleDiagnoseWeaknesses(forceRefresh = false) {
    if (!attempt) return;
    setAnalyzingWeaknesses(true);
    setAiAnalysisError(null);
    try {
      const res = await fetch('/api/ai/diagnose-weaknesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: attempt.id,
          examId: exam?.id || examId,
          forceRefresh,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setAiAnalysis(data.analysis);
      } else {
        setAiAnalysisError(data.error || 'Không thể tải phân tích điểm yếu từ AI.');
      }
    } catch {
      setAiAnalysisError('Lỗi kết nối khi gửi yêu cầu phân tích.');
    } finally {
      setAnalyzingWeaknesses(false);
    }
  }

  // Tự động tải phân tích nếu bài làm đã có sẵn hoặc khi tìm thấy attempt có câu sai
  useEffect(() => {
    if (attempt?.aiWeaknessAnalysis) {
      setAiAnalysis(attempt.aiWeaknessAnalysis);
    } else if (attempt && attempt.wrongCount > 0) {
      handleDiagnoseWeaknesses(false);
    }
  }, [attempt?.id]);

  async function handleCreateRemediationExam() {
    if (!aiAnalysis?.recommendedPracticePrompt) return;
    setCreatingWeaknessExam(true);
    try {
      const res = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: Number(exam?.grade) || 8,
          textbook: exam?.textbook || 'KNTT',
          customPrompt: aiAnalysis.recommendedPracticePrompt,
          topic: aiAnalysis.recommendedPracticePrompt,
          count: 5,
          durationMinutes: 15,
          createFullExam: true,
          saveToBank: true,
        }),
      });
      const data = await res.json();
      if (data.ok && data.exam?.id) {
        router.push(`/exams/${data.exam.id}`);
      } else {
        router.push(`/exams/new?aiPrompt=${encodeURIComponent(aiAnalysis.recommendedPracticePrompt)}`);
      }
    } catch {
      router.push(`/exams/new?aiPrompt=${encodeURIComponent(aiAnalysis.recommendedPracticePrompt)}`);
    } finally {
      setCreatingWeaknessExam(false);
    }
  }

  useEffect(() => {
    async function loadResult() {
      setLoading(true);
      try {
        const stateRes = await fetch('/api/state?scope=shell');
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

      {/* KHỐI AI CHẨN ĐOÁN ĐIỂM YẾU & KẾ HOẠCH ÔN TẬP PHỤC HỒI */}
      <div className="mb-6 rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-2xl">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  AI Chẩn Đoán Điểm Yếu & Lộ Trình Ôn Tập
                </h3>
                <span className="rounded-full bg-indigo-500/30 border border-indigo-400/40 px-2 py-0.5 text-[10px] font-bold text-indigo-200">
                  Gemini 3.8 Flash • GDPT 2018
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Phân tích lỗi sai, chỉ rõ mảng kiến thức hổng và đề xuất bài tập khắc phục
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {aiAnalysis && (
              <button
                type="button"
                onClick={() => handleDiagnoseWeaknesses(true)}
                disabled={analyzingWeaknesses}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100 hover:bg-white/20 transition disabled:opacity-50"
              >
                {analyzingWeaknesses ? 'Đang phân tích lại...' : '🔄 Phân tích lại'}
              </button>
            )}
          </div>
        </div>

        {analyzingWeaknesses ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
            <p className="text-xs font-semibold text-indigo-200 animate-pulse">
              AI Gemini đang phân tích các câu làm sai và lập kế hoạch ôn tập cho em...
            </p>
          </div>
        ) : aiAnalysisError ? (
          <div className="rounded-2xl bg-rose-950/60 border border-rose-500/40 p-4 text-xs text-rose-200 flex items-center justify-between">
            <span>⚠️ {aiAnalysisError}</span>
            <button
              type="button"
              onClick={() => handleDiagnoseWeaknesses(true)}
              className="rounded-lg bg-rose-600 px-3 py-1 font-bold text-white hover:bg-rose-500"
            >
              Thử lại
            </button>
          </div>
        ) : !aiAnalysis ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3">
            <div className="text-xs text-indigo-200">
              Nhấn nút bên cạnh để AI sư phạm quét toàn bộ các câu sai và đề xuất kế hoạch lấy lại điểm số.
            </div>
            <button
              type="button"
              onClick={() => handleDiagnoseWeaknesses(false)}
              className="shrink-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-black text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 transition"
            >
              🔍 AI Phân Tích Điểm Yếu Toàn Diện
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {/* Nhận xét tổng quan */}
            <div className="rounded-2xl border border-indigo-700/60 bg-indigo-900/40 p-4 text-xs text-indigo-100 leading-relaxed">
              <span className="font-bold text-amber-300">💡 Đánh giá của AI: </span>
              {aiAnalysis.assessmentSummary}
            </div>

            {/* Danh sách các lỗ hổng kiến thức */}
            {Array.isArray(aiAnalysis.keyWeaknesses) && aiAnalysis.keyWeaknesses.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                  <span>📌</span>
                  <span>Các Lỗ Hổng Kiến Thức Cần Khắc Phục:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiAnalysis.keyWeaknesses.map((w: any, wIdx: number) => (
                    <div
                      key={wIdx}
                      className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs space-y-1.5 hover:border-indigo-400/40 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-white text-xs font-bold">{w.area}</strong>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                            w.severity === 'high'
                              ? 'bg-rose-500/20 border border-rose-400/40 text-rose-300'
                              : 'bg-amber-500/20 border border-amber-400/40 text-amber-300'
                          }`}
                        >
                          {w.severity === 'high' ? 'Ưu tiên khắc phục gấp' : 'Cần củng cố thêm'}
                        </span>
                      </div>
                      <p className="text-indigo-200/90 text-[11px] leading-relaxed">
                        {w.reason}
                      </p>
                      {w.suggestedReview && (
                        <div className="text-[11px] text-emerald-300 font-medium pt-1 border-t border-white/10">
                          📖 {w.suggestedReview}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lộ trình 3 bước hành động */}
            {Array.isArray(aiAnalysis.actionablePlan) && aiAnalysis.actionablePlan.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>Lộ Trình Hành Động Khắc Phục:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {aiAnalysis.actionablePlan.map((step: any, sIdx: number) => (
                    <div
                      key={sIdx}
                      className="rounded-xl border border-indigo-700/50 bg-indigo-950/60 p-3 text-xs space-y-1"
                    >
                      <div className="font-extrabold text-amber-300 text-[11px]">
                        {step.title || `Bước ${sIdx + 1}`}
                      </div>
                      <p className="text-indigo-200 text-[11px] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Các Nút Hành Động Trọng Tâm */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-indigo-800/80">
              <div className="text-xs text-indigo-200/90">
                <span className="font-semibold text-white">Chủ đề luyện tập đề xuất: </span>
                <span className="italic text-indigo-300">
                  {aiAnalysis.recommendedPracticePrompt || 'Ôn tập phục hồi điểm số'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/exams/new?aiPrompt=${encodeURIComponent(
                    aiAnalysis.recommendedPracticePrompt || ''
                  )}`}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
                >
                  ✏️ Tùy Chỉnh Đề Ôn Luyện
                </Link>

                <button
                  type="button"
                  onClick={handleCreateRemediationExam}
                  disabled={creatingWeaknessExam}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-xs font-black text-slate-950 shadow-lg hover:from-emerald-400 hover:to-teal-400 transition disabled:opacity-50"
                >
                  {creatingWeaknessExam ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      <span>Đang tạo đề thi phục hồi...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Tạo Đề Luyện Điểm Yếu & Làm Ngay (5 câu)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
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

                  {!isRight && (
                    <div className="pt-2 flex justify-end print:hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedQuestion(q);
                          setSelectedAnswer(String(rec.value || rec.workings || ''));
                          setAiTutorOpen(true);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-900 hover:bg-indigo-100 shadow-sm transition"
                      >
                        <span>🤖</span>
                        <span>Hỏi Gia sư AI: Tại sao em làm sai câu này?</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedQuestion && (
        <AITutorWidget
          isOpen={aiTutorOpen}
          onClose={() => setAiTutorOpen(false)}
          question={selectedQuestion}
          initialMode="diagnose_mistake"
          studentAnswer={selectedAnswer}
        />
      )}
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
