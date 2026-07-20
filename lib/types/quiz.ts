import type { ChapterStatus } from './progress';

export type QuizType = 'PRE_TEST' | 'POST_TEST' | 'CHAPTER_QUIZ';

export interface QuestionPattern {
  id: string;
  chapterId?: string; // for CHAPTER_QUIZ
  babId?: string; // for PRE_TEST / POST_TEST
  quizType: QuizType;
  patternCode: string; // max 50 chars, unique per chapter/bab+type
  description: string; // max 200 chars
  questionCount: number;
}

export interface Question {
  id: string;
  patternId: string;
  text: string; // max 1000 chars
  options: QuestionOption[];
  correctOptionId?: string; // only for CHAPTER_QUIZ and POST_TEST (admin only)
  xpPerQuestion?: number; // 0-1000, only for CHAPTER_QUIZ and POST_TEST
}

export interface QuestionOption {
  id: string;
  text: string; // max 500 chars
  order: number;
}

export interface QuizSubmission {
  chapterId: string;
  answers: { questionId: string; selectedOptionId: string }[];
}

export interface QuizResult {
  status: 'PASSED' | 'FAILED';
  score: number; // 0-100 percentage
  passingGrade: number;
  nextStatus: ChapterStatus;
  message: string;
  xpEarned?: number;
}

// --- Pre Test Types (level Materi) ---

export interface PreTestSubmission {
  materiId: string;
  answers: { questionId: string; selectedOptionId: string }[];
}

export interface PreTestResult {
  materiId: string;
  startBabIndex: number; // Bab index dimana siswa mulai (0-based)
  startBabName: string;
  totalBabsSkipped: number;
  xpEarned: number; // XP dari Bab yang dilewati (dihitung backend)
  message: string;
}

// --- Post Test Types (level Materi) ---

export interface PostTestSubmission {
  materiId: string;
  answers: { questionId: string; selectedOptionId: string }[];
}

export interface PostTestResult {
  status: 'PASSED' | 'FAILED';
  score: number; // 0-100 percentage
  passingGrade: number;
  xpEarned: number;
  message: string;
  remediationBabIds?: string[];
  remediationBabNames?: string[];
}

// --- Quiz Config (admin) ---

export interface QuizConfig {
  id: string;
  targetId: string; // chapterId atau babId tergantung quizType
  quizType: QuizType;
  passingGrade: number; // 0-100, default 70
  totalPotentialXP: number; // sum of all question XP (calculated)
}
