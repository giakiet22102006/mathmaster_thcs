// ==============================================================================
// MathMaster THCS - Bộ Chấm Điểm Toán Học Tương Đương & Sinh Đề Theo Ma Trận
// Chuẩn Thông tư 22/2021/TT-BGDĐT (4 mức độ nhận thức, Largest Remainder, PRNG)
// ==============================================================================

import { generateQuestions } from './question-engine';

export type CognitiveLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'very_hard';
export type ExamPresetKey = 'co_ban' | 'trung_binh' | 'nang_cao' | 'thi_vao_10';

export const COGNITIVE_LEVELS: CognitiveLevel[] = [
  'nhan_biet',
  'thong_hieu',
  'van_dung',
  'van_dung_cao',
];

export const COGNITIVE_LEVEL_LABELS: Record<CognitiveLevel, string> = {
  nhan_biet: 'Nhận biết',
  thong_hieu: 'Thông hiểu',
  van_dung: 'Vận dụng',
  van_dung_cao: 'Vận dụng cao',
};

export const COGNITIVE_TO_DIFFICULTY: Record<CognitiveLevel, DifficultyLevel> = {
  nhan_biet: 'easy',
  thong_hieu: 'medium',
  van_dung: 'hard',
  van_dung_cao: 'hard',
};

export const COGNITIVE_POINT_WEIGHTS: Record<CognitiveLevel, number> = {
  nhan_biet: 1.0,
  thong_hieu: 1.5,
  van_dung: 2.0,
  van_dung_cao: 2.5,
};

// Bảng quy đổi Ma trận Độ khó của Đề (Mục 3.1)
export const EXAM_MATRIX_PRESETS: Record<
  ExamPresetKey,
  {
    label: string;
    description: string;
    ratios: Record<CognitiveLevel, number>;
  }
> = {
  co_ban: {
    label: 'Cơ bản (Ôn tập nền tảng)',
    description: '70% Nhận biết - 30% Thông hiểu - 0% Vận dụng - 0% Vận dụng cao',
    ratios: { nhan_biet: 70, thong_hieu: 30, van_dung: 0, van_dung_cao: 0 },
  },
  trung_binh: {
    label: 'Trung bình (Chuẩn kiểm tra định kỳ)',
    description: '30% Nhận biết - 50% Thông hiểu - 20% Vận dụng - 0% Vận dụng cao',
    ratios: { nhan_biet: 30, thong_hieu: 50, van_dung: 20, van_dung_cao: 0 },
  },
  nang_cao: {
    label: 'Nâng cao (Học sinh khá giỏi)',
    description: '10% Nhận biết - 30% Thông hiểu - 40% Vận dụng - 20% Vận dụng cao',
    ratios: { nhan_biet: 10, thong_hieu: 30, van_dung: 40, van_dung_cao: 20 },
  },
  thi_vao_10: {
    label: 'Tổng hợp / Thi vào 10',
    description: '10% Nhận biết - 30% Thông hiểu - 35% Vận dụng - 25% Vận dụng cao',
    ratios: { nhan_biet: 10, thong_hieu: 30, van_dung: 35, van_dung_cao: 25 },
  },
};

/**
 * Chuẩn hóa tên preset độ khó (hỗ trợ cả tên cũ easy/medium/hard và tên mới co_ban/trung_binh/nang_cao/thi_vao_10)
 */
export function resolveMatrixPresetKey(rawDifficulty?: string, category?: string): ExamPresetKey {
  if (category === 'THI_VAO_10' && (!rawDifficulty || rawDifficulty === 'thi_vao_10')) {
    return 'thi_vao_10';
  }
  const key = String(rawDifficulty || 'trung_binh').trim().toLowerCase();
  if (key === 'easy' || key === 'co_ban' || key === 'coban') return 'co_ban';
  if (key === 'medium' || key === 'trung_binh' || key === 'trungbinh') return 'trung_binh';
  if (key === 'hard' || key === 'nang_cao' || key === 'nangcao') return 'nang_cao';
  if (key === 'very_hard' || key === 'thi_vao_10' || key === 'thivao10' || key === 'tong_hop') {
    return 'thi_vao_10';
  }
  return 'trung_binh';
}

/**
 * Chuẩn hóa mức nhận thức của một câu hỏi từ dữ liệu
 */
export function resolveQuestionCognitiveLevel(question: any): CognitiveLevel {
  const cog = String(question?.cognitiveLevel || '').trim().toLowerCase();
  if (
    cog === 'nhan_biet' ||
    cog === 'thong_hieu' ||
    cog === 'van_dung' ||
    cog === 'van_dung_cao'
  ) {
    return cog;
  }
  const diff = String(question?.difficulty || '').trim().toLowerCase();
  if (diff === 'easy') return 'nhan_biet';
  if (diff === 'medium') return 'thong_hieu';
  if (diff === 'very_hard') return 'van_dung_cao';
  if (diff === 'hard') return 'van_dung';
  return 'thong_hieu';
}

/**
 * Bộ sinh số ngẫu nhiên có seed (Mulberry32 PRNG) giúp tái lập đề thi
 */
export function createSeededRng(seedInput?: number | string): { seed: number; next: () => number } {
  let numericSeed: number;
  if (typeof seedInput === 'number' && Number.isFinite(seedInput)) {
    numericSeed = seedInput >>> 0;
  } else if (typeof seedInput === 'string' && seedInput.trim() !== '') {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedInput.length; i++) {
      h ^= seedInput.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    numericSeed = h >>> 0;
  } else {
    numericSeed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  }
  if (numericSeed === 0) numericSeed = 123456789;

  let state = numericSeed;
  const next = () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return { seed: numericSeed, next };
}

/**
 * Tính số câu cần lấy cho từng mức nhận thức bằng phương pháp Phần Dư Lớn Nhất (Largest Remainder Method)
 * đảm bảo tổng số câu luôn bằng đúng questionCount.
 */
