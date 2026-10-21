// ==============================================================================
// MathMaster THCS - API Xác Thực & Quản Lý Tài Khoản (/api/auth)
// ==============================================================================

import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  createDeviceSessionInState,
  getClientIp,
  getPrismaClient,
  readServerStateAsync,
  requireUser,
  revokeAllOtherSessionsInState,
  revokeSessionInState,
  writeServerStateAsync,
} from '@/lib/prisma';
import {
  changePasswordSchema,
  checkLoginRateLimit,
  defaultEmailService,
  hashPassword,
  hashResetToken,
  loginSchema,
  passwordPolicySchema,
  recordLoginFailure,
  registerSchema,
  resetLoginRateLimit,
  sanitizeUserForClient,
  signSessionToken,
  verifyPassword,
  verifyPasswordWithMigration,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

function setSessionCookie(res: NextResponse, token: string, rememberMe = false) {
  const maxAge = (rememberMe ? 30 : 7) * 24 * 60 * 60;
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

function deleteUserCascadeFromState(state: any, targetUserId: string) {
  const target = (state.users || []).find((u: any) => u.id === targetUserId);
  if (!target) return { deleted: false, error: 'Không tìm thấy tài khoản cần xóa.' };

  state.users = (state.users || []).filter((u: any) => u.id !== targetUserId);
  state.sessions = (state.sessions || []).filter((s: any) => s.userId !== targetUserId);
  state.passwordResetTokens = (state.passwordResetTokens || []).filter(
    (t: any) => t.userId !== targetUserId
  );
  state.exams = (state.exams || []).filter((e: any) => e.userId !== targetUserId || e.isSeed);
  state.attempts = (state.attempts || []).filter((a: any) => a.userId !== targetUserId);
  state.documents = (state.documents || []).filter((d: any) => d.userId !== targetUserId);
  state.reviewQueue = (state.reviewQueue || []).filter((r: any) => r.userId !== targetUserId);
  state.userAchievements = (state.userAchievements || []).filter(
    (ua: any) => ua.userId !== targetUserId
  );
  state.learningGoals = (state.learningGoals || []).filter((g: any) => g.userId !== targetUserId);
  state.studySessions = (state.studySessions || []).filter((s: any) => s.userId !== targetUserId);
  state.topicMastery = (state.topicMastery || []).filter((tm: any) => tm.userId !== targetUserId);
  state.classroomMembers = (state.classroomMembers || []).filter(
    (cm: any) => cm.studentId !== targetUserId
  );

  return { deleted: true, deletedUser: sanitizeUserForClient(target) };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json(
        { ok: false, authenticated: false, error: auth.error },
        { status: auth.status }
      );
    }

    return NextResponse.json({
      ok: true,
      authenticated: true,
      user: sanitizeUserForClient(auth.user),
      session: {
        id: auth.session.id,
        deviceName: auth.session.deviceName,
        ipAddress: auth.session.ipAddress,
        createdAt: auth.session.createdAt,
        lastActiveAt: auth.session.lastActiveAt,
        expiresAt: auth.session.expiresAt,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, authenticated: false, error: 'Không thể kiểm tra phiên đăng nhập.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body || {};
    const state = await readServerStateAsync();
    const ip = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || 'Trình duyệt Web';

    // -------------------------------------------------------------------------
    // 1. ĐĂNG KÝ TÀI KHOẢN MỚI (Validate bằng Zod, kiểm tra trùng email, băm scrypt)
    // -------------------------------------------------------------------------
    if (action === 'register') {
      const parsed = registerSchema.safeParse(body);
      if (!parsed.success) {
        const firstErr = parsed.error.issues[0]?.message || 'Dữ liệu đăng ký không hợp lệ.';
        return NextResponse.json(
          { ok: false, error: firstErr, details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const data = parsed.data;
      const emailLower = data.email.toLowerCase();

      const emailExists = (state.users || []).some(
        (u: any) => String(u.email || '').toLowerCase() === emailLower
      );
      if (emailExists) {
        return NextResponse.json(
          { ok: false, error: 'Địa chỉ email này đã được sử dụng. Vui lòng chọn email khác.' },
          { status: 409 }
        );
      }

      // Sinh username duy nhất, không đoán được từ tên đơn thuần
      let baseUsername =
        data.username ||
        emailLower
          .split('@')[0]
          .replace(/[^a-z0-9_]/g, '_')
          .slice(0, 20) ||
        'hocsinh';
      if (baseUsername.length < 3) baseUsername = `hs_${baseUsername}`;
      let finalUsername = baseUsername;
      const usernameExists = (uname: string) =>
        (state.users || []).some(
          (u: any) => String(u.username || '').toLowerCase() === uname.toLowerCase()
        );
      if (usernameExists(finalUsername)) {
        if (data.username) {
          return NextResponse.json(
            { ok: false, error: 'Tên đăng nhập này đã tồn tại. Vui lòng chọn tên khác.' },
            { status: 409 }
          );
        }
        finalUsername = `${baseUsername}_${crypto.randomBytes(2).toString('hex')}`;
      }

      const nowIso = new Date().toISOString();
      const newUser = {
        id: `user_${crypto.randomUUID()}`,
        username: finalUsername,
        email: emailLower,
        passwordHash: hashPassword(data.password),
        mustChangePassword: false,
        passwordUpdatedAt: nowIso,
        failedLoginCount: 0,
        lockedUntil: null,
        fullName: data.fullName,
        role: data.role || 'STUDENT',
        isGuest: false,
        schoolName: data.schoolName || 'THCS Việt Nam',
        currentGrade: Number(data.currentGrade || 8),
        preferredBook: data.preferredBook || 'KNTT',
        xp: 0,
        level: 1,
        streakDays: 1,
        lastStudyDate: nowIso.slice(0, 10),
        theme: 'light',
        favoriteQuestionIds: [],
        anonymousLeaderboard: false,
        onboardingCompleted: false,
      };

      state.users.push(newUser);
      const { session } = createDeviceSessionInState(state, {
        userId: newUser.id,
        userAgent,
        ipAddress: ip,
        rememberMe: false,
        deviceName: body.deviceName,
        maxSessionsOverride: body.maxSessionsOverride,
      });
      await writeServerStateAsync(state);

      const token = signSessionToken({
        userId: newUser.id,
        role: newUser.role,
        isGuest: false,
        sessionId: session.id,
        rememberMe: false,
      });

      const res = NextResponse.json({
        ok: true,
        user: sanitizeUserForClient(newUser),
        session: {
          id: session.id,
          deviceName: session.deviceName,
          expiresAt: session.expiresAt,
        },
      });
      setSessionCookie(res, token, false);
      return res;
    }

    // -------------------------------------------------------------------------
    // 2. ĐĂNG NHẬP (Bắt buộc mật khẩu, Rate Limit, Tự động Rehash hash cũ, Phiên thiết bị)
    // -------------------------------------------------------------------------
    if (action === 'login') {
      const rawIdentifier = String(body.identifier ?? body.email ?? body.username ?? '').trim();
      const rawPassword = typeof body.password === 'string' ? body.password : '';
      const rememberMe = Boolean(body.rememberMe);

      // Tuyệt đối không cho đăng nhập nếu bỏ trống mật khẩu hoặc chỉ gửi userId
      const parsedLogin = loginSchema.safeParse({
        identifier: rawIdentifier,
        password: rawPassword,
        rememberMe,
      });
      if (!parsedLogin.success) {
        return NextResponse.json(
          { ok: false, error: 'Vui lòng nhập đầy đủ email/tên đăng nhập và mật khẩu.' },
          { status: 401 }
        );
      }

      // Kiểm tra giới hạn số lần đăng nhập sai theo IP + tài khoản
      const rl = checkLoginRateLimit(ip, rawIdentifier);
      if (!rl.allowed) {
        return NextResponse.json(
          {
            ok: false,
            code: 'RATE_LIMITED',
            error: `Tài khoản tạm thời bị khoá do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${Math.ceil(
              rl.retryAfterSeconds / 60
            )} phút.`,
            retryAfterSeconds: rl.retryAfterSeconds,
          },
          { status: 429 }
        );
      }

      const idLower = rawIdentifier.toLowerCase();
      const user = (state.users || []).find(
        (u: any) =>
          String(u.email || '').toLowerCase() === idLower ||
          String(u.username || '').toLowerCase() === idLower
      );

      if (user && user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
        const retrySec = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 1000);
        return NextResponse.json(
          {
            ok: false,
            code: 'RATE_LIMITED',
            error: 'Tài khoản đang bị tạm khoá bảo vệ. Vui lòng thử lại sau ít phút.',
            retryAfterSeconds: retrySec,
          },
          { status: 429 }
        );
      }

      const pwdCheck = user
        ? verifyPasswordWithMigration(rawPassword, user.passwordHash)
        : { valid: false, needsRehash: false, isDefaultSeedPassword: false };

      if (!user || !pwdCheck.valid) {
        const failInfo = recordLoginFailure(ip, rawIdentifier);
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
              error:
                'Bạn đã nhập sai mật khẩu quá 5 lần. Vui lòng đợi 15 phút trước khi thử lại.',
              retryAfterSeconds: failInfo.retryAfterSeconds,
            },
            { status: 429 }
          );
        }
        return NextResponse.json(
          { ok: false, error: 'Email hoặc mật khẩu không đúng.' },
          { status: 401 }
        );
      }

      // Đăng nhập hợp lệ: xoá bộ đếm lỗi
      resetLoginRateLimit(ip, rawIdentifier);
      user.failedLoginCount = 0;
      user.lockedUntil = null;

      // Migration người dùng cũ: băm lại theo chuẩn scrypt mới nếu đang dùng hash kiểu cũ
      if (pwdCheck.needsRehash) {
        user.passwordHash = hashPassword(rawPassword);
        user.passwordUpdatedAt = new Date().toISOString();
      }
      if (pwdCheck.isDefaultSeedPassword) {
        user.mustChangePassword = true;
      }

      // Tạo bản ghi phiên thiết bị riêng trong DB
      const { session, revokedSessionIds } = createDeviceSessionInState(state, {
        userId: user.id,
        userAgent,
        ipAddress: ip,
        rememberMe,
        deviceName: body.deviceName,
        maxSessionsOverride: body.maxSessionsOverride,
      });

      await writeServerStateAsync(state);

      const token = signSessionToken({
        userId: user.id,
        role: user.role || 'STUDENT',
        isGuest: Boolean(user.isGuest),
        sessionId: session.id,
        rememberMe,
      });

      const res = NextResponse.json({
        ok: true,
        user: sanitizeUserForClient(user),
        mustChangePassword: Boolean(user.mustChangePassword),
        session: {
          id: session.id,
          deviceName: session.deviceName,
          expiresAt: session.expiresAt,
        },
        revokedSessionIds,
      });
      setSessionCookie(res, token, rememberMe);
      return res;
    }

    // -------------------------------------------------------------------------
    // 3. ĐĂNG XUẤT (Thu hồi phiên thiết bị hiện tại & xoá cookie)
    // -------------------------------------------------------------------------
    if (action === 'logout') {
      const auth = await requireUser(req, state);
      if (auth.ok) {
        revokeSessionInState(state, auth.user.id, auth.session.id);
        await writeServerStateAsync(state);
      }
      const res = NextResponse.json({ ok: true, message: 'Đã đăng xuất thành công.' });
      clearSessionCookie(res);
      return res;
    }

    // -------------------------------------------------------------------------
    // 4. ĐỔI MẬT KHẨU (Yêu cầu mật khẩu cũ & thu hồi mọi phiên thiết bị khác)
    // -------------------------------------------------------------------------
    if (action === 'change-password') {
      const auth = await requireUser(req, state);
      if (!auth.ok) {
        return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
      }

      const parsed = changePasswordSchema.safeParse(body);
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message || 'Mật khẩu mới không hợp lệ.';
        return NextResponse.json({ ok: false, error: msg }, { status: 400 });
      }

      const isCurrentValid = verifyPassword(parsed.data.currentPassword, auth.user.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { ok: false, error: 'Mật khẩu hiện tại không đúng.' },
          { status: 401 }
        );
      }

      auth.user.passwordHash = hashPassword(parsed.data.newPassword);
      auth.user.mustChangePassword = false;
      auth.user.passwordUpdatedAt = new Date().toISOString();

      // Thu hồi toàn bộ các phiên trên thiết bị khác, chỉ giữ lại thiết bị hiện tại
      const revokedCount = revokeAllOtherSessionsInState(state, auth.user.id, auth.session.id);
      await writeServerStateAsync(state);

      return NextResponse.json({
        ok: true,
        message: 'Đã đổi mật khẩu thành công và đăng xuất các thiết bị khác.',
        revokedOtherSessionsCount: revokedCount,
        user: sanitizeUserForClient(auth.user),
      });
    }

    // -------------------------------------------------------------------------
    // 5. QUÊN MẬT KHẨU (Tạo token một lần có hạn 30 phút)
    // -------------------------------------------------------------------------
    if (action === 'forgot-password') {
      const emailInput = String(body.email || '').trim().toLowerCase();
      if (!emailInput) {
        return NextResponse.json(
          { ok: false, error: 'Vui lòng nhập địa chỉ email cần đặt lại mật khẩu.' },
          { status: 400 }
        );
      }

      const targetUser = (state.users || []).find(
        (u: any) => String(u.email || '').toLowerCase() === emailInput && !u.isGuest
      );

      let devResetToken: string | undefined;
      let devResetUrl: string | undefined;

      if (targetUser) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = hashResetToken(rawToken);
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 phút

        state.passwordResetTokens = (state.passwordResetTokens || []).filter(
          (t: any) => t.userId !== targetUser.id || t.usedAt
        );
        state.passwordResetTokens.push({
          id: `rst_${crypto.randomUUID()}`,
          userId: targetUser.id,
          tokenHash,
          expiresAt,
          usedAt: null,
          createdAt: new Date().toISOString(),
        });

        await writeServerStateAsync(state);

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetUrl = `${appUrl}/login?resetToken=${rawToken}`;
        await defaultEmailService.sendPasswordResetEmail({
          toEmail: targetUser.email,
          fullName: targetUser.fullName,
          resetUrl,
          expiresInMinutes: 30,
        });

        if (process.env.NODE_ENV !== 'production') {
          devResetToken = rawToken;
          devResetUrl = resetUrl;
        }
      }

      return NextResponse.json({
        ok: true,
        message:
          'Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu (hiệu lực 30 phút) đã được gửi.',
        ...(devResetToken ? { devResetToken, devResetUrl } : {}),
      });
    }

    // -------------------------------------------------------------------------
    // 6. ĐẶT LẠI MẬT KHẨU BẰNG TOKEN 1 LẦN
    // -------------------------------------------------------------------------
    if (action === 'reset-password') {
      const rawToken = String(body.token || '').trim();
      const newPassword = String(body.newPassword || '');

      if (!rawToken) {
        return NextResponse.json(
          { ok: false, error: 'Thiếu mã xác thực đặt lại mật khẩu.' },
          { status: 400 }
        );
      }

      const pwdCheck = passwordPolicySchema.safeParse(newPassword);
      if (!pwdCheck.success) {
        return NextResponse.json(
          { ok: false, error: pwdCheck.error.issues[0]?.message || 'Mật khẩu mới không hợp lệ.' },
          { status: 400 }
        );
      }

      const tokenHash = hashResetToken(rawToken);
      const tokenRecord = (state.passwordResetTokens || []).find(
        (t: any) => t.tokenHash === tokenHash
      );

      if (
        !tokenRecord ||
        tokenRecord.usedAt ||
        new Date(tokenRecord.expiresAt).getTime() <= Date.now()
      ) {
        return NextResponse.json(
          { ok: false, error: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn (30 phút).' },
          { status: 400 }
        );
      }

      const targetUser = (state.users || []).find((u: any) => u.id === tokenRecord.userId);
      if (!targetUser) {
        return NextResponse.json(
          { ok: false, error: 'Tài khoản không tồn tại.' },
          { status: 404 }
        );
      }

      tokenRecord.usedAt = new Date().toISOString();
      targetUser.passwordHash = hashPassword(newPassword);
      targetUser.mustChangePassword = false;
      targetUser.passwordUpdatedAt = new Date().toISOString();
      targetUser.failedLoginCount = 0;
      targetUser.lockedUntil = null;

      // Thu hồi toàn bộ phiên đăng nhập cũ của tài khoản
      revokeAllOtherSessionsInState(state, targetUser.id, null);
      await writeServerStateAsync(state);

      return NextResponse.json({
        ok: true,
        message: 'Đã đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.',
      });
    }

    // -------------------------------------------------------------------------
    // 7. XOÁ TÀI KHOẢN (Bắt buộc đăng nhập & xác nhận mật khẩu của chính mình)
    // -------------------------------------------------------------------------
    if (action === 'delete') {
      const auth = await requireUser(req, state);
      if (!auth.ok) {
        return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
      }

      const targetUserId = body.userId ? String(body.userId) : auth.user.id;
      const isSelf = targetUserId === auth.user.id;

      // Không cho phép người dùng thường xoá tài khoản của người khác
      if (!isSelf && auth.user.role !== 'ADMIN') {
        return NextResponse.json(
          { ok: false, error: 'Bạn không có quyền xóa tài khoản của người dùng khác.' },
          { status: 403 }
        );
      }

      // Khi tự xoá tài khoản chính thức, bắt buộc phải nhập lại mật khẩu đúng
      if (isSelf && !auth.user.isGuest) {
        const confirmPwd = String(body.password || '');
        if (!confirmPwd || !verifyPassword(confirmPwd, auth.user.passwordHash)) {
          return NextResponse.json(
            { ok: false, error: 'Vui lòng nhập đúng mật khẩu hiện tại để xác nhận xóa tài khoản.' },
            { status: 401 }
          );
        }
      }

      const result = deleteUserCascadeFromState(state, targetUserId);
      if (!result.deleted) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
      }
      await writeServerStateAsync(state);

      try {
        const prisma = await getPrismaClient();
        if (prisma && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('CHANGE_ME')) {
          await prisma.users.delete({ where: { id: targetUserId } }).catch(() => {});
        }
      } catch {}

      const res = NextResponse.json({
        ok: true,
        deletedUserId: targetUserId,
      });
      if (isSelf) {
        clearSessionCookie(res);
      }
      return res;
    }

    // -------------------------------------------------------------------------
    // 8. CHẾ ĐỘ KHÁCH (Chỉ dùng thử tạm thời, cô lập phiên riêng)
    // -------------------------------------------------------------------------
    if (action === 'guest') {
      const nowIso = new Date().toISOString();
      const guestId = `guest_${crypto.randomUUID()}`;
      const guestUser = {
        id: guestId,
        username: `khach_${guestId.slice(6, 12)}`,
        email: `${guestId}@guest.local`,
        passwordHash: hashPassword(crypto.randomBytes(16).toString('hex')),
        mustChangePassword: false,
        fullName: 'Học sinh Khách (Dùng thử)',
        role: 'STUDENT',
        isGuest: true,
        schoolName: 'Chế độ Khách',
        currentGrade: Number(body.currentGrade || 8),
        preferredBook: body.preferredBook || 'KNTT',
        xp: 0,
        level: 1,
        streakDays: 1,
        lastStudyDate: nowIso.slice(0, 10),
        theme: 'light',
        favoriteQuestionIds: [],
        anonymousLeaderboard: true,
        onboardingCompleted: true,
      };

      state.users.push(guestUser);
      const { session } = createDeviceSessionInState(state, {
        userId: guestUser.id,
        userAgent,
        ipAddress: ip,
        rememberMe: false,
      });
      await writeServerStateAsync(state);

      const token = signSessionToken(
        {
          userId: guestUser.id,
          role: 'STUDENT',
          isGuest: true,
          sessionId: session.id,
          rememberMe: false,
        },
        { expiresInSeconds: 24 * 60 * 60 }
      );

      const res = NextResponse.json({
        ok: true,
        user: sanitizeUserForClient(guestUser),
        session: { id: session.id, deviceName: session.deviceName, expiresAt: session.expiresAt },
      });
      setSessionCookie(res, token, false);
      return res;
    }

    return NextResponse.json({ ok: false, error: 'Hành động không hợp lệ.' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Đã xảy ra lỗi khi xử lý yêu cầu xác thực. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
