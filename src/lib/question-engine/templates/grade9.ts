// ==============================================================================
// MathMaster THCS - Ngân Hàng Template Câu Hỏi Toán Lớp 9 (Đầy đủ 6 Chương)
// File: src/lib/question-engine/templates/grade9.ts
// Phủ toàn bộ: G9_C1 -> G9_C6 (Mỗi chương >= 4 template / mức độ khó: easy, medium, hard)
// ==============================================================================

import type { QuestionTemplate, TextbookCode } from '../types';
import type { PRNG } from '../rng';
import { buildShuffledMcq, gcd, formatFraction } from '../template-helpers';
import { KNTTContexts } from '../contexts/KNTT';
import { CDContexts } from '../contexts/CD';
import { CTSTContexts } from '../contexts/CTST';

export const grade9Templates: QuestionTemplate[] = [
  // ----------------------------------------------------------------------------
  // CHƯƠNG 1: PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN (G9_C1) - HK1
  // ----------------------------------------------------------------------------
  {
    id: 'T_G9_C1_EASY_01',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Hệ hai phương trình bậc nhất hai ẩn (thế, cộng đại số)',
    topic: 'Kiểm tra nghiệm của hệ phương trình',
    problemType: 'Xác định cặp số là nghiệm của hệ',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const x0 = rng.nextInt(1, 4);
      const y0 = rng.nextInt(1, 4);
      const c1 = x0 + y0;
      const c2 = 2 * x0 - y0;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$(${x0}; ${y0})$`,
        [
          { text: `$(${y0}; ${x0})$`, errorType: 'HOÁN_VỊ_X_Y' },
          { text: `$(${x0 + 1}; ${y0})$`, errorType: 'TÍNH_NHẦM' },
          { text: `$(${x0}; ${-y0})$`, errorType: 'SAI_DẤU_Y' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Hệ hai phương trình bậc nhất hai ẩn (thế, cộng đại số)',
        topic: 'Kiểm tra nghiệm của hệ phương trình',
        problemType: 'Xác định cặp số là nghiệm của hệ',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Cặp số nào sau đây là nghiệm của hệ phương trình $\\begin{cases} x + y = ${c1} \\\\ 2x - y = ${c2} \\end{cases}$?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Thay cặp số $(x; y) = (${x0}; ${y0})$ vào hệ phương trình:\n$${x0} + ${y0} = ${c1}$ (đúng) và $2 \\cdot ${x0} - ${y0} = ${2 * x0} - ${y0} = ${c2}$ (đúng).\nVậy nghiệm của hệ là $(${x0}; ${y0})$.`,
        rubricSteps: [{ step: 'Thay tọa độ vào cả hai phương trình kiểm tra nghiệm', points: 0.5 }],
        keyFormula: 'Cặp $(x_0; y_0)$ là nghiệm khi thỏa mãn đồng thời hai phương trình.',
      };
    },
  },

  {
    id: 'T_G9_C1_EASY_02',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Hệ hai phương trình bậc nhất hai ẩn (thế, cộng đại số)',
    topic: 'Phương pháp cộng đại số',
    problemType: 'Giải hệ phương trình đơn giản',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const x = rng.nextInt(2, 5);
      const y = rng.nextInt(1, 4);
      const sum = x + y;
      const diff = x - y;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x = ${x}; y = ${y}$`,
        [
          { text: `$x = ${y}; y = ${x}$`, errorType: 'ĐẢO_NGHIỆM' },
          { text: `$x = ${x + 1}; y = ${y - 1}$`, errorType: 'TÍNH_NHẦM' },
          { text: `$x = ${sum}; y = ${diff}$`, errorType: 'LẤY_VẾ_PHẢI' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Hệ hai phương trình bậc nhất hai ẩn (thế, cộng đại số)',
        topic: 'Phương pháp cộng đại số',
        problemType: 'Giải hệ phương trình đơn giản',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Nghiệm $(x; y)$ của hệ phương trình $\\begin{cases} x + y = ${sum} \\\\ x - y = ${diff} \\end{cases}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Cộng từng vế hai phương trình:\n$(x + y) + (x - y) = ${sum} + ${diff} \\Leftrightarrow 2x = ${sum + diff} \\Leftrightarrow x = ${x}$.\nThay $x = ${x}$ vào phương trình thứ nhất: $${x} + y = ${sum} \\Leftrightarrow y = ${y}$.\nVậy nghiệm của hệ là $(${x}; ${y})$.`,
        rubricSteps: [{ step: 'Cộng từng vế để triệt tiêu biến y và giải tìm x, y', points: 0.5 }],
        keyFormula: 'Cộng vế với vế khi hệ số của một ẩn đối nhau.',
      };
    },
  },

  {
    id: 'T_G9_C1_EASY_03',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Phương trình tích và phương trình chứa ẩn ở mẫu',
    topic: 'Phương trình tích',
    problemType: 'Giải phương trình tích dạng (ax + b)(cx + d) = 0',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 6);
      const b = rng.nextInt(1, 5);

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x = ${a}$ hoặc $x = -${b}$`,
        [
          { text: `$x = -${a}$ hoặc $x = ${b}$`, errorType: 'SAI_DẤU_CẢ_HAI_NGHIỆM' },
          { text: `$x = ${a}$ và $x = ${b}$`, errorType: 'DÙNG_TỪ_VÀ_SAI_DẤU' },
          { text: `$x = ${a + b}$`, errorType: 'CỘNG_HAI_SỐ' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Phương trình tích và phương trình chứa ẩn ở mẫu',
        topic: 'Phương trình tích',
        problemType: 'Giải phương trình tích dạng (ax + b)(cx + d) = 0',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Nghiệm của phương trình $(x - ${a})(x + ${b}) = 0$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Phương trình tích $A \\cdot B = 0 \\Leftrightarrow A = 0$ hoặc $B = 0$:\n$\\left[ \\begin{array}{l} x - ${a} = 0 \\\\ x + ${b} = 0 \\end{array} \\right. \\Leftrightarrow \\left[ \\begin{array}{l} x = ${a} \\\\ x = -${b} \\end{array} \\right.$.`,
        rubricSteps: [{ step: 'Cho từng nhân tử bằng 0 và giải tìm nghiệm', points: 0.5 }],
        keyFormula: '$A(x) \\cdot B(x) = 0 \\Leftrightarrow A(x) = 0$ hoặc $B(x) = 0$',
      };
    },
  },

  {
    id: 'T_G9_C1_EASY_04',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Hệ hai phương trình bậc nhất hai ẩn (thế, cộng đại số)',
    topic: 'Phương pháp thế',
    problemType: 'Giải hệ phương trình bằng phương pháp thế',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const yVal = rng.nextInt(2, 5);
      const xVal = 2 * yVal + 1;
      const c2 = 3 * xVal - yVal;

      return {
        grade: 8,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Hệ hai phương trình bậc nhất hai ẩn (thế, cộng đại số)',
        topic: 'Phương pháp thế',
        problemType: 'Giải hệ phương trình bằng phương pháp thế',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Giải hệ phương trình sau bằng phương pháp thế:\n$$\\begin{cases} x = 2y + 1 \\\\ 3x - y = ${c2} \\end{cases}$$`,
        correctAnswer: `(${xVal}; ${yVal})`,
        acceptedAnswers: [
          `(${xVal}; ${yVal})`,
          `x = ${xVal}, y = ${yVal}`,
          `${xVal}; ${yVal}`,
        ],
        solution: `Thế $x = 2y + 1$ vào phương trình thứ hai:\n$3(2y + 1) - y = ${c2} \\Leftrightarrow 6y + 3 - y = ${c2} \\Leftrightarrow 5y = ${c2 - 3} \\Leftrightarrow y = ${yVal}$.\nThay $y = ${yVal}$ vào $x = 2y + 1$ ta được:\n$x = 2 \\cdot ${yVal} + 1 = ${xVal}$.\nVậy hệ có nghiệm duy nhất $(x; y) = (${xVal}; ${yVal})$.`,
        rubricSteps: [
          { step: 'Thế biểu thức của x vào phương trình còn lại để đưa về một ẩn y', points: 0.5 },
          { step: 'Giải tìm y và suy ra giá trị của x', points: 0.5 },
        ],
        keyFormula: 'Biểu diễn một ẩn theo ẩn kia rồi thế vào phương trình còn lại.',
      };
    },
  },

  {
    id: 'T_G9_C1_MED_01',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Hệ hai phương trình bậc nhất hai ẩn (thế, cộng đại số)',
    topic: 'Giải hệ phương trình biến đổi thu gọn',
    problemType: 'Hệ phương trình có dấu ngoặc',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const x = rng.nextInt(1, 4);
      const y = rng.nextInt(1, 4);
      // 2(x + y) - 3(x - y) = 2x + 2y - 3x + 3y = -x + 5y
      // 3(x + y) + 2(x - y) = 3x + 3y + 2x - 2y = 5x + y
      const c1 = -x + 5 * y;
      const c2 = 5 * x + y;

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Hệ hai phương trình bậc nhất hai ẩn (thế, cộng đại số)',
        topic: 'Giải hệ phương trình biến đổi thu gọn',
        problemType: 'Hệ phương trình có dấu ngoặc',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Giải hệ phương trình sau:\n$$\\begin{cases} 2(x + y) - 3(x - y) = ${c1} \\\\ 3(x + y) + 2(x - y) = ${c2} \\end{cases}$$`,
        correctAnswer: `(${x}; ${y})`,
        acceptedAnswers: [
          `(${x}; ${y})`,
          `x = ${x}, y = ${y}`,
        ],
        solution: `Thu gọn hệ phương trình:\n$\\begin{cases} -x + 5y = ${c1} \\\\ 5x + y = ${c2} \\end{cases}$\nNhân phương trình thứ hai với 5 rồi trừ đi phương trình thứ nhất:\n$26x = 5 \\cdot ${c2} - (${c1}) = ${26 * x} \\Rightarrow x = ${x}$.\nThay $x = ${x}$ vào phương trình thứ hai: $5 \\cdot ${x} + y = ${c2} \\Rightarrow y = ${y}$.\nVậy hệ có nghiệm duy nhất $(x; y) = (${x}; ${y})$.`,
        rubricSteps: [
          { step: 'Khai triển dấu ngoặc và thu gọn về dạng ax + by = c', points: 0.5 },
          { step: 'Giải hệ thu gọn bằng phương pháp cộng hoặc thế ra (x; y)', points: 0.5 },
        ],
        keyFormula: 'Biến đổi tương đương đưa về hệ phương trình chính tắc.',
      };
    },
  },

  {
    id: 'T_G9_C1_MED_02',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Phương trình tích và phương trình chứa ẩn ở mẫu',
    topic: 'Phương trình chứa ẩn ở mẫu',
    problemType: 'Giải phương trình chứa ẩn ở mẫu quy về bậc nhất',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const x = a + 3; // nghiệm thỏa mãn điều kiện
      // (2x - 1)/(x - a) = (2*(a+3) - 1)/3 = (2a + 5)/3
      const num = 2 * x - 1;
      const den = x - a;
      const k = num / den;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x = ${x}$`,
        [
          { text: `$x = ${a}$`, errorType: 'NGHIỆM_LOẠI_DO_ĐIỀU_KIỆN_MẪU' },
          { text: `$x = ${x + 1}$`, errorType: 'TÍNH_NHẦM' },
          { text: 'Phương trình vô nghiệm', errorType: 'KẾT_LUẬN_VỘI_VÀNG' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Phương trình tích và phương trình chứa ẩn ở mẫu',
        topic: 'Phương trình chứa ẩn ở mẫu',
        problemType: 'Giải phương trình chứa ẩn ở mẫu quy về bậc nhất',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: `Nghiệm của phương trình $\\frac{2x - 1}{x - ${a}} = ${k}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `ĐKXĐ: $x \\neq ${a}$.\nQuy đồng và khử mẫu:\n$2x - 1 = ${k}(x - ${a}) \\Leftrightarrow 2x - 1 = ${k}x - ${k * a}$\n$\\Leftrightarrow (${k} - 2)x = ${k * a - 1} \\Leftrightarrow x = ${x}$ (thỏa mãn ĐKXĐ).`,
        rubricSteps: [{ step: 'Đặt ĐKXĐ, quy đồng khử mẫu và giải kiểm tra nghiệm', points: 0.5 }],
        keyFormula: 'Bắt buộc kiểm tra điều kiện xác định sau khi tìm được nghiệm.',
      };
    },
  },

  {
    id: 'T_G9_C1_MED_03',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Hệ hai phương trình bậc nhất hai ẩn (thế, cộng đại số)',
    topic: 'Điều kiện để hệ phương trình có nghiệm duy nhất',
    problemType: 'Tham số m trong hệ phương trình',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const mVal = rng.nextInt(2, 6);

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$m \\neq ${mVal}$`,
        [
          { text: `$m = ${mVal}$`, errorType: 'ĐIỀU_KIỆN_VÔ_SỐ_NGHIỆM_HOẶC_VÔ_NGHIỆM' },
          { text: `$m \\neq -${mVal}$`, errorType: 'SAI_DẤU' },
          { text: '$m$ tùy ý', errorType: 'THIẾU_ĐIỀU_KIỆN' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Hệ hai phương trình bậc nhất hai ẩn (thế, cộng đại số)',
        topic: 'Điều kiện để hệ phương trình có nghiệm duy nhất',
        problemType: 'Tham số m trong hệ phương trình',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Hệ phương trình $\\begin{cases} mx + y = 3 \\\\ ${mVal}x + y = 1 \\end{cases}$ có nghiệm duy nhất khi và chỉ khi:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Hệ có dạng $\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}$.\nHệ có nghiệm duy nhất khi và chỉ khi:\n$\\frac{a_1}{a_2} \\neq \\frac{b_1}{b_2} \\Leftrightarrow \\frac{m}{${mVal}} \\neq \\frac{1}{1} \\Leftrightarrow m \\neq ${mVal}$.`,
        rubricSteps: [{ step: 'Áp dụng điều kiện tỉ số hệ số để hệ có nghiệm duy nhất', points: 0.5 }],
        keyFormula: 'Hệ có nghiệm duy nhất $\\Leftrightarrow \\frac{a_1}{a_2} \\neq \\frac{b_1}{b_2}$',
      };
    },
  },

  {
    id: 'T_G9_C1_MED_04',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Giải bài toán bằng cách lập hệ phương trình',
    topic: 'Bài toán tìm số có hai chữ số',
    problemType: 'Lập hệ phương trình chữ số',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Số có hai chữ số: 10x + y.
      // x + y = sum; Đổi chỗ được số mới: 10y + x. (10x+y) - (10y+x) = 9(x-y) = diff
      const x = 7;
      const y = 3;
      const sum = x + y; // 10
      const diff = 9 * (x - y); // 36
      const num = 10 * x + y;

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Giải bài toán bằng cách lập hệ phương trình',
        topic: 'Bài toán tìm số có hai chữ số',
        problemType: 'Lập hệ phương trình chữ số',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Tìm một số tự nhiên có hai chữ số, biết rằng tổng hai chữ số của nó bằng $${sum}$. Nếu đổi chỗ hai chữ số cho nhau thì được một số mới nhỏ hơn số ban đầu là $${diff}$ đơn vị.`,
        correctAnswer: `${num}`,
        acceptedAnswers: [`${num}`],
        solution: `Gọi chữ số hàng chục là $x$, chữ số hàng đơn vị là $y$ ($x, y \\in \\mathbb{N}, 1 \\le x \\le 9, 0 \\le y \\le 9$).\nSố ban đầu có giá trị là $10x + y$.\nTổng hai chữ số bằng $${sum}$: $x + y = ${sum}$ (1).\nKhi đổi chỗ hai chữ số, số mới là $10y + x$.\nVì số mới nhỏ hơn số ban đầu $${diff}$ đơn vị nên:\n$(10x + y) - (10y + x) = ${diff} \\Leftrightarrow 9(x - y) = ${diff} \\Leftrightarrow x - y = ${x - y}$ (2).\nTừ (1) và (2) ta có hệ phương trình:\n$\\begin{cases} x + y = ${sum} \\\\ x - y = ${x - y} \\end{cases} \\Leftrightarrow \\begin{cases} x = ${x} \\\\ y = ${y} \\end{cases}$ (thỏa mãn điều kiện).\nVậy số cần tìm là $${num}$.`,
        rubricSteps: [
          { step: 'Chọn ẩn, đặt điều kiện và biểu diễn số có hai chữ số', points: 0.3 },
          { step: 'Lập hệ hai phương trình bậc nhất hai ẩn', points: 0.4 },
          { step: 'Giải hệ và kết luận số ban đầu', points: 0.3 },
        ],
        keyFormula: 'Số có hai chữ số: $\\overline{xy} = 10x + y$',
      };
    },
  },

  {
    id: 'T_G9_C1_HARD_01',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Giải bài toán bằng cách lập hệ phương trình',
    topic: 'Bài toán chuyển động ngược chiều',
    problemType: 'Hai xe gặp nhau xuất phát cùng lúc',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Quãng đường AB dài 180 km. Xe 1 v1, Xe 2 v2. Đi ngược chiều gặp nhau sau 2h => 2*(v1+v2) = 180 => v1+v2 = 90.
      // v1 - v2 = 10 => v1 = 50, v2 = 40.
      const totalDist = 180;
      const meetHours = 2;
      const vDiff = 10;
      const v1 = 50;
      const v2 = 40;

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Giải bài toán bằng cách lập hệ phương trình',
        topic: 'Bài toán chuyển động ngược chiều',
        problemType: 'Hai xe gặp nhau xuất phát cùng lúc',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Hai thành phố A và B cách nhau $${totalDist}$ km. Một xe tải khởi hành từ A đi về B và cùng lúc đó một xe con khởi hành từ B đi về A. Sau $${meetHours}$ giờ thì hai xe gặp nhau. Biết rằng mỗi giờ xe con đi nhanh hơn xe tải là $${vDiff}$ km. Tính vận tốc của mỗi xe.`,
        correctAnswer: `Xe con: ${v1} km/h, Xe tải: ${v2} km/h`,
        acceptedAnswers: [
          `Xe con: ${v1} km/h, Xe tải: ${v2} km/h`,
          `${v1} và ${v2}`,
          `${v1}, ${v2}`,
        ],
        solution: `Gọi vận tốc xe con là $x$ (km/h) và vận tốc xe tải là $y$ (km/h) ($x > y > 0$).\nVì xe con đi nhanh hơn xe tải $${vDiff}$ km/h nên ta có phương trình: $x - y = ${vDiff}$ (1).\nSau $${meetHours}$ giờ hai xe đi được quãng đường lần lượt là $${meetHours}x$ và $${meetHours}y$.\nVì hai xe đi ngược chiều và gặp nhau nên tổng quãng đường bằng $${totalDist}$ km:\n$${meetHours}x + ${meetHours}y = ${totalDist} \\Leftrightarrow x + y = 90$ (2).\nTừ (1) và (2) ta có hệ phương trình:\n$\\begin{cases} x - y = ${vDiff} \\\\ x + y = 90 \\end{cases} \\Leftrightarrow \\begin{cases} x = ${v1} \\\\ y = ${v2} \\end{cases}$ (thỏa mãn).\nVậy vận tốc xe con là $${v1}$ km/h, xe tải là $${v2}$ km/h.`,
        rubricSteps: [
          { step: 'Gọi ẩn và lập phương trình hiệu vận tốc', points: 0.3 },
          { step: 'Lập phương trình tổng quãng đường gặp nhau', points: 0.4 },
          { step: 'Giải hệ và kết luận vận tốc hai xe', points: 0.3 },
        ],
        keyFormula: '$s = (v_1 + v_2) \\cdot t$',
      };
    },
  },

  {
    id: 'T_G9_C1_HARD_02',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Giải bài toán bằng cách lập hệ phương trình',
    topic: 'Bài toán năng suất làm chung làm riêng',
    problemType: 'Hai vòi nước cùng chảy vào bể',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Hai vòi chảy chung trong 4h48' = 4.8h = 24/5 h đầy bể.
      // 1/x + 1/y = 5/24. Nếu vòi 1 chảy trong 4h, vòi 2 chảy trong 3h được 3/4 bể.
      // x = 8h, y = 12h: 4/8 + 3/12 = 1/2 + 1/4 = 3/4. Đúng!
      const h1 = 8;
      const h2 = 12;

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Giải bài toán bằng cách lập hệ phương trình',
        topic: 'Bài toán năng suất làm chung làm riêng',
        problemType: 'Hai vòi nước cùng chảy vào bể',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Hai vòi nước cùng chảy vào một bể cạn thì sau $4$ giờ $48$ phút ($\\frac{24}{5}$ giờ) thì đầy bể. Nếu mở vòi thứ nhất chảy trong $4$ giờ rồi khóa lại và mở vòi thứ hai chảy trong $3$ giờ thì cả hai vòi chảy được $\\frac{3}{4}$ bể. Hỏi nếu chảy một mình thì mỗi vòi mất bao lâu mới đầy bể?`,
        correctAnswer: `Vòi 1: ${h1} giờ, Vòi 2: ${h2} giờ`,
        acceptedAnswers: [
          `Vòi 1: ${h1} giờ, Vòi 2: ${h2} giờ`,
          `${h1} và ${h2}`,
          `${h1}, ${h2}`,
        ],
        solution: `Gọi thời gian vòi 1 và vòi 2 chảy một mình đầy bể lần lượt là $x, y$ (giờ) ($x, y > \\frac{24}{5}$).\nTrong 1 giờ:\n- Vòi 1 chảy được $\\frac{1}{x}$ bể.\n- Vòi 2 chảy được $\\frac{1}{y}$ bể.\nCả hai vòi cùng chảy đầy bể trong $\\frac{24}{5}$ giờ nên 1 giờ chảy được $\\frac{5}{24}$ bể:\n$\\frac{1}{x} + \\frac{1}{y} = \\frac{5}{24}$ (1).\nVòi 1 chảy 4 giờ và vòi 2 chảy 3 giờ được $\\frac{3}{4}$ bể:\n$\\frac{4}{x} + \\frac{3}{y} = \\frac{3}{4}$ (2).\nĐặt $u = \\frac{1}{x}, v = \\frac{1}{y}$, hệ trở thành:\n$\\begin{cases} u + v = \\frac{5}{24} \\\\ 4u + 3v = \\frac{3}{4} \\end{cases} \\Leftrightarrow \\begin{cases} u = \\frac{1}{8} \\\\ v = \\frac{1}{12} \\end{cases} \\Rightarrow \\begin{cases} x = ${h1} \\\\ y = ${h2} \\end{cases}$.\nVậy vòi 1 chảy riêng mất $${h1}$ giờ, vòi 2 mất $${h2}$ giờ.`,
        rubricSteps: [
          { step: 'Chọn ẩn, biểu diễn năng suất 1 giờ và đặt điều kiện', points: 0.3 },
          { step: 'Lập hệ phương trình bằng cách đặt ẩn phụ u, v', points: 0.4 },
          { step: 'Giải tìm nghiệm và kết luận thời gian hai vòi', points: 0.3 },
        ],
        keyFormula: 'Năng suất chung = tổng các năng suất riêng.',
      };
    },
  },

  {
    id: 'T_G9_C1_HARD_03',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Hệ hai phương trình bậc nhất hai ẩn (thế, cộng đại số)',
    topic: 'Nghiệm nguyên của hệ phương trình chứa tham số',
    problemType: 'Tìm tham số m để nghiệm x, y là số nguyên',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Hệ: { x + y = m + 1; x - y = 3m - 1 }
      // 2x = 4m => x = 2m; y = (m+1) - 2m = 1 - m. Luôn nguyên với mọi m nguyên!
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Với mọi số nguyên $m$',
        [
          { text: 'Chỉ khi $m$ là số chẵn', errorType: 'ĐIỀU_KIỆN_THỪA' },
          { text: 'Chỉ khi $m > 0$', errorType: 'SAI_TẬP_NGHIỆM' },
          { text: 'Không có giá trị nào của $m$', errorType: 'KẾT_LUẬN_SAI' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Hệ hai phương trình bậc nhất hai ẩn (thế, cộng đại số)',
        topic: 'Nghiệm nguyên của hệ phương trình chứa tham số',
        problemType: 'Tìm tham số m để nghiệm x, y là số nguyên',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: `Cho hệ phương trình $\\begin{cases} x + y = m + 1 \\\\ x - y = 3m - 1 \\end{cases}$. Giá trị của $m \\in \\mathbb{Z}$ để hệ có nghiệm duy nhất $(x; y)$ đều là các số nguyên là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Cộng hai phương trình ta được: $2x = 4m \\Leftrightarrow x = 2m$.\nTrừ hai phương trình ta được: $2y = -2m + 2 \\Leftrightarrow y = 1 - m$.\nVì $m$ là số nguyên nên $x = 2m \\in \\mathbb{Z}$ và $y = 1 - m \\in \\mathbb{Z}$ với mọi số nguyên $m$.`,
        rubricSteps: [{ step: 'Giải biểu diễn nghiệm x, y theo tham số m và kết luận điều kiện nguyên', points: 0.5 }],
        keyFormula: '$x, y \\in \\mathbb{Z} \\Leftrightarrow$ biểu thức của $m$ là số nguyên.',
      };
    },
  },

  {
    id: 'T_G9_C1_HARD_04',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Giải bài toán bằng cách lập hệ phương trình',
    topic: 'Bài toán pha trộn nồng độ phần trăm dung dịch',
    problemType: 'Pha trộn hai dung dịch muối',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Pha m1 gam dung dịch 10% với m2 gam dung dịch 30% để được 200 gam dung dịch 15%
      // m1 + m2 = 200.
      // 0.10*m1 + 0.30*m2 = 0.15*200 = 30 => m1 + 3*m2 = 300.
      // => 2*m2 = 100 => m2 = 50g, m1 = 150g.
      const totalM = 200;
      const c1 = 10;
      const c2 = 30;
      const cTarget = 15;
      const m1 = 150;
      const m2 = 50;

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Giải bài toán bằng cách lập hệ phương trình',
        topic: 'Bài toán pha trộn nồng độ phần trăm dung dịch',
        problemType: 'Pha trộn hai dung dịch muối',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Cần trộn bao nhiêu gam dung dịch muối nồng độ $${c1}\\%$ với bao nhiêu gam dung dịch muối nồng độ $${c2}\\%$ để thu được $${totalM}$ gam dung dịch muối nồng độ $${cTarget}\\%$?`,
        correctAnswer: `Dung dịch ${c1}%: ${m1} gam, Dung dịch ${c2}%: ${m2} gam`,
        acceptedAnswers: [
          `Dung dịch ${c1}%: ${m1} gam, Dung dịch ${c2}%: ${m2} gam`,
          `${m1} và ${m2}`,
          `${m1}, ${m2}`,
        ],
        solution: `Gọi khối lượng dung dịch muối $${c1}\\%$ và $${c2}\\%$ cần lấy lần lượt là $x, y$ (gam) ($0 < x, y < ${totalM}$).\nTổng khối lượng dung dịch sau khi trộn là $${totalM}$ gam:\n$x + y = ${totalM}$ (1).\nKhối lượng muối nguyên chất trong dung dịch mới bằng tổng khối lượng muối trong từng dung dịch thành phần:\n$${c1}\\% \\cdot x + ${c2}\\% \\cdot y = ${cTarget}\\% \\cdot ${totalM} \\Leftrightarrow 0{,}10x + 0{,}30y = 30 \\Leftrightarrow x + 3y = 300$ (2).\nTừ (1) và (2) ta có hệ phương trình:\n$\\begin{cases} x + y = ${totalM} \\\\ x + 3y = 300 \\end{cases} \\Leftrightarrow \\begin{cases} x = ${m1} \\\\ y = ${m2} \\end{cases}$ (thỏa mãn).\nVậy cần lấy $${m1}$ gam dung dịch $${c1}\\%$ và $${m2}$ gam dung dịch $${c2}\\%$.`,
        rubricSteps: [
          { step: 'Đặt ẩn và lập phương trình tổng khối lượng', points: 0.3 },
          { step: 'Lập phương trình bảo toàn khối lượng chất tan', points: 0.4 },
          { step: 'Giải hệ và kết luận khối lượng hai dung dịch', points: 0.3 },
        ],
        keyFormula: '$m_{\\text{ct}} = C\\% \\cdot m_{\\text{dd}}$',
      };
    },
  },

  // ----------------------------------------------------------------------------
  // CHƯƠNG 2: BẤT PHƯƠNG TRÌNH VÀ CĂN THỨC BẬC HAI (G9_C2) - HK1
  // ----------------------------------------------------------------------------
  {
    id: 'T_G9_C2_EASY_01',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Căn bậc hai và ĐKXĐ',
    topic: 'Căn bậc hai số học',
    problemType: 'Tính giá trị căn bậc hai số học',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(3, 15);
      const a2 = a * a;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${a}$`,
        [
          { text: `$\\pm ${a}$`, errorType: 'NHẦM_VỚI_HAI_CĂN_BẬC_HAI_ĐẠI_SỐ' },
          { text: `$${a2}$`, errorType: 'BÌNH_PHƯƠNG_LẠI' },
          { text: `$${a * 2}$`, errorType: 'NHÂN_2' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Căn bậc hai và ĐKXĐ',
        topic: 'Căn bậc hai số học',
        problemType: 'Tính giá trị căn bậc hai số học',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Căn bậc hai số học của số $${a2}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Với số dương $a$, số $\\sqrt{a}$ được gọi là căn bậc hai số học của $a$. Căn bậc hai số học luôn không âm: $\\sqrt{${a2}} = ${a}$.`,
        rubricSteps: [{ step: 'Nhận biết căn bậc hai số học là số không âm bình phương bằng số đã cho', points: 0.5 }],
        keyFormula: '$\\sqrt{a^2} = a$ (với $a \\ge 0$)',
      };
    },
  },

  {
    id: 'T_G9_C2_EASY_02',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Căn bậc hai và ĐKXĐ',
    topic: 'Điều kiện xác định của căn thức bậc hai',
    problemType: 'Tìm ĐKXĐ của căn thức',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 6);
      const b = rng.nextInt(3, 9);
      // ax - b >= 0 => x >= b/a
      const g = gcd(b, a);
      const fracStr = formatFraction(b / g, a / g);

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x \\ge ${fracStr}$`,
        [
          { text: `$x > ${fracStr}$`, errorType: 'THIẾU_DẤU_BẰNG' },
          { text: `$x \\le ${fracStr}$`, errorType: 'NGƯỢC_DẤU_BẤT_ĐẲNG_THỨC' },
          { text: `$x \\ge -${fracStr}$`, errorType: 'SAI_DẤU' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Căn bậc hai và ĐKXĐ',
        topic: 'Điều kiện xác định của căn thức bậc hai',
        problemType: 'Tìm ĐKXĐ của căn thức',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Căn thức bậc hai $\\sqrt{${a}x - ${b}}$ có nghĩa (xác định) khi:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Căn thức $\\sqrt{A}$ có nghĩa khi và chỉ khi $A \\ge 0$:\n$${a}x - ${b} \\ge 0 \\Leftrightarrow ${a}x \\ge ${b} \\Leftrightarrow x \\ge ${fracStr}$.`,
        rubricSteps: [{ step: 'Cho biểu thức dưới dấu căn lớn hơn hoặc bằng 0 và giải tìm x', points: 0.5 }],
        keyFormula: '$\\sqrt{A}$ xác định $\\Leftrightarrow A \\ge 0$',
      };
    },
  },

  {
    id: 'T_G9_C2_EASY_03',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Bất đẳng thức và Bất phương trình bậc nhất một ẩn',
    topic: 'Giải bất phương trình bậc nhất một ẩn',
    problemType: 'Giải bất phương trình đổi chiều khi nhân số âm',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const b = rng.nextInt(6, 15);
      // -a x + b > 0 => -a x > -b => x < b/a
      const g = gcd(b, a);
      const fracStr = formatFraction(b / g, a / g);

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x < ${fracStr}$`,
        [
          { text: `$x > ${fracStr}$`, errorType: 'QUÊN_ĐỔI_CHIỀU_BẤT_PHƯƠNG_TRÌNH' },
          { text: `$x \\le ${fracStr}$`, errorType: 'THÊM_DẤU_BẰNG_SAI' },
          { text: `$x < -${fracStr}$`, errorType: 'SAI_DẤU' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Bất đẳng thức và Bất phương trình bậc nhất một ẩn',
        topic: 'Giải bất phương trình bậc nhất một ẩn',
        problemType: 'Giải bất phương trình đổi chiều khi nhân số âm',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Nghiệm của bất phương trình $-${a}x + ${b} > 0$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Chuyển hằng số sang vế phải:\n$-${a}x > -${b}$.\nChia cả hai vế cho số âm $-${a}$ (phải đổi chiều bất phương trình):\n$x < \\frac{-${b}}{-${a}} = ${fracStr}$.`,
        rubricSteps: [{ step: 'Chuyển vế và đổi chiều bất phương trình khi chia cho số âm', points: 0.5 }],
        keyFormula: '$A > B \\Leftrightarrow -kA < -kB$ (với $k > 0$)',
      };
    },
  },

  {
    id: 'T_G9_C2_EASY_04',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Rút gọn biểu thức chứa căn thức bậc hai',
    topic: 'Đưa thừa số ra ngoài dấu căn',
    problemType: 'Thu gọn căn thức số học',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // 3*sqrt(8) + sqrt(18) = 6*sqrt(2) + 3*sqrt(2) = 9*sqrt(2)
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Rút gọn biểu thức chứa căn thức bậc hai',
        topic: 'Đưa thừa số ra ngoài dấu căn',
        problemType: 'Thu gọn căn thức số học',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Rút gọn biểu thức sau: $A = 3\\sqrt{8} + \\sqrt{18} - \\sqrt{50}$.`,
        correctAnswer: `4\\sqrt{2}`,
        acceptedAnswers: [`4\\sqrt{2}`, `4sqrt(2)`, `4*sqrt(2)`],
        solution: `Đưa thừa số ra ngoài dấu căn:\n$3\\sqrt{8} = 3\\sqrt{4 \\cdot 2} = 3 \\cdot 2\\sqrt{2} = 6\\sqrt{2}$.\n$\\sqrt{18} = \\sqrt{9 \\cdot 2} = 3\\sqrt{2}$.\n$\\sqrt{50} = \\sqrt{25 \\cdot 2} = 5\\sqrt{2}$.\nDo đó:\n$A = 6\\sqrt{2} + 3\\sqrt{2} - 5\\sqrt{2} = (6 + 3 - 5)\\sqrt{2} = 4\\sqrt{2}$.`,
        rubricSteps: [
          { step: 'Đưa các số chính phương ra ngoài dấu căn', points: 0.5 },
          { step: 'Cộng trừ các căn thức đồng dạng ra kết quả chính xác', points: 0.5 },
        ],
        keyFormula: '$\\sqrt{a^2 b} = a\\sqrt{b}$ (với $a, b \\ge 0$)',
      };
    },
  },

  {
    id: 'T_G9_C2_MED_01',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Căn bậc hai và ĐKXĐ',
    topic: 'Hằng đẳng thức căn thức bậc hai',
    problemType: 'Rút gọn căn của bình phương biểu thức',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // sqrt((sqrt(3) - 2)^2) = |sqrt(3) - 2| = 2 - sqrt(3) vì sqrt(3) < 2
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$2 - \\sqrt{3}$',
        [
          { text: '$\\sqrt{3} - 2$', errorType: 'QUÊN_DẤU_GIÁ_TRỊ_TUYỆT_ĐỐI_KHI_SỐ_ÂM' },
          { text: '$\\sqrt{3} + 2$', errorType: 'ĐỔI_DẤU_TRỪ_THÀNH_CỘNG' },
          { text: '$1$', errorType: 'TÍNH_NHẦM' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Căn bậc hai và ĐKXĐ',
        topic: 'Hằng đẳng thức căn thức bậc hai',
        problemType: 'Rút gọn căn của bình phương biểu thức',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Rút gọn biểu thức $M = \\sqrt{(\\sqrt{3} - 2)^2}$ ta được:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Áp dụng hằng đẳng thức $\\sqrt{A^2} = |A|$:\n$M = |\\sqrt{3} - 2|$.\nVì $\\sqrt{3} < \\sqrt{4} = 2$ nên $\\sqrt{3} - 2 < 0$.\nDo đó $|\\sqrt{3} - 2| = -(\\sqrt{3} - 2) = 2 - \\sqrt{3}$.`,
        rubricSteps: [{ step: 'Áp dụng hằng đẳng thức giá trị tuyệt đối và phá dấu đúng', points: 0.5 }],
        keyFormula: '$\\sqrt{A^2} = |A| = -A$ nếu $A < 0$',
      };
    },
  },

  {
    id: 'T_G9_C2_MED_02',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Rút gọn biểu thức chứa căn thức bậc hai',
    topic: 'Trục căn thức ở mẫu',
    problemType: 'Trục căn thức bằng biểu thức liên hợp',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // 2 / (sqrt(5) - 1) = 2(sqrt(5) + 1) / (5 - 1) = (sqrt(5) + 1) / 2
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Rút gọn biểu thức chứa căn thức bậc hai',
        topic: 'Trục căn thức ở mẫu',
        problemType: 'Trục căn thức bằng biểu thức liên hợp',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Trục căn thức ở mẫu và rút gọn biểu thức: $B = \\frac{4}{\\sqrt{5} - 1}$.`,
        correctAnswer: `\\sqrt{5} + 1`,
        acceptedAnswers: [
          `\\sqrt{5} + 1`,
          `sqrt(5) + 1`,
          `1 + \\sqrt{5}`,
        ],
        solution: `Nhân cả tử và mẫu với lượng liên hợp $\\sqrt{5} + 1$:\n$B = \\frac{4(\\sqrt{5} + 1)}{(\\sqrt{5} - 1)(\\sqrt{5} + 1)} = \\frac{4(\\sqrt{5} + 1)}{(\\sqrt{5})^2 - 1^2} = \\frac{4(\\sqrt{5} + 1)}{5 - 1} = \\frac{4(\\sqrt{5} + 1)}{4} = \\sqrt{5} + 1$.`,
        rubricSteps: [
          { step: 'Nhân cả tử và mẫu với biểu thức liên hợp', points: 0.5 },
          { step: 'Khai triển hiệu hai bình phương ở mẫu và rút gọn với tử', points: 0.5 },
        ],
        keyFormula: '$\\frac{c}{\\sqrt{a} - b} = \\frac{c(\\sqrt{a} + b)}{a - b^2}$',
      };
    },
  },

  {
    id: 'T_G9_C2_MED_03',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Bất đẳng thức và Bất phương trình bậc nhất một ẩn',
    topic: 'Bất phương trình đưa về bậc nhất',
    problemType: 'Giải bất phương trình quy đồng khử mẫu',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // (x - 1)/2 >= (x + 1)/3 => 3(x - 1) >= 2(x + 1) => 3x - 3 >= 2x + 2 => x >= 5
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$x \\ge 5$',
        [
          { text: '$x \\le 5$', errorType: 'NGƯỢC_CHIỀU' },
          { text: '$x \\ge 1$', errorType: 'TÍNH_NHẦM' },
          { text: '$x > 5$', errorType: 'THIẾU_DẤU_BẰNG' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Bất đẳng thức và Bất phương trình bậc nhất một ẩn',
        topic: 'Bất phương trình đưa về bậc nhất',
        problemType: 'Giải bất phương trình quy đồng khử mẫu',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Nghiệm của bất phương trình $\\frac{x - 1}{2} \\ge \\frac{x + 1}{3}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Quy đồng mẫu số hai vế với mẫu số chung dương là $6$:\n$3(x - 1) \\ge 2(x + 1) \\Leftrightarrow 3x - 3 \\ge 2x + 2 \\Leftrightarrow 3x - 2x \\ge 2 + 3 \\Leftrightarrow x \\ge 5$.`,
        rubricSteps: [{ step: 'Quy đồng mẫu dương, khử mẫu và giải bất phương trình', points: 0.5 }],
        keyFormula: 'Nhân hai vế với số dương thì chiều bất phương trình không đổi.',
      };
    },
  },

  {
    id: 'T_G9_C2_MED_04',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Căn bậc hai và ĐKXĐ',
    topic: 'Ứng dụng thực tế của căn bậc hai',
    problemType: 'Tính tầm nhìn xa trên biển theo độ cao',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // d = 3.57 * sqrt(h). Nếu h = 100m => d = 3.57 * 10 = 35.7 km.
      const h = 100;
      const d = 35.7;

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Căn bậc hai và ĐKXĐ',
        topic: 'Ứng dụng thực tế của căn bậc hai',
        problemType: 'Tính tầm nhìn xa trên biển theo độ cao',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Khoảng cách tầm nhìn xa $d$ (tính bằng kilômét) từ một ngọn hải đăng có chiều cao $h$ (tính bằng mét) so với mực nước biển được tính xấp xỉ theo công thức $d = 3{,}57 \\sqrt{h}$. Hãy tính tầm nhìn xa của một hoa tiêu đứng trên ngọn hải đăng cao $${h}$ m.`,
        correctAnswer: `${d}`,
        acceptedAnswers: [`${d}`, `${d} km`],
        solution: `Thay chiều cao $h = ${h}$ m vào công thức:\n$d = 3{,}57 \\cdot \\sqrt{${h}} = 3{,}57 \\cdot 10 = ${d}$ km.\nVậy hoa tiêu có tầm nhìn xa là $${d}$ km.`,
        rubricSteps: [
          { step: 'Thay giá trị h vào công thức căn bậc hai', points: 0.5 },
          { step: 'Tính căn số học và tính ra kết quả kèm đơn vị', points: 0.5 },
        ],
        keyFormula: '$d = 3{,}57 \\sqrt{h}$',
      };
    },
  },

  {
    id: 'T_G9_C2_HARD_01',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Rút gọn biểu thức chứa căn thức bậc hai',
    topic: 'Rút gọn biểu thức đại số chứa căn',
    problemType: 'Bài toán rút gọn biểu thức thi vào 10',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // P = (1 / (sqrt(x) - 1) - 1 / (sqrt(x) + 1)) * (x - 1) / 2
      // = (2 / (x - 1)) * (x - 1) / 2 = 1.
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Rút gọn biểu thức chứa căn thức bậc hai',
        topic: 'Rút gọn biểu thức đại số chứa căn',
        problemType: 'Bài toán rút gọn biểu thức thi vào 10',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Cho biểu thức $P = \\left( \\frac{1}{\\sqrt{x} - 1} - \\frac{1}{\\sqrt{x} + 1} \\right) \\cdot \\frac{x - 1}{2}$ với $x \\ge 0$ và $x \\neq 1$. Hãy rút gọn biểu thức $P$.`,
        correctAnswer: '1',
        acceptedAnswers: ['1'],
        solution: `Quy đồng mẫu thức trong ngoặc với mẫu thức chung là $(\\sqrt{x} - 1)(\\sqrt{x} + 1) = x - 1$:\n$\\frac{1}{\\sqrt{x} - 1} - \\frac{1}{\\sqrt{x} + 1} = \\frac{(\\sqrt{x} + 1) - (\\sqrt{x} - 1)}{x - 1} = \\frac{2}{x - 1}$.\nDo đó:\n$P = \\frac{2}{x - 1} \\cdot \\frac{x - 1}{2} = 1$.`,
        rubricSteps: [
          { step: 'Quy đồng biểu thức trong ngoặc chính xác', points: 0.5 },
          { step: 'Thực hiện phép nhân và triệt tiêu để ra kết quả gọn nhất', points: 0.5 },
        ],
        keyFormula: '$(\\sqrt{x} - 1)(\\sqrt{x} + 1) = x - 1$',
      };
    },
  },

  {
    id: 'T_G9_C2_HARD_02',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Bất đẳng thức và Bất phương trình bậc nhất một ẩn',
    topic: 'Bất đẳng thức Cô-si (AM-GM)',
    problemType: 'Tìm giá trị nhỏ nhất của biểu thức',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 4);
      const a2 = a * a;
      const minVal = 2 * a;

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Bất đẳng thức và Bất phương trình bậc nhất một ẩn',
        topic: 'Bất đẳng thức Cô-si (AM-GM)',
        problemType: 'Tìm giá trị nhỏ nhất của biểu thức',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Với $x > 0$, hãy tìm giá trị nhỏ nhất của biểu thức $E = x + \\frac{${a2}}{x}$.`,
        correctAnswer: `${minVal}`,
        acceptedAnswers: [`${minVal}`, `Min = ${minVal}`],
        solution: `Vì $x > 0$ nên $\\frac{${a2}}{x} > 0$.\nÁp dụng bất đẳng thức Cô-si cho hai số dương $x$ và $\\frac{${a2}}{x}$:\n$E = x + \\frac{${a2}}{x} \\ge 2\\sqrt{x \\cdot \\frac{${a2}}{x}} = 2\\sqrt{${a2}} = 2 \\cdot ${a} = ${minVal}$.\nDấu đẳng thức xảy ra khi $x = \\frac{${a2}}{x} \\Leftrightarrow x^2 = ${a2} \\Leftrightarrow x = ${a}$ (vì $x > 0$).\nVậy giá trị nhỏ nhất của biểu thức là $${minVal}$, đạt được khi $x = ${a}$.`,
        rubricSteps: [
          { step: 'Nêu điều kiện dương và áp dụng bất đẳng thức AM-GM', points: 0.5 },
          { step: 'Tính giá trị nhỏ nhất và chỉ ra dấu bằng xảy ra', points: 0.5 },
        ],
        keyFormula: '$a + b \\ge 2\\sqrt{ab}$ (với $a, b > 0$)',
      };
    },
  },

  {
    id: 'T_G9_C2_HARD_03',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Rút gọn biểu thức chứa căn thức bậc hai',
    topic: 'Căn bậc hai lồng nhau',
    problemType: 'Đưa biểu thức dưới căn về bình phương đúng',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // 4 + 2*sqrt(3) = (sqrt(3) + 1)^2 => sqrt = sqrt(3) + 1
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$\\sqrt{3} + 1$',
        [
          { text: '$\\sqrt{3} - 1$', errorType: 'SAI_DẤU' },
          { text: '$2 + \\sqrt{3}$', errorType: 'TÍNH_NHẦM_SỐ_HẠNG' },
          { text: '$4$', errorType: 'BỎ_CĂN_SAI' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Rút gọn biểu thức chứa căn thức bậc hai',
        topic: 'Căn bậc hai lồng nhau',
        problemType: 'Đưa biểu thức dưới căn về bình phương đúng',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: `Rút gọn biểu thức $\\sqrt{4 + 2\\sqrt{3}}$ ta được:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Ta phân tích biểu thức dưới dấu căn thành bình phương của một tổng:\n$4 + 2\\sqrt{3} = 3 + 2\\sqrt{3} \\cdot 1 + 1 = (\\sqrt{3})^2 + 2 \\cdot \\sqrt{3} \\cdot 1 + 1^2 = (\\sqrt{3} + 1)^2$.\nDo đó: $\\sqrt{4 + 2\\sqrt{3}} = \\sqrt{(\\sqrt{3} + 1)^2} = |\\sqrt{3} + 1| = \\sqrt{3} + 1$.`,
        rubricSteps: [{ step: 'Tách biểu thức thành dạng hằng đẳng thức bình phương một tổng và khai căn', points: 0.5 }],
        keyFormula: '$a + 2\\sqrt{b} = (\\sqrt{u} + \\sqrt{v})^2$ với $u+v=a, uv=b$',
      };
    },
  },

  {
    id: 'T_G9_C2_HARD_04',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Căn bậc hai và ĐKXĐ',
    topic: 'Vận tốc phanh xe trên đường trơn',
    problemType: 'Tính tốc độ xe phanh gấp theo độ dài vết bánh',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // v = sqrt(2 * mu * g * d). Lấy công thức đơn giản hóa: v = sqrt(250 * d).
      // Nếu d = 40m => v = sqrt(10000) = 100 km/h hoặc công thức thực nghiệm v = sqrt(20 * d) m/s.
      // Cho công thức: v = sqrt(19.6 * d). d = 20m => v = sqrt(392) ~ 19.8 m/s.
      // Dễ hơn: v = sqrt(16 * s) với s = 25m => v = 20 m/s.
      const s = 25;
      const v = 20;

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Căn bậc hai và ĐKXĐ',
        topic: 'Vận tốc phanh xe trên đường trơn',
        problemType: 'Tính tốc độ xe phanh gấp theo độ dài vết bánh',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Cảnh sát giao thông ước lượng vận tốc $v$ (m/s) của một ô tô trước khi phanh gấp thông qua độ dài vết trượt bánh xe $s$ (m) trên mặt đường nhựa khô ráo theo công thức $v = \\sqrt{16s}$. Nếu độ dài vết trượt bánh xe đo được tại hiện trường là $s = ${s}$ m, hãy tính vận tốc của xe trước khi phanh.`,
        correctAnswer: `${v}`,
        acceptedAnswers: [`${v}`, `${v} m/s`],
        solution: `Thay độ dài vết trượt bánh xe $s = ${s}$ m vào công thức:\n$v = \\sqrt{16 \\times ${s}} = \\sqrt{400} = ${v}$ m/s.\nVậy vận tốc của xe ngay trước khi phanh là $${v}$ m/s (tương đương $72$ km/h).`,
        rubricSteps: [
          { step: 'Thay giá trị độ dài vết trượt vào công thức căn bậc hai', points: 0.5 },
          { step: 'Tính toán khai căn số học ra vận tốc chính xác kèm đơn vị', points: 0.5 },
        ],
        keyFormula: '$v = \\sqrt{2ad}$',
      };
    },
  },

  // ----------------------------------------------------------------------------
  // CHƯƠNG 3: HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG VÀ ĐƯỜNG TRÒN (G9_C3) - HK1
  // ----------------------------------------------------------------------------
  {
    id: 'T_G9_C3_EASY_01',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Tỉ số lượng giác của góc nhọn (sin, cos, tan, cot)',
    topic: 'Định nghĩa tỉ số lượng giác góc nhọn',
    problemType: 'Tính sin của góc nhọn',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const triple = [3, 4, 5];
      const opp = triple[0];
      const adj = triple[1];
      const hyp = triple[2];

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$\\sin B = \\frac{${adj}}{${hyp}}$`,
        [
          { text: `$\\sin B = \\frac{${opp}}{${hyp}}$`, errorType: 'NHẦM_CẠNH_ĐỐI_VỚI_KỀ' },
          { text: `$\\sin B = \\frac{${adj}}{${opp}}$`, errorType: 'NHẦM_VỚI_TAN' },
          { text: `$\\sin B = \\frac{${hyp}}{${adj}}$`, errorType: 'NGHỊCH_ĐẢO_TỈ_SỐ' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Tỉ số lượng giác của góc nhọn (sin, cos, tan, cot)',
        topic: 'Định nghĩa tỉ số lượng giác góc nhọn',
        problemType: 'Tính sin của góc nhọn',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Cho tam giác $ABC$ vuông tại $A$ có $AB = ${opp}$ cm, $AC = ${adj}$ cm, $BC = ${hyp}$ cm. Tỉ số lượng giác $\\sin B$ bằng:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Trong tam giác vuông, $\\sin$ của góc nhọn bằng cạnh đối chia cho cạnh huyền.\nĐối với góc $B$, cạnh đối là $AC = ${adj}$ cm, cạnh huyền là $BC = ${hyp}$ cm.\nDo đó: $\\sin B = \\frac{AC}{BC} = \\frac{${adj}}{${hyp}}$.`,
        rubricSteps: [{ step: 'Xác định đúng cạnh đối và cạnh huyền để tính sin', points: 0.5 }],
        keyFormula: '$\\sin = \\frac{\\text{đối}}{\\text{huyền}}$',
      };
    },
  },

  {
    id: 'T_G9_C3_EASY_02',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Hệ thức lượng trong tam giác vuông',
    topic: 'Hệ thức giữa cạnh góc vuông và hình chiếu',
    problemType: 'Tính cạnh góc vuông theo hình chiếu',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // b^2 = a * b'. Cho a = 10, b' = 3.6 => b^2 = 36 => b = 6.
      const a = 10;
      const bPrime = 3.6;
      const b = 6;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${b}$ cm`,
        [
          { text: `$${b * b}$ cm`, errorType: 'QUÊN_KHAI_CĂN' },
          { text: `$${b + 2}$ cm`, errorType: 'TÍNH_NHẦM' },
          { text: `$${a - bPrime}$ cm`, errorType: 'TRỪ_TRỰC_TIẾP' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Hệ thức lượng trong tam giác vuông',
        topic: 'Hệ thức giữa cạnh góc vuông và hình chiếu',
        problemType: 'Tính cạnh góc vuông theo hình chiếu',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Cho tam giác $ABC$ vuông tại $A$, đường cao $AH$. Biết cạnh huyền $BC = ${a}$ cm và hình chiếu $BH = ${bPrime}$ cm. Độ dài cạnh góc vuông $AB$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Theo hệ thức lượng trong tam giác vuông:\n$AB^2 = BC \\cdot BH = ${a} \\cdot ${bPrime} = 36 \\Rightarrow AB = \\sqrt{36} = ${b}$ cm.`,
        rubricSteps: [{ step: 'Áp dụng hệ thức b^2 = a * b\' tính ra cạnh góc vuông', points: 0.5 }],
        keyFormula: '$b^2 = a \\cdot b\'$',
      };
    },
  },

  {
    id: 'T_G9_C3_EASY_03',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Đường tròn và tính chất đối xứng',
    topic: 'Liên hệ giữa đường kính và dây cung',
    problemType: 'Dây lớn nhất của đường tròn',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const r = rng.nextInt(3, 9);
      const d = 2 * r;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${d}$ cm`,
        [
          { text: `$${r}$ cm`, errorType: 'NHẦM_VỚI_BÁN_KÍNH' },
          { text: `$${r * 3}$ cm`, errorType: 'NHÂN_3' },
          { text: `$${d + 2}$ cm`, errorType: 'TÍNH_NHẦM' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Đường tròn và tính chất đối xứng',
        topic: 'Liên hệ giữa đường kính và dây cung',
        problemType: 'Dây lớn nhất của đường tròn',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Độ dài lớn nhất của một dây cung trong đường tròn tâm $O$ bán kính $R = ${r}$ cm là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Trong một đường tròn, đường kính là dây lớn nhất. Do đó độ dài dây cung lớn nhất bằng đường kính: $d = 2R = 2 \\times ${r} = ${d}$ cm.`,
        rubricSteps: [{ step: 'Nhận biết dây lớn nhất là đường kính và tính bằng 2R', points: 0.5 }],
        keyFormula: 'Dây lớn nhất = Đường kính = $2R$',
      };
    },
  },

  {
    id: 'T_G9_C3_EASY_04',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Tỉ số lượng giác của góc nhọn (sin, cos, tan, cot)',
    topic: 'Giải tam giác vuông',
    problemType: 'Tính cạnh góc vuông biết góc nhọn và cạnh kề',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Tam giác vuông có góc B = 30 độ, cạnh huyền BC = 12 cm => AC = BC * sin(30) = 6 cm.
      const bc = 12;
      const ac = 6;

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Tỉ số lượng giác của góc nhọn (sin, cos, tan, cot)',
        topic: 'Giải tam giác vuông',
        problemType: 'Tính cạnh góc vuông biết góc nhọn và cạnh kề',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Cho tam giác $ABC$ vuông tại $A$ có góc $\\widehat{B} = 30^\\circ$ và cạnh huyền $BC = ${bc}$ cm. Tính độ dài cạnh góc vuông $AC$.`,
        correctAnswer: `${ac}`,
        acceptedAnswers: [`${ac}`, `${ac} cm`],
        solution: `Trong tam giác vuông $ABC$ vuông tại $A$:\n$AC = BC \\cdot \\sin B = ${bc} \\cdot \\sin 30^\\circ = ${bc} \\cdot \\frac{1}{2} = ${ac}$ cm.`,
        rubricSteps: [
          { step: 'Áp dụng hệ thức cạnh góc vuông bằng cạnh huyền nhân sin góc đối', points: 0.5 },
          { step: 'Thay giá trị sin 30 độ và tính ra AC', points: 0.5 },
        ],
        keyFormula: '$b = a \\cdot \\sin B$',
      };
    },
  },

  {
    id: 'T_G9_C3_MED_01',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Hệ thức lượng trong tam giác vuông',
    topic: 'Hệ thức đường cao và hình chiếu',
    problemType: 'Tính đường cao tam giác vuông',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // h^2 = b' * c'. Cho BH = 4 cm, CH = 9 cm => h^2 = 36 => h = 6 cm.
      const bh = 4;
      const ch = 9;
      const ah = 6;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${ah}$ cm`,
        [
          { text: `$${bh + ch}$ cm`, errorType: 'CỘNG_HAI_HÌNH_CHIẾU' },
          { text: `$${ah * ah}$ cm`, errorType: 'CHƯA_KHAI_CĂN' },
          { text: `$${ah + 1}$ cm`, errorType: 'TÍNH_NHẦM' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Hệ thức lượng trong tam giác vuông',
        topic: 'Hệ thức đường cao và hình chiếu',
        problemType: 'Tính đường cao tam giác vuông',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Cho tam giác $ABC$ vuông tại $A$, đường cao $AH$. Biết hai hình chiếu trên cạnh huyền là $BH = ${bh}$ cm và $CH = ${ch}$ cm. Độ dài đường cao $AH$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Theo hệ thức lượng trong tam giác vuông:\n$AH^2 = BH \\cdot CH = ${bh} \\cdot ${ch} = 36 \\Rightarrow AH = \\sqrt{36} = ${ah}$ cm.`,
        rubricSteps: [{ step: 'Áp dụng hệ thức h^2 = b\' * c\' tính đúng đường cao', points: 0.5 }],
        keyFormula: '$h^2 = b\' \\cdot c\'$',
      };
    },
  },

  {
    id: 'T_G9_C3_MED_02',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Tiếp tuyến của đường tròn',
    topic: 'Tính chất tiếp tuyến',
    problemType: 'Bán kính vuông góc tiếp tuyến',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // OA = 10 cm, R = 6 cm => Tiếp tuyến AB có AB = sqrt(100 - 36) = 8 cm.
      const oa = 10;
      const r = 6;
      const ab = 8;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${ab}$ cm`,
        [
          { text: `$${oa - r}$ cm`, errorType: 'TRỪ_TRỰC_TIẾP' },
          { text: `$${oa + r}$ cm`, errorType: 'CỘNG_TRỰC_TIẾP' },
          { text: `$${ab + 2}$ cm`, errorType: 'TÍNH_NHẦM' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Tiếp tuyến của đường tròn',
        topic: 'Tính chất tiếp tuyến',
        problemType: 'Bán kính vuông góc tiếp tuyến',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Từ điểm $A$ nằm ngoài đường tròn $(O; ${r}\\text{ cm})$, kẻ tiếp tuyến $AB$ với đường tròn ($B$ là tiếp điểm). Biết $OA = ${oa}$ cm. Độ dài đoạn tiếp tuyến $AB$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Vì $AB$ là tiếp tuyến của $(O)$ tại $B$ nên $OB \\perp AB$, tam giác $OAB$ vuông tại $B$.\nTheo định lí Pythagore:\n$AB^2 = OA^2 - OB^2 = ${oa}^2 - ${r}^2 = 100 - 36 = 64 \\Rightarrow AB = \\sqrt{64} = ${ab}$ cm.`,
        rubricSteps: [{ step: 'Chỉ ra bán kính vuông góc tiếp tuyến và áp dụng định lí Pythagore', points: 0.5 }],
        keyFormula: '$AB = \\sqrt{OA^2 - R^2}$',
      };
    },
  },

  {
    id: 'T_G9_C3_MED_03',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Tiếp tuyến của đường tròn',
    topic: 'Tính chất hai tiếp tuyến cắt nhau',
    problemType: 'Góc tạo bởi hai tiếp tuyến',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const angleO = 120;
      const angleA = 180 - angleO; // 60

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Tiếp tuyến của đường tròn',
        topic: 'Tính chất hai tiếp tuyến cắt nhau',
        problemType: 'Góc tạo bởi hai tiếp tuyến',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Từ điểm $A$ ngoài đường tròn $(O)$, kẻ hai tiếp tuyến $AB$ và $AC$ ($B, C$ là các tiếp điểm). Biết góc ở tâm $\\widehat{BOC} = ${angleO}^\\circ$. Hãy tính số đo của góc $\\widehat{BAC}$.`,
        correctAnswer: `${angleA}`,
        acceptedAnswers: [`${angleA}`, `${angleA} độ`],
        solution: `Vì $AB, AC$ là hai tiếp tuyến của $(O)$ nên $\\widehat{ABO} = \\widehat{ACO} = 90^\\circ$.\nXét tứ giác $ABOC$ có tổng bốn góc bằng $360^\\circ$:\n$\\widehat{BAC} + \\widehat{ABO} + \\widehat{ACO} + \\widehat{BOC} = 360^\\circ$\n$\\Leftrightarrow \\widehat{BAC} + 90^\\circ + 90^\\circ + ${angleO}^\\circ = 360^\\circ \\Leftrightarrow \\widehat{BAC} = 180^\\circ - ${angleO}^\\circ = ${angleA}^\\circ$.`,
        rubricSteps: [
          { step: 'Nhận biết hai góc tiếp điểm bằng 90 độ', points: 0.5 },
          { step: 'Dùng tổng góc tứ giác tính ra góc BAC bù với góc ở tâm BOC', points: 0.5 },
        ],
        keyFormula: '$\\widehat{BAC} + \\widehat{BOC} = 180^\\circ$',
      };
    },
  },

  {
    id: 'T_G9_C3_MED_04',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Tỉ số lượng giác của góc nhọn (sin, cos, tan, cot)',
    topic: 'Đo chiều cao tòa nhà bằng giác kế',
    problemType: 'Ứng dụng tỉ số lượng giác đo đạc thực tế',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // d = 20m, angle = 45 deg, eyeH = 1.6m => tan(45) = 1 => H = 20 + 1.6 = 21.6m
      const dist = 20;
      const eyeH = 1.6;
      const buildingH = dist + eyeH;

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Tỉ số lượng giác của góc nhọn (sin, cos, tan, cot)',
        topic: 'Đo chiều cao tòa nhà bằng giác kế',
        problemType: 'Ứng dụng tỉ số lượng giác đo đạc thực tế',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Một người dùng giác kế đứng cách chân tòa nhà một khoảng $d = ${dist}$ m. Chiều cao từ mặt đất đến mắt người quan sát là $${eyeH}$ m. Người đó nhìn thấy đỉnh tòa nhà dưới góc nâng $45^\\circ$ so với phương nằm ngang. Tính chiều cao của tòa nhà đó.`,
        correctAnswer: `${buildingH}`,
        acceptedAnswers: [`${buildingH}`, `${buildingH} m`],
        solution: `Phần chiều cao tòa nhà từ tầm mắt trở lên là:\n$h_1 = d \\cdot \\tan 45^\\circ = ${dist} \\cdot 1 = ${dist}$ m.\nTổng chiều cao của tòa nhà là:\n$H = h_1 + h_{\\text{mắt}} = ${dist} + ${eyeH} = ${buildingH}$ m.`,
        rubricSteps: [
          { step: 'Dùng tỉ số lượng giác tan tính chiều cao phần trên', points: 0.5 },
          { step: 'Cộng chiều cao giác kế tính ra tổng chiều cao tòa nhà', points: 0.5 },
        ],
        keyFormula: '$H = d \\cdot \\tan \\alpha + h_{\\text{mắt}}$',
      };
    },
  },

  {
    id: 'T_G9_C3_HARD_01',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Tiếp tuyến của đường tròn',
    topic: 'Chứng minh tiếp tuyến của đường tròn',
    problemType: 'Chứng minh đường thẳng vuông góc bán kính tại mút',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Tiếp tuyến của đường tròn',
        topic: 'Chứng minh tiếp tuyến của đường tròn',
        problemType: 'Chứng minh đường thẳng vuông góc bán kính tại mút',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Nêu hai điều kiện cần và đủ để một đường thẳng $d$ là tiếp tuyến của đường tròn $(O; R)$ tại điểm $H$.`,
        correctAnswer: 'H thuộc đường tròn và d vuông góc với OH tại H',
        acceptedAnswers: [
          'H thuộc đường tròn và d vuông góc với OH tại H',
          'd vuông góc OH tại H và H thuộc (O)',
        ],
        solution: `Đường thẳng $d$ là tiếp tuyến của đường tròn $(O; R)$ tại tiếp điểm $H$ khi và chỉ khi:\n1. Điểm $H$ nằm trên đường tròn $(O; R)$ (tức là $OH = R$).\n2. Đường thẳng $d$ vuông góc với bán kính $OH$ tại điểm $H$ ($d \\perp OH$ tại $H$).`,
        rubricSteps: [
          { step: 'Nêu điều kiện điểm tiếp xúc thuộc đường tròn', points: 0.5 },
          { step: 'Nêu điều kiện đường thẳng vuông góc với bán kính tại tiếp điểm', points: 0.5 },
        ],
        keyFormula: '$d \\text{ là tiếp tuyến} \\Leftrightarrow H \\in (O) \\text{ và } d \\perp OH \\text{ tại } H$',
      };
    },
  },

  {
    id: 'T_G9_C3_HARD_02',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Tỉ số lượng giác của góc nhọn (sin, cos, tan, cot)',
    topic: 'Đẳng thức lượng giác cơ bản',
    problemType: 'Tính giá trị biểu thức lượng giác không dùng bảng số',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // sin^2(15) + sin^2(75) = sin^2(15) + cos^2(15) = 1
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$1$',
        [
          { text: '$0$', errorType: 'TÍNH_NHẦM' },
          { text: '$\\frac{1}{2}$', errorType: 'NHẦM_VỚI_SIN_30' },
          { text: '$2$', errorType: 'CỘNG_SAI' },
        ]
      );

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Tỉ số lượng giác của góc nhọn (sin, cos, tan, cot)',
        topic: 'Đẳng thức lượng giác cơ bản',
        problemType: 'Tính giá trị biểu thức lượng giác không dùng bảng số',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: `Giá trị của biểu thức $P = \\sin^2 15^\\circ + \\sin^2 75^\\circ$ bằng:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Vì hai góc $15^\\circ$ và $75^\\circ$ phụ nhau ($15^\\circ + 75^\\circ = 90^\\circ$) nên:\n$\\sin 75^\\circ = \\cos 15^\\circ$.\nDo đó:\n$P = \\sin^2 15^\\circ + \\cos^2 15^\\circ = 1$.`,
        rubricSteps: [{ step: 'Biến đổi lượng giác góc phụ nhau và áp dụng sin^2 + cos^2 = 1', points: 0.5 }],
        keyFormula: '$\\sin^2 \\alpha + \\cos^2 \\alpha = 1$',
      };
    },
  },

  {
    id: 'T_G9_C3_HARD_03',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Hệ thức lượng trong tam giác vuông',
    topic: 'Bán kính đường tròn nội tiếp tam giác vuông',
    problemType: 'Tính r theo ba cạnh tam giác vuông',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // a=6, b=8, c=10 => r = (a + b - c)/2 = (6 + 8 - 10)/2 = 2 cm.
      const a = 6;
      const b = 8;
      const c = 10;
      const r = (a + b - c) / 2;

      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Hệ thức lượng trong tam giác vuông',
        topic: 'Bán kính đường tròn nội tiếp tam giác vuông',
        problemType: 'Tính r theo ba cạnh tam giác vuông',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Cho tam giác $ABC$ vuông tại $A$ có các cạnh $AB = ${a}$ cm, $AC = ${b}$ cm, $BC = ${c}$ cm. Hãy tính bán kính $r$ của đường tròn nội tiếp tam giác $ABC$.`,
        correctAnswer: `${r}`,
        acceptedAnswers: [`${r}`, `${r} cm`],
        solution: `Công thức tính bán kính đường tròn nội tiếp tam giác vuông là:\n$r = \\frac{AB + AC - BC}{2} = \\frac{${a} + ${b} - ${c}}{2} = \\frac{4}{2} = ${r}$ cm.\n(Hoặc dùng công thức $S = p \\cdot r \\Rightarrow r = \\frac{S}{p} = \\frac{24}{12} = 2$ cm).`,
        rubricSteps: [
          { step: 'Nêu công thức liên hệ bán kính đường tròn nội tiếp tam giác vuông', points: 0.5 },
          { step: 'Tính ra bán kính r chính xác', points: 0.5 },
        ],
        keyFormula: '$r = \\frac{a + b - c}{2}$',
      };
    },
  },

  {
    id: 'T_G9_C3_HARD_04',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Tỉ số lượng giác của góc nhọn (sin, cos, tan, cot)',
    topic: 'Bài toán góc khuất và đá ngầm',
    problemType: 'Tính khoảng cách an toàn tàu biển',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Tàu đi ngang qua ngọn đèn hải đăng cao 50m. Đo góc nâng ban đầu 30 độ, sau đó 45 độ.
      // Dùng hệ thức lượng giác tính khoảng cách.
      const h = 50;
      // cot(45) = 1 => d1 = 50m.
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Tỉ số lượng giác của góc nhọn (sin, cos, tan, cot)',
        topic: 'Bài toán góc khuất và đá ngầm',
        problemType: 'Tính khoảng cách an toàn tàu biển',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Một ngọn hải đăng cao $${h}$ m so với mực nước biển. Thủy thủ trên tàu nhìn thấy đỉnh ngọn hải đăng với góc nâng $45^\\circ$. Hỏi lúc đó tàu đang cách chân ngọn hải đăng một khoảng là bao nhiêu mét?`,
        correctAnswer: `${h}`,
        acceptedAnswers: [`${h}`, `${h} m`],
        solution: `Ngọn hải đăng, mực nước biển và tia nhìn tạo thành tam giác vuông tại chân hải đăng.\nKhoảng cách từ tàu đến chân hải đăng là:\n$d = \\frac{h}{\\tan 45^\\circ} = \\frac{${h}}{1} = ${h}$ m.`,
        rubricSteps: [
          { step: 'Lập tỉ số lượng giác tan của góc nâng', points: 0.5 },
          { step: 'Tính ra khoảng cách đến chân hải đăng', points: 0.5 },
        ],
        keyFormula: '$d = \\frac{h}{\\tan \\alpha}$',
      };
    },
  },

  // ----------------------------------------------------------------------------
  // CHƯƠNG 4: HÀM SỐ Y = AX² (A ≠ 0) VÀ PHƯƠNG TRÌNH BẬC HAI (G9_C4) - HK2
  // ----------------------------------------------------------------------------
  {
    id: 'T_G9_C4_EASY_01',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C4',
    lesson: 'Đồ thị Parabol y = ax²',
    topic: 'Tính chất đồng biến nghịch biến của hàm số y = ax²',
    problemType: 'Xét tính đồng biến nghịch biến',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Nghịch biến khi $x < 0$ và đồng biến khi $x > 0$',
        [
          { text: 'Đồng biến khi $x < 0$ và nghịch biến khi $x > 0$', errorType: 'NHẦM_VỚI_TRƯỜNG_HỢP_A_ÂM' },
          { text: 'Luôn luôn đồng biến trên $\\mathbb{R}$', errorType: 'NHẦM_VỚI_HÀM_BẬC_NHẤT' },
          { text: 'Luôn luôn nghịch biến trên $\\mathbb{R}$', errorType: 'SAI_TÍNH_CHẤT' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C4',
        lesson: 'Đồ thị Parabol y = ax²',
        topic: 'Tính chất đồng biến nghịch biến của hàm số y = ax²',
        problemType: 'Xét tính đồng biến nghịch biến',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Hàm số $y = ${a}x^2$ có tính chất biến thiên nào sau đây?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Với hệ số $a = ${a} > 0$, hàm số $y = ax^2$ nghịch biến khi $x < 0$, đồng biến khi $x > 0$, và đạt giá trị nhỏ nhất bằng 0 tại $x = 0$.`,
        rubricSteps: [{ step: 'Nhận xét hệ số a dương và nêu đúng tính chất biến thiên', points: 0.5 }],
        keyFormula: 'Với $a > 0$: nghịch biến trên $(-\\infty; 0)$, đồng biến trên $(0; +\\infty)$.',
      };
    },
  },

  {
    id: 'T_G9_C4_EASY_02',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C4',
    lesson: 'Phương trình bậc hai một ẩn và công thức nghiệm Delta',
    topic: 'Giải phương trình bậc hai khuyết',
    problemType: 'Phương trình khuyết hệ số c',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const b = rng.nextInt(3, 8);
      // ax^2 - bx = 0 => x(ax - b) = 0 => x = 0 hoặc x = b/a
      const g = gcd(b, a);
      const fracStr = formatFraction(b / g, a / g);

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x = 0$ hoặc $x = ${fracStr}$`,
        [
          { text: `$x = ${fracStr}$`, errorType: 'QUÊN_NGHIỆM_X_BẰNG_KHÔNG' },
          { text: `$x = 0$ hoặc $x = -${fracStr}$`, errorType: 'SAI_DẤU_NGHIỆM' },
          { text: 'Phương trình vô nghiệm', errorType: 'SAI_HOÀN_TOÀN' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C4',
        lesson: 'Phương trình bậc hai một ẩn và công thức nghiệm Delta',
        topic: 'Giải phương trình bậc hai khuyết',
        problemType: 'Phương trình khuyết hệ số c',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Nghiệm của phương trình $${a}x^2 - ${b}x = 0$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Đặt nhân tử chung $x$:\n$x(${a}x - ${b}) = 0 \\Leftrightarrow \\left[ \\begin{array}{l} x = 0 \\\\ ${a}x - ${b} = 0 \\end{array} \\right. \\Leftrightarrow \\left[ \\begin{array}{l} x = 0 \\\\ x = ${fracStr} \\end{array} \\right.$.`,
        rubricSteps: [{ step: 'Đặt nhân tử chung x và tìm hai nghiệm', points: 0.5 }],
        keyFormula: '$ax^2 + bx = 0 \\Leftrightarrow x(ax + b) = 0$',
      };
    },
  },

  {
    id: 'T_G9_C4_EASY_03',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C4',
    lesson: 'Phương trình bậc hai một ẩn và công thức nghiệm Delta',
    topic: 'Biệt thức Delta',
    problemType: 'Tính biệt thức Delta và số nghiệm',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // x^2 - 4x + 3 = 0 => Delta = 16 - 12 = 4 > 0 => có 2 nghiệm phân biệt
      const delta = 4;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$\\Delta = 4 > 0$, phương trình có hai nghiệm phân biệt',
        [
          { text: '$\\Delta = -4 < 0$, phương trình vô nghiệm', errorType: 'SAI_DẤU_DELTA' },
          { text: '$\\Delta = 0$, phương trình có nghiệm kép', errorType: 'TÍNH_NHẦM_DELTA_BẰNG_0' },
          { text: '$\\Delta = 28 > 0$, phương trình có vô số nghiệm', errorType: 'TÍNH_NHẦM_DẤU_TRỪ_THÀNH_CỘNG' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C4',
        lesson: 'Phương trình bậc hai một ẩn và công thức nghiệm Delta',
        topic: 'Biệt thức Delta',
        problemType: 'Tính biệt thức Delta và số nghiệm',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Biệt thức $\\Delta$ và số nghiệm của phương trình $x^2 - 4x + 3 = 0$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Ta có hệ số $a = 1, b = -4, c = 3$.\nBiệt thức $\\Delta = b^2 - 4ac = (-4)^2 - 4 \\cdot 1 \\cdot 3 = 16 - 12 = 4$.\nVì $\\Delta = 4 > 0$ nên phương trình có hai nghiệm phân biệt.`,
        rubricSteps: [{ step: 'Tính đúng biệt thức Delta = b^2 - 4ac và kết luận số nghiệm', points: 0.5 }],
        keyFormula: '$\\Delta = b^2 - 4ac$',
      };
    },
  },

  {
    id: 'T_G9_C4_EASY_04',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C4',
    lesson: 'Phương trình bậc hai một ẩn và công thức nghiệm Delta',
    topic: 'Giải phương trình bậc hai đầy đủ',
    problemType: 'Áp dụng công thức nghiệm',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // x^2 - 5x + 6 = 0 => x1 = 2, x2 = 3
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C4',
        lesson: 'Phương trình bậc hai một ẩn và công thức nghiệm Delta',
        topic: 'Giải phương trình bậc hai đầy đủ',
        problemType: 'Áp dụng công thức nghiệm',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Giải phương trình bậc hai sau bằng công thức nghiệm: $x^2 - 5x + 6 = 0$.`,
        correctAnswer: 'x = 2 hoặc x = 3',
        acceptedAnswers: [
          'x = 2 hoặc x = 3',
          '2 và 3',
          'x = 2, x = 3',
          '2, 3',
        ],
        solution: `Hệ số $a = 1, b = -5, c = 6$.\n$\\Delta = b^2 - 4ac = (-5)^2 - 4 \\cdot 1 \\cdot 6 = 25 - 24 = 1 > 0$.\nPhương trình có hai nghiệm phân biệt:\n$x_1 = \\frac{-b + \\sqrt{\\Delta}}{2a} = \\frac{5 + 1}{2} = 3$;\n$x_2 = \\frac{-b - \\sqrt{\\Delta}}{2a} = \\frac{5 - 1}{2} = 2$.`,
        rubricSteps: [
          { step: 'Xác định hệ số a, b, c và tính đúng Delta', points: 0.5 },
          { step: 'Áp dụng công thức nghiệm tính ra x1 = 3, x2 = 2', points: 0.5 },
        ],
        keyFormula: '$x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$',
      };
    },
  },

  {
    id: 'T_G9_C4_MED_01',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C4',
    lesson: 'Định lí Viète và ứng dụng',
    topic: 'Tổng và tích hai nghiệm theo định lí Viète',
    problemType: 'Tính tổng và tích hai nghiệm',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 4);
      const b = rng.nextInt(5, 9);
      const c = rng.nextInt(2, 6);
      // S = -b/a, P = c/a

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$S = -\\frac{${b}}{${a}}; P = \\frac{${c}}{${a}}$`,
        [
          { text: `$S = \\frac{${b}}{${a}}; P = \\frac{${c}}{${a}}$`, errorType: 'QUÊN_DẤU_TRỪ_CỦA_TỔNG' },
          { text: `$S = -\\frac{${b}}{${a}}; P = -\\frac{${c}}{${a}}$`, errorType: 'SAI_DẤU_CỦA_TÍCH' },
          { text: `$S = \\frac{${c}}{${a}}; P = -\\frac{${b}}{${a}}$`, errorType: 'HOÁN_VỊ_S_VÀ_P' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C4',
        lesson: 'Định lí Viète và ứng dụng',
        topic: 'Tổng và tích hai nghiệm theo định lí Viète',
        problemType: 'Tính tổng và tích hai nghiệm',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Nếu phương trình $${a}x^2 + ${b}x + ${c} = 0$ có hai nghiệm $x_1, x_2$ thì tổng $S = x_1 + x_2$ và tích $P = x_1 x_2$ lần lượt bằng:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Theo định lí Viète, nếu phương trình $ax^2 + bx + c = 0$ ($a \\neq 0$) có hai nghiệm thì:\n$S = x_1 + x_2 = -\\frac{b}{a} = -\\frac{${b}}{${a}}$,\n$P = x_1 x_2 = \\frac{c}{a} = \\frac{${c}}{${a}}$.`,
        rubricSteps: [{ step: 'Áp dụng đúng hệ thức Viète cho tổng và tích nghiệm', points: 0.5 }],
        keyFormula: '$x_1 + x_2 = -\\frac{b}{a}$, $x_1 x_2 = \\frac{c}{a}$',
      };
    },
  },

  {
    id: 'T_G9_C4_MED_02',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C4',
    lesson: 'Định lí Viète và ứng dụng',
    topic: 'Biểu thức đối xứng giữa hai nghiệm',
    problemType: 'Tính tổng bình phương hai nghiệm x1^2 + x2^2',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // x^2 - 4x + 2 = 0 => S = 4, P = 2 => x1^2 + x2^2 = S^2 - 2P = 16 - 4 = 12
      const s = 4;
      const p = 2;
      const res = s * s - 2 * p;

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C4',
        lesson: 'Định lí Viète và ứng dụng',
        topic: 'Biểu thức đối xứng giữa hai nghiệm',
        problemType: 'Tính tổng bình phương hai nghiệm x1^2 + x2^2',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Cho phương trình $x^2 - 4x + 2 = 0$ có hai nghiệm $x_1, x_2$. Không giải phương trình, hãy tính giá trị của biểu thức $T = x_1^2 + x_2^2$.`,
        correctAnswer: `${res}`,
        acceptedAnswers: [`${res}`, `T = ${res}`],
        solution: `Phương trình có $\\Delta\' = (-2)^2 - 1 \\cdot 2 = 2 > 0$ nên luôn có hai nghiệm phân biệt.\nTheo định lí Viète:\n$x_1 + x_2 = 4$ và $x_1 x_2 = 2$.\nBiến đổi biểu thức $T$ theo tổng và tích:\n$T = x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = 4^2 - 2 \\cdot 2 = 16 - 4 = ${res}$.`,
        rubricSteps: [
          { step: 'Áp dụng định lí Viète tìm tổng và tích hai nghiệm', points: 0.5 },
          { step: 'Biến đổi x1^2 + x2^2 = S^2 - 2P và tính ra kết quả', points: 0.5 },
        ],
        keyFormula: '$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2$',
      };
    },
  },

  {
    id: 'T_G9_C4_MED_03',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C4',
    lesson: 'Đồ thị Parabol y = ax²',
    topic: 'Tọa độ giao điểm của parabol và đường thẳng',
    problemType: 'Phương trình hoành độ giao điểm',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // (P): y = x^2, (d): y = 2x + 3 => x^2 - 2x - 3 = 0 => x = -1 (y=1), x = 3 (y=9)
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$(-1; 1)$ và $(3; 9)$',
        [
          { text: '$(1; 1)$ và $(-3; 9)$', errorType: 'SAI_DẤU_HOÀNH_ĐỘ' },
          { text: '$(-1; -1)$ và $(3; 6)$', errorType: 'TÍNH_SAI_TUNG_ĐỘ' },
          { text: '$(2; 4)$ và $(-1; 1)$', errorType: 'SAI_NGHIỆM' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C4',
        lesson: 'Đồ thị Parabol y = ax²',
        topic: 'Tọa độ giao điểm của parabol và đường thẳng',
        problemType: 'Phương trình hoành độ giao điểm',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: `Tọa độ giao điểm của parabol $(P): y = x^2$ và đường thẳng $(d): y = 2x + 3$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Phương trình hoành độ giao điểm giữa $(P)$ và $(d)$:\n$x^2 = 2x + 3 \\Leftrightarrow x^2 - 2x - 3 = 0$.\nVì $a - b + c = 1 - (-2) + (-3) = 0$ nên phương trình có hai nghiệm:\n$x_1 = -1 \\Rightarrow y_1 = (-1)^2 = 1 \\Rightarrow (-1; 1)$.\n$x_2 = 3 \\Rightarrow y_2 = 3^2 = 9 \\Rightarrow (3; 9)$.`,
        rubricSteps: [{ step: 'Lập phương trình hoành độ giao điểm và tìm tọa độ hai giao điểm', points: 0.5 }],
        keyFormula: 'Hoành độ giao điểm: $ax^2 = mx + n$',
      };
    },
  },

  {
    id: 'T_G9_C4_MED_04',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C4',
    lesson: 'Đồ thị Parabol y = ax²',
    topic: 'Quỹ đạo parabol trong đời sống',
    problemType: 'Mô hình hóa vòm cổng parabol',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Cổng parabol có dạng y = -a x^2. Rộng 4m, cao 4m.
      // Trục đối xứng là Oy. Gốc O tại đỉnh cổng => Điểm chân cổng là (2, -4) => -4 = -a * 4 => a = 1.
      // y = -x^2. Tại x = 1m (cách tâm 1m) thì y = -1m => độ cao từ mặt đất là 4 - 1 = 3m.
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C4',
        lesson: 'Đồ thị Parabol y = ax²',
        topic: 'Quỹ đạo parabol trong đời sống',
        problemType: 'Mô hình hóa vòm cổng parabol',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Một chiếc cổng hình parabol có chiều rộng ở chân cổng là $4$ m và chiều cao từ mặt đất đến đỉnh vòm cổng là $4$ m. Hãy tính độ cao của vòm cổng tại vị trí cách tâm đường đi (trục đối xứng) một khoảng $1$ m.`,
        correctAnswer: '3',
        acceptedAnswers: ['3', '3 m'],
        solution: `Chọn hệ trục tọa độ $Oxy$ với gốc tọa độ $O$ tại đỉnh cổng parabol, trục tung $Oy$ hướng xuống dưới.\nPhương trình parabol có dạng $y = ax^2$ ($a > 0$).\nChân cổng có độ rộng $4$ m, nghĩa là cách trục đối xứng $2$ m, và có độ sâu tương ứng $y = 4$ m.\nThay điểm $(2; 4)$ vào phương trình: $4 = a \\cdot 2^2 \\Rightarrow a = 1 \\Rightarrow y = x^2$.\nTại vị trí cách trục đối xứng $x = 1$ m:\n$y = 1^2 = 1$ m (cách đỉnh vòm cổng $1$ m).\nVậy độ cao của cổng tại điểm đó so với mặt đất là: $4 - 1 = 3$ m.`,
        rubricSteps: [
          { step: 'Chọn hệ trục tọa độ và xác định phương trình parabol của cổng', points: 0.5 },
          { step: 'Tính tung độ tại x = 1m và suy ra chiều cao cách mặt đất', points: 0.5 },
        ],
        keyFormula: '$y = ax^2$',
      };
    },
  },

  {
    id: 'T_G9_C4_HARD_01',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C4',
    lesson: 'Định lí Viète và ứng dụng',
    topic: 'Tìm tham số m để phương trình thỏa mãn hệ thức nghiệm',
    problemType: 'Ứng dụng Viète với tham số m',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // x^2 - 2(m-1)x + 2m - 5 = 0.
      // Delta' = (m-1)^2 - (2m - 5) = m^2 - 2m + 1 - 2m + 5 = m^2 - 4m + 6 = (m-2)^2 + 2 > 0 với mọi m.
      // Tìm m để x1 + x2 + 2x1x2 = 6 => 2(m-1) + 2(2m - 5) = 6 => 2m - 2 + 4m - 10 = 6 => 6m = 18 => m = 3.
      const mVal = 3;

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C4',
        lesson: 'Định lí Viète và ứng dụng',
        topic: 'Tìm tham số m để phương trình thỏa mãn hệ thức nghiệm',
        problemType: 'Ứng dụng Viète với tham số m',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Cho phương trình $x^2 - 2(m - 1)x + 2m - 5 = 0$. Tìm giá trị của $m$ để hai nghiệm $x_1, x_2$ của phương trình thỏa mãn hệ thức: $x_1 + x_2 + 2x_1 x_2 = 6$.`,
        correctAnswer: `${mVal}`,
        acceptedAnswers: [`m = ${mVal}`, `${mVal}`],
        solution: `Bước 1: Xét $\\Delta\' = (m - 1)^2 - (2m - 5) = m^2 - 4m + 6 = (m - 2)^2 + 2 > 0$ với mọi $m$.\nDo đó phương trình luôn có hai nghiệm phân biệt với mọi $m$.\nBước 2: Theo định lí Viète:\n$\\begin{cases} x_1 + x_2 = 2(m - 1) \\\\ x_1 x_2 = 2m - 5 \\end{cases}$\nThay vào hệ thức:\n$2(m - 1) + 2(2m - 5) = 6 \\Leftrightarrow 2m - 2 + 4m - 10 = 6 \\Leftrightarrow 6m - 12 = 6 \\Leftrightarrow 6m = 18 \\Leftrightarrow m = ${mVal}$.\nVậy $m = ${mVal}$ là giá trị cần tìm.`,
        rubricSteps: [
          { step: 'Tính Delta phẩy và chứng minh phương trình luôn có hai nghiệm phân biệt', points: 0.5 },
          { step: 'Áp dụng định lí Viète thay vào hệ thức và giải tìm m', points: 0.5 },
        ],
        keyFormula: 'Kiểm tra $\\Delta \\ge 0$ trước khi áp dụng định lí Viète.',
      };
    },
  },

  {
    id: 'T_G9_C4_HARD_02',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C4',
    lesson: 'Đồ thị Parabol y = ax²',
    topic: 'Vị trí tương đối của đường thẳng và parabol',
    problemType: 'Tìm m để đường thẳng tiếp xúc parabol',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // (P): y = x^2, (d): y = 2x + m. Tiếp xúc => Delta' = 0 => 1 - (-m) = 1 + m = 0 => m = -1
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C4',
        lesson: 'Đồ thị Parabol y = ax²',
        topic: 'Vị trí tương đối của đường thẳng và parabol',
        problemType: 'Tìm m để đường thẳng tiếp xúc parabol',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Tìm tham số $m$ để đường thẳng $(d): y = 2x + m$ tiếp xúc với parabol $(P): y = x^2$.`,
        correctAnswer: 'm = -1',
        acceptedAnswers: ['m = -1', '-1'],
        solution: `Phương trình hoành độ giao điểm của $(P)$ và $(d)$:\n$x^2 = 2x + m \\Leftrightarrow x^2 - 2x - m = 0$.\nĐường thẳng $(d)$ tiếp xúc với parabol $(P)$ khi và chỉ khi phương trình hoành độ giao điểm có nghiệm kép:\n$\\Delta\' = (-1)^2 - 1 \\cdot (-m) = 1 + m = 0 \\Leftrightarrow m = -1$.\nVậy với $m = -1$ thì $(d)$ tiếp xúc với $(P)$ tại điểm có hoành độ $x = 1$.`,
        rubricSteps: [
          { step: 'Lập phương trình hoành độ giao điểm', points: 0.5 },
          { step: 'Đặt điều kiện Delta = 0 cho trường hợp tiếp xúc và giải tìm m', points: 0.5 },
        ],
        keyFormula: '$(d)$ tiếp xúc $(P) \\Leftrightarrow \\Delta = 0$',
      };
    },
  },

  {
    id: 'T_G9_C4_HARD_03',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C4',
    lesson: 'Định lí Viète và ứng dụng',
    topic: 'Lập phương trình bậc hai nhận hai số cho trước làm nghiệm',
    problemType: 'Tìm hai số biết tổng và tích',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // u = 3, v = 5 => S = 8, P = 15 => X^2 - 8X + 15 = 0
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$X^2 - 8X + 15 = 0$',
        [
          { text: '$X^2 + 8X + 15 = 0$', errorType: 'SAI_DẤU_TỔNG' },
          { text: '$X^2 - 15X + 8 = 0$', errorType: 'HOÁN_VỊ_TỔNG_VÀ_TÍCH' },
          { text: '$X^2 - 8X - 15 = 0$', errorType: 'SAI_DẤU_TÍCH' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C4',
        lesson: 'Định lí Viète và ứng dụng',
        topic: 'Lập phương trình bậc hai nhận hai số cho trước làm nghiệm',
        problemType: 'Tìm hai số biết tổng và tích',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: `Hai số có tổng $S = 8$ và tích $P = 15$ là nghiệm của phương trình bậc hai nào sau đây?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Nếu hai số có tổng bằng $S$ và tích bằng $P$ (với $S^2 - 4P \\ge 0$) thì hai số đó là hai nghiệm của phương trình:\n$X^2 - SX + P = 0 \\Rightarrow X^2 - 8X + 15 = 0$.`,
        rubricSteps: [{ step: 'Áp dụng định lí đảo Viète lập phương trình bậc hai X^2 - SX + P = 0', points: 0.5 }],
        keyFormula: '$X^2 - SX + P = 0$',
      };
    },
  },

  {
    id: 'T_G9_C4_HARD_04',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C4',
    lesson: 'Đồ thị Parabol y = ax²',
    topic: 'Bài toán cực trị kinh tế',
    problemType: 'Tìm mức giá để doanh thu lớn nhất',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Doanh thu R(x) = -2x^2 + 40x. Max tại x = -b/(2a) = -40 / (-4) = 10. Max = -2(100) + 400 = 200 triệu.
      const optX = 10;
      const maxR = 200;

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C4',
        lesson: 'Đồ thị Parabol y = ax²',
        topic: 'Bài toán cực trị kinh tế',
        problemType: 'Tìm mức giá để doanh thu lớn nhất',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Một cửa hàng kinh doanh ước tính doanh thu hàng tuần $R$ (triệu đồng) theo mức giảm giá $x$ (nghìn đồng) thỏa mãn hàm số bậc hai: $R(x) = -2x^2 + 40x$. Hãy tìm mức giảm giá $x$ để cửa hàng đạt doanh thu lớn nhất và tính doanh thu cực đại đó.`,
        correctAnswer: `x = ${optX}, R_max = ${maxR}`,
        acceptedAnswers: [
          `x = ${optX}, R_max = ${maxR}`,
          `x = ${optX}, ${maxR}`,
          `${optX} và ${maxR}`,
        ],
        solution: `Biểu thức doanh thu là tam thức bậc hai có hệ số $a = -2 < 0$, nên đạt giá trị lớn nhất tại đỉnh parabol:\n$x = -\\frac{b}{2a} = -\\frac{40}{2 \\cdot (-2)} = ${optX}$ (nghìn đồng).\nDoanh thu lớn nhất đạt được là:\n$R_{\\max} = -2 \\cdot (${optX})^2 + 40 \\cdot (${optX}) = -200 + 400 = ${maxR}$ (triệu đồng).`,
        rubricSteps: [
          { step: 'Xác định hoành độ đỉnh parabol x = -b / (2a)', points: 0.5 },
          { step: 'Tính ra mức giảm giá tối ưu và doanh thu cực đại tương ứng', points: 0.5 },
        ],
        keyFormula: 'Đỉnh Parabol: $x_0 = -\\frac{b}{2a}$',
      };
    },
  },

  // ----------------------------------------------------------------------------
  // CHƯƠNG 5: TỨ GIÁC NỘI TIẾP & HÌNH KHỐI (G9_C5) - HK2
  // ----------------------------------------------------------------------------
  {
    id: 'T_G9_C5_EASY_01',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Góc ở tâm và góc nội tiếp',
    topic: 'Liên hệ giữa góc nội tiếp và góc ở tâm',
    problemType: 'Tính số đo góc nội tiếp cùng chắn một cung',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const centerAngle = rng.nextInt(3, 7) * 20; // 60, 80, 100, 120...
      const inscribedAngle = centerAngle / 2;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${inscribedAngle}^\\circ$`,
        [
          { text: `$${centerAngle}^\\circ$`, errorType: 'BẰNG_GÓC_Ở_TÂM' },
          { text: `$${centerAngle * 2}^\\circ$`, errorType: 'GẤP_ĐÔI_GÓC_Ở_TÂM' },
          { text: `$${180 - centerAngle}^\\circ$`, errorType: 'GÓC_BÙ' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Góc ở tâm và góc nội tiếp',
        topic: 'Liên hệ giữa góc nội tiếp và góc ở tâm',
        problemType: 'Tính số đo góc nội tiếp cùng chắn một cung',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Trong đường tròn $(O)$, nếu góc ở tâm $\\widehat{AOB} = ${centerAngle}^\\circ$ thì góc nội tiếp $\\widehat{ACB}$ cùng chắn cung nhỏ $AB$ có số đo là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Số đo của góc nội tiếp bằng nửa số đo của góc ở tâm cùng chắn một cung:\n$\\widehat{ACB} = \\frac{1}{2} \\widehat{AOB} = \\frac{1}{2} \\cdot ${centerAngle}^\\circ = ${inscribedAngle}^\\circ$.`,
        rubricSteps: [{ step: 'Áp dụng định lí góc nội tiếp bằng nửa góc ở tâm cùng chắn một cung', points: 0.5 }],
        keyFormula: '$\\widehat{\\text{nội tiếp}} = \\frac{1}{2} \\widehat{\\text{ở tâm}}$',
      };
    },
  },

  {
    id: 'T_G9_C5_EASY_02',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Tứ giác nội tiếp đường tròn',
    topic: 'Tổng hai góc đối của tứ giác nội tiếp',
    problemType: 'Tính góc đối diện trong tứ giác nội tiếp',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const angleA = rng.nextInt(70, 110);
      const angleC = 180 - angleA;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${angleC}^\\circ$`,
        [
          { text: `$${angleA}^\\circ$`, errorType: 'BẰNG_GÓC_ĐỐI' },
          { text: `$${360 - angleA}^\\circ$`, errorType: 'TRỪ_CHO_360' },
          { text: `$${90 - angleA / 2}^\\circ$`, errorType: 'TÍNH_SAI' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Tứ giác nội tiếp đường tròn',
        topic: 'Tổng hai góc đối của tứ giác nội tiếp',
        problemType: 'Tính góc đối diện trong tứ giác nội tiếp',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Cho tứ giác $ABCD$ nội tiếp đường tròn. Biết $\\widehat{A} = ${angleA}^\\circ$. Số đo của góc đối diện $\\widehat{C}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Trong một tứ giác nội tiếp, tổng hai góc đối diện luôn bằng $180^\\circ$:\n$\\widehat{A} + \\widehat{C} = 180^\\circ \\Rightarrow \\widehat{C} = 180^\\circ - \\widehat{A} = 180^\\circ - ${angleA}^\\circ = ${angleC}^\\circ$.`,
        rubricSteps: [{ step: 'Áp dụng định lí tổng hai góc đối diện bằng 180 độ', points: 0.5 }],
        keyFormula: '$\\widehat{A} + \\widehat{C} = 180^\\circ$',
      };
    },
  },

  {
    id: 'T_G9_C5_EASY_03',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Hình trụ, Hình nón và Hình cầu',
    topic: 'Thể tích hình trụ',
    problemType: 'Tính thể tích hình trụ',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const r = rng.nextInt(2, 5);
      const h = rng.nextInt(4, 10);
      const vol = r * r * h;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${vol}\\pi$ $\\text{cm}^3$`,
        [
          { text: `$${2 * r * h}\\pi$ $\\text{cm}^3$`, errorType: 'NHẦM_VỚI_DIỆN_TÍCH_XUNG_QUANH' },
          { text: `$${Math.round(vol / 3)}\\pi$ $\\text{cm}^3$`, errorType: 'NHẦM_VỚI_HÌNH_NÓN' },
          { text: `$${vol * 2}\\pi$ $\\text{cm}^3$`, errorType: 'NHÂN_THỪA_2' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Hình trụ, Hình nón và Hình cầu',
        topic: 'Thể tích hình trụ',
        problemType: 'Tính thể tích hình trụ',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Một hình trụ có bán kính đáy $r = ${r}$ cm và chiều cao $h = ${h}$ cm. Thể tích của hình trụ đó là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Thể tích hình trụ được tính theo công thức:\n$V = \\pi r^2 h = \\pi \\cdot ${r}^2 \\cdot ${h} = ${vol}\\pi$ $\\text{cm}^3$.`,
        rubricSteps: [{ step: 'Áp dụng công thức V = pi * r^2 * h', points: 0.5 }],
        keyFormula: '$V = \\pi r^2 h$',
      };
    },
  },

  {
    id: 'T_G9_C5_EASY_04',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Hình trụ, Hình nón và Hình cầu',
    topic: 'Diện tích xung quanh hình nón',
    problemType: 'Tính diện tích xung quanh theo bán kính và đường sinh',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const r = rng.nextInt(3, 6);
      const l = rng.nextInt(7, 12);
      const sXq = r * l;

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Hình trụ, Hình nón và Hình cầu',
        topic: 'Diện tích xung quanh hình nón',
        problemType: 'Tính diện tích xung quanh theo bán kính và đường sinh',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Một chiếc nón lá hình nón có bán kính đáy $r = ${r}$ cm và độ dài đường sinh $l = ${l}$ cm. Tính diện tích xung quanh của chiếc nón lá (để kết quả theo $\\pi$).`,
        correctAnswer: `${sXq}\\pi`,
        acceptedAnswers: [
          `${sXq}\\pi`,
          `${sXq}pi`,
          `${sXq}*pi`,
        ],
        solution: `Diện tích xung quanh của hình nón là:\n$S_{xq} = \\pi r l = \\pi \\cdot ${r} \\cdot ${l} = ${sXq}\\pi$ $\\text{cm}^2$.`,
        rubricSteps: [
          { step: 'Nêu công thức diện tích xung quanh hình nón S = pi * r * l', points: 0.5 },
          { step: 'Thay số và tính ra kết quả chính xác theo pi', points: 0.5 },
        ],
        keyFormula: '$S_{xq} = \\pi r l$',
      };
    },
  },

  {
    id: 'T_G9_C5_MED_01',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Tứ giác nội tiếp đường tròn',
    topic: 'Dấu hiệu nhận biết tứ giác nội tiếp',
    problemType: 'Hai đỉnh kề cùng nhìn một cạnh',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Hai đỉnh kề nhau cùng nhìn cạnh chứa hai đỉnh còn lại dưới hai góc bằng nhau',
        [
          { text: 'Có hai đường chéo bằng nhau và vuông góc', errorType: 'TÍNH_CHẤT_HÌNH_VUÔNG' },
          { text: 'Tổng hai góc kề nhau bằng 180 độ', errorType: 'TÍNH_CHẤT_HÌNH_BÌNH_HÀNH' },
          { text: 'Bốn cạnh có độ dài bằng nhau', errorType: 'TÍNH_CHẤT_HÌNH_THOI' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Tứ giác nội tiếp đường tròn',
        topic: 'Dấu hiệu nhận biết tứ giác nội tiếp',
        problemType: 'Hai đỉnh kề cùng nhìn một cạnh',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Khẳng định nào sau đây là một dấu hiệu ĐÚNG để chứng minh một tứ giác nội tiếp đường tròn?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Tứ giác có hai đỉnh kề nhau cùng nhìn cạnh chứa hai đỉnh còn lại dưới hai góc bằng nhau thì nội tiếp được trong một đường tròn.`,
        rubricSteps: [{ step: 'Nhận biết đúng dấu hiệu hai đỉnh kề cùng nhìn một cạnh', points: 0.5 }],
        keyFormula: 'Dấu hiệu góc nhìn: $\\widehat{DAC} = \\widehat{DBC} \\Rightarrow ABCD$ nội tiếp.',
      };
    },
  },

  {
    id: 'T_G9_C5_MED_02',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Hình trụ, Hình nón và Hình cầu',
    topic: 'Thể tích hình cầu',
    problemType: 'Tính thể tích mặt cầu theo bán kính',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const r = 3;
      // V = 4/3 * pi * r^3 = 4/3 * pi * 27 = 36 pi
      const vol = 36;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${vol}\\pi$ $\\text{cm}^3$`,
        [
          { text: `$${vol * 3}\\pi$ $\\text{cm}^3$`, errorType: 'QUÊN_CHIA_CHO_3' },
          { text: `$${vol / 2}\\pi$ $\\text{cm}^3$`, errorType: 'TÍNH_NHẦM' },
          { text: `$${4 * r * r}\\pi$ $\\text{cm}^3$`, errorType: 'NHẦM_VỚI_DIỆN_TÍCH_MẶT_CẦU' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Hình trụ, Hình nón và Hình cầu',
        topic: 'Thể tích hình cầu',
        problemType: 'Tính thể tích mặt cầu theo bán kính',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Thể tích của quả cầu có bán kính $R = ${r}$ cm bằng:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Thể tích hình cầu được tính theo công thức:\n$V = \\frac{4}{3} \\pi R^3 = \\frac{4}{3} \\pi \\cdot ${r}^3 = \\frac{4}{3} \\pi \\cdot 27 = ${vol}\\pi$ $\\text{cm}^3$.`,
        rubricSteps: [{ step: 'Áp dụng công thức V = 4/3 * pi * R^3', points: 0.5 }],
        keyFormula: '$V = \\frac{4}{3}\\pi R^3$',
      };
    },
  },

  {
    id: 'T_G9_C5_MED_03',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Hình trụ, Hình nón và Hình cầu',
    topic: 'Dung tích bồn chứa nước hình trụ',
    problemType: 'Tính lượng nước chứa trong bể',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Bồn hình trụ có đường kính d = 1m => r = 0.5m, h = 2m => V = pi * 0.25 * 2 = 0.5 pi m3 ~ 1.57 m3 ~ 1570 lít
      const d = 1;
      const h = 2;
      const r = d / 2;
      const vM3 = Math.PI * r * r * h;
      const liters = Math.round(vM3 * 1000);

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Hình trụ, Hình nón và Hình cầu',
        topic: 'Dung tích bồn chứa nước hình trụ',
        problemType: 'Tính lượng nước chứa trong bể',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Một bồn chứa nước hình trụ bằng inox có đường kính đáy là $${d}$ m và chiều cao là $${h}$ m. Hỏi bồn này chứa được tối đa bao nhiêu lít nước? (Lấy $\\pi \\approx 3{,}14$ và biết $1\\text{ m}^3 = 1000$ lít).`,
        correctAnswer: `${liters}`,
        acceptedAnswers: [`${liters}`, `${liters} lít`],
        solution: `Bán kính đáy bồn là: $r = \\frac{${d}}{2} = 0{,}5$ m.\nThể tích của bồn chứa nước hình trụ là:\n$V = \\pi r^2 h = 3{,}14 \\cdot (0{,}5)^2 \\cdot ${h} = 3{,}14 \\cdot 0{,}25 \\cdot 2 = 1{,}57$ $\\text{m}^3$.\nDung tích chứa tối đa của bồn là:\n$1{,}57 \\times 1000 = ${liters}$ lít.`,
        rubricSteps: [
          { step: 'Tính bán kính và thể tích hình trụ bằng m^3', points: 0.5 },
          { step: 'Đổi sang đơn vị lít ra kết quả chính xác', points: 0.5 },
        ],
        keyFormula: '$V = \\pi r^2 h$, $1\\text{ m}^3 = 1000\\text{ lít}$',
      };
    },
  },

  {
    id: 'T_G9_C5_MED_04',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Góc ở tâm và góc nội tiếp',
    topic: 'Góc nội tiếp chắn nửa đường tròn',
    problemType: 'Tính số đo góc chắn nửa đường tròn',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$90^\\circ$',
        [
          { text: '$180^\\circ$', errorType: 'NHẦM_VỚI_SỐ_ĐO_CUNG_NỬA_ĐƯỜNG_TRÒN' },
          { text: '$45^\\circ$', errorType: 'CHIA_ĐÔI_SAI' },
          { text: '$60^\\circ$', errorType: 'TÍNH_NHẦM' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Góc ở tâm và góc nội tiếp',
        topic: 'Góc nội tiếp chắn nửa đường tròn',
        problemType: 'Tính số đo góc chắn nửa đường tròn',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Cho đường tròn $(O)$ có đường kính $AB$. Lấy điểm $C$ bất kì trên đường tròn ($C$ khác $A$ và $B$). Số đo của góc $\\widehat{ACB}$ luôn bằng:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Góc $\\widehat{ACB}$ là góc nội tiếp chắn nửa đường tròn đường kính $AB$, do đó số đo của góc $\\widehat{ACB}$ luôn bằng $90^\\circ$ (tam giác $ABC$ vuông tại $C$).`,
        rubricSteps: [{ step: 'Áp dụng hệ quả góc nội tiếp chắn nửa đường tròn là góc vuông', points: 0.5 }],
        keyFormula: 'Góc nội tiếp chắn nửa đường tròn bằng $90^\\circ$.',
      };
    },
  },

  {
    id: 'T_G9_C5_HARD_01',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Tứ giác nội tiếp đường tròn',
    topic: 'Chứng minh tứ giác nội tiếp có hai góc vuông đối nhau',
    problemType: 'Bài toán hình học tứ giác nội tiếp kinh điển',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Tứ giác nội tiếp đường tròn',
        topic: 'Chứng minh tứ giác nội tiếp có hai góc vuông đối nhau',
        problemType: 'Bài toán hình học tứ giác nội tiếp kinh điển',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Cho tam giác nhọn $ABC$ có hai đường cao $BD$ và $CE$ cắt nhau tại trực tâm $H$. Chứng minh rằng tứ giác $ADHE$ nội tiếp được trong một đường tròn.`,
        correctAnswer: 'Góc ADH + góc AEH = 90 + 90 = 180 độ',
        acceptedAnswers: [
          'Góc ADH + góc AEH = 90 + 90 = 180 độ',
          'Tổng hai góc đối bằng 180 độ',
        ],
        solution: `Vì $BD \\perp AC$ tại $D$ nên $\\widehat{ADH} = 90^\\circ$.\nVì $CE \\perp AB$ tại $E$ nên $\\widehat{AEH} = 90^\\circ$.\nXét tứ giác $ADHE$ có:\n$\\widehat{ADH} + \\widehat{AEH} = 90^\\circ + 90^\\circ = 180^\\circ$.\nTứ giác $ADHE$ có tổng hai góc đối diện bằng $180^\\circ$ nên nội tiếp được trong đường tròn đường kính $AH$.`,
        rubricSteps: [
          { step: 'Chỉ ra hai góc vuông tại D và E do tính chất đường cao', points: 0.5 },
          { step: 'Cộng hai góc đối bằng 180 độ và kết luận tứ giác nội tiếp', points: 0.5 },
        ],
        keyFormula: 'Tứ giác có tổng hai góc đối bằng $180^\\circ$ thì nội tiếp.',
      };
    },
  },

  {
    id: 'T_G9_C5_HARD_02',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Góc ở tâm và góc nội tiếp',
    topic: 'Hệ thức cát tuyến và tiếp tuyến',
    problemType: 'Chứng minh hệ thức MA^2 = MB * MC',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Góc ở tâm và góc nội tiếp',
        topic: 'Hệ thức cát tuyến và tiếp tuyến',
        problemType: 'Chứng minh hệ thức MA^2 = MB * MC',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Từ điểm $M$ ở ngoài đường tròn $(O)$, kẻ tiếp tuyến $MA$ ($A$ là tiếp điểm) và cát tuyến $MBC$ ($B$ nằm giữa $M$ và $C$). Dùng tam giác đồng dạng để chứng minh hệ thức: $MA^2 = MB \\cdot MC$.`,
        correctAnswer: 'Tam giác MAB đồng dạng tam giác MCA (g-g) => MA/MC = MB/MA => MA^2 = MB.MC',
        acceptedAnswers: [
          'Tam giác MAB đồng dạng tam giác MCA (g-g) => MA/MC = MB/MA => MA^2 = MB.MC',
          'MA^2 = MB * MC',
        ],
        solution: `Xét hai tam giác $\\Delta MAB$ và $\\Delta MCA$ có:\n- Góc $\\widehat{M}$ chung;\n- $\\widehat{MAB} = \\widehat{MCA}$ (góc tạo bởi tia tiếp tuyến và dây cung bằng góc nội tiếp cùng chắn cung $AB$).\nDo đó $\\Delta MAB \\backsim \\Delta MCA$ (g - g).\nSuy ra tỉ số: $\\frac{MA}{MC} = \\frac{MB}{MA} \\Rightarrow MA^2 = MB \\cdot MC$.`,
        rubricSteps: [
          { step: 'Chứng minh hai góc bằng nhau chắn cùng một cung', points: 0.5 },
          { step: 'Suy ra tam giác đồng dạng và nhân chéo ra hệ thức', points: 0.5 },
        ],
        keyFormula: '$\\Delta MAB \\backsim \\Delta MCA \\Rightarrow MA^2 = MB \\cdot MC$',
      };
    },
  },

  {
    id: 'T_G9_C5_HARD_03',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Góc ở tâm và góc nội tiếp',
    topic: 'Góc tạo bởi tia tiếp tuyến và dây cung',
    problemType: 'Tính số đo góc tạo bởi tiếp tuyến và dây',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const arc = 80;
      const angle = arc / 2; // 40

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${angle}^\\circ$`,
        [
          { text: `$${arc}^\\circ$`, errorType: 'BẰNG_SỐ_ĐO_CUNG' },
          { text: `$${180 - angle}^\\circ$`, errorType: 'LẤY_GÓC_BÙ' },
          { text: `$${angle * 2}^\\circ$`, errorType: 'NHÂN_ĐÔI' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Góc ở tâm và góc nội tiếp',
        topic: 'Góc tạo bởi tia tiếp tuyến và dây cung',
        problemType: 'Tính số đo góc tạo bởi tiếp tuyến và dây',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: `Cho tiếp tuyến $Ax$ của đường tròn $(O)$ và dây cung $AB$. Biết số đo cung nhỏ $AB$ bằng $${arc}^\\circ$. Số đo của góc tạo bởi tia tiếp tuyến và dây cung $\\widehat{xAB}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Số đo của góc tạo bởi tia tiếp tuyến và dây cung bằng nửa số đo của cung bị chắn:\n$\\widehat{xAB} = \\frac{1}{2} \\text{sđ}\\overparen{AB} = \\frac{1}{2} \\cdot ${arc}^\\circ = ${angle}^\\circ$.`,
        rubricSteps: [{ step: 'Áp dụng định lí số đo góc tạo bởi tiếp tuyến và dây cung bằng nửa số đo cung bị chắn', points: 0.5 }],
        keyFormula: '$\\widehat{\\text{tt - dây}} = \\frac{1}{2} \\text{sđ}\\overparen{AB}$',
      };
    },
  },

  {
    id: 'T_G9_C5_HARD_04',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Hình trụ, Hình nón và Hình cầu',
    topic: 'Thể tích hình nón cụt / phễu lọc',
    problemType: 'Thể tích hình nón',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Chiếc phễu hình nón có r = 6 cm, h = 8 cm => l = 10 cm. V = 1/3 * pi * 36 * 8 = 96 pi cm3
      const r = 6;
      const h = 8;
      const vol = (r * r * h) / 3; // 96

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Hình trụ, Hình nón và Hình cầu',
        topic: 'Thể tích hình nón cụt / phễu lọc',
        problemType: 'Thể tích hình nón',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Một chiếc phễu bằng kim loại hình nón có bán kính miệng phễu là $r = ${r}$ cm và chiều cao là $h = ${h}$ cm. Hãy tính dung tích chứa tối đa của chiếc phễu (để kết quả theo $\\pi$).`,
        correctAnswer: `${vol}\\pi`,
        acceptedAnswers: [
          `${vol}\\pi`,
          `${vol}pi`,
          `${vol}*pi`,
        ],
        solution: `Dung tích tối đa của chiếc phễu bằng thể tích hình nón:\n$V = \\frac{1}{3} \\pi r^2 h = \\frac{1}{3} \\pi \\cdot ${r}^2 \\cdot ${h} = \\frac{1}{3} \\pi \\cdot 36 \\cdot 8 = ${vol}\\pi$ $\\text{cm}^3$.`,
        rubricSteps: [
          { step: 'Áp dụng đúng công thức thể tích hình nón V = 1/3 * pi * r^2 * h', points: 0.5 },
          { step: 'Tính ra dung tích chính xác theo pi kèm đơn vị', points: 0.5 },
        ],
        keyFormula: '$V = \\frac{1}{3} \\pi r^2 h$',
      };
    },
  },

  // ----------------------------------------------------------------------------
  // CHƯƠNG 6: CHUYÊN ĐỀ TỔNG HỢP LUYỆN THI VÀO LỚP 10 THPT (G9_C6) - HK2
  // ----------------------------------------------------------------------------
  {
    id: 'T_G9_C6_EASY_01',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Rút gọn căn thức và câu hỏi phụ',
    topic: 'Tính giá trị biểu thức căn thức tại giá trị cho trước',
    problemType: 'Thay số tính giá trị',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // A = (sqrt(x) + 1) / (sqrt(x) - 1). Tai x = 9 => (3 + 1) / (3 - 1) = 4/2 = 2.
      const xVal = 9;
      const res = 2;

      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$A = ${res}$`,
        [
          { text: '$A = 1$', errorType: 'TÍNH_NHẦM' },
          { text: `$A = ${res + 1}$`, errorType: 'TÍNH_NHẦM' },
          { text: `$A = \\frac{1}{${res}}$`, errorType: 'NGHỊCH_ĐẢO' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Rút gọn căn thức và câu hỏi phụ',
        topic: 'Tính giá trị biểu thức căn thức tại giá trị cho trước',
        problemType: 'Thay số tính giá trị',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Cho biểu thức $A = \\frac{\\sqrt{x} + 1}{\\sqrt{x} - 1}$ (với $x \\ge 0, x \\neq 1$). Giá trị của $A$ tại $x = ${xVal}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Thay $x = ${xVal}$ (thỏa mãn ĐKXĐ) vào biểu thức $A$:\n$A = \\frac{\\sqrt{${xVal}} + 1}{\\sqrt{${xVal}} - 1} = \\frac{3 + 1}{3 - 1} = \\frac{4}{2} = ${res}$.`,
        rubricSteps: [{ step: 'Thay giá trị x vào và tính căn bậc hai số học chính xác', points: 0.5 }],
        keyFormula: 'Thay số cẩn thận và kiểm tra điều kiện xác định.',
      };
    },
  },

  {
    id: 'T_G9_C6_EASY_02',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Parabol và Định lí Viète nâng cao',
    topic: 'Giải phương trình trùng phương',
    problemType: 'Đặt ẩn phụ giải phương trình trùng phương',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // x^4 - 5x^2 + 4 = 0 => t = 1, t = 4 => x = +-1, x = +-2
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$x \\in \\{\\pm 1; \\pm 2\\}$',
        [
          { text: '$x \\in \\{1; 4\\}$', errorType: 'QUÊN_LẤY_CĂN_BẬC_HAI_CỦA_T' },
          { text: '$x \\in \\{\\pm 1\\}$', errorType: 'THIẾU_CẶP_NGHIỆM' },
          { text: '$x \\in \\{\\pm 2\\}$', errorType: 'THIẾU_CẶP_NGHIỆM' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Parabol và Định lí Viète nâng cao',
        topic: 'Giải phương trình trùng phương',
        problemType: 'Đặt ẩn phụ giải phương trình trùng phương',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Tập nghiệm của phương trình trùng phương $x^4 - 5x^2 + 4 = 0$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Đặt $t = x^2$ ($t \\ge 0$). Phương trình trở thành:\n$t^2 - 5t + 4 = 0 \\Leftrightarrow (t - 1)(t - 4) = 0 \\Leftrightarrow \\left[ \\begin{array}{l} t = 1 \\\\ t = 4 \\end{array} \\right.$ (đều thỏa mãn $t \\ge 0$).\nVới $t = 1 \\Rightarrow x^2 = 1 \\Rightarrow x = \\pm 1$.\nVới $t = 4 \\Rightarrow x^2 = 4 \\Rightarrow x = \\pm 2$.\nVậy phương trình có 4 nghiệm: $x \\in \\{\\pm 1; \\pm 2\\}$.`,
        rubricSteps: [{ step: 'Đặt t = x^2, giải phương trình bậc hai theo t rồi suy ra x', points: 0.5 }],
        keyFormula: '$ax^4 + bx^2 + c = 0 \\xrightarrow{t = x^2 \\ge 0} at^2 + bt + c = 0$',
      };
    },
  },

  {
    id: 'T_G9_C6_EASY_03',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Rút gọn căn thức và câu hỏi phụ',
    topic: 'Tìm x để biểu thức nhận giá trị âm',
    problemType: 'Bất phương trình căn thức đơn giản',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // (sqrt(x) - 2) / (sqrt(x) + 3) < 0 => sqrt(x) - 2 < 0 vì mẫu > 0 => 0 <= x < 4
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$0 \\le x < 4$',
        [
          { text: '$x < 4$', errorType: 'QUÊN_ĐIỀU_KIỆN_X_KHÔNG_ÂM' },
          { text: '$x > 4$', errorType: 'NGƯỢC_DẤU' },
          { text: '$-9 < x < 4$', errorType: 'GIẢI_SAI_MẪU' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Rút gọn căn thức và câu hỏi phụ',
        topic: 'Tìm x để biểu thức nhận giá trị âm',
        problemType: 'Bất phương trình căn thức đơn giản',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Tìm các giá trị của $x$ để biểu thức $P = \\frac{\\sqrt{x} - 2}{\\sqrt{x} + 3}$ (với $x \\ge 0$) nhận giá trị âm:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `ĐKXĐ: $x \\ge 0$.\nVì $x \\ge 0$ nên $\\sqrt{x} \\ge 0 \\Rightarrow \\sqrt{x} + 3 > 0$ với mọi $x \\ge 0$.\nDo đó $P < 0 \\Leftrightarrow \\sqrt{x} - 2 < 0 \\Leftrightarrow \\sqrt{x} < 2 \\Leftrightarrow x < 4$.\nKết hợp với ĐKXĐ $x \\ge 0$, ta được: $0 \\le x < 4$.`,
        rubricSteps: [{ step: 'Đánh giá dấu của mẫu số và kết hợp điều kiện không âm của x', points: 0.5 }],
        keyFormula: 'Biểu thức $< 0 \\Leftrightarrow$ tử và mẫu trái dấu.',
      };
    },
  },

  {
    id: 'T_G9_C6_EASY_04',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Parabol và Định lí Viète nâng cao',
    topic: 'Giải hệ phương trình quy về bậc nhất ôn thi vào 10',
    problemType: 'Hệ phương trình đặt ẩn phụ',
    difficulty: 'easy',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // 2/x + 1/y = 5; 1/x - 1/y = 1 => 3/x = 6 => 1/x = 2 => x = 1/2; 1/y = 1 => y = 1
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Parabol và Định lí Viète nâng cao',
        topic: 'Giải hệ phương trình quy về bậc nhất ôn thi vào 10',
        problemType: 'Hệ phương trình đặt ẩn phụ',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Giải hệ phương trình sau với $x \\neq 0$ và $y \\neq 0$:\n$$\\begin{cases} \\frac{2}{x} + \\frac{1}{y} = 5 \\\\ \\frac{1}{x} - \\frac{1}{y} = 1 \\end{cases}$$`,
        correctAnswer: '(1/2; 1)',
        acceptedAnswers: [
          '(1/2; 1)',
          'x = 1/2, y = 1',
          'x = 0.5, y = 1',
        ],
        solution: `Đặt $u = \\frac{1}{x}$ và $v = \\frac{1}{y}$ ($u, v \\neq 0$). Hệ phương trình trở thành:\n$\\begin{cases} 2u + v = 5 \\\\ u - v = 1 \\end{cases}$\nCộng hai phương trình: $3u = 6 \\Rightarrow u = 2$.\nThay vào: $2 - v = 1 \\Rightarrow v = 1$.\nSuy ra:\n$\\frac{1}{x} = 2 \\Rightarrow x = \\frac{1}{2}$;\n$\\frac{1}{y} = 1 \\Rightarrow y = 1$.\nVậy nghiệm của hệ là $(x; y) = \\left( \\frac{1}{2}; 1 \\right)$.`,
        rubricSteps: [
          { step: 'Đặt ẩn phụ u = 1/x, v = 1/y và giải tìm u, v', points: 0.5 },
          { step: 'Nghịch đảo tìm ra nghiệm x, y thỏa mãn điều kiện', points: 0.5 },
        ],
        keyFormula: 'Đặt ẩn phụ $u = 1/x, v = 1/y$',
      };
    },
  },

  {
    id: 'T_G9_C6_MED_01',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Rút gọn căn thức và câu hỏi phụ',
    topic: 'Rút gọn biểu thức tổng hợp thi vào 10',
    problemType: 'Rút gọn biểu thức phân thức căn bậc hai',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // M = (sqrt(x)/(sqrt(x)+2) + 2/(sqrt(x)-2)) : (x+4)/(x-4)
      // trong ngoac = (x - 2sqrt(x) + 2sqrt(x) + 4)/(x-4) = (x+4)/(x-4)
      // => M = 1
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Rút gọn căn thức và câu hỏi phụ',
        topic: 'Rút gọn biểu thức tổng hợp thi vào 10',
        problemType: 'Rút gọn biểu thức phân thức căn bậc hai',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Rút gọn biểu thức sau với $x \\ge 0, x \\neq 4$:\n$$M = \\left( \\frac{\\sqrt{x}}{\\sqrt{x} + 2} + \\frac{2}{\\sqrt{x} - 2} \\right) : \\frac{x + 4}{x - 4}$$`,
        correctAnswer: '1',
        acceptedAnswers: ['1'],
        solution: `Quy đồng mẫu thức trong ngoặc với mẫu chung là $(\\sqrt{x} + 2)(\\sqrt{x} - 2) = x - 4$:\n$\\frac{\\sqrt{x}(\\sqrt{x} - 2) + 2(\\sqrt{x} + 2)}{x - 4} = \\frac{x - 2\\sqrt{x} + 2\\sqrt{x} + 4}{x - 4} = \\frac{x + 4}{x - 4}$.\nThực hiện phép chia:\n$M = \\frac{x + 4}{x - 4} : \\frac{x + 4}{x - 4} = 1$.`,
        rubricSteps: [
          { step: 'Quy đồng và thu gọn biểu thức trong ngoặc thành (x + 4)/(x - 4)', points: 0.5 },
          { step: 'Nhân nghịch đảo và rút gọn ra kết quả 1', points: 0.5 },
        ],
        keyFormula: '$(\\sqrt{x} - 2)(\\sqrt{x} + 2) = x - 4$',
      };
    },
  },

  {
    id: 'T_G9_C6_MED_02',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Parabol và Định lí Viète nâng cao',
    topic: 'Vị trí tương đối của Parabol và đường thẳng ôn thi vào 10',
    problemType: 'Tìm m để đường thẳng cắt parabol tại hai điểm phân biệt',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // (P): y = x^2, (d): y = 2x - m. Cắt tại hai điểm pb <=> Delta' > 0 <=> 1 - (-(-m)) = 1 - m > 0 <=> m < 1
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$m < 1$',
        [
          { text: '$m > 1$', errorType: 'NGƯỢC_DẤU' },
          { text: '$m \\le 1$', errorType: 'THỪA_DẤU_BẰNG_TIẾP_XÚC' },
          { text: '$m = 1$', errorType: 'ĐIỀU_KIỆN_TIẾP_XÚC' },
        ]
      );

      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Parabol và Định lí Viète nâng cao',
        topic: 'Vị trí tương đối của Parabol và đường thẳng ôn thi vào 10',
        problemType: 'Tìm m để đường thẳng cắt parabol tại hai điểm phân biệt',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Tìm tham số $m$ để đường thẳng $(d): y = 2x - m$ cắt parabol $(P): y = x^2$ tại hai điểm phân biệt:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Phương trình hoành độ giao điểm: $x^2 - 2x + m = 0$.\nĐể $(d)$ cắt $(P)$ tại hai điểm phân biệt thì phương trình trên phải có hai nghiệm phân biệt:\n$\\Delta\' = (-1)^2 - 1 \\cdot m = 1 - m > 0 \\Leftrightarrow m < 1$.`,
        rubricSteps: [{ step: 'Lập phương trình hoành độ và đặt Delta > 0 tìm m', points: 0.5 }],
        keyFormula: 'Hai giao điểm phân biệt $\\Leftrightarrow \\Delta > 0$',
      };
    },
  },

  {
    id: 'T_G9_C6_MED_03',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Hình học tổng hợp Đường tròn',
    topic: 'Chứng minh tứ giác nội tiếp đề thi vào 10',
    problemType: 'Tứ giác nội tiếp và chứng minh góc bằng nhau',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Hình học tổng hợp Đường tròn',
        topic: 'Chứng minh tứ giác nội tiếp đề thi vào 10',
        problemType: 'Tứ giác nội tiếp và chứng minh góc bằng nhau',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Cho tứ giác $ABCD$ nội tiếp đường tròn $(O)$. Tia $AB$ cắt tia $DC$ tại điểm $M$. Chứng minh rằng hai tam giác $MAD$ và $MCB$ đồng dạng với nhau.`,
        correctAnswer: 'Tam giác MAD đồng dạng MCB (g-g) vì góc M chung và góc MDA = góc MBC',
        acceptedAnswers: [
          'Tam giác MAD đồng dạng MCB (g-g) vì góc M chung và góc MDA = góc MBC',
          'Đồng dạng trường hợp góc - góc',
        ],
        solution: `Xét tứ giác $ABCD$ nội tiếp đường tròn $(O)$:\nTa có $\\widehat{MDA} + \\widehat{ABC} = 180^\\circ$ (hai góc đối diện).\nMặt khác $\\widehat{MBC} + \\widehat{ABC} = 180^\\circ$ (hai góc kề bù).\nSuy ra $\\widehat{MDA} = \\widehat{MBC}$.\nXét $\\Delta MAD$ và $\\Delta MCB$ có:\n- Góc $\\widehat{M}$ chung;\n- $\\widehat{MDA} = \\widehat{MBC}$ (chứng minh trên).\nDo đó $\\Delta MAD \\backsim \\Delta MCB$ (g - g).`,
        rubricSteps: [
          { step: 'Chứng minh góc ngoài tại một đỉnh bằng góc trong đỉnh đối diện', points: 0.5 },
          { step: 'Chỉ ra góc M chung và kết luận hai tam giác đồng dạng', points: 0.5 },
        ],
        keyFormula: 'Góc ngoài tứ giác nội tiếp bằng góc trong ở đỉnh đối diện.',
      };
    },
  },

  {
    id: 'T_G9_C6_MED_04',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Rút gọn căn thức và câu hỏi phụ',
    topic: 'Toán thực tế tuyển sinh vào 10',
    problemType: 'Bài toán tăng trưởng kế hoạch sản xuất',
    difficulty: 'medium',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Theo kế hoạch làm 600 sản phẩm trong x ngày. Thực tế mỗi ngày làm thêm 10 sp nên xong sớm 3 ngày.
      // 600/x - 600/(x+10) = 3 => x^2 + 10x - 2000 = 0 => (x-40)(x+50) = 0 => x = 40 sp/ngày, thời gian 15 ngày.
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Rút gọn căn thức và câu hỏi phụ',
        topic: 'Toán thực tế tuyển sinh vào 10',
        problemType: 'Bài toán tăng trưởng kế hoạch sản xuất',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Một xưởng may theo kế hoạch phải may $600$ bộ quần áo trong một thời gian quy định. Nhờ cải tiến kỹ thuật, mỗi ngày xưởng đã may được nhiều hơn kế hoạch $10$ bộ quần áo, do đó không những đã hoàn thành sớm hơn kế hoạch $3$ ngày mà còn may thêm được $20$ bộ quần áo nữa. Hỏi theo kế hoạch, mỗi ngày xưởng phải may bao nhiêu bộ quần áo?`,
        correctAnswer: '40',
        acceptedAnswers: ['40', '40 bộ'],
        solution: `Gọi số bộ quần áo xưởng may trong 1 ngày theo kế hoạch là $x$ ($x \\in \\mathbb{N}^*$, bộ quần áo).\nThời gian theo kế hoạch là: $\\frac{600}{x}$ (ngày).\nThực tế mỗi ngày may được: $x + 10$ (bộ).\nTổng số bộ may được thực tế là: $600 + 20 = 620$ (bộ).\nThời gian thực tế may là: $\\frac{620}{x + 10}$ (ngày).\nVì hoàn thành sớm hơn $3$ ngày nên ta có phương trình:\n$\\frac{600}{x} - \\frac{620}{x + 10} = 3 \\Leftrightarrow 600(x + 10) - 620x = 3x(x + 10)$\n$\\Leftrightarrow 3x^2 + 50x - 6000 = 0 \\Leftrightarrow (x - 40)(3x + 150) = 0$.\nVì $x > 0$ nên $x = 40$.\nVậy theo kế hoạch mỗi ngày xưởng phải may $40$ bộ quần áo.`,
        rubricSteps: [
          { step: 'Chọn ẩn, đặt điều kiện và biểu diễn thời gian kế hoạch và thực tế', points: 0.3 },
          { step: 'Lập phương trình chênh lệch thời gian', points: 0.4 },
          { step: 'Giải phương trình bậc hai và kết luận năng suất kế hoạch', points: 0.3 },
        ],
        keyFormula: '$t = \\frac{\\text{khối lượng công việc}}{\\text{năng suất ngày}}$',
      };
    },
  },

  {
    id: 'T_G9_C6_HARD_01',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Rút gọn căn thức và câu hỏi phụ',
    topic: 'Tìm x nguyên để biểu thức nhận giá trị nguyên (đề thi vào 10)',
    problemType: 'Giá trị nguyên của biểu thức chứa căn',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // P = (sqrt(x) + 5) / (sqrt(x) + 1) = 1 + 4 / (sqrt(x) + 1)
      // sqrt(x) + 1 la uoc nguyen duong cua 4: {1, 2, 4}
      // sqrt(x) + 1 = 1 => sqrt(x) = 0 => x = 0
      // sqrt(x) + 1 = 2 => sqrt(x) = 1 => x = 1
      // sqrt(x) + 1 = 4 => sqrt(x) = 3 => x = 9
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Rút gọn căn thức và câu hỏi phụ',
        topic: 'Tìm x nguyên để biểu thức nhận giá trị nguyên (đề thi vào 10)',
        problemType: 'Giá trị nguyên của biểu thức chứa căn',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Tìm các giá trị nguyên của $x$ để biểu thức $P = \\frac{\\sqrt{x} + 5}{\\sqrt{x} + 1}$ nhận giá trị nguyên.`,
        correctAnswer: 'x in {0, 1, 9}',
        acceptedAnswers: [
          'x in {0, 1, 9}',
          '0, 1, 9',
          '{0, 1, 9}',
          '0; 1; 9',
        ],
        solution: `ĐKXĐ: $x \\ge 0$.\nTa tách biểu thức thành phần nguyên:\n$P = \\frac{(\\sqrt{x} + 1) + 4}{\\sqrt{x} + 1} = 1 + \\frac{4}{\\sqrt{x} + 1}$.\nĐể $P$ nhận giá trị nguyên thì $\\frac{4}{\\sqrt{x} + 1} \\in \\mathbb{Z} \\Rightarrow \\sqrt{x} + 1$ phải là ước của $4$.\nVì $x \\ge 0 \\Rightarrow \\sqrt{x} \\ge 0 \\Rightarrow \\sqrt{x} + 1 \\ge 1$, nên $\\sqrt{x} + 1 \\in \\{1; 2; 4\\}$.\n- Trường hợp 1: $\\sqrt{x} + 1 = 1 \\Leftrightarrow \\sqrt{x} = 0 \\Leftrightarrow x = 0$ (thỏa mãn).\n- Trường hợp 2: $\\sqrt{x} + 1 = 2 \\Leftrightarrow \\sqrt{x} = 1 \\Leftrightarrow x = 1$ (thỏa mãn).\n- Trường hợp 3: $\\sqrt{x} + 1 = 4 \\Leftrightarrow \\sqrt{x} = 3 \\Leftrightarrow x = 9$ (thỏa mãn).\nVậy các số nguyên $x$ thỏa mãn là $x \\in \\{0; 1; 9\\}$.`,
        rubricSteps: [
          { step: 'Tách biểu thức về dạng phần nguyên cộng phân thức có tử số là hằng số', points: 0.5 },
          { step: 'Tìm ước dương của 4 và giải ra các giá trị nguyên x', points: 0.5 },
        ],
        keyFormula: '$P = 1 + \\frac{k}{\\sqrt{x} + 1} \\in \\mathbb{Z} \\Leftrightarrow (\\sqrt{x} + 1) \\in \\text{Ư}(k)$',
      };
    },
  },

  {
    id: 'T_G9_C6_HARD_02',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Parabol và Định lí Viète nâng cao',
    topic: 'Biểu thức nghiệm không đối xứng (đề thi vào 10)',
    problemType: 'Kết hợp Viète và phương trình gốc',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // x^2 - 3x + m = 0. Tim m de x1^2 - 2x1x2 + 3x2 = 12
      // Vì x1 là nghiệm nên x1^2 = 3x1 - m.
      // Khi đó x1^2 + 3x2 = 3(x1 + x2) - m = 3(3) - m = 9 - m.
      // Thay vào: (9 - m) - 2m = 12 => 9 - 3m = 12 => -3m = 3 => m = -1.
      // Delta = 9 - 4(-1) = 13 > 0. Thỏa mãn!
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Parabol và Định lí Viète nâng cao',
        topic: 'Biểu thức nghiệm không đối xứng (đề thi vào 10)',
        problemType: 'Kết hợp Viète và phương trình gốc',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Cho phương trình bậc hai $x^2 - 3x + m = 0$. Tìm tham số $m$ để phương trình có hai nghiệm $x_1, x_2$ thỏa mãn hệ thức: $x_1^2 - 2x_1 x_2 + 3x_2 = 12$.`,
        correctAnswer: 'm = -1',
        acceptedAnswers: ['m = -1', '-1'],
        solution: `Bước 1: Điều kiện để phương trình có hai nghiệm là $\\Delta = 9 - 4m \\ge 0 \\Leftrightarrow m \\le \\frac{9}{4}$.\nBước 2: Theo định lí Viète: $x_1 + x_2 = 3$ và $x_1 x_2 = m$.\nVì $x_1$ là nghiệm của phương trình nên: $x_1^2 - 3x_1 + m = 0 \\Rightarrow x_1^2 = 3x_1 - m$.\nThay vào hệ thức đã cho:\n$(3x_1 - m) - 2x_1 x_2 + 3x_2 = 12 \\Leftrightarrow 3(x_1 + x_2) - m - 2x_1 x_2 = 12$\n$\\Leftrightarrow 3 \\cdot 3 - m - 2m = 12 \\Leftrightarrow 9 - 3m = 12 \\Leftrightarrow -3m = 3 \\Leftrightarrow m = -1$.\nSo sánh với điều kiện $m \\le \\frac{9}{4}$: thỏa mãn.\nVậy $m = -1$.`,
        rubricSteps: [
          { step: 'Hạ bậc x1^2 bằng cách dùng phương trình gốc x1^2 = 3x1 - m', points: 0.5 },
          { step: 'Áp dụng Viète thế vào hệ thức và kiểm tra điều kiện Delta', points: 0.5 },
        ],
        keyFormula: 'Kỹ thuật hạ bậc: $x_1^2 = -bx_1 - c$',
      };
    },
  },

  {
    id: 'T_G9_C6_HARD_03',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Hình học tổng hợp Đường tròn',
    topic: 'Cực trị hình học ôn thi vào 10',
    problemType: 'Tìm vị trí của điểm để diện tích tam giác lớn nhất',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Hình học tổng hợp Đường tròn',
        topic: 'Cực trị hình học ôn thi vào 10',
        problemType: 'Tìm vị trí của điểm để diện tích tam giác lớn nhất',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Cho nửa đường tròn đường kính $AB = 2R$. Điểm $C$ di chuyển trên nửa đường tròn ($C$ khác $A$ và $B$). Hãy xác định vị trí của điểm $C$ để diện tích tam giác $ABC$ đạt giá trị lớn nhất.`,
        correctAnswer: 'C là điểm chính giữa của cung AB',
        acceptedAnswers: [
          'C là điểm chính giữa của cung AB',
          'Điểm chính giữa cung AB',
        ],
        solution: `Tam giác $ABC$ nội tiếp nửa đường tròn đường kính $AB$ nên vuông tại $C$.\nKẻ đường cao $CH \\perp AB$ ($H \\in AB$).\nDiện tích tam giác $ABC$ là:\n$S_{ABC} = \\frac{1}{2} AB \\cdot CH = \\frac{1}{2} \\cdot 2R \\cdot CH = R \\cdot CH$.\nVì $AB$ cố định nên $S_{ABC}$ lớn nhất khi và chỉ khi đường cao $CH$ lớn nhất.\nTrong nửa đường tròn, khoảng cách từ $C$ đến đường kính $AB$ lớn nhất bằng bán kính $R$, đạt được khi $C$ trùng với điểm chính giữa của cung $AB$ ($OC \\perp AB$).\nVậy diện tích lớn nhất bằng $R^2$, đạt được khi $C$ là điểm chính giữa của cung $AB$.`,
        rubricSteps: [
          { step: 'Biểu diễn diện tích tam giác theo đường cao CH', points: 0.5 },
          { step: 'Lập luận CH <= R và chỉ ra vị trí C chính giữa cung AB', points: 0.5 },
        ],
        keyFormula: '$S_{\\Delta} = \\frac{1}{2} a h \\le \\frac{1}{2} a R$',
      };
    },
  },

  {
    id: 'T_G9_C6_HARD_04',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Rút gọn căn thức và câu hỏi phụ',
    topic: 'Bất đẳng thức tìm GTNN câu cuối đề thi vào 10',
    problemType: 'Kỹ thuật chọn điểm rơi Cô-si',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Cho x, y > 0 thỏa mãn x + y <= 2. Tìm GTNN của P = 1/x + 1/y
      // P >= 4/(x+y) >= 4/2 = 2. Dấu bằng x = y = 1.
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Rút gọn căn thức và câu hỏi phụ',
        topic: 'Bất đẳng thức tìm GTNN câu cuối đề thi vào 10',
        problemType: 'Kỹ thuật chọn điểm rơi Cô-si',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Cho hai số dương $x, y$ thỏa mãn $x + y \\le 2$. Tìm giá trị nhỏ nhất của biểu thức: $P = \\frac{1}{x} + \\frac{1}{y}$.`,
        correctAnswer: '2',
        acceptedAnswers: ['2', 'Min = 2'],
        solution: `Áp dụng bất đẳng thức Cauchy-Schwarz dạng phân thức (bất đẳng thức Schwarz):\n$P = \\frac{1}{x} + \\frac{1}{y} \\ge \\frac{(1 + 1)^2}{x + y} = \\frac{4}{x + y}$.\nVì $x + y \\le 2$ nên $\\frac{4}{x + y} \\ge \\frac{4}{2} = 2$.\nDo đó $P \\ge 2$.\nDấu đẳng thức xảy ra khi và chỉ khi:\n$\\begin{cases} x = y \\\\ x + y = 2 \\end{cases} \\Leftrightarrow x = y = 1$.\nVậy giá trị nhỏ nhất của $P$ là $2$, đạt được khi $x = y = 1$.`,
        rubricSteps: [
          { step: 'Áp dụng bất đẳng thức Schwarz hoặc AM-GM đưa về mẫu x + y', points: 0.5 },
          { step: 'Đánh giá bất đẳng thức với x + y <= 2 và chỉ ra dấu bằng x = y = 1', points: 0.5 },
        ],
        keyFormula: '$\\frac{1}{x} + \\frac{1}{y} \\ge \\frac{4}{x + y}$',
      };
    },
  },
];
