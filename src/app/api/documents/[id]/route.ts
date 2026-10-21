// ==============================================================================
// MathMaster THCS - Chi Tiết & Xóa Tài Liệu (/api/documents/[id])
// Quản lý tài liệu theo quyền sở hữu (requireUser + userId isolation)
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireUser, writeServerStateAsync } from '@/lib/prisma';
import { deleteDocumentFile } from '@/lib/documents/storage';

export const dynamic = 'force-dynamic';

export async function GET(
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
        { ok: false, error: 'Bạn không có quyền xem tài liệu của người khác.' },
        { status: 403 }
      );
    }

    // Lấy danh sách câu hỏi thuộc tài liệu này
    const docQuestions = (auth.state.questions || []).filter((q: any) => q.sourceDocId === docId);

    return NextResponse.json({
      ok: true,
      document: doc,
      items: doc.items || docQuestions,
      extractedText: doc.extractedText || '',
      warnings: doc.parseWarnings || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Lỗi khi tải chi tiết tài liệu.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const { id: docId } = await params;
    const docIndex = (auth.state.documents || []).findIndex((d: any) => d.id === docId);

    if (docIndex === -1) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy tài liệu cần xóa.' }, { status: 404 });
    }

    const doc = auth.state.documents[docIndex];
    if (doc.userId !== auth.user.id && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { ok: false, error: 'Bạn không có quyền xóa tài liệu của người khác.' },
        { status: 403 }
      );
    }

    // 1. Xóa file vật lý qua storage driver
    if (doc.storagePath) {
      await deleteDocumentFile(doc.storagePath);
    }

    // 2. Xóa các câu hỏi liên kết trong state.questions
    if (Array.isArray(auth.state.questions)) {
      auth.state.questions = auth.state.questions.filter((q: any) => q.sourceDocId !== docId);
    }

    // 3. Xóa tài liệu khỏi state.documents
    auth.state.documents.splice(docIndex, 1);

    await writeServerStateAsync(auth.state);

    return NextResponse.json({
      ok: true,
      message: 'Đã xóa tài liệu và toàn bộ câu hỏi liên quan thành công.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Lỗi khi xóa tài liệu.' },
      { status: 500 }
    );
  }
}
