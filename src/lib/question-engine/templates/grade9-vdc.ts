// ==============================================================================
// MathMaster THCS - Ngân Hàng Câu Hỏi Vận Dụng Cao (VDC) Lớp 9 (GDPT 2018)
// File: src/lib/question-engine/templates/grade9-vdc.ts
// 6 chương x 3 template VDC = 18 template VDC
// Sàn độ khó: VDC >= 5 bước suy luận, liên chuyên đề / biện luận trường hợp, thời gian >= 7 phút
// ==============================================================================

import type { QuestionTemplate } from '../types';
import { buildShuffledMcq } from '../template-helpers';

export const grade9VdcTemplates: QuestionTemplate[] = [
  // ============================================================================
  // CHƯƠNG 1: HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN (G9_C1)
  // ============================================================================
  {
    id: 'T_G9_C1_VDC_01',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Hệ hai phương trình bậc nhất hai ẩn',
    topic: 'Hệ phương trình chứa tham số',
    problemType: 'Tìm tham số m để hệ có nghiệm duy nhất thỏa mãn điều kiện',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['giai_he_bang_phuong_phap_the', 'dieu_kien_nghiem_duy_nhat', 'giai_bat_phuong_trinh_tham_so'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      // mx + y = 3
      // x + my = 3
      // D = m^2 - 1 != 0 => m != +-1
      // x = (3m - 3)/(m^2 - 1) = 3/(m + 1)
      // y = 3/(m + 1)
      // Điều kiện x > 0 và y > 0 <=> 3/(m + 1) > 0 <=> m + 1 > 0 <=> m > -1 (và m != 1)
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Hệ hai phương trình bậc nhất hai ẩn',
        topic: 'Hệ phương trình chứa tham số',
        problemType: 'Tìm tham số m để hệ có nghiệm duy nhất thỏa mãn điều kiện',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['giai_he_bang_phuong_phap_the', 'dieu_kien_nghiem_duy_nhat', 'giai_bat_phuong_trinh_tham_so'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: 'Cho hệ phương trình ẩn $x, y$: $\\\\begin{cases} mx + y = 3 \\\\\\\\ x + my = 3 \\\\end{cases}$. Tìm điều kiện của tham số $m$ để hệ có nghiệm duy nhất $(x; y)$ thỏa mãn $x > 0$ và $y > 0$.',
        correctAnswer: 'm > -1 và m != 1',
        acceptedAnswers: ['m > -1 và m != 1', 'm > -1 va m != 1', 'm > -1, m != 1', 'm > -1 và m khác 1'],
        solution: 'Bước 1: Hệ phương trình có nghiệm duy nhất khi và chỉ khi $\\frac{m}{1} \\\\neq \\frac{1}{m} \\\\iff m^2 \\\\neq 1 \\\\iff m \\\\neq \\\\pm 1$.\\\\nBước 2: Trừ hai phương trình vế theo vế: $(m - 1)x - (m - 1)y = 0 \\\\iff (m - 1)(x - y) = 0$. Vì $m \\\\neq 1$ nên $x = y$.\\\\nBước 3: Thay $y = x$ vào phương trình thứ hai: $x + mx = 3 \\\\iff (m + 1)x = 3 \\\\iff x = \\frac{3}{m + 1}$. Suy ra $y = \\frac{3}{m + 1}$.\\\\nBước 4: Điều kiện $x > 0$ và $y > 0 \\\\iff \\frac{3}{m + 1} > 0 \\\\iff m + 1 > 0 \\\\iff m > -1$.\\\\nBước 5: Kết hợp điều kiện có nghiệm duy nhất $m \\\\neq \\\\pm 1$, ta được: $m > -1$ và $m \\\\neq 1$.',
        rubricSteps: [
          { step: 'Nêu điều kiện hệ có nghiệm duy nhất m khác +-1', points: 0.2 },
          { step: 'Trừ hai vế tìm được quan hệ đối xứng x = y', points: 0.2 },
          { step: 'Giải tìm nghiệm duy nhất theo tham số: x = y = 3/(m + 1)', points: 0.2 },
          { step: 'Giải bất phương trình 3/(m + 1) > 0 suy ra m > -1', points: 0.2 },
          { step: 'Kết hợp điều kiện m khác 1 và kết luận hoàn chỉnh', points: 0.2 },
        ],
        keyFormula: 'Hệ có nghiệm duy nhất $\\\\iff \\frac{a}{a\'} \\\\neq \\frac{b}{b\'}$.',
      };
    },
  },

  {
    id: 'T_G9_C1_VDC_02',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Giải hệ phương trình bằng phương pháp đặt ẩn phụ',
    topic: 'Hệ phương trình quy về bậc nhất hai ẩn',
    problemType: 'Giải hệ phương trình chứa căn bằng phương pháp đặt ẩn phụ',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['dat_an_phu', 'giai_he_bac_nhat', 'tim_nghiem_goc'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // 2 * sqrt(x - 1) + 3 * sqrt(y + 2) = 13
      // 3 * sqrt(x - 1) - sqrt(y + 2) = 3
      // Đặt u = sqrt(x - 1), v = sqrt(y + 2)
      // 2u + 3v = 13
      // 3u - v = 3 => v = 3u - 3
      // 2u + 9u - 9 = 13 => 11u = 22 => u = 2, v = 3
      // sqrt(x - 1) = 2 => x - 1 = 4 => x = 5
      // sqrt(y + 2) = 3 => y + 2 = 9 => y = 7
      // x + y = 12
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Giải hệ phương trình bằng phương pháp đặt ẩn phụ',
        topic: 'Hệ phương trình quy về bậc nhất hai ẩn',
        problemType: 'Giải hệ phương trình chứa căn bằng phương pháp đặt ẩn phụ',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['dat_an_phu', 'giai_he_bac_nhat', 'tim_nghiem_goc'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Giải hệ phương trình: $\\\\begin{cases} 2\\\\sqrt{x - 1} + 3\\\\sqrt{y + 2} = 13 \\\\\\\\ 3\\\\sqrt{x - 1} - \\\\sqrt{y + 2} = 3 \\\\end{cases}$, từ đó tính giá trị tổng $x + y$.',
        correctAnswer: '12',
        acceptedAnswers: ['12', 'x + y = 12'],
        solution: 'Bước 1: Điều kiện xác định: $x \\\\ge 1$ và $y \\\\ge -2$.\\\\nBước 2: Đặt $u = \\\\sqrt{x - 1}$ ($u \\\\ge 0$) và $v = \\\\sqrt{y + 2}$ ($v \\\\ge 0$). Hệ trở thành: $\\\\begin{cases} 2u + 3v = 13 \\\\\\\\ 3u - v = 3 \\\\end{cases}$.\\\\nBước 3: Từ phương trình thứ hai $v = 3u - 3$, thay vào thứ nhất: $2u + 3(3u - 3) = 13 \\\\iff 11u = 22 \\\\iff u = 2$ (thỏa mãn). Suy ra $v = 3$ (thỏa mãn).\\\\nBước 4: Trả về ẩn gốc: $\\\\sqrt{x - 1} = 2 \\\\iff x - 1 = 4 \\\\iff x = 5$ (thỏa mãn); $\\\\sqrt{y + 2} = 3 \\\\iff y + 2 = 9 \\\\iff y = 7$ (thỏa mãn).\\\\nBước 5: Tổng $x + y = 5 + 7 = 12$.',
        rubricSteps: [
          { step: 'Đặt điều kiện xác định cho căn thức: x >= 1, y >= -2', points: 0.2 },
          { step: 'Đặt ẩn phụ u, v không âm đưa về hệ bậc nhất', points: 0.2 },
          { step: 'Giải hệ bậc nhất tìm được nghiệm u = 2, v = 3', points: 0.2 },
          { step: 'Giải tìm ẩn gốc x = 5 và y = 7 đối chiếu điều kiện', points: 0.2 },
          { step: 'Tính ra tổng x + y = 12', points: 0.2 },
        ],
        keyFormula: 'Đặt ẩn phụ $u = \\\\sqrt{f(x)}, v = \\\\sqrt{g(y)}$ với $u, v \\\\ge 0$.',
      };
    },
  },

  {
    id: 'T_G9_C1_VDC_03',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C1',
    lesson: 'Giải bài toán bằng cách lập hệ phương trình',
    topic: 'Bài toán công việc làm chung làm riêng',
    problemType: 'Hai tổ công nhân cùng làm chung một công việc',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'he_phuong_trinh_nang_suat', 'giai_he_bang_an_phu'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // Hai tổ cùng làm hoàn thành trong 12 ngày.
      // Nếu tổ 1 làm 4 ngày rồi tổ 2 làm tiếp 10 ngày thì hoàn thành 7/12 công việc.
      // 1/x + 1/y = 1/12
      // 4/x + 10/y = 7/12
      // 4(1/x + 1/y) + 6/y = 7/12 => 4/12 + 6/y = 7/12 => 6/y = 3/12 = 1/4 => y = 24 ngày.
      // 1/x = 1/12 - 1/24 = 1/24 => x = 24 ngày.
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        'Tổ 1: 24 ngày, Tổ 2: 24 ngày',
        [
          { text: 'Tổ 1: 20 ngày, Tổ 2: 28 ngày', errorType: 'TÍNH_NHẦM_HỆ_SỐ_NGÀY' },
          { text: 'Tổ 1: 18 ngày, Tổ 2: 36 ngày', errorType: 'SAI_TỈ_LỆ_PHÂN_CHIA' },
          { text: 'Tổ 1: 15 ngày, Tổ 2: 30 ngày', errorType: 'THỬ_NGHIỆM_SAI' },
        ]
      );
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C1',
        lesson: 'Giải bài toán bằng cách lập hệ phương trình',
        topic: 'Bài toán công việc làm chung làm riêng',
        problemType: 'Hai tổ công nhân cùng làm chung một công việc',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'he_phuong_trinh_nang_suat', 'giai_he_bang_an_phu'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Hai tổ công nhân cùng làm chung một công việc thì hoàn thành trong $12$ ngày. Nếu tổ thứ nhất làm trong $4$ ngày rồi tổ thứ hai làm tiếp trong $10$ ngày thì cả hai tổ hoàn thành được $\\frac{7}{12}$ công việc. Hỏi nếu làm riêng một mình thì mỗi tổ hoàn thành công việc trong bao lâu?',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Bước 1: Gọi thời gian tổ 1 làm một mình xong việc là $x$ (ngày), tổ 2 là $y$ (ngày) ($x, y > 12$).\\\\nBước 2: Mỗi ngày tổ 1 làm được $\\frac{1}{x}$ việc, tổ 2 làm được $\\frac{1}{y}$ việc. Ta có phương trình: $\\frac{1}{x} + \\frac{1}{y} = \\frac{1}{12}$.\\\\nBước 3: Tổ 1 làm 4 ngày và tổ 2 làm 10 ngày được $\\frac{7}{12}$ công việc: $\\frac{4}{x} + \\frac{10}{y} = \\frac{7}{12}$.\\\\nBước 4: Ta biến đổi: $4\\\\left(\\frac{1}{x} + \\frac{1}{y}\\\\right) + \\frac{6}{y} = \\frac{7}{12} \\\\iff 4 \\\\cdot \\frac{1}{12} + \\frac{6}{y} = \\frac{7}{12} \\\\iff \\frac{6}{y} = \\frac{3}{12} = \\frac{1}{4} \\\\iff y = 24$.\\\\nBước 5: Thay $y = 24$ vào: $\\frac{1}{x} = \\frac{1}{12} - \\frac{1}{24} = \\frac{1}{24} \\\\iff x = 24$. Vậy cả hai tổ đều mất 24 ngày.',
        rubricSteps: [
          { step: 'Gọi ẩn thời gian x, y và đặt điều kiện x, y > 12', points: 0.2 },
          { step: 'Lập phương trình năng suất chung 1/x + 1/y = 1/12', points: 0.2 },
          { step: 'Lập phương trình thứ hai theo thời gian làm việc riêng rẽ', points: 0.2 },
          { step: 'Giải hệ tìm được y = 24', points: 0.2 },
          { step: 'Tìm được x = 24 và kết luận chính xác', points: 0.2 },
        ],
        keyFormula: '$\\frac{1}{x} + \\frac{1}{y} = \\frac{1}{T}$.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 2: PHƯƠNG TRÌNH BẬC HAI VÀ ĐỊNH LÍ VIÈTE (G9_C2)
  // ============================================================================
  {
    id: 'T_G9_C2_VDC_01',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Định lí Viète và ứng dụng',
    topic: 'Hệ thức Viète chứa tham số',
    problemType: 'Tìm tham số m để phương trình có hai nghiệm phân biệt thỏa mãn hệ thức',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['dieu_kien_delta_duong', 'dinh_li_viete', 'bien_doi_he_thuc_doi_xung'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      // x^2 - 2(m + 1)x + m^2 + 4 = 0
      // Delta' = (m + 1)^2 - (m^2 + 4) = m^2 + 2m + 1 - m^2 - 4 = 2m - 3 > 0 => m > 1.5
      // x1 + x2 = 2(m + 1), x1 x2 = m^2 + 4
      // x1^2 + x2^2 = (x1 + x2)^2 - 2x1 x2 = 4(m^2 + 2m + 1) - 2(m^2 + 4) = 2m^2 + 8m - 4
      // Cho x1^2 + x2^2 = 20 => 2m^2 + 8m - 4 = 20 => 2m^2 + 8m - 24 = 0 => m^2 + 4m - 12 = 0
      // (m + 6)(m - 2) = 0 => m = 2 (thỏa mãn m > 1.5), m = -6 (loại do delta' < 0)
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Định lí Viète và ứng dụng',
        topic: 'Hệ thức Viète chứa tham số',
        problemType: 'Tìm tham số m để phương trình có hai nghiệm phân biệt thỏa mãn hệ thức',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['dieu_kien_delta_duong', 'dinh_li_viete', 'bien_doi_he_thuc_doi_xung'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: 'Cho phương trình bậc hai: $x^2 - 2(m + 1)x + m^2 + 4 = 0$ ($m$ là tham số). Tìm giá trị của $m$ để phương trình có hai nghiệm phân biệt $x_1, x_2$ thỏa mãn: $x_1^2 + x_2^2 = 20$.',
        correctAnswer: '2',
        acceptedAnswers: ['2', 'm = 2'],
        solution: 'Bước 1: Điều kiện để phương trình có 2 nghiệm phân biệt là $\\\\Delta\' > 0 \\\\iff (m + 1)^2 - (m^2 + 4) > 0 \\\\iff 2m - 3 > 0 \\\\iff m > 1{,}5$.\\\\nBước 2: Theo định lí Viète: $x_1 + x_2 = 2(m + 1)$ và $x_1 x_2 = m^2 + 4$.\\\\nBước 3: Biến đổi hệ thức đối xứng: $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = 4(m + 1)^2 - 2(m^2 + 4) = 2m^2 + 8m - 4$.\\\\nBước 4: Theo đề bài $x_1^2 + x_2^2 = 20 \\\\iff 2m^2 + 8m - 24 = 0 \\\\iff m^2 + 4m - 12 = 0 \\\\iff (m - 2)(m + 6) = 0$.\\\\nBước 5: Giải ra $m = 2$ hoặc $m = -6$. Đối chiếu điều kiện $m > 1{,}5$, ta nhận $m = 2$ và loại $m = -6$. Vậy $m = 2$.',
        rubricSteps: [
          { step: 'Tính delta phẩy và tìm điều kiện m > 1.5 để có hai nghiệm phân biệt', points: 0.2 },
          { step: 'Viết đúng định lí Viète cho tổng và tích hai nghiệm', points: 0.2 },
          { step: 'Biến đổi hệ thức x1^2 + x2^2 thành biểu thức theo m: 2m^2 + 8m - 4', points: 0.2 },
          { step: 'Giải phương trình bậc hai theo m tìm được m = 2 và m = -6', points: 0.2 },
          { step: 'Đối chiếu điều kiện delta phẩy và kết luận duy nhất m = 2', points: 0.2 },
        ],
        keyFormula: '$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2$. Điều kiện $\\\\Delta\' > 0$.',
      };
    },
  },

  {
    id: 'T_G9_C2_VDC_02',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Công thức nghiệm của phương trình bậc hai',
    topic: 'Dấu của nghiệm phương trình bậc hai',
    problemType: 'Tìm điều kiện tham số m để phương trình có hai nghiệm cùng dương',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['dieu_kien_hai_nghiem_duong', 'dinh_li_viete', 'giai_he_bat_phuong_trinh'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      // x^2 - 2mx + m + 6 = 0
      // Delta' = m^2 - m - 6 = (m - 3)(m + 2) >= 0 => m >= 3 hoặc m <= -2
      // S = 2m > 0 => m > 0
      // P = m + 6 > 0 => m > -6
      // Giao điều kiện: m >= 3
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$m \\\\ge 3$',
        [
          { text: '$m > 0$', errorType: 'CHỈ_XÉT_TỔNG_HAI_NGHIỆM' },
          { text: '$m > -6$', errorType: 'CHỈ_XÉT_TÍCH_HAI_NGHIỆM' },
          { text: '$-2 \\\\le m \\\\le 3$', errorType: 'ĐẢO_CHIỀU_DELTA' },
        ]
      );
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Công thức nghiệm của phương trình bậc hai',
        topic: 'Dấu của nghiệm phương trình bậc hai',
        problemType: 'Tìm điều kiện tham số m để phương trình có hai nghiệm cùng dương',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['dieu_kien_hai_nghiem_duong', 'dinh_li_viete', 'giai_he_bat_phuong_trinh'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: 'Tìm tất cả các giá trị của tham số $m$ để phương trình: $x^2 - 2mx + m + 6 = 0$ có hai nghiệm phân biệt cùng mang dấu dương ($0 < x_1 < x_2$).',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Bước 1: Phương trình có hai nghiệm phân biệt cùng dương khi và chỉ khi hệ 3 điều kiện đồng thời thỏa mãn: $\\\\Delta\' > 0, S > 0, P > 0$.\\\\nBước 2: $\\\\Delta\' = m^2 - m - 6 = (m - 3)(m + 2) > 0 \\\\iff m > 3$ hoặc $m < -2$.\\\\nBước 3: Tổng hai nghiệm: $S = x_1 + x_2 = 2m > 0 \\\\iff m > 0$.\\\\nBước 4: Tích hai nghiệm: $P = x_1 x_2 = m + 6 > 0 \\\\iff m > -6$.\\\\nBước 5: Lấy giao của ba điều kiện: $\\\\begin{cases} m > 3 \\\\text{ hoặc } m < -2 \\\\\\\\ m > 0 \\\\\\\\ m > -6 \\\\end{cases} \\\\iff m > 3$.',
        rubricSteps: [
          { step: 'Nêu hệ 3 điều kiện để phương trình có 2 nghiệm phân biệt cùng dương', points: 0.2 },
          { step: 'Giải bất phương trình delta phẩy > 0 ra m > 3 hoặc m < -2', points: 0.2 },
          { step: 'Giải bất phương trình tổng S > 0 ra m > 0', points: 0.2 },
          { step: 'Giải bất phương trình tích P > 0 ra m > -6', points: 0.2 },
          { step: 'Lấy giao các tập nghiệm kết luận m > 3', points: 0.2 },
        ],
        keyFormula: 'Hai nghiệm dương $\\\\iff \\\\Delta > 0, S > 0, P > 0$.',
      };
    },
  },

  {
    id: 'T_G9_C2_VDC_03',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C2',
    lesson: 'Ứng dụng hình học của phương trình bậc hai',
    topic: 'Quỹ đạo parabol trong vật lý',
    problemType: 'Bài toán quỹ đạo chuyển động ném vật thể và độ cao cực đại',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'dinh_parabol_cuc_tri', 'giai_phuong_trinh_bac_hai'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // h(t) = -5t^2 + 20t + 25
      // Độ cao max tại đỉnh t = -b/(2a) = -20 / (-10) = 2 giây
      // h_max = -5(4) + 20(2) + 25 = -20 + 40 + 25 = 45 mét
      // Chạm đất khi h(t) = 0 => -5t^2 + 20t + 25 = 0 => t^2 - 4t - 5 = 0 => (t - 5)(t + 1) = 0 => t = 5 giây
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C2',
        lesson: 'Ứng dụng hình học của phương trình bậc hai',
        topic: 'Quỹ đạo parabol trong vật lý',
        problemType: 'Bài toán quỹ đạo chuyển động ném vật thể và độ cao cực đại',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'dinh_parabol_cuc_tri', 'giai_phuong_trinh_bac_hai'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Một quả bóng được ném lên từ độ cao $25\\\\text{ m}$ so với mặt đất. Độ cao $h$ (tính bằng mét) của quả bóng sau $t$ giây được cho bởi công thức: $h(t) = -5t^2 + 20t + 25$. Hỏi sau bao nhiêu giây thì quả bóng rơi chạm đất?',
        correctAnswer: '5',
        acceptedAnswers: ['5', '5 giay', '5 giây', 't = 5'],
        solution: 'Bước 1: Quả bóng chạm đất khi độ cao $h(t) = 0$.\\\\nBước 2: Ta thiết lập phương trình bậc hai: $-5t^2 + 20t + 25 = 0$.\\\\nBước 3: Chia cả hai vế cho $-5$, ta được: $t^2 - 4t - 5 = 0$.\\\\nBước 4: Phân tích thành nhân tử: $(t - 5)(t + 1) = 0 \\\\iff t = 5$ hoặc $t = -1$.\\\\nBước 5: Vì thời gian $t \\\\ge 0$ nên ta chọn $t = 5$ giây (loại $t = -1$). Vậy sau $5$ giây quả bóng chạm đất.',
        rubricSteps: [
          { step: 'Xác định điều kiện chạm đất là h(t) = 0', points: 0.2 },
          { step: 'Lập phương trình bậc hai -5t^2 + 20t + 25 = 0', points: 0.2 },
          { step: 'Thu gọn phương trình về t^2 - 4t - 5 = 0', points: 0.2 },
          { step: 'Giải phương trình tìm được hai nghiệm t = 5 và t = -1', points: 0.2 },
          { step: 'Loại nghiệm âm và kết luận thời gian chạm đất là 5 giây', points: 0.2 },
        ],
        keyFormula: '$h(t) = 0 \\\\implies -5t^2 + v_0 t + h_0 = 0$.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 3: CĂN THỨC BẬC HAI VÀ CĂN THỨC BẬC BA (G9_C3)
  // ============================================================================
  {
    id: 'T_G9_C3_VDC_01',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Rút gọn biểu thức chứa căn thức bậc hai',
    topic: 'Biến đổi biểu thức chứa căn nâng cao',
    problemType: 'Rút gọn biểu thức căn phức tạp và giải bất phương trình',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['quy_dong_can_thuc', 'hang_dang_thuc_hieu_hai_binh_phuong', 'giai_bat_phuong_trinh_phan_thuc'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // P = (sqrt(x) / (sqrt(x) + 2) + 4 / (x - 4)) * (sqrt(x) - 2) / (sqrt(x) + 2)
      // = (sqrt(x)(sqrt(x) - 2) + 4) / (x - 4) * (sqrt(x) - 2) / (sqrt(x) + 2)
      // = (x - 2sqrt(x) + 4) ...
      // Dạng kinh điển: A = (sqrt(x) - 1) / sqrt(x). Tìm x để A < 1/2 <=> 2sqrt(x) - 2 < sqrt(x) <=> sqrt(x) < 2 <=> 0 < x < 4
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Rút gọn biểu thức chứa căn thức bậc hai',
        topic: 'Biến đổi biểu thức chứa căn nâng cao',
        problemType: 'Rút gọn biểu thức căn phức tạp và giải bất phương trình',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['quy_dong_can_thuc', 'hang_dang_thuc_hieu_hai_binh_phuong', 'giai_bat_phuong_trinh_phan_thuc'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Cho biểu thức $A = \\frac{\\\\sqrt{x} - 1}{\\\\sqrt{x}}$ với $x > 0$. Tìm tất cả các giá trị của $x$ để $A < \\frac{1}{2}$.',
        correctAnswer: '0 < x < 4',
        acceptedAnswers: ['0 < x < 4', '(0; 4)', 'x < 4 và x > 0', '0 < x và x < 4'],
        solution: 'Bước 1: Điều kiện xác định: $x > 0$.\\\\nBước 2: Thiết lập bất phương trình: $\\frac{\\\\sqrt{x} - 1}{\\\\sqrt{x}} < \\frac{1}{2}$.\\\\nBước 3: Chuyển vế: $\\frac{\\\\sqrt{x} - 1}{\\\\sqrt{x}} - \\frac{1}{2} < 0 \\\\iff \\frac{2(\\\\sqrt{x} - 1) - \\\\sqrt{x}}{2\\\\sqrt{x}} < 0$.\\\\nBước 4: Thu gọn tử số: $\\frac{\\\\sqrt{x} - 2}{2\\\\sqrt{x}} < 0$. Vì $x > 0$ nên mẫu số $2\\\\sqrt{x} > 0$, suy ra tử số $\\\\sqrt{x} - 2 < 0 \\\\iff \\\\sqrt{x} < 2 \\\\iff x < 4$.\\\\nBước 5: Kết hợp với điều kiện xác định $x > 0$, ta được nghiệm là: $0 < x < 4$.',
        rubricSteps: [
          { step: 'Nêu điều kiện xác định x > 0', points: 0.2 },
          { step: 'Thiết lập bất phương trình và chuyển vế quy đồng', points: 0.2 },
          { step: 'Thu gọn phân thức thành (sqrt(x) - 2) / (2 sqrt(x)) < 0', points: 0.2 },
          { step: 'Lập luận mẫu dương suy ra căn x < 2 tương đương x < 4', points: 0.2 },
          { step: 'Kết hợp điều kiện xác định và kết luận 0 < x < 4', points: 0.2 },
        ],
        keyFormula: '$\\frac{A}{B} < 0$ và $B > 0 \\\\implies A < 0$.',
      };
    },
  },

  {
    id: 'T_G9_C3_VDC_02',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Phương trình vô tỉ',
    topic: 'Giải phương trình vô tỉ cơ bản',
    problemType: 'Phương trình chứa căn bậc hai hai vế',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['dieu_kien_phuong_trinh_vo_ti', 'binh_phuong_hai_ve', 'thu_nghiem_loai_ngoai_lai'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      // sqrt(x^2 - 4x + 4) = 2x - 1 => |x - 2| = 2x - 1
      // Điều kiện 2x - 1 >= 0 => x >= 0.5
      // TH1: x >= 2 => x - 2 = 2x - 1 => x = -1 (loại vì không >= 2)
      // TH2: 0.5 <= x < 2 => 2 - x = 2x - 1 => 3x = 3 => x = 1 (thỏa mãn)
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Phương trình vô tỉ',
        topic: 'Giải phương trình vô tỉ cơ bản',
        problemType: 'Phương trình chứa căn bậc hai hai vế',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['dieu_kien_phuong_trinh_vo_ti', 'binh_phuong_hai_ve', 'thu_nghiem_loai_ngoai_lai'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: 'Giải phương trình vô tỉ: $\\\\sqrt{x^2 - 4x + 4} = 2x - 1$.',
        correctAnswer: '1',
        acceptedAnswers: ['1', 'x = 1'],
        solution: 'Bước 1: Viết lại phương trình: $\\\\sqrt{(x - 2)^2} = 2x - 1 \\\\iff |x - 2| = 2x - 1$.\\\\nBước 2: Điều kiện để vế phải không âm: $2x - 1 \\\\ge 0 \\\\iff x \\\\ge 0{,}5$.\\\\nBước 3: Trường hợp 1: Nếu $x \\\\ge 2$, ta có: $x - 2 = 2x - 1 \\\\iff x = -1$ (loại vì $x \\\\ge 2$).\\\\nBước 4: Trường hợp 2: Nếu $0{,}5 \\\\le x < 2$, ta có: $2 - x = 2x - 1 \\\\iff 3x = 3 \\\\iff x = 1$ (thỏa mãn điều kiện).\\\\nBước 5: Kết luận phương trình có nghiệm duy nhất $x = 1$.',
        rubricSteps: [
          { step: 'Đưa biểu thức trong căn về hằng đẳng thức |x - 2|', points: 0.2 },
          { step: 'Đặt điều kiện vế phải 2x - 1 >= 0', points: 0.2 },
          { step: 'Giải trường hợp x >= 2 và loại nghiệm ngoại lai', points: 0.2 },
          { step: 'Giải trường hợp 0.5 <= x < 2 tìm được nghiệm x = 1', points: 0.2 },
          { step: 'Đối chiếu điều kiện và kết luận nghiệm x = 1', points: 0.2 },
        ],
        keyFormula: '$\\\\sqrt{A^2} = |A| = B \\\\iff B \\\\ge 0$ và ($A = B$ hoặc $A = -B$).',
      };
    },
  },

  {
    id: 'T_G9_C3_VDC_03',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C3',
    lesson: 'Bất đẳng thức chứa căn',
    topic: 'Bất đẳng thức Cauchy áp dụng cho căn thức',
    problemType: 'Tìm GTNN của biểu thức chứa căn dạng tổng nghịch đảo',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['bat_dang_thuc_cauchy', 'bien_doi_can_thuc', 'tim_cuc_tri_so_hoc'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // P = x + 4/x với x > 0 => P >= 2 * sqrt(x * 4/x) = 4. Dấu bằng x = 2
      // Cho P = x + 9/x => P >= 6. Dấu bằng x = 3
      const a = rng.nextInt(2, 5);
      const a2 = a * a;
      const minVal = 2 * a;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `$P_{\\\\min} = ${minVal}$`,
        [
          { text: `$P_{\\\\min} = ${a2}$`, errorType: 'BỎ_QUA_BẤT_ĐẲNG_THỨC_CAUCHY' },
          { text: `$P_{\\\\min} = ${a}$`, errorType: 'QUÊN_NHÂN_HỆ_SỐ_2' },
          { text: `$P_{\\\\min} = ${minVal + 2}$`, errorType: 'TÍNH_NHẦM' },
        ]
      );
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C3',
        lesson: 'Bất đẳng thức chứa căn',
        topic: 'Bất đẳng thức Cauchy áp dụng cho căn thức',
        problemType: 'Tìm GTNN của biểu thức chứa căn dạng tổng nghịch đảo',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['bat_dang_thuc_cauchy', 'bien_doi_can_thuc', 'tim_cuc_tri_so_hoc'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Giá trị nhỏ nhất của biểu thức $P = x + \\frac{${a2}}{x}$ với $x > 0$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Điều kiện cho trước: $x > 0$, suy ra $x > 0$ và $\\frac{${a2}}{x} > 0$.\\\\nBước 2: Áp dụng bất đẳng thức Cauchy cho hai số dương $x$ và $\\frac{${a2}}{x}$:\\\\n$x + \\frac{${a2}}{x} \\\\ge 2\\\\sqrt{x \\\\cdot \\frac{${a2}}{x}}$.\\\\nBước 3: Rút gọn tích trong căn: $x \\\\cdot \\frac{${a2}}{x} = ${a2}$.\\\\nBước 4: Suy ra: $P \\\\ge 2\\\\sqrt{${a2}} = 2 \\\\cdot ${a} = ${minVal}$.\\\\nBước 5: Dấu đẳng thức xảy ra khi $x = \\frac{${a2}}{x} \\\\iff x^2 = ${a2} \\\\iff x = ${a}$ (vì $x > 0$). Vậy giá trị nhỏ nhất của $P$ là $${minVal}$.`,
        rubricSteps: [
          { step: 'Xác định hai số dương x và a^2/x', points: 0.2 },
          { step: 'Áp dụng bất đẳng thức Cauchy cho hai số dương', points: 0.2 },
          { step: `Triệt tiêu x trong căn tính được 2 sqrt(${a2})`, points: 0.2 },
          { step: `Tính ra giá trị P >= ${minVal}`, points: 0.2 },
          { step: `Chỉ ra dấu bằng tại x = ${a} và kết luận GTNN là ${minVal}`, points: 0.2 },
        ],
        keyFormula: '$A + B \\\\ge 2\\\\sqrt{AB}$ (với $A, B > 0$).',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 4: HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG (G9_C4)
  // ============================================================================
  {
    id: 'T_G9_C4_VDC_01',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C4',
    lesson: 'Tỉ số lượng giác của góc nhọn',
    topic: 'Bài toán đo chiều cao bị chắn chân',
    problemType: 'Tính chiều cao tháp qua hai góc nâng từ hai điểm quan sát',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'ti_so_luong_giac_tan', 'giai_he_phuong_trinh_hinh_hoc'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // Hai điểm cách nhau d = 50m.
      // Điểm gần nhìn góc 45 độ => khoảng cách = h.
      // Điểm xa nhìn góc 30 độ => khoảng cách = h + 50 = h * cot(30) = h * sqrt(3)
      // h(sqrt(3) - 1) = 50 => h = 50 / (sqrt(3) - 1) = 50 * (sqrt(3) + 1) / 2 = 25 * (sqrt(3) + 1) ~ 25 * 2.732 ~ 68.3 m
      const d = 50;
      const hApprox = 68.3;
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C4',
        lesson: 'Tỉ số lượng giác của góc nhọn',
        topic: 'Bài toán đo chiều cao bị chắn chân',
        problemType: 'Tính chiều cao tháp qua hai góc nâng từ hai điểm quan sát',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'ti_so_luong_giac_tan', 'giai_he_phuong_trinh_hinh_hoc'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Để đo chiều cao của một tòa tháp $h$, một giác kế được đặt tại hai điểm $A$ và $B$ trên mặt đất thẳng hàng với chân tháp $C$ ($A$ xa tháp hơn $B$). Biết khoảng cách $AB = 50\\\\text{ m}$, góc nhìn đỉnh tháp từ $B$ là $45^\\circ$ và từ $A$ là $30^\\circ$. Tính chiều cao của tháp (làm tròn đến 1 chữ số thập phân).',
        correctAnswer: '68.3',
        acceptedAnswers: ['68.3', '68.3 m', '68,3'],
        solution: 'Bước 1: Gọi chiều cao tháp là $h = CD$ ($h > 0$).\\\\nBước 2: Trong tam giác vuông $BCD$ vuông tại $C$ có $\\\\widehat{B} = 45^\\circ$, suy ra tam giác $BCD$ vuông cân, do đó $BC = h$.\\\\nBước 3: Khoảng cách từ điểm $A$ đến chân tháp là: $AC = AB + BC = 50 + h$.\\\\nBước 4: Trong tam giác vuông $ACD$ vuông tại $C$, ta có: $\\\\tan 30^\\circ = \\frac{CD}{AC} \\\\iff \\frac{1}{\\\\sqrt{3}} = \\frac{h}{50 + h}$.\\\\nBước 5: Giải phương trình: $50 + h = h\\\\sqrt{3} \\\\iff h(\\\\sqrt{3} - 1) = 50 \\\\iff h = \\frac{50}{\\\\sqrt{3} - 1} \\\\approx 68{,}3\\\\text{ m}$.',
        rubricSteps: [
          { step: 'Gọi ẩn chiều cao h và xác định tam giác vuông BCD cân suy ra BC = h', points: 0.2 },
          { step: 'Biểu diễn khoảng cách AC = 50 + h', points: 0.2 },
          { step: 'Thiết lập tỉ số lượng giác tan(30) = h / (50 + h)', points: 0.2 },
          { step: 'Giải phương trình tìm h = 50 / (sqrt(3) - 1)', points: 0.2 },
          { step: 'Làm tròn số tính ra kết quả 68.3 m', points: 0.2 },
        ],
        keyFormula: '$h = \\frac{d}{\\\\cot \\\\alpha - \\\\cot \\\\beta}$.',
      };
    },
  },

  {
    id: 'T_G9_C4_VDC_02',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C4',
    lesson: 'Một số hệ thức về cạnh và đường cao trong tam giác vuông',
    topic: 'Hệ thức lượng trong tam giác vuông',
    problemType: 'Tính các cạnh khi biết tỉ số hai cạnh góc vuông và đường cao',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['he_thuc_luong_duong_cao', 'dinh_li_pytago', 'giai_he_canh_tam_giac_vuong'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // Tam giác vuông ABC vuông tại A có AB / AC = 3 / 4, đường cao AH = 12 cm
      // Đặt AB = 3k, AC = 4k => BC = 5k
      // 1/AH^2 = 1/AB^2 + 1/AC^2 => 1/144 = 1/(9k^2) + 1/(16k^2) = 25 / (144 k^2)
      // k^2 = 25 => k = 5
      // AB = 15 cm, AC = 20 cm, BC = 25 cm
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C4',
        lesson: 'Một số hệ thức về cạnh và đường cao trong tam giác vuông',
        topic: 'Hệ thức lượng trong tam giác vuông',
        problemType: 'Tính các cạnh khi biết tỉ số hai cạnh góc vuông và đường cao',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['he_thuc_luong_duong_cao', 'dinh_li_pytago', 'giai_he_canh_tam_giac_vuong'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Cho tam giác $ABC$ vuông tại $A$, đường cao $AH = 12\\\\text{ cm}$. Biết tỉ số hai cạnh góc vuông là $\\frac{AB}{AC} = \\frac{3}{4}$. Tính độ dài cạnh huyền $BC$.',
        correctAnswer: '25',
        acceptedAnswers: ['25', '25 cm', 'BC = 25'],
        solution: 'Bước 1: Đặt $AB = 3k$ và $AC = 4k$ ($k > 0$).\\\\nBước 2: Áp dụng định lí Pytago trong tam giác vuông $ABC$: $BC = \\\\sqrt{AB^2 + AC^2} = \\\\sqrt{(3k)^2 + (4k)^2} = 5k$.\\\\nBước 3: Áp dụng hệ thức lượng $AB \\\\cdot AC = BC \\\\cdot AH$:\\\\n$3k \\\\cdot 4k = 5k \\\\cdot 12 \\\\iff 12k^2 = 60k$.\\\\nBước 4: Vì $k > 0$, chia cả hai vế cho $12k$ ta được: $k = 5$.\\\\nBước 5: Độ dài cạnh huyền $BC$ là: $BC = 5k = 5 \\\\cdot 5 = 25\\\\text{ cm}$.',
        rubricSteps: [
          { step: 'Đặt AB = 3k, AC = 4k và biểu diễn BC = 5k theo định lí Pytago', points: 0.2 },
          { step: 'Áp dụng hệ thức lượng diện tích AB * AC = BC * AH', points: 0.2 },
          { step: 'Thiết lập phương trình 12k^2 = 60k', points: 0.2 },
          { step: 'Giải tìm được hệ số k = 5', points: 0.2 },
          { step: 'Tính ra độ dài BC = 25 cm', points: 0.2 },
        ],
        keyFormula: '$AB \\\\cdot AC = BC \\\\cdot AH$.',
      };
    },
  },

  {
    id: 'T_G9_C4_VDC_03',
    grade: 9,
    semester: 1,
    chapterId: 'G9_C4',
    lesson: 'Tỉ số lượng giác của góc nhọn',
    topic: 'Chứng minh hệ thức lượng giác',
    problemType: 'Tính giá trị biểu thức lượng giác không phụ thuộc vào góc',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['hang_dang_thuc_luong_giac', 'sin2_plus_cos2_bang_1', 'rut_gon_bieu_thuc_luong_giac'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // P = sin^6(a) + cos^6(a) + 3 sin^2(a) cos^2(a)
      // = (sin^2 + cos^2)(sin^4 - sin^2 cos^2 + cos^4) + 3 sin^2 cos^2
      // = (sin^2 + cos^2)^2 - 3 sin^2 cos^2 + 3 sin^2 cos^2 = 1^2 = 1
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$P = 1$',
        [
          { text: '$P = 0$', errorType: 'TRIỆT_TIÊU_HẾT' },
          { text: '$P = 2$', errorType: 'CỘNG_SAI_HỆ_SỐ' },
          { text: '$P = 3$', errorType: 'LẤY_HỆ_SỐ_CỦA_SỐ_HẠNG_CUỐI' },
        ]
      );
      return {
        grade: 9,
        semester: 1,
        chapterId: 'G9_C4',
        lesson: 'Tỉ số lượng giác của góc nhọn',
        topic: 'Chứng minh hệ thức lượng giác',
        problemType: 'Tính giá trị biểu thức lượng giác không phụ thuộc vào góc',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['hang_dang_thuc_luong_giac', 'sin2_plus_cos2_bang_1', 'rut_gon_bieu_thuc_luong_giac'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Với mọi góc nhọn $\\\\alpha$, tính giá trị của biểu thức: $P = \\\\sin^6 \\\\alpha + \\\\cos^6 \\\\alpha + 3\\\\sin^2 \\\\alpha \\\\cos^2 \\\\alpha$.',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Bước 1: Viết lại: $\\\\sin^6 \\\\alpha + \\\\cos^6 \\\\alpha = (\\\\sin^2 \\\\alpha)^3 + (\\\\cos^2 \\\\alpha)^3$.\\\\nBước 2: Áp dụng hằng đẳng thức $A^3 + B^3 = (A + B)^3 - 3AB(A + B)$ với $A = \\\\sin^2 \\\\alpha, B = \\\\cos^2 \\\\alpha$.\\\\nBước 3: Ta có: $(\\\\sin^2 \\\\alpha)^3 + (\\\\cos^2 \\\\alpha)^3 = (\\\\sin^2 \\\\alpha + \\\\cos^2 \\\\alpha)^3 - 3\\\\sin^2 \\\\alpha \\\\cos^2 \\\\alpha (\\\\sin^2 \\\\alpha + \\\\cos^2 \\\\alpha)$.\\\\nBước 4: Sử dụng hệ thức cơ bản $\\\\sin^2 \\\\alpha + \\\\cos^2 \\\\alpha = 1$, ta được: $\\\\sin^6 \\\\alpha + \\\\cos^6 \\\\alpha = 1^3 - 3\\\\sin^2 \\\\alpha \\\\cos^2 \\\\alpha \\\\cdot 1 = 1 - 3\\\\sin^2 \\\\alpha \\\\cos^2 \\\\alpha$.\\\\nBước 5: Thay vào $P$: $P = (1 - 3\\\\sin^2 \\\\alpha \\\\cos^2 \\\\alpha) + 3\\\\sin^2 \\\\alpha \\\\cos^2 \\\\alpha = 1$.',
        rubricSteps: [
          { step: 'Nhận dạng tổng hai lập phương A^3 + B^3', points: 0.2 },
          { step: 'Áp dụng biến đổi hằng đẳng thức (A+B)^3 - 3AB(A+B)', points: 0.2 },
          { step: 'Áp dụng công thức cơ bản sin^2 a + cos^2 a = 1', points: 0.2 },
          { step: 'Thu gọn biểu thức lũy thừa bậc 6 thành 1 - 3 sin^2 a cos^2 a', points: 0.2 },
          { step: 'Triệt tiêu số hạng đối nhau và kết luận P = 1', points: 0.2 },
        ],
        keyFormula: '$\\\\sin^2 \\\\alpha + \\\\cos^2 \\\\alpha = 1$.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 5: ĐƯỜNG TRÒN (G9_C5)
  // ============================================================================
  {
    id: 'T_G9_C5_VDC_01',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Tiếp tuyến của đường tròn',
    topic: 'Tứ giác nội tiếp và tiếp tuyến',
    problemType: 'Tính tích đoạn thẳng qua cát tuyến và tiếp tuyến đường tròn',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['phuong_tich_diem_cat_tuyen', 'tam_giac_dong_dang', 'goc_tao_boi_tiep_tuyen_va_day'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      const ma = rng.nextInt(6, 10);
      const mc = 4;
      // MA^2 = MC * MD => MD = MA^2 / MC
      const md = (ma * ma) / mc;
      const cd = md - mc;
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Tiếp tuyến của đường tròn',
        topic: 'Tứ giác nội tiếp và tiếp tuyến',
        problemType: 'Tính tích đoạn thẳng qua cát tuyến và tiếp tuyến đường tròn',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['phuong_tich_diem_cat_tuyen', 'tam_giac_dong_dang', 'goc_tao_boi_tiep_tuyen_va_day'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: `Từ điểm $M$ nằm ngoài đường tròn $(O)$, kẻ tiếp tuyến $MA$ ($A$ là tiếp điểm) và cát tuyến $MCD$ đi qua tâm hoặc không đi qua tâm ($C$ nằm giữa $M$ và $D$). Biết $MA = ${ma}\\\\text{ cm}$ và $MC = 4\\\\text{ cm}$. Tính độ dài đoạn thẳng $CD$.`,
        correctAnswer: String(cd),
        acceptedAnswers: [String(cd), `${cd} cm`, `CD = ${cd}`],
        solution: `Bước 1: Xét $\\\\Delta MAC$ và $\\\\Delta MDA$, ta có góc $\\\\widehat{M}$ chung.\\\\nBước 2: Góc $\\\\widehat{MAC} = \\\\widehat{MDA}$ (cùng chắn cung $AC$, góc tạo bởi tia tiếp tuyến và dây cung bằng góc nội tiếp).\\\\nBước 3: Suy ra $\\\\Delta MAC \\\\backsim \\\\Delta MDA$ (g-g).\\\\nBước 4: Lập tỉ số đồng dạng: $\\frac{MA}{MD} = \\frac{MC}{MA} \\\\implies MA^2 = MC \\\\cdot MD$.\\\\nBước 5: Thay số: $${ma}^2 = 4 \\\\cdot MD \\\\implies MD = \\frac{${ma * ma}}{4} = ${md}\\\\text{ cm}$. Suy ra $CD = MD - MC = ${md} - 4 = ${cd}\\\\text{ cm}$.`,
        rubricSteps: [
          { step: 'Chỉ ra góc M chung', points: 0.2 },
          { step: 'Chứng minh góc MAC = góc MDA cùng chắn cung AC', points: 0.2 },
          { step: 'Chứng minh hai tam giác MAC và MDA đồng dạng', points: 0.2 },
          { step: `Thiết lập hệ thức MA^2 = MC * MD và tính MD = ${md} cm`, points: 0.2 },
          { step: `Tính ra CD = MD - MC = ${cd} cm`, points: 0.2 },
        ],
        keyFormula: '$MA^2 = MC \\\\cdot MD$.',
      };
    },
  },

  {
    id: 'T_G9_C5_VDC_02',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Góc nội tiếp',
    topic: 'Tính góc có đỉnh bên trong hoặc bên ngoài đường tròn',
    problemType: 'Tính góc tạo bởi hai dây cung cắt nhau trong đường tròn',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['goc_co_dinh_o_ben_trong_duong_tron', 'so_do_cung_bi_chan', 'tinh_chat_goc_ngoai_tam_giac'],
      crossTopic: false,
      modeling: false,
      needsCaseAnalysis: true,
      estMinutes: 7,
    },
    generate(rng, book) {
      const arc1 = rng.nextInt(60, 90);
      const arc2 = rng.nextInt(30, 50);
      // Góc trong = (arc1 + arc2) / 2
      const angleIn = (arc1 + arc2) / 2;
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        `${angleIn}^\\circ`,
        [
          { text: `${(arc1 - arc2) / 2}^\\circ`, errorType: 'NHẦM_VỚI_GÓC_Ở_NGOÀI_ĐƯỜNG_TRÒN' },
          { text: `${arc1 + arc2}^\\circ`, errorType: 'QUÊN_CHIA_ĐÔI' },
          { text: `${180 - angleIn}^\\circ`, errorType: 'TÍNH_GÓC_BÙ' },
        ]
      );
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Góc nội tiếp',
        topic: 'Tính góc có đỉnh bên trong hoặc bên ngoài đường tròn',
        problemType: 'Tính góc tạo bởi hai dây cung cắt nhau trong đường tròn',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['goc_co_dinh_o_ben_trong_duong_tron', 'so_do_cung_bi_chan', 'tinh_chat_goc_ngoai_tam_giac'],
          crossTopic: false,
          modeling: false,
          needsCaseAnalysis: true,
          estMinutes: 7,
        },
        content: `Cho đường tròn $(O)$. Hai dây cung $AB$ và $CD$ cắt nhau tại điểm $E$ nằm bên trong đường tròn. Biết số đo hai cung bị chắn là $\\\\text{sđ}(\\\\text{cung } AC) = ${arc1}^\\circ$ và $\\\\text{sđ}(\\\\text{cung } BD) = ${arc2}^\\circ$. Số đo của góc $\\\\widehat{AEC}$ là:`,
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: `Bước 1: Nối $B$ với $C$ để tạo thành tam giác $EBC$.\\\\nBước 2: Góc $\\\\widehat{ABC}$ là góc nội tiếp chắn cung $AC$, do đó $\\\\widehat{ABC} = \\frac{1}{2} \\\\text{sđ}(\\\\text{cung } AC) = \\frac{${arc1}^\\circ}{2}$.\\\\nBước 3: Góc $\\\\widehat{BCD}$ là góc nội tiếp chắn cung $BD$, do đó $\\\\widehat{BCD} = \\frac{1}{2} \\\\text{sđ}(\\\\text{cung } BD) = \\frac{${arc2}^\\circ}{2}$.\\\\nBước 4: Xét tam giác $EBC$, góc $\\\\widehat{AEC}$ là góc ngoài tại đỉnh $E$ nên $\\\\widehat{AEC} = \\\\widehat{ABC} + \\\\widehat{BCD}$.\\\\nBước 5: Suy ra $\\\\widehat{AEC} = \\frac{${arc1}^\\circ + ${arc2}^\\circ}{2} = ${angleIn}^\\circ$.`,
        rubricSteps: [
          { step: 'Kẻ đoạn thẳng phụ BC tạo tam giác EBC', points: 0.2 },
          { step: 'Tính góc nội tiếp ABC bằng nửa số đo cung AC', points: 0.2 },
          { step: 'Tính góc nội tiếp BCD bằng nửa số đo cung BD', points: 0.2 },
          { step: 'Áp dụng tính chất góc ngoài tam giác chứng minh công thức', points: 0.2 },
          { step: `Tính ra số đo góc AEC = ${angleIn} độ`, points: 0.2 },
        ],
        keyFormula: '$\\\\widehat{AEC} = \\frac{\\\\text{sđ}(\\\\text{cung } AC) + \\\\text{sđ}(\\\\text{cung } BD)}{2}$.',
      };
    },
  },

  {
    id: 'T_G9_C5_VDC_03',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C5',
    lesson: 'Độ dài đường tròn, cung tròn',
    topic: 'Truyền động dây curoa hai bánh xe',
    problemType: 'Bài toán chiều dài dây curoa tiếp xúc ngoài hai đường tròn',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['mo_hinh_hoa_thuc_te', 'do_dai_cung_tron', 'tiep_tuyen_chung_ngoai'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // Hai bánh xe bán kính R = 15 cm, r = 5 cm, khoảng cách tâm O1O2 = 20 cm
      // Dây curoa gồm 2 tiếp tuyến chung ngoài + 2 cung tròn
      // Khoảng cách tiếp tuyến: L = sqrt(d^2 - (R - r)^2) = sqrt(400 - 100) = sqrt(300) = 10 * sqrt(3) ~ 17.3 cm
      // Tổng 2 tiếp tuyến = 2 * 17.32 = 34.64 cm
      // Tổng 2 cung = pi * (R + r) = 20 * 3.14 = 62.8 cm (xấp xỉ khi góc quấn đối xứng)
      // Tổng chiều dài dây curoa L_total ~ 34.6 + 62.8 = 97.4 cm
      const d = 20;
      const lTotal = 97.4;
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C5',
        lesson: 'Độ dài đường tròn, cung tròn',
        topic: 'Truyền động dây curoa hai bánh xe',
        problemType: 'Bài toán chiều dài dây curoa tiếp xúc ngoài hai đường tròn',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['mo_hinh_hoa_thuc_te', 'do_dai_cung_tron', 'tiep_tuyen_chung_ngoai'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Hai bánh xe tròn có bán kính lần lượt là $R = 15\\\\text{ cm}$ và $r = 5\\\\text{ cm}$, khoảng cách giữa hai trục bánh xe là $20\\\\text{ cm}$. Người ta dùng một sợi dây curoa mắc ngoài bao quanh hai bánh xe để truyền động. Tính chiều dài của sợi dây curoa đó (làm tròn đến 1 chữ số thập phân, lấy $\\\\pi \\\\approx 3{,}14$).',
        correctAnswer: '97.4',
        acceptedAnswers: ['97.4', '97.4 cm', '97,4'],
        solution: 'Bước 1: Chiều dài dây curoa gồm hai đoạn thẳng tiếp tuyến chung ngoài và hai cung tròn quấn quanh hai bánh xe.\\\\nBước 2: Độ dài mỗi đoạn tiếp tuyến chung ngoài là: $L_1 = \\\\sqrt{d^2 - (R - r)^2} = \\\\sqrt{20^2 - (15 - 5)^2} = \\\\sqrt{400 - 100} = \\\\sqrt{300} \\\\approx 17{,}32\\\\text{ cm}$.\\\\nBước 3: Tổng độ dài hai đoạn tiếp xúc thẳng là: $2 \\\\cdot 17{,}32 = 34{,}64\\\\text{ cm}$.\\\\nBước 4: Tổng độ dài hai cung tròn quấn quanh hai bánh xe xấp xỉ bằng: $L_2 = \\\\pi(R + r) = 3{,}14 \\\\cdot (15 + 5) = 62{,}8\\\\text{ cm}$.\\\\nBước 5: Tổng chiều dài sợi dây curoa là: $L = 34{,}64 + 62{,}8 \\\\approx 97{,}4\\\\text{ cm}$.',
        rubricSteps: [
          { step: 'Phân tích cấu trúc dây curoa thành 2 đoạn tiếp tuyến thẳng và 2 cung tròn', points: 0.2 },
          { step: 'Áp dụng định lí Pytago tính độ dài tiếp tuyến chung ngoài', points: 0.2 },
          { step: 'Tính tổng hai đoạn tiếp tuyến thẳng xấp xỉ 34.64 cm', points: 0.2 },
          { step: 'Tính tổng độ dài hai cung tròn quấn quanh hai bánh xe xấp xỉ 62.8 cm', points: 0.2 },
          { step: 'Cộng và làm tròn kết quả 97.4 cm', points: 0.2 },
        ],
        keyFormula: '$L_{\\\\text{tt}} = \\\\sqrt{d^2 - (R - r)^2}$.',
      };
    },
  },

  // ============================================================================
  // CHƯƠNG 6: MỘT SỐ YẾU TỐ THỐNG KÊ VÀ XÁC SUẤT (G9_C6)
  // ============================================================================
  {
    id: 'T_G9_C6_VDC_01',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Bảng tần số và biểu đồ tần số',
    topic: 'Số trung bình cộng mẫu số liệu ghép nhóm',
    problemType: 'Tính số trung bình của bảng tần số ghép nhóm',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['gia_tri_dai_dien_nhom', 'tich_gia_tri_tan_so', 'trung_binh_ghep_nhom'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // Nhóm [0; 4): đại diện 2, tần số 5
      // Nhóm [4; 8): đại diện 6, tần số 10
      // Nhóm [8; 12): đại diện 10, tần số 15
      // Nhóm [12; 16): đại diện 14, tần số 10
      // Tổng N = 40
      // Tổng tích = 2*5 + 6*10 + 10*15 + 14*10 = 10 + 60 + 150 + 140 = 360
      // Trung bình = 360 / 40 = 9.0
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Bảng tần số và biểu đồ tần số',
        topic: 'Số trung bình cộng mẫu số liệu ghép nhóm',
        problemType: 'Tính số trung bình của bảng tần số ghép nhóm',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['gia_tri_dai_dien_nhom', 'tich_gia_tri_tan_so', 'trung_binh_ghep_nhom'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Bảng số liệu ghép nhóm thời gian tự học mỗi tuần của $40$ học sinh: Nhóm $[0; 4)$ có $5$ học sinh; Nhóm $[4; 8)$ có $10$ học sinh; Nhóm $[8; 12)$ có $15$ học sinh; Nhóm $[12; 16)$ có $10$ học sinh. Tính số trung bình cộng của mẫu số liệu ghép nhóm này.',
        correctAnswer: '9',
        acceptedAnswers: ['9', '9.0', '9 gio', '9 giờ'],
        solution: 'Bước 1: Xác định giá trị đại diện của từng nhóm: $c_1 = \\frac{0 + 4}{2} = 2$; $c_2 = \\frac{4 + 8}{2} = 6$; $c_3 = \\frac{8 + 12}{2} = 10$; $c_4 = \\frac{12 + 16}{2} = 14$.\\\\nBước 2: Tính tích giá trị đại diện với tần số tương ứng: $2 \\\\cdot 5 = 10$; $6 \\\\cdot 10 = 60$; $10 \\\\cdot 15 = 150$; $14 \\\\cdot 10 = 140$.\\\\nBước 3: Tính tổng các tích: $S = 10 + 60 + 150 + 140 = 360$.\\\\nBước 4: Cỡ mẫu là: $N = 5 + 10 + 15 + 10 = 40$.\\\\nBước 5: Số trung bình cộng là: $\\\\bar{x} = \\frac{S}{N} = \\frac{360}{40} = 9$ (giờ).',
        rubricSteps: [
          { step: 'Tính đúng giá trị đại diện của 4 nhóm: 2, 6, 10, 14', points: 0.2 },
          { step: 'Tính các tích ci * mi của từng nhóm', points: 0.2 },
          { step: 'Tính tổng các tích ra 360', points: 0.2 },
          { step: 'Xác định cỡ mẫu N = 40', points: 0.2 },
          { step: 'Tính ra trung bình cộng x_bar = 9', points: 0.2 },
        ],
        keyFormula: '$\\\\bar{x} = \\frac{\\\\sum c_i n_i}{N}$.',
      };
    },
  },

  {
    id: 'T_G9_C6_VDC_02',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Phép thử ngẫu nhiên và không gian mẫu',
    topic: 'Quy tắc nhân xác suất biến cố độc lập',
    problemType: 'Xác suất trúng ít nhất một lần qua biến cố đối',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'mcq',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['bien_co_doi', 'quy_tac_nhan_xac_suat', 'xac_suat_thuc_nghiem'],
      crossTopic: true,
      modeling: false,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // Bắn 2 phát độc lập. Xác suất trúng mỗi phát là 0.8
      // Xác suất trượt mỗi phát: 0.2
      // Cả hai phát trượt: 0.2 * 0.2 = 0.04
      // Ít nhất một phát trúng = 1 - 0.04 = 0.96
      const { options, correctAnswer } = buildShuffledMcq(
        rng,
        '$0{,}96$',
        [
          { text: '$0{,}64$', errorType: 'TÍNH_XÁC_SUẤT_CẢ_HAI_PHÁT_TRÚNG' },
          { text: '$0{,}80$', errorType: 'CHỈ_LẤY_MỘT_PHÁT' },
          { text: '$0{,}04$', errorType: 'TÍNH_NHẦM_BIẾN_CỐ_ĐỐI' },
        ]
      );
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Phép thử ngẫu nhiên và không gian mẫu',
        topic: 'Quy tắc nhân xác suất biến cố độc lập',
        problemType: 'Xác suất trúng ít nhất một lần qua biến cố đối',
        type: 'mcq',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['bien_co_doi', 'quy_tac_nhan_xac_suat', 'xac_suat_thuc_nghiem'],
          crossTopic: true,
          modeling: false,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Một xạ thủ bắn độc lập $2$ viên đạn vào một mục tiêu. Biết xác suất bắn trúng mục tiêu của mỗi phát bắn là $0{,}8$. Tính xác suất để có ít nhất một viên đạn trúng mục tiêu.',
        options,
        correctAnswer,
        acceptedAnswers: [correctAnswer],
        solution: 'Bước 1: Gọi $A$ là biến cố "Có ít nhất một viên đạn trúng mục tiêu".\\\\nBước 2: Biến cố đối $\\\\bar{A}$ là "Cả hai viên đạn đều trượt mục tiêu".\\\\nBước 3: Xác suất bắn trượt ở mỗi phát là: $1 - 0{,}8 = 0{,}2$.\\\\nBước 4: Vì hai phát bắn độc lập, xác suất cả hai phát đều trượt là: $P(\\\\bar{A}) = 0{,}2 \\\\cdot 0{,}2 = 0{,}04$.\\\\nBước 5: Xác suất có ít nhất một viên trúng mục tiêu là: $P(A) = 1 - P(\\\\bar{A}) = 1 - 0{,}04 = 0{,}96$.',
        rubricSteps: [
          { step: 'Xác định biến cố đối: cả hai phát đều trượt', points: 0.2 },
          { step: 'Tính xác suất bắn trượt mỗi phát là 0.2', points: 0.2 },
          { step: 'Áp dụng quy tắc nhân tính P(A_bar) = 0.04', points: 0.2 },
          { step: 'Áp dụng công thức biến cố đối P(A) = 1 - P(A_bar)', points: 0.2 },
          { step: 'Tính ra xác suất là 0.96', points: 0.2 },
        ],
        keyFormula: '$P(A) = 1 - P(\\\\bar{A})$.',
      };
    },
  },

  {
    id: 'T_G9_C6_VDC_03',
    grade: 9,
    semester: 2,
    chapterId: 'G9_C6',
    lesson: 'Bảng tần số tương đối và biểu đồ tần số tương đối',
    topic: 'Phân tích bảng tần số khuyết hai giá trị',
    problemType: 'Giải hệ phương trình tìm tần số khuyết từ trung bình cộng',
    difficulty: 'hard',
    cognitiveLevel: 'van_dung_cao',
    type: 'essay',
    books: ['KNTT', 'CD', 'CTST'],
    complexity: {
      steps: 5,
      techniques: ['he_phuong_trinh_thong_ke', 'trung_binh_cong_trong_so', 'khoi_phuc_bang_du_lieu'],
      crossTopic: true,
      modeling: true,
      needsCaseAnalysis: false,
      estMinutes: 7,
    },
    generate(rng, book) {
      // Điểm kiểm tra: 6, 7, 8, 9
      // Tần số: điểm 6 có 5 hs, điểm 7 có x hs, điểm 8 có y hs, điểm 9 có 10 hs.
      // Tổng hs = 30 => x + y = 30 - 15 = 15
      // Trung bình = 7.7 => 6*5 + 7x + 8y + 9*10 = 7.7 * 30 = 231
      // 30 + 7x + 8y + 90 = 231 => 7x + 8y = 111
      // 7(x + y) + y = 111 => 7*15 + y = 111 => 105 + y = 111 => y = 6 => x = 9
      return {
        grade: 9,
        semester: 2,
        chapterId: 'G9_C6',
        lesson: 'Bảng tần số tương đối và biểu đồ tần số tương đối',
        topic: 'Phân tích bảng tần số khuyết hai giá trị',
        problemType: 'Giải hệ phương trình tìm tần số khuyết từ trung bình cộng',
        type: 'essay',
        difficulty: 'hard',
        cognitiveLevel: 'van_dung_cao',
        points: 1.0,
        textbooks: [book],
        complexity: {
          steps: 5,
          techniques: ['he_phuong_trinh_thong_ke', 'trung_binh_cong_trong_so', 'khoi_phuc_bang_du_lieu'],
          crossTopic: true,
          modeling: true,
          needsCaseAnalysis: false,
          estMinutes: 7,
        },
        content: 'Bảng điểm kiểm tra của một lớp gồm $30$ học sinh có $4$ mức điểm: Điểm $6$ có $5$ bạn, Điểm $7$ có $x$ bạn, Điểm $8$ có $y$ bạn và Điểm $9$ có $10$ bạn. Biết điểm số trung bình của cả lớp là $7{,}7$. Tìm số học sinh đạt điểm $7$ ($x$) và điểm $8$ ($y$).',
        correctAnswer: 'x = 9, y = 6',
        acceptedAnswers: ['x = 9, y = 6', 'x=9, y=6', '9 và 6', '9 va 6'],
        solution: 'Bước 1: Tổng số học sinh là $30$, ta có: $5 + x + y + 10 = 30 \\\\iff x + y = 15$.\\\\nBước 2: Tổng điểm của toàn bộ $30$ học sinh là: $S = 30 \\\\cdot 7{,}7 = 231$.\\\\nBước 3: Tổng điểm tính theo từng nhóm: $6 \\\\cdot 5 + 7x + 8y + 9 \\\\cdot 10 = 120 + 7x + 8y = 231 \\\\iff 7x + 8y = 111$.\\\\nBước 4: Ta có hệ phương trình: $\\\\begin{cases} x + y = 15 \\\\\\\\ 7x + 8y = 111 \\\\end{cases}$. Nhân phương trình đầu với 7: $7x + 7y = 105$.\\\\nBước 5: Lấy hiệu hai phương trình ta được: $y = 111 - 105 = 6$. Suy ra $x = 15 - 6 = 9$. Vậy $x = 9$ và $y = 6$.',
        rubricSteps: [
          { step: 'Lập phương trình tổng số học sinh x + y = 15', points: 0.2 },
          { step: 'Tính tổng điểm của cả lớp ra 231', points: 0.2 },
          { step: 'Lập phương trình tổng điểm 7x + 8y = 111', points: 0.2 },
          { step: 'Giải hệ tìm được y = 6', points: 0.2 },
          { step: 'Tìm được x = 9 và kết luận nghiệm', points: 0.2 },
        ],
        keyFormula: '$\\\\sum x_i n_i = N \\\\cdot \\\\bar{x}$.',
      };
    },
  },
];
