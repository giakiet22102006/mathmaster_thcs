// ==============================================================================
// MathMaster THCS - Kiểm Thử Tính Năng Xác Thực Gmail Đăng Ký (Email Verification)
// File: scripts/test-email-verification.mjs
// ==============================================================================

import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST as authPOST } from '../src/app/api/auth/route';
import { clearAllRateLimitsForTesting } from '../src/lib/auth';

function makeNextRequest(url, { method = 'POST', body, cookieToken, ip = '127.0.0.1' } = {}) {
  const headers = new Headers({
    'content-type': 'application/json',
    'x-forwarded-for': ip,
    'user-agent': 'MathMaster-Test-Runner/1.0',
  });
  if (cookieToken) {
    headers.set('cookie', `mm_session=${cookieToken}`);
  }
  return new NextRequest(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function extractCookieToken(res) {
  const cookie = res.cookies.get('mm_session');
  return cookie?.value || null;
}

export async function runEmailVerificationTests() {
  console.log('================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ XÁC THỰC GMAIL ĐĂNG KÝ (scripts/test-email-verification.mjs)');
  console.log('================================================================');

  clearAllRateLimitsForTesting();

  const testEmail = `student_${Date.now()}@gmail.com`;

  // Case 1: Chặn gửi mã khi email không hợp lệ
  const invalidEmailRes = await authPOST(
    makeNextRequest('http://localhost:3000/api/auth', {
      body: {
        action: 'send-register-otp',
        email: 'invalid-email-format',
        fullName: 'Học sinh Test',
      },
    })
  );
  assert.equal(invalidEmailRes.status, 400, 'Email không hợp lệ phải bị từ chối 400');
  console.log('✓ [PASS] (1) Chặn gửi mã OTP khi email sai định dạng (400)');

  // Case 2: Gửi mã OTP xác thực Gmail thành công
  const sendRes = await authPOST(
    makeNextRequest('http://localhost:3000/api/auth', {
      body: {
        action: 'send-register-otp',
        email: testEmail,
        fullName: 'Nguyễn Minh Anh',
      },
    })
  );
  assert.equal(sendRes.status, 200, 'Gửi mã OTP xác thực phải trả về 200');
  const sendData = await sendRes.json();
  assert.equal(sendData.ok, true);
  assert.ok(sendData.devCode, 'Ở môi trường test phải có devCode để kiểm tra');
  assert.match(sendData.devCode, /^\d{6}$/, 'Mã OTP phải gồm 6 chữ số');
  const validOtp = sendData.devCode;
  console.log('✓ [PASS] (2) Gửi mã OTP 6 số tới Gmail thành công kèm devCode');

  // Case 3: Cooldown 60 giây giữa 2 lần gửi mã liên tiếp
  const spamRes = await authPOST(
    makeNextRequest('http://localhost:3000/api/auth', {
      body: {
        action: 'send-register-otp',
        email: testEmail,
        fullName: 'Nguyễn Minh Anh',
      },
    })
  );
  assert.equal(spamRes.status, 429, 'Gửi mã liên tiếp trong 60s phải bị chặn 429');
  console.log('✓ [PASS] (3) Cooldown 60 giây chống spam mã OTP hoạt động chính xác (429)');

  // Case 4: Nhập sai mã OTP
  const wrongRes = await authPOST(
    makeNextRequest('http://localhost:3000/api/auth', {
      body: {
        action: 'verify-register-otp',
        email: testEmail,
        code: '000000',
      },
    })
  );
  assert.equal(wrongRes.status, 400, 'Mã OTP sai phải bị từ chối 400');
  console.log('✓ [PASS] (4) Kiểm tra mã OTP sai bị từ chối chính xác (400)');

  // Case 5: Xác thực mã OTP đúng
  const verifyRes = await authPOST(
    makeNextRequest('http://localhost:3000/api/auth', {
      body: {
        action: 'verify-register-otp',
        email: testEmail,
        code: validOtp,
      },
    })
  );
  assert.equal(verifyRes.status, 200, 'Mã OTP đúng phải trả về 200');
  const verifyData = await verifyRes.json();
  assert.equal(verifyData.ok, true);
  assert.equal(verifyData.verified, true);
  console.log('✓ [PASS] (5) Xác thực mã OTP 6 số thành công (verify-register-otp)');

  // Case 6: Hoàn tất đăng ký tài khoản với verificationCode
  const regRes = await authPOST(
    makeNextRequest('http://localhost:3000/api/auth', {
      body: {
        action: 'register',
        fullName: 'Nguyễn Minh Anh',
        email: testEmail,
        password: 'Password123',
        confirmPassword: 'Password123',
        currentGrade: 8,
        preferredBook: 'KNTT',
        schoolName: 'THCS Giảng Võ',
        verificationCode: validOtp,
      },
    })
  );
  assert.equal(regRes.status, 200, 'Đăng ký kèm verificationCode hợp lệ phải trả về 200');
  const regData = await regRes.json();
  assert.equal(regData.ok, true);
  assert.equal(regData.user.emailVerified, true, 'User tạo thành công phải có emailVerified === true');
  assert.equal(regData.user.passwordHash, undefined, 'Không được để lộ passwordHash');
  const sessionToken = extractCookieToken(regRes);
  assert.ok(sessionToken, 'Đăng ký thành công phải cấp session token cookie mm_session');
  console.log('✓ [PASS] (6) Đăng ký tài khoản kích hoạt emailVerified: true & cấp session thành công');

  // Case 7: Chặn gửi mã OTP tới email đã được đăng ký
  const dupOtpRes = await authPOST(
    makeNextRequest('http://localhost:3000/api/auth', {
      body: {
        action: 'send-register-otp',
        email: testEmail,
        fullName: 'Người khác',
      },
    })
  );
  assert.equal(dupOtpRes.status, 409, 'Gửi mã tới email đã đăng ký phải trả về 409');
  console.log('✓ [PASS] (7) Chặn gửi mã xác thực tới email đã tồn tại (409)');

  // Case 8: Mã OTP đã sử dụng không thể tái sử dụng để đăng ký lần 2
  const reuseRes = await authPOST(
    makeNextRequest('http://localhost:3000/api/auth', {
      body: {
        action: 'register',
        fullName: 'Người Tái Sử Dụng',
        email: `another_${Date.now()}@gmail.com`,
        password: 'Password123',
        confirmPassword: 'Password123',
        verificationCode: validOtp,
      },
    })
  );
  assert.equal(reuseRes.status, 400, 'Mã OTP của email khác hoặc đã dùng không thể tái sử dụng');
  console.log('✓ [PASS] (8) Mã OTP đã dùng / sai email bị từ chối chính xác (Token 1 lần)');

  console.log('================================================================');
  console.log('🎉 TẤT CẢ 8 BÀI KIỂM THỬ XÁC THỰC GMAIL ĐỀU ĐẠT (8/8 PASS)!');
  console.log('================================================================');
}

if (process.argv[1]?.endsWith('test-email-verification.mjs')) {
  runEmailVerificationTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Lỗi kiểm thử xác thực Gmail:', err);
      process.exit(1);
    });
}
