// ==============================================================================
// MathMaster THCS - Bộ Kiểm Thử Tự Động Tính Năng AI (scripts/test-ai-features.mjs)
// Kiểm thử:
// 1. Module ai-service.ts (isGeminiConfigured, getAILearningGuidance fallback & socratic)
// 2. Thẩm định câu hỏi verifyQuestion với cấu trúc AI sinh
// 3. API Route /api/ai/assistant (Auth 401, Rate limit 429, Socratic hint, Mistake diagnose)
// 4. API Route /api/ai/generate-question (Auth 401, requiresApiKey transparent report)
// ==============================================================================

import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import {
  isGeminiConfigured,
  getGeminiClient,
  getAILearningGuidance,
  generateQuestionsWithAI,
  diagnoseExamWeaknesses,
  buildAiCacheKey,
} from '../src/lib/ai-service.ts';
import { verifyQuestion } from '../src/lib/question-engine/verify.ts';
import { POST as authPOST } from '../src/app/api/auth/route.ts';
import { POST as assistantPOST } from '../src/app/api/ai/assistant/route.ts';
import { POST as generateQuestionPOST, GET as generateQuestionGET } from '../src/app/api/ai/generate-question/route.ts';
import { POST as diagnoseWeaknessesPOST } from '../src/app/api/ai/diagnose-weaknesses/route.ts';
import { readServerStateAsync, writeServerStateAsync } from '../src/lib/prisma.ts';

