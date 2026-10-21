// ==============================================================================
// MathMaster THCS - Đo thời gian các thao tác GHI (Bước 2.6)
// Chạy trên bản production (next start, PERF_LOG=1), dùng tài khoản KHÁCH tạm thời
// rồi tự xoá tài khoản khách ở cuối để không để lại dữ liệu rác trên DB.
// Đo: đăng nhập/đăng xuất (sessions), bắt đầu làm bài (attempts), autosave (attempts).
// Không in bất kỳ giá trị nào trong .env.
// ==============================================================================

import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { spawn } from 'node:child_process';

const ROOT_DIR = process.cwd();
const PORT = 3097;
const BASE = `http://127.0.0.1:${PORT}`;

function stats(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const pick = (p) => s[Math.min(s.length - 1, Math.max(0, Math.ceil((p / 100) * s.length) - 1))] || 0;
  const avg = s.reduce((a, b) => a + b, 0) / (s.length || 1);
  return { n: s.length, p50: +pick(50).toFixed(2), p95: +pick(95).toFixed(2), avg: +avg.toFixed(2) };
}

async function timed(fn) {
  const t0 = performance.now();
  const r = await fn();
  return { ms: performance.now() - t0, r };
}

async function post(url, body, cookie) {
  const res = await fetch(BASE + url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  const sc = res.headers.get('set-cookie') || '';
  return { status: res.status, data, cookie: sc.split(';')[0] };
}

async function main() {
  const nextBin = path.join(ROOT_DIR, 'node_modules', 'next', 'dist', 'bin', 'next');
  const logs = [];
  const proc = spawn(process.execPath, [nextBin, 'start', '-p', String(PORT)], {
    cwd: ROOT_DIR,
    env: { ...process.env, NODE_ENV: 'production', PERF_LOG: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  proc.stdout.on('data', (c) => {
    for (const line of c.toString().split('\n')) if (line.includes('[PERF_LOG] write')) logs.push(line.trim());
  });

  let ready = false;
  for (let i = 0; i < 80 && !ready; i++) {
    try {
      ready = (await fetch(`${BASE}/api/health`)).ok;
    } catch {}
    if (!ready) await new Promise((r) => setTimeout(r, 250));
  }
  if (!ready) {
    proc.kill();
    throw new Error('next start không khởi động được');
  }

  const result = {};
  let guestCookie = '';
  try {
    // Làm nóng: nạp state lần đầu (không tính vào số đo ghi)
    await fetch(`${BASE}/api/health`);

    // 1. Tạo khách tạm (ghi users + sessions)
    const g = await timed(() => post('/api/auth', { action: 'guest', currentGrade: 8 }));
    guestCookie = g.r.cookie;
    result.guestCreateMs = +g.ms.toFixed(2);

    // Lấy 1 đề mẫu để bắt đầu làm bài
    const exRes = await fetch(`${BASE}/api/exams?limit=6`, { headers: { cookie: guestCookie } });
    const exData = await exRes.json();
    const exam = (exData.exams || []).find((e) => e.isSeed) || (exData.exams || [])[0];
    if (!exam) throw new Error('Không có đề mẫu để đo');

    // 2. Bắt đầu làm bài (chỉ thêm 1 attempt)
    const st = await timed(() => post('/api/attempts', { action: 'start', examId: exam.id, forceNew: true }, guestCookie));
    const attemptId = st.r.data?.attempt?.id;
    result.attemptStartMs = +st.ms.toFixed(2);

    // 3. Autosave 8 lần (chỉ sửa 1 attempt)
    const autosave = [];
    for (let i = 1; i <= 8; i++) {
      const a = await timed(() =>
        post(
          '/api/attempts',
          { action: 'autosave', attemptId, timeSpentSeconds: i * 10, remainingSeconds: 2700 - i * 10 },
          guestCookie
        )
      );
      if (a.r.status !== 200) throw new Error('autosave lỗi ' + a.r.status);
      autosave.push(a.ms);
    }
    result.autosave = stats(autosave);

    // 4. Đăng nhập + đăng xuất tài khoản mẫu 4 lần (chỉ sửa sessions)
    const loginMs = [];
    const logoutMs = [];
    for (let i = 0; i < 4; i++) {
      const l = await timed(() =>
        post('/api/auth', { action: 'login', identifier: 'minhanh.thcs@mathmaster.edu.vn', password: 'pass123' })
      );
      if (l.r.status !== 200) {
        result.loginNote = `login status ${l.r.status} (bỏ qua đo đăng nhập)`;
        break;
      }
      loginMs.push(l.ms);
      const o = await timed(() => post('/api/auth', { action: 'logout' }, l.r.cookie));
      logoutMs.push(o.ms);
    }
    if (loginMs.length) result.login = stats(loginMs);
    if (logoutMs.length) result.logout = stats(logoutMs);
  } finally {
    // 5. Dọn dẹp: xoá tài khoản khách (xoá cả attempts/sessions của khách)
    if (guestCookie) {
      const d = await post('/api/auth', { action: 'delete' }, guestCookie).catch(() => null);
      result.guestCleanupStatus = d?.status;
    }
    await new Promise((r) => setTimeout(r, 300));
    proc.kill();
  }

  const parsed = logs.map((l) => {
    const bytes = Number((l.match(/bytesWritten=(\d+)/) || [])[1] || 0);
    const ms = Number((l.match(/writeMs=([\d.]+)/) || [])[1] || 0);
    const mode = (l.match(/mode=(\S+)/) || [])[1];
    return { mode, bytes, ms };
  });
  result.serverWrites = {
    count: parsed.length,
    avgBytesPerWrite: Math.round(parsed.reduce((a, b) => a + b.bytes, 0) / (parsed.length || 1)),
    totalKBWritten: +(parsed.reduce((a, b) => a + b.bytes, 0) / 1024).toFixed(2),
    writeMs: stats(parsed.map((p) => p.ms)),
  };
  result.sampleWriteLogs = logs.slice(0, 12);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error('Lỗi benchmark ghi:', e.message);
  process.exit(1);
});
