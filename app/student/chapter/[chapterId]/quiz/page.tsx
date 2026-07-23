'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QuizComponent } from '@/components/student/QuizComponent';
import { QuizResultDisplay } from '@/components/student/QuizResult';
import { useChapterStore } from '@/stores/chapterStore';
import { isOfflineMode } from '@/lib/config/offlineMode';
import type { QuizResult } from '@/lib/types';

/**
 * Quiz page — wires QuizComponent + QuizResult + stores.
 *
 * Flow:
 * 1. Initially shows QuizComponent
 * 2. On quiz completion (onComplete): updates chapter status, shows QuizResult
 * 3. QuizResult onContinue (PASSED): navigates back to courses
 * 4. QuizResult onRetake: navigates to video page for remediation
 *
 * Requirements: 6.3
 */
export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.chapterId as string;

  const updateStatus = useChapterStore((s) => s.updateStatus);
  const progressMap = useChapterStore((s) => s.progressMap);

  // Determine chapter status for offline mode notices
  const chapterProgress = progressMap[chapterId];
  const chapterCurrentStatus = chapterProgress?.status;

  // State toggle between quiz and result views
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Called when QuizComponent finishes (submits successfully)
  const handleQuizComplete = useCallback(
    (result: QuizResult) => {
      // Update chapter store status based on result.nextStatus
      updateStatus(chapterId, result.nextStatus);
      // Switch view to result
      setQuizResult(result);
    },
    [chapterId, updateStatus]
  );

  // Called when student clicks "Lanjut" after passing
  const handleContinue = useCallback(() => {
    router.push('/student/courses');
  }, [router]);

  // Called when student clicks "Kerjakan Kuis Kembali" (remediation flow)
  const handleRetake = useCallback(() => {
    // Navigate back to video page for remediation
    router.push(`/student/chapter/${chapterId}/video`);
  }, [chapterId, router]);

  // Called when student clicks "Tonton Ulang Video"
  const handleRewatchVideo = useCallback(() => {
    router.push(`/student/chapter/${chapterId}/video`);
  }, [chapterId, router]);

  // Called when student clicks "Kembali"
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Show result view after quiz submission
  if (quizResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <QuizResultDisplay
          result={quizResult}
          onContinue={handleContinue}
          onRetake={handleRetake}
          onRewatchVideo={handleRewatchVideo}
          onBack={handleBack}
        />
      </div>
    );
  }

  // Default: show quiz component
  return (
    <div className="flex flex-col items-center py-8 px-4">
      {/* Mode Offline: first attempt notice */}
      {isOfflineMode && chapterCurrentStatus === 'UNLOCKED' && (
        <div className="mb-4 w-full max-w-2xl rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Percobaan pertama akan dinilai sebagai nilai resmi.
        </div>
      )}

      {/* Mode Offline: retake notice */}
      {isOfflineMode && chapterCurrentStatus === 'COMPLETED' && (
        <div className="mb-4 w-full max-w-2xl rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Latihan Ulang — skor tidak mempengaruhi nilai resmi
        </div>
      )}

      <QuizComponent chapterId={chapterId} onComplete={handleQuizComplete} />
    </div>
  );
}
