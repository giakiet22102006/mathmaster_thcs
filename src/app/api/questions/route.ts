// ==============================================================================
// MathMaster THCS - API Quản Trị Ngân Hàng Câu Hỏi, Công Thức & Câu Yêu Thích (/api/questions)
// Phân quyền: TEACHER / ADMIN được duyệt (draft -> verified), sửa, nhập/xuất JSON;
// STUDENT chỉ xem câu verified, tra cứu công thức và lưu câu hỏi yêu thích (403 nếu gọi quyền quản trị).
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  invalidateQuestionPoolCache,
  requireRole,
  requireUser,
  writeServerStateAsync,
} from '@/lib/prisma';
import { COGNITIVE_TO_DIFFICULTY, resolveQuestionCognitiveLevel } from '@/lib/math-grader';
import { generateQuestions, getAllTemplates } from '@/lib/question-engine';

export const dynamic = 'force-dynamic';

function computeEmpiricalStats(q: any) {
  const attemptCount = Number(q.attemptCount || 0);
  const correctCount = Number(q.correctCount || 0);
  const empiricalDifficulty =
    attemptCount > 0 ? Number((1 - correctCount / attemptCount).toFixed(3)) : null;

  const cog = resolveQuestionCognitiveLevel(q);
  let difficultyMismatchWarning = false;
  let mismatchReason: string | null = null;

  if (attemptCount >= 3 && empiricalDifficulty !== null) {
    if (cog === 'nhan_biet' && empiricalDifficulty > 0.65) {
      difficultyMismatchWarning = true;
      mismatchReason = `Gán mức Nhận biết nhưng tỷ lệ làm sai thực tế cao (${Math.round(
        empiricalDifficulty * 100
      )}%). Đề xuất nâng lên Thông hiểu / Vận dụng.`;
    } else if (cog === 'van_dung_cao' && empiricalDifficulty < 0.2) {
      difficultyMismatchWarning = true;
      mismatchReason = `Gán mức Vận dụng cao nhưng tỷ lệ làm sai chỉ ${Math.round(
        empiricalDifficulty * 100
      )}%. Đề xuất hạ xuống Thông hiểu / Vận dụng.`;
    }
  }

  return {
    attemptCount,
    correctCount,
    empiricalDifficulty,
    difficultyMismatchWarning,
    mismatchReason,
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    const mode = req.nextUrl.searchParams.get('mode') || 'questions';
    const grade = req.nextUrl.searchParams.get('grade');
    const semester = req.nextUrl.searchParams.get('semester');
    const chapterId = req.nextUrl.searchParams.get('chapterId');
    const cognitiveLevel = req.nextUrl.searchParams.get('cognitiveLevel');
    const qType = req.nextUrl.searchParams.get('type');
    const statusFilter = req.nextUrl.searchParams.get('verificationStatus') || 'ALL';
    const search = (req.nextUrl.searchParams.get('search') || '').trim().toLowerCase();
    const mismatchOnly = req.nextUrl.searchParams.get('mismatchOnly') === 'true';

    // 1. Chế độ tra cứu nhanh Công thức Toán THCS
    if (mode === 'formulas') {
      let formulas = [...(state.formulas || [])];
      if (grade && grade !== 'ALL') {
        formulas = formulas.filter((f: any) => String(f.grade) === String(grade));
      }
      if (chapterId && chapterId !== 'ALL') {
        formulas = formulas.filter((f: any) => f.chapterId === chapterId);
      }
      if (search) {
        formulas = formulas.filter(
          (f: any) =>
            String(f.title || '').toLowerCase().includes(search) ||
            String(f.formula || '').toLowerCase().includes(search) ||
            String(f.note || '').toLowerCase().includes(search)
        );
      }
      return NextResponse.json({ ok: true, formulas });
    }

    // 2. Chế độ xem danh sách câu hỏi đã đánh dấu Yêu thích của người dùng
    if (mode === 'favorites') {
      const favIds = new Set<string>(auth.user.favoriteQuestionIds || []);
      const favoriteQuestions = (state.questions || []).filter((q: any) => favIds.has(q.id));
      return NextResponse.json({
        ok: true,
        favoriteQuestionIds: [...favIds],
        questions: favoriteQuestions,
      });
    }

    // 3. Thống kê ngân hàng template tham số hóa (Question Engine)
    if (mode === 'templates') {
      const templates = getAllTemplates();
      return NextResponse.json({
        ok: true,
        totalTemplates: templates.length,
        templates: templates.map((t) => ({
          id: t.id,
          grade: t.grade,
          semester: t.semester,
          chapterId: t.chapterId,
          lesson: t.lesson,
          topic: t.topic,
          difficulty: t.difficulty,
          cognitiveLevel: t.cognitiveLevel,
          type: t.type,
          books: t.books,
        })),
      });
    }

    const isTeacherOrAdmin = auth.user.role === 'TEACHER' || auth.user.role === 'ADMIN';

    // Học sinh gọi trực tiếp danh sách quản trị câu hỏi nhạy cảm (draft) sẽ bị từ chối 403
    if (!isTeacherOrAdmin && statusFilter === 'draft') {
      return NextResponse.json(
        { ok: false, error: 'Chỉ Giáo viên hoặc Quản trị viên mới được xem câu hỏi bản nháp (draft).' },
        { status: 403 }
      );
    }

    let list = (state.questions || []).map((q: any) => {
      const emp = computeEmpiricalStats(q);
      return {
        ...q,
        ...emp,
      };
    });

    if (!isTeacherOrAdmin) {
      list = list.filter((q: any) => q.verificationStatus === 'verified');
    } else if (statusFilter !== 'ALL') {
      list = list.filter((q: any) => q.verificationStatus === statusFilter);
    }

    if (grade && grade !== 'ALL') {
      list = list.filter((q: any) => String(q.grade) === String(grade));
    }
    if (semester && semester !== 'ALL') {
      list = list.filter((q: any) => String(q.semester) === String(semester));
    }
    if (chapterId && chapterId !== 'ALL') {
      list = list.filter((q: any) => q.chapterId === chapterId);
    }
    if (cognitiveLevel && cognitiveLevel !== 'ALL') {
      list = list.filter((q: any) => resolveQuestionCognitiveLevel(q) === cognitiveLevel);
    }
    if (qType && qType !== 'ALL') {
      list = list.filter((q: any) => q.type === qType);
    }
    if (mismatchOnly) {
      list = list.filter((q: any) => q.difficultyMismatchWarning);
    }
    if (search) {
      list = list.filter(
        (q: any) =>
          String(q.id || '').toLowerCase().includes(search) ||
          String(q.code || '').toLowerCase().includes(search) ||
          String(q.content || '').toLowerCase().includes(search) ||
          String(q.topic || '').toLowerCase().includes(search)
      );
    }

    const allQs = state.questions || [];
    const summary = {
      totalAll: allQs.length,
      verifiedCount: allQs.filter((q: any) => q.verificationStatus === 'verified').length,
      draftCount: allQs.filter((q: any) => q.verificationStatus === 'draft').length,
      filteredCount: list.length,
    };

    return NextResponse.json({
      ok: true,
      summary,
      questions: list,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Không thể tải ngân hàng câu hỏi.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body || {};

    // 1. Lưu / Bỏ lưu câu hỏi yêu thích (Cho phép mọi user đã đăng nhập)
    if (action === 'toggle_favorite') {
      const auth = await requireUser(req);
      if (!auth.ok) {
        return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
      }
      const qId = String(body.questionId || '').trim();
      if (!qId) {
        return NextResponse.json({ ok: false, error: 'Thiếu mã câu hỏi.' }, { status: 400 });
      }
      if (!Array.isArray(auth.user.favoriteQuestionIds)) {
        auth.user.favoriteQuestionIds = [];
      }
      const idx = auth.user.favoriteQuestionIds.indexOf(qId);
      let isFavorite = false;
      if (idx >= 0) {
        auth.user.favoriteQuestionIds.splice(idx, 1);
        isFavorite = false;
      } else {
        auth.user.favoriteQuestionIds.push(qId);
        isFavorite = true;
      }
      await writeServerStateAsync(auth.state);
      return NextResponse.json({
        ok: true,
        questionId: qId,
        isFavorite,
        favoriteQuestionIds: auth.user.favoriteQuestionIds,
      });
    }

    // Mọi thao tác quản trị ngân hàng câu hỏi dưới đây bắt buộc quyền TEACHER hoặc ADMIN
    const auth = await requireRole(req, ['TEACHER', 'ADMIN']);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;

    // 2. Duyệt câu hỏi từ draft -> verified (hỗ trợ duyệt 1 câu hoặc duyệt hàng loạt)
    if (action === 'approve' || action === 'set_status') {
      const targetStatus = body.verificationStatus === 'draft' ? 'draft' : 'verified';
      const idsToUpdate: string[] = Array.isArray(body.questionIds)
        ? body.questionIds
        : body.questionId
        ? [String(body.questionId)]
        : [];

      if (idsToUpdate.length === 0) {
        return NextResponse.json(
          { ok: false, error: 'Vui lòng chọn ít nhất một câu hỏi để duyệt.' },
          { status: 400 }
        );
      }

      const idSet = new Set(idsToUpdate);
      const updatedQuestions: any[] = [];
      for (const q of state.questions || []) {
        if (idSet.has(q.id)) {
          q.verificationStatus = targetStatus;
          q.verifiedBy = auth.user.id;
          q.verifiedAt = new Date().toISOString();
          updatedQuestions.push(q);
        }
      }

      if (updatedQuestions.length === 0) {
        return NextResponse.json(
          { ok: false, error: 'Không tìm thấy câu hỏi cần duyệt.' },
          { status: 404 }
        );
      }

      invalidateQuestionPoolCache();
      await writeServerStateAsync(state);
      return NextResponse.json({
        ok: true,
        updatedCount: updatedQuestions.length,
        verificationStatus: targetStatus,
        questions: updatedQuestions,
      });
    }

    // 3. Chỉnh sửa nội dung, đáp án, rubricSteps, mức độ nhận thức của câu hỏi
    if (action === 'update') {
      const q = (state.questions || []).find((item: any) => item.id === body.questionId);
      if (!q) {
        return NextResponse.json(
          { ok: false, error: 'Không tìm thấy câu hỏi để chỉnh sửa.' },
          { status: 404 }
        );
      }

      if (body.content !== undefined) q.content = String(body.content).trim();
      if (body.solution !== undefined) q.solution = String(body.solution).trim();
      if (body.correctAnswer !== undefined) q.correctAnswer = String(body.correctAnswer).trim();
      if (Array.isArray(body.acceptedAnswers)) q.acceptedAnswers = body.acceptedAnswers;
      if (Array.isArray(body.options)) q.options = body.options;
      if (Array.isArray(body.rubricSteps)) q.rubricSteps = body.rubricSteps;
      if (body.keyFormula !== undefined) q.keyFormula = String(body.keyFormula).trim();
      if (body.commonMistake !== undefined) q.commonMistake = String(body.commonMistake).trim();
      if (body.cognitiveLevel) {
        const cog = resolveQuestionCognitiveLevel({ cognitiveLevel: body.cognitiveLevel });
        q.cognitiveLevel = cog;
        q.difficulty = COGNITIVE_TO_DIFFICULTY[cog];
      }
      if (body.verificationStatus === 'verified' || body.verificationStatus === 'draft') {
        q.verificationStatus = body.verificationStatus;
      }
      q.version = Number(q.version || 1) + 1;

      invalidateQuestionPoolCache();
      await writeServerStateAsync(state);
      return NextResponse.json({ ok: true, question: q });
    }

    // 4. Nhập hàng loạt câu hỏi từ JSON (mặc định gán verificationStatus = "draft")
    if (action === 'import_json') {
      const incoming = Array.isArray(body.questions) ? body.questions : [];
      if (incoming.length === 0) {
        return NextResponse.json(
          { ok: false, error: 'Danh sách câu hỏi nhập vào đang trống.' },
          { status: 400 }
        );
      }

      const existingIds = new Set((state.questions || []).map((q: any) => q.id));
      let importedCount = 0;

      for (const item of incoming) {
        if (!item.content || !item.correctAnswer) continue;
        const newId =
          item.id && !existingIds.has(item.id)
            ? item.id
            : `Q${item.grade || 8}_IMP_${Date.now()}_${importedCount}`;
        const cog = resolveQuestionCognitiveLevel(item);
        state.questions.push({
          ...item,
          id: newId,
          cognitiveLevel: cog,
          difficulty: COGNITIVE_TO_DIFFICULTY[cog],
          verificationStatus: 'draft', // Bắt buộc ở trạng thái draft khi mới nhập
          version: 1,
        });
        existingIds.add(newId);
        importedCount += 1;
      }

      invalidateQuestionPoolCache();
      await writeServerStateAsync(state);
      return NextResponse.json({ ok: true, importedCount });
    }

    // 5. Sinh câu hỏi tham số hóa tự động qua Parametric Question Engine
    if (action === 'generate_parametric') {
      const grade = Number(body.grade || 8);
      const count = Math.max(1, Math.min(50, Number(body.count || 5)));
      const textbook = body.textbook || 'ALL';
      const chapterId = body.chapterId && body.chapterId !== 'ALL' ? body.chapterId : undefined;
      const difficulty = body.difficulty && body.difficulty !== 'ALL' ? body.difficulty : undefined;
      const cognitiveLevel = body.cognitiveLevel && body.cognitiveLevel !== 'ALL' ? body.cognitiveLevel : undefined;
      const type = body.type || 'ALL';
      const saveToBank = body.saveToBank !== false;

      const existingFingerprints = new Set<string>();
      (state.questions || []).forEach((q: any) => {
        if (q.fingerprint) existingFingerprints.add(q.fingerprint);
      });

      const genResult = generateQuestions({
        grade,
        textbook,
        chapterIds: chapterId ? [chapterId] : undefined,
        difficulty,
        cognitiveLevel,
        type,
        count,
        excludeFingerprints: existingFingerprints,
      });

      if (saveToBank && genResult.questions.length > 0) {
        if (!Array.isArray(state.questions)) state.questions = [];
        const existingIds = new Set(state.questions.map((q: any) => q.id));
        for (const q of genResult.questions) {
          if (!existingIds.has(q.id)) {
            state.questions.push(q);
            existingIds.add(q.id);
          }
        }
        invalidateQuestionPoolCache();
        await writeServerStateAsync(state);
      }

      return NextResponse.json({
        ok: true,
        generatedCount: genResult.questions.length,
        stats: genResult.stats,
        questions: genResult.questions,
      });
    }

    return NextResponse.json({ ok: false, error: 'Hành động không hợp lệ.' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Đã xảy ra lỗi khi xử lý ngân hàng câu hỏi.' },
      { status: 500 }
    );
  }
}
