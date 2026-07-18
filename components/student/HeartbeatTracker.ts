import { trackProgress, flushHeartbeats } from '@/lib/api/video';
import type { HeartbeatPayload } from '@/lib/api/video';
import type { ChapterStatus } from '@/lib/types/progress';

export interface HeartbeatError {
  type: 'connection' | 'server';
  message: string;
  queueSize: number;
}

export interface HeartbeatTrackerConfig {
  chapterId: string;
  intervalMs: number; // 5000
  maxQueueSize: number; // 60
  onStatusChange: (newStatus: ChapterStatus) => void;
  onError: (error: HeartbeatError) => void;
}

/**
 * HeartbeatTracker sends video watching progress to the API every N seconds.
 * If a send fails (offline/error), the heartbeat is queued locally.
 * The queue is FIFO, max `maxQueueSize` entries (drops oldest if exceeded).
 * When connection is restored (navigator.onLine or next successful send),
 * the queue is flushed in chronological order.
 */
export default class HeartbeatTracker {
  private queue: HeartbeatPayload[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isOnline: boolean = true;
  private watchedPercentage: number = 0;
  private config: HeartbeatTrackerConfig;
  private isFlushing: boolean = false;

  // Bound handlers for event listener cleanup
  private handleOnline: () => void;
  private handleOffline: () => void;

  constructor(config: HeartbeatTrackerConfig) {
    this.config = config;

    this.handleOnline = () => {
      this.isOnline = true;
      this.flush();
    };

    this.handleOffline = () => {
      this.isOnline = false;
    };
  }

  /**
   * Start sending heartbeats at the configured interval.
   * Also begins listening for online/offline events.
   * @param currentPercentage - the current watched percentage to start tracking from
   */
  start(currentPercentage: number): void {
    this.watchedPercentage = currentPercentage;

    // Listen for browser online/offline events
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }

    // Start heartbeat interval
    this.intervalId = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.intervalMs);
  }

  /**
   * Stop heartbeat tracking and remove event listeners.
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  /**
   * Update the current watched percentage (called externally by the video player).
   */
  updatePercentage(percentage: number): void {
    this.watchedPercentage = percentage;
  }

  /**
   * Get the currently tracked watched percentage.
   */
  getWatchedPercentage(): number {
    return this.watchedPercentage;
  }

  /**
   * Get the current queue size (for testing/monitoring).
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Flush all queued heartbeats to the API in chronological order.
   * Called automatically on reconnection or can be called manually.
   */
  async flush(): Promise<void> {
    if (this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.isFlushing = true;

    try {
      // Take all queued heartbeats and send them as a batch
      const payloadsToSend = [...this.queue];
      await flushHeartbeats(payloadsToSend);

      // On success, remove the flushed items from the queue
      this.queue = this.queue.slice(payloadsToSend.length);
    } catch {
      // If flush fails, keep items in queue - they'll be retried next time
      this.config.onError({
        type: 'connection',
        message: 'Gagal mengirim data progress yang tertunda. Akan dicoba lagi saat koneksi pulih.',
        queueSize: this.queue.length,
      });
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Send a single heartbeat. If it fails, queue it locally.
   */
  private async sendHeartbeat(): Promise<void> {
    const payload: HeartbeatPayload = {
      chapterId: this.config.chapterId,
      watchedPercentage: this.watchedPercentage,
      timestamp: Date.now(),
    };

    // If offline, queue immediately without trying to send
    if (!this.isOnline) {
      this.enqueue(payload);
      return;
    }

    try {
      const response = await trackProgress(payload);

      // On success, if there are queued items, attempt to flush them
      if (this.queue.length > 0) {
        this.flush();
      }

      // Check if the API response indicates a status change
      if (response.status && response.status !== '') {
        this.config.onStatusChange(response.status as ChapterStatus);
      }
    } catch {
      // On failure, queue the heartbeat and notify via onError
      this.enqueue(payload);
      this.config.onError({
        type: this.isOnline ? 'server' : 'connection',
        message: 'Koneksi bermasalah. Video tetap diputar, progress akan dikirim saat koneksi pulih.',
        queueSize: this.queue.length,
      });
    }
  }

  /**
   * Add a heartbeat to the offline queue.
   * If the queue exceeds maxQueueSize, drop the oldest entry (FIFO).
   */
  private enqueue(payload: HeartbeatPayload): void {
    this.queue.push(payload);

    // Drop oldest if exceeding max queue size
    while (this.queue.length > this.config.maxQueueSize) {
      this.queue.shift();
    }
  }
}
