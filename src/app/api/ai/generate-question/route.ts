// ==============================================================================
// MathMaster THCS - API Sinh Câu Hỏi & Tạo Đề Bằng AI (/api/ai/generate-question)
// - Bảo vệ bằng requireUser; Thẩm định qua verifyQuestion;
// - Rate Limiting per User (Lưu vào Database): Tối đa 5 đề/ngày, giãn cách tối thiểu 1 phút.
// - Tận dụng Cache Database: Bốc ngẫu nhiên câu hỏi cũ khi trùng chủ đề, tiết kiệm token.
// - SDK: @google/genai, Model: gemini-3.8-flash (Tự động fallback gemini-3.5-flash-lite).
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  requireUser,
  writeServerStateAsync,
  invalidateExamPoolCache,
  invalidateDashboardCache,
} from '@/lib/prisma';
import {
  generateQuestionsWithAI,
  isGeminiConfigured,
  buildAiCacheKey,
} from '@/lib/ai-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_DAILY_AI_EXAMS = 5;
const MIN_AI_INTERVAL_MS = 60 * 1000; // 1 phút giữa 2 lần tạo đề

/**
 * Trợ giúp lấy và làm mới thông tin hạn mức tạo đề AI của người dùng trong ngày
 */
function getUserAiQuota(user: any) {
  const today = new Date().toISOString().slice(0, 10);
  let usedToday = Number(user.dailyAiGenerationCount) || 0;
  if (user.lastAiGenerationDate !== today) {
    usedToday = 0;
  }
  const lastAt = Number(user.lastAiGeneratedAt) || 0;
  const elapsed = Date.now() - lastAt;
  const cooldownSeconds = elapsed < MIN_AI_INTERVAL_MS ? Math.ceil((MIN_AI_INTERVAL_MS - elapsed) / 1000) : 0;

  return {
    today,
    usedToday,
    maxDaily: MAX_DAILY_AI_EXAMS,
    remaining: Math.max(0, MAX_DAILY_AI_EXAMS - usedToday),
    cooldownSeconds,
  };
}

