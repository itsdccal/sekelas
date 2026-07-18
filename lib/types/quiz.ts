import type { ChapterStatus } from './progress';

export interface QuestionPattern {
  id: string;
  chapterId: string;
  patternCode: string; // max 50 chars, unique per chapter
  description: string; // max 200 chars
  questionCount: number;
}

export interface Question {
  id: string;
  patternId: string;
  text: string; // max 1000 chars
  options: QuestionOption[];
  correctOptionId?: string; // only visible to admin
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
}
