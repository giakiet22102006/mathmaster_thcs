// ==============================================================================
// MathMaster THCS - API Mở Khóa Tài Khoản Học Viên (/api/admin/students/[id]/unban)
// Tương đương adminCandidate.controller.js (postUnban) trong Tuyển Dụng IT
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

    student.status = 'active';
    student.isBanned = false;
    student.banReason = '';
    student.bannedAt = null;
    student.lockedUntil = null;
    student.failedLoginCount = 0;
    student.updatedAt = new Date().toISOString();

    const clientIp = getClientIp(req);
    await logAdminAction({
      admin: auth.user,
      action: 'student.unban',
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
      message: `Đã mở khóa tài khoản học viên ${student.fullName}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
