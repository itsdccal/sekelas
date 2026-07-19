import apiClient from './client';
import { withRetry } from './retry';
import type { Question, PostTestSubmission, PostTestResult } from '@/lib/types';

/**
 * Load Post Test questions for a Bab.
 * Retries on server/connection errors.
 */
export async function getPostTestQuestions(babId: string): Promise<Question[]> {
  return withRetry(async () => {
    const response = await apiClient.get<Question[]>(
      `/api/v1/posttest/bab/${babId}/questions`
    );
    return response.data;
  });
}

/**
 * Submit Post Test answers for scoring.
 * Does NOT auto-retry — answers are preserved client-side on failure.
 */
export async function submitPostTest(submission: PostTestSubmission): Promise<PostTestResult> {
  const response = await apiClient.post<PostTestResult>('/api/v1/posttest/submit', submission);
  return response.data;
}

/**
 * Check Post Test status for a Bab.
 * Returns whether Post Test is available, completed, and the score.
 */
export async function getPostTestStatus(babId: string): Promise<{
  available: boolean;
  completed: boolean;
  lastScore: number | null;
  passed: boolean;
}> {
  return withRetry(async () => {
    const response = await apiClient.get<{
      available: boolean;
      completed: boolean;
      lastScore: number | null;
      passed: boolean;
    }>(`/api/v1/posttest/bab/${babId}/status`);
    return response.data;
  });
}
