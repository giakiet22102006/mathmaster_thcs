// ==============================================================================
// MathMaster THCS - API Quản Lý & Tạo Đề Thi (/api/exams)
// Bắt buộc đăng nhập, lấy userId từ session, không tin userId từ body
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getPerfDiagnostics,
  getQuestionByIdMap,
  invalidateDashboardCache,
  invalidateExamPoolCache,
  requireUser,
  sanitizeQuestionForInProgressExam,
  writeServerStateAsync,
} from '@/lib/prisma';
import { generateExamFromPool } from '@/lib/math-grader';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const tRoute0 = performance.now();
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const requestedOwner = req.nextUrl.searchParams.get('userId');
    if (
      requestedOwner &&
      requestedOwner !== auth.user.id &&
      auth.user.role !== 'ADMIN' &&
      auth.user.role !== 'TEACHER'
    ) {
      return NextResponse.json(
        { ok: false, error: 'Bạn không có quyền xem danh sách đề thi riêng của người dùng khác.' },
        { status: 403 }
      );
    }

    const grade = req.nextUrl.searchParams.get('grade');
    const examId = req.nextUrl.searchParams.get('id');
    const state = auth.state;

    // Lấy các đề thuộc về user hiện tại, đề mẫu, hoặc đề giao trong lớp
    const joinedClassIds = new Set(
      (state.classroomMembers || [])
        .filter((m: any) => m.studentId === auth.user.id)
        .map((m: any) => m.classroomId)
    );
    const assignedExamIds = new Set(
      (state.classroomAssignments || [])
        .filter((a: any) => joinedClassIds.has(a.classroomId))
        .map((a: any) => a.examId)
    );

    if (examId) {
      const targetExam = (state.exams || []).find((e: any) => e.id === examId);
      if (!targetExam) {
        return NextResponse.json({ ok: false, error: 'Không tìm thấy đề thi.' }, { status: 404 });
      }
      const canView =
        auth.user.role === 'ADMIN' ||
        auth.user.role === 'TEACHER' ||
        targetExam.userId === auth.user.id ||
        Boolean(targetExam.isSeed) ||
        assignedExamIds.has(targetExam.id);
      if (!canView) {
        return NextResponse.json(
          { ok: false, error: 'Bạn không có quyền truy cập đề thi riêng của người khác.' },
          { status: 403 }
        );
      }
      const qMap = getQuestionByIdMap(state);
      const mode = req.nextUrl.searchParams.get('mode');
      const examQuestions = (targetExam.questionIds || [])
        .map((qid: string) => {
          const q = qMap.get(qid);
          if (!q) return null;
          return mode === 'taking' ? sanitizeQuestionForInProgressExam(q) : q;
        })
        .filter(Boolean);
      return NextResponse.json({ ok: true, exam: targetExam, questions: examQuestions });
    }

    let exams = (state.exams || []).filter(
      (e: any) =>
        auth.user.role === 'ADMIN' ||
        auth.user.role === 'TEACHER' ||
        e.userId === auth.user.id ||
        Boolean(e.isSeed) ||
        assignedExamIds.has(e.id)
    );

    if (grade && grade !== 'ALL') {
      exams = exams.filter((e: any) => String(e.grade) === String(grade));
    }
    const limitParam = Number(req.nextUrl.searchParams.get('limit') || 0);
    if (limitParam > 0) {
      exams = exams.slice(0, limitParam);
    }
    const res = NextResponse.json({ ok: true, exams });
    const routeMs = Number((performance.now() - tRoute0).toFixed(2));
    if (process.env.PERF_LOG === '1') {
      const diag = getPerfDiagnostics();
      console.log(
        `[PERF_LOG] GET /api/exams routeMs=${routeMs}ms branch=${
          diag.lastRead?.branch || 'unknown'
        }`
      );
      res.headers.set(
        'X-Perf-Metrics',
        JSON.stringify({ route: '/api/exams', routeMs, read: diag.lastRead, totalDbQueries: diag.totalDbQueries })
      );
    }
    return res;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể tải danh sách đề thi.' },
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

    const config = await req.json();
    const state = auth.state;

    // Nếu là yêu cầu đổi trạng thái yêu thích đề thi
    if (config.action === 'toggle-favorite' && config.examId) {
      const ex = (state.exams || []).find((e: any) => e.id === config.examId);
      if (!ex) {
        return NextResponse.json({ ok: false, error: 'Không tìm thấy đề thi.' }, { status: 404 });
      }
      if (ex.userId !== auth.user.id && !ex.isSeed && auth.user.role !== 'ADMIN') {
        return NextResponse.json(
          { ok: false, error: 'Bạn không có quyền chỉnh sửa đề thi của người khác.' },
          { status: 403 }
        );
      }
      ex.isFavorite = !ex.isFavorite;
      await writeServerStateAsync(state);
      return NextResponse.json({ ok: true, exam: ex });
    }

    // Luôn lấy userId từ session xác thực, tuyệt đối không tin config.userId từ client
    // Chỉ cho phép TEACHER / ADMIN bật includeDraft trong chế độ xem trước
    const safeConfig = {
      ...config,
      userId: auth.user.id,
      includeDraft:
        Boolean(config.includeDraft || config.includeDrafts) &&
        (auth.user.role === 'TEACHER' || auth.user.role === 'ADMIN'),
    };

    const userAttempts = (state.attempts || []).filter((a: any) => a.userId === auth.user.id);
    const result: any = generateExamFromPool(
      safeConfig,
      state.questions || [],
      state.exams || [],
      userAttempts
    );

    // Nếu ngân hàng câu hỏi không đủ theo ma trận lọc cứng -> trả lỗi 422 có cấu trúc
    if (result && result.ok === false) {
      return NextResponse.json(result, { status: 422 });
    }

    const newExam = result.exam || result;

    // Chế độ xem trước (previewOnly) chỉ kiểm tra ma trận mà chưa lưu đề
    if (config.previewOnly) {
      return NextResponse.json({
        ok: true,
        preview: true,
        exam: newExam,
        composition: newExam.composition || null,
      });
    }

    state.exams.unshift(newExam);
    invalidateExamPoolCache();
    invalidateDashboardCache(auth.user.id);
    await writeServerStateAsync(state);
    return NextResponse.json({ ok: true, exam: newExam });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể tạo đề thi mới. Vui lòng kiểm tra lại cấu hình.' },
      { status: 500 }
    );
  }
}
