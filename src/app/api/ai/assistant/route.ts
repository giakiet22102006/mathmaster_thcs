import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  if (!hasGemini) {
    return NextResponse.json({
      ok: false,
      requiresApiKey: true,
      message: '⚠️ Chưa cấu hình GEMINI_API_KEY trong file .env của Backend. Hệ thống KHÔNG giả lập câu trả lời AI khi thiếu API Key. Bạn vẫn sử dụng được đầy đủ 3 bước gợi ý và lời giải chuẩn từ ngân hàng câu hỏi đã xác minh.'
    });
  }
  const body = await req.json();
  return NextResponse.json({
    ok: true,
    requiresApiKey: false,
    questionId: body.questionId,
    message: 'Đã kết nối GEMINI_API_KEY.'
  });
}
