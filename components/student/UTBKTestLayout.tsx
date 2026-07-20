'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { TimerDisplay } from '@/components/student/TimerDisplay';
import { QuestionRenderer } from '@/components/student/QuestionRenderer';
import type { Question } from '@/lib/types';

interface UTBKTestLayoutProps {
  questions: Question[];
  answers: Record<string, string>;
  currentIndex: number;
  onNavigate: (index: number) => void;
  onAnswer: (questionId: string, answer: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  timer: {
    formatted: string;
    isWarning: boolean;
    isExpired: boolean;
  };
  error?: string | null;
  /** Info header text for the test type */
  headerInfo?: string;
  /** Border color class for the header info box */
  headerBorderClass?: string;
  /** Background color class for the header info box */
  headerBgClass?: string;
  /** Text color class for the header info box */
  headerTextClass?: string;
}

/**
 * UTBK-style test layout with number grid navigation.
 * Used for Pre Test and Post Test.
 * Features:
 * - Number grid for free navigation
 * - Color coding: gray=unanswered, green=answered, blue=current
 * - Materi labels per question
 * - Timer display
 * - Submit button (disabled until all answered OR timer expires)
 */
export function UTBKTestLayout({
  questions,
  answers,
  currentIndex,
  onNavigate,
  onAnswer,
  onSubmit,
  isSubmitting,
  timer,
  error,
  headerInfo,
  headerBorderClass = 'border-primary-200',
  headerBgClass = 'bg-primary-50',
  headerTextClass = 'text-primary-800',
}: UTBKTestLayoutProps) {
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;
  const currentQuestion = questions[currentIndex];
  const canSubmit = allAnswered || timer.isExpired;

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!currentQuestion) return;
      onAnswer(currentQuestion.id, answer);
    },
    [currentQuestion, onAnswer]
  );

  const getNumberButtonClass = (index: number): string => {
    const questionId = questions[index]?.id;
    const isAnswered = questionId ? !!answers[questionId] : false;
    const isCurrent = index === currentIndex;

    if (isCurrent) {
      return 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300';
    }
    if (isAnswered) {
      return 'bg-green-100 text-green-800 border-green-400';
    }
    return 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200';
  };

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Tidak ada soal tersedia.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-3xl mx-auto">
      {/* Header info */}
      {headerInfo && (
        <div className={`rounded-lg border ${headerBorderClass} ${headerBgClass} p-4`}>
          <p className={`text-sm ${headerTextClass}`}>{headerInfo}</p>
        </div>
      )}

      {/* Timer + Progress summary */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {answeredCount}/{totalQuestions} terjawab
        </span>
        <TimerDisplay formatted={timer.formatted} isWarning={timer.isWarning} />
      </div>

      {/* Number Grid Navigation */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">Navigasi Soal</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => onNavigate(index)}
              className={`h-9 w-9 rounded-md border text-xs font-semibold transition-colors ${getNumberButtonClass(index)}`}
              aria-label={`Soal nomor ${index + 1}${answers[questions[index]?.id] ? ' (sudah dijawab)' : ' (belum dijawab)'}${index === currentIndex ? ' (aktif)' : ''}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            >
              {index + 1}
            </button>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-blue-600" /> Aktif
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-green-100 border border-green-400" /> Terjawab
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-gray-100 border border-gray-300" /> Belum
          </span>
        </div>
      </div>

      {/* Materi Label */}
      {currentQuestion.materiLabel && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
            {currentQuestion.materiLabel}
          </span>
          <span className="text-sm text-muted-foreground">
            Soal {currentIndex + 1} dari {totalQuestions}
          </span>
        </div>
      )}

      {!currentQuestion.materiLabel && (
        <span className="text-sm text-muted-foreground">
          Soal {currentIndex + 1} dari {totalQuestions}
        </span>
      )}

      {/* Question Renderer */}
      <QuestionRenderer
        question={currentQuestion}
        answer={answers[currentQuestion.id]}
        onAnswer={handleAnswer}
      />

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3" role="alert" aria-live="assertive">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Navigation + Submit */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          aria-label="Soal sebelumnya"
        >
          ← Sebelumnya
        </Button>

        <div className="flex gap-2">
          {currentIndex < totalQuestions - 1 && (
            <Button
              variant="outline"
              onClick={() => onNavigate(Math.min(totalQuestions - 1, currentIndex + 1))}
              aria-label="Soal berikutnya"
            >
              Berikutnya →
            </Button>
          )}
          <Button
            onClick={onSubmit}
            disabled={(!canSubmit) || isSubmitting}
            className="bg-primary-600 hover:bg-primary-700 text-white"
            aria-label="Kirim semua jawaban"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Mengirim...
              </>
            ) : (
              'Kirim Jawaban'
            )}
          </Button>
        </div>
      </div>

      {/* Submit hint */}
      {!allAnswered && !timer.isExpired && (
        <p className="text-xs text-center text-muted-foreground">
          Jawab semua soal untuk mengaktifkan tombol kirim, atau tunggu waktu habis.
        </p>
      )}
    </div>
  );
}
