// ==============================================================================
// MathMaster THCS - Định Nghĩa Kiểu Dữ Liệu Question Engine
// File: src/lib/question-engine/types.ts
// ==============================================================================

import type { PRNG } from './rng';
import type { ComplexityMeta } from './difficulty-standard';

export type { ComplexityMeta };

export type TextbookCode = 'KNTT' | 'CD' | 'CTST';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type CognitiveLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';
export type QuestionType = 'mcq' | 'essay';

export interface QuestionOption {
  label: 'A' | 'B' | 'C' | 'D' | string;
  text: string;
  errorType?: string;
}

export interface RubricStep {
  step: string;
  points: number;
}

export interface EngineQuestion {
  id: string;
  code: string;
  grade: number;
  textbooks: TextbookCode[];
  semester: 1 | 2;
  chapterId: string;
  lesson: string;
  topic: string;
  problemType: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  cognitiveLevel: CognitiveLevel;
  points: number;
  content: string;
  options?: QuestionOption[];
  correctAnswer: string;
  acceptedAnswers: string[];
  solution: string;
  rubricSteps: RubricStep[];
  keyFormula?: string;
  commonMistake?: string;
  source: string;
  verificationStatus: 'verified' | 'draft';
  verifiedBy?: string;
  verifiedAt?: string;
  version: number;
  fingerprint?: string;
  mathExpressionToVerify?: string;
  complexity?: ComplexityMeta;
  difficultyScore?: number;
}

export interface QuestionTemplate {
  id: string;
  grade: number;
  semester: 1 | 2;
  chapterId: string;
  lesson: string;
  topic: string;
  problemType: string;
  difficulty: DifficultyLevel;
  cognitiveLevel: CognitiveLevel;
  type: QuestionType;
  books: TextbookCode[];
  complexity?: ComplexityMeta;
  isNonDegenerate?: (params: any) => boolean;
  verifyFn?: (q: EngineQuestion) => boolean;
  generate: (rng: PRNG, book: TextbookCode) => Omit<EngineQuestion, 'id' | 'code' | 'source' | 'verificationStatus' | 'version'>;
}

export interface GenerateQuestionsOptions {
  grade: number;
  textbook?: TextbookCode | 'ALL';
  chapterIds?: string[];
  semester?: 1 | 2 | 0; // 0 = cả 2 kỳ
  difficulty?: DifficultyLevel;
  cognitiveLevel?: CognitiveLevel;
  type?: QuestionType | 'ALL';
  count: number;
  excludeFingerprints?: Set<string> | string[];
  seed?: number | string;
  maxPerTemplate?: number;
}
