// ==============================================================================
// MathMaster THCS - API Quản Lý Lượt Làm Bài & Chấm Điểm (/api/attempts)
// Bảo vệ bằng requireUser, lấy userId từ session, chặn truy cập dữ liệu người khác (403)
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireUser, writeServerStateAsync } from '@/lib/prisma';
import { gradeExamAttempt } from '@/lib/math-grader';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    const requestedUserId = req.nextUrl.searchParams.get('userId');
    const attemptId = req.nextUrl.searchParams.get('id');

    // Chặn truy cập lượt làm bài của người khác
    if (
      requestedUserId &&
      requestedUserId !== auth.user.id &&
      auth.user.role !== 'ADMIN' &&
      auth.user.role !== 'TEACHER'
    ) {
      return NextResponse.json(
        { ok: false, error: 'Bạn không có quyền truy cập lịch sử làm bài của người khác.' },
        { status: 403 }
      );
    }

    if (attemptId) {
      const att = (state.attempts || []).find((a: any) => a.id === attemptId);
      if (!att) {
        return NextResponse.json(
          { ok: false, error: 'Không tìm thấy lượt làm bài.' },
          { status: 404 }
        );
      }
      if (
        att.userId !== auth.user.id &&
        auth.user.role !== 'ADMIN' &&
        auth.user.role !== 'TEACHER'
      ) {
        return NextResponse.json(
          { ok: false, error: 'Bạn không có quyền xem bài làm của người dùng khác.' },
          { status: 403 }
        );
      }
      const exam = (state.exams || []).find((e: any) => e.id === att.examId);
      const questions = exam
        ? (exam.questionIds || [])
            .map((qid: string) => (state.questions || []).find((q: any) => q.id === qid))
            .filter(Boolean)
        : [];
      return NextResponse.json({ ok: true, attempt: att, exam, questions });
    }

    const userAttempts = (state.attempts || []).filter((a: any) => a.userId === auth.user.id);
    return NextResponse.json({ ok: true, attempts: userAttempts });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể tải danh sách lượt làm bài.' },
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

    // Không cho phép truyền userId của người khác
    if (body.userId && body.userId !== userId && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { ok: false, error: 'Không được phép thao tác dưới danh nghĩa người dùng khác.' },
        { status: 403 }
      );
    }

    if (action === 'start') {
      const exam = (state.exams || []).find((e: any) => e.id === body.examId);
      if (!exam) {
        return NextResponse.json({ ok: false, error: 'Không tìm thấy đề thi.' }, { status: 404 });
      }

      // Kiểm tra xem người dùng đã có lượt làm bài IN_PROGRESS của đề này chưa
      if (!body.forceNew) {
        const existingInProg = (state.attempts || []).find(
          (a: any) => a.examId === exam.id && a.userId === userId && a.status === 'IN_PROGRESS'
        );
        if (existingInProg) {
          return NextResponse.json({ ok: true, attempt: existingInProg, resumed: true });
        }
      }

      const newAttempt = {
        id: 'ATT_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        examId: exam.id,
        userId,
        grade: exam.grade,
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        submittedAt: null,
        timeSpentSeconds: 0,
        remainingSeconds: (exam.durationMinutes || 45) * 60,
        totalScore: null,
        mcqScore: null,
        essayScore: null,
        correctCount: 0,
        wrongCount: 0,
        unansweredCount: (exam.questionIds || []).length,
        answers: {},
      };
      state.attempts.unshift(newAttempt);
      await writeServerStateAsync(state);
      return NextResponse.json({ ok: true, attempt: newAttempt });
    }

    if (action === 'autosave') {
      const att = (state.attempts || []).find((a: any) => a.id === body.attemptId);
      if (!att) {
        return NextResponse.json(
          { ok: false, error: 'Không tìm thấy lượt làm bài.' },
          { status: 404 }
        );
      }
      if (att.userId !== userId) {
        return NextResponse.json(
          { ok: false, error: 'Bạn không có quyền sửa bài làm của người khác.' },
          { status: 403 }
        );
      }
      att.answers = body.answers || att.answers;
      att.timeSpentSeconds = body.timeSpentSeconds ?? att.timeSpentSeconds;
      att.remainingSeconds = body.remainingSeconds ?? att.remainingSeconds;
      await writeServerStateAsync(state);
      return NextResponse.json({
        ok: true,
        attempt: att,
        savedAt: new Date().toISOString(),
      });
    }

    if (action === 'submit') {
      const att = (state.attempts || []).find((a: any) => a.id === body.attemptId);
      if (!att) {
        return NextResponse.json(
          { ok: false, error: 'Không tìm thấy lượt làm bài.' },
          { status: 404 }
        );
      }
      if (att.userId !== userId && auth.user.role !== 'ADMIN') {
        return NextResponse.json(
          { ok: false, error: 'Bạn không có quyền nộp bài của người dùng khác.' },
          { status: 403 }
        );
      }

      if (body.answers) att.answers = body.answers;
      if (body.timeSpentSeconds !== undefined) att.timeSpentSeconds = body.timeSpentSeconds;
      if (body.remainingSeconds !== undefined) att.remainingSeconds = body.remainingSeconds;

      const exam = (state.exams || []).find((e: any) => e.id === att.examId);
      if (!exam) {
        return NextResponse.json({ ok: false, error: 'Không tìm thấy đề thi gốc.' }, { status: 404 });
      }

      const graded = gradeExamAttempt(att, exam, state.questions || []);
      Object.assign(att, graded);

      // Cập nhật thống kê độ khó thực tế (empiricalDifficulty) cho từng câu hỏi và topic_mastery
      const nowIso = new Date().toISOString();
      for (const qId of exam.questionIds || []) {
        const q = (state.questions || []).find((item: any) => item.id === qId);
        if (!q) continue;
        const ansObj = att.answers?.[qId];
        const isCorrect = Boolean(ansObj?.isCorrect);

        q.attemptCount = Number(q.attemptCount || 0) + 1;
        if (isCorrect) {
          q.correctCount = Number(q.correctCount || 0) + 1;
        }
        q.empiricalDifficulty = Number((q.correctCount / q.attemptCount).toFixed(3));

        // Cập nhật topic_mastery của người dùng
        if (!Array.isArray(state.topicMastery)) state.topicMastery = [];
        const tpKey = q.topic || q.chapterId;
        let tm = state.topicMastery.find(
          (m: any) => m.userId === userId && m.topic === tpKey && Number(m.grade) === Number(q.grade)
        );
        if (!tm) {
          tm = {
            id: `tm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            userId,
            grade: Number(q.grade),
            chapterId: q.chapterId,
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
        if (tm.questionsDone < 2) tm.masteryLevel = 'INSUFFICIENT_DATA';
        else if (tm.accuracyPercent < 55) tm.masteryLevel = 'NEEDS_WORK';
        else if (tm.accuracyPercent < 80) tm.masteryLevel = 'PROGRESSING';
        else tm.masteryLevel = 'MASTERED';
      }

      // Đưa các câu làm sai vào reviewQueue kèm lịch nhắc lại SM-2
      for (const wItem of graded.wrongItems || []) {
        const existingRev = (state.reviewQueue || []).find(
          (r: any) => r.userId === userId && r.questionId === wItem.questionId
        );
        if (existingRev) {
          existingRev.wrongAttempts = Number(existingRev.wrongAttempts || 1) + 1;
          existingRev.lastWrongAnswer = wItem.wrongAnswer;
          existingRev.errorType = wItem.errorType || 'CALCULATION_ERROR';
          existingRev.resolved = false;
          existingRev.repetitions = 0;
          existingRev.intervalDays = 1;
          existingRev.easeFactor = Math.max(1.3, Number((existingRev.easeFactor || 2.5) - 0.2));
          existingRev.nextReviewAt = nowIso;
        } else {
          state.reviewQueue.unshift({
            id: `REV_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            userId,
            questionId: wItem.questionId,
            wrongAttempts: 1,
            lastWrongAnswer: wItem.wrongAnswer,
            errorType: wItem.errorType || 'CALCULATION_ERROR',
            resolved: false,
            easeFactor: 2.5,
            intervalDays: 1,
            repetitions: 0,
            nextReviewAt: nowIso,
            addedAt: nowIso.slice(0, 16).replace('T', ' '),
          });
        }
      }

      // Thưởng XP và ghi nhận phiên học tập (study_sessions)
      const earnedXp = Math.round(40 + Number(att.totalScore || 0) * 12);
      auth.user.xp = Number(auth.user.xp || 0) + earnedXp;
      auth.user.level = Math.max(1, Math.floor(auth.user.xp / 200) + 1);
      const todayStr = nowIso.slice(0, 10);
      if (auth.user.lastStudyDate !== todayStr) {
        auth.user.streakDays = Number(auth.user.streakDays || 0) + 1;
        auth.user.lastStudyDate = todayStr;
      }

      state.studySessions.unshift({
        id: `SES_${Date.now()}`,
        userId,
        grade: exam.grade,
        activity: `Hoàn thành ${exam.title}`,
        minutes: Math.max(1, Math.ceil((att.timeSpentSeconds || 60) / 60)),
        xp: earnedXp,
        date: todayStr,
      });

      await writeServerStateAsync(state);
      return NextResponse.json({ ok: true, attempt: att, earnedXp });
    }

    return NextResponse.json({ ok: false, error: 'Hành động không hợp lệ.' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Đã xảy ra lỗi khi xử lý lượt làm bài.' },
      { status: 500 }
    );
  }
}
