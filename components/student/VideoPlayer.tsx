'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { formatVideoProgress } from '@/lib/utils/formatters';
import type { ChapterStatus } from '@/lib/types';
import './VideoPlayer.css';

export interface VideoPlayerProps {
  videoUrl: string;
  chapterId: string;
  chapterStatus: ChapterStatus;
  initialProgress: number; // 0.0 - 100.0, resume position
  onComplete: () => void;
  onProgressUpdate: (percentage: number) => void;
}

/**
 * VideoPlayer component with anti-skip mechanism.
 * Uses Video.js for playback with all seek mechanisms disabled.
 * Displays progress overlay and navigation on completion.
 */
export function VideoPlayer({
  videoUrl,
  chapterId,
  chapterStatus,
  initialProgress,
  onComplete,
  onProgressUpdate,
}: VideoPlayerProps) {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof import('video.js')['default']> | null>(null);
  const [currentProgress, setCurrentProgress] = useState(initialProgress);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hasResumedRef = useRef(false);
  const maxWatchedTimeRef = useRef(0);

  // Track the furthest point the user has watched (anti-skip forward)
  const handleTimeUpdate = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    const currentTime = player.currentTime() ?? 0;
    const duration = player.duration() ?? 0;

    if (duration <= 0) return;

    // Only allow forward progress — track max watched time
    if (currentTime > maxWatchedTimeRef.current) {
      maxWatchedTimeRef.current = currentTime;
    }

    // If user somehow skipped ahead of max watched, seek back
    if (currentTime > maxWatchedTimeRef.current + 1) {
      player.currentTime(maxWatchedTimeRef.current);
      return;
    }

    const percentage = (maxWatchedTimeRef.current / duration) * 100;
    setCurrentProgress(percentage);
    onProgressUpdate(percentage);

    // Check for completion
    if (percentage >= 99.5 && !isCompleted) {
      setIsCompleted(true);
      onComplete();
    }
  }, [onProgressUpdate, onComplete, isCompleted]);

  // Block keyboard seek shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const blockedKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  // Initialize Video.js player
  useEffect(() => {
    let player: ReturnType<typeof import('video.js')['default']> | null = null;
    let isMounted = true;

    async function initPlayer() {
      // Dynamic import to avoid SSR issues
      const videojs = (await import('video.js')).default;
      await import('video.js/dist/video-js.css');

      if (!isMounted || !videoContainerRef.current) return;

      // Create video element
      const videoElement = document.createElement('video');
      videoElement.className = 'video-js vjs-big-play-centered vjs-fluid';
      videoElement.setAttribute('data-testid', 'video-player');
      videoContainerRef.current.appendChild(videoElement);

      // Initialize player with anti-skip options
      player = videojs(videoElement, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        responsive: true,
        sources: [{ src: videoUrl, type: inferVideoType(videoUrl) }],
        controlBar: {
          progressControl: false, // Disable the progress/seek bar entirely
          remainingTimeDisplay: true,
          currentTimeDisplay: true,
          timeDivider: true,
        },
        userActions: {
          hotkeys: false, // Disable keyboard shortcuts
        },
      });

      // On player ready
      player.ready(() => {
        if (!isMounted) return;
        setIsReady(true);

        // Disable touch/swipe seeking by preventing touchmove on the player
        const el = player!.el();
        if (el) {
          el.addEventListener('touchmove', preventTouchSeek, { passive: false });
        }
      });

      // Resume from last position once metadata is loaded
      player.on('loadedmetadata', () => {
        if (!isMounted || !player || hasResumedRef.current) return;
        hasResumedRef.current = true;

        const duration = player.duration() ?? 0;
        if (duration > 0 && initialProgress > 0 && initialProgress < 100) {
          const resumeTime = (initialProgress / 100) * duration;
          player.currentTime(resumeTime);
          maxWatchedTimeRef.current = resumeTime;
        }
      });

      // Track time updates
      player.on('timeupdate', handleTimeUpdate);

      // Prevent seeking by monitoring the 'seeking' event
      player.on('seeking', () => {
        if (!player) return;
        const currentTime = player.currentTime() ?? 0;
        // If user tries to seek ahead of max watched, revert
        if (currentTime > maxWatchedTimeRef.current + 0.5) {
          player.currentTime(maxWatchedTimeRef.current);
        }
      });

      playerRef.current = player;
    }

    initPlayer();

    return () => {
      isMounted = false;
      if (player) {
        const el = player.el();
        if (el) {
          el.removeEventListener('touchmove', preventTouchSeek);
        }
        player.dispose();
      }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, chapterId]);

  // Block keyboard seek on the container
  useEffect(() => {
    const container = videoContainerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown, true);
    return () => {
      container.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown]);

  return (
    <div className="relative w-full" data-testid="video-player-container">
      {/* Video.js container */}
      <div
        ref={videoContainerRef}
        className="video-player-wrapper w-full"
        data-testid="video-container"
      />

      {/* Progress percentage overlay */}
      {isReady && (
        <div
          className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium z-10"
          data-testid="progress-overlay"
          aria-live="polite"
          aria-label={`Progress tontonan: ${formatVideoProgress(currentProgress)}`}
        >
          {formatVideoProgress(currentProgress)}
        </div>
      )}

      {/* Notifikasi video selesai — kecil di kanan bawah */}
      {isCompleted && (
        <div
          className="absolute bottom-3 right-3 z-20 rounded-lg bg-green-600 px-4 py-2 text-white shadow-lg"
          data-testid="completion-overlay"
        >
          <p className="text-sm font-medium">✅ Video selesai!</p>
        </div>
      )}

    </div>
  );
}

/**
 * Prevent touch-based seeking (swipe gestures on mobile).
 */
function preventTouchSeek(e: Event) {
  e.preventDefault();
}

/**
 * Infer video MIME type from URL extension.
 */
function inferVideoType(url: string): string {
  if (url.endsWith('.webm')) return 'video/webm';
  if (url.endsWith('.ogg')) return 'video/ogg';
  return 'video/mp4';
}

export default VideoPlayer;
