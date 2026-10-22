'use client';

// ==============================================================================
// MathMaster THCS - Component Gia Sư AI Sư Phạm & Trợ Lý Học Tập (AITutorWidget)
// Tích hợp: Socratic Tutoring, Chẩn đoán lỗi sai, Hỏi đáp tương tác, KaTeX parser.
// Minh bạch khi thiếu GEMINI_API_KEY, fallback sang kho dữ liệu kiểm duyệt.
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { MathText } from '@/components/MathMasterShell';

export interface AITutorQuestion {
  id?: string;
  grade?: number;
  chapterId?: string;
  topic?: string;
  content: string;
  type?: 'mcq' | 'essay';
  options?: Array<{ label: string; text: string; errorType?: string }>;
  correctAnswer?: string;
  solution?: string;
  rubricSteps?: Array<{ step: string; points: number }>;
  keyFormula?: string;
  commonMistake?: string;
  hints?: string[];
}

export interface AITutorWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  question: AITutorQuestion | null;
  initialMode?: 'socratic_hint' | 'diagnose_mistake' | 'chat';
  studentAnswer?: string;
  studentWorkings?: string;
}

export function AITutorWidget({
  isOpen,
  onClose,
  question,
  initialMode = 'socratic_hint',
  studentAnswer: initialStudentAnswer = '',
  studentWorkings: initialStudentWorkings = '',
}: AITutorWidgetProps) {
  const [activeTab, setActiveTab] = useState<'socratic_hint' | 'diagnose_mistake' | 'chat'>(initialMode);
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hintText, setHintText] = useState<string>('');
  const [diagnosisText, setDiagnosisText] = useState<string>('');
  const [requiresApiKey, setRequiresApiKey] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Dữ liệu chẩn đoán lỗi
  const [myAnswer, setMyAnswer] = useState<string>(initialStudentAnswer);
  const [myWorkings, setMyWorkings] = useState<string>(initialStudentWorkings);

  // Lịch sử Chat tương tác
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Chào em! Thầy/cô là Gia sư AI MathMaster. Em đang gặp vướng mắc ở bước nào của bài toán này? Hãy hỏi thầy/cô nhé!',
    },
  ]);
  const [inputMsg, setInputMsg] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMode) setActiveTab(initialMode);
    if (initialStudentAnswer) setMyAnswer(initialStudentAnswer);
    if (initialStudentWorkings) setMyWorkings(initialStudentWorkings);
  }, [initialMode, initialStudentAnswer, initialStudentWorkings, question?.id]);

  useEffect(() => {
    if (isOpen && question) {
      if (activeTab === 'socratic_hint' && !hintText) {
        fetchGuidance('socratic_hint', hintLevel);
      } else if (activeTab === 'diagnose_mistake' && !diagnosisText && myAnswer) {
        fetchGuidance('diagnose_mistake');
      }
    }
  }, [isOpen, activeTab, question?.id]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  if (!isOpen || !question) return null;

  async function fetchGuidance(mode: 'socratic_hint' | 'diagnose_mistake' | 'chat', level: number = hintLevel) {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question?.id,
          question,
          mode,
          hintLevel: level,
          studentAnswer: myAnswer,
          studentWorkings: myWorkings,
        }),
      });

      const data = await res.json();
      if (data.requiresApiKey) {
        setRequiresApiKey(true);
      } else {
        setRequiresApiKey(false);
      }

      if (data.text) {
        if (mode === 'socratic_hint') {
          setHintText(data.text);
        } else if (mode === 'diagnose_mistake') {
          setDiagnosisText(data.text);
        }
      } else if (!res.ok) {
        setApiError(data.error || 'Không thể kết nối với dịch vụ trợ lý AI.');
      }
    } catch (err: any) {
      setApiError('Lỗi mạng hoặc máy chủ không phản hồi.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    const msg = inputMsg.trim();
    if (!msg || loading) return;

    const newMsgs = [...chatMessages, { sender: 'user' as const, text: msg }];
    setChatMessages(newMsgs);
    setInputMsg('');
    setLoading(true);
    setApiError(null);

    try {
      const chatHistory = newMsgs.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        parts: m.text,
      }));

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question?.id,
          question,
          mode: 'chat',
          userMessage: msg,
          chatHistory: chatHistory.slice(-6), // Gửi tối đa 6 lượt trao đổi gần nhất
        }),
      });

      const data = await res.json();
      if (data.requiresApiKey) setRequiresApiKey(true);
      if (data.text) {
        setChatMessages((prev) => [...prev, { sender: 'ai', text: data.text }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'ai', text: data.error || 'Thầy/cô đang gặp sự cố kết nối, em vui lòng thử lại nhé!' },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Lỗi mạng khi gửi câu hỏi. Em hãy thử lại nhé!' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4">
      <div className="flex h-full max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-100 bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl font-bold backdrop-blur-md">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-wide">Gia Sư AI MathMaster</h3>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-50">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-indigo-100">
                Chỉ dẫn sư phạm từng bước • Không giải hộ đáp án • Chuẩn GDPT 2018
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/25 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cảnh báo khi chưa cấu hình GEMINI_API_KEY */}
        {requiresApiKey && (
          <div className="flex items-center justify-between bg-amber-50 px-4 py-2 text-xs text-amber-900 border-b border-amber-200">
            <div className="flex items-center gap-1.5 font-medium">
              <span>⚠️</span>
              <span>
                Chưa cấu hình GEMINI_API_KEY. Hệ thống đang sử dụng kho gợi ý và công thức chuẩn đã qua kiểm duyệt.
              </span>
            </div>
          </div>
        )}

        {/* Nội dung đề bài tóm lược */}
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-xs text-slate-700 max-h-28 overflow-y-auto">
          <div className="font-semibold text-slate-800 mb-1 flex items-center justify-between">
            <span>📝 Đề bài đang xem ({question.grade ? `Lớp ${question.grade}` : 'THCS'}):</span>
            {question.topic && <span className="text-[11px] text-indigo-600 font-medium">{question.topic}</span>}
          </div>
          <div className="leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
            <MathText text={question.content} />
          </div>
        </div>

        {/* Tabs chọn chế độ */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 pt-2 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('socratic_hint')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl transition-all ${
              activeTab === 'socratic_hint'
                ? 'bg-white text-indigo-700 shadow-sm border-t-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <span>💡</span>
            <span>Gợi ý tư duy (Socratic)</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnose_mistake')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl transition-all ${
              activeTab === 'diagnose_mistake'
                ? 'bg-white text-indigo-700 shadow-sm border-t-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <span>🔍</span>
            <span>Chẩn đoán lỗi sai</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl transition-all ${
              activeTab === 'chat'
                ? 'bg-white text-indigo-700 shadow-sm border-t-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <span>💬</span>
            <span>Hỏi đáp trực tiếp</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 text-sm">
          {apiError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              ⚠️ {apiError}
            </div>
          )}

          {/* TAB 1: SOCRATIC HINT */}
          {activeTab === 'socratic_hint' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs text-indigo-950">
                <span className="font-bold text-indigo-800">🎯 Nguyên tắc Socratic:</span> Gia sư gợi ý từng bước
                hướng dẫn em tự tìm ra cách giải, không giải hộ đáp án số học để giúp em rèn luyện tư duy thực chất.
              </div>

              {/* 3 Cấp độ gợi ý */}
              <div className="flex items-center gap-2">
                {[
                  { level: 1, title: 'Mức 1: Dạng toán' },
                  { level: 2, title: 'Mức 2: Công thức then chốt' },
                  { level: 3, title: 'Mức 3: Bước biến đổi đầu tiên' },
                ].map((item) => (
                  <button
                    key={item.level}
                    onClick={() => {
                      setHintLevel(item.level);
                      fetchGuidance('socratic_hint', item.level);
                    }}
                    className={`flex-1 rounded-xl py-2 px-2 text-center text-xs font-semibold transition-all border ${
                      hintLevel === item.level
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              {/* Hiển thị nội dung gợi ý */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm min-h-[160px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-500 gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    <span className="text-xs">Gia sư AI đang chuẩn bị gợi ý Mức {hintLevel}...</span>
                  </div>
                ) : hintText ? (
                  <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-3">
                    <MathText text={hintText} />
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Bấm vào cấp độ gợi ý ở trên để nhận hướng dẫn từ Gia sư AI.
                  </div>
                )}
              </div>

              {/* Công thức trọng tâm nếu có */}
              {question.keyFormula && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950">
                  <span className="font-bold text-emerald-900">📌 Công thức trọng tâm: </span>
                  <MathText text={question.keyFormula} />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DIAGNOSE MISTAKE */}
          {activeTab === 'diagnose_mistake' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Đáp án của em:
                    </label>
                    <input
                      type="text"
                      value={myAnswer}
                      onChange={(e) => setMyAnswer(e.target.value)}
                      placeholder="Ví dụ: x = 2 hoặc chọn B..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-rose-700 font-bold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Đáp án đúng của đề bài:
                    </label>
                    <div className="w-full rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 font-bold">
                      <MathText text={question.correctAnswer || 'Chưa cung cấp'} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">
                    Các bước nháp / suy nghĩ của em (không bắt buộc):
                  </label>
                  <textarea
                    rows={2}
                    value={myWorkings}
                    onChange={(e) => setMyWorkings(e.target.value)}
                    placeholder="Em đã chuyển vế đổi dấu hay áp dụng công thức nào?..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => fetchGuidance('diagnose_mistake')}
                    disabled={loading || !myAnswer.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <span>🔍</span>
                    <span>Phân tích nguyên nhân sai</span>
                  </button>
                </div>
              </div>

              {/* Kết quả chẩn đoán */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm min-h-[160px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-500 gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    <span className="text-xs">Gia sư AI đang chẩn đoán lỗi sai của em...</span>
                  </div>
                ) : diagnosisText ? (
                  <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-3">
                    <MathText text={diagnosisText} />
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Nhập đáp án của em và bấm &quot;Phân tích nguyên nhân sai&quot; để AI chỉ ra vị trí nhầm lẫn.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: INTERACTIVE CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[380px]">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                          : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200'
                      }`}
                    >
                      <MathText text={msg.text} />
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-slate-100 border border-slate-200 px-4 py-2 text-xs text-slate-500 flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      <span>Gia sư AI đang soạn câu trả lời...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Hỏi Gia sư AI: Ví dụ 'Tại sao bài này phải đặt ĐKXĐ?'..."
                  className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMsg.trim()}
                  className="flex h-9 items-center justify-center rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Gửi
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Trợ lý toán học Gemini 3.8 Flash • Bản quyền MathMaster THCS
          </span>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
