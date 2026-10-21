// ==============================================================================
// MathMaster THCS - Ngân Hàng Câu Hỏi Vận Dụng Cao (VDC) Lớp 8 (GDPT 2018)
// File: src/lib/question-engine/templates/grade8-vdc.ts
// 5 chương x 3 template VDC = 15 template VDC
// Sàn độ khó: VDC >= 5 bước suy luận, liên chuyên đề / biện luận trường hợp, thời gian >= 7 phút
// ==============================================================================

import type { QuestionTemplate } from '../types';
import { buildShuffledMcq } from '../template-helpers';

export const grade8VdcTemplates: QuestionTemplate[] = [
  // ============================================================================
  // CHƯƠNG 1: ĐA THỨC NHIỀU BIẾN (G8_C1)
  // ============================================================================
  {
    id: 'T_G8_C1_VDC_01',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Phân tích đa thức thành nhân tử',
    topic: 'Cực trị biểu thức nhiều biến',
    problemType: 'Tìm GTNN của tam thức hai biến bằng tổng bình phương',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['tach_hang_dang_thuc_hai_bien', 'tong_binh_phuong', 'tim_cuc_tri_da_bien'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const a = rng.nextInt(2, 4); // x - y
      const b = rng.nextInt(1, 3); // y - b
      const c = rng.nextInt(5, 10); // hằng số
      // A = (x - y)^2 + (y - b)^2 + c = x^2 - 2xy + y^2 + y^2 - 2by + b^2 + c = x^2 - 2xy + 2y^2 - 2by + (b^2 + c)
      const b2c = b * b + c;
      const minVal = c;
      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Phân tích đa thức thành nhân tử',
        topic: 'Cực trị biểu thức nhiều biến',
        problemType: 'Tìm GTNN của tam thức hai biến bằng tổng bình phương',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['tach_hang_dang_thuc_hai_bien', 'tong_binh_phuong', 'tim_cuc_tri_da_bien'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Tìm giá trị nhỏ nhất của biểu thức hai biến: $A = x^2 - 2xy + 2y^2 - ${2 * b}y + ${b2c}$ với mọi $x, y \\in \\mathbb{R}$.`,
        correctAnswer: String(minVal),
        acceptedAnswers: [String(minVal), `A_min = ${minVal}`, `${minVal}`],
        solution: `Bước 1: Tách hạng tử $2y^2 = y^2 + y^2$.\\nBước 2: Nhóm thành hai bình phương hoàn chỉnh: $A = (x^2 - 2xy + y^2) + (y^2 - ${2 * b}y + ${b * b}) + ${c}$.\\nBước 3: Thu gọn về dạng: $A = (x - y)^2 + (y - ${b})^2 + ${c}$.\\nBước 4: Nhận xét rằng $(x - y)^2 \\ge 0$ và $(y - ${b})^2 \\ge 0$ với mọi $x, y$, suy ra $A \\ge ${c}$.\\nBước 5: Dấu đẳng thức xảy ra khi $y = ${b}$ và $x = y = ${b}$. Vậy giá trị nhỏ nhất của $A$ là $${c}$.`,
        rubricSteps: [
          { step: 'Tách hạng tử y^2 phù hợp để tạo hai bình phương', points: 0.2 },
          { step: 'Nhóm các hạng tử thành hằng đẳng thức (x - y)^2', points: 0.2 },
          { step: `Nhóm hằng đẳng thức thứ hai (y - ${b})^2`, points: 0.2 },
          { step: `Đánh giá tổng hai bình phương luôn không âm suy ra A >= ${c}`, points: 0.2 },
          { step: `Chỉ ra dấu bằng tại x = y = ${b} và kết luận GTNN là ${c}`, points: 0.2 },
        ],
        keyFormula: '$A = (x - y)^2 + (y - b)^2 + c \\ge c$.',
      };
    },
  },

  {
    id: 'T_G8_C1_VDC_02',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Hằng đẳng thức đáng nhớ',
    topic: 'Hằng đẳng thức ba biến đối xứng',
    problemType: 'Tính giá trị biểu thức khi tổng ba biến bằng không',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['hang_dang_thuc_ba_bien', 'dieu_kien_tong_bang_khong', 'rut_gon_bieu_thuc_doi_xung'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const k = rng.nextInt(2, 5);
      // a + b + c = 0 => a^3 + b^3 + c^3 = 3abc
      // P = (k * (a^3 + b^3 + c^3)) / (abc) = 3k
      const ans = 3 * k;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$P = ${ans}$`,
        [
          { text: `$P = ${k}$`, errorType: 'QUÊN_HỆ_SỐ_3' },
          { text: '$P = 0$', errorType: 'CHO_RẰNG_TỬ_SỐ_BẰNG_0' },
          { text: `$P = ${ans + 3}$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Hằng đẳng thức đáng nhớ',
        topic: 'Hằng đẳng thức ba biến đối xứng',
        problemType: 'Tính giá trị biểu thức khi tổng ba biến bằng không',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['hang_dang_thuc_ba_bien', 'dieu_kien_tong_bang_khong', 'rut_gon_bieu_thuc_doi_xung'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Cho ba số thực $a, b, c$ đôi một khác nhau và khác 0 thỏa mãn $a + b + c = 0$. Tính giá trị của biểu thức: $P = \\frac{${k}(a^3 + b^3 + c^3)}{abc}$.`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Từ $a + b + c = 0 \\implies c = -(a + b)$.\\nBước 2: Thay vào tổng lập phương: $a^3 + b^3 + c^3 = a^3 + b^3 - (a + b)^3$.\\nBước 3: Khai triển hằng đẳng thức: $(a + b)^3 = a^3 + b^3 + 3ab(a + b)$.\\nBước 4: Do đó $a^3 + b^3 - (a + b)^3 = -3ab(a + b) = -3ab(-c) = 3abc$.\\nBước 5: Thay vào biểu thức $P$: $P = \\frac{${k} \\cdot 3abc}{abc} = 3 \\cdot ${k} = ${ans}$.`,
        rubricSteps: [
          { step: 'Rút c = -(a + b) từ điều kiện tổng bằng 0', points: 0.2 },
          { step: 'Thay c vào biểu thức a^3 + b^3 + c^3', points: 0.2 },
          { step: 'Khai triển hằng đẳng thức lập phương của một tổng', points: 0.2 },
          { step: 'Chứng minh đẳng thức a^3 + b^3 + c^3 = 3abc', points: 0.2 },
          { step: `Rút gọn và tính ra P = ${ans}`, points: 0.2 },
        ],
        keyFormula: '$a + b + c = 0 \\implies a^3 + b^3 + c^3 = 3abc$.',
      };
    },
  },

  {
    id: 'T_G8_C1_VDC_03',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C1',
    lesson: 'Đơn thức và Đa thức nhiều biến',
    topic: 'Mô hình hóa chi phí vật liệu hộp',
    problemType: 'Diện tích toàn phần và chi phí làm hộp không nắp',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'da_thuc_ba_bien', 'dien_tich_be_mat_hop'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const x = rng.nextInt(4, 7); // dài dm
      const y = rng.nextInt(3, 5); // rộng dm
      const z = 2; // cao dm
      // Hộp không có nắp: S = xy + 2xz + 2yz
      const sBottom = x * y;
      const sSide = 2 * x * z + 2 * y * z;
      const totalS = sBottom + sSide; // dm2
      const unitPrice = 15; // nghìn đồng/dm2
      const totalCost = totalS * unitPrice;
      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C1',
        lesson: 'Đơn thức và Đa thức nhiều biến',
        topic: 'Mô hình hóa chi phí vật liệu hộp',
        problemType: 'Diện tích toàn phần và chi phí làm hộp không nắp',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'da_thuc_ba_bien', 'dien_tich_be_mat_hop'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Một chiếc thùng tôn không nắp dạng hình hộp chữ nhật có đáy kích thước dài $${x}\\text{ dm}$, rộng $${y}\\text{ dm}$ và chiều cao $2\\text{ dm}$. Giá tôn làm đáy và thành bên là $15$ nghìn đồng/$\\text{dm}^2$. Tính tổng diện tích tôn làm thùng và chi phí vật liệu tương ứng.`,
        correctAnswer: String(totalCost),
        acceptedAnswers: [String(totalCost), `${totalCost} nghin dong`, `${totalCost} nghìn đồng`],
        solution: `Bước 1: Diện tích đáy của thùng (không có nắp nên chỉ tính 1 đáy): $S_{đáy} = ${x} \\cdot ${y} = ${sBottom}\\text{ dm}^2$.\\nBước 2: Diện tích 4 mặt xung quanh của thùng là: $S_{xq} = 2(${x} + ${y}) \\cdot 2 = ${sSide}\\text{ dm}^2$.\\nBước 3: Tổng diện tích tôn cần dùng là: $S = S_{đáy} + S_{xq} = ${sBottom} + ${sSide} = ${totalS}\\text{ dm}^2$.\\nBước 4: Chi phí tiền tôn là: $T = ${totalS} \\cdot 15 = ${totalCost}$ (nghìn đồng).\\nBước 5: Kết luận chi phí là ${totalCost} nghìn đồng.`,
        rubricSteps: [
          { step: `Tính diện tích một đáy S = ${sBottom} dm2`, points: 0.2 },
          { step: `Tính diện tích xung quanh S = ${sSide} dm2`, points: 0.2 },
          { step: `Tính tổng diện tích tôn là ${totalS} dm2`, points: 0.2 },
          { step: `Nhân đơn giá tính ra tổng chi phí ${totalCost} nghìn đồng`, points: 0.2 },
          { step: 'Kết luận đáp án chính xác', points: 0.2 },
        ],
        keyFormula: '$S = xy + 2xz + 2yz$. Chi phí $= S \\times \\text{Đơn giá}$.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 2: HẰNG ĐẲNG THỨC VÀ PHÂN THỨC ĐẠI SỐ (G8_C2)
  // ============================================================================
  {
    id: 'T_G8_C2_VDC_01',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Phân thức đại số',
    topic: 'Tìm x nguyên để phân thức nhận giá trị nguyên',
    problemType: 'Phân tích phân thức tách phần nguyên tìm nghiệm nguyên',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['tach_phan_nguyen_phan_thuc', 'uoc_cua_so_nguyen', 'giai_nghiem_nguyen'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      const a = rng.nextInt(2, 4);
      // P = (2x + 1) / (x - a) = (2(x - a) + 2a + 1) / (x - a) = 2 + (2a + 1)/(x - a)
      const num = 2 * a + 1;
      // Số ước nguyên của num: ví dụ nếu a=2 -> num=5 (có 4 ước +-1, +-5) -> 4 giá trị của x
      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Phân thức đại số',
        topic: 'Tìm x nguyên để phân thức nhận giá trị nguyên',
        problemType: 'Phân tích phân thức tách phần nguyên tìm nghiệm nguyên',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['tach_phan_nguyen_phan_thuc', 'uoc_cua_so_nguyen', 'giai_nghiem_nguyen'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: `Tìm tất cả các số nguyên $x$ để phân thức $P = \\frac{2x + 1}{x - ${a}}$ nhận giá trị là một số nguyên.`,
        correctAnswer: '4',
        acceptedAnswers: ['4', '4 gia tri', '4 giá trị'],
        solution: `Bước 1: Điều kiện xác định: $x \\neq ${a}$.\\nBước 2: Tách phân thức thành phần nguyên và phân thức dư:\\n$P = \\frac{2(x - ${a}) + ${num}}{x - ${a}} = 2 + \\frac{${num}}{x - ${a}}$.\\nBước 3: Để $P \\in \\mathbb{Z}$ với $x \\in \\mathbb{Z}$ thì $(x - ${a})$ phải là ước của $${num}$.\\nBước 4: Các ước nguyên của $${num}$ là $\\pm 1, \\pm ${num}$. Có tất cả 4 ước.\\nBước 5: Với mỗi ước, ta tìm được một giá trị $x \\in \\mathbb{Z}$ tương ứng (đều khác $${a}$). Vậy có đúng 4 giá trị nguyên của $x$.`,
        rubricSteps: [
          { step: `Nêu điều kiện xác định x khác ${a}`, points: 0.2 },
          { step: `Tách phân thức thành P = 2 + ${num}/(x - ${a})`, points: 0.2 },
          { step: `Lập luận để P nguyên thì x - ${a} là ước của ${num}`, points: 0.2 },
          { step: `Liệt kê đủ 4 ước nguyên của ${num}`, points: 0.2 },
          { step: 'Đối chiếu điều kiện và kết luận có 4 giá trị', points: 0.2 },
        ],
        keyFormula: '$\\frac{A(x)}{B(x)} = Q(x) + \\frac{R}{B(x)} \\implies B(x) \\mid R$.',
      };
    },
  },

  {
    id: 'T_G8_C2_VDC_02',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Phép cộng và phép trừ phân thức đại số',
    topic: 'Cực trị phân thức đại số',
    problemType: 'Tìm giá trị lớn nhất của phân thức bậc hai ở mẫu',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['bien_doi_tam_thuc_bac_hai', 'cuc_tri_phan_thuc', 'nghich_dao_danh_gia'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const k = rng.nextInt(2, 5);
      const m = rng.nextInt(2, 4);
      // P = k / (x^2 + 2x + m + 1) = k / ((x+1)^2 + m) => max = k/m
      // Chọn k chia hết cho m hoặc phân số đẹp
      const numerator = k * m;
      const maxVal = k;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$P_{\\max} = ${maxVal}$`,
        [
          { text: `$P_{\\max} = ${maxVal + 1}$`, errorType: 'TÍNH_SAI_CỰC_TRỊ_MẪU' },
          { text: '$P_{\\max} = 0$', errorType: 'NHẦM_VỚI_TIỆM_CẬN' },
          { text: `$P_{\\max} = ${numerator}$`, errorType: 'CHO_MẪU_BẰNG_1' },
        ]
      );
      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Phép cộng và phép trừ phân thức đại số',
        topic: 'Cực trị phân thức đại số',
        problemType: 'Tìm giá trị lớn nhất của phân thức bậc hai ở mẫu',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['bien_doi_tam_thuc_bac_hai', 'cuc_tri_phan_thuc', 'nghich_dao_danh_gia'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Giá trị lớn nhất của phân thức $P = \\frac{${numerator}}{x^2 + 2x + ${m + 1}}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Biến đổi tam thức bậc hai ở mẫu: $M = x^2 + 2x + ${m + 1} = (x^2 + 2x + 1) + ${m}$.\\nBước 2: Thu gọn về bình phương: $M = (x + 1)^2 + ${m}$.\\nBước 3: Nhận xét rằng $(x + 1)^2 \\ge 0 \\implies M \\ge ${m} > 0$ với mọi $x$.\\nBước 4: Vì tử số $${numerator} > 0$ là hằng số, nên phân thức $P$ đạt giá trị lớn nhất khi mẫu số $M$ đạt giá trị nhỏ nhất: $P \\le \\frac{${numerator}}{${m}} = ${maxVal}$.\\nBước 5: Dấu đẳng thức xảy ra khi $x + 1 = 0 \\iff x = -1$. Vậy $P_{\\max} = ${maxVal}$.`,
        rubricSteps: [
          { step: `Tách mẫu số thành (x + 1)^2 + ${m}`, points: 0.2 },
          { step: `Đánh giá mẫu số M >= ${m} > 0 với mọi x`, points: 0.2 },
          { step: 'Lập luận tử dương nên phân thức đạt max khi mẫu đạt min', points: 0.2 },
          { step: `Tính giá trị cực đại P_max = ${numerator}/${m} = ${maxVal}`, points: 0.2 },
          { step: 'Chỉ ra dấu bằng tại x = -1 và kết luận', points: 0.2 },
        ],
        keyFormula: '$P = \\frac{k}{M(x)}$ ($k > 0$). $P$ max $\\iff M(x)$ min.',
      };
    },
  },

  {
    id: 'T_G8_C2_VDC_03',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C2',
    lesson: 'Phép nhân và phép chia phân thức đại số',
    topic: 'Bài toán năng suất hai vòi nước',
    problemType: 'Bài toán hai vòi nước cùng chảy mô hình hóa phân thức',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'phan_thuc_nang_suat', 'phuong_trinh_phan_thuc'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // Vòi 1 một mình chảy đầy bể trong x giờ. Vòi 2 trong x + 3 giờ.
      // Cả hai vòi cùng chảy đầy bể trong 2 giờ.
      // 1/x + 1/(x+3) = 1/2 => 2(2x+3) = x(x+3) => 4x + 6 = x^2 + 3x => x^2 - x - 6 = 0 => (x-3)(x+2) = 0 => x = 3 giờ.
      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C2',
        lesson: 'Phép nhân và phép chia phân thức đại số',
        topic: 'Bài toán năng suất hai vòi nước',
        problemType: 'Bài toán hai vòi nước cùng chảy mô hình hóa phân thức',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'phan_thuc_nang_suat', 'phuong_trinh_phan_thuc'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Hai vòi nước cùng chảy vào một bể cạn thì sau $2$ giờ đầy bể. Nếu chảy riêng thì vòi thứ nhất chảy đầy bể nhanh hơn vòi thứ hai là $3$ giờ. Hỏi nếu chảy riêng một mình, vòi thứ nhất mất bao nhiêu giờ để đầy bể?',
        correctAnswer: '3',
        acceptedAnswers: ['3', '3 gio', '3 giờ'],
        solution: 'Bước 1: Gọi thời gian vòi thứ nhất chảy một mình đầy bể là $x$ (giờ, $x > 2$). Thời gian vòi thứ hai chảy một mình là $x + 3$ (giờ).\nBước 2: Trong 1 giờ, vòi 1 chảy được $\\frac{1}{x}$ bể, vòi 2 chảy được $\\frac{1}{x + 3}$ bể.\nBước 3: Cả hai vòi chảy trong 1 giờ được $\\frac{1}{2}$ bể. Ta có phương trình: $\\frac{1}{x} + \\frac{1}{x + 3} = \\frac{1}{2}$.\nBước 4: Quy đồng và khử mẫu: $2(2x + 3) = x(x + 3) \iff 4x + 6 = x^2 + 3x \iff x^2 - x - 6 = 0$.\nBước 5: Phân tích thành nhân tử: $(x - 3)(x + 2) = 0$. Vì $x > 2$ nên $x = 3$. Vậy vòi thứ nhất mất 3 giờ.',
        rubricSteps: [
          { step: 'Gọi ẩn và đặt điều kiện thích hợp x > 2', points: 0.2 },
          { step: 'Lập biểu thức năng suất mỗi vòi trong 1 giờ', points: 0.2 },
          { step: 'Thiết lập phương trình phân thức 1/x + 1/(x+3) = 1/2', points: 0.2 },
          { step: 'Quy đồng khử mẫu đưa về phương trình bậc hai x^2 - x - 6 = 0', points: 0.2 },
          { step: 'Giải tìm x = 3 thỏa mãn điều kiện và kết luận', points: 0.2 },
        ],
        keyFormula: '$\\frac{1}{x} + \\frac{1}{y} = \\frac{1}{t}$.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 3: TỨ GIÁC (G8_C3)
  // ============================================================================
  {
    id: 'T_G8_C3_VDC_01',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Hình vuông',
    topic: 'Chứng minh tam giác vuông cân trong hình vuông',
    problemType: 'Tính góc và độ dài qua tam giác bằng nhau trong hình vuông',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['tinh_chat_hinh_vuong', 'chung_minh_tam_giac_bang_nhau', 'goc_vuong_can'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      const a = rng.nextInt(4, 8); // cạnh hình vuông
      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Hình vuông',
        topic: 'Chứng minh tam giác vuông cân trong hình vuông',
        problemType: 'Tính góc và độ dài qua tam giác bằng nhau trong hình vuông',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['tinh_chat_hinh_vuong', 'chung_minh_tam_giac_bang_nhau', 'goc_vuong_can'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: `Cho hình vuông $ABCD$ cạnh bằng $${a}\\text{ cm}$. Trên cạnh $BC$ lấy điểm $E$, trên cạnh $CD$ lấy điểm $F$ sao cho $BE = DF$. So sánh độ dài hai đoạn thẳng $AE$ và $AF$, và tính số đo góc $\\widehat{EAF}$.`,
        correctAnswer: '90',
        acceptedAnswers: ['90', '90 do', '90 độ', '90^'],
        solution: `Bước 1: Xét $\\Delta ABE$ và $\\Delta ADF$, ta có: $AB = AD$ (cạnh hình vuông), $\\widehat{B} = \\widehat{D} = 90^\\circ$, $BE = DF$ (theo giả thiết).\\nBước 2: Suy ra $\\Delta ABE = \\Delta ADF$ (hai cạnh góc vuông).\\nBước 3: Do đó $AE = AF$ và $\\widehat{BAE} = \\widehat{DAF}$.\\nBước 4: Ta có $\\widehat{BAE} + \\widehat{EAD} = \\widehat{BAD} = 90^\\circ$, suy ra $\\widehat{DAF} + \\widehat{EAD} = 90^\\circ \\iff \\widehat{EAF} = 90^\\circ$.\\nBước 5: Kết luận $\\Delta AEF$ là tam giác vuông cân tại $A$ và số đo góc $\\widehat{EAF} = 90^\\circ$.`,
        rubricSteps: [
          { step: 'Chứng minh hai tam giác vuông ABE và ADF bằng nhau', points: 0.2 },
          { step: 'Suy ra AE = AF', points: 0.2 },
          { step: 'Suy ra góc BAE = góc DAF', points: 0.2 },
          { step: 'Sử dụng tổng góc BAD = 90 độ chứng minh góc EAF = 90 độ', points: 0.2 },
          { step: 'Kết luận góc EAF = 90 độ', points: 0.2 },
        ],
        keyFormula: 'Hình vuông: các cạnh bằng nhau và 4 góc vuông.',
      };
    },
  },

  {
    id: 'T_G8_C3_VDC_02',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Hình thoi và Hình chữ nhật',
    topic: 'Tứ giác có các đỉnh là trung điểm',
    problemType: 'Xác định hình dạng tứ giác nối trung điểm các cạnh',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['duong_trung_binh_tam_giac', 'hai_duong_cheo_vuong_goc', 'dau_hieu_hinh_chu_nhat'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Hình chữ nhật',
        [
          { text: 'Hình thoi', errorType: 'NHẦM_VỚI_TỨ_GIÁC_CÓ_HAI_ĐƯỜNG_CHÉO_BẰNG_NHAU' },
          { text: 'Hình vuông', errorType: 'CHƯA_ĐỦ_ĐIỀU_KIỆN_BẰNG_NHAU' },
          { text: 'Hình bình hành không đặc biệt', errorType: 'BỎ_QUA_GÓC_VUÔNG' },
        ]
      );
      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Hình thoi và Hình chữ nhật',
        topic: 'Tứ giác có các đỉnh là trung điểm',
        problemType: 'Xác định hình dạng tứ giác nối trung điểm các cạnh',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['duong_trung_binh_tam_giac', 'hai_duong_cheo_vuong_goc', 'dau_hieu_hinh_chu_nhat'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Cho tứ giác $ABCD$ có hai đường chéo vuông góc với nhau ($AC \\perp BD$). Gọi $M, N, P, Q$ lần lượt là trung điểm của các cạnh $AB, BC, CD, DA$. Tứ giác $MNPQ$ luôn là hình gì?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Bước 1: Trong tam giác $ABC$, $MN$ là đường trung bình nên $MN \parallel AC$ và $MN = \\frac{1}{2} AC$.\nBước 2: Trong tam giác $ADC$, $PQ$ là đường trung bình nên $PQ \parallel AC$ và $PQ = \\frac{1}{2} AC$. Suy ra $MN \parallel PQ$ và $MN = PQ$.\nBước 3: Tứ giác $MNPQ$ có một cặp cạnh đối song song và bằng nhau nên là hình bình hành.\nBước 4: Trong tam giác $ABD$, $MQ$ là đường trung bình nên $MQ \parallel BD$.\nBước 5: Vì $AC \perp BD$ mà $MN \parallel AC$ và $MQ \parallel BD$, suy ra $MN \perp MQ$ (góc $\widehat{NMQ} = 90^\circ$). Hình bình hành có 1 góc vuông là hình chữ nhật.',
        rubricSteps: [
          { step: 'Áp dụng đường trung bình chứng minh MN // AC và MN = 1/2 AC', points: 0.2 },
          { step: 'Chứng minh PQ // AC và PQ = 1/2 AC suy ra MNPQ là hình bình hành', points: 0.2 },
          { step: 'Chứng minh MQ // BD', points: 0.2 },
          { step: 'Từ AC vuông góc BD suy ra MN vuông góc MQ', points: 0.2 },
          { step: 'Kết luận MNPQ là hình chữ nhật', points: 0.2 },
        ],
        keyFormula: 'Tứ giác nối trung điểm của tứ giác có $AC \\perp BD$ là hình chữ nhật.',
      };
    },
  },

  {
    id: 'T_G8_C3_VDC_03',
    grade: 8,
    semester: 1,
    chapterId: 'G8_C3',
    lesson: 'Hình bình hành',
    topic: 'Phân chia diện tích mảnh đất tứ giác',
    problemType: 'Bài toán phân chia mảnh đất hình thang cân thành hai phần bằng nhau',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'dien_tich_hinh_thang', 'duong_trung_binh'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const a = rng.nextInt(6, 10); // đáy nhỏ m
      const b = a + rng.nextInt(4, 8); // đáy lớn m
      const h = 8; // chiều cao m
      const sTrap = ((a + b) * h) / 2;
      const halfS = sTrap / 2;
      return {
        grade: 8,
        semester: 1,
        chapterId: 'G8_C3',
        lesson: 'Hình bình hành',
        topic: 'Phân chia diện tích mảnh đất tứ giác',
        problemType: 'Bài toán phân chia mảnh đất hình thang cân thành hai phần bằng nhau',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'dien_tich_hinh_thang', 'duong_trung_binh'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Một mảnh đất hình thang có hai đáy lần lượt là $${a}\\text{ m}$ và $${b}\\text{ m}$, chiều cao $8\\text{ m}$. Người ta muốn chia đôi mảnh đất thành hai phần có diện tích bằng nhau bởi một đường thẳng đi qua trung điểm của hai đáy. Tính diện tích của mỗi phần đất sau khi chia.`,
        correctAnswer: String(halfS),
        acceptedAnswers: [String(halfS), `${halfS} m2`, `${halfS} mét vuông`],
        solution: `Bước 1: Diện tích toàn bộ mảnh đất hình thang ban đầu là: $S = \\frac{(${a} + ${b}) \\cdot 8}{2} = ${sTrap}\\text{ m}^2$.\\nBước 2: Gọi $M, N$ lần lượt là trung điểm của hai đáy $AB$ và $CD$. Khi đó đoạn thẳng $MN$ chia hình thang thành hai hình thang con: $AMND$ và $BMNC$.\\nBước 3: Chiều cao của hai hình thang con bằng chiều cao hình thang ban đầu ($h = 8\\text{ m}$).\\nBước 4: Tổng hai đáy của mỗi hình thang con là: $AM + DN = \\frac{${a}}{2} + \\frac{${b}}{2} = \\frac{${a} + ${b}}{2}$.\\nBước 5: Do đó diện tích mỗi phần đất là: $S_1 = S_2 = \\frac{S}{2} = ${halfS}\\text{ m}^2$.`,
        rubricSteps: [
          { step: `Tính diện tích toàn bộ hình thang ban đầu là ${sTrap} m2`, points: 0.2 },
          { step: 'Xác định đường thẳng nối trung điểm hai đáy chia thành 2 hình thang con', points: 0.2 },
          { step: 'Chỉ ra hai hình thang con có cùng chiều cao', points: 0.2 },
          { step: 'Chứng minh tổng hai đáy của hai hình thang con bằng nhau', points: 0.2 },
          { step: `Kết luận diện tích mỗi phần là ${halfS} m2`, points: 0.2 },
        ],
        keyFormula: '$S_{\\text{con}} = \\frac{1}{2} S_{\\text{tổng}}$.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 4: ĐỊNH LÍ THALÈS VÀ HÌNH ĐỒNG DẠNG (G8_C4)
  // ============================================================================
  {
    id: 'T_G8_C4_VDC_01',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Định lí Thalès trong tam giác',
    topic: 'Tỉ số diện tích tam giác đồng dạng',
    problemType: 'Tính diện tích tứ giác bằng hiệu diện tích tam giác đồng dạng',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['dinh_li_thales', 'tam_giac_dong_dang', 'ti_so_dien_tich'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const sTotal = rng.nextInt(4, 8) * 25; // diện tích tam giác ABC chia hết cho 25
      // MN // BC cắt AB tại M, AC tại N sao cho AM/AB = 3/5
      // S(AMN) / S(ABC) = (3/5)^2 = 9/25
      const sSmall = (sTotal * 9) / 25;
      const sTrap = sTotal - sSmall; // diện tích tứ giác BMNC
      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Định lí Thalès trong tam giác',
        topic: 'Tỉ số diện tích tam giác đồng dạng',
        problemType: 'Tính diện tích tứ giác bằng hiệu diện tích tam giác đồng dạng',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['dinh_li_thales', 'tam_giac_dong_dang', 'ti_so_dien_tich'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Cho tam giác $ABC$ có diện tích bằng $${sTotal}\\text{ cm}^2$. Trên cạnh $AB$ lấy điểm $M$ sao cho $\\frac{AM}{AB} = \\frac{3}{5}$. Qua $M$ kẻ đường thẳng song song với $BC$ cắt $AC$ tại $N$. Tính diện tích của tứ giác $BMNC$.`,
        correctAnswer: String(sTrap),
        acceptedAnswers: [String(sTrap), `${sTrap} cm2`, `${sTrap}`],
        solution: `Bước 1: Vì $MN \\parallel BC$ nên theo định lí Thalès và tam giác đồng dạng, ta có $\\Delta AMN \\backsim \\Delta ABC$.\\nBước 2: Tỉ số đồng dạng là: $k = \\frac{AM}{AB} = \\frac{3}{5}$.\\nBước 3: Tỉ số diện tích của hai tam giác đồng dạng bằng bình phương tỉ số đồng dạng:\\n$\\frac{S_{AMN}}{S_{ABC}} = k^2 = \\left(\\frac{3}{5}\\right)^2 = \\frac{9}{25}$.\\nBước 4: Diện tích tam giác $AMN$ là: $S_{AMN} = \\frac{9}{25} \\cdot ${sTotal} = ${sSmall}\\text{ cm}^2$.\\nBước 5: Diện tích tứ giác $BMNC$ là: $S_{BMNC} = S_{ABC} - S_{AMN} = ${sTotal} - ${sSmall} = ${sTrap}\\text{ cm}^2$.`,
        rubricSteps: [
          { step: 'Chỉ ra tam giác AMN đồng dạng tam giác ABC do MN // BC', points: 0.2 },
          { step: 'Xác định tỉ số đồng dạng k = 3/5', points: 0.2 },
          { step: 'Áp dụng định lí tỉ số diện tích bằng k^2 = 9/25', points: 0.2 },
          { step: `Tính diện tích tam giác AMN là ${sSmall} cm2`, points: 0.2 },
          { step: `Tính diện tích tứ giác BMNC là ${sTrap} cm2`, points: 0.2 },
        ],
        keyFormula: '$\\frac{S_1}{S_2} = k^2$. $S_{\\text{tứ giác}} = S_{\\text{lớn}} - S_{\\text{nhỏ}}$.',
      };
    },
  },

  {
    id: 'T_G8_C4_VDC_02',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Định lí đường phân giác của tam giác',
    topic: 'Tỉ số đoạn thẳng theo đường phân giác',
    problemType: 'Tính độ dài đoạn thẳng tạo bởi đường phân giác trong tam giác',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['tinh_chat_duong_phan_giac', 'tinh_chat_day_ti_so_bang_nhau', 'tinh_do_dai_hinh_hoc'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const mul = rng.nextInt(2, 4);
      const c = 3 * mul; // AB
      const b = 5 * mul; // AC
      const a = 8 * mul; // BC = 8*mul
      // DB / DC = AB / AC = 3 / 5 => DB = 3*mul, DC = 5*mul
      const db = 3 * mul;
      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Định lí đường phân giác của tam giác',
        topic: 'Tỉ số đoạn thẳng theo đường phân giác',
        problemType: 'Tính độ dài đoạn thẳng tạo bởi đường phân giác trong tam giác',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['tinh_chat_duong_phan_giac', 'tinh_chat_day_ti_so_bang_nhau', 'tinh_do_dai_hinh_hoc'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Cho tam giác $ABC$ có $AB = ${c}\\text{ cm}$, $AC = ${b}\\text{ cm}$ và $BC = ${a}\\text{ cm}$. Đường phân giác của góc $A$ cắt cạnh $BC$ tại điểm $D$. Tính độ dài đoạn thẳng $BD$.`,
        correctAnswer: String(db),
        acceptedAnswers: [String(db), `${db} cm`, `BD = ${db}`],
        solution: `Bước 1: Theo tính chất đường phân giác trong tam giác $ABC$, ta có: $\\frac{DB}{DC} = \\frac{AB}{AC}$.\\nBước 2: Thay số ta được: $\\frac{DB}{DC} = \\frac{${c}}{${b}} = \\frac{3}{5} \\implies \\frac{DB}{3} = \\frac{DC}{5}$.\\nBước 3: Lại có $DB + DC = BC = ${a}\\text{ cm}$.\\nBước 4: Áp dụng tính chất dãy tỉ số bằng nhau: $\\frac{DB}{3} = \\frac{DC}{5} = \\frac{DB + DC}{3 + 5} = \\frac{${a}}{8} = ${mul}$.\\nBước 5: Suy ra độ dài $BD = 3 \\cdot ${mul} = ${db}\\text{ cm}$.`,
        rubricSteps: [
          { step: 'Áp dụng tính chất đường phân giác DB/DC = AB/AC', points: 0.2 },
          { step: 'Rút gọn tỉ số thành DB/3 = DC/5', points: 0.2 },
          { step: 'Lập tổng DB + DC = BC', points: 0.2 },
          { step: 'Áp dụng tính chất dãy tỉ số bằng nhau', points: 0.2 },
          { step: `Tính ra BD = ${db} cm`, points: 0.2 },
        ],
        keyFormula: '$\\frac{DB}{DC} = \\frac{AB}{AC}$.',
      };
    },
  },

  {
    id: 'T_G8_C4_VDC_03',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C4',
    lesson: 'Ứng dụng thực tế của tam giác đồng dạng',
    topic: 'Đo chiều cao vật thể gián tiếp',
    problemType: 'Bài toán đo chiều cao kim tự tháp / tháp hải đăng bằng bóng râm',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'tam_giac_vuong_dong_dang', 'ti_so_dong_dang'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const hStick = 2; // cọc cao 2m
      const sStick = 1.5; // bóng cọc 1.5m
      const sTower = rng.nextInt(18, 30); // bóng tháp m
      // hTower / sTower = hStick / sStick => hTower = sTower * (2 / 1.5) = sTower * 4 / 3
      const hTower = Math.round((sTower * 2 / 1.5) * 10) / 10;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `${hTower}\\text{ m}`,
        [
          { text: `${Math.round(hTower * 1.2 * 10) / 10}\\text{ m}`, errorType: 'TÍNH_SAI_TỈ_LỆ' },
          { text: `${sTower}\\text{ m}`, errorType: 'CHO_BÓNG_BẰNG_CHIỀU_CAO' },
          { text: `${Math.round(sTower * 1.5 / 2 * 10) / 10}\\text{ m}`, errorType: 'NGHỊCH_ĐẢO_TỈ_SỐ' },
        ]
      );
      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C4',
        lesson: 'Ứng dụng thực tế của tam giác đồng dạng',
        topic: 'Đo chiều cao vật thể gián tiếp',
        problemType: 'Bài toán đo chiều cao kim tự tháp / tháp hải đăng bằng bóng râm',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'tam_giac_vuong_dong_dang', 'ti_so_dong_dang'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Để đo chiều cao của một tháp hải đăng, cùng một thời điểm ánh sáng mặt trời chiếu song song, người ta cắm một chiếc cọc cao $2\\text{ m}$ thẳng đứng thì đo được bóng cọc trên mặt đất dài $1{,}5\\text{ m}$, đồng thời bóng của tháp hải đăng trên mặt đất dài $${sTower}\\text{ m}$. Chiều cao của ngọn tháp hải đăng là (làm tròn đến 1 chữ số thập phân):`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Vì các tia nắng mặt trời song song nên góc tạo bởi tia nắng với mặt đất tại hai vị trí là bằng nhau.\\nBước 2: Hai tam giác vuông tạo bởi (tháp - bóng tháp - tia sáng) và (cọc - bóng cọc - tia sáng) đồng dạng với nhau (g-g).\\nBước 3: Lập tỉ số đồng dạng: $\\frac{H_{\\text{tháp}}}{h_{\\text{cọc}}} = \\frac{L_{\\text{bóng tháp}}}{l_{\\text{bóng cọc}}}$.\\nBước 4: Thay số: $\\frac{H}{2} = \\frac{${sTower}}{1{,}5} \\implies H = \\frac{${sTower} \\cdot 2}{1{,}5}$.\\nBước 5: Tính ra: $H \\approx ${hTower}\\text{ m}$.`,
        rubricSteps: [
          { step: 'Nhận xét các tia nắng song song tạo các góc bằng nhau', points: 0.2 },
          { step: 'Chứng minh hai tam giác vuông đồng dạng', points: 0.2 },
          { step: 'Thiết lập tỉ số đồng dạng giữa chiều cao và bóng', points: 0.2 },
          { step: 'Thay số tính toán chiều cao', points: 0.2 },
          { step: `Kết luận chiều cao ngọn tháp xấp xỉ ${hTower} m`, points: 0.2 },
        ],
        keyFormula: '$\\frac{H}{h} = \\frac{L}{l}$.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 5: PHƯƠNG TRÌNH BẬC NHẤT VÀ HÀM SỐ BẬC NHẤT (G8_C5)
  // ============================================================================
  {
    id: 'T_G8_C5_VDC_01',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Giải bài toán bằng cách lập phương trình',
    topic: 'Bài toán chuyển động đường thủy',
    problemType: 'Canô xuôi dòng và ngược dòng có vận tốc dòng nước',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'van_toc_dong_nuoc', 'giai_phuong_trinh_bac_nhat'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // Vận tốc dòng nước v_n = 3 km/h
      // Xuôi dòng mất 3 giờ, ngược dòng mất 4 giờ
      // Quãng đường AB = s: v_xuoi = s/3, v_nguoc = s/4
      // v_xuoi - v_nguoc = 2 * v_n = 6 => s/3 - s/4 = 6 => s/12 = 6 => s = 72 km
      const vWater = rng.nextInt(2, 4); // 2 hoặc 3 km/h
      const tXuoi = 3;
      const tNguoc = 4;
      // s/3 - s/4 = 2 * vWater => s / 12 = 2 * vWater => s = 24 * vWater
      const dist = 24 * vWater;
      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Giải bài toán bằng cách lập phương trình',
        topic: 'Bài toán chuyển động đường thủy',
        problemType: 'Canô xuôi dòng và ngược dòng có vận tốc dòng nước',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'van_toc_dong_nuoc', 'giai_phuong_trinh_bac_nhat'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Một ca nô chạy xuôi dòng từ bến A đến bến B mất $3$ giờ, và chạy ngược dòng từ B về A mất $4$ giờ. Biết vận tốc của dòng nước là $${vWater}\\text{ km/h}$. Tính khoảng cách giữa hai bến A và B.`,
        correctAnswer: String(dist),
        acceptedAnswers: [String(dist), `${dist} km`, `${dist}`],
        solution: `Bước 1: Gọi khoảng cách giữa hai bến A và B là $s$ (km, $s > 0$).\\nBước 2: Vận tốc ca nô khi xuôi dòng là: $v_{\\text{xuôi}} = \\frac{s}{3}$ (km/h). Vận tốc khi ngược dòng là: $v_{\\text{ngược}} = \\frac{s}{4}$ (km/h).\\nBước 3: Hiệu giữa vận tốc xuôi dòng và ngược dòng bằng hai lần vận tốc dòng nước: $v_{\\text{xuôi}} - v_{\\text{ngược}} = 2 \\cdot ${vWater} = ${2 * vWater}\\text{ km/h}$.\\nBước 4: Ta có phương trình: $\\frac{s}{3} - \\frac{s}{4} = ${2 * vWater} \\iff \\frac{s}{12} = ${2 * vWater} \\iff s = ${dist}$ (thỏa mãn điều kiện).\\nBước 5: Kết luận khoảng cách giữa hai bến là ${dist} km.`,
        rubricSteps: [
          { step: 'Gọi ẩn quãng đường s và đặt điều kiện s > 0', points: 0.2 },
          { step: 'Lập biểu thức vận tốc xuôi dòng và ngược dòng', points: 0.2 },
          { step: `Sử dụng quan hệ hiệu hai vận tốc bằng 2 lần vận tốc nước: ${2 * vWater} km/h`, points: 0.2 },
          { step: `Giải phương trình s/3 - s/4 = ${2 * vWater} tìm ra s = ${dist}`, points: 0.2 },
          { step: 'Đối chiếu điều kiện và kết luận đáp số', points: 0.2 },
        ],
        keyFormula: '$v_{\\text{xuôi}} - v_{\\text{ngược}} = 2 v_{\\text{nước}}$.',
      };
    },
  },

  {
    id: 'T_G8_C5_VDC_02',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Phương trình bậc nhất một ẩn',
    topic: 'Phương trình chứa tham số',
    problemType: 'Biện luận nghiệm phương trình bậc nhất có tham số m',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['bien_luan_phuong_trinh_bac_nhat', 'dieu_kien_nghiem_duy_nhat', 'tim_tham_so_m'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      // (m^2 - a^2) x = m - a
      // TH1: m = a => 0x = 0 (vô số nghiệm)
      // TH2: m = -a => 0x = -2a (vô nghiệm)
      // TH3: m != +-a => x = 1/(m + a)
      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Phương trình bậc nhất một ẩn',
        topic: 'Phương trình chứa tham số',
        problemType: 'Biện luận nghiệm phương trình bậc nhất có tham số m',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['bien_luan_phuong_trinh_bac_nhat', 'dieu_kien_nghiem_duy_nhat', 'tim_tham_so_m'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: `Cho phương trình ẩn $x$: $(m^2 - ${a * a})x = m - ${a}$. Tìm giá trị của tham số $m$ để phương trình vô nghiệm.`,
        correctAnswer: String(-a),
        acceptedAnswers: [String(-a), `m = ${-a}`],
        solution: `Bước 1: Phương trình có dạng $Ax = B$ với $A = m^2 - ${a * a} = (m - ${a})(m + ${a})$ và $B = m - ${a}$.\\nBước 2: Phương trình vô nghiệm khi và chỉ khi $A = 0$ và $B \\neq 0$.\\nBước 3: Điều kiện $A = 0 \\iff (m - ${a})(m + ${a}) = 0 \\iff m = ${a}$ hoặc $m = -${a}$.\\nBước 4: Xét $m = ${a}$: khi đó $B = ${a} - ${a} = 0$, phương trình có dạng $0x = 0$ (vô số nghiệm).\\nBước 5: Xét $m = -${a}$: khi đó $B = -${a} - ${a} = ${-2 * a} \\neq 0$, phương trình có dạng $0x = ${-2 * a}$ (vô nghiệm). Vậy giá trị cần tìm là $m = ${-a}$.`,
        rubricSteps: [
          { step: 'Phân tích hệ số A thành (m - a)(m + a)', points: 0.2 },
          { step: 'Nêu điều kiện phương trình Ax = B vô nghiệm là A = 0 và B != 0', points: 0.2 },
          { step: 'Tìm hai giá trị làm A = 0 là m = a hoặc m = -a', points: 0.2 },
          { step: 'Biện luận trường hợp m = a dẫn đến 0x = 0 loại', points: 0.2 },
          { step: `Biện luận trường hợp m = -${a} thỏa mãn và kết luận`, points: 0.2 },
        ],
        keyFormula: '$Ax = B$ vô nghiệm $\\iff A = 0$ và $B \\neq 0$.',
      };
    },
  },

  {
    id: 'T_G8_C5_VDC_03',
    grade: 8,
    semester: 2,
    chapterId: 'G8_C5',
    lesson: 'Hàm số bậc nhất',
    topic: 'So sánh chi phí gói cước viễn thông',
    problemType: 'Bài toán kinh tế tìm điểm hòa vốn giữa hai gói cước',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'ham_so_bac_nhat', 'diem_hoa_von'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // Gói A: cước thuê bao 50k, mỗi phút 1k: y = 50 + x
      // Gói B: cước thuê bao 0k, mỗi phút 1.5k: y = 1.5x
      // 50 + x = 1.5x => 0.5x = 50 => x = 100 phút
      const subA = rng.nextInt(4, 7) * 10; // 40, 50, 60 nghìn
      const rateA = 1;
      const rateB = 1.5;
      const minBreakeven = subA / (rateB - rateA);
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `${minBreakeven} phút`,
        [
          { text: `${minBreakeven + 20} phút`, errorType: 'TÍNH_SAI_HIỆU_CƯỚC' },
          { text: `${subA} phút`, errorType: 'CHỈ_LẤY_CƯỚC_THUÊ_BAO' },
          { text: `${minBreakeven - 15} phút`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 8,
        semester: 2,
        chapterId: 'G8_C5',
        lesson: 'Hàm số bậc nhất',
        topic: 'So sánh chi phí gói cước viễn thông',
        problemType: 'Bài toán kinh tế tìm điểm hòa vốn giữa hai gói cước',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'ham_so_bac_nhat', 'diem_hoa_von'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Một công ty viễn thông đưa ra hai gói cước gọi điện thoại: Gói A có cước thuê bao tháng là $${subA}$ nghìn đồng và cước gọi là $1$ nghìn đồng/phút; Gói B không có cước thuê bao nhưng cước gọi là $1{,}5$ nghìn đồng/phút. Một người gọi bao nhiêu phút trong tháng thì số tiền phải trả ở hai gói cước là như nhau?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Gọi số phút gọi trong tháng là $x$ ($x > 0$).\\nBước 2: Số tiền phải trả theo gói A là hàm số: $y_A = ${subA} + x$ (nghìn đồng).\\nBước 3: Số tiền phải trả theo gói B là hàm số: $y_B = 1{,}5x$ (nghìn đồng).\\nBước 4: Để số tiền hai gói bằng nhau, ta có phương trình: $${subA} + x = 1{,}5x \\iff 0{,}5x = ${subA} \\iff x = ${minBreakeven}$.\\nBước 5: Kết luận gọi ${minBreakeven} phút thì số tiền phải trả ở hai gói là như nhau.`,
        rubricSteps: [
          { step: 'Gọi ẩn thời gian gọi là x > 0', points: 0.2 },
          { step: 'Lập hàm số chi phí gói A', points: 0.2 },
          { step: 'Lập hàm số chi phí gói B', points: 0.2 },
          { step: `Giải phương trình cân bằng chi phí tìm x = ${minBreakeven}`, points: 0.2 },
          { step: 'Kết luận đáp số đúng', points: 0.2 },
        ],
        keyFormula: '$y_A = y_B \\implies a_1 x + b_1 = a_2 x + b_2$.',
      };
    },
  },
];
