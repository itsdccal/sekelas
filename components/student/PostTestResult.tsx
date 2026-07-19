'use client';

import { CheckCircle, AlertTriangle, Zap, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PostTestResult } from '@/lib/types';

interface PostTestResultDisplayProps {
  result: PostTestResult;
  onContinue: () => void;
  onWatchChapter: (chapterId: string) => void;
  watchedChapterIds?: string[];
}

/**
 * Displays Post Test result.
 * PASSED: score, XP earned, next Bab unlocked notification, continue button.
 * FAILED: score, passing grade, list of remediation videos to watch.
 *
 * Requirements: 19.4, 19.5, 19.6
 */
export function PostTestResultDisplay({ result, onContinue, onWatchChapter, watchedChapterIds = [] }: PostTestResultDisplayProps) {
  const isPassed = result.status === 'PASSED';
  const remediationChapters = result.remediationChapterIds ?? [];
  const watchedCount = watchedChapterIds.length;
  const totalRemediation = remediationChapters.length;
  const allWatched = totalRemediation > 0 && watchedCount >= totalRemediation;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto py-8">
      {/* Status icon */}
      {isPassed ? (
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" aria-hidden="true" />
        </div>
      ) : (
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
          <AlertTriangle className="h-10 w-10 text-red-600" aria-hidden="true" />
        </div>
      )}

      {/* Score */}
      <div className="text-center">
        <p
          className={`text-4xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}
          aria-label={`Skor: ${result.score}%`}
        >
          {result.score}%
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Batas kelulusan: {result.passingGrade}%
        </p>
      </div>

      {/* XP earned (passed only) */}
      {isPassed && result.xpEarned > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
          <Zap className="h-5 w-5 text-yellow-600" aria-hidden="true" />
          <span className="text-sm font-medium text-yellow-800">
            +{result.xpEarned} XP diperoleh!
          </span>
        </div>
      )}

      {/* Next Bab unlocked notification */}
      {isPassed && result.nextBabUnlocked && (
        <div className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
          <Unlock className="h-5 w-5 text-primary-600" aria-hidden="true" />
          <span className="text-sm font-medium text-primary-800">
            Bab berikutnya telah terbuka!
          </span>
        </div>
      )}

      {/* Message */}
      <p className="text-center text-sm text-foreground">
        {result.message}
      </p>

      {/* Action buttons */}
      {isPassed ? (
        <Button
          onClick={onContinue}
          className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white"
          aria-label="Lanjut ke Bab Berikutnya"
        >
          Lanjut ke Bab Berikutnya
        </Button>
      ) : (
        <div className="w-full space-y-4">
          {/* Remediation video list */}
          {remediationChapters.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Tonton ulang video berikut sebelum bisa mengerjakan ulang:
              </p>
              <div className="rounded-lg border border-border divide-y divide-border">
                {remediationChapters.map((chId) => {
                  const isWatched = watchedChapterIds.includes(chId);
                  return (
                    <div key={chId} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {isWatched ? (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" aria-hidden="true" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" />
                        )}
                        <span className={`text-sm ${isWatched ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {chId}
                        </span>
                      </div>
                      {!isWatched && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onWatchChapter(chId)}
                          aria-label={`Tonton video ${chId}`}
                        >
                          Tonton
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {watchedCount}/{totalRemediation} video selesai ditonton ulang
              </p>
            </div>
          )}

          {/* Retake button — enabled only when all remediation videos watched */}
          <Button
            onClick={onContinue}
            disabled={!allWatched}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
            aria-label="Kerjakan Post Test Ulang"
          >
            Kerjakan Post Test Ulang
          </Button>
        </div>
      )}
    </div>
  );
}
