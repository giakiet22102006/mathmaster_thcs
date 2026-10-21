// ==============================================================================
// MathMaster THCS - Ngữ Cảnh Đặc Trưng Bộ Sách "Kết Nối Tri Thức Với Cuộc Sống"
// File: src/lib/question-engine/contexts/KNTT.ts
// Đặc trưng: Tình huống thực tế đời sống, ứng dụng STEM, gia đình, nhà trường, kinh tế gia đình
// ==============================================================================

import type { PRNG } from '../rng';

export const KNTTContexts = {
  getStudentName(rng: PRNG): string {
    const names = ['Minh Anh', 'Bảo Nam', 'Khánh Linh', 'Tuấn Kiệt', 'Hà My', 'Đức Huy', 'Phương Thảo', 'Quang Hải'];
    return rng.nextChoice(names);
  },

  getRealLifeShopping(rng: PRNG) {
    const items = [
      { item: 'quyển vở ô ly', price: rng.nextInt(7, 12) * 1000 },
      { item: 'bút bi Thiên Long', price: rng.nextInt(4, 8) * 1000 },
      { item: 'hộp bút màu sáp', price: rng.nextInt(25, 45) * 1000 },
      { item: 'bộ êke compa', price: rng.nextInt(15, 30) * 1000 },
    ];
    return rng.nextChoice(items);
  },

  getEnvironmentalContext(rng: PRNG) {
    const scenarios = [
      'Phong trào thu gom giấy vụn làm Kế hoạch nhỏ của trường',
      'Chiến dịch trồng cây xanh phủ bóng mát khuôn viên trường học',
      'Chương trình tiết kiệm điện và nước sạch trong hộ gia đình',
      'Hoạt động quyên góp sách vở ủng hộ học sinh vùng lũ lụt',
    ];
    return rng.nextChoice(scenarios);
  },

  getHouseholdPlotContext(rng: PRNG) {
    const plots = [
      'Mảnh vườn hình chữ nhật trồng rau sạch của gia đình bác An',
      'Khu đất hình vuông trồng hoa cúc phục vụ dịp Tết của hợp tác xã',
      'Sân chơi thể thao lát gạch chống trượt của trường THCS',
      'Bồn hoa hình thoi trang trí giữa sân trường',
    ];
    return rng.nextChoice(plots);
  },
};
