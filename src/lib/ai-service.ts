// ==============================================================================
// MathMaster THCS - Dịch Vụ AI Gemini (src/lib/ai-service.ts)
// Hỗ trợ: Tạo đề thi, sinh câu hỏi toán chuẩn GDPT 2018, Socratic Tutoring,
// Chẩn đoán lỗi sai (Mistake Diagnosis) và Trò chuyện tương tác.
// SDK: @google/genai (v2.30.0), Model: gemini-3.8-flash
// Minh bạch khi thiếu GEMINI_API_KEY, fallback sang kho dữ liệu đã kiểm duyệt.
// ==============================================================================

import { GoogleGenAI, Type } from '@google/genai';
import { verifyQuestion } from './question-engine/verify';
import type {
  EngineQuestion,
  QuestionOption,
  RubricStep,
  CognitiveLevel,
  DifficultyLevel,
  TextbookCode,
  QuestionType,
} from './question-engine/types';

export const GEMINI_MODEL = 'gemini-3.5-flash';
export const GEMINI_FALLBACK_MODEL = 'gemini-3.5-flash-lite';
export const GEMINI_LEGACY_MODEL = 'gemini-3.8-flash';

/**
 * Chuẩn hoá key cache cho đề thi và câu hỏi AI sinh
 */
export function buildAiCacheKey(params: {
  grade: number;
  textbook?: string;
  semester?: number;
  chapterId?: string;
  topic?: string;
  cognitiveLevel?: string;
  type?: string;
  customPrompt?: string;
}): string {
  const norm = (str?: string) =>
    (str || '')
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\d]+/g, '_')
      .replace(/^_+|_+$/g, '');

  const promptPart = params.customPrompt ? norm(params.customPrompt) : norm(params.topic || 'general');
  return [
    `g${params.grade}`,
    norm(params.textbook || 'kntt'),
    norm(params.chapterId || 'c1'),
    norm(params.cognitiveLevel || 'thong_hieu'),
    norm(params.type || 'mcq'),
    promptPart,
  ].join(':');
}

/**
 * Gọi Gemini với khả năng tự động thử lại model dự phòng (gemini-3.5-flash-lite / gemini-3.8-flash) khi model chính quá tải
 */
export async function callGeminiWithResilience(client: GoogleGenAI, config: any): Promise<any> {
  try {
    return await client.models.generateContent({
      model: GEMINI_MODEL,
      ...config,
    });
  } catch (err: any) {
    const errMsg = String(err?.message || err);
    if (
      err?.status === 503 ||
      err?.status === 404 ||
      errMsg.includes('503') ||
      errMsg.includes('high demand') ||
      errMsg.includes('not found')
    ) {
      try {
        return await client.models.generateContent({
          model: GEMINI_FALLBACK_MODEL,
          ...config,
        });
      } catch {
        return await client.models.generateContent({
          model: GEMINI_LEGACY_MODEL,
          ...config,
        });
      }
    }
    throw err;
  }
}

/**
 * Kiểm tra xem GEMINI_API_KEY đã được cấu hình hợp lệ hay chưa
 */
export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== '' && !key.includes('CHANGE_ME'));
}

/**
 * Khởi tạo client Gemini an toàn
 */
export function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key.includes('CHANGE_ME')) {
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
}

// ------------------------------------------------------------------------------
// CÁC ĐỊNH NGHĨA KIỂU DỮ LIỆU
// ------------------------------------------------------------------------------

export interface AIGenerateQuestionsOptions {
  grade: number; // 6, 7, 8, 9
  textbook?: TextbookCode; // KNTT | CD | CTST
  semester?: 1 | 2;
  chapterId?: string;
  topic?: string;
  cognitiveLevel?: CognitiveLevel;
  type?: QuestionType; // mcq | essay
  count?: number; // Tối đa 10 câu/lần
  customPrompt?: string; // Yêu cầu tuỳ biến (ví dụ: bài toán thực tế chuyển động)
  referenceContext?: string; // Đoạn trích dẫn hoặc nội dung bài tập từ file tải lên
}

export interface AIGenerateQuestionsResult {
  ok: boolean;
  requiresApiKey?: boolean;
  questions?: EngineQuestion[];
  message?: string;
  error?: string;
  warnings?: string[];
}

export type AITutoringMode =
  | 'socratic_hint'
  | 'diagnose_mistake'
  | 'explain_solution'
  | 'chat';

export interface AILearningGuidanceOptions {
  mode: AITutoringMode;
  question: {
    id?: string;
    grade?: number;
    chapterId?: string;
    topic?: string;
    content: string;
    type?: 'mcq' | 'essay';
    options?: QuestionOption[];
    correctAnswer?: string;
    solution?: string;
    rubricSteps?: RubricStep[];
    keyFormula?: string;
    commonMistake?: string;
    hints?: string[];
  };
  studentAnswer?: string;
  studentWorkings?: string;
  hintLevel?: number; // 1, 2, 3
  userMessage?: string; // Tin nhắn câu hỏi của học sinh
  chatHistory?: Array<{ role: 'user' | 'model'; parts: string }>;
}

export interface AILearningGuidanceResult {
  ok: boolean;
  requiresApiKey?: boolean;
  text: string;
  mode: AITutoringMode;
  error?: string;
  fallbackData?: {
    keyFormula?: string;
    commonMistake?: string;
    solution?: string;
    rubricSteps?: RubricStep[];
    staticHint?: string;
  };
}