export function allocateQuotaLargestRemainder(
  totalCount: number,
  ratios: Record<CognitiveLevel, number>
): Record<CognitiveLevel, number> {
  const sumRatios =
    (Number(ratios.nhan_biet) || 0) +
    (Number(ratios.thong_hieu) || 0) +
    (Number(ratios.van_dung) || 0) +
    (Number(ratios.van_dung_cao) || 0);

  const normalized: Record<CognitiveLevel, number> =
    sumRatios > 0
      ? {
          nhan_biet: ((Number(ratios.nhan_biet) || 0) / sumRatios) * 100,
          thong_hieu: ((Number(ratios.thong_hieu) || 0) / sumRatios) * 100,
          van_dung: ((Number(ratios.van_dung) || 0) / sumRatios) * 100,
          van_dung_cao: ((Number(ratios.van_dung_cao) || 0) / sumRatios) * 100,
        }
      : { nhan_biet: 30, thong_hieu: 50, van_dung: 20, van_dung_cao: 0 };

  const exactQuotas = COGNITIVE_LEVELS.map((level, orderIdx) => {
    const exact = (totalCount * normalized[level]) / 100;
    const floorVal = Math.floor(exact + 1e-9);
    const remainder = exact - floorVal;
    return { level, exact, floorVal, remainder, ratio: normalized[level], orderIdx };
  });

  const result: Record<CognitiveLevel, number> = {
    nhan_biet: 0,
    thong_hieu: 0,
    van_dung: 0,
    van_dung_cao: 0,
  };

  let allocated = 0;
  for (const item of exactQuotas) {
    result[item.level] = item.floorVal;
    allocated += item.floorVal;
  }

  let remaining = totalCount - allocated;
  if (remaining > 0) {
    const sortedByRemainder = [...exactQuotas].sort((a, b) => {
      if (Math.abs(b.remainder - a.remainder) > 1e-9) {
        return b.remainder - a.remainder;
      }
      if (Math.abs(b.ratio - a.ratio) > 1e-9) {
        return b.ratio - a.ratio;
      }
      return a.orderIdx - b.orderIdx;
    });
    for (let i = 0; i < remaining; i++) {
      const target = sortedByRemainder[i % sortedByRemainder.length];
      result[target.level] += 1;
    }
  }

  return result;
}

export function normalizeMathExpression(raw: any): string {
  if (raw === undefined || raw === null) return '';
  let s = String(raw).trim().toLowerCase();
  s = s.replace(/^\$+|\$+$/g, '');
  s = s.replace(/\\left|\\right/g, '');
  s = s.replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '($1)/($2)');
  s = s.replace(/\\sqrt\s*\{([^}]+)\}/g, 'sqrt($1)');
  s = s.replace(/√\s*\(?([0-9]+)\)?/g, 'sqrt($1)');
  s = s.replace(/căn\s*([0-9]+)/g, 'sqrt($1)');
  s = s.replace(/\{,\}/g, '.');
  s = s.replace(/(\d),(\d)/g, '$1.$2');
  s = s.replace(/\\cdot|\\times/g, '*');
  s = s.replace(/\\pi/g, 'pi');
  s = s.replace(
    /\b(cm2|cm3|cm|m2|m3|m|km|đồng|dong|viên|vien|học sinh|hoc sinh|giờ|gio|phút|phut|độ|do|đvđd|dvdt)\b/g,
    ''
  );
  s = s.replace(/°|\^\\circ/g, '');
  return s.trim();
}

export function evalMathAtom(expr: any): number | null {
  if (expr === undefined || expr === null) return null;
  const clean = normalizeMathExpression(expr)
    .replace(/^(x_1|x_2|x1|x2|x|y|z|m|n|b|p|q|a|s|c|d|k|min\s*[a-z]+|max\s*[a-z]+)\s*=\s*/i, '')
    .replace(/[{}()]/g, '')
    .trim();
  if (!clean) return null;
  if (/^[+-]?\d+(\.\d+)?$/.test(clean)) return parseFloat(clean);
  const fMatch = clean.match(/^([+-]?\d+(?:\.\d+)?)\s*\/\s*([+-]?\d+(?:\.\d+)?)$/);
  if (fMatch) {
    const den = parseFloat(fMatch[2]);
    return den === 0 ? null : parseFloat(fMatch[1]) / den;
  }
  const rMatch = clean.match(/^([+-]?\d+(?:\.\d+)?)?\s*\*?\s*sqrt\s*(\d+(?:\.\d+)?)$/);
  if (rMatch) {
    const coef = rMatch[1] ? parseFloat(rMatch[1]) : 1;
    return coef * Math.sqrt(parseFloat(rMatch[2]));
  }
  const piMatch = clean.match(/^([+-]?\d+(?:\.\d+)?)\s*\*?\s*pi$/);
  if (piMatch) return parseFloat(piMatch[1]) * Math.PI;
  return null;
}

/**
 * Phân loại lỗi sai từ dữ liệu câu hỏi (commonMistake, errorRules, phương án nhiễu)
 * Không dùng bất kỳ logic gán cứng theo ID câu hỏi nào.
 */
