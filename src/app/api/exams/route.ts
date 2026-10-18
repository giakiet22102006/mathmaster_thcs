import { NextRequest, NextResponse } from 'next/server';
import { readServerState, writeServerState } from '@/lib/prisma';
import { generateExamFromPool } from '@/lib/math-grader';

export async function GET(req: NextRequest) {
  const state = readServerState();
  const grade = req.nextUrl.searchParams.get('grade');
  let exams = state?.exams || [];
  if (grade && grade !== 'ALL') {
    exams = exams.filter((e: any) => String(e.grade) === String(grade));
  }
  return NextResponse.json({ ok: true, exams });
}

export async function POST(req: NextRequest) {
  try {
    const config = await req.json();
    const state = readServerState();
    const newExam = generateExamFromPool(config, state.questions || [], state.exams || []);
    state.exams.unshift(newExam);
    writeServerState(state);
    return NextResponse.json({ ok: true, exam: newExam });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
