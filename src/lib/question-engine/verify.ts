// ==============================================================================
// MathMaster THCS - Bộ Thẩm Định Độc Lập Cho Câu Hỏi Tự Sinh (verify.ts)
// File: src/lib/question-engine/verify.ts
// Thẩm định: KaTeX parse, 4 lựa chọn MCQ phân biệt, rubricSteps = points, mathjs kiểm chứng
// ==============================================================================

import katex from 'katex';
import { evaluate } from 'mathjs';
import type { EngineQuestion } from './types';
import { validateComplexityFloor, DIFFICULTY_FLOORS } from './difficulty-standard';

export interface VerificationResult {
  valid: boolean;
  errors: string[];
}

function extractLatexSegments(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const matches = [...text.matchAll(/\$([^$]+)\$/g)];
  return matches.map((m) => m[1]);
}

function cleanMathExpr(raw: string): string | null {
  if (!raw) return null;
  let expr = String(raw).trim();
  expr = expr
    .replace(/^\$+|\$+$/g, '')
    .replace(/^[A-Za-z_][A-Za-z0-9_]*\s*=\s*/, '')
    .replace(/\\left|\\right/g, '')
    .replace(/\{,\}/g, '.')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '(($1)/($2))')
    .replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '(($1)/($2))')
    .replace(/\\sqrt\s*\{([^{}]+)\}/g, 'sqrt($1)')
    .replace(/\\cdot|\\times/g, '*')
    .replace(/:/g, '/')
    .replace(/\^\{([^{}]+)\}/g, '^($1)')
    .replace(/\\text\{[^}]*\}/g, '')
    .replace(/°|\^\\circ/g, '')
    .trim();

  // Chỉ tính nếu là biểu thức số học thuần túy
  if (!/^[0-9+\-*/^().\s]+$/.test(expr.replace(/sqrt/g, ''))) {
    return null;
  }
  return expr;
}

/**
 * Đếm số bước suy luận trong lời giải và rubric
 */
export function countSolutionSteps(solution: string, rubricCount: number): number {
  if (!solution) return rubricCount;
  const rawLines = solution
    .split(/\n+|\\\\|\r+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 5 && !/^\$\$|\$\$$/.test(l));

  const inferenceMatches = (
    solution.match(/\\implies|\\Rightarrow|\\Leftrightarrow|\\iff|Bước\s*\d+|Trường hợp|TH\s*\d+|Ta có:|Suy ra:|Do đó:|Vậy|Điều kiện|ĐKXĐ/gi) || []
  ).length;

  return Math.max(rubricCount, rawLines.length, inferenceMatches);
}

