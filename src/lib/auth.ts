// ==============================================================================
// MathMaster THCS - Module Xác Thực, Băm Mật Khẩu, Phiên Thiết Bị & Rate Limit
// ==============================================================================

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

let cachedAuthSecret: string | undefined;

// Tự động đọc biến AUTH_SECRET từ file .env nếu chạy trong script kiểm thử độc lập
function loadEnvSecretIfNeeded(): string | undefined {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.trim() !== '') {
    cachedAuthSecret = process.env.AUTH_SECRET.trim();
    return cachedAuthSecret;
  }
  if (cachedAuthSecret) return cachedAuthSecret;
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed.startsWith('AUTH_SECRET=')) {
          const val = trimmed
            .slice('AUTH_SECRET='.length)
            .trim()
            .replace(/^["']|["']$/g, '');
          if (val) {
            process.env.AUTH_SECRET = val;
            cachedAuthSecret = val;
            return val;
          }
        }
      }
    }
  } catch {
    // Bỏ qua lỗi đọc file
  }
  return undefined;
}

function scryptAsync(
  password: string,
  salt: string,
  keylen: number,
  options: crypto.ScryptOptions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

/**
 * Lấy khóa bí mật AUTH_SECRET từ biến môi trường.
 * Tuyệt đối không dùng giá trị mặc định cứng trong code.
 * Ở môi trường production, nếu thiếu hoặc dùng khóa mẫu thì báo lỗi rõ ràng và dừng ngay.
 */
export function getAuthSecret(): string {
  const secret = loadEnvSecretIfNeeded();
  const isProd = process.env.NODE_ENV === 'production';

  if (!secret || secret.length < 16) {
    throw new Error(
      'Lỗi cấu hình bảo mật: Thiếu biến môi trường AUTH_SECRET (cần tối thiểu 16 ký tự trong file .env). Ứng dụng không thể khởi động khi chưa cấu hình AUTH_SECRET.'
    );
  }

  if (isProd && secret.includes('CHANGE_ME')) {
    throw new Error(
      'Lỗi cấu hình bảo mật Production: AUTH_SECRET đang giữ giá trị mặc định mẫu. Vui lòng đổi sang chuỗi ngẫu nhiên bảo mật trước khi chạy Production.'
    );
  }

  return secret;
}

// Kiểm tra ngay khi nạp module ở môi trường Production
if (process.env.NODE_ENV === 'production') {
  getAuthSecret();
}

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, keyLen: 64 };
const LEGACY_FIXED_SALT = 'mathmaster_salt_v1';

/**
 * Băm mật khẩu bằng thuật toán scrypt kèm salt ngẫu nhiên 16 bytes riêng cho từng người dùng.
 * Định dạng lưu trữ: scrypt$N=16384,r=8,p=1$<salt_hex>$<hash_hex>
 */
