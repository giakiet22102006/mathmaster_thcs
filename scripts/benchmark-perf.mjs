// ==============================================================================
// MathMaster THCS - Công Cụ Đo Kiểm Hiệu Năng Toàn Diện (Baseline & After Opt)
// Đo lường:
// 1. Thông tin môi trường (Node, Next.js, OS, CPU, RAM, DB)
// 2. Phân tích Bundle Production (.next) & Top 10 gói/chunk nặng nhất
// 3. Đo Backend API (p50, p95, trung bình, kích thước JSON, số lần I/O & DB query)
// 4. Đo HTTP Production Server (TTFB, kích thước trang cho 5 trang chính)
// 5. Thử tải 50 người dùng đồng thời (50 concurrent users) + CPU & RAM
// ==============================================================================

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { spawn } from 'node:child_process';
import { NextRequest } from 'next/server';

import { clearAllRateLimitsForTesting } from '../src/lib/auth';
import { POST as authPOST } from '../src/app/api/auth/route';
import { GET as stateGET } from '../src/app/api/state/route';
import { GET as analyticsGET } from '../src/app/api/analytics/route';
import { GET as examsGET, POST as examsPOST } from '../src/app/api/exams/route';
import { GET as attemptsGET, POST as attemptsPOST } from '../src/app/api/attempts/route';

const ROOT_DIR = process.cwd();
const STATE_FILE = path.join(ROOT_DIR, '.data', 'local_db_state.json');

function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const idx = Math.min(sortedArr.length - 1, Math.max(0, Math.ceil((p / 100) * sortedArr.length) - 1));
  return Number(sortedArr[idx].toFixed(2));
}

function summarizeTimings(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  return {
    count: sorted.length,
    minMs: Number((sorted[0] || 0).toFixed(2)),
    p50Ms: percentile(sorted, 50),
    p95Ms: percentile(sorted, 95),
    maxMs: Number((sorted[sorted.length - 1] || 0).toFixed(2)),
    avgMs: Number((sum / (sorted.length || 1)).toFixed(2)),
  };
}

// ==============================================================================
// 1. PHÂN TÍCH KÍCH THƯỚC BUNDLE PRODUCTION (.next) & TOP 10 GÓI/CHUNK NẶNG NHẤT
// ==============================================================================
function analyzeProductionBundles() {
  const nextDir = path.join(ROOT_DIR, '.next');
  const chunksDir = path.join(nextDir, 'static', 'chunks');
  const chunkFiles = [];

  function walkDir(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const relName = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walkDir(fullPath, relName);
      } else if (entry.name.endsWith('.js') || entry.name.endsWith('.css')) {
        const stat = fs.statSync(fullPath);
        chunkFiles.push({
          file: relName,
          sizeBytes: stat.size,
          sizeKB: Number((stat.size / 1024).toFixed(2)),
        });
      }
    }
  }

  walkDir(chunksDir, 'chunks');
  walkDir(path.join(nextDir, 'static', 'css'), 'css');

  chunkFiles.sort((a, b) => b.sizeBytes - a.sizeBytes);

  // Phân tích app-build-manifest.json để tính tổng JS tải theo từng route
  const appManifestPath = path.join(nextDir, 'app-build-manifest.json');
  const routeBundles = {};
  if (fs.existsSync(appManifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(appManifestPath, 'utf-8'));
    const pages = manifest.pages || {};
    for (const [routeKey, files] of Object.entries(pages)) {
      let totalBytes = 0;
      const jsFiles = [];
      for (const relFile of files) {
        const fp = path.join(nextDir, relFile);
        if (fs.existsSync(fp) && relFile.endsWith('.js')) {
          const sz = fs.statSync(fp).size;
          totalBytes += sz;
          jsFiles.push({ file: relFile, sizeKB: Number((sz / 1024).toFixed(2)) });
        }
      }
      routeBundles[routeKey] = {
        totalJsKB: Number((totalBytes / 1024).toFixed(2)),
        chunkCount: jsFiles.length,
      };
    }
  }

  return {
    top10Chunks: chunkFiles.slice(0, 10),
    routeBundles,
  };
}

// ==============================================================================
// 2. INSTRUMENTATION ĐẾM SỐ LẦN ĐỌC/GHI FILE ĐỒNG BỘ & BẤT ĐỒNG BỘ
// ==============================================================================
const ioCounters = {
  syncReads: 0,
  syncWrites: 0,
  asyncReads: 0,
  asyncWrites: 0,
  bytesRead: 0,
  bytesWritten: 0,
};

