// ==============================================================================
// MathMaster THCS - Ngân Hàng Câu Hỏi Vận Dụng Cao (VDC) Lớp 7 (GDPT 2018)
// File: src/lib/question-engine/templates/grade7-vdc.ts
// 6 chương x 3 template VDC = 18 template VDC
// Sàn độ khó: VDC >= 5 bước suy luận, liên chuyên đề / biện luận trường hợp, thời gian >= 7 phút
// ==============================================================================

import type { QuestionTemplate } from '../types';
import { buildShuffledMcq } from '../template-helpers';

export const grade7VdcTemplates: QuestionTemplate[] = [
  // ============================================================================
  // CHƯƠNG 1: SỐ HỮU TỈ (G7_C1)
  // ============================================================================
  {
    id: 'T_G7_C1_VDC_01',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Lũy thừa của một số hữu tỉ',
    topic: 'Tổng dãy lũy thừa và tính chia hết',
    problemType: 'Thu gọn tổng lũy thừa và tìm số mũ',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['nhan_he_so_tong_luy_thua', 'triet_tieu_sai_phan', 'bien_doi_luy_thua_nang_cao'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const base = rng.nextInt(2, 4);
      const n = rng.nextInt(40, 80);
      const exp = n + 1;
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Lũy thừa của một số hữu tỉ',
        topic: 'Tổng dãy lũy thừa và tính chia hết',
        problemType: 'Thu gọn tổng lũy thừa và tìm số mũ',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['nhan_he_so_tong_luy_thua', 'triet_tieu_sai_phan', 'bien_doi_luy_thua_nang_cao'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Cho biểu thức $S = 1 + ${base} + ${base}^2 + ${base}^3 + \\\\dots + ${base}^{${n}}$. Tìm số tự nhiên $x$ thỏa mãn: $${base - 1}S + 1 = ${base}^x$.`,
        correctAnswer: String(exp),
        acceptedAnswers: [String(exp), `x = ${exp}`],
        solution: `Bước 1: Nhân cả hai vế với \$${base}\$: $${base}S = ${base} + ${base}^2 + \\\\dots + ${base}^{${n + 1}}$.\\\\nBước 2: Lấy \$${base}S - S\$ theo từng vế.\\\\nBước 3: Triệt tiêu các số hạng ở giữa được $(${base} - 1)S = ${base}^{${exp}} - 1$.\\\\nBước 4: Chuyển vế được $(${base} - 1)S + 1 = ${base}^{${exp}}$.\\\\nBước 5: So sánh với đề bài suy ra $x = ${exp}$.`,
        rubricSteps: [
          { step: `Nhân cả hai vế với ${base}`, points: 0.2 },
          { step: 'Lấy hiệu hai vế để triệt tiêu trung gian', points: 0.2 },
          { step: `Thu gọn được (${base} - 1)S = ${base}^${exp} - 1`, points: 0.2 },
          { step: `Chuyển vế thành (${base} - 1)S + 1 = ${base}^${exp}`, points: 0.2 },
          { step: `Kết luận x = ${exp}`, points: 0.2 },
        ],
        keyFormula: '$(q - 1)S = q^{n+1} - 1$.',
      };
    },
  },

  {
    id: 'T_G7_C1_VDC_02',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Lũy thừa của một số hữu tỉ',
    topic: 'Phương trình nghiệm hữu tỉ',
    problemType: 'Tổng các lũy thừa bậc chẵn bằng không',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['danh_gia_luy_thua_bac_chan', 'he_hai_dieu_kien_dong_thoi', 'tim_cap_nghiem'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      const a = rng.nextInt(2, 5);
      const b = rng.nextInt(1, 4);
      const c = rng.nextInt(2, 4);
      const d = rng.nextInt(3, 7);
      const resVal = b - d;
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Lũy thừa của một số hữu tỉ',
        topic: 'Phương trình nghiệm hữu tỉ',
        problemType: 'Tổng các lũy thừa bậc chẵn bằng không',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['danh_gia_luy_thua_bac_chan', 'he_hai_dieu_kien_dong_thoi', 'tim_cap_nghiem'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: `Tìm các số hữu tỉ $x, y$ thỏa mãn: $(${a}x - ${b})^2 + (${c}y + ${d})^4 \\\\le 0$, rồi tính $M = ${a}x + ${c}y$.`,
        correctAnswer: String(resVal),
        acceptedAnswers: [String(resVal), `M = ${resVal}`],
        solution: `Bước 1: Ta có $(${a}x - ${b})^2 \\\\ge 0$ và $(${c}y + ${d})^4 \\\\ge 0$ với mọi $x, y$.\\\\nBước 2: Suy ra $(${a}x - ${b})^2 + (${c}y + ${d})^4 \\\\ge 0$.\\\\nBước 3: Do đó bất đẳng thức chỉ xảy ra khi đồng thời bằng 0.\\\\nBước 4: Ta có $${a}x = ${b}$ và $${c}y = -${d}$.\\\\nBước 5: Vậy $M = ${a}x + ${c}y = ${b} - ${d} = ${resVal}$.`,
        rubricSteps: [
          { step: 'Đánh giá bình phương và lũy thừa bậc 4 luôn >= 0', points: 0.2 },
          { step: 'Biện luận dấu bằng xảy ra đồng thời', points: 0.2 },
          { step: 'Giải tìm ax = b', points: 0.2 },
          { step: 'Giải tìm cy = -d', points: 0.2 },
          { step: `Tính M = ${resVal}`, points: 0.2 },
        ],
        keyFormula: '$A^2 + B^4 \\\\le 0 \\\\iff A = 0 \\\\text{ và } B = 0$.',
      };
    },
  },

  {
    id: 'T_G7_C1_VDC_03',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C1',
    lesson: 'Cộng, trừ, nhân, chia số hữu tỉ',
    topic: 'Mô hình tài chính thực tế',
    problemType: 'Bài toán lãi kép gửi tiết kiệm 2 năm',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'lai_suat_cong_don', 'phan_tram_so_huu_ti'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const p = rng.nextInt(50, 100);
      const year1 = p * 1.06;
      const year2 = Math.round(year1 * 1.07 * 100) / 100;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `${year2} triệu đồng`,
        [
          { text: `${Math.round(p * 1.13 * 100) / 100} triệu đồng`, errorType: 'TÍNH_LÃI_ĐƠN' },
          { text: `${Math.round(year1 * 100) / 100} triệu đồng`, errorType: 'CHỈ_TÍNH_NĂM_1' },
          { text: `${Math.round((year2 - p) * 100) / 100} triệu đồng`, errorType: 'NHẦM_TIỀN_LÃI_VỚI_TỔNG' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C1',
        lesson: 'Cộng, trừ, nhân, chia số hữu tỉ',
        topic: 'Mô hình tài chính thực tế',
        problemType: 'Bài toán lãi kép gửi tiết kiệm 2 năm',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'lai_suat_cong_don', 'phan_tram_so_huu_ti'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Bác An gửi ${p} triệu đồng với lãi suất $6\\\\%/\\\\text{năm}$. Hết năm 1 tiền lãi nhập gốc và gửi tiếp năm 2 với lãi suất $7\\\\%/\\\\text{năm}$. Sau 2 năm bác nhận được:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Lãi năm 1 là: $${p} \\\\cdot 6\\\\% = ${p * 0.06}$ triệu.\\\\nBước 2: Tiền sau năm 1 là: $${p} + ${p * 0.06} = ${year1}$ triệu.\\\\nBước 3: Lãi năm 2 tính trên gốc mới là: $${year1} \\\\cdot 7\\\\% = ${Math.round(year1 * 0.07 * 100) / 100}$ triệu.\\\\nBước 4: Tổng tiền sau 2 năm là: $${year1} \\\\cdot 1{,}07 = ${year2}$ triệu.\\\\nBước 5: Kết luận số tiền là ${year2} triệu đồng.`,
        rubricSteps: [
          { step: 'Tính lãi năm thứ nhất', points: 0.2 },
          { step: 'Tính tổng tiền gốc và lãi năm thứ nhất', points: 0.2 },
          { step: 'Tính tiền lãi năm thứ hai', points: 0.2 },
          { step: 'Tính tổng tiền sau 2 năm', points: 0.2 },
          { step: 'Kết luận đáp án chính xác', points: 0.2 },
        ],
        keyFormula: '$T = P(1 + r_1)(1 + r_2)$.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 2: SỐ THỰC VÀ TỈ LỆ THỨC (G7_C2)
  // ============================================================================
  {
    id: 'T_G7_C2_VDC_01',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Tính chất của dãy tỉ số bằng nhau',
    topic: 'Dãy tỉ số bằng nhau bậc hai',
    problemType: 'Tìm x, y, z thỏa mãn dãy tỉ số và phương trình bậc hai',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['phuong_phap_dat_k', 'bien_luan_hai_truong_hop_dau', 'giai_he_ti_le_thuc'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      const k = rng.nextInt(2, 4);
      // x/2 = y/3 = z/4 = k
      // 2x^2 + y^2 - z^2 = 2(4k^2) + 9k^2 - 16k^2 = k^2
      const rhs = k * k;
      const xPos = 2 * k;
      const yPos = 3 * k;
      const zPos = 4 * k;
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Tính chất của dãy tỉ số bằng nhau',
        topic: 'Dãy tỉ số bằng nhau bậc hai',
        problemType: 'Tìm x, y, z thỏa mãn dãy tỉ số và phương trình bậc hai',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['phuong_phap_dat_k', 'bien_luan_hai_truong_hop_dau', 'giai_he_ti_le_thuc'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: `Cho $\\\\frac{x}{2} = \\\\frac{y}{3} = \\\\frac{z}{4}$ và $2x^2 + y^2 - z^2 = ${rhs}$. Tìm giá trị lớn nhất của tổng $x + y + z$.`,
        correctAnswer: String(9 * k),
        acceptedAnswers: [String(9 * k), `${9 * k}`],
        solution: `Bước 1: Đặt $\\\\frac{x}{2} = \\\\frac{y}{3} = \\\\frac{z}{4} = t \\\\implies x = 2t, y = 3t, z = 4t$.\\\\nBước 2: Thay vào phương trình: $2(2t)^2 + (3t)^2 - (4t)^2 = ${rhs} \\\\iff 8t^2 + 9t^2 - 16t^2 = ${rhs}$.\\\\nBước 3: Thu gọn được $t^2 = ${rhs} \\\\implies t = ${k}$ hoặc $t = -${k}$.\\\\nBước 4: TH1: $t = ${k} \\\\implies x + y + z = 9t = ${9 * k}$.\\\\nTH2: $t = -${k} \\\\implies x + y + z = -${9 * k}$.\\\\nBước 5: Giá trị lớn nhất của tổng là $${9 * k}$.`,
        rubricSteps: [
          { step: 'Đặt ẩn phụ t biểu diễn x, y, z theo t', points: 0.2 },
          { step: 'Thay vào phương trình bậc hai và thu gọn', points: 0.2 },
          { step: `Giải ra hai giá trị t = +-${k}`, points: 0.2 },
          { step: 'Tính tổng x + y + z cho cả hai trường hợp', points: 0.2 },
          { step: `Kết luận giá trị lớn nhất là ${9 * k}`, points: 0.2 },
        ],
        keyFormula: '$t^2 = a \\\\implies t = \\\\pm \\\\sqrt{a}$.',
      };
    },
  },

  {
    id: 'T_G7_C2_VDC_02',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Giá trị tuyệt đối của một số thực',
    topic: 'Cực trị tổng trị tuyệt đối',
    problemType: 'Tìm GTNN của tổng 3 giá trị tuyệt đối',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['bat_dang_thuc_gia_tri_tuyet_doi', 'phan_tich_diem_can_bang', 'cuc_tri_ham_so'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      const a = rng.nextInt(1, 4);
      const b = a + rng.nextInt(3, 6);
      const c = b + rng.nextInt(3, 6);
      // P = |x - a| + |x - b| + |x - c|
      // |x - a| + |c - x| >= c - a. Dấu bằng khi a <= x <= c.
      // Khi đó |x - b| đạt min = 0 khi x = b.
      // min = c - a.
      const minVal = c - a;
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Giá trị tuyệt đối của một số thực',
        topic: 'Cực trị tổng trị tuyệt đối',
        problemType: 'Tìm GTNN của tổng 3 giá trị tuyệt đối',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['bat_dang_thuc_gia_tri_tuyet_doi', 'phan_tich_diem_can_bang', 'cuc_tri_ham_so'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: `Tìm giá trị nhỏ nhất của biểu thức $P = |x - ${a}| + |x - ${b}| + |x - ${c}|$ với $x \\\\in \\\\mathbb{R}$.`,
        correctAnswer: String(minVal),
        acceptedAnswers: [String(minVal), `P_min = ${minVal}`, `${minVal}`],
        solution: `Bước 1: Ta nhóm hai số hạng đầu và cuối: $|x - ${a}| + |x - ${c}| = |x - ${a}| + |${c} - x|$.\\\\nBước 2: Áp dụng BĐT $|A| + |B| \\\\ge |A + B|$, ta có: $|x - ${a}| + |${c} - x| \\\\ge |x - ${a} + ${c} - x| = ${c - a}$.\\\\nBước 3: Lại có $|x - ${b}| \\\\ge 0$ với mọi $x$.\\\\nBước 4: Do đó $P \\\\ge ${c - a} + 0 = ${minVal}$.\\\\nBước 5: Dấu bằng xảy ra khi $(x - ${a})(${c} - x) \\\\ge 0$ và $x - ${b} = 0 \\\\iff x = ${b}$. Vì $${a} \\\\le ${b} \\\\le ${c}$ nên đẳng thức thỏa mãn. Vậy giá trị nhỏ nhất là $${minVal}$.`,
        rubricSteps: [
          { step: 'Đổi dấu |x - c| thành |c - x|', points: 0.2 },
          { step: `Áp dụng BĐT trị tuyệt đối đánh giá hai đầu mút ra ${c - a}`, points: 0.2 },
          { step: 'Đánh giá số hạng ở giữa |x - b| >= 0', points: 0.2 },
          { step: 'Chỉ ra dấu bằng xảy ra tại x = b', points: 0.2 },
          { step: `Kết luận GTNN là ${minVal}`, points: 0.2 },
        ],
        keyFormula: '$|A| + |B| \\\\ge |A + B|$.',
      };
    },
  },

  {
    id: 'T_G7_C2_VDC_03',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C2',
    lesson: 'Đại lượng tỉ lệ nghịch',
    topic: 'Ứng dụng tỉ lệ nghịch trong sản xuất',
    problemType: 'Ba đội máy cày tỉ lệ nghịch với thời gian hoàn thành',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'dai_luong_ti_le_nghich', 'giai_he_ti_le_thuc'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // 3 đội cày 3 cánh đồng bằng nhau mất 4, 6, 8 ngày.
      // Số máy tỉ lệ nghịch: x*4 = y*6 = z*8 => x/6 = y/4 = z/3
      // x - z = k máy => (x - z)/(6 - 3) = k/3
      const mul = rng.nextInt(2, 5);
      const diff = 3 * mul; // đội 1 nhiều hơn đội 3 là diff máy
      const x = 6 * mul;
      const y = 4 * mul;
      const z = 3 * mul;
      const total = x + y + z;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `${total} máy`,
        [
          { text: `${total + 4} máy`, errorType: 'TÍNH_NHẦM_BCNN' },
          { text: `${x + y} máy`, errorType: 'QUÊN_ĐỘI_THỨ_BA' },
          { text: `${total - 6} máy`, errorType: 'TÍNH_SAI_HIỆU_SỐ_MÁY' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C2',
        lesson: 'Đại lượng tỉ lệ nghịch',
        topic: 'Ứng dụng tỉ lệ nghịch trong sản xuất',
        problemType: 'Ba đội máy cày tỉ lệ nghịch với thời gian hoàn thành',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'dai_luong_ti_le_nghich', 'giai_he_ti_le_thuc'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Ba đội máy cày có cùng năng suất làm việc trên ba cánh đồng cùng diện tích. Đội thứ nhất hoàn thành công việc trong $4$ ngày, đội thứ hai trong $6$ ngày và đội thứ ba trong $8$ ngày. Biết đội thứ nhất có nhiều hơn đội thứ ba là ${diff} máy. Tổng số máy của cả ba đội là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Gọi số máy của 3 đội là $x, y, z$ ($x, y, z \\\\in \\\\mathbb{N}^*$).\\\\nBước 2: Vì năng suất và diện tích như nhau nên số máy và số ngày tỉ lệ nghịch: $4x = 6y = 8z \\\\iff \\\\frac{x}{6} = \\\\frac{y}{4} = \\\\frac{z}{3}$.\\\\nBước 3: Đội một nhiều hơn đội ba là ${diff} máy nên $x - z = ${diff}$.\\\\nBước 4: Áp dụng tính chất dãy tỉ số bằng nhau: $\\\\frac{x}{6} = \\\\frac{z}{3} = \\\\frac{x - z}{6 - 3} = \\\\frac{${diff}}{3} = ${mul}$. Suy ra $x = ${x}, y = ${y}, z = ${z}$.\\\\nBước 5: Tổng số máy cả ba đội là $x + y + z = ${total}$ máy.`,
        rubricSteps: [
          { step: 'Gọi ẩn và thiết lập mối quan hệ tỉ lệ nghịch', points: 0.2 },
          { step: 'Chuyển về dãy tỉ số bằng nhau', points: 0.2 },
          { step: 'Thiết lập hiệu x - z theo đề bài', points: 0.2 },
          { step: 'Áp dụng tính chất dãy tỉ số tìm số máy từng đội', points: 0.2 },
          { step: `Tính tổng số máy cả ba đội là ${total} máy`, points: 0.2 },
        ],
        keyFormula: 'Tỉ lệ nghịch: $a x = b y = c z \\\\implies \\\\frac{x}{1/a} = \\\\frac{y}{1/b} = \\\\frac{z}{1/c}$.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 3: HÌNH HỌC TRỰC QUAN (G7_C3)
  // ============================================================================
  {
    id: 'T_G7_C3_VDC_01',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Hình hộp chữ nhật và hình lập phương',
    topic: 'Thể tích và lưu lượng vòi nước',
    problemType: 'Bài toán hai vòi nước chảy vào và tháo ra khỏi bể',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['the_tich_hinh_hop_chu_nhat', 'luu_luong_chay', 'mo_hinh_hoa_thuc_te'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const l = rng.nextInt(4, 6);
      const w = rng.nextInt(2, 4);
      const h = 2; // chiều cao bể
      const capacity = l * w * h; // m3
      const flowIn = 5; // m3/h
      const flowOut = 2; // m3/h
      const netFlow = flowIn - flowOut; // 3 m3/h
      const hoursToFill = Math.round((capacity / netFlow) * 10) / 10;
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Hình hộp chữ nhật và hình lập phương',
        topic: 'Thể tích và lưu lượng vòi nước',
        problemType: 'Bài toán hai vòi nước chảy vào và tháo ra khỏi bể',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['the_tich_hinh_hop_chu_nhat', 'luu_luong_chay', 'mo_hinh_hoa_thuc_te'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Một bể bơi dạng hình hộp chữ nhật có chiều dài ${l}\\\\text{ m}, chiều rộng ${w}\\\\text{ m} và chiều sâu $2\\\\text{ m}$. Bể đang cạn, người ta mở đồng thời một vòi chảy vào với lưu lượng $5\\\\text{ m}^3/\\\\text{h}$ và một vòi xả đáy với lưu lượng $2\\\\text{ m}^3/\\\\text{h}$. Hỏi sau bao nhiêu giờ thì bể đầy nước? (Làm tròn đến 1 chữ số thập phân).`,
        correctAnswer: String(hoursToFill),
        acceptedAnswers: [String(hoursToFill), `${hoursToFill} gio`, `${hoursToFill} giờ`],
        solution: `Bước 1: Dung tích của bể bơi là: $V = ${l} \\\\cdot ${w} \\\\cdot 2 = ${capacity}\\\\text{ m}^3$.\\\\nBước 2: Trong mỗi giờ, lượng nước thực tế tăng thêm trong bể là: $v = 5 - 2 = ${netFlow}\\\\text{ m}^3/\\\\text{h}$.\\\\nBước 3: Thời gian để bể đầy nước là: $t = V : v = ${capacity} : ${netFlow}$.\\\\nBước 4: Thực hiện phép chia: $t \\\\approx ${hoursToFill}$ (giờ).\\\\nBước 5: Kết luận sau ${hoursToFill} giờ thì bể đầy nước.`,
        rubricSteps: [
          { step: `Tính dung tích bể bơi V = ${capacity} m3`, points: 0.2 },
          { step: 'Tính lưu lượng nước tích lũy ròng mỗi giờ là 3 m3/h', points: 0.2 },
          { step: 'Lập tỉ số thể tích chia lưu lượng ròng', points: 0.2 },
          { step: `Tính ra thời gian xấp xỉ ${hoursToFill} giờ`, points: 0.2 },
          { step: 'Kết luận đáp số đúng', points: 0.2 },
        ],
        keyFormula: '$t = \\\\frac{V_{\\\\text{bể}}}{v_{\\\\text{vào}} - v_{\\\\text{ra}}}$.',
      };
    },
  },

  {
    id: 'T_G7_C3_VDC_02',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Hình lăng trụ đứng tam giác và tứ giác',
    topic: 'Tối ưu đóng gói và diện tích bề mặt',
    problemType: 'Bài toán đóng hộp carton và chi phí sản xuất',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['the_tich_hinh_hop', 'dien_tich_toan_phan', 'mo_hinh_hoa_thuc_te'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const a = 30; // dài cm
      const b = 20; // rộng cm
      const c = 10; // cao cm
      const sTp = 2 * (a * b + b * c + c * a); // cm2
      const paperNeed = Math.round(sTp * 1.1); // hao hụt 10%
      const unitCost = 50; // đồng / cm2
      const totalCost = paperNeed * unitCost;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `${totalCost.toLocaleString('vi-VN')} đồng`,
        [
          { text: `${(sTp * unitCost).toLocaleString('vi-VN')} đồng`, errorType: 'QUÊN_TÍNH_HAO_HỤT_BÌA' },
          { text: `${Math.round(totalCost * 1.2).toLocaleString('vi-VN')} đồng`, errorType: 'TÍNH_SAI_TỈ_LỆ_HAO_HỤT' },
          { text: `${(paperNeed * 40).toLocaleString('vi-VN')} đồng`, errorType: 'NHẦM_ĐƠN_GIÁ' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Hình lăng trụ đứng tam giác và tứ giác',
        topic: 'Tối ưu đóng gói và diện tích bề mặt',
        problemType: 'Bài toán đóng hộp carton và chi phí sản xuất',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['the_tich_hinh_hop', 'dien_tich_toan_phan', 'mo_hinh_hoa_thuc_te'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Một xưởng sản xuất cần làm hộp carton hình hộp chữ nhật có kích thước dài $30\\\\text{ cm}$, rộng $20\\\\text{ cm}$, cao $10\\\\text{ cm}$. Diện tích bìa carton thực tế cần dùng bằng $110\\\\%$ diện tích toàn phần của hộp (để làm mép dán và trừ hao hụt). Giá bìa là $50$ đồng/$\\\\text{cm}^2$. Chi phí bìa để làm một chiếc hộp là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Diện tích xung quanh của hộp là: $S_{xq} = 2(30 + 20) \\\\cdot 10 = 1000\\\\text{ cm}^2$.\\\\nBước 2: Diện tích hai đáy là: $2 \\\\cdot 30 \\\\cdot 20 = 1200\\\\text{ cm}^2$.\\\\nBước 3: Diện tích toàn phần là: $S_{tp} = 1000 + 1200 = ${sTp}\\\\text{ cm}^2$.\\\\nBước 4: Diện tích bìa thực tế cần dùng là: $S = ${sTp} \\\\cdot 110\\\\% = ${paperNeed}\\\\text{ cm}^2$.\\\\nBước 5: Chi phí tiền bìa là: $T = ${paperNeed} \\\\cdot 50 = ${totalCost.toLocaleString('vi-VN')}$ đồng.`,
        rubricSteps: [
          { step: 'Tính diện tích xung quanh hộp chữ nhật', points: 0.2 },
          { step: 'Tính diện tích hai đáy của hộp', points: 0.2 },
          { step: `Tính diện tích toàn phần là ${sTp} cm2`, points: 0.2 },
          { step: `Tính diện tích bìa thực tế kèm 10% hao hụt là ${paperNeed} cm2`, points: 0.2 },
          { step: 'Tính chi phí tiền bìa chính xác', points: 0.2 },
        ],
        keyFormula: '$S_{\\\\text{bìa}} = 2(ab + bc + ca) \\\\times 1{,}1$.',
      };
    },
  },

  {
    id: 'T_G7_C3_VDC_03',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C3',
    lesson: 'Hình lăng trụ đứng tam giác và tứ giác',
    topic: 'Thể tích khối đặc ghép',
    problemType: 'Thể tích khối hình học ghép từ lăng trụ đứng và hình hộp',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['phan_tich_khoi_ghep', 'the_tich_lang_tru_tam_giac', 'cong_the_tich'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      const a = rng.nextInt(4, 7); // cạnh đáy
      const b = 6;
      const hBox = 3;
      const hTri = 2; // chiều cao mái tam giác
      const vBox = a * b * hBox;
      const vPrism = (a * hTri / 2) * b;
      const totalV = vBox + vPrism;
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C3',
        lesson: 'Hình lăng trụ đứng tam giác và tứ giác',
        topic: 'Thể tích khối đặc ghép',
        problemType: 'Thể tích khối hình học ghép từ lăng trụ đứng và hình hộp',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['phan_tich_khoi_ghep', 'the_tich_lang_tru_tam_giac', 'cong_the_tich'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: `Một ngôi nhà kho mô hình gồm tầng dưới dạng hình hộp chữ nhật có kích thước đáy $${a}\\\\text{ m} \\\\times ${b}\\\\text{ m}$, chiều cao $3\\\\text{ m}$; phần mái phía trên dạng hình lăng trụ đứng tam giác có đáy là tam giác với cạnh đáy $${a}\\\\text{ m}$, chiều cao tương ứng $2\\\\text{ m}$ và chiều dài mái là $${b}\\\\text{ m}$. Tính tổng thể tích không gian bên trong nhà kho.`,
        correctAnswer: String(totalV),
        acceptedAnswers: [String(totalV), `${totalV} m3`, `${totalV} mét khối`],
        solution: `Bước 1: Thể tích tầng dưới (hình hộp chữ nhật) là: $V_1 = ${a} \\\\cdot ${b} \\\\cdot 3 = ${vBox}\\\\text{ m}^3$.\\\\nBước 2: Diện tích đáy tam giác của phần mái là: $S_{đáy} = \\\\frac{1}{2} \\\\cdot ${a} \\\\cdot 2 = ${a}\\\\text{ m}^2$.\\\\nBước 3: Thể tích phần mái (hình lăng trụ đứng tam giác) là: $V_2 = S_{đáy} \\\\cdot ${b} = ${a} \\\\cdot ${b} = ${vPrism}\\\\text{ m}^3$.\\\\nBước 4: Tổng thể tích nhà kho là: $V = V_1 + V_2 = ${vBox} + ${vPrism} = ${totalV}\\\\text{ m}^3$.\\\\nBước 5: Kết luận thể tích toàn bộ là ${totalV} mét khối.`,
        rubricSteps: [
          { step: `Tính thể tích tầng dưới hình hộp là ${vBox} m3`, points: 0.2 },
          { step: 'Tính diện tích tam giác đáy của phần mái', points: 0.2 },
          { step: `Tính thể tích mái lăng trụ đứng là ${vPrism} m3`, points: 0.2 },
          { step: 'Cộng thể tích hai khối lại với nhau', points: 0.2 },
          { step: `Kết luận thể tích là ${totalV} m3`, points: 0.2 },
        ],
        keyFormula: '$V = V_{\\\\text{hộp}} + V_{\\\\text{mái}} = abh_1 + \\\\frac{1}{2}ah_2b$.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 4: GÓC VÀ ĐƯỜNG THẲNG SONG SONG (G7_C4)
  // ============================================================================
  {
    id: 'T_G7_C4_VDC_01',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C4',
    lesson: 'Hai đường thẳng song song và dấu hiệu nhận biết',
    topic: 'Tính góc đường gấp khúc zíc-zắc',
    problemType: 'Tính góc bằng phương pháp kẻ đường thẳng phụ song song',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['ke_duong_phu_song_song', 'goc_so_le_trong', 'cong_so_do_goc'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      const a1 = rng.nextInt(35, 55); // góc A
      const b1 = rng.nextInt(40, 60); // góc B
      const angleO = a1 + b1; // góc AOB ở đỉnh gãy O
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `${angleO}^\\circ`,
        [
          { text: `${180 - angleO}^\\circ`, errorType: 'TÍNH_GÓC_BÙ' },
          { text: `${Math.abs(a1 - b1)}^\\circ`, errorType: 'LẤY_HIỆU_HAI_GÓC' },
          { text: `${angleO + 15}^\\circ`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C4',
        lesson: 'Hai đường thẳng song song và dấu hiệu nhận biết',
        topic: 'Tính góc đường gấp khúc zíc-zắc',
        problemType: 'Tính góc bằng phương pháp kẻ đường thẳng phụ song song',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['ke_duong_phu_song_song', 'goc_so_le_trong', 'cong_so_do_goc'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: `Cho hai đường thẳng $Ax \\\\parallel By$. Điểm $O$ nằm giữa hai đường thẳng sao cho $\\\\widehat{xAO} = ${a1}^\\circ$ và $\\\\widehat{yBO} = ${b1}^\\circ$ (hai tia $Ax, By$ cùng chiều). Số đo của góc $\\\\widehat{AOB}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Qua điểm $O$, kẻ tia $Ot \\\\parallel Ax$ (cùng chiều với $Ax$).\\\\nBước 2: Vì $Ot \\\\parallel Ax$ nên $\\\\widehat{AOt} = \\\\widehat{xAO} = ${a1}^\\circ$ (hai góc so le trong).\\\\nBước 3: Vì $Ax \\\\parallel By$ và $Ot \\\\parallel Ax$ nên $Ot \\\\parallel By$.\\\\nBước 4: Do đó $\\\\widehat{tOB} = \\\\widehat{yBO} = ${b1}^\\circ$ (hai góc so le trong).\\\\nBước 5: Vì tia $Ot$ nằm giữa hai tia $OA$ và $OB$ nên $\\\\widehat{AOB} = \\\\widehat{AOt} + \\\\widehat{tOB} = ${a1}^\\circ + ${b1}^\\circ = ${angleO}^\\circ$.`,
        rubricSteps: [
          { step: 'Kẻ đường phụ Ot song song với Ax qua O', points: 0.2 },
          { step: `Áp dụng so le trong tính được góc AOt = ${a1} độ`, points: 0.2 },
          { step: 'Chứng minh Ot song song với By theo tính chất bắc cầu', points: 0.2 },
          { step: `Áp dụng so le trong tính được góc tOB = ${b1} độ`, points: 0.2 },
          { step: `Cộng hai góc suy ra AOB = ${angleO} độ`, points: 0.2 },
        ],
        keyFormula: 'Kẻ tia phụ $Ot \\\\parallel Ax \\\\parallel By \\\\implies \\\\widehat{AOB} = \\\\widehat{A} + \\\\widehat{B}$.',
      };
    },
  },

  {
    id: 'T_G7_C4_VDC_02',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C4',
    lesson: 'Tia phân giác của một góc',
    topic: 'Góc tạo bởi hai tia phân giác trong tam giác',
    problemType: 'Tính góc tạo bởi hai đường phân giác của hai góc tam giác',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['tong_ba_goc_tam_giac', 'tinh_chat_tia_phan_giac', 'bien_doi_he_thuc_goc'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const angleA = rng.nextInt(50, 80);
      // Góc BIC = 90 + A/2
      const angleBIC = 90 + angleA / 2;
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C4',
        lesson: 'Tia phân giác của một góc',
        topic: 'Góc tạo bởi hai tia phân giác trong tam giác',
        problemType: 'Tính góc tạo bởi hai đường phân giác của hai góc tam giác',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['tong_ba_goc_tam_giac', 'tinh_chat_tia_phan_giac', 'bien_doi_he_thuc_goc'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Cho tam giác $ABC$ có $\\\\widehat{A} = ${angleA}^\\circ$. Hai tia phân giác của góc $B$ và góc $C$ cắt nhau tại điểm $I$. Tính số đo của góc $\\\\widehat{BIC}$.`,
        correctAnswer: String(angleBIC),
        acceptedAnswers: [String(angleBIC), `${angleBIC}^`, `${angleBIC} do`, `${angleBIC} độ`],
        solution: `Bước 1: Xét $\\\\Delta ABC$, ta có: $\\\\widehat{B} + \\\\widehat{C} = 180^\\circ - \\\\widehat{A} = 180^\\circ - ${angleA}^\\circ = ${180 - angleA}^\\circ$.\\\\nBước 2: Vì $BI, CI$ là tia phân giác nên: $\\\\widehat{IBC} = \\\\frac{\\\\widehat{B}}{2}$ và $\\\\widehat{ICB} = \\\\frac{\\\\widehat{C}}{2}$.\\\\nBước 3: Do đó: $\\\\widehat{IBC} + \\\\widehat{ICB} = \\\\frac{\\\\widehat{B} + \\\\widehat{C}}{2} = \\\\frac{${180 - angleA}^\\circ}{2} = ${(180 - angleA) / 2}^\\circ$.\\\\nBước 4: Xét $\\\\Delta IBC$, ta có: $\\\\widehat{BIC} = 180^\\circ - (\\\\widehat{IBC} + \\\\widehat{ICB}) = 180^\\circ - ${(180 - angleA) / 2}^\\circ = ${angleBIC}^\\circ$.\\\\nBước 5: Kết luận số đo góc $\\\\widehat{BIC} = ${angleBIC}^\\circ$.`,
        rubricSteps: [
          { step: `Tính tổng góc B + C = ${180 - angleA} độ trong tam giác ABC`, points: 0.2 },
          { step: 'Sử dụng tính chất phân giác lập tỉ lệ nửa góc', points: 0.2 },
          { step: `Tính tổng IBC + ICB = ${(180 - angleA) / 2} độ`, points: 0.2 },
          { step: `Tính góc BIC = 180 - ${(180 - angleA) / 2} = ${angleBIC} độ`, points: 0.2 },
          { step: 'Kết luận đáp số đúng', points: 0.2 },
        ],
        keyFormula: '$\\\\widehat{BIC} = 90^\\circ + \\\\frac{\\\\widehat{A}}{2}$.',
      };
    },
  },

  {
    id: 'T_G7_C4_VDC_03',
    grade: 7,
    semester: 1,
    chapterId: 'G7_C4',
    lesson: 'Định lí và chứng minh định lí',
    topic: 'Quang hình học: Định luật phản xạ ánh sáng',
    problemType: 'Bài toán góc lệch tia sáng qua hai gương song song',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'dinh_luat_phan_xa', 'duong_thang_song_song'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const incAngle = rng.nextInt(30, 50); // góc tới i
      // Tia tới song song với tia phản xạ sau 2 lần phản xạ trên 2 gương song song!
      // Góc lệch = 180 - 0 = 0 (cùng phương) hoặc góc tới thứ 2 = góc tới 1
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Hai tia sáng song song với nhau',
        [
          { text: 'Hai tia sáng vuông góc với nhau', errorType: 'NHẦM_VỚI_HAI_GƯƠNG_VUÔNG_GÓC' },
          { text: `Hai tia sáng tạo thành góc ${incAngle * 2}^\\circ`, errorType: 'CHỈ_TÍNH_GÓC_LỆCH_MỘT_GƯƠNG' },
          { text: 'Hai tia sáng cắt nhau tạo góc nhọn', errorType: 'KHÔNG_ÁP_DỤNG_ĐỊNH_LÝ_SONG_SONG' },
        ]
      );
      return {
        grade: 7,
        semester: 1,
        chapterId: 'G7_C4',
        lesson: 'Định lí và chứng minh định lí',
        topic: 'Quang hình học: Định luật phản xạ ánh sáng',
        problemType: 'Bài toán góc lệch tia sáng qua hai gương song song',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'dinh_luat_phan_xa', 'duong_thang_song_song'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Hai gương phẳng $G_1$ và $G_2$ được đặt song song với nhau, mặt phản xạ quay vào nhau. Một tia sáng chiếu đến gương $G_1$ với góc tới $${incAngle}^\\circ$, phản xạ đến gương $G_2$ rồi tiếp tục phản xạ lại môi trường. Mối quan hệ hình học giữa tia tới ban đầu và tia phản xạ cuối cùng là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Gọi góc tới tại gương $G_1$ là $i_1 = ${incAngle}^\\circ$. Theo định luật phản xạ, góc phản xạ $i'_1 = i_1 = ${incAngle}^\\circ$.\\\\nBước 2: Vì hai gương $G_1 \\\\parallel G_2$ nên hai pháp tuyến tại hai điểm tới cũng song song với nhau.\\\\nBước 3: Do hai pháp tuyến song song, góc tới tại gương thứ hai $i_2$ và góc phản xạ $i'_1$ là hai góc so le trong nên $i_2 = i'_1 = ${incAngle}^\\circ$.\\\\nBước 4: Góc phản xạ tại gương $G_2$ là $i'_2 = i_2 = ${incAngle}^\\circ$.\\\\nBước 5: So sánh hướng của tia tới đầu tiên và tia phản xạ cuối cùng: chúng tạo với đường thẳng nối hai điểm tới các cặp góc so le trong bằng nhau, nên tia phản xạ cuối cùng song song với tia tới ban đầu.`,
        rubricSteps: [
          { step: 'Áp dụng định luật phản xạ góc tới bằng góc phản xạ tại gương 1', points: 0.2 },
          { step: 'Chứng minh hai pháp tuyến song song do hai mặt gương song song', points: 0.2 },
          { step: 'Suy ra góc tới gương 2 bằng góc phản xạ gương 1 do so le trong', points: 0.2 },
          { step: 'Tính góc phản xạ tại gương thứ hai', points: 0.2 },
          { step: 'Kết luận hai tia sáng song song với nhau', points: 0.2 },
        ],
        keyFormula: 'Hai gương song song $\\\\implies$ tia phản xạ cuối cùng song song tia tới.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 5: MỘT SỐ YẾU TỐ THỐNG KÊ VÀ XÁC SUẤT (G7_C5)
  // ============================================================================
  {
    id: 'T_G7_C5_VDC_01',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Biểu đồ hình quạt tròn',
    topic: 'Khôi phục dữ liệu khuyết trong biểu đồ quạt tròn',
    problemType: 'Giải hệ tìm cơ cấu phần trăm hai nhóm dữ liệu khuyết',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['bieu_do_quat_tron', 'tong_phan_tram_100', 'giai_phuong_trinh_ti_so'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const p1 = 30; // Giỏi
      const p2 = 40; // Khá
      // Đạt và Chưa đạt chiếm 30%. Đạt gấp đôi Chưa đạt: 20% và 10%
      const pDat = 20;
      const pChuaDat = 10;
      const totalStudents = rng.nextInt(6, 10) * 40;
      const datStudents = (totalStudents * pDat) / 100;
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Biểu đồ hình quạt tròn',
        topic: 'Khôi phục dữ liệu khuyết trong biểu đồ quạt tròn',
        problemType: 'Giải hệ tìm cơ cấu phần trăm hai nhóm dữ liệu khuyết',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['bieu_do_quat_tron', 'tong_phan_tram_100', 'giai_phuong_trinh_ti_so'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Một trường THCS có ${totalStudents} học sinh. Kết quả xếp loại rèn luyện được biểu diễn bằng biểu đồ quạt tròn: Tốt chiếm $30\\\\%$, Khá chiếm $40\\\\%$, còn lại là Đạt và Chưa đạt. Biết tỉ số phần trăm học sinh xếp loại Đạt gấp đôi xếp loại Chưa đạt. Hỏi có bao nhiêu học sinh xếp loại Đạt?`,
        correctAnswer: String(datStudents),
        acceptedAnswers: [String(datStudents), `${datStudents} hoc sinh`, `${datStudents} em`],
        solution: `Bước 1: Tổng phần trăm của loại Đạt và Chưa đạt là: $100\\\\% - (30\\\\% + 40\\\\%) = 30\\\\%$.\\\\nBước 2: Vì phần trăm loại Đạt gấp đôi Chưa đạt, gọi phần trăm Chưa đạt là $x\\\\%$, loại Đạt là $2x\\\\%$.\\\\nBước 3: Ta có phương trình: $x + 2x = 30 \\\\iff 3x = 30 \\\\iff x = 10\\\\%$.\\\\nBước 4: Phần trăm học sinh xếp loại Đạt là: $2x = 20\\\\%$.\\\\nBước 5: Số học sinh xếp loại Đạt là: $${totalStudents} \\\\cdot 20\\\\% = ${datStudents}$ học sinh.`,
        rubricSteps: [
          { step: 'Tính tổng phần trăm hai nhóm còn lại là 30%', points: 0.2 },
          { step: 'Thiết lập phương trình tỉ lệ x + 2x = 30%', points: 0.2 },
          { step: 'Giải tìm phần trăm loại Chưa đạt là 10%', points: 0.2 },
          { step: 'Tính phần trăm loại Đạt là 20%', points: 0.2 },
          { step: `Tính số học sinh loại Đạt là ${datStudents} học sinh`, points: 0.2 },
        ],
        keyFormula: 'Tổng các quạt tròn trong biểu đồ $= 100\\\\%$.',
      };
    },
  },

  {
    id: 'T_G7_C5_VDC_02',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Xác suất của biến cố ngẫu nhiên',
    topic: 'Biến cố hợp và xác suất thực nghiệm',
    problemType: 'Xác suất rút hai thẻ có tổng số chấm chia hết',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['dem_so_phan_tu_khong_gian_mau', 'phan_loai_bien_co_thuan_loi', 'tinh_xac_suat'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      // Hộp có 5 thẻ: 1, 2, 3, 4, 5. Rút ngẫu nhiên 2 thẻ cùng lúc.
      // Tổng số cặp: C(5, 2) = 10 cặp.
      // Cặp có tổng là số chẵn: (1,3), (1,5), (2,4), (3,5) => 4 cặp.
      // Xác suất = 4/10 = 2/5 = 0.4.
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Xác suất của biến cố ngẫu nhiên',
        topic: 'Biến cố hợp và xác suất thực nghiệm',
        problemType: 'Xác suất rút hai thẻ có tổng số chấm chia hết',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['dem_so_phan_tu_khong_gian_mau', 'phan_loai_bien_co_thuan_loi', 'tinh_xac_suat'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: 'Trong một hộp có 5 chiếc thẻ cùng loại được đánh số từ $1$ đến $5$. Rút ngẫu nhiên đồng thời $2$ chiếc thẻ từ hộp. Tính xác suất của biến cố: "Tổng hai số ghi trên hai thẻ rút được là một số chẵn".',
        correctAnswer: '0.4',
        acceptedAnswers: ['0.4', '2/5', '4/10', '40%'],
        solution: 'Bước 1: Liệt kê tất cả các cặp hai thẻ có thể rút được: (1,2), (1,3), (1,4), (1,5), (2,3), (2,4), (2,5), (3,4), (3,5), (4,5). Có tất cả 10 kết quả có thể xảy ra.\\nBước 2: Để tổng hai số là số chẵn, hai số phải cùng lẻ hoặc cùng chẵn.\\nBước 3: Các kết quả cùng lẻ: (1,3), (1,5), (3,5) (3 kết quả).\\nBước 4: Các kết quả cùng chẵn: (2,4) (1 kết quả). Vậy có $3 + 1 = 4$ kết quả thuận lợi.\\nBước 5: Xác suất của biến cố là: $P = \\frac{4}{10} = \\frac{2}{5} = 0{,}4$.',
        rubricSteps: [
          { step: 'Liệt kê không gian mẫu gồm 10 kết quả đồng khả năng', points: 0.2 },
          { step: 'Biện luận điều kiện tổng chẵn là cùng chẵn hoặc cùng lẻ', points: 0.2 },
          { step: 'Liệt kê các cặp cùng lẻ (3 cặp)', points: 0.2 },
          { step: 'Liệt kê các cặp cùng chẵn (1 cặp) suy ra 4 kết quả thuận lợi', points: 0.2 },
          { step: 'Tính ra xác suất P = 2/5 = 0.4', points: 0.2 },
        ],
        keyFormula: '$P(A) = \\\\frac{n(A)}{n(\\\\Omega)}$.',
      };
    },
  },

  {
    id: 'T_G7_C5_VDC_03',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C5',
    lesson: 'Thu thập và phân loại dữ liệu',
    topic: 'Phân tích sai số và tính đại diện của mẫu khảo sát',
    problemType: 'So sánh tỉ số hai nhóm đối tượng khảo sát để phát hiện định kiến mẫu',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'phan_tich_mau_khao_sat', 'ti_so_phan_tram'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const sample1 = 100;
      const sample2 = 400;
      const pct1 = 70; // 70% ủng hộ tại câu lạc bộ thể thao
      const pct2 = 30; // 30% ủng hộ tại toàn trường
      const diff = pct1 - pct2;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `${diff}\\\\%\$, mẫu CLB bị định kiến thiên vị`,
        [
          { text: `${diff + 10}\\\\%\$, hai mẫu đều đại diện tốt`, errorType: 'TÍNH_SAI_CHÊNH_LỆCH' },
          { text: '0%, hai mẫu hoàn toàn đồng nhất', errorType: 'BỎ_QUA_KHÁC_BIỆT_MẪU' },
          { text: `${pct1}\\\\%\$, mẫu nhỏ chính xác hơn`, errorType: 'NGỘ_NHẬN_MẪU_NHỎ' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C5',
        lesson: 'Thu thập và phân loại dữ liệu',
        topic: 'Phân tích sai số và tính đại diện của mẫu khảo sát',
        problemType: 'So sánh tỉ số hai nhóm đối tượng khảo sát để phát hiện định kiến mẫu',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'phan_tich_mau_khao_sat', 'ti_so_phan_tram'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Khảo sát ý kiến về việc mở thêm câu lạc bộ bóng rổ: Nhóm A khảo sát $100$ học sinh tại sân bóng rổ thấy có $70\\\\%$ đồng ý; Nhóm B khảo sát ngẫu nhiên $400$ học sinh toàn trường thấy có $30\\\\%$ đồng ý. Độ chênh lệch tỉ lệ phần trăm và nhận định về tính đại diện là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Tỉ lệ đồng ý ở mẫu A là $70\\\\%$.\\\\nBước 2: Tỉ lệ đồng ý ở mẫu B là $30\\\\%$.\\\\nBước 3: Độ chênh lệch giữa hai kết quả là: $70\\\\% - 30\\\\% = ${diff}\\\\%\$.\\\\nBước 4: Mẫu A chỉ lấy người tại sân bóng rổ nên đối tượng đã có sẵn sở thích, dẫn đến định kiến thiên vị cao.\\\\nBước 5: Kết luận độ chênh lệch là ${diff}% và mẫu A bị định kiến thiên vị.`,
        rubricSteps: [
          { step: 'Xác định tỉ số phần trăm mẫu A', points: 0.2 },
          { step: 'Xác định tỉ số phần trăm mẫu B', points: 0.2 },
          { step: `Tính độ chênh lệch là ${diff}%`, points: 0.2 },
          { step: 'Phân tích nguyên nhân sai lệch do chọn mẫu thiên vị tại sân thể thao', points: 0.2 },
          { step: 'Kết luận tính đại diện không hợp lệ của mẫu A', points: 0.2 },
        ],
        keyFormula: 'Mẫu ngẫu nhiên toàn trường có tính đại diện cao hơn mẫu chuyên biệt.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 6: BIỂU THỨC ĐẠI SỐ VÀ ĐA THỨC MỘT BIẾN (G7_C6)
  // ============================================================================
  {
    id: 'T_G7_C6_VDC_01',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Đa thức một biến',
    topic: 'Xác định hệ số đa thức khi biết giá trị',
    problemType: 'Tìm hệ số a, b của đa thức bậc hai thỏa mãn các điều kiện điểm',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['thay_gia_tri_xac_dinh_he_so', 'giai_he_phuong_trinh_bac_nhat', 'tim_cuc_tri_da_thuc'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const a = rng.nextInt(1, 3);
      const b = rng.nextInt(2, 5);
      const c = rng.nextInt(3, 7);
      // P(x) = a x^2 + b x + c
      const p0 = c;
      const p1 = a + b + c;
      const pNeg1 = a - b + c;
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Đa thức một biến',
        topic: 'Xác định hệ số đa thức khi biết giá trị',
        problemType: 'Tìm hệ số a, b của đa thức bậc hai thỏa mãn các điều kiện điểm',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['thay_gia_tri_xac_dinh_he_so', 'giai_he_phuong_trinh_bac_nhat', 'tim_cuc_tri_da_thuc'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Cho đa thức $P(x) = ax^2 + bx + c$. Biết $P(0) = ${p0}$, $P(1) = ${p1}$ và $P(-1) = ${pNeg1}$. Tìm các hệ số $a, b, c$, từ đó tính giá trị $P(2)$.`,
        correctAnswer: String(4 * a + 2 * b + c),
        acceptedAnswers: [String(4 * a + 2 * b + c), `P(2) = ${4 * a + 2 * b + c}`],
        solution: `Bước 1: Thay $x = 0$ ta có: $P(0) = c = ${p0} \\\\implies c = ${c}$.\\\\nBước 2: Thay $x = 1$ ta có: $P(1) = a + b + ${c} = ${p1} \\\\implies a + b = ${a + b}$.\\\\nBước 3: Thay $x = -1$ ta có: $P(-1) = a - b + ${c} = ${pNeg1} \\\\implies a - b = ${a - b}$.\\\\nBước 4: Cộng hai vế ta được: $2a = ${2 * a} \\\\implies a = ${a}$ và $b = ${b}$. Đa thức là: $P(x) = ${a}x^2 + ${b}x + ${c}$.\\\\nBước 5: Tính $P(2) = ${a} \\\\cdot 2^2 + ${b} \\\\cdot 2 + ${c} = ${4 * a + 2 * b + c}$.`,
        rubricSteps: [
          { step: `Tìm được hệ số tự do c = ${c}`, points: 0.2 },
          { step: `Thiết lập hệ thức a + b = ${a + b}`, points: 0.2 },
          { step: `Thiết lập hệ thức a - b = ${a - b}`, points: 0.2 },
          { step: `Tìm được a = ${a} và b = ${b}`, points: 0.2 },
          { step: `Tính ra P(2) = ${4 * a + 2 * b + c}`, points: 0.2 },
        ],
        keyFormula: '$P(x) = ax^2 + bx + c$. Thay giá trị $x$ để lập hệ tìm hệ số.',
      };
    },
  },

  {
    id: 'T_G7_C6_VDC_02',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Nghiệm của đa thức một biến',
    topic: 'Chứng minh đa thức vô nghiệm',
    problemType: 'Đánh giá đa thức bậc hai luôn dương',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['bien_doi_binh_phuong_thieu', 'tach_hang_so_duong', 'danh_gia_vo_nghiem'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      const k = rng.nextInt(2, 6);
      const minVal = k;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Đa thức không có nghiệm (vô nghiệm)',
        [
          { text: 'Đa thức có đúng 1 nghiệm x = 0', errorType: 'CHO_RẰNG_X_BẰNG_0_LÀ_NGHIỆM' },
          { text: 'Đa thức có 2 nghiệm phân biệt', errorType: 'NHẦM_VỚI_PHƯƠNG_TRÌNH_CÓ_NGHIỆM' },
          { text: `Đa thức có nghiệm x = -${k}`, errorType: 'THỬ_NGHIỆM_SAI' },
        ]
      );
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Nghiệm của đa thức một biến',
        topic: 'Chứng minh đa thức vô nghiệm',
        problemType: 'Đánh giá đa thức bậc hai luôn dương',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['bien_doi_binh_phuong_thieu', 'tach_hang_so_duong', 'danh_gia_vo_nghiem'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: `Cho đa thức $Q(x) = x^2 + 2x + ${k + 1}$. Khẳng định nào sau đây về nghiệm của đa thức $Q(x)$ là đúng?`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Tách hệ số tự do: $${k + 1} = 1 + ${k}$.\\\\nBước 2: Viết lại đa thức dưới dạng: $Q(x) = (x^2 + 2x + 1) + ${k}$.\\\\nBước 3: Nhận xét rằng $x^2 + 2x + 1 = (x + 1)^2$.\\\\nBước 4: Ta có $(x + 1)^2 \\\\ge 0$ với mọi $x \\\\in \\\\mathbb{R}$, suy ra $Q(x) = (x + 1)^2 + ${k} \\\\ge 0 + ${k} = ${k} > 0$.\\\\nBước 5: Vì $Q(x) > 0$ với mọi $x$ nên phương trình $Q(x) = 0$ không thể xảy ra. Vậy đa thức vô nghiệm.`,
        rubricSteps: [
          { step: `Tách hằng số tự do ${k + 1} = 1 + ${k}`, points: 0.2 },
          { step: 'Nhóm hằng đẳng thức (x + 1)^2', points: 0.2 },
          { step: 'Đánh giá bình phương luôn >= 0', points: 0.2 },
          { step: `Cộng hằng số dương suy ra Q(x) >= ${k} > 0`, points: 0.2 },
          { step: 'Kết luận đa thức vô nghiệm', points: 0.2 },
        ],
        keyFormula: '$A^2 + k > 0$ (với $k > 0$) $\\\\implies$ Đa thức vô nghiệm.',
      };
    },
  },

  {
    id: 'T_G7_C6_VDC_03',
    grade: 7,
    semester: 2,
    chapterId: 'G7_C6',
    lesson: 'Ứng dụng của biểu thức đại số',
    topic: 'Mô hình kinh tế đa thức',
    problemType: 'Tìm điểm hòa vốn và doanh thu từ hàm lợi nhuận',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'bieu_thuc_loi_nhuan', 'giai_phuong_trinh_bac_nhat'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const fixedCost = rng.nextInt(15, 25) * 1000; // chi phí cố định (nghìn đồng)
      const costPerItem = 20; // nghìn đồng
      const pricePerItem = 50; // nghìn đồng
      const profitPerItem = pricePerItem - costPerItem; // 30 nghìn đồng
      const breakevenItems = fixedCost / profitPerItem;
      return {
        grade: 7,
        semester: 2,
        chapterId: 'G7_C6',
        lesson: 'Ứng dụng của biểu thức đại số',
        topic: 'Mô hình kinh tế đa thức',
        problemType: 'Tìm điểm hòa vốn và doanh thu từ hàm lợi nhuận',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'bieu_thuc_loi_nhuan', 'giai_phuong_trinh_bac_nhat'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Một cơ sở sản xuất đồ thủ công có chi phí cố định ban đầu là ${fixedCost.toLocaleString('vi-VN')} nghìn đồng. Chi phí nguyên liệu để làm một sản phẩm là $20$ nghìn đồng và giá bán mỗi sản phẩm là $50$ nghìn đồng. Gọi $x$ là số sản phẩm sản xuất và bán được. Để cơ sở bắt đầu hòa vốn (doanh thu bằng tổng chi phí), cần bán được tối thiểu bao nhiêu sản phẩm?`,
        correctAnswer: String(breakevenItems),
        acceptedAnswers: [String(breakevenItems), `${breakevenItems} san pham`, `${breakevenItems} sản phẩm`],
        solution: `Bước 1: Doanh thu bán $x$ sản phẩm là đa thức: $R(x) = 50x$ (nghìn đồng).\\\\nBước 2: Tổng chi phí sản xuất $x$ sản phẩm là: $C(x) = ${fixedCost.toLocaleString('vi-VN')} + 20x$ (nghìn đồng).\\\\nBước 3: Lợi nhuận là hiệu đa thức: $L(x) = R(x) - C(x) = 50x - (${fixedCost.toLocaleString('vi-VN')} + 20x) = 30x - ${fixedCost.toLocaleString('vi-VN')}$.\\\\nBước 4: Để hòa vốn thì lợi nhuận bằng 0: $L(x) = 0 \\\\iff 30x = ${fixedCost.toLocaleString('vi-VN')} \\\\iff x = ${breakevenItems}$.\\\\nBước 5: Kết luận cần bán tối thiểu ${breakevenItems} sản phẩm để hòa vốn.`,
        rubricSteps: [
          { step: 'Viết biểu thức đa thức doanh thu R(x) = 50x', points: 0.2 },
          { step: 'Viết biểu thức đa thức tổng chi phí C(x)', points: 0.2 },
          { step: 'Thiết lập biểu thức lợi nhuận L(x) = R(x) - C(x)', points: 0.2 },
          { step: `Giải phương trình hòa vốn 30x = ${fixedCost}`, points: 0.2 },
          { step: `Kết luận cần bán ${breakevenItems} sản phẩm`, points: 0.2 },
        ],
        keyFormula: '$L(x) = R(x) - C(x) = 0 \\\\implies x = \\\\frac{\\\\text{Chi phí cố định}}{\\\\text{Giá bán} - \\\\text{Biến phí}}$.',
      };
    },
  },
];
