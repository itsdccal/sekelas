'use client';

import { BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PreTestResult } from '@/lib/types';

interface PreTestResultDisplayProps {
  result: PreTestResult;
  onContinue: () => void;
}

/**
 * Displays Pre Test placement result.
 * Shows which chapter the student starts from and XP earned from skipped chapters.
 *
 * Requirements: 17.5
 */
export function PreTestResultDisplay({ result, onContinue }: PreTestResultDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto py-8">
      {/* Icon */}
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100">
        <BookOpen className="h-10 w-10 text-primary-600" aria-hidden="true" />
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Hasil Pre Test
        </h2>
        <p className="text-sm text-muted-foreground">
          Penempatan berdasarkan tingkat pemahaman kamu
        </p>
      </div>

      {/* Placement info */}
      <div className="w-full rounded-lg border border-primary-200 bg-primary-50 p-4 space-y-3">
        <p className="text-sm text-primary-800 font-medium">
          Kamu akan memulai dari:
        </p>
        <p className="text-lg font-semibold text-primary-700">
          {result.startSectionName}
        </p>
        {result.totalSectionsSkipped > 0 && (
          <p className="text-sm text-primary-700">
            {result.totalSectionsSkipped} bab dilewati berdasarkan pemahamanmu
          </p>
        )}
      </div>

      {/* XP earned (if any) */}
      {result.xpEarned > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
          <Zap className="h-5 w-5 text-yellow-600" aria-hidden="true" />
          <span className="text-sm font-medium text-yellow-800">
            +{result.xpEarned} XP diperoleh!
          </span>
        </div>
      )}

      {/* Message */}
      <p className="text-center text-sm text-foreground">
        {result.message}
      </p>

      {/* Continue button */}
      <Button
        onClick={onContinue}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white"
        aria-label="Mulai Belajar"
      >
        Mulai Belajar
      </Button>
    </div>
  );
}
