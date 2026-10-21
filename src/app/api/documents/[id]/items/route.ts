// ==============================================================================
// MathMaster THCS - Cập Nhật & Duyệt Câu Hỏi Từ Tài Liệu (/api/documents/[id]/items)
// Cho phép sửa chương, mức độ nhận thức, đáp án, phương án và xác nhận duyệt
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireUser, writeServerStateAsync } from '@/lib/prisma';
import type { ParsedDocumentItem } from '@/lib/documents/segment';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const { id: docId } = await params;
    const doc = (auth.state.documents || []).find((d: any) => d.id === docId);

    if (!doc) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy tài liệu.' }, { status: 404 });
    }

    if (doc.userId !== auth.user.id && auth.user.role !== 'ADMIN' && auth.user.role !== 'TEACHER') {
      return NextResponse.json(
        { ok: false, error: 'Bạn không có quyền chỉnh sửa tài liệu của người khác.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { items: updatedItems } = body as { items?: ParsedDocumentItem[] };

    if (!Array.isArray(updatedItems)) {
      return NextResponse.json(
        { ok: false, error: 'Dữ liệu items cập nhật phải là một mảng.' },
        { status: 400 }
      );
    }

    // Cập nhật danh sách items trong doc
    doc.items = updatedItems;
    doc.extractedQuestionsCount = updatedItems.length;
    doc.needsReviewCount = updatedItems.filter((it) => it.needsReview).length;
    if (doc.needsReviewCount === 0) {
      doc.status = 'VERIFIED';
    }

    // Đồng bộ lại vào state.questions
    if (Array.isArray(auth.state.questions)) {
      // Xóa các câu hỏi cũ của tài liệu này
      auth.state.questions = auth.state.questions.filter((q: any) => q.sourceDocId !== docId);

      // Thêm lại các câu hỏi đã cập nhật
      for (const item of updatedItems) {
        auth.state.questions.push({
          id: item.id,
          code: `DOC_Q_${item.order}_${docId.slice(-4)}`,
          userId: auth.user.id,
          sourceDocId: docId,
          sourceLabel: `Tài liệu: ${doc.fileName}`,
          grade: item.grade,
          chapterId: item.chapterId,
          topic: item.topic || doc.topic || 'Tài liệu cá nhân',
          problemType: item.problemType || 'Bài tập trích xuất',
          type: item.type,
          difficulty: item.difficulty,
          cognitiveLevel: item.cognitiveLevel,
          content: item.content,
          options: item.options || [],
          correctAnswer: item.correctAnswer,
          solution: item.solution || '',
          defaultPoints: item.defaultPoints,
          verificationStatus: item.needsReview ? 'draft' : 'verified',
          needsReview: item.needsReview,
          reviewReason: item.reviewReason,
          isSeed: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    await writeServerStateAsync(auth.state);

    return NextResponse.json({
      ok: true,
      document: doc,
      items: doc.items,
      message: 'Đã cập nhật câu hỏi thành công.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Lỗi khi cập nhật câu hỏi tài liệu.' },
      { status: 500 }
    );
  }
}
