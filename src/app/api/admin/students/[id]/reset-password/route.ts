// ==============================================================================
// MathMaster THCS - API Đặt Lại Mật Khẩu Tạm Thời Học Viên (/api/admin/students/[id]/reset-password)
// Tương đương adminCandidate.controller.js (postResetPassword) trong Tuyển Dụng IT
// ==============================================================================

import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIp,
  requireRole,
  revokeAllOtherSessionsInState,
  writeServerStateAsync,
} from '@/lib/prisma';
import { hashPasswordAsync } from '@/lib/auth';
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

    // Sinh mật khẩu tạm thời ngẫu nhiên an toàn (chỉ hiển thị 1 lần cho Quản trị viên)
    const tempPassword = `Math@${crypto.randomBytes(3).toString('hex')}`;
    student.passwordHash = await hashPasswordAsync(tempPassword);
    student.mustChangePassword = true;
    student.failedLoginCount = 0;
    student.lockedUntil = null;
    student.updatedAt = new Date().toISOString();

    // Hủy toàn bộ phiên đăng nhập cũ trên mọi thiết bị
    revokeAllOtherSessionsInState(state, studentId, null);

    const clientIp = getClientIp(req);
    await logAdminAction({
      admin: auth.user,
      action: 'student.resetPassword',
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
      message: `Đặt lại mật khẩu thành công cho học viên ${student.fullName}.`,
      tempPassword,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
