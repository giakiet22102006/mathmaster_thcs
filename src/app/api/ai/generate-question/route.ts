// ==============================================================================
// MathMaster THCS - API Sinh Câu Hỏi & Tạo Đề Bằng AI (/api/ai/generate-question)
// Bảo vệ bằng requireUser; Thẩm định qua verifyQuestion;
// SDK: @google/genai, Model: gemini-3.8-flash
// Hỗ trợ lưu trực tiếp vào Ngân hàng câu hỏi hoặc nhúng vào Đề thi mới.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  requireUser,
  writeServerStateAsync,
  invalidateExamPoolCache,
  invalidateDashboardCache,
} from '@/lib/prisma';
import {
  generateQuestionsWithAI,
  isGeminiConfigured,
  AIGenerateQuestionsOptions,
} from '@/lib/ai-service';

export const dynamic = 'force-dynamic';

const userGenRateMap = new Map<string, { count: number; resetAt: number }>();

function checkGenRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = userGenRateMap.get(userId);
  if (!entry || now > entry.resetAt) {
    userGenRateMap.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 10) {
    return false;
  }
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          requiresApiKey: true,
          message:
            '⚠️ Chưa cấu hình GEMINI_API_KEY trong file .env. Vui lòng thêm khoá bí mật Gemini API để sử dụng tính năng tạo câu hỏi và sinh đề thi bằng AI.',
        },
        { status: 400 }
      );
    }

    if (!checkGenRateLimit(auth.user.id)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Bạn đã tạo quá nhiều câu hỏi trong 1 phút. Vui lòng chờ 1 phút rồi thử lại.',
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const grade = Number(body.grade) || 8;
    const textbook = body.textbook || 'KNTT';
    const semester = Number(body.semester) === 2 ? 2 : 1;
    const cognitiveLevel = body.cognitiveLevel || 'thong_hieu';
    const type = body.type || 'mcq';
    const count = Math.min(Math.max(Number(body.count) || 1, 1), 10);
    const chapterId = body.chapterId || `G${grade}_C1`;
    const topic = body.topic || 'Toán học THCS';
    const customPrompt = body.customPrompt ? String(body.customPrompt).trim() : undefined;
    const referenceContext = body.referenceContext ? String(body.referenceContext).trim() : undefined;
    const saveToBank = Boolean(body.saveToBank);

    const result = await generateQuestionsWithAI({
      grade,
      textbook,
      semester,
      chapterId,
      topic,
      cognitiveLevel,
      type,
      count,
      customPrompt,
      referenceContext,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error || 'Không thể sinh câu hỏi bằng AI.',
          warnings: result.warnings,
        },
        { status: 422 }
      );
    }

    const generatedQuestions = result.questions || [];

    // Nếu người dùng chọn lưu trực tiếp vào ngân hàng câu hỏi
    if (saveToBank && generatedQuestions.length > 0) {
      const state = auth.state;
      if (!Array.isArray(state.questions)) {
        state.questions = [];
      }

      for (const q of generatedQuestions) {
        // Gắn thêm userId tạo ra câu hỏi
        (q as any).userId = auth.user.id;
        state.questions.push(q);
      }

      invalidateExamPoolCache();
      invalidateDashboardCache(auth.user.id);
      await writeServerStateAsync(state);
    }

    return NextResponse.json({
      ok: true,
      requiresApiKey: false,
      questions: generatedQuestions,
      savedToBank: saveToBank,
      count: generatedQuestions.length,
      warnings: result.warnings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Lỗi xử lý tạo câu hỏi bằng AI.' },
      { status: 500 }
    );
  }
}
