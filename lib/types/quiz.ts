import type { ChapterStatus } from './progress';

export type QuizType = 'PRE_TEST' | 'POST_TEST' | 'CHAPTER_QUIZ';

export type QuestionType = 'MULTIPLE_CHOICE' | 'SHORT_ANSWER';

export interface QuestionPattern {
  id: string;
  chapterId?: string; // for CHAPTER_QUIZ
  sectionId?: string; // for PRE_TEST / POST_TEST
  quizType: QuizType;
  patternCode: string; // max 50 chars, unique per chapter/section+type
  description: string; // max 200 chars
  questionCount: number;
}

export interface Question {
  id: string;
  patternId: string;
  text: string; // max 1000 chars, supports LaTeX notation with $..$ or $$..$$
  questionType?: QuestionType; // tipe soal (default: MULTIPLE_CHOICE)
  options: QuestionOption[]; // only for MULTIPLE_CHOICE
  correctOptionId?: string; // only for MULTIPLE_CHOICE (admin only)
  xpPerQuestion?: number; // 0-1000, only for CHAPTER_QUIZ and POST_TEST
  weight?: number; // 1-100, weight of question toward total score (default 1)
  subjectLabel?: string; // label materi asal (for Pre/Post Test UTBK-style)
  imageUrl?: string; // URL gambar soal (optional)
}

export interface QuestionOption {
  id: string;
  text: string; // max 500 chars
  order: number;
}

export interface QuizSubmission {
  chapterId: string;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionId?: string; // for MULTIPLE_CHOICE
  textAnswer?: string; // for ESSAY and SHORT_ANSWER
}

export interface QuizResult {
  status: 'PASSED' | 'FAILED' | 'PENDING_REVIEW';
  score: number; // 0-100 percentage (only for auto-graded questions)
  passingGrade: number;
  nextStatus: ChapterStatus;
  message: string;
  xpEarned?: number;
  reviewDetails?: QuizReviewItem[]; // only when PASSED, shows correct/incorrect per question
}

export interface QuizReviewItem {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  isCorrect: boolean | null; // null = pending review (essay/short answer)
  selectedOptionId?: string;
  correctOptionId?: string;
  textAnswer?: string;
}

// --- Pre Test Types (level Subject) ---

export interface PreTestSubmission {
  subjectId: string;
  answers: { questionId: string; selectedOptionId?: string; textAnswer?: string }[];
}

export interface PreTestResult {
  subjectId: string;
  status: 'PLACED' | 'PENDING_PLACEMENT'; // PENDING_PLACEMENT = ada soal isian, menunggu penilaian admin
  startSectionIndex: number; // hanya valid jika status = PLACED
  startSectionName: string;  // hanya valid jika status = PLACED
  totalSectionsSkipped: number;
  xpEarned: number;
  message: string;
}

// --- Post Test Types (level Subject) ---

export interface PostTestSubmission {
  subjectId: string;
  answers: { questionId: string; selectedOptionId: string }[];
}

export interface PostTestResult {
  status: 'PASSED' | 'FAILED';
  score: number; // 0-100 percentage
  passingGrade: number;
  xpEarned: number;
  message: string;
  remediationSectionIds?: string[];
  remediationSectionNames?: string[];
}

// --- Quiz Config (admin) ---

export interface QuizConfig {
  id: string;
  targetId: string; // chapterId or sectionId depending on quizType
  quizType: QuizType;
  passingGrade: number; // 0-100, default 70
  totalPotentialXP: number; // sum of all question XP (calculated)
}
