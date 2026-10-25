// ==============================================================================
// MathMaster THCS - Script Tạo Tài Khoản Quản Trị Viên (Admin)
// Cách sử dụng từ PowerShell / Terminal:
//   npm run create-admin
//   hoặc: node scripts/create-admin.mjs <email> <password> <fullName> <username>
//   Ví dụ: node scripts/create-admin.mjs admin@mathmaster.edu.vn MatKhauAdmin@2026 "Quản trị viên" admin_root
// ==============================================================================

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Tự động nạp biến môi trường từ file .env nếu có
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

// Băm mật khẩu theo chuẩn scrypt của MathMaster THCS
function hashPassword(password) {
  const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, keyLen: 64 };
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, SCRYPT_PARAMS.keyLen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  });
  return `scrypt$N=${SCRYPT_PARAMS.N},r=${SCRYPT_PARAMS.r},p=${SCRYPT_PARAMS.p}$${salt}$${derivedKey.toString('hex')}`;
}

async function main() {
  console.log('================================================================');
  console.log('🛡️ MATHMASTER THCS - TẠO TÀI KHOẢN QUẢN TRỊ VIÊN (ADMIN)');
  console.log('================================================================');

  let email = process.env.ADMIN_EMAIL || process.argv[2];
  let password = process.env.ADMIN_PASSWORD || process.argv[3];
  let fullName = process.env.ADMIN_NAME || process.argv[4];
  let username = process.env.ADMIN_USERNAME || process.argv[5];

  if (!email) {
    email = await askQuestion('👉 Nhập Email cho tài khoản Admin: ');
  }
  if (!password) {
    password = await askQuestion('👉 Nhập Mật khẩu cho Admin (tối thiểu 6 ký tự): ');
  }
  if (!fullName) {
    fullName = await askQuestion('👉 Nhập Họ và tên Quản trị viên (mặc định: Quản trị viên MathMaster): ');
    if (!fullName) fullName = 'Quản trị viên MathMaster';
  }
  if (!username) {
    const defaultUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    username = await askQuestion(`👉 Nhập Tên đăng nhập (mặc định: ${defaultUsername}): `);
    if (!username) username = defaultUsername;
  }

  const trimmedEmail = String(email || '').trim().toLowerCase();
  const trimmedPassword = String(password || '').trim();
  const trimmedName = String(fullName || '').trim();
  const trimmedUsername = String(username || '').trim().toLowerCase();

  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    console.error('❌ Lỗi: Email không hợp lệ.');
    process.exit(1);
  }
  if (!trimmedPassword || trimmedPassword.length < 6) {
    console.error('❌ Lỗi: Mật khẩu phải có tối thiểu 6 ký tự.');
    process.exit(1);
  }
  if (!trimmedUsername || trimmedUsername.length < 3) {
    console.error('❌ Lỗi: Tên đăng nhập phải có tối thiểu 3 ký tự.');
    process.exit(1);
  }

  // Nạp module prisma động
  const { readServerStateAsync, writeServerStateAsync } = await import('../src/lib/prisma.ts');

  console.log('⏳ Đang kết nối và đọc dữ liệu hệ thống...');
  const state = await readServerStateAsync();
  if (!state.users) state.users = [];

  const existingIdx = state.users.findIndex(
    (u) =>
      (u.email || '').toLowerCase() === trimmedEmail ||
      (u.username || '').toLowerCase() === trimmedUsername
  );

  const passwordHash = hashPassword(trimmedPassword);
  const nowIso = new Date().toISOString();

  let targetUser;

  if (existingIdx !== -1) {
    // Nâng cấp tài khoản hiện có thành ADMIN
    targetUser = state.users[existingIdx];
    targetUser.fullName = trimmedName || targetUser.fullName;
    targetUser.email = trimmedEmail;
    targetUser.username = trimmedUsername;
    targetUser.passwordHash = passwordHash;
    targetUser.role = 'ADMIN';
    targetUser.status = 'active';
    targetUser.isBanned = false;
    targetUser.banReason = '';
    targetUser.deletedAt = null;
    targetUser.mustChangePassword = false;
    targetUser.failedLoginCount = 0;
    targetUser.lockedUntil = null;
    targetUser.updatedAt = nowIso;

    console.log(`ℹ️ Tài khoản ${trimmedEmail} đã tồn tại. Đã nâng cấp quyền hạn lên ADMIN và cập nhật mật khẩu mới.`);
  } else {
    // Tạo mới tài khoản ADMIN
    const newAdminId = `user_admin_${crypto.randomUUID()}`;
    targetUser = {
      id: newAdminId,
      email: trimmedEmail,
      username: trimmedUsername,
      passwordHash,
      fullName: trimmedName,
      role: 'ADMIN',
      status: 'active',
      isGuest: false,
      mustChangePassword: false,
      schoolName: 'Ban Quản Trị Hệ Thống',
      currentGrade: 9,
      preferredBook: 'KNTT',
      xp: 2000,
      level: 10,
      streakDays: 30,
      failedLoginCount: 0,
      lockedUntil: null,
      favoriteQuestionIds: [],
      anonymousLeaderboard: false,
      onboardingCompleted: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    state.users.push(targetUser);
    console.log(`✅ Đã tạo mới tài khoản ADMIN: ${trimmedName} (${trimmedEmail})`);
  }

  // Ghi nhận Audit Log
  if (!state.auditLogs) state.auditLogs = [];
  state.auditLogs.unshift({
    id: `audit_${crypto.randomUUID()}`,
    adminId: targetUser.id,
    adminName: targetUser.fullName,
    adminEmail: targetUser.email,
    action: 'system.createAdmin',
    targetType: 'System',
    targetId: targetUser.id,
    targetName: targetUser.fullName,
    meta: {
      email: trimmedEmail,
      username: trimmedUsername,
      action: 'Created or upgraded via PowerShell script',
    },
    ip: '127.0.0.1 (CLI)',
    createdAt: nowIso,
  });

  await writeServerStateAsync(state);

  console.log('================================================================');
  console.log('🎉 KHỞI TẠO TÀI KHOẢN ADMIN THÀNH CÔNG!');
  console.log('================================================================');
  console.log(`👤 Họ và tên:       ${targetUser.fullName}`);
  console.log(`📧 Email đăng nhập: ${targetUser.email}`);
  console.log(`🏷️ Tên đăng nhập:  ${targetUser.username}`);
  console.log(`🔑 Mật khẩu:        ${trimmedPassword}`);
  console.log(`🛡️ Vai trò:         ADMIN`);
  console.log(`🌐 Link đăng nhập:  http://localhost:3000/login`);
  console.log(`⚙️ Trang quản trị:  http://localhost:3000/admin/students`);
  console.log('================================================================');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Lỗi tạo tài khoản admin:', err);
  process.exit(1);
});
