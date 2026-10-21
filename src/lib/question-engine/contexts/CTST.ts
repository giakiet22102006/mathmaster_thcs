// ==============================================================================
// MathMaster THCS - Ngữ Cảnh Đặc Trưng Bộ Sách "Chân Trời Sáng Tạo"
// File: src/lib/question-engine/contexts/CTST.ts
// Đặc trưng: Hoạt động khám phá, trải nghiệm không gian, mô hình thực nghiệm, dự án học tập, thiết kế sáng tạo
// ==============================================================================

import type { PRNG } from '../rng';

export const CTSTContexts = {
  getStudentName(rng: PRNG): string {
    const names = ['Thanh Trúc', 'Gia Huy', 'Thảo Nguyên', 'Đăng Khoa', 'Bảo Châu', 'Minh Quân', 'Khánh An'];
    return rng.nextChoice(names);
  },

  getDiscoveryPrompt(rng: PRNG): string {
    const prompts = [
      'Qua hoạt động khám phá thực nghiệm đo đạc:',
      'Trong dự án "Toán học và Đời sống quanh em":',
      'Thực hiện hoạt động trải nghiệm thiết kế mô hình:',
      'Từ bảng số liệu thu thập trong chuyến tham quan học tập:',
    ];
    return rng.nextChoice(prompts);
  },

  getDesignContext(rng: PRNG) {
    const designs = [
      'Thiết kế khung tranh treo tường trang trí phòng học',
      'Cắt gấp hộp quà hình lăng trụ đứng tam giác hoặc hình hộp',
      'Lắp ráp cánh diều hình thoi với hai thanh tre làm khung chéo',
      'Trang trí họa tiết đối xứng trên gạch lát nền mỹ thuật',
    ];
    return rng.nextChoice(designs);
  },

  getScienceContext(rng: PRNG) {
    const sciences = [
      'Thí nghiệm đo nhiệt độ thay đổi của nước trong phòng thực hành',
      'Quan sát kính thiên văn và đo khoảng cách góc trong thiên văn học sơ cấp',
      'Xác suất lấy ngẫu nhiên các hạt đậu xanh nảy mầm trong dự án Sinh học',
      'Mô hình khí động học của chong chóng xoay trong gió',
    ];
    return rng.nextChoice(sciences);
  },
};
