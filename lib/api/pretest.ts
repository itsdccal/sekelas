import apiClient from './client';
import { withRetry } from './retry';
import type { Question, PreTestSubmission, PreTestResult } from '@/lib/types';

/**
 * Load Pre Test questions for a Subject.
 * Retries on server/connection errors.
 */
export async function getPreTestQuestions(subjectId: string): Promise<Question[]> {
  return withRetry(async () => {
    const response = await apiClient.get<Question[]>(
      `/api/v1/pretest/subjects/${subjectId}/questions`
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
 * Check if Pre Test has been completed for a Subject.
 */
export async function getPreTestStatus(subjectId: string): Promise<{ completed: boolean; startSectionIndex: number }> {
  return withRetry(async () => {
    const response = await apiClient.get<{ completed: boolean; startSectionIndex: number }>(
      `/api/v1/pretest/subjects/${subjectId}/status`
    );
    return response.data;
  });
}
