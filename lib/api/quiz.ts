import apiClient from './client';
import { withRetry } from './retry';
import type { Question, QuizSubmission, QuizResult } from '@/lib/types';

/**
 * Load quiz questions for a chapter.
 * Retries on server/connection errors.
 */
export async function getQuestions(chapterId: string): Promise<Question[]> {
  return withRetry(async () => {
    const response = await apiClient.get<Question[]>(
      `/api/v1/quiz/chapter/${chapterId}/questions`
    );
    return response.data;
  });
}

/**
 * Submit quiz answers for scoring.
 * Does NOT auto-retry — answers are preserved client-side on failure.
 */
export async function submitQuiz(submission: QuizSubmission): Promise<QuizResult> {
  const response = await apiClient.post<QuizResult>('/api/v1/quiz/submit', submission);
  return response.data;
}
