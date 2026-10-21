// ==============================================================================
// MathMaster THCS - API Hợp Nhất Cho Trang Tổng Quan (/api/dashboard)
// Trả về toàn bộ dữ liệu trang Dashboard trong 1 lượt gọi duy nhất:
// - user, overview, scoreTrend, chapterMastery, weakestChapters, cognitiveMastery,
//   recentExams (6 đề gần nhất), và leaderboard (Top 10 chọn lọc O(N), cache riêng).
// - Có Cache theo từng người dùng (userId:grade, TTL 45s) và vô hiệu hóa tức thì
//   khi nộp bài, tạo đề, đổi cài đặt ẩn danh hoặc đăng xuất.
// - Luôn gắn Cache-Control: private, no-store ở tầng HTTP.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { sanitizeUserForClient } from '@/lib/auth';
import {
  getDashboardCacheEntry,
  getExamByIdMap,
  getLeaderboardSharedCache,
  getPerfDiagnostics,
  getQuestionByIdMap,
  invalidateDashboardCache,
  requireUser,
  setDashboardCacheEntry,
  setLeaderboardSharedCache,
  writeServerStateAsync,
} from '@/lib/prisma';
import { resolveQuestionCognitiveLevel } from '@/lib/math-grader';

export const dynamic = 'force-dynamic';
export const preferredRegion = ['sin1', 'hnd1'];

const PRIVATE_NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
};

/**
 * Chọn Top-K học sinh có XP cao nhất trong O(N * K) với K=10,
 * không cần sắp xếp toàn bộ mảng người dùng lớn.
 */
function selectTopKStudentsByXp(users: any[], k = 10): any[] {
  const top: any[] = [];
  for (const u of users) {
    if (!u || u.role !== 'STUDENT' || u.isGuest) continue;
    const xp = Number(u.xp || 0);
    if (top.length < k) {
      top.push(u);
      top.sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0));
    } else if (xp > Number(top[top.length - 1].xp || 0)) {
      top[top.length - 1] = u;
      top.sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0));
    }
  }
  return top;
}

function buildLeaderboardForViewer(state: any, viewerUserId: string) {
  let rawTop = getLeaderboardSharedCache();
  if (!rawTop) {
    const topUsers = selectTopKStudentsByXp(state.users || [], 10);
    rawTop = topUsers.map((u: any, idx: number) => ({
      rank: idx + 1,
      id: u.id,
      fullName: u.fullName,
      schoolName: u.schoolName || 'THCS',
      grade: u.currentGrade,
      xp: Number(u.xp || 0),
      level: Number(u.level || 1),
      streakDays: Number(u.streakDays || 1),
      anonymousLeaderboard: Boolean(u.anonymousLeaderboard),
    }));
    setLeaderboardSharedCache(rawTop, 90000);
  }

  return rawTop.map((item: any, idx: number) => {
    const isMe = item.id === viewerUserId;
    const hideName = Boolean(item.anonymousLeaderboard) && !isMe;
    return {
      rank: idx + 1,
      userId: hideName ? `anon_${idx + 1}` : item.id,
      displayName: hideName ? `Học sinh ẩn danh #${idx + 1}` : item.fullName,
      schoolName: hideName ? 'Ẩn danh' : item.schoolName,
      grade: item.grade,
      xp: item.xp,
      level: item.level,
      streakDays: item.streakDays,
      isMe,
      anonymousLeaderboard: Boolean(item.anonymousLeaderboard),
    };
  });
}

