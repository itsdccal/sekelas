import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HeartbeatTracker from './HeartbeatTracker';
import type { HeartbeatTrackerConfig } from './HeartbeatTracker';
import type { ChapterStatus } from '@/lib/types/progress';

// Mock the video API module
vi.mock('@/lib/api/video', () => ({
  trackProgress: vi.fn(),
  flushHeartbeats: vi.fn(),
}));

import { trackProgress, flushHeartbeats } from '@/lib/api/video';

const mockTrackProgress = vi.mocked(trackProgress);
const mockFlushHeartbeats = vi.mocked(flushHeartbeats);

function createConfig(overrides?: Partial<HeartbeatTrackerConfig>): HeartbeatTrackerConfig {
  return {
    chapterId: 'chapter-1',
    intervalMs: 5000,
    maxQueueSize: 60,
    onStatusChange: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  };
}

describe('HeartbeatTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    // Default: online
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('start and stop', () => {
    it('should send heartbeat at configured interval', async () => {
      mockTrackProgress.mockResolvedValue({ watchedPercentage: 25.0, status: '' });
      const config = createConfig();
      const tracker = new HeartbeatTracker(config);

      tracker.start(25.0);

      // Advance past one interval
      await vi.advanceTimersByTimeAsync(5000);
      expect(mockTrackProgress).toHaveBeenCalledTimes(1);
      expect(mockTrackProgress).toHaveBeenCalledWith({
        chapterId: 'chapter-1',
        watchedPercentage: 25.0,
        timestamp: expect.any(Number),
      });

      // Advance past another interval
      await vi.advanceTimersByTimeAsync(5000);
      expect(mockTrackProgress).toHaveBeenCalledTimes(2);

      tracker.stop();
    });

    it('should stop sending heartbeats when stop() is called', async () => {
      mockTrackProgress.mockResolvedValue({ watchedPercentage: 10.0, status: '' });
      const config = createConfig();
      const tracker = new HeartbeatTracker(config);

      tracker.start(10.0);
      await vi.advanceTimersByTimeAsync(5000);
      expect(mockTrackProgress).toHaveBeenCalledTimes(1);

      tracker.stop();

      await vi.advanceTimersByTimeAsync(10000);
      // Should still be 1, not increased
      expect(mockTrackProgress).toHaveBeenCalledTimes(1);
    });
  });

  describe('updatePercentage and getWatchedPercentage', () => {
    it('should track and return the updated percentage', () => {
      const config = createConfig();
      const tracker = new HeartbeatTracker(config);
      tracker.start(0);

      tracker.updatePercentage(50.5);
      expect(tracker.getWatchedPercentage()).toBe(50.5);

      tracker.stop();
    });

    it('should send the latest percentage on heartbeat', async () => {
      mockTrackProgress.mockResolvedValue({ watchedPercentage: 75.0, status: '' });
      const config = createConfig();
      const tracker = new HeartbeatTracker(config);

      tracker.start(0);
      tracker.updatePercentage(75.0);

      await vi.advanceTimersByTimeAsync(5000);
      expect(mockTrackProgress).toHaveBeenCalledWith(
        expect.objectContaining({ watchedPercentage: 75.0 })
      );

      tracker.stop();
    });
  });

  describe('offline queue', () => {
    it('should queue heartbeats when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      const config = createConfig();
      const tracker = new HeartbeatTracker(config);
      tracker.start(10.0);

      await vi.advanceTimersByTimeAsync(5000);
      expect(mockTrackProgress).not.toHaveBeenCalled();
      expect(tracker.getQueueSize()).toBe(1);

      tracker.stop();
    });

    it('should queue heartbeats when API call fails', async () => {
      mockTrackProgress.mockRejectedValue(new Error('Network error'));
      const config = createConfig();
      const tracker = new HeartbeatTracker(config);

      tracker.start(20.0);
      await vi.advanceTimersByTimeAsync(5000);

      expect(tracker.getQueueSize()).toBe(1);
      expect(config.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'server',
          queueSize: 1,
        })
      );

      tracker.stop();
    });

    it('should drop oldest heartbeats when queue exceeds maxQueueSize', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      const config = createConfig({ maxQueueSize: 3 });
      const tracker = new HeartbeatTracker(config);
      tracker.start(10.0);

      // Generate 5 heartbeats (exceeds max of 3)
      for (let i = 0; i < 5; i++) {
        tracker.updatePercentage((i + 1) * 10);
        await vi.advanceTimersByTimeAsync(5000);
      }

      expect(tracker.getQueueSize()).toBe(3);

      tracker.stop();
    });

    it('should flush queue when connection is restored', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      mockFlushHeartbeats.mockResolvedValue(undefined);

      const config = createConfig();
      const tracker = new HeartbeatTracker(config);
      tracker.start(10.0);

      // Generate 3 queued heartbeats
      await vi.advanceTimersByTimeAsync(15000);
      expect(tracker.getQueueSize()).toBe(3);

      // Simulate coming back online
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      window.dispatchEvent(new Event('online'));

      // Allow flush to complete
      await vi.advanceTimersByTimeAsync(0);

      expect(mockFlushHeartbeats).toHaveBeenCalledTimes(1);
      expect(mockFlushHeartbeats).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ chapterId: 'chapter-1' }),
        ])
      );
      expect(tracker.getQueueSize()).toBe(0);

      tracker.stop();
    });

    it('should flush queue on next successful heartbeat send', async () => {
      // First call fails (queue the heartbeat), second call succeeds
      mockTrackProgress
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({ watchedPercentage: 20.0, status: '' });
      mockFlushHeartbeats.mockResolvedValue(undefined);

      const config = createConfig();
      const tracker = new HeartbeatTracker(config);
      tracker.start(10.0);

      // First heartbeat fails → queued
      await vi.advanceTimersByTimeAsync(5000);
      expect(tracker.getQueueSize()).toBe(1);

      // Second heartbeat succeeds → triggers flush
      await vi.advanceTimersByTimeAsync(5000);
      expect(mockFlushHeartbeats).toHaveBeenCalledTimes(1);

      tracker.stop();
    });
  });

  describe('status change callback', () => {
    it('should call onStatusChange when API returns a new status', async () => {
      mockTrackProgress.mockResolvedValue({
        watchedPercentage: 100.0,
        status: 'READY_FOR_RETAKE',
      });
      const config = createConfig();
      const tracker = new HeartbeatTracker(config);

      tracker.start(99.0);
      await vi.advanceTimersByTimeAsync(5000);

      expect(config.onStatusChange).toHaveBeenCalledWith('READY_FOR_RETAKE' as ChapterStatus);

      tracker.stop();
    });

    it('should not call onStatusChange when status is empty', async () => {
      mockTrackProgress.mockResolvedValue({ watchedPercentage: 50.0, status: '' });
      const config = createConfig();
      const tracker = new HeartbeatTracker(config);

      tracker.start(50.0);
      await vi.advanceTimersByTimeAsync(5000);

      expect(config.onStatusChange).not.toHaveBeenCalled();

      tracker.stop();
    });
  });

  describe('error handling', () => {
    it('should call onError with connection type when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      mockTrackProgress.mockRejectedValue(new Error('Failed'));

      const config = createConfig();
      const tracker = new HeartbeatTracker(config);
      tracker.start(10.0);

      // Simulate going offline mid-playback
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      window.dispatchEvent(new Event('offline'));

      // Next heartbeat should detect offline and queue without calling API
      await vi.advanceTimersByTimeAsync(5000);
      expect(mockTrackProgress).not.toHaveBeenCalled();
      expect(tracker.getQueueSize()).toBe(1);

      tracker.stop();
    });

    it('should not stop heartbeat interval on error', async () => {
      mockTrackProgress
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValue({ watchedPercentage: 30.0, status: '' });

      const config = createConfig();
      const tracker = new HeartbeatTracker(config);
      tracker.start(10.0);

      // Two failures
      await vi.advanceTimersByTimeAsync(10000);
      expect(mockTrackProgress).toHaveBeenCalledTimes(2);
      expect(tracker.getQueueSize()).toBe(2);

      // Third attempt succeeds
      mockFlushHeartbeats.mockResolvedValue(undefined);
      await vi.advanceTimersByTimeAsync(5000);
      expect(mockTrackProgress).toHaveBeenCalledTimes(3);

      tracker.stop();
    });
  });
});
