// ==============================================================================
// MathMaster THCS - API Xác Thực Riêng Cổng Quản Trị Viên (/api/admin/auth)
// Tương đương adminAuth.controller.js trong Tuyển Dụng IT
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  createDeviceSessionInState,
  getClientIp,
  readServerStateAsync,
  writeServerStateAsync,
  revokeSessionInState,
  extractSessionTokenFromRequest,
} from '@/lib/prisma';
import {
  checkLoginRateLimit,
  recordLoginFailure,
  resetLoginRateLimit,
  sanitizeUserForClient,
  signSessionToken,
  verifyPasswordWithMigrationAsync,
  verifySessionToken,
} from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

function setSessionCookie(res: NextResponse, token: string, rememberMe = false) {
  const maxAge = (rememberMe ? 30 : 1) * 24 * 60 * 60; // Admin mặc định 24h hoặc 30 ngày nếu chọn ghi nhớ
  res.cookies.set('mm_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  });
}

function clearSessionCookie(res: NextResponse) {
  res.cookies.set('mm_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'login';

    // 1. Thao tác Đăng xuất Quản trị viên (Logout)
    if (action === 'logout') {
      const state = await readServerStateAsync();
      const token = extractSessionTokenFromRequest(req);
      if (token) {
        const payload = verifySessionToken(token);
        if (payload?.sid && payload?.userId) {
          revokeSessionInState(state, payload.sid, payload.userId);
          await writeServerStateAsync(state);
        }
      }
      const res = NextResponse.json({
        ok: true,
        message: 'Đã đăng xuất khỏi cổng Quản trị viên thành công.',
      });
      clearSessionCookie(res);
      return res;
    }

    // 2. Thao tác Đăng nhập Quản trị viên (Login)
    const identifier = String(body.identifier || body.email || '').trim();
    const password = String(body.password || '').trim();
    const rememberMe = Boolean(body.rememberMe);
    const ip = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || 'Trình duyệt Admin';

    if (!identifier || !password) {
      return NextResponse.json(
        { ok: false, error: 'Vui lòng nhập đầy đủ Email/Tên đăng nhập và Mật khẩu Quản trị viên.' },
        { status: 400 }
      );
    }

    // Kiểm tra Rate limit đăng nhập
    const rateCheck = checkLoginRateLimit(ip, identifier);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          ok: false,
          code: 'RATE_LIMITED',
          error: `Bạn đã nhập sai mật khẩu quá 5 lần. Vui lòng đợi ${Math.ceil(rateCheck.retryAfterSeconds / 60)} phút trước khi thử lại.`,
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const state = await readServerStateAsync();
    const idLower = identifier.toLowerCase();

    // Tìm kiếm tài khoản theo email hoặc username
    const user = (state.users || []).find(
      (u: any) =>
        String(u.email || '').toLowerCase() === idLower ||
        String(u.username || '').toLowerCase() === idLower
    );

    // Kiểm tra trạng thái tạm khóa bảo vệ
    if (user && user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
      const retrySec = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 1000);
      return NextResponse.json(
        {
          ok: false,
          code: 'RATE_LIMITED',
          error: 'Tài khoản Quản trị đang bị tạm khoá bảo vệ. Vui lòng thử lại sau ít phút.',
          retryAfterSeconds: retrySec,
        },
        { status: 429 }
      );
    }

    // Xác thực mật khẩu
    const pwdCheck = user
      ? await verifyPasswordWithMigrationAsync(password, user.passwordHash)
      : { valid: false, needsRehash: false, isDefaultSeedPassword: false };

    if (!user || !pwdCheck.valid) {
      const failInfo = recordLoginFailure(ip, identifier);
      if (user) {
        user.failedLoginCount = Number(user.failedLoginCount || 0) + 1;
        if (user.failedLoginCount >= 5) {
          user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        }
        await writeServerStateAsync(state);
      }
      if (failInfo.locked) {
        return NextResponse.json(
          {
            ok: false,
            code: 'RATE_LIMITED',
            error: 'Bạn đã nhập sai mật khẩu quá 5 lần. Vui lòng đợi 15 phút trước khi thử lại.',
            retryAfterSeconds: failInfo.retryAfterSeconds,
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { ok: false, error: 'Email/Tên đăng nhập hoặc Mật khẩu Quản trị không chính xác.' },
        { status: 401 }
      );
    }

    // =========================================================================
    // ĐẶC ĐIỂM CỔNG RIÊNG ADMIN: Tuyệt đối chỉ cho phép tài khoản role === 'ADMIN'
    // =========================================================================
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Quyền truy cập bị từ chối: Cổng này chỉ dành riêng cho Quản trị viên (ADMIN). Học viên và giáo viên vui lòng đăng nhập tại trang đăng nhập chung (/login).',
        },
        { status: 403 }
      );
    }

    // Kiểm tra trạng thái tài khoản
    if (user.deletedAt) {
      return NextResponse.json(
        { ok: false, error: 'Tài khoản Quản trị viên này đã bị vô hiệu hóa hoặc xóa.' },
        { status: 403 }
      );
    }
    if (user.status === 'banned' || user.isBanned) {
      return NextResponse.json(
        { ok: false, error: user.banReason ? `Tài khoản Quản trị đã bị khóa: ${user.banReason}` : 'Tài khoản Quản trị đã bị khóa.' },
        { status: 403 }
      );
    }

    // Đăng nhập hợp lệ: Xóa bộ đếm lỗi
    resetLoginRateLimit(ip, identifier);
    user.failedLoginCount = 0;
    user.lockedUntil = null;

    // Tạo bản ghi phiên thiết bị
    const { session } = createDeviceSessionInState(state, {
      userId: user.id,
      userAgent,
      ipAddress: ip,
      rememberMe,
      deviceName: body.deviceName || 'Trình duyệt Quản trị',
    });

    // Ghi nhận Audit Log hành động Admin đăng nhập
    await logAdminAction({
      admin: user,
      action: 'admin.login',
      targetType: 'System',
      targetId: user.id,
      targetName: user.fullName,
      meta: {
        email: user.email,
        ip,
        userAgent,
        loginPortal: '/admin/login',
      },
      ip,
      state,
    });

    await writeServerStateAsync(state);

    const token = signSessionToken({
      userId: user.id,
      role: 'ADMIN',
      isGuest: false,
      sessionId: session.id,
      rememberMe,
    });

    const res = NextResponse.json({
      ok: true,
      message: `Xin chào Quản trị viên ${user.fullName}! Đăng nhập thành công.`,
      user: sanitizeUserForClient(user),
      redirect: body.redirect || '/admin/students',
    });

    setSessionCookie(res, token, rememberMe);
    return res;
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = extractSessionTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
  }
  const payload = verifySessionToken(token);
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 403 });
  }
  const state = await readServerStateAsync();
  const user = (state.users || []).find((u: any) => u.id === payload.userId);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 403 });
  }
  return NextResponse.json({
    ok: true,
    authenticated: true,
    admin: sanitizeUserForClient(user),
  });
}
