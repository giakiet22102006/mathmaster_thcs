'use client';

// ==============================================================================
// MathMaster THCS - Màn Hình Tạo Đề Theo Ma Trận 3 Bước (/exams/new)
// Có Bảng Xem Trước Ma Trận Trực Tiếp (have vs need) & Cảnh Báo Thiếu Câu Minh Bạch
// ==============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, COGNITIVE_META, CognitiveBadge } from '@/components/MathMasterShell';
import {
  COGNITIVE_LEVELS,
  CognitiveLevel,
  EXAM_MATRIX_PRESETS,
  ExamPresetKey,
  allocateQuotaLargestRemainder,
  resolveQuestionCognitiveLevel,
} from '@/lib/exam-matrix-presets';

export default function ExamBuilderWizardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any>(null);
  const [allVerifiedQuestions, setAllVerifiedQuestions] = useState<any[]>([]);

  // Cấu hình 3 bước của Wizard
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [grade, setGrade] = useState<number>(8);
  const [textbook, setTextbook] = useState<string>('KNTT');
  const [semester, setSemester] = useState<number>(1);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

  const [presetKey, setPresetKey] = useState<ExamPresetKey>('trung_binh');
  const [useCustomSliders, setUseCustomSliders] = useState<boolean>(false);
  const [customRatios, setCustomRatios] = useState<Record<CognitiveLevel, number>>({
    nhan_biet: 30,
    thong_hieu: 50,
    van_dung: 20,
    van_dung_cao: 0,
  });

  const [questionCount, setQuestionCount] = useState<number>(5);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [format, setFormat] = useState<'combined' | 'mcq' | 'essay'>('combined');
  const [allowBorrowAdjacent, setAllowBorrowAdjacent] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/state?scope=exam-builder');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data?.state) {
        const u = data.state.user;
        setUser(u);
        setGrade(Number(u?.currentGrade || 8));
        setTextbook(u?.preferredBook || 'KNTT');
        setCurriculum(data.state.curriculum);
        setAllVerifiedQuestions(
          (data.state.questions || []).filter((q: any) => q.verificationStatus === 'verified')
        );
      }
    }
    init();
  }, [router]);

  // Danh sách chương theo khối và học kỳ đang chọn
  const gradeChapters = useMemo(() => {
    const gObj = (curriculum?.grades || []).find((g: any) => Number(g.id) === Number(grade));
    const list = gObj?.chapters || [];
    if (semester === 1 || semester === 2) {
      return list.filter((c: any) => Number(c.semester) === Number(semester));
    }
    return list;
  }, [curriculum, grade, semester]);

  // Khi đổi khối hoặc học kỳ -> reset chương chọn
  function handleGradeChange(newGrade: number) {
    setGrade(newGrade);
    setSelectedChapters([]);
    setApiError(null);
  }

  function handleSemesterChange(newSem: number) {
    setSemester(newSem);
    setSelectedChapters([]);
    setApiError(null);
  }

  function toggleChapter(chId: string) {
    setSelectedChapters((prev) =>
      prev.includes(chId) ? prev.filter((id) => id !== chId) : [...prev, chId]
    );
    setApiError(null);
  }

  // Chọn preset hoặc thanh trượt tùy chỉnh
  function handleSelectPreset(key: ExamPresetKey) {
    setPresetKey(key);
    setUseCustomSliders(false);
    setCustomRatios({ ...EXAM_MATRIX_PRESETS[key].ratios });
    setApiError(null);
  }

  function handleSliderChange(changedLevel: CognitiveLevel, newVal: number) {
    const clamped = Math.max(0, Math.min(100, Math.round(newVal)));
    const otherLevels = COGNITIVE_LEVELS.filter((lv) => lv !== changedLevel);
    const currentOthersSum = otherLevels.reduce((acc, lv) => acc + customRatios[lv], 0);
    const targetOthersSum = 100 - clamped;

    const updated: Record<CognitiveLevel, number> = { ...customRatios, [changedLevel]: clamped };
    if (currentOthersSum === 0) {
      updated[otherLevels[0]] = targetOthersSum;
    } else {
      let rem = targetOthersSum;
      otherLevels.forEach((lv, idx) => {
        if (idx === otherLevels.length - 1) {
          updated[lv] = Math.max(0, rem);
        } else {
          const share = Math.round((customRatios[lv] / currentOthersSum) * targetOthersSum);
          updated[lv] = share;
          rem -= share;
        }
      });
    }
    setCustomRatios(updated);
    setUseCustomSliders(true);
    setApiError(null);
  }

  // Tính toán Bảng xem trước Ma trận trực tiếp (have vs need)
  const matrixPreview = useMemo(() => {
    const activeRatios = useCustomSliders ? customRatios : EXAM_MATRIX_PRESETS[presetKey].ratios;
    const needCounts = allocateQuotaLargestRemainder(questionCount, activeRatios);

    const filteredPool = allVerifiedQuestions.filter((q) => {
      if (Number(q.grade) !== Number(grade)) return false;
      if (textbook && textbook !== 'ALL' && Array.isArray(q.textbooks) && q.textbooks.length > 0) {
        if (!q.textbooks.includes(textbook)) return false;
      }
      if ((semester === 1 || semester === 2) && Number(q.semester) !== Number(semester)) {
        return false;
      }
      if (selectedChapters.length > 0 && !selectedChapters.includes(q.chapterId)) {
        return false;
      }
      if (format === 'mcq' && q.type !== 'mcq') return false;
      if (format === 'essay' && q.type !== 'essay') return false;
      return true;
    });

    const haveCounts: Record<CognitiveLevel, number> = {
      nhan_biet: 0,
      thong_hieu: 0,
      van_dung: 0,
      van_dung_cao: 0,
    };

    for (const q of filteredPool) {
      const lv = resolveQuestionCognitiveLevel(q);
      haveCounts[lv] += 1;
    }

    const rows = COGNITIVE_LEVELS.map((lv) => ({
      level: lv,
      ratio: activeRatios[lv],
      need: needCounts[lv],
      have: haveCounts[lv],
      missing: Math.max(0, needCounts[lv] - haveCounts[lv]),
    }));

    const hasShortage = rows.some((r) => r.missing > 0);
    return {
      activeRatios,
      rows,
      totalHave: filteredPool.length,
      hasShortage,
    };
  }, [
    allVerifiedQuestions,
    grade,
    textbook,
    semester,
    selectedChapters,
    format,
    questionCount,
    presetKey,
    useCustomSliders,
    customRatios,
  ]);

  async function handleGenerateExam() {
    setSubmitting(true);
    setApiError(null);
    try {
      const category =
        semester === 1 ? 'GIUA_KI_1' : semester === 2 ? 'GIUA_KI_2' : 'THI_VAO_10';
      const payload: any = {
        grade,
        textbook,
        semester,
        category,
        chapterIds: selectedChapters,
        difficulty: presetKey,
        ...(useCustomSliders ? { customMatrix: customRatios } : {}),
        format,
        questionCount,
        durationMinutes,
        allowBorrowAdjacent,
        customTitle: customTitle.trim() || undefined,
      };

      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || data.ok === false) {
        setApiError(data);
        return;
      }

      if (data.exam?.id) {
        router.push(`/exams/${data.exam.id}`);
      }
    } catch {
      setApiError({
        message: 'Không thể kết nối máy chủ khi tạo đề thi.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell
      user={user}
      title="Wizard Tạo Đề Kiểm Tra Theo Ma Trận Chuẩn"
      subtitle="Đảm bảo 100% câu hỏi đúng khối lớp, chương học và phân bổ đúng tỷ lệ 4 mức độ nhận thức (Thông tư 22/2021)"
    >
      {/* Thanh tiến trình 3 bước */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        {[
          { num: 1, title: 'Bước 1: Phạm vi kiến thức', desc: 'Lớp, Sách, Học kỳ & Chương' },
          { num: 2, title: 'Bước 2: Ma trận độ khó', desc: '4 mức nhận thức NB / TH / VD / VDC' },
          { num: 3, title: 'Bước 3: Xem trước & Tạo đề', desc: 'Kiểm tra kho câu hỏi & Bắt đầu' },
        ].map((item) => (
          <button
            key={item.num}
            type="button"
            onClick={() => setStep(item.num as 1 | 2 | 3)}
            className={`rounded-2xl border p-3 text-left transition ${
              step === item.num
                ? 'border-indigo-600 bg-indigo-50/80 shadow-sm'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="text-xs font-extrabold text-indigo-600">{item.title}</div>
            <div className="text-[11px] text-slate-500 hidden sm:block mt-0.5">{item.desc}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái (2/3): Nội dung cấu hình từng bước */}
        <div className="lg:col-span-2 space-y-5">
          {step === 1 && (
            <div className="rounded-2xl bg-white p-5 md:p-6 border border-slate-200 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900">
                1. Chọn Khối Lớp, Bộ Sách Giáo Khoa & Chương Học
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Khối lớp</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[6, 7, 8, 9].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleGradeChange(g)}
                        className={`rounded-xl py-2 text-xs font-bold border transition ${
                          grade === g
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Lớp {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Bộ sách</label>
                  <select
                    value={textbook}
                    onChange={(e) => setTextbook(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold bg-white"
                  >
                    <option value="KNTT">Kết nối tri thức (KNTT)</option>
                    <option value="CD">Cánh Diều (CD)</option>
                    <option value="CTST">Chân trời sáng tạo (CTST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phạm vi Học kỳ
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => handleSemesterChange(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold bg-white"
                  >
                    <option value={1}>Học kỳ 1</option>
                    <option value={2}>Học kỳ 2</option>
                    <option value={0}>Cả năm / Tổng hợp (Thi vào 10)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    Chọn một hoặc nhiều Chương (Mặc định không tick = Lấy đều toàn học kỳ)
                  </label>
                  {selectedChapters.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedChapters([])}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Chọn lại toàn học kỳ
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {gradeChapters.map((ch: any) => {
                    const checked = selectedChapters.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => toggleChapter(ch.id)}
                        className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                          checked
                            ? 'border-indigo-600 bg-indigo-50/70'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          readOnly
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{ch.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Mã: {ch.id} • Học kỳ {ch.semester}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700"
                >
                  Tiếp tục sang Bước 2: Chọn Ma trận Độ khó →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-2xl bg-white p-5 md:p-6 border border-slate-200 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900">
                2. Chọn Cấu Trúc Ma Trận Độ Khó (4 Mức Nhận Thức)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(EXAM_MATRIX_PRESETS) as ExamPresetKey[]).map((key) => {
                  const p = EXAM_MATRIX_PRESETS[key];
                  const active = !useCustomSliders && presetKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectPreset(key)}
                      className={`rounded-xl border p-3.5 text-left transition ${
                        active
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-200'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-sm font-bold text-slate-900">{p.label}</div>
                      <div className="text-xs text-slate-600 mt-1">{p.description}</div>
                    </button>
                  );
                })}
              </div>

              {/* Thanh kéo tùy chỉnh 4 mức độ nhận thức */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    🎚️ Tùy chỉnh tỷ lệ phần trăm từng mức độ (Tổng luôn = 100%)
                  </span>
                  {useCustomSliders && (
                    <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                      Đang dùng Ma trận Tùy chỉnh
                    </span>
                  )}
                </div>

                {COGNITIVE_LEVELS.map((lv) => (
                  <div key={lv} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <CognitiveBadge level={lv} size="xs" />
                      <span className="font-bold text-slate-800">
                        {matrixPreview.activeRatios[lv]}% (
                        {matrixPreview.rows.find((r) => r.level === lv)?.need || 0} câu)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={matrixPreview.activeRatios[lv]}
                      onChange={(e) => handleSliderChange(lv, Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  ← Quay lại Bước 1
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700"
                >
                  Tiếp tục sang Bước 3: Hoàn tất & Tạo đề →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="rounded-2xl bg-white p-5 md:p-6 border border-slate-200 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900">
                3. Cấu Hình Số Lượng Câu, Thời Gian & Hình Thức Thi
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tổng số câu hỏi
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={questionCount}
                    onChange={(e) => {
                      setQuestionCount(Math.max(1, Number(e.target.value)));
                      setApiError(null);
                    }}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời gian làm bài (phút)
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value={15}>15 phút (Kiểm tra nhanh)</option>
                    <option value={30}>30 phút (Chuyên đề)</option>
                    <option value={45}>45 phút (1 tiết chuẩn)</option>
                    <option value={60}>60 phút (Giữa kỳ)</option>
                    <option value={90}>90 phút (Cuối kỳ / Thi vào 10)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hình thức đề thi
                  </label>
                  <select
                    value={format}
                    onChange={(e) => {
                      setFormat(e.target.value as any);
                      setApiError(null);
                    }}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="combined">Kết hợp (70% TN + 30% TL)</option>
                    <option value="mcq">100% Trắc nghiệm</option>
                    <option value="essay">100% Tự luận</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên đề thi tùy chỉnh (Có thể để trống để hệ thống tự đặt tên)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={`Đề Kiểm Tra Toán ${grade} (${textbook})`}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                />
              </div>

              <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowBorrowAdjacent}
                  onChange={(e) => {
                    setAllowBorrowAdjacent(e.target.checked);
                    setApiError(null);
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                <div className="text-xs text-slate-700">
                  <strong>Cho phép mượn từ mức độ kề cận ngay sát</strong> nếu một mức nhận thức bị thiếu câu hỏi đã duyệt (sẽ hiển thị ghi chú rõ ràng trên đề thi, tuyệt đối không lấy câu khác chương/khác lớp).
                </div>
              </label>

              {apiError && (
                <div
                  role="alert"
                  className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900 space-y-2"
                >
                  <div className="font-bold text-sm text-rose-800">
                    ❌ Không thể tạo đề ({apiError.code || 'LỖI CẤU HÌNH'}): {apiError.message || apiError.error}
                  </div>
                  {apiError.shortage && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {COGNITIVE_LEVELS.map((lv) => {
                        const s = apiError.shortage[lv];
                        if (!s) return null;
                        return (
                          <div
                            key={lv}
                            className={`rounded-lg border p-2 ${
                              s.missing > 0
                                ? 'border-rose-400 bg-rose-100/80 font-bold'
                                : 'border-emerald-200 bg-white'
                            }`}
                          >
                            <div>{COGNITIVE_META[lv].label}</div>
                            <div>
                              Cần: {s.need} | Có: {s.have}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {Array.isArray(apiError.suggestions) && (
                    <ul className="list-disc pl-5 space-y-1 text-rose-800">
                      {apiError.suggestions.map((sug: string, i: number) => (
                        <li key={i}>{sug}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  ← Quay lại Bước 2
                </button>
                <button
                  type="button"
                  onClick={handleGenerateExam}
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-60 transition"
                >
                  {submitting ? 'Đang sinh đề theo ma trận...' : '🚀 Tạo đề & Bắt đầu làm bài'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cột phải (1/3): Bảng Xem Trước Ma Trận Đề Trực Tiếp (Live Matrix Preview) */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm h-fit space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              📋 Xem Trước Ma Trận Đề Trực Tiếp
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đối chiếu số câu cần lấy (Need) với số câu đã xác minh hiện có (Have)
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1 border border-slate-200/80">
            <div className="flex justify-between">
              <span className="text-slate-500">Khối / Bộ sách:</span>
              <span className="font-bold text-slate-800">
                Lớp {grade} • {textbook}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phạm vi:</span>
              <span className="font-bold text-slate-800">
                {semester === 0 ? 'Cả năm' : `Học kỳ ${semester}`} (
                {selectedChapters.length === 0
                  ? 'Tất cả chương'
                  : selectedChapters.join(', ')}
                )
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tổng số câu yêu cầu:</span>
              <span className="font-bold text-indigo-600">{questionCount} câu</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {matrixPreview.rows.map((row) => {
              const isShort = row.missing > 0;
              return (
                <div
                  key={row.level}
                  className={`rounded-xl border p-3 text-xs ${
                    isShort
                      ? 'border-rose-300 bg-rose-50/80'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <CognitiveBadge level={row.level} size="xs" />
                    <span className="font-bold text-slate-700">{row.ratio}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span>
                      Cần lấy: <strong className="text-slate-900">{row.need} câu</strong>
                    </span>
                    <span
                      className={`font-semibold ${
                        isShort ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      Kho verified: {row.have} câu {isShort ? `(Thiếu ${row.missing})` : '✓'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {matrixPreview.hasShortage ? (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-3 text-xs text-indigo-900 space-y-1">
              <div className="font-bold flex items-center gap-1 text-indigo-800">
                <span>⚡</span> Tự động bù đắp bằng Parametric Engine
              </div>
              <p>
                Kho câu hỏi tĩnh hiện có ít hơn chỉ tiêu, nhưng <strong>Parametric Question Engine</strong> sẽ tự động sinh và thẩm định tức thì các câu hỏi chuẩn SGK {textbook} bù đắp đủ 100% ma trận đề của bạn.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
              ✅ Ngân hàng câu hỏi đã xác minh đáp ứng đủ 100% ma trận độ khó này!
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
