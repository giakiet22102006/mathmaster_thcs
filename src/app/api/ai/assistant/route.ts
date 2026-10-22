// ==============================================================================
// MathMaster THCS - API Trợ Lý Giải Toán & Gia Sư AI Sư Phạm (/api/ai/assistant)
// Bảo vệ bằng requireUser; Rate limit theo userId;
// Hỗ trợ 4 chế độ: socratic_hint, diagnose_mistake, explain_solution, chat.
// Minh bạch khi chưa cấu hình GEMINI_API_KEY (không giả lập kết quả ảo).
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/prisma';
import {
  getAILearningGuidance,
  isGeminiConfigured,
  AITutoringMode,
} from '@/lib/ai-service';

export const dynamic = 'force-dynamic';

// Rate limit bộ nhớ đệm: tối đa 30 requests / phút / user
const userRateMap = new Map<string, { count: number; resetAt: number }>();

function checkAIRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = userRateMap.get(userId);
  if (!entry || now > entry.resetAt) {
    userRateMap.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 30) {
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

    if (!checkAIRateLimit(auth.user.id)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Bạn đã gửi quá nhiều yêu cầu trợ lý AI trong 1 phút. Vui lòng thử lại sau giây lát.',
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const questionId = body.questionId ? String(body.questionId) : null;
    const mode: AITutoringMode = ['socratic_hint', 'diagnose_mistake', 'explain_solution', 'chat'].includes(
      body.mode
    )
      ? body.mode
      : 'socratic_hint';

    // Tìm câu hỏi từ ngân hàng câu hỏi trong state hoặc lấy từ question truyền lên
    let question = body.question;
    if (!question && questionId) {
      question = (auth.state.questions || []).find((q: any) => q.id === questionId);
    }

    if (!question || !question.content) {
      return NextResponse.json(
        { ok: false, error: 'Không tìm thấy thông tin câu hỏi để trợ giúp.' },
        { status: 400 }
      );
    }

    const guidanceResult = await getAILearningGuidance({
      mode,
      question: {
        id: question.id,
        grade: question.grade,
        chapterId: question.chapterId,
        topic: question.topic,
        content: question.content,
        type: question.type,
        options: question.options,
        correctAnswer: question.correctAnswer,
        solution: question.solution,
        rubricSteps: question.rubricSteps,
        keyFormula: question.keyFormula,
        commonMistake: question.commonMistake,
        hints: question.hints,
      },
      studentAnswer: body.studentAnswer ? String(body.studentAnswer) : undefined,
      studentWorkings: body.studentWorkings ? String(body.studentWorkings) : undefined,
      hintLevel: Number(body.hintLevel) || 1,
      userMessage: body.userMessage ? String(body.userMessage) : undefined,
      chatHistory: Array.isArray(body.chatHistory) ? body.chatHistory : undefined,
    });

    return NextResponse.json({
      ok: guidanceResult.ok,
      requiresApiKey: guidanceResult.requiresApiKey || false,
      mode: guidanceResult.mode,
      text: guidanceResult.text,
      fallbackData: guidanceResult.fallbackData,
      stepHints: question
        ? {
            step1Formula: question.keyFormula || 'Áp dụng công thức cơ bản trong chương.',
            step2CommonMistake: question.commonMistake || 'Kiểm tra kỹ dấu và điều kiện xác định.',
            step3Solution: question.solution || '',
            rubricSteps: question.rubricSteps || [],
          }
        : null,
      message: guidanceResult.requiresApiKey
        ? '⚠️ Chưa cấu hình GEMINI_API_KEY trong file .env. Hệ thống đang hiển thị gợi ý & giải thích từ ngân hàng câu hỏi chuẩn GDPT 2018.'
        : undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Không thể xử lý yêu cầu trợ lý giải toán.' },
      { status: 500 }
    );
  }
}