export function classifyAnswerError(studentAns: string, question: any): string {
  const sRaw = String(studentAns || '').trim();
  if (!sRaw) return 'UNANSWERED';

  // 1. Kiểm tra errorRules có cấu trúc trên câu hỏi (nếu có)
  if (Array.isArray(question?.errorRules)) {
    for (const rule of question.errorRules) {
      if (rule?.pattern && new RegExp(rule.pattern, 'i').test(sRaw)) {
        return rule.errorCategory || 'CALCULATION_ERROR';
      }
      if (rule?.value !== undefined && normalizeMathExpression(rule.value) === normalizeMathExpression(sRaw)) {
        return rule.errorCategory || 'CALCULATION_ERROR';
      }
    }
  }

  // 2. Với câu trắc nghiệm (MCQ), kiểm tra phương án nhiễu học sinh đã chọn
  let effectiveStudentMathText = sRaw;
  if (question?.type === 'mcq' && Array.isArray(question?.options)) {
    const chosenOpt = question.options.find(
      (o: any) => String(o.label || '').trim().toUpperCase() === sRaw.toUpperCase()
    );
    if (chosenOpt) {
      if (chosenOpt.errorType) return String(chosenOpt.errorType);
      effectiveStudentMathText = String(chosenOpt.text || sRaw);
    }
  }

  // 3. Kiểm tra lỗi sai dấu (giá trị đối nhau: vS == -vT)
  let correctMathText = String(question?.correctAnswer || '');
  if (question?.type === 'mcq' && Array.isArray(question?.options)) {
    const rightOpt = question.options.find(
      (o: any) => String(o.label || '').trim().toUpperCase() === correctMathText.toUpperCase()
    );
    if (rightOpt) correctMathText = String(rightOpt.text || correctMathText);
  }
  const vStudent = evalMathAtom(effectiveStudentMathText);
  const vCorrect = evalMathAtom(correctMathText);
  if (
    vStudent !== null &&
    vCorrect !== null &&
    Math.abs(vCorrect) > 1e-6 &&
    Math.abs(vStudent + vCorrect) < 1e-6
  ) {
    return 'SIGN_ERROR';
  }

  // 4. Phân tích dựa trên trường commonMistake của câu hỏi
  const mistakeText = String(question?.commonMistake || '').toLowerCase();
  if (mistakeText) {
    // Trích xuất các con số nêu trong commonMistake (ví dụ "Không loại nghiệm x = -5 vi phạm điều kiện")
    const mistakeNums = [...mistakeText.matchAll(/[+-]?\d+(?:[.,]\d+)?/g)].map((m) =>
      parseFloat(m[0].replace(',', '.'))
    );
    const studentNums = [...effectiveStudentMathText.matchAll(/[+-]?\d+(?:[.,]\d+)?/g)].map((m) =>
      parseFloat(m[0].replace(',', '.'))
    );
    const hitsMistakeNumber =
      mistakeNums.length > 0 &&
      studentNums.some((sn) => mistakeNums.some((mn) => Math.abs(sn - mn) < 1e-6));

    if (
      mistakeText.includes('điều kiện') ||
      mistakeText.includes('đkxđ') ||
      mistakeText.includes('đk ') ||
      mistakeText.includes('không loại') ||
      mistakeText.includes('loại nghiệm') ||
      mistakeText.includes('thỏa mãn')
    ) {
      if (hitsMistakeNumber || question?.type === 'mcq') {
        return 'MISSING_CONDITION';
      }
    }
    if (
      mistakeText.includes('đổi dấu') ||
      mistakeText.includes('sai dấu') ||
      mistakeText.includes('dấu ngoặc') ||
      mistakeText.includes('nhầm dấu')
    ) {
      return 'SIGN_ERROR';
    }
    if (
      mistakeText.includes('công thức') ||
      mistakeText.includes('hằng đẳng thức') ||
      mistakeText.includes('nhầm sang') ||
      mistakeText.includes('bcnn') ||
      mistakeText.includes('ưcln')
    ) {
      return 'FORMULA_ERROR';
    }
    if (mistakeText.includes('khái niệm') || mistakeText.includes('định nghĩa')) {
      return 'CONCEPT_ERROR';
    }
  }

  if (sRaw.length > 25) return 'METHOD_ERROR';
  return 'CALCULATION_ERROR';
}

export function checkMathEquivalence(studentAns: any, question: any) {
  if (studentAns === undefined || studentAns === null || !String(studentAns).trim()) {
    return { isCorrect: false, matchedReason: 'Chưa trả lời', errorCategory: null };
  }
  const sRaw = String(studentAns).trim();
  const targets = [question.correctAnswer].concat(question.acceptedAnswers || []).filter(Boolean);
  const normS = normalizeMathExpression(sRaw);

  for (const t of targets) {
    const normT = normalizeMathExpression(t);
    if (normS === normT || normS.replace(/\s+/g, '') === normT.replace(/\s+/g, '')) {
      return { isCorrect: true, matchedReason: 'Khớp đáp án chuẩn / tương đương', errorCategory: null };
    }
    const vS = evalMathAtom(normS);
    const vT = evalMathAtom(normT);
    if (vS !== null && vT !== null && Math.abs(vS - vT) < 1e-6) {
      return {
        isCorrect: true,
        matchedReason: `Giá trị toán học tương đương (${sRaw} = ${t})`,
        errorCategory: null,
      };
    }
  }

  const isOrderedPair = /x\s*=.*y\s*=/.test(String(question.correctAnswer).toLowerCase());
  if (!isOrderedPair && (String(question.correctAnswer).includes(';') || sRaw.includes(';'))) {
    const parseSet = (str: string) =>
      String(str)
        .split(/[;,]/)
        .map((p) => evalMathAtom(p))
        .filter((v): v is number => v !== null)
        .sort((a, b) => a - b);
    const sSet = parseSet(sRaw);
    const tSet = parseSet(question.correctAnswer);
    if (
      sSet.length > 1 &&
      sSet.length === tSet.length &&
      sSet.every((v, i) => Math.abs(v - tSet[i]) < 1e-6)
    ) {
      return { isCorrect: true, matchedReason: 'Tập nghiệm tương đương', errorCategory: null };
    }
  }

  const detectedError = classifyAnswerError(sRaw, question);
  return {
    isCorrect: false,
    matchedReason: 'Chưa khớp đáp án chuẩn',
    errorCategory: detectedError,
  };
}

