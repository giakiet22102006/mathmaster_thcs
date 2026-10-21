// ==============================================================================
// MathMaster THCS - Test Suite Toàn Diện Cho Parametric Question Engine
// File: scripts/test-question-engine.mjs
// Kiểm thử: 4 Khối (6-9) x 3 Bộ Sách (KNTT, CD, CTST) x 3 Độ Khó, Thẩm định độc lập,
// Kiểm tra chống 422 INSUFFICIENT_QUESTIONS cho mọi ma trận đề.
// ==============================================================================

import assert from 'node:assert';
import {
  generateQuestions,
  getAllTemplates,
  getTemplates,
  verifyQuestion,
  computeFingerprint,
  Mulberry32,
  createRNG,
} from '../src/lib/question-engine/index.ts';
import { generateExamFromPool } from '../src/lib/math-grader.ts';

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

console.log(`${BOLD}${CYAN}=== KIỂM THỬ PARAMETRIC QUESTION ENGINE & CHỐNG THIẾU HỤT ĐỀ THI ===${RESET}\n`);

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ${GREEN}✓${RESET} ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ${RED}✗ ${name}${RESET}`);
    console.error(`    ${RED}${err.message || err}${RESET}`);
    throw err;
  }
}

// ----------------------------------------------------------------------------
// TEST 1: KIỂM TRA ĐỘ PHỦ TEMPLATE TOÀN HỆ THỐNG
// ----------------------------------------------------------------------------
runTest('Độ phủ Template: Tổng số >= 240 và phủ đủ 4 Khối lớp 6, 7, 8, 9', () => {
  const allTemplates = getAllTemplates();
  assert(allTemplates.length >= 240, `Cần >= 240 templates, hiện có ${allTemplates.length}`);

  const byGrade = { 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const t of allTemplates) {
    assert([6, 7, 8, 9].includes(t.grade), `Khối lớp không hợp lệ: ${t.grade}`);
    byGrade[t.grade]++;
  }

  assert(byGrade[6] >= 60, `Lớp 6 cần >= 60 templates, có ${byGrade[6]}`);
  assert(byGrade[7] >= 60, `Lớp 7 cần >= 60 templates, có ${byGrade[7]}`);
  assert(byGrade[8] >= 50, `Lớp 8 cần >= 50 templates, có ${byGrade[8]}`);
  assert(byGrade[9] >= 60, `Lớp 9 cần >= 60 templates, có ${byGrade[9]}`);
});

runTest('Độ phủ Chương: Đủ tất cả các chương G6_C1..G6_C6, G7_C1..G7_C6, G8_C1..G8_C5, G9_C1..G9_C6', () => {
  const allTemplates = getAllTemplates();
  const requiredChapters = [
    'G6_C1', 'G6_C2', 'G6_C3', 'G6_C4', 'G6_C5', 'G6_C6',
    'G7_C1', 'G7_C2', 'G7_C3', 'G7_C4', 'G7_C5', 'G7_C6',
    'G8_C1', 'G8_C2', 'G8_C3', 'G8_C4', 'G8_C5',
    'G9_C1', 'G9_C2', 'G9_C3', 'G9_C4', 'G9_C5', 'G9_C6',
  ];

  for (const chId of requiredChapters) {
    const chTemplates = allTemplates.filter((t) => t.chapterId === chId);
    assert(
      chTemplates.length >= 8,
      `Chương ${chId} cần >= 8 templates, hiện có ${chTemplates.length}`
    );

    // Kiểm tra đủ cả 3 mức độ khó cho mỗi chương
    const easyCount = chTemplates.filter((t) => t.difficulty === 'easy').length;
    const medCount = chTemplates.filter((t) => t.difficulty === 'medium').length;
    const hardCount = chTemplates.filter((t) => t.difficulty === 'hard').length;
    assert(easyCount >= 2, `Chương ${chId} thiếu template easy (có ${easyCount})`);
    assert(medCount >= 2, `Chương ${chId} thiếu template medium (có ${medCount})`);
    assert(hardCount >= 2, `Chương ${chId} thiếu template hard (có ${hardCount})`);
  }
});

// ----------------------------------------------------------------------------
// TEST 2: KIỂM THỬ SINH CÂU HỎI THEO MA TRẬN KHỐI x BỘ SÁCH x ĐỘ KHÓ
// ----------------------------------------------------------------------------
runTest('Sinh câu hỏi: Thử nghiệm 4 khối x 3 bộ sách (KNTT, CD, CTST) đều thành công 100%', () => {
  const grades = [6, 7, 8, 9];
  const books = ['KNTT', 'CD', 'CTST'];

  for (const g of grades) {
    for (const b of books) {
      const result = generateQuestions({
        grade: g,
        textbook: b,
        count: 5,
        seed: 42,
      });

      assert.strictEqual(
        result.questions.length,
        5,
        `Khối ${g} bộ sách ${b} không sinh đủ 5 câu hỏi (được ${result.questions.length})`
      );

      // Thẩm định từng câu hỏi vừa sinh
      for (const q of result.questions) {
        assert(q.id && q.id.startsWith(`Q_GEN_G${g}_`), `Mã câu hỏi không đúng chuẩn: ${q.id}`);
        assert(q.content && q.content.length > 5, 'Nội dung câu hỏi quá ngắn');
        assert(q.correctAnswer, 'Thiếu đáp án đúng');
        assert(q.solution && q.solution.length > 5, 'Thiếu lời giải chi tiết');
        assert(q.verificationStatus === 'verified', 'Câu hỏi chưa được gán verified');

        const v = verifyQuestion(q);
        assert.strictEqual(v.valid, true, `Câu hỏi ${q.id} không vượt qua thẩm định: ${v.errors.join('; ')}`);
      }
    }
  }
});

// ----------------------------------------------------------------------------
// TEST 3: TÍNH TÁI LẬP (DETERMINISM) & CHỐNG TRÙNG LẶP (FINGERPRINT)
// ----------------------------------------------------------------------------
runTest('Tính tái lập: Cùng (grade, textbook, seed) cho ra kết quả câu hỏi 100% giống nhau', () => {
  const res1 = generateQuestions({ grade: 8, textbook: 'KNTT', count: 4, seed: 123456 });
  const res2 = generateQuestions({ grade: 8, textbook: 'KNTT', count: 4, seed: 123456 });

  assert.strictEqual(res1.questions.length, res2.questions.length);
  for (let i = 0; i < res1.questions.length; i++) {
    assert.strictEqual(
      res1.questions[i].content,
      res2.questions[i].content,
      `Câu hỏi tại vị trí ${i} không khớp nội dung khi cùng seed`
    );
    assert.strictEqual(
      res1.questions[i].correctAnswer,
      res2.questions[i].correctAnswer,
      `Đáp án tại vị trí ${i} không khớp khi cùng seed`
    );
  }
});

runTest('Chống trùng lặp: Seed khác nhau sinh câu hỏi đa dạng thông qua Fingerprint', () => {
  const resA = generateQuestions({ grade: 7, count: 10, seed: 111 });
  const fps = new Set(resA.questions.map((q) => q.fingerprint));
  assert.strictEqual(fps.size, resA.questions.length, 'Có câu hỏi bị trùng lặp fingerprint trong cùng batch');
});

// ----------------------------------------------------------------------------
// TEST 4: TÍCH HỢP TẠO ĐỀ THI TỰ ĐỘNG BÙ ĐẮP THIẾU HỤT (ZERO-422 GUARANTEE)
// ----------------------------------------------------------------------------
runTest('Tạo đề: Không bao giờ bị 422 INSUFFICIENT_QUESTIONS ngay cả với kho rỗng []', () => {
  const grades = [6, 7, 8, 9];
  const presets = ['co_ban', 'trung_binh', 'nang_cao', 'thi_vao_10'];
  const books = ['KNTT', 'CD', 'CTST'];

  for (const g of grades) {
    for (const b of books) {
      for (const preset of presets) {
        // Giả lập kho câu hỏi tĩnh hoàn toàn RỖNG []
        const emptyPool = [];

        const result = generateExamFromPool(
          {
            grade: g,
            textbook: b,
            difficulty: preset,
            format: 'combined',
            questionCount: 10,
            seed: 9999,
          },
          emptyPool
        );

        assert.strictEqual(
          result.ok,
          true,
          `Tạo đề thất bại cho Lớp ${g} (${b}, ${preset}): ${result.code || result.message}`
        );
        assert(Array.isArray(result.questionIds), 'Thiếu questionIds');
        assert.strictEqual(
          result.questionIds.length,
          10,
          `Đề không đủ 10 câu hỏi (có ${result.questionIds.length})`
        );
        assert(
          Array.isArray(result.generatedQuestions) && result.generatedQuestions.length > 0,
          'Thiếu generatedQuestions để API route lưu vào database'
        );
        assert.strictEqual(
          result.generatedQuestions.length,
          10,
          `Engine phải sinh đủ 10 câu bù đắp cho kho rỗng, nhưng chỉ sinh ${result.generatedQuestions.length}`
        );
      }
    }
  }
});

runTest('Tạo đề: Đề thi Khó (Hard/Very Hard) Lớp 9 luyện thi vào 10 thành công trọn vẹn', () => {
  const result = generateExamFromPool(
    {
      grade: 9,
      textbook: 'KNTT',
      category: 'TONG_HOP',
      difficulty: 'thi_vao_10',
      format: 'combined',
      questionCount: 15,
      seed: 8888,
    },
    [] // kho rỗng
  );

  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.questionIds.length, 15);
  assert(result.questions.every((q) => q.verificationStatus === 'verified'));
});

console.log(`\n${BOLD}${GREEN}=== KẾT QUẢ: TẤT CẢ ${passedTests}/${totalTests} TESTS ĐÃ VƯỢT QUA 100% ===${RESET}\n`);
