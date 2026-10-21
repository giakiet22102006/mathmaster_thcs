// ==============================================================================
// MathMaster THCS - Ngân Hàng Template Câu Hỏi Toán Lớp 8 (Đầy đủ 5 Chương)
// File: src/lib/question-engine/templates/grade8.ts
// Phủ toàn bộ: G8_C1 -> G8_C5 (Mỗi chương >= 4 template / mức độ khó: easy, medium, hard)
// ==============================================================================

import type { QuestionTemplate, TextbookCode } from '../types';
import type { PRNG } from '../rng';
import { buildShuffledMcq, gcd, formatFraction } from '../template-helpers';
import { KNTTContexts } from '../contexts/KNTT';
import { CDContexts } from '../contexts/CD';
import { CTSTContexts } from '../contexts/CTST';

export const grade8Templates: QuestionTemplate[] = [
  // ----------------------------------------------------------------------------
  // CHƯƠNG 1: ĐA THỨC NHIỀU BIẾN VÀ HẰNG ĐẲNG THỨC ĐÁNG NHỚ (G8_C1) - HK1
  // ----------------------------------------------------------------------------
  {
    id: 'T_G8_C1_EASY_01',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Đơn thức và Đa thức nhiều biến',
    topic: 'Bậc của đa thức nhiều biến',
    problemType: 'Tìm bậc của đa thức nhiều biến',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 6);
      const b = rng.nextInt(2, 6);
      const c = rng.nextInt(2, 5);
      const d = rng.nextInt(3, 5);
      const deg1 = c + d;
      const deg2 = c + 1;
      const deg3 = d;
      const highestDeg = Math.max(deg1, deg2, deg3);

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `${highestDeg}`,
        [
          { text: `${deg1 - 1}`, errorType: 'TÍNH_THIẾU_SỐ_MŨ' },
          { text: `${deg1 + 1}`, errorType: 'CỘNG_THỪA' },
          { text: `${Math.max(c, d)}`, errorType: 'CHỈ_LẤY_MŨ_CAO_NHẤT_CỦA_MỘT_BIẾN' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Đơn thức và Đa thức nhiều biến',
        topic: 'Bậc của đa thức nhiều biến',
        problemType: 'Tìm bậc của đa thức nhiều biến',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Bậc của đa thức $P = ${a}x^{${c}}y^{${d}} - ${b}x^{${deg2}} + y^{${deg3}} - 7$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bậc của đa thức là bậc của hạng tử có bậc cao nhất trong dạng thu gọn. Hạng tử $x^{${c}}y^{${d}}$ có bậc là $${c} + ${d} = ${deg1}$, các hạng tử còn lại có bậc thấp hơn. Vậy bậc của $P$ là $${highestDeg}$.`,
        rubricSteps: [{ step: 'Xác định bậc của từng hạng tử và chọn bậc cao nhất', points: 0.5 }],
        keyFormula: 'Bậc của đa thức là bậc của hạng tử có bậc cao nhất.',
      };
    },
  },

  {
    id: 'T_G8_C1_EASY_02',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Bảy hằng đẳng thức đáng nhớ',
    topic: 'Bình phương của một tổng',
    problemType: 'Khai triển hằng đẳng thức',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 7);
      const a2 = a * a;
      const doubleA = 2 * a;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x^2 + ${doubleA}x + ${a2}$`,
        [
          { text: `$x^2 + ${a2}$`, errorType: 'QUÊN_HẠNG_TỬ_2AB' },
          { text: `$x^2 + ${a}x + ${a2}$`, errorType: 'QUÊN_NHÂN_2' },
          { text: `$x^2 - ${doubleA}x + ${a2}$`, errorType: 'SAI_DẤU_CỦA_TỔNG' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Bảy hằng đẳng thức đáng nhớ',
        topic: 'Bình phương của một tổng',
        problemType: 'Khai triển hằng đẳng thức',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Khai triển hằng đẳng thức $(x + ${a})^2$ ta được kết quả là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Áp dụng hằng đẳng thức $(A + B)^2 = A^2 + 2AB + B^2$, ta có:\n$(x + ${a})^2 = x^2 + 2 \\cdot x \\cdot ${a} + ${a}^2 = x^2 + ${doubleA}x + ${a2}$.`,
        rubricSteps: [{ step: 'Áp dụng đúng công thức bình phương một tổng', points: 0.5 }],
        keyFormula: '$(A + B)^2 = A^2 + 2AB + B^2$',
      };
    },
  },

  {
    id: 'T_G8_C1_EASY_03',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Bảy hằng đẳng thức đáng nhớ',
    topic: 'Hiệu hai bình phương',
    problemType: 'Viết thành tích',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const b = rng.nextInt(3, 9);
      const b2 = b * b;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$(x - ${b})(x + ${b})$`,
        [
          { text: `$(x - ${b})^2$`, errorType: 'NHẦM_VỚI_BÌNH_PHƯƠNG_HIỆU' },
          { text: `$(x + ${b})^2$`, errorType: 'NHẦM_VỚI_BÌNH_PHƯƠNG_TỔNG' },
          { text: `$(x - ${b2})(x + 1)$`, errorType: 'SAI_QUY_TẮC' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Bảy hằng đẳng thức đáng nhớ',
        topic: 'Hiệu hai bình phương',
        problemType: 'Viết thành tích',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Biểu thức $x^2 - ${b2}$ được phân tích thành tích là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Áp dụng hằng đẳng thức $A^2 - B^2 = (A - B)(A + B)$, ta có:\n$x^2 - ${b2} = x^2 - ${b}^2 = (x - ${b})(x + ${b})$.`,
        rubricSteps: [{ step: 'Áp dụng đúng công thức hiệu hai bình phương', points: 0.5 }],
        keyFormula: '$A^2 - B^2 = (A - B)(A + B)$',
      };
    },
  },

  {
    id: 'T_G8_C1_EASY_04',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Đơn thức và Đa thức nhiều biến',
    topic: 'Giá trị của đa thức',
    problemType: 'Tính giá trị biểu thức đại số',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 4);
      const xVal = rng.nextInt(1, 3);
      const yVal = rng.nextInt(1, 2);
      const c = rng.nextInt(3, 8);
      const result = a * xVal * yVal - 2 * xVal + c;

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Đơn thức và Đa thức nhiều biến',
        topic: 'Giá trị của đa thức',
        problemType: 'Tính giá trị biểu thức đại số',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Tính giá trị của đa thức $A = ${a}xy - 2x + ${c}$ tại $x = ${xVal}$ và $y = ${yVal}$.`,
        correctAnswer: `${result}`,
        acceptedAnswers: [`${result}`],
        solution: `Thay $x = ${xVal}$ và $y = ${yVal}$ vào biểu thức $A$, ta được:\n$A = ${a} \\cdot (${xVal}) \\cdot (${yVal}) - 2 \\cdot (${xVal}) + ${c} = ${a * xVal * yVal} - ${2 * xVal} + ${c} = ${result}$.`,
        rubricSteps: [
          { step: 'Thay giá trị x, y vào biểu thức', points: 0.5 },
          { step: 'Thực hiện phép tính ra kết quả đúng', points: 0.5 },
        ],
        keyFormula: 'Thay số cẩn thận vào từng biến và thực hiện thứ tự phép tính.',
      };
    },
  },

  {
    id: 'T_G8_C1_MED_01',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Bảy hằng đẳng thức đáng nhớ',
    topic: 'Lập phương của một hiệu',
    problemType: 'Khai triển hằng đẳng thức bậc 3',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const b = rng.nextInt(2, 3);
      const b2 = b * b;
      const b3 = b * b * b;
      const coef2 = 3 * b;
      const coef1 = 3 * b2;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x^3 - ${coef2}x^2 + ${coef1}x - ${b3}$`,
        [
          { text: `$x^3 - ${b3}$`, errorType: 'QUÊN_CÁC_HẠNG_TỬ_GIỮA' },
          { text: `$x^3 + ${coef2}x^2 + ${coef1}x + ${b3}$`, errorType: 'SAI_DẤU_TOÀN_BỘ' },
          { text: `$x^3 - ${b}x^2 + ${b2}x - ${b3}$`, errorType: 'QUÊN_NHÂN_HỆ_SỐ_3' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Bảy hằng đẳng thức đáng nhớ',
        topic: 'Lập phương của một hiệu',
        problemType: 'Khai triển hằng đẳng thức bậc 3',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Khai triển hằng đẳng thức $(x - ${b})^3$ ta thu được biểu thức nào sau đây?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Ta có $(A - B)^3 = A^3 - 3A^2 B + 3AB^2 - B^3$.\nVới $A = x, B = ${b}$:\n$(x - ${b})^3 = x^3 - 3 \\cdot x^2 \\cdot ${b} + 3 \\cdot x \\cdot ${b}^2 - ${b}^3 = x^3 - ${coef2}x^2 + ${coef1}x - ${b3}$.`,
        rubricSteps: [{ step: 'Áp dụng đúng công thức lập phương của một hiệu', points: 0.5 }],
        keyFormula: '$(A - B)^3 = A^3 - 3A^2 B + 3AB^2 - B^3$',
      };
    },
  },

  {
    id: 'T_G8_C1_MED_02',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Phân tích đa thức thành nhân tử',
    topic: 'Phương pháp đặt nhân tử chung và dùng hằng đẳng thức',
    problemType: 'Phân tích đa thức thành nhân tử',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const k = rng.nextInt(2, 5);
      const a = rng.nextInt(2, 4);
      const a2 = a * a;
      const ka2 = k * a2;

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Phân tích đa thức thành nhân tử',
        topic: 'Phương pháp đặt nhân tử chung và dùng hằng đẳng thức',
        problemType: 'Phân tích đa thức thành nhân tử',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Phân tích đa thức sau thành nhân tử: $M = ${k}x^3 - ${ka2}x$.`,
        correctAnswer: `${k}x(x - ${a})(x + ${a})`,
        acceptedAnswers: [
          `${k}x(x - ${a})(x + ${a})`,
          `${k}x(x + ${a})(x - ${a})`,
        ],
        solution: `Bước 1: Đặt nhân tử chung $${k}x$:\n$M = ${k}x(x^2 - ${a2})$.\nBước 2: Áp dụng hằng đẳng thức hiệu hai bình phương cho $x^2 - ${a2} = (x - ${a})(x + ${a})$:\nVậy $M = ${k}x(x - ${a})(x + ${a})$.`,
        rubricSteps: [
          { step: 'Đặt nhân tử chung ra ngoài', points: 0.5 },
          { step: 'Áp dụng hằng đẳng thức đưa về tích hoàn chỉnh', points: 0.5 },
        ],
        keyFormula: 'Đặt nhân tử chung kết hợp hằng đẳng thức $A^2 - B^2$.',
      };
    },
  },

  {
    id: 'T_G8_C1_MED_03',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Phân tích đa thức thành nhân tử',
    topic: 'Phương pháp nhóm hạng tử',
    problemType: 'Nhóm hạng tử để xuất hiện nhân tử chung',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 6);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$(x - y)(x - ${a})$`,
        [
          { text: `$(x + y)(x - ${a})$`, errorType: 'SAI_DẤU_Y' },
          { text: `$(x - y)(x + ${a})$`, errorType: 'SAI_DẤU_HỆ_SỐ' },
          { text: `$x(x - y - ${a})$`, errorType: 'CHƯA_PHÂN_TÍCH_TRIỆT_ĐỂ' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Phân tích đa thức thành nhân tử',
        topic: 'Phương pháp nhóm hạng tử',
        problemType: 'Nhóm hạng tử để xuất hiện nhân tử chung',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: `Phân tích đa thức $x^2 - xy - ${a}x + ${a}y$ thành nhân tử ta được:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Ta nhóm các hạng tử thích hợp:\n$(x^2 - xy) - (${a}x - ${a}y) = x(x - y) - ${a}(x - y) = (x - y)(x - ${a})$.`,
        rubricSteps: [{ step: 'Nhóm hạng tử và đặt nhân tử chung đưa về tích', points: 0.5 }],
        keyFormula: 'Nhóm hạng tử: $A + B + C + D = (A + B) + (C + D)$.',
      };
    },
  },

  {
    id: 'T_G8_C1_MED_04',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Đơn thức và Đa thức nhiều biến',
    topic: 'Ứng dụng thực tế của đa thức',
    problemType: 'Diện tích hình học biểu diễn bằng đa thức',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const ctx = (book === 'KNTT' ? KNTTContexts : book === 'CD' ? CDContexts : CTSTContexts).realWorld(rng);
      const incL = rng.nextInt(2, 4);
      const incW = rng.nextInt(1, 3);
      const sumCoeff = incL + incW;
      const constCoeff = incL * incW;

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Đơn thức và Đa thức nhiều biến',
        topic: 'Ứng dụng thực tế của đa thức',
        problemType: 'Diện tích hình học biểu diễn bằng đa thức',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Một mảnh đất hình chữ nhật ban đầu có chiều dài là $x$ (m) và chiều rộng là $y$ (m). ${ctx.person} mở rộng mảnh đất bằng cách tăng chiều dài thêm $${incL}$ m và tăng chiều rộng thêm $${incW}$ m. Hãy viết biểu thức đa thức thu gọn biểu diễn diện tích mới của mảnh đất theo $x$ và $y$.`,
        correctAnswer: `xy + ${incW}x + ${incL}y + ${constCoeff}`,
        acceptedAnswers: [
          `xy + ${incW}x + ${incL}y + ${constCoeff}`,
          `xy + ${incL}y + ${incW}x + ${constCoeff}`,
        ],
        solution: `Chiều dài mới của mảnh đất là: $x + ${incL}$ (m).\nChiều rộng mới của mảnh đất là: $y + ${incW}$ (m).\nDiện tích mới là:\n$S = (x + ${incL})(y + ${incW}) = x \\cdot y + ${incW}x + ${incL}y + ${incL} \\cdot ${incW} = xy + ${incW}x + ${incL}y + ${constCoeff}$ ($\\text{m}^2$).`,
        rubricSteps: [
          { step: 'Xác định kích thước mới theo x và y', points: 0.5 },
          { step: 'Khai triển tích và thu gọn đa thức diện tích', points: 0.5 },
        ],
        keyFormula: '$S = \\text{dài} \\times \\text{rộng}$',
      };
    },
  },

  {
    id: 'T_G8_C1_HARD_01',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Phân tích đa thức thành nhân tử',
    topic: 'Tách hạng tử phân tích tam thức bậc hai',
    problemType: 'Phân tích tam thức bậc hai thành nhân tử',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const u = rng.nextInt(2, 5);
      const v = rng.nextInt(1, 4);
      const sum = u + v;
      const prod = u * v;

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Phân tích đa thức thành nhân tử',
        topic: 'Tách hạng tử phân tích tam thức bậc hai',
        problemType: 'Phân tích tam thức bậc hai thành nhân tử',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Phân tích đa thức sau thành nhân tử bằng phương pháp tách hạng tử: $P(x) = x^2 + ${sum}x + ${prod}$.`,
        correctAnswer: `(x + ${u})(x + ${v})`,
        acceptedAnswers: [
          `(x + ${u})(x + ${v})`,
          `(x + ${v})(x + ${u})`,
        ],
        solution: `Ta tách hạng tử bậc nhất $${sum}x = ${u}x + ${v}x$:\n$P(x) = x^2 + ${u}x + ${v}x + ${prod}$\n$= (x^2 + ${u}x) + (${v}x + ${prod})$\n$= x(x + ${u}) + ${v}(x + ${u}) = (x + ${u})(x + ${v})$.`,
        rubricSteps: [
          { step: 'Tách đúng hạng tử giữa thành hai số có tích bằng hệ số tự do', points: 0.5 },
          { step: 'Nhóm và đưa về dạng tích hai nhị thức', points: 0.5 },
        ],
        keyFormula: '$x^2 + (u+v)x + uv = (x+u)(x+v)$',
      };
    },
  },

  {
    id: 'T_G8_C1_HARD_02',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Bảy hằng đẳng thức đáng nhớ',
    topic: 'Giá trị nhỏ nhất của biểu thức',
    problemType: 'Tìm GTNN của tam thức bậc hai',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const m = rng.nextInt(2, 5);
      const m2 = m * m;
      const k = rng.nextInt(3, 9);
      const c = m2 + k;
      const doubleM = 2 * m;

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Bảy hằng đẳng thức đáng nhớ',
        topic: 'Giá trị nhỏ nhất của biểu thức',
        problemType: 'Tìm GTNN của tam thức bậc hai',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Tìm giá trị nhỏ nhất của biểu thức $A = x^2 - ${doubleM}x + ${c}$ và chỉ ra giá trị của $x$ để đạt được giá trị nhỏ nhất đó.`,
        correctAnswer: `${k}`,
        acceptedAnswers: [`${k}`, `Min = ${k}`, `A = ${k}`],
        solution: `Ta biến đổi biểu thức thành bình phương một hiệu cộng với một hằng số:\n$A = x^2 - 2 \\cdot ${m} \\cdot x + ${m}^2 + ${k} = (x - ${m})^2 + ${k}$.\nVì $(x - ${m})^2 \\ge 0$ với mọi $x$, nên $A = (x - ${m})^2 + ${k} \\ge ${k}$.\nDấu đẳng thức xảy ra khi $x - ${m} = 0 \\Leftrightarrow x = ${m}$.\nVậy giá trị nhỏ nhất của biểu thức $A$ là $${k}$, đạt được khi $x = ${m}$.`,
        rubricSteps: [
          { step: 'Tách biểu thức đưa về dạng (x - m)^2 + k', points: 0.5 },
          { step: 'Lập luận đánh giá bất đẳng thức và chỉ ra dấu bằng xảy ra', points: 0.5 },
        ],
        keyFormula: '$A = (x - m)^2 + k \\ge k$',
      };
    },
  },

  {
    id: 'T_G8_C1_HARD_03',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Bảy hằng đẳng thức đáng nhớ',
    topic: 'Chứng minh biểu thức luôn dương',
    problemType: 'Chứng minh bất đẳng thức',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 4);
      const a2 = a * a;
      const c = a2 + rng.nextInt(1, 5);
      const doubleA = 2 * a;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$B = (x + ${a})^2 + ${c - a2} > 0$ với mọi $x$`,
        [
          { text: `$B$ có thể nhận giá trị âm khi $x < -${a}$`, errorType: 'SAI_TÍNH_CHẤT_BÌNH_PHƯƠNG' },
          { text: `$B = 0$ khi $x = -${a}$`, errorType: 'QUÊN_CỘNG_PHẦN_DƯ' },
          { text: `$B \\le 0$ với mọi $x$`, errorType: 'NGƯỢC_DẤU_BẤT_ĐẲNG_THỨC' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Bảy hằng đẳng thức đáng nhớ',
        topic: 'Chứng minh biểu thức luôn dương',
        problemType: 'Chứng minh bất đẳng thức',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: `Khẳng định nào sau đây là ĐÚNG về dấu của biểu thức $B = x^2 + ${doubleA}x + ${c}$ với mọi số thực $x$?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Ta có $B = x^2 + 2 \\cdot x \\cdot ${a} + ${a}^2 + ${c - a2} = (x + ${a})^2 + ${c - a2}$.\nVì $(x + ${a})^2 \\ge 0$ nên $(x + ${a})^2 + ${c - a2} \\ge ${c - a2} > 0$ với mọi số thực $x$.`,
        rubricSteps: [{ step: 'Biến đổi về bình phương cộng hằng số dương và kết luận đúng', points: 0.5 }],
        keyFormula: '$(A + B)^2 \\ge 0 \\Rightarrow (A + B)^2 + c > 0$ khi $c > 0$.',
      };
    },
  },

  {
    id: 'T_G8_C1_HARD_04',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Phân tích đa thức thành nhân tử',
    topic: 'Ứng dụng tính nhanh giá trị biểu thức',
    problemType: 'Tính nhanh nhờ hằng đẳng thức',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const x = rng.nextInt(95, 105);
      const res = x * x - 1; // (x-1)(x+1)

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Phân tích đa thức thành nhân tử',
        topic: 'Ứng dụng tính nhanh giá trị biểu thức',
        problemType: 'Tính nhanh nhờ hằng đẳng thức',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Sử dụng hằng đẳng thức đáng nhớ để tính nhanh giá trị của tích: $T = ${x - 1} \\times ${x + 1}$.`,
        correctAnswer: `${res}`,
        acceptedAnswers: [`${res}`],
        solution: `Ta nhận thấy:\n$T = (${x} - 1)(${x} + 1) = ${x}^2 - 1^2 = ${x * x} - 1 = ${res}$.`,
        rubricSteps: [
          { step: 'Nhận dạng hiệu hai bình phương', points: 0.5 },
          { step: 'Tính ra kết quả chính xác không dùng máy tính', points: 0.5 },
        ],
        keyFormula: '$(A - 1)(A + 1) = A^2 - 1$',
      };
    },
  },

  // ----------------------------------------------------------------------------
  // CHƯƠNG 2: PHÂN THỨC ĐẠI SỐ (G8_C2) - HK1
  // ----------------------------------------------------------------------------
  {
    id: 'T_G8_C2_EASY_01',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Phân thức đại số và tính chất cơ bản',
    topic: 'Điều kiện xác định của phân thức',
    problemType: 'Tìm điều kiện xác định',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 9);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x \\neq ${a}$`,
        [
          { text: `$x \\neq -${a}$`, errorType: 'SAI_DẤU' },
          { text: `$x = ${a}$`, errorType: 'LẤY_ĐIỀU_KIỆN_MẪU_BẰNG_0' },
          { text: `$x \\neq 0$`, errorType: 'CHỈ_XÉT_X_KHÁC_KHÔNG' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Phân thức đại số và tính chất cơ bản',
        topic: 'Điều kiện xác định của phân thức',
        problemType: 'Tìm điều kiện xác định',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Điều kiện xác định của phân thức $\\frac{x + 1}{x - ${a}}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Phân thức $\\frac{A}{B}$ xác định khi và chỉ khi mẫu thức khác 0:\n$x - ${a} \\neq 0 \\Leftrightarrow x \\neq ${a}$.`,
        rubricSteps: [{ step: 'Cho mẫu thức khác 0 và giải tìm x', points: 0.5 }],
        keyFormula: 'Phân thức xác định $\\Leftrightarrow \\text{Mẫu} \\neq 0$',
      };
    },
  },

  {
    id: 'T_G8_C2_EASY_02',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Rút gọn phân thức đại số',
    topic: 'Rút gọn phân thức',
    problemType: 'Chia cả tử và mẫu cho nhân tử chung',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const k = rng.nextInt(2, 5);
      const a = rng.nextInt(2, 6);
      const ka = k * a;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${k}$`,
        [
          { text: `$\\frac{1}{${k}}$`, errorType: 'NGHỊCH_ĐẢO_KẾT_QUẢ' },
          { text: `$${ka}$`, errorType: 'KHÔNG_CHIA_HỆ_SỐ' },
          { text: `$x - ${a}$`, errorType: 'SAI_QUY_TẮC_RÚT_GỌN' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Rút gọn phân thức đại số',
        topic: 'Rút gọn phân thức',
        problemType: 'Chia cả tử và mẫu cho nhân tử chung',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Rút gọn phân thức $\\frac{${k}x - ${ka}}{x - ${a}}$ ta được kết quả là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Ta phân tích tử thức thành nhân tử:\n$\\frac{${k}(x - ${a})}{x - ${a}} = ${k}$ (với $x \\neq ${a}$).`,
        rubricSteps: [{ step: 'Phân tích tử thành nhân tử và rút gọn với mẫu', points: 0.5 }],
        keyFormula: '$\\frac{A \\cdot C}{B \\cdot C} = \\frac{A}{B}$',
      };
    },
  },

  {
    id: 'T_G8_C2_EASY_03',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Cộng, trừ, nhân, chia phân thức đại số',
    topic: 'Cộng hai phân thức cùng mẫu',
    problemType: 'Cộng phân thức cùng mẫu',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const b = rng.nextInt(1, 4);
      const sum = a + b;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$\\frac{${sum}}{x}$`,
        [
          { text: `$\\frac{${sum}}{2x}$`, errorType: 'CỘNG_CẢ_MẪU' },
          { text: `$\\frac{${a * b}}{x}$`, errorType: 'NHÂN_TỬ_THAY_VÌ_CỘNG' },
          { text: `$\\frac{${sum}}{x^2}$`, errorType: 'NHÂN_MẪU' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Cộng, trừ, nhân, chia phân thức đại số',
        topic: 'Cộng hai phân thức cùng mẫu',
        problemType: 'Cộng phân thức cùng mẫu',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Thực hiện phép tính $\\frac{${a}}{x} + \\frac{${b}}{x}$ (với $x \\neq 0$):`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Cộng các tử thức và giữ nguyên mẫu thức:\n$\\frac{${a}}{x} + \\frac{${b}}{x} = \\frac{${a} + ${b}}{x} = \\frac{${sum}}{x}$.`,
        rubricSteps: [{ step: 'Cộng tử với tử và giữ nguyên mẫu', points: 0.5 }],
        keyFormula: '$\\frac{A}{M} + \\frac{B}{M} = \\frac{A+B}{M}$',
      };
    },
  },

  {
    id: 'T_G8_C2_EASY_04',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Rút gọn phân thức đại số',
    topic: 'Rút gọn bằng hằng đẳng thức',
    problemType: 'Rút gọn phân thức bậc hai',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 6);
      const a2 = a * a;

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Rút gọn phân thức đại số',
        topic: 'Rút gọn bằng hằng đẳng thức',
        problemType: 'Rút gọn phân thức bậc hai',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Rút gọn phân thức sau với điều kiện $x \\neq ${a}$ và $x \\neq -${a}$:\n$$P = \\frac{x^2 - ${a2}}{x + ${a}}$$`,
        correctAnswer: `x - ${a}`,
        acceptedAnswers: [`x - ${a}`, `x-${a}`],
        solution: `Phân tích tử thức thành nhân tử:\n$x^2 - ${a2} = (x - ${a})(x + ${a})$.\nDo đó:\n$P = \\frac{(x - ${a})(x + ${a})}{x + ${a}} = x - ${a}$.`,
        rubricSteps: [
          { step: 'Phân tích tử thức bằng hằng đẳng thức hiệu hai bình phương', points: 0.5 },
          { step: 'Rút gọn nhân tử chung ở cả tử và mẫu', points: 0.5 },
        ],
        keyFormula: '$x^2 - a^2 = (x - a)(x + a)$',
      };
    },
  },

  {
    id: 'T_G8_C2_MED_01',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Cộng, trừ, nhân, chia phân thức đại số',
    topic: 'Quy đồng mẫu thức và cộng trừ phân thức',
    problemType: 'Cộng trừ hai phân thức khác mẫu',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const b = rng.nextInt(2, 5);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$\\frac{${a + b}x}{(x - 1)(x + 1)}$`,
        [
          { text: `$\\frac{${a - b}x}{(x - 1)(x + 1)}$`, errorType: 'SAI_DẤU_CỘNG' },
          { text: `$\\frac{${a + b}}{2x}$`, errorType: 'CỘNG_HAI_MẪU' },
          { text: `$\\frac{${a + b}x}{x^2 + 1}$`, errorType: 'SAI_MẪU_THỨC_CHUNG' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Cộng, trừ, nhân, chia phân thức đại số',
        topic: 'Quy đồng mẫu thức và cộng trừ phân thức',
        problemType: 'Cộng trừ hai phân thức khác mẫu',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Thực hiện phép tính $\\frac{${a}}{x - 1} + \\frac{${b}}{x + 1}$ khi $a = ${a}, b = ${b}$ ta được tử thức sau khi thu gọn là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Mẫu thức chung là $(x - 1)(x + 1) = x^2 - 1$.\nQuy đồng:\n$\\frac{${a}(x + 1) + ${b}(x - 1)}{(x - 1)(x + 1)} = \\frac{${a}x + ${a} + ${b}x - ${b}}{(x - 1)(x + 1)} = \\frac{${a + b}x + ${a - b}}{(x - 1)(x + 1)}$.\n(Nếu $a = b$ thì tử chỉ còn $${a + b}x$).`,
        rubricSteps: [{ step: 'Quy đồng mẫu thức và cộng các tử số', points: 0.5 }],
        keyFormula: 'MTC là tích của các mẫu thức nguyên tố cùng nhau.',
      };
    },
  },

  {
    id: 'T_G8_C2_MED_02',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Cộng, trừ, nhân, chia phân thức đại số',
    topic: 'Nhân hai phân thức đại số',
    problemType: 'Nhân và rút gọn phân thức',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const b = rng.nextInt(2, 5);

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Cộng, trừ, nhân, chia phân thức đại số',
        topic: 'Nhân hai phân thức đại số',
        problemType: 'Nhân và rút gọn phân thức',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Thực hiện phép tính và rút gọn biểu thức sau:\n$$B = \\frac{x - ${a}}{x + ${b}} \\cdot \\frac{2x + ${2 * b}}{x^2 - ${a * a}}$$`,
        correctAnswer: `2/(x + ${a})`,
        acceptedAnswers: [
          `2/(x + ${a})`,
          `\\frac{2}{x + ${a}}`,
          `2/(x+${a})`,
        ],
        solution: `Phân tích các đa thức thành nhân tử:\n$2x + ${2 * b} = 2(x + ${b})$;\n$x^2 - ${a * a} = (x - ${a})(x + ${a})$.\nKhi đó:\n$B = \\frac{x - ${a}}{x + ${b}} \\cdot \\frac{2(x + ${b})}{(x - ${a})(x + ${a})} = \\frac{2(x - ${a})(x + ${b})}{(x + ${b})(x - ${a})(x + ${a})} = \\frac{2}{x + ${a}}$.`,
        rubricSteps: [
          { step: 'Phân tích các tử và mẫu thành nhân tử', points: 0.5 },
          { step: 'Nhân tử với tử, mẫu với mẫu rồi triệt tiêu nhân tử chung', points: 0.5 },
        ],
        keyFormula: '$\\frac{A}{B} \\cdot \\frac{C}{D} = \\frac{A \\cdot C}{B \\cdot D}$',
      };
    },
  },

  {
    id: 'T_G8_C2_MED_03',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Cộng, trừ, nhân, chia phân thức đại số',
    topic: 'Chia phân thức đại số',
    problemType: 'Chia phân thức bằng cách nhân nghịch đảo',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 6);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$\\frac{x - ${a}}{x}$`,
        [
          { text: `$\\frac{x}{x - ${a}}$`, errorType: 'NGHỊCH_ĐẢO_KẾT_QUẢ' },
          { text: `$\\frac{(x - ${a})^2}{x^2}$`, errorType: 'NHÂN_THAY_VÌ_CHIA' },
          { text: `$1$`, errorType: 'SAI_QUY_TẮC' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Cộng, trừ, nhân, chia phân thức đại số',
        topic: 'Chia phân thức đại số',
        problemType: 'Chia phân thức bằng cách nhân nghịch đảo',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Thực hiện phép tính $\\frac{x^2 - ${a * a}}{x} : (x + ${a})$ (với điều kiện biểu thức xác định):`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Ta chuyển phép chia thành phép nhân với phân thức nghịch đảo:\n$\\frac{x^2 - ${a * a}}{x} : \\frac{x + ${a}}{1} = \\frac{(x - ${a})(x + ${a})}{x} \\cdot \\frac{1}{x + ${a}} = \\frac{x - ${a}}{x}$.`,
        rubricSteps: [{ step: 'Nhân với phân thức nghịch đảo và rút gọn', points: 0.5 }],
        keyFormula: '$\\frac{A}{B} : \\frac{C}{D} = \\frac{A}{B} \\cdot \\frac{D}{C}$',
      };
    },
  },

  {
    id: 'T_G8_C2_MED_04',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Phân thức đại số và tính chất cơ bản',
    topic: 'Ứng dụng thực tế của phân thức',
    problemType: 'Bài toán vận tốc thời gian biểu diễn bằng phân thức',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const distance = rng.nextInt(60, 120);
      const v = rng.nextInt(30, 50);

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Phân thức đại số và tính chất cơ bản',
        topic: 'Ứng dụng thực tế của phân thức',
        problemType: 'Bài toán vận tốc thời gian biểu diễn bằng phân thức',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Một ô tô đi quãng đường dài $${distance}$ km với vận tốc là $v$ (km/h). Khi về, xe tăng vận tốc thêm $10$ km/h. Viết biểu thức phân thức biểu diễn tổng thời gian cả đi và về của ô tô theo $v$.`,
        correctAnswer: `${distance}/v + ${distance}/(v + 10)`,
        acceptedAnswers: [
          `${distance}/v + ${distance}/(v + 10)`,
          `\\frac{${distance}}{v} + \\frac{${distance}}{v + 10}`,
        ],
        solution: `Thời gian lúc đi là: $t_1 = \\frac{${distance}}{v}$ (giờ).\nVận tốc lúc về là: $v + 10$ (km/h).\nThời gian lúc về là: $t_2 = \\frac{${distance}}{v + 10}$ (giờ).\nTổng thời gian cả đi và về là:\n$T = t_1 + t_2 = \\frac{${distance}}{v} + \\frac{${distance}}{v + 10}$ (giờ).`,
        rubricSteps: [
          { step: 'Lập phân thức biểu diễn thời gian lúc đi và lúc về', points: 0.5 },
          { step: 'Cộng hai phân thức thời gian', points: 0.5 },
        ],
        keyFormula: '$t = \\frac{s}{v}$',
      };
    },
  },

  {
    id: 'T_G8_C2_HARD_01',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Cộng, trừ, nhân, chia phân thức đại số',
    topic: 'Rút gọn biểu thức phân thức tổng hợp',
    problemType: 'Rút gọn biểu thức chứa nhiều phép toán',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 4);

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Cộng, trừ, nhân, chia phân thức đại số',
        topic: 'Rút gọn biểu thức phân thức tổng hợp',
        problemType: 'Rút gọn biểu thức chứa nhiều phép toán',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Cho biểu thức $A = \\left( \\frac{1}{x - ${a}} - \\frac{1}{x + ${a}} \\right) : \\frac{2}{x^2 - ${a * a}}$ với $x \\neq \\pm ${a}$. Rút gọn biểu thức $A$.`,
        correctAnswer: `${a}`,
        acceptedAnswers: [`${a}`],
        solution: `Bước 1: Quy đồng mẫu thức trong ngoặc:\n$\\frac{1}{x - ${a}} - \\frac{1}{x + ${a}} = \\frac{(x + ${a}) - (x - ${a})}{(x - ${a})(x + ${a})} = \\frac{2 \\cdot ${a}}{x^2 - ${a * a}} = \\frac{${2 * a}}{x^2 - ${a * a}}$.\nBước 2: Thực hiện phép chia:\n$A = \\frac{${2 * a}}{x^2 - ${a * a}} : \\frac{2}{x^2 - ${a * a}} = \\frac{${2 * a}}{x^2 - ${a * a}} \\cdot \\frac{x^2 - ${a * a}}{2} = \\frac{${2 * a}}{2} = ${a}$.`,
        rubricSteps: [
          { step: 'Thực hiện phép trừ trong ngoặc đúng quy đồng', points: 0.5 },
          { step: 'Nhân nghịch đảo và rút gọn ra kết quả chính xác', points: 0.5 },
        ],
        keyFormula: 'Thứ tự ưu tiên: tính trong ngoặc trước, nhân chia sau.',
      };
    },
  },

  {
    id: 'T_G8_C2_HARD_02',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Phân thức đại số và tính chất cơ bản',
    topic: 'Tìm x nguyên để phân thức nhận giá trị nguyên',
    problemType: 'Giá trị nguyên của phân thức',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(1, 3);
      const k = rng.nextInt(2, 4);

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Phân thức đại số và tính chất cơ bản',
        topic: 'Tìm x nguyên để phân thức nhận giá trị nguyên',
        problemType: 'Giá trị nguyên của phân thức',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Tìm các số nguyên $x$ để phân thức $P = \\frac{x + ${k + a}}{x + ${a}}$ nhận giá trị nguyên.`,
        correctAnswer: `${-a - k}, ${-a - 1}, ${-a + 1}, ${-a + k}`,
        acceptedAnswers: [
          `x in Ư(${k})`,
          `${-a - k}, ${-a - 1}, ${-a + 1}, ${-a + k}`,
        ],
        solution: `Ta tách phân thức:\n$P = \\frac{(x + ${a}) + ${k}}{x + ${a}} = 1 + \\frac{${k}}{x + ${a}}$.\nĐể $P$ nhận giá trị nguyên khi $x$ là số nguyên thì $x + ${a}$ phải là ước của $${k}$.\nƯớc của $${k}$ gồm $\\{\\pm 1, \\pm ${k}\\}$.\nTừ đó giải tìm các giá trị tương ứng của $x$.`,
        rubricSteps: [
          { step: 'Tách phân thức thành phần nguyên cộng phân thức có tử là hằng số', points: 0.5 },
          { step: 'Tìm tập hợp ước của hằng số và suy ra các giá trị nguyên x', points: 0.5 },
        ],
        keyFormula: '$\\frac{A(x)}{B(x)} = Q(x) + \\frac{R}{B(x)}$, $P \\in \\mathbb{Z} \\Leftrightarrow B(x) \\in \\text{Ư}(R)$',
      };
    },
  },

  {
    id: 'T_G8_C2_HARD_03',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Cộng, trừ, nhân, chia phân thức đại số',
    topic: 'Tìm giá trị của x để phân thức bằng một số',
    problemType: 'Giải phương trình chứa phân thức',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const target = rng.nextInt(2, 4);
      // (x + a)/(x - 1) = target => x + a = target * x - target => (target - 1)x = a + target => x = (a + target)/(target - 1)
      const num = a + target;
      const den = target - 1;
      const sol = num / den;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x = ${sol}$`,
        [
          { text: `$x = ${sol + 1}$`, errorType: 'TÍNH_NHẦM_CHUYỂN_VẾ' },
          { text: `$x = ${-sol}$`, errorType: 'SAI_DẤU_NGHIỆM' },
          { text: `$x = 1$`, errorType: 'NGHIỆM_TRÙNG_ĐIỀU_KIỆN_MẪU' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Cộng, trừ, nhân, chia phân thức đại số',
        topic: 'Tìm giá trị của x để phân thức bằng một số',
        problemType: 'Giải phương trình chứa phân thức',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: `Tìm $x$ để phân thức $\\frac{x + ${a}}{x - 1}$ nhận giá trị bằng $${target}$:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `ĐKXĐ: $x \\neq 1$.\nTa có: $\\frac{x + ${a}}{x - 1} = ${target} \\Rightarrow x + ${a} = ${target}(x - 1)$\n$\\Leftrightarrow x + ${a} = ${target}x - ${target}$\n$\\Leftrightarrow ${target}x - x = ${a} + ${target} \\Leftrightarrow ${den}x = ${num} \\Leftrightarrow x = ${sol}$ (thỏa mãn ĐKXĐ).`,
        rubricSteps: [{ step: 'Đặt ĐKXĐ, nhân chéo và giải phương trình bậc nhất tìm x', points: 0.5 }],
        keyFormula: '$\\frac{A}{B} = k \\Rightarrow A = k \\cdot B$ (với $B \\neq 0$)',
      };
    },
  },

  {
    id: 'T_G8_C2_HARD_04',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Cộng, trừ, nhân, chia phân thức đại số',
    topic: 'Bài toán chuyển động xuôi ngược dòng',
    problemType: 'Thời gian chuyển động dòng nước',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const s = rng.nextInt(30, 60);
      const vWater = rng.nextInt(2, 4);

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Cộng, trừ, nhân, chia phân thức đại số',
        topic: 'Bài toán chuyển động xuôi ngược dòng',
        problemType: 'Thời gian chuyển động dòng nước',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Một ca nô chạy trên khúc sông dài $${s}$ km. Vận tốc dòng nước là $${vWater}$ km/h. Gọi $v$ (km/h) là vận tốc thực của ca nô khi nước yên lặng ($v > ${vWater}$). Viết biểu thức hiệu thời gian đi ngược dòng và đi xuôi dòng của ca nô theo $v$, sau đó quy đồng rút gọn biểu thức đó.`,
        correctAnswer: `${2 * s * vWater}/(v^2 - ${vWater * vWater})`,
        acceptedAnswers: [
          `${2 * s * vWater}/(v^2 - ${vWater * vWater})`,
          `\\frac{${2 * s * vWater}}{v^2 - ${vWater * vWater}}`,
        ],
        solution: `Vận tốc xuôi dòng là $v + ${vWater}$ (km/h); thời gian xuôi dòng là $t_1 = \\frac{${s}}{v + ${vWater}}$ (giờ).\nVận tốc ngược dòng là $v - ${vWater}$ (km/h); thời gian ngược dòng là $t_2 = \\frac{${s}}{v - ${vWater}}$ (giờ).\nHiệu thời gian là:\n$\\Delta t = t_2 - t_1 = \\frac{${s}}{v - ${vWater}} - \\frac{${s}}{v + ${vWater}}$\n$= \\frac{${s}(v + ${vWater}) - ${s}(v - ${vWater})}{(v - ${vWater})(v + ${vWater})} = \\frac{${s}v + ${s * vWater} - ${s}v + ${s * vWater}}{v^2 - ${vWater * vWater}} = \\frac{${2 * s * vWater}}{v^2 - ${vWater * vWater}}$ (giờ).`,
        rubricSteps: [
          { step: 'Lập biểu thức thời gian xuôi và ngược dòng', points: 0.5 },
          { step: 'Thực hiện phép trừ và quy đồng mẫu số rút gọn', points: 0.5 },
        ],
        keyFormula: '$v_{\\text{xuôi}} = v + v_n$, $v_{\\text{ngược}} = v - v_n$',
      };
    },
  },

  // ----------------------------------------------------------------------------
  // CHƯƠNG 3: TỨ GIÁC VÀ ĐỊNH LÍ PYTHAGORE (G8_C3) - HK1
  // ----------------------------------------------------------------------------
  {
    id: 'T_G8_C3_EASY_01',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Hình thang cân, Hình bình hành, Hình chữ nhật',
    topic: 'Tổng các góc của một tứ giác',
    problemType: 'Tìm số đo góc còn lại trong tứ giác',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const gA = rng.nextInt(60, 90);
      const gB = rng.nextInt(70, 110);
      const gC = rng.nextInt(65, 100);
      const gD = 360 - (gA + gB + gC);

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${gD}^\\circ$`,
        [
          { text: `$${180 - (gA + gB + gC - 180)}^\\circ$`, errorType: 'NHẦM_TỔNG_GÓC_TỨ_GIÁC_LÀ_180' },
          { text: `$${gD + 10}^\\circ$`, errorType: 'TÍNH_NHẦM' },
          { text: `$${gD - 10}^\\circ$`, errorType: 'TÍNH_NHẦM' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Hình thang cân, Hình bình hành, Hình chữ nhật',
        topic: 'Tổng các góc của một tứ giác',
        problemType: 'Tìm số đo góc còn lại trong tứ giác',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Cho tứ giác $ABCD$ có $\\widehat{A} = ${gA}^\\circ$, $\\widehat{B} = ${gB}^\\circ$, $\\widehat{C} = ${gC}^\\circ$. Số đo của góc $D$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Tổng bốn góc trong một tứ giác luôn bằng $360^\\circ$:\n$\\widehat{D} = 360^\\circ - (\\widehat{A} + \\widehat{B} + \\widehat{C}) = 360^\\circ - (${gA}^\\circ + ${gB}^\\circ + ${gC}^\\circ) = ${gD}^\\circ$.`,
        rubricSteps: [{ step: 'Áp dụng định lí tổng các góc trong tứ giác bằng 360 độ', points: 0.5 }],
        keyFormula: '$\\widehat{A} + \\widehat{B} + \\widehat{C} + \\widehat{D} = 360^\\circ$',
      };
    },
  },

  {
    id: 'T_G8_C3_EASY_02',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Định lí Pythagore và ứng dụng',
    topic: 'Tính cạnh huyền tam giác vuông',
    problemType: 'Áp dụng định lí Pythagore thuận',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const pythTriples = [
        [3, 4, 5],
        [6, 8, 10],
        [5, 12, 13],
        [9, 12, 15],
      ];
      const triple = rng.pick(pythTriples);
      const a = triple[0];
      const b = triple[1];
      const c = triple[2];

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${c}$ cm`,
        [
          { text: `$${a + b}$ cm`, errorType: 'CỘNG_TRỰC_TIẾP_HAI_CẠNH' },
          { text: `$${c + 2}$ cm`, errorType: 'TÍNH_NHẦM' },
          { text: `$${c * c}$ cm`, errorType: 'CHƯA_LẤY_CĂN_BẬC_HAI' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Định lí Pythagore và ứng dụng',
        topic: 'Tính cạnh huyền tam giác vuông',
        problemType: 'Áp dụng định lí Pythagore thuận',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Cho tam giác $ABC$ vuông tại $A$ có hai cạnh góc vuông $AB = ${a}$ cm và $AC = ${b}$ cm. Độ dài cạnh huyền $BC$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Áp dụng định lí Pythagore cho tam giác $ABC$ vuông tại $A$:\n$BC^2 = AB^2 + AC^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}$.\nDo đó $BC = \\sqrt{${c * c}} = ${c}$ cm.`,
        rubricSteps: [{ step: 'Viết công thức định lí Pythagore và tính đúng cạnh huyền', points: 0.5 }],
        keyFormula: '$c^2 = a^2 + b^2$',
      };
    },
  },

  {
    id: 'T_G8_C3_EASY_03',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Hình thoi và Hình vuông',
    topic: 'Tính chất hình chữ nhật và hình thoi',
    problemType: 'Nhận biết tính chất đường chéo',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Hai đường chéo vuông góc với nhau và là đường phân giác của các góc',
        [
          { text: 'Hai đường chéo bằng nhau và vuông góc với nhau', errorType: 'NHẦM_VỚI_HÌNH_VUÔNG' },
          { text: 'Bốn góc bằng nhau và bằng 90 độ', errorType: 'NHẦM_VỚI_HÌNH_CHỮ_NHẬT' },
          { text: 'Hai đường chéo bằng nhau nhưng không cắt nhau tại trung điểm', errorType: 'SAI_TÍNH_CHẤT' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Hình thoi và Hình vuông',
        topic: 'Tính chất hình chữ nhật và hình thoi',
        problemType: 'Nhận biết tính chất đường chéo',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Trong các khẳng định sau, khẳng định nào mô tả ĐÚNG tính chất đặc trưng của hai đường chéo trong hình thoi?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Trong hình thoi, hai đường chéo vuông góc với nhau tại trung điểm của mỗi đường và là các đường phân giác của các góc trong hình thoi.`,
        rubricSteps: [{ step: 'Nhận biết đúng tính chất đường chéo hình thoi', points: 0.5 }],
        keyFormula: 'Hình thoi: hai đường chéo vuông góc và phân giác góc.',
      };
    },
  },

  {
    id: 'T_G8_C3_EASY_04',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Hình thang cân, Hình bình hành, Hình chữ nhật',
    topic: 'Tính chất hình thang cân',
    problemType: 'Tính góc của hình thang cân',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const angleA = rng.nextInt(100, 125);
      const angleD = 180 - angleA;

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Hình thang cân, Hình bình hành, Hình chữ nhật',
        topic: 'Tính chất hình thang cân',
        problemType: 'Tính góc của hình thang cân',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Cho hình thang cân $ABCD$ ($AB \\parallel CD$) có góc ở đáy $\\widehat{A} = ${angleA}^\\circ$. Hãy tính số đo của các góc còn lại trong hình thang cân.`,
        correctAnswer: `B = ${angleA}, C = ${angleD}, D = ${angleD}`,
        acceptedAnswers: [
          `B = ${angleA}, C = ${angleD}, D = ${angleD}`,
          `${angleA}, ${angleD}, ${angleD}`,
        ],
        solution: `Vì $ABCD$ là hình thang cân với $AB \\parallel CD$:\n- Hai góc kề một đáy bằng nhau: $\\widehat{B} = \\widehat{A} = ${angleA}^\\circ$.\n- Hai góc trong cùng phía bù nhau: $\\widehat{D} = 180^\\circ - \\widehat{A} = 180^\\circ - ${angleA}^\\circ = ${angleD}^\\circ$.\n- Do đó góc kề đáy còn lại: $\\widehat{C} = \\widehat{D} = ${angleD}^\\circ$.`,
        rubricSteps: [
          { step: 'Chỉ ra tính chất hai góc kề đáy bằng nhau để tính góc B', points: 0.5 },
          { step: 'Sử dụng tính chất bù nhau của góc trong cùng phía để tính góc C và D', points: 0.5 },
        ],
        keyFormula: 'Hình thang cân: góc kề một đáy bằng nhau; góc trong cùng phía bù nhau.',
      };
    },
  },

  {
    id: 'T_G8_C3_MED_01',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Định lí Pythagore và ứng dụng',
    topic: 'Định lí Pythagore đảo',
    problemType: 'Kiểm tra tam giác vuông',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const rightSets = [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],
        [6, 8, 10],
      ];
      const pick = rng.pick(rightSets);
      const a = pick[0];
      const b = pick[1];
      const c = pick[2];

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `Tam giác vuông vì $${a}^2 + ${b}^2 = ${c}^2$`,
        [
          { text: `Tam giác không vuông vì $${a} + ${b} \\neq ${c}$`, errorType: 'DÙNG_TỔNG_CẠNH' },
          { text: `Tam giác tù vì cạnh lớn nhất bằng ${c}`, errorType: 'KẾT_LUẬN_SAI' },
          { text: `Tam giác nhọn vì ba cạnh khác nhau`, errorType: 'LẬP_LUẬN_SAI' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Định lí Pythagore và ứng dụng',
        topic: 'Định lí Pythagore đảo',
        problemType: 'Kiểm tra tam giác vuông',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Một tam giác có độ dài ba cạnh lần lượt là $${a}$ cm, $${b}$ cm, $${c}$ cm. Tam giác này có phải là tam giác vuông không? Vì sao?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Ta xét bình phương cạnh lớn nhất: $${c}^2 = ${c * c}$.\nTổng bình phương hai cạnh còn lại: $${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}$.\nVì $${a}^2 + ${b}^2 = ${c}^2$ nên theo định lí Pythagore đảo, tam giác này là tam giác vuông.`,
        rubricSteps: [{ step: 'Tính bình phương các cạnh và đối chiếu định lí Pythagore đảo', points: 0.5 }],
        keyFormula: '$a^2 + b^2 = c^2 \\Rightarrow \\Delta$ vuông',
      };
    },
  },

  {
    id: 'T_G8_C3_MED_02',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Hình thang cân, Hình bình hành, Hình chữ nhật',
    topic: 'Độ dài đường chéo hình chữ nhật',
    problemType: 'Tính đường chéo bằng Pythagore',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const triples = [
        [6, 8, 10],
        [9, 12, 15],
        [5, 12, 13],
      ];
      const p = rng.pick(triples);
      const w = p[0];
      const l = p[1];
      const d = p[2];

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Hình thang cân, Hình bình hành, Hình chữ nhật',
        topic: 'Độ dài đường chéo hình chữ nhật',
        problemType: 'Tính đường chéo bằng Pythagore',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Một màn hình máy tính hình chữ nhật có chiều rộng là $${w}$ inch và chiều dài là $${l}$ inch. Hãy tính kích thước đường chéo của màn hình máy tính đó.`,
        correctAnswer: `${d}`,
        acceptedAnswers: [`${d}`, `${d} inch`],
        solution: `Đường chéo và hai cạnh kề của hình chữ nhật tạo thành một tam giác vuông.\nTheo định lí Pythagore:\n$d^2 = ${w}^2 + ${l}^2 = ${w * w} + ${l * l} = ${d * d}$.\nDo đó đường chéo màn hình là $d = \\sqrt{${d * d}} = ${d}$ inch.`,
        rubricSteps: [
          { step: 'Nhận diện tam giác vuông tạo bởi đường chéo và hai cạnh', points: 0.5 },
          { step: 'Áp dụng định lí Pythagore tính ra đường chéo', points: 0.5 },
        ],
        keyFormula: '$d = \\sqrt{a^2 + b^2}$',
      };
    },
  },

  {
    id: 'T_G8_C3_MED_03',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Hình thoi và Hình vuông',
    topic: 'Diện tích hình thoi',
    problemType: 'Tính diện tích hình thoi theo độ dài hai đường chéo',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const d1 = rng.nextInt(6, 12) * 2;
      const d2 = rng.nextInt(4, 10) * 2;
      const area = (d1 * d2) / 2;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${area}$ $\\text{cm}^2$`,
        [
          { text: `$${d1 * d2}$ $\\text{cm}^2$`, errorType: 'QUÊN_CHIA_CHO_2' },
          { text: `$${d1 + d2}$ $\\text{cm}^2$`, errorType: 'LẤY_TỔNG_HAI_ĐƯỜNG_CHÉO' },
          { text: `$${area / 2}$ $\\text{cm}^2$`, errorType: 'CHIA_CHO_4' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Hình thoi và Hình vuông',
        topic: 'Diện tích hình thoi',
        problemType: 'Tính diện tích hình thoi theo độ dài hai đường chéo',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Một tấm bìa hình thoi có độ dài hai đường chéo lần lượt là $${d1}$ cm và $${d2}$ cm. Diện tích của tấm bìa hình thoi đó là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Diện tích hình thoi bằng một nửa tích độ dài hai đường chéo:\n$S = \\frac{1}{2} d_1 d_2 = \\frac{1}{2} \\cdot ${d1} \\cdot ${d2} = ${area}$ $\\text{cm}^2$.`,
        rubricSteps: [{ step: 'Áp dụng đúng công thức diện tích hình thoi', points: 0.5 }],
        keyFormula: '$S = \\frac{1}{2} d_1 d_2$',
      };
    },
  },

  {
    id: 'T_G8_C3_MED_04',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Định lí Pythagore và ứng dụng',
    topic: 'Ứng dụng thực tế của định lí Pythagore',
    problemType: 'Bài toán thang dựa vào tường',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const triple = rng.pick([
        [3, 4, 5],
        [6, 8, 10],
      ]);
      const baseDist = triple[0];
      const wallHeight = triple[1];
      const ladderLen = triple[2];

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Định lí Pythagore và ứng dụng',
        topic: 'Ứng dụng thực tế của định lí Pythagore',
        problemType: 'Bài toán thang dựa vào tường',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Một chiếc thang dài $${ladderLen}$ m dựa vào một bức tường thẳng đứng. Chân thang cách chân tường một khoảng $${baseDist}$ m. Hỏi đầu trên của thang chạm tường ở độ cao bao nhiêu mét so với mặt đất?`,
        correctAnswer: `${wallHeight}`,
        acceptedAnswers: [`${wallHeight}`, `${wallHeight} m`],
        solution: `Thang, mặt đất và bức tường tạo thành một tam giác vuông với cạnh huyền là chiều dài thang $L = ${ladderLen}$ m, một cạnh góc vuông là khoảng cách chân thang $d = ${baseDist}$ m.\nGọi chiều cao chạm tường là $h$ (m).\nÁp dụng định lí Pythagore:\n$h^2 + ${baseDist}^2 = ${ladderLen}^2 \\Leftrightarrow h^2 = ${ladderLen * ladderLen} - ${baseDist * baseDist} = ${wallHeight * wallHeight}$.\nVậy $h = \\sqrt{${wallHeight * wallHeight}} = ${wallHeight}$ m.`,
        rubricSteps: [
          { step: 'Mô hình hóa bài toán thành tam giác vuông', points: 0.5 },
          { step: 'Dùng Pythagore tính ra chiều cao', points: 0.5 },
        ],
        keyFormula: '$h = \\sqrt{L^2 - d^2}$',
      };
    },
  },

  {
    id: 'T_G8_C3_HARD_01',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Hình thang cân, Hình bình hành, Hình chữ nhật',
    topic: 'Diện tích hình thang cân',
    problemType: 'Tính chiều cao và diện tích hình thang cân',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const side = 5;
      const smallBase = rng.nextInt(6, 10);
      const halfDiff = 3; // side=5, halfDiff=3 => height = 4
      const largeBase = smallBase + 2 * halfDiff;
      const height = 4;
      const area = ((smallBase + largeBase) * height) / 2;

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Hình thang cân, Hình bình hành, Hình chữ nhật',
        topic: 'Diện tích hình thang cân',
        problemType: 'Tính chiều cao và diện tích hình thang cân',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Một hình thang cân có đáy nhỏ bằng $${smallBase}$ cm, đáy lớn bằng $${largeBase}$ cm và mỗi cạnh bên dài $${side}$ cm. Hãy tính diện tích của hình thang cân này.`,
        correctAnswer: `${area}`,
        acceptedAnswers: [`${area}`, `${area} cm2`],
        solution: `Kẻ hai đường cao từ hai đỉnh của đáy nhỏ xuống đáy lớn.\nĐoạn nằm ở chân đường cao là: $\\frac{${largeBase} - ${smallBase}}{2} = ${halfDiff}$ cm.\nÁp dụng định lí Pythagore để tìm chiều cao $h$ của hình thang:\n$h^2 = ${side}^2 - ${halfDiff}^2 = 25 - 9 = 16 \\Rightarrow h = 4$ cm.\nDiện tích hình thang cân là:\n$S = \\frac{(${smallBase} + ${largeBase}) \\cdot 4}{2} = ${area}$ $\\text{cm}^2$.`,
        rubricSteps: [
          { step: 'Kẻ đường cao và tính đoạn đáy phụ', points: 0.5 },
          { step: 'Áp dụng định lí Pythagore tìm chiều cao và tính diện tích', points: 0.5 },
        ],
        keyFormula: '$S = \\frac{(a + b) \\cdot h}{2}$',
      };
    },
  },

  {
    id: 'T_G8_C3_HARD_02',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Hình thoi và Hình vuông',
    topic: 'Cạnh của hình thoi từ hai đường chéo',
    problemType: 'Tính độ dài cạnh và chu vi hình thoi',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const d1 = 12;
      const d2 = 16;
      const half1 = d1 / 2; // 6
      const half2 = d2 / 2; // 8
      const side = 10; // sqrt(36 + 64) = 10
      const peri = side * 4;

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Hình thoi và Hình vuông',
        topic: 'Cạnh của hình thoi từ hai đường chéo',
        problemType: 'Tính độ dài cạnh và chu vi hình thoi',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Một hình thoi có độ dài hai đường chéo lần lượt là $${d1}$ cm và $${d2}$ cm. Hãy tính chu vi của hình thoi đó.`,
        correctAnswer: `${peri}`,
        acceptedAnswers: [`${peri}`, `${peri} cm`],
        solution: `Hai đường chéo hình thoi vuông góc tại trung điểm của mỗi đường.\nNửa độ dài các đường chéo lần lượt là:\n$\\frac{${d1}}{2} = ${half1}$ cm và $\\frac{${d2}}{2} = ${half2}$ cm.\nÁp dụng định lí Pythagore vào tam giác vuông tạo bởi hai nửa đường chéo:\n$a^2 = ${half1}^2 + ${half2}^2 = 36 + 64 = 100 \\Rightarrow a = 10$ cm.\nChu vi hình thoi là $P = 4a = 4 \\times 10 = ${peri}$ cm.`,
        rubricSteps: [
          { step: 'Tính nửa độ dài hai đường chéo và dùng Pythagore tính cạnh', points: 0.5 },
          { step: 'Tính đúng chu vi hình thoi bằng 4 lần cạnh', points: 0.5 },
        ],
        keyFormula: '$a = \\sqrt{(d_1/2)^2 + (d_2/2)^2}$, $P = 4a$',
      };
    },
  },

  {
    id: 'T_G8_C3_HARD_03',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Định lí Pythagore và ứng dụng',
    topic: 'Dây neo cột ăng ten',
    problemType: 'Tính độ dài dây cáp',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const h = 12;
      const d = 5;
      const cable = 13;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${cable}$ m`,
        [
          { text: `$${h + d}$ m`, errorType: 'CỘNG_TRỰC_TIẾP' },
          { text: `$${cable + 2}$ m`, errorType: 'TÍNH_NHẦM' },
          { text: `$${Math.sqrt(h * d).toFixed(1)}$ m`, errorType: 'DÙNG_CÔNG_THỨC_SAI' },
        ]
      );

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Định lí Pythagore và ứng dụng',
        topic: 'Dây neo cột ăng ten',
        problemType: 'Tính độ dài dây cáp',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: `Một cột phát sóng cao $${h}$ m vuông góc với mặt đất phẳng. Người ta căng một sợi dây cáp thép từ đỉnh cột đến một cọc neo trên mặt đất cách chân cột $${d}$ m để giữ thăng bằng. Chiều dài tối thiểu của sợi dây cáp thép đó là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Cột phát sóng, mặt đất và dây cáp neo tạo thành tam giác vuông tại chân cột.\nTheo định lí Pythagore, chiều dài sợi dây cáp $L$ thỏa mãn:\n$L^2 = ${h}^2 + ${d}^2 = 144 + 25 = 169 \\Rightarrow L = \\sqrt{169} = ${cable}$ m.`,
        rubricSteps: [{ step: 'Mô hình hóa tam giác vuông và áp dụng định lí Pythagore', points: 0.5 }],
        keyFormula: '$L = \\sqrt{h^2 + d^2}$',
      };
    },
  },

  {
    id: 'T_G8_C3_HARD_04',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Hình thoi và Hình vuông',
    topic: 'Chứng minh hình vuông',
    problemType: 'Dấu hiệu nhận biết hình vuông',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Hình thoi và Hình vuông',
        topic: 'Chứng minh hình vuông',
        problemType: 'Dấu hiệu nhận biết hình vuông',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Nêu hai dấu hiệu nhận biết một hình chữ nhật là hình vuông.`,
        correctAnswer: 'Có hai cạnh kề bằng nhau hoặc hai đường chéo vuông góc',
        acceptedAnswers: [
          'Có hai cạnh kề bằng nhau hoặc hai đường chéo vuông góc',
          'Hai cạnh kề bằng nhau, hai đường chéo vuông góc',
        ],
        solution: `Các dấu hiệu nhận biết hình chữ nhật là hình vuông:\n1. Hình chữ nhật có hai cạnh kề bằng nhau là hình vuông.\n2. Hình chữ nhật có hai đường chéo vuông góc với nhau là hình vuông.\n3. Hình chữ nhật có một đường chéo là đường phân giác của một góc là hình vuông.`,
        rubricSteps: [
          { step: 'Nêu đúng dấu hiệu về cạnh hoặc đường chéo', points: 0.5 },
          { step: 'Nêu đầy đủ và chính xác dấu hiệu thứ hai', points: 0.5 },
        ],
        keyFormula: 'Hình chữ nhật + (2 cạnh kề bằng nhau HOẶC 2 đường chéo $\\perp$) = Hình vuông.',
      };
    },
  },

  // ----------------------------------------------------------------------------
  // CHƯƠNG 4: PHƯƠNG TRÌNH VÀ HÀM SỐ BẬC NHẤT (G8_C4) - HK2
  // ----------------------------------------------------------------------------
  {
    id: 'T_G8_C4_EASY_01',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Phương trình bậc nhất một ẩn ax + b = 0',
    topic: 'Giải phương trình ax + b = 0',
    problemType: 'Tìm nghiệm phương trình bậc nhất',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 6);
      const b = rng.nextInt(1, 9);
      const x = rng.nextInt(1, 8);
      const constVal = a * x + b;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x = ${x}$`,
        [
          { text: `$x = ${x + 1}$`, errorType: 'TÍNH_NHẦM' },
          { text: `$x = -${x}$`, errorType: 'SAI_DẤU_CHUYỂN_VẾ' },
          { text: `$x = ${x + 2}$`, errorType: 'TÍNH_NHẦM' },
        ]
      );

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Phương trình bậc nhất một ẩn ax + b = 0',
        topic: 'Giải phương trình ax + b = 0',
        problemType: 'Tìm nghiệm phương trình bậc nhất',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Nghiệm của phương trình $${a}x + ${b} = ${constVal}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Chuyển hằng số sang vế phải và chia cho hệ số của $x$:\n$${a}x = ${constVal} - ${b} = ${a * x} \\Leftrightarrow x = \\frac{${a * x}}{${a}} = ${x}$.`,
        rubricSteps: [{ step: 'Chuyển vế đổi dấu và chia hai vế cho hệ số a', points: 0.5 }],
        keyFormula: '$ax + b = c \\Leftrightarrow ax = c - b \\Leftrightarrow x = (c - b)/a$',
      };
    },
  },

  {
    id: 'T_G8_C4_EASY_02',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Hàm số bậc nhất y = ax + b và hệ số góc',
    topic: 'Điểm thuộc đồ thị hàm số',
    problemType: 'Kiểm tra điểm thuộc đường thẳng',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const b = rng.nextInt(1, 4);
      const x = rng.nextInt(1, 3);
      const y = a * x + b;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$M(${x}; ${y})$`,
        [
          { text: `$N(${x}; ${y + 2})$`, errorType: 'TÍNH_SAI_TUNG_ĐỘ' },
          { text: `$P(${x}; ${-y})$`, errorType: 'SAI_DẤU_TUNG_ĐỘ' },
          { text: `$Q(${x + 1}; ${y})$`, errorType: 'SAI_HOÀNH_ĐỘ' },
        ]
      );

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Hàm số bậc nhất y = ax + b và hệ số góc',
        topic: 'Điểm thuộc đồ thị hàm số',
        problemType: 'Kiểm tra điểm thuộc đường thẳng',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Điểm nào sau đây thuộc đồ thị hàm số bậc nhất $y = ${a}x + ${b}$?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Thay hoành độ $x = ${x}$ vào hàm số:\n$y = ${a} \\cdot (${x}) + ${b} = ${a * x} + ${b} = ${y}$.\nVậy điểm $M(${x}; ${y})$ thuộc đồ thị hàm số.`,
        rubricSteps: [{ step: 'Thay tọa độ điểm vào hàm số kiểm tra đẳng thức', points: 0.5 }],
        keyFormula: '$M(x_0, y_0) \\in (d) \\Leftrightarrow y_0 = ax_0 + b$',
      };
    },
  },

  {
    id: 'T_G8_C4_EASY_03',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Hàm số bậc nhất y = ax + b và hệ số góc',
    topic: 'Hệ số góc của đường thẳng',
    problemType: 'Xác định hệ số góc',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 7);
      const b = rng.nextInt(1, 9);

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${a}$`,
        [
          { text: `$${b}$`, errorType: 'NHẦM_VỚI_TUNG_ĐỘ_GỐC' },
          { text: `$x$`, errorType: 'NHẦM_VỚI_BIẾN_SỐ' },
          { text: `$${-a}$`, errorType: 'SAI_DẤU_HỆ_SỐ_GÓC' },
        ]
      );

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Hàm số bậc nhất y = ax + b và hệ số góc',
        topic: 'Hệ số góc của đường thẳng',
        problemType: 'Xác định hệ số góc',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Hệ số góc của đường thẳng $y = ${a}x - ${b}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Đường thẳng $y = ax + b$ có hệ số góc là $a$. Ở đây $a = ${a}$, $b = -${b}$. Vậy hệ số góc là $${a}$.`,
        rubricSteps: [{ step: 'Nhận biết đúng hệ số a là hệ số góc', points: 0.5 }],
        keyFormula: 'Đường thẳng $y = ax + b$ có hệ số góc là $a$.',
      };
    },
  },

  {
    id: 'T_G8_C4_EASY_04',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Phương trình bậc nhất một ẩn ax + b = 0',
    topic: 'Phương trình dạng ax + b = cx + d',
    problemType: 'Giải phương trình chuyển vế',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const c = rng.nextInt(2, 4);
      const a = c + rng.nextInt(1, 3); // a > c
      const x = rng.nextInt(2, 6);
      const d = rng.nextInt(5, 15);
      const b = c * x + d - a * x; // => ax + b = cx + d => (a-c)x = d - b

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Phương trình bậc nhất một ẩn ax + b = 0',
        topic: 'Phương trình dạng ax + b = cx + d',
        problemType: 'Giải phương trình chuyển vế',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Giải phương trình sau: $${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}x + ${d}$.`,
        correctAnswer: `${x}`,
        acceptedAnswers: [`${x}`, `x = ${x}`],
        solution: `Chuyển các hạng tử chứa $x$ sang vế trái, hằng số sang vế phải:\n$${a}x - ${c}x = ${d} ${b >= 0 ? '- ' + b : '+ ' + Math.abs(b)}$\n$\\Leftrightarrow ${a - c}x = ${d - b} \\Leftrightarrow x = \\frac{${d - b}}{${a - c}} = ${x}$.`,
        rubricSteps: [
          { step: 'Chuyển vế đổi dấu chính xác', points: 0.5 },
          { step: 'Thu gọn và tìm ra nghiệm x', points: 0.5 },
        ],
        keyFormula: '$ax + b = cx + d \\Leftrightarrow (a - c)x = d - b$',
      };
    },
  },

  {
    id: 'T_G8_C4_MED_01',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Phương trình bậc nhất một ẩn ax + b = 0',
    topic: 'Phương trình chứa dấu ngoặc',
    problemType: 'Khai triển và thu gọn giải phương trình',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const m = rng.nextInt(2, 4);
      const n = rng.nextInt(2, 3);
      const x = rng.nextInt(1, 5);
      const target = m * (x - 1) + n * (x + 2);

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Phương trình bậc nhất một ẩn ax + b = 0',
        topic: 'Phương trình chứa dấu ngoặc',
        problemType: 'Khai triển và thu gọn giải phương trình',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Giải phương trình: $${m}(x - 1) + ${n}(x + 2) = ${target}$.`,
        correctAnswer: `${x}`,
        acceptedAnswers: [`${x}`, `x = ${x}`],
        solution: `Khai triển dấu ngoặc:\n$${m}x - ${m} + ${n}x + ${2 * n} = ${target}$\n$\\Leftrightarrow (${m} + ${n})x + (${2 * n - m}) = ${target}$\n$\\Leftrightarrow ${m + n}x = ${target} - (${2 * n - m}) = ${(m + n) * x}$\n$\\Leftrightarrow x = ${x}$.`,
        rubricSteps: [
          { step: 'Phá ngoặc bằng quy tắc nhân đơn thức với đa thức', points: 0.5 },
          { step: 'Thu gọn và chia để tìm nghiệm x', points: 0.5 },
        ],
        keyFormula: '$m(x - a) + n(x + b) = C$',
      };
    },
  },

  {
    id: 'T_G8_C4_MED_02',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Hàm số bậc nhất y = ax + b và hệ số góc',
    topic: 'Giao điểm của hai đường thẳng',
    problemType: 'Tìm tọa độ giao điểm bằng phương pháp đại số',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const x = rng.nextInt(1, 4);
      const a1 = 2;
      const b1 = rng.nextInt(1, 4);
      const y = a1 * x + b1;
      const a2 = -1;
      const b2 = y - a2 * x; // y = -x + b2

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$(${x}; ${y})$`,
        [
          { text: `$(${y}; ${x})$`, errorType: 'ĐỔI_CHỖ_X_VÀ_Y' },
          { text: `$(${x}; ${y + 1})$`, errorType: 'TÍNH_NHẦM_TUNG_ĐỘ' },
          { text: `$(${x - 1}; ${y})$`, errorType: 'TÍNH_NHẦM_HOÀNH_ĐỘ' },
        ]
      );

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Hàm số bậc nhất y = ax + b và hệ số góc',
        topic: 'Giao điểm của hai đường thẳng',
        problemType: 'Tìm tọa độ giao điểm bằng phương pháp đại số',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: `Tọa độ giao điểm của hai đường thẳng $y = ${a1}x + ${b1}$ và $y = -x + ${b2}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Phương trình hoành độ giao điểm:\n$${a1}x + ${b1} = -x + ${b2} \\Leftrightarrow 3x = ${b2 - b1} \\Leftrightarrow x = ${x}$.\nThay $x = ${x}$ vào $y = ${a1}x + ${b1} = ${a1} \\cdot ${x} + ${b1} = ${y}$.\nVậy giao điểm là $(${x}; ${y})$.`,
        rubricSteps: [{ step: 'Lập phương trình hoành độ giao điểm và tìm tọa độ (x, y)', points: 0.5 }],
        keyFormula: 'Phương trình hoành độ: $a_1 x + b_1 = a_2 x + b_2$',
      };
    },
  },

  {
    id: 'T_G8_C4_MED_03',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Hàm số bậc nhất y = ax + b và hệ số góc',
    topic: 'Vị trí tương đối của hai đường thẳng',
    problemType: 'Điều kiện để hai đường thẳng song song',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 6);
      const b1 = rng.nextInt(1, 5);

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$m = ${a}$ và $k \\neq ${b1}$`,
        [
          { text: `$m = ${a}$ và $k = ${b1}$`, errorType: 'ĐIỀU_KIỆN_TRÙNG_NHAU' },
          { text: `$m \\neq ${a}$`, errorType: 'ĐIỀU_KIỆN_CẮT_NHAU' },
          { text: `$m = -${a}$`, errorType: 'SAI_DẤU_HỆ_SỐ_A' },
        ]
      );

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Hàm số bậc nhất y = ax + b và hệ số góc',
        topic: 'Vị trí tương đối của hai đường thẳng',
        problemType: 'Điều kiện để hai đường thẳng song song',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Hai đường thẳng $y = ${a}x + ${b1}$ và $y = mx + k$ song song với nhau khi và chỉ khi:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Hai đường thẳng $y = ax + b$ và $y = a\'x + b\'$ song song với nhau khi và chỉ khi $a = a\'$ và $b \\neq b\'$.\nÁp dụng: $m = ${a}$ và $k \\neq ${b1}$.`,
        rubricSteps: [{ step: 'Nêu đúng điều kiện hệ số góc bằng nhau và tung độ gốc khác nhau', points: 0.5 }],
        keyFormula: '$d_1 \\parallel d_2 \\Leftrightarrow a = a\'$ và $b \\neq b\'$',
      };
    },
  },

  {
    id: 'T_G8_C4_MED_04',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Giải bài toán bằng cách lập phương trình',
    topic: 'Bài toán chuyển động đều',
    problemType: 'Tìm vận tốc hoặc thời gian',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const ctx = (book === 'KNTT' ? KNTTContexts : book === 'CD' ? CDContexts : CTSTContexts).realWorld(rng);
      const v1 = 40; // xe máy
      const v2 = 50; // ô tô
      const diffTimeHours = 0.5; // 30 phút
      // s/40 - s/50 = 0.5 => s * 10 / 2000 = 0.5 => s / 200 = 0.5 => s = 100 km
      const dist = 100;

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Giải bài toán bằng cách lập phương trình',
        topic: 'Bài toán chuyển động đều',
        problemType: 'Tìm vận tốc hoặc thời gian',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Một xe máy khởi hành từ A đến B với vận tốc $${v1}$ km/h. Sau đó một ô tô cũng đi từ A đến B với vận tốc $${v2}$ km/h và đến B sớm hơn xe máy $30$ phút ($0{,}5$ giờ). Tính độ dài quãng đường AB.`,
        correctAnswer: `${dist}`,
        acceptedAnswers: [`${dist}`, `${dist} km`],
        solution: `Gọi độ dài quãng đường AB là $s$ (km), điều kiện $s > 0$.\nThời gian xe máy đi là: $\\frac{s}{${v1}}$ (giờ).\nThời gian ô tô đi là: $\\frac{s}{${v2}}$ (giờ).\nVì ô tô đến sớm hơn xe máy $0{,}5$ giờ, ta có phương trình:\n$\\frac{s}{${v1}} - \\frac{s}{${v2}} = 0{,}5$\n$\\Leftrightarrow \\frac{5s - 4s}{200} = 0{,}5 \\Leftrightarrow \\frac{s}{200} = 0{,}5 \\Leftrightarrow s = 100$ (thỏa mãn).\nVậy quãng đường AB dài $100$ km.`,
        rubricSteps: [
          { step: 'Chọn ẩn, đặt đơn vị và điều kiện hợp lí', points: 0.3 },
          { step: 'Biểu diễn thời gian và lập phương trình đúng', points: 0.4 },
          { step: 'Giải phương trình và kết luận quãng đường', points: 0.3 },
        ],
        keyFormula: '$t_1 - t_2 = \\Delta t$',
      };
    },
  },

  {
    id: 'T_G8_C4_HARD_01',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Giải bài toán bằng cách lập phương trình',
    topic: 'Bài toán năng suất làm chung làm riêng',
    problemType: 'Hai tổ cùng làm một công việc',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Hai đội làm chung 12 ngày. Đội 1 làm riêng x ngày, đội 2 làm riêng y ngày.
      // x = 20, y = 30 => 1/20 + 1/30 = 5/60 = 1/12
      const totalDays = 12;
      const xDays = 20;
      const yDays = 30;

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Giải bài toán bằng cách lập phương trình',
        topic: 'Bài toán năng suất làm chung làm riêng',
        problemType: 'Hai tổ cùng làm một công việc',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Hai tổ công nhân cùng làm chung một công việc thì hoàn thành trong $${totalDays}$ ngày. Nếu tổ I làm riêng thì hoàn thành công việc nhanh hơn tổ II là $10$ ngày. Hỏi nếu làm một mình thì mỗi tổ hoàn thành công việc trong bao nhiêu ngày?`,
        correctAnswer: `Tổ I: ${xDays} ngày, Tổ II: ${yDays} ngày`,
        acceptedAnswers: [
          `Tổ I: ${xDays} ngày, Tổ II: ${yDays} ngày`,
          `${xDays} và ${yDays}`,
          `${xDays}, ${yDays}`,
        ],
        solution: `Gọi thời gian tổ I làm một mình xong việc là $x$ ngày ($x > 12$).\nThời gian tổ II làm một mình xong việc là $x + 10$ ngày.\nTrong 1 ngày:\n- Tổ I làm được $\\frac{1}{x}$ công việc.\n- Tổ II làm được $\\frac{1}{x + 10}$ công việc.\n- Cả hai tổ làm được $\\frac{1}{12}$ công việc.\nTa có phương trình:\n$\\frac{1}{x} + \\frac{1}{x + 10} = \\frac{1}{12}$\n$\\Leftrightarrow \\frac{2x + 10}{x(x + 10)} = \\frac{1}{12} \\Leftrightarrow 12(2x + 10) = x(x + 10)$\n$\\Leftrightarrow x^2 - 14x - 120 = 0 \\Leftrightarrow (x - 20)(x + 6) = 0$.\nVì $x > 12$ nên $x = 20$.\nVậy tổ I làm riêng mất $20$ ngày, tổ II làm riêng mất $30$ ngày.`,
        rubricSteps: [
          { step: 'Chọn ẩn và biểu diễn năng suất 1 ngày của mỗi tổ', points: 0.5 },
          { step: 'Lập phương trình, quy đồng giải nghiệm và kết luận đúng', points: 0.5 },
        ],
        keyFormula: 'Năng suất 1 ngày = $1 / \\text{thời gian hoàn thành}$',
      };
    },
  },

  {
    id: 'T_G8_C4_HARD_02',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Hàm số bậc nhất y = ax + b và hệ số góc',
    topic: 'Bài toán kinh tế cước phí dịch vụ',
    problemType: 'Lập hàm số bậc nhất mô hình hóa chi phí',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const baseFee = 10000;
      const ratePerKm = 14000;
      const km = rng.nextInt(5, 15);
      const totalCost = baseFee + ratePerKm * km;

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Hàm số bậc nhất y = ax + b và hệ số góc',
        topic: 'Bài toán kinh tế cước phí dịch vụ',
        problemType: 'Lập hàm số bậc nhất mô hình hóa chi phí',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Một hãng taxi có giá mở cửa là $${baseFee.toLocaleString('vi-VN')}$ đồng và mỗi kilômét tiếp theo tính giá $${ratePerKm.toLocaleString('vi-VN')}$ đồng/km. Hãy viết công thức hàm số bậc nhất biểu diễn tổng số tiền cước $y$ (đồng) theo quãng đường di chuyển $x$ (km, với $x > 0$), và tính số tiền phải trả khi đi $${km}$ km.`,
        correctAnswer: `${totalCost}`,
        acceptedAnswers: [
          `${totalCost}`,
          `${totalCost.toLocaleString('vi-VN')} đồng`,
          `y = 14000x + 10000, y = ${totalCost}`,
        ],
        solution: `Công thức hàm số tính số tiền cước taxi theo số kilômét di chuyển là:\n$y = ${ratePerKm}x + ${baseFee}$ (đồng).\nKhi di chuyển $x = ${km}$ km:\n$y = ${ratePerKm} \\cdot ${km} + ${baseFee} = ${ratePerKm * km} + ${baseFee} = ${totalCost}$ đồng.`,
        rubricSteps: [
          { step: 'Lập đúng phương trình hàm số bậc nhất y = ax + b', points: 0.5 },
          { step: 'Thay giá trị x và tính chính xác số tiền phải trả', points: 0.5 },
        ],
        keyFormula: '$y = ax + b$ (a: giá mỗi đơn vị, b: chi phí cố định)',
      };
    },
  },

  {
    id: 'T_G8_C4_HARD_03',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Hàm số bậc nhất y = ax + b và hệ số góc',
    topic: 'Diện tích tam giác tạo bởi đường thẳng và hai trục tọa độ',
    problemType: 'Tính diện tích tam giác vuông trên mặt phẳng tọa độ',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = 2;
      const b = 4;
      // Giao Ox: y = 0 => 2x + 4 = 0 => x = -2 => OA = 2
      // Giao Oy: x = 0 => y = 4 => OB = 4
      // S = 1/2 * OA * OB = 1/2 * 2 * 4 = 4
      const area = 4;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${area}$ (đvdt)`,
        [
          { text: `$${area * 2}$ (đvdt)`, errorType: 'QUÊN_CHIA_CHO_2' },
          { text: `$${area - 1}$ (đvdt)`, errorType: 'TÍNH_NHẦM' },
          { text: `$${area + 2}$ (đvdt)`, errorType: 'TÍNH_NHẦM' },
        ]
      );

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Hàm số bậc nhất y = ax + b và hệ số góc',
        topic: 'Diện tích tam giác tạo bởi đường thẳng và hai trục tọa độ',
        problemType: 'Tính diện tích tam giác vuông trên mặt phẳng tọa độ',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: `Đường thẳng $y = ${a}x + ${b}$ cắt trục hoành tại điểm $A$ và cắt trục tung tại điểm $B$. Diện tích tam giác vuông $OAB$ ($O$ là gốc tọa độ) bằng:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Giao điểm với trục hoành $Ox$: Cho $y = 0 \\Rightarrow ${a}x + ${b} = 0 \\Leftrightarrow x = -2 \\Rightarrow A(-2; 0) \\Rightarrow OA = 2$.\nGiao điểm với trục tung $Oy$: Cho $x = 0 \\Rightarrow y = ${b} \\Rightarrow B(0; 4) \\Rightarrow OB = 4$.\nTam giác $OAB$ vuông tại $O$, nên diện tích là:\n$S = \\frac{1}{2} OA \\cdot OB = \\frac{1}{2} \\cdot 2 \\cdot 4 = ${area}$ (đvdt).`,
        rubricSteps: [{ step: 'Tìm tọa độ giao điểm với hai trục và áp dụng công thức diện tích tam giác vuông', points: 0.5 }],
        keyFormula: '$S_{\\Delta OAB} = \\frac{1}{2} |x_A| \\cdot |y_B|$',
      };
    },
  },

  {
    id: 'T_G8_C4_HARD_04',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Phương trình bậc nhất một ẩn ax + b = 0',
    topic: 'Phương trình chứa tham số',
    problemType: 'Tìm điều kiện tham số để phương trình vô nghiệm',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const m = rng.nextInt(2, 6);

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Phương trình bậc nhất một ẩn ax + b = 0',
        topic: 'Phương trình chứa tham số',
        problemType: 'Tìm điều kiện tham số để phương trình vô nghiệm',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Tìm tham số $m$ để phương trình sau vô nghiệm: $(m - ${m})x = 5$.`,
        correctAnswer: `m = ${m}`,
        acceptedAnswers: [`m = ${m}`, `${m}`],
        solution: `Phương trình có dạng $Ax = B$.\nPhương trình vô nghiệm khi và chỉ khi:\n$\\begin{cases} A = 0 \\\\ B \\neq 0 \\end{cases} \\Leftrightarrow \\begin{cases} m - ${m} = 0 \\\\ 5 \\neq 0 \\text{ (luôn đúng)} \\end{cases} \\Leftrightarrow m = ${m}$.\nVậy với $m = ${m}$ thì phương trình vô nghiệm.`,
        rubricSteps: [
          { step: 'Nhận dạng điều kiện để phương trình bậc nhất vô nghiệm: A = 0 và B != 0', points: 0.5 },
          { step: 'Giải tìm ra m', points: 0.5 },
        ],
        keyFormula: '$Ax = B$ vô nghiệm khi $A = 0$ và $B \\neq 0$',
      };
    },
  },

  // ----------------------------------------------------------------------------
  // CHƯƠNG 5: ĐỊNH LÍ THALÈS VÀ TAM GIÁC ĐỒNG DẠNG (G8_C5) - HK2
  // ----------------------------------------------------------------------------
  {
    id: 'T_G8_C5_EASY_01',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Định lí Thalès trong tam giác',
    topic: 'Tỉ số của hai đoạn thẳng',
    problemType: 'Tính tỉ số đoạn thẳng',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5) * 2;
      const b = rng.nextInt(2, 5) * 3;
      const g = gcd(a, b);
      const simpA = a / g;
      const simpB = b / g;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$\\frac{${simpA}}{${simpB}}$`,
        [
          { text: `$\\frac{${simpB}}{${simpA}}$`, errorType: 'NGHỊCH_ĐẢO_TỈ_SỐ' },
          { text: `$\\frac{${a}}{${b + 2}}$`, errorType: 'SAI_SỐ' },
          { text: `$${simpA}$`, errorType: 'QUÊN_MẪU' },
        ]
      );

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Định lí Thalès trong tam giác',
        topic: 'Tỉ số của hai đoạn thẳng',
        problemType: 'Tính tỉ số đoạn thẳng',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Cho đoạn thẳng $AB = ${a}$ cm và $CD = ${b}$ cm. Tỉ số của hai đoạn thẳng $AB$ và $CD$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Tỉ số của hai đoạn thẳng là tỉ số độ dài của chúng theo cùng một đơn vị đo:\n$\\frac{AB}{CD} = \\frac{${a}}{${b}} = \\frac{${simpA}}{${simpB}}$.`,
        rubricSteps: [{ step: 'Lập tỉ số và rút gọn phân số', points: 0.5 }],
        keyFormula: 'Tỉ số $AB/CD = a/b$',
      };
    },
  },

  {
    id: 'T_G8_C5_EASY_02',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Định lí Thalès trong tam giác',
    topic: 'Định lí Thalès thuận',
    problemType: 'Tính độ dài đoạn thẳng bằng định lí Thalès',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const am = 2;
      const mb = 4;
      const an = 3;
      const nc = (mb * an) / am; // 6

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${nc}$ cm`,
        [
          { text: `$${nc + 1}$ cm`, errorType: 'TÍNH_NHẦM' },
          { text: `$${nc - 2}$ cm`, errorType: 'TÍNH_NHẦM' },
          { text: `$${an + mb}$ cm`, errorType: 'CỘNG_SAI' },
        ]
      );

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Định lí Thalès trong tam giác',
        topic: 'Định lí Thalès thuận',
        problemType: 'Tính độ dài đoạn thẳng bằng định lí Thalès',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Cho tam giác $ABC$, đường thẳng $MN \\parallel BC$ ($M \\in AB, N \\in AC$). Biết $AM = ${am}$ cm, $MB = ${mb}$ cm, $AN = ${an}$ cm. Độ dài đoạn thẳng $NC$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Theo định lí Thalès với $MN \\parallel BC$:\n$\\frac{AM}{MB} = \\frac{AN}{NC} \\Rightarrow \\frac{${am}}{${mb}} = \\frac{${an}}{NC} \\Rightarrow NC = \\frac{${mb} \\cdot ${an}}{${am}} = ${nc}$ cm.`,
        rubricSteps: [{ step: 'Viết tỉ lệ thức định lí Thalès và tính đoạn NC', points: 0.5 }],
        keyFormula: '$\\frac{AM}{MB} = \\frac{AN}{NC}$',
      };
    },
  },

  {
    id: 'T_G8_C5_EASY_03',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Đường trung bình và Đường phân giác của tam giác',
    topic: 'Đường trung bình của tam giác',
    problemType: 'Tính độ dài đường trung bình',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const bc = rng.nextInt(5, 12) * 2;
      const mn = bc / 2;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${mn}$ cm`,
        [
          { text: `$${bc}$ cm`, errorType: 'BẰNG_CẠNH_ĐÁY' },
          { text: `$${bc * 2}$ cm`, errorType: 'GẤP_ĐÔI_CẠNH_ĐÁY' },
          { text: `$${mn + 2}$ cm`, errorType: 'TÍNH_NHẦM' },
        ]
      );

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Đường trung bình và Đường phân giác của tam giác',
        topic: 'Đường trung bình của tam giác',
        problemType: 'Tính độ dài đường trung bình',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Cho tam giác $ABC$ có cạnh $BC = ${bc}$ cm. Gọi $M, N$ lần lượt là trung điểm của $AB$ và $AC$. Độ dài đoạn thẳng $MN$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Đoạn thẳng $MN$ nối trung điểm hai cạnh $AB, AC$ nên là đường trung bình của tam giác $ABC$.\nTheo tính chất đường trung bình: $MN = \\frac{1}{2} BC = \\frac{1}{2} \\cdot ${bc} = ${mn}$ cm.`,
        rubricSteps: [{ step: 'Nhận biết đường trung bình và tính bằng nửa cạnh đáy', points: 0.5 }],
        keyFormula: 'Đường trung bình $MN = \\frac{1}{2} BC$',
      };
    },
  },

  {
    id: 'T_G8_C5_EASY_04',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Đường trung bình và Đường phân giác của tam giác',
    topic: 'Tính chất đường phân giác trong tam giác',
    problemType: 'Tính tỉ số các đoạn thẳng do phân giác chia',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const ab = 6;
      const ac = 9;
      // DB / DC = AB / AC = 6/9 = 2/3.
      // Nếu BC = 10 cm => DB = 4, DC = 6.
      const bc = 10;
      const db = 4;
      const dc = 6;

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Đường trung bình và Đường phân giác của tam giác',
        topic: 'Tính chất đường phân giác trong tam giác',
        problemType: 'Tính tỉ số các đoạn thẳng do phân giác chia',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Cho tam giác $ABC$ có $AB = ${ab}$ cm, $AC = ${ac}$ cm, $BC = ${bc}$ cm. Đường phân giác của góc $A$ cắt cạnh $BC$ tại điểm $D$. Tính độ dài đoạn thẳng $DB$ và $DC$.`,
        correctAnswer: `DB = ${db} cm, DC = ${dc} cm`,
        acceptedAnswers: [
          `DB = ${db} cm, DC = ${dc} cm`,
          `DB = ${db}, DC = ${dc}`,
          `${db} và ${dc}`,
        ],
        solution: `Theo tính chất đường phân giác trong tam giác $ABC$:\n$\\frac{DB}{DC} = \\frac{AB}{AC} = \\frac{${ab}}{${ac}} = \\frac{2}{3} \\Rightarrow \\frac{DB}{2} = \\frac{DC}{3}$.\nÁp dụng tính chất của dãy tỉ số bằng nhau:\n$\\frac{DB}{2} = \\frac{DC}{3} = \\frac{DB + DC}{2 + 3} = \\frac{BC}{5} = \\frac{${bc}}{5} = 2$.\nSuy ra: $DB = 2 \\times 2 = ${db}$ cm và $DC = 3 \\times 2 = ${dc}$ cm.`,
        rubricSteps: [
          { step: 'Áp dụng tính chất đường phân giác lập tỉ lệ thức', points: 0.5 },
          { step: 'Dùng dãy tỉ số bằng nhau tính ra DB và DC', points: 0.5 },
        ],
        keyFormula: '$\\frac{DB}{DC} = \\frac{AB}{AC}$',
      };
    },
  },

  {
    id: 'T_G8_C5_MED_01',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Ba trường hợp đồng dạng của hai tam giác',
    topic: 'Hai tam giác đồng dạng trường hợp góc - góc',
    problemType: 'Tính độ dài cạnh tương ứng',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const k = 2;
      const ab = 3;
      const bc = 4;
      const ac = 5;
      const de = ab * k; // 6
      const ef = bc * k; // 8
      const df = ac * k; // 10

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${df}$ cm`,
        [
          { text: `$${ac + 2}$ cm`, errorType: 'CỘNG_THAY_VÌ_NHÂN_TỈ_SỐ' },
          { text: `$${df - 2}$ cm`, errorType: 'TÍNH_NHẦM' },
          { text: `$${df * 2}$ cm`, errorType: 'NHÂN_THỪA_HỆ_SỐ' },
        ]
      );

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Ba trường hợp đồng dạng của hai tam giác',
        topic: 'Hai tam giác đồng dạng trường hợp góc - góc',
        problemType: 'Tính độ dài cạnh tương ứng',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Cho tam giác $ABC$ đồng dạng với tam giác $DEF$ theo tỉ số $k = \\frac{1}{2}$ (nghĩa là $\\frac{AB}{DE} = \\frac{1}{2}$). Biết cạnh $AC = ${ac}$ cm. Độ dài cạnh tương ứng $DF$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Vì $\\Delta ABC \\backsim \\Delta DEF$ nên:\n$\\frac{AC}{DF} = k = \\frac{1}{2} \\Rightarrow DF = 2 \\cdot AC = 2 \\cdot ${ac} = ${df}$ cm.`,
        rubricSteps: [{ step: 'Áp dụng tỉ số đồng dạng tính cạnh tương ứng', points: 0.5 }],
        keyFormula: '$\\frac{AB}{DE} = \\frac{BC}{EF} = \\frac{AC}{DF} = k$',
      };
    },
  },

  {
    id: 'T_G8_C5_MED_02',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Ba trường hợp đồng dạng của hai tam giác',
    topic: 'Tỉ số diện tích hai tam giác đồng dạng',
    problemType: 'Tính diện tích tam giác đồng dạng',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const k = 3;
      const s1 = rng.nextInt(4, 8);
      const s2 = s1 * k * k;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${s2}$ $\\text{cm}^2$`,
        [
          { text: `$${s1 * k}$ $\\text{cm}^2$`, errorType: 'NHÂN_K_CHƯA_BÌNH_PHƯƠNG' },
          { text: `$${s2 / 2}$ $\\text{cm}^2$`, errorType: 'TÍNH_NHẦM' },
          { text: `$${s1 + 9}$ $\\text{cm}^2$`, errorType: 'CỘNG_SAI' },
        ]
      );

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Ba trường hợp đồng dạng của hai tam giác',
        topic: 'Tỉ số diện tích hai tam giác đồng dạng',
        problemType: 'Tính diện tích tam giác đồng dạng',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Nếu $\\Delta A\'B\'C\' \\backsim \\Delta ABC$ với tỉ số đồng dạng $k = ${k}$, và diện tích của $\\Delta ABC$ là $${s1}$ $\\text{cm}^2$, thì diện tích của $\\Delta A\'B\'C\'$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Tỉ số diện tích của hai tam giác đồng dạng bằng bình phương tỉ số đồng dạng:\n$\\frac{S_{A\'B\'C\'}}{S_{ABC}} = k^2 = ${k}^2 = ${k * k}$.\nDo đó $S_{A\'B\'C\'} = ${k * k} \\cdot S_{ABC} = ${k * k} \\cdot ${s1} = ${s2}$ $\\text{cm}^2$.`,
        rubricSteps: [{ step: 'Áp dụng định lí tỉ số diện tích bằng k bình phương', points: 0.5 }],
        keyFormula: '$\\frac{S_1}{S_2} = k^2$',
      };
    },
  },

  {
    id: 'T_G8_C5_MED_03',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Định lí Thalès trong tam giác',
    topic: 'Định lí Thalès đảo',
    problemType: 'Chứng minh song song bằng Thalès đảo',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const am = 3;
      const mb = 6;
      const an = 4;
      const nc = 8;

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Định lí Thalès trong tam giác',
        topic: 'Định lí Thalès đảo',
        problemType: 'Chứng minh song song bằng Thalès đảo',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Cho tam giác $ABC$. Lấy điểm $M$ trên $AB$ sao cho $AM = ${am}$ cm, $MB = ${mb}$ cm. Lấy điểm $N$ trên $AC$ sao cho $AN = ${an}$ cm, $NC = ${nc}$ cm. Chứng minh rằng $MN \\parallel BC$.`,
        correctAnswer: 'AM/MB = AN/NC = 1/2 => MN // BC',
        acceptedAnswers: [
          'AM/MB = AN/NC = 1/2 => MN // BC',
          'Theo định lí Thalès đảo, MN song song với BC',
        ],
        solution: `Ta xét tỉ số các đoạn thẳng trên hai cạnh $AB$ và $AC$:\n$\\frac{AM}{MB} = \\frac{${am}}{${mb}} = \\frac{1}{2}$;\n$\\frac{AN}{NC} = \\frac{${an}}{${nc}} = \\frac{1}{2}$.\nVì $\\frac{AM}{MB} = \\frac{AN}{NC} = \\frac{1}{2}$ nên theo định lí Thalès đảo, ta có $MN \\parallel BC$.`,
        rubricSteps: [
          { step: 'Tính và so sánh hai tỉ số trên hai cạnh tam giác', points: 0.5 },
          { step: 'Áp dụng định lí Thalès đảo kết luận hai đường thẳng song song', points: 0.5 },
        ],
        keyFormula: '$\\frac{AM}{MB} = \\frac{AN}{NC} \\Rightarrow MN \\parallel BC$',
      };
    },
  },

  {
    id: 'T_G8_C5_MED_04',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Ba trường hợp đồng dạng của hai tam giác',
    topic: 'Đo chiều cao cây bằng bóng râm',
    problemType: 'Ứng dụng thực tế của tam giác đồng dạng',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const stickH = 2; // cọc cao 2m
      const stickShadow = 1.5; // bóng cọc 1.5m
      const treeShadow = 6; // bóng cây 6m
      // treeH / treeShadow = stickH / stickShadow => treeH = 6 * 2 / 1.5 = 8m
      const treeH = 8;

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Ba trường hợp đồng dạng của hai tam giác',
        topic: 'Đo chiều cao cây bằng bóng râm',
        problemType: 'Ứng dụng thực tế của tam giác đồng dạng',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Cùng một thời điểm dưới ánh sáng mặt trời, một chiếc cọc cao $${stickH}$ m cắm thẳng đứng trên mặt đất có bóng dài $${stickShadow}$ m. Cạnh đó, bóng của một cái cây dài $${treeShadow}$ m. Hãy tính chiều cao của cái cây.`,
        correctAnswer: `${treeH}`,
        acceptedAnswers: [`${treeH}`, `${treeH} m`],
        solution: `Các tia sáng mặt trời song song tạo ra các tam giác vuông đồng dạng giữa cọc và cây với bóng của chúng trên mặt đất.\nGọi chiều cao cái cây là $H$ (m).\nTa có tỉ số đồng dạng:\n$\\frac{H}{\\text{Bóng cây}} = \\frac{\\text{Chiều cao cọc}}{\\text{Bóng cọc}} \\Rightarrow \\frac{H}{${treeShadow}} = \\frac{${stickH}}{${stickShadow}}$\n$\\Rightarrow H = \\frac{${treeShadow} \\cdot ${stickH}}{${stickShadow}} = \\frac{12}{1{,}5} = ${treeH}$ m.\nVậy cây cao $${treeH}$ m.`,
        rubricSteps: [
          { step: 'Giải thích tính đồng dạng của hai tam giác tạo bởi ánh sáng mặt trời', points: 0.5 },
          { step: 'Lập tỉ số và tính ra chiều cao cái cây', points: 0.5 },
        ],
        keyFormula: '$\\frac{H_{\\text{cây}}}{B_{\\text{cây}}} = \\frac{h_{\\text{cọc}}}{b_{\\text{cọc}}}$',
      };
    },
  },

  {
    id: 'T_G8_C5_HARD_01',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Ba trường hợp đồng dạng của hai tam giác',
    topic: 'Tam giác vuông đồng dạng và hệ thức lượng',
    problemType: 'Tính đường cao trong tam giác vuông',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const ab = 6;
      const ac = 8;
      const bc = 10;
      // ah = (ab * ac) / bc = 48 / 10 = 4.8
      const ah = 4.8;

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Ba trường hợp đồng dạng của hai tam giác',
        topic: 'Tam giác vuông đồng dạng và hệ thức lượng',
        problemType: 'Tính đường cao trong tam giác vuông',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Cho tam giác $ABC$ vuông tại $A$ có $AB = ${ab}$ cm, $AC = ${ac}$ cm, $BC = ${bc}$ cm. Kẻ đường cao $AH$ vuông góc với $BC$ ($H \\in BC$). Dùng tính chất tam giác đồng dạng để tính độ dài đường cao $AH$.`,
        correctAnswer: `${ah}`,
        acceptedAnswers: [`${ah}`, `${ah} cm`],
        solution: `Xét hai tam giác vuông $\\Delta HBA$ và $\\Delta ABC$ có:\n- $\\widehat{BHA} = \\widehat{BAC} = 90^\\circ$\n- $\\widehat{B}$ là góc chung\nDo đó $\\Delta HBA \\backsim \\Delta ABC$ (g - g).\nSuy ra tỉ số đồng dạng:\n$\\frac{AH}{AC} = \\frac{AB}{BC} \\Rightarrow AH = \\frac{AB \\cdot AC}{BC} = \\frac{${ab} \\cdot ${ac}}{${bc}} = \\frac{48}{10} = ${ah}$ cm.`,
        rubricSteps: [
          { step: 'Chứng minh hai tam giác vuông đồng dạng', points: 0.5 },
          { step: 'Lập tỉ số đồng dạng và tính ra AH', points: 0.5 },
        ],
        keyFormula: '$AH = \\frac{AB \\cdot AC}{BC}$',
      };
    },
  },

  {
    id: 'T_G8_C5_HARD_02',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Đường trung bình và Đường phân giác của tam giác',
    topic: 'Đường phân giác kết hợp tam giác đồng dạng',
    problemType: 'Tỉ số diện tích hai tam giác phân chia bởi đường phân giác',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const c = 4;
      const b = 6;
      // S_ABD / S_ACD = BD / CD = AB / AC = 4/6 = 2/3
      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Đường trung bình và Đường phân giác của tam giác',
        topic: 'Đường phân giác kết hợp tam giác đồng dạng',
        problemType: 'Tỉ số diện tích hai tam giác phân chia bởi đường phân giác',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Cho tam giác $ABC$ có $AB = ${c}$ cm, $AC = ${b}$ cm. Đường phân giác trong góc $A$ cắt cạnh $BC$ tại $D$. Hãy tính tỉ số diện tích giữa tam giác $ABD$ và tam giác $ACD$.`,
        correctAnswer: '2/3',
        acceptedAnswers: ['2/3', '4/6', '0.67'],
        solution: `Hai tam giác $ABD$ và $ACD$ có chung đường cao kẻ từ đỉnh $A$ xuống đáy $BC$.\nDo đó tỉ số diện tích bằng tỉ số độ dài hai đáy tương ứng:\n$\\frac{S_{ABD}}{S_{ACD}} = \\frac{BD}{CD}$.\nMặt khác, $AD$ là đường phân giác trong góc $A$ nên theo tính chất đường phân giác:\n$\\frac{BD}{CD} = \\frac{AB}{AC} = \\frac{${c}}{${b}} = \\frac{2}{3}$.\nVậy $\\frac{S_{ABD}}{S_{ACD}} = \\frac{2}{3}$.`,
        rubricSteps: [
          { step: 'Lập luận tỉ số diện tích hai tam giác chung đường cao bằng tỉ số hai đáy', points: 0.5 },
          { step: 'Áp dụng tính chất đường phân giác để tính ra tỉ số 2/3', points: 0.5 },
        ],
        keyFormula: '$\\frac{S_{ABD}}{S_{ACD}} = \\frac{BD}{CD} = \\frac{AB}{AC}$',
      };
    },
  },

  {
    id: 'T_G8_C5_HARD_03',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Ba trường hợp đồng dạng của hai tam giác',
    topic: 'Chứng minh đẳng thức tích hình học',
    problemType: 'Hệ thức tích từ tam giác đồng dạng',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$AE \\cdot AB = AF \\cdot AC$',
        [
          { text: '$AE \\cdot AC = AF \\cdot AB$', errorType: 'NGHỊCH_ĐẢO_TỈ_LỆ' },
          { text: '$AE \\cdot AF = AB \\cdot AC$', errorType: 'NHÂN_SAI_CẶP' },
          { text: '$AE + AB = AF + AC$', errorType: 'TỔNG_THAY_VÌ_TÍCH' },
        ]
      );

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Ba trường hợp đồng dạng của hai tam giác',
        topic: 'Chứng minh đẳng thức tích hình học',
        problemType: 'Hệ thức tích từ tam giác đồng dạng',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: `Cho tam giác nhọn $ABC$ có hai đường cao $BD$ và $CE$ cắt nhau tại trực tâm $H$. Khẳng định đẳng thức tích nào sau đây luôn ĐÚNG?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Xét hai tam giác vuông $\\Delta ADB$ và $\\Delta AEC$ có góc $A$ chung:\n$\\Rightarrow \\Delta ADB \\backsim \\Delta AEC$ (g - g).\nSuy ra: $\\frac{AD}{AE} = \\frac{AB}{AC} \\Rightarrow AD \\cdot AC = AE \\cdot AB$.`,
        rubricSteps: [{ step: 'Chứng minh hai tam giác vuông đồng dạng và suy ra hệ thức tích', points: 0.5 }],
        keyFormula: '$\\Delta ADB \\backsim \\Delta AEC \\Rightarrow AD \\cdot AC = AE \\cdot AB$',
      };
    },
  },

  {
    id: 'T_G8_C5_HARD_04',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Định lí Thalès trong tam giác',
    topic: 'Đo khoảng cách không tới được bằng Thalès',
    problemType: 'Ứng dụng đo bề rộng con sông',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Đo bề rộng sông AB: cắm cọc C thẳng hàng AB, kẻ đường vuông góc...
      // AB / AC = A'B' / A'C' hoặc dùng tam giác đồng dạng:
      // AB = (d1 * d2) / d3
      const a = 20;
      const b = 50;
      const c = 25;
      const width = (a * b) / c; // 40m

      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Định lí Thalès trong tam giác',
        topic: 'Đo khoảng cách không tới được bằng Thalès',
        problemType: 'Ứng dụng đo bề rộng con sông',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Để đo bề rộng con sông từ điểm $A$ bên này bờ đến cột mốc $B$ bên kia bờ, một nhóm học sinh cắm các cọc tiêu trên bờ sông tạo thành hai tam giác đồng dạng với các kích thước đo được trên mặt đất là $a = ${a}$ m, $b = ${b}$ m và cạnh tương ứng $c = ${c}$ m. Tính khoảng cách bề rộng khúc sông $AB = x$ biết $\\frac{x}{b} = \\frac{a}{c}$.`,
        correctAnswer: `${width}`,
        acceptedAnswers: [`${width}`, `${width} m`],
        solution: `Từ hệ thức tỉ lệ tam giác đồng dạng:\n$\\frac{x}{b} = \\frac{a}{c} \\Rightarrow x = \\frac{a \\cdot b}{c} = \\frac{${a} \\cdot ${b}}{${c}} = \\frac{1000}{25} = ${width}$ m.\nVậy bề rộng của khúc sông là $${width}$ m.`,
        rubricSteps: [
          { step: 'Biểu diễn hệ thức tỉ lệ đồng dạng từ số liệu thực địa', points: 0.5 },
          { step: 'Tính ra bề rộng khúc sông chính xác', points: 0.5 },
        ],
        keyFormula: '$x = \\frac{a \\cdot b}{c}$',
      };
    },
  },
];