/**
 * Chấm điểm thành phần (Partial Credit) cho câu tự luận dựa trên rubricSteps và phần trình bày workings
 */
export function evaluateEssayRubricSteps(
  workings: string,
  finalValue: string,
  question: any,
  maxQuestionPoints: number
): {
  partialPoints: number;
  matchedStepsCount: number;
  totalStepsCount: number;
  breakdown: Array<{ step: string; maxPoints: number; awardedPoints: number; matched: boolean }>;
} {
  const rubricSteps = Array.isArray(question?.rubricSteps) ? question.rubricSteps : [];
  if (rubricSteps.length === 0) {
    return { partialPoints: 0, matchedStepsCount: 0, totalStepsCount: 0, breakdown: [] };
  }

  const combinedText = `${workings || ''}\n${finalValue || ''}`.trim();
  if (!combinedText) {
    return {
      partialPoints: 0,
      matchedStepsCount: 0,
      totalStepsCount: rubricSteps.length,
      breakdown: rubricSteps.map((r: any) => ({
        step: String(r.step || ''),
        maxPoints: Number(r.points || 0),
        awardedPoints: 0,
        matched: false,
      })),
    };
  }

  const normWorkings = normalizeMathExpression(combinedText).replace(/\s+/g, '');
  const workingClauses = combinedText
    .split(/[\n;,.]|(?:=>)|(?:\\Rightarrow)|(?:<=>)|(?:\\Leftrightarrow)|(?:\bva\b)|(?:\bvà\b)/i)
    .map((c) => c.trim())
    .filter(Boolean);

  const rubricSum =
    rubricSteps.reduce((acc: number, s: any) => acc + Number(s.points || 0), 0) ||
    Number(question?.points || 1) ||
    1;

  let partialPoints = 0;
  let matchedStepsCount = 0;
  const breakdown: Array<{ step: string; maxPoints: number; awardedPoints: number; matched: boolean }> = [];

  for (const r of rubricSteps) {
    const stepText = String(r.step || '');
    const stepMax = Number(((Number(r.points || 0) / rubricSum) * maxQuestionPoints).toFixed(2));
    let matched = false;

    // Trích xuất các biểu thức toán học trong $...$ của bước chấm
    const mathSegs = [...stepText.matchAll(/\$([^$]+)\$/g)].map((m) => m[1].trim());
    if (mathSegs.length > 0) {
      // Kiểm tra xem có biểu thức chính hoặc kết quả số của bước đó xuất hiện trong bài làm không
      const segMatches = mathSegs.map((seg) => {
        const normSeg = normalizeMathExpression(seg).replace(/\s+/g, '');
        if (normSeg && normWorkings.includes(normSeg)) return true;

        // Nếu biểu thức dạng "x - 7 = 37" hoặc "\Delta = 9", kiểm tra vế phải hoặc giá trị số
        const eqParts = seg.split('=');
        const rhs = eqParts[eqParts.length - 1]?.trim();
        const rhsVal = evalMathAtom(rhs);
        if (rhsVal !== null) {
          for (const clause of workingClauses) {
            const cParts = clause.split('=');
            const cRhs = cParts[cParts.length - 1]?.trim();
            const cVal = evalMathAtom(cRhs);
            if (cVal !== null && Math.abs(cVal - rhsVal) < 1e-6) {
              // Nếu có tên biến ở vế trái (như x, y, delta), kiểm tra tên biến tương ứng
              if (eqParts.length > 1 && cParts.length > 1) {
                const lhsVar = normalizeMathExpression(eqParts[0]).replace(/\s+/g, '');
                const cLhsVar = normalizeMathExpression(cParts[0]).replace(/\s+/g, '');
                if (lhsVar && cLhsVar && (cLhsVar.includes(lhsVar) || lhsVar.includes(cLhsVar))) {
                  return true;
                }
              } else {
                return true;
              }
            }
          }
        }
        return false;
      });

      // Nếu khớp ít nhất biểu thức kết quả cuối của bước rubric
      if (segMatches[segMatches.length - 1] || segMatches.every(Boolean)) {
        matched = true;
      }
    } else {
      // Bước rubric không có $...$, tìm con số hoặc từ khóa chính
      const numsInStep = [...stepText.matchAll(/[+-]?\d+(?:[.,]\d+)?/g)].map((m) => m[0]);
      if (numsInStep.length > 0 && numsInStep.every((n) => normWorkings.includes(n.replace(',', '.')))) {
        matched = true;
      }
    }

    const awarded = matched ? stepMax : 0;
    if (matched) {
      partialPoints += awarded;
      matchedStepsCount += 1;
    }
    breakdown.push({
      step: stepText,
      maxPoints: stepMax,
      awardedPoints: awarded,
      matched,
    });
  }

  return {
    partialPoints: Math.min(maxQuestionPoints, Number(partialPoints.toFixed(2))),
    matchedStepsCount,
    totalStepsCount: rubricSteps.length,
    breakdown,
  };
}

/**
 * Phân bổ điểm chuẩn hóa tổng bằng 10.0 dựa trên trọng số mức độ nhận thức
 */
