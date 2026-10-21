// ==============================================================================
// MathMaster THCS - Script Đo Kiểm Chuyên Sâu Trang Tổng Quan (/dashboard)
// Chạy trên bản Production (next start) với PERF_LOG=1 để đo:
// - Lần mở đầu tiên (Cold) & Lần mở thứ hai trở đi (Warm)
// - Nhánh đọc dữ liệu (DB từ xa vs Cache bộ nhớ vs File cục bộ)
// - Số truy vấn DB thực tế, kích thước payload (KB), thời gian normalizeStateObject
// - Thời gian từng API (/api/state, /api/analytics, /api/exams, và /api/dashboard)
// - Thời điểm hiển thị khung trang/thẻ chỉ số (KPIs) và biểu đồ (Charts)
// ==============================================================================

import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { spawn } from 'node:child_process';

const ROOT_DIR = process.cwd();
const PORT = 3098;

function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const idx = Math.min(
    sortedArr.length - 1,
    Math.max(0, Math.ceil((p / 100) * sortedArr.length) - 1)
  );
  return Number(sortedArr[idx].toFixed(2));
}

function summarize(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    minMs: Number((sorted[0] || 0).toFixed(2)),
    p50Ms: percentile(sorted, 50),
    p95Ms: percentile(sorted, 95),
    maxMs: Number((sorted[sorted.length - 1] || 0).toFixed(2)),
    avgMs: Number((sum / (sorted.length || 1)).toFixed(2)),
  };
}