export function hashPassword(password: string): string {
  if (!password || typeof password !== 'string') {
    throw new Error('Mật khẩu không được để trống.');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, SCRYPT_PARAMS.keyLen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  });
  return `scrypt$N=${SCRYPT_PARAMS.N},r=${SCRYPT_PARAMS.r},p=${SCRYPT_PARAMS.p}$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Kiểm tra mật khẩu an toàn bằng timingSafeEqual và phát hiện hash cũ để tự động nâng cấp (migration).
 * Tuyệt đối KHÔNG chấp nhận storedHash === password.
 */
export function verifyPasswordWithMigration(
  password: string,
  storedHash: string
): { valid: boolean; needsRehash: boolean; isDefaultSeedPassword: boolean } {
  if (!password || typeof password !== 'string' || !storedHash || typeof storedHash !== 'string') {
    return { valid: false, needsRehash: false, isDefaultSeedPassword: false };
  }

  // 1. Định dạng chuẩn mới: scrypt$N=...,r=...,p=...$<salt>$<hash>
  if (storedHash.startsWith('scrypt$')) {
    try {
      const parts = storedHash.split('$');
      if (parts.length !== 4) {
        return { valid: false, needsRehash: false, isDefaultSeedPassword: false };
      }
      const [, paramStr, salt, expectedHex] = parts;
      const paramMap: Record<string, number> = { N: 16384, r: 8, p: 1 };
      for (const pair of paramStr.split(',')) {
        const [k, v] = pair.split('=');
        if (k && v && !Number.isNaN(Number(v))) {
          paramMap[k.trim()] = Number(v);
        }
      }
      const expectedBuf = Buffer.from(expectedHex, 'hex');
      if (expectedBuf.length === 0) {
        return { valid: false, needsRehash: false, isDefaultSeedPassword: false };
      }
      const derivedBuf = crypto.scryptSync(password, salt, expectedBuf.length, {
        N: paramMap.N,
        r: paramMap.r,
        p: paramMap.p,
      });
      if (derivedBuf.length !== expectedBuf.length) {
        return { valid: false, needsRehash: false, isDefaultSeedPassword: false };
      }
      const valid = crypto.timingSafeEqual(new Uint8Array(derivedBuf), new Uint8Array(expectedBuf));
      return {
        valid,
        needsRehash: false,
        isDefaultSeedPassword: valid && password === 'pass123',
      };
    } catch {
      return { valid: false, needsRehash: false, isDefaultSeedPassword: false };
    }
  }

  // 2. Hỗ trợ nâng cấp (migration) người dùng cũ dùng hash salt cố định v1 (64 ký tự hex)
  if (/^[0-9a-f]{64}$/i.test(storedHash)) {
    try {
      const expectedBuf = Buffer.from(storedHash, 'hex');
      const legacyBuf = crypto.scryptSync(password, LEGACY_FIXED_SALT, 32);
      if (
        expectedBuf.length === legacyBuf.length &&
        crypto.timingSafeEqual(new Uint8Array(legacyBuf), new Uint8Array(expectedBuf))
      ) {
        return {
          valid: true,
          needsRehash: true,
          isDefaultSeedPassword: password === 'pass123',
        };
      }
    } catch {
      return { valid: false, needsRehash: false, isDefaultSeedPassword: false };
    }
  }

  // Không bao giờ cho phép storedHash === password (plaintext)!
  return { valid: false, needsRehash: false, isDefaultSeedPassword: false };
}

/**
 * Hàm kiểm tra mật khẩu trả về boolean.
 * Tuyệt đối không có nhánh storedHash === password.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  return verifyPasswordWithMigration(password, storedHash).valid;
}

/**
 * Phiên bản BẤT ĐỒNG BỘ (Async) của hashPassword chạy trên libuv threadpool,
 * không làm treo Event Loop của Node.js khi nhiều học sinh đăng ký/đổi mật khẩu đồng thời.
 * Giữ nguyên độ mạnh tham số scrypt (N=16384, r=8, p=1, keyLen=64).
 */
export async function hashPasswordAsync(password: string): Promise<string> {
  if (!password || typeof password !== 'string') {
    throw new Error('Mật khẩu không được để trống.');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, SCRYPT_PARAMS.keyLen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  });
  return `scrypt$N=${SCRYPT_PARAMS.N},r=${SCRYPT_PARAMS.r},p=${SCRYPT_PARAMS.p}$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Phiên bản BẤT ĐỒNG BỘ (Async) của verifyPasswordWithMigration sử dụng crypto.scrypt async
 * kết hợp timingSafeEqual, không chặn Event Loop khi 50+ người đăng nhập cùng lúc.
 */