/**
 * GET: Lấy thông tin hạn mức tạo đề AI của người dùng hiện tại
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const stateUser = (auth.state.users || []).find((u: any) => u.id === auth.user.id) || auth.user;
    const quota = getUserAiQuota(stateUser);

    return NextResponse.json({
      ok: true,
      quota,
      isConfigured: isGeminiConfigured(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Lỗi kiểm tra hạn mức AI.' },
      { status: 500 }
    );
  }
}

/**
 * POST: Tạo câu hỏi hoặc sinh đề thi trọn gói bằng AI (có Rate Limit & Cache Database)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const state = auth.state;
    if (!Array.isArray(state.users)) state.users = [];
    if (!Array.isArray(state.questions)) state.questions = [];
    if (!Array.isArray(state.exams)) state.exams = [];
    if (!Array.isArray(state.aiExamCache)) state.aiExamCache = [];

    // Tìm record user chính xác trong state để cập nhật và lưu database
    let dbUser = state.users.find((u: any) => u.id === auth.user.id);
    if (!dbUser) {
      dbUser = { ...auth.user };
      state.users.push(dbUser);
    }

    const quota = getUserAiQuota(dbUser);

    const body = await req.json().catch(() => ({}));
    const grade = Number(body.grade) || 8;
    const textbook = body.textbook || 'KNTT';
    const semester = Number(body.semester) === 2 ? 2 : Number(body.semester) === 0 ? 0 : 1;
    const cognitiveLevel = body.cognitiveLevel || 'thong_hieu';
    const type = body.type || 'mcq';
    const count = Math.min(Math.max(Number(body.count) || 5, 1), 50);
    const chapterId = body.chapterId || `G${grade}_C1`;
    const topic = String(body.topic || 'Toán học THCS').trim();
    const customPrompt = body.customPrompt ? String(body.customPrompt).trim() : undefined;
    const referenceContext = body.referenceContext ? String(body.referenceContext).trim() : undefined;
    const createFullExam = Boolean(body.createFullExam);
    const durationMinutes = Number(body.durationMinutes) || 45;
    const saveToBank = body.saveToBank !== false; // Mặc định lưu vào ngân hàng

    // ============================================================================
    // BƯỚC 1: KIỂM TRA CACHE DATABASE (TẬN DỤNG CÂU HỎI & ĐỀ CŨ TRÙNG TIÊU CHÍ)
    // ============================================================================
    const cacheKey = buildAiCacheKey({
      grade,
      textbook,
      semester,
      chapterId,
      topic,
      cognitiveLevel,
      type,
      customPrompt,
    });

    // Tìm kiếm các câu hỏi đã được sinh bằng AI trước đó khớp với chủ đề/key này
    const cachedMatchingQuestions = state.questions.filter((q: any) => {
      if (Number(q.grade) !== grade) return false;
      if (q.type !== type && type !== 'ALL') return false;

      // Khớp trực tiếp cacheKey
      if (q.aiCacheKey === cacheKey) return true;

      // Hoặc khớp chủ đề tương đồng từ nguồn AI
      const isFromAI = String(q.source || '').includes('AI') || String(q.problemType || '').startsWith('AI');
      if (!isFromAI) return false;

      if (customPrompt) {
        const normP = customPrompt.toLowerCase();
        const qContent = String(q.content || '').toLowerCase();
        const qTopic = String(q.topic || '').toLowerCase();
        if (normP.split(/\s+/).some((w) => w.length > 3 && (qContent.includes(w) || qTopic.includes(w)))) {
          return true;
        }
      } else if (q.chapterId === chapterId && q.cognitiveLevel === cognitiveLevel) {
        return true;
      }

      return false;
    });

    // Lọc khử trùng lặp nội dung trước khi lấy từ cache
    const uniqueCachedQuestions: any[] = [];
    const seenCacheContents = new Set<string>();
    for (const q of cachedMatchingQuestions) {
      const cNorm = (q.content || '').toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9\u00C0-\u024F\u1EA0-\u1EF9]/gi, '').trim();
      if (!cNorm || !seenCacheContents.has(cNorm)) {
        if (cNorm) seenCacheContents.add(cNorm);
        uniqueCachedQuestions.push(q);
      }
    }

    // Nếu trong Database đã có đủ số câu hỏi AI phù hợp -> BỐC TRỰC TIẾP TỪ CACHE (Tiết kiệm token & không trừ hạn mức)
    if (uniqueCachedQuestions.length >= count) {
      // Xáo trộn ngẫu nhiên để học sinh không bị lặp lại thứ tự câu
      const shuffled = [...uniqueCachedQuestions].sort(() => 0.5 - Math.random());
      const selectedFromCache = shuffled.slice(0, count);

      let createdExam: any = null;
      if (createFullExam) {
        const examId = `exam_ai_cache_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const examTitle = customPrompt
          ? `Đề AI (Tối ưu Cache): ${customPrompt.slice(0, 45)}`
          : `Đề Kiểm Tra AI Toán ${grade} (${topic})`;

        createdExam = {
          id: examId,
          code: `EXAM_AI_CACHE_${Date.now() % 100000}`,
          title: examTitle,
          description: `Đề thi tổng hợp từ kho câu hỏi AI đã thẩm định chuẩn GDPT 2018 (Chủ đề: ${topic}).`,
          grade,
          textbook,
          semester: semester || 1,
          category: semester === 2 ? 'GIUA_KI_2' : 'GIUA_KI_1',
          format: type === 'mcq' ? 'mcq' : 'essay',
          durationMinutes,
          maxScore: 10.0,
          userId: auth.user.id,
          sourceMode: 'AI_CACHE',
          isFavorite: false,
          isSeed: false,
          questionIds: selectedFromCache.map((q: any) => q.id),
          questions: selectedFromCache,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        state.exams.unshift(createdExam);
        invalidateExamPoolCache();
        invalidateDashboardCache(auth.user.id);
        await writeServerStateAsync(state);
      }

      return NextResponse.json({
        ok: true,
        servedFromCache: true,
        requiresApiKey: false,
        questions: selectedFromCache,
        exam: createdExam,
        count: selectedFromCache.length,
        message:
          '⚡ Đã lấy câu hỏi từ Database (Chủ đề trùng khớp đã được AI biên soạn trước đó). Không trừ hạn mức tạo đề hôm nay của bạn!',
        quota,
      });
    }

    // ============================================================================
    // BƯỚC 2: KIỂM TRA RATE LIMITING TRƯỚC KHI GỌI GEMINI API
    // ============================================================================
    // 2.1: Giãn cách tối thiểu giữa 2 lần bấm tạo đề (1 phút)
    if (quota.cooldownSeconds > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Thao tác quá nhanh! Vui lòng đợi ${quota.cooldownSeconds} giây trước khi bấm tạo đề tiếp theo bằng AI.`,
          quota,
        },
        { status: 429 }
      );
    }

    // 2.2: Giới hạn tối đa 5 đề/ngày cho mỗi tài khoản
    if (quota.usedToday >= quota.maxDaily) {
      return NextResponse.json(
        {
          ok: false,
          error: `Bạn đã sử dụng hết hạn mức ${quota.maxDaily}/${quota.maxDaily} đề thi AI của ngày hôm nay. Hạn mức sẽ được làm mới tự động vào ngày mai (00:00). Bạn vẫn có thể luyện tập đề từ Ngân hàng chuẩn hoặc File tài liệu không giới hạn!`,
          quota,
        },
        { status: 429 }
      );
    }

    // 2.3: Kiểm tra cấu hình API key
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          requiresApiKey: true,
          message:
            '⚠️ Chưa cấu hình GEMINI_API_KEY trong file .env. Vui lòng cấu hình API key để sinh câu hỏi mới.',
          quota,
        },
        { status: 400 }
      );
    }

    // ============================================================================
    // BƯỚC 3: GỌI GEMINI API & THẨM ĐỊNH TOÁN HỌC
    // ============================================================================
    // Sinh câu hỏi trực tiếp từ Gemini (tối đa 5 câu trực tiếp để phản hồi siêu tốc dưới 5-6s)
    const aiGenCount = Math.min(count, 5);
    const result = await generateQuestionsWithAI({
      grade,
      textbook,
      semester: semester === 0 ? 1 : (semester as 1 | 2),
      chapterId,
      topic,
      cognitiveLevel,
      type,
      count: aiGenCount,
      customPrompt,
      referenceContext,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error || 'Không thể sinh câu hỏi bằng AI.',
          warnings: result.warnings,
          quota,
        },
        { status: 422 }
      );
    }

    const generatedQuestions = result.questions || [];

    // Gắn nhãn cacheKey và userId vào các câu hỏi mới
    for (const q of generatedQuestions) {
      (q as any).userId = auth.user.id;
      (q as any).aiCacheKey = cacheKey;
      (q as any).customPrompt = customPrompt;
    }

    // Lưu vào kho câu hỏi của website
    if (saveToBank && generatedQuestions.length > 0) {
      const existingIds = new Set(state.questions.map((q: any) => q.id));
      for (const q of generatedQuestions) {
        if (!existingIds.has(q.id)) {
          state.questions.push(q);
          existingIds.add(q.id);
        }
      }

      // Lưu thông tin cache tra cứu
      state.aiExamCache.push({
        key: cacheKey,
        topic,
        customPrompt,
        questionIds: generatedQuestions.map((q: any) => q.id),
        createdAt: new Date().toISOString(),
      });
    }

    // ============================================================================
    // BƯỚC 4: CẬP NHẬT RATE LIMIT VÀO DATABASE CHO USER
    // ============================================================================
    dbUser.dailyAiGenerationCount = quota.usedToday + 1;
    dbUser.lastAiGeneratedAt = Date.now();
    dbUser.lastAiGenerationDate = quota.today;

    let createdExam: any = null;
    let allExamQuestions = [...generatedQuestions];

    if (createFullExam && allExamQuestions.length > 0) {
      // Nếu số câu yêu cầu lớn hơn số câu sinh trực tiếp (ví dụ yêu cầu 10, 15, 20 câu)
      // hệ thống bổ sung từ kho câu hỏi chuẩn cùng khối, cùng mức độ nhận thức
      if (allExamQuestions.length < count) {
        const remainingNeeded = count - allExamQuestions.length;
        const examContentSet = new Set(
          allExamQuestions
            .map((eq: any) =>
              (eq.content || '')
                .toLowerCase()
                .replace(/\s+/g, ' ')
                .replace(/[^a-z0-9\u00C0-\u024F\u1EA0-\u1EF9]/gi, '')
                .trim()
            )
            .filter(Boolean)
        );
        const examIdSet = new Set(allExamQuestions.map((eq: any) => eq.id));

        const existingPool = state.questions.filter((q: any) => {
          if (Number(q.grade) !== grade) return false;
          if (type !== 'ALL' && q.type !== type) return false;
          if (examIdSet.has(q.id)) return false;
          const cNorm = (q.content || '')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[^a-z0-9\u00C0-\u024F\u1EA0-\u1EF9]/gi, '')
            .trim();
          if (cNorm && examContentSet.has(cNorm)) return false;
          return true;
        });

        // Ưu tiên các câu cùng mức độ nhận thức và cùng chương
        const prioritized = [...existingPool].sort((a: any, b: any) => {
          const aScore = (a.cognitiveLevel === cognitiveLevel ? 3 : 0) + (a.chapterId === chapterId ? 1 : 0);
          const bScore = (b.cognitiveLevel === cognitiveLevel ? 3 : 0) + (b.chapterId === chapterId ? 1 : 0);
          return bScore - aScore;
        });

        const additionalQuestions: any[] = [];
        for (const q of prioritized) {
          if (additionalQuestions.length >= remainingNeeded) break;
          const cNorm = (q.content || '')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[^a-z0-9\u00C0-\u024F\u1EA0-\u1EF9]/gi, '')
            .trim();
          if (cNorm && examContentSet.has(cNorm)) continue;
          if (cNorm) examContentSet.add(cNorm);
          examIdSet.add(q.id);
          additionalQuestions.push(q);
        }
        allExamQuestions = [...allExamQuestions, ...additionalQuestions];
      }

      const examId = `exam_ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const examTitle = customPrompt
        ? `Đề AI: ${customPrompt.slice(0, 45)}`
        : `Đề Kiểm Tra AI Toán ${grade} (${topic})`;

      createdExam = {
        id: examId,
        code: `EXAM_AI_${Date.now() % 100000}`,
        title: examTitle,
        description: `Đề thi tổng hợp gồm các câu hỏi biên soạn tự động bởi AI Gemini chuẩn GDPT 2018 (Chủ đề: ${topic}).`,
        grade,
        textbook,
        semester: semester || 1,
        category: semester === 2 ? 'GIUA_KI_2' : 'GIUA_KI_1',
        format: type === 'mcq' ? 'mcq' : 'essay',
        durationMinutes,
        maxScore: 10.0,
        userId: auth.user.id,
        sourceMode: 'AI_GENERATED',
        isFavorite: false,
        isSeed: false,
        questionIds: allExamQuestions.map((q: any) => q.id),
        questions: allExamQuestions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.exams.unshift(createdExam);
    }

    invalidateExamPoolCache();
    invalidateDashboardCache(auth.user.id);
    await writeServerStateAsync(state);

    const updatedQuota = getUserAiQuota(dbUser);

    return NextResponse.json({
      ok: true,
      servedFromCache: false,
      requiresApiKey: false,
      questions: generatedQuestions,
      exam: createdExam,
      count: generatedQuestions.length,
      warnings: result.warnings,
      quota: updatedQuota,
      message: `🎉 Đã tạo thành công ${generatedQuestions.length} câu hỏi bằng AI Gemini! Hôm nay bạn còn ${updatedQuota.remaining} lượt tạo đề.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Lỗi xử lý tạo câu hỏi bằng AI.' },
      { status: 500 }
    );
  }
}
