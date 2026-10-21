// ==============================================================================
// MathMaster THCS - Ngân Hàng Template Câu Hỏi Toán Lớp 7 (Đầy đủ 6 Chương)
// File: src/lib/question-engine/templates/grade7.ts
// Phủ toàn bộ: G7_C1 -> G7_C6 (Mỗi chương >= 4 template / mức độ khó)
// ==============================================================================

import type { QuestionTemplate, TextbookCode } from '../types';
import type { PRNG } from '../rng';
import { buildShuffledMcq, gcd, formatFraction } from '../template-helpers';
import { KNTTContexts } from '../contexts/KNTT';
import { CDContexts } from '../contexts/CD';
import { CTSTContexts } from '../contexts/CTST';

export const grade7Templates: QuestionTemplate[] = [
  // ----------------------------------------------------------------------------
  // CHƯƠNG 1: SỐ HỮU TỈ (G7_C1) - HK1
  // ----------------------------------------------------------------------------
  {
    id: 'T_G7_C1_EASY_01',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Tập hợp các số hữu tỉ',
    topic: 'Khái niệm số hữu tỉ',
    problemType: 'Số đối của số hữu tỉ',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 7);
      const b = rng.nextInt(3, 9);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$\\frac{${a}}{${b}}$`,
        [
          { text: `$-\\frac{${a}}{${b}}$`, errorType: 'GIỮ_NGUYÊN_DẤU' },
          { text: `$\\frac{${b}}{${a}}$`, errorType: 'NGHỊCH_ĐẢO' },
          { text: `$-\\frac{${b}}{${a}}$`, errorType: 'NGHỊCH_ĐẢO_SAI_DẤU' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Tập hợp các số hữu tỉ',
        topic: 'Khái niệm số hữu tỉ',
        problemType: 'Số đối của số hữu tỉ',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Số đối của số hữu tỉ $-\\frac{${a}}{${b}}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Số đối của số hữu tỉ $-x$ là $x$. Do đó số đối của $-\\frac{${a}}{${b}}$ là $\\frac{${a}}{${b}}$.`,
        rubricSteps: [{ step: 'Xác định đúng số đối của số hữu tỉ', points: 0.5 }],
        keyFormula: 'Số đối của $-a/b$ là $a/b$.',
        commonMistake: 'Nhầm số đối với số nghịch đảo.',
      };
    },
  },
  {
    id: 'T_G7_C1_EASY_02',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Lũy thừa của một số hữu tỉ',
    topic: 'Quy tắc tính lũy thừa',
    problemType: 'Lũy thừa của một tích',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const x = rng.nextInt(2, 4);
      const y = rng.nextInt(3, 5);
      const p = rng.nextInt(2, 4);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${x}^{${p}} \\cdot ${y}^{${p}}$`,
        [
          { text: `$${x} \\cdot ${y}^{${p}}$`, errorType: 'QUÊN_LŨY_THỪA_HỆ_SỐ_ĐẦU' },
          { text: `$(${x * y})^{${p * 2}}$`, errorType: 'GẤP_ĐÔI_SỐ_MŨ' },
          { text: `$${x}^{${p}} + ${y}^{${p}}$`, errorType: 'ĐỔI_THÀNH_PHÉP_CỘNG' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Lũy thừa của một số hữu tỉ',
        topic: 'Quy tắc tính lũy thừa',
        problemType: 'Lũy thừa của một tích',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Khẳng định nào sau đây đúng với biểu thức $(${x} \\cdot ${y})^{${p}}$?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Theo công thức lũy thừa của một tích: $(x \\cdot y)^n = x^n \\cdot y^n$. Do đó $(${x} \\cdot ${y})^{${p}} = ${x}^{${p}} \\cdot ${y}^{${p}}$.`,
        rubricSteps: [{ step: 'Áp dụng công thức lũy thừa của một tích', points: 0.5 }],
        keyFormula: '$(xy)^n = x^n y^n$',
        commonMistake: 'Chỉ nâng số mũ cho thừa số đứng sau.',
      };
    },
  },
  {
    id: 'T_G7_C1_EASY_03',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Cộng, trừ, nhân, chia số hữu tỉ',
    topic: 'Cộng trừ số hữu tỉ',
    problemType: 'Cộng hai số hữu tỉ dạng thập phân',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = (rng.nextInt(15, 45) / 10).toFixed(1);
      const b = (-rng.nextInt(5, 12) / 10).toFixed(1);
      const ans = (Number(a) + Number(b)).toFixed(1);
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Cộng, trừ, nhân, chia số hữu tỉ',
        topic: 'Cộng trừ số hữu tỉ',
        problemType: 'Cộng hai số hữu tỉ dạng thập phân',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 1.0,
        textbooks: [book],
        content: `Tính: $${a} + (${b})$`,
        correctAnswer: String(ans),
        acceptedAnswers: [String(ans), `${ans}`],
        solution: `Ta có:\n$$${a} + (${b}) = ${a} - ${Math.abs(Number(b))} = ${ans}$$`,
        rubricSteps: [{ step: `Thực hiện đúng phép cộng ra $${ans}$`, points: 1.0 }],
        keyFormula: '$a + (-b) = a - b$',
        commonMistake: 'Cộng hai phần nguyên dẫn đến sai dấu.',
      };
    },
  },
  {
    id: 'T_G7_C1_EASY_04',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Quy tắc dấu ngoặc và quy tắc chuyển vế',
    topic: 'Quy tắc chuyển vế',
    problemType: 'Tìm x cơ bản',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$\\frac{5}{4}$',
        [
          { text: '$-\\frac{1}{4}$', errorType: 'QUÊN_ĐỔI_DẤU_KHI_CHUYỂN_VẾ' },
          { text: '$\\frac{1}{4}$', errorType: 'LẤY_HIỆU' },
          { text: '$\\frac{4}{6}$', errorType: 'CỘNG_TỬ_CỘNG_MẪU' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Quy tắc dấu ngoặc và quy tắc chuyển vế',
        topic: 'Quy tắc chuyển vế',
        problemType: 'Tìm x cơ bản',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: 'Tìm $x$, biết: $x - \\frac{3}{4} = \\frac{1}{2}$',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Áp dụng quy tắc chuyển vế:\n$$x = \\frac{1}{2} + \\frac{3}{4} = \\frac{2}{4} + \\frac{3}{4} = \\frac{5}{4}$$',
        rubricSteps: [{ step: 'Chuyển vế đổi dấu và quy đồng đúng kết quả', points: 0.5 }],
        keyFormula: '$x - a = b \\implies x = b + a$',
        commonMistake: 'Chuyển vế nhưng không đổi dấu trừ thành cộng.',
      };
    },
  },

  // MEDIUM G7_C1
  {
    id: 'T_G7_C1_MED_01',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Cộng, trừ, nhân, chia số hữu tỉ',
    topic: 'Tính giá trị biểu thức phân số',
    problemType: 'Thực hiện phép tính phối hợp',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 4);
      const b = rng.nextInt(3, 5);
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Cộng, trừ, nhân, chia số hữu tỉ',
        topic: 'Tính giá trị biểu thức phân số',
        problemType: 'Thực hiện phép tính phối hợp',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Thực hiện phép tính: $A = \\left(\\frac{-${a}}{${b}}\\right) \\cdot \\frac{${b * 2}}{${a}} + \\frac{3}{2}$`,
        correctAnswer: '-0.5',
        acceptedAnswers: ['-0.5', '-1/2', '-\\frac{1}{2}'],
        solution: `Ta có:\n$$A = \\frac{-${a} \\cdot ${b * 2}}{${b} \\cdot ${a}} + \\frac{3}{2} = -2 + \\frac{3}{2} = -\\frac{4}{2} + \\frac{3}{2} = -\\frac{1}{2}$$`,
        rubricSteps: [
          { step: 'Rút gọn tích phân số ra $-2$', points: 0.5 },
          { step: 'Cộng với $3/2$ ra $-1/2$', points: 0.5 },
        ],
        keyFormula: 'Ưu tiên nhân chia trước rồi mới cộng trừ.',
        commonMistake: 'Rút gọn sai dấu âm.',
      };
    },
  },
  {
    id: 'T_G7_C1_MED_02',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Lũy thừa của một số hữu tỉ',
    topic: 'Chia hai lũy thừa cùng cơ số',
    problemType: 'Tính giá trị biểu thức lũy thừa',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$\\frac{4}{9}$',
        [
          { text: '$-\\frac{4}{9}$', errorType: 'LŨY_THỪA_BẬC_CHẴN_MANG_DẤU_ÂM' },
          { text: '$\\frac{2}{3}$', errorType: 'BỎ_SỐ_MŨ' },
          { text: '$\\frac{8}{27}$', errorType: 'MŨ_BA' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Lũy thừa của một số hữu tỉ',
        topic: 'Chia hai lũy thừa cùng cơ số',
        problemType: 'Tính giá trị biểu thức lũy thừa',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Tính: $\\left(-\\frac{2}{3}\\right)^5 : \\left(-\\frac{2}{3}\\right)^3$`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Chia hai lũy thừa cùng cơ số:\n$$\\left(-\\frac{2}{3}\\right)^5 : \\left(-\\frac{2}{3}\\right)^3 = \\left(-\\frac{2}{3}\\right)^{5-3} = \\left(-\\frac{2}{3}\\right)^2 = \\frac{(-2)^2}{3^2} = \\frac{4}{9}$$`,
        rubricSteps: [{ step: 'Trừ số mũ ra bình phương và tính kết quả dương 4/9', points: 0.5 }],
        keyFormula: '$x^m : x^n = x^{m-n}$',
        commonMistake: 'Để kết quả là số âm khi lũy thừa với số mũ chẵn.',
      };
    },
  },
  {
    id: 'T_G7_C1_MED_03',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Cộng, trừ, nhân, chia số hữu tỉ',
    topic: 'Tính chất phân phối',
    problemType: 'Tính nhanh phân phối',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const k = rng.nextInt(2, 5);
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Cộng, trừ, nhân, chia số hữu tỉ',
        topic: 'Tính chất phân phối',
        problemType: 'Tính nhanh phân phối',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Tính hợp lý: $B = \\frac{${k}}{7} \\cdot \\frac{5}{11} + \\frac{${k}}{7} \\cdot \\frac{6}{11}$`,
        correctAnswer: formatFraction(k, 7),
        acceptedAnswers: [formatFraction(k, 7), `${k}/7`],
        solution: `Đặt thừa số chung $\\frac{${k}}{7}$ ra ngoài:\n$$B = \\frac{${k}}{7} \\cdot \\left(\\frac{5}{11} + \\frac{6}{11}\\right) = \\frac{${k}}{7} \\cdot \\frac{11}{11} = \\frac{${k}}{7} \\cdot 1 = \\frac{${k}}{7}$$`,
        rubricSteps: [
          { step: 'Đặt thừa số chung ra ngoài', points: 0.5 },
          { step: `Cộng trong ngoặc ra 1 và kết luận $B = \\frac{${k}}{7}$`, points: 0.5 },
        ],
        keyFormula: '$a \\cdot b + a \\cdot c = a(b + c)$',
        commonMistake: 'Nhân riêng lẻ hai tích rồi quy đồng phức tạp.',
      };
    },
  },
  {
    id: 'T_G7_C1_MED_04',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Quy tắc dấu ngoặc và quy tắc chuyển vế',
    topic: 'Tìm x có giá trị tuyệt đối',
    problemType: 'Phương trình chứa dấu giá trị tuyệt đối',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 6);
      const b = rng.nextInt(1, 4);
      const x1 = a + b;
      const x2 = a - b;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x \\in \\{${x2}; ${x1}\\}$`,
        [
          { text: `$x = ${x1}$`, errorType: 'THIẾU_NGHIỆM_ÂM' },
          { text: `$x = ${x2}$`, errorType: 'THIẾU_NGHIỆM_DƯƠNG' },
          { text: `$x \\in \\{${-x1}; ${x1}\\}$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Quy tắc dấu ngoặc và quy tắc chuyển vế',
        topic: 'Tìm x có giá trị tuyệt đối',
        problemType: 'Phương trình chứa dấu giá trị tuyệt đối',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Tìm tất cả các giá trị của $x$ thỏa mãn: $|x - ${a}| = ${b}$`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Ta xét hai trường hợp:\n- TH1: $x - ${a} = ${b} \\implies x = ${a} + ${b} = ${x1}$\n- TH2: $x - ${a} = -${b} \\implies x = ${a} - ${b} = ${x2}$\nVậy $x \\in \\{${x2}; ${x1}\\}$.`,
        rubricSteps: [{ step: 'Chia đủ 2 trường hợp và tìm ra cả 2 nghiệm', points: 0.5 }],
        keyFormula: '$|A| = m (m \\ge 0) \\iff A = m \\text{ hoặc } A = -m$',
        commonMistake: 'Chỉ giải trường hợp $x - a = b$ mà quên trường hợp âm.',
      };
    },
  },

  // HARD G7_C1
  {
    id: 'T_G7_C1_HARD_01',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Cộng, trừ, nhân, chia số hữu tỉ',
    topic: 'Bài toán thực tế tiêu thụ nhiên liệu',
    problemType: 'Tính chi phí xăng xe',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const distance = rng.nextInt(150, 250);
      const consumptionRate = 6.5;
      const pricePerLiter = 24000;
      const liters = (distance / 100) * consumptionRate;
      const totalCost = liters * pricePerLiter;
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Cộng, trừ, nhân, chia số hữu tỉ',
        topic: 'Bài toán thực tế tiêu thụ nhiên liệu',
        problemType: 'Tính chi phí xăng xe',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Một chiếc ô tô đi quãng đường dài $${distance}\\text{ km}$ với mức tiêu thụ nhiên liệu trung bình là $6{,}5$ lít xăng cho mỗi $100\\text{ km}$. Biết giá $1$ lít xăng là $24\\,000$ đồng. Hỏi chiếc ô tô đó đi hết quãng đường trên tiêu tốn bao nhiêu tiền xăng?`,
        correctAnswer: String(totalCost),
        acceptedAnswers: [String(totalCost), `${totalCost} dong`, `${totalCost} đồng`],
        solution: `Số lít xăng tiêu thụ cho $${distance}\\text{ km}$ là:\n$$V = \\frac{${distance}}{100} \\cdot 6{,}5 = ${liters.toFixed(2)}\\text{ lít}$$\nTổng số tiền xăng phải trả là:\n$$T = ${liters} \\cdot 24\\,000 = ${totalCost.toLocaleString('vi-VN')}\\text{ đồng}$$`,
        rubricSteps: [
          { step: `Tính số lít xăng tiêu thụ là $${liters.toFixed(2)}$ lít`, points: 0.5 },
          { step: `Nhân đơn giá ra số tiền $${totalCost}$ đồng`, points: 0.5 },
        ],
        keyFormula: 'Nhiên liệu = (Quãng đường / 100) * Định mức.',
        commonMistake: 'Lấy quãng đường nhân trực tiếp với định mức mà không chia 100.',
      };
    },
  },
  {
    id: 'T_G7_C1_HARD_02',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Lũy thừa của một số hữu tỉ',
    topic: 'Tìm x ở số mũ',
    problemType: 'Giải phương trình lũy thừa',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const base = 2;
      const power = rng.nextInt(4, 7);
      const val = Math.pow(base, power);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x = ${power - 1}$`,
        [
          { text: `$x = ${power}$`, errorType: 'TÍNH_THỪA_1' },
          { text: `$x = ${val / 2}$`, errorType: 'CHIA_ĐÔI' },
          { text: `$x = ${power + 1}$`, errorType: 'TÍNH_DƯ_2' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Lũy thừa của một số hữu tỉ',
        topic: 'Tìm x ở số mũ',
        problemType: 'Giải phương trình lũy thừa',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: `Tìm $x$, biết: $2^{x + 1} - 2^x = ${val / 2}$`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Ta đặt $2^x$ làm thừa số chung:\n$$2^x \\cdot (2 - 1) = ${val / 2} \\implies 2^x \\cdot 1 = 2^{${power - 1}} \\implies x = ${power - 1}$$`,
        rubricSteps: [{ step: 'Đặt nhân tử chung $2^x$ và tìm ra $x$', points: 0.5 }],
        keyFormula: '$a^{x+1} - a^x = a^x(a - 1)$',
        commonMistake: 'Trừ số mũ thành $2^{(x+1)-x} = 2^1$.',
      };
    },
  },
  {
    id: 'T_G7_C1_HARD_03',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Cộng, trừ, nhân, chia số hữu tỉ',
    topic: 'Dãy tổng lũy thừa hữu tỉ',
    problemType: 'Tính tổng S = 1/2 + 1/4 + 1/8 + ...',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const n = rng.nextInt(5, 8);
      const den = Math.pow(2, n);
      const num = den - 1;
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Cộng, trừ, nhân, chia số hữu tỉ',
        topic: 'Dãy tổng lũy thừa hữu tỉ',
        problemType: 'Tính tổng S = 1/2 + 1/4 + 1/8 + ...',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Tính tổng: $S = \\frac{1}{2} + \\frac{1}{2^2} + \\frac{1}{2^3} + \\dots + \\frac{1}{2^{${n}}}$`,
        correctAnswer: `\\frac{${num}}{${den}}`,
        acceptedAnswers: [`${num}/${den}`, `\\frac{${num}}{${den}}`, `${num / den}`],
        solution: `Nhân cả hai vế với $2$:\n$$2S = 1 + \\frac{1}{2} + \\frac{1}{2^2} + \\dots + \\frac{1}{2^{${n - 1}}}$$\nLấy $2S - S$ vế theo vế:\n$$S = 1 - \\frac{1}{2^{${n}}} = 1 - \\frac{1}{${den}} = \\frac{${num}}{${den}}$$`,
        rubricSteps: [
          { step: 'Nhân 2 vào hai vế và thiết lập hiệu 2S - S', points: 0.5 },
          { step: `Triệt tiêu các hạng tử và tính ra $\\frac{${num}}{${den}}$`, points: 0.5 },
        ],
        keyFormula: '$S = 1 - \\frac{1}{2^n}$',
        commonMistake: 'Quy đồng từng phân số dẫn đến không thể tính nổi.',
      };
    },
  },
  {
    id: 'T_G7_C1_HARD_04',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Cộng, trừ, nhân, chia số hữu tỉ',
    topic: 'Bất đẳng thức phân số',
    problemType: 'Chứng minh biểu thức luôn dương',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const b = rng.nextInt(3, 7);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `Luôn lớn hơn hoặc bằng $\\frac{${b}}{${b + 1}}$`,
        [
          { text: 'Luôn nhỏ hơn 0', errorType: 'CHO_LÀ_SỐ_ÂM' },
          { text: 'Luôn bằng 0', errorType: 'CHO_LÀ_TRIỆT_TIÊU' },
          { text: 'Có thể nhận giá trị âm bất kỳ', errorType: 'THIẾU_ĐÁNH_GIÁ' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Cộng, trừ, nhân, chia số hữu tỉ',
        topic: 'Bất đẳng thức phân số',
        problemType: 'Chứng minh biểu thức luôn dương',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: `Biểu thức $P = \\left(x - \\frac{${a}}{2}\\right)^2 + \\frac{${b}}{${b + 1}}$ với mọi $x \\in \\mathbb{Q}$ sẽ:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Vì bình phương của một số hữu tỉ luôn không âm: $\\left(x - \\frac{${a}}{2}\\right)^2 \\ge 0$ với mọi $x$.\nDo đó $P \\ge 0 + \\frac{${b}}{${b + 1}} = \\frac{${b}}{${b + 1}}$.`,
        rubricSteps: [{ step: 'Đánh giá bình phương luôn không âm', points: 0.5 }],
        keyFormula: '$A^2 \\ge 0 \\implies A^2 + c \\ge c$',
        commonMistake: 'Bỏ qua tính chất không âm của bình phương.',
      };
    },
  },

  // ----------------------------------------------------------------------------
  // CHƯƠNG 2: SỐ THỰC (G7_C2) - HK1
  // ----------------------------------------------------------------------------
  {
    id: 'T_G7_C2_EASY_01',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Căn bậc hai số học',
    topic: 'Tính căn bậc hai số học',
    problemType: 'Căn bậc hai của số chính phương',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const root = rng.nextInt(5, 12);
      const sq = root * root;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${root}$`,
        [
          { text: `$\\pm ${root}$`, errorType: 'NHẦM_CĂN_BẬC_HAI_ĐẠI_SỐ' },
          { text: `$${root * 2}$`, errorType: 'NHÂN_ĐÔI' },
          { text: `$${sq / 2}$`, errorType: 'CHIA_ĐÔI' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Căn bậc hai số học',
        topic: 'Tính căn bậc hai số học',
        problemType: 'Căn bậc hai của số chính phương',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Căn bậc hai số học của số $${sq}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Căn bậc hai số học của một số không âm $a$ là số không âm $x$ sao cho $x^2 = a$. Vì $${root} \\ge 0$ và $${root}^2 = ${sq}$ nên $\\sqrt{${sq}} = ${root}$.`,
        rubricSteps: [{ step: 'Áp dụng định nghĩa căn bậc hai số học (luôn không âm)', points: 0.5 }],
        keyFormula: '$\\sqrt{a^2} = a$ với $a \\ge 0$.',
        commonMistake: 'Chọn $\\pm a$ (nhầm căn bậc hai số học với hai căn bậc hai đại số).',
      };
    },
  },
  {
    id: 'T_G7_C2_EASY_02',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Số vô tỉ. Khái niệm về số thực',
    topic: 'Tập hợp số thực',
    problemType: 'Nhận biết số vô tỉ',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const nonSq = rng.nextChoice([2, 3, 5, 7]);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$\\sqrt{${nonSq}}$`,
        [
          { text: '$\\frac{3}{4}$', errorType: 'SỐ_HỮU_TỈ' },
          { text: '$-2{,}5$', errorType: 'SỐ_THẬP_PHÂN_HỮU_HẠN' },
          { text: '$\\sqrt{9}$', errorType: 'CĂN_BẰNG_3_LÀ_SỐ_HỮU_TỈ' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Số vô tỉ. Khái niệm về số thực',
        topic: 'Tập hợp số thực',
        problemType: 'Nhận biết số vô tỉ',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: 'Trong các số sau, số nào là số vô tỉ?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Số vô tỉ là số viết được dưới dạng số thập phân vô hạn không tuần hoàn. Số $\\sqrt{${nonSq}}$ là số vô tỉ vì $${nonSq}$ không phải số chính phương.`,
        rubricSteps: [{ step: 'Nhận biết đúng số vô tỉ', points: 0.5 }],
        keyFormula: '$\\sqrt{n}$ với $n$ không chính phương là số vô tỉ.',
        commonMistake: 'Nhầm số thập phân hữu hạn là số vô tỉ.',
      };
    },
  },
  {
    id: 'T_G7_C2_EASY_03',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Giá trị tuyệt đối của một số thực',
    topic: 'Khái niệm giá trị tuyệt đối',
    problemType: 'Tính giá trị tuyệt đối',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const n = (rng.nextInt(25, 85) / 10).toFixed(1);
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Giá trị tuyệt đối của một số thực',
        topic: 'Khái niệm giá trị tuyệt đối',
        problemType: 'Tính giá trị tuyệt đối',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 1.0,
        textbooks: [book],
        content: `Tính giá trị của biểu thức: $|-${n}|$`,
        correctAnswer: String(n),
        acceptedAnswers: [String(n), `${n}`],
        solution: `Giá trị tuyệt đối của một số âm là số đối của nó:\n$$|-${n}| = -(-${n}) = ${n}$$`,
        rubricSteps: [{ step: `Tính đúng giá trị tuyệt đối ra $${n}$`, points: 1.0 }],
        keyFormula: '$|-a| = a$ với $a > 0$.',
        commonMistake: 'Giữ nguyên dấu âm khi bỏ trị tuyệt đối.',
      };
    },
  },
  {
    id: 'T_G7_C2_EASY_04',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Làm tròn số và ước lượng kết quả',
    topic: 'Làm tròn số thực',
    problemType: 'Làm tròn với độ chính xác d',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$3{,}14$',
        [
          { text: '$3{,}15$', errorType: 'LÀM_TRÒN_LÊN_SAI' },
          { text: '$3{,}1$', errorType: 'LÀM_TRÒN_THIẾU_HÀNG' },
          { text: '$3$', errorType: 'HÀNG_ĐƠN_VỊ' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Làm tròn số và ước lượng kết quả',
        topic: 'Làm tròn số thực',
        problemType: 'Làm tròn với độ chính xác d',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: 'Làm tròn số $\\pi = 3{,}14159...$ với độ chính xác $d = 0{,}005$ (đến hàng phần trăm):',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Để làm tròn với độ chính xác $d = 0{,}005$, ta làm tròn đến hàng phần trăm (chữ số thập phân thứ hai). Vì chữ số tiếp theo là $1 < 5$ nên ta giữ nguyên: $3{,}14159... \\approx 3{,}14$.',
        rubricSteps: [{ step: 'Làm tròn đúng đến hàng phần trăm', points: 0.5 }],
        keyFormula: 'Độ chính xác $d = 0{,}005 \\implies$ làm tròn hàng phần trăm.',
        commonMistake: 'Làm tròn lên do thấy chữ số phía sau nữa lớn hơn 5.',
      };
    },
  },

  // MEDIUM G7_C2
  {
    id: 'T_G7_C2_MED_01',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Căn bậc hai số học',
    topic: 'Tính toán với căn bậc hai',
    problemType: 'Thực hiện phép tính chứa căn',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(3, 8);
      const b = rng.nextInt(2, 6);
      const sqA = a * a;
      const sqB = b * b;
      const ans = a + 2 * b;
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Căn bậc hai số học',
        topic: 'Tính toán với căn bậc hai',
        problemType: 'Thực hiện phép tính chứa căn',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Tính giá trị biểu thức: $A = \\sqrt{${sqA}} + 2 \\cdot \\sqrt{${sqB}}$`,
        correctAnswer: String(ans),
        acceptedAnswers: [String(ans), `${ans}`],
        solution: `Khai phương các căn bậc hai số học:\n$$\\sqrt{${sqA}} = ${a}, \\quad \\sqrt{${sqB}} = ${b}$$\nThay vào biểu thức:\n$$A = ${a} + 2 \\cdot ${b} = ${a} + ${2 * b} = ${ans}$$`,
        rubricSteps: [
          { step: `Tính $\\sqrt{${sqA}} = ${a}$ và $\\sqrt{${sqB}} = ${b}$`, points: 0.5 },
          { step: `Thực hiện phép tính ra $${ans}$`, points: 0.5 },
        ],
        keyFormula: '$\\sqrt{x^2} = x$ với $x > 0$.',
        commonMistake: 'Cộng trước rồi mới nhân.',
      };
    },
  },
  {
    id: 'T_G7_C2_MED_02',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Giá trị tuyệt đối của một số thực',
    topic: 'Tìm x trong đẳng thức',
    problemType: 'Phương trình |x| = a',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const val = (rng.nextInt(15, 45) / 10).toFixed(1);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x = ${val}$ hoặc $x = -${val}$`,
        [
          { text: `$x = ${val}$`, errorType: 'THIẾU_NGHIỆM_ÂM' },
          { text: `$x = -${val}$`, errorType: 'CHỈ_CHỌN_NGHIỆM_ÂM' },
          { text: 'Phương trình vô nghiệm', errorType: 'SAI_KIẾN_THỨC' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Giá trị tuyệt đối của một số thực',
        topic: 'Tìm x trong đẳng thức',
        problemType: 'Phương trình |x| = a',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Tìm tất cả các giá trị của $x$ thỏa mãn: $|x| = ${val}$`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Vì $${val} > 0$ nên $|x| = ${val} \\iff x = ${val}$ hoặc $x = -${val}$.`,
        rubricSteps: [{ step: 'Xác định đủ 2 nghiệm đối nhau', points: 0.5 }],
        keyFormula: '$|x| = a (a > 0) \\iff x = \\pm a$',
        commonMistake: 'Quên nghiệm âm.',
      };
    },
  },
  {
    id: 'T_G7_C2_MED_03',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Căn bậc hai số học',
    topic: 'So sánh căn bậc hai',
    problemType: 'So sánh căn và số nguyên',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const n = rng.nextInt(4, 8);
      const sqMinus = n * n - 1;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$\\sqrt{${sqMinus}} < ${n}$`,
        [
          { text: `$\\sqrt{${sqMinus}} > ${n}$`, errorType: 'SO_SÁNH_NGƯỢC' },
          { text: `$\\sqrt{${sqMinus}} = ${n}$`, errorType: 'CHO_LÀ_BẰNG_NHAU' },
          { text: 'Không so sánh được', errorType: 'THIẾU_LẬP_LUẬN' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Căn bậc hai số học',
        topic: 'So sánh căn bậc hai',
        problemType: 'So sánh căn và số nguyên',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `So sánh $\\sqrt{${sqMinus}}$ và $${n}$ ta được kết quả là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Ta có $${n} = \\sqrt{${n * n}}$. Vì $${sqMinus} < ${n * n}$ nên $\\sqrt{${sqMinus}} < \\sqrt{${n * n}}$, tức là $\\sqrt{${sqMinus}} < ${n}$.`,
        rubricSteps: [{ step: `Đưa $${n}$ về căn và so sánh hai biểu thức dưới căn`, points: 0.5 }],
        keyFormula: '$a < b \\iff \\sqrt{a} < \\sqrt{b}$ với $a, b \\ge 0$.',
        commonMistake: 'Không bình phương để so sánh.',
      };
    },
  },
  {
    id: 'T_G7_C2_MED_04',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Số vô tỉ. Khái niệm về số thực',
    topic: 'Thuộc tập hợp số',
    problemType: 'Quan hệ giữa các tập hợp N, Z, Q, R',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Số vô tỉ. Khái niệm về số thực',
        topic: 'Thuộc tập hợp số',
        problemType: 'Quan hệ giữa các tập hợp N, Z, Q, R',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: 'Điền ký hiệu thích hợp ($\\in, \\notin, \\subset$) vào chỗ trống:\na) $\\sqrt{5}$ ... $\\mathbb{Q}$\nb) $\\mathbb{Q}$ ... $\\mathbb{R}$',
        correctAnswer: 'notin va subset',
        acceptedAnswers: ['notin', 'không thuộc', '∉ và ⊂', 'notin va subset'],
        solution: `a) $\\sqrt{5}$ là số vô tỉ nên không thuộc tập số hữu tỉ: $\\sqrt{5} \\notin \\mathbb{Q}$.\nb) Tập hợp số hữu tỉ là tập con của tập hợp số thực: $\\mathbb{Q} \\subset \\mathbb{R}$.`,
        rubricSteps: [
          { step: 'Điền đúng ký hiệu không thuộc cho câu a', points: 0.5 },
          { step: 'Điền đúng ký hiệu tập con cho câu b', points: 0.5 },
        ],
        keyFormula: '$\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$',
        commonMistake: 'Dùng nhầm ký hiệu thuộc cho hai tập hợp.',
      };
    },
  },

  // HARD G7_C2
  {
    id: 'T_G7_C2_HARD_01',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Căn bậc hai số học',
    topic: 'Bài toán thực tế diện tích hình vuông',
    problemType: 'Tính chiều dài cạnh từ diện tích',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const edge = rng.nextInt(12, 25);
      const area = edge * edge;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${edge}\\text{ m}$`,
        [
          { text: `$${area / 4}\\text{ m}$`, errorType: 'CHIA_BỐN_NHẦM_CHU_VI' },
          { text: `$${edge * 2}\\text{ m}$`, errorType: 'GẤP_ĐÔI' },
          { text: `$${edge + 2}\\text{ m}$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Căn bậc hai số học',
        topic: 'Bài toán thực tế diện tích hình vuông',
        problemType: 'Tính chiều dài cạnh từ diện tích',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: `Một mảnh vườn hình vuông có diện tích bằng $${area}\\text{ m}^2$. Độ dài cạnh của mảnh vườn đó là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Diện tích hình vuông $S = a^2 \\implies a = \\sqrt{S} = \\sqrt{${area}} = ${edge}\\text{ m}$.`,
        rubricSteps: [{ step: 'Lấy căn bậc hai số học của diện tích tìm ra độ dài cạnh', points: 0.5 }],
        keyFormula: '$a = \\sqrt{S}$',
        commonMistake: 'Lấy diện tích chia cho 4 (nhầm chu vi với diện tích).',
      };
    },
  },
  {
    id: 'T_G7_C2_HARD_02',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Giá trị tuyệt đối của một số thực',
    topic: 'Tìm giá trị nhỏ nhất của tổng giá trị tuyệt đối',
    problemType: 'Cực trị chứa trị tuyệt đối',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const b = rng.nextInt(6, 10);
      const minVal = b - a;
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Giá trị tuyệt đối của một số thực',
        topic: 'Tìm giá trị nhỏ nhất của tổng giá trị tuyệt đối',
        problemType: 'Cực trị chứa trị tuyệt đối',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Tìm giá trị nhỏ nhất của biểu thức: $A = |x - ${a}| + |x - ${b}|$`,
        correctAnswer: String(minVal),
        acceptedAnswers: [String(minVal), `${minVal}`],
        solution: `Áp dụng bất đẳng thức $|A| + |B| \\ge |A - B|$:\n$$A = |x - ${a}| + |${b} - x| \\ge |(x - ${a}) + (${b} - x)| = |${b} - ${a}| = ${minVal}$$\nDấu bằng xảy ra khi $(${a} \\le x \\le ${b})$.\nVậy giá trị nhỏ nhất của $A$ là $${minVal}$.`,
        rubricSteps: [
          { step: 'Đổi dấu biểu thức $|x - b| = |b - x|$', points: 0.5 },
          { step: `Áp dụng BĐT trị tuyệt đối ra GTNN là $${minVal}$`, points: 0.5 },
        ],
        keyFormula: '$|x - a| + |b - x| \\ge |b - a|$ với $a < b$.',
        commonMistake: 'Cho $x=0$ rồi cộng hai số lại.',
      };
    },
  },
  {
    id: 'T_G7_C2_HARD_03',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Căn bậc hai số học',
    topic: 'Phương trình vô tỉ cơ bản',
    problemType: 'Giải phương trình chứa căn bậc hai',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const root = rng.nextInt(3, 7);
      const offset = rng.nextInt(2, 5);
      const xAns = root * root + offset;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x = ${xAns}$`,
        [
          { text: `$x = ${root * root}$`, errorType: 'QUÊN_CỘNG_HỆ_SỐ' },
          { text: `$x = ${root + offset}$`, errorType: 'KHÔNG_BÌNH_PHƯƠNG' },
          { text: `$x = ${root * root - offset}$`, errorType: 'CHUYỂN_VẾ_SAI_DẤU' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Căn bậc hai số học',
        topic: 'Phương trình vô tỉ cơ bản',
        problemType: 'Giải phương trình chứa căn bậc hai',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: `Tìm $x$, biết: $\\sqrt{x - ${offset}} = ${root}$`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bình phương hai vế:\n$$x - ${offset} = ${root}^2 = ${root * root} \\implies x = ${root * root} + ${offset} = ${xAns}$$`,
        rubricSteps: [{ step: `Bình phương 2 vế và chuyển vế tìm ra $x = ${xAns}$`, points: 0.5 }],
        keyFormula: '$\\sqrt{A} = m (m \\ge 0) \\iff A = m^2$',
        commonMistake: 'Không bình phương vế phải.',
      };
    },
  },
  {
    id: 'T_G7_C2_HARD_04',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Số vô tỉ. Khái niệm về số thực',
    topic: 'Chứng minh căn bậc hai là số vô tỉ',
    problemType: 'Chứng minh bằng phản chứng',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Số vô tỉ. Khái niệm về số thực',
        topic: 'Chứng minh căn bậc hai là số vô tỉ',
        problemType: 'Chứng minh bằng phản chứng',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: 'Chứng minh rằng $\\sqrt{2}$ là một số vô tỉ bằng phương pháp phản chứng.',
        correctAnswer: 'Gia su sqrt(2) la so huu ti dan den mau thuan',
        acceptedAnswers: ['phan chung', 'phản chứng', 'vo ti', 'vô tỉ'],
        solution: `Giả sử $\\sqrt{2}$ là số hữu tỉ, tức là $\\sqrt{2} = \\frac{a}{b}$ với $a, b \\in \\mathbb{N}^*, \\text{ƯCLN}(a, b) = 1$.\nBình phương hai vế: $2 = \\frac{a^2}{b^2} \\implies a^2 = 2b^2$.\nDo đó $a^2$ chia hết cho $2 \\implies a$ chia hết cho $2$. Đặt $a = 2k$ ($k \\in \\mathbb{N}^*$).\nThay vào ta được: $(2k)^2 = 2b^2 \\implies 4k^2 = 2b^2 \\implies b^2 = 2k^2$.\nSuy ra $b^2 \\,\\vdots\\, 2 \\implies b \\,\\vdots\\, 2$.\nNhư vậy cả $a$ và $b$ cùng chia hết cho $2$, mâu thuẫn với giả thiết $\\text{ƯCLN}(a, b) = 1$.\nVậy $\\sqrt{2}$ phải là số vô tỉ.`,
        rubricSteps: [
          { step: 'Giả thiết phản chứng $a/b$ tối giản và bình phương 2 vế', points: 0.5 },
          { step: 'Chỉ ra cả a và b chia hết cho 2 dẫn đến mâu thuẫn', points: 0.5 },
        ],
        keyFormula: 'Phương pháp phản chứng: giả sử điều ngược lại rồi suy ra mâu thuẫn.',
        commonMistake: 'Quên giả thiết phân số $a/b$ tối giản.',
      };
    },
  },

  // ----------------------------------------------------------------------------
  // CHƯƠNG 3: GÓC VÀ ĐƯỜNG THẲNG SONG SONG (G7_C3) - HK1
  // ----------------------------------------------------------------------------
  {
    id: 'T_G7_C3_EASY_01',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Hai góc đối đỉnh',
    topic: 'Tính chất hai góc đối đỉnh',
    problemType: 'Tìm số đo góc đối đỉnh',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(40, 80);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${a}^\\circ$`,
        [
          { text: `$${180 - a}^\\circ$`, errorType: 'NHẦM_VỚI_GÓC_KỀ_BÙ' },
          { text: `$${90 - a}^\\circ$`, errorType: 'NHẦM_VỚI_GÓC_PHỤ' },
          { text: `$${a * 2}^\\circ$`, errorType: 'GẤP_ĐÔI' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Hai góc đối đỉnh',
        topic: 'Tính chất hai góc đối đỉnh',
        problemType: 'Tìm số đo góc đối đỉnh',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Cho hai đường thẳng $xx'$ và $yy'$ cắt nhau tại $O$. Biết $\\widehat{xOy} = ${a}^\\circ$. Số đo của góc đối đỉnh $\\widehat{x'Oy'}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Hai góc đối đỉnh thì bằng nhau. Do đó $\\widehat{x'Oy'} = \\widehat{xOy} = ${a}^\\circ$.`,
        rubricSteps: [{ step: 'Nhận biết tính chất hai góc đối đỉnh bằng nhau', points: 0.5 }],
        keyFormula: 'Hai góc đối đỉnh thì bằng nhau.',
        commonMistake: 'Lấy $180^\\circ$ trừ (nhầm với góc kề bù).',
      };
    },
  },
  {
    id: 'T_G7_C3_EASY_02',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Góc ở vị trí đặc biệt',
    topic: 'Góc so le trong và đồng vị',
    problemType: 'Nhận diện cặp góc so le trong',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Hai góc so le trong bằng nhau',
        [
          { text: 'Hai góc so le trong có tổng bằng 180°', errorType: 'NHẦM_VỚI_TRONG_CÙNG_PHÍA' },
          { text: 'Hai góc so le trong phụ nhau', errorType: 'SAI_TÍNH_CHẤT' },
          { text: 'Hai góc so le trong luôn nhọn', errorType: 'PHỎNG_ĐOÁN' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Góc ở vị trí đặc biệt',
        topic: 'Góc so le trong và đồng vị',
        problemType: 'Nhận diện cặp góc so le trong',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: 'Nếu một đường thẳng cắt hai đường thẳng song song thì:',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Theo tính chất hai đường thẳng song song: Một đường thẳng cắt hai đường thẳng song song thì hai góc so le trong bằng nhau, hai góc đồng vị bằng nhau.',
        rubricSteps: [{ step: 'Nêu đúng định lý về hai đường thẳng song song', points: 0.5 }],
        keyFormula: '$a \\parallel b \\implies$ các góc so le trong bằng nhau.',
        commonMistake: 'Nhầm lẫn tính chất với cặp góc trong cùng phía bù nhau.',
      };
    },
  },
  {
    id: 'T_G7_C3_EASY_03',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Tia phân giác của một góc',
    topic: 'Định nghĩa tia phân giác',
    problemType: 'Tính góc thành phần từ tia phân giác',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const total = rng.nextInt(35, 75) * 2;
      const half = total / 2;
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Tia phân giác của một góc',
        topic: 'Định nghĩa tia phân giác',
        problemType: 'Tính góc thành phần từ tia phân giác',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 1.0,
        textbooks: [book],
        content: `Cho tia $Ot$ là tia phân giác của góc $\\widehat{xOy} = ${total}^\\circ$. Tính số đo của góc $\\widehat{xOt}$.`,
        correctAnswer: String(half),
        acceptedAnswers: [String(half), `${half} độ`, `${half}°`],
        solution: `Vì $Ot$ là tia phân giác của $\\widehat{xOy}$ nên:\n$$\\widehat{xOt} = \\frac{\\widehat{xOy}}{2} = \\frac{${total}^\\circ}{2} = ${half}^\\circ$$`,
        rubricSteps: [{ step: `Tính ra góc $\\widehat{xOt} = ${half}^\\circ$`, points: 1.0 }],
        keyFormula: 'Tia phân giác chia góc thành 2 góc bằng nhau.',
        commonMistake: 'Nhân đôi góc thay vì chia đôi.',
      };
    },
  },
  {
    id: 'T_G7_C3_EASY_04',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Định lí và chứng minh định lí',
    topic: 'Cấu trúc định lí',
    problemType: 'Xác định giả thiết và kết luận',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Giả thiết là phần sau từ "Nếu", Kết luận là phần sau từ "thì"',
        [
          { text: 'Giả thiết là phần sau từ "thì", Kết luận là phần sau từ "Nếu"', errorType: 'ĐẢO_NGƯỢC_VAI_TRÒ' },
          { text: 'Cả hai phần đều là giả thiết', errorType: 'SAI_KHÁI_NIỆM' },
          { text: 'Định lí không có phần kết luận', errorType: 'SAI_HOÀN_TOÀN' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Định lí và chứng minh định lí',
        topic: 'Cấu trúc định lí',
        problemType: 'Xác định giả thiết và kết luận',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: 'Trong một định lí toán học phát biểu dưới dạng "Nếu... thì...", mệnh đề nào sau đây là đúng?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Trong định lý dạng "Nếu A thì B": A là Giả thiết (điều đã cho) và B là Kết luận (điều cần suy ra).',
        rubricSteps: [{ step: 'Xác định chính xác cấu trúc GT và KL của định lí', points: 0.5 }],
        keyFormula: 'Nếu (Giả thiết) thì (Kết luận).',
        commonMistake: 'Đảo ngược vị trí giữa giả thiết và kết luận.',
      };
    },
  },

  // MEDIUM G7_C3
  {
    id: 'T_G7_C3_MED_01',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Hai đường thẳng song song và dấu hiệu nhận biết',
    topic: 'Tính góc trong cùng phía',
    problemType: 'Tìm số đo góc trong cùng phía',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(55, 85);
      const b = 180 - a;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${b}^\\circ$`,
        [
          { text: `$${a}^\\circ$`, errorType: 'CHO_LÀ_BẰNG_NHAU_NHẦM_SO_LE' },
          { text: `$${90 - a}^\\circ$`, errorType: 'TÍNH_PHỤ_NHAU' },
          { text: `$${b - 10}^\\circ$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Hai đường thẳng song song và dấu hiệu nhận biết',
        topic: 'Tính góc trong cùng phía',
        problemType: 'Tìm số đo góc trong cùng phía',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Cho đường thẳng $a \\parallel b$. Đường thẳng $c$ cắt $a$ và $b$ lần lượt tại $A$ và $B$. Biết một góc trong cùng phía tại đỉnh $A$ có số đo $${a}^\\circ$. Góc trong cùng phía tại đỉnh $B$ có số đo là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Hai góc trong cùng phía của hai đường thẳng song song thì bù nhau (tổng số đo bằng $180^\\circ$):\n$$\\widehat{B} = 180^\\circ - ${a}^\\circ = ${b}^\\circ$$`,
        rubricSteps: [{ step: 'Áp dụng tính chất hai góc trong cùng phía bù nhau', points: 0.5 }],
        keyFormula: 'Hai góc trong cùng phía có tổng bằng $180^\\circ$.',
        commonMistake: 'Cho hai góc trong cùng phía bằng nhau như góc so le trong.',
      };
    },
  },
  {
    id: 'T_G7_C3_MED_02',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Hai đường thẳng song song và dấu hiệu nhận biết',
    topic: 'Chứng minh song song',
    problemType: 'Dấu hiệu nhận biết qua góc đồng vị',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const angle = rng.nextInt(60, 80);
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Hai đường thẳng song song và dấu hiệu nhận biết',
        topic: 'Chứng minh song song',
        problemType: 'Dấu hiệu nhận biết qua góc đồng vị',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Đường thẳng $c$ cắt hai đường thẳng $a$ và $b$ tạo thành một cặp góc đồng vị có cùng số đo là $${angle}^\\circ$. Hai đường thẳng $a$ và $b$ có song song với nhau không? Vì sao?`,
        correctAnswer: 'a song song voi b vi co mot cap goc dong vi bang nhau',
        acceptedAnswers: ['song song', 'co song song', 'a song song voi b', 'a // b'],
        solution: `Vì đường thẳng $c$ cắt hai đường thẳng $a, b$ tạo thành một cặp góc đồng vị bằng nhau (cùng bằng $${angle}^\\circ$) nên theo dấu hiệu nhận biết, ta có $a \\parallel b$.`,
        rubricSteps: [
          { step: 'Khẳng định $a \\parallel b$', points: 0.5 },
          { step: 'Nêu đúng dấu hiệu nhận biết (cặp góc đồng vị bằng nhau)', points: 0.5 },
        ],
        keyFormula: 'Cặp góc đồng vị bằng nhau $\\implies a \\parallel b$.',
        commonMistake: 'Không giải thích lý do theo dấu hiệu nhận biết.',
      };
    },
  },
  {
    id: 'T_G7_C3_MED_03',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Từ vuông góc đến song song',
    topic: 'Tính chất ba đường thẳng',
    problemType: 'Hai đường thẳng cùng vuông góc với đường thẳng thứ ba',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$a \\parallel b$',
        [
          { text: '$a \\perp b$', errorType: 'CHO_LÀ_VUÔNG_GÓC' },
          { text: '$a$ cắt $b$', errorType: 'CẮT_NHAU' },
          { text: '$a$ trùng $b$', errorType: 'TRÙNG_NHAU' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Từ vuông góc đến song song',
        topic: 'Tính chất ba đường thẳng',
        problemType: 'Hai đường thẳng cùng vuông góc với đường thẳng thứ ba',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: 'Cho hai đường thẳng phân biệt $a$ và $b$. Biết $a \\perp c$ và $b \\perp c$. Khẳng định nào sau đây là đúng?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Hai đường thẳng phân biệt cùng vuông góc với một đường thẳng thứ ba thì chúng song song với nhau: $a \\parallel b$.',
        rubricSteps: [{ step: 'Áp dụng định lý từ vuông góc đến song song', points: 0.5 }],
        keyFormula: '$a \\perp c, b \\perp c \\implies a \\parallel b$',
        commonMistake: 'Nghĩ rằng $a$ vuông góc với $b$.',
      };
    },
  },
  {
    id: 'T_G7_C3_MED_04',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Tia phân giác của một góc',
    topic: 'Hai tia phân giác của hai góc kề',
    problemType: 'Tính tổng số đo',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(30, 50);
      const b = rng.nextInt(40, 60);
      const ans = (a + b) / 2;
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Tia phân giác của một góc',
        topic: 'Hai tia phân giác của hai góc kề',
        problemType: 'Tính tổng số đo',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Cho hai góc kề nhau $\\widehat{xOy} = ${a}^\\circ$ và $\\widehat{yOz} = ${b}^\\circ$. Gọi $Om, On$ lần lượt là tia phân giác của $\\widehat{xOy}$ và $\\widehat{yOz}$. Tính số đo của góc $\\widehat{mOn}$.`,
        correctAnswer: String(ans),
        acceptedAnswers: [String(ans), `${ans} độ`, `${ans}°`],
        solution: `Ta có:\n$$\\widehat{mOn} = \\widehat{mOy} + \\widehat{yOn} = \\frac{\\widehat{xOy}}{2} + \\frac{\\widehat{yOz}}{2} = \\frac{${a}^\\circ + ${b}^\\circ}{2} = \\frac{${a + b}^\\circ}{2} = ${ans}^\\circ$$`,
        rubricSteps: [
          { step: 'Tính số đo từng góc phân giác', points: 0.5 },
          { step: `Cộng lại tìm ra $\\widehat{mOn} = ${ans}^\\circ$`, points: 0.5 },
        ],
        keyFormula: '$\\widehat{mOn} = \\frac{\\widehat{xOy} + \\widehat{yOz}}{2}$',
        commonMistake: 'Lấy cả hai góc cộng lại mà quên chia đôi.',
      };
    },
  },

  // HARD G7_C3
  {
    id: 'T_G7_C3_HARD_01',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Hai đường thẳng song song và dấu hiệu nhận biết',
    topic: 'Bài toán góc gãy khúc (vẽ thêm đường phụ)',
    problemType: 'Tính góc nhọn ở đỉnh gãy',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(35, 55);
      const b = rng.nextInt(40, 60);
      const sum = a + b;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${sum}^\\circ$`,
        [
          { text: `$${180 - sum}^\\circ$`, errorType: 'BÙ_GÓC' },
          { text: `$${Math.abs(a - b)}^\\circ$`, errorType: 'LẤY_HIỆU' },
          { text: `$${sum + 15}^\\circ$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Hai đường thẳng song song và dấu hiệu nhận biết',
        topic: 'Bài toán góc gãy khúc (vẽ thêm đường phụ)',
        problemType: 'Tính góc nhọn ở đỉnh gãy',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: `Cho hai tia $Ax \\parallel By$. Điểm $O$ nằm giữa hai đường thẳng sao cho tia $OA, OB$ nằm cùng phía. Biết $\\widehat{xAO} = ${a}^\\circ$ và $\\widehat{yBO} = ${b}^\\circ$. Số đo của góc $\\widehat{AOB}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Kẻ qua $O$ đường thẳng $Ot \\parallel Ax \\parallel By$.\nKhi đó $\\widehat{AOt} = \\widehat{xAO} = ${a}^\\circ$ (so le trong) và $\\widehat{tOB} = \\widehat{yBO} = ${b}^\\circ$ (so le trong).\nDo đó:\n$$\\widehat{AOB} = \\widehat{AOt} + \\widehat{tOB} = ${a}^\\circ + ${b}^\\circ = ${sum}^\\circ$$`,
        rubricSteps: [{ step: 'Kẻ đường phụ qua O song song và tính tổng ra kết quả', points: 0.5 }],
        keyFormula: 'Kẻ đường thẳng phụ qua đỉnh gãy khúc song song với hai tia ban đầu.',
        commonMistake: 'Lấy hiệu của hai góc thay vì cộng.',
      };
    },
  },
  {
    id: 'T_G7_C3_HARD_02',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Hai đường thẳng song song và dấu hiệu nhận biết',
    topic: 'Chứng minh song song qua tổng góc trong cùng phía',
    problemType: 'Chứng minh ba điểm hoặc tia song song',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(120, 140);
      const b = 180 - a;
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Hai đường thẳng song song và dấu hiệu nhận biết',
        topic: 'Chứng minh song song qua tổng góc trong cùng phía',
        problemType: 'Chứng minh ba điểm hoặc tia song song',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Cho hai đường thẳng $a$ và $b$ cùng bị cắt bởi đường thẳng $c$. Tại hai giao điểm, có hai góc trong cùng phía có số đo lần lượt là $${a}^\\circ$ và $${b}^\\circ$. Hãy chứng minh rằng $a \\parallel b$.`,
        correctAnswer: 'a song song voi b vi tong hai goc trong cung phia bang 180 do',
        acceptedAnswers: ['song song', 'a song song b', 'a // b'],
        solution: `Tổng số đo của hai góc trong cùng phía là:\n$$${a}^\\circ + ${b}^\\circ = 180^\\circ$$\nVì hai góc ở vị trí trong cùng phía có tổng số đo bằng $180^\\circ$ (bù nhau) nên theo dấu hiệu nhận biết hai đường thẳng song song, ta có $a \\parallel b$.`,
        rubricSteps: [
          { step: `Tính tổng số đo hai góc ra $180^\\circ$`, points: 0.5 },
          { step: 'Kết luận $a \\parallel b$ theo dấu hiệu hai góc trong cùng phía bù nhau', points: 0.5 },
        ],
        keyFormula: 'Hai góc trong cùng phía bù nhau $\\implies a \\parallel b$.',
        commonMistake: 'Quên nêu vị trí "trong cùng phía".',
      };
    },
  },
  {
    id: 'T_G7_C3_HARD_03',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Tia phân giác của một góc',
    topic: 'Chứng minh hai tia phân giác song song',
    problemType: 'Hai phân giác của hai góc so le trong',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Hai tia phân giác song song với nhau',
        [
          { text: 'Hai tia phân giác vuông góc với nhau', errorType: 'NHẦM_VỚI_HAI_GÓC_KỀ_BÙ' },
          { text: 'Hai tia phân giác trùng nhau', errorType: 'SAI_HÌNH' },
          { text: 'Hai tia phân giác cắt nhau tạo góc 45°', errorType: 'PHỎNG_ĐOÁN' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Tia phân giác của một góc',
        topic: 'Chứng minh hai tia phân giác song song',
        problemType: 'Hai phân giác của hai góc so le trong',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: 'Cho hai đường thẳng song song $a \\parallel b$ bị cắt bởi đường thẳng $c$. Hai tia phân giác của một cặp góc so le trong có vị trí tương đối như thế nào với nhau?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Gọi cặp góc so le trong là $\\alpha$ và $\\beta$ (với $\\alpha = \\beta$). Tia phân giác chia mỗi góc thành $\\alpha/2$ và $\\beta/2$. Hai góc này cũng ở vị trí so le trong và bằng nhau, do đó hai tia phân giác song song với nhau.',
        rubricSteps: [{ step: 'Chứng minh góc so le trong của phân giác bằng nhau và suy ra song song', points: 0.5 }],
        keyFormula: 'Hai phân giác của hai góc so le trong thì song song với nhau.',
        commonMistake: 'Nhầm với hai phân giác của góc kề bù (vuông góc).',
      };
    },
  },
  {
    id: 'T_G7_C3_HARD_04',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Định lí và chứng minh định lí',
    topic: 'Định lý góc ngoài của tam giác',
    problemType: 'Chứng minh góc ngoài bằng tổng 2 góc trong không kề',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Định lí và chứng minh định lí',
        topic: 'Định lý góc ngoài của tam giác',
        problemType: 'Chứng minh góc ngoài bằng tổng 2 góc trong không kề',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: 'Chứng minh rằng mỗi góc ngoài của một tam giác bằng tổng của hai góc trong không kề với nó.',
        correctAnswer: 'Goc ngoai ke bu voi goc trong va tong 3 goc bang 180',
        acceptedAnswers: ['goc ngoai', '180', 'tong hai goc trong'],
        solution: `Xét tam giác $ABC$, gọi $\\widehat{ACx}$ là góc ngoài tại đỉnh $C$.\nTa có: $\\widehat{ACx} + \\widehat{C} = 180^\\circ$ (hai góc kề bù).\nMặt khác, tổng ba góc trong tam giác: $\\widehat{A} + \\widehat{B} + \\widehat{C} = 180^\\circ \\implies \\widehat{A} + \\widehat{B} = 180^\\circ - \\widehat{C}$.\nTừ đó suy ra: $\\widehat{ACx} = \\widehat{A} + \\widehat{B}$.\nVậy mỗi góc ngoài của một tam giác bằng tổng của hai góc trong không kề với nó.`,
        rubricSteps: [
          { step: 'Dùng tính chất kề bù của góc ngoài', points: 0.5 },
          { step: 'Dùng định lý tổng 3 góc bằng 180° để suy ra điều phải chứng minh', points: 0.5 },
        ],
        keyFormula: 'Góc ngoài = Tổng hai góc trong không kề.',
        commonMistake: 'Cộng nhầm cả góc trong kề với nó.',
      };
    },
  },

  // ----------------------------------------------------------------------------
  // CHƯƠNG 4: TỈ LỆ THỨC VÀ ĐẠI LƯỢNG TỈ LỆ (G7_C4) - HK2
  // ----------------------------------------------------------------------------
  {
    id: 'T_G7_C4_EASY_01',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C4',
    lesson: 'Tỉ lệ thức',
    topic: 'Khái niệm tỉ lệ thức',
    problemType: 'Tìm x trong tỉ lệ thức đơn giản',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const b = rng.nextInt(3, 7);
      const m = rng.nextInt(2, 4);
      const c = a * m;
      const xAns = b * m;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x = ${xAns}$`,
        [
          { text: `$x = ${xAns + 1}$`, errorType: 'TÍNH_NHẦM' },
          { text: `$x = ${b}$`, errorType: 'CHO_BẰNG_MẪU' },
          { text: `$x = ${a * b}$`, errorType: 'NHÂN_HAI_SỐ' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C4',
        lesson: 'Tỉ lệ thức',
        topic: 'Khái niệm tỉ lệ thức',
        problemType: 'Tìm x trong tỉ lệ thức đơn giản',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Tìm $x$, biết: $\\frac{x}{${b}} = \\frac{${c}}{${a}}$`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Theo tính chất tỉ lệ thức:\n$$x = \\frac{${b} \\cdot ${c}}{${a}} = \\frac{${b * c}}{${a}} = ${xAns}$$`,
        rubricSteps: [{ step: 'Áp dụng quy tắc nhân chéo tỉ lệ thức tìm ra x', points: 0.5 }],
        keyFormula: '$\\frac{x}{b} = \\frac{c}{a} \\implies x = \\frac{b \\cdot c}{a}$',
        commonMistake: 'Lấy tích nhân với mẫu thay vì chia.',
      };
    },
  },
  {
    id: 'T_G7_C4_EASY_02',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C4',
    lesson: 'Tính chất của dãy tỉ số bằng nhau',
    topic: 'Áp dụng tính chất cơ bản',
    problemType: 'Nhận biết công thức dãy tỉ số',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$\\frac{x+y}{a+b} = \\frac{x-y}{a-b}$',
        [
          { text: '$\\frac{x+y}{a-b}$', errorType: 'SAI_DẤU_MẪU' },
          { text: '$\\frac{x \\cdot y}{a \\cdot b}$', errorType: 'NHÂN_TỬ_VÀ_MẪU' },
          { text: '$\\frac{x-y}{a+b}$', errorType: 'LỆCH_DẤU' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C4',
        lesson: 'Tính chất của dãy tỉ số bằng nhau',
        topic: 'Áp dụng tính chất cơ bản',
        problemType: 'Nhận biết công thức dãy tỉ số',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: 'Cho $\\frac{x}{a} = \\frac{y}{b}$ ($a, b \\ne 0, a \\ne \\pm b$). Theo tính chất của dãy tỉ số bằng nhau, ta có tỉ số nào sau đây bằng các tỉ số đã cho?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Theo tính chất dãy tỉ số bằng nhau: $\\frac{x}{a} = \\frac{y}{b} = \\frac{x+y}{a+b} = \\frac{x-y}{a-b}$.',
        rubricSteps: [{ step: 'Nêu đúng công thức tính chất dãy tỉ số bằng nhau', points: 0.5 }],
        keyFormula: '$\\frac{x}{a} = \\frac{y}{b} = \\frac{x+y}{a+b}$',
        commonMistake: 'Tử cộng mẫu trừ hoặc nhân tử với nhau.',
      };
    },
  },
  {
    id: 'T_G7_C4_EASY_03',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C4',
    lesson: 'Đại lượng tỉ lệ thuận',
    topic: 'Hệ số tỉ lệ thuận',
    problemType: 'Tìm hệ số k',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const k = rng.nextInt(3, 7);
      const x = rng.nextInt(2, 5);
      const y = k * x;
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C4',
        lesson: 'Đại lượng tỉ lệ thuận',
        topic: 'Hệ số tỉ lệ thuận',
        problemType: 'Tìm hệ số k',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 1.0,
        textbooks: [book],
        content: `Biết $y$ tỉ lệ thuận với $x$ theo công thức $y = kx$. Khi $x = ${x}$ thì $y = ${y}$. Tìm hệ số tỉ lệ $k$.`,
        correctAnswer: String(k),
        acceptedAnswers: [String(k), `k=${k}`, `k = ${k}`],
        solution: `Ta có:\n$$k = \\frac{y}{x} = \\frac{${y}}{${x}} = ${k}$$`,
        rubricSteps: [{ step: `Tính ra hệ số tỉ lệ $k = ${k}$`, points: 1.0 }],
        keyFormula: '$k = \\frac{y}{x}$',
        commonMistake: 'Lấy $x / y$.',
      };
    },
  },
  {
    id: 'T_G7_C4_EASY_04',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C4',
    lesson: 'Đại lượng tỉ lệ nghịch',
    topic: 'Công thức tỉ lệ nghịch',
    problemType: 'Nhận biết quan hệ tỉ lệ nghịch',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(12, 36);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$y = \\frac{${a}}{x}$`,
        [
          { text: `$y = ${a}x$`, errorType: 'TỈ_LỆ_THUẬN' },
          { text: `$y = x + ${a}$`, errorType: 'CỘNG_HẰNG_SỐ' },
          { text: `$y = x - ${a}$`, errorType: 'TRỪ_HẰNG_SỐ' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C4',
        lesson: 'Đại lượng tỉ lệ nghịch',
        topic: 'Công thức tỉ lệ nghịch',
        problemType: 'Nhận biết quan hệ tỉ lệ nghịch',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Nếu đại lượng $y$ tỉ lệ nghịch với đại lượng $x$ theo hệ số tỉ lệ $a = ${a}$ thì công thức liên hệ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Nếu $y$ tỉ lệ nghịch với $x$ theo hệ số $a$ thì $y = \\frac{a}{x}$ hay $x \\cdot y = a$. Với $a = ${a}$ ta có $y = \\frac{${a}}{x}$.`,
        rubricSteps: [{ step: 'Xác định đúng công thức của đại lượng tỉ lệ nghịch', points: 0.5 }],
        keyFormula: '$y = \\frac{a}{x} \\iff xy = a$',
        commonMistake: 'Nhầm sang tỉ lệ thuận $y = ax$.',
      };
    },
  },

  // MEDIUM G7_C4
  {
    id: 'T_G7_C4_MED_01',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C4',
    lesson: 'Tính chất của dãy tỉ số bằng nhau',
    topic: 'Tìm x và y biết tổng',
    problemType: 'Hệ phương trình tỉ số và tổng',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 4);
      const b = rng.nextInt(3, 5);
      const k = rng.nextInt(3, 7);
      const sum = (a + b) * k;
      const xAns = a * k;
      const yAns = b * k;
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C4',
        lesson: 'Tính chất của dãy tỉ số bằng nhau',
        topic: 'Tìm x và y biết tổng',
        problemType: 'Hệ phương trình tỉ số và tổng',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Tìm hai số $x$ và $y$, biết: $\\frac{x}{${a}} = \\frac{y}{${b}}$ và $x + y = ${sum}$.`,
        correctAnswer: `x=${xAns}, y=${yAns}`,
        acceptedAnswers: [`x=${xAns}, y=${yAns}`, `${xAns}, ${yAns}`, `${xAns}; ${yAns}`],
        solution: `Áp dụng tính chất của dãy tỉ số bằng nhau:\n$$\\frac{x}{${a}} = \\frac{y}{${b}} = \\frac{x + y}{${a} + ${b}} = \\frac{${sum}}{${a + b}} = ${k}$$\nSuy ra:\n- $x = ${a} \\cdot ${k} = ${xAns}$\n- $y = ${b} \\cdot ${k} = ${yAns}$`,
        rubricSteps: [
          { step: `Áp dụng tính chất dãy tỉ số tìm hằng số $k = ${k}$`, points: 0.5 },
          { step: `Tính ra $x = ${xAns}$ và $y = ${yAns}$`, points: 0.5 },
        ],
        keyFormula: '$\\frac{x}{a} = \\frac{y}{b} = \\frac{x+y}{a+b}$',
        commonMistake: 'Cộng nhầm mẫu số dẫn đến tính sai $k$.',
      };
    },
  },
  {
    id: 'T_G7_C4_MED_02',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C4',
    lesson: 'Đại lượng tỉ lệ thuận',
    topic: 'Bài toán năng suất sản phẩm',
    problemType: 'Tỉ lệ thuận trong sản xuất',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const h1 = 3;
      const prod1 = 45;
      const h2 = 5;
      const prod2 = (prod1 / h1) * h2;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${prod2}$ sản phẩm`,
        [
          { text: `$${prod2 + 10}$ sản phẩm`, errorType: 'TÍNH_NHẦM' },
          { text: `$${prod1 * 2}$ sản phẩm`, errorType: 'GẤP_ĐÔI' },
          { text: `$60$ sản phẩm`, errorType: 'ĐOÁN_MÒ' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C4',
        lesson: 'Đại lượng tỉ lệ thuận',
        topic: 'Bài toán năng suất sản phẩm',
        problemType: 'Tỉ lệ thuận trong sản xuất',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Một máy dệt tự động trong $${h1}$ giờ dệt được $${prod1}$ mét vải. Với cùng năng suất đó, trong $${h2}$ giờ máy dệt được bao nhiêu mét vải?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Vì số mét vải dệt được tỉ lệ thuận với thời gian dệt nên:\n$$x = \\frac{${prod1} \\cdot ${h2}}{${h1}} = ${prod2}\\text{ mét vải}$$`,
        rubricSteps: [{ step: 'Lập tỉ lệ thuận và tính ra kết quả', points: 0.5 }],
        keyFormula: '$\\frac{y_1}{x_1} = \\frac{y_2}{x_2}$',
        commonMistake: 'Lập nhầm tỉ lệ nghịch.',
      };
    },
  },
  {
    id: 'T_G7_C4_MED_03',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C4',
    lesson: 'Đại lượng tỉ lệ nghịch',
    topic: 'Bài toán công nhân làm việc',
    problemType: 'Tỉ lệ nghịch số người và thời gian hoàn thành',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const p1 = 6;
      const d1 = 10;
      const p2 = 12;
      const d2 = (p1 * d1) / p2;
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C4',
        lesson: 'Đại lượng tỉ lệ nghịch',
        topic: 'Bài toán công nhân làm việc',
        problemType: 'Tỉ lệ nghịch số người và thời gian hoàn thành',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Một đội gồm $${p1}$ công nhân hoàn thành một công việc trong $${d1}$ ngày. Nếu đội được bổ sung thêm để có tất cả $${p2}$ công nhân (năng suất như nhau) thì sẽ hoàn thành công việc đó trong bao nhiêu ngày?`,
        correctAnswer: String(d2),
        acceptedAnswers: [String(d2), `${d2} ngày`, `${d2} ngay`],
        solution: `Vì số công nhân và thời gian hoàn thành công việc cùng khối lượng là hai đại lượng tỉ lệ nghịch, ta có:\n$$p_1 \\cdot d_1 = p_2 \\cdot d_2 \\implies ${p1} \\cdot ${d1} = ${p2} \\cdot d_2 \\implies d_2 = \\frac{${p1 * d1}}{${p2}} = ${d2}\\text{ ngày}$$`,
        rubricSteps: [
          { step: 'Lập công thức tỉ lệ nghịch $p_1 \\cdot d_1 = p_2 \\cdot d_2$', points: 0.5 },
          { step: `Tính ra thời gian hoàn thành là $${d2}$ ngày`, points: 0.5 },
        ],
        keyFormula: '$x_1 y_1 = x_2 y_2$',
        commonMistake: 'Lập tỉ lệ thuận khiến số người tăng mà số ngày cũng tăng.',
      };
    },
  },
  {
    id: 'T_G7_C4_MED_04',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C4',
    lesson: 'Tỉ lệ thức',
    topic: 'Biến đổi tỉ lệ thức',
    problemType: 'Lập tỉ lệ thức từ tích',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$\\frac{2}{3} = \\frac{4}{6}$',
        [
          { text: '$\\frac{2}{6} = \\frac{3}{4}$', errorType: 'NHÂN_CÙNG_VẾ' },
          { text: '$\\frac{2}{4} = \\frac{6}{3}$', errorType: 'ĐẢO_NGHỊCH' },
          { text: '$\\frac{3}{2} = \\frac{4}{6}$', errorType: 'SAI_TỶ_LỆ' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C4',
        lesson: 'Tỉ lệ thức',
        topic: 'Biến đổi tỉ lệ thức',
        problemType: 'Lập tỉ lệ thức từ tích',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: 'Từ đẳng thức $2 \\cdot 6 = 3 \\cdot 4$, tỉ lệ thức nào sau đây được lập đúng?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Từ đẳng thức $ad = bc$, ta có thể lập được $\\frac{a}{c} = \\frac{b}{d}$. Ở đây $2 \\cdot 6 = 3 \\cdot 4 \\implies \\frac{2}{3} = \\frac{4}{6}$.',
        rubricSteps: [{ step: 'Áp dụng tính chất từ tích lập tỉ lệ thức', points: 0.5 }],
        keyFormula: '$ad = bc \\implies \\frac{a}{c} = \\frac{b}{d}$',
        commonMistake: 'Nhầm lẫn vị trí của ngoại tỉ và trung tỉ.',
      };
    },
  },

  // HARD G7_C4
  {
    id: 'T_G7_C4_HARD_01',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C4',
    lesson: 'Tính chất của dãy tỉ số bằng nhau',
    topic: 'Chia tỉ lệ ba phần trong thực tế',
    problemType: 'Bài toán chia tiền thưởng hoặc số cây trồng',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = 3;
      const b = 4;
      const c = 5;
      const k = rng.nextInt(10, 20);
      const total = (a + b + c) * k;
      const ansA = a * k;
      const ansB = b * k;
      const ansC = c * k;
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C4',
        lesson: 'Tính chất của dãy tỉ số bằng nhau',
        topic: 'Chia tỉ lệ ba phần trong thực tế',
        problemType: 'Bài toán chia tiền thưởng hoặc số cây trồng',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Ba lớp 7A, 7B, 7C tham gia phong trào trồng cây và trồng được tất cả $${total}$ cây. Biết số cây trồng được của ba lớp lần lượt tỉ lệ với $3; 4; 5$. Tính số cây mỗi lớp đã trồng.`,
        correctAnswer: `7A: ${ansA}, 7B: ${ansB}, 7C: ${ansC}`,
        acceptedAnswers: [`${ansA}, ${ansB}, ${ansC}`, `${ansA}; ${ansB}; ${ansC}`],
        solution: `Gọi số cây ba lớp 7A, 7B, 7C trồng được lần lượt là $x, y, z$ ($x, y, z \\in \\mathbb{N}^*$).\nTheo đề bài: $\\frac{x}{3} = \\frac{y}{4} = \\frac{z}{5}$ và $x + y + z = ${total}$.\nÁp dụng tính chất dãy tỉ số bằng nhau:\n$$\\frac{x}{3} = \\frac{y}{4} = \\frac{z}{5} = \\frac{x + y + z}{3 + 4 + 5} = \\frac{${total}}{12} = ${k}$$\nSuy ra: $x = ${ansA}$ cây, $y = ${ansB}$ cây, $z = ${ansC}$ cây.`,
        rubricSteps: [
          { step: 'Gọi ẩn và lập dãy tỉ số bằng nhau', points: 0.5 },
          { step: `Tìm hằng số $k = ${k}$ và kết luận số cây của 3 lớp`, points: 0.5 },
        ],
        keyFormula: '$\\frac{x}{a} = \\frac{y}{b} = \\frac{z}{c} = \\frac{x+y+z}{a+b+c}$',
        commonMistake: 'Đặt tỉ lệ nghịch thay vì tỉ lệ thuận.',
      };
    },
  },
  {
    id: 'T_G7_C4_HARD_02',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C4',
    lesson: 'Đại lượng tỉ lệ nghịch',
    topic: 'Bài toán ba đại lượng tỉ lệ nghịch',
    problemType: 'Phân chia công việc theo tỉ lệ nghịch',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Tỉ lệ với $\\frac{1}{2} : \\frac{1}{3} : \\frac{1}{4}$',
        [
          { text: 'Tỉ lệ với $2 : 3 : 4$', errorType: 'NHẦM_TỈ_LỆ_THUẬN' },
          { text: 'Tỉ lệ với $4 : 3 : 2$', errorType: 'ĐẢO_NGƯỢC_ĐƠN_GIẢN' },
          { text: 'Tỉ lệ với $2^2 : 3^2 : 4^2$', errorType: 'BÌNH_PHƯƠNG_SAI' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C4',
        lesson: 'Đại lượng tỉ lệ nghịch',
        topic: 'Bài toán ba đại lượng tỉ lệ nghịch',
        problemType: 'Phân chia công việc theo tỉ lệ nghịch',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: 'Ba cánh đồng có diện tích như nhau được cày bởi ba đội máy cày có thời gian hoàn thành lần lượt là 2 ngày, 3 ngày, 4 ngày. Số máy cày của ba đội (năng suất các máy như nhau) tỉ lệ với dãy số nào?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Vì khối lượng công việc như nhau nên số máy cày và thời gian hoàn thành là hai đại lượng tỉ lệ nghịch. Do đó số máy cày của ba đội sẽ tỉ lệ với nghịch đảo của thời gian: $\\frac{1}{2} : \\frac{1}{3} : \\frac{1}{4}$.',
        rubricSteps: [{ step: 'Xác định quan hệ tỉ lệ nghịch với nghịch đảo các hệ số', points: 0.5 }],
        keyFormula: 'Tỉ lệ nghịch với $a, b, c \\iff$ tỉ lệ thuận với $\\frac{1}{a}, \\frac{1}{b}, \\frac{1}{c}$.',
        commonMistake: 'Cho tỉ lệ thuận với $2:3:4$.',
      };
    },
  },
  {
    id: 'T_G7_C4_HARD_03',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C4',
    lesson: 'Tính chất của dãy tỉ số bằng nhau',
    topic: 'Chứng minh đẳng thức từ tỉ lệ thức',
    problemType: 'Phương pháp đặt k',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C4',
        lesson: 'Tính chất của dãy tỉ số bằng nhau',
        topic: 'Chứng minh đẳng thức từ tỉ lệ thức',
        problemType: 'Phương pháp đặt k',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: 'Cho tỉ lệ thức $\\frac{a}{b} = \\frac{c}{d}$. Chứng minh rằng: $\\frac{a + b}{b} = \\frac{c + d}{d}$.',
        correctAnswer: 'Dat a/b = c/d = k roi the vao hai ve',
        acceptedAnswers: ['dat k', 'k', 'chung minh bang nhau'],
        solution: `Cách 1: Đặt $\\frac{a}{b} = \\frac{c}{d} = k \\implies a = bk, c = dk$.\nThay vào vế trái: $\\frac{a + b}{b} = \\frac{bk + b}{b} = \\frac{b(k + 1)}{b} = k + 1$.\nThay vào vế phải: $\\frac{c + d}{d} = \\frac{dk + d}{d} = \\frac{d(k + 1)}{d} = k + 1$.\nVì cả hai vế cùng bằng $k + 1$ nên $\\frac{a + b}{b} = \\frac{c + d}{d}$.`,
        rubricSteps: [
          { step: 'Đặt $a/b = c/d = k$ và biểu diễn $a = bk, c = dk$', points: 0.5 },
          { step: 'Tính hai vế cùng bằng $k + 1$ và kết luận', points: 0.5 },
        ],
        keyFormula: 'Phương pháp đặt ẩn phụ $k$ để chứng minh đẳng thức phân số.',
        commonMistake: 'Biến đổi vòng tròn không rõ ràng.',
      };
    },
  },
  {
    id: 'T_G7_C4_HARD_04',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C4',
    lesson: 'Tính chất của dãy tỉ số bằng nhau',
    topic: 'Tìm x, y, z tỉ lệ phức tạp',
    problemType: 'Dãy tỉ số có hệ số',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$\\frac{x}{6} = \\frac{y}{4} = \\frac{z}{3}$',
        [
          { text: '$\\frac{x}{2} = \\frac{y}{3} = \\frac{z}{4}$', errorType: 'ĐẶT_HỆ_SỐ_LÀM_MẪU' },
          { text: '$\\frac{x}{4} = \\frac{y}{3} = \\frac{z}{2}$', errorType: 'ĐẢO_NGƯỢC_SAI' },
          { text: '$\\frac{x}{3} = \\frac{y}{4} = \\frac{z}{6}$', errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C4',
        lesson: 'Tính chất của dãy tỉ số bằng nhau',
        topic: 'Tìm x, y, z tỉ lệ phức tạp',
        problemType: 'Dãy tỉ số có hệ số',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: 'Cho đẳng thức $2x = 3y = 4z$. Dãy tỉ số bằng nhau tương đương là:',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Chia cả ba vế cho $\\text{BCNN}(2, 3, 4) = 12$:\n$$\\frac{2x}{12} = \\frac{3y}{12} = \\frac{4z}{12} \\implies \\frac{x}{6} = \\frac{y}{4} = \\frac{z}{3}$$',
        rubricSteps: [{ step: 'Chia cho BCNN của các hệ số để đưa về dãy tỉ số chuẩn', points: 0.5 }],
        keyFormula: 'Chia cho $\\text{BCNN}(a, b, c)$ để rút gọn hệ số về mẫu số.',
        commonMistake: 'Lấy trực tiếp các hệ số đặt xuống mẫu.',
      };
    },
  },

  // ----------------------------------------------------------------------------
  // CHƯƠNG 5: BIỂU THỨC ĐẠI SỐ VÀ ĐA THỨC MỘT BIẾN (G7_C5) - HK2
  // ----------------------------------------------------------------------------
  {
    id: 'T_G7_C5_EASY_01',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Biểu thức đại số',
    topic: 'Tính giá trị của biểu thức đại số',
    problemType: 'Thay số vào biểu thức',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const b = rng.nextInt(3, 8);
      const x = rng.nextInt(2, 4);
      const val = a * x + b;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${val}$`,
        [
          { text: `$${a * x}$`, errorType: 'QUÊN_CỘNG_HẰNG_SỐ' },
          { text: `$${val + 2}$`, errorType: 'TÍNH_NHẦM' },
          { text: `$${(a + b) * x}$`, errorType: 'CỘNG_TRƯỚC_KHI_NHÂN' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Biểu thức đại số',
        topic: 'Tính giá trị của biểu thức đại số',
        problemType: 'Thay số vào biểu thức',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Giá trị của biểu thức $A = ${a}x + ${b}$ tại $x = ${x}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Thay $x = ${x}$ vào biểu thức $A$:\n$$A = ${a} \\cdot ${x} + ${b} = ${a * x} + ${b} = ${val}$$`,
        rubricSteps: [{ step: `Thay $x = ${x}$ và tính đúng kết quả $${val}$`, points: 0.5 }],
        keyFormula: 'Thay giá trị của biến vào biểu thức rồi thực hiện phép tính.',
        commonMistake: 'Cộng $a+b$ rồi mới nhân với $x$.',
      };
    },
  },
  {
    id: 'T_G7_C5_EASY_02',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Đa thức một biến',
    topic: 'Bậc của đa thức',
    problemType: 'Xác định bậc của đa thức',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const degree = rng.nextInt(3, 6);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `Bậc $${degree}$`,
        [
          { text: `Bậc $${degree - 1}$`, errorType: 'CHỌN_BẬC_THẤP_HƠN' },
          { text: `Bậc $${degree + 1}$`, errorType: 'TÍNH_DƯ' },
          { text: `Bậc $1$`, errorType: 'NHẦM_VỚI_BẬC_NHẤT' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Đa thức một biến',
        topic: 'Bậc của đa thức',
        problemType: 'Xác định bậc của đa thức',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Bậc của đa thức $P(x) = 5x^{${degree}} - 3x^2 + 7x - 1$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bậc của đa thức một biến (đã thu gọn và có hệ số cao nhất khác 0) là số mũ lớn nhất của biến trong đa thức đó. Ở đây số mũ lớn nhất là $${degree}$, vậy bậc của $P(x)$ là $${degree}$.`,
        rubricSteps: [{ step: 'Xác định số mũ lớn nhất của biến trong đa thức', points: 0.5 }],
        keyFormula: 'Bậc của đa thức = số mũ lớn nhất của biến.',
        commonMistake: 'Lấy tổng tất cả các số mũ.',
      };
    },
  },
  {
    id: 'T_G7_C5_EASY_03',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Nghiệm của đa thức một biến',
    topic: 'Kiểm tra nghiệm',
    problemType: 'Xác định số x có là nghiệm hay không',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const root = rng.nextInt(2, 5);
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Nghiệm của đa thức một biến',
        topic: 'Kiểm tra nghiệm',
        problemType: 'Xác định số x có là nghiệm hay không',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 1.0,
        textbooks: [book],
        content: `Tìm nghiệm của đa thức $P(x) = 2x - ${root * 2}$.`,
        correctAnswer: String(root),
        acceptedAnswers: [String(root), `x=${root}`, `x = ${root}`],
        solution: `Cho $P(x) = 0$:\n$$2x - ${root * 2} = 0 \\implies 2x = ${root * 2} \\implies x = ${root}$$\nVậy nghiệm của đa thức là $x = ${root}$.`,
        rubricSteps: [
          { step: 'Đặt đa thức bằng 0', points: 0.5 },
          { step: `Giải tìm ra $x = ${root}$`, points: 0.5 },
        ],
        keyFormula: '$x = a$ là nghiệm của $P(x) \\iff P(a) = 0$.',
        commonMistake: 'Chuyển vế không đổi dấu.',
      };
    },
  },
  {
    id: 'T_G7_C5_EASY_04',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Đa thức một biến',
    topic: 'Hệ số tự do và hệ số cao nhất',
    problemType: 'Nhận biết hệ số cao nhất',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const lead = rng.nextInt(3, 8);
      const free = rng.nextInt(2, 9);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `Hệ số cao nhất là $${lead}$, hệ số tự do là $${free}$`,
        [
          { text: `Hệ số cao nhất là $${free}$, hệ số tự do là $${lead}$`, errorType: 'ĐẢO_NGƯỢC_VAI_TRÒ' },
          { text: `Hệ số cao nhất là $3$, hệ số tự do là $0$`, errorType: 'NHẦM_VỚI_SỐ_MŨ' },
          { text: `Hệ số cao nhất là $-1$, hệ số tự do là $${lead}$`, errorType: 'TÍNH_SAI' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Đa thức một biến',
        topic: 'Hệ số tự do và hệ số cao nhất',
        problemType: 'Nhận biết hệ số cao nhất',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Trong đa thức $Q(x) = ${lead}x^3 - 4x + ${free}$, hệ số cao nhất và hệ số tự do lần lượt là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Hạng tử có bậc cao nhất là $${lead}x^3$ nên hệ số cao nhất là $${lead}$. Hạng tử không chứa biến là $${free}$ nên hệ số tự do là $${free}$.`,
        rubricSteps: [{ step: 'Xác định đúng hệ số cao nhất và hệ số tự do', points: 0.5 }],
        keyFormula: 'Hệ số cao nhất đi với lũy thừa bậc cao nhất; hệ số tự do không chứa biến.',
        commonMistake: 'Nhầm số mũ của biến với hệ số.',
      };
    },
  },

  // MEDIUM G7_C5
  {
    id: 'T_G7_C5_MED_01',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Phép cộng và phép trừ đa thức một biến',
    topic: 'Cộng hai đa thức',
    problemType: 'Tìm tổng P(x) + Q(x)',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a1 = rng.nextInt(2, 5);
      const a2 = rng.nextInt(1, 4);
      const b1 = rng.nextInt(3, 7);
      const b2 = rng.nextInt(2, 5);
      const sumLead = a1 + a2;
      const sumFree = b1 + b2;
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Phép cộng và phép trừ đa thức một biến',
        topic: 'Cộng hai đa thức',
        problemType: 'Tìm tổng P(x) + Q(x)',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Cho hai đa thức: $P(x) = ${a1}x^2 + ${b1}$ và $Q(x) = ${a2}x^2 + ${b2}$. Tính $P(x) + Q(x)$.`,
        correctAnswer: `${sumLead}x^2 + ${sumFree}`,
        acceptedAnswers: [`${sumLead}x^2 + ${sumFree}`, `${sumLead}x^2+${sumFree}`],
        solution: `Cộng các hạng tử cùng bậc:\n$$P(x) + Q(x) = (${a1}x^2 + ${a2}x^2) + (${b1} + ${b2}) = ${sumLead}x^2 + ${sumFree}$$`,
        rubricSteps: [
          { step: 'Nhóm các đơn thức đồng dạng cùng bậc', points: 0.5 },
          { step: `Cộng hệ số ra kết quả $${sumLead}x^2 + ${sumFree}$`, points: 0.5 },
        ],
        keyFormula: 'Cộng các hệ số của các hạng tử cùng bậc.',
        commonMistake: 'Cộng cả các số mũ của biến.',
      };
    },
  },
  {
    id: 'T_G7_C5_MED_02',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Phép nhân đa thức một biến',
    topic: 'Nhân đơn thức với đa thức',
    problemType: 'Khai triển tích',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 4);
      const b = rng.nextInt(3, 6);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${a}x^3 - ${a * b}x$`,
        [
          { text: `$${a}x^2 - ${a * b}x$`, errorType: 'QUÊN_CỘNG_SỐ_MŨ' },
          { text: `$${a}x^3 - ${b}x$`, errorType: 'QUÊN_NHÂN_HỆ_SỐ_SAU' },
          { text: `$${a}x^3 + ${a * b}x$`, errorType: 'SAI_DẤU' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Phép nhân đa thức một biến',
        topic: 'Nhân đơn thức với đa thức',
        problemType: 'Khai triển tích',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Thực hiện phép tính: $${a}x \\cdot (x^2 - ${b})$`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Nhân đơn thức với từng hạng tử của đa thức:\n$$${a}x \\cdot (x^2 - ${b}) = ${a}x \\cdot x^2 - ${a}x \\cdot ${b} = ${a}x^3 - ${a * b}x$$`,
        rubricSteps: [{ step: 'Nhân đơn thức với từng hạng tử và cộng đúng số mũ', points: 0.5 }],
        keyFormula: '$A(B + C) = AB + AC$',
        commonMistake: 'Quên nhân hệ số với hạng tử phía sau.',
      };
    },
  },
  {
    id: 'T_G7_C5_MED_03',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Nghiệm của đa thức một biến',
    topic: 'Đa thức bậc hai có nghiệm nguyên',
    problemType: 'Tìm nghiệm của đa thức tích',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const r1 = rng.nextInt(1, 3);
      const r2 = rng.nextInt(4, 6);
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Nghiệm của đa thức một biến',
        topic: 'Đa thức bậc hai có nghiệm nguyên',
        problemType: 'Tìm nghiệm của đa thức tích',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Tìm tất cả các nghiệm của đa thức: $P(x) = (x - ${r1})(x - ${r2})$`,
        correctAnswer: `x = ${r1} hoac x = ${r2}`,
        acceptedAnswers: [`${r1}; ${r2}`, `${r1}, ${r2}`, `x=${r1}, x=${r2}`],
        solution: `Cho $P(x) = 0 \\implies (x - ${r1})(x - ${r2}) = 0$.\nSuy ra $x - ${r1} = 0$ hoặc $x - ${r2} = 0$.\nDo đó $x = ${r1}$ hoặc $x = ${r2}$.\nVậy nghiệm của đa thức là $x \\in \\{${r1}; ${r2}\\}$.`,
        rubricSteps: [
          { step: 'Cho từng nhân tử bằng 0', points: 0.5 },
          { step: `Tìm ra hai nghiệm $x = ${r1}$ và $x = ${r2}$`, points: 0.5 },
        ],
        keyFormula: '$A \\cdot B = 0 \\iff A = 0 \\text{ hoặc } B = 0$',
        commonMistake: 'Chỉ tìm được một nghiệm.',
      };
    },
  },
  {
    id: 'T_G7_C5_MED_04',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Phép chia đa thức một biến',
    topic: 'Chia đa thức cho đơn thức',
    problemType: 'Thực hiện phép chia',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 4);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x + ${a}$`,
        [
          { text: `$2x^2 + ${a}$`, errorType: 'QUÊN_TRỪ_SỐ_MŨ' },
          { text: `$2x + ${a}x$`, errorType: 'QUÊN_CHIA_X_Ở_HẠNG_TỬ_SAU' },
          { text: `$2x + ${a}$`, errorType: 'CHIA_SAI_HỆ_SỐ' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Phép chia đa thức một biến',
        topic: 'Chia đa thức cho đơn thức',
        problemType: 'Thực hiện phép chia',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Kết quả của phép chia $(2x^2 + ${2 * a}x) : (2x)$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Chia từng hạng tử của đa thức cho đơn thức $2x$:\n$$(2x^2 + ${2 * a}x) : 2x = \\frac{2x^2}{2x} + \\frac{${2 * a}x}{2x} = x + ${a}$$`,
        rubricSteps: [{ step: 'Chia từng hạng tử đúng quy tắc', points: 0.5 }],
        keyFormula: '$(A + B) : C = A:C + B:C$',
        commonMistake: 'Chỉ chia hạng tử đầu tiên.',
      };
    },
  },

  // HARD G7_C5
  {
    id: 'T_G7_C5_HARD_01',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Nghiệm của đa thức một biến',
    topic: 'Chứng minh đa thức vô nghiệm',
    problemType: 'Đánh giá đa thức bậc hai không âm cộng số dương',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const c = rng.nextInt(2, 8);
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Nghiệm của đa thức một biến',
        topic: 'Chứng minh đa thức vô nghiệm',
        problemType: 'Đánh giá đa thức bậc hai không âm cộng số dương',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Chứng minh rằng đa thức $P(x) = x^2 + ${c}$ không có nghiệm.`,
        correctAnswer: 'Vi x^2 >= 0 nen P(x) >= c > 0 voi moi x',
        acceptedAnswers: ['vo nghiem', 'vô nghiệm', 'P(x) > 0'],
        solution: `Với mọi số thực $x$, ta luôn có $x^2 \\ge 0$.\nSuy ra $P(x) = x^2 + ${c} \\ge 0 + ${c} = ${c} > 0$.\nVì $P(x) > 0$ với mọi $x$ nên không tồn tại giá trị nào của $x$ để $P(x) = 0$.\nVậy đa thức $P(x)$ không có nghiệm.`,
        rubricSteps: [
          { step: 'Đánh giá $x^2 \\ge 0$ với mọi $x$', points: 0.5 },
          { step: `Suy ra $P(x) \\ge ${c} > 0$ và kết luận vô nghiệm`, points: 0.5 },
        ],
        keyFormula: '$x^2 \\ge 0 \\implies x^2 + c > 0$ khi $c > 0$.',
        commonMistake: 'Cho $x^2 = -c$ rồi lúng túng không giải thích được vì sao vô nghiệm.',
      };
    },
  },
  {
    id: 'T_G7_C5_HARD_02',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Phép cộng và phép trừ đa thức một biến',
    topic: 'Tìm đa thức chưa biết M(x)',
    problemType: 'Tìm đa thức thỏa mãn phương trình',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$M(x) = -2x^2 + 5x - 3$',
        [
          { text: '$M(x) = 4x^2 + 5x + 3$', errorType: 'CỘNG_NHẦM' },
          { text: '$M(x) = -2x^2 - 5x + 3$', errorType: 'SAI_DẤU' },
          { text: '$M(x) = 2x^2 - 5x + 3$', errorType: 'ĐỔI_DẤU_TOÀN_BỘ' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Phép cộng và phép trừ đa thức một biến',
        topic: 'Tìm đa thức chưa biết M(x)',
        problemType: 'Tìm đa thức thỏa mãn phương trình',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: 'Tìm đa thức $M(x)$ biết: $M(x) + (3x^2 - 2x + 1) = x^2 + 3x - 2$',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Ta có:\n$$M(x) = (x^2 + 3x - 2) - (3x^2 - 2x + 1) = x^2 + 3x - 2 - 3x^2 + 2x - 1 = -2x^2 + 5x - 3$$',
        rubricSteps: [{ step: 'Chuyển vế đổi dấu và thu gọn đúng đa thức M(x)', points: 0.5 }],
        keyFormula: '$M + A = B \\implies M = B - A$',
        commonMistake: 'Quên đổi dấu các số hạng trong ngoặc khi có dấu trừ đằng trước.',
      };
    },
  },
  {
    id: 'T_G7_C5_HARD_03',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Biểu thức đại số',
    topic: 'Tìm giá trị lớn nhất / nhỏ nhất',
    problemType: 'Cực trị tam thức bậc hai hoàn hảo',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const m = rng.nextInt(10, 20);
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Biểu thức đại số',
        topic: 'Tìm giá trị lớn nhất / nhỏ nhất',
        problemType: 'Cực trị tam thức bậc hai hoàn hảo',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Tìm giá trị lớn nhất của biểu thức: $B = ${m} - (x + ${a})^2$.`,
        correctAnswer: String(m),
        acceptedAnswers: [String(m), `B=${m}`, `GTLN=${m}`],
        solution: `Với mọi $x$, ta có $(x + ${a})^2 \\ge 0 \\implies -(x + ${a})^2 \\le 0$.\nDo đó $B = ${m} - (x + ${a})^2 \\le ${m} - 0 = ${m}$.\nDấu bằng xảy ra khi $x + ${a} = 0 \\implies x = -${a}$.\nVậy giá trị lớn nhất của $B$ là $${m}$.`,
        rubricSteps: [
          { step: 'Đánh giá $-(x+a)^2 \\le 0$', points: 0.5 },
          { step: `Tìm ra GTLN bằng $${m}$ khi $x = -${a}$`, points: 0.5 },
        ],
        keyFormula: '$m - A^2 \\le m \\implies \\text{GTLN} = m$',
        commonMistake: 'Nhầm lẫn giữa giá trị lớn nhất và nhỏ nhất.',
      };
    },
  },
  {
    id: 'T_G7_C5_HARD_04',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Nghiệm của đa thức một biến',
    topic: 'Định lý Bézout sơ cấp / Hệ số nghiệm',
    problemType: 'Tìm hệ số a để đa thức có nghiệm cho trước',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$m = 1$',
        [
          { text: '$m = -1$', errorType: 'SAI_DẤU' },
          { text: '$m = 2$', errorType: 'TÍNH_NHẦM' },
          { text: '$m = 0$', errorType: 'TRIỆT_TIÊU_BẬC_HAI' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Nghiệm của đa thức một biến',
        topic: 'Định lý Bézout sơ cấp / Hệ số nghiệm',
        problemType: 'Tìm hệ số a để đa thức có nghiệm cho trước',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: 'Biết đa thức $P(x) = m x^2 - 5x + 4$ nhận $x = 1$ là một nghiệm. Giá trị của hệ số $m$ là:',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Vì $x = 1$ là nghiệm của $P(x)$ nên $P(1) = 0$:\n$$m \\cdot 1^2 - 5 \\cdot 1 + 4 = 0 \\implies m - 5 + 4 = 0 \\implies m - 1 = 0 \\implies m = 1$$',
        rubricSteps: [{ step: 'Thay $x = 1$ vào phương trình và tìm ra $m = 1$', points: 0.5 }],
        keyFormula: '$P(x_0) = 0$ khi $x_0$ là nghiệm.',
        commonMistake: 'Tính nhầm dấu của hằng số tự do.',
      };
    },
  },

  // ----------------------------------------------------------------------------
  // CHƯƠNG 6: TAM GIÁC BẰNG NHAU & ĐƯỜNG ĐỒNG QUY (G7_C6) - HK2
  // ----------------------------------------------------------------------------
  {
    id: 'T_G7_C6_EASY_01',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Tổng các góc trong một tam giác',
    topic: 'Tính số đo góc thứ ba',
    problemType: 'Tìm góc trong tam giác',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(50, 70);
      const b = rng.nextInt(40, 60);
      const c = 180 - a - b;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${c}^\\circ$`,
        [
          { text: `$${a + b}^\\circ$`, errorType: 'CỘNG_HAI_GÓC' },
          { text: `$${90 - c}^\\circ$`, errorType: 'TÍNH_NHẦM' },
          { text: `$${c + 10}^\\circ$`, errorType: 'SAI_LỆCH' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Tổng các góc trong một tam giác',
        topic: 'Tính số đo góc thứ ba',
        problemType: 'Tìm góc trong tam giác',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Trong tam giác $ABC$, biết $\\widehat{A} = ${a}^\\circ$ và $\\widehat{B} = ${b}^\\circ$. Số đo của góc $\\widehat{C}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Tổng ba góc trong một tam giác bằng $180^\\circ$:\n$$\\widehat{C} = 180^\\circ - (\\widehat{A} + \\widehat{B}) = 180^\\circ - (${a}^\\circ + ${b}^\\circ) = 180^\\circ - ${a + b}^\\circ = ${c}^\\circ$$`,
        rubricSteps: [{ step: 'Áp dụng định lý tổng 3 góc trong tam giác', points: 0.5 }],
        keyFormula: '$\\widehat{A} + \\widehat{B} + \\widehat{C} = 180^\\circ$',
        commonMistake: 'Lấy $90^\\circ$ trừ (nhầm với tam giác vuông).',
      };
    },
  },
  {
    id: 'T_G7_C6_EASY_02',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Tam giác cân',
    topic: 'Tính chất tam giác cân',
    problemType: 'Tính góc ở đáy tam giác cân',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const top = rng.nextInt(30, 50) * 2;
      const baseAngle = (180 - top) / 2;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${baseAngle}^\\circ$`,
        [
          { text: `$${180 - top}^\\circ$`, errorType: 'QUÊN_CHIA_ĐÔI' },
          { text: `$${top}^\\circ$`, errorType: 'CHO_LÀ_BẰNG_GÓC_Ở_ĐỈNH' },
          { text: `$${baseAngle - 10}^\\circ$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Tam giác cân',
        topic: 'Tính chất tam giác cân',
        problemType: 'Tính góc ở đáy tam giác cân',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Tam giác $ABC$ cân tại $A$ có góc ở đỉnh $\\widehat{A} = ${top}^\\circ$. Số đo mỗi góc ở đáy là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Trong tam giác cân, hai góc ở đáy bằng nhau:\n$$\\widehat{B} = \\widehat{C} = \\frac{180^\\circ - \\widehat{A}}{2} = \\frac{180^\\circ - ${top}^\\circ}{2} = \\frac{${180 - top}^\\circ}{2} = ${baseAngle}^\\circ$$`,
        rubricSteps: [{ step: 'Áp dụng công thức tính góc ở đáy tam giác cân', points: 0.5 }],
        keyFormula: '$\\widehat{B} = \\widehat{C} = \\frac{180^\\circ - \\widehat{A}}{2}$',
        commonMistake: 'Quên chia cho 2.',
      };
    },
  },
  {
    id: 'T_G7_C6_EASY_03',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Hai tam giác bằng nhau',
    topic: 'Trường hợp bằng nhau c-c-c',
    problemType: 'Nhận diện trường hợp bằng nhau',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Hai tam giác bằng nhau',
        topic: 'Trường hợp bằng nhau c-c-c',
        problemType: 'Nhận diện trường hợp bằng nhau',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 1.0,
        textbooks: [book],
        content: 'Nêu tên ba trường hợp bằng nhau cơ bản của hai tam giác thường.',
        correctAnswer: 'c-c-c, c-g-c, g-c-g',
        acceptedAnswers: ['c-c-c, c-g-c, g-c-g', 'canh-canh-canh, canh-goc-canh, goc-canh-goc'],
        solution: 'Ba trường hợp bằng nhau cơ bản của hai tam giác là:\n1. Cạnh - Cạnh - Cạnh (c-c-c)\n2. Cạnh - Góc - Cạnh (c-g-c)\n3. Góc - Cạnh - Góc (g-c-g)',
        rubricSteps: [{ step: 'Nêu đầy đủ 3 trường hợp c-c-c, c-g-c, g-c-g', points: 1.0 }],
        keyFormula: '3 trường hợp bằng nhau: c-c-c, c-g-c, g-c-g.',
        commonMistake: 'Nêu trường hợp g-g-g (chỉ là đồng dạng, không bằng nhau).',
      };
    },
  },
  {
    id: 'T_G7_C6_EASY_04',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Sự đồng quy của ba đường trung tuyến',
    topic: 'Khái niệm trọng tâm',
    problemType: 'Tính khoảng cách từ đỉnh đến trọng tâm',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const am = rng.nextInt(3, 6) * 3;
      const ag = (am * 2) / 3;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${ag}\\text{ cm}$`,
        [
          { text: `$${am / 3}\\text{ cm}$`, errorType: 'TÍNH_ĐOẠN_GM' },
          { text: `$${am / 2}\\text{ cm}$`, errorType: 'CHIA_ĐÔI' },
          { text: `$${am - 2}\\text{ cm}$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Sự đồng quy của ba đường trung tuyến',
        topic: 'Khái niệm trọng tâm',
        problemType: 'Tính khoảng cách từ đỉnh đến trọng tâm',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Cho tam giác $ABC$ có đường trung tuyến $AM = ${am}\\text{ cm}$. Gọi $G$ là trọng tâm của tam giác. Độ dài đoạn thẳng $AG$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Trọng tâm của tam giác cách mỗi đỉnh một khoảng bằng $2/3$ độ dài đường trung tuyến đi qua đỉnh đó:\n$$AG = \\frac{2}{3} AM = \\frac{2}{3} \\cdot ${am} = ${ag}\\text{ cm}$$`,
        rubricSteps: [{ step: 'Áp dụng tỉ lệ trọng tâm $AG = 2/3 AM$', points: 0.5 }],
        keyFormula: '$AG = \\frac{2}{3} AM$',
        commonMistake: 'Lấy $1/3$ (nhầm sang đoạn GM).',
      };
    },
  },

  // MEDIUM G7_C6
  {
    id: 'T_G7_C6_MED_01',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Quan hệ giữa cạnh và góc trong tam giác',
    topic: 'Bất đẳng thức tam giác',
    problemType: 'Kiểm tra bộ ba độ dài đoạn thẳng',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '3 cm, 4 cm, 5 cm',
        [
          { text: '2 cm, 3 cm, 6 cm', errorType: '2+3=5<6_VI_PHẠM_BĐT' },
          { text: '1 cm, 2 cm, 3 cm', errorType: '1+2=3_KHÔNG_LỚN_HƠN' },
          { text: '4 cm, 5 cm, 10 cm', errorType: '4+5=9<10_VI_PHẠM' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Quan hệ giữa cạnh và góc trong tam giác',
        topic: 'Bất đẳng thức tam giác',
        problemType: 'Kiểm tra bộ ba độ dài đoạn thẳng',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: 'Bộ ba độ dài đoạn thẳng nào sau đây CÓ THỂ là độ dài ba cạnh của một tam giác?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Theo bất đẳng thức tam giác, tổng độ dài hai cạnh bất kỳ luôn lớn hơn độ dài cạnh còn lại. Chỉ có bộ ba $3\\text{ cm}, 4\\text{ cm}, 5\\text{ cm}$ thỏa mãn vì $3 + 4 = 7 > 5$. Các bộ ba còn lại tổng hai cạnh nhỏ hơn không lớn hơn cạnh lớn nhất.',
        rubricSteps: [{ step: 'Kiểm tra tổng hai cạnh bé hơn lớn hơn cạnh lớn nhất', points: 0.5 }],
        keyFormula: '$a + b > c$',
        commonMistake: 'Chọn bộ có tổng bằng cạnh thứ ba (tam giác suy biến thành đoạn thẳng).',
      };
    },
  },
  {
    id: 'T_G7_C6_MED_02',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Sự đồng quy của ba đường trung trực',
    topic: 'Tâm đường tròn ngoại tiếp',
    problemType: 'Tính chất điểm cách đều ba đỉnh',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Sự đồng quy của ba đường trung trực',
        topic: 'Tâm đường tròn ngoại tiếp',
        problemType: 'Tính chất điểm cách đều ba đỉnh',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: 'Giao điểm của ba đường trung trực trong một tam giác có tính chất đặc biệt gì đối với ba đỉnh của tam giác đó?',
        correctAnswer: 'Cach deu ba dinh cua tam giac',
        acceptedAnswers: ['cach deu ba dinh', 'cách đều ba đỉnh', 'tam duong tron ngoai tiep'],
        solution: 'Giao điểm của ba đường trung trực trong một tam giác cách đều ba đỉnh của tam giác đó (và là tâm của đường tròn ngoại tiếp tam giác).',
        rubricSteps: [{ step: 'Nêu đúng tính chất cách đều ba đỉnh của giao điểm 3 đường trung trực', points: 1.0 }],
        keyFormula: 'Giao điểm 3 đường trung trực cách đều 3 đỉnh.',
        commonMistake: 'Nhầm với giao điểm 3 đường phân giác (cách đều 3 cạnh).',
      };
    },
  },
  {
    id: 'T_G7_C6_MED_03',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Hai tam giác bằng nhau',
    topic: 'Trường hợp cạnh - góc - cạnh',
    problemType: 'Tìm điều kiện để hai tam giác bằng nhau',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Góc xen giữa hai cạnh phải bằng nhau: $\\widehat{A} = \\widehat{D}$',
        [
          { text: 'Góc bất kỳ bằng nhau: $\\widehat{B} = \\widehat{E}$', errorType: 'GÓC_KHÔNG_XEN_GIỮA' },
          { text: 'Thêm một góc vuông bất kỳ', errorType: 'KHÔNG_CẦN_THIẾT' },
          { text: 'Cạnh thứ ba phải bằng nhau', errorType: 'SANG_TRƯỜNG_HỢP_CCC' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Hai tam giác bằng nhau',
        topic: 'Trường hợp cạnh - góc - cạnh',
        problemType: 'Tìm điều kiện để hai tam giác bằng nhau',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: 'Cho $\\triangle ABC$ và $\\triangle DEF$ có $AB = DE$ và $AC = DF$. Để $\\triangle ABC = \\triangle DEF$ theo trường hợp cạnh - góc - cạnh (c-g-c) thì cần thêm điều kiện gì?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Theo trường hợp cạnh - góc - cạnh, góc bằng nhau phải là góc xen giữa hai cặp cạnh tương ứng bằng nhau. Ở đây góc xen giữa $AB, AC$ là $\\widehat{A}$, góc xen giữa $DE, DF$ là $\\widehat{D}$, do đó cần thêm điều kiện $\\widehat{A} = \\widehat{D}$.',
        rubricSteps: [{ step: 'Xác định chính xác góc xen giữa hai cạnh bằng nhau', points: 0.5 }],
        keyFormula: 'Góc bằng nhau phải là góc xen giữa hai cạnh.',
        commonMistake: 'Chọn góc không xen giữa.',
      };
    },
  },
  {
    id: 'T_G7_C6_MED_04',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Sự đồng quy của ba đường cao',
    topic: 'Khái niệm trực tâm',
    problemType: 'Vị trí trực tâm trong tam giác vuông',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Sự đồng quy của ba đường cao',
        topic: 'Khái niệm trực tâm',
        problemType: 'Vị trí trực tâm trong tam giác vuông',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: 'Trực tâm của một tam giác vuông nằm ở vị trí nào?',
        correctAnswer: 'Tai dinh goc vuong',
        acceptedAnswers: ['tai dinh goc vuong', 'đỉnh góc vuông', 'dinh goc vuong'],
        solution: 'Trong tam giác vuông, hai cạnh góc vuông chính là hai đường cao xuất phát từ hai góc nhọn. Do đó, trực tâm (giao điểm của ba đường cao) trùng với đỉnh góc vuông.',
        rubricSteps: [{ step: 'Khẳng định trực tâm trùng với đỉnh góc vuông', points: 1.0 }],
        keyFormula: 'Tam giác vuông có trực tâm tại đỉnh góc vuông.',
        commonMistake: 'Nghĩ rằng trực tâm nằm trên cạnh huyền.',
      };
    },
  },

  // HARD G7_C6
  {
    id: 'T_G7_C6_HARD_01',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Tam giác cân',
    topic: 'Chứng minh tam giác đều',
    problemType: 'Tam giác cân có 1 góc bằng 60 độ',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Tam giác đều',
        [
          { text: 'Tam giác vuông cân', errorType: 'CHO_LÀ_VUÔNG_CÂN' },
          { text: 'Tam giác nhọn thường', errorType: 'THIẾU_ĐẶC_BIỆT' },
          { text: 'Tam giác tù', errorType: 'SAI_HOÀN_TOÀN' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Tam giác cân',
        topic: 'Chứng minh tam giác đều',
        problemType: 'Tam giác cân có 1 góc bằng 60 độ',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: 'Một tam giác cân có một góc bằng $60^\\circ$ thì tam giác đó là:',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Dấu hiệu nhận biết: Tam giác cân có một góc bằng $60^\\circ$ (dù là góc ở đỉnh hay góc ở đáy) thì hai góc còn lại cũng đều bằng $60^\\circ$, do đó tam giác đó là tam giác đều.',
        rubricSteps: [{ step: 'Áp dụng dấu hiệu tam giác cân có góc 60° là tam giác đều', points: 0.5 }],
        keyFormula: 'Tam giác cân + góc $60^\\circ \\implies$ Tam giác đều.',
        commonMistake: 'Nghĩ rằng chỉ khi góc ở đỉnh bằng 60° mới là tam giác đều.',
      };
    },
  },
  {
    id: 'T_G7_C6_HARD_02',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Hai tam giác bằng nhau',
    topic: 'Chứng minh đoạn thẳng bằng nhau qua tam giác bằng nhau',
    problemType: 'Chứng minh tia phân giác',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Hai tam giác bằng nhau',
        topic: 'Chứng minh đoạn thẳng bằng nhau qua tam giác bằng nhau',
        problemType: 'Chứng minh tia phân giác',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: 'Cho góc nhọn $\\widehat{xOy}$. Trên tia $Ox$ lấy điểm $A$, trên tia $Oy$ lấy điểm $B$ sao cho $OA = OB$. Lấy điểm $M$ nằm trong góc sao cho $MA = MB$. Chứng minh rằng tia $OM$ là tia phân giác của góc $\\widehat{xOy}$.',
        correctAnswer: 'Tam giac OAM = Tam giac OBM (c-c-c) nen goc AOM = goc BOM',
        acceptedAnswers: ['c-c-c', 'tam giac OAM bang tam giac OBM', 'phan giac'],
        solution: `Xét $\\triangle OAM$ và $\\triangle OBM$, ta có:\n- $OA = OB$ (giả thiết)\n- $MA = MB$ (giả thiết)\n- $OM$ là cạnh chung\nDo đó $\\triangle OAM = \\triangle OBM$ (c-c-c).\nSuy ra $\\widehat{AOM} = \\widehat{BOM}$ (hai góc tương ứng).\nVì $M$ nằm trong góc $\\widehat{xOy}$ và $\\widehat{AOM} = \\widehat{BOM}$ nên $OM$ là tia phân giác của góc $\\widehat{xOy}$.`,
        rubricSteps: [
          { step: 'Chứng minh $\\triangle OAM = \\triangle OBM$ theo trường hợp c-c-c', points: 0.5 },
          { step: 'Suy ra $\\widehat{AOM} = \\widehat{BOM}$ và kết luận $OM$ là tia phân giác', points: 0.5 },
        ],
        keyFormula: 'Chứng minh tam giác bằng nhau $\\implies$ các góc tương ứng bằng nhau.',
        commonMistake: 'Quên lập luận điểm $M$ nằm trong góc.',
      };
    },
  },
  {
    id: 'T_G7_C6_HARD_03',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Sự đồng quy của ba đường trung tuyến',
    topic: 'Bài toán tỉ số diện tích tam giác con tạo bởi trọng tâm',
    problemType: 'Trọng tâm chia tam giác thành 6 tam giác nhỏ',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Cả 6 tam giác nhỏ đều có diện tích bằng nhau',
        [
          { text: 'Chỉ có 3 tam giác kề đỉnh bằng nhau', errorType: 'TÍNH_THIẾU' },
          { text: 'Các tam giác có diện tích khác nhau hoàn toàn', errorType: 'SAI_LẬP_LUẬN' },
          { text: 'Diện tích tam giác nhỏ tỉ lệ với cạnh đáy', errorType: 'PHỎNG_ĐOÁN' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Sự đồng quy của ba đường trung tuyến',
        topic: 'Bài toán tỉ số diện tích tam giác con tạo bởi trọng tâm',
        problemType: 'Trọng tâm chia tam giác thành 6 tam giác nhỏ',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: 'Ba đường trung tuyến của một tam giác chia tam giác đó thành $6$ tam giác nhỏ. Nhận xét nào sau đây về diện tích của $6$ tam giác này là đúng?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Do tính chất đường trung tuyến chia đôi diện tích tam giác và trọng tâm chia trung tuyến theo tỉ số $2:1$, cả $6$ tam giác con tạo bởi trọng tâm và ba đường trung tuyến đều có diện tích bằng nhau và bằng $1/6$ diện tích tam giác ban đầu.',
        rubricSteps: [{ step: 'Xác định đúng tính chất 6 tam giác con có diện tích bằng nhau', points: 0.5 }],
        keyFormula: '$S_i = \\frac{1}{6} S_{\\triangle ABC}$ với $i = 1..6$.',
        commonMistake: 'Nghĩ rằng các hình dạng khác nhau thì diện tích không bằng nhau.',
      };
    },
  },
  {
    id: 'T_G7_C6_HARD_04',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Quan hệ giữa cạnh và góc trong tam giác',
    topic: 'Bất đẳng thức tam giác và cực trị hình học',
    problemType: 'Tìm vị trí đặt trạm bơm ngắn nhất',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Quan hệ giữa cạnh và góc trong tam giác',
        topic: 'Bất đẳng thức tam giác và cực trị hình học',
        problemType: 'Tìm vị trí đặt trạm bơm ngắn nhất',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: 'Hai khu dân cư $A$ và $B$ nằm cùng một phía bờ sông $d$. Người ta cần xây một trạm cấp nước $M$ trên bờ sông $d$ sao cho tổng độ dài đường ống dẫn nước $MA + MB$ là ngắn nhất. Hãy nêu cách xác định vị trí điểm $M$.',
        correctAnswer: 'Lay A doi xung qua d roi noi voi B cat d tai M',
        acceptedAnswers: ['doi xung', 'đối xứng', 'A doi xung'],
        solution: `Cách xác định điểm $M$:\n1. Lấy điểm $A'$ đối xứng với điểm $A$ qua bờ sông $d$.\n2. Nối $A'$ với $B$, đoạn thẳng $A'B$ cắt bờ sông $d$ tại điểm $M$.\nKhi đó với mọi điểm $M'$ bất kỳ trên $d$, ta có: $M'A + M'B = M'A' + M'B \\ge A'B = MA' + MB = MA + MB$.\nVậy $M$ chính là giao điểm của $A'B$ và $d$, khi đó $MA + MB$ đạt giá trị nhỏ nhất.`,
        rubricSteps: [
          { step: 'Dựng điểm $A\'$ đối xứng với $A$ qua đường thẳng $d$', points: 0.5 },
          { step: 'Nối $A\'B$ cắt $d$ tại $M$ và giải thích theo BĐT tam giác', points: 0.5 },
        ],
        keyFormula: 'Bài toán cực trị Heron: lấy điểm đối xứng qua đường thẳng.',
        commonMistake: 'Hạ đường cao vuông góc thay vì lấy điểm đối xứng.',
      };
    },
  },
];
