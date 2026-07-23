'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle, WifiOff, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/student/VideoPlayer';
import HeartbeatTracker from '@/components/student/HeartbeatTracker';
import type { HeartbeatError } from '@/components/student/HeartbeatTracker';
import { useChapterStore } from '@/stores/chapterStore';
import { videoApi } from '@/lib/api';
import { isOfflineMode } from '@/lib/config/offlineMode';
import type { ChapterProgress, ChapterStatus } from '@/lib/types';

/**
 * Video Player page.
 * Wires VideoPlayer + HeartbeatTracker + ChapterStore together.
 * Handles status transitions on video completion.
 *
 * Requirements: 5.1, 5.4, 7.2
 */
export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.chapterId as string;

  // Store actions
  const updateStatus = useChapterStore((s) => s.updateStatus);
  const updateWatchedPercentage = useChapterStore((s) => s.updateWatchedPercentage);
  const setActiveChapter = useChapterStore((s) => s.setActiveChapter);

  // Local state
  const [videoInfo, setVideoInfo] = useState<ChapterProgress | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionWarning, setConnectionWarning] = useState<string | null>(null);

  // HeartbeatTracker ref
  const trackerRef = useRef<HeartbeatTracker | null>(null);
  const connectionWarningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackerInitializedRef = useRef(false);

  // Fetch video info on mount
  const fetchVideoInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const progress = await videoApi.getVideoInfo(chapterId);
      setVideoInfo(progress);

      // Gunakan videoUrl dari API response jika tersedia (URL langsung ke video)
      // Fallback ke streaming endpoint jika tidak ada
      const apiVideoUrl = (progress as unknown as { videoUrl?: string }).videoUrl;
      setVideoUrl(
        apiVideoUrl || `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/video/chapter/${chapterId}/stream`
      );

      // Update store with fetched progress
      updateStatus(chapterId, progress.status);
      updateWatchedPercentage(chapterId, progress.watchedPercentage);
      setActiveChapter(chapterId);
    } catch {
      setError('Gagal memuat informasi video. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [chapterId, updateStatus, updateWatchedPercentage, setActiveChapter]);

  useEffect(() => {
    fetchVideoInfo();
  }, [fetchVideoInfo]);

  // Initialize HeartbeatTracker (only once after videoInfo is first loaded)
  useEffect(() => {
    if (!videoInfo || !chapterId || trackerInitializedRef.current) return;
    trackerInitializedRef.current = true;

    const tracker = new HeartbeatTracker({
      chapterId,
      intervalMs: 5000,
      maxQueueSize: 60,
      onStatusChange: (newStatus: ChapterStatus) => {
        updateStatus(chapterId, newStatus);
        setVideoInfo((prev) =>
          prev ? { ...prev, status: newStatus } : prev
        );
      },
      onError: (err: HeartbeatError) => {
        // Show connection warning toast without stopping video
        setConnectionWarning(err.message);

        // Clear existing timer
        if (connectionWarningTimerRef.current) {
          clearTimeout(connectionWarningTimerRef.current);
        }

        // Auto-dismiss warning after 5 seconds
        connectionWarningTimerRef.current = setTimeout(() => {
          setConnectionWarning(null);
        }, 5000);
      },
    });

    trackerRef.current = tracker;
    // Start tracker — during remediation, start from 0 (fresh rewatch)
    const startPercentage =
      videoInfo.status === 'REMEDIATION_REQUIRED' ? 0 : videoInfo.watchedPercentage;
    tracker.start(startPercentage);

    // Cleanup on unmount
    return () => {
      tracker.stop();
      trackerRef.current = null;
      if (connectionWarningTimerRef.current) {
        clearTimeout(connectionWarningTimerRef.current);
      }
    };
  }, [videoInfo, chapterId, updateStatus]);

  // Handle progress update from VideoPlayer
  const handleProgressUpdate = useCallback(
    (percentage: number) => {
      updateWatchedPercentage(chapterId, percentage);

      // Update tracker's internal percentage
      if (trackerRef.current) {
        trackerRef.current.updatePercentage(percentage);
      }
    },
    [chapterId, updateWatchedPercentage]
  );

  // Track video completion state
  const [videoCompleted, setVideoCompleted] = useState(false);

  // Handle video completion — tampilkan tombol kuis (jangan auto-navigate)
  const handleVideoComplete = useCallback(() => {
    // Stop heartbeat tracking
    if (trackerRef.current) {
      trackerRef.current.stop();
    }
    setVideoCompleted(true);
  }, []);

  // Navigate ke halaman kuis
  const goToQuiz = useCallback(() => {
    router.push(`/student/chapter/${chapterId}/quiz`);
  }, [chapterId, router]);

  // Navigate kembali
  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" data-testid="video-loading">
        {/* Video player skeleton */}
        <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />
        {/* Info skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !videoInfo || !videoUrl) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-12"
        data-testid="video-error"
      >
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-center text-muted-foreground">
          {error || 'Gagal memuat video.'}
        </p>
        <Button onClick={fetchVideoInfo} data-testid="retry-button">
          <Loader2 className="mr-2 h-4 w-4 animate-spin hidden" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid="video-page">
      {/* Tombol Kembali */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          aria-label="Kembali ke daftar chapter"
        >
          ← Kembali
        </Button>
        <h1 className="text-lg font-semibold text-foreground">
          Video Pembelajaran
        </h1>
      </div>

      {/* Connection warning toast */}
      {connectionWarning && (
        <div
          className="flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
          role="alert"
          aria-live="assertive"
          data-testid="connection-warning"
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>{connectionWarning}</span>
          <button
            onClick={() => setConnectionWarning(null)}
            className="ml-auto text-yellow-600 hover:text-yellow-800"
            aria-label="Tutup peringatan"
          >
            ×
          </button>
        </div>
      )}

      {/* Offline Mode: Skip to Quiz */}
      {isOfflineMode && (videoInfo.status === 'UNLOCKED' || videoInfo.status === 'COMPLETED') && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
          <p className="text-sm text-blue-800">
            Video bersifat opsional — materi diajarkan langsung oleh pengajar.
          </p>
          <Button
            onClick={goToQuiz}
            variant="default"
            className="gap-2"
          >
            <SkipForward className="h-4 w-4" />
            Langsung ke Quiz
          </Button>
        </div>
      )}

      {/* Video Player */}
      <VideoPlayer
        videoUrl={videoUrl}
        chapterId={chapterId}
        chapterStatus={videoInfo.status}
        initialProgress={
          videoInfo.status === 'REMEDIATION_REQUIRED' ? 0 : videoInfo.watchedPercentage
        }
        onComplete={handleVideoComplete}
        onProgressUpdate={handleProgressUpdate}
      />

      {/* Tombol Kerjakan Kuis — muncul setelah video 100% di kanan bawah */}
      {videoCompleted && (
        <div className="flex justify-end pt-4">
          <Button
            onClick={goToQuiz}
            size="lg"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 text-base font-semibold"
          >
            🎯 Kerjakan Kuis
          </Button>
        </div>
      )}
    </div>
  );
}
