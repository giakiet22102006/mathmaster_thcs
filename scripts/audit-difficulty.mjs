// ==============================================================================
// MathMaster THCS - Kịch Bản Kiểm Định Độ Khó & Tính Không Suy Biến Của Template
// File: scripts/audit-difficulty.mjs
// Chạy: npm run audit:difficulty hoặc tsx scripts/audit-difficulty.mjs
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { ALL_TEMPLATES } from '../src/lib/question-engine/index.ts';
import { verifyQuestion } from '../src/lib/question-engine/verify.ts';
import { Mulberry32 } from '../src/lib/question-engine/rng.ts';
import {
  DIFFICULTY_FLOORS,
  validateComplexityFloor,
  computeDifficultyScore,
} from '../src/lib/question-engine/difficulty-standard.ts';
import { computeFingerprint } from '../src/lib/question-engine/index.ts';

const SEEDS_PER_TEMPLATE = 200;

console.log('========================================================================');
console.log('🔍 BẮT ĐẦU KIỂM TOÁN ĐỘ KHÓ & TÍNH KHÔNG SUY BIẾN CHO TOÀN BỘ TEMPLATE');
console.log(`• Tổng số template: ${ALL_TEMPLATES.length}`);
console.log(`• Số seed kiểm thử cho mỗi template: ${SEEDS_PER_TEMPLATE}`);
console.log('========================================================================\n');

const auditResults = [];
let totalFailures = 0;

for (const template of ALL_TEMPLATES) {
  let passCount = 0;
  const fingerprints = new Set();
  const correctAnswers = new Set();
  let totalSteps = 0;
  let totalScore = 0;
  const failureReasons = [];

  for (let s = 1; s <= SEEDS_PER_TEMPLATE; s++) {
    const rng = new Mulberry32(s * 10007 + 31);
    const book = template.books[s % template.books.length] || 'KNTT';

    try {
      const rawQ = template.generate(rng, book);
      const complexity = template.complexity || rawQ.complexity;
      const difficultyScore = computeDifficultyScore(template.cognitiveLevel, complexity);
      totalScore += difficultyScore;

      const q = {
        ...rawQ,
        id: `Q_AUDIT_${template.id}_${s}`,
        code: `AUDIT-${template.id}-${s}`,
        source: `Audit Engine (${book})`,
        verificationStatus: 'verified',
        version: 1,
        complexity,
        difficultyScore,
      };

      const fp = computeFingerprint(q.content, q.options);
      fingerprints.add(fp);
      correctAnswers.add(String(q.correctAnswer).trim());

      // Đếm bước từ rubricSteps hoặc solution
      const rubricCount = Array.isArray(q.rubricSteps) ? q.rubricSteps.length : 0;
      const lines = String(q.solution || '')
        .split(/\n+|\\\\|\r+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 5);
      const stepCount = Math.max(rubricCount, lines.length);
      totalSteps += stepCount;

      const vRes = verifyQuestion(q);
      if (vRes.valid) {
        passCount++;
      } else {
        if (failureReasons.length < 3) {
          failureReasons.push(vRes.errors.join('; '));
        }
      }
    } catch (err) {
      if (failureReasons.length < 3) {
        failureReasons.push(`Exception: ${err?.message}`);
      }
    }
  }

  const actualStepsAvg = Math.round((totalSteps / SEEDS_PER_TEMPLATE) * 10) / 10;
  const avgDifficultyScore = Math.round((totalScore / SEEDS_PER_TEMPLATE) * 10) / 10;
  const verificationPassRate = Math.round((passCount / SEEDS_PER_TEMPLATE) * 100);
  const distinctFingerprints = fingerprints.size;

  // Kiểm tra suy biến
  let isDegenerate = false;
  let degenerateReason = '';

  // Nếu số seed là 200 mà chỉ có 1 đáp án duy nhất và là VDC
  if (template.cognitiveLevel === 'van_dung_cao' && correctAnswers.size <= 1 && template.type !== 'essay') {
    isDegenerate = true;
    degenerateReason = 'Đáp án không đổi qua 200 seed (có nguy cơ suy biến hằng số)';
  }

  // Kiểm tra sàn độ khó Complexity
  const compVal = validateComplexityFloor(template.cognitiveLevel, template.complexity);
  let status = 'PASS';
  let suggestedLevel = template.cognitiveLevel;

  const floor = DIFFICULTY_FLOORS[template.cognitiveLevel];
  if (!compVal.valid) {
    status = 'FAIL';
    totalFailures++;
  } else if (actualStepsAvg < floor.minSteps) {
    status = 'FAIL';
    totalFailures++;
    degenerateReason = degenerateReason || `Số bước thực tế (${actualStepsAvg}) < sàn (${floor.minSteps})`;
  } else if (verificationPassRate < 100) {
    status = 'FAIL';
    totalFailures++;
    degenerateReason = degenerateReason || `Tỉ lệ verifyQuestion chỉ đạt ${verificationPassRate}%: ${failureReasons.join(' | ')}`;
  } else if (isDegenerate) {
    status = 'FAIL';
    totalFailures++;
  }

  // Đề xuất mức độ thực tế nếu bị đánh giá quá cao
  if (template.cognitiveLevel === 'van_dung_cao' && actualStepsAvg < 4) {
    suggestedLevel = actualStepsAvg <= 2 ? 'thong_hieu' : 'van_dung';
  } else if (template.cognitiveLevel === 'van_dung' && actualStepsAvg < 2) {
    suggestedLevel = 'thong_hieu';
  }

  auditResults.push({
    id: template.id,
    grade: template.grade,
    chapterId: template.chapterId,
    problemType: template.problemType,
    type: template.type,
    difficulty: template.difficulty,
    cognitiveLevel: template.cognitiveLevel,
    declaredSteps: template.complexity?.steps || 0,
    actualStepsAvg,
    complexityValid: compVal.valid,
    complexityReason: compVal.reason,
    verificationPassRate,
    distinctFingerprints,
    isDegenerate,
    degenerateReason,
    avgDifficultyScore,
    suggestedLevel,
    status,
  });
}

