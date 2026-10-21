// ==============================================================================
// MathMaster THCS - Bộ Mẫu Câu Hỏi Tham Số Hóa (Parametric Question Templates)
// Tự động tính toán đáp án đúng, phương án nhiễu (distractors) và rubricSteps
// bằng hàm Toán học (chống Hallucination 100%).
// Tất cả câu hỏi sinh mới mặc định có verificationStatus = "draft".
// ==============================================================================

import { COGNITIVE_TO_DIFFICULTY, CognitiveLevel } from './math-grader';

export interface ParametricQuestionItem {
  id: string;
  code: string;
  grade: number;
  textbooks: string[];
  semester: number;
  chapterId: string;
  lesson: string;
  topic: string;
  problemType: string;
  type: 'mcq' | 'essay';
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  cognitiveLevel: CognitiveLevel;
  points: number;
  content: string;
  options: Array<{ label: string; text: string; errorType?: string }>;
  correctAnswer: string;
  acceptedAnswers: string[];
  solution: string;
  rubricSteps: Array<{ step: string; points: number }>;
  keyFormula: string;
  commonMistake: string;
  source: string;
  verificationStatus: 'draft' | 'verified';
  version: number;
  mathExpressionToVerify?: string;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

/**
 * Tạo 4 phương án A, B, C, D không trùng lặp từ đáp án đúng và các phương án nhiễu
 */
function buildMcqOptions(
  correctText: string,
  distractors: Array<{ text: string; errorType: string }>,
  correctSlotIndex: number
): {
  options: Array<{ label: string; text: string; errorType?: string }>;
  correctLabel: string;
} {
  const labels = ['A', 'B', 'C', 'D'];
  const used = new Set<string>([correctText.trim().toLowerCase()]);
  const uniqueDistractors: Array<{ text: string; errorType: string }> = [];

  for (const d of distractors) {
    const norm = d.text.trim().toLowerCase();
    if (!used.has(norm)) {
      used.add(norm);
      uniqueDistractors.push(d);
    }
  }

  let fallbackOffset = 1;
  while (uniqueDistractors.length < 3) {
    const candidate = `$${fallbackOffset + 99}$`;
    if (!used.has(candidate)) {
      used.add(candidate);
      uniqueDistractors.push({ text: candidate, errorType: 'CALCULATION_ERROR' });
    }
    fallbackOffset += 1;
  }

  const slot = ((correctSlotIndex % 4) + 4) % 4;
  const options: Array<{ label: string; text: string; errorType?: string }> = [];
  let dIdx = 0;
  for (let i = 0; i < 4; i++) {
    if (i === slot) {
      options.push({ label: labels[i], text: correctText });
    } else {
      const dist = uniqueDistractors[dIdx++];
      options.push({ label: labels[i], text: dist.text, errorType: dist.errorType });
    }
  }

  return { options, correctLabel: labels[slot] };
}

/**
 * Sinh câu hỏi tham số hóa cho một Chương cụ thể (G6_C1..G9_C6), Mức độ nhận thức và Biến thể k
 */
export function buildParametricQuestionForChapter(params: {
  grade: number;
  semester: number;
  chapterId: string;
  cognitiveLevel: CognitiveLevel;
  variantIndex: number; // 1, 2, 3...
  seqNumber: number;
}): ParametricQuestionItem {
  const { grade, semester, chapterId, cognitiveLevel, variantIndex, seqNumber } = params;
  const difficulty = COGNITIVE_TO_DIFFICULTY[cognitiveLevel];
  const isEssay = variantIndex % 3 === 0 || (cognitiveLevel === 'van_dung_cao' && variantIndex % 2 === 0);
  const qType: 'mcq' | 'essay' = isEssay ? 'essay' : 'mcq';
  const points = qType === 'essay' ? 2.0 : 1.0;
  const k = variantIndex; // Tham số biến thiên

  const id = `Q${grade}_TPL_${String(seqNumber).padStart(3, '0')}`;
  const levelShort =
    cognitiveLevel === 'nhan_biet'
      ? 'NB'
      : cognitiveLevel === 'thong_hieu'
      ? 'TH'
      : cognitiveLevel === 'van_dung'
      ? 'VD'
      : 'VDC';
  const code = `M${grade}-HK${semester}-${chapterId.split('_')[1]}-${levelShort}-${String(seqNumber).padStart(2, '0')}`;

  // Mặc định metadata
  let lesson = 'Chuyên đề chuẩn GDPT 2018';
  let topic = 'Đại số & Hình học THCS';
  let problemType = 'Tính giá trị biểu thức';
  let content = '';
  let correctValueStr = '';
  let acceptedAnswers: string[] = [];
  let distractors: Array<{ text: string; errorType: string }> = [];
  let solution = '';
  let rubricSteps: Array<{ step: string; points: number }> = [];
  let keyFormula = '';
  let commonMistake = '';
  let mathExpressionToVerify: string | undefined;

  // ============================================================================
  // KHỐI 6: G6_C1 -> G6_C6
  // ============================================================================
  if (chapterId === 'G6_C1') {
    lesson = 'Lũy thừa với số mũ tự nhiên & ƯCLN - BCNN';
    topic = 'Lũy thừa và thứ tự phép tính';
    if (cognitiveLevel === 'nhan_biet') {
      problemType = 'Tính giá trị biểu thức lũy thừa';
      const base = (k % 3) + 2; // 2, 3, 4
      const exp1 = 2;
      const exp2 = (k % 2) + 1; // 1, 2
      const addVal = k * 3 + 2;
      const powVal = Math.pow(base, exp1 + exp2);
      const ans = powVal + addVal;
      content = `Thực hiện phép tính: $${base}^${exp1} \\cdot ${base}^${exp2} + ${addVal}$.`;
      mathExpressionToVerify = `${base}^${exp1} * ${base}^${exp2} + ${addVal}`;
      correctValueStr = `${ans}`;
      acceptedAnswers = [`${ans}`];
      distractors = [
        { text: `$${Math.pow(base, exp1 * exp2) + addVal}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${base * (exp1 + exp2) + addVal}$`, errorType: 'CONCEPT_ERROR' },
        { text: `$${powVal - addVal}$`, errorType: 'SIGN_ERROR' },
      ];
      solution = `Áp dụng công thức nhân hai lũy thừa cùng cơ số: $${base}^${exp1} \\cdot ${base}^${exp2} = ${base}^{${exp1 + exp2}} = ${powVal}$. Khi đó $${powVal} + ${addVal} = ${ans}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Tính đúng $${base}^${exp1} \\cdot ${base}^${exp2} = ${powVal}$`, points: 1.0 },
              { step: `Cộng ${addVal} được kết quả $${ans}$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng $${powVal} + ${addVal} = ${ans}$`, points: 1.0 }];
      keyFormula = '$a^m \\cdot a^n = a^{m+n}$';
      commonMistake = 'Nhầm công thức nhân hai lũy thừa thành nhân hai số mũ.';
    } else if (cognitiveLevel === 'thong_hieu') {
      problemType = 'Tính giá trị biểu thức lũy thừa';
      const a = k + 3;
      const b = (k % 3) + 2;
      const ans = a * a - b * b;
      content = `Tính giá trị của biểu thức $A = ${a}^2 - ${b}^2$.`;
      mathExpressionToVerify = `${a}^2 - ${b}^2`;
      correctValueStr = `${ans}`;
      acceptedAnswers = [`${ans}`, `A=${ans}`];
      distractors = [
        { text: `$${2 * a - 2 * b}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${a * a + b * b}$`, errorType: 'SIGN_ERROR' },
        { text: `$${(a - b) * (a - b)}$`, errorType: 'FORMULA_ERROR' },
      ];
      solution = `Ta có $${a}^2 = ${a * a}$ và $${b}^2 = ${b * b}$. Suy ra $A = ${a * a} - ${b * b} = ${ans}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Tính đúng $${a}^2 = ${a * a}$ và $${b}^2 = ${b * b}$`, points: 1.0 },
              { step: `Trừ hai kết quả được $A = ${ans}$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng $A = ${a * a} - ${b * b} = ${ans}$`, points: 1.0 }];
      keyFormula = '$a^2 = a \\cdot a$';
      commonMistake = 'Nhầm $a^2 = 2a$ hoặc $(a-b)^2$.';
    } else if (cognitiveLevel === 'van_dung') {
      problemType = 'Bài toán thực tế ƯCLN - BCNN';
      const d = (k + 2) * 4;
      const m = d * 2;
      const n = d * 3;
      const g = gcd(m, n);
      content = `Có $${m}$ quyển vở và $${n}$ chiếc bút bi. Cô giáo muốn chia đều số vở và bút vào các phần thưởng sao cho số phần thưởng là nhiều nhất. Hỏi chia được nhiều nhất bao nhiêu phần thưởng?`;
      correctValueStr = `${g}`;
      acceptedAnswers = [`${g}`];
      distractors = [
        { text: `$${lcm(m, n)}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${g / 2}$`, errorType: 'CALCULATION_ERROR' },
        { text: `$${m + n}$`, errorType: 'CONCEPT_ERROR' },
      ];
      solution = `Số phần thưởng nhiều nhất chính là $\\text{ƯCLN}(${m}, ${n}) = ${g}$ (phần thưởng).`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Lập luận số phần thưởng là $\\text{ƯCLN}(${m}, ${n})$`, points: 1.0 },
              { step: `Tính đúng $\\text{ƯCLN}(${m}, ${n}) = ${g}$`, points: 1.0 },
            ]
          : [{ step: `Tìm đúng $\\text{ƯCLN}(${m}, ${n}) = ${g}$`, points: 1.0 }];
      keyFormula = '$\\text{ƯCLN}(a, b)$';
      commonMistake = 'Nhầm lẫn giữa ƯCLN và BCNN trong bài toán chia phần thưởng.';
    } else {
      problemType = 'Bài toán thực tế ƯCLN - BCNN';
      const a = 6 + (k % 3) * 2; // 6, 8, 10
      const b = 9 + (k % 2) * 3; // 9, 12
      const rem = (k % 3) + 1;
      const l = lcm(a, b);
      const ans = l + rem;
      content = `Tìm số tự nhiên $x$ nhỏ nhất lớn hơn $${rem}$ sao cho khi chia $x$ cho $${a}$ và chia $x$ cho $${b}$ đều có số dư là $${rem}$.`;
      correctValueStr = `${ans}`;
      acceptedAnswers = [`${ans}`, `x=${ans}`];
      distractors = [
        { text: `$${l}$`, errorType: 'MISSING_CONDITION' },
        { text: `$${l - rem}$`, errorType: 'SIGN_ERROR' },
        { text: `$${gcd(a, b) + rem}$`, errorType: 'FORMULA_ERROR' },
      ];
      solution = `Vì $x$ chia cho $${a}$ và $${b}$ đều dư $${rem}$ nên $(x - ${rem}) \\in \\text{BC}(${a}, ${b})$. Để $x > ${rem}$ nhỏ nhất thì $x - ${rem} = \\text{BCNN}(${a}, ${b}) = ${l}$, suy ra $x = ${l} + ${rem} = ${ans}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Suy ra $x - ${rem} = \\text{BCNN}(${a}, ${b}) = ${l}$`, points: 1.0 },
              { step: `Tính đúng $x = ${ans}$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng $x = ${l} + ${rem} = ${ans}$`, points: 1.0 }];
      keyFormula = '$x - r = \\text{BCNN}(a, b)$';
      commonMistake = 'Quên cộng số dư sau khi tìm BCNN hoặc lấy ƯCLN.';
    }
  } else if (chapterId === 'G6_C2') {
    lesson = 'Phép cộng, trừ, nhân số nguyên & Quy tắc dấu ngoặc';
    topic = 'Các phép tính với số nguyên';
    const a = k * 5 + 10;
    const b = k * 3 + 4;
    if (cognitiveLevel === 'nhan_biet') {
      problemType = 'Thực hiện phép tính số nguyên';
      const ans = -a + b;
      content = `Kết quả của phép tính $(- ${a}) + ${b}$ là:`;
      mathExpressionToVerify = `(-${a}) + ${b}`;
      correctValueStr = `${ans}`;
      acceptedAnswers = [`${ans}`];
      distractors = [
        { text: `$${-ans}$`, errorType: 'SIGN_ERROR' },
        { text: `$${-(a + b)}$`, errorType: 'SIGN_ERROR' },
        { text: `$${a + b}$`, errorType: 'SIGN_ERROR' },
      ];
      solution = `Ta có $(- ${a}) + ${b} = -(${a} - ${b}) = ${ans}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Đặt dấu trừ trước ngoặc $-(${a} - ${b})$`, points: 1.0 },
              { step: `Tính đúng kết quả bằng $${ans}$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng $(- ${a}) + ${b} = ${ans}$`, points: 1.0 }];
      keyFormula = '$(-a) + b = -(a - b)$ với $a > b > 0$';
      commonMistake = 'Cộng hai giá trị tuyệt đối hoặc đặt sai dấu của kết quả.';
    } else if (cognitiveLevel === 'thong_hieu') {
      problemType = 'Thực hiện phép tính số nguyên';
      const c = k * 2 + 5;
      const ans = b + c;
      content = `Tính hợp lý giá trị biểu thức $M = (-${a}) + ${b} - (-${a}) + ${c}$.`;
      mathExpressionToVerify = `(-${a}) + ${b} - (-${a}) + ${c}`;
      correctValueStr = `${ans}`;
      acceptedAnswers = [`${ans}`, `M=${ans}`];
      distractors = [
        { text: `$${-2 * a + b + c}$`, errorType: 'SIGN_ERROR' },
        { text: `$${b - c}$`, errorType: 'CALCULATION_ERROR' },
        { text: `$${-ans}$`, errorType: 'SIGN_ERROR' },
      ];
      solution = `Đổi dấu $-(-${a}) = +${a}$, nhóm $[(-${a}) + ${a}] + (${b} + ${c}) = 0 + ${ans} = ${ans}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Đổi dấu $-(-${a}) = +${a}$ và nhóm $(- ${a} + ${a}) = 0$`, points: 1.0 },
              { step: `Tính đúng $M = ${b} + ${c} = ${ans}$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng $M = ${ans}$`, points: 1.0 }];
      keyFormula = '$a - (-b) = a + b$';
      commonMistake = 'Quên đổi dấu khi bỏ ngoặc có dấu trừ đằng trước.';
    } else if (cognitiveLevel === 'van_dung') {
      problemType = 'Tìm số nguyên x';
      const target = -k * 2 - 3;
      const rhs1 = a - target; // x - b = rhs1
      const ans = rhs1 + b;
      content = `Tìm số nguyên $x$, biết: $${a} - (x - ${b}) = ${target}$.`;
      correctValueStr = `${ans}`;
      acceptedAnswers = [`${ans}`, `x=${ans}`];
      distractors = [
        { text: `$${a + target - b}$`, errorType: 'SIGN_ERROR' },
        { text: `$${rhs1 - b}$`, errorType: 'SIGN_ERROR' },
        { text: `$${-ans}$`, errorType: 'SIGN_ERROR' },
      ];
      solution = `Ta có $x - ${b} = ${a} - (${target}) = ${rhs1} \\Rightarrow x = ${rhs1} + ${b} = ${ans}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Biến đổi đúng $x - ${b} = ${rhs1}$`, points: 1.0 },
              { step: `Tính đúng $x = ${ans}$`, points: 1.0 },
            ]
          : [{ step: `Tìm đúng $x = ${ans}$`, points: 1.0 }];
      keyFormula = '$A - (x - B) = C \\Leftrightarrow x - B = A - C$';
      commonMistake = 'Phá ngoặc sai dấu thành $a - x - b$.';
    } else {
      problemType = 'Tìm số nguyên x';
      const nVal = k + 2;
      const sumRoots = 2 * nVal;
      content = `Tìm tổng tất cả các số nguyên $x$ thỏa mãn $(x - ${nVal})^2 = ${(k + 1) * (k + 1)}$.`;
      const r1 = nVal + (k + 1);
      const r2 = nVal - (k + 1);
      correctValueStr = `${sumRoots}`;
      acceptedAnswers = [`${sumRoots}`];
      distractors = [
        { text: `$${r1}$`, errorType: 'MISSING_CONDITION' },
        { text: `$${r2}$`, errorType: 'MISSING_CONDITION' },
        { text: `$0$`, errorType: 'SIGN_ERROR' },
      ];
      solution = `Ta có $(x - ${nVal})^2 = ${(k + 1) * (k + 1)} \\Rightarrow x - ${nVal} = ${k + 1}$ hoặc $x - ${nVal} = -${k + 1}$. Suy ra $x = ${r1}$ hoặc $x = ${r2}$. Tổng các nghiệm là $${r1} + (${r2}) = ${sumRoots}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Xét đủ 2 trường hợp tìm được $x = ${r1}$ và $x = ${r2}$`, points: 1.0 },
              { step: `Tính tổng hai giá trị bằng $${sumRoots}$`, points: 1.0 },
            ]
          : [{ step: `Tìm đủ 2 nghiệm và tính tổng bằng $${sumRoots}$`, points: 1.0 }];
      keyFormula = '$A^2 = B^2 \\Leftrightarrow A = B$ hoặc $A = -B$';
      commonMistake = 'Thiếu trường hợp căn âm khi giải phương trình bình phương (thiếu điều kiện 2 nhánh).';
    }
  } else if (chapterId === 'G6_C3') {
    lesson = 'Chu vi và diện tích tứ giác';
    topic = 'Chu vi và diện tích hình phẳng';
    problemType = 'Tính diện tích và chu vi';
    const w = k + 4;
    const h = k + 7;
    if (cognitiveLevel === 'nhan_biet') {
      const area = w * h;
      content = `Một hình chữ nhật có chiều rộng $${w}\\text{ cm}$ và chiều dài $${h}\\text{ cm}$. Diện tích của hình chữ nhật đó bằng bao nhiêu $\\text{cm}^2$?`;
      mathExpressionToVerify = `${w} * ${h}`;
      correctValueStr = `${area}`;
      acceptedAnswers = [`${area}`, `${area} cm2`];
      distractors = [
        { text: `$${2 * (w + h)}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${w + h}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${area + w}$`, errorType: 'CALCULATION_ERROR' },
      ];
      solution = `Diện tích hình chữ nhật là $S = ${w} \\cdot ${h} = ${area}\\text{ (cm}^2\\text{)}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Viết đúng công thức diện tích $S = a \\cdot b$`, points: 1.0 },
              { step: `Thay số tính được $S = ${area}\\text{ cm}^2$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng diện tích $S = ${area}\\text{ cm}^2$`, points: 1.0 }];
      keyFormula = 'Diện tích $S = a \\cdot b$';
      commonMistake = 'Nhầm công thức diện tích sang công thức chu vi $2(a+b)$.';
    } else if (cognitiveLevel === 'thong_hieu') {
      const d1 = 2 * (k + 2);
      const d2 = 2 * (k + 5);
      const area = (d1 * d2) / 2;
      content = `Tính diện tích của hình thoi có độ dài hai đường chéo lần lượt là $${d1}\\text{ cm}$ và $${d2}\\text{ cm}$.`;
      mathExpressionToVerify = `(${d1} * ${d2}) / 2`;
      correctValueStr = `${area}`;
      acceptedAnswers = [`${area}`];
      distractors = [
        { text: `$${d1 * d2}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${d1 + d2}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${2 * (d1 + d2)}$`, errorType: 'FORMULA_ERROR' },
      ];
      solution = `Diện tích hình thoi là $S = \\frac{1}{2} \\cdot ${d1} \\cdot ${d2} = ${area}\\text{ (cm}^2\\text{)}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Áp dụng công thức $S = \\frac{1}{2} d_1 d_2$`, points: 1.0 },
              { step: `Tính đúng $S = ${area}\\text{ cm}^2$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng $S = ${area}\\text{ cm}^2$`, points: 1.0 }];
      keyFormula = 'Diện tích hình thoi: $S = \\frac{1}{2} d_1 d_2$';
      commonMistake = 'Quên chia $2$ khi tính diện tích hình thoi theo hai đường chéo.';
    } else if (cognitiveLevel === 'van_dung') {
      const b1 = k + 5;
      const b2 = k + 9;
      const height = 4;
      const area = ((b1 + b2) * height) / 2;
      content = `Một mảnh vườn hình thang cân có đáy nhỏ $${b1}\\text{ m}$, đáy lớn $${b2}\\text{ m}$ và chiều cao $${height}\\text{ m}$. Tính diện tích mảnh vườn đó (đơn vị $\\text{m}^2$).`;
      mathExpressionToVerify = `((${b1} + ${b2}) * ${height}) / 2`;
      correctValueStr = `${area}`;
      acceptedAnswers = [`${area}`];
      distractors = [
        { text: `$${(b1 + b2) * height}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${b1 * b2 * height}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${area + 10}$`, errorType: 'CALCULATION_ERROR' },
      ];
      solution = `Diện tích hình thang là $S = \\frac{(${b1} + ${b2}) \\cdot ${height}}{2} = ${area}\\text{ (m}^2\\text{)}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Tính tổng hai đáy $${b1} + ${b2} = ${b1 + b2}\\text{ m}$`, points: 1.0 },
              { step: `Tính diện tích $S = ${area}\\text{ m}^2$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng $S = ${area}\\text{ m}^2$`, points: 1.0 }];
      keyFormula = 'Diện tích hình thang: $S = \\frac{(a + b) \\cdot h}{2}$';
      commonMistake = 'Quên chia đôi tổng hai đáy nhân chiều cao.';
    } else {
      problemType = 'Bài toán lát gạch và tính chi phí thực tế';
      const roomW = 4;
      const roomL = k + 5;
      const areaM2 = roomW * roomL;
      const tiles = areaM2 * 4; // gạch 50cm x 50cm = 0.25m2 -> 4 viên / 1 m2
      content = `Một căn phòng hình chữ nhật có chiều rộng $${roomW}\\text{ m}$, chiều dài $${roomL}\\text{ m}$. Người ta lát kín nền phòng bằng các viên gạch hình vuông cạnh $50\\text{ cm}$ (coi mạch vữa không đáng kể). Hỏi cần bao nhiêu viên gạch?`;
      correctValueStr = `${tiles}`;
      acceptedAnswers = [`${tiles}`];
      distractors = [
        { text: `$${areaM2}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${areaM2 * 2}$`, errorType: 'CALCULATION_ERROR' },
        { text: `$${tiles * 10}$`, errorType: 'CALCULATION_ERROR' },
      ];
      solution = `Diện tích căn phòng là $S = ${roomW} \\cdot ${roomL} = ${areaM2}\\text{ m}^2$. Mỗi viên gạch cạnh $0{,}5\\text{ m}$ có diện tích $0{,}25\\text{ m}^2$. Số viên gạch cần dùng là $${areaM2} : 0{,}25 = ${tiles}$ (viên).`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Tính diện tích nền phòng $S = ${areaM2}\\text{ m}^2$ và diện tích 1 viên gạch $0{,}25\\text{ m}^2$`, points: 1.0 },
              { step: `Tính số viên gạch $${areaM2} : 0{,}25 = ${tiles}$ viên`, points: 1.0 },
            ]
          : [{ step: `Tính đúng số viên gạch là $${tiles}$`, points: 1.0 }];
      keyFormula = 'Số viên gạch: $N = S_1 : S_2$';
      commonMistake = 'Không đổi đồng nhất đơn vị từ cm sang m trước khi chia diện tích.';
    }
  } else if (chapterId === 'G6_C4') {
    lesson = 'Các phép tính với phân số & Tỉ số phần trăm';
    topic = 'Phép tính phân số & Tìm x';
    const den = k + 3;
    if (cognitiveLevel === 'nhan_biet') {
      problemType = 'Tính nhanh biểu thức phân số';
      const n1 = k + 1;
      const n2 = 2;
      const sumNum = n1 + n2;
      content = `Tính tổng hai phân số cùng mẫu: $\\frac{${n1}}{${den}} + \\frac{${n2}}{${den}}$ (viết kết quả dưới dạng phân số hoặc số nguyên).`;
      mathExpressionToVerify = `(${n1}/${den}) + (${n2}/${den})`;
      correctValueStr = sumNum === den ? '1' : `${sumNum}/${den}`;
      acceptedAnswers = [correctValueStr, `\\frac{${sumNum}}{${den}}`];
      distractors = [
        { text: `$\\frac{${sumNum}}{${2 * den}}$`, errorType: 'FORMULA_ERROR' },
        { text: `$\\frac{${n1 * n2}}{${den}}$`, errorType: 'FORMULA_ERROR' },
        { text: `$\\frac{${Math.abs(n1 - n2)}}{${den}}$`, errorType: 'SIGN_ERROR' },
      ];
      solution = `Cộng hai phân số cùng mẫu: $\\frac{${n1}}{${den}} + \\frac{${n2}}{${den}} = \\frac{${n1} + ${n2}}{${den}} = \\frac{${sumNum}}{${den}}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Cộng tử số giữ nguyên mẫu số $\\frac{${n1} + ${n2}}{${den}}$`, points: 1.0 },
              { step: `Rút gọn được kết quả $${correctValueStr}$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng kết quả $${correctValueStr}$`, points: 1.0 }];
      keyFormula = '$\\frac{a}{m} + \\frac{b}{m} = \\frac{a+b}{m}$';
      commonMistake = 'Cộng cả tử với tử và mẫu với mẫu.';
    } else if (cognitiveLevel === 'thong_hieu') {
      problemType = 'Tìm một số biết giá trị phân số của nó';
      const unitVal = (k + 2) * 5;
      const num = 3;
      const denom = 5;
      const partVal = unitVal * num;
      const wholeVal = unitVal * denom;
      content = `Tìm một số biết $\\frac{${num}}{${denom}}$ của số đó bằng $${partVal}$.`;
      correctValueStr = `${wholeVal}`;
      acceptedAnswers = [`${wholeVal}`];
      distractors = [
        { text: `$${(partVal * num) / denom}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${partVal + denom}$`, errorType: 'CONCEPT_ERROR' },
        { text: `$${unitVal}$`, errorType: 'CALCULATION_ERROR' },
      ];
      solution = `Số cần tìm là $${partVal} : \\frac{${num}}{${denom}} = ${partVal} \\cdot \\frac{${denom}}{${num}} = ${wholeVal}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Lập phép chia $${partVal} : \\frac{${num}}{${denom}}$`, points: 1.0 },
              { step: `Tính đúng kết quả bằng $${wholeVal}$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng số cần tìm là $${wholeVal}$`, points: 1.0 }];
      keyFormula = 'Muốn tìm một số biết $\\frac{m}{n}$ của nó bằng $a$, ta tính $a : \\frac{m}{n}$.';
      commonMistake = 'Nhầm sang bài toán tìm giá trị phân số của một số (lấy $a \\cdot \\frac{m}{n}$).';
    } else if (cognitiveLevel === 'van_dung') {
      problemType = 'Bài toán giảm giá phần trăm';
      const origPrice = (k + 2) * 100; // nghìn đồng
      const discountPct = 20;
      const finalPrice = (origPrice * (100 - discountPct)) / 100;
      content = `Một cuốn sách có giá bìa $${origPrice}$ nghìn đồng. Nhân dịp khai giảng, nhà sách giảm giá $${discountPct}\\%$. Hỏi giá bán cuốn sách sau khi giảm là bao nhiêu nghìn đồng?`;
      correctValueStr = `${finalPrice}`;
      acceptedAnswers = [`${finalPrice}`];
      distractors = [
        { text: `$${(origPrice * discountPct) / 100}$`, errorType: 'MISSING_CONDITION' },
        { text: `$${origPrice - discountPct}$`, errorType: 'CONCEPT_ERROR' },
        { text: `$${origPrice + (origPrice * discountPct) / 100}$`, errorType: 'SIGN_ERROR' },
      ];
      solution = `Giá sau khi giảm bằng $100\\% - ${discountPct}\\% = 80\\%$ giá bìa, tức là $${origPrice} \\cdot 0{,}8 = ${finalPrice}$ (nghìn đồng).`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Tính số tiền được giảm $${(origPrice * discountPct) / 100}$ nghìn đồng`, points: 1.0 },
              { step: `Tính giá sau giảm $${finalPrice}$ nghìn đồng`, points: 1.0 },
            ]
          : [{ step: `Tính đúng giá sau giảm là $${finalPrice}$ nghìn đồng`, points: 1.0 }];
      keyFormula = 'Giá sau giảm: $G = G_0 \\cdot (1 - p\\%)$';
      commonMistake = 'Chỉ tính số tiền được giảm mà quên trừ vào giá gốc.';
    } else {
      problemType = 'Tính nhanh biểu thức phân số';
      const nLast = k + 4;
      // S = 1/(1.2) + 1/(2.3) + ... + 1/(nLast*(nLast+1)) = nLast/(nLast+1)
      content = `Tính giá trị biểu thức $S = \\frac{1}{1 \\cdot 2} + \\frac{1}{2 \\cdot 3} + \\dots + \\frac{1}{${nLast} \\cdot ${nLast + 1}}$.`;
      correctValueStr = `${nLast}/${nLast + 1}`;
      acceptedAnswers = [`${nLast}/${nLast + 1}`, `\\frac{${nLast}}{${nLast + 1}}`];
      distractors = [
        { text: `$\\frac{1}{${nLast + 1}}$`, errorType: 'FORMULA_ERROR' },
        { text: `$\\frac{${nLast - 1}}{${nLast}}$`, errorType: 'CALCULATION_ERROR' },
        { text: `$1$`, errorType: 'CONCEPT_ERROR' },
      ];
      solution = `Áp dụng công thức $\\frac{1}{k(k+1)} = \\frac{1}{k} - \\frac{1}{k+1}$, ta khử liên tiếp được $S = 1 - \\frac{1}{${nLast + 1}} = \\frac{${nLast}}{${nLast + 1}}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Tách mỗi số hạng $\\frac{1}{k(k+1)} = \\frac{1}{k} - \\frac{1}{k+1}$`, points: 1.0 },
              { step: `Rút gọn $S = 1 - \\frac{1}{${nLast + 1}} = \\frac{${nLast}}{${nLast + 1}}$`, points: 1.0 },
            ]
          : [{ step: `Rút gọn đúng $S = \\frac{${nLast}}{${nLast + 1}}$`, points: 1.0 }];
      keyFormula = '$\\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}$';
      commonMistake = 'Quên quy đồng bước cuối $1 - \\frac{1}{n+1}$.';
    }
  } else if (chapterId === 'G6_C5') {
    lesson = 'Đoạn thẳng, Trung điểm của đoạn thẳng & Góc';
    topic = 'Đoạn thẳng và trung điểm';
    problemType = 'Tính độ dài đoạn thẳng và trung điểm';
    const half = k + 3;
    const totalLen = 2 * half;
    if (cognitiveLevel === 'nhan_biet') {
      content = `Cho đoạn thẳng $AB = ${totalLen}\\text{ cm}$. Gọi $M$ là trung điểm của đoạn thẳng $AB$. Độ dài đoạn thẳng $AM$ bằng bao nhiêu $\\text{cm}$?`;
      mathExpressionToVerify = `${totalLen} / 2`;
      correctValueStr = `${half}`;
      acceptedAnswers = [`${half}`, `${half} cm`];
      distractors = [
        { text: `$${totalLen * 2}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${totalLen}$`, errorType: 'CONCEPT_ERROR' },
        { text: `$${half - 1}$`, errorType: 'CALCULATION_ERROR' },
      ];
      solution = `Vì $M$ là trung điểm của $AB$ nên $AM = \\frac{AB}{2} = \\frac{${totalLen}}{2} = ${half}\\text{ (cm)}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Nêu công thức trung điểm $AM = \\frac{AB}{2}$`, points: 1.0 },
              { step: `Tính đúng $AM = ${half}\\text{ cm}$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng $AM = ${half}\\text{ cm}$`, points: 1.0 }];
      keyFormula = '$AM = MB = \\frac{AB}{2}$';
      commonMistake = 'Nhân đôi độ dài đoạn thẳng thay vì chia đôi.';
    } else if (cognitiveLevel === 'thong_hieu') {
      const oa = k + 2;
      const ob = oa + k + 4;
      const ab = ob - oa;
      content = `Trên tia $Ox$ lấy hai điểm $A$ và $B$ sao cho $OA = ${oa}\\text{ cm}$, $OB = ${ob}\\text{ cm}$. Tính độ dài đoạn thẳng $AB$ (đơn vị $\\text{cm}$).`;
      mathExpressionToVerify = `${ob} - ${oa}`;
      correctValueStr = `${ab}`;
      acceptedAnswers = [`${ab}`, `${ab} cm`];
      distractors = [
        { text: `$${oa + ob}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${ob * 2}$`, errorType: 'CALCULATION_ERROR' },
        { text: `$${ab + 2}$`, errorType: 'CALCULATION_ERROR' },
      ];
      solution = `Vì $A, B$ cùng thuộc tia $Ox$ và $OA < OB$ ($${oa} < ${ob}$) nên điểm $A$ nằm giữa $O$ và $B$. Suy ra $AB = OB - OA = ${ob} - ${oa} = ${ab}\\text{ (cm)}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Chỉ ra điểm $A$ nằm giữa $O$ và $B$ do $OA < OB$`, points: 1.0 },
              { step: `Tính đúng $AB = ${ob} - ${oa} = ${ab}\\text{ cm}$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng $AB = ${ab}\\text{ cm}$`, points: 1.0 }];
      keyFormula = '$OA + AB = OB \\Rightarrow AB = OB - OA$';
      commonMistake = 'Cộng $OA + OB$ thay vì lấy $OB - OA$.';
    } else if (cognitiveLevel === 'van_dung') {
      const oa = 2 * k + 2;
      const ob = 2 * k + 8;
      const ab = ob - oa;
      const om = oa + ab / 2;
      content = `Trên tia $Ox$ lấy hai điểm $A, B$ sao cho $OA = ${oa}\\text{ cm}, OB = ${ob}\\text{ cm}$. Gọi $M$ là trung điểm của đoạn thẳng $AB$. Tính độ dài đoạn thẳng $OM$ (đơn vị $\\text{cm}$).`;
      correctValueStr = `${om}`;
      acceptedAnswers = [`${om}`];
      distractors = [
        { text: `$${ab / 2}$`, errorType: 'MISSING_CONDITION' },
        { text: `$${ab}$`, errorType: 'CALCULATION_ERROR' },
        { text: `$${oa + ob}$`, errorType: 'FORMULA_ERROR' },
      ];
      solution = `Ta có $AB = OB - OA = ${ob} - ${oa} = ${ab}\\text{ cm}$. Vì $M$ là trung điểm của $AB$ nên $AM = ${ab / 2}\\text{ cm}$. Do $A$ nằm giữa $O$ và $M$ nên $OM = OA + AM = ${oa} + ${ab / 2} = ${om}\\text{ cm}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Tính đúng $AB = ${ab}\\text{ cm}$ và $AM = ${ab / 2}\\text{ cm}$`, points: 1.0 },
              { step: `Tính đúng $OM = OA + AM = ${om}\\text{ cm}$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng $OM = ${om}\\text{ cm}$`, points: 1.0 }];
      keyFormula = '$OM = \\frac{OA + OB}{2}$';
      commonMistake = 'Dừng lại ở bước tính $AM$ mà quên cộng thêm $OA$.';
    } else {
      const nPoints = k + 5;
      const numSegs = (nPoints * (nPoints - 1)) / 2;
      content = `Cho $${nPoints}$ điểm phân biệt cùng nằm trên một đường thẳng. Hỏi có tất cả bao nhiêu đoạn thẳng có hai đầu mút là hai trong $${nPoints}$ điểm đã cho?`;
      mathExpressionToVerify = `(${nPoints} * (${nPoints} - 1)) / 2`;
      correctValueStr = `${numSegs}`;
      acceptedAnswers = [`${numSegs}`];
      distractors = [
        { text: `$${nPoints * (nPoints - 1)}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${nPoints - 1}$`, errorType: 'CONCEPT_ERROR' },
        { text: `$${2 * nPoints}$`, errorType: 'FORMULA_ERROR' },
      ];
      solution = `Mỗi điểm nối với $${nPoints - 1}$ điểm còn lại tạo thành đoạn thẳng, nhưng mỗi đoạn được tính $2$ lần nên số đoạn thẳng là $\\frac{${nPoints} \\cdot (${nPoints} - 1)}{2} = ${numSegs}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Áp dụng công thức đếm đoạn thẳng $\\frac{n(n-1)}{2}$`, points: 1.0 },
              { step: `Thay $n = ${nPoints}$ tính được $${numSegs}$ đoạn thẳng`, points: 1.0 },
            ]
          : [{ step: `Tính đúng số đoạn thẳng là $${numSegs}$`, points: 1.0 }];
      keyFormula = 'Số đoạn thẳng: $N = \\frac{n(n-1)}{2}$';
      commonMistake = 'Quên chia $2$ dẫn đến đếm lặp mỗi đoạn thẳng $2$ lần.';
    }
  } else if (chapterId === 'G6_C6') {
    lesson = 'Bảng thống kê & Xác suất thực nghiệm';
    topic = 'Tính xác suất thực nghiệm';
    problemType = 'Tính xác suất thực nghiệm qua phép thử';
    const totalTrials = 20 * ((k % 3) + 1);
    const fav = 5 * ((k % 3) + 1);
    const g = gcd(fav, totalTrials);
    const simpNum = fav / g;
    const simpDen = totalTrials / g;
    if (cognitiveLevel === 'nhan_biet' || cognitiveLevel === 'thong_hieu') {
      content = `Gieo một đồng xu cân đối $${totalTrials}$ lần liên tiếp, thấy có $${fav}$ lần xuất hiện mặt Ngửa (N). Xác suất thực nghiệm xuất hiện mặt Ngửa bằng bao nhiêu?`;
      correctValueStr = `${simpNum}/${simpDen}`;
      acceptedAnswers = [`${simpNum}/${simpDen}`, `${fav}/${totalTrials}`, `${fav / totalTrials}`];
      distractors = [
        { text: `$\\frac{${simpDen - simpNum}}{${simpDen}}$`, errorType: 'CONCEPT_ERROR' },
        { text: `$\\frac{${simpDen}}{${simpNum}}$`, errorType: 'FORMULA_ERROR' },
        { text: `$\\frac{1}{${totalTrials}}$`, errorType: 'CALCULATION_ERROR' },
      ];
      solution = `Xác suất thực nghiệm xuất hiện mặt Ngửa là $\\frac{${fav}}{${totalTrials}} = \\frac{${simpNum}}{${simpDen}}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Lập tỉ số $\\frac{n(A)}{n} = \\frac{${fav}}{${totalTrials}}$`, points: 1.0 },
              { step: `Rút gọn phân số tối giản được $\\frac{${simpNum}}{${simpDen}}$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng xác suất thực nghiệm $\\frac{${simpNum}}{${simpDen}}$`, points: 1.0 }];
      keyFormula = '$P = \\frac{n(A)}{n}$';
      commonMistake = 'Lấy tổng số phép thử chia cho số lần xuất hiện sự kiện.';
    } else {
      const otherFav = totalTrials - fav;
      const g2 = gcd(otherFav, totalTrials);
      const sNum = otherFav / g2;
      const sDen = totalTrials / g2;
      content = `Trong một hộp có các quả bóng xanh và đỏ. Lấy ngẫu nhiên một quả bóng, xem màu rồi trả lại hộp. Lặp lại phép thử $${totalTrials}$ lần thì thấy có $${fav}$ lần lấy được bóng xanh. Tính xác suất thực nghiệm của sự kiện "Lấy được quả bóng màu đỏ".`;
      correctValueStr = `${sNum}/${sDen}`;
      acceptedAnswers = [`${sNum}/${sDen}`, `${otherFav}/${totalTrials}`, `${otherFav / totalTrials}`];
      distractors = [
        { text: `$\\frac{${simpNum}}{${simpDen}}$`, errorType: 'MISSING_CONDITION' },
        { text: `$\\frac{${fav}}{${otherFav}}$`, errorType: 'FORMULA_ERROR' },
        { text: `$\\frac{1}{2}$`, errorType: 'CONCEPT_ERROR' },
      ];
      solution = `Số lần lấy được bóng đỏ là $${totalTrials} - ${fav} = ${otherFav}$ (lần). Xác suất thực nghiệm lấy được bóng đỏ là $\\frac{${otherFav}}{${totalTrials}} = \\frac{${sNum}}{${sDen}}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Tính số lần xuất hiện bóng đỏ: $${totalTrials} - ${fav} = ${otherFav}$`, points: 1.0 },
              { step: `Tính xác suất thực nghiệm $\\frac{${otherFav}}{${totalTrials}} = \\frac{${sNum}}{${sDen}}$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng xác suất $\\frac{${sNum}}{${sDen}}$`, points: 1.0 }];
      keyFormula = '$P(B) = \\frac{n - n(A)}{n}$';
      commonMistake = 'Lấy nhầm số lần xuất hiện bóng xanh thay vì trừ đi để tìm số lần bóng đỏ.';
    }
  }

  // ============================================================================
  // KHỐI 7: G7_C1 -> G7_C6
  // ============================================================================
  else if (chapterId === 'G7_C1') {
    lesson = 'Các phép tính số hữu tỉ & Quy tắc chuyển vế';
    topic = 'Các phép tính số hữu tỉ';
    if (cognitiveLevel === 'nhan_biet' || cognitiveLevel === 'thong_hieu') {
      problemType = 'Tính hợp lý biểu thức số hữu tỉ';
      const base = 2;
      const exp = (k % 3) + 2; // 2, 3, 4
      const val = Math.pow(base, exp);
      content = `Tính giá trị của lũy thừa số hữu tỉ $\\left(\\frac{1}{${base}}\\right)^${exp} \\cdot ${base}^${exp + 1}$.`;
      mathExpressionToVerify = `(1/${base})^${exp} * ${base}^(${exp + 1})`;
      correctValueStr = `${base}`;
      acceptedAnswers = [`${base}`];
      distractors = [
        { text: `$1$`, errorType: 'CALCULATION_ERROR' },
        { text: `$${val}$`, errorType: 'FORMULA_ERROR' },
        { text: `$\\frac{1}{${base}}$`, errorType: 'FORMULA_ERROR' },
      ];
      solution = `Ta có $\\left(\\frac{1}{${base}}\\right)^${exp} \\cdot ${base}^${exp + 1} = \\frac{1}{${val}} \\cdot ${val * base} = ${base}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Viết $\\left(\\frac{1}{${base}}\\right)^${exp} = \\frac{1}{${val}}$`, points: 1.0 },
              { step: `Nhân với $${base}^{${exp + 1}}$ rút gọn được $${base}$`, points: 1.0 },
            ]
          : [{ step: `Rút gọn đúng bằng $${base}$`, points: 1.0 }];
      keyFormula = '$\\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n}$';
      commonMistake = 'Cộng sai số mũ khi nhân hai lũy thừa.';
    } else {
      problemType = 'Tìm x trong đẳng thức hữu tỉ';
      const a = k + 2;
      const b = 2 * k + 5;
      const xVal = b - a;
      content = `Tìm số hữu tỉ $x$, biết: $2x + ${a} = x + ${b}$.`;
      correctValueStr = `${xVal}`;
      acceptedAnswers = [`${xVal}`, `x=${xVal}`];
      distractors = [
        { text: `$${a + b}$`, errorType: 'SIGN_ERROR' },
        { text: `$${-xVal}$`, errorType: 'SIGN_ERROR' },
        { text: `$${(b - a) / 3}$`, errorType: 'SIGN_ERROR' },
      ];
      solution = `Áp dụng quy tắc chuyển vế: $2x - x = ${b} - ${a} \\Rightarrow x = ${xVal}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Chuyển vế đổi dấu đúng $2x - x = ${b} - ${a}$`, points: 1.0 },
              { step: `Thu gọn được $x = ${xVal}$`, points: 1.0 },
            ]
          : [{ step: `Tìm đúng $x = ${xVal}$`, points: 1.0 }];
      keyFormula = '$A + B = C \\Leftrightarrow A = C - B$';
      commonMistake = 'Chuyển vế nhưng quên đổi dấu hạng tử.';
    }
  } else if (chapterId === 'G7_C2') {
    lesson = 'Căn bậc hai số học & Giá trị tuyệt đối của số thực';
    topic = 'Căn bậc hai số học';
    const m = k + 3;
    const sq = m * m;
    if (cognitiveLevel === 'nhan_biet' || cognitiveLevel === 'thong_hieu') {
      problemType = 'Tính biểu thức chứa căn bậc hai và trị tuyệt đối';
      const absTerm = k + 2;
      const ans = m + absTerm;
      content = `Tính giá trị biểu thức $P = \\sqrt{${sq}} + |-${absTerm}|$.`;
      mathExpressionToVerify = `sqrt(${sq}) + ${absTerm}`;
      correctValueStr = `${ans}`;
      acceptedAnswers = [`${ans}`, `P=${ans}`];
      distractors = [
        { text: `$${m - absTerm}$`, errorType: 'SIGN_ERROR' },
        { text: `$${sq + absTerm}$`, errorType: 'CONCEPT_ERROR' },
        { text: `$${-ans}$`, errorType: 'SIGN_ERROR' },
      ];
      solution = `Vì $\\sqrt{${sq}} = ${m}$ và $|-${absTerm}| = ${absTerm}$ nên $P = ${m} + ${absTerm} = ${ans}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Tính đúng $\\sqrt{${sq}} = ${m}$ và $|-${absTerm}| = ${absTerm}$`, points: 1.0 },
              { step: `Cộng hai kết quả được $P = ${ans}$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng $P = ${ans}$`, points: 1.0 }];
      keyFormula = '$\\sqrt{a^2} = a$ ($a \\ge 0$) và $|-b| = b$ ($b > 0$)';
      commonMistake = 'Giữ nguyên dấu âm của giá trị tuyệt đối $|-a| = -a$.';
    } else {
      problemType = 'Tìm GTNN chứa dấu giá trị tuyệt đối';
      const shift = k + 1;
      const minVal = k * 3 + 4;
      content = `Tìm giá trị nhỏ nhất của biểu thức $A = |x - ${shift}| + ${minVal}$.`;
      correctValueStr = `${minVal}`;
      acceptedAnswers = [`${minVal}`, `min A = ${minVal}`];
      distractors = [
        { text: `$${shift}$`, errorType: 'CONCEPT_ERROR' },
        { text: `$${minVal - shift}$`, errorType: 'SIGN_ERROR' },
        { text: `$0$`, errorType: 'CONCEPT_ERROR' },
      ];
      solution = `Vì $|x - ${shift}| \\ge 0$ với mọi $x \\in \\mathbb{R}$ nên $A = |x - ${shift}| + ${minVal} \\ge ${minVal}$. Dấu "$=$" xảy ra khi $x = ${shift}$. Vậy $\\min A = ${minVal}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Đánh giá $|x - ${shift}| \\ge 0 \\Rightarrow A \\ge ${minVal}$`, points: 1.0 },
              { step: `Chỉ ra dấu bằng khi $x = ${shift}$ và kết luận $\\min A = ${minVal}$`, points: 1.0 },
            ]
          : [{ step: `Tìm đúng $\\min A = ${minVal}$`, points: 1.0 }];
      keyFormula = '$|f(x)| + c \\ge c$ với mọi $x$';
      commonMistake = 'Nhầm giá trị của $x$ làm biểu thức đạt GTNN với chính GTNN của biểu thức.';
    }
  } else if (chapterId === 'G7_C3') {
    lesson = 'Hai đường thẳng song song và tính chất';
    topic = 'Dấu hiệu và tính chất hai đường thẳng song song';
    problemType = 'Tính số đo góc dựa vào song song';
    const angleA = 50 + (k % 5) * 10; // 50, 60, 70, 80, 90
    if (cognitiveLevel === 'nhan_biet' || cognitiveLevel === 'thong_hieu') {
      const suppAngle = 180 - angleA;
      content = `Cho hai đường thẳng song song $a \\parallel b$. Đường thẳng $c$ cắt $a$ tại $A$ và cắt $b$ tại $B$. Biết một góc trong bằng $${angleA}^\\circ$, số đo góc trong cùng phía với góc đó bằng bao nhiêu độ?`;
      mathExpressionToVerify = `180 - ${angleA}`;
      correctValueStr = `${suppAngle}`;
      acceptedAnswers = [`${suppAngle}`];
      distractors = [
        { text: `$${angleA}$`, errorType: 'CONCEPT_ERROR' },
        { text: `$${90 - (angleA % 90)}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${suppAngle + 10}$`, errorType: 'CALCULATION_ERROR' },
      ];
      solution = `Vì $a \\parallel b$ nên hai góc trong cùng phía bù nhau, số đo góc cần tìm là $180^\\circ - ${angleA}^\\circ = ${suppAngle}^\\circ$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Nêu tính chất hai góc trong cùng phía bù nhau khi $a \\parallel b$`, points: 1.0 },
              { step: `Tính đúng $180^\\circ - ${angleA}^\\circ = ${suppAngle}^\\circ$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng góc trong cùng phía bằng $${suppAngle}^\\circ$`, points: 1.0 }];
      keyFormula = '$\\widehat{A}_1 + \\widehat{B}_2 = 180^\\circ$ (hai góc trong cùng phía)';
      commonMistake = 'Nhầm hai góc trong cùng phía bằng nhau (nhầm sang hai góc so le trong).';
    } else {
      const halfAngle = angleA / 2;
      content = `Cho góc $\\widehat{xOy} = ${angleA}^\\circ$. Tia $Oz$ là tia phân giác của góc $\\widehat{xOy}$. Từ điểm $M$ trên tia $Ox$ kẻ đường thẳng song song với $Oy$ cắt tia $Oz$ tại $N$. Tính số đo góc $\\widehat{MNO}$ (đơn vị độ).`;
      mathExpressionToVerify = `${angleA} / 2`;
      correctValueStr = `${halfAngle}`;
      acceptedAnswers = [`${halfAngle}`];
      distractors = [
        { text: `$${angleA}$`, errorType: 'MISSING_CONDITION' },
        { text: `$${180 - angleA}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${180 - halfAngle}$`, errorType: 'FORMULA_ERROR' },
      ];
      solution = `Vì $Oz$ là tia phân giác của $\\widehat{xOy}$ nên $\\widehat{zOy} = \\frac{${angleA}^\\circ}{2} = ${halfAngle}^\\circ$. Do $MN \\parallel Oy$ nên $\\widehat{MNO} = \\widehat{zOy} = ${halfAngle}^\\circ$ (hai góc so le trong).`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Tính đúng $\\widehat{zOy} = \\frac{${angleA}^\\circ}{2} = ${halfAngle}^\\circ$`, points: 1.0 },
              { step: `Dùng so le trong suy ra $\\widehat{MNO} = ${halfAngle}^\\circ$`, points: 1.0 },
            ]
          : [{ step: `Tính đúng $\\widehat{MNO} = ${halfAngle}^\\circ$`, points: 1.0 }];
      keyFormula = 'Tia phân giác chia đôi góc & hai góc so le trong bằng nhau.';
      commonMistake = 'Quên chia đôi góc khi sử dụng tính chất tia phân giác.';
    }
  } else if (chapterId === 'G7_C4') {
    lesson = 'Tỉ lệ thức & Tính chất dãy tỉ số bằng nhau';
    topic = 'Tỉ lệ thức và dãy tỉ số bằng nhau';
    problemType = 'Tìm x, y, z bằng tính chất dãy tỉ số bằng nhau';
    const ratioK = k + 2;
    const rA = 2;
    const rB = 3;
    const xVal = rA * ratioK;
    const yVal = rB * ratioK;
    const sumXY = xVal + yVal;
    content = `Tìm hai số $x, y$ biết $\\frac{x}{${rA}} = \\frac{y}{${rB}}$ và $x + y = ${sumXY}$. Giá trị của $x$ bằng bao nhiêu?`;
    correctValueStr = `${xVal}`;
    acceptedAnswers = [`${xVal}`, `x=${xVal}`];
    distractors = [
      { text: `$${yVal}$`, errorType: 'CALCULATION_ERROR' },
      { text: `$${ratioK}$`, errorType: 'MISSING_CONDITION' },
      { text: `$${sumXY - rA}$`, errorType: 'FORMULA_ERROR' },
    ];
    solution = `Áp dụng tính chất dãy tỉ số bằng nhau: $\\frac{x}{${rA}} = \\frac{y}{${rB}} = \\frac{x+y}{${rA}+${rB}} = \\frac{${sumXY}}{5} = ${ratioK}$. Suy ra $x = ${rA} \\cdot ${ratioK} = ${xVal}$.`;
    rubricSteps =
      points === 2.0
        ? [
            { step: `Áp dụng dãy tỉ số bằng nhau tính được hệ số tỉ lệ bằng $${ratioK}$`, points: 1.0 },
            { step: `Suy ra $x = ${xVal}$ (và $y = ${yVal}$)`, points: 1.0 },
          ]
        : [{ step: `Tính đúng $x = ${xVal}$`, points: 1.0 }];
    keyFormula = '$\\frac{x}{a} = \\frac{y}{b} = \\frac{x+y}{a+b}$';
    commonMistake = 'Tính được hệ số tỉ lệ $k$ nhưng quên nhân với mẫu số tương ứng để ra $x$.';
  } else if (chapterId === 'G7_C5') {
    lesson = 'Đa thức một biến và nghiệm của đa thức';
    topic = 'Các phép tính đa thức & Tìm nghiệm';
    problemType = 'Tìm nghiệm của đa thức một biến';
    const aCoef = (k % 3) + 2;
    const rootVal = k + 2;
    const bConst = aCoef * rootVal;
    content = `Tìm nghiệm của đa thức một biến $P(x) = ${aCoef}x - ${bConst}$.`;
    correctValueStr = `${rootVal}`;
    acceptedAnswers = [`${rootVal}`, `x=${rootVal}`];
    distractors = [
      { text: `$${-rootVal}$`, errorType: 'SIGN_ERROR' },
      { text: `$${bConst}$`, errorType: 'CALCULATION_ERROR' },
      { text: `$${bConst - aCoef}$`, errorType: 'FORMULA_ERROR' },
    ];
    solution = `Cho $P(x) = 0 \\Leftrightarrow ${aCoef}x - ${bConst} = 0 \\Leftrightarrow x = \\frac{${bConst}}{${aCoef}} = ${rootVal}$.`;
    rubricSteps =
      points === 2.0
        ? [
            { step: `Đặt $P(x) = 0 \\Leftrightarrow ${aCoef}x = ${bConst}$`, points: 1.0 },
            { step: `Giải được nghiệm $x = ${rootVal}$`, points: 1.0 },
          ]
        : [{ step: `Tìm đúng nghiệm $x = ${rootVal}$`, points: 1.0 }];
    keyFormula = '$P(x) = ax + b = 0 \\Leftrightarrow x = -\\frac{b}{a}$';
    commonMistake = 'Chuyển vế sai dấu dẫn đến nghiệm bị ngược dấu.';
  } else if (chapterId === 'G7_C6') {
    lesson = 'Tam giác cân & Ba đường trung tuyến của tam giác';
    topic = 'Tam giác cân và các đường đồng quy';
    problemType = 'Vận dụng tính chất trọng tâm tam giác';
    const gm = k + 3;
    const am = 3 * gm;
    const ag = 2 * gm;
    content = `Cho tam giác $ABC$ có đường trung tuyến $AM = ${am}\\text{ cm}$ và trọng tâm $G$. Độ dài đoạn thẳng $AG$ bằng bao nhiêu $\\text{cm}$?`;
    mathExpressionToVerify = `(2 * ${am}) / 3`;
    correctValueStr = `${ag}`;
    acceptedAnswers = [`${ag}`, `${ag} cm`];
    distractors = [
      { text: `$${gm}$`, errorType: 'FORMULA_ERROR' },
      { text: `$${am / 2}$`, errorType: 'FORMULA_ERROR' },
      { text: `$${am - 2}$`, errorType: 'CALCULATION_ERROR' },
    ];
    solution = `Theo tính chất trọng tâm của tam giác, ta có $AG = \\frac{2}{3} AM = \\frac{2}{3} \\cdot ${am} = ${ag}\\text{ (cm)}$.`;
    rubricSteps =
      points === 2.0
        ? [
            { step: `Nêu tính chất trọng tâm $AG = \\frac{2}{3} AM$`, points: 1.0 },
            { step: `Thay số tính được $AG = ${ag}\\text{ cm}$`, points: 1.0 },
          ]
        : [{ step: `Tính đúng $AG = ${ag}\\text{ cm}$`, points: 1.0 }];
    keyFormula = '$AG = \\frac{2}{3} AM,\\quad GM = \\frac{1}{3} AM$';
    commonMistake = 'Nhầm tỉ số trọng tâm thành $\\frac{1}{2}$ hoặc $\\frac{1}{3}$ độ dài trung tuyến.';
  }

  // ============================================================================
  // KHỐI 8: G8_C1 -> G8_C5
  // ============================================================================
  else if (chapterId === 'G8_C1') {
    lesson = 'Bảy hằng đẳng thức đáng nhớ & Phân tích đa thức thành nhân tử';
    topic = 'Bảy hằng đẳng thức đáng nhớ';
    if (cognitiveLevel === 'nhan_biet' || cognitiveLevel === 'thong_hieu') {
      problemType = 'Rút gọn biểu thức bằng hằng đẳng thức';
      const x0 = 50 + k * 10;
      const a0 = k * 10;
      const diff = x0 - a0; // luôn = 50
      const ans = diff * diff;
      content = `Tính nhanh giá trị của biểu thức $P = x^2 - ${2 * a0}x + ${a0 * a0}$ tại $x = ${x0}$.`;
      mathExpressionToVerify = `(${x0} - ${a0})^2`;
      correctValueStr = `${ans}`;
      acceptedAnswers = [`${ans}`, `P=${ans}`];
      distractors = [
        { text: `$${(x0 + a0) * (x0 + a0)}$`, errorType: 'SIGN_ERROR' },
        { text: `$${2 * diff}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${ans - 100}$`, errorType: 'CALCULATION_ERROR' },
      ];
      solution = `Ta có $P = (x - ${a0})^2$. Thay $x = ${x0}$ vào được $P = (${x0} - ${a0})^2 = ${diff}^2 = ${ans}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Viết thành bình phương một hiệu $P = (x - ${a0})^2$`, points: 1.0 },
              { step: `Thay $x = ${x0}$ tính được $P = ${ans}$`, points: 1.0 },
            ]
          : [{ step: `Rút gọn và tính đúng $P = ${ans}$`, points: 1.0 }];
      keyFormula = '$a^2 - 2ab + b^2 = (a - b)^2$';
      commonMistake = 'Nhầm dấu hằng đẳng thức thành $(x + a)^2$.';
    } else {
      problemType = 'Tìm GTNN / GTLN của đa thức bậc hai';
      const hShift = k + 2;
      const minVal = k * 2 + 5;
      const cTerm = hShift * hShift + minVal;
      content = `Tìm giá trị nhỏ nhất của đa thức $A = x^2 - ${2 * hShift}x + ${cTerm}$.`;
      correctValueStr = `${minVal}`;
      acceptedAnswers = [`${minVal}`, `min A = ${minVal}`];
      distractors = [
        { text: `$${cTerm}$`, errorType: 'FORMULA_ERROR' },
        { text: `$${hShift}$`, errorType: 'CONCEPT_ERROR' },
        { text: `$${-minVal}$`, errorType: 'SIGN_ERROR' },
      ];
      solution = `Tách hằng đẳng thức: $A = (x^2 - ${2 * hShift}x + ${hShift * hShift}) + ${minVal} = (x - ${hShift})^2 + ${minVal} \\ge ${minVal}$ với mọi $x$. Dấu "$=$" xảy ra khi $x = ${hShift}$. Vậy $\\min A = ${minVal}$.`;
      rubricSteps =
        points === 2.0
          ? [
              { step: `Biến đổi $A = (x - ${hShift})^2 + ${minVal}$`, points: 1.0 },
              { step: `Đánh giá $(x - ${hShift})^2 \\ge 0$ và kết luận $\\min A = ${minVal}$`, points: 1.0 },
            ]
          : [{ step: `Tìm đúng $\\min A = ${minVal}$`, points: 1.0 }];
      keyFormula = '$x^2 - 2ax + c = (x - a)^2 + (c - a^2) \\ge c - a^2$';
      commonMistake = 'Tách thiếu hạng tử $a^2$ hoặc lấy nhầm hệ số tự do làm GTNN.';
    }
  } else if (chapterId === 'G8_C2') {
    lesson = 'Rút gọn phân thức đại số & Các phép toán phân thức';
    topic = 'Điều kiện xác định và rút gọn phân thức';
    problemType = 'Tìm ĐKXĐ và rút gọn biểu thức phân thức';
    const a = k + 2;
    const xVal = k + 5;
    const ans = xVal + a;
    content = `Cho phân thức $M = \\frac{x^2 - ${a * a}}{x - ${a}}$ (với $x \\ne ${a}$). Tính giá trị của $M$ tại $x = ${xVal}$.`;
    mathExpressionToVerify = `${xVal} + ${a}`;
    correctValueStr = `${ans}`;
    acceptedAnswers = [`${ans}`, `M=${ans}`];
    distractors = [
      { text: `$${xVal - a}$`, errorType: 'SIGN_ERROR' },
      { text: `$${xVal * a}$`, errorType: 'FORMULA_ERROR' },
      { text: `$${ans + a}$`, errorType: 'CALCULATION_ERROR' },
    ];
    solution = `Với $x \\ne ${a}$, ta có $M = \\frac{(x - ${a})(x + ${a})}{x - ${a}} = x + ${a}$. Thay $x = ${xVal}$ (thỏa mãn ĐKXĐ) được $M = ${xVal} + ${a} = ${ans}$.`;
    rubricSteps =
      points === 2.0
        ? [
            { step: `Rút gọn đúng $M = x + ${a}$ (với $x \\ne ${a}$)`, points: 1.0 },
            { step: `Thay $x = ${xVal}$ tính được $M = ${ans}$`, points: 1.0 },
          ]
        : [{ step: `Rút gọn và tính đúng $M = ${ans}$`, points: 1.0 }];
    keyFormula = '$\\frac{x^2 - a^2}{x - a} = x + a$ ($x \\ne a$)';
    commonMistake = 'Rút gọn nhầm dấu thành $x - a$ hoặc quên kiểm tra điều kiện xác định.';
  } else if (chapterId === 'G8_C3') {
    lesson = 'Định lí Pythagore và Tứ giác đặc biệt';
    topic = 'Định lí Pythagore trong tam giác vuông';
    problemType = 'Tính độ dài cạnh bằng định lí Pythagore';
    const scale = (k % 4) + 1;
    const leg1 = 3 * scale;
    const leg2 = 4 * scale;
    const hyp = 5 * scale;
    content = `Cho tam giác $ABC$ vuông tại $A$ có hai cạnh góc vuông $AB = ${leg1}\\text{ cm}$ và $AC = ${leg2}\\text{ cm}$. Độ dài cạnh huyền $BC$ bằng bao nhiêu $\\text{cm}$?`;
    mathExpressionToVerify = `sqrt(${leg1}^2 + ${leg2}^2)`;
    correctValueStr = `${hyp}`;
    acceptedAnswers = [`${hyp}`, `${hyp} cm`];
    distractors = [
      { text: `$${leg1 + leg2}$`, errorType: 'FORMULA_ERROR' },
      { text: `$${hyp * hyp}$`, errorType: 'MISSING_CONDITION' },
      { text: `$${leg2 - leg1}$`, errorType: 'FORMULA_ERROR' },
    ];
    solution = `Áp dụng định lí Pythagore trong $\\triangle ABC$ vuông tại $A$: $BC = \\sqrt{AB^2 + AC^2} = \\sqrt{${leg1}^2 + ${leg2}^2} = \\sqrt{${hyp * hyp}} = ${hyp}\\text{ (cm)}$.`;
    rubricSteps =
      points === 2.0
        ? [
            { step: `Viết hệ thức Pythagore $BC^2 = AB^2 + AC^2 = ${hyp * hyp}$`, points: 1.0 },
            { step: `Khai căn được $BC = ${hyp}\\text{ cm}$`, points: 1.0 },
          ]
        : [{ step: `Tính đúng cạnh huyền $BC = ${hyp}\\text{ cm}$`, points: 1.0 }];
    keyFormula = '$BC^2 = AB^2 + AC^2$';
    commonMistake = 'Tính được $BC^2$ nhưng quên lấy căn bậc hai.';
  } else if (chapterId === 'G8_C4') {
    lesson = 'Phương trình bậc nhất một ẩn & Hàm số bậc nhất y = ax + b';
    topic = 'Giải phương trình bậc nhất một ẩn';
    problemType = 'Giải phương trình đưa về dạng ax + b = 0';
    const aCoef = (k % 4) + 2;
    const xSol = k + 2;
    const rhs = aCoef * xSol - 5;
    content = `Giải phương trình bậc nhất một ẩn: $${aCoef}x - 5 = ${rhs}$.`;
    correctValueStr = `${xSol}`;
    acceptedAnswers = [`${xSol}`, `x=${xSol}`];
    distractors = [
      { text: `$${-xSol}$`, errorType: 'SIGN_ERROR' },
      { text: `$${(rhs - 5) / aCoef}$`, errorType: 'SIGN_ERROR' },
      { text: `$${rhs + 5}$`, errorType: 'CALCULATION_ERROR' },
    ];
    solution = `Ta có $${aCoef}x - 5 = ${rhs} \\Leftrightarrow ${aCoef}x = ${rhs + 5} \\Leftrightarrow x = \\frac{${rhs + 5}}{${aCoef}} = ${xSol}$.`;
    rubricSteps =
      points === 2.0
        ? [
            { step: `Chuyển vế thu gọn được $${aCoef}x = ${rhs + 5}$`, points: 1.0 },
            { step: `Chia hai vế cho $${aCoef}$ được $x = ${xSol}$`, points: 1.0 },
          ]
        : [{ step: `Giải đúng nghiệm $x = ${xSol}$`, points: 1.0 }];
    keyFormula = '$ax + b = 0 \\Leftrightarrow x = -\\frac{b}{a}$ ($a \\ne 0$)';
    commonMistake = 'Chuyển vế $-5$ sang vế phải nhưng quên đổi dấu thành $+5$.';
  } else if (chapterId === 'G8_C5') {
    lesson = 'Định lí Thalès trong tam giác & Tam giác đồng dạng';
    topic = 'Định lí Thalès, đường trung bình, phân giác';
    problemType = 'Tính độ dài đoạn thẳng bằng Định lí Thalès';
    const ad = k + 2;
    const db = 2 * ad;
    const ae = k + 3;
    const ec = 2 * ae;
    content = `Cho tam giác $ABC$, đường thẳng $d$ song song với $BC$ cắt $AB, AC$ lần lượt tại $D, E$. Biết $AD = ${ad}\\text{ cm}, DB = ${db}\\text{ cm}$ và $AE = ${ae}\\text{ cm}$. Tính độ dài đoạn thẳng $EC$ (đơn vị $\\text{cm}$).`;
    mathExpressionToVerify = `(${db} * ${ae}) / ${ad}`;
    correctValueStr = `${ec}`;
    acceptedAnswers = [`${ec}`, `${ec} cm`];
    distractors = [
      { text: `$${ae + db}$`, errorType: 'FORMULA_ERROR' },
      { text: `$${ad}$`, errorType: 'CONCEPT_ERROR' },
      { text: `$${ec + ae}$`, errorType: 'CALCULATION_ERROR' },
    ];
    solution = `Vì $DE \\parallel BC$, theo định lí Thalès ta có $\\frac{AD}{DB} = \\frac{AE}{EC} \\Rightarrow EC = \\frac{DB \\cdot AE}{AD} = \\frac{${db} \\cdot ${ae}}{${ad}} = ${ec}\\text{ (cm)}$.`;
    rubricSteps =
      points === 2.0
        ? [
            { step: `Lập đúng tỉ lệ thức Thalès $\\frac{AD}{DB} = \\frac{AE}{EC}$`, points: 1.0 },
            { step: `Thay số tính được $EC = ${ec}\\text{ cm}$`, points: 1.0 },
          ]
        : [{ step: `Tính đúng $EC = ${ec}\\text{ cm}$`, points: 1.0 }];
    keyFormula = '$DE \\parallel BC \\Rightarrow \\frac{AD}{DB} = \\frac{AE}{EC}$';
    commonMistake = 'Lập sai thứ tự tỉ số các đoạn thẳng tương ứng trên hai cạnh.';
  }

  // ============================================================================
  // KHỐI 9: G9_C1 -> G9_C6
  // ============================================================================
  else if (chapterId === 'G9_C1') {
    lesson = 'Hệ hai phương trình bậc nhất hai ẩn';
    topic = 'Hệ hai phương trình bậc nhất hai ẩn';
    problemType = 'Giải hệ phương trình bằng phương pháp thế / cộng đại số';
    const x0 = k + 2;
    const y0 = k;
    const s1 = x0 + y0;
    const s2 = x0 - y0;
    content = `Cho hệ phương trình $\\begin{cases} x + y = ${s1} \\\\ x - y = ${s2} \\end{cases}$. Giá trị của nghiệm $x$ bằng bao nhiêu?`;
    mathExpressionToVerify = `(${s1} + ${s2}) / 2`;
    correctValueStr = `${x0}`;
    acceptedAnswers = [`${x0}`, `x=${x0}`];
    distractors = [
      { text: `$${y0}$`, errorType: 'CALCULATION_ERROR' },
      { text: `$${2 * x0}$`, errorType: 'CALCULATION_ERROR' },
      { text: `$${-x0}$`, errorType: 'SIGN_ERROR' },
    ];
    solution = `Cộng từng vế hai phương trình của hệ ta được $2x = ${s1 + s2} \\Leftrightarrow x = ${x0}$ (suy ra $y = ${y0}$).`;
    rubricSteps =
      points === 2.0
        ? [
            { step: `Cộng hai vế thu được $2x = ${s1 + s2}$`, points: 1.0 },
            { step: `Tính đúng $x = ${x0}$`, points: 1.0 },
          ]
        : [{ step: `Tìm đúng $x = ${x0}$`, points: 1.0 }];
    keyFormula = 'Phương pháp cộng đại số khử ẩn $y$.';
    commonMistake = 'Cộng hai vế được $2x$ nhưng quên chia cho $2$.';
  } else if (chapterId === 'G9_C2') {
    lesson = 'Căn bậc hai và Rút gọn biểu thức chứa căn';
    topic = 'Điều kiện xác định và hằng đẳng thức căn bậc hai';
    problemType = 'Rút gọn biểu thức chứa căn P và câu hỏi phụ';
    const c = k + 3;
    const rad = c * c;
    const xVal = (k + 1) * (k + 1);
    const ans = c * (k + 1);
    content = `Tính giá trị của biểu thức $A = \\sqrt{${rad}x}$ tại $x = ${xVal}$.`;
    mathExpressionToVerify = `sqrt(${rad} * ${xVal})`;
    correctValueStr = `${ans}`;
    acceptedAnswers = [`${ans}`, `A=${ans}`];
    distractors = [
      { text: `$${rad * (k + 1)}$`, errorType: 'FORMULA_ERROR' },
      { text: `$${c + k + 1}$`, errorType: 'FORMULA_ERROR' },
      { text: `$${-ans}$`, errorType: 'SIGN_ERROR' },
    ];
    solution = `Với $x = ${xVal} > 0$, ta có $A = \\sqrt{${rad}} \\cdot \\sqrt{${xVal}} = ${c} \\cdot ${k + 1} = ${ans}$.`;
    rubricSteps =
      points === 2.0
        ? [
            { step: `Khai phương một tích $\\sqrt{${rad}} \\cdot \\sqrt{${xVal}} = ${c} \\cdot ${k + 1}$`, points: 1.0 },
            { step: `Tính đúng kết quả $A = ${ans}$`, points: 1.0 },
          ]
        : [{ step: `Tính đúng $A = ${ans}$`, points: 1.0 }];
    keyFormula = '$\\sqrt{A \\cdot B} = \\sqrt{A} \\cdot \\sqrt{B}$ ($A, B \\ge 0$)';
    commonMistake = 'Đưa thừa số ra ngoài dấu căn nhưng quên khai căn thừa số đó.';
  } else if (chapterId === 'G9_C3') {
    lesson = 'Hệ thức lượng trong tam giác vuông & Tiếp tuyến của đường tròn';
    topic = 'Tính chất hai tiếp tuyến cắt nhau và đường tròn';
    problemType = 'Tính độ dài tiếp tuyến và chứng minh tiếp tuyến';
    const scale = (k % 3) + 1;
    const r = 3 * scale;
    const tangent = 4 * scale;
    const oa = 5 * scale;
    content = `Từ điểm $M$ nằm ngoài đường tròn $(O; ${r}\\text{ cm})$ sao cho $OM = ${oa}\\text{ cm}$, kẻ tiếp tuyến $MA$ với đường tròn ($A$ là tiếp điểm). Độ dài đoạn tiếp tuyến $MA$ bằng bao nhiêu $\\text{cm}$?`;
    mathExpressionToVerify = `sqrt(${oa}^2 - ${r}^2)`;
    correctValueStr = `${tangent}`;
    acceptedAnswers = [`${tangent}`, `${tangent} cm`];
    distractors = [
      { text: `$${oa + r}$`, errorType: 'FORMULA_ERROR' },
      { text: `$${tangent * tangent}$`, errorType: 'MISSING_CONDITION' },
      { text: `$${oa - r}$`, errorType: 'FORMULA_ERROR' },
    ];
    solution = `Vì $MA$ là tiếp tuyến của $(O)$ nên $MA \\perp OA$ tại $A$. Áp dụng định lí Pythagore trong $\\triangle OAM$ vuông tại $A$: $MA = \\sqrt{OM^2 - OA^2} = \\sqrt{${oa}^2 - ${r}^2} = ${tangent}\\text{ (cm)}$.`;
    rubricSteps =
      points === 2.0
        ? [
            { step: `Chứng minh $\\triangle OAM$ vuông tại $A$, viết $MA^2 = OM^2 - OA^2 = ${tangent * tangent}$`, points: 1.0 },
            { step: `Tính đúng $MA = ${tangent}\\text{ cm}$`, points: 1.0 },
          ]
        : [{ step: `Tính đúng độ dài tiếp tuyến $MA = ${tangent}\\text{ cm}$`, points: 1.0 }];
    keyFormula = '$MA = \\sqrt{OM^2 - R^2}$';
    commonMistake = 'Áp dụng nhầm công thức Pythagore thành cộng hai bình phương $OM^2 + R^2$.';
  } else if (chapterId === 'G9_C4') {
    lesson = 'Phương trình bậc hai một ẩn & Định lí Viète';
    topic = 'Hệ thức Viète và bài toán tham số m';
    problemType = 'Tìm m để phương trình có hai nghiệm thỏa mãn hệ thức Viète';
    const r1 = k;
    const r2 = k + 3;
    const sumR = r1 + r2;
    const prodR = r1 * r2;
    const sumSquares = sumR * sumR - 2 * prodR;
    content = `Gọi $x_1, x_2$ là hai nghiệm của phương trình bậc hai $x^2 - ${sumR}x + ${prodR} = 0$. Không giải phương trình, hãy tính giá trị của biểu thức $T = x_1^2 + x_2^2$.`;
    mathExpressionToVerify = `${sumR}^2 - 2 * ${prodR}`;
    correctValueStr = `${sumSquares}`;
    acceptedAnswers = [`${sumSquares}`, `T=${sumSquares}`];
    distractors = [
      { text: `$${sumR * sumR}$`, errorType: 'FORMULA_ERROR' },
      { text: `$${sumR * sumR + 2 * prodR}$`, errorType: 'SIGN_ERROR' },
      { text: `$${sumR + prodR}$`, errorType: 'CONCEPT_ERROR' },
    ];
    solution = `Theo định lí Viète, ta có $x_1 + x_2 = ${sumR}$ và $x_1 x_2 = ${prodR}$. Khi đó $T = x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = ${sumR}^2 - 2 \\cdot ${prodR} = ${sumSquares}$.`;
    rubricSteps =
      points === 2.0
        ? [
            { step: `Viết đúng hệ thức Viète $x_1 + x_2 = ${sumR}$ và $x_1 x_2 = ${prodR}$`, points: 1.0 },
            { step: `Thay vào $T = (x_1 + x_2)^2 - 2x_1 x_2 = ${sumSquares}$`, points: 1.0 },
          ]
        : [{ step: `Tính đúng $T = ${sumSquares}$`, points: 1.0 }];
    keyFormula = '$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2$';
    commonMistake = 'Lấy dấu sai của tổng hai nghiệm $x_1 + x_2 = b/a$ hoặc quên trừ $2x_1 x_2$.';
  } else if (chapterId === 'G9_C5') {
    lesson = 'Góc nội tiếp, Tứ giác nội tiếp & Hình trụ, Hình nón, Hình cầu';
    topic = 'Góc nội tiếp và Tứ giác nội tiếp';
    problemType = 'Chứng minh tứ giác nội tiếp và tính góc';
    const angleA = 65 + (k % 5) * 5;
    const angleC = 180 - angleA;
    content = `Cho tứ giác $ABCD$ nội tiếp đường tròn $(O)$, biết số đo góc $\\widehat{A} = ${angleA}^\\circ$. Số đo góc đối diện $\\widehat{C}$ bằng bao nhiêu độ?`;
    mathExpressionToVerify = `180 - ${angleA}`;
    correctValueStr = `${angleC}`;
    acceptedAnswers = [`${angleC}`];
    distractors = [
      { text: `$${angleA}$`, errorType: 'CONCEPT_ERROR' },
      { text: `$${360 - angleA}$`, errorType: 'FORMULA_ERROR' },
      { text: `$${angleA / 2}$`, errorType: 'FORMULA_ERROR' },
    ];
    solution = `Vì tứ giác $ABCD$ nội tiếp đường tròn nên tổng hai góc đối bằng $180^\\circ$. Suy ra $\\widehat{C} = 180^\\circ - \\widehat{A} = 180^\\circ - ${angleA}^\\circ = ${angleC}^\\circ$.`;
    rubricSteps =
      points === 2.0
        ? [
            { step: `Nêu tính chất tứ giác nội tiếp $\\widehat{A} + \\widehat{C} = 180^\\circ$`, points: 1.0 },
            { step: `Tính đúng $\\widehat{C} = ${angleC}^\\circ$`, points: 1.0 },
          ]
        : [{ step: `Tính đúng $\\widehat{C} = ${angleC}^\\circ$`, points: 1.0 }];
    keyFormula = '$\\widehat{A} + \\widehat{C} = 180^\\circ$ (tứ giác nội tiếp)';
    commonMistake = 'Cho hai góc đối của tứ giác nội tiếp bằng nhau.';
  } else {
    // G9_C6: Chuyên đề Tổng hợp Luyện thi vào Lớp 10 THPT
    lesson = 'Chuyên đề Tổng hợp Luyện thi vào Lớp 10';
    topic = 'Tổng hợp Đại số thi vào 10';
    problemType = 'Đề thi thử vào lớp 10 cấu trúc chuẩn Sở GD&ĐT';
    const aParam = k + 2;
    const xIntersection = aParam;
    const yIntersection = aParam * aParam;
    content = `Trong mặt phẳng tọa độ $Oxy$, cho Parabol $(P): y = x^2$ và đường thẳng $(d): y = ${2 * aParam}x - ${yIntersection}$. Tìm hoành độ tiếp điểm của $(d)$ và $(P)$.`;
    correctValueStr = `${xIntersection}`;
    acceptedAnswers = [`${xIntersection}`, `x=${xIntersection}`];
    distractors = [
      { text: `$${-xIntersection}$`, errorType: 'SIGN_ERROR' },
      { text: `$${yIntersection}$`, errorType: 'CALCULATION_ERROR' },
      { text: `$${2 * aParam}$`, errorType: 'FORMULA_ERROR' },
    ];
    solution = `Phương trình hoành độ giao điểm của $(P)$ và $(d)$ là $x^2 - ${2 * aParam}x + ${yIntersection} = 0 \\Leftrightarrow (x - ${aParam})^2 = 0 \\Leftrightarrow x = ${xIntersection}$.`;
    rubricSteps =
      points === 2.0
        ? [
            { step: `Lập phương trình hoành độ giao điểm $x^2 - ${2 * aParam}x + ${yIntersection} = 0$`, points: 1.0 },
            { step: `Giải phương trình tìm được nghiệm kép $x = ${xIntersection}$`, points: 1.0 },
          ]
        : [{ step: `Tìm đúng hoành độ tiếp điểm $x = ${xIntersection}$`, points: 1.0 }];
    keyFormula = 'Phương trình hoành độ giao điểm $x^2 = mx + n$.';
    commonMistake = 'Chuyển vế sai dấu khi lập phương trình hoành độ giao điểm.';
  }

  // Tạo phương án trắc nghiệm (options) nếu là MCQ
  let options: Array<{ label: string; text: string; errorType?: string }> = [];
  let finalCorrectAnswer = correctValueStr;

  if (qType === 'mcq') {
    const formattedCorrect = correctValueStr.startsWith('$')
      ? correctValueStr
      : correctValueStr.includes('/')
      ? `$\\frac{${correctValueStr.split('/')[0]}}{${correctValueStr.split('/')[1]}}$`
      : `$${correctValueStr}$`;
    const built = buildMcqOptions(formattedCorrect, distractors, seqNumber + variantIndex);
    options = built.options;
    finalCorrectAnswer = built.correctLabel;
  }

  return {
    id,
    code,
    grade,
    textbooks: ['KNTT', 'CD', 'CTST'],
    semester,
    chapterId,
    lesson,
    topic,
    problemType,
    type: qType,
    difficulty,
    cognitiveLevel,
    points,
    content,
    options,
    correctAnswer: finalCorrectAnswer,
    acceptedAnswers,
    solution,
    rubricSteps,
    keyFormula,
    commonMistake,
    source: `Bộ mẫu câu hỏi tham số hóa Toán ${grade} GDPT 2018`,
    verificationStatus: 'draft',
    version: 1,
    ...(mathExpressionToVerify ? { mathExpressionToVerify } : {}),
  };
}

