'use client';

// ==============================================================================
// MathMaster THCS - Trang Luyện Tập Chủ Đề Không Tính Giờ & Gợi Ý Từng Bước (/practice)
// Học sinh chọn Khối, Chương, Mức độ nhận thức để giải từng câu, mở Gợi ý 1-2-3
// và kiểm tra đáp án ngay lập tức hoặc tạo Đề Thích Ứng "Luyện điểm yếu"
// ==============================================================================

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AppShell,
  CognitiveBadge,
  MathSymbolKeyboard,
  MathText,
} from '@/components/MathMasterShell';

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChapter = searchParams.get('chapterId') || 'ALL';

  const [user, setUser] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any>(null);
  const [grade, setGrade] = useState<number>(8);
  const [chapterId, setChapterId] = useState<string>(initialChapter);
  const [cognitiveLevel, setCognitiveLevel] = useState<string>('ALL');

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answer, setAnswer] = useState<string>('');
  const [workings, setWorkings] = useState<string>('');
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingAdaptive, setCreatingAdaptive] = useState<boolean>(false);

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/state');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data?.state) {
        const u = data.state.user;
        setUser(u);
        const g = Number(u?.currentGrade || 8);
        setGrade(g);
        setCurriculum(data.state.curriculum);
      }
    }
    init();
  }, [router]);

  useEffect(() => {
    async function fetchPracticeQuestions() {
      setLoading(true);
      try {
        const url = `/api/practice?grade=${grade}&chapterId=${encodeURIComponent(
          chapterId
        )}&cognitiveLevel=${encodeURIComponent(cognitiveLevel)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok && data.ok) {
          setQuestions(data.questions || []);
          setCurrentIdx(0);
          setAnswer('');
          setWorkings('');
          setRevealedHints(0);
          setCheckResult(null);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPracticeQuestions();
  }, [grade, chapterId, cognitiveLevel]);

  async function handleCheckAnswer() {
    const q = questions[currentIdx];
    if (!q) return;
    const res = await fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'check_answer',
        questionId: q.id,
        answer,
        workings,
      }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setCheckResult(data);
    }
  }

  async function handleCreateAdaptiveExam() {
    setCreatingAdaptive(true);
    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_adaptive_exam',
          grade,
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

  const gradeChapters =
    (curriculum?.grades || []).find((g: any) => Number(g.id) === Number(grade))?.chapters ||
    [];
  const currentQ = questions[currentIdx];

  return (
    <AppShell
      user={user}
      title="Luyện Tập Theo Chủ Đề (Không Giới Hạn Thời Gian)"
      subtitle="Giải từng bài có Gợi ý từng bước (Step-by-step Hints) và kiểm tra đáp án tức thì"
      rightActions={
        <button
          type="button"
          onClick={handleCreateAdaptiveExam}
          disabled={creatingAdaptive}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
        >
          {creatingAdaptive ? 'Đang tạo đề...' : '⚡ Tạo Đề Thích Ứng "Luyện Điểm Yếu"'}
        </button>
      }
    >
      {/* Bộ lọc Chủ đề & Mức độ */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Khối lớp</label>
          <select
            value={grade}
            onChange={(e) => {
              setGrade(Number(e.target.value));
              setChapterId('ALL');
            }}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold bg-white"
          >
            <option value={6}>Lớp 6</option>
            <option value={7}>Lớp 7</option>
            <option value={8}>Lớp 8</option>
            <option value={9}>Lớp 9</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Chương học</label>
          <select
            value={chapterId}
            onChange={(e) => setChapterId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold bg-white"
          >
            <option value="ALL">Tất cả các chương Lớp {grade}</option>
            {gradeChapters.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ nhận thức</label>
          <select
            value={cognitiveLevel}
            onChange={(e) => setCognitiveLevel(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold bg-white"
          >
            <option value="ALL">Tất cả 4 mức độ nhận thức</option>
            <option value="nhan_biet">Nhận biết (NB)</option>
            <option value="thong_hieu">Thông hiểu (TH)</option>
            <option value="van_dung">Vận dụng (VD)</option>
            <option value="van_dung_cao">Vận dụng cao (VDC)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
          Đang tải câu hỏi luyện tập...
        </div>
      ) : !currentQ ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
          Không có câu hỏi nào khớp với bộ lọc hiện tại. Hãy chọn Tất cả các chương hoặc mức độ khác.
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-5 md:p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white">
                Bài {currentIdx + 1} / {questions.length}
              </span>
              <CognitiveBadge level={currentQ.cognitiveLevel} />
              <span className="text-xs text-slate-500">
                {currentQ.chapterId} • {currentQ.topic}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setRevealedHints((h) => Math.min(3, h + 1))}
              className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100"
            >
              💡 Xem gợi ý từng bước ({revealedHints}/3)
            </button>
          </div>

          <div className="text-base md:text-lg font-medium text-slate-900">
            <MathText text={currentQ.content} block />
          </div>

          {/* Hiển thị các gợi ý đã mở */}
          {revealedHints > 0 && (
            <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-950">
              {(currentQ.hints || []).slice(0, revealedHints).map((hint: string, i: number) => (
                <div key={i}>
                  <MathText text={hint} />
                </div>
              ))}
            </div>
          )}

          {currentQ.type === 'mcq' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(currentQ.options || []).map((opt: any) => {
                const selected = answer.toUpperCase() === String(opt.label).toUpperCase();
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setAnswer(opt.label)}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                      selected
                        ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-300 text-xs font-extrabold">
                      {opt.label}
                    </span>
                    <MathText text={opt.text} className="text-sm font-medium" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <MathSymbolKeyboard
                onInsert={(snippet) => setAnswer((prev) => prev + snippet)}
              />
              <textarea
                rows={3}
                value={workings}
                onChange={(e) => setWorkings(e.target.value)}
                placeholder="Nhập các bước biến đổi của bạn (không bắt buộc)..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm font-mono"
              />
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Nhập đáp số cuối cùng..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold"
              />
            </div>
          )}

          {checkResult && (
            <div
              className={`rounded-xl border p-4 text-xs space-y-2 ${
                checkResult.isCorrect
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                  : 'border-rose-300 bg-rose-50 text-rose-950'
              }`}
            >
              <div className="font-bold text-sm">
                {checkResult.isCorrect
                  ? '🎉 Chính xác! +10 XP'
                  : '❌ Chưa chính xác (Đã tự động lưu vào Sổ tay lỗi sai SM-2)'}
              </div>
              <div>
                <strong>Đáp án đúng:</strong> {checkResult.correctAnswer}
              </div>
              <div>
                <strong>Lời giải chi tiết: </strong>
                <MathText text={checkResult.solution} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => {
                setCurrentIdx((i) => Math.max(0, i - 1));
                setAnswer('');
                setWorkings('');
                setRevealedHints(0);
                setCheckResult(null);
              }}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"
            >
              ← Bài trước
            </button>

            <button
              type="button"
              onClick={handleCheckAnswer}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              ✓ Kiểm tra đáp án
            </button>

            <button
              type="button"
              disabled={currentIdx >= questions.length - 1}
              onClick={() => {
                setCurrentIdx((i) => Math.min(questions.length - 1, i + 1));
                setAnswer('');
                setWorkings('');
                setRevealedHints(0);
                setCheckResult(null);
              }}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
            >
              Bài tiếp theo →
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
