import apiClient from './client';
import { withRetry } from './retry';
import type { Question, PreTestSubmission, PreTestResult } from '@/lib/types';

/**
 * Load Pre Test questions for a Bab.
 * Questions do NOT have correctOptionId (Pre Test has no right/wrong concept).
 * Retries on server/connection errors.
 */
export async function getPreTestQuestions(babId: string): Promise<Question[]> {
  return withRetry(async () => {
    const response = await apiClient.get<Question[]>(
      `/api/v1/pretest/bab/${babId}/questions`
    );
    return response.data;
  });
}

/**
 * Submit Pre Test answers for placement evaluation.
 * Does NOT auto-retry — answers are preserved client-side on failure.
 */
export async function submitPreTest(submission: PreTestSubmission): Promise<PreTestResult> {
  const response = await apiClient.post<PreTestResult>('/api/v1/pretest/submit', submission);
  return response.data;
}

/**
 * Check if Pre Test has been completed for a Bab.
 * Retries on server/connection errors.
 */
export async function getPreTestStatus(babId: string): Promise<{ completed: boolean; startChapterIndex: number }> {
  return withRetry(async () => {
    const response = await apiClient.get<{ completed: boolean; startChapterIndex: number }>(
      `/api/v1/pretest/bab/${babId}/status`
    );
    return response.data;
  });
}