export async function verifyPasswordWithMigrationAsync(
  password: string,
  storedHash: string
): Promise<{ valid: boolean; needsRehash: boolean; isDefaultSeedPassword: boolean }> {
  if (!password || typeof password !== 'string' || !storedHash || typeof storedHash !== 'string') {
    return { valid: false, needsRehash: false, isDefaultSeedPassword: false };
  }

  if (storedHash.startsWith('scrypt$')) {
    try {
      const parts = storedHash.split('$');
      if (parts.length !== 4) {
        return { valid: false, needsRehash: false, isDefaultSeedPassword: false };
      }
      const [, paramStr, salt, expectedHex] = parts;
      const paramMap: Record<string, number> = { N: 16384, r: 8, p: 1 };
      for (const pair of paramStr.split(',')) {
        const [k, v] = pair.split('=');
        if (k && v && !Number.isNaN(Number(v))) {
          paramMap[k.trim()] = Number(v);
        }
      }
      const expectedBuf = Buffer.from(expectedHex, 'hex');
      if (expectedBuf.length === 0) {
        return { valid: false, needsRehash: false, isDefaultSeedPassword: false };
      }
      const derivedBuf = await scryptAsync(password, salt, expectedBuf.length, {
        N: paramMap.N,
        r: paramMap.r,
        p: paramMap.p,
      });
      if (derivedBuf.length !== expectedBuf.length) {
        return { valid: false, needsRehash: false, isDefaultSeedPassword: false };
      }
      const valid = crypto.timingSafeEqual(new Uint8Array(derivedBuf), new Uint8Array(expectedBuf));
      return {
        valid,
        needsRehash: false,
        isDefaultSeedPassword: valid && password === 'pass123',
      };
    } catch {
      return { valid: false, needsRehash: false, isDefaultSeedPassword: false };
    }
  }

  if (/^[0-9a-f]{64}$/i.test(storedHash)) {
    try {
      const expectedBuf = Buffer.from(storedHash, 'hex');
      const legacyBuf = await scryptAsync(password, LEGACY_FIXED_SALT, 32, {
        N: SCRYPT_PARAMS.N,
        r: SCRYPT_PARAMS.r,
        p: SCRYPT_PARAMS.p,
      });
      if (
        expectedBuf.length === legacyBuf.length &&
        crypto.timingSafeEqual(new Uint8Array(legacyBuf), new Uint8Array(expectedBuf))
      ) {
        return {
          valid: true,
          needsRehash: true,
          isDefaultSeedPassword: password === 'pass123',
        };
      }
    } catch {
      return { valid: false, needsRehash: false, isDefaultSeedPassword: false };
    }
  }

  return { valid: false, needsRehash: false, isDefaultSeedPassword: false };
}

/**
 * Đo độ mạnh mật khẩu phục vụ giao diện đăng ký & đổi mật khẩu.
 */
export function evaluatePasswordStrength(password: string): {
  score: number;
  label: string;
  valid: boolean;
  checks: { minLength: boolean; hasLetter: boolean; hasNumber: boolean; hasSpecialOrUpper: boolean };
} {
  const pwd = String(password || '');
  const minLength = pwd.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecialOrUpper = /[A-Z]/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd);

  let score = 0;
  if (minLength) score += 1;
  if (hasLetter) score += 1;
  if (hasNumber) score += 1;
  if (pwd.length >= 10 || hasSpecialOrUpper) score += 1;

  const labels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
  return {
    score,
    label: labels[score] || 'Yếu',
    valid: minLength && hasLetter && hasNumber,
    checks: { minLength, hasLetter, hasNumber, hasSpecialOrUpper },
  };
}

// ==============================================================================
// ZOD SCHEMAS CHO ĐĂNG KÝ, ĐĂNG NHẬP, ĐỔI MẬT KHẨU
// ==============================================================================

export const passwordPolicySchema = z
  .string({ error: 'Vui lòng nhập mật khẩu.' })
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự.')
  .regex(/[a-zA-Z]/, 'Mật khẩu phải chứa ít nhất một chữ cái.')
  .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất một chữ số.');

