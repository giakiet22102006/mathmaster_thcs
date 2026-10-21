'use client';

// ==============================================================================
// MathMaster THCS - Phòng Thi Trực Tuyến (/exams/[id])
// Có Question Palette 4 trạng thái, Đồng hồ đếm ngược, Autosave định kỳ,
// Bàn phím ký hiệu Toán học, Nhãn độ khó chuẩn và Chế độ In đề PDF (@media print)
// ==============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  CognitiveBadge,
  MathSymbolKeyboard,
  MathText,
} from '@/components/MathMasterShell';

interface AnswerEntry {
  value: string;
  workings: string;
  flagged: boolean;
}

export default function ExamRoomPage() {
  const params = useParams();
  const router = useRouter();
  const examId = String(params?.id || '');

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerEntry>>({});
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(2700);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [lastSavedText, setLastSavedText] = useState<string>('Chưa lưu');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [favoriteQIds, setFavoriteQIds] = useState<string[]>([]);
  const [activeField, setActiveField] = useState<'value' | 'workings'>('workings');

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const timeSpentRef = useRef(timeSpentSeconds);
  timeSpentRef.current = timeSpentSeconds;
  const remainingRef = useRef(remainingSeconds);
  remainingRef.current = remainingSeconds;
  const attemptRef = useRef(attempt);
  attemptRef.current = attempt;

  // Khởi tạo đề thi và lượt làm bài (attempt)
  useEffect(() => {
    async function loadExamRoom() {
      setLoading(true);
      try {
        const [examRes, favRes] = await Promise.all([
          fetch(`/api/exams?id=${encodeURIComponent(examId)}`),
          fetch('/api/questions?mode=favorites'),
        ]);

        if (examRes.status === 401) {
          router.push('/login');
          return;
        }
        const examData = await examRes.json();
        if (!examRes.ok || !examData.ok) {
          router.push('/dashboard');
          return;
        }

        const loadedExam = examData.exam;
        const loadedQs = examData.questions || [];
        setExam(loadedExam);
        setQuestions(loadedQs);

        if (favRes.ok) {
          const favData = await favRes.json();
          setFavoriteQIds(favData.favoriteQuestionIds || []);
        }

        // Bắt đầu hoặc tiếp tục lượt làm bài
        const startRes = await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start',
            examId: loadedExam.id,
          }),
        });
        const startData = await startRes.json();
        if (startRes.ok && startData.ok && startData.attempt) {
          const att = startData.attempt;
          setAttempt(att);

          // Khôi phục nháp từ localStorage hoặc server
          const localKey = `mm_draft_${att.id}`;
          let restoredAnswers = att.answers || {};
          try {
            const rawLocal = localStorage.getItem(localKey);
            if (rawLocal) {
              const parsed = JSON.parse(rawLocal);
              if (parsed && typeof parsed === 'object') {
                restoredAnswers = { ...restoredAnswers, ...parsed };
              }
            }
          } catch {}

          setAnswers(restoredAnswers);
          setRemainingSeconds(
            Number(att.remainingSeconds || (loadedExam.durationMinutes || 45) * 60)
          );
          setTimeSpentSeconds(Number(att.timeSpentSeconds || 0));
          setLastSavedText(
            new Date().toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        }
      } finally {
        setLoading(false);
      }
    }

    if (examId) {
      loadExamRoom();
    }
  }, [examId, router]);

  // Hàm đồng bộ Autosave lên server
  const syncAutosaveToServer = useCallback(async () => {
    const att = attemptRef.current;
    if (!att?.id) return;
    try {
      const res = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'autosave',
          attemptId: att.id,
          answers: answersRef.current,
          timeSpentSeconds: timeSpentRef.current,
          remainingSeconds: remainingRef.current,
        }),
      });
      if (res.ok) {
        const nowStr = new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLastSavedText(`Đã tự động lưu lúc ${nowStr}`);
      }
    } catch {}
  }, []);

  // Hàm nộp bài
  const handleSubmitExam = useCallback(
    async (isAutoTimeout = false) => {
      const att = attemptRef.current;
      if (!att?.id || submitting) return;
      setSubmitting(true);
      try {
        const res = await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'submit',
            attemptId: att.id,
            answers: answersRef.current,
            timeSpentSeconds: timeSpentRef.current,
            remainingSeconds: isAutoTimeout ? 0 : remainingRef.current,
          }),
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          try {
            localStorage.removeItem(`mm_draft_${att.id}`);
          } catch {}
          router.push(`/exams/${examId}/result?attemptId=${att.id}`);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [examId, router, submitting]
  );

  // Đồng hồ đếm ngược mỗi giây + Tự động nộp bài khi hết giờ
  useEffect(() => {
    if (loading || !attempt || submitting) return;
    const timer = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, attempt, submitting, handleSubmitExam]);

  // Autosave định kỳ mỗi 15 giây
  useEffect(() => {
    if (loading || !attempt) return;
    const interval = setInterval(() => {
      syncAutosaveToServer();
    }, 15000);
    return () => clearInterval(interval);
  }, [loading, attempt, syncAutosaveToServer]);

  function updateCurrentAnswer(qId: string, patch: Partial<AnswerEntry>) {
    setAnswers((prev) => {
      const cur = prev[qId] || { value: '', workings: '', flagged: false };
      const next = { ...prev, [qId]: { ...cur, ...patch } };
      if (attempt?.id) {
        try {
          localStorage.setItem(`mm_draft_${attempt.id}`, JSON.stringify(next));
          const nowStr = new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          setLastSavedText(`Đã tự động lưu lúc ${nowStr}`);
        } catch {}
      }
      return next;
    });
  }

  async function handleToggleFavoriteQuestion(qId: string) {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_favorite', questionId: qId }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setFavoriteQIds(data.favoriteQuestionIds || []);
    }
  }

  function formatClock(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  if (loading || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-600">
        Đang chuẩn bị phòng thi & tải đề Toán...
      </div>
    );
  }

  const currentQuestion = questions[currentIdx] || questions[0];
  const currentEntry: AnswerEntry = currentQuestion
    ? answers[currentQuestion.id] || { value: '', workings: '', flagged: false }
    : { value: '', workings: '', flagged: false };

  const isLowTime = remainingSeconds < 300; // < 5 phút chuyển màu cam/đỏ
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return Boolean(a?.value?.trim() || a?.workings?.trim());
  }).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* Thanh Top Bar cố định của Phòng thi */}
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm px-4 py-3 md:px-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            ← Thoát
          </Link>
          <div>
            <h1 className="text-sm md:text-base font-bold text-slate-900">{exam.title}</h1>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span>Mã đề: #{exam.examCode || '101'}</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">💾 {lastSavedText}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Đồng hồ đếm ngược */}
          <div
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-sm font-extrabold transition ${
              isLowTime
                ? 'border-amber-400 bg-amber-100 text-amber-900 animate-pulse'
                : 'border-indigo-200 bg-indigo-50 text-indigo-800'
            }`}
          >
            <span>⏱️</span>
            <span className="font-mono text-base">{formatClock(remainingSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="hidden sm:inline-flex rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            🖨️ In đề PDF
          </button>

          <button
            type="button"
            onClick={() => handleSubmitExam(false)}
            disabled={submitting}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs md:text-sm font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-60 transition"
          >
            {submitting
              ? 'Đang chấm điểm...'
              : `Nộp bài (${answeredCount}/${questions.length})`}
          </button>
        </div>
      </header>

      {/* Giao diện Phòng thi trên màn hình */}
      <div className="no-print max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái (2/3): Nội dung câu hỏi đang chọn */}
        <div className="lg:col-span-2 space-y-4">
          {exam.composition?.borrowedFromAdjacent && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
              ℹ️ Đề thi này có mượn câu hỏi từ mức độ nhận thức kề cận theo tùy chọn của bạn.
            </div>
          )}

          {currentQuestion && (
            <div className="rounded-2xl bg-white p-5 md:p-6 border border-slate-200 shadow-sm space-y-5">
              {/* Header câu hỏi */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-extrabold text-white">
                    Câu {currentIdx + 1} / {questions.length}
                  </span>
                  <CognitiveBadge level={currentQuestion.cognitiveLevel} />
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {currentQuestion.type === 'mcq' ? 'Trắc nghiệm' : 'Tự luận'} •{' '}
                    {exam.questionPoints?.[currentQuestion.id] || currentQuestion.points || 1} điểm
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleFavoriteQuestion(currentQuestion.id)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                      favoriteQIds.includes(currentQuestion.id)
                        ? 'border-amber-300 bg-amber-50 text-amber-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {favoriteQIds.includes(currentQuestion.id) ? '⭐ Đã lưu' : '☆ Lưu câu hỏi'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateCurrentAnswer(currentQuestion.id, {
                        flagged: !currentEntry.flagged,
                      })
                    }
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                      currentEntry.flagged
                        ? 'border-amber-400 bg-amber-100 text-amber-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {currentEntry.flagged ? '🚩 Đã đánh dấu xem lại' : '🏳️ Đánh dấu xem lại'}
                  </button>
                </div>
              </div>

              {/* Nội dung đề bài với KaTeX */}
              <div className="text-base md:text-lg font-medium text-slate-900 leading-relaxed py-1">
                <MathText text={currentQuestion.content} block />
              </div>

              {/* Khu vực trả lời: Trắc nghiệm (MCQ) hoặc Tự luận (Essay) */}
              {currentQuestion.type === 'mcq' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {(currentQuestion.options || []).map((opt: any) => {
                    const selected =
                      String(currentEntry.value || '').toUpperCase() ===
                      String(opt.label).toUpperCase();
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() =>
                          updateCurrentAnswer(currentQuestion.id, { value: opt.label })
                        }
                        className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                          selected
                            ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                            selected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-700'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <div className="text-sm font-medium text-slate-800">
                          <MathText text={opt.text} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <MathSymbolKeyboard
                    onInsert={(snippet) => {
                      if (activeField === 'value') {
                        updateCurrentAnswer(currentQuestion.id, {
                          value: (currentEntry.value || '') + snippet,
                        });
                      } else {
                        updateCurrentAnswer(currentQuestion.id, {
                          workings: (currentEntry.workings || '') + snippet,
                        });
                      }
                    }}
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Trình bày các bước biến đổi tự luận (Được chấm điểm thành phần theo từng bước Rubric):
                    </label>
                    <textarea
                      rows={4}
                      value={currentEntry.workings || ''}
                      onFocus={() => setActiveField('workings')}
                      onChange={(e) =>
                        updateCurrentAnswer(currentQuestion.id, { workings: e.target.value })
                      }
                      placeholder="Nhập các bước giải (ví dụ: Bước 1: x - 7 = 37 => Bước 2: x = 44)..."
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm font-mono focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Đáp số cuối cùng (Hỗ trợ phân số 1/2, số thập phân 0,5, căn sqrt(2) hoặc tập nghiệm 2; 3):
                    </label>
                    <input
                      type="text"
                      value={currentEntry.value || ''}
                      onFocus={() => setActiveField('value')}
                      onChange={(e) =>
                        updateCurrentAnswer(currentQuestion.id, { value: e.target.value })
                      }
                      placeholder="Nhập kết quả cuối cùng..."
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Điều hướng Câu trước / Câu tiếp theo */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"
                >
                  ← Câu trước
                </button>

                <button
                  type="button"
                  onClick={() => syncAutosaveToServer()}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  💾 Lưu nháp ngay
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))
                    }
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
                  >
                    Câu tiếp theo →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmitExam(false)}
                    disabled={submitting}
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
                  >
                    ✓ Hoàn thành & Nộp bài
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cột phải (1/3): Bảng Điều Hướng Câu Hỏi (Question Palette 4 trạng thái) */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm h-fit space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              🧭 Bảng Điều Hướng Câu Hỏi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Đã làm {answeredCount}/{questions.length} câu
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const entry = answers[q.id];
              const isDone = Boolean(entry?.value?.trim() || entry?.workings?.trim());
              const isFlagged = Boolean(entry?.flagged);
              const isCurrent = idx === currentIdx;

              let btnClass = 'border-slate-300 bg-slate-50 text-slate-700';
              if (isFlagged) {
                btnClass = 'border-amber-400 bg-amber-100 text-amber-900';
              } else if (isDone) {
                btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-800';
              }
              if (isCurrent) {
                btnClass += ' ring-2 ring-indigo-600 font-extrabold';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  className={`relative flex flex-col items-center justify-center rounded-xl border py-2 text-xs font-bold transition ${btnClass}`}
                >
                  <span>{idx + 1}</span>
                  <span className="text-[9px] font-medium">
                    {isFlagged ? '🚩 Xem lại' : isDone ? '✓ Đã làm' : 'Trống'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Chú giải 4 trạng thái màu + chữ */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-emerald-500 bg-emerald-50" />
              <span>Đã trả lời</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-slate-300 bg-slate-50" />
              <span>Chưa trả lời</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-amber-400 bg-amber-100" />
              <span>Đánh dấu xem lại</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border-2 border-indigo-600 bg-white" />
              <span>Câu đang chọn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bản in Đề Thi Chuẩn A4 (@media print) */}
      <div className="hidden print-only p-8">
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-start">
          <div>
            <div className="font-bold uppercase text-sm">HỆ THỐNG GIÁO DỤC MATHMASTER THCS</div>
            <div className="text-xs">Đề thi chính thức theo Ma trận Thông tư 22/2021/TT-BGDĐT</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-base">{exam.title}</div>
            <div className="text-xs">
              Mã đề: {exam.examCode || '101'} • Thời gian: {exam.durationMinutes} phút
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="print-card p-3 rounded">
              <div className="font-bold text-sm mb-1">
                Câu {i + 1} ({exam.questionPoints?.[q.id] || q.points} điểm):{' '}
                <MathText text={q.content} />
              </div>
              {q.type === 'mcq' && (
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  {(q.options || []).map((o: any) => (
                    <div key={o.label}>
                      <strong>{o.label}.</strong> <MathText text={o.text} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
