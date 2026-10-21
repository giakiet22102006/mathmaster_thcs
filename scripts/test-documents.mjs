// ==============================================================================
// MathMaster THCS - Bộ Kiểm Thử Bóc Tách Tài Liệu & Tạo Đề Từ File (PHẦN B)
// Chạy bằng: node scripts/test-documents.mjs (hoặc npm run test:documents)
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

import { extractTextFromDocument, detectMagicMime } from '../src/lib/documents/extract.ts';
import { segmentQuestionsFromText, normalizeMathUnicode } from '../src/lib/documents/segment.ts';
import { saveDocumentFile, readDocumentFile, deleteDocumentFile } from '../src/lib/documents/storage.ts';
import { generateExamFromPool } from '../src/lib/math-grader.ts';

const FIXTURES_DIR = path.join(process.cwd(), 'scripts', 'fixtures');

async function runAllDocumentTests() {
  console.log('==============================================================================');
  console.log('KIỂM THỬ PHẦN B: TRÍCH XUẤT TÀI LIỆU & TẠO ĐỀ TỪ FILE (B.6)');
  console.log('==============================================================================\n');

  let passed = 0;
  let failed = 0;

  function testCase(name, fn) {
    try {
      fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  async function asyncTestCase(name, fn) {
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: .txt đúng định dạng Câu N: -> bóc đúng số câu, đáp án, lời giải
  // --------------------------------------------------------------------------
  await asyncTestCase('1. .txt chuẩn: bóc đúng 3 câu, phương án, đáp án và lời giải', async () => {
    const raw = fs.readFileSync(path.join(FIXTURES_DIR, 'sample-standard.txt'));
    const extRes = await extractTextFromDocument('sample-standard.txt', raw);
    assert.equal(extRes.ok, true);
    assert.ok(extRes.text.length > 50);

    const segRes = segmentQuestionsFromText(extRes.text, { grade: 8, chapterId: 'G8_C1' });
    assert.equal(segRes.items.length, 3, `Phải bóc tách đúng 3 câu, nhận được ${segRes.items.length}`);
    assert.equal(segRes.items[0].correctAnswer, 'A');
    assert.equal(segRes.items[0].type, 'mcq');
    assert.equal(segRes.items[1].correctAnswer, 'B');
    assert.equal(segRes.items[1].type, 'mcq');
    assert.equal(segRes.items[2].correctAnswer, '3');
    assert.equal(segRes.items[2].type, 'essay');
    assert.ok(segRes.items[2].solution.includes('3'));
  });

  // --------------------------------------------------------------------------
  // TEST 2: .txt định dạng lệch (Bài 1., 2), inline A-D, bảng đáp án cuối)
  // --------------------------------------------------------------------------
  await asyncTestCase('2. .txt biến thể: nhận diện Bài 1, 2), inline options và bảng đáp án cuối', async () => {
    const raw = fs.readFileSync(path.join(FIXTURES_DIR, 'sample-varied.txt'));
    const extRes = await extractTextFromDocument('sample-varied.txt', raw);
    assert.equal(extRes.ok, true);

    const segRes = segmentQuestionsFromText(extRes.text, { grade: 8 });
    assert.equal(segRes.items.length, 2, `Phải bóc tách được 2 câu, nhận được ${segRes.items.length}`);
    assert.equal(segRes.items[0].correctAnswer, 'A', 'Câu 1 phải lấy đúng đáp án A từ bảng đáp án');
    assert.equal(segRes.items[1].correctAnswer, 'A', 'Câu 2 phải lấy đúng đáp án A từ bảng đáp án');
    assert.equal(segRes.items[0].type, 'mcq');
  });

  // --------------------------------------------------------------------------
  // TEST 3: .docx có cấu trúc -> trích xuất văn bản qua mammoth
  // --------------------------------------------------------------------------
  await asyncTestCase('3. .docx: trích xuất văn bản và bóc tách câu hỏi', async () => {
    const raw = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.docx'));
    const extRes = await extractTextFromDocument('sample.docx', raw);
    assert.equal(extRes.ok, true, `Lỗi đọc DOCX: ${extRes.errorMessage}`);
    assert.ok(extRes.text.includes('tam giác vuông'));

    const segRes = segmentQuestionsFromText(extRes.text, { grade: 8 });
    assert.ok(segRes.items.length >= 1);
    assert.equal(segRes.items[0].correctAnswer, '5cm');
  });

  // --------------------------------------------------------------------------
  // TEST 4: .xlsx trích xuất nội dung bảng tính
  // --------------------------------------------------------------------------
  await asyncTestCase('4. .xlsx: đọc sheet và trích xuất dòng ô bảng tính', async () => {
    const raw = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.xlsx'));
    const extRes = await extractTextFromDocument('sample.xlsx', raw);
    assert.equal(extRes.ok, true);
    assert.ok(extRes.text.includes('Câu 1'));
  });

  // --------------------------------------------------------------------------
  // TEST 5: .pdf có lớp chữ -> trích xuất qua unpdf
  // --------------------------------------------------------------------------
  await asyncTestCase('5. .pdf: trích xuất text layer và bóc tách câu hỏi', async () => {
    const raw = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.pdf'));
    const extRes = await extractTextFromDocument('sample.pdf', raw);
    assert.equal(extRes.ok, true);
    assert.ok(extRes.text.includes('Cau 1'));

    const segRes = segmentQuestionsFromText(extRes.text, { grade: 8 });
    assert.equal(segRes.items.length, 1);
    assert.equal(segRes.items[0].correctAnswer, '3x');
  });

  // --------------------------------------------------------------------------
  // TEST 6: Ảnh raster (PNG) khi không có GEMINI_API_KEY -> requiresApiKey: true, KHÔNG có câu giả
  // --------------------------------------------------------------------------
  await asyncTestCase('6. PNG không có API key: trả requiresApiKey và KHÔNG sinh câu giả', async () => {
    const oldKey = process.env.GEMINI_API_KEY;
    const oldMathpix = process.env.MATHPIX_APP_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.MATHPIX_APP_KEY;

    try {
      const raw = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.png'));
      const extRes = await extractTextFromDocument('sample.png', raw);
      assert.equal(extRes.ok, false);
      assert.equal(extRes.requiresApiKey, true);
      assert.equal(extRes.text, '');

      // Đảm bảo không bóc tách được câu giả nào
      const segRes = segmentQuestionsFromText(extRes.text);
      assert.equal(segRes.items.length, 0);
    } finally {
      if (oldKey) process.env.GEMINI_API_KEY = oldKey;
      if (oldMathpix) process.env.MATHPIX_APP_KEY = oldMathpix;
    }
  });

  // --------------------------------------------------------------------------
  // TEST 7: File không nhận dạng được câu hỏi -> parseWarnings, 0 câu giả, KHÔNG có đáp án '1'
  // --------------------------------------------------------------------------
  await asyncTestCase('7. File không cấu trúc câu: 0 câu giả, parseWarnings rõ ràng, không đáp án "1"', async () => {
    const raw = fs.readFileSync(path.join(FIXTURES_DIR, 'sample-unstructured.txt'));
    const extRes = await extractTextFromDocument('sample-unstructured.txt', raw);
    assert.equal(extRes.ok, true);

    const segRes = segmentQuestionsFromText(extRes.text);
    assert.equal(segRes.items.length, 0, 'Tuyệt đối không được tạo câu giả khi văn bản không có câu hỏi!');
    assert.ok(segRes.warnings.length > 0, 'Phải có cảnh báo parseWarnings cho người dùng');
    // Đảm bảo không có câu nào có đáp án '1'
    assert.ok(!segRes.items.some((it) => it.correctAnswer === '1'));
  });

  // --------------------------------------------------------------------------
  // TEST 8: Chuẩn hóa KaTeX và Unicode ký hiệu toán học
  // --------------------------------------------------------------------------
  testCase('8. Chuẩn hóa ký hiệu toán học Unicode sang LaTeX', () => {
    const raw = 'Tính x² + y³ - √16 ≤ 0 và a × b ÷ c ± d với góc 60°';
    const normalized = normalizeMathUnicode(raw);
    assert.ok(normalized.includes('x^2'));
    assert.ok(normalized.includes('y^3'));
    assert.ok(normalized.includes('\\sqrt'));
    assert.ok(normalized.includes('\\le'));
    assert.ok(normalized.includes('\\times'));
    assert.ok(normalized.includes('\\div'));
    assert.ok(normalized.includes('^\\circ'));
  });

  // --------------------------------------------------------------------------
  // TEST 9: Tạo đề B-2 (DOCS_SIMILAR) từ file: sinh câu mới cùng chương, đạt sàn độ khó PHẦN A
  // --------------------------------------------------------------------------
  testCase('9. Tạo đề B-2 (DOCS_SIMILAR): sinh câu hỏi mới cùng chương, đạt sàn độ khó PHẦN A', () => {
    const fakeAllQuestions = [
      {
        id: 'DOC_Q_1',
        sourceDocId: 'DOC_TEST_01',
        grade: 8,
        chapterId: 'G8_C1',
        type: 'mcq',
        cognitiveLevel: 'thong_hieu',
        verificationStatus: 'verified',
      },
    ];

    const examRes = generateExamFromPool(
      {
        grade: 8,
        textbook: 'KNTT',
        semester: 1,
        questionCount: 6,
        difficulty: 'trung_binh',
        format: 'combined',
        sourceMode: 'DOCS_SIMILAR',
        documentIds: ['DOC_TEST_01'],
      },
      fakeAllQuestions
    );

    assert.equal(examRes.ok, true, `Tạo đề B-2 thất bại: ${examRes.message}`);
    assert.equal(examRes.questions.length, 6);
    assert.equal(examRes.sourceMode, 'DOCS_SIMILAR');
    assert.ok(examRes.composition.bySource.generated > 0);
    // Tất cả câu hỏi phải thuộc chương G8_C1 hoặc lớp 8
    examRes.questions.forEach((q) => {
      assert.equal(Number(q.grade), 8);
      assert.ok(q.chapterId === 'G8_C1' || q.chapterId.startsWith('G8_'));
    });
  });

  // --------------------------------------------------------------------------
  // TEST 10: Tạo đề B-1 (DOCS_REUSE) thiếu câu -> trả INSUFFICIENT_QUESTIONS, KHÔNG lấp bừa ngân hàng
  // --------------------------------------------------------------------------
  testCase('10. Tạo đề B-1 (DOCS_REUSE) thiếu câu: trả INSUFFICIENT_QUESTIONS, không tự ý lấp ngân hàng', () => {
    // Chỉ có 1 câu từ tài liệu, nhưng yêu cầu đề 5 câu
    const fakeQuestions = [
      {
        id: 'DOC_Q_ONLY',
        sourceDocId: 'DOC_TEST_SHORT',
        grade: 8,
        chapterId: 'G8_C1',
        type: 'mcq',
        cognitiveLevel: 'nhan_biet',
        verificationStatus: 'verified',
        userId: 'test_user',
      },
      // Câu ngân hàng chuẩn (không có sourceDocId)
      {
        id: 'BANK_Q_1',
        grade: 8,
        chapterId: 'G8_C1',
        type: 'mcq',
        cognitiveLevel: 'thong_hieu',
        verificationStatus: 'verified',
      },
    ];

    const examRes = generateExamFromPool(
      {
        grade: 8,
        textbook: 'KNTT',
        semester: 1,
        questionCount: 5,
        difficulty: 'trung_binh',
        format: 'mcq',
        sourceMode: 'DOCS_REUSE',
        documentIds: ['DOC_TEST_SHORT'],
        userId: 'test_user',
      },
      fakeQuestions
    );

    assert.equal(examRes.ok, false, 'Khi thiếu câu trong DOCS_REUSE, phải trả ok=false!');
    assert.equal(examRes.code, 'INSUFFICIENT_QUESTIONS');
    assert.ok(examRes.suggestions.some((s) => s.includes('Tài liệu đã chọn chỉ có')));
  });

  // --------------------------------------------------------------------------
  // TEST 11: Storage Driver: lưu, đọc, xóa tệp với in-memory driver (an toàn trên Vercel read-only)
  // --------------------------------------------------------------------------
  await asyncTestCase('11. Storage Driver: lưu trữ và đọc dữ liệu ổn định', async () => {
    const testContent = Buffer.from('Nội dung đề thi mẫu toán 8');
    const saveRes = await saveDocumentFile('test_storage.txt', testContent, 'text/plain');
    assert.ok(saveRes.storagePath);

    const readBuf = await readDocumentFile(saveRes.storagePath);
    assert.ok(readBuf);
    assert.equal(readBuf.toString('utf-8'), 'Nội dung đề thi mẫu toán 8');

    const delRes = await deleteDocumentFile(saveRes.storagePath);
    assert.equal(delRes, true);
  });

  console.log('\n==============================================================================');
  console.log(`KẾT QUẢ KIỂM THỬ: ${passed} PASS, ${failed} FAIL`);
  console.log('==============================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllDocumentTests().catch((err) => {
  console.error('Lỗi ngoại lệ khi chạy test:', err);
  process.exit(1);
});
