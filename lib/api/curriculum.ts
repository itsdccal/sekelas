import apiClient from './client';
import { withRetry } from './retry';
import type { Materi, Bab, Chapter } from '@/lib/types';

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