export async function GET(req: NextRequest) {
  const tRoute0 = performance.now();
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: auth.status, headers: PRIVATE_NO_STORE_HEADERS }
      );
    }

    const state = auth.state;
    const user = auth.user;
    const safeUser = sanitizeUserForClient(user);
    const grade = Number(req.nextUrl.searchParams.get('grade') || user.currentGrade || 8);
    const cacheKey = `${user.id}:${grade}`;

    const cachedPersonal = getDashboardCacheEntry(cacheKey);
    if (cachedPersonal) {
      const leaderboard = buildLeaderboardForViewer(state, user.id);
      const routeMs = Number((performance.now() - tRoute0).toFixed(2));
      const res = NextResponse.json(
        {
          ok: true,
          cached: true,
          user: safeUser,
          overview: {
            ...cachedPersonal.overview,
            streakDays: Number(user.streakDays || 1),
            xp: Number(user.xp || 0),
            level: Number(user.level || 1),
            anonymousLeaderboard: Boolean(user.anonymousLeaderboard),
          },
          scoreTrend: cachedPersonal.scoreTrend,
          chapterMastery: cachedPersonal.chapterMastery,
          cognitiveMastery: cachedPersonal.cognitiveMastery,
          weakestChapters: cachedPersonal.weakestChapters,
          recentExams: cachedPersonal.recentExams,
          leaderboard,
        },
        { headers: PRIVATE_NO_STORE_HEADERS }
      );
      if (process.env.PERF_LOG === '1') {
        const diag = getPerfDiagnostics();
        console.log(
          `[PERF_LOG] GET /api/dashboard (user-cache HIT) routeMs=${routeMs}ms branch=${
            diag.lastRead?.branch || 'db-cache'
          }`
        );
        res.headers.set(
          'X-Perf-Metrics',
          JSON.stringify({
            route: '/api/dashboard',
            userCacheHit: true,
            routeMs,
            read: diag.lastRead,
            totalDbQueries: diag.totalDbQueries,
          })
        );
      }
      return res;
    }

    const examMap = getExamByIdMap(state);
    const qMap = getQuestionByIdMap(state);

    // 1. Duyệt 1 lần qua attempts của người dùng để tính điểm TB, xu hướng 10 đề & 4 mức nhận thức
    const gradedAttempts: any[] = [];
    let scoreSum = 0;
    const levelStats: Record<string, { done: number; right: number; accuracyPercent: number }> = {
      nhan_biet: { done: 0, right: 0, accuracyPercent: 0 },
      thong_hieu: { done: 0, right: 0, accuracyPercent: 0 },
      van_dung: { done: 0, right: 0, accuracyPercent: 0 },
      van_dung_cao: { done: 0, right: 0, accuracyPercent: 0 },
    };

    for (const att of state.attempts || []) {
      if (att.userId !== user.id || att.status !== 'GRADED') continue;
      gradedAttempts.push(att);
      scoreSum += Number(att.totalScore || 0);

      const answers = att.answers || {};
      for (const [qId, ans] of Object.entries<any>(answers)) {
        const q = qMap.get(qId);
        if (!q) continue;
        const lv = resolveQuestionCognitiveLevel(q);
        levelStats[lv].done += 1;
        if (ans?.isCorrect) levelStats[lv].right += 1;
      }
    }

    for (const lv of Object.keys(levelStats)) {
      const s = levelStats[lv];
      s.accuracyPercent = s.done > 0 ? Math.round((s.right / s.done) * 100) : 0;
    }

    gradedAttempts.sort((a: any, b: any) =>
      String(a.submittedAt || a.startedAt || '').localeCompare(
        String(b.submittedAt || b.startedAt || '')
      )
    );

    const completedExams = gradedAttempts.length;
    const averageScore =
      completedExams > 0 ? Number((scoreSum / completedExams).toFixed(2)) : 0;

    const scoreTrend = gradedAttempts.slice(-10).map((att: any) => {
      const exam = examMap.get(att.examId);
      return {
        attemptId: att.id,
        examId: att.examId,
        examTitle: exam?.title || `Đề Toán ${att.grade}`,
        submittedAt: att.submittedAt || att.startedAt,
        totalScore: Number(att.totalScore || 0),
        mcqScore: Number(att.mcqScore || 0),
        essayScore: Number(att.essayScore || 0),
      };
    });

    // 2. Gom topicMastery theo chapterId bằng Map trong 1 lần duyệt
    const masteryByChapter = new Map<string, { done: number; right: number }>();
    for (const m of state.topicMastery || []) {
      if (m.userId !== user.id || Number(m.grade) !== grade) continue;
      const prev = masteryByChapter.get(m.chapterId) || { done: 0, right: 0 };
      prev.done += Number(m.questionsDone || 0);
      prev.right += Number(m.questionsRight || 0);
      masteryByChapter.set(m.chapterId, prev);
    }

    const gradeMeta = (state.curriculum?.grades || []).find(
      (g: any) => Number(g.id) === grade
    );
    const chapters = gradeMeta?.chapters || [];

    const chapterMastery = chapters.map((ch: any) => {
      const agg = masteryByChapter.get(ch.id) || { done: 0, right: 0 };
      const questionsDone = agg.done;
      const questionsRight = agg.right;
      const accuracyPercent =
        questionsDone > 0 ? Math.round((questionsRight / questionsDone) * 100) : 0;

      return {
        chapterId: ch.id,
        semester: ch.semester,
        title: ch.title,
        questionsDone,
        questionsRight,
        accuracyPercent,
        status:
          questionsDone === 0
            ? 'CHUA_LUYEN'
            : accuracyPercent < 60
            ? 'CAN_CAI_THIEN'
            : accuracyPercent < 80
            ? 'KHA'
            : 'THANH_THAO',
      };
    });

    const weakestChapters = [...chapterMastery]
      .sort((a, b) => {
        if (a.questionsDone === 0 && b.questionsDone > 0) return 1;
        if (b.questionsDone === 0 && a.questionsDone > 0) return -1;
        return a.accuracyPercent - b.accuracyPercent;
      })
      .slice(0, 2);

    // 3. Đếm số câu đến hạn ôn tập SM-2 trong 1 vòng lặp
    const nowMs = Date.now();
    let dueReviewsCount = 0;
    for (const r of state.reviewQueue || []) {
      if (
        r.userId === user.id &&
        !r.resolved &&
        (!r.nextReviewAt || new Date(r.nextReviewAt).getTime() <= nowMs)
      ) {
        dueReviewsCount += 1;
      }
    }

    // 4. Lấy 6 đề gần nhất mà người dùng có quyền xem
    const isAdminOrTeacher = user.role === 'ADMIN' || user.role === 'TEACHER';
    const joinedClassIds = new Set<string>();
    for (const m of state.classroomMembers || []) {
      if (m.studentId === user.id) joinedClassIds.add(m.classroomId);
    }
    const assignedExamIds = new Set<string>();
    for (const a of state.classroomAssignments || []) {
      if (joinedClassIds.has(a.classroomId)) assignedExamIds.add(a.examId);
    }

    const recentExams: any[] = [];
    for (const e of state.exams || []) {
      if (
        isAdminOrTeacher ||
        e.userId === user.id ||
        Boolean(e.isSeed) ||
        assignedExamIds.has(e.id)
      ) {
        recentExams.push(e);
        if (recentExams.length >= 6) break;
      }
    }

    const overview = {
      completedExams,
      averageScore,
      streakDays: Number(user.streakDays || 1),
      xp: Number(user.xp || 0),
      level: Number(user.level || 1),
      dueReviewsCount,
      anonymousLeaderboard: Boolean(user.anonymousLeaderboard),
    };

    setDashboardCacheEntry(
      cacheKey,
      {
        overview,
        scoreTrend,
        chapterMastery,
        cognitiveMastery: levelStats,
        weakestChapters,
        recentExams,
      },
      45000
    );

    const leaderboard = buildLeaderboardForViewer(state, user.id);
    const routeMs = Number((performance.now() - tRoute0).toFixed(2));

    const res = NextResponse.json(
      {
        ok: true,
        cached: false,
        user: safeUser,
        overview,
        scoreTrend,
        chapterMastery,
        cognitiveMastery: levelStats,
        weakestChapters,
        recentExams,
        leaderboard,
      },
      { headers: PRIVATE_NO_STORE_HEADERS }
    );

    if (process.env.PERF_LOG === '1') {
      const diag = getPerfDiagnostics();
      console.log(
        `[PERF_LOG] GET /api/dashboard (user-cache MISS) routeMs=${routeMs}ms branch=${
          diag.lastRead?.branch || 'unknown'
        }`
      );
      res.headers.set(
        'X-Perf-Metrics',
        JSON.stringify({
          route: '/api/dashboard',
          userCacheHit: false,
          routeMs,
          read: diag.lastRead,
          totalDbQueries: diag.totalDbQueries,
        })
      );
    }

    return res;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể tải dữ liệu bảng điều khiển.' },
      { status: 500, headers: PRIVATE_NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: auth.status, headers: PRIVATE_NO_STORE_HEADERS }
      );
    }

    const body = await req.json();
    if (body.action === 'toggle_anonymous_leaderboard') {
      auth.user.anonymousLeaderboard =
        body.anonymous !== undefined
          ? Boolean(body.anonymous)
          : !auth.user.anonymousLeaderboard;
      invalidateDashboardCache(auth.user.id, true);
      await writeServerStateAsync(auth.state);
      return NextResponse.json(
        {
          ok: true,
          anonymousLeaderboard: auth.user.anonymousLeaderboard,
        },
        { headers: PRIVATE_NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Hành động không hợp lệ.' },
      { status: 400, headers: PRIVATE_NO_STORE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể cập nhật cài đặt bảng xếp hạng.' },
      { status: 500, headers: PRIVATE_NO_STORE_HEADERS }
    );
  }
}
