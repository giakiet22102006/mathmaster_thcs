import { NextRequest, NextResponse } from 'next/server';
import { readServerState, writeServerState } from '@/lib/prisma';
import { gradeExamAttempt } from '@/lib/math-grader';

export async function GET() {
  const state = readServerState();
  return NextResponse.json({ ok: true, attempts: state?.attempts || [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const state = readServerState();

    if (action === 'start') {
      const exam = state.exams.find((e: any) => e.id === body.examId);
      if (!exam) return NextResponse.json({ ok: false, error: 'Không tìm thấy đề thi' }, { status: 404 });
      const newAttempt = {
        id: 'ATT_' + Date.now(),
        examId: exam.id,
        userId: body.userId || state.currentUserId,
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
        unansweredCount: exam.questionIds.length,
        answers: {}
      };
      state.attempts.unshift(newAttempt);
      writeServerState(state);
      return NextResponse.json({ ok: true, attempt: newAttempt });
    }

    if (action === 'autosave') {
      const att = state.attempts.find((a: any) => a.id === body.attemptId);
      if (!att) return NextResponse.json({ ok: false, error: 'Không tìm thấy lượt làm bài' }, { status: 404 });
      att.answers = body.answers || att.answers;
      att.timeSpentSeconds = body.timeSpentSeconds ?? att.timeSpentSeconds;
      att.remainingSeconds = body.remainingSeconds ?? att.remainingSeconds;
      writeServerState(state);
      return NextResponse.json({ ok: true, attempt: att });
    }

    if (action === 'submit') {
      const att = state.attempts.find((a: any) => a.id === body.attemptId);
      if (!att) return NextResponse.json({ ok: false, error: 'Không tìm thấy lượt làm bài' }, { status: 404 });
      if (body.answers) att.answers = body.answers;
      const exam = state.exams.find((e: any) => e.id === att.examId);
      const graded = gradeExamAttempt(att, exam, state.questions || []);
      Object.assign(att, graded);
      writeServerState(state);
      return NextResponse.json({ ok: true, attempt: att });
    }

    return NextResponse.json({ ok: false, error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
