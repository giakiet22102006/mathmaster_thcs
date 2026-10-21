// ==============================================================================
// MathMaster THCS - Tiêu Chuẩn & Sàn Độ Khó Nhận Thức (GDPT 2018)
// File: src/lib/question-engine/difficulty-standard.ts
// ==============================================================================

import type { CognitiveLevel } from './types';

export interface ComplexityMeta {
  steps: number;               // Số bước suy luận độc lập trong lời giải
  techniques: string[];        // Kỹ thuật/kiến thức khác nhau phải sử dụng
  crossTopic: boolean;         // Kết hợp >= 2 chủ đề hoặc chương
  modeling: boolean;           // Phải tự đặt ẩn/thiết lập mô hình từ ngữ cảnh thực tế
  needsCaseAnalysis: boolean;  // Biện luận điều kiện / xét trường hợp / loại nghiệm ngoại lai
  estMinutes: number;          // Thời gian giải ước tính của học sinh khá (phút)
}

export interface DifficultyFloor {
  minSteps: number;
  minTechniques: number;
  requireCrossOrCase: boolean;
  requireModelingOrMultiTech: boolean;
  minEstMinutes: number;
  maxEstMinutes: number;
}

export const DIFFICULTY_FLOORS: Record<CognitiveLevel, DifficultyFloor> = {
  nhan_biet: {
    minSteps: 1,
    minTechniques: 1,
    requireCrossOrCase: false,
    requireModelingOrMultiTech: false,
    minEstMinutes: 0.5,
    maxEstMinutes: 2,
  },
  thong_hieu: {
    minSteps: 2,
    minTechniques: 1,
    requireCrossOrCase: false,
    requireModelingOrMultiTech: false,
    minEstMinutes: 1,
    maxEstMinutes: 3,
  },
  van_dung: {
    minSteps: 3,
    minTechniques: 2,
    requireCrossOrCase: false,
    requireModelingOrMultiTech: true, // techniques >= 2 HOẶC modeling === true
    minEstMinutes: 3,
    maxEstMinutes: 6,
  },
  van_dung_cao: {
    minSteps: 5,
    minTechniques: 2,
    requireCrossOrCase: true,         // (crossTopic === true HOẶC needsCaseAnalysis === true)
    requireModelingOrMultiTech: true,
    minEstMinutes: 6,
    maxEstMinutes: 12,
  },
};

/**
 * Kiểm tra xem một câu hỏi có đạt sàn độ khó tối thiểu theo mức độ nhận thức hay không.
 * Nguyên tắc: Sàn độ khó, không có trần (cho phép khó hơn mức trung bình, cấm dễ hơn).
 */
export function validateComplexityFloor(
  level: CognitiveLevel,
  complexity?: ComplexityMeta
): { valid: boolean; reason?: string } {
  if (!complexity) {
    // Nếu chưa có complexity, tạm thời hợp lệ cho nhận biết / thông hiểu, nhưng cảnh báo với VD / VDC
    if (level === 'van_dung' || level === 'van_dung_cao') {
      return {
        valid: false,
        reason: `Mức ${level} bắt buộc phải khai báo complexity meta chi tiết.`,
      };
    }
    return { valid: true };
  }

  const floor = DIFFICULTY_FLOORS[level];
  if (!floor) return { valid: true };

  // 1. Kiểm tra số bước suy luận (steps)
  if (complexity.steps < floor.minSteps) {
    return {
      valid: false,
      reason: `Câu ${level} chỉ có ${complexity.steps} bước suy luận (< sàn tối thiểu ${floor.minSteps} bước).`,
    };
  }

  // 2. Kiểm tra số kỹ thuật / phương pháp (techniques)
  if (complexity.techniques.length < floor.minTechniques) {
    return {
      valid: false,
      reason: `Câu ${level} chỉ dùng ${complexity.techniques.length} kỹ thuật (< sàn tối thiểu ${floor.minTechniques} kỹ thuật).`,
    };
  }

  // 3. Kiểm tra yêu cầu đặc thù của Vận dụng
  if (level === 'van_dung') {
    const hasMultiTechOrModeling = complexity.techniques.length >= 2 || complexity.modeling;
    if (!hasMultiTechOrModeling) {
      return {
        valid: false,
        reason: `Câu van_dung phải có ít nhất 2 kỹ thuật toán học hoặc đòi hỏi tự lập mô hình toán thực tế (modeling).`,
      };
    }
  }

  // 4. Kiểm tra yêu cầu đặc thù của Vận dụng cao
  if (level === 'van_dung_cao') {
    const hasCrossOrCase = complexity.crossTopic || complexity.needsCaseAnalysis;
    if (!hasCrossOrCase) {
      return {
        valid: false,
        reason: `Câu van_dung_cao bắt buộc phải kết hợp liên chuyên đề (crossTopic) hoặc cần biện luận trường hợp/loại nghiệm (needsCaseAnalysis).`,
      };
    }
  }

  return { valid: true };
}

/**
 * Tính điểm số độ khó (Difficulty Score) từ 1.0 đến 10.0 dựa trên siêu dữ liệu phức tạp
 */
export function computeDifficultyScore(
  level: CognitiveLevel,
  complexity?: ComplexityMeta
): number {
  const baseScores: Record<CognitiveLevel, number> = {
    nhan_biet: 2.0,
    thong_hieu: 4.5,
    van_dung: 7.0,
    van_dung_cao: 9.0,
  };

  let score = baseScores[level] || 5.0;
  if (!complexity) return score;

  // Điều chỉnh theo số bước (+0.2 mỗi bước vượt sàn, tối đa +1.0)
  const floor = DIFFICULTY_FLOORS[level];
  if (complexity.steps > floor.minSteps) {
    score += Math.min(1.0, (complexity.steps - floor.minSteps) * 0.2);
  }

  // Điều chỉnh theo liên chuyên đề & biện luận
  if (complexity.crossTopic) score += 0.3;
  if (complexity.needsCaseAnalysis) score += 0.3;
  if (complexity.modeling) score += 0.2;

  // Giới hạn trong khoảng [1.0, 10.0]
  return Math.min(10.0, Math.max(1.0, Math.round(score * 10) / 10));
}
