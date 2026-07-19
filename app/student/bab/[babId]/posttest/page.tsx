'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PostTestComponent } from '@/components/student/PostTestComponent';
import { PostTestResultDisplay } from '@/components/student/PostTestResult';
import { videoApi } from '@/lib/api';
import type { PostTestResult } from '@/lib/types';

/**
 * Post Test page for a Bab.
 * Shows PostTestComponent → on complete shows PostTestResultDisplay.
 * On PASSED: next Bab unlocked, navigate to Bab list.
 * On FAILED: show remediation video list, track which ones are watched.
 *
 * Requirements: 18.5, 18.6, 19.1, 19.4, 19.5
 */
export default function PostTestPage() {
  const params = useParams();
  const router = useRouter();
  const babId = params.babId as string;

  const [result, setResult] = useState<PostTestResult | null>(null);
  const [watchedChapterIds, setWatchedChapterIds] = useState<string[]>([]);
  const [showTest, setShowTest] = useState(true);

  // Check which remediation videos have been watched 100%
  // Runs on mount and when page regains focus (student returns from video)
  const checkWatchedVideos = useCallback(async () => {
    if (!result || result.status === 'PASSED' || !result.remediationChapterIds) return;

    const watched: string[] = [];
    for (const chId of result.remediationChapterIds) {
      try {
        const info = await videoApi.getVideoInfo(chId);
        if (info && info.watchedPercentage >= 100) {
          watched.push(chId);
        }
      } catch {
        // Skip on error
      }
    }
    setWatchedChapterIds(watched);
  }, [result]);

  // Check on mount and when window regains focus
  useEffect(() => {
    checkWatchedVideos();

    const handleFocus = () => { checkWatchedVideos(); };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkWatchedVideos]);

  const handleComplete = useCallback((postTestResult: PostTestResult) => {
    setResult(postTestResult);
    setShowTest(false);
  }, []);

  const handleContinue = useCallback(() => {
    if (result?.status === 'PASSED') {
      // Navigate back to kurikulum — next Bab is now unlocked
      router.push('/student/kurikulum');
    } else {
      // Retake: reset and show test again
      setResult(null);
      setWatchedChapterIds([]);
      setShowTest(true);
    }
  }, [result, router]);

  const handleWatchChapter = useCallback((chapterId: string) => {
    // Navigate to video page for this chapter
    // Video completion is tracked by heartbeat system
    // When student returns, we'll check progress via API
    router.push(`/student/chapter/${chapterId}/video`);
  }, [router]);

  // Show result after completion
  if (!showTest && result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <PostTestResultDisplay
          result={result}
          onContinue={handleContinue}
          onWatchChapter={handleWatchChapter}
          watchedChapterIds={watchedChapterIds}
        />
      </div>
    );
  }

  // Show Post Test questions
  return (
    <div className="flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="text-xl font-semibold text-center text-foreground">Post Test</h1>
        <PostTestComponent babId={babId} onComplete={handleComplete} />
      </div>
    </div>
  );
}
