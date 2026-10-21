// ==============================================================================
// MathMaster THCS - API Phân Tích Năng Lực Cá Nhân & Bảng Xếp Hạng (/api/analytics)
// Cung cấp dữ liệu cho biểu đồ Chart.js (Line Chart 10 đề gần nhất, Radar/Bar topic_mastery,
// gợi ý 2 chương yếu nhất) và Bảng xếp hạng tùy chọn ẩn danh.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getExamByIdMap,
  getPerfDiagnostics,
  getQuestionByIdMap,
  invalidateDashboardCache,
  requireUser,
  writeServerStateAsync,
} from '@/lib/prisma';
import { resolveQuestionCognitiveLevel } from '@/lib/math-grader';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const tRoute0 = performance.now();
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    const user = auth.user;
    const grade = Number(req.nextUrl.searchParams.get('grade') || user.currentGrade || 8);

    const gradedAttempts = (state.attempts || [])
      .filter((a: any) => a.userId === user.id && a.status === 'GRADED')
      .sort((a: any, b: any) =>
        String(a.submittedAt || a.startedAt || '').localeCompare(
          String(b.submittedAt || b.startedAt || '')
        )
      );

    const completedExams = gradedAttempts.length;
    const averageScore =
      completedExams > 0
        ? Number(
            (
              gradedAttempts.reduce((sum: number, a: any) => sum + Number(a.totalScore || 0), 0) /
              completedExams
            ).toFixed(2)
          )
        : 0;

    // 1. Tiến độ điểm số qua 10 bài thi gần nhất (cho biểu đồ đường Chart.js)
    const examMap = getExamByIdMap(state);
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

    // 2. Độ thành thạo theo từng Chương (topic_mastery) & theo 4 mức độ nhận thức
    const gradeMeta = (state.curriculum?.grades || []).find((g: any) => Number(g.id) === grade);
    const chapters = gradeMeta?.chapters || [];

    const userTopicMastery = (state.topicMastery || []).filter(
      (m: any) => m.userId === user.id && Number(m.grade) === grade
    );

    const chapterMastery = chapters.map((ch: any) => {
      const records = userTopicMastery.filter((m: any) => m.chapterId === ch.id);
      const questionsDone = records.reduce(
        (acc: number, r: any) => acc + Number(r.questionsDone || 0),
        0
      );
      const questionsRight = records.reduce(
        (acc: number, r: any) => acc + Number(r.questionsRight || 0),
        0
      );
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

    // Thống kê tỷ lệ đúng theo 4 mức nhận thức
    const levelStats: Record<string, { done: number; right: number; accuracyPercent: number }> = {
      nhan_biet: { done: 0, right: 0, accuracyPercent: 0 },
      thong_hieu: { done: 0, right: 0, accuracyPercent: 0 },
      van_dung: { done: 0, right: 0, accuracyPercent: 0 },
      van_dung_cao: { done: 0, right: 0, accuracyPercent: 0 },
    };

    const qMap = getQuestionByIdMap(state);
    for (const att of gradedAttempts) {
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

    // 3. Tự động phát hiện 2 chương yếu nhất để gợi ý ôn tập
    const weakestChapters = [...chapterMastery]
      .sort((a, b) => {
        if (a.questionsDone === 0 && b.questionsDone > 0) return 1;
        if (b.questionsDone === 0 && a.questionsDone > 0) return -1;
        return a.accuracyPercent - b.accuracyPercent;
      })
      .slice(0, 2);

    // 4. Bảng xếp hạng tùy chọn ẩn danh (Leaderboard)
    const leaderboard = (state.users || [])
      .filter((u: any) => u.role === 'STUDENT' && !u.isGuest)
      .sort((a: any, b: any) => Number(b.xp || 0) - Number(a.xp || 0))
      .slice(0, 10)
      .map((u: any, idx: number) => {
        const isMe = u.id === user.id;
        const hideName = Boolean(u.anonymousLeaderboard) && !isMe;
        return {
          rank: idx + 1,
          userId: hideName ? `anon_${idx + 1}` : u.id,
          displayName: hideName ? `Học sinh ẩn danh #${idx + 1}` : u.fullName,
          schoolName: hideName ? 'Ẩn danh' : u.schoolName || 'THCS',
          grade: u.currentGrade,
          xp: Number(u.xp || 0),
          level: Number(u.level || 1),
          streakDays: Number(u.streakDays || 1),
          isMe,
          anonymousLeaderboard: Boolean(u.anonymousLeaderboard),
        };
      });

    const nowMs = Date.now();
    const dueReviewsCount = (state.reviewQueue || []).filter(
      (r: any) =>
        r.userId === user.id &&
        !r.resolved &&
        (!r.nextReviewAt || new Date(r.nextReviewAt).getTime() <= nowMs)
    ).length;

    const res = NextResponse.json({
      ok: true,
      overview: {
        completedExams,
        averageScore,
        streakDays: Number(user.streakDays || 1),
        xp: Number(user.xp || 0),
        level: Number(user.level || 1),
        dueReviewsCount,
        anonymousLeaderboard: Boolean(user.anonymousLeaderboard),
      },
      scoreTrend,
      chapterMastery,
      cognitiveMastery: levelStats,
      weakestChapters,
      leaderboard,
    });
    const routeMs = Number((performance.now() - tRoute0).toFixed(2));
    if (process.env.PERF_LOG === '1') {
      const diag = getPerfDiagnostics();
      console.log(
        `[PERF_LOG] GET /api/analytics routeMs=${routeMs}ms branch=${
          diag.lastRead?.branch || 'unknown'
        }`
      );
      res.headers.set(
        'X-Perf-Metrics',
        JSON.stringify({ route: '/api/analytics', routeMs, read: diag.lastRead, totalDbQueries: diag.totalDbQueries })
      );
    }
    return res;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể tải dữ liệu phân tích năng lực.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    if (body.action === 'toggle_anonymous_leaderboard') {
      auth.user.anonymousLeaderboard =
        body.anonymous !== undefined ? Boolean(body.anonymous) : !auth.user.anonymousLeaderboard;
      invalidateDashboardCache(auth.user.id, true);
      await writeServerStateAsync(auth.state);
      return NextResponse.json({
        ok: true,
        anonymousLeaderboard: auth.user.anonymousLeaderboard,
      });
    }

    return NextResponse.json({ ok: false, error: 'Hành động không hợp lệ.' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể cập nhật cài đặt bảng xếp hạng.' },
      { status: 500 }
    );
  }
}
