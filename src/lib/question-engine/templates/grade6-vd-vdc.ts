// ==============================================================================
// MathMaster THCS - Ngân Hàng Câu Hỏi Vận Dụng & Vận Dụng Cao Lớp 6 (GDPT 2018)
// File: src/lib/question-engine/templates/vd-vdc-grade6.ts
// Mỗi chương: 4 template Vận dụng (VD) + 3 template Vận dụng cao (VDC)
// Sàn độ khó: VD >= 3 bước suy luận; VDC >= 5 bước suy luận + liên chuyên đề/biện luận
// ==============================================================================

import type { QuestionTemplate, ComplexityMeta } from '../types';
import { buildShuffledMcq, gcd, lcm, formatFraction } from '../template-helpers';
import { KNTTContexts } from '../contexts/KNTT';

export const grade6VdVdcTemplates: QuestionTemplate[] = [
  // ============================================================================
  // CHƯƠNG 1: TẬP HỢP CÁC SỐ TỰ NHIÊN (G6_C1)
  // ============================================================================
  // VD 1: Chia tổ / phần thưởng thực tế (ƯCLN)
  {
    id: 'T_G6_C1_HARD_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Ước chung lớn nhất & Bội chung nhỏ nhất',
    topic: 'Chia hết, ƯCLN và BCNN',
    problemType: 'Bài toán thực tế chia tổ học sinh (ƯCLN)',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['mo_hinh_hoa_thuc_te', 'uoc_chung_lon_nhat'],
      crossTopic: false,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const g = rng.nextInt(4, 8);
      const malePer = rng.nextInt(3, 5);
      const femalePer = rng.nextInt(3, 5);
      const totalMale = g * malePer;
      const totalFemale = g * femalePer;
      const name = KNTTContexts.getStudentName(rng);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${g}$ tổ`,
        [
          { text: `$${g * 2}$ tổ`, errorType: 'GẤP_ĐÔI_SỐ_TỔ' },
          { text: `$${malePer}$ tổ`, errorType: 'NHẦM_SỐ_NAM_MỖI_TỔ' },
          { text: `$${g - 1}$ tổ`, errorType: 'TÍNH_SAI_ƯỚC_CHUNG' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Ước chung lớn nhất & Bội chung nhỏ nhất',
        topic: 'Chia hết, ƯCLN và BCNN',
        problemType: 'Bài toán thực tế chia tổ học sinh (ƯCLN)',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['mo_hinh_hoa_thuc_te', 'uoc_chung_lon_nhat'],
          crossTopic: false,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Lớp của bạn ${name} có $${totalMale}$ bạn nam và $${totalFemale}$ bạn nữ. Cô giáo muốn chia lớp thành nhiều tổ nhất sao cho số bạn nam và số bạn nữ ở mỗi tổ đều bằng nhau. Số tổ nhiều nhất có thể chia được là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Gọi số tổ nhiều nhất có thể chia là $x$ ($x \\in \\mathbb{N}^*$).\nBước 2: Vì số nam và nữ chia đều nên $${totalMale} \\,\\vdots\\, x$ và $${totalFemale} \\,\\vdots\\, x$. Do $x$ nhiều nhất nên $x = \\text{ƯCLN}(${totalMale}, ${totalFemale})$.\nBước 3: Phân tích ra thừa số nguyên tố, ta được $\\text{ƯCLN}(${totalMale}, ${totalFemale}) = ${g}$.\nVậy có thể chia nhiều nhất $${g}$ tổ.`,
        rubricSteps: [
          { step: 'Chuyển bài toán thực tế sang tìm ƯCLN của số nam và số nữ', points: 0.25 },
          { step: `Tìm ra $\\text{ƯCLN}(${totalMale}, ${totalFemale}) = ${g}$`, points: 0.25 },
          { step: `Kết luận số tổ nhiều nhất chia được là $${g}$ tổ`, points: 0.25 },
        ],
        keyFormula: 'Số phần chia đều nhiều nhất = $\\text{ƯCLN}(a, b)$.',
      };
    },
  },
  // VD 2: Bài toán chu kỳ lặp lại (BCNN)
  {
    id: 'T_G6_C1_HARD_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Ước chung lớn nhất & Bội chung nhỏ nhất',
    topic: 'Chia hết, ƯCLN và BCNN',
    problemType: 'Bài toán thực tế chu kỳ lặp lại (BCNN)',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['mo_hinh_hoa_thuc_te', 'boi_chung_nho_nhat', 'doi_don_vi_thoi_gian'],
      crossTopic: false,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const a = rng.nextInt(6, 9);
      const b = rng.nextInt(10, 15);
      const l = lcm(a, b);
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Ước chung lớn nhất & Bội chung nhỏ nhất',
        topic: 'Chia hết, ƯCLN và BCNN',
        problemType: 'Bài toán thực tế chu kỳ lặp lại (BCNN)',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['mo_hinh_hoa_thuc_te', 'boi_chung_nho_nhat', 'doi_don_vi_thoi_gian'],
          crossTopic: false,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Hai tuyến xe buýt cùng xuất phát từ bến lúc $6$ giờ sáng. Tuyến thứ nhất cứ sau $${a}$ phút xuất bến một chuyến, tuyến thứ hai cứ sau $${b}$ phút xuất bến một chuyến. Hỏi sau ít nhất bao nhiêu phút thì hai xe lại cùng xuất bến một lúc?`,
        correctAnswer: String(l),
        acceptedAnswers: [String(l), `${l} phút`, `${l}phut`],
        solution: `Bước 1: Gọi khoảng thời gian ít nhất để hai xe lại cùng xuất bến là $t$ phút ($t \\in \\mathbb{N}^*$).\nBước 2: Vì hai xe cùng xuất bến nên $t \\,\\vdots\\, ${a}$ và $t \\,\\vdots\\, ${b}$. Vì thời gian là ít nhất nên $t = \\text{BCNN}(${a}, ${b})$.\nBước 3: Ta có $\\text{BCNN}(${a}, ${b}) = ${l}$.\nVậy sau ít nhất $${l}$ phút thì hai xe lại cùng xuất bến.`,
        rubricSteps: [
          { step: 'Lập luận thời gian gặp lại là BCNN của hai chu kỳ', points: 0.3 },
          { step: `Tính đúng $\\text{BCNN}(${a}, ${b}) = ${l}$`, points: 0.4 },
          { step: `Kết luận thời gian ít nhất là $${l}$ phút`, points: 0.3 },
        ],
        keyFormula: '$t = \\text{BCNN}(a, b)$.',
      };
    },
  },
  // VD 3: Tìm số tự nhiên thỏa mãn chia có dư trong khoảng
  {
    id: 'T_G6_C1_HARD_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Phép chia hết và phép chia có dư',
    topic: 'Số tự nhiên chia có dư',
    problemType: 'Tìm số tự nhiên bị chặn khoảng thỏa mãn chia có dư',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 4,
      techniques: ['boi_chung_nho_nhat', 'so_du_chia_het', 'danh_gia_khoang'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const l = 60; // BCNN(4, 5, 6)
      const rem = 3;
      const k = rng.nextInt(2, 4);
      const ans = l * k + rem;
      const low = l * k - 25;
      const high = l * k + 35;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$x = ${ans}$`,
        [
          { text: `$x = ${ans - rem}$`, errorType: 'QUÊN_CỘNG_SỐ_DƯ' },
          { text: `$x = ${ans + rem}$`, errorType: 'CỘNG_THỪA_SỐ_DƯ' },
          { text: `$x = ${l * (k + 1)}$`, errorType: 'LẤY_SAI_BỘI' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Phép chia hết và phép chia có dư',
        topic: 'Số tự nhiên chia có dư',
        problemType: 'Tìm số tự nhiên bị chặn khoảng thỏa mãn chia có dư',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 4,
          techniques: ['boi_chung_nho_nhat', 'so_du_chia_het', 'danh_gia_khoang'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Tìm số tự nhiên $x$ biết rằng $x$ chia cho $4, 5, 6$ đều dư $${rem}$ và $${low} < x < ${high}$:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Vì $x$ chia cho $4, 5, 6$ đều dư $${rem}$ nên $(x - ${rem}) \\,\\vdots\\, 4, 5, 6$.\nBước 2: Suy ra $x - ${rem} \\in \\text{BC}(4, 5, 6)$. Ta có $\\text{BCNN}(4, 5, 6) = 60$.\nBước 3: Do đó $x - ${rem} \\in \\{0, 60, 120, 180, 240, \\dots\\} \\implies x \\in \\{${rem}, ${60 + rem}, ${120 + rem}, ${180 + rem}, ${240 + rem}, \\dots\\}$.\nBước 4: Do $${low} < x < ${high}$, ta chọn được giá trị duy nhất $x = ${ans}$.`,
        rubricSteps: [
          { step: `Lý luận $x - ${rem}$ là bội chung của 4, 5, 6`, points: 0.25 },
          { step: 'Tính BCNN(4, 5, 6) = 60 và xác định tập hợp bội chung', points: 0.25 },
          { step: `Chặn khoảng tìm ra nghiệm duy nhất $x = ${ans}$`, points: 0.25 },
        ],
        keyFormula: '$x - r \\in \\text{BC}(a, b, c)$.',
      };
    },
  },
  // VD 4: Thu gọn tổng lũy thừa dạng cấp số nhân
  {
    id: 'T_G6_C1_HARD_04',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Lũy thừa với số mũ tự nhiên',
    topic: 'Thu gọn tổng lũy thừa',
    problemType: 'Tính tổng dãy số có quy luật nhân hệ số',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 4,
      techniques: ['tong_luy_thua_hinh_hoc', 'nhan_he_so_triet_tieu', 'giai_phuong_trinh_luy_thua'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const p = rng.nextInt(12, 20);
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Lũy thừa với số mũ tự nhiên',
        topic: 'Thu gọn tổng lũy thừa',
        problemType: 'Tính tổng dãy số có quy luật nhân hệ số',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 4,
          techniques: ['tong_luy_thua_hinh_hoc', 'nhan_he_so_triet_tieu', 'giai_phuong_trinh_luy_thua'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Cho tổng $S = 1 + 3 + 3^2 + 3^3 + \\dots + 3^{${p}}$. Tìm số tự nhiên $x$ sao cho $2S + 1 = 3^x$.`,
        correctAnswer: String(p + 1),
        acceptedAnswers: [String(p + 1), `x = ${p + 1}`, `x=${p + 1}`],
        solution: `Bước 1: Nhân cả 2 vế của $S$ với $3$:\n$3S = 3 + 3^2 + 3^3 + \\dots + 3^{${p + 1}}$.\nBước 2: Lấy $3S - S$:\n$3S - S = (3 + 3^2 + \\dots + 3^{${p + 1}}) - (1 + 3 + 3^2 + \\dots + 3^{${p}})$.\nBước 3: Thu gọn triệt tiêu các số hạng đối nhau:\n$2S = 3^{${p + 1}} - 1$.\nBước 4: Suy ra $2S + 1 = 3^{${p + 1}}$. Vì $2S + 1 = 3^x$ nên $3^x = 3^{${p + 1}} \\implies x = ${p + 1}$.`,
        rubricSteps: [
          { step: 'Nhân 3S và thiết lập phép trừ 3S - S', points: 0.3 },
          { step: `Thu gọn triệt tiêu tìm ra $2S = 3^{${p + 1}} - 1$`, points: 0.4 },
          { step: `Suy ra $2S + 1 = 3^{${p + 1}}$ và kết luận $x = ${p + 1}$`, points: 0.3 },
        ],
        keyFormula: '$qS - S = q^{n+1} - 1$.',
      };
    },
  },

  // VDC 1: Chứng minh chia hết cho hợp số
  {
    id: 'T_G6_C1_VDC_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Tính chất chia hết & Số nguyên tố',
    topic: 'Chứng minh chia hết cho hợp số',
    problemType: 'Nhóm số hạng chứng minh chia hết',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['nhom_hang_tu_luy_thua', 'thua_so_chung', 'tinh_chat_chia_het_trong_N'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const k = rng.nextInt(10, 14);
      const totalTerms = k * 3;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Tính chất chia hết & Số nguyên tố',
        topic: 'Chứng minh chia hết cho hợp số',
        problemType: 'Nhóm số hạng chứng minh chia hết',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.5,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['nhom_hang_tu_luy_thua', 'thua_so_chung', 'tinh_chat_chia_het_trong_N'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Chứng minh rằng tổng $A = 5 + 5^2 + 5^3 + 5^4 + \\dots + 5^{${totalTerms}}$ chia hết cho $31$.`,
        correctAnswer: 'A chia hết cho 31',
        acceptedAnswers: ['A chia het cho 31', 'chia het cho 31', 'Dung', 'Đúng'],
        solution: `Bước 1: Tổng $A$ có tất cả $${totalTerms}$ số hạng. Vì $${totalTerms} \\,\\vdots\\, 3$ nên ta nhóm mỗi cụm gồm $3$ số hạng liên tiếp.\nBước 2: Nhóm $A$ thành các cụm:\n$A = (5 + 5^2 + 5^3) + (5^4 + 5^5 + 5^6) + \\dots + (5^{${totalTerms - 2}} + 5^{${totalTerms - 1}} + 5^{${totalTerms}})$.\nBước 3: Đặt lũy thừa nhỏ nhất của mỗi cụm ra làm thừa số chung:\n$A = 5(1 + 5 + 5^2) + 5^4(1 + 5 + 5^2) + \\dots + 5^{${totalTerms - 2}}(1 + 5 + 5^2)$.\nBước 4: Tính tổng trong ngoặc: $1 + 5 + 5^2 = 1 + 5 + 25 = 31$.\nBước 5: Ta được $A = 31 \\cdot (5 + 5^4 + \\dots + 5^{${totalTerms - 2}})$. Vì tích có thừa số $31$ nên tổng $A$ chia hết cho $31$.`,
        rubricSteps: [
          { step: `Xác định số số hạng là ${totalTerms} và chia nhóm 3 số hạng`, points: 0.3 },
          { step: 'Nhóm các số hạng thành từng cụm và đặt thừa số chung', points: 0.3 },
          { step: 'Tính tổng trong mỗi cụm: 1 + 5 + 25 = 31', points: 0.3 },
          { step: 'Đặt 31 làm thừa số chung của toàn bộ tổng A', points: 0.3 },
          { step: 'Kết luận A chia hết cho 31 theo tính chất chia hết của một tích', points: 0.3 },
        ],
        keyFormula: '$A = 31 \\cdot k \\implies A \\,\\vdots\\, 31$.',
      };
    },
  },
  // VDC 2: Biện luận số nguyên tố theo số dư chia 3
  {
    id: 'T_G6_C1_VDC_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Số nguyên tố và Hợp số',
    topic: 'Biện luận tính chất số nguyên tố',
    problemType: 'Tìm số nguyên tố p thỏa mãn điều kiện',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['bien_luan_so_du_chia_3', 'dinh_nghia_so_nguyen_to', 'loai_tru_hop_so'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 6,
    },
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$p = 3$',
        [
          { text: '$p = 2$', errorType: 'QUÊN_KIỂM_TRA_P_PLUS_4' },
          { text: '$p = 5$', errorType: 'TÍNH_NHẦM_P_PLUS_4_LÀ_NGUYÊN_TỐ' },
          { text: 'Không có số nguyên tố nào', errorType: 'KẾT_LUẬN_SAI' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Số nguyên tố và Hợp số',
        topic: 'Biện luận tính chất số nguyên tố',
        problemType: 'Tìm số nguyên tố p thỏa mãn điều kiện',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['bien_luan_so_du_chia_3', 'dinh_nghia_so_nguyen_to', 'loai_tru_hop_so'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 6,
        },
        content: 'Tìm tất cả các số nguyên tố $p$ sao cho $p + 2$ và $p + 4$ cũng đều là các số nguyên tố:',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Xét $p = 2$: Ta có $p + 2 = 4$ là hợp số (loại).\nBước 2: Xét $p = 3$: Ta có $p + 2 = 5$ (số nguyên tố) và $p + 4 = 7$ (số nguyên tố). Vậy $p = 3$ thỏa mãn.\nBước 3: Xét $p > 3$: Vì $p$ là số nguyên tố lớn hơn 3 nên $p$ không chia hết cho 3. Do đó $p$ có dạng $3k + 1$ hoặc $3k + 2$ ($k \\in \\mathbb{N}^*$).\nBước 4: Nếu $p = 3k + 1$ thì $p + 2 = 3k + 3 = 3(k + 1) \\,\\vdots\\, 3$ và $p + 2 > 3$ nên $p + 2$ là hợp số (loại).\nBước 5: Nếu $p = 3k + 2$ thì $p + 4 = 3k + 6 = 3(k + 2) \\,\\vdots\\, 3$ và $p + 4 > 3$ nên $p + 4$ là hợp số (loại).\nVậy chỉ có duy nhất $p = 3$ thỏa mãn.`,
        rubricSteps: [
          { step: 'Thử nghiệm và loại trường hợp p = 2', points: 0.15 },
          { step: 'Thử nghiệm và nhận nghiệm p = 3', points: 0.15 },
          { step: 'Phân tích số dư của p khi chia cho 3 khi p > 3', points: 0.15 },
          { step: 'Biện luận loại trường hợp p = 3k + 1', points: 0.15 },
          { step: 'Biện luận loại trường hợp p = 3k + 2 và kết luận p = 3 duy nhất', points: 0.15 },
        ],
        keyFormula: 'Biện luận số nguyên tố theo số dư chia 3.',
      };
    },
  },
  // VDC 3: Tìm số tự nhiên lớn nhất có 3 chữ số thỏa mãn nhiều điều kiện dư
  {
    id: 'T_G6_C1_VDC_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C1',
    lesson: 'Phép chia hết và phép chia có dư',
    topic: 'Số tự nhiên có 3 chữ số thỏa mãn hệ điều kiện chia có dư',
    problemType: 'Tìm số lớn nhất thỏa mãn nhiều phép chia',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['bien_doi_so_du_thanh_chia_het', 'boi_chung_nho_nhat', 'tim_so_lon_nhat_co_gioi_han'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 8,
    },
    generate(rng, book) {
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C1',
        lesson: 'Phép chia hết và phép chia có dư',
        topic: 'Số tự nhiên có 3 chữ số thỏa mãn hệ điều kiện chia có dư',
        problemType: 'Tìm số lớn nhất thỏa mãn nhiều phép chia',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.5,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['bien_doi_so_du_thanh_chia_het', 'boi_chung_nho_nhat', 'tim_so_lon_nhat_co_gioi_han'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 8,
        },
        content: 'Tìm số tự nhiên lớn nhất có $3$ chữ số sao cho khi chia số đó cho $3$ thì dư $2$, chia cho $5$ thì dư $4$, và chia cho $7$ thì dư $6$.',
        correctAnswer: '944',
        acceptedAnswers: ['944', 'n = 944'],
        solution: `Bước 1: Gọi số tự nhiên cần tìm là $n$ ($100 \\le n \\le 999, n \\in \\mathbb{N}$).\nBước 2: Vì $n$ chia $3$ dư $2$, chia $5$ dư $4$, chia $7$ dư $6$ nên $n + 1$ chia hết cho cả $3, 5, 7$.\nBước 3: Do đó $n + 1 \\in \\text{BC}(3, 5, 7)$. Vì $3, 5, 7$ đôi một nguyên tố cùng nhau nên $\\text{BCNN}(3, 5, 7) = 3 \\cdot 5 \\cdot 7 = 105$. Suy ra $n + 1 = 105k$ ($k \\in \\mathbb{N}^*$).\nBước 4: Vì $n$ là số có 3 chữ số lớn nhất nên $n \\le 999 \\implies n + 1 \\le 1000 \\implies 105k \\le 1000 \\implies k \\le 9.52$. Giá trị nguyên lớn nhất của $k$ là $k = 9$.\nBước 5: Với $k = 9$, ta có $n + 1 = 105 \\cdot 9 = 945 \\implies n = 944$. Số $944$ thỏa mãn. Vậy số cần tìm là $944$.`,
        rubricSteps: [
          { step: 'Lý luận n + 1 chia hết cho 3, 5, 7', points: 0.3 },
          { step: 'Tính BCNN(3, 5, 7) = 105 và suy ra n + 1 = 105k', points: 0.3 },
          { step: 'Thiết lập điều kiện n + 1 <= 1000 cho số có 3 chữ số', points: 0.3 },
          { step: 'Tìm ra giá trị k lớn nhất là k = 9', points: 0.3 },
          { step: 'Tính ra n = 944 và kết luận đáp số', points: 0.3 },
        ],
        keyFormula: '$n - r = d - 1 \\implies n + 1 \\,\\vdots\\, d$.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 2: SỐ NGUYÊN (G6_C2)
  // ============================================================================
  // VD 1: Thám hiểm lặn biển qua nhiều độ cao & nhiệt độ (sửa T_G6_C2_HARD_01)
  {
    id: 'T_G6_C2_HARD_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Phép cộng và phép trừ hai số nguyên',
    topic: 'Ứng dụng thực tế số nguyên',
    problemType: 'Bài toán hành trình lặn biển và biến thiên nhiệt độ',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 4,
      techniques: ['phep_tinh_so_nguyen', 'mo_hinh_hoa_thuc_te', 'bien_thien_nhiet_do'],
      crossTopic: false,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const surfaceTemp = rng.nextInt(26, 30);
      const d1 = rng.nextInt(120, 180);
      const u1 = rng.nextInt(30, 50);
      const d2 = rng.nextInt(150, 200);
      const finalDepth = d1 - u1 + d2;
      // Cứ 50m nhiệt độ giảm 2 độ C
      const tempDrop = Math.floor(finalDepth / 50) * 2;
      const finalTemp = surfaceTemp - tempDrop;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${finalTemp}^\\circ\\text{C}$`,
        [
          { text: `$${surfaceTemp + tempDrop}^\\circ\\text{C}$`, errorType: 'TÍNH_NHẦM_TĂNG_NHIỆT_ĐỘ' },
          { text: `$${finalTemp + 4}^\\circ\\text{C}$`, errorType: 'QUÊN_CHẶNG_LẶN_THỨ_HAI' },
          { text: `$${surfaceTemp - Math.floor(d1 / 50) * 2}^\\circ\\text{C}$`, errorType: 'CHỈ_TÍNH_GIAI_ĐOẠN_1' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Phép cộng và phép trừ hai số nguyên',
        topic: 'Ứng dụng thực tế số nguyên',
        problemType: 'Bài toán hành trình lặn biển và biến thiên nhiệt độ',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 4,
          techniques: ['phep_tinh_so_nguyen', 'mo_hinh_hoa_thuc_te', 'bien_thien_nhiet_do'],
          crossTopic: false,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Một tàu ngầm nghiên cứu xuất phát từ mặt biển (nhiệt độ $${surfaceTemp}^\\circ\\text{C}$). Tàu lặn xuống sâu $${d1}\\text{ m}$, sau đó nổi lên $${u1}\\text{ m}$ để kiểm tra thiết bị, rồi tiếp tục lặn xuống thêm $${d2}\\text{ m}$. Biết rằng cứ xuống sâu thêm $50\\text{ m}$ thì nhiệt độ nước giảm $2^\\circ\\text{C}$. Nhiệt độ nước tại vị trí dừng cuối cùng của tàu là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Quy ước độ sâu dưới mực nước biển là số nguyên âm. Độ cao vị trí cuối cùng là: $0 - ${d1} + ${u1} - ${d2} = -${finalDepth}\\text{ m}$.\nBước 2: Độ sâu thực tế của tàu ngầm là $${finalDepth}\\text{ m}$.\nBước 3: Tính số lần giảm $50\\text{ m}$: $${finalDepth} : 50 = ${Math.floor(finalDepth / 50)}$ (lần). Tổng nhiệt độ giảm là $${Math.floor(finalDepth / 50)} \\cdot 2 = ${tempDrop}^\\circ\\text{C}$.\nBước 4: Nhiệt độ nước tại vị trí dừng là: $${surfaceTemp} - ${tempDrop} = ${finalTemp}^\\circ\\text{C}$.`,
        rubricSteps: [
          { step: `Tính đúng độ sâu cuối cùng của tàu là ${finalDepth} m`, points: 0.25 },
          { step: `Tính số lần giảm nhiệt độ theo độ sâu 50m`, points: 0.25 },
          { step: `Tính nhiệt độ cuối cùng là ${finalTemp} độ C`, points: 0.25 },
        ],
        keyFormula: 'Nhiệt độ cuối = Nhiệt độ ban đầu - Mức giảm.',
      };
    },
  },
  // VD 2: Tìm x nguyên thỏa mãn bất đẳng thức tích
  {
    id: 'T_G6_C2_HARD_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Phép nhân hai số nguyên',
    topic: 'Dấu của tích hai số nguyên',
    problemType: 'Tìm x nguyên thỏa mãn tích trái dấu',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 4,
      techniques: ['dau_cua_tich_so_nguyen', 'xet_dau_nhi_thuc', 'dem_so_nguyen'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 4,
    },
    generate(rng, book) {
      const a = rng.nextInt(2, 4);
      const b = rng.nextInt(4, 7);
      // (x - a)(x + b) < 0 => -b < x < a
      const count = a - (-b) - 1;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Phép nhân hai số nguyên',
        topic: 'Dấu của tích hai số nguyên',
        problemType: 'Tìm x nguyên thỏa mãn tích trái dấu',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 4,
          techniques: ['dau_cua_tich_so_nguyen', 'xet_dau_nhi_thuc', 'dem_so_nguyen'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 4,
        },
        content: `Tìm tất cả các số nguyên $x$ thỏa mãn: $(x - ${a})(x + ${b}) < 0$.`,
        correctAnswer: `-${b} < x < ${a}`,
        acceptedAnswers: [`-${b} < x < ${a}`, `x thuộc {${Array.from({ length: count }, (_, i) => -b + 1 + i).join(', ')}}`],
        solution: `Bước 1: Tích của hai số nguyên nhỏ hơn 0 khi và chỉ khi hai số đó trái dấu.\nBước 2: Vì $x - ${a} < x + ${b}$ nên ta phải có:\n$x - ${a} < 0$ và $x + ${b} > 0$.\nBước 3: Giải hai bất đẳng thức:\n$x < ${a}$ và $x > -${b}$.\nBước 4: Kết hợp điều kiện, ta được $-${b} < x < ${a}$.\nVì $x \\in \\mathbb{Z}$ nên $x \\in \\{${Array.from({ length: count }, (_, i) => -b + 1 + i).join(', ')}\\}$.`,
        rubricSteps: [
          { step: 'Lý luận tích hai số âm khi hai thừa số trái dấu', points: 0.3 },
          { step: `So sánh $x - ${a} < x + ${b}$ để xác định dấu từng thừa số`, points: 0.3 },
          { step: `Giải tìm khoảng $-${b} < x < ${a}$ và liệt kê các số nguyên`, points: 0.4 },
        ],
        keyFormula: '$A \\cdot B < 0 \\iff A, B$ trái dấu.',
      };
    },
  },
  // VD 3: Tính tổng số nguyên có điều kiện chia hết
  {
    id: 'T_G6_C2_HARD_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Phép cộng và phép trừ hai số nguyên',
    topic: 'Tính tổng dãy số nguyên',
    problemType: 'Tính tổng các số nguyên thỏa mãn điều kiện kẹp',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['tong_so_nguyen_doi_nhau', 'tinh_chat_giao_hoan_ket_hop'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 3,
    },
    generate(rng, book) {
      const a = rng.nextInt(15, 25);
      const b = a + rng.nextInt(3, 6);
      // -a <= x <= b => cac so tu -a den a tong bang 0, con lai tu a+1 den b
      let sum = 0;
      for (let i = a + 1; i <= b; i++) sum += i;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${sum}$`,
        [
          { text: `$0$`, errorType: 'CHO_RẰNG_TRIỆT_TIÊU_HẾT' },
          { text: `$${sum + a}$`, errorType: 'CỘNG_THỪA_SỐ_HẠNG_A' },
          { text: `$${sum - b}$`, errorType: 'TÍNH_THIẾU_SỐ_CUỐI' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Phép cộng và phép trừ hai số nguyên',
        topic: 'Tính tổng dãy số nguyên',
        problemType: 'Tính tổng các số nguyên thỏa mãn điều kiện kẹp',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['tong_so_nguyen_doi_nhau', 'tinh_chat_giao_hoan_ket_hop'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 3,
        },
        content: `Tính tổng của tất cả các số nguyên $x$ thỏa mãn: $-${a} \\le x \\le ${b}$:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Các số nguyên thỏa mãn là: $x \\in \\{-${a}, -${a - 1}, \\dots, -1, 0, 1, \\dots, ${a}, ${a + 1}, \\dots, ${b}\\}$.\nBước 2: Gom các cặp số đối nhau:\n$S = [(-${a}) + ${a}] + [(-${a - 1}) + ${a - 1}] + \\dots + [(-1) + 1] + 0 + (${a + 1} + \\dots + ${b})$.\nBước 3: Vì tổng các cặp số đối nhau bằng $0$, nên $S = ${a + 1} + \\dots + ${b} = ${sum}$.`,
        rubricSteps: [
          { step: 'Liệt kê tập hợp các số nguyên thỏa mãn điều kiện', points: 0.25 },
          { step: 'Ghép các cặp số đối nhau có tổng bằng 0', points: 0.25 },
          { step: `Tính tổng các số hạng còn lại ra kết quả ${sum}`, points: 0.25 },
        ],
        keyFormula: '$(-n) + n = 0$.',
      };
    },
  },
  // VD 4: Bài toán tài chính kinh doanh thực tế
  {
    id: 'T_G6_C2_HARD_04',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Ứng dụng thực tế của số nguyên',
    topic: 'Kinh doanh và lợi nhuận',
    problemType: 'Bài toán lời lỗ tài chính qua các quý',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['mo_hinh_hoa_thuc_te', 'quy_uoc_so_nguyen_loi_lo', 'phep_cong_tru_so_nguyen'],
      crossTopic: false,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const q1 = rng.nextInt(25, 45); // lãi (triệu)
      const q2 = -rng.nextInt(15, 30); // lỗ
      const q3 = -rng.nextInt(10, 20); // lỗ
      const q4 = rng.nextInt(35, 60); // lãi
      const total = q1 + q2 + q3 + q4;
      const person = KNTTContexts.getStudentName(rng);
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Ứng dụng thực tế của số nguyên',
        topic: 'Kinh doanh và lợi nhuận',
        problemType: 'Bài toán lời lỗ tài chính qua các quý',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['mo_hinh_hoa_thuc_te', 'quy_uoc_so_nguyen_loi_lo', 'phep_cong_tru_so_nguyen'],
          crossTopic: false,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Cửa hàng của gia đình bạn ${person} trong năm qua có kết quả kinh doanh 4 quý như sau: Quý I lãi $${q1}$ triệu đồng, Quý II lỗ $${Math.abs(q2)}$ triệu đồng, Quý III lỗ $${Math.abs(q3)}$ triệu đồng, Quý IV lãi $${q4}$ triệu đồng. Hỏi sau cả năm kinh doanh, cửa hàng lãi hay lỗ bao nhiêu triệu đồng?`,
        correctAnswer: total >= 0 ? `Lãi ${total} triệu đồng` : `Lỗ ${Math.abs(total)} triệu đồng`,
        acceptedAnswers: [
          total >= 0 ? `Lãi ${total} triệu đồng` : `Lỗ ${Math.abs(total)} triệu đồng`,
          String(total),
          `${total} triệu`,
        ],
        solution: `Bước 1: Quy ước tiền lãi là số nguyên dương, tiền lỗ là số nguyên âm. Ta có số tiền của 4 quý lần lượt là: $+${q1}; ${q2}; ${q3}; +${q4}$ (triệu đồng).\nBước 2: Tính tổng lợi nhuận cả năm:\n$T = ${q1} + (${q2}) + (${q3}) + ${q4} = [${q1} + ${q4}] + [(${q2}) + (${q3})] = ${q1 + q4} + (${q2 + q3}) = ${total}$ (triệu đồng).\nBước 3: Vì $T = ${total} ${total >= 0 ? '> 0' : '< 0'}$ nên kết luận cả năm cửa hàng ${total >= 0 ? 'lãi ' + total + ' triệu đồng' : 'lỗ ' + Math.abs(total) + ' triệu đồng'}.`,
        rubricSteps: [
          { step: 'Quy ước số nguyên âm và dương cho kết quả từng quý', points: 0.3 },
          { step: `Thực hiện phép tính tổng 4 quý ra ${total} triệu`, points: 0.4 },
          { step: `Kết luận chính xác cửa hàng lãi/lỗ`, points: 0.3 },
        ],
        keyFormula: 'Lợi nhuận = Tổng thu - Tổng chi.',
      };
    },
  },

  // VDC 1: Tìm n nguyên để phân thức nhận giá trị nguyên (sửa T_G6_C2_HARD_02)
  {
    id: 'T_G6_C2_VDC_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Bội và ước của một số nguyên',
    topic: 'Tìm số nguyên để phân thức nhận giá trị nguyên',
    problemType: 'Tìm n nguyên để biểu thức nguyên',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['tach_phan_nguyen_phan_thuc', 'tap_hop_uoc_nguyen_trong_Z', 'lap_bang_xet_gia_tri'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      const k = rng.nextChoice([3, 5, 7]);
      // (2n + k) / (n - 1) = 2 + (k + 2) / (n - 1)
      const num = k + 2;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Bội và ước của một số nguyên',
        topic: 'Tìm số nguyên để phân thức nhận giá trị nguyên',
        problemType: 'Tìm n nguyên để biểu thức nguyên',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.5,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['tach_phan_nguyen_phan_thuc', 'tap_hop_uoc_nguyen_trong_Z', 'lap_bang_xet_gia_tri'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: `Tìm tất cả các số nguyên $n$ để phân thức $A = \\frac{2n + ${k}}{n - 1}$ nhận giá trị là một số nguyên.`,
        correctAnswer: `n thuộc các giá trị nguyên thỏa mãn`,
        acceptedAnswers: ['Dung', 'Đúng', 'Thoa man'],
        solution: `Bước 1: Điều kiện để phân thức xác định là $n - 1 \\ne 0 \\iff n \\ne 1$.\nBước 2: Tách phần nguyên của tử thức theo mẫu thức:\n$A = \\frac{2(n - 1) + ${num}}{n - 1} = \\frac{2(n - 1)}{n - 1} + \\frac{${num}}{n - 1} = 2 + \\frac{${num}}{n - 1}$.\nBước 3: Vì $2 \\in \\mathbb{Z}$ nên để $A \\in \\mathbb{Z}$ thì $\\frac{${num}}{n - 1} \\in \\mathbb{Z} \\implies n - 1 \\in Ư(${num})$.\nBước 4: Tập hợp các ước nguyên của $${num}$ trong $\\mathbb{Z}$ là $Ư(${num}) = \\{\\pm 1, \\pm ${num}\\}$.\nBước 5: Lập bảng xét giá trị:\n- $n - 1 = 1 \\implies n = 2$\n- $n - 1 = -1 \\implies n = 0$\n- $n - 1 = ${num} \\implies n = ${num + 1}$\n- $n - 1 = -${num} \\implies n = ${-num + 1}$.\nCác giá trị này đều thỏa mãn điều kiện $n \\ne 1$. Vậy $n \\in \\{0, 2, ${num + 1}, ${-num + 1}\\}$.`,
        rubricSteps: [
          { step: 'Đặt điều kiện xác định n khác 1', points: 0.3 },
          { step: `Tách phân thức thành $2 + \\frac{${num}}{n-1}$`, points: 0.3 },
          { step: `Lý luận $n - 1 \\in Ư(${num})$ và liệt kê đủ cả ước âm và dương`, points: 0.3 },
          { step: 'Lập bảng tính từng giá trị của n', points: 0.3 },
          { step: 'Đối chiếu điều kiện và kết luận tập nghiệm', points: 0.3 },
        ],
        keyFormula: '$\\frac{A(n)}{B(n)} = Q(n) + \\frac{r}{B(n)} \\implies B(n) \\in Ư(r)$.',
      };
    },
  },
  // VDC 2: Phương trình ước số nguyên xy - ax + by = c
  {
    id: 'T_G6_C2_VDC_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Bội và ước của một số nguyên',
    topic: 'Phương trình nghiệm nguyên',
    problemType: 'Tìm cặp số nguyên (x, y) thỏa mãn tích',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['bien_doi_ve_tich_uoc_so', 'phan_tich_da_thuc_thanh_nhan_tu_lop_6', 'lap_bang_nghiem_nguyen'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 8,
    },
    generate(rng, book) {
      // xy - 2x + 3y = 11 => x(y - 2) + 3(y - 2) + 6 = 11 => (x + 3)(y - 2) = 5
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Bội và ước của một số nguyên',
        topic: 'Phương trình nghiệm nguyên',
        problemType: 'Tìm cặp số nguyên (x, y) thỏa mãn tích',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.5,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['bien_doi_ve_tich_uoc_so', 'phan_tich_da_thuc_thanh_nhan_tu_lop_6', 'lap_bang_nghiem_nguyen'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 8,
        },
        content: 'Tìm tất cả các cặp số nguyên $(x, y)$ thỏa mãn đẳng thức: $xy - 2x + 3y = 11$.',
        correctAnswer: 'Các cặp (x, y) thỏa mãn',
        acceptedAnswers: ['Dung', 'Đúng', 'Thoa man'],
        solution: `Bước 1: Biến đổi vế trái đưa về dạng tích:\n$x(y - 2) + 3y = 11 \\implies x(y - 2) + 3(y - 2) + 6 = 11$.\nBước 2: Chuyển vế:\n$(x + 3)(y - 2) = 11 - 6 = 5$.\nBước 3: Vì $x, y \\in \\mathbb{Z}$ nên $x + 3$ và $y - 2$ là các ước của $5$. Tập hợp các ước của 5 là $Ư(5) = \\{\\pm 1, \\pm 5\\}$.\nBước 4: Xét các trường hợp:\n- TH1: $x + 3 = 1; y - 2 = 5 \\implies x = -2; y = 7$.\n- TH2: $x + 3 = -1; y - 2 = -5 \\implies x = -4; y = -3$.\n- TH3: $x + 3 = 5; y - 2 = 1 \\implies x = 2; y = 3$.\n- TH4: $x + 3 = -5; y - 2 = -1 \\implies x = -8; y = 1$.\nBước 5: Kết luận các cặp số nguyên $(x, y)$ thỏa mãn là: $(-2, 7); (-4, -3); (2, 3); (-8, 1)$.`,
        rubricSteps: [
          { step: 'Nhóm hạng tử tạo thừa số chung y - 2', points: 0.3 },
          { step: 'Đưa phương trình về dạng tích $(x + 3)(y - 2) = 5$', points: 0.3 },
          { step: 'Liệt kê các cặp ước nguyên của 5', points: 0.3 },
          { step: 'Giải tìm (x, y) cho từng trường hợp', points: 0.3 },
          { step: 'Kết luận đầy đủ 4 cặp nghiệm nguyên', points: 0.3 },
        ],
        keyFormula: '$(x + b)(y + a) = k \\implies x+b, y+a \\in Ư(k)$.',
      };
    },
  },
  // VDC 3: Cực trị giá trị tuyệt đối |x - a| + |x - b|
  {
    id: 'T_G6_C2_VDC_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C2',
    lesson: 'Giá trị tuyệt đối của một số nguyên',
    topic: 'Cực trị biểu thức chứa dấu giá trị tuyệt đối',
    problemType: 'Tìm giá trị nhỏ nhất của tổng trị tuyệt đối',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['bat_dang_thuc_gia_tri_tuyet_doi', 'bien_luan_dau_bang_xay_ra', 'tim_cuc_tri_so_nguyen'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 6,
    },
    generate(rng, book) {
      const a = rng.nextInt(3, 7);
      const b = a + rng.nextInt(6, 12);
      const minVal = b - a + 5;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$P_{\\min} = ${minVal}$`,
        [
          { text: `$P_{\\min} = 5$`, errorType: 'CHO_RẰNG_HAI_TRỊ_TUYỆT_ĐỐI_BẰNG_0' },
          { text: `$P_{\\min} = ${b + a + 5}$`, errorType: 'CỘNG_HAI_GIÁ_TRỊ_DƯƠNG' },
          { text: `$P_{\\min} = ${minVal - 2}$`, errorType: 'TÍNH_SAI_HIỆU' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C2',
        lesson: 'Giá trị tuyệt đối của một số nguyên',
        topic: 'Cực trị biểu thức chứa dấu giá trị tuyệt đối',
        problemType: 'Tìm giá trị nhỏ nhất của tổng trị tuyệt đối',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['bat_dang_thuc_gia_tri_tuyet_doi', 'bien_luan_dau_bang_xay_ra', 'tim_cuc_tri_so_nguyen'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 6,
        },
        content: `Giá trị nhỏ nhất của biểu thức $P = |x - ${a}| + |x - ${b}| + 5$ với $x \\in \\mathbb{Z}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Ta có $|x - ${b}| = |${b} - x|$.\\nBước 2: Áp dụng bất đẳng thức giá trị tuyệt đối: $|A| + |B| \\ge |A + B|$.\\nBước 3: Ta có:\\n$|x - ${a}| + |${b} - x| \\ge |(x - ${a}) + (${b} - x)| = |${b} - ${a}| = ${b - a}$.\\nBước 4: Do đó $P \\ge ${b - a} + 5 = ${minVal}$.\\nBước 5: Dấu đẳng thức xảy ra khi $(x - ${a})(${b} - x) \\ge 0 \\iff ${a} \\le x \\le ${b}$. Vì luôn tồn tại số nguyên trong đoạn $[${a}, ${b}]$ nên giá trị nhỏ nhất của $P$ là $${minVal}$.`,
        rubricSteps: [
          { step: 'Đổi dấu biểu thức $|x - b| = |b - x|$', points: 0.15 },
          { step: 'Áp dụng bất đẳng thức $|A| + |B| >= |A + B|$', points: 0.15 },
          { step: `Tính tổng triệt tiêu x ra hằng số ${b - a}`, points: 0.15 },
          { step: 'Chỉ ra điều kiện dấu bằng xảy ra', points: 0.15 },
          { step: `Kết luận giá trị nhỏ nhất là ${minVal}`, points: 0.15 },
        ],
        keyFormula: '$|A| + |B| \\ge |A + B|$. Dấu bằng xảy ra khi $AB \\ge 0$.',
      };
    },
  },
  // ============================================================================
  // CHƯƠNG 3: HÌNH HỌC TRỰC QUAN (G6_C3)
  // ============================================================================
  // VD 1: Diện tích bồn hoa hình thoi và chi phí trồng hoa (modeling)
  {
    id: 'T_G6_C3_HARD_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình chữ nhật - Hình thoi - Hình bình hành - Hình thang cân',
    topic: 'Chu vi và diện tích các hình phẳng',
    problemType: 'Diện tích hình thoi và chi phí thực tế',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['dien_tich_hinh_thoi', 'mo_hinh_hoa_thuc_te', 'chi_phi_dien_tich'],
      crossTopic: false,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const d1 = rng.nextInt(6, 10); // đường chéo 1 (m)
      const d2 = rng.nextInt(4, 8); // đường chéo 2 (m)
      const area = (d1 * d2) / 2;
      const unitPrice = 120; // nghìn đồng/m2
      const totalCost = area * unitPrice;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${totalCost}$ nghìn đồng`,
        [
          { text: `$${d1 * d2 * unitPrice}$ nghìn đồng`, errorType: 'QUÊN_CHIA_HAI_ĐƯỜNG_CHÉO' },
          { text: `$${(d1 + d2) * unitPrice}$ nghìn đồng`, errorType: 'NHẦM_CHU_VI_VÀ_DIỆN_TÍCH' },
          { text: `$${totalCost - 60}$ nghìn đồng`, errorType: 'TÍNH_NHẦM_DIỆN_TÍCH' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình chữ nhật - Hình thoi - Hình bình hành - Hình thang cân',
        topic: 'Chu vi và diện tích các hình phẳng',
        problemType: 'Diện tích hình thoi và chi phí thực tế',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['dien_tich_hinh_thoi', 'mo_hinh_hoa_thuc_te', 'chi_phi_dien_tich'],
          crossTopic: false,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Một bồn hoa giữa sân trường có dạng hình thoi với độ dài hai đường chéo lần lượt là $${d1}\\text{ m}$ và $${d2}\\text{ m}$. Chi phí trồng hoa là $120$ nghìn đồng cho mỗi mét vuông. Tổng chi phí trồng hoa cho cả bồn hoa là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Diện tích của bồn hoa hình thoi là:\\n$S = \\frac{1}{2} \\cdot d_1 \\cdot d_2 = \\frac{1}{2} \\cdot ${d1} \\cdot ${d2} = ${area}\\text{ m}^2$.\\nBước 2: Chi phí trồng hoa là:\\n$C = S \\cdot 120 = ${area} \\cdot 120 = ${totalCost}$ (nghìn đồng).\\nBước 3: Kết luận tổng chi phí là $${totalCost}$ nghìn đồng.`,
        rubricSteps: [
          { step: `Áp dụng công thức tính diện tích hình thoi ra ${area} m2`, points: 0.25 },
          { step: `Nhân với đơn giá tính ra chi phí ${totalCost} nghìn đồng`, points: 0.25 },
          { step: 'Kết luận đáp án chính xác', points: 0.25 },
        ],
        keyFormula: '$S = \\frac{1}{2} d_1 d_2$.',
      };
    },
  },
  // VD 2: Mảnh vườn phân lô và lát lối đi
  {
    id: 'T_G6_C3_HARD_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình chữ nhật - Hình thoi - Hình bình hành - Hình thang cân',
    topic: 'Chu vi và diện tích các hình phẳng',
    problemType: 'Diện tích phần còn lại khi làm lối đi',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['dien_tich_hinh_chu_nhat', 'hieu_dien_tich', 'mo_hinh_hoa_thuc_te'],
      crossTopic: false,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const length = rng.nextInt(15, 25);
      const width = rng.nextInt(10, 14);
      const totalArea = length * width;
      const walkWidth = 1;
      const innerLength = length - 2 * walkWidth;
      const innerWidth = width - 2 * walkWidth;
      const innerArea = innerLength * innerWidth;
      const walkArea = totalArea - innerArea;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình chữ nhật - Hình thoi - Hình bình hành - Hình thang cân',
        topic: 'Chu vi và diện tích các hình phẳng',
        problemType: 'Diện tích phần còn lại khi làm lối đi',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['dien_tich_hinh_chu_nhat', 'hieu_dien_tich', 'mo_hinh_hoa_thuc_te'],
          crossTopic: false,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Một khu vườn hình chữ nhật có chiều dài $${length}\\text{ m}$ và chiều rộng $${width}\\text{ m}$. Người ta làm một lối đi xung quanh vườn (ở phía trong vườn) rộng $1\\text{ m}$. Phần đất còn lại dùng để trồng rau. Tính diện tích phần đất trồng rau.`,
        correctAnswer: String(innerArea),
        acceptedAnswers: [String(innerArea), `${innerArea} m2`, `${innerArea} mét vuông`],
        solution: `Bước 1: Tính chiều dài phần đất trồng rau:\\n$L = ${length} - 2 \\cdot 1 = ${innerLength}\\text{ m}$.\\nBước 2: Tính chiều rộng phần đất trồng rau:\\n$W = ${width} - 2 \\cdot 1 = ${innerWidth}\\text{ m}$.\\nBước 3: Diện tích phần đất trồng rau là:\\n$S = L \\cdot W = ${innerLength} \\cdot ${innerWidth} = ${innerArea}\\text{ m}^2$.`,
        rubricSteps: [
          { step: `Tính đúng chiều dài mới là ${innerLength} m`, points: 0.3 },
          { step: `Tính đúng chiều rộng mới là ${innerWidth} m`, points: 0.3 },
          { step: `Tính diện tích trồng rau ra ${innerArea} m2`, points: 0.4 },
        ],
        keyFormula: '$S = (dài - 2w) \\cdot (rộng - 2w)$.',
      };
    },
  },
  // VD 3: Lát gạch sân hình chữ nhật
  {
    id: 'T_G6_C3_HARD_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Chu vi và diện tích một số tứ giác',
    topic: 'Bài toán lát sân gạch',
    problemType: 'Tính số viên gạch cần lát',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['doi_don_vi_do_dien_tich', 'dien_tich_hinh_chu_nhat', 'phep_chia_so_tu_nhien'],
      crossTopic: false,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const lenM = rng.nextInt(8, 12);
      const widM = rng.nextInt(4, 6);
      const areaCm2 = lenM * widM * 10000;
      const tileSideCm = 50; // 50x50 cm
      const tileAreaCm2 = tileSideCm * tileSideCm; // 2500
      const totalTiles = areaCm2 / tileAreaCm2;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${totalTiles}$ viên`,
        [
          { text: `$${totalTiles / 10}$ viên`, errorType: 'SAI_QUY_ĐỔI_ĐƠN_VỊ_DIỆN_TÍCH' },
          { text: `$${totalTiles * 2}$ viên`, errorType: 'TÍNH_NHẦM_DIỆN_TÍCH_GẠCH' },
          { text: `$${totalTiles - 20}$ viên`, errorType: 'TÍNH_THIẾU_SỐ_LƯỢNG' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Chu vi và diện tích một số tứ giác',
        topic: 'Bài toán lát sân gạch',
        problemType: 'Tính số viên gạch cần lát',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['doi_don_vi_do_dien_tich', 'dien_tich_hinh_chu_nhat', 'phep_chia_so_tu_nhien'],
          crossTopic: false,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Một sân trường hình chữ nhật có chiều dài $${lenM}\\text{ m}$ và chiều rộng $${widM}\\text{ m}$. Người ta dùng các viên gạch hình vuông cạnh $50\\text{ cm}$ để lát kín sân. Số viên gạch cần dùng là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Diện tích sân trường là $S_1 = ${lenM} \\cdot ${widM} = ${lenM * widM}\\text{ m}^2 = ${areaCm2}\\text{ cm}^2$.\\nBước 2: Diện tích mỗi viên gạch hình vuông là $S_2 = 50 \\cdot 50 = 2500\\text{ cm}^2$.\\nBước 3: Số viên gạch cần dùng là:\\n$N = S_1 : S_2 = ${areaCm2} : 2500 = ${totalTiles}$ (viên).`,
        rubricSteps: [
          { step: 'Tính diện tích sân và đổi đúng sang cm2', points: 0.25 },
          { step: 'Tính diện tích một viên gạch hình vuông', points: 0.25 },
          { step: `Chia hai diện tích ra ${totalTiles} viên`, points: 0.25 },
        ],
        keyFormula: 'Số viên gạch = Diện tích sàn : Diện tích 1 viên.',
      };
    },
  },
  // VD 4: Hình thang cân
  {
    id: 'T_G6_C3_HARD_04',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình chữ nhật - Hình thoi - Hình bình hành - Hình thang cân',
    topic: 'Chu vi và diện tích hình thang cân',
    problemType: 'Tính chu vi và diện tích thửa ruộng hình thang cân',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['cong_thuc_hinh_thang', 'chu_vi_hinh_thang_can', 'mo_hinh_hoa_thuc_te'],
      crossTopic: false,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const a = rng.nextInt(12, 16); // đáy lớn (m)
      const b = rng.nextInt(6, 10); // đáy nhỏ (m)
      const h = rng.nextInt(6, 8); // chiều cao (m)
      const area = ((a + b) * h) / 2;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình chữ nhật - Hình thoi - Hình bình hành - Hình thang cân',
        topic: 'Chu vi và diện tích hình thang cân',
        problemType: 'Tính chu vi và diện tích thửa ruộng hình thang cân',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['cong_thuc_hinh_thang', 'chu_vi_hinh_thang_can', 'mo_hinh_hoa_thuc_te'],
          crossTopic: false,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Một mảnh đất có dạng hình thang cân với độ dài hai đáy lần lượt là $${a}\\text{ m}$ và $${b}\\text{ m}$, chiều cao là $${h}\\text{ m}$. Tính diện tích của mảnh đất đó.`,
        correctAnswer: String(area),
        acceptedAnswers: [String(area), `${area} m2`, `${area} mét vuông`],
        solution: `Bước 1: Nhớ công thức diện tích hình thang: $S = \\frac{(a + b) \\cdot h}{2}$.\\nBước 2: Thay số:\\n$S = \\frac{(${a} + ${b}) \\cdot ${h}}{2} = \\frac{${a + b} \\cdot ${h}}{2}$.\\nBước 3: Thực hiện phép tính:\\n$S = ${(a + b) * h} : 2 = ${area}\\text{ m}^2$.`,
        rubricSteps: [
          { step: 'Viết công thức diện tích hình thang', points: 0.3 },
          { step: 'Thay các số đo đúng vào công thức', points: 0.3 },
          { step: `Tính ra diện tích là ${area} m2`, points: 0.4 },
        ],
        keyFormula: '$S = \\frac{(a+b)h}{2}$.',
      };
    },
  },

  // VDC 1: Tối ưu chi phí rào vườn ghép nhiều hình
  {
    id: 'T_G6_C3_VDC_01',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Hình chữ nhật - Hình thoi - Hình bình hành - Hình thang cân',
    topic: 'Tối ưu hóa hình học trực quan',
    problemType: 'Bài toán rào đất ghép hình và chừa cổng vào',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['ghep_hinh_chu_nhat_hinh_vuong', 'chu_vi_hinh_ghep', 'chua_cong_va_nhan_don_gia'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 8,
    },
    generate(rng, book) {
      const a = rng.nextInt(12, 18);
      const b = rng.nextInt(8, 12);
      const c = rng.nextInt(4, 6);
      // Khu đất gồm hình chữ nhật ax b ghép với hình vuông cạnh c
      // Chu vi ngoài = 2*(a + b) + 2*c (hoặc tương tự), chừa cổng 2m
      const gate = 2;
      const perimeter = 2 * (a + b) + 2 * c - gate;
      const unitPrice = 150; // nghìn đồng/m
      const totalCost = perimeter * unitPrice;
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Hình chữ nhật - Hình thoi - Hình bình hành - Hình thang cân',
        topic: 'Tối ưu hóa hình học trực quan',
        problemType: 'Bài toán rào đất ghép hình và chừa cổng vào',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.5,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['ghep_hinh_chu_nhat_hinh_vuong', 'chu_vi_hinh_ghep', 'chua_cong_va_nhan_don_gia'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 8,
        },
        content: `Một khu đất có dạng hình chữ nhật dài $${a}\\text{ m}$, rộng $${b}\\text{ m}$, được mở rộng thêm một góc đất hình vuông cạnh $${c}\\text{ m}$ nhô ra phía ngoài một cạnh chiều dài. Người ta muốn làm hàng rào bao quanh toàn bộ khu đất mới này, nhưng chừa lại một cổng vào rộng $2\\text{ m}$ không rào. Biết chi phí làm mỗi mét rào là $150$ nghìn đồng. Tính tổng chi phí làm hàng rào.`,
        correctAnswer: String(totalCost),
        acceptedAnswers: [String(totalCost), `${totalCost} nghìn đồng`, `${totalCost}000`],
        solution: `Bước 1: Tính chu vi bao ngoài của khu đất ban đầu:\\n$P_1 = 2 \\cdot (${a} + ${b}) = ${2 * (a + b)}\\text{ m}$.\\nBước 2: Khi nhô thêm hình vuông cạnh $${c}\\text{ m}$ ra phía ngoài, chu vi đường bao tăng thêm $2 \\cdot ${c} = ${2 * c}\\text{ m}$ (do $1$ cạnh trùng với mép cũ).\\nBước 3: Chu vi đường bao toàn bộ khu đất mới là:\\n$P = ${2 * (a + b)} + ${2 * c} = ${2 * (a + b) + 2 * c}\\text{ m}$.\\nBước 4: Trừ đi cổng vào rộng $2\\text{ m}$, chiều dài hàng rào thực tế là:\\n$L = ${2 * (a + b) + 2 * c} - 2 = ${perimeter}\\text{ m}$.\\nBước 5: Tổng chi phí làm hàng rào là:\\n$C = ${perimeter} \\cdot 150 = ${totalCost}$ (nghìn đồng).\\nVậy tổng chi phí là $${totalCost}$ nghìn đồng.`,
        rubricSteps: [
          { step: 'Tính chu vi bao ngoài hình chữ nhật ban đầu', points: 0.3 },
          { step: 'Xác định độ dài biên tăng thêm khi ghép thêm hình vuông', points: 0.3 },
          { step: 'Tính tổng chu vi đường bao ngoài toàn bộ khu đất mới', points: 0.3 },
          { step: 'Trừ đi 2m chiều rộng cổng vào để tìm chiều dài rào', points: 0.3 },
          { step: `Nhân đơn giá và kết luận chi phí ${totalCost} nghìn đồng`, points: 0.3 },
        ],
        keyFormula: 'Chi phí = (Chu vi biên ngoài - Cổng) x Đơn giá.',
      };
    },
  },
  // VDC 2: Tỉ lệ diện tích hình vuông chia thành 4 hình chữ nhật
  {
    id: 'T_G6_C3_VDC_02',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Chu vi và diện tích một số tứ giác',
    topic: 'Biến đổi hình học phân chia diện tích',
    problemType: 'Hình vuông chia thành các hình chữ nhật con',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['bien_doi_dai_so_hinh_hoc', 'he_thuc_chu_vi_canh', 'dien_tich_hinh_vuong'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const p = rng.nextChoice([24, 30, 36]);
      // Hình vuông cạnh a chia thành 4 hình chữ nhật giống nhau bằng 3 đường song song
      // Mỗi hình chữ nhật có kích thước a và a/4. Chu vi P = 2(a + a/4) = 5a/2 = p => a = 2p/5.
      const side = (2 * p) / 5;
      const area = side * side;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${area}\\text{ cm}^2$`,
        [
          { text: `$${p * p / 16}\\text{ cm}^2$`, errorType: 'TÍNH_NHẦM_CHU_VI_THÀNH_CẠNH' },
          { text: `$${area / 2}\\text{ cm}^2$`, errorType: 'CHỈ_TÍNH_MỘT_NỬA' },
          { text: `$${(side + 2) * (side + 2)}\\text{ cm}^2$`, errorType: 'TÍNH_SAI_CẠNH' },
        ]
      );
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Chu vi và diện tích một số tứ giác',
        topic: 'Biến đổi hình học phân chia diện tích',
        problemType: 'Hình vuông chia thành các hình chữ nhật con',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['bien_doi_dai_so_hinh_hoc', 'he_thuc_chu_vi_canh', 'dien_tich_hinh_vuong'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Một hình vuông được chia thành $4$ hình chữ nhật nhỏ bằng nhau bởi $3$ đường thẳng song song với một cạnh. Biết chu vi của mỗi hình chữ nhật nhỏ là $${p}\\text{ cm}$. Diện tích của hình vuông ban đầu là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Gọi độ dài cạnh hình vuông ban đầu là $a$ ($a > 0$).\\nBước 2: Khi chia hình vuông thành 4 hình chữ nhật nhỏ bằng nhau bởi các đường song song, mỗi hình chữ nhật có một kích thước bằng $a$ và kích thước còn lại bằng $\\frac{a}{4}$.\\nBước 3: Chu vi mỗi hình chữ nhật nhỏ là:\\n$P = 2 \\left(a + \\frac{a}{4}\\right) = 2 \\cdot \\frac{5a}{4} = \\frac{5a}{2}$.\\nBước 4: Theo đề bài, $\\frac{5a}{2} = ${p} \\implies 5a = ${2 * p} \\implies a = ${side}\\text{ cm}$.\\nBước 5: Diện tích của hình vuông ban đầu là:\\n$S = a^2 = ${side}^2 = ${area}\\text{ cm}^2$.`,
        rubricSteps: [
          { step: 'Biểu diễn kích thước mỗi hình chữ nhật nhỏ theo cạnh a', points: 0.15 },
          { step: 'Lập biểu thức chu vi hình chữ nhật nhỏ theo a: P = 5a/2', points: 0.15 },
          { step: `Giải phương trình 5a/2 = ${p} tìm ra a = ${side} cm`, points: 0.15 },
          { step: `Tính diện tích hình vuông S = a^2 = ${area} cm2`, points: 0.15 },
          { step: 'Chọn phương án đúng', points: 0.15 },
        ],
        keyFormula: '$P = 2(a + a/4) = 5a/2 \\implies a = 2P/5$.',
      };
    },
  },
  // VDC 3: Phân tích diện tích lục giác đều
  {
    id: 'T_G6_C3_VDC_03',
    grade: 6,
    semester: 1,
    chapterId: 'G6_C3',
    lesson: 'Tam giác đều - Hình vuông - Lục giác đều',
    topic: 'Cấu trúc đối xứng của lục giác đều',
    problemType: 'Tỉ số diện tích tam giác nối 3 đỉnh cách đều so với lục giác đều',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['doi_xung_luc_giac_deu', 'phan_chia_tam_giac_deu', 'ti_so_dien_tich_hinh_hoc'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const s = rng.nextInt(6, 12) * 6; // diện tích lục giác đều chia hết cho 6
      const sSmall = s / 6;
      const sTriangle = sSmall * 3; // tam giác nối 3 đỉnh xen kẽ có diện tích bằng 1/2 lục giác
      return {
        grade: 6,
        semester: 1,
        chapterId: 'G6_C3',
        lesson: 'Tam giác đều - Hình vuông - Lục giác đều',
        topic: 'Cấu trúc đối xứng của lục giác đều',
        problemType: 'Tỉ số diện tích tam giác nối 3 đỉnh cách đều so với lục giác đều',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.5,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['doi_xung_luc_giac_deu', 'phan_chia_tam_giac_deu', 'ti_so_dien_tich_hinh_hoc'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Cho lục giác đều $ABCDEF$ có diện tích bằng $${s}\\text{ cm}^2$. Nối các đỉnh cách đều nhau tạo thành tam giác $ACE$. Tính diện tích tam giác $ACE$.`,
        correctAnswer: String(sTriangle),
        acceptedAnswers: [String(sTriangle), `${sTriangle} cm2`, `${sTriangle} mét vuông`],
        solution: `Bước 1: Nối tâm đối xứng $O$ của lục giác đều với 6 đỉnh $A, B, C, D, E, F$. Lục giác đều được chia thành $6$ tam giác đều nhỏ bằng nhau có chung đỉnh $O$.\\nBước 2: Diện tích của mỗi tam giác đều nhỏ là:\\n$S_{OAB} = ${s} : 6 = ${sSmall}\\text{ cm}^2$.\\nBước 3: Xem xét tứ giác $ABCO$, đường chéo $AC$ chia hình thoi $ABCO$ thành hai tam giác bằng nhau: $S_{ABC} = S_{AOC} = \\frac{1}{2} S_{ABCO} = S_{OAB} = ${sSmall}\\text{ cm}^2$.\\nBước 4: Tương tự, ta có $S_{CDE} = S_{EFA} = ${sSmall}\\text{ cm}^2$.\\nBước 5: Diện tích tam giác $ACE$ bằng diện tích lục giác đều trừ đi diện tích 3 tam giác ở các góc:\\n$S_{ACE} = S_{ABCDEF} - (S_{ABC} + S_{CDE} + S_{EFA}) = ${s} - 3 \\cdot ${sSmall} = ${s} - ${sSmall * 3} = ${sTriangle}\\text{ cm}^2$.`,
        rubricSteps: [
          { step: 'Phân tích lục giác đều thành 6 tam giác đều nhỏ bằng nhau', points: 0.3 },
          { step: `Tính diện tích mỗi tam giác đều nhỏ là ${sSmall} cm2`, points: 0.3 },
          { step: 'Chứng minh diện tích mỗi tam giác góc bằng diện tích 1 tam giác đều nhỏ', points: 0.3 },
          { step: 'Thiết lập phép trừ diện tích để tìm S(ACE)', points: 0.3 },
          { step: `Tính ra kết quả ${sTriangle} cm2`, points: 0.3 },
        ],
        keyFormula: '$S_{ACE} = \\frac{1}{2} S_{ABCDEF}$.',
      };
    },
  },
  // ============================================================================
  // CHƯƠNG 4: MỘT SỐ YẾU TỐ THỐNG KÊ VÀ XÁC SUẤT (G6_C4)
  // ============================================================================
  // VD 1: Biểu đồ cột kép so sánh và tỉ lệ phần trăm
  {
    id: 'T_G6_C4_HARD_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Biểu đồ cột kép',
    topic: 'Phân tích dữ liệu biểu đồ cột kép',
    problemType: 'So sánh và tính tỉ số phần trăm tăng trưởng',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['doc_bieu_do_cot_kep', 'hieu_hai_so_lieu', 'ti_so_phan_tram'],
      crossTopic: false,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const sem1 = rng.nextInt(20, 30);
      const sem2 = sem1 + rng.nextInt(5, 10);
      const inc = sem2 - sem1;
      const pct = Math.round((inc / sem1) * 100);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${pct}\\%$`,
        [
          { text: `$${pct + 10}\\%$`, errorType: 'TÍNH_SAI_TỈ_LỆ_PHẦN_TRĂM' },
          { text: `$${Math.round((inc / sem2) * 100)}\\%$`, errorType: 'CHIA_CHO_KỲ_SAU_THAY_VÌ_KỲ_ĐẦU' },
          { text: `$${pct - 5}\\%$`, errorType: 'LÀM_TRÒN_SAI' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Biểu đồ cột kép',
        topic: 'Phân tích dữ liệu biểu đồ cột kép',
        problemType: 'So sánh và tính tỉ số phần trăm tăng trưởng',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['doc_bieu_do_cot_kep', 'hieu_hai_so_lieu', 'ti_so_phan_tram'],
          crossTopic: false,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Số học sinh đạt danh hiệu Học sinh Giỏi của một lớp ở Học kỳ I là $${sem1}$ bạn, ở Học kỳ II là $${sem2}$ bạn. Tỉ số phần trăm số học sinh Giỏi ở Học kỳ II so với Học kỳ I đã tăng xấp xỉ bao nhiêu phần trăm?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Số học sinh giỏi tăng thêm ở Học kỳ II là: $${sem2} - ${sem1} = ${inc}$ (học sinh).\\nBước 2: Tỉ số phần trăm tăng thêm so với Học kỳ I là:\\n$P = \\frac{${inc}}{${sem1}} \\cdot 100\\% = \\frac{${inc * 100}}{${sem1}}\\% \\approx ${pct}\\%$.\\nBước 3: Kết luận mức tăng là xấp xỉ $${pct}\\%$.`,
        rubricSteps: [
          { step: `Tính số học sinh giỏi tăng thêm là ${inc} học sinh`, points: 0.25 },
          { step: 'Lập công thức tỉ số phần trăm tăng so với kỳ I', points: 0.25 },
          { step: `Tính ra kết quả xấp xỉ ${pct}%`, points: 0.25 },
        ],
        keyFormula: '$\\text{Tăng}\\% = \\frac{\\text{Mới} - \\text{Cũ}}{\\text{Cũ}} \\times 100\\%$.',
      };
    },
  },
  // VD 2: Xác suất thực nghiệm gieo xúc xắc chia hết
  {
    id: 'T_G6_C4_HARD_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Xác suất thực nghiệm',
    topic: 'Tính xác suất thực nghiệm',
    problemType: 'Xác suất thực nghiệm của biến cố tổng hợp',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['xac_suat_thuc_nghiem', 'hop_bien_co', 'rut_gon_phan_so'],
      crossTopic: false,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const n2 = rng.nextInt(15, 20); // số lần ra mặt 2 chấm
      const n4 = rng.nextInt(15, 20); // mặt 4 chấm
      const n6 = rng.nextInt(15, 20); // mặt 6 chấm
      const totalEven = n2 + n4 + n6;
      const totalRolls = 100;
      const frac = formatFraction(totalEven, totalRolls);
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Xác suất thực nghiệm',
        topic: 'Tính xác suất thực nghiệm',
        problemType: 'Xác suất thực nghiệm của biến cố tổng hợp',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['xac_suat_thuc_nghiem', 'hop_bien_co', 'rut_gon_phan_so'],
          crossTopic: false,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Gieo một con xúc xắc $100$ lần. Kết quả thu được: mặt $2$ chấm xuất hiện $${n2}$ lần, mặt $4$ chấm xuất hiện $${n4}$ lần, mặt $6$ chấm xuất hiện $${n6}$ lần. Hãy tính xác suất thực nghiệm của biến cố "Mặt xuất hiện có số chấm là số chẵn".`,
        correctAnswer: frac,
        acceptedAnswers: [frac, `${totalEven / totalRolls}`, `${totalEven}%`],
        solution: `Bước 1: Các mặt có số chấm là số chẵn bao gồm mặt $2$ chấm, $4$ chấm và $6$ chấm.\\nBước 2: Tổng số lần xuất hiện mặt chẵn là: $${n2} + ${n4} + ${n6} = ${totalEven}$ (lần).\\nBước 3: Xác suất thực nghiệm của biến cố là:\\n$P = \\frac{${totalEven}}{${totalRolls}} = ${frac}$.`,
        rubricSteps: [
          { step: 'Xác định các mặt xuất hiện số chẵn là 2, 4, 6', points: 0.3 },
          { step: `Tính tổng số lần xuất hiện mặt chẵn: ${n2} + ${n4} + ${n6} = ${totalEven}`, points: 0.3 },
          { step: `Lập tỉ số và rút gọn ra xác suất thực nghiệm ${frac}`, points: 0.4 },
        ],
        keyFormula: '$P = \\frac{\\text{Số lần biến cố xảy ra}}{\\text{Tổng số lần thử}}$.',
      };
    },
  },
  // VD 3: Thống kê thu gom rác tái chế
  {
    id: 'T_G6_C4_HARD_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Thu thập và tổ chức dữ liệu',
    topic: 'Xử lý dữ liệu thống kê',
    problemType: 'Trung bình cộng và biểu diễn số liệu',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['trung_binh_cong_thong_ke', 'mo_hinh_hoa_thuc_te', 'chenh_lech_so_lieu'],
      crossTopic: false,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const g1 = rng.nextInt(25, 35);
      const g2 = rng.nextInt(30, 40);
      const g3 = rng.nextInt(20, 30);
      const g4 = rng.nextInt(35, 45);
      const sum = g1 + g2 + g3 + g4;
      const avg = Math.round((sum / 4) * 10) / 10;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${avg}\\text{ kg}\$`,
        [
          { text: `$${Math.round(sum / 4)}\\text{ kg}\$`, errorType: 'QUÊN_LÀM_TRÒN_SỐ_THẬP_PHÂN' },
          { text: `$${avg + 2}\\text{ kg}\$`, errorType: 'TÍNH_NHẦM_TỔNG' },
          { text: `$${sum / 3}\\text{ kg}\$`, errorType: 'CHIA_CHO_BA_TỔ_THAY_VÌ_BỐN' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Thu thập và tổ chức dữ liệu',
        topic: 'Xử lý dữ liệu thống kê',
        problemType: 'Trung bình cộng và biểu diễn số liệu',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['trung_binh_cong_thong_ke', 'mo_hinh_hoa_thuc_te', 'chenh_lech_so_lieu'],
          crossTopic: false,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Trong phong trào Kế hoạch nhỏ, bốn tổ của lớp 6A thu gom được khối lượng giấy vụn lần lượt là $${g1}\\text{ kg}$, $${g2}\\text{ kg}$, $${g3}\\text{ kg}$, $${g4}\\text{ kg}$. Khối lượng giấy vụn trung bình mỗi tổ thu gom được là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Tổng khối lượng giấy vụn bốn tổ thu gom được là:\\n$T = ${g1} + ${g2} + ${g3} + ${g4} = ${sum}\\text{ kg}$.\\nBước 2: Khối lượng trung bình mỗi tổ thu được là:\\n$\\bar{X} = ${sum} : 4 = ${avg}\\text{ kg}$.\\nBước 3: Kết luận khối lượng trung bình là $${avg}\\text{ kg}$.`,
        rubricSteps: [
          { step: `Tính đúng tổng khối lượng 4 tổ là ${sum} kg`, points: 0.25 },
          { step: `Chia cho 4 ra số trung bình ${avg} kg`, points: 0.25 },
          { step: 'Chọn phương án đúng', points: 0.25 },
        ],
        keyFormula: '$\\bar{X} = \\frac{x_1 + x_2 + \\dots + x_n}{n}$.',
      };
    },
  },
  // VD 4: Xác suất thực nghiệm rút thẻ số
  {
    id: 'T_G6_C4_HARD_04',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Xác suất thực nghiệm',
    topic: 'Thực nghiệm lấy ngẫu nhiên',
    problemType: 'Xác suất thực nghiệm của thẻ ghi số nguyên tố',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['xac_suat_thuc_nghiem', 'phan_loai_so_nguyen_to', 'rut_gon_phan_so'],
      crossTopic: false,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const timesPrime = rng.nextInt(28, 38);
      const totalDraws = 60;
      const frac = formatFraction(timesPrime, totalDraws);
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Xác suất thực nghiệm',
        topic: 'Thực nghiệm lấy ngẫu nhiên',
        problemType: 'Xác suất thực nghiệm của thẻ ghi số nguyên tố',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['xac_suat_thuc_nghiem', 'phan_loai_so_nguyen_to', 'rut_gon_phan_so'],
          crossTopic: false,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Trong một hộp có các thẻ số từ $1$ đến $20$. Bạn Nam rút ngẫu nhiên một thẻ, ghi lại số rồi trả lại vào hộp. Thực hiện hành động này $60$ lần, thấy có $${timesPrime}$ lần rút được thẻ ghi số nguyên tố. Tính xác suất thực nghiệm của biến cố "Rút được thẻ ghi số nguyên tố".`,
        correctAnswer: frac,
        acceptedAnswers: [frac, `${timesPrime / totalDraws}`],
        solution: `Bước 1: Số lần xuất hiện biến cố rút được thẻ ghi số nguyên tố là $${timesPrime}$ lần.\\nBước 2: Tổng số lần thử nghiệm rút thẻ là $60$ lần.\\nBước 3: Xác suất thực nghiệm của biến cố là:\\n$P = \\frac{${timesPrime}}{60} = ${frac}$.`,
        rubricSteps: [
          { step: 'Xác định số lần biến cố xảy ra và tổng số lần rút thẻ', points: 0.3 },
          { step: 'Lập tỉ số xác suất thực nghiệm', points: 0.3 },
          { step: `Rút gọn phân số ra kết quả ${frac}`, points: 0.4 },
        ],
        keyFormula: '$P = \\frac{k}{n}$.',
      };
    },
  },

  // VDC 1: Phương pháp Lincoln-Petersen ước lượng cá trong hồ
  {
    id: 'T_G6_C4_VDC_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Xác suất thực nghiệm',
    topic: 'Mô hình xác suất thống kê sinh học thực tế',
    problemType: 'Ước lượng số lượng cá thể bằng phương pháp đánh dấu',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_sinh_hoc', 'ti_le_thuc_xac_suat', 'giai_phuong_trinh_ti_so'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 8,
    },
    generate(rng, book) {
      const M = 100; // số cá bắt đánh dấu lần 1
      const n = 80;  // số cá bắt lần 2
      const m = 16;  // số cá có dấu trong lần 2
      // M / N = m / n => N = M * n / m = 100 * 80 / 16 = 500 con
      const N = (M * n) / m;
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Xác suất thực nghiệm',
        topic: 'Mô hình xác suất thống kê sinh học thực tế',
        problemType: 'Ước lượng số lượng cá thể bằng phương pháp đánh dấu',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.5,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_sinh_hoc', 'ti_le_thuc_xac_suat', 'giai_phuong_trinh_ti_so'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 8,
        },
        content: `Để ước lượng số cá trong một hồ nước nhân tạo, người ta bắt lên $${M}$ con cá, bấm một khuyên nhỏ vào vây của mỗi con rồi thả lại hồ. Sau hai tuần để cá hòa nhập, người ta bắt ngẫu nhiên $${n}$ con cá trong hồ thì thấy có $${m}$ con có khuyên đánh dấu. Hãy ước lượng tổng số cá có trong hồ nước đó.`,
        correctAnswer: String(N),
        acceptedAnswers: [String(N), `${N} con`, `khoảng ${N} con`],
        solution: `Bước 1: Gọi tổng số cá trong hồ nước là $N$ ($N \\in \\mathbb{N}^*, N > 100$).\\nBước 2: Trong lần bắt thứ hai, tỉ số cá có đánh dấu là $P_2 = \\frac{${m}}{${n}} = \\frac{1}{5}$.\\nBước 3: Vì cá được thả hòa nhập đều trong hồ nên xác suất thực nghiệm bắt được một con cá có đánh dấu xấp xỉ tỉ số giữa số cá được đánh dấu ban đầu và tổng số cá trong hồ:\\n$\\frac{${m}}{${n}} \\approx \\frac{${M}}{N}$.\\nBước 4: Thiết lập phương trình tỉ số:\\n$\\frac{${m}}{${n}} = \\frac{${M}}{N} \\implies N = \\frac{${M} \\cdot ${n}}{${m}}$.\\nBước 5: Tính toán: $N = \\frac{${M} \\cdot ${n}}{${m}} = \\frac{${M * n}}{${m}} = ${N}$ (con).\\nVậy ước lượng trong hồ có khoảng $${N}$ con cá.`,
        rubricSteps: [
          { step: 'Đặt ẩn N là tổng số cá trong hồ', points: 0.3 },
          { step: 'Tính tỉ số cá có đánh dấu trong lần bắt thứ hai: m/n', points: 0.3 },
          { step: 'Thiết lập tỉ lệ thức mô hình hóa: m/n = M/N', points: 0.3 },
          { step: 'Biến đổi tìm N = M * n / m', points: 0.3 },
          { step: `Tính ra đáp số N = ${N} con cá`, points: 0.3 },
        ],
        keyFormula: '$N = \\frac{M \\cdot n}{m}$.',
      };
    },
  },
  // VDC 2: Khôi phục bảng dữ liệu thống kê bị mờ
  {
    id: 'T_G6_C4_VDC_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Thu thập và tổ chức dữ liệu',
    topic: 'Khôi phục số liệu bị mất',
    problemType: 'Tìm dữ liệu bị khuyết dựa trên tỉ lệ và tổng thể',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['phuong_trinh_bac_nhat_don_gian', 'ti_so_phan_tram_tong_the', 'bien_luan_so_hoc'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      const a = 35; // 6A
      const b = 40; // 6B
      const d = 38; // 6D
      // Toàn khối 150 học sinh
      const total = 150;
      const c = total - a - b - d; // 37 (6C bị mờ)
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${c}$ học sinh`,
        [
          { text: `$${c + 2}$ học sinh`, errorType: 'TÍNH_NHẦM_TỔNG' },
          { text: `$${c - 3}$ học sinh`, errorType: 'CỘNG_THIẾU_HỌC_SINH' },
          { text: '$36$ học sinh', errorType: 'LẤY_TRUNG_BÌNH_CỘNG' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Thu thập và tổ chức dữ liệu',
        topic: 'Khôi phục số liệu bị mất',
        problemType: 'Tìm dữ liệu bị khuyết dựa trên tỉ lệ và tổng thể',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['phuong_trinh_bac_nhat_don_gian', 'ti_so_phan_tram_tong_the', 'bien_luan_so_hoc'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: `Khối lớp 6 có tất cả $150$ học sinh gồm 4 lớp 6A, 6B, 6C, 6D. Bảng số liệu thống kê ghi lại: lớp 6A có $35$ học sinh, lớp 6B có $40$ học sinh, lớp 6D có $38$ học sinh, còn ô số lượng học sinh lớp 6C bị mực làm mờ. Số học sinh của lớp 6C là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Gọi số học sinh của lớp 6C là $x$ ($x \\in \\mathbb{N}^*, x < 150$).\\nBước 2: Tổng số học sinh toàn khối 6 là $150$ học sinh.\\nBước 3: Lập phương trình biểu diễn tổng số học sinh:\\n$35 + 40 + x + 38 = 150$.\\nBước 4: Thu gọn:\\n$113 + x = 150 \\implies x = 150 - 113$.\\nBước 5: Tính toán tìm ra $x = ${c}$. Vậy số học sinh lớp 6C là $${c}$ học sinh.`,
        rubricSteps: [
          { step: 'Đặt ẩn x là số học sinh lớp 6C', points: 0.15 },
          { step: 'Lập phương trình tổng số học sinh 4 lớp bằng 150', points: 0.15 },
          { step: 'Cộng các số hạng đã biết: 35 + 40 + 38 = 113', points: 0.15 },
          { step: `Giải tìm x = 150 - 113 = ${c}`, points: 0.15 },
          { step: 'Chọn phương án đúng', points: 0.15 },
        ],
        keyFormula: '$x = \\text{Tổng} - (a + b + d)$.',
      };
    },
  },
  // VDC 3: Xác suất bốc thăm hai giai đoạn
  {
    id: 'T_G6_C4_VDC_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C4',
    lesson: 'Xác suất thực nghiệm',
    topic: 'Xác suất thực nghiệm hai giai đoạn',
    problemType: 'So sánh xác suất thực nghiệm và dự đoán biến cố',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['xac_suat_thuc_nghiem_da_giai_doan', 'so_sanh_ti_le_thuc_nghiem', 'danh_gia_bien_co'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: true,
      estMinutes: 8,
    },
    generate(rng, book) {
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C4',
        lesson: 'Xác suất thực nghiệm',
        topic: 'Xác suất thực nghiệm hai giai đoạn',
        problemType: 'So sánh xác suất thực nghiệm và dự đoán biến cố',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.5,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['xac_suat_thuc_nghiem_da_giai_doan', 'so_sanh_ti_le_thuc_nghiem', 'danh_gia_bien_co'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: true,
          estMinutes: 8,
        },
        content: 'Một xạ thủ bắn $100$ viên đạn vào bia. Trong $50$ phát súng đầu tiên, xạ thủ bắn trúng hồng tâm $42$ lần. Trong $50$ phát súng tiếp theo, xạ thủ bắn trúng hồng tâm $48$ lần. Tính xác suất thực nghiệm bắn trúng hồng tâm: a) Trong 50 phát đầu; b) Trong 50 phát sau; c) Trong cả 100 phát bắn.',
        correctAnswer: 'a) 0.84, b) 0.96, c) 0.9',
        acceptedAnswers: ['0.84, 0.96, 0.9', '84%, 96%, 90%'],
        solution: `Bước 1: Xác suất thực nghiệm trong 50 phát đầu tiên:\\n$P_1 = \\frac{42}{50} = \\frac{84}{100} = 0.84 = 84\\%$.\\nBước 2: Xác suất thực nghiệm trong 50 phát tiếp theo:\\n$P_2 = \\frac{48}{50} = \\frac{96}{100} = 0.96 = 96\\%$.\\nBước 3: Tổng số phát bắn trúng hồng tâm trong cả 100 lần bắn:\\n$N_{trúng} = 42 + 48 = 90$ (lần).\\nBước 4: Xác suất thực nghiệm bắn trúng trong cả 100 phát bắn:\\n$P = \\frac{90}{100} = 0.9 = 90\\%$.\\nBước 5: Nhận xét: Phong độ của xạ thủ ở 50 phát sau cao hơn 50 phát đầu ($96\\% > 84\\%$).\\nĐáp số: a) $0.84$; b) $0.96$; c) $0.9$.`,
        rubricSteps: [
          { step: 'Tính đúng xác suất thực nghiệm giai đoạn 1: 42/50 = 0.84', points: 0.3 },
          { step: 'Tính đúng xác suất thực nghiệm giai đoạn 2: 48/50 = 0.96', points: 0.3 },
          { step: 'Tính tổng số phát trúng trong cả 100 lần: 42 + 48 = 90', points: 0.3 },
          { step: 'Tính đúng xác suất thực nghiệm toàn bộ: 90/100 = 0.9', points: 0.3 },
          { step: 'Kết luận đầy đủ 3 ý của bài toán', points: 0.3 },
        ],
        keyFormula: '$P = \\frac{\\sum k_i}{\\sum n_i}$.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 5: PHÂN SỐ VÀ SỐ THẬP PHÂN (G6_C5)
  // ============================================================================
  // VD 1: Mua hàng giảm giá hai lần liên tiếp
  {
    id: 'T_G6_C5_HARD_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Hai bài toán về phân số',
    topic: 'Ứng dụng tỉ số phần trăm và phân số',
    problemType: 'Mua hàng giảm giá hai tầng liên tiếp',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['ti_so_phan_tram_nhieu_tang', 'phan_so_cua_mot_so', 'mo_hinh_hoa_thuc_te'],
      crossTopic: false,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const price = rng.nextInt(40, 80) * 10000; // giá niêm yết (400.000 - 800.000 đ)
      const afterFirst = price * 0.9; // giảm 10%
      const finalPrice = afterFirst * 0.95; // giảm thêm 5%
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${finalPrice.toLocaleString('vi-VN')}$ đồng`,
        [
          { text: `$${(price * 0.85).toLocaleString('vi-VN')}$ đồng`, errorType: 'CỘNG_DỒN_PHẦN_TRĂM_GIẢM_15_PERCENT' },
          { text: `$${afterFirst.toLocaleString('vi-VN')}$ đồng`, errorType: 'CHỈ_TÍNH_LẦN_GIẢM_1' },
          { text: `$${(price * 0.8).toLocaleString('vi-VN')}$ đồng`, errorType: 'TÍNH_NHẦM_GIẢM_20_PERCENT' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Hai bài toán về phân số',
        topic: 'Ứng dụng tỉ số phần trăm và phân số',
        problemType: 'Mua hàng giảm giá hai tầng liên tiếp',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['ti_so_phan_tram_nhieu_tang', 'phan_so_cua_mot_so', 'mo_hinh_hoa_thuc_te'],
          crossTopic: false,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Một chiếc áo khoác có giá niêm yết là $${price.toLocaleString('vi-VN')}$ đồng. Cửa hàng đang có chương trình giảm giá $10\\%$ trên giá niêm yết. Ngoài ra, bạn An có thẻ khách hàng thân thiết nên được giảm thêm $5\\%$ trên giá đã giảm. Số tiền bạn An phải trả để mua chiếc áo khoác đó là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Giá của chiếc áo sau lần giảm giá thứ nhất ($10\\%$):\\n$P_1 = ${price} \\cdot (1 - 0.1) = ${price} \\cdot 0.9 = ${afterFirst}$ (đồng).\\nBước 2: Giá bạn An phải trả sau khi giảm thêm $5\\%$ trên giá đã giảm là:\\n$P_2 = ${afterFirst} \\cdot (1 - 0.05) = ${afterFirst} \\cdot 0.95 = ${finalPrice}$ (đồng).\\nBước 3: Kết luận số tiền bạn An phải trả là $${finalPrice.toLocaleString('vi-VN')}$ đồng.`,
        rubricSteps: [
          { step: `Tính giá sau lần giảm thứ nhất: ${afterFirst} đồng`, points: 0.25 },
          { step: `Tính giá sau lần giảm thứ hai: ${finalPrice} đồng`, points: 0.25 },
          { step: 'Chọn phương án đúng', points: 0.25 },
        ],
        keyFormula: '$P = P_0 \\cdot (1 - r_1) \\cdot (1 - r_2)$.',
      };
    },
  },
  // VD 2: Bài toán cuộn vải bán hai lần
  {
    id: 'T_G6_C5_HARD_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Hai bài toán về phân số',
    topic: 'Tìm một số biết giá trị phân số của nó',
    problemType: 'Tìm độ dài ban đầu qua hai lần bán phân số',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['tim_mot_so_biet_gia_tri_phan_so', 'phan_so_chi_phan_con_lai', 'mo_hinh_hoa_thuc_te'],
      crossTopic: false,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      // Bán lần 1: 1/3 tấm. Còn lại 2/3.
      // Bán lần 2: 1/2 số vải còn lại => bán (1/2)*(2/3) = 1/3 tấm.
      // Còn lại: 1 - 1/3 - 1/3 = 1/3 tấm.
      const remMeters = rng.nextInt(15, 30);
      const totalMeters = remMeters * 3;
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Hai bài toán về phân số',
        topic: 'Tìm một số biết giá trị phân số của nó',
        problemType: 'Tìm độ dài ban đầu qua hai lần bán phân số',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['tim_mot_so_biet_gia_tri_phan_so', 'phan_so_chi_phan_con_lai', 'mo_hinh_hoa_thuc_te'],
          crossTopic: false,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Một cuộn vải sau khi bán $\\frac{1}{3}$ chiều dài cuộn ở buổi sáng và bán tiếp $\\frac{1}{2}$ số vải còn lại ở buổi chiều thì cuộn vải còn lại $${remMeters}\\text{ m}$. Tính chiều dài ban đầu của cuộn vải đó.`,
        correctAnswer: String(totalMeters),
        acceptedAnswers: [String(totalMeters), `${totalMeters} m`, `${totalMeters} mét`],
        solution: `Bước 1: Phân số chỉ số vải còn lại sau buổi sáng là:\\n$1 - \\frac{1}{3} = \\frac{2}{3}$ (cuộn vải).\\nBước 2: Phân số chỉ số vải bán trong buổi chiều là:\\n$\\frac{1}{2} \\cdot \\frac{2}{3} = \\frac{1}{3}$ (cuộn vải).\\nBước 3: Phân số chỉ số vải còn lại sau cả hai buổi là:\\n$1 - \\left(\\frac{1}{3} + \\frac{1}{3}\\right) = \\frac{1}{3}$ (cuộn vải).\\nBước 4: Chiều dài ban đầu của cuộn vải là:\\n$L = ${remMeters} : \\frac{1}{3} = ${remMeters} \\cdot 3 = ${totalMeters}\\text{ m}$.`,
        rubricSteps: [
          { step: 'Tính phân số chỉ số mét vải còn lại sau lần bán thứ nhất', points: 0.3 },
          { step: 'Tính phân số chỉ số mét vải còn lại sau lần bán thứ hai là 1/3', points: 0.3 },
          { step: `Tìm độ dài ban đầu L = ${remMeters} : 1/3 = ${totalMeters} m`, points: 0.4 },
        ],
        keyFormula: 'Chiều dài ban đầu = Số lượng còn lại : Phân số tương ứng.',
      };
    },
  },
  // VD 3: Tính giá trị biểu thức phân số nhiều tầng
  {
    id: 'T_G6_C5_HARD_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Phép cộng và phép trừ phân số',
    topic: 'Thứ tự thực hiện phép tính phân số',
    problemType: 'Biểu thức phân số có lũy thừa và ngoặc',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['quy_dong_mau_so', 'luy_thua_phan_so', 'thu_tu_thuc_hien_phep_tinh'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      // (1/2 - 1/3) * 6 + (1/2)^2 = (1/6)*6 + 1/4 = 1 + 1/4 = 5/4
      const ans = '5/4';
      const ansTex = '\\frac{5}{4}';
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${ansTex}\$`,
        [
          { text: '$\\frac{1}{4}$', errorType: 'QUÊN_CỘNG_PHẦN_NGUYÊN' },
          { text: '$1$', errorType: 'QUÊN_LŨY_THỪA_PHÂN_SỐ' },
          { text: '$\\frac{3}{4}$', errorType: 'TRỪ_SAI_PHÂN_SỐ' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Phép cộng và phép trừ phân số',
        topic: 'Thứ tự thực hiện phép tính phân số',
        problemType: 'Biểu thức phân số có lũy thừa và ngoặc',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['quy_dong_mau_so', 'luy_thua_phan_so', 'thu_tu_thuc_hien_phep_tinh'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: 'Tính giá trị của biểu thức $A = \\left(\\frac{1}{2} - \\frac{1}{3}\\right) \\cdot 6 + \\left(\\frac{1}{2}\\right)^2$:',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Tính trong ngoặc trước:\\n$\\frac{1}{2} - \\frac{1}{3} = \\frac{3 - 2}{6} = \\frac{1}{6}$.\\nBước 2: Thực hiện phép nhân và lũy thừa:\\n$\\frac{1}{6} \\cdot 6 = 1$ và $\\left(\\frac{1}{2}\\right)^2 = \\frac{1}{4}$.\\nBước 3: Thực hiện phép cộng cuối cùng:\\n$A = 1 + \\frac{1}{4} = \\frac{5}{4}$.`,
        rubricSteps: [
          { step: 'Tính đúng phép trừ trong ngoặc ra 1/6', points: 0.25 },
          { step: 'Thực hiện phép nhân và lũy thừa ra 1 và 1/4', points: 0.25 },
          { step: 'Cộng ra kết quả 5/4', points: 0.25 },
        ],
        keyFormula: 'Thứ tự ưu tiên: trong ngoặc -> lũy thừa -> nhân chia -> cộng trừ.',
      };
    },
  },
  // VD 4: Dãy phân số tách hiệu
  {
    id: 'T_G6_C5_HARD_04',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Phép nhân và phép chia phân số',
    topic: 'Tổng dãy phân số có quy luật',
    problemType: 'Tổng phân số dạng 1/(n*(n+1))',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 4,
      techniques: ['tach_phan_so_thanh_hieu', 'triet_tieu_day_tong', 'quy_dong_mau_so'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const n = rng.nextInt(40, 99);
      // S = 1/(1*2) + 1/(2*3) + ... + 1/(n*(n+1)) = 1 - 1/(n+1) = n/(n+1)
      const ansTex = `\\frac{${n}}{${n + 1}}`;
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Phép nhân và phép chia phân số',
        topic: 'Tổng dãy phân số có quy luật',
        problemType: 'Tổng phân số dạng 1/(n*(n+1))',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 4,
          techniques: ['tach_phan_so_thanh_hieu', 'triet_tieu_day_tong', 'quy_dong_mau_so'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Tính giá trị của tổng: $S = \\frac{1}{1 \\cdot 2} + \\frac{1}{2 \\cdot 3} + \\frac{1}{3 \\cdot 4} + \\dots + \\frac{1}{${n} \\cdot ${n + 1}}$.`,
        correctAnswer: ansTex,
        acceptedAnswers: [ansTex, `${n}/${n + 1}`],
        solution: `Bước 1: Ta nhận thấy công thức tổng quát của mỗi số hạng:\\n$\\frac{1}{k(k+1)} = \\frac{1}{k} - \\frac{1}{k+1}$ (với mọi $k \\in \\mathbb{N}^*$).\\nBước 2: Áp dụng vào tổng $S$:\\n$S = \\left(1 - \\frac{1}{2}\\right) + \\left(\\frac{1}{2} - \\frac{1}{3}\\right) + \\left(\\frac{1}{3} - \\frac{1}{4}\\right) + \\dots + \\left(\\frac{1}{${n}} - \\frac{1}{${n + 1}}\\right)$.\\nBước 3: Thu gọn triệt tiêu các cặp số đối nhau liên tiếp:\\n$S = 1 - \\frac{1}{${n + 1}}$.\\nBước 4: Quy đồng và tính kết quả:\\n$S = \\frac{${n + 1} - 1}{${n + 1}} = \\frac{${n}}{${n + 1}}$.`,
        rubricSteps: [
          { step: 'Phát hiện quy tắc tách phân số: 1/(k(k+1)) = 1/k - 1/(k+1)', points: 0.3 },
          { step: 'Khai triển tổng S thành chuỗi hiệu liên tiếp', points: 0.3 },
          { step: `Triệt tiêu và tính ra kết quả ${ansTex}`, points: 0.4 },
        ],
        keyFormula: '$\\frac{1}{k(k+1)} = \\frac{1}{k} - \\frac{1}{k+1}$.',
      };
    },
  },

  // VDC 1: Chứng minh phân số tối giản với mọi n
  {
    id: 'T_G6_C5_VDC_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Phân số tối giản',
    topic: 'Chứng minh phân số tối giản',
    problemType: 'Chứng minh phân số tối giản với mọi số tự nhiên n',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['goi_uoc_chung_lon_nhat', 'triet_tieu_bien_n', 'dinh_nghia_phan_so_toi_gian'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Phân số tối giản',
        topic: 'Chứng minh phân số tối giản',
        problemType: 'Chứng minh phân số tối giản với mọi số tự nhiên n',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.5,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['goi_uoc_chung_lon_nhat', 'triet_tieu_bien_n', 'dinh_nghia_phan_so_toi_gian'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Chứng minh rằng với mọi số tự nhiên $n$, phân số $B = \\frac{2n + 1}{3n + 2}$ luôn là phân số tối giản.',
        correctAnswer: 'B luôn là phân số tối giản',
        acceptedAnswers: ['B luon la phan so toi gian', 'toi gian', 'Dung', 'Đúng'],
        solution: `Bước 1: Gọi $d = \\text{ƯCLN}(2n + 1, 3n + 2)$ với $d \\in \\mathbb{N}^*$.\\nBước 2: Vì $d$ là ước chung của tử và mẫu nên:\\n$(2n + 1) \\,\\vdots\\, d$ và $(3n + 2) \\,\\vdots\\, d$.\\nBước 3: Nhân hệ số thích hợp để triệt tiêu biến $n$:\\n$3(2n + 1) \\,\\vdots\\, d \\implies (6n + 3) \\,\\vdots\\, d$.\\n$2(3n + 2) \\,\\vdots\\, d \\implies (6n + 4) \\,\\vdots\\, d$.\\nBước 4: Xét hiệu của hai tích:\\n$[(6n + 4) - (6n + 3)] \\,\\vdots\\, d \\implies (6n - 6n + 4 - 3) \\,\\vdots\\, d \\implies 1 \\,\\vdots\\, d$.\\nBước 5: Vì $d \\in \\mathbb{N}^*$ và $1 \\,\\vdots\\, d$ nên bắt buộc $d = 1$.\\nVì $\\text{ƯCLN}(2n + 1, 3n + 2) = 1$ nên phân số $B$ luôn là phân số tối giản với mọi số tự nhiên $n$.`,
        rubricSteps: [
          { step: 'Gọi d là ƯCLN của tử thức 2n + 1 và mẫu thức 3n + 2', points: 0.3 },
          { step: 'Nhân hệ số 3 vào tử và hệ số 2 vào mẫu', points: 0.3 },
          { step: 'Lấy hiệu triệt tiêu biến n: (6n + 4) - (6n + 3) = 1', points: 0.3 },
          { step: 'Lý luận 1 chia hết cho d suy ra d = 1', points: 0.3 },
          { step: 'Kết luận phân số B luôn tối giản với mọi n', points: 0.3 },
        ],
        keyFormula: '$\\text{ƯCLN}(A, B) = 1 \\iff$ phân số tối giản.',
      };
    },
  },
  // VDC 2: So sánh hai phân số lớn qua phần bù
  {
    id: 'T_G6_C5_VDC_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'So sánh phân số',
    topic: 'Kỹ thuật so sánh phân số lớn',
    problemType: 'So sánh hai phân số lũy thừa mũ lớn',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['nhan_he_so_co_so', 'tach_phan_nguyen', 'so_sanh_phan_bu'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$A > B$',
        [
          { text: '$A < B$', errorType: 'NGHĨ_LÀ_MẪU_LỚN_HƠN_THÌ_NHỎ_HƠN' },
          { text: '$A = B$', errorType: 'CHO_LÀ_XẤP_XỈ_BẰNG_NHAU' },
          { text: 'Không so sánh được', errorType: 'THIẾU_KIẾN_THỨC' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'So sánh phân số',
        topic: 'Kỹ thuật so sánh phân số lớn',
        problemType: 'So sánh hai phân số lũy thừa mũ lớn',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['nhan_he_so_co_so', 'tach_phan_nguyen', 'so_sanh_phan_bu'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Cho hai phân số $A = \\frac{10^{2023} + 1}{10^{2024} + 1}$ và $B = \\frac{10^{2024} + 1}{10^{2025} + 1}$. Khẳng định nào sau đây là ĐÚNG?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Nhân cả hai phân số với cơ số $10$:\\n$10A = \\frac{10(10^{2023} + 1)}{10^{2024} + 1} = \\frac{10^{2024} + 10}{10^{2024} + 1} = \\frac{(10^{2024} + 1) + 9}{10^{2024} + 1} = 1 + \\frac{9}{10^{2024} + 1}$.\\nBước 2: Tương tự đối với $B$:\\n$10B = \\frac{10(10^{2024} + 1)}{10^{2025} + 1} = \\frac{10^{2025} + 10}{10^{2025} + 1} = \\frac{(10^{2025} + 1) + 9}{10^{2025} + 1} = 1 + \\frac{9}{10^{2025} + 1}$.\\nBước 3: So sánh phần dư:\\nVì $10^{2024} + 1 < 10^{2025} + 1$ nên $\\frac{9}{10^{2024} + 1} > \\frac{9}{10^{2025} + 1}$.\\nBước 4: Do đó $1 + \\frac{9}{10^{2024} + 1} > 1 + \\frac{9}{10^{2025} + 1} \\implies 10A > 10B$.\\nBước 5: Chia cả hai vế cho $10$ ta được $A > B$.`,
        rubricSteps: [
          { step: 'Nhân 10 vào A và tách thành 1 + 9/(10^2024 + 1)', points: 0.15 },
          { step: 'Nhân 10 vào B và tách thành 1 + 9/(10^2025 + 1)', points: 0.15 },
          { step: 'So sánh hai phân số có cùng tử số 9', points: 0.15 },
          { step: 'Suy ra 10A > 10B', points: 0.15 },
          { step: 'Kết luận A > B', points: 0.15 },
        ],
        keyFormula: '$10A = 1 + \\frac{9}{mẫu}$.',
      };
    },
  },
  // VDC 3: Tìm x nguyên để phân thức hữu tỉ nhận giá trị nguyên
  {
    id: 'T_G6_C5_VDC_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C5',
    lesson: 'Phân số và số nguyên',
    topic: 'Biện luận phân số có giá trị nguyên',
    problemType: 'Tìm số nguyên x để phân số nhận giá trị nguyên',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['chia_da_thuc_cho_don_thuc_lop_6', 'bien_doi_tach_phan_nguyen', 'uoc_so_nguyen'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      // M = (x^2 + 2x + 5)/(x + 1) = (x(x+1) + (x+1) + 4)/(x+1) = x + 1 + 4/(x+1)
      // x+1 thuộc Ư(4) = {+-1, +-2, +-4}
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C5',
        lesson: 'Phân số và số nguyên',
        topic: 'Biện luận phân số có giá trị nguyên',
        problemType: 'Tìm số nguyên x để phân số nhận giá trị nguyên',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.5,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['chia_da_thuc_cho_don_thuc_lop_6', 'bien_doi_tach_phan_nguyen', 'uoc_so_nguyen'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: 'Tìm tất cả các số nguyên $x$ để biểu thức $M = \\frac{x^2 + 2x + 5}{x + 1}$ nhận giá trị là một số nguyên.',
        correctAnswer: 'x thuộc {0, -2, 1, -3, 3, -5}',
        acceptedAnswers: ['0, -2, 1, -3, 3, -5', 'x = 0, -2, 1, -3, 3, -5', 'Dung', 'Đúng'],
        solution: `Bước 1: Điều kiện xác định: $x + 1 \\ne 0 \\iff x \\ne -1$.\\nBước 2: Phân tích tử thức theo mẫu thức:\\n$x^2 + 2x + 5 = x(x + 1) + (x + 1) + 4 = (x + 1)(x + 1) + 4 = (x + 1)^2 + 4$.\\nBước 3: Biểu thức $M$ trở thành:\\n$M = \\frac{(x + 1)^2 + 4}{x + 1} = (x + 1) + \\frac{4}{x + 1}$.\\nBước 4: Vì $x \\in \\mathbb{Z}$ nên $x + 1 \\in \\mathbb{Z}$. Để $M \\in \\mathbb{Z}$ thì $\\frac{4}{x + 1} \\in \\mathbb{Z} \\implies x + 1 \\in Ư(4) = \\{\\pm 1, \\pm 2, \\pm 4\\}$.\\nBước 5: Lập bảng tính các giá trị của $x$:\\n- $x + 1 = 1 \\implies x = 0$\\n- $x + 1 = -1 \\implies x = -2$\\n- $x + 1 = 2 \\implies x = 1$\\n- $x + 1 = -2 \\implies x = -3$\\n- $x + 1 = 4 \\implies x = 3$\\n- $x + 1 = -4 \\implies x = -5$.\\nTất cả các giá trị đều thỏa mãn $x \\ne -1$. Vậy $x \\in \\{0, -2, 1, -3, 3, -5\\}$.`,
        rubricSteps: [
          { step: 'Đặt điều kiện xác định x khác -1', points: 0.3 },
          { step: 'Tách tử thức thành (x + 1)^2 + 4', points: 0.3 },
          { step: 'Rút gọn M = (x + 1) + 4/(x + 1)', points: 0.3 },
          { step: 'Lý luận x + 1 thuộc Ư(4) = {+-1, +-2, +-4}', points: 0.3 },
          { step: 'Tính và kết luận đầy đủ 6 giá trị nguyên của x', points: 0.3 },
        ],
        keyFormula: '$x + 1 \\in Ư(4)$.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 6: HÌNH HỌC PHẲNG (G6_C6)
  // ============================================================================
  // VD 1: Tính độ dài đoạn thẳng khi biết trung điểm
  {
    id: 'T_G6_C6_HARD_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Đoạn thẳng. Độ dài đoạn thẳng',
    topic: 'Trung điểm của đoạn thẳng',
    problemType: 'Tính độ dài đoạn thẳng qua trung điểm',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['dinh_nghia_trung_diem', 'cong_doan_thang', 'diem_nam_giua'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const ab = rng.nextChoice([12, 16, 20]);
      const am = ab / 2;
      const an = rng.nextInt(2, am - 1);
      const nb = ab - an;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$NB = ${nb}\\text{ cm}\$`,
        [
          { text: `$NB = ${am - an}\\text{ cm}\$`, errorType: 'NHẦM_VỚI_ĐOẠN_MN' },
          { text: `$NB = ${ab - am}\\text{ cm}\$`, errorType: 'QUÊN_ĐIỂM_N' },
          { text: `$NB = ${nb - 2}\\text{ cm}\$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Đoạn thẳng. Độ dài đoạn thẳng',
        topic: 'Trung điểm của đoạn thẳng',
        problemType: 'Tính độ dài đoạn thẳng qua trung điểm',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['dinh_nghia_trung_diem', 'cong_doan_thang', 'diem_nam_giua'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Trên đoạn thẳng $AB = ${ab}\\text{ cm}$, lấy điểm $M$ là trung điểm của $AB$. Trên đoạn $AM$, lấy điểm $N$ sao cho $AN = ${an}\\text{ cm}$. Độ dài của đoạn thẳng $NB$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Vì $M$ là trung điểm của $AB$ nên $AM = MB = \\frac{AB}{2} = \\frac{${ab}}{2} = ${am}\\text{ cm}$.\\nBước 2: Vì $N$ nằm trên đoạn $AM$ nên $N$ nằm giữa $A$ và $B$. Do đó:\\n$AN + NB = AB$.\\nBước 3: Thay số:\\n$NB = AB - AN = ${ab} - ${an} = ${nb}\\text{ cm}$.`,
        rubricSteps: [
          { step: `Tính độ dài đoạn AM = MB = ${am} cm`, points: 0.25 },
          { step: 'Lý luận điểm N nằm giữa A và B: AN + NB = AB', points: 0.25 },
          { step: `Tính ra NB = ${nb} cm`, points: 0.25 },
        ],
        keyFormula: '$NB = AB - AN$.',
      };
    },
  },
  // VD 2: Tính khoảng cách từ gốc tới trung điểm
  {
    id: 'T_G6_C6_HARD_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Đoạn thẳng. Độ dài đoạn thẳng',
    topic: 'Trung điểm trên tia',
    problemType: 'Tính khoảng cách OM',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['he_thuc_tia_diem_nam_giua', 'trung_diem_doan_thang', 'trung_binh_cong_do_dai'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const oa = rng.nextInt(4, 6);
      const ob = oa + rng.nextInt(4, 8);
      const ab = ob - oa;
      const om = (oa + ob) / 2;
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Đoạn thẳng. Độ dài đoạn thẳng',
        topic: 'Trung điểm trên tia',
        problemType: 'Tính khoảng cách OM',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['he_thuc_tia_diem_nam_giua', 'trung_diem_doan_thang', 'trung_binh_cong_do_dai'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Trên tia $Ox$, lấy hai điểm $A$ và $B$ sao cho $OA = ${oa}\\text{ cm}$ và $OB = ${ob}\\text{ cm}$. Gọi $M$ là trung điểm của đoạn thẳng $AB$. Tính độ dài đoạn thẳng $OM$.`,
        correctAnswer: String(om),
        acceptedAnswers: [String(om), `${om} cm`],
        solution: `Bước 1: Trên tia $Ox$, vì $OA < OB$ ($${oa} < ${ob}$) nên điểm $A$ nằm giữa hai điểm $O$ và $B$. Ta có:\\n$AB = OB - OA = ${ob} - ${oa} = ${ab}\\text{ cm}$.\\nBước 2: Vì $M$ là trung điểm của $AB$ nên:\\n$AM = \\frac{AB}{2} = \\frac{${ab}}{2} = ${ab / 2}\\text{ cm}$.\\nBước 3: Vì $A$ nằm giữa $O$ và $M$ nên:\\n$OM = OA + AM = ${oa} + ${ab / 2} = ${om}\\text{ cm}$.`,
        rubricSteps: [
          { step: `Tính độ dài AB = OB - OA = ${ab} cm`, points: 0.3 },
          { step: `Tính độ dài AM = AB / 2 = ${ab / 2} cm`, points: 0.3 },
          { step: `Tính OM = OA + AM = ${om} cm`, points: 0.4 },
        ],
        keyFormula: '$OM = \\frac{OA + OB}{2}$.',
      };
    },
  },
  // VD 3: Hai góc kề bù và tia phân giác
  {
    id: 'T_G6_C6_HARD_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Góc. Các góc đặc biệt',
    topic: 'Hai góc kề bù và tia phân giác',
    problemType: 'Tính số đo góc tạo bởi tia phân giác',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['tinh_chat_hai_goc_ke_bu', 'dinh_nghia_tia_phan_giac', 'tinh_so_do_goc'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      // xOy và yOz kề bù: xOy = 2*yOz => 3*yOz = 180 => yOz = 60, xOy = 120
      // Tia phân giác Ot của xOy => tOy = 60
      // tOz = tOy + yOz = 60 + 60 = 120 độ
      const yOz = 60;
      const xOy = 120;
      const tOy = 60;
      const tOz = 120;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$${tOz}^\\circ\$`,
        [
          { text: `$${xOy / 2}^\\circ\$`, errorType: 'CHỈ_TÍNH_GÓC_TOY' },
          { text: '$90^\\circ$', errorType: 'CHO_LÀ_GÓC_VUÔNG' },
          { text: `$${tOz - 20}^\\circ\$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Góc. Các góc đặc biệt',
        topic: 'Hai góc kề bù và tia phân giác',
        problemType: 'Tính số đo góc tạo bởi tia phân giác',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['tinh_chat_hai_goc_ke_bu', 'dinh_nghia_tia_phan_giac', 'tinh_so_do_goc'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: 'Cho hai góc kề bù $\\widehat{xOy}$ và $\\widehat{yOz}$ sao cho $\\widehat{xOy} = 2\\widehat{yOz}$. Vẽ tia phân giác $Ot$ của $\\widehat{xOy}$. Số đo của $\\widehat{tOz}$ là:',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Vì $\\widehat{xOy}$ và $\\widehat{yOz}$ kề bù nên $\\widehat{xOy} + \\widehat{yOz} = 180^\\circ$. Thay $\\widehat{xOy} = 2\\widehat{yOz}$, ta được:\\n$2\\widehat{yOz} + \\widehat{yOz} = 180^\\circ \\implies 3\\widehat{yOz} = 180^\\circ \\implies \\widehat{yOz} = 60^\\circ$.\\nSuy ra $\\widehat{xOy} = 120^\\circ$.\\nBước 2: Vì $Ot$ là tia phân giác của $\\widehat{xOy}$ nên $\\widehat{tOy} = \\frac{\\widehat{xOy}}{2} = \\frac{120^\\circ}{2} = 60^\\circ$.\\nBước 3: Vì tia $Oy$ nằm giữa hai tia $Ot$ và $Oz$ nên:\\n$\\widehat{tOz} = \\widehat{tOy} + \\widehat{yOz} = 60^\\circ + 60^\\circ = 120^\\circ$.`,
        rubricSteps: [
          { step: 'Tính được số đo góc yOz = 60 độ và góc xOy = 120 độ', points: 0.25 },
          { step: 'Tính góc tOy = 60 độ dựa trên định nghĩa tia phân giác', points: 0.25 },
          { step: 'Cộng góc tính ra góc tOz = 120 độ', points: 0.25 },
        ],
        keyFormula: 'Hai góc kề bù có tổng bằng 180 độ.',
      };
    },
  },
  // VD 4: Bài toán góc vuông trong góc tù
  {
    id: 'T_G6_C6_HARD_04',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Góc. Các góc đặc biệt',
    topic: 'Tính số đo góc',
    problemType: 'Hai góc vuông cùng đỉnh chung tia trong',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 3,
      techniques: ['he_thuc_cong_goc', 'goc_vuong_90_do', 'he_thuc_phan_giac'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 4,
    },
    generate(rng, book) {
      const alpha = 130; // xOy
      // Om vuông góc Ox => xOm = 90
      // On vuông góc Oy => yOn = 90
      // mOn = xOm + yOn - xOy = 90 + 90 - 130 = 50 độ
      const ans = 180 - alpha;
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Góc. Các góc đặc biệt',
        topic: 'Tính số đo góc',
        problemType: 'Hai góc vuông cùng đỉnh chung tia trong',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 3,
          techniques: ['he_thuc_cong_goc', 'goc_vuong_90_do', 'he_thuc_phan_giac'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 4,
        },
        content: `Cho góc $\\widehat{xOy} = ${alpha}^\\circ$. Trong góc $\\widehat{xOy}$, vẽ hai tia $Om$ và $On$ sao cho $Om \\perp Ox$ và $On \\perp Oy$. Tính số đo của góc $\\widehat{mOn}$.`,
        correctAnswer: String(ans),
        acceptedAnswers: [String(ans), `${ans} độ`, `${ans}^o`],
        solution: `Bước 1: Vì $Om \\perp Ox$ nên $\\widehat{xOm} = 90^\\circ$. Do tia $Om$ nằm trong góc $\\widehat{xOy}$ nên:\\n$\\widehat{yOm} = \\widehat{xOy} - \\widehat{xOm} = ${alpha}^\\circ - 90^\\circ = ${alpha - 90}^\\circ$.\\nBước 2: Vì $On \\perp Oy$ nên $\\widehat{yOn} = 90^\\circ$. Vì tia $Om$ nằm giữa hai tia $On$ và $Oy$ nên:\\n$\\widehat{mOn} + \\widehat{yOm} = \\widehat{yOn}$.\\nBước 3: Thay số:\\n$\\widehat{mOn} = \\widehat{yOn} - \\widehat{yOm} = 90^\\circ - ${alpha - 90}^\\circ = ${ans}^\\circ$.`,
        rubricSteps: [
          { step: `Tính được góc yOm = ${alpha - 90} độ`, points: 0.3 },
          { step: 'Lý luận tia Om nằm giữa On và Oy', points: 0.3 },
          { step: `Tính ra góc mOn = ${ans} độ`, points: 0.4 },
        ],
        keyFormula: '$\\widehat{mOn} = 180^\\circ - \\widehat{xOy}$.',
      };
    },
  },

  // VDC 1: Bất biến độ dài MN khi C di chuyển trên AB
  {
    id: 'T_G6_C6_VDC_01',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Đoạn thẳng. Độ dài đoạn thẳng',
    topic: 'Tính chất bất biến hình học',
    problemType: 'Chứng minh độ dài đoạn thẳng không đổi khi điểm di động',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['bien_doi_dai_so_doan_thang', 'dinh_nghia_trung_diem', 'chung_minh_bat_bien'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const ab = rng.nextChoice([14, 16, 20]);
      const mn = ab / 2;
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Đoạn thẳng. Độ dài đoạn thẳng',
        topic: 'Tính chất bất biến hình học',
        problemType: 'Chứng minh độ dài đoạn thẳng không đổi khi điểm di động',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.5,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['bien_doi_dai_so_doan_thang', 'dinh_nghia_trung_diem', 'chung_minh_bat_bien'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Cho đoạn thẳng $AB = ${ab}\\text{ cm}$. Lấy điểm $C$ bất kỳ nằm giữa hai điểm $A$ và $B$. Gọi $M$ là trung điểm của đoạn thẳng $AC$, và $N$ là trung điểm của đoạn thẳng $CB$. Tính độ dài đoạn thẳng $MN$ và chứng minh rằng độ dài này không phụ thuộc vào vị trí của điểm $C$.`,
        correctAnswer: String(mn),
        acceptedAnswers: [String(mn), `${mn} cm`],
        solution: `Bước 1: Vì điểm $C$ nằm giữa hai điểm $A$ và $B$ nên $AC + CB = AB = ${ab}\\text{ cm}$.\\nBước 2: Vì $M$ là trung điểm của đoạn thẳng $AC$ nên $MC = \\frac{AC}{2}$.\\nBước 3: Vì $N$ là trung điểm của đoạn thẳng $CB$ nên $CN = \\frac{CB}{2}$.\\nBước 4: Vì $C$ nằm giữa $A$ và $B$, $M$ thuộc đoạn $AC$ và $N$ thuộc đoạn $CB$ nên điểm $C$ nằm giữa hai điểm $M$ và $N$. Do đó:\\n$MN = MC + CN = \\frac{AC}{2} + \\frac{CB}{2} = \\frac{AC + CB}{2}$.\\nBước 5: Thay $AC + CB = ${ab}\\text{ cm}$ vào, ta được:\\n$MN = \\frac{${ab}}{2} = ${mn}\\text{ cm}$.\\nVì $${ab}$ là hằng số cố định nên độ dài đoạn thẳng $MN$ luôn bằng $${mn}\\text{ cm}$, không phụ thuộc vào vị trí của điểm $C$ trên đoạn $AB$.`,
        rubricSteps: [
          { step: 'Nêu hệ thức C nằm giữa A và B: AC + CB = AB', points: 0.3 },
          { step: 'Biểu diễn MC = AC / 2 theo định nghĩa trung điểm', points: 0.3 },
          { step: 'Biểu diễn CN = CB / 2 theo định nghĩa trung điểm', points: 0.3 },
          { step: 'Chứng minh hệ thức MN = (AC + CB) / 2', points: 0.3 },
          { step: `Tính ra MN = ${mn} cm và kết luận tính không đổi`, points: 0.3 },
        ],
        keyFormula: '$MN = \\frac{AB}{2}$ (không phụ thuộc vào vị trí điểm $C$).',
      };
    },
  },
  // VDC 2: Đếm số đường thẳng tạo bởi n điểm
  {
    id: 'T_G6_C6_VDC_02',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Điểm và đường thẳng',
    topic: 'Bài toán tổ hợp đếm hình',
    problemType: 'Tìm số điểm khi biết số đường thẳng',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['cong_thuc_to_hop_duong_thang', 'tich_hai_so_tu_nhien_lien_tiep', 'giai_phuong_trinh_nghiem_nguyen'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const n = rng.nextChoice([10, 12, 15, 20]);
      const totalLines = (n * (n - 1)) / 2;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$n = ${n}$ điểm`,
        [
          { text: `$n = ${n - 1}$ điểm`, errorType: 'TÍNH_THIẾU_MỘT_ĐIỂM' },
          { text: `$n = ${n + 2}$ điểm`, errorType: 'TÍNH_NHẦM_TÍCH' },
          { text: `$n = ${Math.floor(Math.sqrt(totalLines))}$ điểm`, errorType: 'CĂN_BẬC_HAI_KHÔNG_CHIA_2' },
        ]
      );
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Điểm và đường thẳng',
        topic: 'Bài toán tổ hợp đếm hình',
        problemType: 'Tìm số điểm khi biết số đường thẳng',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 0.75,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['cong_thuc_to_hop_duong_thang', 'tich_hai_so_tu_nhien_lien_tiep', 'giai_phuong_trinh_nghiem_nguyen'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Cho $n$ điểm phân biệt trên mặt phẳng ($n \\in \\mathbb{N}, n \\ge 2$), trong đó không có ba điểm nào thẳng hàng. Cứ qua hai điểm ta vẽ được một đường thẳng. Biết rằng vẽ được tất cả $${totalLines}$ đường thẳng. Số điểm $n$ ban đầu là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Từ mỗi điểm trong $n$ điểm, ta nối với $n - 1$ điểm còn lại thì được $n - 1$ đường thẳng.\\nBước 2: Với $n$ điểm, ta vẽ được $n(n - 1)$ đường thẳng.\\nBước 3: Vì mỗi đường thẳng được tính lặp lại hai lần (đường thẳng $AB$ cũng là đường thẳng $BA$) nên số đường thẳng thực tế là:\\n$N = \\frac{n(n - 1)}{2}$.\\nBước 4: Theo đề bài, $\\frac{n(n - 1)}{2} = ${totalLines} \\implies n(n - 1) = ${totalLines * 2}$.\\nBước 5: Ta nhận thấy $${totalLines * 2} = ${n} \\cdot ${n - 1}$ là tích của hai số tự nhiên liên tiếp. Do đó $n = ${n}$ điểm.`,
        rubricSteps: [
          { step: 'Lý giải công thức tính số đường thẳng từ n điểm: n(n - 1) / 2', points: 0.15 },
          { step: `Thiết lập phương trình n(n - 1) / 2 = ${totalLines}`, points: 0.15 },
          { step: `Nhân chéo ra n(n - 1) = ${totalLines * 2}`, points: 0.15 },
          { step: `Phân tích thành tích hai số tự nhiên liên tiếp ${n} x ${n - 1}`, points: 0.15 },
          { step: `Kết luận n = ${n} điểm`, points: 0.15 },
        ],
        keyFormula: '$N = \\frac{n(n - 1)}{2}$.',
      };
    },
  },
  // VDC 3: Đếm số góc tạo bởi n tia chung gốc
  {
    id: 'T_G6_C6_VDC_03',
    grade: 6,
    semester: 2,
    chapterId: 'G6_C6',
    lesson: 'Góc. Các góc đặc biệt',
    topic: 'Tổ hợp đếm góc tạo bởi các tia chung gốc',
    problemType: 'Số góc tăng thêm khi vẽ thêm k tia',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['cong_thuc_dem_goc_chung_goc', 'giai_phuong_trinh_bac_hai_so_hoc', 'tinh_chenh_lech_so_goc'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 8,
    },
    generate(rng, book) {
      // n = 15 tia chung gốc => 15*14/2 = 105 góc
      // Vẽ thêm k = 3 tia => tổng 18 tia => 18*17/2 = 153 góc
      // Số góc tăng thêm = 153 - 105 = 48 góc
      const n = 15;
      const initialAngles = 105;
      const k = 3;
      const finalAngles = ((n + k) * (n + k - 1)) / 2;
      const diff = finalAngles - initialAngles;
      return {
        grade: 6,
        semester: 2,
        chapterId: 'G6_C6',
        lesson: 'Góc. Các góc đặc biệt',
        topic: 'Tổ hợp đếm góc tạo bởi các tia chung gốc',
        problemType: 'Số góc tăng thêm khi vẽ thêm k tia',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.5,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['cong_thuc_dem_goc_chung_goc', 'giai_phuong_trinh_bac_hai_so_hoc', 'tinh_chenh_lech_so_goc'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 8,
        },
        content: `Cho $n$ tia chung gốc $O$ phân biệt. Biết rằng các tia này tạo thành tất cả $${initialAngles}$ góc. Nếu vẽ thêm $${k}$ tia chung gốc $O$ nữa thì số góc tạo thành sẽ tăng thêm bao nhiêu góc?`,
        correctAnswer: String(diff),
        acceptedAnswers: [String(diff), `${diff} góc`],
        solution: `Bước 1: Công thức tính số góc tạo bởi $n$ tia chung gốc là $S = \\frac{n(n - 1)}{2}$.\\nBước 2: Theo đề bài:\\n$\\frac{n(n - 1)}{2} = ${initialAngles} \\implies n(n - 1) = ${initialAngles * 2} = 210$.\\nBước 3: Ta phân tích $210 = 15 \\cdot 14$ là tích của hai số tự nhiên liên tiếp, suy ra $n = 15$ tia.\\nBước 4: Khi vẽ thêm $${k}$ tia chung gốc nữa, tổng số tia lúc này là:\\n$n' = 15 + ${k} = ${n + k}$ (tia).\\nSố góc tạo thành lúc này là:\\n$S' = \\frac{${n + k} \\cdot (${n + k} - 1)}{2} = \\frac{${n + k} \\cdot ${n + k - 1}}{2} = ${finalAngles}$ (góc).\\nBước 5: Số góc tăng thêm là:\\n$\\Delta S = S' - S = ${finalAngles} - ${initialAngles} = ${diff}$ (góc).\\nVậy số góc tăng thêm là $${diff}$ góc.`,
        rubricSteps: [
          { step: 'Nêu công thức tính số góc từ n tia: n(n - 1) / 2', points: 0.3 },
          { step: 'Giải phương trình n(n - 1) = 210 tìm ra n = 15 tia', points: 0.3 },
          { step: `Tính tổng số tia mới là 15 + ${k} = ${n + k} tia`, points: 0.3 },
          { step: `Tính số góc mới là ${finalAngles} góc`, points: 0.3 },
          { step: `Tính số góc tăng thêm là ${diff} góc`, points: 0.3 },
        ],
        keyFormula: '$S = \\frac{n(n - 1)}{2}$.',
      };
    },
  },
].filter(Boolean);
