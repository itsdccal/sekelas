import apiClient from './client';
import { withRetry } from './retry';
import type { Question, PostTestSubmission, PostTestResult } from '@/lib/types';

/**
 * Load Post Test questions for a Subject.
 * Retries on server/connection errors.
 */
export async function getPostTestQuestions(subjectId: string): Promise<Question[]> {
  return withRetry(async () => {
    const response = await apiClient.get<Question[]>(
      `/api/v1/posttest/subjects/${subjectId}/questions`
    );
    return response.data;
  });
}

/**
 * Submit Post Test answers for scoring.
 */
export async function submitPostTest(submission: PostTestSubmission): Promise<PostTestResult> {
  const response = await apiClient.post<PostTestResult>('/api/v1/posttest/submit', submission);
  return response.data;
}

/**
 * Check Post Test status for a Subject.
 */
export async function getPostTestStatus(subjectId: string): Promise<{
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
    }>(`/api/v1/posttest/subjects/${subjectId}/status`);
    return response.data;
  });
}
