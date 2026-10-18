import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let prismaInstance: any = null;
let cloudTableInitialized = false;

export async function getPrismaClient() {
  if (prismaInstance) return prismaInstance;
  try {
    const mod = await import('@prisma/client');
    const PrismaClient = mod.PrismaClient;
    prismaInstance = new PrismaClient();
    return prismaInstance;
  } catch (err) {
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

function getWritableStateFilePath(): string {
  const localDir = path.join(process.cwd(), '.data');
  try {
    fs.mkdirSync(localDir, { recursive: true });
    fs.accessSync(localDir, fs.constants.W_OK);
    return path.join(localDir, 'local_db_state.json');
  } catch {
    // Fallback cho môi trường Serverless (Vercel) có hệ thống file /var/task chỉ đọc (read-only)
    const tmpDir = path.join(os.tmpdir(), 'mathmaster-thcs-data');
    try {
      fs.mkdirSync(tmpDir, { recursive: true });
    } catch {}
    return path.join(tmpDir, 'local_db_state.json');
  }
}

const SEED_FILE = path.join(process.cwd(), 'prisma', 'seed_data.json');

function loadDefaultSeedState(): any {
  try {
    if (fs.existsSync(SEED_FILE)) {
      const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
      return {
        currentUserId: seed.users?.[0]?.id || 'user_minhanh_01',
        users: seed.users || [],
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
      };
    }
  } catch (err) {
    console.error('Error reading seed_data.json:', err);
  }
  return null;
}

export function readServerState(): any {
  try {
    const stateFile = getWritableStateFilePath();
    if (fs.existsSync(stateFile)) {
      return JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    }
    const initial = loadDefaultSeedState();
    if (initial) {
      writeServerState(initial);
      return initial;
    }
  } catch (err) {
    console.error('Error reading server state:', err);
  }
  return null;
}

export function writeServerState(stateObj: any): boolean {
  try {
    const stateFile = getWritableStateFilePath();
    fs.writeFileSync(stateFile, JSON.stringify(stateObj, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing server state:', err);
    return false;
  }
}

async function ensureCloudStateTable(prisma: any) {
  if (cloudTableInitialized || !prisma) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS mm_cloud_state (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  cloudTableInitialized = true;
}

export async function readServerStateAsync(): Promise<any> {
  if (isDatabaseUrlConfigured()) {
    try {
      const prisma = await getPrismaClient();
      if (prisma) {
        await ensureCloudStateTable(prisma);
        const rows: any[] = await prisma.$queryRawUnsafe(
          `SELECT payload FROM mm_cloud_state WHERE id = 'main' LIMIT 1`
        );
        if (rows && rows.length > 0 && rows[0].payload) {
          const cloudState =
            typeof rows[0].payload === 'string'
              ? JSON.parse(rows[0].payload)
              : rows[0].payload;
          writeServerState(cloudState);
          return cloudState;
        }
        const initial = readServerState() || loadDefaultSeedState();
        if (initial) {
          await writeServerStateAsync(initial);
          return initial;
        }
      }
    } catch (err) {
      console.error('PostgreSQL cloud state read fallback:', err);
    }
  }
  return readServerState();
}

export async function writeServerStateAsync(stateObj: any): Promise<boolean> {
  const localOk = writeServerState(stateObj);
  if (isDatabaseUrlConfigured()) {
    try {
      const prisma = await getPrismaClient();
      if (prisma) {
        await ensureCloudStateTable(prisma);
        const jsonStr = JSON.stringify(stateObj);
        await prisma.$executeRawUnsafe(
          `INSERT INTO mm_cloud_state (id, payload, updated_at)
           VALUES ('main', $1::jsonb, NOW())
           ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
          jsonStr
        );
        return true;
      }
    } catch (err) {
      console.error('PostgreSQL cloud state write fallback:', err);
    }
  }
  return localOk;
}