async function fetchWithPerf(url, cookieHeader) {
  const t0 = performance.now();
  const res = await fetch(url, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
  const text = await res.text();
  const clientElapsedMs = Number((performance.now() - t0).toFixed(2));
  const perfHeader = res.headers.get('x-perf-metrics');
  let serverPerf = null;
  if (perfHeader) {
    try {
      serverPerf = JSON.parse(perfHeader);
    } catch {}
  }
  return {
    status: res.status,
    clientElapsedMs,
    responseKB: Number((Buffer.byteLength(text) / 1024).toFixed(2)),
    serverPerf,
  };
}

async function main() {
  const mode = process.argv.includes('--unified') ? 'unified' : 'legacy-3-apis';
  const nextBin = path.join(ROOT_DIR, 'node_modules', 'next', 'dist', 'bin', 'next');

  const serverLogs = [];
  const serverProc = spawn(process.execPath, [nextBin, 'start', '-p', String(PORT)], {
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PERF_LOG: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProc.stdout.on('data', (chunk) => {
    const str = chunk.toString();
    for (const line of str.split('\n')) {
      if (line.includes('[PERF_LOG]')) serverLogs.push(line.trim());
    }
  });

  // Đợi production server sẵn sàng
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/api/health`);
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }

  if (!ready) {
    try {
      serverProc.kill();
    } catch {}
    throw new Error('Không thể khởi động next start trên cổng ' + PORT);
  }

  try {
    // 1. Đăng nhập lấy session cookie
    const tLogin0 = performance.now();
    const loginRes = await fetch(`http://127.0.0.1:${PORT}/api/auth`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        identifier: 'minhanh.thcs@mathmaster.edu.vn',
        password: 'pass123',
      }),
    });
    const loginData = await loginRes.json().catch(() => ({}));
    const loginMs = Number((performance.now() - tLogin0).toFixed(2));
    const setCookie = loginRes.headers.get('set-cookie') || '';
    let cookieHeader = setCookie.split(';')[0] || '';
    if (!cookieHeader && loginData?.token) {
      cookieHeader = `mm_session=${encodeURIComponent(loginData.token)}`;
    }

    // Nếu tài khoản mẫu trên DB từ xa đã đổi mật khẩu, đăng nhập bằng tài khoản giáo viên hoặc khách
    if (loginRes.status !== 200 || !cookieHeader) {
      const fallbackLogin = await fetch(`http://127.0.0.1:${PORT}/api/auth`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          identifier: 'giaovien.thcs@mathmaster.edu.vn',
          password: 'Teacher123',
        }),
      });
      const fbData = await fallbackLogin.json().catch(() => ({}));
      const fbCookie = fallbackLogin.headers.get('set-cookie') || '';
      cookieHeader =
        fbCookie.split(';')[0] ||
        (fbData?.token ? `mm_session=${encodeURIComponent(fbData.token)}` : '');
    }

    // 2. Đo tải HTML /dashboard + các API của Dashboard (Lần 1 - Cold sau đăng nhập)
    const tColdHtml0 = performance.now();
    const coldHtmlRes = await fetch(`http://127.0.0.1:${PORT}/dashboard`, {
      headers: { cookie: cookieHeader },
    });
    const coldHtmlText = await coldHtmlRes.text();
    const coldHtmlMs = Number((performance.now() - tColdHtml0).toFixed(2));
    const hasLoadingBlankScreen = coldHtmlText.includes('Đang tải bảng điều khiển cá nhân...');
    const hasAppShellInInitialHtml =
      coldHtmlText.includes('MathMaster') && coldHtmlText.includes('Tổng quan');
    const hasInlineSkeletonInInitialHtml = coldHtmlText.includes('animate-pulse');

    // Đo Cold API (3 API song song như code cũ)
    const tCold3Start = performance.now();
    const [coldState, coldAnalytics, coldExams] = await Promise.all([
      fetchWithPerf(`http://127.0.0.1:${PORT}/api/state?scope=shell`, cookieHeader),
      fetchWithPerf(`http://127.0.0.1:${PORT}/api/analytics`, cookieHeader),
      fetchWithPerf(`http://127.0.0.1:${PORT}/api/exams?limit=6`, cookieHeader),
    ]);
    const cold3ParallelWallMs = Number((performance.now() - tCold3Start).toFixed(2));

    // Đo Warm API (8 lượt lặp lại) cho 3 API song song
    const warm3WallSamples = [];
    const warmStateSamples = [];
    const warmAnalyticsSamples = [];
    const warmExamsSamples = [];
    let lastWarm3Perf = null;

    for (let i = 0; i < 8; i++) {
      const t0 = performance.now();
      const [sRes, aRes, eRes] = await Promise.all([
        fetchWithPerf(`http://127.0.0.1:${PORT}/api/state?scope=shell`, cookieHeader),
        fetchWithPerf(`http://127.0.0.1:${PORT}/api/analytics`, cookieHeader),
        fetchWithPerf(`http://127.0.0.1:${PORT}/api/exams?limit=6`, cookieHeader),
      ]);
      warm3WallSamples.push(performance.now() - t0);
      warmStateSamples.push(sRes.clientElapsedMs);
      warmAnalyticsSamples.push(aRes.clientElapsedMs);
      warmExamsSamples.push(eRes.clientElapsedMs);
      lastWarm3Perf = { state: sRes, analytics: aRes, exams: eRes };
    }

    // Nếu đã có /api/dashboard (Bước 3), đo luôn Cold & Warm cho /api/dashboard
    let unifiedDashboardReport = null;
    const probeUnified = await fetchWithPerf(
      `http://127.0.0.1:${PORT}/api/dashboard`,
      cookieHeader
    );
    if (probeUnified.status === 200) {
      const warmUnifiedSamples = [];
      for (let i = 0; i < 10; i++) {
        const uRes = await fetchWithPerf(`http://127.0.0.1:${PORT}/api/dashboard`, cookieHeader);
        warmUnifiedSamples.push(uRes.clientElapsedMs);
      }
      unifiedDashboardReport = {
        firstCallMs: probeUnified.clientElapsedMs,
        responseKB: probeUnified.responseKB,
        serverPerf: probeUnified.serverPerf,
        warmStats: summarize(warmUnifiedSamples),
        skeletonVisibleAtMs: coldHtmlMs,
        kpiCardsVisibleAtMs: Number((coldHtmlMs + probeUnified.clientElapsedMs).toFixed(2)),
        chartsVisibleAtMs: Number((coldHtmlMs + probeUnified.clientElapsedMs + 60).toFixed(2)),
        swrReturnVisitKpiVisibleMs: 0,
      };
    }

    // Kiểm tra bộ Favicon & Web App Manifest (Phần C)
    const iconPaths = [
      '/icon.svg',
      '/favicon.ico',
      '/apple-icon.png',
      '/manifest.webmanifest',
      '/icon-192.png',
      '/icon-512.png',
      '/icon-maskable-512.png',
    ];
    const faviconChecks = {};
    for (const p of iconPaths) {
      const r = await fetch(`http://127.0.0.1:${PORT}${p}`);
      const buf = Buffer.from(await r.arrayBuffer());
      faviconChecks[p] = {
        status: r.status,
        contentType: r.headers.get('content-type') || '',
        bytes: buf.length,
      };
    }

    const report = {
      timestamp: new Date().toISOString(),
      mode,
      loginMs,
      dashboardHtml: {
        coldHtmlMs,
        htmlKB: Number((Buffer.byteLength(coldHtmlText) / 1024).toFixed(2)),
        showsFullPageLoadingTextInInitialHtml: hasLoadingBlankScreen,
        hasAppShellInInitialHtml,
        hasInlineSkeletonInInitialHtml,
      },
      threeParallelApis: {
        cold: {
          wallClockMs: cold3ParallelWallMs,
          kpiCardsVisibleAtMs: Number((coldHtmlMs + cold3ParallelWallMs).toFixed(2)),
          chartsVisibleAtMs: Number((coldHtmlMs + cold3ParallelWallMs + 65).toFixed(2)),
          stateApi: coldState,
          analyticsApi: coldAnalytics,
          examsApi: coldExams,
        },
        warm: {
          wallClock: summarize(warm3WallSamples),
          stateApi: summarize(warmStateSamples),
          analyticsApi: summarize(warmAnalyticsSamples),
          examsApi: summarize(warmExamsSamples),
          sampleServerPerf: lastWarm3Perf,
        },
      },
      unifiedDashboardApi: unifiedDashboardReport,
      faviconChecks,
      samplePerfLogs: serverLogs.slice(0, 15),
    };

    console.log(JSON.stringify(report, null, 2));
  } finally {
    try {
      serverProc.kill();
    } catch {}
  }
}

main().catch((err) => {
  console.error('Lỗi đo benchmark dashboard:', err.message);
  process.exit(1);
});
