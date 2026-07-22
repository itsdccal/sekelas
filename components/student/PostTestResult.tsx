'use client';

import { CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostTestResultDisplayProps {
  result: {
    status: 'PASSED' | 'FAILED';
    score: number;
    passingGrade: number;
    xpEarned: number;
    message: string;
    remediationSectionIds?: string[];
    remediationSectionNames?: string[];
    remediationChapterIds?: string[];
  };
  onContinue: () => void;
  onWatchChapter?: (id: string) => void;
  watchedChapterIds?: string[];
}

/**
 * Displays Post Test / Uji Kompetensi result.
 * PASSED: score, XP, continue button.
 * FAILED: score, remediation list.
 */
export function PostTestResultDisplay({ result, onContinue, onWatchChapter, watchedChapterIds = [] }: PostTestResultDisplayProps) {
  const isPassed = result.status === 'PASSED';

  // Support both section-level and chapter-level remediation
  const remediationItems = result.remediationSectionNames || result.remediationChapterIds || [];
  const remediationIds = result.remediationSectionIds || result.remediationChapterIds || [];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto py-8">
      {isPassed ? (
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
      ) : (
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
      )}

      <div className="text-center">
        <p className={`text-4xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>{result.score}%</p>
        <p className="mt-1 text-sm text-muted-foreground">Batas kelulusan: {result.passingGrade}%</p>
      </div>

      {isPassed && result.xpEarned > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
          <Zap className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">+{result.xpEarned} XP diperoleh!</span>
        </div>
      )}

      <p className="text-center text-sm text-foreground">{result.message}</p>

      {isPassed ? (
        <Button onClick={onContinue} className="w-full bg-green-600 hover:bg-green-700 text-white">
          Lanjut
        </Button>
      ) : (
        <div className="w-full space-y-4">
          {remediationItems.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Pelajari ulang materi berikut:</p>
              <div className="rounded-lg border border-border divide-y divide-border">
                {remediationItems.map((name, idx) => {
                  const id = remediationIds[idx];
                  const isWatched = watchedChapterIds.includes(id);
                  return (
                    <div key={idx} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {isWatched ? <CheckCircle className="h-4 w-4 text-green-500" /> : <span className="h-4 w-4 rounded-full border-2 border-gray-300" />}
                        <span className={`text-sm ${isWatched ? 'text-muted-foreground line-through' : ''}`}>{name}</span>
                      </div>
                      {!isWatched && onWatchChapter && (
                        <Button size="sm" variant="outline" onClick={() => onWatchChapter(id)}>Pelajari</Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <Button onClick={onContinue} disabled={remediationItems.length > 0 && watchedChapterIds.length < remediationIds.length} className="w-full bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50">
            Kerjakan Ulang
          </Button>
        </div>
      )}
    </div>
  );
}
