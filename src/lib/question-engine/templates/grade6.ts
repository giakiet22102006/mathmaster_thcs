// ==============================================================================
// MathMaster THCS - Ngân Hàng Template Câu Hỏi Toán Lớp 6
// File: src/lib/question-engine/templates/grade6.ts
// Phủ toàn bộ 6 chương: G6_C1 -> G6_C6 (Mỗi chương >= 4 template / mức độ khó)
// ==============================================================================

import type { QuestionTemplate, TextbookCode } from '../types';
import type { PRNG } from '../rng';
import { buildShuffledMcq, gcd, lcm, formatFraction } from '../template-helpers';
import { KNTTContexts } from '../contexts/KNTT';
import { CDContexts } from '../contexts/CD';
import { CTSTContexts } from '../contexts/CTST';
import { grade6VdVdcTemplates } from './grade6-vd-vdc';

const rawGrade6Templates: QuestionTemplate[] = [
  // ============================================================================
  // CHƯƠNG 1: TẬP HỢP CÁC SỐ TỰ NHIÊN (G6_C1) - HK1
  // ============================================================================
  // EASY
  {
    id: 'T_G6_C1_EASY_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Tập hợp và phần tử',
    topic: 'Tập hợp số tự nhiên',
    problemType: 'Viết tập hợp và đếm phần tử',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 6);
      const b = a + rng.nextInt(5, 10);
      const count = b - a - 1;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${count}$`,
        [
          { text: `$${count + 1}$`, errorType: 'QUÊN_TRỪ_HAI_ĐẦU_MÚT' },
          { text: `$${count - 1}$`, errorType: 'TÍNH_NHẦM_SỐ_PHẦN_TỬ' },
          { text: `$${b - a}$`, errorType: 'CHỈ_LẤY_HIỆU_HAI_SỐ' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Tập hợp và phần tử',
        topic: 'Tập hợp số tự nhiên',
        problemType: 'Viết tập hợp và đếm phần tử',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Cho tập hợp $A = \\{x \\in \\mathbb{N} \\mid ${a} < x < ${b}\\}$. Số phần tử của tập hợp $A$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Các phần tử của tập hợp $A$ là các số tự nhiên lớn hơn $${a}$ và nhỏ hơn $${b}$, gồm: $${a + 1}, ${a + 2}, \\dots, ${b - 1}$. Số phần tử là: $(${b - 1}) - (${a + 1}) + 1 = ${count}$ phần tử.`,
        rubricSteps: [{ step: 'Xác định đúng số lượng phần tử của tập hợp', points: 0.5 }],
        keyFormula: '$n = (b - 1) - (a + 1) + 1$',
        commonMistake: 'Lấy trực tiếp $b - a$ mà quên trừ cả hai đầu mút.',
      };
    },
  },
  {
    id: 'T_G6_C1_EASY_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Lũy thừa với số mũ tự nhiên',
    topic: 'Lũy thừa và thứ tự phép tính',
    problemType: 'Tính giá trị biểu thức lũy thừa',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const base = rng.nextInt(2, 5);
      const m = rng.nextInt(2, 4);
      const n = rng.nextInt(2, 3);
      const sumPow = m + n;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${base}^{${sumPow}}$`,
        [
          { text: `$${base}^{${m * n}}$`, errorType: 'NHÂN_HAI_SỐ_MŨ' },
          { text: `$${base * 2}^{${sumPow}}$`, errorType: 'NHÂN_HAI_CƠ_SỐ' },
          { text: `$${base}^{${Math.abs(m - n)}}$`, errorType: 'TRỪ_HAI_SỐ_MŨ' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Lũy thừa với số mũ tự nhiên',
        topic: 'Lũy thừa và thứ tự phép tính',
        problemType: 'Tính giá trị biểu thức lũy thừa',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Viết tích $${base}^{${m}} \\cdot ${base}^{${n}}$ dưới dạng một lũy thừa:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Áp dụng công thức nhân hai lũy thừa cùng cơ số: $a^m \\cdot a^n = a^{m+n}$. Do đó: $${base}^{${m}} \\cdot ${base}^{${n}} = ${base}^{${m} + ${n}} = ${base}^{${sumPow}}$.`,
        rubricSteps: [{ step: 'Áp dụng đúng công thức nhân lũy thừa cùng cơ số', points: 0.5 }],
        keyFormula: '$a^m \\cdot a^n = a^{m+n}$',
        commonMistake: 'Nhầm lẫn giữa phép cộng số mũ và phép nhân số mũ.',
      };
    },
  },
  {
    id: 'T_G6_C1_EASY_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Tính chất chia hết & Số nguyên tố',
    topic: 'Chia hết, ƯCLN và BCNN',
    problemType: 'Nhận biết số nguyên tố',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const primes = [11, 13, 17, 19, 23, 29, 31, 37];
      const composites = [9, 15, 21, 25, 27, 33, 35];
      const p = rng.nextChoice(primes);
      const c1 = composites[0];
      const c2 = composites[1];
      const c3 = composites[2];
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${p}$`,
        [
          { text: `$${c1}$`, errorType: 'NHẦM_HỢP_SỐ_LẺ' },
          { text: `$${c2}$`, errorType: 'NHẦM_HỢP_SỐ_LẺ' },
          { text: `$${c3}$`, errorType: 'NHẦM_HỢP_SỐ_LẺ' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Tính chất chia hết & Số nguyên tố',
        topic: 'Chia hết, ƯCLN và BCNN',
        problemType: 'Nhận biết số nguyên tố',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: 'Trong các số sau, số nào là số nguyên tố?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Số nguyên tố là số tự nhiên lớn hơn $1$, chỉ có hai ước là $1$ và chính nó. Số $${p}$ chỉ có hai ước là $1$ và $${p}$ nên là số nguyên tố. Các số còn lại đều là hợp số.`,
        rubricSteps: [{ step: 'Nhận biết chính xác số nguyên tố', points: 0.5 }],
        keyFormula: 'Số nguyên tố chỉ có 2 ước dương là 1 và chính nó.',
        commonMistake: 'Nhầm số lẻ bất kỳ là số nguyên tố.',
      };
    },
  },
  {
    id: 'T_G6_C1_EASY_04',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Thứ tự thực hiện phép tính',
    topic: 'Lũy thừa và thứ tự phép tính',
    problemType: 'Tính giá trị biểu thức',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(10, 30);
      const b = rng.nextInt(2, 5);
      const c = rng.nextInt(3, 8);
      const ans = a + b * c;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Thứ tự thực hiện phép tính',
        topic: 'Lũy thừa và thứ tự phép tính',
        problemType: 'Tính giá trị biểu thức',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 1.0,
        textbooks: [book],
        content: `Thực hiện phép tính: $${a} + ${b} \\cdot ${c}$`,
        correctAnswer: String(ans),
        acceptedAnswers: [String(ans), `${ans}`],
        solution: `Ta thực hiện phép nhân trước, phép cộng sau:\n$$${a} + ${b} \\cdot ${c} = ${a} + ${b * c} = ${ans}$$`,
        rubricSteps: [
          { step: `Thực hiện phép nhân $${b} \\cdot ${c} = ${b * c}$`, points: 0.5 },
          { step: `Cộng kết quả ra đáp số $${ans}$`, points: 0.5 },
        ],
        keyFormula: 'Thứ tự phép tính: nhân chia trước, cộng trừ sau.',
        commonMistake: 'Cộng $a+b$ trước rồi mới nhân $c$.',
      };
    },
  },

  // MEDIUM
  {
    id: 'T_G6_C1_MED_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Ước chung lớn nhất & Bội chung nhỏ nhất',
    topic: 'Chia hết, ƯCLN và BCNN',
    problemType: 'Tìm ƯCLN của hai số',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const g = rng.nextInt(3, 8);
      const m = rng.nextInt(2, 5);
      let n = rng.nextInt(2, 5);
      while (gcd(m, n) !== 1) n++;
      const numA = g * m;
      const numB = g * n;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${g}$`,
        [
          { text: `$${g * 2}$`, errorType: 'TÍNH_THỪA_THỪA_SỐ' },
          { text: `$1$`, errorType: 'CHO_LÀ_NGUYÊN_TỐ_CÙNG_NHAU' },
          { text: `$${g * m * n}$`, errorType: 'NHẦM_VỚI_BCNN' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Ước chung lớn nhất & Bội chung nhỏ nhất',
        topic: 'Chia hết, ƯCLN và BCNN',
        problemType: 'Tìm ƯCLN của hai số',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Ước chung lớn nhất của hai số $${numA}$ và $${numB}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Phân tích hai số ra thừa số nguyên tố rồi chọn các thừa số nguyên tố chung với số mũ nhỏ nhất, ta được $\\text{ƯCLN}(${numA}, ${numB}) = ${g}$.`,
        rubricSteps: [
          { step: 'Phân tích các số ra thừa số nguyên tố', points: 0.25 },
          { step: `Tìm ra ƯCLN là $${g}$`, points: 0.25 },
        ],
        keyFormula: '$\\text{ƯCLN}(a, b)$ lấy thừa số chung với số mũ nhỏ nhất.',
        commonMistake: 'Lấy nhầm thừa số riêng hoặc số mũ lớn nhất (nhầm với BCNN).',
      };
    },
  },
  {
    id: 'T_G6_C1_MED_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Thứ tự thực hiện phép tính',
    topic: 'Lũy thừa và thứ tự phép tính',
    problemType: 'Tìm số tự nhiên x',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const x = rng.nextInt(3, 9);
      const b = rng.nextInt(5, 15);
      const right = a * x + b;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Thứ tự thực hiện phép tính',
        topic: 'Lũy thừa và thứ tự phép tính',
        problemType: 'Tìm số tự nhiên x',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Tìm số tự nhiên $x$, biết: $${a}x + ${b} = ${right}$`,
        correctAnswer: String(x),
        acceptedAnswers: [String(x), `x=${x}`, `x = ${x}`],
        solution: `Ta có:\n$$\\begin{aligned} ${a}x + ${b} &= ${right} \\\\ ${a}x &= ${right} - ${b} \\\\ ${a}x &= ${a * x} \\\\ x &= ${a * x} : ${a} \\\\ x &= ${x} \\end{aligned}$$`,
        rubricSteps: [
          { step: `Chuyển vế tìm $${a}x = ${a * x}$`, points: 0.5 },
          { step: `Chia cho hệ số tìm ra $x = ${x}$`, points: 0.5 },
        ],
        keyFormula: '$ax + b = c \\implies ax = c - b \\implies x = (c - b) / a$',
        commonMistake: 'Quên trừ $b$ hoặc chia nhầm số.',
      };
    },
  },
  {
    id: 'T_G6_C1_MED_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Ước chung lớn nhất & Bội chung nhỏ nhất',
    topic: 'Chia hết, ƯCLN và BCNN',
    problemType: 'Tìm BCNN của hai số',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(4, 8);
      const b = a + rng.nextInt(2, 6);
      const l = lcm(a, b);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${l}$`,
        [
          { text: `$${a * b}$`, errorType: 'CHỈ_NHÂN_HAI_SỐ' },
          { text: `$${gcd(a, b)}$`, errorType: 'NHẦM_SANG_ƯCLN' },
          { text: `$${l * 2}$`, errorType: 'GẤP_ĐÔI_BCNN' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Ước chung lớn nhất & Bội chung nhỏ nhất',
        topic: 'Chia hết, ƯCLN và BCNN',
        problemType: 'Tìm BCNN của hai số',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Bội chung nhỏ nhất của hai số $${a}$ và $${b}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Phân tích $${a}$ và $${b}$ ra thừa số nguyên tố.\\nBước 2: Chọn các thừa số nguyên tố chung và riêng với số mũ lớn nhất: $\\text{BCNN}(${a}, ${b}) = ${l}$.`,
        rubricSteps: [
          { step: 'Phân tích hai số ra thừa số nguyên tố', points: 0.25 },
          { step: `Tìm BCNN là $${l}$`, points: 0.25 },
        ],
        keyFormula: '$\\text{BCNN}(a, b) = \\frac{a \\cdot b}{\\text{ƯCLN}(a, b)}$',
        commonMistake: 'Lấy tích $a \\cdot b$ khi hai số chưa nguyên tố cùng nhau.',
      };
    },
  },
  {
    id: 'T_G6_C1_MED_04',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Thứ tự thực hiện phép tính',
    topic: 'Lũy thừa và thứ tự phép tính',
    problemType: 'Thực hiện phép tính có ngoặc',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const p = rng.nextInt(2, 4);
      const inner = rng.nextInt(3, 7);
      const outer = rng.nextInt(20, 50);
      const ans = outer - p * inner;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Thứ tự thực hiện phép tính',
        topic: 'Lũy thừa và thứ tự phép tính',
        problemType: 'Thực hiện phép tính có ngoặc',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Tính giá trị biểu thức: $${outer} - ${p} \\cdot (${inner * 2} - ${inner})$`,
        correctAnswer: String(ans),
        acceptedAnswers: [String(ans), `${ans}`],
        solution: `Thực hiện trong ngoặc trước, nhân chia trước, cộng trừ sau:\n$$${outer} - ${p} \\cdot (${inner * 2} - ${inner}) = ${outer} - ${p} \\cdot ${inner} = ${outer} - ${p * inner} = ${ans}$$`,
        rubricSteps: [
          { step: `Tính trong ngoặc: $${inner * 2} - ${inner} = ${inner}$`, points: 0.5 },
          { step: `Thực hiện phép nhân và trừ ra $${ans}$`, points: 0.5 },
        ],
        keyFormula: 'Thứ tự ưu tiên: trong ngoặc -> lũy thừa -> nhân chia -> cộng trừ.',
        commonMistake: 'Lấy $outer - p$ trước rồi mới nhân.',
      };
    },
  },

  // HARD
  {
    id: 'T_G6_C1_HARD_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Ước chung lớn nhất & Bội chung nhỏ nhất',
    topic: 'Chia hết, ƯCLN và BCNN',
    problemType: 'Bài toán thực tế chia tổ / phần thưởng (ƯCLN)',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const g = rng.nextInt(4, 8);
      const penPerGroup = rng.nextInt(3, 6);
      const bookPerGroup = rng.nextInt(2, 5);
      const totalPens = g * penPerGroup;
      const totalBooks = g * bookPerGroup;
      const name = KNTTContexts.getStudentName(rng);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${g}$`,
        [
          { text: `$${g * 2}$`, errorType: 'GẤP_ĐÔI_SỐ_PHẦN' },
          { text: `$${gcd(totalPens, totalBooks) - 1}$`, errorType: 'TÍNH_SAI_ƯCLN' },
          { text: `$${penPerGroup}$`, errorType: 'NHẦM_SỐ_BÚT_MỖI_PHẦN' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Ước chung lớn nhất & Bội chung nhỏ nhất',
        topic: 'Chia hết, ƯCLN và BCNN',
        problemType: 'Bài toán thực tế chia tổ / phần thưởng (ƯCLN)',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: `Trong buổi sinh hoạt lớp, bạn ${name} chuẩn bị $${totalPens}$ chiếc bút bi và $${totalBooks}$ quyển vở để chia đều thành các phần thưởng sao cho số bút và số vở ở mỗi phần thưởng là như nhau. Số phần thưởng nhiều nhất có thể chia được là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Gọi số phần thưởng nhiều nhất chia được là $x$ ($x \\in \\mathbb{N}^*$). Vì số bút và vở chia đều nên $${totalPens} \\,\\vdots\\, x$ và $${totalBooks} \\,\\vdots\\, x$. Do $x$ lớn nhất nên $x = \\text{ƯCLN}(${totalPens}, ${totalBooks})$. Phân tích ra thừa số nguyên tố, ta được $x = ${g}$ phần thưởng.`,
        rubricSteps: [
          { step: 'Chuyển bài toán thực tế về bài toán tìm ƯCLN', points: 0.25 },
          { step: `Tính đúng kết quả $\\text{ƯCLN}(${totalPens}, ${totalBooks}) = ${g}$`, points: 0.25 },
        ],
        keyFormula: 'Số phần chia đều nhiều nhất = $\\text{ƯCLN}(a, b)$.',
        commonMistake: 'Nhầm lẫn giữa tìm ƯCLN và BCNN trong bài toán chia phần.',
      };
    },
  },
  {
    id: 'T_G6_C1_HARD_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Ước chung lớn nhất & Bội chung nhỏ nhất',
    topic: 'Chia hết, ƯCLN và BCNN',
    problemType: 'Bài toán thực tế lặp lại chu kỳ (BCNN)',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(6, 10);
      const b = rng.nextInt(12, 15);
      const l = lcm(a, b);
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Ước chung lớn nhất & Bội chung nhỏ nhất',
        topic: 'Chia hết, ƯCLN và BCNN',
        problemType: 'Bài toán thực tế lặp lại chu kỳ (BCNN)',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Hai xe buýt cùng khởi hành từ một bến lúc $6$ giờ sáng. Xe thứ nhất cứ sau $${a}$ phút lại xuất bến một chuyến, xe thứ hai cứ sau $${b}$ phút lại xuất bến một chuyến. Hỏi sau ít nhất bao nhiêu phút thì hai xe lại cùng xuất bến một lúc?`,
        correctAnswer: String(l),
        acceptedAnswers: [String(l), `${l} phút`, `${l}phut`],
        solution: `Thời gian ít nhất để hai xe lại cùng xuất bến một lúc chính là bội chung nhỏ nhất của $${a}$ và $${b}$.\nTa có $\\text{BCNN}(${a}, ${b}) = ${l}$.\nVậy sau ít nhất $${l}$ phút thì hai xe lại cùng xuất bến một lúc.`,
        rubricSteps: [
          { step: `Lập luận thời gian là $\\text{BCNN}(${a}, ${b})$`, points: 0.5 },
          { step: `Tính ra kết quả $${l}$ phút`, points: 0.5 },
        ],
        keyFormula: 'Khoảng thời gian gặp lại ngắn nhất = $\\text{BCNN}(t_1, t_2)$.',
        commonMistake: 'Lấy tích $a \\cdot b$ mà quên tìm BCNN.',
      };
    },
  },
  {
    id: 'T_G6_C1_HARD_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Tính chất chia hết & Số nguyên tố',
    topic: 'Chia hết, ƯCLN và BCNN',
    problemType: 'Chứng minh chia hết cho số cố định',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const k = rng.nextInt(3, 7);
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Tính chất chia hết & Số nguyên tố',
        topic: 'Chia hết, ƯCLN và BCNN',
        problemType: 'Chứng minh chia hết cho số cố định',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Chứng minh rằng tổng $A = 2 + 2^2 + 2^3 + \\dots + 2^{${k * 2}}$ chia hết cho $3$.`,
        correctAnswer: 'A chia hết cho 3',
        acceptedAnswers: ['A chia het cho 3', 'chia het cho 3', 'A chia hết cho 3', 'Dung', 'Đúng'],
        solution: `Ta nhóm các số hạng thành từng cặp:\n$$\\begin{aligned} A &= (2 + 2^2) + (2^3 + 2^4) + \\dots + (2^{${k * 2 - 1}} + 2^{${k * 2}}) \\\\ &= 2(1 + 2) + 2^3(1 + 2) + \\dots + 2^{${k * 2 - 1}}(1 + 2) \\\\ &= 3 \\cdot (2 + 2^3 + \\dots + 2^{${k * 2 - 1}}) \\end{aligned}$$\nVì tích có thừa số $3$ nên tổng $A$ chia hết cho $3$.`,
        rubricSteps: [
          { step: 'Nhóm các số hạng thành từng cặp đôi có thừa số chung', points: 0.5 },
          { step: 'Đặt thừa số $1 + 2 = 3$ ra ngoài và kết luận $A \\,\\vdots\\, 3$', points: 0.5 },
        ],
        keyFormula: 'Nhóm hạng tử để xuất hiện thừa số chung $1+a$.',
        commonMistake: 'Nhóm sai số lượng phần tử dẫn đến lẻ số hạng cuối.',
      };
    },
  },
  {
    id: 'T_G6_C1_HARD_04',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Lũy thừa với số mũ tự nhiên',
    topic: 'Lũy thừa và thứ tự phép tính',
    problemType: 'So sánh hai lũy thừa lớn',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$2^{30} < 3^{20}$',
        [
          { text: '$2^{30} > 3^{20}$', errorType: 'SO_SÁNH_CƠ_SỐ' },
          { text: '$2^{30} = 3^{20}$', errorType: 'NGHĨ_LÀ_BẰNG_NHAU' },
          { text: 'Không so sánh được', errorType: 'THIẾU_KIẾN_THỨC' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Lũy thừa với số mũ tự nhiên',
        topic: 'Lũy thừa và thứ tự phép tính',
        problemType: 'So sánh hai lũy thừa lớn',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: 'Khẳng định nào sau đây là đúng khi so sánh hai lũy thừa $2^{30}$ và $3^{20}$?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Ta đưa về cùng số mũ $10$:\n$$2^{30} = (2^3)^{10} = 8^{10}$$\n$$3^{20} = (3^2)^{10} = 9^{10}$$\nVì $8 < 9$ nên $8^{10} < 9^{10}$, do đó $2^{30} < 3^{20}$.',
        rubricSteps: [{ step: 'Đưa về cùng số mũ 10 và so sánh đúng cơ số', points: 0.5 }],
        keyFormula: '$a^{m \\cdot k} = (a^m)^k$',
        commonMistake: 'Lấy cơ số lớn hơn thì lớn hơn hoặc số mũ lớn hơn thì lớn hơn.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 2: SỐ NGUYÊN (G6_C2) - HK1
  // ============================================================================
  // EASY
  {
    id: 'T_G6_C2_EASY_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Tập hợp các số nguyên',
    topic: 'Số nguyên âm và số nguyên dương',
    problemType: 'Số đối của một số nguyên',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const n = rng.nextInt(7, 25);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${n}$`,
        [
          { text: `$-${n}$`, errorType: 'GIỮ_NGUYÊN_DẤU' },
          { text: `$0$`, errorType: 'NHẦM_VỚI_GỐC' },
          { text: `$1$`, errorType: 'NHẦM_VỚI_NGHỊCH_ĐẢO' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Tập hợp các số nguyên',
        topic: 'Số nguyên âm và số nguyên dương',
        problemType: 'Số đối của một số nguyên',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Số đối của số nguyên $-${n}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Số đối của số âm $-a$ là số dương $a$. Do đó số đối của $-${n}$ là $${n}$.`,
        rubricSteps: [{ step: 'Nhận biết đúng số đối của số nguyên', points: 0.5 }],
        keyFormula: 'Số đối của $-a$ là $a$.',
        commonMistake: 'Nhầm số đối với giá trị nghịch đảo.',
      };
    },
  },
  {
    id: 'T_G6_C2_EASY_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Phép cộng và phép trừ hai số nguyên',
    topic: 'Quy tắc cộng trừ số nguyên',
    problemType: 'Cộng hai số nguyên khác dấu',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(15, 30);
      const b = rng.nextInt(5, 12);
      const ans = -a + b;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${ans}$`,
        [
          { text: `$${-(a + b)}$`, errorType: 'CỘNG_HAI_GIÁ_TRỊ_TUYỆT_ĐỐI' },
          { text: `$${a - b}$`, errorType: 'SAI_DẤU_KẾT_QUẢ' },
          { text: `$${a + b}$`, errorType: 'BỎ_QUA_DẤU_ÂM' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Phép cộng và phép trừ hai số nguyên',
        topic: 'Quy tắc cộng trừ số nguyên',
        problemType: 'Cộng hai số nguyên khác dấu',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Kết quả của phép tính $(-${a}) + ${b}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Vì $|-${a}| > |${b}|$ nên ta lấy hiệu hai phần số tự nhiên và đặt dấu âm đằng trước:\n$$(-${a}) + ${b} = -(${a} - ${b}) = ${ans}$$`,
        rubricSteps: [{ step: 'Thực hiện đúng quy tắc cộng hai số nguyên khác dấu', points: 0.5 }],
        keyFormula: 'Cộng hai số nguyên khác dấu: lấy số lớn hơn trừ số bé hơn rồi mang dấu của số có giá trị tuyệt đối lớn hơn.',
        commonMistake: 'Lấy $a+b$ rồi đặt dấu trừ.',
      };
    },
  },
  {
    id: 'T_G6_C2_EASY_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Phép nhân hai số nguyên',
    topic: 'Quy tắc nhân số nguyên',
    problemType: 'Nhân hai số nguyên cùng dấu âm',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(3, 8);
      const b = rng.nextInt(4, 9);
      const ans = a * b;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${ans}$`,
        [
          { text: `$-${ans}$`, errorType: 'QUÊN_QUY_TẮC_ÂM_NHÂN_ÂM' },
          { text: `$${ans + 2}$`, errorType: 'TÍNH_NHẦM' },
          { text: `$-${a + b}$`, errorType: 'THỰC_HIỆN_PHÉP_CỘNG' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Phép nhân hai số nguyên',
        topic: 'Quy tắc nhân số nguyên',
        problemType: 'Nhân hai số nguyên cùng dấu âm',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Tính $(-${a}) \\cdot (-${b})$:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Tích của hai số nguyên cùng dấu âm là một số nguyên dương:\n$$(-${a}) \\cdot (-${b}) = ${a} \\cdot ${b} = ${ans}$$`,
        rubricSteps: [{ step: 'Áp dụng quy tắc nhân hai số âm ra số dương', points: 0.5 }],
        keyFormula: '$(-a) \\cdot (-b) = a \\cdot b$',
        commonMistake: 'Đặt dấu âm trước tích của hai số âm.',
      };
    },
  },
  {
    id: 'T_G6_C2_EASY_04',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Quy tắc dấu ngoặc',
    topic: 'Quy tắc cộng trừ số nguyên',
    problemType: 'Bỏ dấu ngoặc đơn giản',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(10, 25);
      const b = rng.nextInt(5, 15);
      const ans = a - b;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Quy tắc dấu ngoặc',
        topic: 'Quy tắc cộng trừ số nguyên',
        problemType: 'Bỏ dấu ngoặc đơn giản',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 1.0,
        textbooks: [book],
        content: `Tính: $${a} - (+${b})$`,
        correctAnswer: String(ans),
        acceptedAnswers: [String(ans), `${ans}`],
        solution: `Bỏ ngoặc có dấu trừ đằng trước:\n$$${a} - (+${b}) = ${a} - ${b} = ${ans}$$`,
        rubricSteps: [{ step: `Bỏ ngoặc và tính đúng ra $${ans}$`, points: 1.0 }],
        keyFormula: '$-(+b) = -b$',
        commonMistake: 'Nhầm dấu khi bỏ ngoặc.',
      };
    },
  },

  // MEDIUM
  {
    id: 'T_G6_C2_MED_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Phép cộng và phép trừ hai số nguyên',
    topic: 'Quy tắc cộng trừ số nguyên',
    problemType: 'Tìm x nguyên',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(10, 30);
      const right = -rng.nextInt(5, 20);
      const ans = right + a;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Phép cộng và phép trừ hai số nguyên',
        topic: 'Quy tắc cộng trừ số nguyên',
        problemType: 'Tìm x nguyên',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Tìm số nguyên $x$, biết: $x - ${a} = ${right}$`,
        correctAnswer: String(ans),
        acceptedAnswers: [String(ans), `x=${ans}`, `x = ${ans}`],
        solution: `Ta có:\n$$\\begin{aligned} x - ${a} &= ${right} \\\\ x &= ${right} + ${a} \\\\ x &= ${ans} \\end{aligned}$$`,
        rubricSteps: [
          { step: `Chuyển vế đổi dấu thành $x = ${right} + ${a}$`, points: 0.5 },
          { step: `Thực hiện phép tính tìm được $x = ${ans}$`, points: 0.5 },
        ],
        keyFormula: '$x - a = b \\implies x = b + a$',
        commonMistake: 'Chuyển vế nhưng quên đổi dấu trừ thành cộng.',
      };
    },
  },
  {
    id: 'T_G6_C2_MED_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Quy tắc dấu ngoặc',
    topic: 'Quy tắc cộng trừ số nguyên',
    problemType: 'Tính hợp lý tổng nhiều số nguyên',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(20, 50);
      const b = rng.nextInt(10, 30);
      const ans = b;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${ans}$`,
        [
          { text: `$${-ans}$`, errorType: 'SAI_DẤU_KẾT_QUẢ' },
          { text: `$${a + b}$`, errorType: 'CỘNG_TẤT_CẢ' },
          { text: `$0$`, errorType: 'TRIỆT_TIÊU_HẾT' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Quy tắc dấu ngoặc',
        topic: 'Quy tắc cộng trừ số nguyên',
        problemType: 'Tính hợp lý tổng nhiều số nguyên',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Tính nhanh giá trị biểu thức: $(${a} + ${b}) - ${a}$`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bỏ dấu ngoặc rồi nhóm các số đối nhau:\n$$(${a} + ${b}) - ${a} = ${a} + ${b} - ${a} = (${a} - ${a}) + ${b} = 0 + ${b} = ${ans}$$`,
        rubricSteps: [{ step: `Triệt tiêu $${a} - ${a} = 0$ và ra kết quả $${ans}$`, points: 0.5 }],
        keyFormula: '$(a + b) - a = b$',
        commonMistake: 'Cộng $a+b$ trước rồi mới trừ mất nhiều thời gian.',
      };
    },
  },
  {
    id: 'T_G6_C2_MED_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Phép nhân hai số nguyên',
    topic: 'Tính chất phép nhân',
    problemType: 'Đặt thừa số chung với số âm',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const common = rng.nextInt(5, 12);
      const a = rng.nextInt(15, 35);
      const b = rng.nextInt(10, 20);
      const ans = -common * (a + b);
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Phép nhân hai số nguyên',
        topic: 'Tính chất phép nhân',
        problemType: 'Đặt thừa số chung với số âm',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Tính hợp lý: $(-${common}) \\cdot ${a} + (-${common}) \\cdot ${b}$`,
        correctAnswer: String(ans),
        acceptedAnswers: [String(ans), `${ans}`],
        solution: `Áp dụng tính chất phân phối của phép nhân đối với phép cộng:\n$$\\begin{aligned} (-${common}) \\cdot ${a} + (-${common}) \\cdot ${b} &= (-${common}) \\cdot (${a} + ${b}) \\\\ &= (-${common}) \\cdot ${a + b} \\\\ &= ${ans} \\end{aligned}$$`,
        rubricSteps: [
          { step: `Đặt thừa số chung $(-${common}) \\cdot (${a} + ${b})$`, points: 0.5 },
          { step: `Tính ra kết quả $${ans}$`, points: 0.5 },
        ],
        keyFormula: '$a \\cdot b + a \\cdot c = a \\cdot (b + c)$',
        commonMistake: 'Nhân riêng lẻ từng tích dễ tính toán sai.',
      };
    },
  },
  {
    id: 'T_G6_C2_MED_04',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Bội và ước của một số nguyên',
    topic: 'Tính chất chia hết trong Z',
    problemType: 'Tìm tập hợp ước nguyên',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const p = rng.nextInt(3, 7);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$4$ phần tử',
        [
          { text: '$2$ phần tử', errorType: 'QUÊN_ƯỚC_ÂM' },
          { text: '$1$ phần tử', errorType: 'CHỈ_TÍNH_ƯỚC_LÀ_CHÍNH_NÓ' },
          { text: '$3$ phần tử', errorType: 'TÍNH_THỪA_THIẾU' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Bội và ước của một số nguyên',
        topic: 'Tính chất chia hết trong Z',
        problemType: 'Tìm tập hợp ước nguyên',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Số nguyên tố $p = ${p}$ có bao nhiêu ước trong tập số nguyên $\\mathbb{Z}$?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Trong tập hợp số nguyên $\\mathbb{Z}$, ước của số nguyên tố $p$ bao gồm cả ước dương và ước âm: $\\{\\pm 1, \\pm ${p}\\}$. Vậy có tất cả $4$ ước.`,
        rubricSteps: [
          { step: 'Liệt kê các ước dương của số nguyên tố', points: 0.25 },
          { step: 'Lấy thêm các số đối để có đủ 4 ước nguyên trong Z: +-1, +-p', points: 0.25 },
        ],
        keyFormula: 'Ước nguyên của số nguyên tố $p$ gồm: $1, -1, p, -p$.',
        commonMistake: 'Chỉ tính các ước tự nhiên mà quên các ước âm trong Z.',
      };
    },
  },

  // HARD
  {
    id: 'T_G6_C2_HARD_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Phép cộng và phép trừ hai số nguyên',
    topic: 'Ứng dụng thực tế số nguyên',
    problemType: 'Bài toán chênh lệch độ cao / nhiệt độ',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const peak = rng.nextInt(2800, 3143);
      const submarine = -rng.nextInt(50, 200);
      const diff = peak - submarine;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${diff}\\text{ m}$`,
        [
          { text: `$${peak + submarine}\\text{ m}$`, errorType: 'LẤY_TỔNG_CỘNG' },
          { text: `$${peak}\\text{ m}$`, errorType: 'QUÊN_ĐỘ_SÂU' },
          { text: `$${diff + 50}\\text{ m}$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Phép cộng và phép trừ hai số nguyên',
        topic: 'Ứng dụng thực tế số nguyên',
        problemType: 'Bài toán chênh lệch độ cao / nhiệt độ',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: `Đỉnh núi Phan Xi Păng có độ cao $${peak}\\text{ m}$ so với mực nước biển. Một chiếc tàu ngầm đang lặn ở độ sâu $${Math.abs(submarine)}\\text{ m}$ dưới mực nước biển (độ cao là $${submarine}\\text{ m}$). Khoảng cách theo phương thẳng đứng giữa đỉnh núi và tàu ngầm là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Khoảng cách giữa hai độ cao được tính bằng hiệu của giá trị lớn trừ giá trị nhỏ:\n$$\\Delta h = ${peak} - (${submarine}) = ${peak} + ${Math.abs(submarine)} = ${diff}\\text{ m}$$`,
        rubricSteps: [{ step: `Lập đúng phép trừ và tính ra $${diff}\\text{ m}$`, points: 0.5 }],
        keyFormula: 'Khoảng cách thẳng đứng = Độ cao trên - Độ cao dưới.',
        commonMistake: 'Lấy $peak + submarine$ thành phép trừ làm giảm độ cao.',
      };
    },
  },
  {
    id: 'T_G6_C2_HARD_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Bội và ước của một số nguyên',
    topic: 'Chia hết trong tập số nguyên Z',
    problemType: 'Tìm số nguyên n để phân thức là số nguyên',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const k = rng.nextInt(3, 7);
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Bội và ước của một số nguyên',
        topic: 'Chia hết trong tập số nguyên Z',
        problemType: 'Tìm số nguyên n để phân thức là số nguyên',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Tìm tất cả các số nguyên $n$ để phân số $\\frac{${k}}{n - 1}$ nhận giá trị là một số nguyên.`,
        correctAnswer: `n thuộc các giá trị thoả mãn n - 1 là ước của ${k}`,
        acceptedAnswers: ['uoc', 'n-1 la uoc', 'ước', 'Uoc'],
        solution: `Để phân số $\\frac{${k}}{n - 1}$ là số nguyên thì $n - 1$ phải là ước của $${k}$ trong $\\mathbb{Z}$.\nCác ước của $${k}$ là: $\\pm 1, \\pm ${k}$.\nDo đó $n - 1 \\in \\{1, -1, ${k}, -${k}\\} \\implies n \\in \\{2, 0, ${k + 1}, ${1 - k}\\}$.`,
        rubricSteps: [
          { step: `Lập luận $n - 1 \\in \\text{Ư}(${k})$ trong Z`, points: 0.5 },
          { step: 'Liệt kê đủ 4 giá trị của n', points: 0.5 },
        ],
        keyFormula: 'Phân số $\\frac{a}{n+b} \\in \\mathbb{Z} \\iff n+b \\in \\text{Ư}(a)$.',
        commonMistake: 'Quên xét các ước âm dẫn đến thiếu nghiệm.',
      };
    },
  },
  {
    id: 'T_G6_C2_HARD_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Phép nhân hai số nguyên',
    topic: 'Đánh giá giá trị biểu thức',
    problemType: 'Tìm giá trị nhỏ nhất của bình phương cộng hằng số',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 6);
      const b = rng.nextInt(10, 30);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${b}$`,
        [
          { text: `$0$`, errorType: 'CHO_LÀ_BẰNG_0' },
          { text: `$${a + b}$`, errorType: 'TÍNH_NHẦM' },
          { text: `$${-b}$`, errorType: 'SAI_DẤU' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Phép nhân hai số nguyên',
        topic: 'Đánh giá giá trị biểu thức',
        problemType: 'Tìm giá trị nhỏ nhất của bình phương cộng hằng số',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: `Giá trị nhỏ nhất của biểu thức $A = (x - ${a})^2 + ${b}$ với $x \\in \\mathbb{Z}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Với mọi $x \\in \\mathbb{Z}$, ta luôn có $(x - ${a})^2 \\ge 0$.\nSuy ra $(x - ${a})^2 + ${b} \\ge 0 + ${b} = ${b}$.\nDấu bằng xảy ra khi $x - ${a} = 0 \\implies x = ${a}$.\nVậy giá trị nhỏ nhất của $A$ là $${b}$.`,
        rubricSteps: [{ step: 'Đánh giá bình phương luôn không âm và tìm ra GTNN', points: 0.5 }],
        keyFormula: '$A^2 \\ge 0 \\implies A^2 + m \\ge m$',
        commonMistake: 'Cho giá trị nhỏ nhất luôn bằng 0.',
      };
    },
  },
  {
    id: 'T_G6_C2_HARD_04',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Phép cộng và phép trừ hai số nguyên',
    topic: 'Quy tắc cộng trừ số nguyên',
    problemType: 'Tính tổng dãy số nguyên đan dấu',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const nPairs = rng.nextInt(10, 25);
      const maxN = nPairs * 2;
      const ans = -nPairs;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Phép cộng và phép trừ hai số nguyên',
        topic: 'Quy tắc cộng trừ số nguyên',
        problemType: 'Tính tổng dãy số nguyên đan dấu',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Tính tổng: $S = 1 - 2 + 3 - 4 + 5 - 6 + \\dots + ${maxN - 1} - ${maxN}$`,
        correctAnswer: String(ans),
        acceptedAnswers: [String(ans), `${ans}`],
        solution: `Dãy số có $${maxN}$ số hạng, ta nhóm thành $${nPairs}$ cặp đôi:\n$$\\begin{aligned} S &= (1 - 2) + (3 - 4) + \\dots + (${maxN - 1} - ${maxN}) \\\\ &= (-1) + (-1) + \\dots + (-1) \\quad (${nPairs} \\text{ số } -1) \\\\ &= ${nPairs} \\cdot (-1) = ${ans} \\end{aligned}$$`,
        rubricSteps: [
          { step: `Nhóm thành $${nPairs}$ cặp có hiệu bằng $-1$`, points: 0.5 },
          { step: `Nhân ra kết quả $${ans}$`, points: 0.5 },
        ],
        keyFormula: 'Nhóm các cặp liên tiếp có hiệu không đổi.',
        commonMistake: 'Đếm sai số cặp hoặc quên dấu âm.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 3: HÌNH HỌC TRỰC QUAN / MỘT SỐ HÌNH PHẲNG (G6_C3) - HK1
  // ============================================================================
  // EASY
  {
    id: 'T_G6_C3_EASY_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình vuông, tam giác đều, lục giác đều',
    topic: 'Nhận biết hình phẳng',
    problemType: 'Chu vi tam giác đều',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(4, 12);
      const p = a * 3;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${p}\\text{ cm}$`,
        [
          { text: `$${a * 4}\\text{ cm}$`, errorType: 'NHẦM_SANG_HÌNH_VUÔNG' },
          { text: `$${a * 2}\\text{ cm}$`, errorType: 'TÍNH_THIẾU_CẠNH' },
          { text: `$${a * a}\\text{ cm}$`, errorType: 'NHẦM_DIỆN_TÍCH' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình vuông, tam giác đều, lục giác đều',
        topic: 'Nhận biết hình phẳng',
        problemType: 'Chu vi tam giác đều',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Một tam giác đều có độ dài cạnh bằng $${a}\\text{ cm}$. Chu vi của tam giác đều đó là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Tam giác đều có ba cạnh bằng nhau, chu vi bằng: $C = 3 \\cdot a = 3 \\cdot ${a} = ${p}\\text{ cm}$.`,
        rubricSteps: [{ step: 'Áp dụng công thức chu vi tam giác đều', points: 0.5 }],
        keyFormula: '$C = 3a$',
        commonMistake: 'Nhầm số cạnh của tam giác đều thành 4.',
      };
    },
  },
  {
    id: 'T_G6_C3_EASY_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình chữ nhật, hình thoi',
    topic: 'Diện tích hình chữ nhật',
    problemType: 'Tính diện tích hình chữ nhật',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const w = rng.nextInt(4, 9);
      const l = w + rng.nextInt(3, 8);
      const s = w * l;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${s}\\text{ m}^2$`,
        [
          { text: `$${(w + l) * 2}\\text{ m}^2$`, errorType: 'NHẦM_VỚI_CHU_VI' },
          { text: `$${w + l}\\text{ m}^2$`, errorType: 'NỬA_CHU_VI' },
          { text: `$${s * 2}\\text{ m}^2$`, errorType: 'GẤP_ĐÔI_DIỆN_TÍCH' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình chữ nhật, hình thoi',
        topic: 'Diện tích hình chữ nhật',
        problemType: 'Tính diện tích hình chữ nhật',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Một mảnh sân hình chữ nhật có chiều rộng $${w}\\text{ m}$ và chiều dài $${l}\\text{ m}$. Diện tích của mảnh sân đó là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Diện tích hình chữ nhật bằng tích chiều dài và chiều rộng: $S = a \\cdot b = ${l} \\cdot ${w} = ${s}\\text{ m}^2$.`,
        rubricSteps: [{ step: 'Tính đúng diện tích hình chữ nhật', points: 0.5 }],
        keyFormula: '$S = a \\cdot b$',
        commonMistake: 'Nhầm lẫn giữa công thức tính chu vi và diện tích.',
      };
    },
  },
  {
    id: 'T_G6_C3_EASY_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình thoi, hình bình hành',
    topic: 'Diện tích hình thoi',
    problemType: 'Tính diện tích hình thoi theo 2 đường chéo',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const d1 = rng.nextInt(6, 12);
      const d2 = rng.nextInt(8, 16);
      const s = (d1 * d2) / 2;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${s}\\text{ cm}^2$`,
        [
          { text: `$${d1 * d2}\\text{ cm}^2$`, errorType: 'QUÊN_CHIA_CHO_HAI' },
          { text: `$${(d1 + d2) * 2}\\text{ cm}^2$`, errorType: 'TÍNH_NHẦM' },
          { text: `$${d1 + d2}\\text{ cm}^2$`, errorType: 'CỘNG_HAI_ĐƯỜNG_CHÉO' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình thoi, hình bình hành',
        topic: 'Diện tích hình thoi',
        problemType: 'Tính diện tích hình thoi theo 2 đường chéo',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Một hình thoi có độ dài hai đường chéo lần lượt là $${d1}\\text{ cm}$ và $${d2}\\text{ cm}$. Diện tích của hình thoi đó là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Diện tích hình thoi bằng nửa tích độ dài hai đường chéo: $S = \\frac{1}{2} \\cdot d_1 \\cdot d_2 = \\frac{1}{2} \\cdot ${d1} \\cdot ${d2} = ${s}\\text{ cm}^2$.`,
        rubricSteps: [{ step: 'Áp dụng đúng công thức diện tích hình thoi', points: 0.5 }],
        keyFormula: '$S = \\frac{1}{2} d_1 d_2$',
        commonMistake: 'Quên chia cho 2 (nhầm sang hình bình hành).',
      };
    },
  },
  {
    id: 'T_G6_C3_EASY_04',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình vuông, tam giác đều, lục giác đều',
    topic: 'Chu vi hình vuông',
    problemType: 'Tìm cạnh từ chu vi',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(5, 15);
      const p = a * 4;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình vuông, tam giác đều, lục giác đều',
        topic: 'Chu vi hình vuông',
        problemType: 'Tìm cạnh từ chu vi',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 1.0,
        textbooks: [book],
        content: `Một mảnh đất hình vuông có chu vi bằng $${p}\\text{ m}$. Tính độ dài cạnh của mảnh đất đó.`,
        correctAnswer: String(a),
        acceptedAnswers: [String(a), `${a}m`, `${a} m`],
        solution: `Độ dài cạnh hình vuông bằng chu vi chia cho $4$:\n$$a = C : 4 = ${p} : 4 = ${a}\\text{ m}$$`,
        rubricSteps: [{ step: `Tính ra cạnh hình vuông là $${a}\\text{ m}$`, points: 1.0 }],
        keyFormula: '$a = C / 4$',
        commonMistake: 'Lấy chu vi chia cho 2.',
      };
    },
  },

  // MEDIUM
  {
    id: 'T_G6_C3_MED_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình thang cân',
    topic: 'Diện tích hình thang',
    problemType: 'Tính diện tích hình thang cân',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(4, 8);
      const b = a + rng.nextInt(4, 8);
      const h = rng.nextInt(4, 10);
      const s = ((a + b) * h) / 2;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${s}\\text{ cm}^2$`,
        [
          { text: `$${(a + b) * h}\\text{ cm}^2$`, errorType: 'QUÊN_CHIA_CHO_HAI' },
          { text: `$${a * b}\\text{ cm}^2$`, errorType: 'NHÂN_HAI_ĐÁY' },
          { text: `$${s + 10}\\text{ cm}^2$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình thang cân',
        topic: 'Diện tích hình thang',
        problemType: 'Tính diện tích hình thang cân',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Một hình thang có độ dài hai đáy lần lượt là $${a}\\text{ cm}$ và $${b}\\text{ cm}$, chiều cao bằng $${h}\\text{ cm}$. Diện tích của hình thang đó là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Diện tích hình thang bằng tổng độ dài hai đáy nhân với chiều cao rồi chia đôi:\n$$S = \\frac{(${a} + ${b}) \\cdot ${h}}{2} = \\frac{${a + b} \\cdot ${h}}{2} = ${s}\\text{ cm}^2$$`,
        rubricSteps: [{ step: 'Áp dụng công thức diện tích hình thang', points: 0.5 }],
        keyFormula: '$S = \\frac{(a + b)h}{2}$',
        commonMistake: 'Quên chia cho 2 hoặc nhân hai đáy thay vì cộng.',
      };
    },
  },
  {
    id: 'T_G6_C3_MED_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình chữ nhật, hình thoi',
    topic: 'Ứng dụng lát gạch nền nhà',
    problemType: 'Tính số viên gạch cần mua',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const roomLength = rng.nextInt(6, 10);
      const roomWidth = rng.nextInt(4, 6);
      const tileSizeCm = 50; // 0.5m
      const roomArea = roomLength * roomWidth;
      const tileArea = 0.25; // 0.5 * 0.5
      const numTiles = roomArea / tileArea;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình chữ nhật, hình thoi',
        topic: 'Ứng dụng lát gạch nền nhà',
        problemType: 'Tính số viên gạch cần mua',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Một căn phòng hình chữ nhật có chiều dài $${roomLength}\\text{ m}$, chiều rộng $${roomWidth}\\text{ m}$. Người ta dùng các viên gạch men hình vuông cạnh $${tileSizeCm}\\text{ cm}$ để lát kín nền phòng. Hỏi cần bao nhiêu viên gạch như thế? (Bỏ qua mạch vữa).`,
        correctAnswer: String(numTiles),
        acceptedAnswers: [String(numTiles), `${numTiles} viên`, `${numTiles}vien`],
        solution: `Diện tích căn phòng là: $S_{\\text{phòng}} = ${roomLength} \\cdot ${roomWidth} = ${roomArea}\\text{ m}^2 = ${roomArea * 10000}\\text{ cm}^2$.\nDiện tích một viên gạch là: $S_{\\text{gạch}} = ${tileSizeCm} \\cdot ${tileSizeCm} = ${tileSizeCm * tileSizeCm}\\text{ cm}^2$.\nSố viên gạch cần dùng là: $${roomArea * 10000} : ${tileSizeCm * tileSizeCm} = ${numTiles}$ viên.`,
        rubricSteps: [
          { step: `Tính diện tích phòng và đổi đơn vị đúng`, points: 0.5 },
          { step: `Chia cho diện tích một viên gạch ra $${numTiles}$ viên`, points: 0.5 },
        ],
        keyFormula: 'Số viên gạch = Diện tích nền / Diện tích 1 viên gạch.',
        commonMistake: 'Quên đổi đơn vị giữa mét vuông và xăng-ti-mét vuông.',
      };
    },
  },
  {
    id: 'T_G6_C3_MED_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình bình hành',
    topic: 'Diện tích hình bình hành',
    problemType: 'Tính diện tích hình bình hành',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(10, 20);
      const h = rng.nextInt(6, 12);
      const s = a * h;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${s}\\text{ cm}^2$`,
        [
          { text: `$${s / 2}\\text{ cm}^2$`, errorType: 'CHIA_ĐÔI_NHƯ_TAM_GIÁC' },
          { text: `$${(a + h) * 2}\\text{ cm}^2$`, errorType: 'TÍNH_CHU_VI' },
          { text: `$${s + 15}\\text{ cm}^2$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình bình hành',
        topic: 'Diện tích hình bình hành',
        problemType: 'Tính diện tích hình bình hành',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Một hình bình hành có độ dài đáy $${a}\\text{ cm}$ và chiều cao tương ứng $${h}\\text{ cm}$. Diện tích của hình bình hành đó là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Nêu công thức diện tích hình bình hành $S = a \\cdot h$.\\nBước 2: Thay số ta được $S = ${a} \\cdot ${h} = ${s}\\text{ cm}^2$.`,
        rubricSteps: [
          { step: 'Nêu công thức tính diện tích hình bình hành S = a * h', points: 0.25 },
          { step: `Tính ra diện tích hình bình hành là ${s} cm2`, points: 0.25 },
        ],
        keyFormula: '$S = a \\cdot h$',
        commonMistake: 'Chia đôi diện tích như công thức tam giác.',
      };
    },
  },
  {
    id: 'T_G6_C3_MED_04',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình vuông, tam giác đều, lục giác đều',
    topic: 'Chu vi hình lục giác đều',
    problemType: 'Tính chu vi lục giác đều',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(5, 12);
      const p = a * 6;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình vuông, tam giác đều, lục giác đều',
        topic: 'Chu vi hình lục giác đều',
        problemType: 'Tính chu vi lục giác đều',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Một tấm bảng trang trí có dạng hình lục giác đều với cạnh dài $${a}\\text{ cm}$. Tính chu vi của tấm bảng đó.`,
        correctAnswer: String(p),
        acceptedAnswers: [String(p), `${p}cm`, `${p} cm`],
        solution: `Hình lục giác đều có $6$ cạnh bằng nhau, chu vi là:\n$$C = 6 \\cdot a = 6 \\cdot ${a} = ${p}\\text{ cm}$$`,
        rubricSteps: [{ step: `Nhân 6 cạnh tính ra chu vi $${p}\\text{ cm}$`, points: 1.0 }],
        keyFormula: '$C = 6a$',
        commonMistake: 'Nhầm số cạnh lục giác là 5 hoặc 8.',
      };
    },
  },

  // HARD
  {
    id: 'T_G6_C3_HARD_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình chữ nhật, hình thoi',
    topic: 'Bài toán khu vườn có lối đi',
    problemType: 'Tính diện tích phần còn lại',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const L = rng.nextInt(15, 25);
      const W = rng.nextInt(10, 15);
      const pathW = 1; // 1m lối đi quanh vườn
      const innerL = L - 2 * pathW;
      const innerW = W - 2 * pathW;
      const gardenArea = innerL * innerW;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${gardenArea}\\text{ m}^2$`,
        [
          { text: `$${L * W}\\text{ m}^2$`, errorType: 'CHƯA_TRỪ_LỐI_ĐI' },
          { text: `$${(L - 1) * (W - 1)}\\text{ m}^2$`, errorType: 'CHỈ_TRỪ_MỘT_PHÍA' },
          { text: `$${gardenArea - 10}\\text{ m}^2$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình chữ nhật, hình thoi',
        topic: 'Bài toán khu vườn có lối đi',
        problemType: 'Tính diện tích phần còn lại',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: `Một khu đất hình chữ nhật có chiều dài $${L}\\text{ m}$ và chiều rộng $${W}\\text{ m}$. Người ta làm một lối đi xung quanh rộng $1\\text{ m}$ bên trong mảnh đất. Diện tích phần đất còn lại để trồng hoa là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Phần đất bên trong còn lại có chiều dài là: $${L} - 2 \\cdot 1 = ${innerL}\\text{ m}$.\nChiều rộng là: $${W} - 2 \\cdot 1 = ${innerW}\\text{ m}$.\nDiện tích đất trồng hoa là: $S = ${innerL} \\cdot ${innerW} = ${gardenArea}\\text{ m}^2$.`,
        rubricSteps: [
          { step: 'Tính đúng kích thước bên trong sau khi trừ 2 phía lối đi', points: 0.25 },
          { step: `Tính ra diện tích $${gardenArea}\\text{ m}^2$`, points: 0.25 },
        ],
        keyFormula: 'Lối đi xung quanh làm giảm chiều dài và chiều rộng mỗi bên $2x$.',
        commonMistake: 'Chỉ trừ $1\\text{ m}$ một phía thay vì cả 2 phía đối diện.',
      };
    },
  },
  {
    id: 'T_G6_C3_HARD_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình thoi, hình chữ nhật',
    topic: 'Bài toán chi phí rào vườn',
    problemType: 'Tính tiền rào lưới thép',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(12, 20);
      const b = rng.nextInt(8, 12);
      const gate = 2; // Cổng vào rộng 2m không rào
      const perimeter = 2 * (a + b);
      const fenceLength = perimeter - gate;
      const costPerMeter = 120000;
      const totalCost = fenceLength * costPerMeter;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình thoi, hình chữ nhật',
        topic: 'Bài toán chi phí rào vườn',
        problemType: 'Tính tiền rào lưới thép',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Một khu vườn hình chữ nhật dài $${a}\\text{ m}$, rộng $${b}\\text{ m}$. Bác An muốn rào lưới thép xung quanh vườn, chừa lại một cổng vào rộng $${gate}\\text{ m}$ không rào. Biết mỗi mét lưới thép có giá $120\\,000$ đồng. Hỏi bác An cần chi bao nhiêu tiền để mua lưới thép?`,
        correctAnswer: String(totalCost),
        acceptedAnswers: [String(totalCost), `${totalCost} dong`, `${totalCost} đồng`],
        solution: `Chu vi khu vườn là: $C = 2 \\cdot (${a} + ${b}) = ${perimeter}\\text{ m}$.\nChiều dài hàng rào thực tế cần mua là: $${perimeter} - ${gate} = ${fenceLength}\\text{ m}$.\nTổng số tiền mua lưới thép là:\n$$${fenceLength} \\cdot 120\\,000 = ${totalCost.toLocaleString('vi-VN')}\\text{ đồng}$$`,
        rubricSteps: [
          { step: `Tính chu vi và trừ cổng ra $${fenceLength}\\text{ m}$`, points: 0.5 },
          { step: `Nhân đơn giá ra số tiền $${totalCost}$ đồng`, points: 0.5 },
        ],
        keyFormula: 'Chiều dài rào = Chu vi - Chiều rộng cổng.',
        commonMistake: 'Quên trừ chiều rộng của cổng ra vào.',
      };
    },
  },
  {
    id: 'T_G6_C3_HARD_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình bình hành, hình thoi',
    topic: 'Chia hình phức tạp',
    problemType: 'Diện tích hình ghép',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const squareA = rng.nextInt(6, 10);
      const rectH = rng.nextInt(4, 6);
      const totalArea = squareA * squareA + squareA * rectH;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình bình hành, hình thoi',
        topic: 'Chia hình phức tạp',
        problemType: 'Diện tích hình ghép',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Một mảnh sân hình chữ L được ghép bởi một hình vuông cạnh $${squareA}\\text{ m}$ và một hình chữ nhật có một cạnh bằng $${squareA}\\text{ m}$, cạnh kia bằng $${rectH}\\text{ m}$. Tính tổng diện tích của mảnh sân.`,
        correctAnswer: String(totalArea),
        acceptedAnswers: [String(totalArea), `${totalArea}m2`, `${totalArea} m2`],
        solution: `Diện tích phần hình vuông là: $S_1 = ${squareA} \\cdot ${squareA} = ${squareA * squareA}\\text{ m}^2$.\nDiện tích phần hình chữ nhật là: $S_2 = ${squareA} \\cdot ${rectH} = ${squareA * rectH}\\text{ m}^2$.\nTổng diện tích mảnh sân là: $S = S_1 + S_2 = ${squareA * squareA} + ${squareA * rectH} = ${totalArea}\\text{ m}^2$.`,
        rubricSteps: [
          { step: `Tính diện tích 2 hình đơn lẻ`, points: 0.5 },
          { step: `Cộng lại ra kết quả $${totalArea}\\text{ m}^2$`, points: 0.5 },
        ],
        keyFormula: '$S_{\\text{tổng}} = S_1 + S_2$',
        commonMistake: 'Tính chồng lấn diện tích giao nhau.',
      };
    },
  },
  {
    id: 'T_G6_C3_HARD_04',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình thoi, hình chữ nhật',
    topic: 'Tỉ số diện tích',
    problemType: 'Hình thoi nội tiếp hình chữ nhật',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Bằng một nửa diện tích hình chữ nhật',
        [
          { text: 'Bằng một phần ba diện tích hình chữ nhật', errorType: 'TÍNH_SAI_TỈ_LỆ' },
          { text: 'Bằng diện tích hình chữ nhật', errorType: 'CHO_LÀ_BẰNG_NHAU' },
          { text: 'Bằng hai phần ba diện tích hình chữ nhật', errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình thoi, hình chữ nhật',
        topic: 'Tỉ số diện tích',
        problemType: 'Hình thoi nội tiếp hình chữ nhật',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: 'Nối bốn trung điểm các cạnh của một hình chữ nhật ta được một hình thoi. Diện tích hình thoi này có quan hệ gì với diện tích hình chữ nhật ban đầu?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Hai đường chéo của hình thoi chính bằng chiều dài $a$ và chiều rộng $b$ của hình chữ nhật. Do đó diện tích hình thoi là $S_{\\text{thoi}} = \\frac{1}{2} a b = \\frac{1}{2} S_{\\text{HCN}}$. Vậy diện tích hình thoi bằng một nửa diện tích hình chữ nhật.',
        rubricSteps: [{ step: 'Xác định đường chéo hình thoi bằng kích thước HCN và kết luận tỉ lệ 1/2', points: 0.5 }],
        keyFormula: '$S_{\\text{thoi}} = \\frac{1}{2} a b = \\frac{1}{2} S_{\\text{HCN}}$',
        commonMistake: 'Nghĩ rằng diện tích bằng nhau hoặc tỷ lệ 1/4.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 4: PHÂN SỐ VÀ SỐ THẬP PHÂN (G6_C4) - HK2
  // ============================================================================
  // EASY
  {
    id: 'T_G6_C4_EASY_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Phân số',
    topic: 'Khái niệm phân số',
    problemType: 'Rút gọn phân số về tối giản',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const g = rng.nextInt(3, 8);
      const n = rng.nextInt(2, 5);
      let d = rng.nextInt(3, 7);
      while (gcd(n, d) !== 1) d++;
      const top = n * g;
      const bot = d * g;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$\\frac{${n}}{${d}}$`,
        [
          { text: `$\\frac{${top}}{${bot}}$`, errorType: 'CHƯA_RÚT_GỌN' },
          { text: `$\\frac{${n + 1}}{${d + 1}}$`, errorType: 'TRỪ_CÙNG_MỘT_SỐ' },
          { text: `$\\frac{${d}}{${n}}$`, errorType: 'ĐẢO_NGƯỢC_PHÂN_SỐ' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Phân số',
        topic: 'Khái niệm phân số',
        problemType: 'Rút gọn phân số về tối giản',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Rút gọn phân số $\\frac{${top}}{${bot}}$ về phân số tối giản ta được:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Chia cả tử và mẫu cho $\\text{ƯCLN}(${top}, ${bot}) = ${g}$:\n$$\\frac{${top}}{${bot}} = \\frac{${top} : ${g}}{${bot} : ${g}} = \\frac{${n}}{${d}}$$`,
        rubricSteps: [{ step: 'Rút gọn đúng về phân số tối giản', points: 0.5 }],
        keyFormula: 'Chia cả tử và mẫu cho ƯCLN để tối giản phân số.',
        commonMistake: 'Rút gọn chưa triệt để hoặc chia sai.',
      };
    },
  },
  {
    id: 'T_G6_C4_EASY_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Phép cộng và phép trừ phân số',
    topic: 'Cộng phân số cùng mẫu',
    problemType: 'Cộng phân số cùng mẫu',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const den = rng.nextInt(7, 15);
      const a = rng.nextInt(1, 4);
      const b = rng.nextInt(1, 4);
      const sum = a + b;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$\\frac{${sum}}{${den}}$`,
        [
          { text: `$\\frac{${sum}}{${den * 2}}$`, errorType: 'CỘNG_CẢ_MẪU' },
          { text: `$\\frac{${a * b}}{${den}}$`, errorType: 'NHÂN_TỬ' },
          { text: `$\\frac{${Math.abs(a - b)}}{${den}}$`, errorType: 'TRỪ_TỬ' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Phép cộng và phép trừ phân số',
        topic: 'Cộng phân số cùng mẫu',
        problemType: 'Cộng phân số cùng mẫu',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Tính: $\\frac{${a}}{${den}} + \\frac{${b}}{${den}}$`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Cộng hai phân số cùng mẫu số: cộng các tử số và giữ nguyên mẫu số:\n$$\\frac{${a}}{${den}} + \\frac{${b}}{${den}} = \\frac{${a} + ${b}}{${den}} = \\frac{${sum}}{${den}}$$`,
        rubricSteps: [{ step: 'Cộng đúng tử và giữ nguyên mẫu', points: 0.5 }],
        keyFormula: '$\\frac{a}{m} + \\frac{b}{m} = \\frac{a+b}{m}$',
        commonMistake: 'Cộng luôn cả hai mẫu số với nhau.',
      };
    },
  },
  {
    id: 'T_G6_C4_EASY_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Số thập phân',
    topic: 'Cộng trừ số thập phân',
    problemType: 'Cộng hai số thập phân',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = (rng.nextInt(12, 45) / 10).toFixed(1);
      const b = (rng.nextInt(15, 60) / 10).toFixed(1);
      const ans = (Number(a) + Number(b)).toFixed(1);
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Số thập phân',
        topic: 'Cộng trừ số thập phân',
        problemType: 'Cộng hai số thập phân',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 1.0,
        textbooks: [book],
        content: `Tính: $${a} + ${b}$`,
        correctAnswer: String(ans),
        acceptedAnswers: [String(ans), `${ans}`],
        solution: `Đặt tính thẳng hàng dấu phẩy và cộng:\n$$${a} + ${b} = ${ans}$$`,
        rubricSteps: [{ step: `Tính đúng tổng là $${ans}$`, points: 1.0 }],
        keyFormula: 'Đặt tính số thập phân: thẳng cột phần nguyên, dấu phẩy và phần thập phân.',
        commonMistake: 'Đặt lệch hàng dấu phẩy.',
      };
    },
  },
  {
    id: 'T_G6_C4_EASY_04',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Số thập phân',
    topic: 'Làm tròn số thập phân',
    problemType: 'Làm tròn đến hàng phần mười',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const intPart = rng.nextInt(3, 15);
      const digit1 = rng.nextInt(2, 7);
      const digit2 = rng.nextInt(6, 9); // >= 5 làm tròn lên
      const original = `${intPart}.${digit1}${digit2}`;
      const rounded = `${intPart}.${digit1 + 1}`;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${rounded}$`,
        [
          { text: `$${intPart}.${digit1}$`, errorType: 'LÀM_TRÒN_XUỐNG_SAI' },
          { text: `$${intPart + 1}$`, errorType: 'LÀM_TRÒN_ĐẾN_HÀNG_ĐƠN_VỊ' },
          { text: `$${intPart}.${digit1 + 2}$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Số thập phân',
        topic: 'Làm tròn số thập phân',
        problemType: 'Làm tròn đến hàng phần mười',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Làm tròn số $${original}$ đến hàng phần mười (chữ số thập phân thứ nhất) ta được:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Chữ số sau hàng phần mười là $${digit2} \\ge 5$, do đó ta cộng thêm $1$ vào chữ số hàng phần mười: $${original} \\approx ${rounded}$.`,
        rubricSteps: [{ step: 'Áp dụng đúng quy tắc làm tròn số thập phân', points: 0.5 }],
        keyFormula: 'Nếu chữ số sau lớn hơn hoặc bằng 5 thì cộng 1 vào hàng làm tròn.',
        commonMistake: 'Bỏ qua không cộng 1 khi chữ số sau lớn hơn hoặc bằng 5.',
      };
    },
  },

  // MEDIUM
  {
    id: 'T_G6_C4_MED_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Phép nhân và phép chia phân số',
    topic: 'Nhân phân số',
    problemType: 'Tính giá trị biểu thức phân số',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const b = rng.nextInt(3, 7);
      const c = rng.nextInt(3, 5);
      const d = rng.nextInt(2, 4);
      const num = a * c;
      const den = b * d;
      const g = gcd(num, den);
      const simpNum = num / g;
      const simpDen = den / g;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$\\frac{${simpNum}}{${simpDen}}$`,
        [
          { text: `$\\frac{${a * d}}{${b * c}}$`, errorType: 'NHÂN_CHÉO_NHẦM_CHIA' },
          { text: `$\\frac{${simpDen}}{${simpNum}}$`, errorType: 'NGHỊCH_ĐẢO' },
          { text: `$\\frac{${simpNum + 1}}{${simpDen + 1}}$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Phép nhân và phép chia phân số',
        topic: 'Nhân phân số',
        problemType: 'Tính giá trị biểu thức phân số',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Tính: $\\frac{${a}}{${b}} \\cdot \\frac{${c}}{${d}}$`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Nhân tử với tử, mẫu với mẫu rồi rút gọn:\n$$\\frac{${a}}{${b}} \\cdot \\frac{${c}}{${d}} = \\frac{${a} \\cdot ${c}}{${b} \\cdot ${d}} = \\frac{${num}}{${den}} = \\frac{${simpNum}}{${simpDen}}$$`,
        rubricSteps: [{ step: 'Nhân tử với tử, mẫu với mẫu và rút gọn đúng', points: 0.5 }],
        keyFormula: '$\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d}$',
        commonMistake: 'Nhân chéo nhầm với phép chia.',
      };
    },
  },
  {
    id: 'T_G6_C4_MED_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Tỉ số và tỉ số phần trăm',
    topic: 'Tính giá trị phần trăm của một số',
    problemType: 'Tìm phần trăm của một số',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const total = rng.nextInt(2, 8) * 100000;
      const pct = rng.nextChoice([10, 15, 20, 25, 30]);
      const ans = (total * pct) / 100;
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Tỉ số và tỉ số phần trăm',
        topic: 'Tính giá trị phần trăm của một số',
        problemType: 'Tìm phần trăm của một số',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Tính $${pct}\\%$ của $${total.toLocaleString('vi-VN')}$ đồng.`,
        correctAnswer: String(ans),
        acceptedAnswers: [String(ans), `${ans} dong`, `${ans} đồng`],
        solution: `Muốn tìm $${pct}\\%$ của một số, ta lấy số đó nhân với $${pct}$ rồi chia cho $100$:\n$$${total} \\cdot \\frac{${pct}}{100} = ${ans.toLocaleString('vi-VN')}\\text{ đồng}$$`,
        rubricSteps: [
          { step: 'Lập phép tính nhân với số phần trăm chia 100', points: 0.5 },
          { step: `Tính đúng ra $${ans}$ đồng`, points: 0.5 },
        ],
        keyFormula: '$m\\% \\text{ của } a = a \\cdot \\frac{m}{100}$',
        commonMistake: 'Lấy số đó chia cho phần trăm.',
      };
    },
  },
  {
    id: 'T_G6_C4_MED_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Phép cộng và phép trừ phân số',
    topic: 'Tìm x phân số',
    problemType: 'Tìm x trong đẳng thức phân số',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = 1;
      const b = rng.nextInt(2, 4);
      const c = 3;
      const d = b * 2;
      // x + 1/b = 3/d
      const numAns = (c * b - a * d) / (b * d);
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Phép cộng và phép trừ phân số',
        topic: 'Tìm x phân số',
        problemType: 'Tìm x trong đẳng thức phân số',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Tìm $x$, biết: $x + \\frac{${a}}{${b}} = \\frac{${c}}{${d}}$`,
        correctAnswer: formatFraction(c - 2 * a, d),
        acceptedAnswers: [formatFraction(c - 2 * a, d), `${(c - 2 * a) / d}`],
        solution: `Ta có:\n$$x = \\frac{${c}}{${d}} - \\frac{${a}}{${b}} = \\frac{${c}}{${d}} - \\frac{${a * 2}}{${d}} = \\frac{${c - a * 2}}{${d}}$$`,
        rubricSteps: [
          { step: 'Chuyển vế và quy đồng mẫu số', points: 0.5 },
          { step: `Trừ tử số tìm ra $x$`, points: 0.5 },
        ],
        keyFormula: '$x = b - a$',
        commonMistake: 'Cộng hai phân số thay vì trừ khi chuyển vế.',
      };
    },
  },
  {
    id: 'T_G6_C4_MED_04',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Tỉ số và tỉ số phần trăm',
    topic: 'Tỉ số của hai số',
    problemType: 'Tính tỉ số phần trăm',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const girl = rng.nextInt(18, 24);
      const boy = rng.nextInt(16, 22);
      const total = girl + boy;
      const pct = Math.round((girl / total) * 100);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `Khoảng $${pct}\\%$`,
        [
          { text: `Khoảng $${100 - pct}\\%$`, errorType: 'TÍNH_TỈ_LỆ_HỌC_SINH_NAM' },
          { text: `Khoảng $50\\%$`, errorType: 'ĐOÁN_MÒ' },
          { text: `Khoảng $${pct + 10}\\%$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Tỉ số và tỉ số phần trăm',
        topic: 'Tỉ số của hai số',
        problemType: 'Tính tỉ số phần trăm',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Một lớp học có $${girl}$ học sinh nữ và $${boy}$ học sinh nam. Tỉ số phần trăm của số học sinh nữ so với tổng số học sinh cả lớp là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Tổng số học sinh cả lớp là: $${girl} + ${boy} = ${total}$ học sinh.\nTỉ số phần trăm học sinh nữ là:\n$$\\frac{${girl}}{${total}} \\cdot 100\\% \\approx ${pct}\\%$$`,
        rubricSteps: [{ step: 'Tính tổng học sinh và lập tỉ số phần trăm đúng', points: 0.5 }],
        keyFormula: '$\\text{Tỉ số phần trăm} = \\frac{a}{b} \\cdot 100\\%$',
        commonMistake: 'Lấy số nữ chia cho số nam thay vì chia tổng cả lớp.',
      };
    },
  },

  // HARD
  {
    id: 'T_G6_C4_HARD_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Hai bài toán về phân số',
    topic: 'Bài toán đọc sách trong các ngày',
    problemType: 'Tìm số trang sách ban đầu',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      // Ngày 1 đọc 1/3 cuốn sách, ngày 2 đọc 2/5 số trang còn lại, ngày 3 đọc n trang cuối
      const remainPages = rng.nextInt(3, 8) * 12; // chia hết cho 3 và 5
      // Ngày 2 đọc 2/5 phần còn lại => ngày 3 là 3/5 phần còn lại
      // remainPages = 3/5 * afterDay1 => afterDay1 = remainPages * 5 / 3
      const afterDay1 = (remainPages * 5) / 3;
      // afterDay1 = 2/3 * total => total = afterDay1 * 3 / 2
      const totalPages = (afterDay1 * 3) / 2;
      const name = KNTTContexts.getStudentName(rng);
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Hai bài toán về phân số',
        topic: 'Bài toán đọc sách trong các ngày',
        problemType: 'Tìm số trang sách ban đầu',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Bạn ${name} đọc một cuốn sách trong ba ngày. Ngày thứ nhất đọc được $\\frac{1}{3}$ số trang sách. Ngày thứ hai đọc được $\\frac{2}{5}$ số trang còn lại. Ngày thứ ba đọc nốt $${remainPages}$ trang thì xong cuốn sách. Hỏi cuốn sách đó dày bao nhiêu trang?`,
        correctAnswer: String(totalPages),
        acceptedAnswers: [String(totalPages), `${totalPages} trang`, `${totalPages}trang`],
        solution: `Phân số chỉ số trang sách còn lại sau ngày thứ nhất là: $1 - \\frac{1}{3} = \\frac{2}{3}$ (cuốn sách).\nPhân số chỉ số trang ngày thứ hai đọc là: $\\frac{2}{5} \\cdot \\frac{2}{3} = \\frac{4}{15}$ (cuốn sách).\nPhân số chỉ số trang ngày thứ ba đọc là: $\\frac{2}{3} - \\frac{4}{15} = \\frac{6}{15} = \\frac{2}{5}$ (cuốn sách).\nSố trang của cuốn sách là: $${remainPages} : \\frac{2}{5} = ${totalPages}$ trang.`,
        rubricSteps: [
          { step: 'Tính phân số chỉ số trang ngày thứ ba đọc', points: 0.5 },
          { step: `Lấy số trang ngày thứ ba chia cho phân số tìm ra $${totalPages}$ trang`, points: 0.5 },
        ],
        keyFormula: 'Tính phân số tương ứng với đại lượng đã biết rồi lấy giá trị chia cho phân số.',
        commonMistake: 'Lấy $\\frac{2}{5}$ nhân trực tiếp cả cuốn sách thay vì nhân số trang còn lại.',
      };
    },
  },
  {
    id: 'T_G6_C4_HARD_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Tỉ số và tỉ số phần trăm',
    topic: 'Bài toán giá bán sau khi giảm giá',
    problemType: 'Tính giá gốc trước khi giảm',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const discountPct = 20;
      const originalPrice = rng.nextInt(3, 8) * 100000;
      const salePrice = originalPrice * (1 - discountPct / 100);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${originalPrice.toLocaleString('vi-VN')}\\text{ đồng}$`,
        [
          { text: `$${(salePrice * 1.2).toLocaleString('vi-VN')}\\text{ đồng}$`, errorType: 'TÍNH_NGƯỢC_SAI' },
          { text: `$${(salePrice + 20000).toLocaleString('vi-VN')}\\text{ đồng}$`, errorType: 'CỘNG_BỪA' },
          { text: `$${(originalPrice + 100000).toLocaleString('vi-VN')}\\text{ đồng}$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Tỉ số và tỉ số phần trăm',
        topic: 'Bài toán giá bán sau khi giảm giá',
        problemType: 'Tính giá gốc trước khi giảm',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: `Nhân dịp khuyến mãi, một chiếc áo được giảm giá $20\\%$ và bán với giá $${salePrice.toLocaleString('vi-VN')}\\text{ đồng}$. Giá niêm yết ban đầu của chiếc áo đó là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Giá bán sau giảm tương ứng với số phần trăm giá gốc là: $100\\% - 20\\% = 80\\%$.\nGiá ban đầu của chiếc áo là:\n$$${salePrice} : 80\\% = ${salePrice} : 0{,}8 = ${originalPrice.toLocaleString('vi-VN')}\\text{ đồng}$$`,
        rubricSteps: [{ step: 'Xác định 80% giá gốc và tính đúng giá niêm yết', points: 0.5 }],
        keyFormula: 'Giá gốc = Giá khuyến mãi / $(1 - \\%\\text{giảm})$.',
        commonMistake: 'Lấy giá khuyến mãi nhân với $120\\%$.',
      };
    },
  },
  {
    id: 'T_G6_C4_HARD_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Phép cộng và phép trừ phân số',
    topic: 'Tính tổng dãy phân số rút gọn liên tiếp',
    problemType: 'Dãy tổng sai phân 1/(n(n+1))',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const n = rng.nextInt(20, 50);
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Phép cộng và phép trừ phân số',
        topic: 'Tính tổng dãy phân số rút gọn liên tiếp',
        problemType: 'Dãy tổng sai phân 1/(n(n+1))',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Tính nhanh tổng: $S = \\frac{1}{1 \\cdot 2} + \\frac{1}{2 \\cdot 3} + \\frac{1}{3 \\cdot 4} + \\dots + \\frac{1}{${n} \\cdot ${n + 1}}$`,
        correctAnswer: `\\frac{${n}}{${n + 1}}`,
        acceptedAnswers: [`${n}/${n + 1}`, `\\frac{${n}}{${n + 1}}`, `${n / (n + 1)}`],
        solution: `Ta có công thức tách hạng tử: $\\frac{1}{k(k+1)} = \\frac{1}{k} - \\frac{1}{k+1}$.\nDo đó:\n$$\\begin{aligned} S &= \\left(1 - \\frac{1}{2}\\right) + \\left(\\frac{1}{2} - \\frac{1}{3}\\right) + \\dots + \\left(\\frac{1}{${n}} - \\frac{1}{${n + 1}}\\right) \\\\ &= 1 - \\frac{1}{${n + 1}} = \\frac{${n}}{${n + 1}} \\end{aligned}$$`,
        rubricSteps: [
          { step: 'Tách từng phân số thành hiệu của hai phân số liên tiếp', points: 0.5 },
          { step: `Triệt tiêu các hạng tử ở giữa và tính ra $\\frac{${n}}{${n + 1}}$`, points: 0.5 },
        ],
        keyFormula: '$\\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}$',
        commonMistake: 'Quy đồng từng mẫu số dẫn đến không thể tính nổi.',
      };
    },
  },
  {
    id: 'T_G6_C4_HARD_04',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Phân số',
    topic: 'So sánh phân số',
    problemType: 'So sánh qua phần bù tới 1',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(2023, 2026);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$\\frac{${a}}{${a + 1}} < \\frac{${a + 1}}{${a + 2}}$`,
        [
          { text: `$\\frac{${a}}{${a + 1}} > \\frac{${a + 1}}{${a + 2}}$`, errorType: 'SO_SÁNH_NGƯỢC' },
          { text: `$\\frac{${a}}{${a + 1}} = \\frac{${a + 1}}{${a + 2}}$`, errorType: 'CHO_LÀ_BẰNG_NHAU' },
          { text: 'Không xác định được', errorType: 'THIẾU_LẬP_LUẬN' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Phân số',
        topic: 'So sánh phân số',
        problemType: 'So sánh qua phần bù tới 1',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: `So sánh hai phân số: $A = \\frac{${a}}{${a + 1}}$ và $B = \\frac{${a + 1}}{${a + 2}}$:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Ta xét phần bù đến $1$ của từng phân số:\n$$1 - A = 1 - \\frac{${a}}{${a + 1}} = \\frac{1}{${a + 1}}$$\n$$1 - B = 1 - \\frac{${a + 1}}{${a + 2}} = \\frac{1}{${a + 2}}$$\nVì $a + 1 < a + 2$ nên $\\frac{1}{${a + 1}} > \\frac{1}{${a + 2}}$, tức là $1 - A > 1 - B \\implies A < B$.`,
        rubricSteps: [{ step: 'So sánh phần bù tới 1 và kết luận đúng thứ tự', points: 0.5 }],
        keyFormula: 'Phần bù tới 1 lớn hơn thì phân số nhỏ hơn.',
        commonMistake: 'Phần bù lớn hơn kết luận phân số lớn hơn.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 5: HÌNH HỌC CƠ BẢN (G6_C5) - HK2
  // ============================================================================
  // EASY
  {
    id: 'T_G6_C5_EASY_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Điểm và đường thẳng',
    topic: 'Quan hệ giữa điểm và đường thẳng',
    problemType: 'Đếm số đường thẳng đi qua các điểm',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$1$ đường thẳng duy nhất',
        [
          { text: '$2$ đường thẳng', errorType: 'TÍNH_NHẦM' },
          { text: 'Vô số đường thẳng', errorType: 'NHẦM_VỚI_MỘT_ĐIỂM' },
          { text: '$0$ đường thẳng', errorType: 'CHO_LÀ_KHÔNG_CÓ' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Điểm và đường thẳng',
        topic: 'Quan hệ giữa điểm và đường thẳng',
        problemType: 'Đếm số đường thẳng đi qua các điểm',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: 'Qua hai điểm phân biệt $A$ và $B$, có thể vẽ được bao nhiêu đường thẳng?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Theo tiên đề cơ bản về đường thẳng: Có một và chỉ một đường thẳng đi qua hai điểm phân biệt cho trước.',
        rubricSteps: [{ step: 'Nhận biết đúng tiên đề về đường thẳng qua 2 điểm phân biệt', points: 0.5 }],
        keyFormula: 'Qua 2 điểm phân biệt luôn xác định 1 đường thẳng duy nhất.',
        commonMistake: 'Nhầm với câu hỏi qua 1 điểm vẽ được vô số đường thẳng.',
      };
    },
  },
  {
    id: 'T_G6_C5_EASY_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Đoạn thẳng và độ dài đoạn thẳng',
    topic: 'Trung điểm của đoạn thẳng',
    problemType: 'Tính độ dài đoạn nối trung điểm',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const len = rng.nextInt(6, 16) * 2; // số chẵn
      const half = len / 2;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${half}\\text{ cm}$`,
        [
          { text: `$${len}\\text{ cm}$`, errorType: 'GIỮ_NGUYÊN_ĐỘ_DÀI' },
          { text: `$${half / 2}\\text{ cm}$`, errorType: 'CHIA_BỐN' },
          { text: `$${len - 2}\\text{ cm}$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Đoạn thẳng và độ dài đoạn thẳng',
        topic: 'Trung điểm của đoạn thẳng',
        problemType: 'Tính độ dài đoạn nối trung điểm',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Cho đoạn thẳng $AB = ${len}\\text{ cm}$. Điểm $M$ là trung điểm của đoạn thẳng $AB$. Độ dài đoạn thẳng $AM$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Vì $M$ là trung điểm của $AB$ nên $AM = MB = \\frac{AB}{2} = \\frac{${len}}{2} = ${half}\\text{ cm}$.`,
        rubricSteps: [{ step: 'Áp dụng công thức tính khoảng cách đến trung điểm', points: 0.5 }],
        keyFormula: '$AM = \\frac{AB}{2}$',
        commonMistake: 'Nhầm điểm nằm giữa với trung điểm.',
      };
    },
  },
  {
    id: 'T_G6_C5_EASY_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Góc và số đo góc',
    topic: 'Phân loại góc',
    problemType: 'Nhận biết góc vuông, nhọn, tù, bẹt',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const angle = rng.nextInt(95, 160);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Góc tù',
        [
          { text: 'Góc nhọn', errorType: 'NHẦM_VỚI_GÓC_BÉ_HƠN_90' },
          { text: 'Góc vuông', errorType: 'NHẦM_VỚI_GÓC_90' },
          { text: 'Góc bẹt', errorType: 'NHẦM_VỚI_GÓC_180' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Góc và số đo góc',
        topic: 'Phân loại góc',
        problemType: 'Nhận biết góc vuông, nhọn, tù, bẹt',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Một góc có số đo bằng $${angle}^\\circ$ là loại góc nào?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Vì $90^\\circ < ${angle}^\\circ < 180^\\circ$ nên đây là góc tù.`,
        rubricSteps: [{ step: 'Nhận biết đúng định nghĩa góc tù', points: 0.5 }],
        keyFormula: 'Góc tù có số đo lớn hơn $90^\\circ$ và nhỏ hơn $180^\\circ$.',
        commonMistake: 'Nhầm lẫn giữa góc nhọn và góc tù.',
      };
    },
  },
  {
    id: 'T_G6_C5_EASY_04',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Đoạn thẳng và độ dài đoạn thẳng',
    topic: 'Cộng đoạn thẳng',
    problemType: 'Tính độ dài đoạn thẳng khi có điểm nằm giữa',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const ab = rng.nextInt(3, 7);
      const bc = rng.nextInt(4, 9);
      const ac = ab + bc;
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Đoạn thẳng và độ dài đoạn thẳng',
        topic: 'Cộng đoạn thẳng',
        problemType: 'Tính độ dài đoạn thẳng khi có điểm nằm giữa',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 1.0,
        textbooks: [book],
        content: `Trên đường thẳng $xy$, lấy ba điểm $A, B, C$ sao cho điểm $B$ nằm giữa hai điểm $A$ và $C$. Biết $AB = ${ab}\\text{ cm}$, $BC = ${bc}\\text{ cm}$. Tính độ dài đoạn thẳng $AC$.`,
        correctAnswer: String(ac),
        acceptedAnswers: [String(ac), `${ac}cm`, `${ac} cm`],
        solution: `Vì điểm $B$ nằm giữa hai điểm $A$ và $C$ nên:\n$$AC = AB + BC = ${ab} + ${bc} = ${ac}\\text{ cm}$$`,
        rubricSteps: [{ step: `Cộng hai đoạn thẳng ra $AC = ${ac}\\text{ cm}$`, points: 1.0 }],
        keyFormula: '$B$ nằm giữa $A, C \\implies AB + BC = AC$.',
        commonMistake: 'Lấy $BC - AB$.',
      };
    },
  },

  // MEDIUM
  {
    id: 'T_G6_C5_MED_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Góc và số đo góc',
    topic: 'Cộng số đo góc',
    problemType: 'Tìm số đo góc phụ hoặc kề bù',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = rng.nextInt(35, 75);
      const b = 180 - a;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${b}^\\circ$`,
        [
          { text: `$${90 - a}^\\circ$`, errorType: 'NHẦM_VỚI_HAI_GÓC_PHỤ_NHAU' },
          { text: `$${a}^\\circ$`, errorType: 'CHO_LÀ_BẰNG_NHAU' },
          { text: `$${b - 10}^\\circ$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Góc và số đo góc',
        topic: 'Cộng số đo góc',
        problemType: 'Tìm số đo góc phụ hoặc kề bù',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Biết hai góc $\\widehat{xOy}$ và $\\widehat{yOz}$ là hai góc kề bù, và $\\widehat{xOy} = ${a}^\\circ$. Số đo của góc $\\widehat{yOz}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Hai góc kề bù có tổng số đo bằng $180^\\circ$:\n$$\\widehat{yOz} = 180^\\circ - \\widehat{xOy} = 180^\\circ - ${a}^\\circ = ${b}^\\circ$$`,
        rubricSteps: [{ step: `Lấy $180^\\circ - ${a}^\\circ = ${b}^\\circ$`, points: 0.5 }],
        keyFormula: 'Hai góc kề bù có tổng số đo bằng $180^\\circ$.',
        commonMistake: 'Lấy $90^\\circ$ trừ (nhầm với hai góc phụ nhau).',
      };
    },
  },
  {
    id: 'T_G6_C5_MED_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Đoạn thẳng và độ dài đoạn thẳng',
    topic: 'Điểm nằm giữa trên tia',
    problemType: 'Chứng minh điểm là trung điểm',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const oa = rng.nextInt(3, 6);
      const ob = oa * 2;
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Đoạn thẳng và độ dài đoạn thẳng',
        topic: 'Điểm nằm giữa trên tia',
        problemType: 'Chứng minh điểm là trung điểm',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Trên tia $Ox$, lấy hai điểm $A$ và $B$ sao cho $OA = ${oa}\\text{ cm}$ và $OB = ${ob}\\text{ cm}$.\na) Điểm $A$ có nằm giữa hai điểm $O$ và $B$ không? Vì sao?\nb) Điểm $A$ có phải là trung điểm của đoạn thẳng $OB$ không?`,
        correctAnswer: 'A là trung điểm của OB',
        acceptedAnswers: ['A la trung diem', 'trung diem', 'A là trung điểm của OB'],
        solution: `a) Vì trên tia $Ox$ có $OA < OB$ ($${oa}\\text{ cm} < ${ob}\\text{ cm}$) nên điểm $A$ nằm giữa hai điểm $O$ và $B$.\nb) Ta có $OA + AB = OB \\implies AB = OB - OA = ${ob} - ${oa} = ${oa}\\text{ cm}$.\nVì điểm $A$ nằm giữa $O, B$ và $OA = AB = ${oa}\\text{ cm}$ nên $A$ là trung điểm của đoạn thẳng $OB$.`,
        rubricSteps: [
          { step: 'Lập luận điểm A nằm giữa O và B', points: 0.5 },
          { step: 'Tính độ dài AB và kết luận A là trung điểm', points: 0.5 },
        ],
        keyFormula: '$A$ là trung điểm của $OB \\iff A$ nằm giữa và $OA = AB$.',
        commonMistake: 'Chỉ kết luận $OA = AB$ mà quên chứng minh điểm nằm giữa.',
      };
    },
  },
  {
    id: 'T_G6_C5_MED_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Góc và số đo góc',
    topic: 'Tia phân giác của góc',
    problemType: 'Tính số đo góc tạo bởi tia phân giác',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const full = rng.nextInt(35, 75) * 2; // góc chẵn
      const half = full / 2;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${half}^\\circ$`,
        [
          { text: `$${full}^\\circ$`, errorType: 'GIỮ_NGUYÊN_GÓC' },
          { text: `$${half + 10}^\\circ$`, errorType: 'TÍNH_NHẦM' },
          { text: `$${full * 2}^\\circ$`, errorType: 'GẤP_ĐÔI_GÓC' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Góc và số đo góc',
        topic: 'Tia phân giác của góc',
        problemType: 'Tính số đo góc tạo bởi tia phân giác',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Cho tia $Oz$ là tia phân giác của góc $\\widehat{xOy}$. Biết $\\widehat{xOy} = ${full}^\\circ$, số đo của góc $\\widehat{xOz}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Vì $Oz$ là tia phân giác của $\\widehat{xOy}$ nên:\n$$\\widehat{xOz} = \\frac{\\widehat{xOy}}{2} = \\frac{${full}^\\circ}{2} = ${half}^\\circ$$`,
        rubricSteps: [{ step: 'Áp dụng định nghĩa tia phân giác chia đôi góc', points: 0.5 }],
        keyFormula: '$\\widehat{xOz} = \\frac{\\widehat{xOy}}{2}$',
        commonMistake: 'Nhầm tia phân giác với tia nằm trong bất kỳ.',
      };
    },
  },
  {
    id: 'T_G6_C5_MED_04',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Điểm và đường thẳng',
    topic: 'Số đoạn thẳng nối n điểm',
    problemType: 'Đếm số đoạn thẳng',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const n = rng.nextInt(5, 9);
      const total = (n * (n - 1)) / 2;
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Điểm và đường thẳng',
        topic: 'Số đoạn thẳng nối n điểm',
        problemType: 'Đếm số đoạn thẳng',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Cho $${n}$ điểm phân biệt trong đó không có ba điểm nào thẳng hàng. Cứ qua hai điểm vẽ được một đoạn thẳng. Hỏi vẽ được tất cả bao nhiêu đoạn thẳng?`,
        correctAnswer: String(total),
        acceptedAnswers: [String(total), `${total} đoạn thẳng`, `${total} doan`],
        solution: `Số đoạn thẳng tạo thành từ $${n}$ điểm phân biệt (không có 3 điểm nào thẳng hàng) là:\n$$N = \\frac{${n} \\cdot (${n} - 1)}{2} = \\frac{${n} \\cdot ${n - 1}}{2} = ${total}\\text{ đoạn thẳng}$$`,
        rubricSteps: [
          { step: 'Nêu công thức $n(n-1)/2$', points: 0.5 },
          { step: `Tính ra đúng kết quả $${total}$ đoạn thẳng`, points: 0.5 },
        ],
        keyFormula: '$N = \\frac{n(n-1)}{2}$',
        commonMistake: 'Lấy $n(n-1)$ mà quên chia 2 do mỗi đoạn được đếm 2 lần.',
      };
    },
  },

  // HARD
  {
    id: 'T_G6_C5_HARD_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Đoạn thẳng và độ dài đoạn thẳng',
    topic: 'Khoảng cách giữa hai trung điểm',
    problemType: 'Tính khoảng cách hai trung điểm',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const ab = rng.nextInt(8, 16);
      const ans = ab / 2;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${ans}\\text{ cm}$`,
        [
          { text: `$${ab}\\text{ cm}$`, errorType: 'BẰNG_TOÀN_ĐOẠN' },
          { text: `$${ans / 2}\\text{ cm}$`, errorType: 'CHIA_BỐN' },
          { text: `$${ab - 2}\\text{ cm}$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Đoạn thẳng và độ dài đoạn thẳng',
        topic: 'Khoảng cách giữa hai trung điểm',
        problemType: 'Tính khoảng cách hai trung điểm',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: `Cho đoạn thẳng $AB = ${ab}\\text{ cm}$. Điểm $C$ là một điểm bất kỳ nằm giữa $A$ và $B$. Gọi $M, N$ lần lượt là trung điểm của $AC$ và $CB$. Độ dài đoạn thẳng $MN$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Vì $M$ là trung điểm của $AC$ và $N$ là trung điểm của $CB$, điểm $C$ nằm giữa $A, B$ nên:\n$$MN = MC + CN = \\frac{AC}{2} + \\frac{CB}{2} = \\frac{AC + CB}{2} = \\frac{AB}{2} = \\frac{${ab}}{2} = ${ans}\\text{ cm}$$`,
        rubricSteps: [{ step: 'Chứng minh $MN = AB/2$ và tính đúng kết quả', points: 0.5 }],
        keyFormula: '$MN = \\frac{AB}{2}$ không phụ thuộc vị trí điểm $C$.',
        commonMistake: 'Nghĩ rằng $MN$ thay đổi tùy thuộc vào vị trí của $C$.',
      };
    },
  },
  {
    id: 'T_G6_C5_HARD_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Góc và số đo góc',
    topic: 'Góc tạo bởi hai tia phân giác của hai góc kề bù',
    problemType: 'Tính góc vuông giữa 2 phân giác',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Góc và số đo góc',
        topic: 'Góc tạo bởi hai tia phân giác của hai góc kề bù',
        problemType: 'Tính góc vuông giữa 2 phân giác',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: 'Cho hai góc $\\widehat{xOy}$ và $\\widehat{yOz}$ là hai góc kề bù. Tia $Om$ là tia phân giác của góc $\\widehat{xOy}$, tia $On$ là tia phân giác của góc $\\widehat{yOz}$. Tính số đo của góc $\\widehat{mOn}$.',
        correctAnswer: '90',
        acceptedAnswers: ['90', '90 độ', '90°', '90 deg'],
        solution: `Vì hai góc kề bù nên $\\widehat{xOy} + \\widehat{yOz} = 180^\\circ$.\nDo $Om, On$ là tia phân giác nên:\n$$\\widehat{mOn} = \\widehat{mOy} + \\widehat{yOn} = \\frac{\\widehat{xOy}}{2} + \\frac{\\widehat{yOz}}{2} = \\frac{\\widehat{xOy} + \\widehat{yOz}}{2} = \\frac{180^\\circ}{2} = 90^\\circ$$`,
        rubricSteps: [
          { step: 'Biểu diễn góc $\\widehat{mOn}$ theo nửa tổng hai góc kề bù', points: 0.5 },
          { step: 'Tính ra góc $\\widehat{mOn} = 90^\\circ$', points: 0.5 },
        ],
        keyFormula: 'Hai tia phân giác của hai góc kề bù luôn vuông góc với nhau ($90^\\circ$).',
        commonMistake: 'Cho rằng số đo góc phụ thuộc vào từng góc cụ thể.',
      };
    },
  },
  {
    id: 'T_G6_C5_HARD_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Điểm và đường thẳng',
    topic: 'Số giao điểm tối đa',
    problemType: 'Tính số giao điểm của n đường thẳng',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const n = rng.nextInt(6, 10);
      const total = (n * (n - 1)) / 2;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${total}$ giao điểm`,
        [
          { text: `$${n * (n - 1)}$ giao điểm`, errorType: 'QUÊN_CHIA_HAI' },
          { text: `$${n}$ giao điểm`, errorType: 'CHO_LÀ_BẰNG_N' },
          { text: `$${total - 1}$ giao điểm`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Điểm và đường thẳng',
        topic: 'Số giao điểm tối đa',
        problemType: 'Tính số giao điểm của n đường thẳng',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: `Cho $${n}$ đường thẳng phân biệt, trong đó bất kỳ hai đường thẳng nào cũng cắt nhau và không có ba đường thẳng nào cùng đi qua một điểm. Số giao điểm tạo thành là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Mỗi đường thẳng cắt $${n - 1}$ đường thẳng còn lại tạo ra $${n - 1}$ giao điểm. Vì mỗi giao điểm được tính $2$ lần nên số giao điểm là:\n$$N = \\frac{${n} \\cdot (${n} - 1)}{2} = ${total}\\text{ giao điểm}$$`,
        rubricSteps: [{ step: 'Áp dụng công thức số giao điểm tối đa $n(n-1)/2$', points: 0.5 }],
        keyFormula: '$N = \\frac{n(n-1)}{2}$',
        commonMistake: 'Quên chia cho 2.',
      };
    },
  },
  {
    id: 'T_G6_C5_HARD_04',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Góc và số đo góc',
    topic: 'Tổng số góc tạo bởi n tia chung gốc',
    problemType: 'Đếm số góc tạo bởi n tia chung gốc',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const n = rng.nextInt(5, 8);
      const total = (n * (n - 1)) / 2;
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Góc và số đo góc',
        topic: 'Tổng số góc tạo bởi n tia chung gốc',
        problemType: 'Đếm số góc tạo bởi n tia chung gốc',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: `Cho $${n}$ tia chung gốc phân biệt. Hỏi có tất cả bao nhiêu góc được tạo thành từ $${n}$ tia này?`,
        correctAnswer: String(total),
        acceptedAnswers: [String(total), `${total} góc`, `${total} goc`],
        solution: `Mỗi tia kết hợp với $${n - 1}$ tia còn lại tạo thành $${n - 1}$ góc. Mỗi góc được tính lặp $2$ lần, nên số góc tạo thành là:\n$$N = \\frac{${n} \\cdot (${n} - 1)}{2} = ${total}\\text{ góc}$$`,
        rubricSteps: [
          { step: 'Lập luận công thức tính số góc tạo bởi n tia chung gốc', points: 0.5 },
          { step: `Tính ra kết quả $${total}$ góc`, points: 0.5 },
        ],
        keyFormula: '$N = \\frac{n(n-1)}{2}$',
        commonMistake: 'Lấy $n$ góc hoặc quên chia 2.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 6: DỮ LIỆU VÀ XÁC SUẤT THỰC NGHIỆM (G6_C6) - HK2
  // ============================================================================
  // EASY
  {
    id: 'T_G6_C6_EASY_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Thu thập và tổ chức dữ liệu',
    topic: 'Bảng số liệu thống kê',
    problemType: 'Đọc số liệu từ bảng thống kê',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const good = rng.nextInt(12, 18);
      const excellent = rng.nextInt(8, 14);
      const avg = rng.nextInt(5, 10);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${excellent}$ học sinh`,
        [
          { text: `$${good}$ học sinh`, errorType: 'NHẦM_SANG_HỌC_LỰC_KHÁ' },
          { text: `$${avg}$ học sinh`, errorType: 'NHẦM_SANG_HỌC_LỰC_TRUNG_BÌNH' },
          { text: `$${good + excellent}$ học sinh`, errorType: 'CỘNG_HAI_MỨC' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Thu thập và tổ chức dữ liệu',
        topic: 'Bảng số liệu thống kê',
        problemType: 'Đọc số liệu từ bảng thống kê',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Thống kê kết quả học tập của lớp 6A: Giỏi ($${excellent}$ bạn), Khá ($${good}$ bạn), Đạt ($${avg}$ bạn). Số học sinh đạt kết quả Giỏi của lớp là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Từ bảng số liệu thống kê, số học sinh đạt kết quả Giỏi là $${excellent}$ học sinh.`,
        rubricSteps: [{ step: 'Đọc đúng số liệu từ bảng thống kê', points: 0.5 }],
        keyFormula: 'Tra cứu giá trị tương ứng trên bảng số liệu.',
        commonMistake: 'Đọc nhầm dòng hoặc cột.',
      };
    },
  },
  {
    id: 'T_G6_C6_EASY_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Xác suất thực nghiệm',
    topic: 'Sự kiện trong trò chơi tung đồng xu',
    problemType: 'Nhận biết sự kiện chắc chắn, không thể, có thể',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Sự kiện có thể xảy ra',
        [
          { text: 'Sự kiện chắc chắn xảy ra', errorType: 'CHO_LÀ_CHẮC_CHẮN' },
          { text: 'Sự kiện không thể xảy ra', errorType: 'CHO_LÀ_KHÔNG_THỂ' },
          { text: 'Sự kiện ngẫu nhiên luôn đúng', errorType: 'SAI_THUẬT_NGỮ' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Xác suất thực nghiệm',
        topic: 'Sự kiện trong trò chơi tung đồng xu',
        problemType: 'Nhận biết sự kiện chắc chắn, không thể, có thể',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: 'Tung một đồng xu cân đối một lần. Sự kiện "Mặt xuất hiện của đồng xu là mặt sấp" là loại sự kiện nào?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Đồng xu có hai mặt Sấp và Ngửa. Khi tung một lần, mặt sấp có thể xuất hiện hoặc không xuất hiện, do đó đây là sự kiện có thể xảy ra.',
        rubricSteps: [{ step: 'Nhận biết đúng tính chất của sự kiện có thể xảy ra', points: 0.5 }],
        keyFormula: 'Sự kiện có thể xảy ra: có thể xuất hiện hoặc không.',
        commonMistake: 'Nhầm lẫn giữa sự kiện chắc chắn và có thể.',
      };
    },
  },
  {
    id: 'T_G6_C6_EASY_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Biểu diễn dữ liệu trên bảng, biểu đồ',
    topic: 'Biểu đồ tranh',
    problemType: 'Tính tổng số lượng từ biểu tượng biểu đồ tranh',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const iconValue = 10;
      const numIcons = rng.nextInt(3, 7);
      const total = iconValue * numIcons;
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Biểu diễn dữ liệu trên bảng, biểu đồ',
        topic: 'Biểu đồ tranh',
        problemType: 'Tính tổng số lượng từ biểu tượng biểu đồ tranh',
        type: 'essay',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 1.0,
        textbooks: [book],
        content: `Trong biểu đồ tranh, mỗi biểu tượng 🚗 đại diện cho $${iconValue}$ chiếc ô tô bán được. Nếu một cửa hàng có $${numIcons}$ biểu tượng 🚗 thì số ô tô bán được là bao nhiêu chiếc?`,
        correctAnswer: String(total),
        acceptedAnswers: [String(total), `${total} chiếc`, `${total} chiec`],
        solution: `Số ô tô bán được là: $${numIcons} \\cdot ${iconValue} = ${total}$ chiếc.`,
        rubricSteps: [{ step: `Nhân số biểu tượng với quy ước tính ra $${total}$ chiếc`, points: 1.0 }],
        keyFormula: 'Số lượng = Số biểu tượng $\\times$ Giá trị 1 biểu tượng.',
        commonMistake: 'Chỉ đếm số biểu tượng mà quên nhân giá trị quy ước.',
      };
    },
  },
  {
    id: 'T_G6_C6_EASY_04',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Xác suất thực nghiệm',
    topic: 'Tính xác suất thực nghiệm',
    problemType: 'Tỉ số số lần xuất hiện trên tổng số lần',
    difficulty: 'easy',
    cognitiveLevel: 'nhan_biet',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const totalToss = 50;
      const headCount = rng.nextInt(20, 30);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$\\frac{${headCount}}{${totalToss}}$`,
        [
          { text: `$\\frac{${totalToss - headCount}}{${totalToss}}$`, errorType: 'TÍNH_MẶT_NGỬA' },
          { text: `$\\frac{${headCount}}{100}$`, errorType: 'MẪU_SỐ_SAI' },
          { text: `$\\frac{1}{2}$`, errorType: 'XÁC_SUẤT_LÝ_THUYẾT' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Xác suất thực nghiệm',
        topic: 'Tính xác suất thực nghiệm',
        problemType: 'Tỉ số số lần xuất hiện trên tổng số lần',
        type: 'mcq',
        difficulty: 'easy',
        cognitiveLevel: 'nhan_biet',
        points: 0.5,
        textbooks: [book],
        content: `Tung một đồng xu $${totalToss}$ lần, có $${headCount}$ lần xuất hiện mặt sấp. Xác suất thực nghiệm xuất hiện mặt sấp là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Xác suất thực nghiệm xuất hiện mặt sấp bằng số lần xuất hiện mặt sấp chia cho tổng số lần tung:\n$$P = \\frac{${headCount}}{${totalToss}}$$`,
        rubricSteps: [{ step: 'Lập đúng tỉ số xác suất thực nghiệm', points: 0.5 }],
        keyFormula: '$P = \\frac{\\text{Số lần sự kiện xảy ra}}{\\text{Tổng số lần thử}}$',
        commonMistake: 'Chọn 1/2 (xác suất lý thuyết) thay vì số liệu thực nghiệm.',
      };
    },
  },

  // MEDIUM
  {
    id: 'T_G6_C6_MED_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Xác suất thực nghiệm',
    topic: 'Xúc xắc 6 mặt',
    problemType: 'Xác suất thực nghiệm mặt chấm chẵn',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const totalRolls = 60;
      const evenCount = rng.nextInt(25, 35);
      const pct = Math.round((evenCount / totalRolls) * 100);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `Khoảng $${pct}\\%$`,
        [
          { text: `Khoảng $${100 - pct}\\%$`, errorType: 'MẶT_LẺ' },
          { text: `Khoảng $50\\%$`, errorType: 'LÝ_THUYẾT' },
          { text: `Khoảng $${pct + 12}\\%$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Xác suất thực nghiệm',
        topic: 'Xúc xắc 6 mặt',
        problemType: 'Xác suất thực nghiệm mặt chấm chẵn',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Gieo một con xúc xắc $6$ mặt $${totalRolls}$ lần liên tiếp, ghi nhận được $${evenCount}$ lần xuất hiện mặt có số chấm là số chẵn. Xác suất thực nghiệm xuất hiện mặt chấm chẵn là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Xác suất thực nghiệm là tỉ số giữa số lần xuất hiện mặt chẵn và tổng số lần gieo:\n$$P = \\frac{${evenCount}}{${totalRolls}} \\approx ${pct}\\%$$`,
        rubricSteps: [{ step: 'Tính đúng tỉ số phần trăm thực nghiệm', points: 0.5 }],
        keyFormula: '$P = \\frac{n(A)}{N}$',
        commonMistake: 'Mặc định xác suất luôn là 50%.',
      };
    },
  },
  {
    id: 'T_G6_C6_MED_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Biểu đồ cột và biểu đồ cột kép',
    topic: 'So sánh dữ liệu cột kép',
    problemType: 'Đọc độ chênh lệch giữa hai cột',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const scoreTerm1 = rng.nextInt(6, 8);
      const scoreTerm2 = scoreTerm1 + rng.nextInt(1, 2);
      const diff = scoreTerm2 - scoreTerm1;
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Biểu đồ cột và biểu đồ cột kép',
        topic: 'So sánh dữ liệu cột kép',
        problemType: 'Đọc độ chênh lệch giữa hai cột',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: `Trên biểu đồ cột kép ghi nhận điểm tổng kết môn Toán của bạn Nam: Học kỳ 1 đạt $${scoreTerm1}$ điểm, Học kỳ 2 đạt $${scoreTerm2}$ điểm. Hỏi điểm môn Toán của Nam ở Học kỳ 2 đã tăng thêm bao nhiêu điểm so với Học kỳ 1?`,
        correctAnswer: String(diff),
        acceptedAnswers: [String(diff), `${diff} điểm`, `${diff} diem`],
        solution: `Số điểm tăng thêm ở Học kỳ 2 so với Học kỳ 1 là:\n$$\\Delta = ${scoreTerm2} - ${scoreTerm1} = ${diff}\\text{ điểm}$$`,
        rubricSteps: [{ step: `Trừ giá trị hai cột ra kết quả $${diff}$ điểm`, points: 1.0 }],
        keyFormula: 'Độ chênh lệch = Cột sau - Cột trước.',
        commonMistake: 'Cộng hai giá trị thay vì lấy hiệu.',
      };
    },
  },
  {
    id: 'T_G6_C6_MED_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Xác suất thực nghiệm',
    topic: 'Chọn đồ vật ngẫu nhiên trong hộp',
    problemType: 'Xác suất thực nghiệm rút thẻ màu',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const red = rng.nextInt(12, 18);
      const blue = rng.nextInt(8, 14);
      const total = red + blue;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$\\frac{${red}}{${total}}$`,
        [
          { text: `$\\frac{${blue}}{${total}}$`, errorType: 'TÍNH_THẺ_XANH' },
          { text: `$\\frac{${red}}{${blue}}$`, errorType: 'TỈ_SỐ_GIỮA_HAI_LOẠI' },
          { text: `$\\frac{1}{2}$`, errorType: 'ĐOÁN_MÒ' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Xác suất thực nghiệm',
        topic: 'Chọn đồ vật ngẫu nhiên trong hộp',
        problemType: 'Xác suất thực nghiệm rút thẻ màu',
        type: 'mcq',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 0.5,
        textbooks: [book],
        content: `Trong một trò chơi rút thăm, bạn Lan thực hiện rút thẻ $${total}$ lần và ghi nhận có $${red}$ lần rút được thẻ đỏ, $${blue}$ lần rút được thẻ xanh. Xác suất thực nghiệm rút được thẻ màu đỏ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Xác suất thực nghiệm rút được thẻ đỏ bằng số lần rút được thẻ đỏ chia cho tổng số lần thực hiện:\n$$P = \\frac{${red}}{${total}}$$`,
        rubricSteps: [{ step: 'Lập đúng tỉ số xác suất thực nghiệm của thẻ đỏ', points: 0.5 }],
        keyFormula: '$P(\\text{Đỏ}) = \\frac{N_{\\text{đỏ}}}{N_{\\text{tổng}}}$',
        commonMistake: 'Lấy số lần thẻ đỏ chia cho số lần thẻ xanh.',
      };
    },
  },
  {
    id: 'T_G6_C6_MED_04',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Thu thập và tổ chức dữ liệu',
    topic: 'Xác định dữ liệu không hợp lý',
    problemType: 'Kiểm tra tính logic của dữ liệu thu thập',
    difficulty: 'medium',
    cognitiveLevel: 'thong_hieu',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Thu thập và tổ chức dữ liệu',
        topic: 'Xác định dữ liệu không hợp lý',
        problemType: 'Kiểm tra tính logic của dữ liệu thu thập',
        type: 'essay',
        difficulty: 'medium',
        cognitiveLevel: 'thong_hieu',
        points: 1.0,
        textbooks: [book],
        content: 'Một học sinh ghi chép chiều cao của 4 bạn trong tổ như sau: 135 cm, 142 cm, -150 cm, 138 cm. Em hãy chỉ ra số liệu không hợp lý trong bảng và giải thích vì sao.',
        correctAnswer: '-150 cm không hợp lý vì chiều cao luôn dương',
        acceptedAnswers: ['-150', '-150 cm', '-150cm'],
        solution: 'Số liệu không hợp lý là $-150\\text{ cm}$ vì chiều cao của con người là một đại lượng hình học mang giá trị dương, không thể là số âm.',
        rubricSteps: [
          { step: 'Chỉ ra số liệu không hợp lý là -150 cm', points: 0.5 },
          { step: 'Giải thích chiều cao thực tế luôn là số dương', points: 0.5 },
        ],
        keyFormula: 'Độ dài, khối lượng, số lượng thực tế luôn $> 0$.',
        commonMistake: 'Không giải thích lý do số âm vô lý.',
      };
    },
  },

  // HARD
  {
    id: 'T_G6_C6_HARD_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Xác suất thực nghiệm',
    topic: 'Dự đoán số lượng dựa trên xác suất thực nghiệm',
    problemType: 'Ước tính số sản phẩm lỗi',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const sample = 200;
      const sampleDefect = rng.nextInt(6, 10);
      const totalProduction = 5000;
      const expectedDefects = Math.round((sampleDefect / sample) * totalProduction);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `Khoảng $${expectedDefects}$ sản phẩm`,
        [
          { text: `Khoảng $${expectedDefects * 2}$ sản phẩm`, errorType: 'GẤP_ĐÔI_ƯỚC_TÍNH' },
          { text: `Khoảng $${sampleDefect}$ sản phẩm`, errorType: 'LẤY_LUÔN_MẪU' },
          { text: `Khoảng $${expectedDefects - 20}$ sản phẩm`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Xác suất thực nghiệm',
        topic: 'Dự đoán số lượng dựa trên xác suất thực nghiệm',
        problemType: 'Ước tính số sản phẩm lỗi',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.5,
        textbooks: [book],
        content: `Kiểm tra ngẫu nhiên $${sample}$ sản phẩm của một phân xưởng may, người ta phát hiện có $${sampleDefect}$ sản phẩm bị lỗi đường chỉ. Nếu phân xưởng may $${totalProduction.toLocaleString('vi-VN')}$ sản phẩm thì ước tính có khoảng bao nhiêu sản phẩm bị lỗi?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Xác suất thực nghiệm sản phẩm bị lỗi là: $\\frac{${sampleDefect}}{${sample}}$.\nƯớc tính số sản phẩm bị lỗi trong $${totalProduction}$ sản phẩm là:\n$$N = ${totalProduction} \\cdot \\frac{${sampleDefect}}{${sample}} = ${expectedDefects}\\text{ sản phẩm}$$`,
        rubricSteps: [{ step: 'Tính xác suất thực nghiệm mẫu và nhân với tổng số sản phẩm', points: 0.5 }],
        keyFormula: 'Số lượng ước tính = Tổng số $\\times$ Xác suất thực nghiệm.',
        commonMistake: 'Lấy số sản phẩm lỗi trong mẫu làm câu trả lời.',
      };
    },
  },
  {
    id: 'T_G6_C6_HARD_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Biểu đồ cột và biểu đồ cột kép',
    topic: 'Tính tỉ lệ phần trăm từ biểu đồ cột',
    problemType: 'Tính phần trăm một mục so với tổng',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const a = 15;
      const b = 25;
      const c = 40;
      const d = 20;
      const total = a + b + c + d; // 100
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Biểu đồ cột và biểu đồ cột kép',
        topic: 'Tính tỉ lệ phần trăm từ biểu đồ cột',
        problemType: 'Tính phần trăm một mục so với tổng',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        content: `Số cây trồng được của 4 lớp khối 6 lần lượt là: 6A ($${a}$ cây), 6B ($${b}$ cây), 6C ($${c}$ cây), 6D ($${d}$ cây). Tính tỉ số phần trăm số cây của lớp 6C so với tổng số cây của cả khối 6.`,
        correctAnswer: '40%',
        acceptedAnswers: ['40%', '40', '40 %'],
        solution: `Tổng số cây trồng được của cả khối 6 là: $${a} + ${b} + ${c} + ${d} = ${total}$ cây.\nTỉ số phần trăm số cây lớp 6C trồng được là:\n$$\\frac{${c}}{${total}} \\cdot 100\\% = 40\\%$$`,
        rubricSteps: [
          { step: `Tính tổng số cây là $${total}$ cây`, points: 0.5 },
          { step: 'Tính ra tỉ số phần trăm là 40%', points: 0.5 },
        ],
        keyFormula: '$\\% = \\frac{\\text{Số cây 6C}}{\\text{Tổng số cây}} \\cdot 100\\%$',
        commonMistake: 'Lấy số cây lớp 6C chia cho số cây một lớp khác.',
      };
    },
  },
  {
    id: 'T_G6_C6_HARD_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Xác suất thực nghiệm',
    topic: 'So sánh xác suất lý thuyết và thực nghiệm',
    problemType: 'Quy luật số lớn trong xác suất',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Càng tiến gần đến xác suất lý thuyết (0,5)',
        [
          { text: 'Luôn luôn bằng chính xác 0,5', errorType: 'HIỂU_SAI_BẢN_CHẤT' },
          { text: 'Càng ngày càng sai lệch lớn khỏi 0,5', errorType: 'NGƯỢC_QUY_LUẬT' },
          { text: 'Không có mối liên hệ nào', errorType: 'THIẾU_KIẾN_THỨC' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Xác suất thực nghiệm',
        topic: 'So sánh xác suất lý thuyết và thực nghiệm',
        problemType: 'Quy luật số lớn trong xác suất',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.5,
        textbooks: [book],
        content: 'Khi số lần gieo một đồng xu cân đối ngày càng nhiều (hàng nghìn, hàng vạn lần), xác suất thực nghiệm của mặt sấp sẽ có xu hướng như thế nào?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Theo định luật số lớn trong xác suất thống kê: khi số phép thử càng nhiều thì xác suất thực nghiệm sẽ càng dao động quanh giá trị và tiến gần tới xác suất lý thuyết (ở đây là 0,5 hay 50%).',
        rubricSteps: [{ step: 'Hiểu đúng quy luật tiến gần xác suất lý thuyết khi số phép thử lớn', points: 0.5 }],
        keyFormula: 'Số phép thử $N \\to \\infty \\implies P_{\\text{thực nghiệm}} \\to P_{\\text{lý thuyết}}$.',
        commonMistake: 'Nghĩ rằng thực nghiệm phải bằng chính xác 0,5 trong mọi trường hợp.',
      };
    },
  },
  {
    id: 'T_G6_C6_HARD_04',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Thu thập và tổ chức dữ liệu',
    topic: 'Phân tích tính đại diện của mẫu khảo sát',
    problemType: 'Đánh giá tính đại diện mẫu điều tra',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    generate(rng, book) {
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Thu thập và tổ chức dữ liệu',
        topic: 'Phân tích tính đại diện của mẫu khảo sát',
        problemType: 'Đánh giá tính đại diện mẫu điều tra',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        content: 'Để khảo sát môn thể thao yêu thích của học sinh toàn trường THCS, bạn Mai chỉ đến sân bóng đá sau giờ học và hỏi $50$ bạn đang đá bóng tại đó. Mẫu khảo sát của Mai có mang tính đại diện cho toàn trường không? Giải thích vì sao.',
        correctAnswer: 'Không có tính đại diện vì chỉ khảo sát học sinh đang chơi bóng đá',
        acceptedAnswers: ['Khong', 'Không', 'khong co tinh dai dien', 'không có tính đại diện'],
        solution: 'Mẫu khảo sát của Mai không mang tính đại diện cho toàn bộ học sinh trong trường vì:\n- Mai chỉ khảo sát tại sân bóng đá, những bạn có mặt ở đây đa phần đều đã yêu thích bóng đá.\n- Bỏ qua các học sinh chơi môn khác (cầu lông, bóng chuyền, cờ vua, bơi lội...) hoặc học sinh không chơi thể thao.\nĐể mẫu đại diện, Mai cần chọn ngẫu nhiên học sinh từ các lớp khác nhau trong trường.',
        rubricSteps: [
          { step: 'Khẳng định mẫu khảo sát không mang tính đại diện', points: 0.5 },
          { step: 'Giải thích nguyên nhân bị lệch do đối tượng khảo sát định kiến', points: 0.5 },
        ],
        keyFormula: 'Mẫu điều tra phải mang tính ngẫu nhiên và đại diện cho toàn thể.',
        commonMistake: 'Cho rằng 50 bạn là đủ lớn nên có tính đại diện.',
      };
    },
  },
];

export const grade6Templates: QuestionTemplate[] = [
  ...rawGrade6Templates.filter((t) => !t.id.includes('HARD')),
  ...grade6VdVdcTemplates,
];
