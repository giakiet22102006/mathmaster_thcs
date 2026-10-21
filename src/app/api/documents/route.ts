// ==============================================================================
// MathMaster THCS - API Tải Lên & Trích Xuất Tài Liệu Học Tập (/api/documents)
// Hỗ trợ lưu trữ đa môi trường (Local / Vercel Blob / Memory), bóc tách đa định dạng (DOCX, PDF, XLSX, TXT)
// Bảo vệ bằng requireUser, lấy userId từ session, kiểm soát truy cập theo chủ sở hữu
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireUser, writeServerStateAsync } from '@/lib/prisma';
import { saveDocumentFile } from '@/lib/documents/storage';
import { extractTextFromDocument } from '@/lib/documents/extract';
import { segmentQuestionsFromText } from '@/lib/documents/segment';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Hỗ trợ xử lý tài liệu lớn tới 60 giây

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

    // Hỗ trợ cả trường 'file' đơn lẻ và 'files' nhiều tệp
    const files: File[] = [];
    const singleFile = formData.get('file') as File | null;
    if (singleFile) {
      files.push(singleFile);
    } else {
      const allFiles = formData.getAll('files') as File[];
      for (const f of allFiles) {
        if (f && f.name) files.push(f);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy file tải lên.' }, { status: 400 });
    }

    const maxMb = Number(process.env.MAX_UPLOAD_SIZE_MB || 20);
    const grade = Number(formData.get('grade') || auth.user.currentGrade || 8);
    const textbook = String(formData.get('textbook') || auth.user.preferredBook || 'KNTT');
    const semester = Number(formData.get('semester') || 1);
    const chapterId = String(formData.get('chapterId') || `G${grade}_C1`);

    const createdDocuments: any[] = [];
    const allWarnings: string[] = [];

    for (const file of files) {
      if (file.size > maxMb * 1024 * 1024) {
        return NextResponse.json(
          { ok: false, error: `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn ${maxMb}MB.` },
          { status: 400 }
        );
      }

      const ext = (file.name.split('.').pop() || '').toUpperCase();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 1. Lưu file bằng Storage Driver trừu tượng (an toàn trên Vercel read-only)
      const storageResult = await saveDocumentFile(file.name, buffer, file.type || 'application/octet-stream');

      // 2. Trích xuất văn bản theo định dạng
      const extractResult = await extractTextFromDocument(file.name, buffer, file.type);

      if (!extractResult.ok) {
        if (extractResult.requiresApiKey) {
          return NextResponse.json({
            ok: false,
            requiresApiKey: true,
            fileName: file.name,
            fileType: ext,
            storagePath: storageResult.storagePath,
            message: extractResult.errorMessage,
            warnings: extractResult.warnings,
          }, { status: 422 });
        }

        return NextResponse.json({
          ok: false,
          error: extractResult.errorMessage || 'Không thể trích xuất văn bản từ tài liệu.',
          warnings: extractResult.warnings,
        }, { status: 400 });
      }

      // 3. Bóc tách câu hỏi, phương án, đáp án và lời giải
      const segmentResult = segmentQuestionsFromText(extractResult.text, {
        grade,
        chapterId,
        defaultBook: textbook,
      });

      const docId = `DOC_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const docRecord = {
        id: docId,
        userId: auth.user.id,
        fileName: file.name,
        fileType: ext,
        fileSize: file.size,
        storagePath: storageResult.storagePath,
        publicUrl: storageResult.publicUrl,
        driver: storageResult.driver,
        grade,
        textbook,
        semester,
        chapterId,
        topic: segmentResult.items[0]?.topic || 'Tài liệu cá nhân',
        status: segmentResult.items.length > 0 ? 'EXTRACTED' : 'FAILED',
        uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        extractedText: extractResult.text,
        extractedQuestionsCount: segmentResult.items.length,
        items: segmentResult.items,
        parseWarnings: [...extractResult.warnings, ...segmentResult.warnings],
        needsReviewCount: segmentResult.needsReviewCount,
        isSeed: false,
      };

      // Thêm câu hỏi đã bóc tách vào ngân hàng cá nhân của người dùng trong state
      if (!Array.isArray(auth.state.questions)) {
        auth.state.questions = [];
      }
      for (const item of segmentResult.items) {
        auth.state.questions.push({
          id: item.id,
          code: `DOC_Q_${item.order}_${docId.slice(-4)}`,
          userId: auth.user.id,
          sourceDocId: docId,
          sourceLabel: `Tài liệu: ${file.name}`,
          grade: item.grade,
          chapterId: item.chapterId,
          topic: item.topic || 'Tài liệu cá nhân',
          problemType: item.problemType || 'Bài tập trích xuất',
          type: item.type,
          difficulty: item.difficulty,
          cognitiveLevel: item.cognitiveLevel,
          content: item.content,
          options: item.options || [],
          correctAnswer: item.correctAnswer,
          solution: item.solution || '',
          defaultPoints: item.defaultPoints,
          verificationStatus: item.verificationStatus,
          needsReview: item.needsReview,
          reviewReason: item.reviewReason,
          isSeed: false,
          created_at: new Date().toISOString(),
        });
      }

      // 4. Mở khóa thành tựu ACH_DOC_UPLOAD nếu trích xuất thành công ≥ 1 mục
      if (segmentResult.items.length >= 1) {
        if (!Array.isArray(auth.state.achievements)) auth.state.achievements = [];
        const hasAch = auth.state.achievements.some(
          (a: any) => a.userId === auth.user.id && (a.id === 'ACH_DOC_UPLOAD' || a.achievementId === 'ACH_DOC_UPLOAD')
        );
        if (!hasAch) {
          auth.state.achievements.push({
            id: 'ACH_DOC_UPLOAD',
            achievementId: 'ACH_DOC_UPLOAD',
            userId: auth.user.id,
            unlockedAt: new Date().toISOString(),
            title: 'Kho học liệu số',
            description: 'Tải lên và bóc tách thành công tài liệu học tập đầu tiên.',
          });
        }
      }

      auth.state.documents.unshift(docRecord);
      createdDocuments.push(docRecord);
      allWarnings.push(...docRecord.parseWarnings);
    }

    await writeServerStateAsync(auth.state);

    const firstDoc = createdDocuments[0];
    return NextResponse.json({
      ok: true,
      document: firstDoc,
      documents: createdDocuments,
      items: firstDoc.items,
      extractedQuestionsCount: firstDoc.extractedQuestionsCount,
      warnings: allWarnings,
      notice: `Đã trích xuất thành công ${firstDoc.extractedQuestionsCount} câu hỏi từ tài liệu.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Đã xảy ra lỗi khi tải lên tài liệu.' },
      { status: 500 }
    );
  }
}