export interface AIDiagnoseExamWeaknessesOptions {
  examTitle: string;
  grade: number;
  textbook?: string;
  totalScore: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  wrongQuestions: Array<{
    id: string;
    chapterId: string;
    topic: string;
    cognitiveLevel: string;
    type: string;
    content: string;
    studentAnswer?: string;
    correctAnswer: string;
    errorCategory?: string;
    solution?: string;
  }>;
}

export interface ExamWeaknessItem {
  area: string;
  severity: 'high' | 'medium' | 'low';
  reason: string;
  suggestedReview: string;
}

export interface ExamActionStep {
  step: number;
  title: string;
  description: string;
}

export interface AIDiagnoseExamWeaknessesResult {
  ok: boolean;
  requiresApiKey?: boolean;
  assessmentSummary: string;
  keyWeaknesses: ExamWeaknessItem[];
  actionablePlan: ExamActionStep[];
  recommendedPracticePrompt: string;
  rawResponse?: string;
}

// ------------------------------------------------------------------------------
// SCHEMA CÂU HỎI CHO GENERATE CONTENT (STRUCTURED OUTPUT)
// ------------------------------------------------------------------------------

const questionResponseSchema = {
  type: Type.ARRAY,
  description: 'Danh sách các câu hỏi toán học THCS chuẩn GDPT 2018',
  items: {
    type: Type.OBJECT,
    properties: {
      content: {
        type: Type.STRING,
        description:
          'Nội dung đề bài rõ ràng, mạch lạc, tất cả công thức toán kẹp trong dấu $ (ví dụ: $x^2 - 4 = 0$)',
      },
      type: {
        type: Type.STRING,
        description: 'Hình thức câu hỏi: "mcq" (trắc nghiệm) hoặc "essay" (tự luận)',
      },
      points: {
        type: Type.NUMBER,
        description:
          'Điểm số câu hỏi: Trắc nghiệm thường 0.25 đến 0.5; Tự luận NB/TH 0.5 - 1.0, VD/VDC 1.0 - 2.0',
      },
      options: {
        type: Type.ARRAY,
        description: 'Nếu là mcq, bắt buộc có đủ 4 phương án A, B, C, D',
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, description: 'Nhãn: "A", "B", "C", "D"' },
            text: {
              type: Type.STRING,
              description: 'Nội dung phương án lựa chọn, công thức toán kẹp trong $...$',
            },
            errorType: {
              type: Type.STRING,
              description:
                'Nếu là phương án nhiễu, ghi nhận lỗi học sinh dễ mắc (SIGN_ERROR, FORMULA_ERROR, CALCULATION_ERROR, MISSING_CONDITION)',
            },
          },
          propertyOrdering: ['label', 'text', 'errorType'],
        },
      },
      correctAnswer: {
        type: Type.STRING,
        description:
          'Đáp án đúng: nếu mcq là "A", "B", "C" hoặc "D"; nếu essay là biểu thức kết quả rút gọn chuẩn LaTeX',
      },
      solution: {
        type: Type.STRING,
        description:
          'Lời giải chi tiết từng bước, có lập luận sư phạm rõ ràng, công thức toán kẹp trong $...$',
      },
      rubricSteps: {
        type: Type.ARRAY,
        description: 'Các bước chấm điểm chi tiết. Tổng điểm các bước phải đúng bằng points',
        items: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.STRING, description: 'Mô tả nội dung bước giải' },
            points: { type: Type.NUMBER, description: 'Điểm số của bước này' },
          },
          propertyOrdering: ['step', 'points'],
        },
      },
      keyFormula: {
        type: Type.STRING,
        description: 'Công thức trọng tâm hoặc định lý cốt lõi áp dụng trong bài',
      },
      commonMistake: {
        type: Type.STRING,
        description: 'Cảnh báo lỗi sai phổ biến mà học sinh thường mắc phải',
      },
    },
    propertyOrdering: [
      'content',
      'type',
      'points',
      'options',
      'correctAnswer',
      'solution',
      'rubricSteps',
      'keyFormula',
      'commonMistake',
    ],
  },
};

// ------------------------------------------------------------------------------
// SCHEMA CHẨN ĐOÁN ĐIỂM YẾU BÀI THI CHO GEMINI
// ------------------------------------------------------------------------------

const weaknessDiagnosticSchema = {
  type: Type.OBJECT,
  description: 'Báo cáo chẩn đoán điểm yếu và kế hoạch ôn tập cho học sinh sau khi làm bài thi',
  properties: {
    assessmentSummary: {
      type: Type.STRING,
      description: 'Nhận xét tổng quan sư phạm về kết quả làm bài của học sinh (ngắn gọn 2-3 câu, động viên và chỉ rõ mức độ)',
    },
    keyWeaknesses: {
      type: Type.ARRAY,
      description: 'Danh sách các lỗ hổng kiến thức cốt lõi cần khắc phục',
      items: {
        type: Type.OBJECT,
        properties: {
          area: { type: Type.STRING, description: 'Chuyên đề / Mảng kiến thức bị hổng' },
          severity: { type: Type.STRING, enum: ['high', 'medium', 'low'], description: 'Mức độ nghiêm trọng' },
          reason: { type: Type.STRING, description: 'Biểu hiện sai / Nguyên nhân nhầm lẫn' },
          suggestedReview: { type: Type.STRING, description: 'Chương / Bài học trong SGK cần đọc lại' },
        },
        required: ['area', 'severity', 'reason', 'suggestedReview'],
      },
    },
    actionablePlan: {
      type: Type.ARRAY,
      description: 'Lộ trình hành động 3 bước giúp học sinh phục hồi điểm số',
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.INTEGER, description: 'Số thứ tự bước (1, 2, 3)' },
          title: { type: Type.STRING, description: 'Tiêu đề bước' },
          description: { type: Type.STRING, description: 'Mô tả chi tiết việc cần làm' },
        },
        required: ['step', 'title', 'description'],
      },
    },
    recommendedPracticePrompt: {
      type: Type.STRING,
      description: 'Câu lệnh/chủ đề đề xuất để tạo ngay một đề luyện tập tập trung đúng vào các điểm yếu này',
    },
  },
  required: ['assessmentSummary', 'keyWeaknesses', 'actionablePlan', 'recommendedPracticePrompt'],
};

