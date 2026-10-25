// ==============================================================================
// MathMaster THCS - Kiểm Thử Chức Năng Quên Mật Khẩu & Mã Khôi Phục 6 Số
// File: scripts/test-forgot-password.mjs
// ==============================================================================

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NextRequest } from 'next/server';

import { POST as authPOST } from '../src/app/api/auth/route';
import { readServerStateAsync, writeServerStateAsync } from '../src/lib/prisma';
import { clearAllRateLimitsForTesting, hashPassword } from '../src/lib/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const localStatePath = path.join(rootDir, '.data', 'local_db_state.json');

function makeReq(body, { headers = {} } = {}) {
  const reqHeaders = new Headers({
    'content-type': 'application/json',
    'x-forwarded-for': '127.0.0.1',
    'user-agent': 'TestAgent/1.0',
    ...headers,
  });
  return new NextRequest('http://localhost:3000/api/auth', {
    method: 'POST',
    headers: reqHeaders,
    body: JSON.stringify(body),
  });
}

export async function runForgotPasswordTests() {
  console.log('================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ QUÊN MẬT KHẨU & MÃ 6 SỐ (scripts/test-forgot-password.mjs)');
  console.log('================================================================');

  const savedDbUrl = process.env.DATABASE_URL;
  const savedLocalState = fs.existsSync(localStatePath)
    ? fs.readFileSync(localStatePath, 'utf-8')
    : null;
  const savedNodeEnv = process.env.NODE_ENV;

  process.env.DATABASE_URL = '';
  clearAllRateLimitsForTesting();

  try {
    const testEmail = 'minhanh.thcs@mathmaster.edu.vn';
    const originalPassword = 'pass123';

    // Đảm bảo tài khoản kiểm thử luôn sẵn sàng (Cô lập dữ liệu test)
    const initSt = await readServerStateAsync();
    initSt.users = initSt.users || [];
    let testUser = initSt.users.find((u) => u.email === testEmail);
    if (!testUser) {
      testUser = {
        id: 'user_minhanh_01',
        email: testEmail,
        username: 'minhanh_thcs',
        fullName: 'Nguyễn Minh Anh',
        role: 'STUDENT',
        status: 'active',
        currentGrade: 8,
        preferredBook: 'KNTT',
        passwordHash: hashPassword(originalPassword),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      initSt.users.unshift(testUser);
    } else {
      testUser.passwordHash = hashPassword(originalPassword);
      testUser.status = 'active';
      testUser.deletedAt = null;
      testUser.failedLoginCount = 0;
      testUser.lockedUntil = null;
    }
    await writeServerStateAsync(initSt);

    // -------------------------------------------------------------------------
    // Test (a): Chuẩn hóa action - Cả gạch dưới lẫn gạch ngang đều KHÔNG bị lỗi 400
    // -------------------------------------------------------------------------
    {
      clearAllRateLimitsForTesting();
      // Thử action: 'forgot_password' (dạng cũ gây lỗi)
      const resUnderscore = await authPOST(makeReq({ action: 'forgot_password', email: testEmail }));
      const dataUnderscore = await resUnderscore.json();
      assert.notEqual(
        dataUnderscore.error,
        'Hành động không hợp lệ.',
        'Action "forgot_password" phải được tự động chuẩn hoá, không được trả "Hành động không hợp lệ"'
      );
      assert.equal(dataUnderscore.ok, true);

      console.log('✓ [PASS] (a.1) Action "forgot_password" (gạch dưới) được chuẩn hoá thành công.');

      // Thử action: 'forgot-password' (dạng chuẩn)
      // Chờ hoặc xoá token cũ để tránh cooldown 60s
      const state = await readServerStateAsync();
      state.passwordResetTokens = [];
      await writeServerStateAsync(state);

      const resHyphen = await authPOST(makeReq({ action: 'forgot-password', email: testEmail }));
      const dataHyphen = await resHyphen.json();
      assert.equal(dataHyphen.ok, true);

      console.log('✓ [PASS] (a.2) Action "forgot-password" (gạch ngang) hoạt động chính xác.');
    }

    // -------------------------------------------------------------------------
    // Test (b): Đổi mật khẩu bằng mã 6 số đúng -> Mật khẩu cũ hết hiệu lực -> Phiên cũ bị thu hồi
    // -------------------------------------------------------------------------
    {
      clearAllRateLimitsForTesting();
      const state = await readServerStateAsync();
      state.passwordResetTokens = [];
      await writeServerStateAsync(state);

      // 1. Tạo phiên đăng nhập cũ
      const loginOldRes = await authPOST(
        makeReq({ action: 'login', identifier: testEmail, password: originalPassword })
      );
      const loginOldData = await loginOldRes.json();
      assert.equal(loginOldData.ok, true, 'Đăng nhập mật khẩu ban đầu phải thành công');
      const oldSessionCookie = loginOldRes.cookies.get('mm_session')?.value;
      assert.ok(oldSessionCookie, 'Phải có session cookie ban đầu');

      // 2. Yêu cầu mã khôi phục
      const reqCodeRes = await authPOST(makeReq({ action: 'forgot-password', email: testEmail }));
      const reqCodeData = await reqCodeRes.json();
      assert.equal(reqCodeData.ok, true);
      const devCode = reqCodeData.devCode;
      assert.ok(devCode && /^\d{6}$/.test(devCode), 'Mã khôi phục phải gồm đúng 6 chữ số');

      // 3. Đặt lại mật khẩu mới
      const newPassword = 'NewSecretPassword999';
      const resetRes = await authPOST(
        makeReq({
          action: 'reset-password',
          email: testEmail,
          code: devCode,
          newPassword,
        })
      );
      const resetData = await resetRes.json();
      assert.equal(resetData.ok, true, 'Đổi mật khẩu bằng mã 6 số phải thành công');

      // 4. Đăng nhập bằng mật khẩu cũ phải THẤT BẠI (401)
      const tryOldRes = await authPOST(
        makeReq({ action: 'login', identifier: testEmail, password: originalPassword })
      );
      assert.equal(tryOldRes.status, 401, 'Mật khẩu cũ phải bị từ chối');

      // 5. Đăng nhập bằng mật khẩu mới phải THÀNH CÔNG (200)
      const tryNewRes = await authPOST(
        makeReq({ action: 'login', identifier: testEmail, password: newPassword })
      );
      const tryNewData = await tryNewRes.json();
      assert.equal(tryNewData.ok, true, 'Mật khẩu mới phải đăng nhập thành công');

      // 6. Kiểm tra phiên cũ đã bị thu hồi trong state
      const stateAfter = await readServerStateAsync();
      const oldSession = (stateAfter.sessions || []).find((s) => s.token === oldSessionCookie);
      if (oldSession) {
        assert.ok(oldSession.revokedAt, 'Phiên đăng nhập cũ phải bị đánh dấu revokedAt');
      }

      // Khôi phục lại mật khẩu gốc cho user
      const user = stateAfter.users.find((u) => u.email === testEmail);
      if (user) {
        // Đổi lại về originalPassword
        const finalReset = await authPOST(
          makeReq({
            action: 'change-password',
            currentPassword: newPassword,
            newPassword: originalPassword,
          }, {
            headers: { cookie: `mm_session=${tryNewRes.cookies.get('mm_session')?.value}` }
          })
        );
      }

      console.log('✓ [PASS] (b) Đổi mật khẩu bằng mã 6 số thành công: mật khẩu cũ hết hạn, phiên cũ bị thu hồi.');
    }

    // -------------------------------------------------------------------------
    // Test (c): Mã sai 5 lần bị khóa
    // -------------------------------------------------------------------------
    {
      clearAllRateLimitsForTesting();
      const state = await readServerStateAsync();
      state.passwordResetTokens = [];
      await writeServerStateAsync(state);

      const reqCodeRes = await authPOST(makeReq({ action: 'forgot-password', email: testEmail }));
      const reqCodeData = await reqCodeRes.json();
      assert.equal(reqCodeData.ok, true);
      const validCode = reqCodeData.devCode;

      // Nhập sai 4 lần
      for (let i = 1; i <= 4; i++) {
        const failRes = await authPOST(
          makeReq({
            action: 'reset-password',
            email: testEmail,
            code: '000000',
            newPassword: 'SomePassword123',
          })
        );
        assert.equal(failRes.status, 400);
        const failData = await failRes.json();
        assert.ok(failData.error.includes(`${5 - i} lần thử`));
      }

      // Lần thứ 5 sai -> Mã bị khóa
      const fail5Res = await authPOST(
        makeReq({
          action: 'reset-password',
          email: testEmail,
          code: '000000',
          newPassword: 'SomePassword123',
        })
      );
      assert.equal(fail5Res.status, 400);
      const fail5Data = await fail5Res.json();
      assert.ok(fail5Data.error.includes('khóa') || fail5Data.error.includes('vô hiệu'));

      // Thử lại lần thứ 6 với mã ĐÚNG -> Vẫn phải bị từ chối vì đã bị khóa
      const tryValidAfterLock = await authPOST(
        makeReq({
          action: 'reset-password',
          email: testEmail,
          code: validCode,
          newPassword: 'SomePassword123',
        })
      );
      assert.equal(tryValidAfterLock.status, 400, 'Mã đã bị khóa sau 5 lần sai không thể sử dụng tiếp');

      console.log('✓ [PASS] (c) Mã nhập sai 5 lần bị khóa vĩnh viễn chính xác.');
    }

    // -------------------------------------------------------------------------
    // Test (d): Mã hết hạn bị từ chối
    // -------------------------------------------------------------------------
    {
      clearAllRateLimitsForTesting();
      const state = await readServerStateAsync();
      state.passwordResetTokens = [];
      await writeServerStateAsync(state);

      const reqRes = await authPOST(makeReq({ action: 'forgot-password', email: testEmail }));
      const reqData = await reqRes.json();
      const validCode = reqData.devCode;

      // Giả lập thời gian hết hạn bằng cách sửa expiresAt về 10 phút trước
      const stateExpire = await readServerStateAsync();
      const tokenRec = stateExpire.passwordResetTokens[stateExpire.passwordResetTokens.length - 1];
      tokenRec.expiresAt = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      await writeServerStateAsync(stateExpire);

      const resetExpiredRes = await authPOST(
        makeReq({
          action: 'reset-password',
          email: testEmail,
          code: validCode,
          newPassword: 'SomePassword123',
        })
      );
      assert.equal(resetExpiredRes.status, 400);
      const expiredData = await resetExpiredRes.json();
      assert.ok(expiredData.error.includes('hết hạn'), 'Phải báo lỗi mã hết hạn');

      console.log('✓ [PASS] (d) Mã hết hạn (15 phút) bị từ chối chính xác.');
    }

    // -------------------------------------------------------------------------
    // Test (e): Mã dùng lại lần 2 bị từ chối
    // -------------------------------------------------------------------------
    {
      clearAllRateLimitsForTesting();
      const state = await readServerStateAsync();
      state.passwordResetTokens = [];
      await writeServerStateAsync(state);

      const reqRes = await authPOST(makeReq({ action: 'forgot-password', email: testEmail }));
      const reqData = await reqRes.json();
      const validCode = reqData.devCode;

      // Lần 1: Thành công
      const reset1 = await authPOST(
        makeReq({
          action: 'reset-password',
          email: testEmail,
          code: validCode,
          newPassword: 'ValidPassword123',
        })
      );
      assert.equal(reset1.status, 200);

      // Lần 2: Dùng lại mã vừa dùng -> Phải thất bại (400)
      const reset2 = await authPOST(
        makeReq({
          action: 'reset-password',
          email: testEmail,
          code: validCode,
          newPassword: 'AnotherPassword456',
        })
      );
      assert.equal(reset2.status, 400);
      const reset2Data = await reset2.json();
      assert.ok(
        reset2Data.error.includes('không hợp lệ') || reset2Data.error.includes('đã được sử dụng'),
        'Mã đã sử dụng không được phép tái sử dụng'
      );

      console.log('✓ [PASS] (e) Mã dùng lại lần 2 bị từ chối chính xác (Token 1 lần).');
    }

    // -------------------------------------------------------------------------
    // Test (f): Email không tồn tại vẫn trả thông báo chung (chống dò email)
    // -------------------------------------------------------------------------
    {
      clearAllRateLimitsForTesting();
      const fakeEmail = 'khongtontai_user_xyz999@mathmaster.vn';
      const fakeRes = await authPOST(makeReq({ action: 'forgot-password', email: fakeEmail }));
      assert.equal(fakeRes.status, 200, 'Email không tồn tại vẫn trả 200 chống dò tài khoản');
      const fakeData = await fakeRes.json();
      assert.equal(fakeData.ok, true);
      assert.ok(fakeData.message.includes('Nếu email tồn tại'));
      assert.equal(fakeData.devCode, undefined, 'Email không tồn tại tuyệt đối không sinh devCode');

      console.log('✓ [PASS] (f) Email không tồn tại trả thông báo chung, không lộ danh sách tài khoản.');
    }

    // -------------------------------------------------------------------------
    // Test (g): Môi trường production không rò devCode
    // -------------------------------------------------------------------------
    {
      clearAllRateLimitsForTesting();
      process.env.NODE_ENV = 'production';
      try {
        const state = await readServerStateAsync();
        state.passwordResetTokens = [];
        await writeServerStateAsync(state);

        const prodRes = await authPOST(makeReq({ action: 'forgot-password', email: testEmail }));
        const prodData = await prodRes.json();
        assert.equal(prodData.devCode, undefined, 'Ở môi trường production tuyệt đối KHÔNG trả devCode');
      } finally {
        process.env.NODE_ENV = savedNodeEnv;
      }

      console.log('✓ [PASS] (g) Môi trường Production không để lộ devCode về phía client.');
    }

    // -------------------------------------------------------------------------
    // Test (h): Khi chưa cấu hình SMTP và kiểm tra nghiêm ngặt -> Trả HTTP 503
    // -------------------------------------------------------------------------
    {
      clearAllRateLimitsForTesting();
      const state = await readServerStateAsync();
      state.passwordResetTokens = [];
      await writeServerStateAsync(state);

      const strictRes = await authPOST(
        makeReq(
          { action: 'forgot-password', email: testEmail },
          { headers: { 'x-force-smtp-check': 'true' } }
        )
      );
      assert.equal(strictRes.status, 503, 'Thiếu cấu hình SMTP phải trả lỗi HTTP 503 trung thực');
      const strictData = await strictRes.json();
      assert.equal(strictData.ok, false);
      assert.equal(strictData.code, 'SMTP_NOT_CONFIGURED');
      assert.ok(strictData.error.includes('chưa cấu hình'));

      console.log('✓ [PASS] (h) Báo lỗi HTTP 503 trung thực khi chưa cấu hình SMTP (không báo thành công giả).');
    }

    console.log('================================================================');
    console.log('🎉 TẤT CẢ 8 BÀI KIỂM THỬ QUÊN MẬT KHẨU ĐỀU ĐẠT (8/8 PASS)!');
    console.log('================================================================');
  } finally {
    process.env.DATABASE_URL = savedDbUrl;
    process.env.NODE_ENV = savedNodeEnv;
    if (savedLocalState) {
      fs.writeFileSync(localStatePath, savedLocalState, 'utf-8');
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runForgotPasswordTests().catch((err) => {
    console.error('❌ Kiểm thử Quên mật khẩu thất bại:', err);
    process.exit(1);
  });
}
