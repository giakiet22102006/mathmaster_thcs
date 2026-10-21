// ==============================================================================
// MathMaster THCS - API Luyện Tập Chủ Đề Không Tính Giờ & Đề Thích Ứng (/api/practice)
// Hỗ trợ gợi ý từng bước (Step-by-step Hints) và tạo đề "Luyện điểm yếu"
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  invalidateDashboardCache,
  invalidateExamPoolCache,
  requireUser,
  writeServerStateAsync,
} from '@/lib/prisma';
import {
  checkMathEquivalence,
  classifyAnswerError,
  evaluateEssayRubricSteps,
  generateExamFromPool,
  resolveQuestionCognitiveLevel,
} from '@/lib/math-grader';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    const grade = Number(req.nextUrl.searchParams.get('grade') || auth.user.currentGrade || 8);
    const chapterId = req.nextUrl.searchParams.get('chapterId') || 'ALL';
    const cognitiveLevel = req.nextUrl.searchParams.get('cognitiveLevel') || 'ALL';
    const includeDraft =
      req.nextUrl.searchParams.get('includeDraft') === 'true' &&
      (auth.user.role === 'TEACHER' || auth.user.role === 'ADMIN');

    let questions = (state.questions || []).filter((q: any) => {
      if (Number(q.grade) !== grade) return false;
      if (!includeDraft && q.verificationStatus !== 'verified') return false;
      if (chapterId !== 'ALL' && q.chapterId !== chapterId) return false;
      if (
        cognitiveLevel !== 'ALL' &&
        resolveQuestionCognitiveLevel(q) !== cognitiveLevel
      ) {
        return false;
      }
      return true;
    });

    // Bổ sung cấu trúc gợi ý từng bước (hints) cho chế độ Luyện tập
    const enriched = questions.map((q: any) => ({
      ...q,
      hints: [
        q.keyFormula ? `Gợi ý 1 (Công thức trọng tâm): ${q.keyFormula}` : 'Gợi ý 1: Xác định dữ kiện bài toán và điều kiện xác định.',
        q.rubricSteps?.[0]?.step
          ? `Gợi ý 2 (Bước biến đổi đầu tiên): ${q.rubricSteps[0].step}`
          : 'Gợi ý 2: Áp dụng quy tắc biến đổi tương đương.',
        `Gợi ý 3 (Lưu ý tránh bẫy): ${q.commonMistake || 'Kiểm tra kỹ dấu và đơn vị trước khi kết luận.'}`,
      ],
    }));

    return NextResponse.json({
      ok: true,
      grade,
      chapterId,
      cognitiveLevel,
      total: enriched.length,
      questions: enriched,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể tải danh sách câu hỏi luyện tập.' },
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

    // 1. Kiểm tra đáp án 1 câu hỏi trong chế độ Luyện tập không tính giờ
    if (action === 'check_answer') {
      const question = (state.questions || []).find((q: any) => q.id === body.questionId);
      if (!question) {
        return NextResponse.json({ ok: false, error: 'Không tìm thấy câu hỏi.' }, { status: 404 });
      }

      const rawVal = String(body.answer ?? body.value ?? '').trim();
      const rawWorkings = String(body.workings || '').trim();
      let isCorrect = false;
      let matchedReason = '';
      let errorCategory: string | null = null;
      let partialInfo: any = null;

      if (question.type === 'mcq') {
        isCorrect = rawVal.toUpperCase() === String(question.correctAnswer).trim().toUpperCase();
        matchedReason = isCorrect
          ? 'Chính xác! Bạn đã chọn đúng đáp án.'
          : 'Chưa chính xác. Hãy xem gợi ý và lời giải chi tiết.';
        if (!isCorrect) {
          errorCategory = classifyAnswerError(rawVal, question);
        }
      } else {
        const eq = checkMathEquivalence(rawVal || rawWorkings, question);
        isCorrect = eq.isCorrect;
        matchedReason = eq.matchedReason;
        errorCategory = eq.errorCategory;
        if (!isCorrect) {
          partialInfo = evaluateEssayRubricSteps(
            rawWorkings,
            rawVal,
            question,
            Number(question.points || 2.0)
          );
        }
      }

      // Cập nhật thống kê câu hỏi và topicMastery
      question.attemptCount = Number(question.attemptCount || 0) + 1;
      if (isCorrect) {
        question.correctCount = Number(question.correctCount || 0) + 1;
      }
      question.empiricalDifficulty = Number(
        (1 - question.correctCount / question.attemptCount).toFixed(3)
      );

      const tpKey = question.topic || question.chapterId;
      let tm = (state.topicMastery || []).find(
        (m: any) =>
          m.userId === userId && m.topic === tpKey && Number(m.grade) === Number(question.grade)
      );
      if (!tm) {
        tm = {
          id: `tm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          userId,
          grade: Number(question.grade),
          chapterId: question.chapterId,
          topic: tpKey,
          questionsDone: 0,
          questionsRight: 0,
          accuracyPercent: 0,
          masteryLevel: 'INSUFFICIENT_DATA',
        };
        state.topicMastery.push(tm);
      }
      tm.questionsDone += 1;
      if (isCorrect) tm.questionsRight += 1;
      tm.accuracyPercent = Math.round((tm.questionsRight / tm.questionsDone) * 100);
      tm.masteryLevel =
        tm.accuracyPercent < 60
          ? 'NEEDS_WORK'
          : tm.accuracyPercent < 80
          ? 'PROGRESSING'
          : 'MASTERED';

      // Nếu trả lời sai -> tự động đẩy vào sổ tay lỗi sai SM-2
      if (!isCorrect && (rawVal || rawWorkings)) {
        const nowIso = new Date().toISOString();
        const existingRev = (state.reviewQueue || []).find(
          (r: any) => r.userId === userId && r.questionId === question.id
        );
        if (existingRev) {
          existingRev.wrongAttempts = Number(existingRev.wrongAttempts || 1) + 1;
          existingRev.lastWrongAnswer = rawVal || rawWorkings;
          existingRev.errorType = errorCategory || 'CALCULATION_ERROR';
          existingRev.resolved = false;
          existingRev.repetitions = 0;
          existingRev.intervalDays = 1;
          existingRev.nextReviewAt = nowIso;
        } else {
          state.reviewQueue.unshift({
            id: `REV_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            userId,
            questionId: question.id,
            wrongAttempts: 1,
            lastWrongAnswer: rawVal || rawWorkings,
            errorType: errorCategory || 'CALCULATION_ERROR',
            resolved: false,
            easeFactor: 2.5,
            intervalDays: 1,
            repetitions: 0,
            nextReviewAt: nowIso,
            addedAt: nowIso.slice(0, 16).replace('T', ' '),
          });
        }
      } else if (isCorrect) {
        auth.user.xp = Number(auth.user.xp || 0) + 10;
        auth.user.level = Math.max(1, Math.floor(auth.user.xp / 200) + 1);
      }

      invalidateDashboardCache(userId, isCorrect);
      await writeServerStateAsync(state);
      return NextResponse.json({
        ok: true,
        isCorrect,
        matchedReason,
        errorCategory,
        partialInfo,
        correctAnswer: question.correctAnswer,
        solution: question.solution,
        commonMistake: question.commonMistake,
        topicMastery: tm,
      });
    }

    // 2. Tạo Đề Thích Ứng "Luyện điểm yếu" (Adaptive Exam - Mục 4.1.4)
    if (action === 'create_adaptive_exam') {
      const grade = Number(body.grade || auth.user.currentGrade || 8);
      const questionCount = Math.max(3, Math.min(15, Number(body.questionCount || 5)));

      // Phân tích các chương có tỷ lệ đúng < 60% của học sinh
      const userMastery = (state.topicMastery || []).filter(
        (m: any) => m.userId === userId && Number(m.grade) === grade
      );
      const weakChapters = Array.from(
        new Set(
          userMastery
            .filter((m: any) => Number(m.accuracyPercent ?? 100) < 60 && m.chapterId)
            .map((m: any) => String(m.chapterId))
        )
      );

      // Phân tích mức độ nhận thức học sinh hay làm sai nhất từ reviewQueue
      const userWrongQuestions = (state.reviewQueue || [])
        .filter((r: any) => r.userId === userId && !r.resolved)
        .map((r: any) => (state.questions || []).find((q: any) => q.id === r.questionId))
        .filter((q: any) => q && Number(q.grade) === grade);

      const wrongLevelCounts: Record<string, number> = {
        nhan_biet: 0,
        thong_hieu: 0,
        van_dung: 0,
        van_dung_cao: 0,
      };
      for (const wq of userWrongQuestions) {
        const lv = resolveQuestionCognitiveLevel(wq);
        wrongLevelCounts[lv] += 1;
        if (wq.chapterId && !weakChapters.includes(wq.chapterId)) {
          weakChapters.push(wq.chapterId);
        }
      }

      // Tăng tỷ trọng cho mức nhận thức học sinh đang yếu
      const adaptiveRatios = {
        nhan_biet: 20 + wrongLevelCounts.nhan_biet * 15,
        thong_hieu: 40 + wrongLevelCounts.thong_hieu * 15,
        van_dung: 30 + wrongLevelCounts.van_dung * 15,
        van_dung_cao: 10 + wrongLevelCounts.van_dung_cao * 10,
      };

      const userAttempts = (state.attempts || []).filter((a: any) => a.userId === userId);

      // Thử tạo đề ưu tiên các chương yếu trước; nếu các chương yếu chưa đủ câu verified thì mở rộng sang toàn khối
      let adaptiveResult = generateExamFromPool(
        {
          userId,
          grade,
          textbook: auth.user.preferredBook || 'KNTT',
          category: 'TONG_HOP',
          semester: 0,
          chapterIds: weakChapters,
          customMatrix: adaptiveRatios,
          format: body.format || 'combined',
          questionCount,
          durationMinutes: Math.max(20, questionCount * 6),
          allowBorrowAdjacent: true,
          customTitle:
            weakChapters.length > 0
              ? `Đề Thích Ứng Luyện Điểm Yếu Toán ${grade} (${weakChapters.join(', ')})`
              : `Đề Thích Ứng Cá Nhân Hóa Toán ${grade}`,
        },
        state.questions || [],
        state.exams || [],
        userAttempts
      );

      if (!adaptiveResult.ok && weakChapters.length > 0) {
        adaptiveResult = generateExamFromPool(
          {
            userId,
            grade,
            textbook: auth.user.preferredBook || 'KNTT',
            category: 'TONG_HOP',
            semester: 0,
            customMatrix: adaptiveRatios,
            format: body.format || 'combined',
            questionCount,
            durationMinutes: Math.max(20, questionCount * 6),
            allowBorrowAdjacent: true,
            customTitle: `Đề Thích Ứng Luyện Điểm Yếu Toán ${grade}`,
          },
          state.questions || [],
          state.exams || [],
          userAttempts
        );
      }

      if (!adaptiveResult.ok) {
        return NextResponse.json(adaptiveResult, { status: 422 });
      }

      state.exams.unshift(adaptiveResult);
      invalidateExamPoolCache();
      invalidateDashboardCache(userId);
      await writeServerStateAsync(state);

      return NextResponse.json({
        ok: true,
        exam: adaptiveResult,
        targetedWeakChapters: weakChapters,
        adaptiveRatios,
      });
    }

    return NextResponse.json({ ok: false, error: 'Hành động không hợp lệ.' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Đã xảy ra lỗi khi xử lý yêu cầu luyện tập.' },
      { status: 500 }
    );
  }
}