// ------------------------------------------------------------------------------
// 1. CHỨC NĂNG: TẠO ĐỀ & SINH CÂU HỎI TOÁN BẰNG AI (HỖ TRỢ LÊN ĐẾN 50 CÂU)
// ------------------------------------------------------------------------------

/**
 * Sinh câu hỏi toán THCS tự động bằng AI Gemini và thẩm định qua verifyQuestion
 * Hỗ trợ tạo từ 1 đến 50 câu (tự động phân chia batch nhỏ khi vượt quá 10 câu)
 */
export async function generateQuestionsWithAI(
  opts: AIGenerateQuestionsOptions
): Promise<AIGenerateQuestionsResult> {
  const client = getGeminiClient();
  if (!client) {
    return {
      ok: false,
      requiresApiKey: true,
      message:
        '⚠️ Chưa cấu hình GEMINI_API_KEY trong file .env. Vui lòng thêm khoá bí mật Gemini API để kích hoạt tính năng sinh câu hỏi tự động bằng AI.',
    };
  }

  const grade = Number(opts.grade) || 8;
  const textbook = opts.textbook || 'KNTT';
  const semester = Number(opts.semester) === 2 ? 2 : 1;
  const cognitiveLevel = opts.cognitiveLevel || 'thong_hieu';
  const type = opts.type || 'mcq';
  const totalCount = Math.min(Math.max(Number(opts.count) || 1, 1), 50);
  const chapterId = opts.chapterId || `G${grade}_C1`;
  const topic = opts.topic || 'Đại số và Hình học THCS';

  const levelDescs: Record<CognitiveLevel, string> = {
    nhan_biet: 'Nhận biết: Nhận diện định nghĩa, công thức cơ bản, tính toán 1 bước đơn giản.',
    thong_hieu: 'Thông hiểu: Áp dụng trực tiếp 1-2 công thức, giải phương trình hoặc tính toán đại số tiêu chuẩn.',
    van_dung:
      'Vận dụng (VD): Cần từ 3 bước suy luận trở lên, kết hợp ít nhất 2 kỹ thuật toán học hoặc mô hình hóa bài toán thực tế. Lời giải chặt chẽ, có điều kiện xác định.',
    van_dung_cao:
      'Vận dụng cao (VDC): Cần từ 5 bước suy luận, tư duy phân tích đa trường hợp, đánh giá bất đẳng thức, cực trị hoặc hình học chứng minh phức hợp. Đòi hỏi phân hóa cao.',
  };

  const systemInstruction = `Bạn là chuyên gia sư phạm Toán THCS hàng đầu Việt Nam theo Chương trình GDPT 2018.
Nhiệm vụ: Biên soạn các câu hỏi Toán học chính xác 100%, không sai số, không suy biến (ví dụ mẫu số khác 0, cạnh tam giác dương, tam giác không suy biến).
Quy tắc KaTeX:
- Mọi ký hiệu toán, biến số, số mũ, phân số, căn thức bắt buộc kẹp giữa dấu $ (ví dụ: $x^2 - 5x + 6 = 0$, $\\frac{a}{b}$, $\\sqrt{x - 1}$).
- Dùng \\cdot thay cho dấu nhân, \\implies hoặc \\Rightarrow cho suy ra.
- Trắc nghiệm (mcq) bắt buộc có đủ 4 phương án A, B, C, D phân biệt rõ ràng.
- Tự luận (essay) bắt buộc có rubricSteps với tổng điểm đúng bằng points.
- Đảm bảo câu hỏi phân hóa đúng mức độ yêu cầu: ${levelDescs[cognitiveLevel]}.`;

  // Phân chia thành các batch tối đa 10 câu để tránh vượt quá giới hạn token đầu ra của Gemini
  const batchSizes: number[] = [];
  let rem = totalCount;
  while (rem > 0) {
    const cur = Math.min(rem, 10);
    batchSizes.push(cur);
    rem -= cur;
  }

  const verifiedQuestions: EngineQuestion[] = [];
  const warnings: string[] = [];
  let qIndex = 1;

  // Thực thi song song (Parallel execution) các batch để tối ưu tốc độ phản hồi
  const batchPromises = batchSizes.map(async (curBatchSize, bIdx) => {
    const userPrompt = `Hãy biên soạn ${curBatchSize} câu hỏi Toán lớp ${grade} (${textbook}, Học kỳ ${semester}).
Chương: ${chapterId} (${topic}).
Mức độ nhận thức: ${cognitiveLevel.toUpperCase()} - ${levelDescs[cognitiveLevel]}.
Hình thức: ${type === 'mcq' ? 'Trắc nghiệm 4 lựa chọn (mcq)' : 'Tự luận giải chi tiết (essay)'}.
${opts.customPrompt ? `Yêu cầu cụ thể từ giáo viên: "${opts.customPrompt}".` : ''}
${batchSizes.length > 1 ? `(Nhóm câu hỏi phần ${bIdx + 1}, các câu hỏi không trùng lặp đề bài với nhau).` : ''}
${opts.referenceContext ? `Nội dung tham khảo từ tài liệu/đề bài gốc:\n"""\n${opts.referenceContext.slice(0, 1500)}\n"""` : ''}

Yêu cầu xuất ra định dạng JSON theo schema đã cho.`;

    const response = await callGeminiWithResilience(client, {
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.25 + (bIdx * 0.05),
        responseMimeType: 'application/json',
        responseJsonSchema: questionResponseSchema,
      },
    });

    const rawText = response.text?.trim() || '';
    if (!rawText) return [];

    const parsedArray = JSON.parse(rawText);
    return Array.isArray(parsedArray) ? parsedArray : [];
  });

  const batchResults = await Promise.allSettled(batchPromises);

  for (let bIdx = 0; bIdx < batchResults.length; bIdx++) {
    const res = batchResults[bIdx];
    if (res.status === 'rejected') {
      warnings.push(`Batch ${bIdx + 1} gặp sự cố: ${res.reason?.message || String(res.reason)}`);
      continue;
    }

    const parsedArray = res.value;
    const now = new Date().toISOString();

    for (const rawQ of parsedArray) {
      if (verifiedQuestions.length >= totalCount) break;

      const qId = `ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${qIndex++}`;
      const qCode = `AI_G${grade}_${cognitiveLevel.toUpperCase()}_${Date.now() % 10000}_${qIndex}`;
      const qPoints = Number(rawQ.points) > 0 ? Number(rawQ.points) : type === 'mcq' ? 0.25 : 1.0;

      let rubricSteps: RubricStep[] = Array.isArray(rawQ.rubricSteps) && rawQ.rubricSteps.length > 0
        ? rawQ.rubricSteps.map((r: any) => ({
            step: String(r.step || ''),
            points: Number(r.points) || Number((qPoints / rawQ.rubricSteps.length).toFixed(2)),
          }))
        : [
            { step: 'Nêu công thức và điều kiện xác định', points: Number((qPoints * 0.3).toFixed(2)) },
            { step: 'Thực hiện biến đổi và tính toán', points: Number((qPoints * 0.5).toFixed(2)) },
            { step: 'Kết luận và đối chiếu nghiệm', points: Number((qPoints * 0.2).toFixed(2)) },
          ];

      const rubricSum = rubricSteps.reduce((acc, r) => acc + r.points, 0);
      if (Math.abs(rubricSum - qPoints) > 0.01 && rubricSteps.length > 0) {
        rubricSteps[rubricSteps.length - 1].points = Number(
          (qPoints - (rubricSum - rubricSteps[rubricSteps.length - 1].points)).toFixed(2)
        );
      }

      const options: QuestionOption[] | undefined =
        rawQ.type === 'mcq' && Array.isArray(rawQ.options)
          ? rawQ.options.map((opt: any, idx: number) => {
              const label = (['A', 'B', 'C', 'D'][idx] || String(opt.label || 'A')) as any;
              const isCorrect = String(label).toUpperCase() === String(rawQ.correctAnswer || '').toUpperCase();
              const defaultErrTypes = ['SIGN_ERROR', 'FORMULA_ERROR', 'CALCULATION_ERROR', 'MISSING_CONDITION'];
              return {
                label,
                text: String(opt.text || ''),
                errorType: !isCorrect
                  ? opt.errorType || defaultErrTypes[idx % defaultErrTypes.length]
                  : undefined,
              };
            })
          : undefined;

      const complexityMeta = {
        steps: cognitiveLevel === 'van_dung_cao' ? 5 : cognitiveLevel === 'van_dung' ? 3 : 2,
        techniques:
          cognitiveLevel === 'van_dung_cao'
            ? ['inequality_estimation', 'case_analysis', 'algebraic_transformation']
            : cognitiveLevel === 'van_dung'
            ? ['factorization', 'domain_check']
            : ['basic_calculation'],
        crossTopic: cognitiveLevel === 'van_dung_cao',
        needsCaseAnalysis: cognitiveLevel === 'van_dung_cao',
        modeling: false,
        estMinutes: cognitiveLevel === 'van_dung_cao' ? 8 : cognitiveLevel === 'van_dung' ? 4 : 2,
      };

      const engineQ: EngineQuestion = {
        id: qId,
        code: qCode,
        grade,
        textbooks: [textbook],
        semester: semester as 1 | 2,
        chapterId,
        lesson: topic,
        topic,
        problemType: opts.customPrompt ? 'AI_CUSTOM' : 'AI_GENERATED',
        type: (rawQ.type === 'mcq' ? 'mcq' : 'essay') as QuestionType,
        difficulty:
          cognitiveLevel === 'nhan_biet'
            ? 'easy'
            : cognitiveLevel === 'thong_hieu'
            ? 'medium'
            : 'hard',
        cognitiveLevel,
        complexity: complexityMeta,
        points: qPoints,
        content: String(rawQ.content || '').trim(),
        options,
        correctAnswer: String(rawQ.correctAnswer || '').trim(),
        acceptedAnswers: [String(rawQ.correctAnswer || '').trim()],
        solution: String(rawQ.solution || '').trim(),
        rubricSteps,
        keyFormula: rawQ.keyFormula ? String(rawQ.keyFormula) : undefined,
        commonMistake: rawQ.commonMistake ? String(rawQ.commonMistake) : undefined,
        source: 'AI Gemini 3.5 Flash (GDPT 2018)',
        verificationStatus: 'verified',
        verifiedBy: 'AI_GEMINI_VERIFIED',
        verifiedAt: now,
        version: 1,
      };

      const vResult = verifyQuestion(engineQ);
      if (vResult.valid) {
        verifiedQuestions.push(engineQ);
      } else {
        warnings.push(`Câu hỏi ${qCode} bị loại: ${vResult.errors.join('; ')}`);
      }
    }
  }

  if (verifiedQuestions.length === 0) {
    return {
      ok: false,
      error: `Không có câu hỏi nào vượt qua cổng thẩm định toán học (${warnings.join(' | ')})`,
      warnings,
    };
  }

  return {
    ok: true,
    requiresApiKey: false,
    questions: verifiedQuestions.slice(0, totalCount),
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// ------------------------------------------------------------------------------
// 2. CHỨC NĂNG: GIA SƯ AI & CHỈ DẪN HỌC TẬP SƯ PHẠM (SOCRATIC TUTORING)
// ------------------------------------------------------------------------------

/**
 * Trả về lời giải thích, gợi ý tư duy hoặc phân tích lỗi sai sư phạm
 */
export async function getAILearningGuidance(
  opts: AILearningGuidanceOptions
): Promise<AILearningGuidanceResult> {
  const { mode, question, studentAnswer, studentWorkings, hintLevel = 1, userMessage, chatHistory } = opts;

  const fallbackData = {
    keyFormula: question.keyFormula || 'Xem lại định lý và công thức cơ bản trong sách giáo khoa.',
    commonMistake: question.commonMistake || 'Kiểm tra kỹ điều kiện xác định và dấu của các số hạng.',
    solution: question.solution || '',
    rubricSteps: question.rubricSteps || [],
    staticHint:
      Array.isArray(question.hints) && question.hints.length >= hintLevel
        ? question.hints[hintLevel - 1]
        : question.keyFormula || 'Hãy đọc kỹ đề bài và xác định đại lượng cần tìm.',
  };

  const client = getGeminiClient();
  if (!client) {
    // Phản hồi minh bạch khi chưa có GEMINI_API_KEY
    let fallbackText = '';
    if (mode === 'socratic_hint') {
      fallbackText = `💡 **Gợi ý từ ngân hàng bài tập (Mức ${hintLevel}/3)**:\n\n${fallbackData.staticHint}\n\n*Công thức trọng tâm*: ${fallbackData.keyFormula}`;
    } else if (mode === 'diagnose_mistake') {
      fallbackText = `🔍 **Chẩn đoán cơ bản**:\n\nBạn đã nhập: "${studentAnswer || 'Chưa có'}"\nĐáp án chuẩn: "${question.correctAnswer || 'Xem lời giải'}"\n\n⚠️ **Lỗi phổ biến cần tránh**: ${fallbackData.commonMistake}`;
    } else {
      fallbackText = `📖 **Lời giải chuẩn**:\n\n${fallbackData.solution || 'Chưa có lời giải chi tiết cho câu hỏi này.'}`;
    }

    return {
      ok: false,
      requiresApiKey: true,
      text: fallbackText,
      mode,
      fallbackData,
    };
  }

  // Xây dựng System Instruction chuyên biệt theo chế độ
  let systemInstruction = `Bạn là Gia sư Toán THCS tận tâm, thông thái và giàu kinh nghiệm sư phạm tại Việt Nam.
Đối tượng học sinh: Học sinh lớp 6, 7, 8, 9 theo chương trình GDPT 2018.
Quy tắc bắt buộc:
1. Luôn dùng tiếng Việt sư phạm, ấm áp, kiên nhẫn, động viên học sinh.
2. Tất cả công thức toán, biến số, số mũ, phân số BẮT BUỘC kẹp giữa dấu $ (ví dụ $x^2 + 2x$, $\\frac{1}{2}$).`;

  if (mode === 'socratic_hint') {
    systemInstruction += `
3. PHƯƠNG PHÁP SOCRATIC (GỢI Ý TƯ DUY):
- TUYỆT ĐỐI KHÔNG giải hộ bài toán!
- TUYỆT ĐỐI KHÔNG đưa ra đáp án số học cuối cùng!
- Chỉ đặt câu hỏi gợi mở, nhắc công thức trọng tâm hoặc chia nhỏ bài toán thành các câu hỏi phụ để học sinh tự nghĩ ra bước tiếp theo.
- Hiện tại học sinh đang yêu cầu Gợi ý Mức ${hintLevel}/3:
  + Mức 1: Giúp nhận diện dạng toán, xác định đại lượng đã biết và đại lượng cần tìm.
  + Mức 2: Nhắc công thức then chốt hoặc gợi ý cách đặt ẩn / cách vẽ thêm đường phụ.
  + Mức 3: Nêu rõ bước biến đổi đại số đầu tiên hoặc hướng phân tích điều kiện xác định.`;
  } else if (mode === 'diagnose_mistake') {
    systemInstruction += `
3. PHÂN TÍCH CHẨN ĐOÁN LỖI SAI:
- So sánh câu trả lời của học sinh với đáp án đúng của bài toán.
- Phân tích xem học sinh mắc lỗi ở khâu nào:
  + Lỗi sai dấu (+ / - khi chuyển vế hoặc mở ngoặc)
  + Nhầm công thức (hằng đẳng thức, quy tắc lũy thừa, định lý)
  + Quên điều kiện xác định (chia cho 0, căn bậc hai, độ dài cạnh dương)
  + Sai sót trong tính toán số học
- Chỉ ra cụ thể vị trí sai và giải thích TẠI SAO sai, sau đó nêu mẹo để lần sau không tái phạm.`;
  } else if (mode === 'explain_solution') {
    systemInstruction += `
3. THUYẾT MINH LỜI GIẢI CHI TIẾT:
- Trình bày lời giải sư phạm từng bước mạch lạc.
- Ở mỗi bước biến đổi, giải thích rõ nguyên nhân "Tại sao lại làm như vậy?".
- Nêu các lưu ý quan trọng cần nhớ cho dạng bài này.`;
  } else {
    systemInstruction += `
3. TRÒ CHUYỆN TOÁN HỌC TƯƠNG TÁC:
- Trả lời đúng trọng tâm câu hỏi của học sinh về bài toán này.
- Giúp học sinh hiểu bản chất kiến thức, khuyến khích tư duy logic.`;
  }

  const promptContent = `ĐỀ BÀI:
${question.content}

${question.type === 'mcq' && question.options ? `Các phương án lựa chọn:\n${question.options.map((o) => `${o.label}. ${o.text}`).join('\n')}\n` : ''}
Đáp án đúng của đề bài: ${question.correctAnswer || 'Theo lời giải'}
${question.keyFormula ? `Công thức liên quan: ${question.keyFormula}\n` : ''}
${question.commonMistake ? `Lỗi sai mẫu: ${question.commonMistake}\n` : ''}

${studentAnswer ? `Câu trả lời của học sinh: "${studentAnswer}"\n` : ''}
${studentWorkings ? `Các bước nháp/bài làm của học sinh:\n"""\n${studentWorkings}\n"""\n` : ''}
${userMessage ? `Câu hỏi thắc mắc của học sinh: "${userMessage}"\n` : ''}

Hãy đưa ra phản hồi sư phạm phù hợp cho chế độ: ${mode.toUpperCase()}.`;

  try {
    let responseText = '';

    if (mode === 'chat' && Array.isArray(chatHistory) && chatHistory.length > 0) {
      // Chế độ hội thoại có ngữ cảnh
      const contents = [
        ...chatHistory.map((item) => ({
          role: item.role,
          parts: [{ text: item.parts }],
        })),
        {
          role: 'user',
          parts: [{ text: promptContent }],
        },
      ];

      const response = await callGeminiWithResilience(client, {
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });
      responseText = response.text || '';
    } else {
      const response = await callGeminiWithResilience(client, {
        contents: promptContent,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });
      responseText = response.text || '';
    }

    return {
      ok: true,
      requiresApiKey: false,
      text: responseText.trim(),
      mode,
      fallbackData,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: `Lỗi kết nối Gemini API: ${err.message || String(err)}`,
      text: `⚠️ Đã xảy ra lỗi khi trao đổi với AI: ${err.message || 'Vui lòng thử lại sau.'}`,
      mode,
      fallbackData,
    };
  }
}

// ------------------------------------------------------------------------------
// 3. CHỨC NĂNG: TRÍCH XUẤT ĐỀ TỪ TÀI LIỆU/ẢNH QUA GEMINI VISION
// ------------------------------------------------------------------------------

/**
 * Trích xuất đề thi từ file hình ảnh hoặc PDF scan qua Gemini
 */
export async function extractDocumentWithGemini(
  buffer: Buffer,
  mimeType: string
): Promise<{ ok: boolean; text: string; requiresApiKey?: boolean; error?: string }> {
  const client = getGeminiClient();
  if (!client) {
    return {
      ok: false,
      text: '',
      requiresApiKey: true,
      error: 'Chưa cấu hình GEMINI_API_KEY trong file .env.',
    };
  }

  const prompt = `Bạn là chuyên gia trích xuất đề thi Toán THCS từ hình ảnh/tài liệu scan.
Nhiệm vụ:
1. Đọc và trích xuất nguyên vẹn văn bản câu hỏi, các phương án A, B, C, D, đáp án và lời giải (nếu có).
2. Mọi công thức toán, phân số, căn thức, biến số bắt buộc kẹp giữa dấu $ (ví dụ $x^2 - 4x + 3 = 0$, $\\frac{a}{b}$).
3. Giữ nguyên cấu trúc: Câu 1, Câu 2... hoặc Bài 1, Bài 2...
4. Không thêm các lời chào hỏi hay bình luận ngoài nội dung đề thi.`;

  try {
    const base64Data = buffer.toString('base64');
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
      },
    });

    const text = response.text?.trim() || '';
    if (!text) {
      return { ok: false, text: '', error: 'Không nhận diện được nội dung từ tài liệu.' };
    }

    return { ok: true, text };
  } catch (err: any) {
    return { ok: false, text: '', error: err.message || 'Lỗi xử lý tài liệu với Gemini' };
  }
}

