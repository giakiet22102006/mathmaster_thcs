// ==============================================================================
// MathMaster THCS - Ngữ Cảnh Đặc Trưng Bộ Sách "Cánh Diều"
// File: src/lib/question-engine/contexts/CD.ts
// Đặc trưng: Phân hóa bài tập rõ ràng từ cơ bản đến nâng cao, lập luận toán học logic, cấu trúc tường minh
// ==============================================================================

import type { PRNG } from '../rng';

export const CDContexts = {
  getStudentName(rng: PRNG): string {
    const names = ['Hoàng Nam', 'Bích Ngọc', 'Trung Dũng', 'Hồng Ánh', 'Việt Hoàng', 'Thùy Chi', 'Nhật Minh'];
    return rng.nextChoice(names);
  },

  getLogicHeading(rng: PRNG): string {
    const headings = [
      'Bài toán rèn luyện tư duy logic:',
      'Xét các khẳng định sau trong tập số:',
      'Cho biểu thức đại số với các điều kiện xác định:',
      'Phân tích bài toán theo các bước giải chuẩn mực:',
    ];
    return rng.nextChoice(headings);
  },

  getSportsContext(rng: PRNG) {
    const sports = [
      'Giải chạy việt dã cự ly trung bình của hội khỏe Phù Đổng',
      'Thống kê số lần ném bóng rổ trúng rổ của câu lạc bộ thể thao',
      'Đo thời gian hoàn thành đường bơi 50m của học sinh khối 8',
      'Trận đấu cờ vua giao hữu cấp cụm trường THCS',
    ];
    return rng.nextChoice(sports);
  },

  getGeometricConstruction(rng: PRNG) {
    const constructions = [
      'Dựng hình và chứng minh tính chất song song, vuông góc',
      'Tính khoảng cách giữa hai điểm mốc quan sát qua góc nhìn trắc địa',
      'Mô hình thang nhôm chữ A và định lí góc tạo bởi hai cạnh',
      'Cột cờ trường học và bóng nắng chiếu nghiêng trên mặt đất',
    ];
    return rng.nextChoice(constructions);
  },
};
