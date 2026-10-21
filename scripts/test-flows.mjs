// ==============================================================================
// MathMaster THCS - Bộ Kiểm Thử Tự Động Toàn Diện (Auth, Đa Thiết Bị, Tạo Đề, Chấm Bài)
// Chạy lệnh: npm run test
// ==============================================================================

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NextRequest } from 'next/server';

import {
  clearAllRateLimitsForTesting,
  hashPassword,
  signSessionToken,
  verifyPassword,
  verifyPasswordWithMigration,
  verifySessionToken,
} from '../src/lib/auth';
import {
  checkMathEquivalence,
  generateExamFromPool,
  gradeExamAttempt,
} from '../src/lib/math-grader';
import { POST as authPOST, GET as authGET } from '../src/app/api/auth/route';
import { GET as sessionsGET, DELETE as sessionsDELETE } from '../src/app/api/sessions/route';
import { GET as stateGET, POST as statePOST } from '../src/app/api/state/route';
import { GET as examsGET, POST as examsPOST } from '../src/app/api/exams/route';
import { GET as attemptsGET, POST as attemptsPOST } from '../src/app/api/attempts/route';
import { runBankAudit } from './bank-audit.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const localStatePath = path.join(rootDir, '.data', 'local_db_state.json');

function makeNextRequest(url, { method = 'GET', body, cookieToken, ip = '127.0.0.1', ua = 'Mozilla/5.0 (Windows NT 10.0) Chrome/120.0' } = {}) {
  const headers = new Headers({
    'content-type': 'application/json',
    'x-forwarded-for': ip,
    'user-agent': ua,
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

async function runTests() {
  console.log('================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG MATHMASTER THCS (BACKEND & FLOWS)');
  console.log('================================================================');

  const savedDbUrl = process.env.DATABASE_URL;
  const savedLocalState = fs.existsSync(localStatePath)
    ? fs.readFileSync(localStatePath, 'utf-8')
    : null;

  // Chạy test cô lập trên store cục bộ để nhanh và không làm bẩn dữ liệu thật
  process.env.DATABASE_URL = '';

  try {
    // -------------------------------------------------------------------------
    // Test 1: Kiểm tra Schema Prisma và các file Migration SQL
    // -------------------------------------------------------------------------
    const schemaText = fs.readFileSync(path.join(rootDir, 'prisma', 'schema.prisma'), 'utf-8');
    const migDir = path.join(rootDir, 'prisma', 'migrations');
    const migFolders = fs
      .readdirSync(migDir)
      .filter((f) => fs.statSync(path.join(migDir, f)).isDirectory());
    const allMigrationSql = migFolders
      .map((f) => fs.readFileSync(path.join(migDir, f, 'migration.sql'), 'utf-8'))
      .join('\n');

    const modelMatches = [...schemaText.matchAll(/^model\s+([a-zA-Z0-9_]+)\s*\{/gm)].map(
      (m) => m[1]
    );
    assert.ok(modelMatches.length >= 25, 'Schema phải có ít nhất 25 bảng (bao gồm sessions, password_reset_tokens, classrooms...)');
    for (const modelName of modelMatches) {
      assert.ok(
        allMigrationSql.includes(`CREATE TABLE "${modelName}"`) ||
          allMigrationSql.includes(`CREATE TABLE IF NOT EXISTS "${modelName}"`),
        `Migration SQL thiếu lệnh CREATE TABLE cho bảng ${modelName}`
      );
    }
    console.log(
      `✓ [PASS] Test 1: Schema Prisma (${modelMatches.length} bảng) khớp 100% với các file migration.sql`
    );

    // -------------------------------------------------------------------------
    // Test 2: Kiểm tra Băm Mật Khẩu Scrypt, Salt ngẫu nhiên & Migration Hash cũ
    // -------------------------------------------------------------------------
    const hash1 = hashPassword('MatKhauAnToan123');
    const hash2 = hashPassword('MatKhauAnToan123');
    assert.ok(hash1.startsWith('scrypt$N=16384,r=8,p=1$'), 'Định dạng hash phải là scrypt$tham_so$salt$hash');
    assert.notEqual(hash1, hash2, 'Cùng mật khẩu nhưng 2 lần băm phải sinh salt ngẫu nhiên khác nhau');
    assert.equal(verifyPassword('MatKhauAnToan123', hash1), true);
    assert.equal(verifyPassword('SaiMatKhau999', hash1), false);
    assert.equal(
      verifyPassword(hash1, hash1),
      false,
      'Tuyệt đối không cho phép đăng nhập bằng chuỗi hash (storedHash === password phải trả false)'
    );
    assert.equal(
      verifyPassword('pass123', 'pass123'),
      false,
      'Không bao giờ chấp nhận mật khẩu plaintext'
    );

    // Kiểm tra tự động phát hiện hash kiểu cũ (salt cố định mathmaster_salt_v1) để rehash
    const legacyHash = crypto.scryptSync('LegacyPass99', 'mathmaster_salt_v1', 32).toString('hex');
    const migCheck = verifyPasswordWithMigration('LegacyPass99', legacyHash);
    assert.equal(migCheck.valid, true, 'Phải xác thực được tài khoản cũ để nâng cấp');
    assert.equal(migCheck.needsRehash, true, 'Phải báo needsRehash = true cho hash kiểu cũ');
    console.log('✓ [PASS] Test 2: Băm mật khẩu scrypt + salt ngẫu nhiên + timingSafeEqual + chặn plaintext hoạt động chính xác');

    // -------------------------------------------------------------------------
    // Test 3: Kiểm tra Đăng ký (Zod Validation & Chống trùng Email không phân biệt hoa/thường)
    // -------------------------------------------------------------------------
    clearAllRateLimitsForTesting();

    // 3a. Mật khẩu yếu (thiếu số hoặc < 8 ký tự) phải bị từ chối 400
    const weakRegRes = await authPOST(
      makeNextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: {
          action: 'register',
          fullName: 'Học Sinh Test',
          email: 'weak@test.edu.vn',
          password: 'short',
          currentGrade: 8,
          preferredBook: 'KNTT',
        },
      })
    );
    assert.equal(weakRegRes.status, 400, 'Mật khẩu yếu phải bị từ chối với mã 400');

    // 3b. Đăng ký hợp lệ User A
    const uniqueEmailA = `user_a_${Date.now()}@mathmaster.edu.vn`;
    const regResA = await authPOST(
      makeNextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: {
          action: 'register',
          fullName: 'Nguyễn Văn A',
          email: uniqueEmailA,
          password: 'PasswordA123',
          confirmPassword: 'PasswordA123',
          currentGrade: 8,
          preferredBook: 'KNTT',
        },
      })
    );
    assert.equal(regResA.status, 200, 'Đăng ký User A hợp lệ phải trả 200');
    const regDataA = await regResA.json();
    assert.equal(regDataA.ok, true);
    assert.equal(regDataA.user.passwordHash, undefined, 'Response đăng ký tuyệt đối không được chứa passwordHash');
    const tokenA_Client1 = extractCookieToken(regResA);
    assert.ok(tokenA_Client1, 'Đăng ký thành công phải thiết lập cookie mm_session');

    // 3c. Đăng ký trùng email (viết HOA) phải bị chặn 409
    const dupRegRes = await authPOST(
      makeNextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: {
          action: 'register',
          fullName: 'Người Trùng Email',
          email: uniqueEmailA.toUpperCase(),
          password: 'PasswordB123',
          currentGrade: 9,
          preferredBook: 'CD',
        },
      })
    );
    assert.equal(dupRegRes.status, 409, 'Đăng ký trùng email (không phân biệt hoa/thường) phải trả 409');
    console.log('✓ [PASS] Test 3: Đăng ký Zod validation & chống trùng email hoạt động chính xác');

    // -------------------------------------------------------------------------
    // Test 4: Đăng nhập thiếu mật khẩu (401), đăng nhập bằng userId (401), Token hết hạn (401)
    // -------------------------------------------------------------------------
    const emptyPwdRes = await authPOST(
      makeNextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: {
          action: 'login',
          email: uniqueEmailA,
          password: '',
        },
      })
    );
    assert.equal(emptyPwdRes.status, 401, 'Đăng nhập bỏ trống mật khẩu bắt buộc phải trả 401');

    const userIdLoginRes = await authPOST(
      makeNextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: {
          action: 'login',
          userId: regDataA.user.id,
        },
      })
    );
    assert.equal(userIdLoginRes.status, 401, 'Đăng nhập chỉ gửi userId không mật khẩu phải bị từ chối 401');

    // Kiểm tra token hết hạn
    const expiredToken = signSessionToken(
      {
        userId: regDataA.user.id,
        role: 'STUDENT',
        isGuest: false,
        sessionId: regDataA.session.id,
      },
      { expiresInSeconds: -60 }
    );
    assert.equal(verifySessionToken(expiredToken), null, 'verifySessionToken phải trả null cho token hết hạn');
    const expiredStateRes = await stateGET(
      makeNextRequest('http://localhost:3000/api/state', {
        method: 'GET',
        cookieToken: expiredToken,
      })
    );
    assert.equal(expiredStateRes.status, 401, 'Gọi API bằng token hết hạn phải trả 401');
    console.log('✓ [PASS] Test 4: Chặn đăng nhập thiếu mật khẩu (401) & từ chối token hết hạn (401)');

    // -------------------------------------------------------------------------
    // Test 5: Rate Limit khi đăng nhập sai quá 5 lần liên tiếp (429)
    // -------------------------------------------------------------------------
    clearAllRateLimitsForTesting();
    const bruteIp = '10.20.30.40';
    for (let i = 1; i <= 5; i++) {
      const wrongRes = await authPOST(
        makeNextRequest('http://localhost:3000/api/auth', {
          method: 'POST',
          ip: bruteIp,
          body: {
            action: 'login',
            identifier: uniqueEmailA,
            password: `WrongPass_${i}`,
          },
        })
      );
      if (i < 5) {
        assert.equal(wrongRes.status, 401, `Lần sai thứ ${i} phải trả 401`);
      } else {
        assert.equal(wrongRes.status, 429, 'Lần sai thứ 5 chạm ngưỡng phải trả 429');
      }
    }
    const sixthAttemptRes = await authPOST(
      makeNextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        ip: bruteIp,
        body: {
          action: 'login',
          identifier: uniqueEmailA,
          password: 'PasswordA123', // Kể cả nhập đúng khi đang bị khóa cũng phải trả 429
        },
      })
    );
    assert.equal(sixthAttemptRes.status, 429, 'Tài khoản/IP đang bị khoá rate-limit phải trả 429');
    clearAllRateLimitsForTesting();

    // Reset khoá trên tài khoản A trong state để tiếp tục test các luồng sau
    const currentRawState = JSON.parse(fs.readFileSync(localStatePath, 'utf-8'));
    const uA = currentRawState.users.find((u) => u.id === regDataA.user.id);
    if (uA) {
      uA.failedLoginCount = 0;
      uA.lockedUntil = null;
      fs.writeFileSync(localStatePath, JSON.stringify(currentRawState, null, 2), 'utf-8');
    }
    console.log('✓ [PASS] Test 5: Rate limit chống brute-force mật khẩu (429 Too Many Requests) hoạt động chính xác');

    // -------------------------------------------------------------------------
    // Test 6: Đa thiết bị, Cô lập phiên giữa User A (Client 1) & User B (Client 2) và Bảo vệ 403
    // -------------------------------------------------------------------------
    const uniqueEmailB = `user_b_${Date.now()}@mathmaster.edu.vn`;
    const regResB = await authPOST(
      makeNextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        ip: '192.168.1.22',
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/605.1',
        body: {
          action: 'register',
          fullName: 'Trần Thị B',
          email: uniqueEmailB,
          password: 'PasswordB123',
          currentGrade: 9,
          preferredBook: 'CD',
        },
      })
    );
    assert.equal(regResB.status, 200);
    const regDataB = await regResB.json();
    const tokenB_Client2 = extractCookieToken(regResB);

    // Client 1 (User A) gọi GET /api/state
    const stateResA = await stateGET(
      makeNextRequest('http://localhost:3000/api/state', {
        method: 'GET',
        cookieToken: tokenA_Client1,
      })
    );
    assert.equal(stateResA.status, 200);
    const stateDataA = await stateResA.json();
    assert.equal(stateDataA.state.user.id, regDataA.user.id, 'Client 1 phải nhận đúng dữ liệu của User A');
    assert.equal(stateDataA.state.users.length, 1, 'Client 1 chỉ được thấy đúng 1 user là chính mình, tuyệt đối không thấy User B');
    assert.equal(stateDataA.state.users[0].passwordHash, undefined, 'Tuyệt đối không lộ passwordHash trong /api/state');

    // Client 2 (User B) gọi GET /api/state cùng lúc
    const stateResB = await stateGET(
      makeNextRequest('http://localhost:3000/api/state', {
        method: 'GET',
        cookieToken: tokenB_Client2,
      })
    );
    assert.equal(stateResB.status, 200);
    const stateDataB = await stateResB.json();
    assert.equal(stateDataB.state.user.id, regDataB.user.id, 'Client 2 phải nhận đúng dữ liệu của User B mà không bị ảnh hưởng bởi Client 1');
    assert.equal(stateDataB.state.users.length, 1);

    // Kiểm tra file state trên server không còn trường currentUserId dùng chung
    const diskState = JSON.parse(fs.readFileSync(localStatePath, 'utf-8'));
    assert.equal('currentUserId' in diskState, false, 'State trên server tuyệt đối không được lưu currentUserId dùng chung');

    // User A cố truy cập dữ liệu của User B -> phải trả 403 Forbidden
    const crossAccessExams = await examsGET(
      makeNextRequest(`http://localhost:3000/api/exams?userId=${regDataB.user.id}`, {
        method: 'GET',
        cookieToken: tokenA_Client1,
      })
    );
    assert.equal(crossAccessExams.status, 403, 'User A truy cập đề thi riêng của User B phải trả 403');

    const crossAccessAttempts = await attemptsGET(
      makeNextRequest(`http://localhost:3000/api/attempts?userId=${regDataB.user.id}`, {
        method: 'GET',
        cookieToken: tokenA_Client1,
      })
    );
    assert.equal(crossAccessAttempts.status, 403, 'User A truy cập lịch sử làm bài của User B phải trả 403');

    const crossDeleteUser = await authPOST(
      makeNextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        cookieToken: tokenA_Client1,
        body: {
          action: 'delete',
          userId: regDataB.user.id,
        },
      })
    );
    assert.equal(crossDeleteUser.status, 403, 'User A cố xoá tài khoản của User B phải bị chặn 403');
    console.log('✓ [PASS] Test 6: Cô lập phiên giữa Client 1 (User A) và Client 2 (User B) & chặn truy cập chéo (403)');

    // -------------------------------------------------------------------------
    // Test 7: Quản lý phiên theo thiết bị (Thu hồi từng thiết bị & MAX_SESSIONS_PER_USER)
    // -------------------------------------------------------------------------
    // User A đăng nhập thêm trên Thiết bị 2 và Thiết bị 3 với giới hạn maxSessionsOverride = 2
    const loginA_Dev2 = await authPOST(
      makeNextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        ua: 'Mozilla/5.0 (Android 14; Mobile) Chrome/120.0',
        body: {
          action: 'login',
          identifier: uniqueEmailA,
          password: 'PasswordA123',
          deviceName: 'Điện thoại Android của A',
          maxSessionsOverride: 2,
        },
      })
    );
    assert.equal(loginA_Dev2.status, 200);
    const tokenA_Dev2 = extractCookieToken(loginA_Dev2);

    // Khi đăng nhập Thiết bị 3 với maxSessionsOverride = 2 -> Thiết bị 1 (cũ nhất) phải tự động bị thu hồi!
    const loginA_Dev3 = await authPOST(
      makeNextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        ua: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) Safari/605.1',
        body: {
          action: 'login',
          identifier: uniqueEmailA,
          password: 'PasswordA123',
          deviceName: 'iPad của A',
          maxSessionsOverride: 2,
        },
      })
    );
    assert.equal(loginA_Dev3.status, 200);
    const dataA_Dev3 = await loginA_Dev3.json();
    const tokenA_Dev3 = extractCookieToken(loginA_Dev3);
    assert.ok(
      dataA_Dev3.revokedSessionIds.includes(regDataA.session.id),
      'Vượt MAX_SESSIONS_PER_USER thì phiên cũ nhất (Thiết bị 1) phải tự động bị thu hồi'
    );

    // Thiết bị 1 gọi API phải bị từ chối 401, trong khi Thiết bị 2 và 3 vẫn hoạt động bình thường
    const dev1Check = await stateGET(
      makeNextRequest('http://localhost:3000/api/state', {
        method: 'GET',
        cookieToken: tokenA_Client1,
      })
    );
    assert.equal(dev1Check.status, 401, 'Thiết bị 1 đã bị thu hồi khi vượt MAX_SESSIONS_PER_USER phải trả 401');

    const dev2Check = await stateGET(
      makeNextRequest('http://localhost:3000/api/state', {
        method: 'GET',
        cookieToken: tokenA_Dev2,
      })
    );
    assert.equal(dev2Check.status, 200, 'Thiết bị 2 vẫn hoạt động bình thường');

    // Từ Thiết bị 3, thu hồi riêng Thiết bị 2 qua DELETE /api/sessions
    const listSesRes = await sessionsGET(
      makeNextRequest('http://localhost:3000/api/sessions', {
        method: 'GET',
        cookieToken: tokenA_Dev3,
      })
    );
    const listSesData = await listSesRes.json();
    const dev2Ses = listSesData.sessions.find((s) => s.deviceName === 'Điện thoại Android của A');
    assert.ok(dev2Ses && dev2Ses.isActive, 'Phải liệt kê thấy Thiết bị 2 đang hoạt động');

    const revokeDev2Res = await sessionsDELETE(
      makeNextRequest('http://localhost:3000/api/sessions', {
        method: 'DELETE',
        cookieToken: tokenA_Dev3,
        body: { sessionId: dev2Ses.id },
      })
    );
    assert.equal(revokeDev2Res.status, 200);

    // Kiểm tra lại: Thiết bị 2 bị 401, Thiết bị 3 vẫn 200
    const dev2AfterRevoke = await stateGET(
      makeNextRequest('http://localhost:3000/api/state', {
        method: 'GET',
        cookieToken: tokenA_Dev2,
      })
    );
    assert.equal(dev2AfterRevoke.status, 401, 'Thiết bị 2 sau khi bị thu hồi phải trả 401');

    const dev3AfterRevoke = await stateGET(
      makeNextRequest('http://localhost:3000/api/state', {
        method: 'GET',
        cookieToken: tokenA_Dev3,
      })
    );
    assert.equal(dev3AfterRevoke.status, 200, 'Thiết bị 3 vẫn hoạt động bình thường');
    console.log('✓ [PASS] Test 7: Quản lý phiên theo thiết bị, thu hồi phiên độc lập & giới hạn MAX_SESSIONS_PER_USER hoạt động chính xác');

    // -------------------------------------------------------------------------
    // Test 8: Tạo đề thi đúng Ma trận Độ khó 4 mức & Tái lập đề qua Seed
    // -------------------------------------------------------------------------
    const seedData = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'prisma', 'seed_data.json'), 'utf-8')
    );
    const newExam8 = generateExamFromPool(
      {
        grade: 8,
        textbook: 'KNTT',
        category: 'GIUA_KI_1',
        semester: 1,
        difficulty: 'trung_binh',
        format: 'combined',
        questionCount: 5,
        durationMinutes: 45,
        userId: 'user_minhanh_01',
        seed: 20261021,
      },
      seedData.questions,
      seedData.exams
    );
    assert.equal(newExam8.ok, true, 'Tạo đề Lớp 8 HK1 mức Trung bình 5 câu phải thành công');
    assert.equal(newExam8.grade, 8);
    assert.equal(newExam8.questionIds.length, 5);

    // Kiểm tra mọi câu hỏi trong đề đều đúng Lớp 8, HK1 và đã verified
    const selectedQuestions8 = newExam8.questionIds.map((id) =>
      seedData.questions.find((q) => q.id === id)
    );
    for (const sq of selectedQuestions8) {
      assert.ok(sq, 'Câu hỏi trong đề phải tồn tại trong ngân hàng');
      assert.equal(sq.grade, 8, 'Câu hỏi phải đúng Lớp 8');
      assert.equal(sq.semester, 1, 'Câu hỏi phải đúng Học kỳ 1');
      assert.equal(sq.verificationStatus, 'verified', 'Chỉ được chọn câu hỏi đã verified');
    }

    // Kiểm tra phân phối mức độ nhận thức đúng 30% NB / 50% TH / 20% VD (1 NB, 3 TH, 1 VD, 0 VDC)
    assert.deepEqual(
      newExam8.composition.actualCounts,
      { nhan_biet: 1, thong_hieu: 3, van_dung: 1, van_dung_cao: 0 },
      'Số lượng câu hỏi từng mức nhận thức phải khớp 100% với ma trận Trung bình (30/50/20/0)'
    );

    // Kiểm tra tổng điểm đúng bằng 10.0
    const totalPts = Object.values(newExam8.questionPoints).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(totalPts - 10.0) < 0.01, 'Tổng điểm đề thi phải đúng bằng 10.0');

    // Kiểm tra tính tái lập khi truyền cùng seed
    const reproducedExam8 = generateExamFromPool(
      {
        grade: 8,
        textbook: 'KNTT',
        category: 'GIUA_KI_1',
        semester: 1,
        difficulty: 'trung_binh',
        format: 'combined',
        questionCount: 5,
        durationMinutes: 45,
        userId: 'user_minhanh_01',
        seed: 20261021,
      },
      seedData.questions,
      seedData.exams
    );
    assert.deepEqual(
      reproducedExam8.questionIds,
      newExam8.questionIds,
      'Cùng seed PRNG phải tái lập chính xác danh sách câu hỏi của đề'
    );
    console.log('✓ [PASS] Test 8: Tạo đề theo Ma trận 4 mức độ nhận thức (Largest Remainder + Seeded PRNG) hoạt động chính xác');

    // -------------------------------------------------------------------------
    // Test 9: Kiểm tra báo lỗi INSUFFICIENT_QUESTIONS khi ngân hàng thiếu câu (Không âm thầm hạ cấp)
    // -------------------------------------------------------------------------
    const shortageRes = generateExamFromPool(
      {
        grade: 8,
        textbook: 'KNTT',
        semester: 1,
        chapterIds: ['G8_C1'],
        customMatrix: { nhan_biet: 0, thong_hieu: 0, van_dung: 0, van_dung_cao: 100 },
        questionCount: 50,
        allowBorrowAdjacent: false,
        userId: regDataA.user.id,
      },
      seedData.questions,
      []
    );
    assert.equal(shortageRes.ok, false, 'Khi thiếu câu hỏi và allowBorrowAdjacent=false phải trả về ok: false');
    assert.equal(
      shortageRes.code,
      'INSUFFICIENT_QUESTIONS',
      'Phải trả về mã lỗi INSUFFICIENT_QUESTIONS'
    );
    assert.equal(shortageRes.shortage.van_dung_cao.need, 50);
    assert.ok(shortageRes.shortage.van_dung_cao.have < 50);
    assert.ok(Array.isArray(shortageRes.suggestions) && shortageRes.suggestions.length > 0);

    // Kiểm tra qua API POST /api/exams cũng trả HTTP 422 kèm shortage
    const apiShortageRes = await examsPOST(
      makeNextRequest('http://localhost:3000/api/exams', {
        method: 'POST',
        cookieToken: tokenA_Dev3,
        body: {
          grade: 8,
          semester: 1,
          chapterIds: ['G8_C1'],
          customMatrix: { nhan_biet: 0, thong_hieu: 0, van_dung: 0, van_dung_cao: 100 },
          questionCount: 50,
          allowBorrowAdjacent: false,
        },
      })
    );
    assert.equal(apiShortageRes.status, 422, 'API /api/exams phải trả 422 khi thiếu câu hỏi');
    const apiShortageData = await apiShortageRes.json();
    assert.equal(apiShortageData.code, 'INSUFFICIENT_QUESTIONS');
    console.log('✓ [PASS] Test 9: Báo lỗi minh bạch INSUFFICIENT_QUESTIONS kèm chi tiết shortage (không lấy bừa câu sai mức độ)');

    // -------------------------------------------------------------------------
    // Test 10: Chấm bài tự luận biểu thức tương đương (1/2, 0,5, \frac{1}{2}) & Chấm từng bước rubricSteps
    // -------------------------------------------------------------------------
    const fracQuestion = {
      id: 'Q_FRAC_TEST',
      type: 'essay',
      points: 2.0,
      correctAnswer: '1/2',
      acceptedAnswers: ['0.5', '0,5', '\\frac{1}{2}'],
      commonMistake: 'Sai dấu thành -1/2',
      rubricSteps: [
        { step: 'Rút gọn tử và mẫu được $\\frac{2}{4}$', points: 1.0 },
        { step: 'Tối giản bằng $\\frac{1}{2}$', points: 1.0 },
      ],
    };
    assert.equal(checkMathEquivalence('1/2', fracQuestion).isCorrect, true);
    assert.equal(checkMathEquivalence('0,5', fracQuestion).isCorrect, true);
    assert.equal(checkMathEquivalence('\\frac{1}{2}', fracQuestion).isCorrect, true);
    assert.equal(checkMathEquivalence('-0,5', fracQuestion).errorCategory, 'SIGN_ERROR');

    // Kiểm tra chấm điểm thành phần (Partial Credit) với câu Q6_004: 25 - (x - 7) = -12
    // Bước 1: x - 7 = 37 (1.0đ), Bước 2: x = 44 (1.0đ)
    const q6004 = seedData.questions.find((q) => q.id === 'Q6_004');
    const partialExam = {
      id: 'EXAM_PARTIAL_TEST',
      questionIds: ['Q6_004'],
      questionPoints: { Q6_004: 2.0 },
    };
    const partialAttempt = {
      id: 'ATT_PARTIAL_01',
      examId: 'EXAM_PARTIAL_TEST',
      userId: regDataA.user.id,
      answers: {
        Q6_004: {
          value: '40', // Kết quả cuối cùng tính nhẩm sai
          workings: 'Bước 1: x - 7 = 25 - (-12) => x - 7 = 37. Bước 2: x = 40', // Nhưng bước 1 đúng!
          flagged: false,
        },
      },
    };
    const partialGraded = gradeExamAttempt(partialAttempt, partialExam, seedData.questions);
    assert.equal(partialGraded.answers.Q6_004.isCorrect, false);
    assert.equal(partialGraded.answers.Q6_004.isPartial, true, 'Phải ghi nhận đạt điểm thành phần (isPartial = true)');
    assert.equal(partialGraded.answers.Q6_004.points, 1.0, 'Đúng 1/2 bước rubric trên câu 2.0đ phải được 1.0đ');
    assert.equal(partialGraded.essayScore, 1.0);

    // Kiểm tra luồng chấm đề tổng hợp Lớp 8 và căn thức/tập nghiệm Lớp 9
    const simulatedAttempt = {
      id: 'ATT_TEST_FLOW_01',
      examId: 'EXAM_SEED_G8_GK1',
      userId: 'user_minhanh_01',
      grade: 8,
      status: 'IN_PROGRESS',
      startedAt: '2026-10-18 14:00',
      timeSpentSeconds: 320,
      remainingSeconds: 2380,
      answers: {
        Q8_001: { value: 'B', flagged: false },
        Q8_002: { value: 'A', flagged: false },
        Q8_009: { value: 'C', flagged: false },
        Q8_004: { value: 'B', flagged: false },
        Q8_010: { value: 'B', flagged: false },
        Q8_003: { value: '0,4', flagged: false },
        Q8_007: { value: '5', flagged: true },
      },
    };
    const targetExam = seedData.exams.find((e) => e.id === 'EXAM_SEED_G8_GK1');
    const gradedResult = gradeExamAttempt(simulatedAttempt, targetExam, seedData.questions);
    assert.equal(gradedResult.status, 'GRADED');
    assert.equal(gradedResult.correctCount, 6);
    assert.equal(gradedResult.wrongCount, 1);

    const qRadical = seedData.questions.find((q) => q.id === 'Q9_003');
    assert.ok(checkMathEquivalence('3*sqrt(2)', qRadical).isCorrect);
    assert.ok(checkMathEquivalence('\\sqrt{18}', qRadical).isCorrect);
    const qQuad = seedData.questions.find((q) => q.id === 'Q9_006');
    assert.ok(checkMathEquivalence('3; 2', qQuad).isCorrect);
    const qCond = seedData.questions.find((q) => q.id === 'Q9_008');
    assert.equal(
      checkMathEquivalence('x = 4; x = -5', qCond).errorCategory,
      'MISSING_CONDITION',
      'Phải phát hiện lỗi MISSING_CONDITION từ dữ liệu commonMistake mà không cần hardcode ID'
    );
    console.log('✓ [PASS] Test 10: Chấm biểu thức tương đương, chấm từng phần rubricSteps & phân loại lỗi tự động chính xác');

    // -------------------------------------------------------------------------
    // Test 11: Kiểm định toàn bộ Ngân hàng câu hỏi (bank:audit >= 15 câu/mức/khối, 0 lỗi)
    // -------------------------------------------------------------------------
    const auditResult = runBankAudit({ silent: true });
    assert.equal(auditResult.ok, true, 'bank:audit phải đạt 0 lỗi nghiêm trọng');
    assert.ok(auditResult.totalQuestions >= 240, 'Tổng số câu hỏi toàn hệ thống phải >= 240 câu');
    for (const g of [6, 7, 8, 9]) {
      for (const lv of ['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao']) {
        assert.ok(
          auditResult.coverageByGradeLevel[g][lv].total >= 15,
          `Khối ${g} mức ${lv} phải có tối thiểu 15 câu hỏi`
        );
      }
    }
    console.log(
      `✓ [PASS] Test 11: Ngân hàng câu hỏi (${auditResult.totalQuestions} câu, ${auditResult.katexFormulasChecked} công thức KaTeX) đạt chuẩn 100%`
    );

    console.log('================================================================');
    console.log('🎉 TẤT CẢ 11 BÀI KIỂM THỬ TỰ ĐỘNG ĐỀU ĐẠT (11/11 PASS)!');
    console.log('================================================================');
  } finally {
    process.env.DATABASE_URL = savedDbUrl;
    if (savedLocalState !== null) {
      fs.writeFileSync(localStatePath, savedLocalState, 'utf-8');
    }
  }
}

runTests().catch((err) => {
  console.error('❌ KIỂM THỬ THẤT BẠI:', err);
  process.exit(1);
});