// Tạo thư mục reports nếu chưa có
const reportsDir = path.resolve(process.cwd(), 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// 1. Xuất file CSV
const csvHeader = 'id,grade,chapterId,type,difficulty,cognitiveLevel,declaredSteps,actualStepsAvg,passRate,distinctFp,status,suggestedLevel,reason\n';
const csvRows = auditResults.map((r) =>
  `"${r.id}",${r.grade},"${r.chapterId}","${r.type}","${r.difficulty}","${r.cognitiveLevel}",${r.declaredSteps},${r.actualStepsAvg},${r.verificationPassRate}%,${r.distinctFingerprints},"${r.status}","${r.suggestedLevel}","${(r.complexityReason || r.degenerateReason || '').replace(/"/g, '""')}"`
).join('\n');
fs.writeFileSync(path.join(reportsDir, 'difficulty-audit.csv'), csvHeader + csvRows, 'utf8');

// 2. Xuất file Markdown
const mdReport = `# Báo Cáo Kiểm Định Độ Khó & Chuẩn Nhận Thức Template (GDPT 2018)
Thời gian kiểm định: ${new Date().toISOString()}
Tổng số template kiểm tra: **${ALL_TEMPLATES.length}**
Số seed kiểm thử: **${SEEDS_PER_TEMPLATE}**
Số template ĐẠT CHUẨN (PASS): **${auditResults.filter((r) => r.status === 'PASS').length}**
Số template KHÔNG ĐẠT (FAIL/CẦN SỬA): **${auditResults.filter((r) => r.status === 'FAIL').length}**

---

## 1. Thống Kê Theo Khối Lớp & Mức Nhận Thức

| Lớp | Nhận biết (NB) | Thông hiểu (TH) | Vận dụng (VD) | Vận dụng cao (VDC) | Tổng |
|---|---|---|---|---|---|
| Lớp 6 | ${ALL_TEMPLATES.filter((t) => t.grade === 6 && t.cognitiveLevel === 'nhan_biet').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 6 && t.cognitiveLevel === 'thong_hieu').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 6 && t.cognitiveLevel === 'van_dung').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 6 && t.cognitiveLevel === 'van_dung_cao').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 6).length} |
| Lớp 7 | ${ALL_TEMPLATES.filter((t) => t.grade === 7 && t.cognitiveLevel === 'nhan_biet').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 7 && t.cognitiveLevel === 'thong_hieu').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 7 && t.cognitiveLevel === 'van_dung').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 7 && t.cognitiveLevel === 'van_dung_cao').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 7).length} |
| Lớp 8 | ${ALL_TEMPLATES.filter((t) => t.grade === 8 && t.cognitiveLevel === 'nhan_biet').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 8 && t.cognitiveLevel === 'thong_hieu').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 8 && t.cognitiveLevel === 'van_dung').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 8 && t.cognitiveLevel === 'van_dung_cao').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 8).length} |
| Lớp 9 | ${ALL_TEMPLATES.filter((t) => t.grade === 9 && t.cognitiveLevel === 'nhan_biet').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 9 && t.cognitiveLevel === 'thong_hieu').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 9 && t.cognitiveLevel === 'van_dung').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 9 && t.cognitiveLevel === 'van_dung_cao').length} | ${ALL_TEMPLATES.filter((t) => t.grade === 9).length} |

---

## 2. Danh Sách Template Dưới Sàn / Cần Nâng Cấp Hoặc Viết Lại

| Template ID | Lớp | Chương | Mức hiện tại | Số bước TB | Mức đề xuất | Lý do / Lỗi |
|---|---|---|---|---|---|---|
${auditResults
  .filter((r) => r.status === 'FAIL')
  .map(
    (r) =>
      `| \`${r.id}\` | ${r.grade} | ${r.chapterId} | **${r.cognitiveLevel}** | ${r.actualStepsAvg} | \`${r.suggestedLevel}\` | ${r.complexityReason || r.degenerateReason || 'Chưa đạt chuẩn sàn'} |`
  )
  .join('\n')}

---

## 3. Kết Luận
${
  totalFailures === 0
    ? '✅ **HOÀN TOÀN ĐẠT CHUẨN:** 100% template đạt sàn độ khó nhận thức, không suy biến và pass verifyQuestion.'
    : `⚠️ **CÓ ${totalFailures} TEMPLATE CẦN XỬ LÝ:** Xem danh sách chi tiết ở Bảng 2 và file \`reports/difficulty-audit.csv\`.`
}
`;

fs.writeFileSync(path.join(reportsDir, 'difficulty-audit.md'), mdReport, 'utf8');

console.log('------------------------------------------------------------------------');
console.log(`📊 Kết quả: ${auditResults.filter((r) => r.status === 'PASS').length}/${ALL_TEMPLATES.length} PASS, ${totalFailures} CẦN SỬA.`);
console.log(`📁 Đã xuất báo cáo: reports/difficulty-audit.md và reports/difficulty-audit.csv`);
console.log('========================================================================');

if (process.env.STRICT_AUDIT === 'true' && totalFailures > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
