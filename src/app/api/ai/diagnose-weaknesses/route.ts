// ==============================================================================
// MathMaster THCS - API Phân Tích Điểm Yếu Bài Thi & Lộ Trình Ôn Tập AI
// (/api/ai/diagnose-weaknesses)
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireUser, writeServerStateAsync } from '@/lib/prisma';
import {
  diagnoseExamWeaknesses,
  isGeminiConfigured,
  AIDiagnoseExamWeaknessesOptions,
} from '@/lib/ai-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    const body = await req.json().catch(() => ({}));
    const attemptId = String(body.attemptId || '');
    const examId = String(body.examId || '');

    if (!attemptId && !examId) {
      return NextResponse.json(
        { ok: false, error: 'Thiếu thông tin attemptId hoặc examId.' },
        { status: 400 }
      );
    }

    const attempts = Array.isArray(state.attempts) ? state.attempts : [];
    const exams = Array.isArray(state.exams) ? state.exams : [];
    const questions = Array.isArray(state.questions) ? state.questions : [];

    // Tìm attempt của người dùng
    const attempt = attempts.find(
      (a: any) =>
        (attemptId ? a.id === attemptId : a.examId === examId) &&
        (a.userId === auth.user.id || auth.user.role === 'ADMIN' || auth.user.role === 'TEACHER')
    );

    if (!attempt) {
      return NextResponse.json(
        { ok: false, error: 'Không tìm thấy lượt làm bài phù hợp.' },
        { status: 404 }
      );
    }

    const exam = exams.find((e: any) => e.id === attempt.examId) || {
      id: attempt.examId,
      title: 'Đề Kiểm Tra Toán THCS',
      grade: auth.user.currentGrade || 8,
      textbook: auth.user.preferredBook || 'KNTT',
      maxScore: 10,
    };

    // Nếu attempt đã được chẩn đoán trước đó và người dùng không yêu cầu refresh -> trả về cache ngay
    if (attempt.aiWeaknessAnalysis && !body.forceRefresh) {
      return NextResponse.json({
        ok: true,
        cached: true,
        analysis: attempt.aiWeaknessAnalysis,
        isConfigured: isGeminiConfigured(),
      });
    }

    // Thu thập danh sách các câu hỏi làm sai hoặc chưa đạt điểm trọn vẹn
    const answers = attempt.answers || {};
    const wrongQuestions: any[] = [];

    const examQuestionIds: string[] = Array.isArray(exam.questionIds)
      ? exam.questionIds
      : Object.keys(answers);

    for (const qId of examQuestionIds) {
      const ansRec = answers[qId] || {};
      const isCorrect = Boolean(ansRec.isCorrect);
      if (!isCorrect) {
        // Tìm thông tin chi tiết câu hỏi
        const qObj =
          questions.find((q: any) => q.id === qId) ||
          (Array.isArray(exam.questions) ? exam.questions.find((q: any) => q.id === qId) : null) || {
            id: qId,
            content: 'Nội dung câu hỏi',
            correctAnswer: 'A',
            topic: 'Toán học THCS',
            chapterId: 'Chương cơ bản',
            cognitiveLevel: 'thong_hieu',
            type: 'mcq',
          };

        wrongQuestions.push({
          id: qId,
          chapterId: qObj.chapterId || 'Cơ bản',
          topic: qObj.topic || qObj.lesson || 'Toán học',
          cognitiveLevel: qObj.cognitiveLevel || 'thong_hieu',
          type: qObj.type || 'mcq',
          content: qObj.content || '',
          studentAnswer: ansRec.value || ansRec.workings || '',
          correctAnswer: qObj.correctAnswer || '',
          errorCategory: ansRec.errorCategory || 'CALCULATION_ERROR',
          solution: qObj.solution || '',
        });
      }
    }

    const diagOptions: AIDiagnoseExamWeaknessesOptions = {
      examTitle: exam.title || 'Đề Kiểm Tra Toán THCS',
      grade: Number(exam.grade) || 8,
      textbook: exam.textbook || 'KNTT',
      totalScore: Number(attempt.totalScore || 0),
      maxScore: Number(exam.maxScore || 10),
      correctCount: Number(attempt.correctCount || 0),
      wrongCount: wrongQuestions.length,
      wrongQuestions,
    };

    const analysisResult = await diagnoseExamWeaknesses(diagOptions);

    if (analysisResult.ok) {
      // Lưu lại vào bản ghi attempt để tái sử dụng
      attempt.aiWeaknessAnalysis = {
        assessmentSummary: analysisResult.assessmentSummary,
        keyWeaknesses: analysisResult.keyWeaknesses,
        actionablePlan: analysisResult.actionablePlan,
        recommendedPracticePrompt: analysisResult.recommendedPracticePrompt,
        analyzedAt: new Date().toISOString(),
      };
      await writeServerStateAsync(state);
    }

    return NextResponse.json({
      ok: analysisResult.ok,
      analysis: attempt.aiWeaknessAnalysis || analysisResult,
      isConfigured: isGeminiConfigured(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Lỗi phân tích điểm yếu bài thi.' },
      { status: 500 }
    );
  }
}
