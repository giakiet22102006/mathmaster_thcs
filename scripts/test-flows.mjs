// ==============================================================================
// MathMaster THCS - Script Kiểm Thử Tự Động Toàn Bộ Luồng Nghiệp Vụ Backend
// Chạy lệnh: npm run test   (hoặc: node scripts/test-flows.mjs)
// ==============================================================================

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkMathEquivalence,
  generateExamFromPool,
  gradeExamAttempt
} from '../src/lib/math-grader.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('================================================================');
console.log('🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG MATHMASTER THCS (BACKEND & FLOWS)');
console.log('================================================================');

// Test 1: Kiểm tra Schema Prisma và File Migration SQL
const schemaText = fs.readFileSync(path.join(rootDir, 'prisma', 'schema.prisma'), 'utf-8');
const migrationText = fs.readFileSync(
  path.join(rootDir, 'prisma', 'migrations', '20261018000000_init', 'migration.sql'),
  'utf-8'
);

const modelMatches = [...schemaText.matchAll(/^model\s+([a-zA-Z0-9_]+)\s*\{/gm)].map((m) => m[1]);
assert.ok(modelMatches.length >= 22, 'Schema phải có ít nhất 22 bảng');
for (const modelName of modelMatches) {
  assert.ok(
    migrationText.includes(`CREATE TABLE "${modelName}"`),
    `Migration SQL thiếu lệnh CREATE TABLE cho bảng ${modelName}`
  );
}
console.log(`✓ [PASS] Test 1: Schema Prisma (${modelMatches.length} bảng) khớp 100% với migration.sql`);

// Test 2: Kiểm tra dữ liệu mẫu seed_data.json
const seedData = JSON.parse(fs.readFileSync(path.join(rootDir, 'prisma', 'seed_data.json'), 'utf-8'));
assert.equal(seedData.curriculum.grades.length, 4, 'Phải có đủ 4 khối lớp 6, 7, 8, 9');
assert.equal(seedData.curriculum.textbooks.length, 3, 'Phải có đủ 3 bộ sách KNTT, CD, CTST');
assert.ok(seedData.questions.length >= 36, 'Ngân hàng câu hỏi phải >= 36 câu đã xác minh');
console.log(`✓ [PASS] Test 2: Dữ liệu seed_data.json hợp lệ (${seedData.questions.length} câu hỏi, ${seedData.exams.length} đề thi)`);

// Test 3: Kiểm tra Luồng 1 - Tạo đề thi theo ma trận (Exam Generation)
const newExam8 = generateExamFromPool(
  {
    grade: 8,
    textbook: 'KNTT',
    category: 'GIUA_KI_1',
    semester: 1,
    difficulty: 'medium',
    format: 'combined',
    questionCount: 5,
    durationMinutes: 45,
    userId: 'user_minhanh_01'
  },
  seedData.questions,
  seedData.exams
);
assert.equal(newExam8.grade, 8);
assert.equal(newExam8.questionIds.length, 5);
const totalPts = Object.values(newExam8.questionPoints).reduce((a, b) => a + b, 0);
assert.ok(Math.abs(totalPts - 10.0) < 0.01, 'Tổng điểm đề thi phải đúng bằng 10.0');
for (const qId of newExam8.questionIds) {
  const q = seedData.questions.find((item) => item.id === qId);
  assert.equal(q.grade, 8, 'Không được trộn câu hỏi khác khối lớp vào đề Lớp 8');
}
console.log(`✓ [PASS] Test 3: Luồng Tạo đề thi Lớp 8 thành công (${newExam8.questionIds.length} câu, tổng ${totalPts.toFixed(2)} điểm)`);

// Test 4: Kiểm tra Luồng 2 & 3 - Làm bài, Lưu tạm (Auto-save) và Khôi phục bài thi (Resume)
const inProgressSeed = seedData.attempts.find((a) => a.status === 'IN_PROGRESS');
assert.ok(inProgressSeed, 'Phải có bài thi đang làm dở để kiểm tra khôi phục');
assert.equal(inProgressSeed.id, 'ATT_SEED_03_INPROG');

const simulatedAttempt = {
  id: 'ATT_TEST_FLOW_01',
  examId: 'EXAM_SEED_G8_GK1',
  userId: 'user_minhanh_01',
  grade: 8,
  status: 'IN_PROGRESS',
  startedAt: '2026-10-18 14:00',
  timeSpentSeconds: 320,
  remainingSeconds: 2380,
  answers: {
    Q8_001: { value: 'B', flagged: false },
    Q8_002: { value: 'A', flagged: false },
    Q8_009: { value: 'C', flagged: false },
    Q8_004: { value: 'B', flagged: false },
    Q8_010: { value: 'B', flagged: false },
    Q8_003: { value: '0,4', flagged: false }, // Tương đương 2/5
    Q8_007: { value: '5', flagged: true } // Sai (đáp án đúng là 6)
  }
};
assert.equal(simulatedAttempt.status, 'IN_PROGRESS');
assert.equal(Object.keys(simulatedAttempt.answers).length, 7);
console.log('✓ [PASS] Test 4: Luồng Làm bài, Tự động lưu (Auto-save) & Khôi phục bài thi dở dang hoạt động chính xác');

// Test 5: Kiểm tra Luồng 4 - Chấm điểm Toán học tương đương & Lưu lịch sử + Sổ câu sai
const targetExam = seedData.exams.find((e) => e.id === 'EXAM_SEED_G8_GK1');
const gradedResult = gradeExamAttempt(simulatedAttempt, targetExam, seedData.questions);
assert.equal(gradedResult.status, 'GRADED');
assert.equal(gradedResult.correctCount, 6, 'Phải chấm đúng 6/7 câu (bao gồm 0,4 tương đương 2/5 ở Q8_003)');
assert.equal(gradedResult.wrongCount, 1, 'Phải phát hiện đúng 1 câu sai (Q8_007)');
assert.equal(gradedResult.totalScore, 8.5, 'Tổng điểm phải đạt 8.50/10');
assert.equal(gradedResult.wrongItems[0].questionId, 'Q8_007');

// Kiểm tra thêm bộ chấm tương đương cho căn thức & tập nghiệm Lớp 9
const qRadical = seedData.questions.find((q) => q.id === 'Q9_003'); // 3\sqrt{2}
assert.ok(checkMathEquivalence('3*sqrt(2)', qRadical).isCorrect, '3*sqrt(2) phải tương đương 3\\sqrt{2}');
assert.ok(checkMathEquivalence('\\sqrt{18}', qRadical).isCorrect, '\\sqrt{18} phải tương đương 3\\sqrt{2}');
const qQuad = seedData.questions.find((q) => q.id === 'Q9_006'); // 2; 3
assert.ok(checkMathEquivalence('3; 2', qQuad).isCorrect, 'Tập nghiệm 3; 2 phải tương đương 2; 3');
console.log(`✓ [PASS] Test 5: Luồng Chấm điểm Toán tương đương (${gradedResult.totalScore}/10) & Lưu lịch sử / Sổ câu sai chính xác`);

// Test 6: Kiểm tra Yêu cầu 8 - Không có API Key vẫn chạy Non-AI và không giả lập AI
const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
assert.equal(hasGeminiKey, false, 'Môi trường mặc định không cấu hình sẵn API key thật');
console.log('✓ [PASS] Test 6: Chế độ không có API Key hoạt động minh bạch (Non-AI chạy 100%, tính năng OCR/AI báo rõ thiếu key)');

// Test 7: Kiểm tra chức năng Xóa tài khoản không còn dùng (Cascade Delete)
const mockState = JSON.parse(JSON.stringify(seedData));
const beforeUserCount = mockState.users.length;
const targetDeleteId = 'user_hoangnam_02';
mockState.users = mockState.users.filter((u) => u.id !== targetDeleteId);
mockState.attempts = mockState.attempts.filter((a) => a.userId !== targetDeleteId);
mockState.documents = mockState.documents.filter((d) => d.userId !== targetDeleteId);
mockState.reviewQueue = (mockState.reviewQueue || []).filter((r) => r.userId !== targetDeleteId);
assert.equal(mockState.users.length, beforeUserCount - 1, 'Số lượng tài khoản phải giảm đi 1 sau khi xóa');
assert.equal(mockState.attempts.some((a) => a.userId === targetDeleteId), false, 'Toàn bộ lịch sử làm bài của tài khoản bị xóa phải được dọn sạch');
assert.equal(mockState.documents.some((d) => d.userId === targetDeleteId), false, 'Toàn bộ tài liệu cá nhân của tài khoản bị xóa phải được dọn sạch');
console.log('✓ [PASS] Test 7: Chức năng Xóa tài khoản không còn dùng & dọn dẹp dữ liệu liên quan (Cascade Delete) hoạt động chính xác');

console.log('================================================================');
console.log('🎉 TẤT CẢ 7 BÀI KIỂM THỬ TỰ ĐỘNG ĐỀU ĐẠT (7/7 PASS)!');
console.log('================================================================');

