'use client';

import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QuizResult } from '@/lib/types';

interface QuizResultProps {
  result: QuizResult;
  onContinue: () => void;
  onRetake?: () => void;
  onRewatchVideo?: () => void;
  onBack?: () => void;
}

export function QuizResultDisplay({ result, onContinue, onRetake, onRewatchVideo, onBack }: QuizResultProps) {
  const isPassed = result.status === 'PASSED';
  const isReadyForRetake = result.nextStatus === 'READY_FOR_RETAKE';

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
          Nilai minimum: {result.passingGrade}%
        </p>
      </div>

      {/* Message */}
      <p className="text-center text-sm text-foreground">
        {result.message}
      </p>

      {/* Action button */}
      {isPassed ? (
        <div className="w-full space-y-3">
          <Button
            onClick={onContinue}
            className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white"
            aria-label="Lanjut ke Chapter Berikutnya"
          >
            Lanjut ke Chapter Berikutnya
          </Button>
          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              className="w-full text-muted-foreground"
              aria-label="Kembali"
            >
              ← Kembali ke Daftar Chapter
            </Button>
          )}
        </div>
      ) : (
        <div className="w-full space-y-3">
          {isReadyForRetake ? (
            <Button
              onClick={onRetake}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
              aria-label="Kerjakan Kuis Kembali"
            >
              Kerjakan Kuis Kembali
            </Button>
          ) : onRewatchVideo ? (
            <>
              <Button
                onClick={onRewatchVideo}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                aria-label="Tonton Ulang Video"
              >
                📺 Tonton Ulang Video
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Tonton ulang video terlebih dahulu untuk bisa mengerjakan kuis kembali.
              </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
