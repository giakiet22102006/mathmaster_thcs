// ==============================================================================
// MathMaster THCS - Hằng Số & Bộ Tính Quota Ma Trận Đề Nhẹ Cho Client (/exams/new)
// Tách riêng khỏi bộ chấm điểm đại số lớn để giảm kích thước JS tải lần đầu
// ==============================================================================

export type CognitiveLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'very_hard';
export type ExamPresetKey = 'co_ban' | 'trung_binh' | 'nang_cao' | 'thi_vao_10';

export const COGNITIVE_LEVELS: CognitiveLevel[] = [
  'nhan_biet',
  'thong_hieu',
  'van_dung',
  'van_dung_cao',
];

export const EXAM_MATRIX_PRESETS: Record<
  ExamPresetKey,
  {
    label: string;
    description: string;
    ratios: Record<CognitiveLevel, number>;
  }
> = {
  co_ban: {
    label: 'Cơ bản (Ôn tập nền tảng)',
    description: '70% Nhận biết - 30% Thông hiểu - 0% Vận dụng - 0% Vận dụng cao',
    ratios: { nhan_biet: 70, thong_hieu: 30, van_dung: 0, van_dung_cao: 0 },
  },
  trung_binh: {
    label: 'Trung bình (Chuẩn kiểm tra định kỳ)',
    description: '30% Nhận biết - 50% Thông hiểu - 20% Vận dụng - 0% Vận dụng cao',
    ratios: { nhan_biet: 30, thong_hieu: 50, van_dung: 20, van_dung_cao: 0 },
  },
  nang_cao: {
    label: 'Nâng cao (Học sinh khá giỏi)',
    description: '10% Nhận biết - 30% Thông hiểu - 40% Vận dụng - 20% Vận dụng cao',
    ratios: { nhan_biet: 10, thong_hieu: 30, van_dung: 40, van_dung_cao: 20 },
  },
  thi_vao_10: {
    label: 'Tổng hợp / Thi vào 10',
    description: '10% Nhận biết - 30% Thông hiểu - 35% Vận dụng - 25% Vận dụng cao',
    ratios: { nhan_biet: 10, thong_hieu: 30, van_dung: 35, van_dung_cao: 25 },
  },
};

export function resolveQuestionCognitiveLevel(question: any): CognitiveLevel {
  const cog = String(question?.cognitiveLevel || '').trim().toLowerCase();
  if (
    cog === 'nhan_biet' ||
    cog === 'thong_hieu' ||
    cog === 'van_dung' ||
    cog === 'van_dung_cao'
  ) {
    return cog;
  }
  const diff = String(question?.difficulty || '').trim().toLowerCase();
  if (diff === 'easy') return 'nhan_biet';
  if (diff === 'medium') return 'thong_hieu';
  if (diff === 'very_hard') return 'van_dung_cao';
  if (diff === 'hard') return 'van_dung';
  return 'thong_hieu';
}

export function allocateQuotaLargestRemainder(
  totalCount: number,
  ratios: Record<CognitiveLevel, number>
): Record<CognitiveLevel, number> {
  const sumRatios =
    (Number(ratios.nhan_biet) || 0) +
    (Number(ratios.thong_hieu) || 0) +
    (Number(ratios.van_dung) || 0) +
    (Number(ratios.van_dung_cao) || 0);

  const normalized: Record<CognitiveLevel, number> =
    sumRatios > 0
      ? {
          nhan_biet: ((Number(ratios.nhan_biet) || 0) / sumRatios) * 100,
          thong_hieu: ((Number(ratios.thong_hieu) || 0) / sumRatios) * 100,
          van_dung: ((Number(ratios.van_dung) || 0) / sumRatios) * 100,
          van_dung_cao: ((Number(ratios.van_dung_cao) || 0) / sumRatios) * 100,
        }
      : { nhan_biet: 30, thong_hieu: 50, van_dung: 20, van_dung_cao: 0 };

  const exactQuotas = COGNITIVE_LEVELS.map((level, orderIdx) => {
    const exact = (totalCount * normalized[level]) / 100;
    const floorVal = Math.floor(exact + 1e-9);
    const remainder = exact - floorVal;
    return { level, exact, floorVal, remainder, ratio: normalized[level], orderIdx };
  });

  const result: Record<CognitiveLevel, number> = {
    nhan_biet: 0,
    thong_hieu: 0,
    van_dung: 0,
    van_dung_cao: 0,
  };

  let allocated = 0;
  for (const item of exactQuotas) {
    result[item.level] = item.floorVal;
    allocated += item.floorVal;
  }

  let remaining = totalCount - allocated;
  if (remaining > 0) {
    const sortedByRemainder = [...exactQuotas].sort((a, b) => {
      if (Math.abs(b.remainder - a.remainder) > 1e-9) {
        return b.remainder - a.remainder;
      }
      if (Math.abs(b.ratio - a.ratio) > 1e-9) {
        return b.ratio - a.ratio;
      }
      return a.orderIdx - b.orderIdx;
    });
    for (let i = 0; i < remaining; i++) {
      const target = sortedByRemainder[i % sortedByRemainder.length];
      result[target.level] += 1;
    }
  }

  return result;
}
