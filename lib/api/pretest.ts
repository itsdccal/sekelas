import apiClient from './client';
import { withRetry } from './retry';
import type { Question, PreTestSubmission, PreTestResult } from '@/lib/types';

/**
 * Load Pre Test questions for a Materi.
 * Retries on server/connection errors.
 */
export async function getPreTestQuestions(materiId: string): Promise<Question[]> {
  return withRetry(async () => {
    const response = await apiClient.get<Question[]>(
      `/api/v1/pretest/materi/${materiId}/questions`
    );
    return response.data;
  });
}

/**
 * Submit Pre Test answers for placement evaluation.
 */
export async function submitPreTest(submission: PreTestSubmission): Promise<PreTestResult> {
  const response = await apiClient.post<PreTestResult>('/api/v1/pretest/submit', submission);
  return response.data;
}

/**
 * Check if Pre Test has been completed for a Materi.
 */
export async function getPreTestStatus(materiId: string): Promise<{ completed: boolean; startBabIndex: number }> {
  return withRetry(async () => {
    const response = await apiClient.get<{ completed: boolean; startBabIndex: number }>(
      `/api/v1/pretest/materi/${materiId}/status`
    );
    return response.data;
  });
}