export const registerSchema = z
  .object({
    fullName: z
      .string({ error: 'Vui lòng nhập họ và tên.' })
      .trim()
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự.')
      .max(100, 'Họ và tên tối đa 100 ký tự.'),
    email: z
      .string({ error: 'Vui lòng nhập địa chỉ email.' })
      .trim()
      .toLowerCase()
      .email('Địa chỉ email không hợp lệ.'),
    username: z
      .string()
      .trim()
      .min(3, 'Tên đăng nhập tối thiểu 3 ký tự.')
      .max(50, 'Tên đăng nhập tối đa 50 ký tự.')
      .regex(/^[a-zA-Z0-9_.-]+$/, 'Tên đăng nhập chỉ gồm chữ không dấu, số và ký tự _ . -')
      .optional(),
    password: passwordPolicySchema,
    confirmPassword: z.string().optional(),
    currentGrade: z.coerce
      .number()
      .int()
      .refine((g) => [6, 7, 8, 9].includes(g), 'Khối lớp phải là 6, 7, 8 hoặc 9.')
      .default(8),
    preferredBook: z
      .enum(['KNTT', 'CD', 'CTST'], {
        error: 'Bộ sách phải là KNTT, CD hoặc CTST.',
      })
      .default('KNTT'),
    schoolName: z.string().trim().max(120).optional().default('THCS Việt Nam'),
    role: z.enum(['STUDENT', 'TEACHER']).optional().default('STUDENT'),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp.',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  identifier: z
    .string({ error: 'Vui lòng nhập email hoặc tên đăng nhập.' })
    .trim()
    .min(1, 'Vui lòng nhập email hoặc tên đăng nhập.'),
  password: z
    .string({ error: 'Vui lòng nhập mật khẩu.' })
    .min(1, 'Vui lòng nhập mật khẩu.'),
  rememberMe: z.boolean().optional().default(false),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại.'),
    newPassword: passwordPolicySchema,
    confirmNewPassword: z.string().optional(),
  })
  .refine((data) => !data.confirmNewPassword || data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu mới nhập lại không khớp.',
    path: ['confirmNewPassword'],
  });

// ==============================================================================
// QUẢN LÝ JWT & PHIÊN LÀM VIỆC (CÓ EXP, ISS, SUB, SID & TIMING-SAFE EQUAL)
// ==============================================================================

export interface SessionTokenPayload {
  sub: string;
  userId: string;
  sid: string;
  role: string;
  isGuest: boolean;
  iss: string;
  iat: number;
  exp: number;
}

const TOKEN_ISSUER = 'mathmaster-thcs';
const DEFAULT_SESSION_TTL_SEC = 7 * 24 * 60 * 60; // 7 ngày
const REMEMBER_ME_TTL_SEC = 30 * 24 * 60 * 60; // 30 ngày

export function signSessionToken(
  payload: {
    userId: string;
    role: string;
    isGuest: boolean;
    sessionId?: string;
    rememberMe?: boolean;
  },
  options?: { expiresInSeconds?: number }
): string {
  const secret = getAuthSecret();
  const nowSec = Math.floor(Date.now() / 1000);
  const ttlSec =
    options?.expiresInSeconds !== undefined
      ? options.expiresInSeconds
      : payload.rememberMe
      ? REMEMBER_ME_TTL_SEC
      : DEFAULT_SESSION_TTL_SEC;

  const sid = payload.sessionId || `ses_${crypto.randomUUID()}`;
  const fullPayload: SessionTokenPayload = {
    sub: payload.userId,
    userId: payload.userId,
    sid,
    role: payload.role || 'STUDENT',
    isGuest: Boolean(payload.isGuest),
    iss: TOKEN_ISSUER,
    iat: nowSec,
    exp: nowSec + ttlSec,
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

export function verifySessionToken(token: string): SessionTokenPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const secret = getAuthSecret();
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;

    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');

    const sigBuf = Buffer.from(sig, 'utf-8');
    const expectedBuf = Buffer.from(expectedSig, 'utf-8');
    if (
      sigBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(new Uint8Array(sigBuf), new Uint8Array(expectedBuf))
    ) {
      return null;
    }

    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as SessionTokenPayload;
    if (!parsed || typeof parsed !== 'object') return null;

    // Kiểm tra issuer và hạn dùng exp bắt buộc
    if (parsed.iss !== TOKEN_ISSUER) return null;
    if (typeof parsed.exp !== 'number') return null;
    const nowSec = Math.floor(Date.now() / 1000);
    if (parsed.exp <= nowSec) {
      return null; // Token đã hết hạn
    }

    if (!parsed.userId && parsed.sub) {
      parsed.userId = parsed.sub;
    }
    if (!parsed.userId) return null;

    return parsed;
  } catch {
    return null;
  }
}

