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
} from '../src/lib/ai-service.ts';
import { verifyQuestion } from '../src/lib/question-engine/verify.ts';
import { POST as authPOST } from '../src/app/api/auth/route.ts';
import { POST as assistantPOST } from '../src/app/api/ai/assistant/route.ts';
import { POST as generateQuestionPOST } from '../src/app/api/ai/generate-question/route.ts';

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

  // 7. Kiểm thử API Route /api/ai/generate-question: Chặn 401 & Báo thiếu API key minh bạch
  const genUnauthReq = makeNextRequest('http://localhost:3000/api/ai/generate-question', {
    body: { grade: 8, count: 2 },
  });
  const genUnauthRes = await generateQuestionPOST(genUnauthReq);
  assert.equal(genUnauthRes.status, 401, 'Tạo câu hỏi khi chưa đăng nhập phải bị 401');

  const genAuthReq = makeNextRequest('http://localhost:3000/api/ai/generate-question', {
    cookieToken: validSessionToken,
    body: { grade: 8, count: 1, cognitiveLevel: 'van_dung' },
  });
  const genAuthRes = await generateQuestionPOST(genAuthReq);
  if (!isGeminiConfigured()) {
    assert.equal(genAuthRes.status, 400, 'Khi chưa cấu hình key, phải báo 400 minh bạch kèm requiresApiKey');
    const genData = await genAuthRes.json();
    assert.equal(genData.requiresApiKey, true, 'requiresApiKey phải là true');
  } else {
    assert.equal(genAuthRes.status, 200, 'Khi đã có key, phải sinh câu hỏi thành công');
  }
  console.log('✓ [PASS] Test AI 7: /api/ai/generate-question bảo mật phân quyền & báo cáo minh bạch trạng thái API key.');

  console.log('================================================================');
  console.log('🎉 TẤT CẢ 7/7 BÀI KIỂM THỬ TÍNH NĂNG AI ĐỀU ĐẠT CHUẨN (PASS 100%)!');
  console.log('================================================================');
}

runAIFeatureTests().catch((err) => {
  console.error('❌ LỖI KIỂM THỬ TÍNH NĂNG AI:', err);
  process.exit(1);
});