// ------------------------------------------------------------------------------
// 4. CHỨC NĂNG: AI CHẨN ĐOÁN ĐIỂM YẾU BÀI THI & LẬP LỘ TRÌNH ÔN TẬP
// ------------------------------------------------------------------------------

/**
 * Thuật toán suy luận chẩn đoán điểm yếu dựa trên quy tắc sư phạm (khi chưa cấu hình API key hoặc chế độ dự phòng)
 */
export function generateRuleBasedExamDiagnosis(
  opts: AIDiagnoseExamWeaknessesOptions
): AIDiagnoseExamWeaknessesResult {
  const errorMap: Record<string, number> = {};
  const topicMap: Record<string, number> = {};

  for (const q of opts.wrongQuestions) {
    const err = q.errorCategory || 'CALCULATION_ERROR';
    errorMap[err] = (errorMap[err] || 0) + 1;
    const topicKey = q.topic || q.chapterId || 'Toán THCS';
    topicMap[topicKey] = (topicMap[topicKey] || 0) + 1;
  }

  const ERROR_REASONS: Record<string, { label: string; reason: string; review: string }> = {
    SIGN_ERROR: {
      label: 'Kỹ năng biến đổi dấu (+/-)',
      reason: 'Dễ nhầm dấu khi chuyển vế, bỏ dấu ngoặc có dấu trừ phía trước hoặc nhân/chia hai vế với số âm.',
      review: 'Ôn lại quy tắc đổi dấu khi chuyển vế và quy tắc nhân chia số hữu tỉ trong SGK.',
    },
    MISSING_CONDITION: {
      label: 'Điều kiện xác định & Đối chiếu nghiệm',
      reason: 'Quên đặt điều kiện mẫu thức khác 0, biểu thức dưới căn không âm, hoặc quên đối chiếu nghiệm ở bước kết luận.',
      review: 'Luôn viết ĐKXĐ ngay dòng đầu tiên và đóng khung bước đối chiếu điều kiện ở dòng cuối cùng.',
    },
    FORMULA_ERROR: {
      label: 'Hệ thống công thức & Định lý cốt lõi',
      reason: 'Nhầm lẫn hằng đẳng thức đáng nhớ, công thức diện tích/thể tích hoặc hệ thức lượng.',
      review: 'Viết lại bảng hằng đẳng thức và các công thức hình học ra giấy nháp trước khi làm bài.',
    },
    CONCEPT_ERROR: {
      label: 'Khái niệm & Bản chất định nghĩa',
      reason: 'Chưa hiểu sâu bản chất định lý, nhầm lẫn giữa giả thiết và kết luận trong các bài toán chứng minh.',
      review: 'Đọc lại kỹ phần đóng khung lý thuyết trọng tâm và các bài toán ví dụ trong SGK.',
    },
    METHOD_ERROR: {
      label: 'Phương pháp giải & Hướng tư duy đại số',
      reason: 'Chọn sai hướng biến đổi, chưa nhận diện được bài toán quen thuộc để áp dụng phương pháp chuẩn.',
      review: 'Luyện tập các bài toán mẫu theo từng dạng cụ thể từ mức Thông hiểu trước khi lên Vận dụng.',
    },
    CALCULATION_ERROR: {
      label: 'Độ chuẩn xác trong tính toán số học',
      reason: 'Sai sót trong các phép tính cộng trừ nhân chia cơ bản hoặc rút gọn phân số vội vàng.',
      review: 'Dành 5-7 phút cuối giờ để kiểm tra lại các phép tính nhẩm và các bước trung gian.',
    },
  };

  const weaknessItems: ExamWeaknessItem[] = [];

  for (const [topic, count] of Object.entries(topicMap)) {
    const relatedErr = Object.keys(errorMap)[0] || 'CALCULATION_ERROR';
    const info = ERROR_REASONS[relatedErr] || ERROR_REASONS['CALCULATION_ERROR'];
    weaknessItems.push({
      area: `Chuyên đề: ${topic}`,
      severity: count >= 2 ? 'high' : 'medium',
      reason: `${info.reason} (Em bị sai ${count} câu ở dạng bài này).`,
      suggestedReview: info.review,
    });
  }

  const topTopics = Object.keys(topicMap).slice(0, 3).join(', ');

  return {
    ok: true,
    requiresApiKey: false,
    assessmentSummary: `Qua bài kiểm tra "${opts.examTitle}", em đạt ${opts.totalScore}/${opts.maxScore} điểm (${opts.correctCount}/${opts.correctCount + opts.wrongCount} câu đúng). Em còn bị mất điểm ở mảng ${topTopics || 'kiến thức vừa làm'}. Dưới đây là các lỗ hổng kiến thức cốt lõi và lộ trình phục hồi điểm số dành riêng cho em.`,
    keyWeaknesses: weaknessItems,
    actionablePlan: [
      {
        step: 1,
        title: 'Bước 1: Rà soát lại lý thuyết & công thức',
        description: `Đọc lại các bài học liên quan đến ${topTopics || 'chuyên đề này'} trong SGK ${opts.textbook || 'KNTT'}.`,
      },
      {
        step: 2,
        title: 'Bước 2: Luyện tập khắc phục lỗi',
        description: 'Tập trung làm lại các câu bị sai, chú ý khắc phục các lỗi sai dấu, điều kiện xác định và nhầm công thức.',
      },
      {
        step: 3,
        title: 'Bước 3: Làm một đề thi tương đương ngắn (5–10 câu)',
        description: 'Bấm nút "Tạo Đề Luyện Điểm Yếu" bên dưới để làm ngay một bộ đề tập trung khắc phục triệt để các lỗi này.',
      },
    ],
    recommendedPracticePrompt: `Toán ${opts.grade} - Luyện tập chuyên sâu ${topTopics || 'các dạng bài còn sai sót'}`,
  };
}

