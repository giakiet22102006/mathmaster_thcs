// ==============================================================================
// MathMaster THCS - API Xác Thực & Quản Lý Tài Khoản (/api/auth)
// ==============================================================================

import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  createDeviceSessionInState,
  getClientIp,
  getPrismaClient,
  invalidateDashboardCache,
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
  generateResetCode,
  hashPasswordAsync,
  hashResetCode,
  hashResetToken,
  loginSchema,
  passwordPolicySchema,
  recordLoginFailure,
  registerSchema,
  resetLoginRateLimit,
  sanitizeUserForClient,
  signSessionToken,
  verifyPasswordWithMigrationAsync,
  verifyResetCode,
} from '@/lib/auth';
import { AUTH_ACTIONS, normalizeAuthAction } from '@/lib/auth-actions';
import { isSmtpConfigured } from '@/lib/mailer';

export const runtime = 'nodejs';
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
    const rawAction = body?.action || req.nextUrl.searchParams.get('action') || '';
    const action = normalizeAuthAction(rawAction);
    const state = await readServerStateAsync();
    const ip = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || 'Trình duyệt Web';

    // -------------------------------------------------------------------------
    // 1A. GỬI MÃ XÁC THỰC GMAIL KHI ĐĂNG KÝ (OTP 6 chữ số, thời hạn 15 phút)
    // -------------------------------------------------------------------------
    if (action === AUTH_ACTIONS.SEND_REGISTER_OTP || action === 'send-register-otp') {
      const emailInput = String(body.email || '').trim().toLowerCase();
      const fullNameInput = String(body.fullName || '').trim();

      if (!emailInput || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
        return NextResponse.json(
          { ok: false, error: 'Vui lòng nhập địa chỉ email hợp lệ.' },
          { status: 400 }
        );
      }

      // Kiểm tra email đã được đăng ký tài khoản chưa
      const emailExists = (state.users || []).some(
        (u: any) => String(u.email || '').toLowerCase() === emailInput
      );
      if (emailExists) {
        return NextResponse.json(
          { ok: false, error: 'Địa chỉ email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.' },
          { status: 409 }
        );
      }

      // Rate limit gửi mã xác thực theo IP + email (tối đa 5 lần / giờ, cooldown 60s)
      const otpRlKey = `reg_otp_${emailInput}`;
      const otpCheck = checkLoginRateLimit(ip, otpRlKey, {
        maxFailures: 5,
        windowMs: 60 * 60 * 1000,
        lockoutMs: 60 * 60 * 1000,
      });
      if (otpCheck.locked) {
        return NextResponse.json(
          {
            ok: false,
            error: `Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng thử lại sau ${otpCheck.retryAfterSeconds} giây.`,
          },
          { status: 429 }
        );
      }

      // Cooldown 60s giữa 2 lần gửi mã
      if (!Array.isArray(state.emailVerificationTokens)) state.emailVerificationTokens = [];
      const userTokens = state.emailVerificationTokens.filter((t: any) => t.email === emailInput);
      const lastToken = userTokens[userTokens.length - 1];
      if (lastToken && lastToken.createdAt) {
        const elapsedSec = (Date.now() - new Date(lastToken.createdAt).getTime()) / 1000;
        if (elapsedSec < 60) {
          const waitSec = Math.ceil(60 - elapsedSec);
          return NextResponse.json(
            {
              ok: false,
              error: `Vui lòng đợi thêm ${waitSec} giây trước khi yêu cầu mã mới.`,
            },
            { status: 429 }
          );
        }
      }

      const rawCode = generateResetCode();
      const codeHash = hashResetCode(emailInput, rawCode);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      // Vô hiệu hóa các mã cũ chưa dùng
      state.emailVerificationTokens = state.emailVerificationTokens.map((t: any) =>
        t.email === emailInput && !t.verified
          ? { ...t, expiresAt: new Date(0).toISOString() }
          : t
      );

      state.emailVerificationTokens.push({
        id: `ev_${crypto.randomUUID()}`,
        email: emailInput,
        codeHash,
        expiresAt,
        verified: false,
        usedAt: null,
        attempts: 0,
        maxAttempts: 5,
        createdAt: new Date().toISOString(),
      });

      await writeServerStateAsync(state);

      let devCode: string | undefined;
      const smtpReady = isSmtpConfigured();

      if (!smtpReady) {
        devCode = rawCode;
      } else {
        const mailRes = await defaultEmailService.sendRegistrationVerificationEmail({
          toEmail: emailInput,
          fullName: fullNameInput || 'bạn',
          code: rawCode,
          expiresInMinutes: 15,
        });

        if (!mailRes.sent) {
          return NextResponse.json(
            {
              ok: false,
              code: mailRes.reason || 'SMTP_SEND_FAILED',
              error: 'Không thể gửi email xác thực. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau.',
            },
            { status: 503 }
          );
        }
      }

      return NextResponse.json({
        ok: true,
        message: 'Mã xác thực 6 số (hiệu lực 15 phút) đã được gửi tới Gmail của bạn.',
        ...(devCode && process.env.NODE_ENV !== 'production' ? { devCode } : {}),
      });
    }

    // -------------------------------------------------------------------------
    // 1B. KIỂM TRA MÃ XÁC THỰC GMAIL (Trước khi submit form)
    // -------------------------------------------------------------------------
    if (action === AUTH_ACTIONS.VERIFY_REGISTER_OTP || action === 'verify-register-otp') {
      const emailInput = String(body.email || '').trim().toLowerCase();
      const codeInput = String(body.code || body.otp || '').trim();

      if (!emailInput) {
        return NextResponse.json({ ok: false, error: 'Vui lòng cung cấp địa chỉ email.' }, { status: 400 });
      }
      if (!codeInput || !/^\d{6}$/.test(codeInput)) {
        return NextResponse.json({ ok: false, error: 'Mã xác thực phải gồm đúng 6 chữ số.' }, { status: 400 });
      }

      if (!Array.isArray(state.emailVerificationTokens)) state.emailVerificationTokens = [];
      const validToken = state.emailVerificationTokens
        .filter((t: any) => t.email === emailInput && !t.usedAt)
        .reverse()
        .find((t: any) => new Date(t.expiresAt).getTime() > Date.now());

      if (!validToken) {
        return NextResponse.json(
          { ok: false, error: 'Mã xác thực không tồn tại hoặc đã hết hạn (15 phút). Vui lòng yêu cầu mã mới.' },
          { status: 400 }
        );
      }

      if (validToken.attempts >= validToken.maxAttempts) {
        return NextResponse.json(
          { ok: false, error: 'Mã xác thực đã bị khóa do nhập sai quá 5 lần. Vui lòng yêu cầu mã mới.' },
          { status: 400 }
        );
      }

      const isValid = verifyResetCode(emailInput, codeInput, validToken.codeHash);
      if (!isValid) {
        validToken.attempts = (validToken.attempts || 0) + 1;
        const remain = validToken.maxAttempts - validToken.attempts;
        await writeServerStateAsync(state);
        return NextResponse.json(
          {
            ok: false,
            error: remain > 0 ? `Mã xác thực không đúng. Bạn còn ${remain} lần thử.` : 'Mã đã bị khóa do nhập sai 5 lần.',
          },
          { status: 400 }
        );
      }

      validToken.verified = true;
      validToken.verifiedAt = new Date().toISOString();
      await writeServerStateAsync(state);

      return NextResponse.json({
        ok: true,
        verified: true,
        message: 'Xác thực Gmail thành công!',
      });
    }

    // -------------------------------------------------------------------------
    // 1C. ĐĂNG KÝ TÀI KHOẢN MỚI (Validate bằng Zod, kiểm tra trùng email, băm scrypt)
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

      // Kiểm tra mã xác thực nếu có gửi verificationCode (khi người dùng đăng ký qua UI web)
      let isVerified = false;
      const verificationCode = String(body.verificationCode || body.otp || '').trim();
      if (verificationCode) {
        if (!/^\d{6}$/.test(verificationCode)) {
          return NextResponse.json(
            { ok: false, error: 'Mã xác thực Gmail phải gồm đúng 6 chữ số.' },
            { status: 400 }
          );
        }
        if (!Array.isArray(state.emailVerificationTokens)) state.emailVerificationTokens = [];
        const tokenRec = state.emailVerificationTokens
          .filter((t: any) => t.email === emailLower && !t.usedAt)
          .reverse()
          .find((t: any) => new Date(t.expiresAt).getTime() > Date.now());

        if (!tokenRec) {
          return NextResponse.json(
            { ok: false, error: 'Mã xác thực không tồn tại hoặc đã hết hạn. Vui lòng yêu cầu mã mới.' },
            { status: 400 }
          );
        }

        if (tokenRec.attempts >= tokenRec.maxAttempts) {
          return NextResponse.json(
            { ok: false, error: 'Mã xác thực đã nhập sai quá 5 lần. Vui lòng yêu cầu mã mới.' },
            { status: 400 }
          );
        }

        const match = tokenRec.verified || verifyResetCode(emailLower, verificationCode, tokenRec.codeHash);
        if (!match) {
          tokenRec.attempts = (tokenRec.attempts || 0) + 1;
          await writeServerStateAsync(state);
          return NextResponse.json(
            { ok: false, error: 'Mã xác thực Gmail không chính xác. Vui lòng kiểm tra lại.' },
            { status: 400 }
          );
        }

        tokenRec.usedAt = new Date().toISOString();
        tokenRec.verified = true;
        isVerified = true;
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
        emailVerified: Boolean(isVerified || !body.verificationCode),
        emailVerifiedAt: isVerified ? nowIso : null,
        passwordHash: await hashPasswordAsync(data.password),
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

      if (user && user.deletedAt) {
        return NextResponse.json(
          { ok: false, error: 'Tài khoản này đã bị xóa hoặc tạm ngưng sử dụng.' },
          { status: 403 }
        );
      }

      if (user && (user.status === 'banned' || user.isBanned)) {
        return NextResponse.json(
          {
            ok: false,
            error: user.banReason
              ? `Tài khoản đã bị quản trị viên khóa: ${user.banReason}`
              : 'Tài khoản của bạn đã bị khóa bởi quản trị viên.',
          },
          { status: 403 }
        );
      }

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
        ? await verifyPasswordWithMigrationAsync(rawPassword, user.passwordHash)
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
        user.passwordHash = await hashPasswordAsync(rawPassword);
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
        invalidateDashboardCache(auth.user.id);
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

      const isCurrentValid = (
        await verifyPasswordWithMigrationAsync(
          parsed.data.currentPassword,
          auth.user.passwordHash
        )
      ).valid;
      if (!isCurrentValid) {
        return NextResponse.json(
          { ok: false, error: 'Mật khẩu hiện tại không đúng.' },
          { status: 401 }
        );
      }

      auth.user.passwordHash = await hashPasswordAsync(parsed.data.newPassword);
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
    // 5. QUÊN MẬT KHẨU (Gửi mã 6 chữ số có hạn 15 phút qua SMTP thật)
    // -------------------------------------------------------------------------
    if (action === AUTH_ACTIONS.FORGOT_PASSWORD) {
      const emailInput = String(body.email || '').trim().toLowerCase();
      if (!emailInput) {
        return NextResponse.json(
          { ok: false, error: 'Vui lòng nhập địa chỉ email cần đặt lại mật khẩu.' },
          { status: 400 }
        );
      }

      // Rate limit theo IP + email (tối đa 5 lần / giờ)
      const forgotRlKey = `forgot_${emailInput}`;
      const forgotCheck = checkLoginRateLimit(ip, forgotRlKey, {
        maxFailures: 5,
        windowMs: 60 * 60 * 1000,
        lockoutMs: 60 * 60 * 1000,
      });
      if (forgotCheck.locked) {
        return NextResponse.json(
          {
            ok: false,
            error: `Bạn đã yêu cầu đặt lại mật khẩu quá nhiều lần. Vui lòng thử lại sau ${forgotCheck.retryAfterSeconds} giây.`,
          },
          { status: 429 }
        );
      }

      const targetUser = (state.users || []).find(
        (u: any) => String(u.email || '').toLowerCase() === emailInput && !u.isGuest
      );

      let devCode: string | undefined;

      if (targetUser) {
        // Kiểm tra cooldown 60 giây giữa 2 lần xin mã
        const userTokens = (state.passwordResetTokens || []).filter(
          (t: any) => t.userId === targetUser.id
        );
        const lastToken = userTokens[userTokens.length - 1];
        if (lastToken && lastToken.createdAt) {
          const elapsedSec = (Date.now() - new Date(lastToken.createdAt).getTime()) / 1000;
          if (elapsedSec < 60) {
            const waitSec = Math.ceil(60 - elapsedSec);
            return NextResponse.json(
              {
                ok: false,
                error: `Vui lòng đợi thêm ${waitSec} giây trước khi yêu cầu mã mới.`,
              },
              { status: 429 }
            );
          }
        }

        const rawCode = generateResetCode();
        const codeHash = hashResetCode(targetUser.id, rawCode);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 phút

        // Vô hiệu hóa các mã chưa dùng cũ của user đó
        state.passwordResetTokens = (state.passwordResetTokens || []).map((t: any) =>
          t.userId === targetUser.id && !t.usedAt
            ? { ...t, usedAt: new Date().toISOString() }
            : t
        );

        state.passwordResetTokens.push({
          id: `rst_${crypto.randomUUID()}`,
          userId: targetUser.id,
          email: targetUser.email,
          codeHash,
          expiresAt,
          usedAt: null,
          attempts: 0,
          maxAttempts: 5,
          createdAt: new Date().toISOString(),
        });

        await writeServerStateAsync(state);

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetUrl = `${appUrl}/login?mode=reset&email=${encodeURIComponent(targetUser.email)}`;

        const forceStrictSmtp = req.headers.get('x-force-smtp-check') === 'true' || process.env.STRICT_SMTP === 'true';
        const smtpReady = isSmtpConfigured();

        if (!smtpReady) {
          if (process.env.NODE_ENV === 'production' || forceStrictSmtp) {
            return NextResponse.json(
              {
                ok: false,
                code: 'SMTP_NOT_CONFIGURED',
                error: 'Hệ thống chưa cấu hình dịch vụ gửi email (SMTP). Vui lòng liên hệ quản trị viên.',
              },
              { status: 503 }
            );
          }
          // Ở môi trường dev/test, trả thêm devCode khi SMTP chưa cấu hình
          devCode = rawCode;
        } else {
          const mailRes = await defaultEmailService.sendPasswordResetEmail({
            toEmail: targetUser.email,
            fullName: targetUser.fullName,
            code: rawCode,
            resetUrl,
            expiresInMinutes: 15,
          });

          if (!mailRes.sent) {
            return NextResponse.json(
              {
                ok: false,
                code: mailRes.reason || 'SMTP_SEND_FAILED',
                error: 'Không thể gửi email chứa mã khôi phục. Vui lòng thử lại sau hoặc liên hệ quản trị viên.',
              },
              { status: 503 }
            );
          }
        }
      }

      // Thông báo chung chống dò tìm danh sách tài khoản
      return NextResponse.json({
        ok: true,
        message: 'Nếu email tồn tại trong hệ thống, mã khôi phục (hiệu lực 15 phút) đã được gửi.',
        ...(devCode && process.env.NODE_ENV !== 'production' ? { devCode } : {}),
      });
    }

    // -------------------------------------------------------------------------
    // 6. ĐẶT LẠI MẬT KHẨU BẰNG MÃ 6 SỐ
    // -------------------------------------------------------------------------
    if (action === AUTH_ACTIONS.RESET_PASSWORD) {
      const emailInput = String(body.email || '').trim().toLowerCase();
      const codeInput = String(body.code || body.token || '').trim();
      const newPassword = String(body.newPassword || '');

      if (!emailInput) {
        return NextResponse.json(
          { ok: false, error: 'Vui lòng cung cấp địa chỉ email.' },
          { status: 400 }
        );
      }

      if (!codeInput) {
        return NextResponse.json(
          { ok: false, error: 'Vui lòng nhập mã khôi phục 6 số.' },
          { status: 400 }
        );
      }

      if (!/^\d{6}$/.test(codeInput)) {
        return NextResponse.json(
          { ok: false, error: 'Mã khôi phục phải gồm đúng 6 chữ số.' },
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

      const targetUser = (state.users || []).find(
        (u: any) => String(u.email || '').toLowerCase() === emailInput && !u.isGuest
      );
      if (!targetUser) {
        return NextResponse.json(
          { ok: false, error: 'Mã khôi phục không hợp lệ hoặc tài khoản không tồn tại.' },
          { status: 400 }
        );
      }

      // Tìm token khả dụng mới nhất của user
      const userTokens = (state.passwordResetTokens || [])
        .filter((t: any) => t.userId === targetUser.id && !t.usedAt)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const activeToken = userTokens[0];

      if (!activeToken) {
        return NextResponse.json(
          { ok: false, error: 'Mã khôi phục không hợp lệ hoặc đã được sử dụng.' },
          { status: 400 }
        );
      }

      // Kiểm tra hết hạn 15 phút
      if (new Date(activeToken.expiresAt).getTime() <= Date.now()) {
        activeToken.usedAt = new Date().toISOString();
        await writeServerStateAsync(state);
        return NextResponse.json(
          { ok: false, error: 'Mã khôi phục đã hết hạn (15 phút). Vui lòng yêu cầu mã mới.' },
          { status: 400 }
        );
      }

      // Kiểm tra số lần nhập sai
      if ((activeToken.attempts || 0) >= 5) {
        activeToken.usedAt = new Date().toISOString();
        await writeServerStateAsync(state);
        return NextResponse.json(
          { ok: false, error: 'Mã khôi phục đã bị khóa do nhập sai quá 5 lần. Vui lòng yêu cầu mã mới.' },
          { status: 400 }
        );
      }

      // Kiểm tra mã bằng crypto.timingSafeEqual
      const isMatch = verifyResetCode(targetUser.id, codeInput, activeToken.codeHash);
      if (!isMatch) {
        activeToken.attempts = (activeToken.attempts || 0) + 1;
        if (activeToken.attempts >= 5) {
          activeToken.usedAt = new Date().toISOString();
          await writeServerStateAsync(state);
          return NextResponse.json(
            { ok: false, error: 'Mã khôi phục đã bị khóa do nhập sai 5 lần. Vui lòng yêu cầu mã mới.' },
            { status: 400 }
          );
        }
        await writeServerStateAsync(state);
        const remaining = 5 - activeToken.attempts;
        return NextResponse.json(
          { ok: false, error: `Mã khôi phục không đúng. Bạn còn ${remaining} lần thử.` },
          { status: 400 }
        );
      }

      // Mã đúng -> Cập nhật mật khẩu mới
      activeToken.usedAt = new Date().toISOString();
      targetUser.passwordHash = await hashPasswordAsync(newPassword);
      targetUser.mustChangePassword = false;
      targetUser.passwordUpdatedAt = new Date().toISOString();
      targetUser.failedLoginCount = 0;
      targetUser.lockedUntil = null;

      // Thu hồi toàn bộ phiên đăng nhập cũ
      revokeAllOtherSessionsInState(state, targetUser.id, null);
      resetLoginRateLimit(ip, targetUser.email);
      if (targetUser.username) {
        resetLoginRateLimit(ip, targetUser.username);
      }
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
        const checkDel = confirmPwd
          ? await verifyPasswordWithMigrationAsync(confirmPwd, auth.user.passwordHash)
          : { valid: false };
        if (!checkDel.valid) {
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
        passwordHash: await hashPasswordAsync(crypto.randomBytes(16).toString('hex')),
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