// ==============================================================================
// GIỚI HẠN SỐ LẦN ĐĂNG NHẬP SAI (RATE LIMITER)
// ==============================================================================

interface RateLimitBucket {
  failures: number[];
  lockedUntil: number | null;
}

const loginRateLimitStore = new Map<string, RateLimitBucket>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 phút
const RATE_LIMIT_MAX_ATTEMPTS = 5; // Tối đa 5 lần sai / 15 phút

export function getRateLimitKey(ip: string, identifier: string): string {
  return `${String(ip || 'unknown').trim().toLowerCase()}::${String(identifier || 'unknown')
    .trim()
    .toLowerCase()}`;
}

export function checkLoginRateLimit(
  ip: string,
  identifier: string
): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
  const key = getRateLimitKey(ip, identifier);
  const now = Date.now();
  const bucket = loginRateLimitStore.get(key);
  if (!bucket) {
    return { allowed: true, remainingAttempts: RATE_LIMIT_MAX_ATTEMPTS, retryAfterSeconds: 0 };
  }

  if (bucket.lockedUntil && bucket.lockedUntil > now) {
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds: Math.ceil((bucket.lockedUntil - now) / 1000),
    };
  }

  bucket.failures = bucket.failures.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (bucket.failures.length >= RATE_LIMIT_MAX_ATTEMPTS) {
    bucket.lockedUntil = now + RATE_LIMIT_WINDOW_MS;
    loginRateLimitStore.set(key, bucket);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
    };
  }

  return {
    allowed: true,
    remainingAttempts: RATE_LIMIT_MAX_ATTEMPTS - bucket.failures.length,
    retryAfterSeconds: 0,
  };
}

export function recordLoginFailure(ip: string, identifier: string): {
  failedCount: number;
  locked: boolean;
  retryAfterSeconds: number;
} {
  const key = getRateLimitKey(ip, identifier);
  const now = Date.now();
  const bucket = loginRateLimitStore.get(key) || { failures: [], lockedUntil: null };
  bucket.failures = bucket.failures.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  bucket.failures.push(now);

  if (bucket.failures.length >= RATE_LIMIT_MAX_ATTEMPTS) {
    bucket.lockedUntil = now + RATE_LIMIT_WINDOW_MS;
  }
  loginRateLimitStore.set(key, bucket);

  const locked = Boolean(bucket.lockedUntil && bucket.lockedUntil > now);
  return {
    failedCount: bucket.failures.length,
    locked,
    retryAfterSeconds: locked && bucket.lockedUntil ? Math.ceil((bucket.lockedUntil - now) / 1000) : 0,
  };
}

export function resetLoginRateLimit(ip: string, identifier: string): void {
  loginRateLimitStore.delete(getRateLimitKey(ip, identifier));
}

export function clearAllRateLimitsForTesting(): void {
  loginRateLimitStore.clear();
}

// ==============================================================================
// PHÂN TÍCH TÊN THIẾT BỊ & INTERFACE GỬI EMAIL ĐẶT LẠI MẬT KHẨU
// ==============================================================================

import {
  sendPasswordResetEmail as mailerSendEmail,
  sendRegistrationVerificationEmail as mailerSendVerificationEmail,
  isSmtpConfigured,
} from './mailer';

export function parseDeviceNameFromUserAgent(userAgent?: string | null): string {
  if (!userAgent) return 'Thiết bị Web';
  const ua = userAgent.toLowerCase();
  let os = 'Thiết bị khác';
  if (ua.includes('iphone')) os = 'iPhone';
  else if (ua.includes('ipad')) os = 'iPad';
  else if (ua.includes('android')) os = 'Điện thoại Android';
  else if (ua.includes('windows')) os = 'Máy tính Windows';
  else if (ua.includes('mac os') || ua.includes('macintosh')) os = 'Máy Mac';
  else if (ua.includes('linux')) os = 'Máy tính Linux';

  let browser = 'Trình duyệt';
  if (ua.includes('edg/')) browser = 'Edge';
  else if (ua.includes('chrome/') && !ua.includes('edg/')) browser = 'Chrome';
  else if (ua.includes('firefox/')) browser = 'Firefox';
  else if (ua.includes('safari/') && !ua.includes('chrome/')) browser = 'Safari';

  return `${os} • ${browser}`;
}

