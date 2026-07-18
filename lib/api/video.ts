import apiClient from './client';
import { withRetry } from './retry';
import type { ChapterProgress } from '@/lib/types';

export interface HeartbeatPayload {
  chapterId: string;
  watchedPercentage: number;
  timestamp: number;
}

export interface TrackProgressResponse {
  watchedPercentage: number;
  status: string;
}

/**
 * Send a video watching heartbeat to track progress.
 * Called every 5 seconds during video playback.
 * Does NOT retry — caller handles offline queueing.
 */
export async function trackProgress(payload: HeartbeatPayload): Promise<TrackProgressResponse> {
  const response = await apiClient.post<TrackProgressResponse>(
    '/api/v1/video/track-progress',
    payload
  );
  return response.data;
}

/**
 * Flush a batch of queued heartbeats (after reconnection).
 */
export async function flushHeartbeats(payloads: HeartbeatPayload[]): Promise<void> {
  await apiClient.post('/api/v1/video/track-progress/batch', { heartbeats: payloads });
}

/**
 * Get video info and current progress for a chapter.
 * Retries on server/connection errors.
 */
export async function getVideoInfo(chapterId: string): Promise<ChapterProgress> {
  return withRetry(async () => {
    const response = await apiClient.get<ChapterProgress>(
      `/api/v1/video/chapter/${chapterId}/info`
    );
    return response.data;
  });
}
