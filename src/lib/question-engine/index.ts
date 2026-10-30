// ==============================================================================
// MathMaster THCS - Question Engine Core API
// File: src/lib/question-engine/index.ts
// ==============================================================================

import crypto from 'node:crypto';
import { Mulberry32, type PRNG } from './rng';
import { verifyQuestion, type VerificationResult } from './verify';
import { computeDifficultyScore } from './difficulty-standard';
import { grade6Templates } from './templates/grade6';
import { grade6VdVdcTemplates } from './templates/grade6-vd-vdc';
import { grade7Templates } from './templates/grade7';
import { grade7VdcTemplates } from './templates/grade7-vdc';
import { grade8Templates } from './templates/grade8';
import { grade8VdcTemplates } from './templates/grade8-vdc';
import { grade9Templates } from './templates/grade9';
import { grade9VdcTemplates } from './templates/grade9-vdc';
import type {
  EngineQuestion,
  QuestionTemplate,
  GenerateQuestionsOptions,
  TextbookCode,
  DifficultyLevel,
  CognitiveLevel,
  QuestionType,
  QuestionOption,
} from './types';

export * from './types';
export { Mulberry32, createRNG } from './rng';
export { verifyQuestion } from './verify';

// Gom toàn bộ template 4 khối lớp (bao gồm cả các bộ chuyên sâu VD/VDC)
export const ALL_TEMPLATES: QuestionTemplate[] = [
  ...grade6Templates,
  ...grade6VdVdcTemplates,
  ...grade7Templates,
  ...grade7VdcTemplates,
  ...grade8Templates,
  ...grade8VdcTemplates,
  ...grade9Templates,
  ...grade9VdcTemplates,
];

/**
 * Trả về danh sách tất cả các template hiện có trong hệ thống
 */
export function getAllTemplates(): QuestionTemplate[] {
  return ALL_TEMPLATES;
}

/**
 * Lấy các template phù hợp với bộ lọc
 */
export function getTemplates(filter: {
  grade?: number;
  semester?: 1 | 2 | 0;
  chapterId?: string;
  difficulty?: DifficultyLevel;
  cognitiveLevel?: CognitiveLevel;
  type?: QuestionType | 'ALL';
  textbook?: TextbookCode | 'ALL';
}): QuestionTemplate[] {
  return ALL_TEMPLATES.filter((t) => {
    if (filter.grade && t.grade !== filter.grade) return false;
    if (filter.semester && filter.semester !== 0 && t.semester !== filter.semester) return false;
    if (filter.chapterId && t.chapterId !== filter.chapterId) return false;
    if (filter.difficulty && t.difficulty !== filter.difficulty) return false;
    if (filter.cognitiveLevel && t.cognitiveLevel !== filter.cognitiveLevel) return false;
    if (filter.type && filter.type !== 'ALL' && t.type !== filter.type) return false;
    if (filter.textbook && filter.textbook !== 'ALL' && !t.books.includes(filter.textbook)) return false;
    return true;
  });
}

/**
 * Tính mã băm fingerprint xác định câu hỏi trùng lặp
 */
export function computeFingerprint(content: string, options?: QuestionOption[]): string {
  const normContent = (content || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\u00C0-\u024F\u1EA0-\u1EF9]/gi, '')
    .trim();

  let optionsStr = '';
  if (options && options.length > 0) {
    optionsStr = options
      .map((o) => o.text.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, ''))
      .sort()
      .join('|');
  }

  return crypto
    .createHash('sha256')
    .update(`${normContent}:::${optionsStr}`)
    .digest('hex');
}

/**
 * Sinh danh sách câu hỏi tham số hóa tự động với thẩm định độc lập
 */
