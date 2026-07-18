import apiClient from './client';
import { withRetry } from './retry';
import type { Materi, Bab, Chapter, StudentProgress } from '@/lib/types';

/**
 * Fetch student's own progress summary for a given semester.
 */
export async function getStudentProgress(semesterId: string): Promise<StudentProgress> {
  return withRetry(async () => {
    const response = await apiClient.get<StudentProgress>('/api/v1/student/progress', {
      params: { semesterId },
    });
    return response.data;
  });
}

/**
 * Fetch list of Materi for the given semester.
 */
export async function getMateriList(semesterId: string): Promise<Materi[]> {
  return withRetry(async () => {
    const response = await apiClient.get<Materi[]>('/api/v1/curriculum/materi', {
      params: { semesterId },
    });
    return response.data;
  });
}

/**
 * Fetch list of Bab within a Materi.
 */
export async function getBabList(materiId: string): Promise<Bab[]> {
  return withRetry(async () => {
    const response = await apiClient.get<Bab[]>(`/api/v1/curriculum/materi/${materiId}/bab`);
    return response.data;
  });
}

/**
 * Fetch list of Chapters within a Bab.
 */
export async function getChapterList(babId: string): Promise<Chapter[]> {
  return withRetry(async () => {
    const response = await apiClient.get<Chapter[]>(`/api/v1/curriculum/bab/${babId}/chapters`);
    return response.data;
  });
}
