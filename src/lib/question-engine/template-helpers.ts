// ==============================================================================
// MathMaster THCS - Tiện Ích Hỗ Trợ Xây Dựng Template Câu Hỏi
// File: src/lib/question-engine/template-helpers.ts
// ==============================================================================

import type { PRNG } from './rng';
import type { QuestionOption, RubricStep } from './types';

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a * b) / gcd(a, b));
}

export function formatFraction(numerator: number, denominator: number): string {
  if (denominator === 0) throw new Error('Denominator cannot be 0');
  if (denominator < 0) {
    numerator = -numerator;
    denominator = -denominator;
  }
  const g = gcd(numerator, denominator);
  const n = numerator / g;
  const d = denominator / g;
  if (d === 1) return `${n}`;
  return `\\frac{${n}}{${d}}`;
}

export interface OptionDraft {
  value: string;
  isCorrect: boolean;
  errorType?: string;
}

/**
 * Tạo danh sách 4 phương án MCQ đã được xáo trộn và gán nhãn A, B, C, D
 */
export function buildShuffledMcq(
  rng: PRNG,
  correctText: string,
  distractors: Array<{ text: string; errorType?: string }>
): { options: QuestionOption[]; correctAnswer: string } {
  // Lọc trùng lặp phương án nhiễu
  const cleanCorrect = correctText.trim();
  const validDistractors: Array<{ text: string; errorType?: string }> = [];
  const seenTexts = new Set<string>([cleanCorrect.toLowerCase()]);

  for (const d of distractors) {
    const t = d.text.trim();
    if (t && !seenTexts.has(t.toLowerCase())) {
      seenTexts.add(t.toLowerCase());
      validDistractors.push({ text: t, errorType: d.errorType });
    }
  }

  // Nếu không đủ 3 phương án nhiễu phân biệt, bổ sung phương án dự phòng
  let fallbackCounter = 1;
  while (validDistractors.length < 3) {
    const fallbackText = `$${fallbackCounter + 10}$`;
    if (!seenTexts.has(fallbackText.toLowerCase())) {
      seenTexts.add(fallbackText.toLowerCase());
      validDistractors.push({ text: fallbackText, errorType: 'TÍNH_TOÁN_SAI' });
    }
    fallbackCounter++;
  }

  const rawOptions: Array<{ text: string; isCorrect: boolean; errorType?: string }> = [
    { text: cleanCorrect, isCorrect: true },
    ...validDistractors.slice(0, 3).map((d) => ({ text: d.text, isCorrect: false, errorType: d.errorType })),
  ];

  const shuffled = rng.shuffle(rawOptions);
  const labels = ['A', 'B', 'C', 'D'];
  let correctAnswer = 'A';

  const options: QuestionOption[] = shuffled.map((item, index) => {
    const label = labels[index];
    if (item.isCorrect) {
      correctAnswer = label;
    }
    return {
      label,
      text: item.text,
      ...(item.errorType ? { errorType: item.errorType } : {}),
    };
  });

  return { options, correctAnswer };
}