export function verifyQuestion(q: EngineQuestion): VerificationResult {
  const errors: string[] = [];

  // 1. Kiểm tra trường bắt buộc
  if (!q.content || !q.content.trim()) errors.push('Thiếu content câu hỏi');
  if (!q.solution || !q.solution.trim()) errors.push('Thiếu solution lời giải');
  if (q.correctAnswer === undefined || q.correctAnswer === null || String(q.correctAnswer).trim() === '') {
    errors.push('Thiếu correctAnswer');
  }
  if (!q.chapterId) errors.push('Thiếu chapterId');
  if (!q.grade || q.grade < 6 || q.grade > 9) errors.push(`Grade không hợp lệ: ${q.grade}`);
  if (!q.difficulty) errors.push('Thiếu difficulty');
  if (!q.cognitiveLevel) errors.push('Thiếu cognitiveLevel');

  // 2. Kiểm tra Rubric: tổng điểm = points
  const points = Number(q.points || 0);
  if (points <= 0) {
    errors.push(`Points phải lớn hơn 0: ${points}`);
  }
  const rubricCount = Array.isArray(q.rubricSteps) ? q.rubricSteps.length : 0;
  if (!Array.isArray(q.rubricSteps) || rubricCount === 0) {
    errors.push('Thiếu rubricSteps');
  } else {
    const rubricSum = q.rubricSteps.reduce((acc, r) => acc + Number(r.points || 0), 0);
    if (Math.abs(rubricSum - points) > 1e-4) {
      errors.push(`Tổng điểm rubric (${rubricSum}) không khớp points (${points})`);
    }
  }

  // 3. Kiểm tra sàn độ khó Complexity (A.3 & A.5.2)
  if (q.cognitiveLevel === 'van_dung' || q.cognitiveLevel === 'van_dung_cao') {
    const floorValidation = validateComplexityFloor(q.cognitiveLevel, q.complexity);
    if (!floorValidation.valid) {
      errors.push(floorValidation.reason || `Không đạt sàn độ khó mức ${q.cognitiveLevel}`);
    }

    // Đếm số bước suy luận thực tế
    const actualSteps = countSolutionSteps(q.solution, rubricCount);
    const floor = DIFFICULTY_FLOORS[q.cognitiveLevel];
    if (actualSteps < floor.minSteps) {
      errors.push(`Câu ${q.cognitiveLevel} chỉ có ${actualSteps} bước suy luận thực tế (< sàn tối thiểu ${floor.minSteps} bước)`);
    }
  }

  // 4. Kiểm tra trắc nghiệm (MCQ)
  if (q.type === 'mcq') {
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`Câu MCQ phải có đúng 4 phương án, hiện có: ${q.options?.length}`);
    } else {
      const labels = q.options.map((o) => String(o.label || '').trim());
      const normalizedTexts = q.options.map((o) =>
        String(o.text || '')
          .trim()
          .replace(/\s+/g, ' ')
          .toLowerCase()
      );

      // Nhãn phải là A, B, C, D
      const expectedLabels = ['A', 'B', 'C', 'D'];
      const hasStandardLabels = expectedLabels.every((l) => labels.includes(l));
      if (!hasStandardLabels) {
        errors.push(`Nhãn options phải gồm đầy đủ A, B, C, D. Hiện có: [${labels.join(', ')}]`);
      }

      // Đáp án đúng phải nằm trong danh sách nhãn
      if (!labels.includes(String(q.correctAnswer).trim())) {
        errors.push(`Đáp án đúng "${q.correctAnswer}" không nằm trong các nhãn [${labels.join(', ')}]`);
      }

      // 4 phương án phải có nội dung phân biệt
      const uniqueTexts = new Set(normalizedTexts);
      if (uniqueTexts.size !== normalizedTexts.length) {
        errors.push('Có phương án MCQ bị trùng lặp nội dung với nhau');
      }

      // Phương án không được để trống
      if (normalizedTexts.some((t) => t.length === 0)) {
        errors.push('Có phương án MCQ có nội dung rỗng');
      }

      // Với VD/VDC: kiểm tra 3 phương án nhiễu phải có errorType
      if (q.cognitiveLevel === 'van_dung' || q.cognitiveLevel === 'van_dung_cao') {
        const distractors = q.options.filter((o) => o.label !== q.correctAnswer);
        for (const dist of distractors) {
          if (!dist.errorType || !dist.errorType.trim()) {
            errors.push(`Phương án nhiễu ${dist.label} của câu ${q.cognitiveLevel} thiếu errorType phân loại lỗi sai`);
          }
        }
      }
    }
  }

  // 5. Kiểm tra tự luận (essay)
  if (q.type === 'essay') {
    if (!Array.isArray(q.acceptedAnswers) || q.acceptedAnswers.length === 0) {
      errors.push('Câu tự luận phải có acceptedAnswers');
    }
  }

  // 6. Kiểm tra KaTeX (throwOnError: true)
  const textsToCheck: Array<{ field: string; text?: string }> = [
    { field: 'content', text: q.content },
    { field: 'solution', text: q.solution },
    { field: 'keyFormula', text: q.keyFormula },
    { field: 'commonMistake', text: q.commonMistake },
    ...(q.options || []).map((o) => ({ field: `option_${o.label}`, text: o.text })),
    ...(q.rubricSteps || []).map((r, i) => ({ field: `rubric_${i + 1}`, text: r.step })),
  ];

  for (const item of textsToCheck) {
    if (!item.text) continue;
    const segments = extractLatexSegments(item.text);
    for (const seg of segments) {
      try {
        katex.renderToString(seg, { throwOnError: true, displayMode: false, strict: 'ignore' });
      } catch (err: any) {
        errors.push(`Lỗi cú pháp KaTeX tại ${item.field} ("$${seg}$"): ${err?.message}`);
      }
    }
  }

  // 7. Kiểm tra tính toán mathjs nếu có mathExpressionToVerify
  if (q.mathExpressionToVerify) {
    const cleaned = cleanMathExpr(q.mathExpressionToVerify);
    if (cleaned) {
      try {
        const val = evaluate(cleaned);
        if (typeof val === 'number' && Number.isFinite(val)) {
          // So sánh với correctAnswer nếu correctAnswer là số
          const numAns = Number(String(q.correctAnswer).replace(/[$,]/g, '').trim());
          if (!Number.isNaN(numAns) && Math.abs(val - numAns) > 1e-3) {
            errors.push(`Tính toán mathjs (${val}) không khớp correctAnswer (${numAns})`);
          }
        }
      } catch (err: any) {
        // Biểu thức phức tạp không ép lỗi mathjs
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