export function generateQuestions(options: GenerateQuestionsOptions): {
  questions: EngineQuestion[];
  stats: {
    requested: number;
    generated: number;
    retries: number;
    rejected: number;
  };
} {
  const {
    grade,
    textbook = 'ALL',
    chapterIds,
    semester = 0,
    difficulty,
    cognitiveLevel,
    type = 'ALL',
    count,
    seed,
  } = options;

  const prngSeed =
    typeof seed === 'number'
      ? seed
      : typeof seed === 'string'
      ? Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0)
      : Math.floor(Math.random() * 2147483647);

  const rng = new Mulberry32(prngSeed);

  // Tập hợp các fingerprint đã tồn tại để tránh trùng lặp
  const seenFingerprints = new Set<string>();
  if (options.excludeFingerprints) {
    if (options.excludeFingerprints instanceof Set) {
      for (const fp of options.excludeFingerprints) seenFingerprints.add(fp);
    } else if (Array.isArray(options.excludeFingerprints)) {
      for (const fp of options.excludeFingerprints) seenFingerprints.add(fp);
    }
  }

  // Tập hợp các nội dung đã tồn tại để tránh sinh câu có cùng đề bài
  const seenContents = new Set<string>();
  if (options.excludeContents) {
    if (options.excludeContents instanceof Set) {
      for (const c of options.excludeContents) seenContents.add(c);
    } else if (Array.isArray(options.excludeContents)) {
      for (const c of options.excludeContents) seenContents.add(c);
    }
  }

  // Tìm các template thỏa mãn tiêu chí (cognitiveLevel là nguồn sự thật tối cao)
  let candidateTemplates = ALL_TEMPLATES.filter((t) => {
    if (t.grade !== grade) return false;
    if (semester !== 0 && t.semester !== semester) return false;
    if (chapterIds && chapterIds.length > 0 && !chapterIds.includes(t.chapterId)) return false;
    if (cognitiveLevel && t.cognitiveLevel !== cognitiveLevel) return false;
    if (difficulty && !cognitiveLevel && t.difficulty !== difficulty) return false;
    if (type !== 'ALL' && t.type !== type) return false;
    if (textbook !== 'ALL' && !t.books.includes(textbook)) return false;
    return true;
  });

  const relaxed: string[] = [];

  // Nới lỏng an toàn (A.5.1): TUYỆT ĐỐI KHÔNG NỚI LỎNG cognitiveLevel hay grade!
  // 1. Nếu không tìm thấy, thử nới lỏng textbook (nếu người dùng chỉ định 1 bộ sách nhưng thiếu)
  if (candidateTemplates.length === 0 && textbook !== 'ALL') {
    candidateTemplates = ALL_TEMPLATES.filter((t) => {
      if (t.grade !== grade) return false;
      if (semester !== 0 && t.semester !== semester) return false;
      if (chapterIds && chapterIds.length > 0 && !chapterIds.includes(t.chapterId)) return false;
      if (cognitiveLevel && t.cognitiveLevel !== cognitiveLevel) return false;
      if (difficulty && !cognitiveLevel && t.difficulty !== difficulty) return false;
      if (type !== 'ALL' && t.type !== type) return false;
      return true;
    });
    if (candidateTemplates.length > 0) {
      relaxed.push('textbook');
    }
  }

  // 2. Nếu vẫn không có, thử nới lỏng semester (cho phép lấy template chương đó ở học kỳ khác nếu có)
  if (candidateTemplates.length === 0 && semester !== 0) {
    candidateTemplates = ALL_TEMPLATES.filter((t) => {
      if (t.grade !== grade) return false;
      if (chapterIds && chapterIds.length > 0 && !chapterIds.includes(t.chapterId)) return false;
      if (cognitiveLevel && t.cognitiveLevel !== cognitiveLevel) return false;
      if (difficulty && !cognitiveLevel && t.difficulty !== difficulty) return false;
      if (type !== 'ALL' && t.type !== type) return false;
      return true;
    });
    if (candidateTemplates.length > 0) {
      relaxed.push('semester');
    }
  }

  // Nếu vẫn không có template đúng mức nhận thức và khối lớp, KHÔNG BAO GIỜ LẤY CÂU DỄ HƠN!
  if (candidateTemplates.length === 0) {
    return {
      questions: [],
      stats: {
        requested: count,
        generated: 0,
        retries: 0,
        rejected: 0,
        shortage: cognitiveLevel ? { [cognitiveLevel]: count } : undefined,
        relaxed,
      },
    };
  }

  const generatedQuestions: EngineQuestion[] = [];
  const maxPerTemplate = options.maxPerTemplate ?? 2;
  const templateUsage = new Map<string, number>();
  let retries = 0;
  let rejected = 0;
  const maxAttempts = Math.max(count * 20, 100);
  let attempts = 0;

  while (generatedQuestions.length < count && attempts < maxAttempts) {
    attempts++;
    const usableTemplates = candidateTemplates.filter(
      (t) => (templateUsage.get(t.id) || 0) < maxPerTemplate
    );
    if (usableTemplates.length === 0) {
      // Đã đạt giới hạn tối đa số câu lặp lại cho các template hiện có
      break;
    }
    const template = rng.pick(usableTemplates);

    // Xác định bộ sách thực tế
    let selectedBook: TextbookCode = 'KNTT';
    if (textbook !== 'ALL' && template.books.includes(textbook)) {
      selectedBook = textbook;
    } else {
      selectedBook = rng.pick(template.books);
    }

    try {
      const rawQ = template.generate(rng, selectedBook);
      const fp = computeFingerprint(rawQ.content, rawQ.options);
      const normContent = (rawQ.content || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^a-z0-9\u00C0-\u024F\u1EA0-\u1EF9]/gi, '')
        .trim();

      // Tránh trùng lặp cả về fingerprint lẫn chuỗi nội dung câu hỏi
      if (seenFingerprints.has(fp) || (normContent && seenContents.has(normContent))) {
        retries++;
        continue;
      }

      const randomSuffix = Math.abs(rng.nextInt(100000, 999999));
      const fullId = `Q_GEN_G${template.grade}_${template.chapterId}_${randomSuffix}`;
      const code = `GEN-${template.id}-${rng.nextInt(1000, 9999)}`;

      const complexity = template.complexity || rawQ.complexity;
      const difficultyScore = computeDifficultyScore(template.cognitiveLevel, complexity);

      const question: EngineQuestion = {
        ...rawQ,
        id: fullId,
        code,
        source: `Parametric Engine (${selectedBook})`,
        verificationStatus: 'verified',
        verifiedBy: 'auto-engine',
        verifiedAt: new Date().toISOString(),
        version: 1,
        fingerprint: fp,
        complexity,
        difficultyScore,
      };

      // Kiểm tra tính không suy biến nếu template định nghĩa
      if (template.isNonDegenerate && !template.isNonDegenerate(question)) {
        rejected++;
        continue;
      }

      // Thẩm định độc lập với verifyQuestion
      const verification = verifyQuestion(question);
      if (!verification.valid) {
        rejected++;
        continue;
      }

      // Kiểm tra độc lập bổ sung nếu có verifyFn
      if (template.verifyFn && !template.verifyFn(question)) {
        rejected++;
        continue;
      }

      seenFingerprints.add(fp);
      if (normContent) seenContents.add(normContent);
      templateUsage.set(template.id, (templateUsage.get(template.id) || 0) + 1);
      generatedQuestions.push(question);
    } catch {
      rejected++;
    }
  }

  return {
    questions: generatedQuestions,
    stats: {
      requested: count,
      generated: generatedQuestions.length,
      retries,
      rejected,
      shortage:
        cognitiveLevel && generatedQuestions.length < count
          ? { [cognitiveLevel]: count - generatedQuestions.length }
          : undefined,
      relaxed,
    },
  };
}
