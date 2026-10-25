// ==============================================================================
// MathMaster THCS - API Khóa Tài Khoản Học Viên (/api/admin/students/[id]/ban)
// Tương đương adminCandidate.controller.js (postBan) trong Tuyển Dụng IT
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIp,
  requireRole,
  revokeAllOtherSessionsInState,
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
    const body = await req.json().catch(() => ({}));
    const reason = (body.reason || '').trim();

    if (!reason) {
      return NextResponse.json(
        { ok: false, error: 'Vui lòng nhập lý do khóa tài khoản bắt buộc.' },
        { status: 400 }
      );
    }

    const student = (state.users || []).find((u: any) => u.id === studentId);
    if (!student) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy học viên.' }, { status: 404 });
    }

    student.status = 'banned';
    student.isBanned = true;
    student.banReason = reason;
    student.bannedAt = new Date().toISOString();
    student.updatedAt = new Date().toISOString();

    // Hủy ngay toàn bộ phiên hoạt động của học viên
    revokeAllOtherSessionsInState(state, studentId, null);

    const clientIp = getClientIp(req);
    await logAdminAction({
      admin: auth.user,
      action: 'student.ban',
      targetType: 'Student',
      targetId: studentId,
      targetName: student.fullName,
      meta: {
        reason,
        email: student.email,
        bannedAt: student.bannedAt,
      },
      ip: clientIp,
      state,
    });

    await writeServerStateAsync(state);

    return NextResponse.json({
      ok: true,
      message: `Đã khóa tài khoản học viên ${student.fullName}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