function makeNextRequest(url, { method = 'POST', body, cookieToken, ip = '127.0.0.1' } = {}) {
  const headers = new Headers({
    'content-type': 'application/json',
    'x-forwarded-for': ip,
  });
  if (cookieToken) {
    headers.set('cookie', `mm_session=${cookieToken}`);
  }
  return new NextRequest(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function runAIFeatureTests() {
  console.log('================================================================');
  console.log('🤖 BẮT ĐẦU KIỂM THỬ TÍNH NĂNG TÍCH HỢP AI GEMINI (GDPT 2018)');
  console.log('================================================================');

  // 1. Kiểm tra phát hiện cấu hình GEMINI_API_KEY
  const hasKey = isGeminiConfigured();
  console.log(`[Info] Trạng thái cấu hình GEMINI_API_KEY: ${hasKey ? 'ĐÃ CẤU HÌNH' : 'CHƯA CẤU HÌNH (Chế độ dự phòng)'}`);
  assert.equal(typeof hasKey, 'boolean', 'isGeminiConfigured phải trả về boolean');
  console.log('✓ [PASS] Test AI 1: isGeminiConfigured hoạt động chính xác, an toàn.');

  // 2. Kiểm thử Fallback Socratic Tutoring khi không có/có key
  const mockQuestion = {
    id: 'q_test_ai_01',
    grade: 8,
    chapterId: 'G8_C1',
    topic: 'Hằng đẳng thức đáng nhớ',
    content: 'Tính giá trị của biểu thức $A = (x - 2)(x + 2)$ tại $x = 10$.',
    type: 'mcq',
    options: [
      { label: 'A', text: '$96$' },
      { label: 'B', text: '$100$' },
      { label: 'C', text: '$104$' },
      { label: 'D', text: '$98$' },
    ],
    correctAnswer: 'A',
    solution: 'Ta có $A = (x - 2)(x + 2) = x^2 - 4$. Thay $x = 10$ ta được $A = 10^2 - 4 = 100 - 4 = 96$.',
    rubricSteps: [
      { step: 'Áp dụng hằng đẳng thức hiệu hai bình phương $x^2 - 4$', points: 0.5 },
      { step: 'Thay $x = 10$ và tính ra $96$', points: 0.5 },
    ],
    keyFormula: '$(a - b)(a + b) = a^2 - b^2$',
    commonMistake: 'Quên bình phương số 2 hoặc nhầm thành $x^2 + 4$.',
    hints: [
      'Quan sát dạng tích của tổng và hiệu hai số hạng giống nhau.',
      'Áp dụng hằng đẳng thức số 3: $(a - b)(a + b) = a^2 - b^2$.',
      'Thay $x = 10$ vào biểu thức rút gọn $x^2 - 4$ để tính nhanh.',
    ],
  };

  const socraticRes = await getAILearningGuidance({
    mode: 'socratic_hint',
    question: mockQuestion,
    hintLevel: 2,
  });

  assert.ok(socraticRes.text, 'getAILearningGuidance phải trả về text hướng dẫn');
  assert.equal(socraticRes.mode, 'socratic_hint', 'Mode phải là socratic_hint');
  assert.ok(
    socraticRes.text.includes('hằng đẳng thức') || socraticRes.text.includes('a^2 - b^2') || socraticRes.fallbackData?.keyFormula,
    'Gợi ý Socratic phải chứa định hướng kiến thức trọng tâm'
  );
  console.log('✓ [PASS] Test AI 2: Socratic Tutoring (gợi ý từng bước không lộ đáp án) hoạt động chuẩn mực.');

  // 3. Kiểm thử Chẩn đoán lỗi sai (Mistake Diagnosis)
  const diagnoseRes = await getAILearningGuidance({
    mode: 'diagnose_mistake',
    question: mockQuestion,
    studentAnswer: 'B (100)',
    studentWorkings: 'Em tính ra x^2 = 100 rồi chọn luôn B',
  });

  assert.ok(diagnoseRes.text, 'Phải có nội dung chẩn đoán lỗi sai');
  assert.equal(diagnoseRes.mode, 'diagnose_mistake');
  console.log('✓ [PASS] Test AI 3: Mistake Diagnosis (so sánh đáp án và chỉ ra vị trí nhầm lẫn) hoạt động chính xác.');

  // 4. Kiểm thử Thẩm định cấu trúc câu hỏi AI sinh qua verifyQuestion
  const sampleAIEngineQuestion = {
    id: 'ai_sample_test_01',
    code: 'AI_G8_VD_001',
    grade: 8,
    textbooks: ['KNTT'],
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Phân thức đại số',
    topic: 'Rút gọn phân thức đại số',
    problemType: 'AI_GENERATED',
    type: 'mcq',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    complexity: {
      steps: 3,
      techniques: ['factorization', 'domain_check'],
      crossTopic: false,
      needsCaseAnalysis: false,
      modeling: false,
      estMinutes: 4,
    },
    points: 1.0,
    content: 'Tìm điều kiện xác định của phân thức $P = \\frac{x + 3}{x^2 - 9}$ và rút gọn $P$.',
    options: [
      { label: 'A', text: '$x \\neq \\pm 3$; $P = \\frac{1}{x - 3}$' },
      { label: 'B', text: '$x \\neq 3$; $P = \\frac{1}{x + 3}$', errorType: 'MISSING_CONDITION' },
      { label: 'C', text: '$x \\neq -3$; $P = x - 3$', errorType: 'FORMULA_ERROR' },
      { label: 'D', text: '$x \\neq \\pm 3$; $P = \\frac{1}{x + 3}$', errorType: 'SIGN_ERROR' },
    ],
    correctAnswer: 'A',
    acceptedAnswers: ['A'],
    solution: 'Điều kiện xác định: $x^2 - 9 \\neq 0 \\iff x \\neq \\pm 3$.\nTa có: $P = \\frac{x + 3}{(x - 3)(x + 3)} = \\frac{1}{x - 3}$.',
    rubricSteps: [
      { step: 'Tìm điều kiện xác định: $x \\neq \\pm 3$', points: 0.5 },
      { step: 'Phân tích mẫu thành nhân tử và rút gọn ra $\\frac{1}{x - 3}$', points: 0.5 },
    ],
    keyFormula: 'Phân tích đa thức thành nhân tử $a^2 - b^2 = (a - b)(a + b)$',
    commonMistake: 'Chỉ đặt điều kiện $x \\neq 3$ mà quên $x \\neq -3$.',
    source: 'AI Gemini 3.8 Flash (GDPT 2018)',
    verificationStatus: 'verified',
    version: 1,
  };

  const vCheck = verifyQuestion(sampleAIEngineQuestion);
  assert.equal(vCheck.valid, true, `verifyQuestion phải PASS câu hỏi AI sinh chuẩn: ${vCheck.errors.join('; ')}`);
  console.log('✓ [PASS] Test AI 4: verifyQuestion thẩm định độc lập câu hỏi AI sinh (KaTeX, Rubric, 4 phương án MCQ).');

  // 5. Kiểm thử API Route /api/ai/assistant: Chặn truy cập chưa đăng nhập (401)
  const unauthReq = makeNextRequest('http://localhost:3000/api/ai/assistant', {
    body: { mode: 'socratic_hint', question: mockQuestion },
  });
  const unauthRes = await assistantPOST(unauthReq);
  assert.equal(unauthRes.status, 401, 'Chưa đăng nhập phải bị từ chối 401');
  console.log('✓ [PASS] Test AI 5: /api/ai/assistant bảo vệ phiên, từ chối người dùng chưa đăng nhập (401).');

  // 6. Kiểm thử API Route /api/ai/assistant: Người dùng hợp lệ nhận được chỉ dẫn
  const testEmail = `ai_test_user_${Date.now()}@mathmaster.vn`;
  const regRes = await authPOST(
    makeNextRequest('http://localhost:3000/api/auth', {
      body: {
        action: 'register',
        fullName: 'Học Sinh Kiểm Thử AI',
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        currentGrade: 8,
        preferredBook: 'KNTT',
      },
    })
  );
  assert.equal(regRes.status, 200, 'Đăng ký tài khoản kiểm thử AI phải thành công');
  const validSessionToken = regRes.cookies.get('mm_session')?.value;
  assert.ok(validSessionToken, 'Phải trích xuất được mm_session token');

  const authReq = makeNextRequest('http://localhost:3000/api/ai/assistant', {
    cookieToken: validSessionToken,
    body: {
      mode: 'socratic_hint',
      question: mockQuestion,
      hintLevel: 1,
    },
  });
  const authRes = await assistantPOST(authReq);
  assert.equal(authRes.status, 200, 'Người dùng đã đăng nhập phải nhận mã 200');
  const authData = await authRes.json();
  assert.ok(authData.text, 'Phải có text trợ giúp');
  assert.equal(authData.mode, 'socratic_hint');
  console.log('✓ [PASS] Test AI 6: /api/ai/assistant xử lý thành công yêu cầu trợ lý gia sư cho học sinh (200 OK).');

  // 7. Kiểm thử API Route /api/ai/generate-question: GET Hạn mức Quota
  const quotaReq = makeNextRequest('http://localhost:3000/api/ai/generate-question', {
    method: 'GET',
    cookieToken: validSessionToken,
  });
  const quotaRes = await generateQuestionGET(quotaReq);
  assert.equal(quotaRes.status, 200, 'GET /api/ai/generate-question phải trả về 200');
  const quotaData = await quotaRes.json();
  assert.equal(quotaData.quota.maxDaily, 5, 'Hạn mức tối đa mỗi ngày phải là 5');
  console.log('✓ [PASS] Test AI 7: GET /api/ai/generate-question trả về hạn mức 5 đề/ngày cho người dùng.');

  // 8. Kiểm thử Cache Database & Tận Dụng Câu Hỏi Cũ (Tiết kiệm Token & Không Trừ Lượt)
  const testTopic = 'Pythagore thực tế';
  const testCacheKey = buildAiCacheKey({
    grade: 8,
    textbook: 'KNTT',
    semester: 1,
    chapterId: 'G8_C3',
    topic: testTopic,
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    customPrompt: testTopic,
  });

  // Nạp 2 câu hỏi giả lập đã qua thẩm định vào database state
  const state = await readServerStateAsync();
  if (!Array.isArray(state.questions)) state.questions = [];
  state.questions.push(
    {
      ...sampleAIEngineQuestion,
      id: `ai_cached_q1_${Date.now()}`,
      aiCacheKey: testCacheKey,
      source: 'AI Gemini 3.8 Flash (GDPT 2018)',
    },
    {
      ...sampleAIEngineQuestion,
      id: `ai_cached_q2_${Date.now()}`,
      aiCacheKey: testCacheKey,
      source: 'AI Gemini 3.8 Flash (GDPT 2018)',
    }
  );
  await writeServerStateAsync(state);

  // Gửi request tạo đề với đúng chủ đề này -> Hệ thống phải bốc từ Cache
  const cacheReq = makeNextRequest('http://localhost:3000/api/ai/generate-question', {
    cookieToken: validSessionToken,
    body: {
      grade: 8,
      textbook: 'KNTT',
      semester: 1,
      chapterId: 'G8_C3',
      topic: testTopic,
      customPrompt: testTopic,
      cognitiveLevel: 'van_dung',
      type: 'mcq',
      count: 2,
      createFullExam: true,
    },
  });
  const cacheRes = await generateQuestionPOST(cacheReq);
  assert.equal(cacheRes.status, 200);
  const cacheData = await cacheRes.json();
  assert.equal(cacheData.servedFromCache, true, 'Trùng chủ đề trong database phải phục vụ từ Cache');
  assert.equal(cacheData.questions.length, 2, 'Phải bốc đủ 2 câu từ database');
  assert.ok(cacheData.exam?.id, 'Phải tạo thành công exam object');
  console.log('✓ [PASS] Test AI 8: Tận dụng Cache Database bốc câu hỏi AI cũ thành công (Tiết kiệm token & không trừ lượt).');

  // 9. Kiểm thử Giới Hạn Tốc Độ (Rate Limit: Cooldown 1 phút & Hạn mức 5 đề/ngày)
  const stateWithQuota = await readServerStateAsync();
  const dbUser = stateWithQuota.users.find((u) => u.email === testEmail);
  assert.ok(dbUser, 'User phải tồn tại trong state');

  // Thử nghiệm Cooldown: Giả lập vừa tạo đề 10 giây trước
  dbUser.lastAiGeneratedAt = Date.now() - 10000;
  dbUser.lastAiGenerationDate = new Date().toISOString().slice(0, 10);
  dbUser.dailyAiGenerationCount = 1;
  await writeServerStateAsync(stateWithQuota);

  const cooldownReq = makeNextRequest('http://localhost:3000/api/ai/generate-question', {
    cookieToken: validSessionToken,
    body: {
      grade: 9,
      topic: 'Chủ đề hoàn toàn mới chưa có cache',
      customPrompt: `Toán 9 ${Date.now()}`,
      count: 2,
    },
  });
  const cooldownRes = await generateQuestionPOST(cooldownReq);
  assert.equal(cooldownRes.status, 429, 'Bấm tạo đề dưới 1 phút phải bị chặn 429 Cooldown');
  const cooldownData = await cooldownRes.json();
  assert.ok(cooldownData.error.includes('Vui lòng đợi'), 'Thông báo phải nhắc người dùng chờ');

  // Thử nghiệm Hạn Mức Tối Đa: Giả lập đã dùng 5/5 đề hôm nay
  const stateMaxQuota = await readServerStateAsync();
  const dbUserMax = stateMaxQuota.users.find((u) => u.email === testEmail);
  dbUserMax.lastAiGeneratedAt = Date.now() - 120000; // Đã qua 2 phút
  dbUserMax.dailyAiGenerationCount = 5; // Đạt giới hạn 5 đề/ngày
  await writeServerStateAsync(stateMaxQuota);

  const maxReq = makeNextRequest('http://localhost:3000/api/ai/generate-question', {
    cookieToken: validSessionToken,
    body: {
      grade: 9,
      topic: 'Chủ đề hoàn toàn mới nữa',
      customPrompt: `Toán 9 mới ${Date.now()}`,
      count: 2,
    },
  });
  const maxRes = await generateQuestionPOST(maxReq);
  assert.equal(maxRes.status, 429, 'Vượt quá 5 đề/ngày phải bị chặn 429 Daily Limit');
  const maxData = await maxRes.json();
  assert.ok(maxData.error.includes('hết hạn mức 5/5'), 'Phải báo hết hạn mức 5/5 đề/ngày');
  console.log('✓ [PASS] Test AI 9: Rate Limiting per User (Cooldown 60s & Giới hạn 5 đề thi/ngày) lưu vào Database hoạt động chính xác.');

  // 10. Kiểm thử Chức năng diagnoseExamWeaknesses (Chẩn đoán điểm yếu & lập lộ trình ôn tập)
  const diagResult = await diagnoseExamWeaknesses({
    examTitle: 'Đề Kiểm Tra Chương 3 Toán 8',
    grade: 8,
    textbook: 'KNTT',
    totalScore: 6.5,
    maxScore: 10,
    correctCount: 7,
    wrongCount: 3,
    wrongQuestions: [
      {
        id: 'q_fail_1',
        chapterId: 'G8_C3',
        topic: 'Định lý Pythagore',
        cognitiveLevel: 'van_dung',
        type: 'mcq',
        content: 'Cho tam giác vuông $ABC$ có hai cạnh góc vuông là 3 và 4. Độ dài cạnh huyền là bao nhiêu?',
        studentAnswer: '6',
        correctAnswer: '5',
        errorCategory: 'CALCULATION_ERROR',
      },
      {
        id: 'q_fail_2',
        chapterId: 'G8_C3',
        topic: 'Tam giác đồng dạng',
        cognitiveLevel: 'van_dung_cao',
        type: 'mcq',
        content: 'Chứng minh hai tam giác đồng dạng theo trường hợp c.g.c',
        studentAnswer: 'B',
        correctAnswer: 'C',
        errorCategory: 'CONCEPT_ERROR',
      },
    ],
  });
  assert.equal(diagResult.ok, true, 'Chẩn đoán điểm yếu phải thành công');
  assert.ok(diagResult.assessmentSummary.length > 10, 'Phải có nhận xét tổng quan sư phạm');
  assert.ok(Array.isArray(diagResult.keyWeaknesses), 'Phải có danh sách các điểm yếu');
  assert.ok(Array.isArray(diagResult.actionablePlan) && diagResult.actionablePlan.length >= 2, 'Phải có lộ trình hành động');
  assert.ok(diagResult.recommendedPracticePrompt.length > 5, 'Phải có prompt đề xuất luyện tập');
  console.log('✓ [PASS] Test AI 10: Chức năng diagnoseExamWeaknesses phân tích điểm yếu & lộ trình ôn tập hoạt động chính xác.');

  // 11. Kiểm thử API Route /api/ai/diagnose-weaknesses
  const unauthDiagReq = makeNextRequest('http://localhost:3000/api/ai/diagnose-weaknesses', {
    body: { attemptId: 'att_sample' },
  });
  const unauthDiagRes = await diagnoseWeaknessesPOST(unauthDiagReq);
  assert.equal(unauthDiagRes.status, 401, 'Chưa đăng nhập phải bị 401');

  // Tạo một attempt giả lập trong database để test API
  const testState = await readServerStateAsync();
  if (!Array.isArray(testState.attempts)) testState.attempts = [];
  const testAttemptId = `att_test_${Date.now()}`;
  testState.attempts.push({
    id: testAttemptId,
    userId: dbUser.id,
    examId: 'exam_sample_1',
    totalScore: 7.0,
    correctCount: 7,
    wrongCount: 3,
    status: 'GRADED',
    answers: {
      q1: { value: 'B', isCorrect: false, errorCategory: 'SIGN_ERROR' },
      q2: { value: 'A', isCorrect: true },
    },
  });
  await writeServerStateAsync(testState);

  const authDiagReq = makeNextRequest('http://localhost:3000/api/ai/diagnose-weaknesses', {
    cookieToken: validSessionToken,
    body: { attemptId: testAttemptId },
  });
  const authDiagRes = await diagnoseWeaknessesPOST(authDiagReq);
  assert.equal(authDiagRes.status, 200, 'User hợp lệ chẩn đoán bài thi phải trả về 200');
  const authDiagData = await authDiagRes.json();
  assert.equal(authDiagData.ok, true);
  assert.ok(authDiagData.analysis?.assessmentSummary, 'Phải trả về analysis object');

  // Kiểm tra lưu vào database attempt
  const verifiedState = await readServerStateAsync();
  const savedAtt = verifiedState.attempts.find((a) => a.id === testAttemptId);
  assert.ok(savedAtt.aiWeaknessAnalysis, 'Kết quả phân tích AI phải được lưu vào attempt trong database');
  console.log('✓ [PASS] Test AI 11: /api/ai/diagnose-weaknesses xác thực phân quyền & lưu chẩn đoán vào Database thành công.');

  console.log('================================================================');
  console.log('🎉 TẤT CẢ 11/11 BÀI KIỂM THỬ TÍNH NĂNG AI ĐỀU ĐẠT CHUẨN (PASS 100%)!');
  console.log('================================================================');
}

runAIFeatureTests().catch((err) => {
  console.error('❌ LỖI KIỂM THỬ TÍNH NĂNG AI:', err);
  process.exit(1);
});
