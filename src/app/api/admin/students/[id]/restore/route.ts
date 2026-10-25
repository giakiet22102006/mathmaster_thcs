// ==============================================================================
// MathMaster THCS - API Khôi Phục Học Viên Đã Xóa Mềm (/api/admin/students/[id]/restore)
// Tương đương adminCandidate.controller.js (postRestore) trong Tuyển Dụng IT
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIp,
  requireRole,
  writeServerStateAsync,
} from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRole(req, ['ADMIN']);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    const studentId = params.id;

    const student = (state.users || []).find((u: any) => u.id === studentId);
    if (!student) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy học viên.' }, { status: 404 });
    }

    student.deletedAt = null;
    student.updatedAt = new Date().toISOString();

    const clientIp = getClientIp(req);
    await logAdminAction({
      admin: auth.user,
      action: 'student.restore',
      targetType: 'Student',
      targetId: studentId,
      targetName: student.fullName,
      meta: {
        email: student.email,
      },
      ip: clientIp,
      state,
    });

    await writeServerStateAsync(state);

    return NextResponse.json({
      ok: true,
      message: `Đã khôi phục tài khoản học viên ${student.fullName}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
