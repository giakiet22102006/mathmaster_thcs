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

  // Trạng thái modal sinh câu hỏi tự động (Parametric Engine)
  const [showGenModal, setShowGenModal] = useState<boolean>(false);
  const [genGrade, setGenGrade] = useState<number>(8);
  const [genTextbook, setGenTextbook] = useState<string>('KNTT');
  const [genDifficulty, setGenDifficulty] = useState<string>('ALL');
  const [genCog, setGenCog] = useState<string>('ALL');
  const [genType, setGenType] = useState<string>('ALL');
  const [genCount, setGenCount] = useState<number>(5);
  const [genPreviewQuestions, setGenPreviewQuestions] = useState<any[]>([]);
  const [genLoading, setGenLoading] = useState<boolean>(false);
  const [genSuccessMsg, setGenSuccessMsg] = useState<string>('');

  async function handleGenerateParametric(saveToBank: boolean) {
    setGenLoading(true);
    setGenSuccessMsg('');
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_parametric',
          grade: genGrade,
          textbook: genTextbook,
          difficulty: genDifficulty,
          cognitiveLevel: genCog,
          type: genType,
          count: genCount,
          saveToBank,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setGenPreviewQuestions(data.questions || []);
        if (saveToBank) {
          setGenSuccessMsg(
            `✅ Đã sinh và lưu thành công ${data.generatedCount} câu hỏi verified vào ngân hàng!`
          );
          loadQuestions();
        } else {
          setGenSuccessMsg(
            `⚡ Đã sinh xem trước ${data.generatedCount} câu hỏi từ Parametric Engine (chưa lưu).`
          );
        }
      } else {
        alert(data.error || 'Lỗi khi sinh câu hỏi.');
      }
    } finally {
      setGenLoading(false);
    }
  }

  async function loadQuestions() {
    setLoading(true);
    try {
      const stateRes = await fetch('/api/state?scope=shell');
      if (stateRes.status === 401) {
        router.push('/login');
        return;
      }
      const stateData = await stateRes.json();
      const currentUser = stateData?.state?.user;
      if (currentUser?.role === 'ADMIN') {
        router.replace('/admin/students');
        return;
      }
      setUser(currentUser);

      if (currentUser?.role !== 'TEACHER') {
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
            onClick={() => {
              setGenSuccessMsg('');
              setShowGenModal(true);
            }}
            className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700 flex items-center gap-1.5 transition"
          >
            <span>⚡</span> Sinh câu hỏi tự động (Engine)
          </button>
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

      {/* Thông tin Parametric Question Engine */}
      <div className="mb-6 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-xs text-white">⚡</span>
            <span className="text-sm font-bold text-indigo-950">
              Parametric Question Engine: 276 Templates Tham Số Hóa
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
              Phủ 100% 4 Khối Lớp
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Hỗ trợ 3 bộ SGK (Kết nối tri thức, Cánh diều, Chân trời sáng tạo) • Độc lập kiểm định KaTeX & số học
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-700 border border-indigo-100 shadow-2xs">
            Lớp 6: 72 templates (6 chương)
          </span>
          <span className="rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-700 border border-indigo-100 shadow-2xs">
            Lớp 7: 72 templates (6 chương)
          </span>
          <span className="rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-700 border border-indigo-100 shadow-2xs">
            Lớp 8: 60 templates (5 chương)
          </span>
          <span className="rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-700 border border-indigo-100 shadow-2xs">
            Lớp 9: 72 templates (6 chương)
          </span>
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
      {/* Modal Sinh câu hỏi tự động (Parametric Engine) */}
      {showGenModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">⚡</span>
                <h3 className="text-base font-bold text-slate-900">
                  Sinh Câu Hỏi Tham Số Hóa Tự Động (Parametric Engine)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGenModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 my-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Khối Lớp</label>
                <select
                  value={genGrade}
                  onChange={(e) => setGenGrade(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold"
                >
                  <option value={6}>Lớp 6</option>
                  <option value={7}>Lớp 7</option>
                  <option value={8}>Lớp 8</option>
                  <option value={9}>Lớp 9</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Bộ Sách</label>
                <select
                  value={genTextbook}
                  onChange={(e) => setGenTextbook(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold"
                >
                  <option value="ALL">Tất cả bộ sách</option>
                  <option value="KNTT">Kết nối tri thức</option>
                  <option value="CD">Cánh diều</option>
                  <option value="CTST">Chân trời sáng tạo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Độ Khó</label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold"
                >
                  <option value="ALL">Tất cả mức độ</option>
                  <option value="easy">Dễ (Nhận biết)</option>
                  <option value="medium">Trung bình (Thông hiểu)</option>
                  <option value="hard">Khó (Vận dụng / VDC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Hình Thức</label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold"
                >
                  <option value="ALL">Tất cả hình thức</option>
                  <option value="mcq">Trắc nghiệm (MCQ)</option>
                  <option value="essay">Tự luận (Essay)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Số Lượng</label>
                <select
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold"
                >
                  <option value={1}>1 câu</option>
                  <option value={3}>3 câu</option>
                  <option value={5}>5 câu</option>
                  <option value={10}>10 câu</option>
                  <option value={20}>20 câu</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleGenerateParametric(false)}
                disabled={genLoading}
                className="rounded-xl border border-indigo-600 bg-white px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 disabled:opacity-60 transition"
              >
                {genLoading ? 'Đang tạo...' : '👁️ Xem Trước & Kiểm Định (Preview)'}
              </button>
              <button
                type="button"
                onClick={() => handleGenerateParametric(true)}
                disabled={genLoading}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60 shadow transition"
              >
                {genLoading ? 'Đang xử lý...' : '💾 Lưu Vào Ngân Hàng Chính Thức (Verified)'}
              </button>
            </div>

            {genSuccessMsg && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                {genSuccessMsg}
              </div>
            )}

            {/* Danh sách câu hỏi xem trước */}
            {genPreviewQuestions.length > 0 && (
              <div className="mt-4 space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Danh Sách Câu Hỏi Vừa Sinh ({genPreviewQuestions.length} câu)
                  </h4>
                  <span className="text-[11px] text-emerald-700 font-bold">
                    ✓ 100% Đã Thẩm Định KaTeX & Số Học
                  </span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {genPreviewQuestions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">{q.id}</span>
                          <span className="rounded bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-800 text-[11px]">
                            Lớp {q.grade} • {q.chapterId}
                          </span>
                          <CognitiveBadge level={q.cognitiveLevel} size="xs" />
                          <span className="rounded bg-slate-200 px-2 py-0.5 font-semibold text-slate-700 text-[11px]">
                            {q.type === 'mcq' ? 'Trắc nghiệm' : 'Tự luận'}
                          </span>
                        </div>
                        <span className="text-slate-500">{q.textbooks?.join(', ')}</span>
                      </div>

                      <div className="text-sm font-medium text-slate-900 bg-white p-3 rounded-xl border border-slate-100">
                        <MathText text={q.content} block />
                      </div>

                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt: any, oIdx: number) => {
                            const isCorrect = opt.text === q.correctAnswer;
                            return (
                              <div
                                key={oIdx}
                                className={`rounded-lg border p-2 ${
                                  isCorrect
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold'
                                    : 'border-slate-200 bg-white text-slate-700'
                                }`}
                              >
                                <span className="font-bold mr-1.5">{opt.label || String.fromCharCode(65 + oIdx)}.</span>
                                <MathText text={opt.text} />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="rounded-xl bg-white p-2.5 border border-slate-100 text-slate-600 space-y-1">
                        <div>
                          <strong>Đáp án:</strong> {q.correctAnswer}
                        </div>
                        <div>
                          <strong>Lời giải chi tiết:</strong> <MathText text={q.solution} />
                        </div>
                        {q.keyFormula && (
                          <div className="text-indigo-700">
                            <strong>Công thức:</strong> <MathText text={q.keyFormula} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
