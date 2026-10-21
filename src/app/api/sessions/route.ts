// ==============================================================================
// MathMaster THCS - API Quản Lý Thiết Bị Đăng Nhập (/api/sessions)
// Liệt kê phiên đăng nhập theo từng thiết bị, đăng xuất 1 thiết bị hoặc tất cả thiết bị khác
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getMaxSessionsPerUser,
  requireUser,
  revokeAllOtherSessionsInState,
  revokeSessionInState,
  writeServerStateAsync,
} from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const nowMs = Date.now();
    const userSessions = (auth.state.sessions || [])
      .filter((s: any) => s.userId === auth.user.id)
      .sort(
        (a: any, b: any) =>
          new Date(b.lastActiveAt || b.createdAt).getTime() -
          new Date(a.lastActiveAt || a.createdAt).getTime()
      )
      .map((s: any) => {
        const isExpired = new Date(s.expiresAt).getTime() <= nowMs;
        const isRevoked = Boolean(s.revokedAt);
        return {
          id: s.id,
          deviceName: s.deviceName,
          userAgent: s.userAgent,
          ipAddress: s.ipAddress,
          rememberMe: Boolean(s.rememberMe),
          createdAt: s.createdAt,
          lastActiveAt: s.lastActiveAt,
          expiresAt: s.expiresAt,
          revokedAt: s.revokedAt,
          isActive: !isRevoked && !isExpired,
          isCurrent: s.id === auth.session.id,
        };
      });

    return NextResponse.json({
      ok: true,
      maxSessionsPerUser: getMaxSessionsPerUser(),
      currentSessionId: auth.session.id,
      sessions: userSessions,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể tải danh sách thiết bị đăng nhập.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const { sessionId, revokeOthers } = body || {};

    if (revokeOthers) {
      const revokedCount = revokeAllOtherSessionsInState(
        auth.state,
        auth.user.id,
        auth.session.id
      );
      await writeServerStateAsync(auth.state);
      return NextResponse.json({
        ok: true,
        revokedCount,
        message: `Đã đăng xuất thành công ${revokedCount} thiết bị khác.`,
      });
    }

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: 'Thiếu mã phiên thiết bị cần đăng xuất.' },
        { status: 400 }
      );
    }

    const target = (auth.state.sessions || []).find((s: any) => s.id === sessionId);
    if (!target) {
      return NextResponse.json(
        { ok: false, error: 'Không tìm thấy phiên đăng nhập này.' },
        { status: 404 }
      );
    }

    // Không cho phép thu hồi phiên của tài khoản khác
    if (target.userId !== auth.user.id) {
      return NextResponse.json(
        { ok: false, error: 'Bạn không có quyền thao tác trên phiên của tài khoản khác.' },
        { status: 403 }
      );
    }

    revokeSessionInState(auth.state, auth.user.id, sessionId);
    await writeServerStateAsync(auth.state);

    const isSelfSession = sessionId === auth.session.id;
    const res = NextResponse.json({
      ok: true,
      revokedSessionId: sessionId,
      loggedOutCurrentDevice: isSelfSession,
      message: isSelfSession
        ? 'Đã đăng xuất khỏi thiết bị hiện tại.'
        : 'Đã thu hồi phiên đăng nhập trên thiết bị được chọn.',
    });

    if (isSelfSession) {
      res.cookies.set('mm_session', '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
      });
    }

    return res;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể thu hồi phiên đăng nhập.' },
      { status: 500 }
    );
  }
}
