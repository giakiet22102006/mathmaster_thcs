// ==============================================================================
// MathMaster THCS - API Trợ Lý Giải Toán Từng Bước (/api/ai/assistant)
// Bảo vệ bằng requireUser; minh bạch khi chưa cấu hình GEMINI_API_KEY
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const questionId = body.questionId ? String(body.questionId) : null;
    const question = questionId
      ? (auth.state.questions || []).find((q: any) => q.id === questionId)
      : null;

    const hasGemini = Boolean(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''
    );

    if (!hasGemini) {
      return NextResponse.json({
        ok: false,
        requiresApiKey: true,
        questionId,
        stepHints: question
          ? {
              step1Formula: question.keyFormula || 'Áp dụng công thức cơ bản trong chương.',
              step2CommonMistake: question.commonMistake || 'Kiểm tra kỹ dấu và điều kiện xác định.',
              step3Solution: question.solution || '',
              rubricSteps: question.rubricSteps || [],
            }
          : null,
        message:
          '⚠️ Chưa cấu hình GEMINI_API_KEY trong file .env của Backend. Hệ thống KHÔNG giả lập câu trả lời AI khi thiếu API Key. Bạn vẫn sử dụng được đầy đủ 3 bước gợi ý và lời giải chuẩn từ ngân hàng câu hỏi đã xác minh.',
      });
    }

    return NextResponse.json({
      ok: true,
      requiresApiKey: false,
      questionId,
      message: 'Đã kết nối GEMINI_API_KEY.',
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể xử lý yêu cầu trợ lý giải toán.' },
      { status: 500 }
    );
  }
}