export function allocateWeightedQuestionPoints(selectedQuestions: any[]): Record<string, number> {
  const questionPoints: Record<string, number> = {};
  if (!selectedQuestions || selectedQuestions.length === 0) return questionPoints;

  const weights = selectedQuestions.map((q) => {
    const lv = resolveQuestionCognitiveLevel(q);
    const typeBonus = q.type === 'essay' ? 0.25 : 0;
    return COGNITIVE_POINT_WEIGHTS[lv] + typeBonus;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0) || selectedQuestions.length;
  let remaining = 10.0;

  selectedQuestions.forEach((q, idx) => {
    if (idx === selectedQuestions.length - 1) {
      questionPoints[q.id] = Number(Math.max(0.1, remaining).toFixed(2));
    } else {
      const rawPt = (weights[idx] / totalWeight) * 10.0;
      // Làm tròn đến bội số của 0.05 để điểm đẹp
      const rounded = Math.max(0.1, Math.round(rawPt * 20) / 20);
      const pts = Number(Math.min(remaining - 0.1 * (selectedQuestions.length - 1 - idx), rounded).toFixed(2));
      questionPoints[q.id] = pts;
      remaining = Number((remaining - pts).toFixed(4));
    }
  });

  return questionPoints;
}

/**
 * Thuật toán sinh đề theo ma trận 4 mức độ nhận thức (Mục 3.3)
 * - Lọc cứng theo Lớp, verificationStatus, Bộ sách, Học kỳ, Chương, Hình thức.
 * - Tính quota từng mức nhận thức bằng Largest Remainder.
 * - Kiểm tra thiếu hụt nghiêm ngặt: trả về { ok: false, code: 'INSUFFICIENT_QUESTIONS', shortage, suggestions }
 *   nếu thiếu câu và không bật allowBorrowAdjacent. Tuyệt đối không lấy bừa câu sai mức độ/chưa duyệt.
 * - Chống trùng lặp theo đúng config.userId và lấy cân bằng theo chương (round-robin) kết hợp Seeded PRNG.
 */
export function generateExamFromPool(
  config: any,
  allQuestions: any[],
  existingExams: any[] = [],
  userAttempts: any[] = []
): any {
  const grade = Number(config?.grade || 8);
  const textbook = String(config?.textbook || 'KNTT').trim();
  const category = String(config?.category || 'GIUA_KI_1').trim();
  const presetKey = resolveMatrixPresetKey(config?.difficulty || config?.difficultyPreset, category);
  const format = String(config?.format || 'combined').trim().toLowerCase();
  const totalCount = Math.max(1, Math.min(50, Number(config?.questionCount || 5)));
  const durationMinutes = Number(config?.durationMinutes || 45);
  const allowBorrowAdjacent = Boolean(config?.allowBorrowAdjacent);
  const includeDraft = Boolean(config?.includeDraft);
  const userId = String(config?.userId || 'user_minhanh_01');

  // Xác định danh sách chương được lọc (hỗ trợ cả chapterIds[] và chapterId đơn lẻ)
  const chapterIds: string[] = Array.isArray(config?.chapterIds)
    ? config.chapterIds.filter((c: string) => c && c !== 'ALL')
    : config?.chapterId && config.chapterId !== 'ALL'
    ? [String(config.chapterId)]
    : [];

  // Xác định ràng buộc học kỳ
  let semConstraint = Number(config?.semester || 0);
  if (!config?.semester) {
    if (category === 'GIUA_KI_1' || category === 'CUOI_KI_1') semConstraint = 1;
    else if (category === 'GIUA_KI_2' || category === 'CUOI_KI_2') semConstraint = 2;
    else if (category === 'THI_VAO_10' || category === 'TONG_HOP') semConstraint = 0;
    else semConstraint = 1;
  }
  if (category === 'THI_VAO_10' || category === 'TONG_HOP') {
    semConstraint = 0;
  }

  // ============================================================================
  // BƯỚC 1: LỌC CỨNG (Hard Filters) - Không bao giờ tự ý bỏ bộ lọc
  // ============================================================================
  const pool = (allQuestions || []).filter((q) => {
    if (Number(q.grade) !== grade) return false;
    if (!includeDraft && q.verificationStatus !== 'verified') return false;
    if (textbook && textbook !== 'ALL') {
      const books = Array.isArray(q.textbooks) ? q.textbooks : [];
      if (books.length > 0 && !books.includes(textbook)) return false;
    }
    if (semConstraint === 1 || semConstraint === 2) {
      if (Number(q.semester) !== semConstraint) return false;
    }
    if (chapterIds.length > 0) {
      if (!chapterIds.includes(String(q.chapterId))) return false;
    }
    if (format === 'mcq' && q.type !== 'mcq') return false;
    if (format === 'essay' && q.type !== 'essay') return false;
    return true;
  });

  // ============================================================================
  // BƯỚC 2: TÍNH HẠN NGẠCH TỪNG MỨC NHẬN THỨC (Quota Allocation)
  // ============================================================================
  const customRatios = config?.customMatrix || config?.matrixRatios;
  const activeRatios: Record<CognitiveLevel, number> =
    customRatios && typeof customRatios === 'object'
      ? {
          nhan_biet: Number(customRatios.nhan_biet ?? 0),
          thong_hieu: Number(customRatios.thong_hieu ?? 0),
          van_dung: Number(customRatios.van_dung ?? 0),
          van_dung_cao: Number(customRatios.van_dung_cao ?? 0),
        }
      : EXAM_MATRIX_PRESETS[presetKey].ratios;

  const targetCounts = allocateQuotaLargestRemainder(totalCount, activeRatios);

  // Phân nhóm ngân hàng câu hỏi khả dụng theo 4 mức nhận thức
  const availableByLevel: Record<CognitiveLevel, any[]> = {
    nhan_biet: [],
    thong_hieu: [],
    van_dung: [],
    van_dung_cao: [],
  };
  for (const q of pool) {
    const lv = resolveQuestionCognitiveLevel(q);
    availableByLevel[lv].push(q);
  }

  // ============================================================================
  // BƯỚC 3: KIỂM TRA TÍNH KHẢ THI & BÁO LỖI MINH BẠCH (KHÔNG ÂM THẦM HẠ CẤP)
  // ============================================================================
  const shortage: Record<CognitiveLevel, { need: number; have: number; missing: number }> = {
    nhan_biet: {
      need: targetCounts.nhan_biet,
      have: availableByLevel.nhan_biet.length,
      missing: Math.max(0, targetCounts.nhan_biet - availableByLevel.nhan_biet.length),
    },
    thong_hieu: {
      need: targetCounts.thong_hieu,
      have: availableByLevel.thong_hieu.length,
      missing: Math.max(0, targetCounts.thong_hieu - availableByLevel.thong_hieu.length),
    },
    van_dung: {
      need: targetCounts.van_dung,
      have: availableByLevel.van_dung.length,
      missing: Math.max(0, targetCounts.van_dung - availableByLevel.van_dung.length),
    },
    van_dung_cao: {
      need: targetCounts.van_dung_cao,
      have: availableByLevel.van_dung_cao.length,
      missing: Math.max(0, targetCounts.van_dung_cao - availableByLevel.van_dung_cao.length),
    },
  };

  // Bù đắp thiếu hụt tự động bằng Parametric Question Engine trước khi báo lỗi
  const generatedQuestions: any[] = [];
  for (const lv of COGNITIVE_LEVELS) {
    if (shortage[lv].missing > 0) {
      let reqType: 'mcq' | 'essay' | 'ALL' = 'ALL';
      if (format === 'mcq') reqType = 'mcq';
      else if (format === 'essay') reqType = 'essay';
      else if (format === 'combined') {
        reqType = lv === 'nhan_biet' || lv === 'thong_hieu' ? 'mcq' : 'essay';
      }

      const genRes = generateQuestions({
        grade,
        textbook: textbook && textbook !== 'ALL' ? (textbook as any) : undefined,
        chapterIds: chapterIds.length > 0 ? chapterIds : undefined,
        semester: semConstraint === 1 || semConstraint === 2 ? (semConstraint as any) : 0,
        difficulty: COGNITIVE_TO_DIFFICULTY[lv],
        cognitiveLevel: lv,
        type: reqType,
        count: shortage[lv].missing,
        seed: config?.seed,
      });

      if (genRes.questions.length > 0) {
        for (const gq of genRes.questions) {
          availableByLevel[lv].push(gq);
          pool.push(gq);
          generatedQuestions.push(gq);
        }
        shortage[lv].have = availableByLevel[lv].length;
        shortage[lv].missing = Math.max(0, targetCounts[lv] - availableByLevel[lv].length);
      }
    }
  }

  const hasShortage = COGNITIVE_LEVELS.some((lv) => shortage[lv].missing > 0);
  const effectiveQuotas: Record<CognitiveLevel, number> = { ...targetCounts };
  const borrowedDetails: Array<{ from: CognitiveLevel; to: CognitiveLevel; count: number }> = [];
  let borrowedFromAdjacent = false;

  if (hasShortage) {
    if (!allowBorrowAdjacent) {
      const suggestions: string[] = [];
      if (chapterIds.length > 0) {
        suggestions.push('Mở rộng phạm vi sang nhiều chương hơn hoặc chọn "Toàn học kỳ".');
      }
      if (semConstraint === 1 || semConstraint === 2) {
        suggestions.push('Chọn phạm vi "Cả năm / Tổng hợp" để lấy thêm câu hỏi từ học kỳ còn lại.');
      }
      if (format === 'mcq' || format === 'essay') {
        suggestions.push('Chuyển hình thức đề sang "Kết hợp (Trắc nghiệm + Tự luận)" để tận dụng cả 2 loại câu hỏi.');
      }
      suggestions.push(
        `Giảm tổng số câu hỏi xuống tối đa ${pool.length} câu hoặc bật tùy chọn "Cho phép mượn mức độ kề cận".`
      );
      suggestions.push(
        'Giáo viên / Quản trị viên có thể duyệt thêm các câu hỏi đang ở trạng thái "draft" sang "verified".'
      );

      return {
        ok: false,
        code: 'INSUFFICIENT_QUESTIONS',
        message: 'Ngân hàng câu hỏi đã xác minh (verified) không đủ số lượng cho ma trận độ khó yêu cầu.',
        shortage,
        totalAvailable: pool.length,
        totalRequested: totalCount,
        suggestions,
      };
    }

    // Cho phép mượn từ mức độ kề cận (sàn độ khó: chỉ được mượn LÊN mức cao hơn, tuyệt đối KHÔNG mượn xuống)
    const adjacentMap: Record<CognitiveLevel, CognitiveLevel[]> = {
      nhan_biet: ['thong_hieu'],
      thong_hieu: ['van_dung'],
      van_dung: ['van_dung_cao'],
      van_dung_cao: [], // Tuyệt đối không mượn xuống câu dễ hơn!
    };

    const spareByLevel: Record<CognitiveLevel, number> = {
      nhan_biet: Math.max(0, availableByLevel.nhan_biet.length - effectiveQuotas.nhan_biet),
      thong_hieu: Math.max(0, availableByLevel.thong_hieu.length - effectiveQuotas.thong_hieu),
      van_dung: Math.max(0, availableByLevel.van_dung.length - effectiveQuotas.van_dung),
      van_dung_cao: Math.max(0, availableByLevel.van_dung_cao.length - effectiveQuotas.van_dung_cao),
    };

    let unresolvable = false;
    for (const lv of COGNITIVE_LEVELS) {
      let needToBorrow = Math.max(0, effectiveQuotas[lv] - availableByLevel[lv].length);
      if (needToBorrow === 0) continue;

      effectiveQuotas[lv] = availableByLevel[lv].length;
      for (const neighbor of adjacentMap[lv]) {
        if (needToBorrow <= 0) break;
        const canTake = Math.min(needToBorrow, spareByLevel[neighbor]);
        if (canTake > 0) {
          effectiveQuotas[neighbor] += canTake;
          spareByLevel[neighbor] -= canTake;
          needToBorrow -= canTake;
          borrowedFromAdjacent = true;
          borrowedDetails.push({ from: neighbor, to: lv, count: canTake });
        }
      }

      if (needToBorrow > 0) {
        unresolvable = true;
      }
    }

    if (unresolvable || pool.length < totalCount) {
      return {
        ok: false,
        code: 'INSUFFICIENT_QUESTIONS',
        message:
          'Ngay cả khi mượn từ mức độ kề cận, số câu hỏi đã xác minh vẫn không đủ đáp ứng yêu cầu.',
        shortage,
        totalAvailable: pool.length,
        totalRequested: totalCount,
        suggestions: [
          'Giảm tổng số câu hỏi hoặc mở rộng phạm vi chương / học kỳ.',
          'Duyệt thêm câu hỏi từ bản nháp (draft -> verified) trong trang Quản trị Ngân hàng câu hỏi.',
        ],
      };
    }
  }

  // ============================================================================
  // BƯỚC 4: CHỐNG TRÙNG LẶP THEO USER + ROUND-ROBIN THEO CHƯƠNG + SEEDED PRNG
  // ============================================================================
  const { seed: numericSeed, next: random } = createSeededRng(config?.seed);

  // Chỉ lấy lịch sử đề của chính userId hiện tại (N = 3 đề gần nhất)
  const recentWindow = Number(config?.recentExamWindow ?? 3);
  const recentQIds = new Set<string>();
  (existingExams || [])
    .filter((e) => e.userId === userId && Number(e.grade) === grade)
    .slice(0, recentWindow)
    .forEach((e) => (e.questionIds || []).forEach((id: string) => recentQIds.add(id)));

  // Thống kê câu đã làm và câu làm sai từ lịch sử bài làm của chính userId
  const answeredQIds = new Set<string>();
  const wrongQTimestamp = new Map<string, number>();
  (userAttempts || [])
    .filter((a) => a.userId === userId)
    .forEach((att, idx) => {
      const answers = att.answers || {};
      for (const [qId, ans] of Object.entries<any>(answers)) {
        answeredQIds.add(qId);
        if (ans && ans.isCorrect === false) {
          wrongQTimestamp.set(qId, idx);
        }
      }
    });

  const selected: any[] = [];

  for (const lv of COGNITIVE_LEVELS) {
    const quota = effectiveQuotas[lv];
    if (quota <= 0) continue;

    const candidates = availableByLevel[lv].map((q) => {
      // Điểm ưu tiên cá nhân hóa + nhiễu ngẫu nhiên từ PRNG có seed
      let score = random() * 2.0;
      if (!recentQIds.has(q.id)) score += 20;
      if (!answeredQIds.has(q.id)) score += 10;
      if (wrongQTimestamp.has(q.id)) score += 15;

      // Với đề kết hợp (combined): ưu tiên Trắc nghiệm cho NB/TH và Tự luận cho VD/VDC
      if (format === 'combined') {
        if ((lv === 'nhan_biet' || lv === 'thong_hieu') && q.type === 'mcq') score += 5;
        if ((lv === 'van_dung' || lv === 'van_dung_cao') && q.type === 'essay') score += 5;
      }

      return { q, score };
    });

    candidates.sort((a, b) => b.score - a.score);

    // Gom nhóm theo chapterId để lấy theo vòng tròn (Round-Robin) tránh dồn vào 1 chương
    const byChapter = new Map<string, any[]>();
    for (const item of candidates) {
      const chKey = String(item.q.chapterId || 'DEFAULT');
      if (!byChapter.has(chKey)) byChapter.set(chKey, []);
      byChapter.get(chKey)!.push(item.q);
    }

    const chapterQueues = [...byChapter.values()];
    let pickedForLevel = 0;
    let roundIdx = 0;
    while (pickedForLevel < quota && chapterQueues.some((arr) => arr.length > 0)) {
      const queue = chapterQueues[roundIdx % chapterQueues.length];
      if (queue && queue.length > 0) {
        selected.push(queue.shift()!);
        pickedForLevel += 1;
      }
      roundIdx += 1;
    }
  }

  // Sắp xếp câu hỏi trong đề: Trắc nghiệm trước, Tự luận sau; trong mỗi phần từ dễ đến khó
  const levelOrder: Record<CognitiveLevel, number> = {
    nhan_biet: 1,
    thong_hieu: 2,
    van_dung: 3,
    van_dung_cao: 4,
  };
  selected.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'mcq' ? -1 : 1;
    const diffLevel =
      levelOrder[resolveQuestionCognitiveLevel(a)] -
      levelOrder[resolveQuestionCognitiveLevel(b)];
    if (diffLevel !== 0) return diffLevel;
    const scoreA = Number(a.difficultyScore || 5);
    const scoreB = Number(b.difficultyScore || 5);
    return scoreA - scoreB;
  });

  // ============================================================================
  // BƯỚC 5: PHÂN BỔ ĐIỂM SỐ THEO ĐỘ KHÓ & LƯU METADATA THỐNG KÊ (composition)
  // ============================================================================
  const questionPoints = allocateWeightedQuestionPoints(selected);

  const actualCounts: Record<CognitiveLevel, number> = {
    nhan_biet: 0,
    thong_hieu: 0,
    van_dung: 0,
    van_dung_cao: 0,
  };
  const formatCounts = { mcq: 0, essay: 0 };
  const chapterCounts: Record<string, number> = {};

  for (const q of selected) {
    const lv = resolveQuestionCognitiveLevel(q);
    actualCounts[lv] += 1;
    if (q.type === 'mcq') formatCounts.mcq += 1;
    else formatCounts.essay += 1;
    const ch = String(q.chapterId || 'OTHER');
    chapterCounts[ch] = (chapterCounts[ch] || 0) + 1;
  }

  const composition = {
    requestedPreset: presetKey,
    requestedRatios: activeRatios,
    targetCounts,
    actualCounts,
    formatCounts,
    chapterCounts,
    borrowedFromAdjacent,
    borrowedDetails,
    seed: numericSeed,
  };

  return {
    ok: true,
    id: 'EXAM_' + Date.now() + '_' + Math.floor(random() * 1000),
    userId,
    title:
      config?.customTitle ||
      `Đề Kiểm Tra Toán ${grade} (${textbook}) - ${EXAM_MATRIX_PRESETS[presetKey].label}`,
    examCode: String(config?.examCode || (100 + (numericSeed % 899))),
    grade,
    textbook,
    semester: semConstraint || 1,
    category,
    categoryLabel: category,
    difficulty: presetKey,
    format,
    durationMinutes,
    maxScore: 10.0,
    questionIds: selected.map((q) => q.id),
    questions: selected,
    generatedQuestions,
    questionPoints,
    composition,
    seed: numericSeed,
    isFavorite: false,
    isSeed: false,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  };
}

