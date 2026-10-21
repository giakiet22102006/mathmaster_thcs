// ==============================================================================
// MathMaster THCS - Lớp Lưu Trữ Dữ Liệu Thống Nhất (Prisma PostgreSQL & Demo Store)
// Quản lý Người dùng, Phiên Thiết bị (Sessions), Đề thi, Lượt làm bài, Lớp học
// ==============================================================================

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { NextRequest } from 'next/server';
import {
  hashPassword,
  parseDeviceNameFromUserAgent,
  sanitizeUserForClient,
  verifySessionToken,
} from './auth';

let prismaInstance: any = null;
let cloudTableInitialized = false;

export async function getPrismaClient() {
  if (prismaInstance) return prismaInstance;
  try {
    const mod = await import('@prisma/client');
    const PrismaClient = mod.PrismaClient;
    prismaInstance = new PrismaClient();
    return prismaInstance;
  } catch {
    return null;
  }
}

export function isDatabaseUrlConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_URL &&
      !process.env.DATABASE_URL.includes('CHANGE_ME') &&
      process.env.DATABASE_URL.startsWith('postgres')
  );
}

export async function checkDatabaseConnection(): Promise<boolean> {
  if (!isDatabaseUrlConfigured()) {
    return false;
  }
  try {
    const prisma = await getPrismaClient();
    if (!prisma) return false;
    await prisma.$queryRawUnsafe('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

let cachedWritableStateFilePath: string | null = null;
let cachedExtraQuestionBank: any[] | null = null;
let cachedServerState: any = null;
let cachedStateFileMtimeMs = -1;
let cachedDbUpdatedAtMs = -1;
let cachedDbLastCheckedAtMs = 0;
const DB_CACHE_TTL_MS = 5000; // Kiểm tra độ tươi updated_at tối đa 1 lần mỗi 5 giây
let inFlightReadStatePromise: Promise<any> | null = null;

let questionByIdCache: Map<string, any> | null = null;
let questionByIdCacheQuestionsRef: any = null;
let questionByIdCacheBuiltVersion = 0;
let questionPoolVersion = 1;

let examByIdCache: Map<string, any> | null = null;
let examByIdCacheExamsRef: any = null;
let examByIdCacheBuiltVersion = 0;
let examPoolVersion = 1;

// Bộ nhớ đệm kết quả Dashboard theo từng người dùng (TTL 45s) & Bảng xếp hạng (TTL 90s)
interface DashboardCacheEntry {
  data: any;
  expiresAtMs: number;
}
const dashboardUserCache = new Map<string, DashboardCacheEntry>();
let leaderboardSharedCache: { entries: any[]; expiresAtMs: number } | null = null;

export function getDashboardCacheEntry(key: string): any | null {
  const entry = dashboardUserCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAtMs) {
    dashboardUserCache.delete(key);
    return null;
  }
  return entry.data;
}

export function setDashboardCacheEntry(key: string, data: any, ttlMs = 45000) {
  dashboardUserCache.set(key, {
    data,
    expiresAtMs: Date.now() + ttlMs,
  });
}

export function getLeaderboardSharedCache(): any[] | null {
  if (!leaderboardSharedCache) return null;
  if (Date.now() > leaderboardSharedCache.expiresAtMs) {
    leaderboardSharedCache = null;
    return null;
  }
  return leaderboardSharedCache.entries;
}

export function setLeaderboardSharedCache(entries: any[], ttlMs = 90000) {
  leaderboardSharedCache = {
    entries,
    expiresAtMs: Date.now() + ttlMs,
  };
}

export function invalidateDashboardCache(userId?: string, invalidateLeaderboard = false) {
  if (!userId) {
    dashboardUserCache.clear();
    leaderboardSharedCache = null;
    return;
  }
  const prefix = `${userId}:`;
  for (const key of dashboardUserCache.keys()) {
    if (key.startsWith(prefix)) {
      dashboardUserCache.delete(key);
    }
  }
  if (invalidateLeaderboard) {
    leaderboardSharedCache = null;
  }
}

export interface PerfReadMetric {
  branch: 'db' | 'db-cache' | 'db-revalidated' | 'single-flight' | 'file' | 'file-cache';
  dbQueries: number;
  fetchMs: number;
  payloadKB: number;
  normalizeMs: number;
  totalMs: number;
}

let lastPerfReadMetric: PerfReadMetric | null = null;
let totalDbQueriesCounter = 0;

export function getPerfDiagnostics() {
  return {
    lastRead: lastPerfReadMetric,
    totalDbQueries: totalDbQueriesCounter,
  };
}

export function resetPerfDiagnostics() {
  lastPerfReadMetric = null;
  totalDbQueriesCounter = 0;
}

export function invalidateQuestionPoolCache() {
  questionByIdCache = null;
  questionByIdCacheQuestionsRef = null;
  questionPoolVersion += 1;
}

export function invalidateExamPoolCache() {
  examByIdCache = null;
  examByIdCacheExamsRef = null;
  examPoolVersion += 1;
}

export function getQuestionByIdMap(state: any): Map<string, any> {
  const questionsArr = state?.questions || [];
  if (
    questionByIdCache &&
    questionByIdCacheBuiltVersion === questionPoolVersion &&
    questionByIdCacheQuestionsRef === questionsArr &&
    questionByIdCache.size === questionsArr.length
  ) {
    return questionByIdCache;
  }
  const map = new Map<string, any>();
  for (const q of questionsArr) {
    if (q && q.id) map.set(q.id, q);
  }
  questionByIdCache = map;
  questionByIdCacheQuestionsRef = questionsArr;
  questionByIdCacheBuiltVersion = questionPoolVersion;
  return map;
}

export function getExamByIdMap(state: any): Map<string, any> {
  const examsArr = state?.exams || [];
  if (
    examByIdCache &&
    examByIdCacheBuiltVersion === examPoolVersion &&
    examByIdCacheExamsRef === examsArr &&
    examByIdCache.size === examsArr.length
  ) {
    return examByIdCache;
  }
  const map = new Map<string, any>();
  for (const ex of examsArr) {
    if (ex && ex.id) map.set(ex.id, ex);
  }
  examByIdCache = map;
  examByIdCacheExamsRef = examsArr;
  examByIdCacheBuiltVersion = examPoolVersion;
  return map;
}

export function sanitizeQuestionForInProgressExam(q: any) {
  if (!q || typeof q !== 'object') return q;
  const {
    correctAnswer: _ca,
    acceptedAnswers: _aa,
    solution: _sol,
    distractorTypes: _dt,
    ...publicFields
  } = q;
  return publicFields;
}

function getWritableStateFilePath(): string {
  if (cachedWritableStateFilePath) return cachedWritableStateFilePath;
  const localDir = path.join(process.cwd(), '.data');
  try {
    fs.mkdirSync(localDir, { recursive: true });
    fs.accessSync(localDir, fs.constants.W_OK);
    cachedWritableStateFilePath = path.join(localDir, 'local_db_state.json');
    return cachedWritableStateFilePath;
  } catch {
    const tmpDir = path.join(os.tmpdir(), 'mathmaster-thcs-data');
    try {
      fs.mkdirSync(tmpDir, { recursive: true });
    } catch {}
    cachedWritableStateFilePath = path.join(tmpDir, 'local_db_state.json');
    return cachedWritableStateFilePath;
  }
}

const SEED_FILE = path.join(process.cwd(), 'prisma', 'seed_data.json');
const QUESTION_BANK_DIR = path.join(process.cwd(), 'prisma', 'question_bank');

/**
 * Đọc bổ sung các câu hỏi từ thư mục prisma/question_bank/*.json (có bộ nhớ đệm trong RAM)
 */
export function loadExtraQuestionBankFiles(): any[] {
  if (cachedExtraQuestionBank) return cachedExtraQuestionBank;
  const extraQuestions: any[] = [];
  try {
    if (fs.existsSync(QUESTION_BANK_DIR)) {
      const files = fs
        .readdirSync(QUESTION_BANK_DIR)
        .filter((f) => f.endsWith('.json'))
        .sort();
      for (const file of files) {
        const raw = fs.readFileSync(path.join(QUESTION_BANK_DIR, file), 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          extraQuestions.push(...parsed);
        } else if (parsed && Array.isArray(parsed.questions)) {
          extraQuestions.push(...parsed.questions);
        }
      }
    }
  } catch (err) {
    console.error('Lỗi đọc prisma/question_bank:', err);
  }
  cachedExtraQuestionBank = extraQuestions;
  return extraQuestions;
}

// Các bản băm scrypt chuẩn đã tính trước cho tài khoản seed để tuyệt đối KHÔNG chạy scryptSync trên đường đọc
const PRECOMPUTED_SEED_HASHES = {
  pass123:
    'scrypt$N=16384,r=8,p=1$9961dbd7c438f00f488d7f4b152e8804$daf98975bcf3dce584894fdd34948eff013f49bb7eb365d63140b7123d1ade9a99cd9adaa8ffb0a78a542981af366e776f3aba641e1e07041fe02b12168004df',
  teacher:
    'scrypt$N=16384,r=8,p=1$f92ed3564c040e611830dc711afea314$1ad26766c89dd3fa9cd6e12e3e6b8556eb477f242640d84224c917e60d3131d8e882d1a71eb2e4eb95584119cb5375e784a5a466b5031cddc900380dd3edf8e6',
  admin:
    'scrypt$N=16384,r=8,p=1$05f7d6f97e3f91901fe3113fd005004a$9e667f1a59ffad9192206a49eb4035f079899eca98b44f18f5f5851a18a3dafa750416f7cb70891cc9c8d8a43f77b74acaa9e49e9579238cbf1767bdb5128775',
};

function markStateNormalized(state: any) {
  if (state && typeof state === 'object') {
    Object.defineProperty(state, '__normalized', {
      value: true,
      writable: true,
      enumerable: false,
      configurable: true,
    });
  }
}

/**
 * Chuẩn hoá dữ liệu tài khoản (Chỉ chạy ĐÚNG 1 LẦN khi nạp dữ liệu mới từ nguồn):
 * - Tuyệt đối không chạy hashPassword (scryptSync) trong đường đọc.
 * - Gắn cờ mustChangePassword = true cho tài khoản seed dùng mật khẩu mặc định.
 * - Bổ sung tài khoản Giáo viên và Quản trị viên mẫu nếu chưa có.
 */
function normalizeStateObject(state: any): any {
  if (!state || typeof state !== 'object') return state;
  if ((state as any).__normalized === true) return state;

  // Xoá hoàn toàn currentUserId khỏi state dùng chung trên server (Mục 2.11)
  if ('currentUserId' in state) {
    delete state.currentUserId;
  }

  if (!Array.isArray(state.users)) state.users = [];
  if (!Array.isArray(state.sessions)) state.sessions = [];
  if (!Array.isArray(state.passwordResetTokens)) state.passwordResetTokens = [];
  if (!Array.isArray(state.questions)) state.questions = [];
  if (!Array.isArray(state.exams)) state.exams = [];
  if (!Array.isArray(state.attempts)) state.attempts = [];
  if (!Array.isArray(state.documents)) state.documents = [];
  if (!Array.isArray(state.reviewQueue)) state.reviewQueue = [];
  if (!Array.isArray(state.formulas)) state.formulas = [];
  if (!Array.isArray(state.achievements)) state.achievements = [];
  if (!Array.isArray(state.userAchievements)) state.userAchievements = [];
  if (!Array.isArray(state.learningGoals)) state.learningGoals = [];
  if (!Array.isArray(state.studySessions)) state.studySessions = [];
  if (!Array.isArray(state.topicMastery)) state.topicMastery = [];
  if (!Array.isArray(state.classrooms)) state.classrooms = [];
  if (!Array.isArray(state.classroomMembers)) state.classroomMembers = [];
  if (!Array.isArray(state.classroomAssignments)) state.classroomAssignments = [];

  // Chuẩn hoá tài khoản hiện có (không gọi scryptSync trên đường đọc)
  for (const u of state.users) {
    const rawHash = u.passwordHash || u.password_hash || '';
    if (!rawHash || rawHash === 'pass123' || rawHash === 'hashed') {
      u.passwordHash = PRECOMPUTED_SEED_HASHES.pass123;
      u.mustChangePassword = true;
    } else if (!rawHash.startsWith('scrypt$') && !/^[0-9a-f]{64}$/i.test(rawHash)) {
      u.passwordHash = PRECOMPUTED_SEED_HASHES.pass123;
      u.mustChangePassword = true;
    } else {
      u.passwordHash = rawHash;
      if (u.mustChangePassword === undefined) {
        u.mustChangePassword = false;
      }
    }
    delete u.password_hash;
    u.email = String(u.email || '').trim().toLowerCase();
    u.role = u.role || 'STUDENT';
    u.failedLoginCount = Number(u.failedLoginCount || 0);
    u.lockedUntil = u.lockedUntil || null;
    u.favoriteQuestionIds = Array.isArray(u.favoriteQuestionIds) ? u.favoriteQuestionIds : [];
    u.anonymousLeaderboard = Boolean(u.anonymousLeaderboard);
    u.onboardingCompleted = Boolean(u.onboardingCompleted);
  }

  // Đảm bảo có tài khoản TEACHER và ADMIN mẫu phục vụ kiểm thử & quản trị
  const hasTeacher = state.users.some((u: any) => u.role === 'TEACHER');
  if (!hasTeacher) {
    state.users.push({
      id: 'user_teacher_01',
      username: 'giaovien_toan',
      email: 'giaovien.thcs@mathmaster.edu.vn',
      passwordHash: PRECOMPUTED_SEED_HASHES.teacher,
      mustChangePassword: false,
      fullName: 'Cô Nguyễn Thu Hà (Giáo viên Toán)',
      role: 'TEACHER',
      isGuest: false,
      schoolName: 'THCS Chu Văn An',
      currentGrade: 9,
      preferredBook: 'KNTT',
      xp: 1500,
      level: 8,
      streakDays: 15,
      lastStudyDate: '2026-10-21',
      theme: 'light',
      failedLoginCount: 0,
      lockedUntil: null,
      favoriteQuestionIds: [],
      anonymousLeaderboard: false,
      onboardingCompleted: true,
    });
  }

  const hasAdmin = state.users.some((u: any) => u.role === 'ADMIN');
  if (!hasAdmin) {
    state.users.push({
      id: 'user_admin_01',
      username: 'admin_mathmaster',
      email: 'admin.thcs@mathmaster.edu.vn',
      passwordHash: PRECOMPUTED_SEED_HASHES.admin,
      mustChangePassword: false,
      fullName: 'Quản trị viên MathMaster',
      role: 'ADMIN',
      isGuest: false,
      schoolName: 'Hệ thống MathMaster THCS',
      currentGrade: 9,
      preferredBook: 'KNTT',
      xp: 2000,
      level: 10,
      streakDays: 30,
      lastStudyDate: '2026-10-21',
      theme: 'light',
      failedLoginCount: 0,
      lockedUntil: null,
      favoriteQuestionIds: [],
      anonymousLeaderboard: false,
      onboardingCompleted: true,
    });
  }

  // Nạp thêm câu hỏi từ prisma/question_bank/*.json nếu chưa có trong state.questions
  const extraQs = loadExtraQuestionBankFiles();
  if (extraQs.length > 0) {
    const existingIds = new Set(state.questions.map((q: any) => q.id));
    for (const eq of extraQs) {
      if (!existingIds.has(eq.id)) {
        state.questions.push(eq);
        existingIds.add(eq.id);
      }
    }
  }

  // Chuẩn hoá tính nhất quán giữa cognitiveLevel và difficulty cho toàn bộ câu hỏi
  const cogToDiffMap: Record<string, string> = {
    nhan_biet: 'easy',
    thong_hieu: 'medium',
    van_dung: 'hard',
    van_dung_cao: 'hard',
  };
  for (const q of state.questions) {
    const expectedDiff = cogToDiffMap[String(q.cognitiveLevel || '').toLowerCase()];
    if (expectedDiff && q.difficulty !== expectedDiff && q.difficulty !== 'very_hard') {
      q.difficulty = expectedDiff;
    }
  }

  // Chuẩn hoá thông số SM-2 cho reviewQueue
  for (const rev of state.reviewQueue) {
    if (rev.easeFactor === undefined) rev.easeFactor = 2.5;
    if (rev.intervalDays === undefined) rev.intervalDays = 1;
    if (rev.repetitions === undefined) rev.repetitions = 0;
    if (!rev.nextReviewAt) rev.nextReviewAt = new Date().toISOString();
  }

  // Khởi tạo lớp học mẫu nếu chưa có
  if (state.classrooms.length === 0) {
    state.classrooms.push({
      id: 'CLASS_SEED_8A',
      teacherId: 'user_teacher_01',
      name: 'Lớp Toán 8A - Ôn thi Học kì',
      grade: 8,
      joinCode: 'TOAN8A',
      description: 'Lớp ôn tập Toán 8 theo chương trình GDPT 2018',
      createdAt: '2026-10-15T08:00:00.000Z',
    });
    state.classroomMembers.push({
      id: 'CM_SEED_01',
      classroomId: 'CLASS_SEED_8A',
      studentId: 'user_minhanh_01',
      joinedAt: '2026-10-15T09:00:00.000Z',
    });
    state.classroomAssignments.push({
      id: 'ASN_SEED_01',
      classroomId: 'CLASS_SEED_8A',
      examId: 'EXAM_SEED_G8_GK1',
      title: 'Bài kiểm tra Giữa kì I - Tuần 8',
      dueDate: '2026-11-01T23:59:00.000Z',
      createdAt: '2026-10-15T09:30:00.000Z',
    });
  }

  markStateNormalized(state);
  return state;
}

function loadDefaultSeedState(): any {
  try {
    if (fs.existsSync(SEED_FILE)) {
      const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
      const rawState = {
        curriculum: seed.curriculum,
        users: seed.users || [],
        sessions: [],
        passwordResetTokens: [],
        questions: seed.questions || [],
        exams: seed.exams || [],
        attempts: seed.attempts || [],
        documents: seed.documents || [],
        reviewQueue: seed.reviewQueue || [],
        formulas: seed.formulas || [],
        achievements: seed.achievements || [],
        userAchievements: seed.userAchievements || [],
        learningGoals: seed.learningGoals || [],
        studySessions: seed.studySessions || [],
        topicMastery: [],
        classrooms: [],
        classroomMembers: [],
        classroomAssignments: [],
      };
      return normalizeStateObject(rawState);
    }
  } catch (err) {
    console.error('Lỗi đọc seed_data.json:', err);
  }
  return null;
}

export function readServerState(): any {
  try {
    const stateFile = getWritableStateFilePath();
    if (fs.existsSync(stateFile)) {
      const stat = fs.statSync(stateFile);
      if (cachedServerState && stat.mtimeMs === cachedStateFileMtimeMs) {
        return cachedServerState;
      }
      const raw = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
      const hadCurrentUserId = 'currentUserId' in raw;
      const hadPlainSeed = (raw.users || []).some(
        (u: any) => u.passwordHash === 'pass123' || u.passwordHash === 'hashed'
      );
      const normalized = normalizeStateObject(raw);
      cachedServerState = normalized;
      cachedStateFileMtimeMs = stat.mtimeMs;
      invalidateQuestionPoolCache();
      if (hadCurrentUserId || hadPlainSeed) {
        writeServerState(normalized);
      }
      return normalized;
    }
    const initial = loadDefaultSeedState();
    if (initial) {
      writeServerState(initial);
      return initial;
    }
  } catch (err) {
    console.error('Lỗi đọc trạng thái server:', err);
  }
  return loadDefaultSeedState();
}

export function writeServerState(stateObj: any): boolean {
  try {
    if (stateObj && typeof stateObj === 'object' && 'currentUserId' in stateObj) {
      delete stateObj.currentUserId;
    }
    cachedServerState = stateObj;
    // Ở môi trường production khi đã có DATABASE_URL thì không dùng file JSON làm nguồn chính
    if (process.env.NODE_ENV === 'production' && isDatabaseUrlConfigured()) {
      return true;
    }
    const stateFile = getWritableStateFilePath();
    fs.writeFileSync(stateFile, JSON.stringify(stateObj), 'utf-8');
    try {
      cachedStateFileMtimeMs = fs.statSync(stateFile).mtimeMs;
    } catch {}
    return true;
  } catch (err) {
    console.error('Lỗi ghi trạng thái server:', err);
    return false;
  }
}

// Hàng đợi gộp ghi bất đồng bộ (Write Coalescing) để không ghi chồng chéo khi 50 request đến cùng lúc
let activeWritePromise: Promise<boolean> | null = null;
let pendingWriteState: any = null;

async function flushPendingDiskWrite(): Promise<boolean> {
  if (activeWritePromise) {
    return activeWritePromise;
  }
  activeWritePromise = (async () => {
    let ok = true;
    while (pendingWriteState !== null) {
      const stateToWrite = pendingWriteState;
      pendingWriteState = null;
      try {
        if (process.env.NODE_ENV === 'production' && isDatabaseUrlConfigured()) {
          continue;
        }
        const stateFile = getWritableStateFilePath();
        const serialized = JSON.stringify(stateToWrite);
        await fs.promises.writeFile(stateFile, serialized, 'utf-8');
        const st = await fs.promises.stat(stateFile).catch(() => null);
        if (st) cachedStateFileMtimeMs = st.mtimeMs;
      } catch (err) {
        console.error('Lỗi ghi trạng thái server bất đồng bộ:', err);
        ok = false;
      }
    }
    activeWritePromise = null;
    return ok;
  })();
  return activeWritePromise;
}

async function ensureCloudStateTable(prisma: any) {
  if (cloudTableInitialized || !prisma) return 0;
  totalDbQueriesCounter += 1;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS mm_cloud_state (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  cloudTableInitialized = true;
  return 1;
}

async function readServerStateInternalAsync(): Promise<any> {
  const tStart = performance.now();
  const perfLogEnabled = process.env.PERF_LOG === '1';

  if (isDatabaseUrlConfigured()) {
    // 1. Trả ngay từ bộ nhớ đệm nếu còn trong TTL (5 giây)
    const nowMs = Date.now();
    if (cachedServerState && nowMs - cachedDbLastCheckedAtMs < DB_CACHE_TTL_MS) {
      const totalMs = Number((performance.now() - tStart).toFixed(2));
      lastPerfReadMetric = {
        branch: 'db-cache',
        dbQueries: 0,
        fetchMs: 0,
        payloadKB: 0,
        normalizeMs: 0,
        totalMs,
      };
      if (perfLogEnabled) {
        console.log(
          `[PERF_LOG] readServerStateAsync branch=db-cache dbQueries=0 totalMs=${totalMs}ms`
        );
      }
      return cachedServerState;
    }

    try {
      const prisma = await getPrismaClient();
      if (prisma) {
        let dbQueries = 0;
        dbQueries += await ensureCloudStateTable(prisma);

        // 2. Nếu đã có cachedServerState và hết TTL 5s, chỉ truy vấn siêu nhẹ updated_at (8 bytes)
        if (cachedServerState && cachedDbUpdatedAtMs > 0) {
          const tCheck0 = performance.now();
          totalDbQueriesCounter += 1;
          dbQueries += 1;
          const metaRows: any[] = await prisma.$queryRawUnsafe(
            `SELECT updated_at FROM mm_cloud_state WHERE id = 'main' LIMIT 1`
          );
          const checkMs = Number((performance.now() - tCheck0).toFixed(2));
          const remoteUpdatedMs = metaRows?.[0]?.updated_at
            ? new Date(metaRows[0].updated_at).getTime()
            : -1;

          if (remoteUpdatedMs > 0 && remoteUpdatedMs === cachedDbUpdatedAtMs) {
            cachedDbLastCheckedAtMs = Date.now();
            const totalMs = Number((performance.now() - tStart).toFixed(2));
            lastPerfReadMetric = {
              branch: 'db-revalidated',
              dbQueries,
              fetchMs: checkMs,
              payloadKB: 0.03,
              normalizeMs: 0,
              totalMs,
            };
            if (perfLogEnabled) {
              console.log(
                `[PERF_LOG] readServerStateAsync branch=db-revalidated dbQueries=${dbQueries} fetchMs=${checkMs}ms totalMs=${totalMs}ms`
              );
            }
            return cachedServerState;
          }
        }

        // 3. Chỉ tải payload khi nạp lần đầu (cold) hoặc khi updated_at thực sự thay đổi
        const tFetch0 = performance.now();
        totalDbQueriesCounter += 1;
        dbQueries += 1;
        const rows: any[] = await prisma.$queryRawUnsafe(
          `SELECT payload, updated_at FROM mm_cloud_state WHERE id = 'main' LIMIT 1`
        );
        const fetchMs = performance.now() - tFetch0;
        if (rows && rows.length > 0 && rows[0].payload) {
          const rawPayload = rows[0].payload;
          const payloadStr =
            typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload);
          const payloadKB = Number((Buffer.byteLength(payloadStr) / 1024).toFixed(2));
          const cloudState =
            typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;
          const tNorm0 = performance.now();
          const normalized = normalizeStateObject(cloudState);
          const normalizeMs = Number((performance.now() - tNorm0).toFixed(2));
          cachedServerState = normalized;
          cachedDbUpdatedAtMs = rows[0].updated_at
            ? new Date(rows[0].updated_at).getTime()
            : Date.now();
          cachedDbLastCheckedAtMs = Date.now();
          invalidateQuestionPoolCache();
          invalidateExamPoolCache();
          invalidateDashboardCache();
          const totalMs = Number((performance.now() - tStart).toFixed(2));
          lastPerfReadMetric = {
            branch: 'db',
            dbQueries,
            fetchMs: Number(fetchMs.toFixed(2)),
            payloadKB,
            normalizeMs,
            totalMs,
          };
          if (perfLogEnabled) {
            console.log(
              `[PERF_LOG] readServerStateAsync branch=db dbQueries=${dbQueries} fetchMs=${fetchMs.toFixed(
                2
              )}ms payloadKB=${payloadKB}KB normalizeMs=${normalizeMs}ms totalMs=${totalMs}ms`
            );
          }
          return normalized;
        }
        const initial = readServerState() || loadDefaultSeedState();
        if (initial) {
          await writeServerStateAsync(initial);
          return initial;
        }
      }
    } catch {
      // Fallback sang bản lưu cục bộ khi không kết nối được mạng/PostgreSQL ở môi trường dev
    }
  }

  try {
    const stateFile = getWritableStateFilePath();
    const stat = await fs.promises.stat(stateFile).catch(() => null);
    if (stat) {
      if (cachedServerState && stat.mtimeMs === cachedStateFileMtimeMs) {
        const totalMs = Number((performance.now() - tStart).toFixed(2));
        lastPerfReadMetric = {
          branch: 'file-cache',
          dbQueries: 0,
          fetchMs: 0,
          payloadKB: 0,
          normalizeMs: 0,
          totalMs,
        };
        if (perfLogEnabled) {
          console.log(
            `[PERF_LOG] readServerStateAsync branch=file-cache dbQueries=0 totalMs=${totalMs}ms`
          );
        }
        return cachedServerState;
      }
      const tFetch0 = performance.now();
      const rawText = await fs.promises.readFile(stateFile, 'utf-8');
      const fetchMs = Number((performance.now() - tFetch0).toFixed(2));
      const payloadKB = Number((Buffer.byteLength(rawText) / 1024).toFixed(2));
      const raw = JSON.parse(rawText);
      const hadCurrentUserId = 'currentUserId' in raw;
      const hadPlainSeed = (raw.users || []).some(
        (u: any) => u.passwordHash === 'pass123' || u.passwordHash === 'hashed'
      );
      const tNorm0 = performance.now();
      const normalized = normalizeStateObject(raw);
      const normalizeMs = Number((performance.now() - tNorm0).toFixed(2));
      cachedServerState = normalized;
      cachedStateFileMtimeMs = stat.mtimeMs;
      invalidateQuestionPoolCache();
      invalidateExamPoolCache();
      invalidateDashboardCache();
      if (hadCurrentUserId || hadPlainSeed) {
        await writeServerStateAsync(normalized);
      }
      const totalMs = Number((performance.now() - tStart).toFixed(2));
      lastPerfReadMetric = {
        branch: 'file',
        dbQueries: 0,
        fetchMs,
        payloadKB,
        normalizeMs,
        totalMs,
      };
      if (perfLogEnabled) {
        console.log(
          `[PERF_LOG] readServerStateAsync branch=file fetchMs=${fetchMs}ms payloadKB=${payloadKB}KB normalizeMs=${normalizeMs}ms totalMs=${totalMs}ms`
        );
      }
      return normalized;
    }
    const initial = loadDefaultSeedState();
    if (initial) {
      await writeServerStateAsync(initial);
      return initial;
    }
  } catch (err) {
    console.error('Lỗi đọc trạng thái server bất đồng bộ:', err);
  }
  return readServerState();
}

/**
 * Đọc trạng thái ứng dụng có gộp request đồng thời (Single-Flight Deduplication):
 * Nếu nhiều request đến cùng lúc khi cache đang nạp, chỉ 1 truy vấn thực sự chạy,
 * các request còn lại dùng chung kết quả.
 */
export async function readServerStateAsync(): Promise<any> {
  if (inFlightReadStatePromise) {
    const t0 = performance.now();
    const res = await inFlightReadStatePromise;
    if (process.env.PERF_LOG === '1') {
      const waitMs = Number((performance.now() - t0).toFixed(2));
      console.log(`[PERF_LOG] readServerStateAsync branch=single-flight waitMs=${waitMs}ms`);
    }
    return res;
  }

  inFlightReadStatePromise = readServerStateInternalAsync().finally(() => {
    inFlightReadStatePromise = null;
  });

  return inFlightReadStatePromise;
}

export async function writeServerStateAsync(stateObj: any): Promise<boolean> {
  if (stateObj && typeof stateObj === 'object' && 'currentUserId' in stateObj) {
    delete stateObj.currentUserId;
  }
  markStateNormalized(stateObj);
  cachedServerState = stateObj;
  cachedDbLastCheckedAtMs = Date.now();
  pendingWriteState = stateObj;
  const localOk = await flushPendingDiskWrite();

  if (isDatabaseUrlConfigured()) {
    try {
      const prisma = await getPrismaClient();
      if (prisma) {
        await ensureCloudStateTable(prisma);
        const tW0 = performance.now();
        const jsonStr = JSON.stringify(stateObj);
        totalDbQueriesCounter += 1;
        const rows: any[] = await prisma.$queryRawUnsafe(
          `INSERT INTO mm_cloud_state (id, payload, updated_at)
           VALUES ('main', $1::jsonb, NOW())
           ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
           RETURNING updated_at`,
          jsonStr
        );
        if (rows?.[0]?.updated_at) {
          cachedDbUpdatedAtMs = new Date(rows[0].updated_at).getTime();
        } else {
          cachedDbUpdatedAtMs = Date.now();
        }
        cachedDbLastCheckedAtMs = Date.now();
        if (process.env.PERF_LOG === '1') {
          console.log(
            `[PERF_LOG] writeServerStateAsync mode=legacy dbStatements=1 bytesWritten=${Buffer.byteLength(
              jsonStr
            )} writeMs=${(performance.now() - tW0).toFixed(2)}ms`
          );
        }
        return true;
      }
    } catch {
      // Fallback khi mất kết nối DB
    }
  }
  return localOk;
}

// ==============================================================================
// QUẢN LÝ PHIÊN ĐĂNG NHẬP THEO TỪNG THIẾT BỊ (DEVICE SESSIONS)
// ==============================================================================

export interface DeviceSessionRecord {
  id: string;
  userId: string;
  deviceName: string;
  userAgent: string;
  ipAddress: string;
  rememberMe: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

export function getMaxSessionsPerUser(override?: number): number {
  if (typeof override === 'number' && override >= 1) return override;
  const envVal = Number(process.env.MAX_SESSIONS_PER_USER || 5);
  return Number.isFinite(envVal) && envVal >= 1 ? Math.floor(envVal) : 5;
}

/**
 * Tạo phiên đăng nhập mới cho thiết bị và tự động thu hồi phiên cũ nhất nếu vượt MAX_SESSIONS_PER_USER.
 */
export function createDeviceSessionInState(
  state: any,
  params: {
    userId: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    rememberMe?: boolean;
    deviceName?: string;
    maxSessionsOverride?: number;
  }
): { session: DeviceSessionRecord; revokedSessionIds: string[] } {
  if (!Array.isArray(state.sessions)) state.sessions = [];
  const now = new Date();
  const ttlMs = (params.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(now.getTime() + ttlMs).toISOString();

  const newSession: DeviceSessionRecord = {
    id: `ses_${crypto.randomUUID()}`,
    userId: params.userId,
    deviceName: params.deviceName || parseDeviceNameFromUserAgent(params.userAgent),
    userAgent: String(params.userAgent || 'Unknown'),
    ipAddress: String(params.ipAddress || '127.0.0.1'),
    rememberMe: Boolean(params.rememberMe),
    createdAt: now.toISOString(),
    lastActiveAt: now.toISOString(),
    expiresAt,
    revokedAt: null,
  };

  state.sessions.push(newSession);

  // Kiểm tra giới hạn MAX_SESSIONS_PER_USER
  const maxSessions = getMaxSessionsPerUser(params.maxSessionsOverride);
  const activeUserSessions = state.sessions
    .filter(
      (s: DeviceSessionRecord) =>
        s.userId === params.userId &&
        !s.revokedAt &&
        new Date(s.expiresAt).getTime() > now.getTime()
    )
    .sort(
      (a: DeviceSessionRecord, b: DeviceSessionRecord) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  const revokedSessionIds: string[] = [];
  while (activeUserSessions.length > maxSessions) {
    const oldest = activeUserSessions.shift();
    if (oldest && oldest.id !== newSession.id) {
      oldest.revokedAt = now.toISOString();
      revokedSessionIds.push(oldest.id);
    }
  }

  return { session: newSession, revokedSessionIds };
}

export function verifyActiveSessionInState(
  state: any,
  sessionId: string,
  userId: string
): DeviceSessionRecord | null {
  if (!state || !Array.isArray(state.sessions) || !sessionId) return null;
  const ses = state.sessions.find(
    (s: DeviceSessionRecord) => s.id === sessionId && s.userId === userId
  );
  if (!ses) return null;
  if (ses.revokedAt) return null;
  const nowMs = Date.now();
  if (new Date(ses.expiresAt).getTime() <= nowMs) return null;
  // Chỉ cập nhật lastActiveAt tối đa 1 lần mỗi 5 phút để không làm bẩn state trên mỗi request đọc
  const lastActiveMs = ses.lastActiveAt ? new Date(ses.lastActiveAt).getTime() : 0;
  if (nowMs - lastActiveMs >= 5 * 60 * 1000) {
    ses.lastActiveAt = new Date(nowMs).toISOString();
  }
  return ses;
}

export function revokeSessionInState(
  state: any,
  userId: string,
  sessionId: string
): boolean {
  if (!state || !Array.isArray(state.sessions)) return false;
  const ses = state.sessions.find(
    (s: DeviceSessionRecord) => s.id === sessionId && s.userId === userId
  );
  if (!ses || ses.revokedAt) return false;
  ses.revokedAt = new Date().toISOString();
  return true;
}

export function revokeAllOtherSessionsInState(
  state: any,
  userId: string,
  keepSessionId?: string | null
): number {
  if (!state || !Array.isArray(state.sessions)) return 0;
  let count = 0;
  const nowStr = new Date().toISOString();
  for (const ses of state.sessions) {
    if (ses.userId === userId && !ses.revokedAt && ses.id !== keepSessionId) {
      ses.revokedAt = nowStr;
      count += 1;
    }
  }
  return count;
}

// ==============================================================================
// HELPER XÁC THỰC & PHÂN QUYỀN CHO CÁC ROUTE API (requireUser / requireRole)
// ==============================================================================

export function extractSessionTokenFromRequest(req: NextRequest | Request): string | null {
  // 1. Ưu tiên đọc từ Cookie mm_session
  const anyReq = req as any;
  if (anyReq.cookies && typeof anyReq.cookies.get === 'function') {
    const cookieVal = anyReq.cookies.get('mm_session')?.value;
    if (cookieVal) return cookieVal;
  }

  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    for (const part of cookieHeader.split(';')) {
      const [k, ...vParts] = part.trim().split('=');
      if (k === 'mm_session') {
        return decodeURIComponent(vParts.join('='));
      }
    }
  }

  // 2. Hỗ trợ Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  return null;
}

export function getClientIp(req: NextRequest | Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export async function requireUser(
  req: NextRequest | Request,
  existingState?: any
): Promise<
  | {
      ok: true;
      user: any;
      session: DeviceSessionRecord;
      tokenPayload: any;
      state: any;
    }
  | {
      ok: false;
      status: number;
      error: string;
    }
> {
  const token = extractSessionTokenFromRequest(req);
  if (!token) {
    return {
      ok: false,
      status: 401,
      error: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
    };
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return {
      ok: false,
      status: 401,
      error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
    };
  }

  const state = existingState || (await readServerStateAsync());
  const activeSession = verifyActiveSessionInState(state, payload.sid, payload.userId);
  if (!activeSession) {
    return {
      ok: false,
      status: 401,
      error: 'Phiên đăng nhập trên thiết bị này đã bị thu hồi hoặc hết hạn.',
    };
  }

  const user = (state.users || []).find((u: any) => u.id === payload.userId);
  if (!user) {
    return {
      ok: false,
      status: 401,
      error: 'Tài khoản không còn tồn tại.',
    };
  }

  return {
    ok: true,
    user,
    session: activeSession,
    tokenPayload: payload,
    state,
  };
}

export async function requireRole(
  req: NextRequest | Request,
  allowedRoles: string[],
  existingState?: any
) {
  const auth = await requireUser(req, existingState);
  if (!auth.ok) return auth;

  if (!allowedRoles.includes(auth.user.role)) {
    return {
      ok: false as const,
      status: 403,
      error: 'Bạn không có quyền truy cập chức năng này.',
    };
  }

  return auth;
}

/**
 * Cô lập dữ liệu trả về cho đúng người dùng đang đăng nhập (Mục 2.9 & 2.11):
 * - Không bao giờ trả danh sách người dùng khác.
 * - Không bao giờ trả passwordHash.
 * - Chỉ trả attempts, documents, reviewQueue, learningGoals, studySessions của chính người dùng này.
 */
export function buildScopedStateForUser(state: any, user: any, scope?: string | null) {
  const safeUser = sanitizeUserForClient(user);
  const userId = user.id;
  const isAdminOrTeacher = user.role === 'ADMIN' || user.role === 'TEACHER';

  if (scope === 'shell') {
    return {
      user: safeUser,
      users: [safeUser],
    };
  }

  if (scope === 'curriculum') {
    return {
      user: safeUser,
      users: [safeUser],
      curriculum: state.curriculum,
    };
  }

  if (scope === 'exam-builder') {
    const verifiedLight = (state.questions || [])
      .filter((q: any) => !q.verificationStatus || q.verificationStatus === 'verified')
      .map((q: any) => ({
        id: q.id,
        grade: q.grade,
        textbooks: q.textbooks,
        semester: q.semester,
        chapterId: q.chapterId,
        type: q.type,
        cognitiveLevel: q.cognitiveLevel,
        difficulty: q.difficulty,
        verificationStatus: q.verificationStatus || 'verified',
      }));
    return {
      user: safeUser,
      users: [safeUser],
      curriculum: state.curriculum,
      questions: verifiedLight,
    };
  }

  if (scope === 'formulas') {
    const qMap = getQuestionByIdMap(state);
    const favQuestions = (safeUser.favoriteQuestionIds || [])
      .map((qid: string) => qMap.get(qid))
      .filter(Boolean);
    return {
      user: safeUser,
      users: [safeUser],
      formulas: state.formulas || [],
      questions: favQuestions,
    };
  }

  // Đề thi hiển thị cho học sinh: đề của chính học sinh, đề mẫu (isSeed), hoặc đề được giao trong lớp học
  const joinedClassIds = new Set(
    (state.classroomMembers || [])
      .filter((m: any) => m.studentId === userId)
      .map((m: any) => m.classroomId)
  );
  const assignedExamIds = new Set(
    (state.classroomAssignments || [])
      .filter((a: any) => joinedClassIds.has(a.classroomId))
      .map((a: any) => a.examId)
  );

  const visibleExams = (state.exams || []).filter(
    (e: any) =>
      isAdminOrTeacher ||
      e.userId === userId ||
      Boolean(e.isSeed) ||
      assignedExamIds.has(e.id)
  );

  if (scope === 'history') {
    return {
      user: safeUser,
      users: [safeUser],
      exams: visibleExams,
      attempts: (state.attempts || []).filter((a: any) => a.userId === userId),
    };
  }

  const visibleQuestions = isAdminOrTeacher
    ? state.questions || []
    : (state.questions || []).filter(
        (q: any) => !q.verificationStatus || q.verificationStatus === 'verified'
      );

  return {
    curriculum: state.curriculum,
    user: safeUser,
    // Chỉ trả đúng 1 phần tử là tài khoản đang đăng nhập để tương thích UI cũ mà không lộ tài khoản khác
    users: [safeUser],
    questions: visibleQuestions,
    exams: visibleExams,
    attempts: (state.attempts || []).filter((a: any) => a.userId === userId),
    documents: (state.documents || []).filter((d: any) => d.userId === userId),
    reviewQueue: (state.reviewQueue || []).filter((r: any) => r.userId === userId),
    formulas: state.formulas || [],
    achievements: state.achievements || [],
    userAchievements: (state.userAchievements || []).filter((ua: any) => ua.userId === userId),
    learningGoals: (state.learningGoals || []).filter((g: any) => g.userId === userId),
    studySessions: (state.studySessions || []).filter((s: any) => s.userId === userId),
    topicMastery: (state.topicMastery || []).filter((tm: any) => tm.userId === userId),
  };
}