/**
 * AI Sư Phạm: Phân tích toàn diện kết quả bài làm của học sinh, tìm ra điểm yếu & lập kế hoạch ôn tập
 */
export async function diagnoseExamWeaknesses(
  opts: AIDiagnoseExamWeaknessesOptions
): Promise<AIDiagnoseExamWeaknessesResult> {
  // Nếu học sinh đúng 100%
  if (opts.wrongCount === 0 || opts.wrongQuestions.length === 0) {
    return {
      ok: true,
      requiresApiKey: false,
      assessmentSummary: `Chúc mừng em đã hoàn thành xuất sắc bài thi "${opts.examTitle}" với điểm số tối đa (${opts.totalScore}/${opts.maxScore})! Em đã nắm rất vững kiến thức và kỹ năng biến đổi toán học của phần này.`,
      keyWeaknesses: [],
      actionablePlan: [
        {
          step: 1,
          title: 'Thử thách nâng cao (VDC)',
          description: 'Chuyển sang thử sức với các bài toán Vận dụng cao hoặc các đề thi học sinh giỏi cấp trường/quận.',
        },
        {
          step: 2,
          title: 'Duy trì tốc độ làm bài',
          description: 'Rèn luyện khả năng tính toán nhanh và phản xạ làm đề dưới áp lực thời gian ngắn hơn.',
        },
      ],
      recommendedPracticePrompt: `Toán ${opts.grade} - Các bài toán Vận dụng cao phân hóa và bài toán thực tế nâng cao`,
    };
  }

  const client = getGeminiClient();
  if (!client) {
    return generateRuleBasedExamDiagnosis(opts);
  }

  const wrongQuestionsSummary = opts.wrongQuestions.map((q, idx) => ({
    stt: idx + 1,
    chapterId: q.chapterId,
    topic: q.topic,
    cognitiveLevel: q.cognitiveLevel,
    type: q.type,
    content: q.content.slice(0, 300),
    studentAnswer: q.studentAnswer || '(Không trả lời hoặc làm sai)',
    correctAnswer: q.correctAnswer,
    errorCategory: q.errorCategory || 'Lỗi chưa xác định',
  }));

  const systemInstruction = `Bạn là Chuyên gia Cố vấn Học tập & Giáo viên Sư phạm Toán THCS hàng đầu Việt Nam theo Chương trình GDPT 2018.
Nhiệm vụ: Xem xét kết quả bài kiểm tra Toán của học sinh, phân tích khách quan các lỗi sai, tìm ra các điểm yếu cốt lõi (kiến thức hổng, phương pháp sai, nhầm lẫn công thức, quên ĐKXĐ, v.v.) và đưa ra lộ trình hành động 3 bước rõ ràng để giúp học sinh tiến bộ.
Giọng điệu: Thấu hiểu, động viên sư phạm, khoa học, chỉ dẫn rõ ràng.`;

  const userPrompt = `Dưới đây là kết quả bài thi Toán của học sinh:
- Đề thi: "${opts.examTitle}"
- Khối lớp: Lớp ${opts.grade} (SGK ${opts.textbook || 'KNTT'})
- Điểm đạt được: ${opts.totalScore} / ${opts.maxScore} (Đúng: ${opts.correctCount}, Sai/Chưa trọn vẹn: ${opts.wrongCount} câu)

Chi tiết các câu học sinh làm sai:
${JSON.stringify(wrongQuestionsSummary, null, 2)}

Hãy phân tích toàn diện:
1. Đánh giá tổng quan năng lực của học sinh qua bài thi này.
2. Liệt kê các điểm yếu then chốt (chuyên đề hổng, lý do sai, SGK cần xem lại).
3. Lập lộ trình 3 bước khắc phục ngắn gọn, khả thi.
4. Đề xuất câu lệnh/chủ đề cụ thể để học sinh bấm tạo ngay một đề ôn luyện khắc phục điểm yếu này.`;

  try {
    const response = await callGeminiWithResilience(client, {
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseJsonSchema: weaknessDiagnosticSchema,
      },
    });

    const raw = response.text?.trim() || '';
    if (!raw) {
      return generateRuleBasedExamDiagnosis(opts);
    }

    const parsed = JSON.parse(raw);
    return {
      ok: true,
      requiresApiKey: false,
      assessmentSummary: parsed.assessmentSummary || 'Phân tích kết quả bài thi hoàn tất.',
      keyWeaknesses: Array.isArray(parsed.keyWeaknesses) ? parsed.keyWeaknesses : [],
      actionablePlan: Array.isArray(parsed.actionablePlan) ? parsed.actionablePlan : [],
      recommendedPracticePrompt:
        parsed.recommendedPracticePrompt || `Toán ${opts.grade} - Ôn luyện phục hồi điểm yếu`,
      rawResponse: raw,
    };
  } catch (err: any) {
    console.error('Lỗi khi gọi Gemini chẩn đoán bài thi:', err);
    return generateRuleBasedExamDiagnosis(opts);
  }
}