/**
 * Chấm bài thi toàn diện:
 * - Phân loại lỗi thực chất cho cả Trắc nghiệm & Tự luận (không hardcode ID).
 * - Chấm điểm từng phần (Partial Credit) cho câu Tự luận dựa trên rubricSteps.
 */
export function gradeExamAttempt(attempt: any, exam: any, allQuestions: any[]) {
  let mcqScore = 0;
  let essayScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  const gradedAnswers: Record<string, any> = {};
  const wrongItems: Array<{
    questionId: string;
    wrongAnswer: string;
    errorType: string;
    partialPoints?: number;
  }> = [];

  for (const qId of exam.questionIds || []) {
    const q = (allQuestions || []).find((item) => item.id === qId);
    if (!q) continue;
    const maxPts = exam.questionPoints?.[qId]
      ? Number(exam.questionPoints[qId])
      : Number(q.points || 1.0);
    const rec = attempt.answers?.[qId] || { value: '', workings: '', flagged: false };
    const rawVal = String(rec.value || '').trim();
    const rawWorkings = String(rec.workings || '').trim();

    if (!rawVal && !rawWorkings) {
      unansweredCount += 1;
      gradedAnswers[qId] = {
        ...rec,
        isCorrect: false,
        points: 0,
        maxPoints: maxPts,
        matchedReason: 'Chưa trả lời',
      };
    } else if (q.type === 'mcq') {
      const isRight = rawVal.toUpperCase() === String(q.correctAnswer).trim().toUpperCase();
      const pts = isRight ? maxPts : 0;
      if (isRight) {
        mcqScore += pts;
        correctCount += 1;
        gradedAnswers[qId] = {
          ...rec,
          isCorrect: true,
          points: pts,
          maxPoints: maxPts,
          matchedReason: 'Chọn đúng phương án trắc nghiệm',
        };
      } else {
        wrongCount += 1;
        const errorType = classifyAnswerError(rawVal, q);
        wrongItems.push({ questionId: q.id, wrongAnswer: rawVal, errorType });
        gradedAnswers[qId] = {
          ...rec,
          isCorrect: false,
          points: 0,
          maxPoints: maxPts,
          matchedReason: 'Chọn sai phương án trắc nghiệm',
          errorCategory: errorType,
        };
      }
    } else {
      const eq = checkMathEquivalence(rawVal || rawWorkings, q);
      if (eq.isCorrect) {
        essayScore += maxPts;
        correctCount += 1;
        gradedAnswers[qId] = {
          ...rec,
          isCorrect: true,
          points: maxPts,
          maxPoints: maxPts,
          matchedReason: eq.matchedReason,
        };
      } else {
        // Kiểm tra chấm điểm thành phần (Partial Credit) theo rubricSteps
        const partial = evaluateEssayRubricSteps(rawWorkings, rawVal, q, maxPts);
        const awardedPts = partial.partialPoints;
        essayScore += awardedPts;
        wrongCount += 1;

        const errorType = eq.errorCategory || classifyAnswerError(rawVal || rawWorkings, q);
        wrongItems.push({
          questionId: q.id,
          wrongAnswer: rawVal || rawWorkings,
          errorType,
          partialPoints: awardedPts,
        });

        gradedAnswers[qId] = {
          ...rec,
          isCorrect: false,
           isPartial: awardedPts > 0,
          points: awardedPts,
          maxPoints: maxPts,
          matchedReason:
            awardedPts > 0
              ? `Đạt điểm thành phần (${partial.matchedStepsCount}/${partial.totalStepsCount} bước rubric: +${awardedPts}/${maxPts}đ)`
              : eq.matchedReason,
          errorCategory: errorType,
          rubricBreakdown: partial.breakdown,
        };
      }
    }
  }

  const totalScore = Math.min(10.0, Number((mcqScore + essayScore).toFixed(2)));
  return {
    status: 'GRADED',
    submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    totalScore,
    mcqScore: Number(mcqScore.toFixed(2)),
    essayScore: Number(essayScore.toFixed(2)),
    correctCount,
    wrongCount,
    unansweredCount,
    answers: gradedAnswers,
    wrongItems,
  };
}

/**
 * Thuật toán SuperMemo-2 (SM-2) chuẩn tính khoảng cách ôn tập tiếp theo
 */
export function computeSm2Schedule(
  current: { easeFactor?: number; intervalDays?: number; repetitions?: number },
  quality: number
) {
  const q = Math.max(0, Math.min(5, Math.round(Number(quality))));
  let easeFactor = Number(current.easeFactor ?? 2.5);
  let intervalDays = Number(current.intervalDays ?? 1);
  let repetitions = Number(current.repetitions ?? 0);

  if (q >= 3) {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    intervalDays = 1;
  }

  easeFactor = Math.max(
    1.3,
    Number((easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))).toFixed(2))
  );

  const nextReviewAt = new Date(Date.now() + intervalDays * 86400_000).toISOString();
  return {
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewAt,
    resolved: repetitions >= 3,
  };
}