/**
 * Sinh mã khôi phục mật khẩu 6 chữ số ngẫu nhiên
 */
export function generateResetCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/**
 * Băm mã khôi phục 6 số bằng HMAC-SHA256 kết hợp AUTH_SECRET và userId
 */
export function hashResetCode(userId: string, code: string): string {
  const secret = getAuthSecret();
  return crypto.createHmac('sha256', secret).update(`${userId}:${code.trim()}`).digest('hex');
}

/**
 * So sánh an toàn mã khôi phục bằng crypto.timingSafeEqual
 */
export function verifyResetCode(userId: string, inputCode: string, storedHash: string): boolean {
  if (!userId || !inputCode || !storedHash) return false;
  const computed = hashResetCode(userId, inputCode);
  const compBuf = Buffer.from(computed, 'utf-8');
  const storedBuf = Buffer.from(storedHash, 'utf-8');
  if (compBuf.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(new Uint8Array(compBuf), new Uint8Array(storedBuf));
}

export function hashResetToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export interface EmailService {
  sendPasswordResetEmail(params: {
    toEmail: string;
    fullName: string;
    code?: string;
    resetUrl?: string;
    expiresInMinutes?: number;
  }): Promise<{ sent: boolean; reason?: string; previewUrl?: string }>;
  sendRegistrationVerificationEmail(params: {
    toEmail: string;
    fullName: string;
    code: string;
    expiresInMinutes?: number;
  }): Promise<{ sent: boolean; reason?: string }>;
}

export const defaultEmailService: EmailService = {
  async sendPasswordResetEmail({ toEmail, fullName, code, resetUrl, expiresInMinutes = 15 }) {
    if (code) {
      const result = await mailerSendEmail({
        toEmail,
        fullName,
        code,
        resetUrl,
        expiresInMinutes,
      });

      if (process.env.NODE_ENV !== 'production' && !result.sent) {
        console.log('==============================================================');
        console.log(`📧 [DEV EMAIL - SMTP CHƯA CẤU HÌNH] Cho: ${fullName} <${toEmail}>`);
        console.log(`🔢 Mã khôi phục (6 số): ${code}`);
        if (resetUrl) console.log(`🔗 Link đặt lại: ${resetUrl}`);
        console.log('==============================================================');
      }

      return {
        sent: result.sent,
        reason: result.reason,
        previewUrl: resetUrl,
      };
    }

    // Trường hợp dự phòng nếu chỉ truyền resetUrl
    return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };
  },

  async sendRegistrationVerificationEmail({ toEmail, fullName, code, expiresInMinutes = 15 }) {
    const result = await mailerSendVerificationEmail({
      toEmail,
      fullName,
      code,
      expiresInMinutes,
    });

    if (process.env.NODE_ENV !== 'production' && !result.sent) {
      console.log('==============================================================');
      console.log(`📧 [DEV EMAIL - XÁC THỰC GMAIL] Cho: ${fullName} <${toEmail}>`);
      console.log(`🔢 Mã xác thực Gmail (6 số): ${code}`);
      console.log('==============================================================');
    }

    return {
      sent: result.sent,
      reason: result.reason,
    };
  },
};

/**
 * Loại bỏ tuyệt đối các trường nhạy cảm (passwordHash, password_hash) trước khi trả về client.
 */
export function sanitizeUserForClient(user: any): any {
  if (!user || typeof user !== 'object') return null;
  const copy = { ...user };
  delete copy.passwordHash;
  delete copy.password_hash;
  if (copy.emailVerified === undefined) {
    copy.emailVerified = Boolean(user.isEmailVerified ?? user.emailVerified ?? true);
  }
  return copy;
}
