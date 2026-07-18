import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ChapterProgress } from '@/lib/types';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ chapterId: 'chapter-1' }),
  useRouter: () => ({ push: mockPush }),
}));

// Mock video API
const mockGetVideoInfo = vi.fn();
vi.mock('@/lib/api', () => ({
  videoApi: {
    getVideoInfo: (...args: unknown[]) => mockGetVideoInfo(...args),
  },
}));

// Mock chapterStore
const mockUpdateStatus = vi.fn();
const mockUpdateWatchedPercentage = vi.fn();
const mockSetActiveChapter = vi.fn();
vi.mock('@/stores/chapterStore', () => ({
  useChapterStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      updateStatus: mockUpdateStatus,
      updateWatchedPercentage: mockUpdateWatchedPercentage,
      setActiveChapter: mockSetActiveChapter,
    }),
}));

// Mock VideoPlayer to capture props
let capturedVideoPlayerProps: Record<string, unknown> = {};
vi.mock('@/components/student/VideoPlayer', () => ({
  VideoPlayer: (props: Record<string, unknown>) => {
    capturedVideoPlayerProps = props;
    return <div data-testid="mock-video-player" data-initial-progress={props.initialProgress} />;
  },
}));

// Mock HeartbeatTracker
const mockTrackerStart = vi.fn();
const mockTrackerStop = vi.fn();
let capturedTrackerConfig: Record<string, unknown> = {};
vi.mock('@/components/student/HeartbeatTracker', () => ({
  default: class MockHeartbeatTracker {
    constructor(config: Record<string, unknown>) {
      capturedTrackerConfig = config;
    }
    start = mockTrackerStart;
    stop = mockTrackerStop;
    updatePercentage = vi.fn();
  },
}));

// Import after mocks
import VideoPlayerPage from './page';

describe('VideoPlayerPage - Remediation Flow', () => {
  const remediationProgress: ChapterProgress = {
    chapterId: 'chapter-1',
    status: 'REMEDIATION_REQUIRED',
    watchedPercentage: 75, // Previously watched 75%, but remediation resets
    lastScore: 50,
    quizAttempts: 1,
    videoWatchAttempts: 1,
  };

  const unlockedProgress: ChapterProgress = {
    chapterId: 'chapter-1',
    status: 'UNLOCKED',
    watchedPercentage: 30,
    lastScore: null,
    quizAttempts: 0,
    videoWatchAttempts: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    capturedVideoPlayerProps = {};
    capturedTrackerConfig = {};
  });

  it('passes initialProgress=0 to VideoPlayer when status is REMEDIATION_REQUIRED', async () => {
    mockGetVideoInfo.mockResolvedValue(remediationProgress);

    render(<VideoPlayerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-video-player')).toBeInTheDocument();
    });

    // The VideoPlayer should receive initialProgress=0 for remediation
    expect(capturedVideoPlayerProps.initialProgress).toBe(0);
  });

  it('passes actual watchedPercentage as initialProgress for UNLOCKED status', async () => {
    mockGetVideoInfo.mockResolvedValue(unlockedProgress);

    render(<VideoPlayerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-video-player')).toBeInTheDocument();
    });

    // The VideoPlayer should receive the actual progress for non-remediation
    expect(capturedVideoPlayerProps.initialProgress).toBe(30);
  });

  it('starts HeartbeatTracker from 0 during remediation', async () => {
    mockGetVideoInfo.mockResolvedValue(remediationProgress);

    render(<VideoPlayerPage />);

    await waitFor(() => {
      expect(mockTrackerStart).toHaveBeenCalled();
    });

    // Tracker should start from 0, not from 75
    expect(mockTrackerStart).toHaveBeenCalledWith(0);
  });

  it('starts HeartbeatTracker from watchedPercentage for non-remediation status', async () => {
    mockGetVideoInfo.mockResolvedValue(unlockedProgress);

    render(<VideoPlayerPage />);

    await waitFor(() => {
      expect(mockTrackerStart).toHaveBeenCalled();
    });

    expect(mockTrackerStart).toHaveBeenCalledWith(30);
  });

  it('HeartbeatTracker onStatusChange updates local videoInfo state reactively', async () => {
    mockGetVideoInfo.mockResolvedValue(remediationProgress);

    render(<VideoPlayerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-video-player')).toBeInTheDocument();
    });

    // Simulate API returning READY_FOR_RETAKE via onStatusChange callback
    const onStatusChange = capturedTrackerConfig.onStatusChange as (status: string) => void;
    expect(onStatusChange).toBeDefined();

    // Call onStatusChange to simulate reactive status update
    onStatusChange('READY_FOR_RETAKE');

    // The store's updateStatus should have been called
    expect(mockUpdateStatus).toHaveBeenCalledWith('chapter-1', 'READY_FOR_RETAKE');
  });

  it('shows connection warning on heartbeat error without stopping video', async () => {
    mockGetVideoInfo.mockResolvedValue(remediationProgress);

    render(<VideoPlayerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-video-player')).toBeInTheDocument();
    });

    // Simulate heartbeat error via onError callback
    const onError = capturedTrackerConfig.onError as (err: { message: string }) => void;
    expect(onError).toBeDefined();

    onError({
      message: 'Koneksi bermasalah. Video tetap diputar, progress akan dikirim saat koneksi pulih.',
    });

    // Connection warning should appear
    await waitFor(() => {
      expect(screen.getByTestId('connection-warning')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Koneksi bermasalah. Video tetap diputar, progress akan dikirim saat koneksi pulih.')
    ).toBeInTheDocument();

    // Video player should still be visible (not stopped)
    expect(screen.getByTestId('mock-video-player')).toBeInTheDocument();
  });
});
