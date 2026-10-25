// ==============================================================================
// MathMaster THCS - API Thao Tác Hàng Loạt Trên Học Viên (/api/admin/students/bulk)
// Tương đương adminCandidate.controller.js (postBulkAction) trong Tuyển Dụng IT
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

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN']);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    const body = await req.json().catch(() => ({}));
    const { action, ids = [], reason = '' } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Vui lòng chọn ít nhất một học viên để thực hiện thao tác.' },
        { status: 400 }
      );
    }

    const validActions = ['ban', 'unban', 'delete', 'restore'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { ok: false, error: 'Hành động hàng loạt không hợp lệ.' },
        { status: 400 }
      );
    }

    if (action === 'ban' && !reason.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Vui lòng nhập lý do khóa hàng loạt bắt buộc.' },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    let affectedCount = 0;
    const affectedNames: string[] = [];

    for (const id of ids) {
      const student = (state.users || []).find((u: any) => u.id === id);
      if (!student || student.role !== 'STUDENT') continue;

      if (action === 'ban') {
        student.status = 'banned';
        student.isBanned = true;
        student.banReason = reason.trim();
        student.bannedAt = nowIso;
        student.updatedAt = nowIso;
        revokeAllOtherSessionsInState(state, id, null);
      } else if (action === 'unban') {
        student.status = 'active';
        student.isBanned = false;
        student.banReason = '';
        student.bannedAt = null;
        student.lockedUntil = null;
        student.failedLoginCount = 0;
        student.updatedAt = nowIso;
      } else if (action === 'delete') {
        student.deletedAt = nowIso;
        student.updatedAt = nowIso;
        revokeAllOtherSessionsInState(state, id, null);
      } else if (action === 'restore') {
        student.deletedAt = null;
        student.updatedAt = nowIso;
      }

      affectedCount++;
      affectedNames.push(student.fullName || student.username);
    }

    const clientIp = getClientIp(req);
    await logAdminAction({
      admin: auth.user,
      action: `student.bulk.${action}`,
      targetType: 'Student',
      targetId: ids.join(','),
      targetName: `${affectedCount} học viên`,
      meta: {
        action,
        count: affectedCount,
        studentIds: ids,
        reason: reason.trim(),
        names: affectedNames.slice(0, 5),
      },
      ip: clientIp,
      state,
    });

    await writeServerStateAsync(state);

    const actionTextMap: Record<string, string> = {
      ban: 'Khóa',
      unban: 'Mở khóa',
      delete: 'Xóa mềm',
      restore: 'Khôi phục',
    };

    return NextResponse.json({
      ok: true,
      message: `Đã ${actionTextMap[action]} thành công ${affectedCount} học viên đã chọn.`,
      affectedCount,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
