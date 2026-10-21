'use client';

// ==============================================================================
// MathMaster THCS - Trang Quản Trị & Duyệt Ngân Hàng Câu Hỏi (/admin/questions)
// Dành riêng cho TEACHER / ADMIN: lọc trạng thái draft/verified, duyệt câu hỏi,
// chỉnh sửa nội dung (kèm xem trước KaTeX), cảnh báo lệch empiricalDifficulty & Xuất JSON
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppShell,
  CognitiveBadge,
  MathText,
} from '@/components/MathMasterShell';

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [summary, setSummary] = useState<any>({
    totalAll: 0,
    verifiedCount: 0,
    draftCount: 0,
    filteredCount: 0,
  });
  const [questions, setQuestions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('draft');
  const [grade, setGrade] = useState<string>('ALL');
  const [cognitiveLevel, setCognitiveLevel] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [mismatchOnly, setMismatchOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState<string>('');

  async function loadQuestions() {
    setLoading(true);
    try {
      const stateRes = await fetch('/api/state');
      if (stateRes.status === 401) {
        router.push('/login');
        return;
      }
      const stateData = await stateRes.json();
      const currentUser = stateData?.state?.user;
      setUser(currentUser);

      if (currentUser?.role !== 'TEACHER' && currentUser?.role !== 'ADMIN') {
        setLoading(false);
        return;
      }

      const url = `/api/questions?verificationStatus=${statusFilter}&grade=${grade}&cognitiveLevel=${cognitiveLevel}&search=${encodeURIComponent(
        search
      )}&mismatchOnly=${mismatchOnly}`;
      const qRes = await fetch(url);
      const qData = await qRes.json();
      if (qRes.ok && qData.ok) {
        setSummary(qData.summary || {});
        setQuestions(qData.questions || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, [statusFilter, grade, cognitiveLevel, search, mismatchOnly]);

  async function handleApproveQuestions(ids: string[], targetStatus: 'verified' | 'draft' = 'verified') {
    if (ids.length === 0) return;
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'approve',
        questionIds: ids,
        verificationStatus: targetStatus,
      }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setStatusMsg(
        `Đã cập nhật ${data.updatedCount} câu hỏi sang trạng thái "${targetStatus.toUpperCase()}".`
      );
      loadQuestions();
    }
  }

  async function handleSaveEditedQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!editingQuestion) return;
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        questionId: editingQuestion.id,
        content: editingQuestion.content,
        correctAnswer: editingQuestion.correctAnswer,
        solution: editingQuestion.solution,
        commonMistake: editingQuestion.commonMistake,
        cognitiveLevel: editingQuestion.cognitiveLevel,
        verificationStatus: editingQuestion.verificationStatus,
      }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setStatusMsg(`Đã lưu thay đổi câu hỏi ${editingQuestion.id}.`);
      setEditingQuestion(null);
      loadQuestions();
    }
  }

  function handleExportJson() {
    const blob = new Blob([JSON.stringify(questions, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mathmaster_questions_${grade}_${statusFilter}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const isAuthorized = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  if (!loading && !isAuthorized) {
    return (
      <AppShell user={user} title="Quản trị Ngân hàng Câu hỏi">
        <div
          role="alert"
          className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-900"
        >
          ⛔ <strong>403 Forbidden:</strong> Chức năng Quản trị và Duyệt ngân hàng câu hỏi chỉ dành cho tài khoản Giáo viên (TEACHER) hoặc Quản trị viên (ADMIN).
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      user={user}
      title="Quản Trị & Kiểm Duyệt Ngân Hàng Câu Hỏi Toán THCS"
      subtitle="Kiểm duyệt câu hỏi từ bản nháp (draft) sang chính thức (verified) và theo dõi độ khó thực nghiệm"
      rightActions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            📥 Xuất JSON ({questions.length})
          </button>
          {statusFilter === 'draft' && questions.length > 0 && (
            <button
              type="button"
              onClick={() =>
                handleApproveQuestions(
                  questions.slice(0, 20).map((q) => q.id),
                  'verified'
                )
              }
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              ✓ Duyệt nhanh {Math.min(20, questions.length)} câu đang lọc
            </button>
          )}
        </div>
      }
    >
      {/* Thống kê tổng quan Ngân hàng */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">Tổng số câu toàn hệ thống</div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">
            {summary.totalAll} câu
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-emerald-200 shadow-sm">
          <div className="text-xs text-emerald-700 font-semibold">Đã xác minh (Verified)</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600">
            {summary.verifiedCount} câu
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-amber-200 shadow-sm">
          <div className="text-xs text-amber-800 font-semibold">Bản nháp chờ duyệt (Draft)</div>
          <div className="mt-1 text-2xl font-extrabold text-amber-600">
            {summary.draftCount} câu
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-indigo-200 shadow-sm">
          <div className="text-xs text-indigo-700 font-semibold">Đang hiển thị theo bộ lọc</div>
          <div className="mt-1 text-2xl font-extrabold text-indigo-600">
            {summary.filteredCount} câu
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800">
          ✓ {statusMsg}
        </div>
      )}

      {/* Bộ lọc câu hỏi */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-5 gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold bg-white"
        >
          <option value="draft">⏳ Bản nháp chờ duyệt (draft)</option>
          <option value="verified">✅ Đã xác minh (verified)</option>
          <option value="ALL">Tất cả trạng thái</option>
        </select>

        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold bg-white"
        >
          <option value="ALL">Tất cả Khối 6 - 9</option>
          <option value="6">Khối 6</option>
          <option value="7">Khối 7</option>
          <option value="8">Khối 8</option>
          <option value="9">Khối 9</option>
        </select>

        <select
          value={cognitiveLevel}
          onChange={(e) => setCognitiveLevel(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold bg-white"
        >
          <option value="ALL">Tất cả 4 mức nhận thức</option>
          <option value="nhan_biet">Nhận biết (NB)</option>
          <option value="thong_hieu">Thông hiểu (TH)</option>
          <option value="van_dung">Vận dụng (VD)</option>
          <option value="van_dung_cao">Vận dụng cao (VDC)</option>
        </select>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã câu, nội dung..."
          className="rounded-xl border border-slate-300 px-3 py-2 text-xs"
        />

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={mismatchOnly}
            onChange={(e) => setMismatchOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
          />
          <span>Lệch độ khó thực tế</span>
        </label>
      </div>

      {/* Modal sửa câu hỏi */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <form
            onSubmit={handleSaveEditedQuestion}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                ✏️ Chỉnh sửa câu hỏi: {editingQuestion.id} ({editingQuestion.code})
              </h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="text-xs font-bold text-slate-500"
              >
                Đóng ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nội dung câu hỏi (Hỗ trợ công thức LaTeX trong $...$):
              </label>
              <textarea
                rows={3}
                value={editingQuestion.content}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, content: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono"
              />
              <div className="mt-1.5 rounded-lg bg-slate-50 p-2.5 text-xs border border-slate-200">
                <strong>Xem trước KaTeX: </strong>
                <MathText text={editingQuestion.content} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đáp án đúng
                </label>
                <input
                  type="text"
                  value={editingQuestion.correctAnswer}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      correctAnswer: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mức độ nhận thức
                </label>
                <select
                  value={editingQuestion.cognitiveLevel}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      cognitiveLevel: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white"
                >
                  <option value="nhan_biet">Nhận biết</option>
                  <option value="thong_hieu">Thông hiểu</option>
                  <option value="van_dung">Vận dụng</option>
                  <option value="van_dung_cao">Vận dụng cao</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trạng thái duyệt
                </label>
                <select
                  value={editingQuestion.verificationStatus}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      verificationStatus: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white"
                >
                  <option value="draft">draft (Bản nháp)</option>
                  <option value="verified">verified (Đã xác minh)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lời giải chi tiết:
              </label>
              <textarea
                rows={2}
                value={editingQuestion.solution}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, solution: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách câu hỏi */}
      <div className="space-y-3">
        {questions.slice(0, 50).map((q) => (
          <div
            key={q.id}
            className="rounded-2xl bg-white p-4 md:p-5 border border-slate-200 shadow-sm space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-700">
                  {q.id} ({q.code})
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  Lớp {q.grade} • HK{q.semester} • {q.chapterId}
                </span>
                <CognitiveBadge level={q.cognitiveLevel} size="xs" />
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    q.verificationStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {q.verificationStatus === 'verified' ? '✓ VERIFIED' : '⏳ DRAFT'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(q)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ✏️ Sửa
                </button>
                {q.verificationStatus === 'draft' ? (
                  <button
                    type="button"
                    onClick={() => handleApproveQuestions([q.id], 'verified')}
                    className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    ✓ Duyệt sang Verified
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApproveQuestions([q.id], 'draft')}
                    className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900"
                  >
                    Chuyển về Draft
                  </button>
                )}
              </div>
            </div>

            {q.difficultyMismatchWarning && (
              <div className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800">
                ⚠️ {q.mismatchReason}
              </div>
            )}

            <div className="text-sm font-medium text-slate-900">
              <MathText text={q.content} block />
            </div>

            <div className="text-xs text-slate-600 flex flex-wrap gap-4">
              <span>
                <strong>Đáp án đúng:</strong> {q.correctAnswer}
              </span>
              <span>
                <strong>Lời giải:</strong> <MathText text={q.solution} />
              </span>
              {q.empiricalDifficulty !== null && (
                <span className="text-indigo-700 font-semibold">
                  Độ khó thực nghiệm: {q.empiricalDifficulty} ({q.attemptCount} lượt làm)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
