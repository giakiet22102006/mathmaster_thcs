// ==============================================================================
// MathMaster THCS - Bộ Quản Lý Stale-While-Revalidate (SWR) Cho Trang /dashboard
// - Khoá cache theo đúng userId đang đăng nhập (cô lập tuyệt đối giữa các tài khoản).
// - Xoá sạch toàn bộ cache khi đăng xuất hoặc đổi tài khoản.
// - Hỗ trợ làm nóng (warm-up) ngay sau khi đăng nhập thành công.
// ==============================================================================

const ACTIVE_USER_KEY = 'mm_active_user_id';
const SWR_STORAGE_PREFIX = 'mm_dash_swr_';

interface SwrDashboardSnapshot {
  userId: string;
  user: any;
  analytics: any;
  recentExams: any[];
  updatedAtMs: number;
}

const memorySwrMap = new Map<string, SwrDashboardSnapshot>();
let inFlightClientFetch: Promise<{ status: number; data: any }> | null = null;

export function clearDashboardClientCache() {
  memorySwrMap.clear();
  inFlightClientFetch = null;
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(ACTIVE_USER_KEY);
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (k && k.startsWith(SWR_STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      window.sessionStorage.removeItem(k);
    }
  } catch {}
}

export function getDashboardClientCache(): SwrDashboardSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const activeUserId = window.sessionStorage.getItem(ACTIVE_USER_KEY);
    if (!activeUserId) return null;

    const memHit = memorySwrMap.get(activeUserId);
    if (memHit && memHit.userId === activeUserId) {
      return memHit;
    }

    const raw = window.sessionStorage.getItem(`${SWR_STORAGE_PREFIX}${activeUserId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SwrDashboardSnapshot;
    if (!parsed || parsed.userId !== activeUserId) return null;
    memorySwrMap.set(activeUserId, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function setDashboardClientCache(payload: {
  user: any;
  analytics?: any;
  recentExams?: any[];
}) {
  const userId = payload?.user?.id;
  if (!userId) return;

  if (typeof window !== 'undefined') {
    try {
      const prevUserId = window.sessionStorage.getItem(ACTIVE_USER_KEY);
      if (prevUserId && prevUserId !== userId) {
        clearDashboardClientCache();
      }
      window.sessionStorage.setItem(ACTIVE_USER_KEY, userId);
    } catch {}
  }

  const prev = memorySwrMap.get(userId);
  const snapshot: SwrDashboardSnapshot = {
    userId,
    user: payload.user,
    analytics: payload.analytics !== undefined ? payload.analytics : prev?.analytics || null,
    recentExams:
      payload.recentExams !== undefined ? payload.recentExams : prev?.recentExams || [],
    updatedAtMs: Date.now(),
  };

  memorySwrMap.set(userId, snapshot);
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(
        `${SWR_STORAGE_PREFIX}${userId}`,
        JSON.stringify(snapshot)
      );
    } catch {}
  }
}

export async function fetchDashboardUnifiedApi(timeoutMs = 8000): Promise<{
  status: number;
  data: any;
}> {
  if (inFlightClientFetch) {
    return inFlightClientFetch;
  }

  inFlightClientFetch = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch('/api/dashboard', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        signal: controller.signal,
      });
      if (res.status === 401) {
        clearDashboardClientCache();
        return { status: 401, data: null };
      }
      const data = await res.json();
      if (res.ok && data?.ok && data?.user?.id) {
        setDashboardClientCache({
          user: data.user,
          analytics: {
            ok: true,
            overview: data.overview,
            scoreTrend: data.scoreTrend,
            chapterMastery: data.chapterMastery,
            cognitiveMastery: data.cognitiveMastery,
            weakestChapters: data.weakestChapters,
            leaderboard: data.leaderboard,
          },
          recentExams: data.recentExams || [],
        });
      }
      return { status: res.status, data };
    } finally {
      clearTimeout(timer);
      inFlightClientFetch = null;
    }
  })();

  return inFlightClientFetch;
}

/**
 * Làm nóng dữ liệu Dashboard ngay sau khi đăng nhập / đăng ký thành công
 */
export function warmupDashboardAfterLogin(user?: any) {
  if (user?.id) {
    setDashboardClientCache({ user });
  }
  fetchDashboardUnifiedApi(8000).catch(() => {});
}
