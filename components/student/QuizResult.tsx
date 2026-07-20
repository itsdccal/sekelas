'use client';

import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QuizResult, QuizReviewItem } from '@/lib/types';

interface QuizResultProps {
  result: QuizResult;
  onContinue: () => void;
  onRetake?: () => void;
  onRewatchVideo?: () => void;
  onBack?: () => void;
}

export function QuizResultDisplay({ result, onContinue, onRetake, onRewatchVideo, onBack }: QuizResultProps) {
  const isPassed = result.status === 'PASSED';
  const isPending = result.status === 'PENDING_REVIEW';
  const isReadyForRetake = result.nextStatus === 'READY_FOR_RETAKE';

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto py-8">
      {/* Status icon */}
      {isPassed ? (
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" aria-hidden="true" />
        </div>
      ) : isPending ? (
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-100">
          <Clock className="h-10 w-10 text-amber-600" aria-hidden="true" />
        </div>
      ) : (
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
          <AlertTriangle className="h-10 w-10 text-red-600" aria-hidden="true" />
        </div>
      )}

      {/* Score */}
      <div className="text-center">
        <p
          className={`text-4xl font-bold ${isPassed ? 'text-green-600' : isPending ? 'text-amber-600' : 'text-red-600'}`}
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

      {/* Action buttons */}
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
      ) : isPending ? (
        <div className="w-full space-y-3">
          <p className="text-xs text-center text-muted-foreground">
            Jawaban esai/singkat kamu sedang ditinjau oleh pengajar.
            Hasil akhir akan diperbarui setelah review selesai.
          </p>
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

      {/* Review Details — shown only when PASSED and reviewDetails exists */}
      {isPassed && result.reviewDetails && result.reviewDetails.length > 0 && (
        <ReviewSection reviewDetails={result.reviewDetails} />
      )}
    </div>
  );
}

/**
 * Review section showing correct/incorrect for each question.
 * Only displayed after passing the quiz.
 */
function ReviewSection({ reviewDetails }: { reviewDetails: QuizReviewItem[] }) {
  const correctCount = reviewDetails.filter((item) => item.isCorrect === true).length;
  const incorrectCount = reviewDetails.filter((item) => item.isCorrect === false).length;
  const pendingCount = reviewDetails.filter((item) => item.isCorrect === null).length;

  return (
    <div className="w-full mt-6 border-t border-border pt-6">
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Pembahasan Jawaban
      </h3>

      {/* Summary */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle className="h-3.5 w-3.5" /> {correctCount} Benar
        </span>
        <span className="flex items-center gap-1 text-red-600">
          <XCircle className="h-3.5 w-3.5" /> {incorrectCount} Salah
        </span>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 text-amber-600">
            <Clock className="h-3.5 w-3.5" /> {pendingCount} Menunggu Review
          </span>
        )}
      </div>

      {/* Question list */}
      <div className="space-y-3">
        {reviewDetails.map((item, index) => (
          <ReviewItem key={item.questionId} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function ReviewItem({ item, index }: { item: QuizReviewItem; index: number }) {
  const isCorrect = item.isCorrect === true;
  const isIncorrect = item.isCorrect === false;
  const isPendingReview = item.isCorrect === null;

  return (
    <div
      className={`rounded-lg border p-4 ${
        isCorrect
          ? 'border-green-200 bg-green-50'
          : isIncorrect
          ? 'border-red-200 bg-red-50'
          : 'border-amber-200 bg-amber-50'
      }`}
    >
      {/* Header: number + status icon */}
      <div className="flex items-start gap-2">
        <span className="flex-shrink-0 mt-0.5">
          {isCorrect && <CheckCircle className="h-4 w-4 text-green-600" aria-label="Benar" />}
          {isIncorrect && <XCircle className="h-4 w-4 text-red-600" aria-label="Salah" />}
          {isPendingReview && <Clock className="h-4 w-4 text-amber-600" aria-label="Menunggu review" />}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {index + 1}. {item.questionText}
          </p>

          {/* For MULTIPLE_CHOICE: show selected vs correct */}
          {item.questionType === 'MULTIPLE_CHOICE' && (
            <div className="mt-2 space-y-1 text-xs">
              {item.selectedOptionId && (
                <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                  Jawabanmu: {item.selectedOptionId}
                  {isCorrect && ' ✓'}
                </p>
              )}
              {isIncorrect && item.correctOptionId && (
                <p className="text-green-700">
                  Jawaban benar: {item.correctOptionId}
                </p>
              )}
            </div>
          )}

          {/* For ESSAY / SHORT_ANSWER: show text answer */}
          {(item.questionType === 'ESSAY' || item.questionType === 'SHORT_ANSWER') && (
            <div className="mt-2 text-xs">
              {item.textAnswer && (
                <p className="text-muted-foreground italic">
                  Jawabanmu: &quot;{item.textAnswer}&quot;
                </p>
              )}
              {isPendingReview && (
                <p className="text-amber-700 mt-1">Sedang ditinjau oleh pengajar</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