function resetIoCounters() {
  ioCounters.syncReads = 0;
  ioCounters.syncWrites = 0;
  ioCounters.asyncReads = 0;
  ioCounters.asyncWrites = 0;
  ioCounters.bytesRead = 0;
  ioCounters.bytesWritten = 0;
}

const origReadFileSync = fs.readFileSync.bind(fs);
const origWriteFileSync = fs.writeFileSync.bind(fs);
const origPromisesReadFile = fs.promises.readFile.bind(fs.promises);
const origPromisesWriteFile = fs.promises.writeFile.bind(fs.promises);

fs.readFileSync = function (...args) {
  ioCounters.syncReads += 1;
  const res = origReadFileSync(...args);
  ioCounters.bytesRead += typeof res === 'string' ? Buffer.byteLength(res) : res.byteLength || 0;
  return res;
};

fs.writeFileSync = function (file, data, ...rest) {
  ioCounters.syncWrites += 1;
  ioCounters.bytesWritten +=
    typeof data === 'string' ? Buffer.byteLength(data) : data?.byteLength || 0;
  return origWriteFileSync(file, data, ...rest);
};

fs.promises.readFile = async function (...args) {
  ioCounters.asyncReads += 1;
  const res = await origPromisesReadFile(...args);
  ioCounters.bytesRead += typeof res === 'string' ? Buffer.byteLength(res) : res.byteLength || 0;
  return res;
};

fs.promises.writeFile = async function (file, data, ...rest) {
  ioCounters.asyncWrites += 1;
  ioCounters.bytesWritten +=
    typeof data === 'string' ? Buffer.byteLength(data) : data?.byteLength || 0;
  return origPromisesWriteFile(file, data, ...rest);
};

