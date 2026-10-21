// ==============================================================================
// MathMaster THCS - API Sổ Tay Lỗi Sai & Ôn Tập Ngắt Quãng SM-2 (/api/review)
// Tự động lên lịch nhắc lại câu sai theo thuật toán SuperMemo-2 (SM-2)
// và tạo Mini-Đề ôn lại các câu sai (5-10 câu)
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireUser, writeServerStateAsync } from '@/lib/prisma';
import {
  allocateWeightedQuestionPoints,
  checkMathEquivalence,
  resolveQuestionCognitiveLevel,
} from '@/lib/math-grader';

export const dynamic = 'force-dynamic';

/**
 * Thuật toán SuperMemo-2 (SM-2) chuẩn tính khoảng cách ôn tập tiếp theo
 */
export function computeSm2Schedule(
  current: { easeFactor?: number; intervalDays?: number; repetitions?: number },
  quality: number
) {
  const q = Math.max(0, Math.min(5, Math.round(Number(quality))));
  let easeFactor = Number(current.easeFactor ?? 2.5);
  let intervalDays = Number(current.intervalDays ?? 1);
  let repetitions = Number(current.repetitions ?? 0);

  if (q >= 3) {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    intervalDays = 1;
  }

  easeFactor = Math.max(
    1.3,
    Number((easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))).toFixed(2))
  );

  const nextReviewAt = new Date(Date.now() + intervalDays * 86400_000).toISOString();
  return {
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewAt,
    resolved: repetitions >= 3,
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    const userId = auth.user.id;
    const nowMs = Date.now();

    const userReviews = (state.reviewQueue || [])
      .filter((r: any) => r.userId === userId)
      .map((r: any) => {
        const question = (state.questions || []).find((q: any) => q.id === r.questionId) || null;
        const dueMs = r.nextReviewAt ? new Date(r.nextReviewAt).getTime() : 0;
        const isDue = !r.resolved && dueMs <= nowMs;
        return {
          ...r,
          isDue,
          question,
        };
      });

    const dueItems = userReviews.filter((r: any) => r.isDue);
    const errorBreakdown: Record<string, number> = {
      CALCULATION_ERROR: 0,
      SIGN_ERROR: 0,
      FORMULA_ERROR: 0,
      MISSING_CONDITION: 0,
      CONCEPT_ERROR: 0,
      METHOD_ERROR: 0,
    };

    for (const item of userReviews) {
      const cat = String(item.errorType || 'CALCULATION_ERROR');
      errorBreakdown[cat] = (errorBreakdown[cat] || 0) + 1;
    }

    return NextResponse.json({
      ok: true,
      reviewQueue: userReviews,
      dueCount: dueItems.length,
      dueItems,
      errorBreakdown,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể tải danh sách sổ tay lỗi sai.' },
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
    const { action } = body || {};
    const state = auth.state;
    const userId = auth.user.id;

    // 1. Chấm và cập nhật lịch SM-2 cho 1 câu trong sổ tay lỗi sai
    if (action === 'grade_card' || action === 'review_answer') {
      const reviewId = body.reviewId;
      const questionId = body.questionId;
      const rev = (state.reviewQueue || []).find(
        (r: any) =>
          r.userId === userId && (r.id === reviewId || (questionId && r.questionId === questionId))
      );

      if (!rev) {
        return NextResponse.json(
          { ok: false, error: 'Không tìm thấy mục ôn tập trong sổ tay của bạn.' },
          { status: 404 }
        );
      }

      const question = (state.questions || []).find((q: any) => q.id === rev.questionId);
      let quality = body.quality !== undefined ? Number(body.quality) : 4;
      let isAnswerCorrect: boolean | null = null;

      if (body.answer !== undefined && question) {
        const rawAns = String(body.answer || '').trim();
        if (question.type === 'mcq') {
          isAnswerCorrect = rawAns.toUpperCase() === String(question.correctAnswer).toUpperCase();
        } else {
          isAnswerCorrect = checkMathEquivalence(rawAns, question).isCorrect;
        }
        if (body.quality === undefined) {
          quality = isAnswerCorrect ? 4 : 1;
        }
      }

      const sm2 = computeSm2Schedule(rev, quality);
      rev.easeFactor = sm2.easeFactor;
      rev.intervalDays = sm2.intervalDays;
      rev.repetitions = sm2.repetitions;
      rev.nextReviewAt = sm2.nextReviewAt;
      rev.resolved = body.markResolved !== undefined ? Boolean(body.markResolved) : sm2.resolved;
      rev.lastReviewedAt = new Date().toISOString();

      if (quality >= 3) {
        auth.user.xp = Number(auth.user.xp || 0) + 15;
        auth.user.level = Math.max(1, Math.floor(auth.user.xp / 200) + 1);
      }

      await writeServerStateAsync(state);
      return NextResponse.json({
        ok: true,
        reviewItem: rev,
        isAnswerCorrect,
        sm2,
      });
    }

    // 2. Tạo Mini-Đề ôn lại câu sai (5-10 câu) lấy trực tiếp từ reviewQueue
    if (action === 'create_wrong_mini_exam') {
      const desiredCount = Math.max(1, Math.min(10, Number(body.questionCount || 5)));
      const nowMs = Date.now();

      // Ưu tiên các câu đang đến hạn (due) hoặc chưa resolved của chính user
      const userReviewItems = (state.reviewQueue || [])
        .filter((r: any) => r.userId === userId && !r.resolved)
        .sort((a: any, b: any) => {
          const aDue = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() : 0;
          const bDue = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() : 0;
          return aDue - bDue;
        });

      const pickedQuestions: any[] = [];
      const usedQIds = new Set<string>();

      for (const item of userReviewItems) {
        const q = (state.questions || []).find((x: any) => x.id === item.questionId);
        if (q && !usedQIds.has(q.id)) {
          pickedQuestions.push(q);
          usedQIds.add(q.id);
          if (pickedQuestions.length >= desiredCount) break;
        }
      }

      // Nếu chưa đủ và cho phép bổ sung từ toàn bộ lịch sử reviewQueue của user
      if (pickedQuestions.length < desiredCount) {
        for (const item of (state.reviewQueue || []).filter((r: any) => r.userId === userId)) {
          const q = (state.questions || []).find((x: any) => x.id === item.questionId);
          if (q && !usedQIds.has(q.id)) {
            pickedQuestions.push(q);
            usedQIds.add(q.id);
            if (pickedQuestions.length >= desiredCount) break;
          }
        }
      }

      if (pickedQuestions.length === 0) {
        return NextResponse.json(
          {
            ok: false,
            code: 'EMPTY_REVIEW_QUEUE',
            error: 'Sổ tay lỗi sai của bạn hiện chưa có câu hỏi nào cần ôn lại.',
          },
          { status: 422 }
        );
      }

      const questionPoints = allocateWeightedQuestionPoints(pickedQuestions);
      const actualCounts = { nhan_biet: 0, thong_hieu: 0, van_dung: 0, van_dung_cao: 0 };
      const formatCounts = { mcq: 0, essay: 0 };
      for (const q of pickedQuestions) {
        actualCounts[resolveQuestionCognitiveLevel(q)] += 1;
        if (q.type === 'mcq') formatCounts.mcq += 1;
        else formatCounts.essay += 1;
      }

      const miniExam = {
        id: `EXAM_REV_${Date.now()}`,
        userId,
        title: `Đề Ôn Tập Lỗi Sai SM-2 (${pickedQuestions.length} câu)`,
        examCode: String(900 + Math.floor(Math.random() * 99)),
        grade: Number(pickedQuestions[0]?.grade || auth.user.currentGrade || 8),
        textbook: auth.user.preferredBook || 'KNTT',
        semester: 1,
        category: 'ON_TAP_LOI_SAI',
        categoryLabel: 'Ôn tập lỗi sai (SM-2)',
        difficulty: 'trung_binh',
        format: formatCounts.mcq > 0 && formatCounts.essay > 0 ? 'combined' : formatCounts.mcq > 0 ? 'mcq' : 'essay',
        durationMinutes: Math.max(15, pickedQuestions.length * 5),
        maxScore: 10.0,
        questionIds: pickedQuestions.map((q) => q.id),
        questionPoints,
        composition: {
          requestedPreset: 'trung_binh',
          targetCounts: actualCounts,
          actualCounts,
          formatCounts,
          borrowedFromAdjacent: false,
          nowMs,
        },
        isFavorite: false,
        isSeed: false,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };

      state.exams.unshift(miniExam);
      await writeServerStateAsync(state);

      return NextResponse.json({
        ok: true,
        exam: miniExam,
        questionCount: pickedQuestions.length,
      });
    }

    return NextResponse.json({ ok: false, error: 'Hành động không hợp lệ.' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Đã xảy ra lỗi khi xử lý sổ tay lỗi sai.' },
      { status: 500 }
    );
  }
}
