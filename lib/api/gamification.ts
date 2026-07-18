import apiClient from './client';
import type { GamificationState } from '@/lib/types';

export async function fetchGamificationStatus(): Promise<GamificationState> {
  const response = await apiClient.get<GamificationState>(
    '/api/v1/gamification/status'
  );
  return response.data;
}