/**
 * Sinh toàn bộ ngân hàng câu hỏi mở rộng cho 1 khối lớp (đảm bảo >= 15 câu/mức độ nhận thức,
 * phủ kín tất cả các chương của cả 2 học kỳ, có cả MCQ và Essay, verificationStatus = "draft").
 */
export function generateGradeQuestionBank(
  grade: number,
  chapters: Array<{ id: string; semester: number }>
): ParametricQuestionItem[] {
  const levels: CognitiveLevel[] = ['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'];
  const generated: ParametricQuestionItem[] = [];
  let seq = 1;

  // Để mỗi mức nhận thức có >= 16-18 câu/khối trải đều các chương:
  // Khối 6, 7, 9 có 6 chương -> 3 câu/mức/chương = 18 câu/mức (72 câu/khối).
  // Khối 8 có 5 chương -> 4 câu/mức/chương = 20 câu/mức (80 câu/khối).
  const variantsPerChapterLevel = chapters.length <= 5 ? 4 : 3;

  for (const ch of chapters) {
    for (const lv of levels) {
      for (let v = 1; v <= variantsPerChapterLevel; v++) {
        generated.push(
          buildParametricQuestionForChapter({
            grade,
            semester: ch.semester,
            chapterId: ch.id,
            cognitiveLevel: lv,
            variantIndex: v,
            seqNumber: seq++,
          })
        );
      }
    }
  }

  return generated;
}