function makeRequest(urlPath, { method = 'GET', body = null, token = null, ip = '127.0.0.1' } = {}) {
  const headers = new Headers({
    'content-type': 'application/json',
    'user-agent': 'MathMaster-PerfBenchmark/1.0',
    'x-forwarded-for': ip,
  });
  if (token) {
    headers.set('cookie', `mm_session=${encodeURIComponent(token)}`);
    headers.set('authorization', `Bearer ${token}`);
  }
  const init = { method, headers };
  if (body !== null && method !== 'GET') {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(`http://localhost:3000${urlPath}`, init);
}

// ==============================================================================
// 3. ĐO 6 LUỒNG BACKEND CHÍNH & THỬ TẢI 50 NGƯỜI DÙNG ĐỒNG THỜI
// ==============================================================================
async function runBackendBenchmarks() {
  const backupRaw = fs.existsSync(STATE_FILE) ? origReadFileSync(STATE_FILE, 'utf-8') : null;

  try {
    clearAllRateLimitsForTesting();

    // Khởi tạo phiên mẫu cho học sinh Minh Anh
    const loginSetupRes = await authPOST(
      makeRequest('/api/auth', {
        method: 'POST',
        body: {
          action: 'login',
          identifier: 'minhanh.thcs@mathmaster.edu.vn',
          password: 'pass123',
        },
      })
    );
    let studentToken = loginSetupRes.cookies.get('mm_session')?.value;

    const results = {};

    // --- LUỒNG 1: ĐĂNG NHẬP (POST /api/auth) ---
    {
      const samples = [];
      let payloadBytes = 0;
      resetIoCounters();
      for (let i = 0; i < 15; i++) {
        clearAllRateLimitsForTesting();
        const t0 = performance.now();
        const res = await authPOST(
          makeRequest('/api/auth', {
            method: 'POST',
            ip: `10.0.1.${i + 1}`,
            body: {
              action: 'login',
              identifier: 'minhanh.thcs@mathmaster.edu.vn',
              password: 'pass123',
            },
          })
        );
        const text = await res.text();
        const elapsed = performance.now() - t0;
        samples.push(elapsed);
        payloadBytes = Buffer.byteLength(text);
        if (i === 14) {
          const tok = res.cookies.get('mm_session')?.value;
          if (tok) studentToken = tok;
        }
      }
      results.login = {
        ...summarizeTimings(samples),
        payloadKB: Number((payloadBytes / 1024).toFixed(2)),
        syncReadsPerReq: Number((ioCounters.syncReads / 15).toFixed(1)),
        syncWritesPerReq: Number((ioCounters.syncWrites / 15).toFixed(1)),
        asyncWritesPerReq: Number((ioCounters.asyncWrites / 15).toFixed(1)),
      };
    }

    // --- LUỒNG 2A: TẢI STATE TOÀN BỘ (GET /api/state) ---
    {
      const samples = [];
      let payloadBytes = 0;
      resetIoCounters();
      for (let i = 0; i < 20; i++) {
        const t0 = performance.now();
        const res = await stateGET(makeRequest('/api/state', { token: studentToken }));
        const text = await res.text();
        samples.push(performance.now() - t0);
        payloadBytes = Buffer.byteLength(text);
      }
      results.loadStateFull = {
        ...summarizeTimings(samples),
        payloadKB: Number((payloadBytes / 1024).toFixed(2)),
        syncReadsPerReq: Number((ioCounters.syncReads / 20).toFixed(1)),
        syncWritesPerReq: Number((ioCounters.syncWrites / 20).toFixed(1)),
      };
    }

    // --- LUỒNG 2A-SCOPED: TẢI STATE THEO PHẠM VI (scope=shell, scope=exam-builder, scope=history) ---
    {
      const shellSamples = [];
      let shellBytes = 0;
      for (let i = 0; i < 20; i++) {
        const t0 = performance.now();
        const res = await stateGET(makeRequest('/api/state?scope=shell', { token: studentToken }));
        const text = await res.text();
        shellSamples.push(performance.now() - t0);
        shellBytes = Buffer.byteLength(text);
      }
      results.loadStateShell = {
        ...summarizeTimings(shellSamples),
        payloadKB: Number((shellBytes / 1024).toFixed(2)),
      };

      const builderSamples = [];
      let builderBytes = 0;
      for (let i = 0; i < 20; i++) {
        const t0 = performance.now();
        const res = await stateGET(
          makeRequest('/api/state?scope=exam-builder', { token: studentToken })
        );
        const text = await res.text();
        builderSamples.push(performance.now() - t0);
        builderBytes = Buffer.byteLength(text);
      }
      results.loadStateExamBuilder = {
        ...summarizeTimings(builderSamples),
        payloadKB: Number((builderBytes / 1024).toFixed(2)),
      };

      const takingRes = await examsGET(
        makeRequest('/api/exams?id=EXAM_SEED_G8_GK1&mode=taking', { token: studentToken })
      );
      const takingText = await takingRes.text();
      const fullExamRes = await examsGET(
        makeRequest('/api/exams?id=EXAM_SEED_G8_GK1', { token: studentToken })
      );
      const fullExamText = await fullExamRes.text();
      results.examTakingPayload = {
        fullExamKB: Number((Buffer.byteLength(fullExamText) / 1024).toFixed(2)),
        takingModeKB: Number((Buffer.byteLength(takingText) / 1024).toFixed(2)),
      };
    }

    // --- LUỒNG 2B: TẢI DASHBOARD ANALYTICS (GET /api/analytics) ---
    {
      const samples = [];
      let payloadBytes = 0;
      resetIoCounters();
      for (let i = 0; i < 20; i++) {
        const t0 = performance.now();
        const res = await analyticsGET(
          makeRequest('/api/analytics?grade=8', { token: studentToken })
        );
        const text = await res.text();
        samples.push(performance.now() - t0);
        payloadBytes = Buffer.byteLength(text);
      }
      results.loadDashboardAnalytics = {
        ...summarizeTimings(samples),
        payloadKB: Number((payloadBytes / 1024).toFixed(2)),
        syncReadsPerReq: Number((ioCounters.syncReads / 20).toFixed(1)),
        syncWritesPerReq: Number((ioCounters.syncWrites / 20).toFixed(1)),
      };
    }

    // --- LUỒNG 3: TẠO ĐỀ THEO MA TRẬN TRÊN KHO 333 CÂU (POST /api/exams) ---
    let createdExamId = 'EXAM_SEED_G8_GK1';
    {
      const teacherLoginRes = await authPOST(
        makeRequest('/api/auth', {
          method: 'POST',
          ip: '10.0.99.1',
          body: {
            action: 'login',
            identifier: 'giaovien.thcs@mathmaster.edu.vn',
            password: 'Teacher123',
          },
        })
      );
      const teacherToken = teacherLoginRes.cookies.get('mm_session')?.value || studentToken;

      const samples = [];
      let payloadBytes = 0;
      resetIoCounters();
      for (let i = 0; i < 15; i++) {
        const t0 = performance.now();
        const res = await examsPOST(
          makeRequest('/api/exams', {
            method: 'POST',
            token: teacherToken,
            body: {
              title: `Đề Kiểm Tra Benchmark #${i + 1}`,
              grade: 8,
              textbook: 'KNTT',
              semester: 1,
              matrixPreset: 'standard',
              totalQuestions: 12,
              durationMinutes: 45,
              includeDraft: true,
              seed: 1000 + i,
            },
          })
        );
        const text = await res.text();
        samples.push(performance.now() - t0);
        payloadBytes = Buffer.byteLength(text);
        if (i === 0) {
          const parsed = JSON.parse(text);
          if (parsed?.exam?.id) createdExamId = parsed.exam.id;
        }
      }
      results.generateExam = {
        ...summarizeTimings(samples),
        payloadKB: Number((payloadBytes / 1024).toFixed(2)),
        syncReadsPerReq: Number((ioCounters.syncReads / 15).toFixed(1)),
        syncWritesPerReq: Number((ioCounters.syncWrites / 15).toFixed(1)),
      };
    }

    // Khởi tạo 1 lượt làm bài đang diễn ra để đo Autosave & Submit
    const startAttemptRes = await attemptsPOST(
      makeRequest('/api/attempts', {
        method: 'POST',
        token: studentToken,
        body: {
          action: 'start',
          examId: createdExamId,
        },
      })
    );
    const startAttemptData = await startAttemptRes.json();
    const activeAttemptId = startAttemptData?.attempt?.id || 'ATT_SEED_03_INPROG';

    // --- LUỒNG 4: TỰ LƯU BÀI THI ĐANG LÀM (POST /api/attempts - autosave) ---
    {
      const samples = [];
      let payloadBytes = 0;
      resetIoCounters();
      for (let i = 0; i < 20; i++) {
        const t0 = performance.now();
        const res = await attemptsPOST(
          makeRequest('/api/attempts', {
            method: 'POST',
            token: studentToken,
            body: {
              action: 'autosave',
              attemptId: activeAttemptId,
              examId: createdExamId,
              timeSpentSeconds: 120 + i * 5,
              remainingSeconds: 2500 - i * 5,
              answers: {
                Q8_001: { value: 'B', flagged: false },
                Q8_002: { value: i % 2 === 0 ? 'A' : 'B', flagged: false },
              },
              answersDiff: {
                Q8_002: { value: i % 2 === 0 ? 'A' : 'B', flagged: false },
              },
            },
          })
        );
        const text = await res.text();
        samples.push(performance.now() - t0);
        payloadBytes = Buffer.byteLength(text);
      }
      results.autosaveAttempt = {
        ...summarizeTimings(samples),
        payloadKB: Number((payloadBytes / 1024).toFixed(2)),
        syncReadsPerReq: Number((ioCounters.syncReads / 20).toFixed(1)),
        syncWritesPerReq: Number((ioCounters.syncWrites / 20).toFixed(1)),
      };
    }

    // --- LUỒNG 5: NỘP BÀI & CHẤM ĐIỂM (POST /api/attempts - submit) ---
    {
      const samples = [];
      let payloadBytes = 0;
      resetIoCounters();
      for (let i = 0; i < 15; i++) {
        const t0 = performance.now();
        const res = await attemptsPOST(
          makeRequest('/api/attempts', {
            method: 'POST',
            token: studentToken,
            body: {
              action: 'submit',
              attemptId: activeAttemptId,
              examId: 'EXAM_SEED_G8_GK1',
              timeSpentSeconds: 900,
              remainingSeconds: 1800,
              answers: {
                Q8_001: { value: 'B', flagged: false },
                Q8_002: { value: 'A', flagged: false },
                Q8_003: { value: '0,4', flagged: false },
                Q8_004: { value: 'B', flagged: false },
                Q8_007: { value: '(x-3)^2 + 6 = 5', flagged: true },
              },
            },
          })
        );
        const text = await res.text();
        samples.push(performance.now() - t0);
        payloadBytes = Buffer.byteLength(text);
      }
      results.submitAndGrade = {
        ...summarizeTimings(samples),
        payloadKB: Number((payloadBytes / 1024).toFixed(2)),
        syncReadsPerReq: Number((ioCounters.syncReads / 15).toFixed(1)),
        syncWritesPerReq: Number((ioCounters.syncWrites / 15).toFixed(1)),
      };
    }

    // --- LUỒNG 6: TẢI LỊCH SỬ & DANH SÁCH ĐỀ THI (GET /api/attempts + GET /api/exams) ---
    {
      const samples = [];
      let payloadBytes = 0;
      resetIoCounters();
      for (let i = 0; i < 20; i++) {
        const t0 = performance.now();
        const [resAtt, resEx] = await Promise.all([
          attemptsGET(makeRequest('/api/attempts?limit=20', { token: studentToken })),
          examsGET(makeRequest('/api/exams?limit=20', { token: studentToken })),
        ]);
        const t1 = await resAtt.text();
        const t2 = await resEx.text();
        samples.push(performance.now() - t0);
        payloadBytes = Buffer.byteLength(t1) + Buffer.byteLength(t2);
      }
      results.loadHistory = {
        ...summarizeTimings(samples),
        payloadKB: Number((payloadBytes / 1024).toFixed(2)),
        syncReadsPerReq: Number((ioCounters.syncReads / 20).toFixed(1)),
        syncWritesPerReq: Number((ioCounters.syncWrites / 20).toFixed(1)),
      };
    }

    // ============================================================================
    // 4. THỬ TẢI 50 NGƯỜI DÙNG ĐỒNG THỜI (50 CONCURRENT USERS)
    // ============================================================================
    clearAllRateLimitsForTesting();
    const memBefore = process.memoryUsage();
    const cpuBefore = process.cpuUsage();

    // 4A. 50 người dùng đăng nhập đồng thời
    const loginConcurrencySamples = [];
    let loginErrors = 0;
    const tLoginStart = performance.now();
    await Promise.all(
      Array.from({ length: 50 }, async (_, idx) => {
        const s0 = performance.now();
        try {
          const res = await authPOST(
            makeRequest('/api/auth', {
              method: 'POST',
              ip: `192.168.10.${idx + 1}`,
              body: {
                action: 'login',
                identifier: 'minhanh.thcs@mathmaster.edu.vn',
                password: 'pass123',
              },
            })
          );
          if (res.status !== 200) loginErrors += 1;
          await res.text();
          if (idx === 49) {
            const tok = res.cookies.get('mm_session')?.value;
            if (tok) studentToken = tok;
          }
        } catch {
          loginErrors += 1;
        }
        loginConcurrencySamples.push(performance.now() - s0);
      })
    );
    const total50LoginWallMs = Number((performance.now() - tLoginStart).toFixed(2));

    // 4B. 50 người dùng tải Dashboard + tạo đề + nộp bài đồng thời
    const mixedConcurrencySamples = [];
    let mixedErrors = 0;
    const tMixedStart = performance.now();
    await Promise.all(
      Array.from({ length: 50 }, async (_, idx) => {
        const s0 = performance.now();
        try {
          if (idx % 3 === 0) {
            const res = await analyticsGET(
              makeRequest('/api/analytics?grade=8', { token: studentToken })
            );
            if (res.status !== 200) mixedErrors += 1;
            await res.text();
          } else if (idx % 3 === 1) {
            const res = await examsPOST(
              makeRequest('/api/exams', {
                method: 'POST',
                token: studentToken,
                body: {
                  title: `Đề Tải Đồng Thời #${idx}`,
                  grade: 8,
                  textbook: 'KNTT',
                  matrixPreset: 'standard',
                  totalQuestions: 5,
                  seed: 5000 + idx,
                },
              })
            );
            if (!res.ok) mixedErrors += 1;
            await res.text();
          } else {
            const res = await attemptsPOST(
              makeRequest('/api/attempts', {
                method: 'POST',
                token: studentToken,
                body: {
                  action: 'autosave',
                  attemptId: activeAttemptId,
                  examId: 'EXAM_SEED_G8_GK1',
                  timeSpentSeconds: 300 + idx,
                  remainingSeconds: 2000 - idx,
                  answers: { Q8_001: { value: 'B', flagged: false } },
                  answersDiff: { Q8_001: { value: 'B', flagged: false } },
                },
              })
            );
            if (res.status !== 200) mixedErrors += 1;
            await res.text();
          }
        } catch {
          mixedErrors += 1;
        }
        mixedConcurrencySamples.push(performance.now() - s0);
      })
    );
    const total50MixedWallMs = Number((performance.now() - tMixedStart).toFixed(2));

    const cpuAfter = process.cpuUsage(cpuBefore);
    const memAfter = process.memoryUsage();

    results.loadTest50Concurrent = {
      login50: {
        ...summarizeTimings(loginConcurrencySamples),
        wallClockMs: total50LoginWallMs,
        errors: loginErrors,
      },
      mixed50: {
        ...summarizeTimings(mixedConcurrencySamples),
        wallClockMs: total50MixedWallMs,
        errors: mixedErrors,
      },
      resourceUsage: {
        cpuUserMs: Number((cpuAfter.user / 1000).toFixed(1)),
        cpuSystemMs: Number((cpuAfter.system / 1000).toFixed(1)),
        rssMB: Number((memAfter.rss / (1024 * 1024)).toFixed(1)),
        heapUsedMB: Number((memAfter.heapUsed / (1024 * 1024)).toFixed(1)),
      },
    };

    return results;
  } finally {
    if (backupRaw !== null) {
      origWriteFileSync(STATE_FILE, backupRaw, 'utf-8');
    }
  }
}

async function measureProductionHttpPages() {
  const port = 3099;
  const nextBin = path.join(ROOT_DIR, 'node_modules', 'next', 'dist', 'bin', 'next');
  const serverProc = spawn(process.execPath, [nextBin, 'start', '-p', String(port)], {
    cwd: ROOT_DIR,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Đợi server sẵn sàng
  let ready = false;
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }

  const pageMetrics = {};
  if (ready) {
    // Đăng nhập qua HTTP thật để lấy cookie
    const loginRes = await fetch(`http://127.0.0.1:${port}/api/auth`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        identifier: 'minhanh.thcs@mathmaster.edu.vn',
        password: 'pass123',
      }),
    });
    const setCookie = loginRes.headers.get('set-cookie') || '';
    const cookieHeader = setCookie.split(';')[0] || '';

    const pagesToTest = [
      '/login',
      '/dashboard',
      '/exams/new',
      '/exams/EXAM_SEED_G8_GK1',
      '/exams/EXAM_SEED_G8_GK1/result',
    ];

    for (const p of pagesToTest) {
      const ttfbSamples = [];
      let htmlBytes = 0;
      for (let i = 0; i < 8; i++) {
        const t0 = performance.now();
        const res = await fetch(`http://127.0.0.1:${port}${p}`, {
          headers: cookieHeader ? { cookie: cookieHeader } : {},
          redirect: 'manual',
        });
        const ttfb = performance.now() - t0;
        const bodyText = await res.text();
        if (i > 0) ttfbSamples.push(ttfb); // Bỏ lần đầu cold-hit nếu muốn đo ổn định, nhưng lưu cả cold
        htmlBytes = Buffer.byteLength(bodyText);
      }
      pageMetrics[p] = {
        ...summarizeTimings(ttfbSamples),
        htmlKB: Number((htmlBytes / 1024).toFixed(2)),
      };
    }
  }

  try {
    serverProc.kill();
  } catch {}
  return pageMetrics;
}

async function main() {
  const pkg = JSON.parse(origReadFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'));
  const envInfo = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    nextVersion: pkg.dependencies.next,
    platform: `${os.platform()} ${os.release()} (${os.arch()})`,
    cpuModel: os.cpus()[0]?.model || 'Unknown CPU',
    cpuCores: os.cpus().length,
    totalRamGB: Number((os.totalmem() / (1024 ** 3)).toFixed(1)),
    dbMode:
      process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('CHANGE_ME')
        ? 'PostgreSQL (Configured)'
        : 'Local JSON State (.data/local_db_state.json)',
  };

  const bundleReport = analyzeProductionBundles();
  const backendReport = await runBackendBenchmarks();
  const httpPagesReport = await measureProductionHttpPages();

  const fullReport = {
    environment: envInfo,
    bundles: bundleReport,
    httpPages: httpPagesReport,
    backend: backendReport,
  };

  console.log(JSON.stringify(fullReport, null, 2));
}

main().catch((err) => {
  console.error('Benchmark error:', err);
  process.exit(1);
});
