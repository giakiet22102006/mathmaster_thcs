// ==============================================================================
// MathMaster THCS - API Tải Lên & Trích Xuất Tài Liệu Học Tập (/api/documents)
// Bảo vệ bằng requireUser, lấy userId từ session, kiểm soát truy cập theo chủ sở hữu
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { requireUser, writeServerStateAsync } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const requestedUserId = req.nextUrl.searchParams.get('userId');
    if (requestedUserId && requestedUserId !== auth.user.id && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { ok: false, error: 'Bạn không có quyền truy cập tài liệu cá nhân của người khác.' },
        { status: 403 }
      );
    }

    const docs = (auth.state.documents || []).filter((d: any) => d.userId === auth.user.id);
    return NextResponse.json({ ok: true, documents: docs });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể tải danh sách tài liệu.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const formData = await req.formData();
    const bodyUserId = formData.get('userId');
    if (bodyUserId && String(bodyUserId) !== auth.user.id && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { ok: false, error: 'Không được phép tải lên tài liệu vào tài khoản người khác.' },
        { status: 403 }
      );
    }

    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy file tải lên.' }, { status: 400 });
    }

    const maxMb = Number(process.env.MAX_UPLOAD_SIZE_MB || 15);
    if (file.size > maxMb * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: `File vượt quá giới hạn ${maxMb}MB.` },
        { status: 400 }
      );
    }

    const ext = (file.name.split('.').pop() || '').toUpperCase();
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const savedPath = path.join(uploadDir, safeName);
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(savedPath, Buffer.from(arrayBuffer));

    const grade = Number(formData.get('grade') || auth.user.currentGrade || 8);
    const textbook = String(formData.get('textbook') || auth.user.preferredBook || 'KNTT');
    const semester = Number(formData.get('semester') || 1);
    const chapterId = String(formData.get('chapterId') || `G${grade}_C1`);

    // Nếu là file văn bản (.TXT, .MD, .CSV, .JSON) -> Đọc trực tiếp 100% không cần AI API
    if (['TXT', 'MD', 'CSV', 'JSON'].includes(ext)) {
      const extractedText = Buffer.from(arrayBuffer).toString('utf-8');
      const docRecord = {
        id: 'DOC_' + Date.now(),
        userId: auth.user.id,
        fileName: file.name,
        fileType: ext,
        fileSize: file.size,
        grade,
        textbook,
        semester,
        chapterId,
        topic: 'Tài liệu cá nhân',
        status: 'VERIFIED',
        uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        extractedText,
        extractedQuestionsCount: 1,
        isSeed: false,
      };
      auth.state.documents.unshift(docRecord);
      await writeServerStateAsync(auth.state);

      return NextResponse.json({
        ok: true,
        requiresApiKey: false,
        document: docRecord,
        fileName: file.name,
        fileType: ext,
        storagePath: `/uploads/${safeName}`,
        extractedText,
        notice: 'Đã đọc trực tiếp nội dung từ file văn bản (Không cần AI API).',
      });
    }

    // Nếu là file nhị phân / ảnh scan (PDF, DOCX, PNG, JPG, XLSX) -> Kiểm tra GEMINI_API_KEY / MATHPIX_APP_KEY
    const hasGemini = Boolean(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''
    );
    const hasMathpix = Boolean(
      process.env.MATHPIX_APP_KEY && process.env.MATHPIX_APP_KEY.trim() !== ''
    );

    if (!hasGemini && !hasMathpix) {
      return NextResponse.json({
        ok: false,
        requiresApiKey: true,
        fileName: file.name,
        fileType: ext,
        storagePath: `/uploads/${safeName}`,
        extractedText: '',
        message: `⚠️ Chưa cấu hình API Key OCR/AI (GEMINI_API_KEY hoặc MATHPIX_APP_KEY trong file .env). File "${file.name}" đã được lưu vào public/uploads/${safeName}, nhưng hệ thống KHÔNG giả lập trích xuất câu hỏi từ file ${ext} khi chưa có API Key. Vui lòng dùng file .TXT / .MD hoặc tự dán nội dung văn bản vào ô bên dưới.`,
      });
    }

    return NextResponse.json({
      ok: true,
      requiresApiKey: false,
      fileName: file.name,
      fileType: ext,
      storagePath: `/uploads/${safeName}`,
      extractedText: '',
      notice: 'Đã lưu file và sẵn sàng kết nối OCR.',
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Đã xảy ra lỗi khi tải lên tài liệu.' },
      { status: 500 }
    );
  }
}
