'use client';

// ==============================================================================
// MathMaster THCS - Màn Hình Tạo Đề Theo Ma Trận 3 Bước (/exams/new)
// Hỗ trợ chọn Nguồn Đề: Ngân hàng chuẩn / Từ file tài liệu (B-1/B-2) / Kết hợp
// Có Bảng Xem Trước Ma Trận Trực Tiếp (have vs need) & Cảnh Báo Thiếu Câu Minh Bạch
// ==============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, COGNITIVE_META, CognitiveBadge, MathText } from '@/components/MathMasterShell';
import {
  COGNITIVE_LEVELS,
  CognitiveLevel,
  EXAM_MATRIX_PRESETS,
  ExamPresetKey,
  allocateQuotaLargestRemainder,
  resolveQuestionCognitiveLevel,
} from '@/lib/exam-matrix-presets';

export type ExamSourceMode = 'BANK' | 'DOCS_REUSE' | 'DOCS_SIMILAR' | 'MIXED';

export default function ExamBuilderWizardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any>(null);
  const [allVerifiedQuestions, setAllVerifiedQuestions] = useState<any[]>([]);

  // Cấu hình Nguồn Đề (Mục B.1 & B.5)
  const [sourceMode, setSourceMode] = useState<ExamSourceMode>('BANK');
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Màn hình duyệt / chỉnh sửa câu hỏi của tài liệu (Review Modal)
  const [reviewingDoc, setReviewingDoc] = useState<any | null>(null);
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [savingReview, setSavingReview] = useState<boolean>(false);

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

  // Chế độ tạo đề chính (AI_GEMINI, MATRIX, DOCUMENTS)
  const [creationMode, setCreationMode] = useState<'AI_GEMINI' | 'MATRIX' | 'DOCUMENTS'>('AI_GEMINI');
  const [aiQuota, setAiQuota] = useState<{
    usedToday: number;
    maxDaily: number;
    remaining: number;
    cooldownSeconds: number;
  } | null>(null);

  // Trạng thái Sinh câu hỏi / Tạo đề bằng AI Gemini
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiLevel, setAiLevel] = useState<CognitiveLevel>('van_dung');
  const [aiType, setAiType] = useState<'mcq' | 'essay'>('mcq');
  const [aiCount, setAiCount] = useState<number>(5);
  const [aiDurationMinutes, setAiDurationMinutes] = useState<number>(45);
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);
  const [aiCreatedExam, setAiCreatedExam] = useState<any | null>(null);
  const [aiFeedbackMessage, setAiFeedbackMessage] = useState<string | null>(null);

  async function loadAiQuota() {
    try {
      const res = await fetch('/api/ai/generate-question');
      if (res.ok) {
        const data = await res.json();
        if (data.quota) setAiQuota(data.quota);
      }
    } catch {}
  }

  async function handleCreateFullAIExam() {
    setAiGenerating(true);
    setAiSuccessMsg(null);
    setAiErrorMsg(null);
    setAiCreatedExam(null);
    setAiFeedbackMessage(null);
    try {
      const res = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          textbook: textbook === 'ALL' ? 'KNTT' : textbook,
          semester,
          chapterId: selectedChapters[0] || `G${grade}_C1`,
          topic: aiPrompt.trim() || undefined,
          customPrompt: aiPrompt.trim() || undefined,
          cognitiveLevel: aiLevel,
          type: aiType,
          count: aiCount,
          durationMinutes: aiDurationMinutes,
          createFullExam: true,
          saveToBank: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAiErrorMsg(data.error || data.message || 'Không thể tạo đề thi bằng AI.');
        if (data.quota) setAiQuota(data.quota);
      } else {
        if (data.quota) setAiQuota(data.quota);
        if (data.exam) {
          setAiCreatedExam(data.exam);
        }
        if (data.servedFromCache) {
          setAiFeedbackMessage(
            '⚡ Đã lấy câu hỏi từ Database (Chủ đề trùng khớp đã được AI biên soạn trước đó). Không trừ hạn mức tạo đề hôm nay của bạn!'
          );
        } else {
          setAiSuccessMsg(data.message || `🎉 Đã tạo thành công đề thi bằng AI Gemini!`);
        }
        if (Array.isArray(data.questions)) {
          setAllVerifiedQuestions((prev) => [...data.questions, ...prev]);
        }
      }
    } catch {
      setAiErrorMsg('Lỗi kết nối khi gửi yêu cầu đến Gemini AI.');
    } finally {
      setAiGenerating(false);
    }
  }

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

      // Tải danh sách tài liệu cá nhân của người dùng
      try {
        const docRes = await fetch('/api/documents');
        if (docRes.ok) {
          const docData = await docRes.json();
          if (Array.isArray(docData.documents)) {
            setUserDocuments(docData.documents);
          }
        }
      } catch {
        // Fallback im lặng nếu chưa tải được docs
      }

      await loadAiQuota();
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

  function toggleDocumentSelection(docId: string) {
    setSelectedDocumentIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
    setApiError(null);
  }

  // Xử lý tải lên file mới trực tiếp từ wizard
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    setUploadNotice(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('grade', String(grade));
    formData.append('textbook', textbook);
    formData.append('semester', String(semester));
    if (selectedChapters.length > 0) {
      formData.append('chapterId', selectedChapters[0]);
    }

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || data.ok === false) {
        setUploadError(
          data.message || data.error || 'Không thể trích xuất tài liệu. Vui lòng kiểm tra lại file.'
        );
        return;
      }

      if (data.document) {
        setUserDocuments((prev) => [data.document, ...prev.filter((d) => d.id !== data.document.id)]);
        setSelectedDocumentIds((prev) => [...prev, data.document.id]);
        setUploadNotice(
          `✓ Đã trích xuất ${data.extractedQuestionsCount || 0} câu hỏi từ "${file.name}".`
        );
      }
    } catch {
      setUploadError('Lỗi kết nối máy chủ khi tải lên tài liệu.');
    } finally {
      setIsUploadingDoc(false);
      e.target.value = '';
    }
  }

  // Mở màn hình duyệt câu hỏi tài liệu
  function openDocReview(doc: any) {
    setReviewingDoc(doc);
    setReviewItems(doc.items ? JSON.parse(JSON.stringify(doc.items)) : []);
  }

  // Lưu chỉnh sửa câu hỏi của tài liệu
  async function handleSaveReviewItems() {
    if (!reviewingDoc) return;
    setSavingReview(true);
    try {
      const res = await fetch(`/api/documents/${reviewingDoc.id}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reviewItems }),
      });
      const data = await res.json();
      if (data.ok && data.document) {
        setUserDocuments((prev) =>
          prev.map((d) => (d.id === data.document.id ? data.document : d))
        );
        setReviewingDoc(null);
      }
    } catch {
      // Báo lỗi nếu cần
    } finally {
      setSavingReview(false);
    }
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

    // Lọc theo Nguồn Đề: Ngân hàng chuẩn, Tài liệu, hoặc Kết hợp
    const filteredPool = allVerifiedQuestions.filter((q) => {
      if (Number(q.grade) !== Number(grade)) return false;

      if (sourceMode === 'DOCS_REUSE') {
        if (!q.sourceDocId) return false;
        if (selectedDocumentIds.length > 0 && !selectedDocumentIds.includes(q.sourceDocId)) {
          return false;
        }
      } else if (sourceMode === 'BANK') {
        if (q.sourceDocId) return false;
      } else if (sourceMode === 'MIXED') {
        if (q.sourceDocId && selectedDocumentIds.length > 0 && !selectedDocumentIds.includes(q.sourceDocId)) {
          return false;
        }
      }

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
    sourceMode,
    selectedDocumentIds,
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
        sourceMode,
        documentIds: selectedDocumentIds,
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
      title="Tạo Đề Kiểm Tra & Thi Thử Toán THCS"
      subtitle="Hỗ trợ Tạo đề bằng AI Gemini 3.8, Ma trận chuẩn GDPT 2018 và Trích xuất tự động từ File đề cương"
    >
      {/* 3 Tab Lựa Chọn Chế Độ Tạo Đề Rõ Ràng & Bắt Mắt */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => {
            setCreationMode('AI_GEMINI');
            setApiError(null);
          }}
          className={`flex items-center gap-3.5 rounded-2xl p-4 text-left border transition-all ${
            creationMode === 'AI_GEMINI'
              ? 'border-indigo-600 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-lg ring-2 ring-indigo-300'
              : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold ${
              creationMode === 'AI_GEMINI' ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm">Tạo Đề Bằng AI Gemini</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  creationMode === 'AI_GEMINI' ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                Khuyên dùng
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${creationMode === 'AI_GEMINI' ? 'text-indigo-100' : 'text-slate-500'}`}>
              Nhập chủ đề/prompt tự do, AI biên soạn tức thì
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setCreationMode('MATRIX');
            setSourceMode('BANK');
            setApiError(null);
          }}
          className={`flex items-center gap-3.5 rounded-2xl p-4 text-left border transition-all ${
            creationMode === 'MATRIX'
              ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-300'
              : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold ${
              creationMode === 'MATRIX' ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            🎯
          </div>
          <div>
            <span className="font-extrabold text-sm">Ma Trận Chuẩn GDPT 2018</span>
            <p className={`text-xs mt-0.5 ${creationMode === 'MATRIX' ? 'text-indigo-100' : 'text-slate-500'}`}>
              Theo tỷ lệ NB / TH / VD / VDC từ ngân hàng câu hỏi
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setCreationMode('DOCUMENTS');
            setSourceMode('DOCS_REUSE');
            setApiError(null);
          }}
          className={`flex items-center gap-3.5 rounded-2xl p-4 text-left border transition-all ${
            creationMode === 'DOCUMENTS'
              ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-300'
              : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold ${
              creationMode === 'DOCUMENTS' ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            📁
          </div>
          <div>
            <span className="font-extrabold text-sm">Tạo Đề Từ File Tải Lên</span>
            <p className={`text-xs mt-0.5 ${creationMode === 'DOCUMENTS' ? 'text-indigo-100' : 'text-slate-500'}`}>
              Trích xuất DOCX, PDF, XLSX, TXT thành đề thi
            </p>
          </div>
        </button>
      </div>

      {creationMode === 'AI_GEMINI' ? (
        <div className="space-y-6">
          {/* Hero Banner Thông Báo Hạn Mức & Lợi Ích Cache */}
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-6 md:p-8 text-white shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-700/60 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-indigo-100 backdrop-blur-md">
                    Gemini 3.8 Flash • GDPT 2018
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                    ⚡ Auto-Cache Token Saver
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  Tạo Đề Thi Trí Tuệ Nhân Tạo Thông Minh
                </h2>
                <p className="text-xs md:text-sm text-indigo-200 max-w-2xl leading-relaxed">
                  Nhập chủ đề hoặc prompt tuỳ biến, AI sẽ tự động thiết kế câu hỏi, giải chi tiết từng bước, kiểm tra cú pháp KaTeX và thẩm định qua verifyQuestion trước khi giao đề.
                </p>
              </div>

              {/* Thẻ hiển thị Hạn mức hôm nay của User */}
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 min-w-[240px]">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-200 mb-1.5">
                  <span>Hạn mức tạo đề hôm nay:</span>
                  <span className="font-black text-white text-sm">
                    {aiQuota ? `${aiQuota.remaining}/${aiQuota.maxDaily}` : '5/5'} đề
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-black/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all"
                    style={{
                      width: `${((aiQuota?.remaining ?? 5) / (aiQuota?.maxDaily ?? 5)) * 100}%`,
                    }}
                  />
                </div>
                <div className="mt-2 text-[11px] text-indigo-200 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Đề trùng chủ đề được lấy từ Cache <b>hoàn toàn miễn phí</b></span>
                </div>
              </div>
            </div>

            {/* Form Thiết Lập Đề Thi AI */}
            <div className="space-y-5">
              {/* Chọn Khối Lớp */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">
                  1. Chọn Khối Lớp & Bộ Sách
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg mb-3">
                  {[6, 7, 8, 9].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleGradeChange(g)}
                      className={`rounded-xl py-2.5 text-xs font-black border transition ${
                        grade === g
                          ? 'bg-white text-indigo-900 border-white shadow-md'
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                      }`}
                    >
                      Lớp {g}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-bold text-indigo-200 mb-1.5">Bộ sách giáo khoa</label>
                    <select
                      value={textbook}
                      onChange={(e) => setTextbook(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-slate-900/80 px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none"
                    >
                      <option value="KNTT">Kết nối tri thức (KNTT)</option>
                      <option value="CD">Cánh Diều (CD)</option>
                      <option value="CTST">Chân trời sáng tạo (CTST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-indigo-200 mb-1.5">Phạm vi kiến thức</label>
                    <select
                      value={semester}
                      onChange={(e) => handleSemesterChange(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/20 bg-slate-900/80 px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none"
                    >
                      <option value={1}>Học kỳ 1</option>
                      <option value={2}>Học kỳ 2</option>
                      <option value={0}>Cả năm / Tổng hợp (Ôn thi vào 10)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ô Nhập Prompt & Chủ Đề Cụ Thể */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-200">
                  2. Chủ đề hoặc Yêu cầu đề thi (Prompt tuỳ biến)
                </label>
                <textarea
                  rows={2}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ví dụ: Đề kiểm tra 45 phút về Định lý Pythagore và các bài toán thực tế; hoặc 5 câu phân thức đại số..."
                  className="w-full rounded-2xl border border-white/20 bg-slate-900/80 p-4 text-xs md:text-sm text-white placeholder-indigo-300/60 focus:border-indigo-400 focus:outline-none"
                />

                {/* Gợi Ý Nhanh Một Chạm */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-indigo-300 font-semibold mr-1">Gợi ý nhanh:</span>
                  {[
                    `Toán ${grade} - Bài toán thực tế chuyển động & năng suất`,
                    `Toán ${grade} - Định lý & Chứng minh hình học`,
                    `Toán ${grade} - Rút gọn biểu thức đại số & tìm x`,
                    `Toán ${grade} - Cực trị & Bất đẳng thức nâng cao`,
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAiPrompt(chip)}
                      className="rounded-full bg-white/10 hover:bg-white/25 px-3 py-1 text-[11px] text-indigo-100 transition border border-white/10"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mức độ nhận thức, Hình thức, Số câu & Thời gian */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1.5">Mức độ nhận thức</label>
                  <select
                    value={aiLevel}
                    onChange={(e) => setAiLevel(e.target.value as CognitiveLevel)}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value="thong_hieu">Thông hiểu (TH)</option>
                    <option value="nhan_biet">Nhận biết (NB)</option>
                    <option value="van_dung">Vận dụng (VD)</option>
                    <option value="van_dung_cao">Vận dụng cao (VDC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1.5">Hình thức câu hỏi</label>
                  <select
                    value={aiType}
                    onChange={(e) => setAiType(e.target.value as 'mcq' | 'essay')}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value="mcq">Trắc nghiệm 4 lựa chọn</option>
                    <option value="essay">Tự luận giải chi tiết</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1.5">Số lượng câu</label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value={3}>3 câu</option>
                    <option value={5}>5 câu</option>
                    <option value={10}>10 câu</option>
                    <option value={15}>15 câu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1.5">Thời gian làm bài</label>
                  <select
                    value={aiDurationMinutes}
                    onChange={(e) => setAiDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value={15}>15 phút</option>
                    <option value={45}>45 phút</option>
                    <option value={60}>60 phút</option>
                    <option value={90}>90 phút</option>
                  </select>
                </div>
              </div>

              {/* Thông báo lỗi / thành công */}
              {aiFeedbackMessage && (
                <div className="rounded-2xl border border-emerald-400 bg-emerald-950/80 p-4 text-xs text-emerald-200 font-semibold shadow-inner">
                  {aiFeedbackMessage}
                </div>
              )}

              {aiSuccessMsg && (
                <div className="rounded-2xl border border-emerald-400 bg-emerald-950/80 p-4 text-xs text-emerald-200 font-semibold shadow-inner">
                  {aiSuccessMsg}
                </div>
              )}

              {aiErrorMsg && (
                <div className="rounded-2xl border border-rose-400 bg-rose-950/80 p-4 text-xs text-rose-200 shadow-inner">
                  ⚠️ {aiErrorMsg}
                </div>
              )}

              {/* Nút Hành Động Lớn */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-indigo-700/60">
                <div className="text-xs text-indigo-200">
                  {aiQuota && aiQuota.cooldownSeconds > 0 ? (
                    <span className="text-amber-300 font-bold">
                      ⏳ Giãn cách an toàn: vui lòng đợi {aiQuota.cooldownSeconds}s nữa.
                    </span>
                  ) : (
                    <span>Nhấn nút bên dưới để AI bắt đầu tạo đề và lưu vào kho đề của bạn.</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {aiCreatedExam && (
                    <button
                      type="button"
                      onClick={() => router.push(`/exams/${aiCreatedExam.id}`)}
                      className="rounded-2xl bg-emerald-400 px-6 py-3.5 text-xs font-black text-slate-950 shadow-lg hover:bg-emerald-300 transition transform hover:-translate-y-0.5"
                    >
                      👉 Vào Làm Bài Thi Ngay ({aiCreatedExam.title})
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCreateFullAIExam}
                    disabled={
                      aiGenerating ||
                      (aiQuota !== null && aiQuota.remaining <= 0) ||
                      (aiQuota !== null && aiQuota.cooldownSeconds > 0)
                    }
                    className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs font-black text-indigo-950 shadow-xl hover:bg-indigo-50 disabled:opacity-50 transition transform hover:-translate-y-0.5"
                  >
                    {aiGenerating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-950 border-t-transparent" />
                        <span>AI đang biên soạn, kiểm tra KaTeX & thẩm định...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Tạo Đề Thi Bằng AI & Vào Làm Bài Ngay</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Thanh tiến trình 3 bước cho Ma Trận / Tài Liệu */}
          <div className="mb-6 grid grid-cols-3 gap-2">
            {[
              { num: 1, title: 'Bước 1: Phạm vi & Nguồn đề', desc: 'Sách, Chương & Tài liệu cá nhân' },
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
                1. Chọn Khối Lớp, Bộ Sách Giáo Khoa & Nguồn Học Liệu
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

              {/* NGUỒN HỌC LIỆU (Phần B.5) */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
                <div className="text-xs font-bold text-indigo-900 flex items-center justify-between">
                  <span>📂 Nguồn câu hỏi sinh đề</span>
                  <span className="text-[11px] font-normal text-indigo-700">
                    Hỗ trợ DOCX, PDF, XLSX, TXT và Ảnh
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  {[
                    { mode: 'BANK', label: 'Ngân hàng chuẩn', desc: '100% câu chuẩn GDPT 2018' },
                    { mode: 'DOCS_REUSE', label: 'Dùng lại từ file (B-1)', desc: 'Lấy đúng câu trong file của bạn' },
                    { mode: 'DOCS_SIMILAR', label: 'Sinh đề MỚI từ file (B-2)', desc: 'Sinh câu cùng dạng theo chuẩn độ khó' },
                    { mode: 'MIXED', label: 'Kết hợp cả hai', desc: 'Ưu tiên câu từ file + bù ngân hàng' },
                  ].map((m) => {
                    const active = sourceMode === m.mode;
                    return (
                      <button
                        key={m.mode}
                        type="button"
                        onClick={() => {
                          setSourceMode(m.mode as ExamSourceMode);
                          setApiError(null);
                        }}
                        className={`rounded-xl border p-2.5 text-left transition ${
                          active
                            ? 'border-indigo-600 bg-white ring-2 ring-indigo-300 shadow-sm'
                            : 'border-slate-200 bg-white/70 hover:bg-white'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900">{m.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{m.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {sourceMode !== 'BANK' && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Chọn tài liệu áp dụng ({selectedDocumentIds.length} đã chọn):
                      </span>
                      <label className="cursor-pointer rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-700 transition">
                        {isUploadingDoc ? 'Đang trích xuất...' : '+ Tải tệp mới lên'}
                        <input
                          type="file"
                          accept=".txt,.md,.csv,.json,.docx,.xlsx,.xls,.pdf,.png,.jpg,.jpeg"
                          onChange={handleFileUpload}
                          disabled={isUploadingDoc}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {uploadNotice && (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-800">
                        {uploadNotice}
                      </div>
                    )}
                    {uploadError && (
                      <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-xs text-rose-800">
                        ⚠️ {uploadError}
                      </div>
                    )}

                    {userDocuments.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-500 border border-dashed rounded-xl">
                        Bạn chưa có tài liệu nào. Hãy nhấn <strong>+ Tải tệp mới lên</strong> (TXT, DOCX, XLSX, PDF...) để hệ thống tự động bóc tách.
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {userDocuments.map((doc) => {
                          const isChecked = selectedDocumentIds.includes(doc.id);
                          return (
                            <div
                              key={doc.id}
                              className={`flex items-center justify-between rounded-lg border p-2 text-xs transition ${
                                isChecked
                                  ? 'border-indigo-500 bg-indigo-50/60'
                                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                              }`}
                            >
                              <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleDocumentSelection(doc.id)}
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                />
                                <span className="font-semibold text-slate-900 truncate">
                                  {doc.fileName}
                                </span>
                                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">
                                  {doc.fileType}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  • {doc.extractedQuestionsCount || 0} câu
                                </span>
                              </label>

                              <button
                                type="button"
                                onClick={() => openDocReview(doc)}
                                className="ml-2 text-xs text-indigo-600 hover:underline font-semibold"
                              >
                                Xem & duyệt ({doc.needsReviewCount ? `⚠️ ${doc.needsReviewCount}` : '✓'})
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
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
                2. Chọn Cấu Trúc Ma Trận Độ Khó (4 Mức Nhận Thức GDPT 2018)
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
                  placeholder={`Đề Kiểm Tra Toán ${grade} (${textbook}) - ${sourceMode !== 'BANK' ? 'Từ tài liệu' : 'Chuẩn'}`}
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
                  <strong>Cho phép mượn từ mức độ kề cận</strong> nếu một mức nhận thức bị thiếu câu hỏi đã duyệt (chỉ mượn lên mức khó hơn, tuyệt đối không mượn xuống).
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
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm h-fit space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              📋 Xem Trước Ma Trận Đề Trực Tiếp
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đối chiếu số câu cần lấy (Need) với số câu hiện có (Have)
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1 border border-slate-200/80">
            <div className="flex justify-between">
              <span className="text-slate-500">Nguồn học liệu:</span>
              <span className="font-bold text-indigo-700">
                {sourceMode === 'BANK'
                  ? 'Ngân hàng chuẩn'
                  : sourceMode === 'DOCS_REUSE'
                  ? 'Dùng lại câu từ file (B-1)'
                  : sourceMode === 'DOCS_SIMILAR'
                  ? 'Sinh câu MỚI từ file (B-2)'
                  : 'Kết hợp'}
              </span>
            </div>
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
                      Kho khả dụng: {row.have} câu {isShort ? `(Thiếu ${row.missing})` : '✓'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {sourceMode === 'DOCS_REUSE' ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
              <div className="font-bold text-amber-800">📌 Chế độ Dùng lại file (B-1)</div>
              <p>
                Hệ thống chỉ lấy đúng các câu hỏi có trong tài liệu của bạn. Nếu thiếu câu theo ma trận, hệ thống sẽ báo thiếu và không tự ý lấy câu từ ngân hàng chung.
              </p>
            </div>
          ) : matrixPreview.hasShortage ? (
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
              ✅ Ngân hàng câu hỏi khả dụng đáp ứng đủ 100% ma trận độ khó này!
            </div>
          )}
        </div>

          {/* Khối Gợi Ý Chuyển Đổi Sang Tạo Đề AI */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-indigo-900">
              <span>✨</span>
              <span>Muốn tạo đề tự do bằng AI?</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Bạn có thể sử dụng Trí Tuệ Nhân Tạo <strong>Gemini 3.8 Flash</strong> để tự do nhập chủ đề và sinh đề tức thì.
            </p>
            <button
              type="button"
              onClick={() => {
                setCreationMode('AI_GEMINI');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full rounded-xl bg-indigo-600 py-2.5 font-bold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              Chuyển sang Tạo Đề Bằng AI →
            </button>
          </div>
        </div>
      </div>
    </>
  )}

      {/* MODAL DUYỆT CÂU HỎI TỪ TÀI LIỆU (Review Drawer/Modal) */}
      {reviewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex flex-col max-h-[90vh] w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Duyệt Câu Hỏi Trích Xuất: {reviewingDoc.fileName}
                </h3>
                <p className="text-xs text-slate-500">
                  {reviewItems.length} câu hỏi • Vui lòng kiểm tra lại công thức KaTeX, đáp án và mức độ nhận thức
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewingDoc(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {reviewItems.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  Tài liệu này không có câu hỏi nào được bóc tách.
                </div>
              ) : (
                reviewItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          Câu {idx + 1}
                        </span>
                        <CognitiveBadge level={item.cognitiveLevel || 'thong_hieu'} size="xs" />
                        <span className="text-[11px] font-semibold text-slate-500">
                          {item.chapterId}
                        </span>
                      </div>
                      {item.needsReview && (
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                          ⚠️ {item.reviewReason || 'Cần duyệt'}
                        </span>
                      )}
                    </div>

                    {/* Nội dung câu hỏi hiển thị KaTeX */}
                    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-800 border border-slate-200/80">
                      <MathText text={item.content} />
                    </div>

                    {/* Phương án trắc nghiệm nếu có */}
                    {Array.isArray(item.options) && item.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {item.options.map((opt: any) => (
                          <div
                            key={opt.label}
                            className={`rounded-lg border p-2 flex items-center gap-2 ${
                              opt.isCorrect
                                ? 'border-emerald-500 bg-emerald-50/70 font-bold text-emerald-900'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold">
                              {opt.label}
                            </span>
                            <MathText text={opt.content} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Chỉnh sửa đáp án và mức độ nhận thức */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Đáp án đúng:
                        </label>
                        <input
                          type="text"
                          value={item.correctAnswer || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setReviewItems((prev) =>
                              prev.map((it, i) =>
                                i === idx
                                  ? {
                                      ...it,
                                      correctAnswer: val,
                                      needsReview: !val,
                                      options: it.options?.map((o: any) => ({
                                        ...o,
                                        isCorrect: o.label.toUpperCase() === val.toUpperCase(),
                                      })),
                                    }
                                  : it
                              )
                            );
                          }}
                          placeholder="Ví dụ: A, B hoặc số/biểu thức"
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Mức nhận thức:
                        </label>
                        <select
                          value={item.cognitiveLevel || 'thong_hieu'}
                          onChange={(e) => {
                            const val = e.target.value as CognitiveLevel;
                            setReviewItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, cognitiveLevel: val } : it))
                            );
                          }}
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                        >
                          <option value="nhan_biet">Nhận biết</option>
                          <option value="thong_hieu">Thông hiểu</option>
                          <option value="van_dung">Vận dụng</option>
                          <option value="van_dung_cao">Vận dụng cao</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            setReviewItems((prev) =>
                              prev.map((it, i) =>
                                i === idx
                                  ? {
                                      ...it,
                                      needsReview: false,
                                      reviewReason: undefined,
                                      verificationStatus: 'verified',
                                    }
                                  : it
                              )
                            );
                          }}
                          className="w-full rounded-lg bg-emerald-50 border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          ✓ Đánh dấu đã xác minh
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3.5 bg-slate-50">
              <span className="text-xs text-slate-500">
                {reviewItems.filter((it) => it.needsReview).length > 0
                  ? `Còn ${reviewItems.filter((it) => it.needsReview).length} câu chưa có đáp án`
                  : '✓ Tất cả câu hỏi đã được xác nhận'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingDoc(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveReviewItems}
                  disabled={savingReview}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow disabled:opacity-60"
                >
                  {savingReview ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
