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
  headerInfo?: string;
  headerBorderClass?: string;
  headerBgClass?: string;
  headerTextClass?: string;
}

/**
 * UTBK-style test layout.
 * Desktop: soal di kiri, panel nomor di kanan (sticky).
 * Mobile: panel nomor di atas (scrollable horizontal).
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

    if (isCurrent) return 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300';
    if (isAnswered) return 'bg-green-100 text-green-800 border-green-400';
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
    <div className="w-full max-w-5xl mx-auto">
      {/* Header info */}
      {headerInfo && (
        <div className={`rounded-lg border ${headerBorderClass} ${headerBgClass} p-4 mb-4`}>
          <p className={`text-sm ${headerTextClass}`}>{headerInfo}</p>
        </div>
      )}

      {/* Timer bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">
          {answeredCount}/{totalQuestions} terjawab
        </span>
        <TimerDisplay formatted={timer.formatted} isWarning={timer.isWarning} />
      </div>

      {/* Main 2-column layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* LEFT: Question area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Materi label + soal number */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">
              Soal {currentIndex + 1}
            </span>
            {currentQuestion.materiLabel && (
              <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                {currentQuestion.materiLabel}
              </span>
            )}
          </div>

          {/* Question */}
          <QuestionRenderer
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswer={handleAnswer}
          />

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3" role="alert">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              ← Sebelumnya
            </Button>
            <div className="flex gap-2">
              {currentIndex < totalQuestions - 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate(currentIndex + 1)}
                >
                  Berikutnya →
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Number grid panel (sticky) */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="lg:sticky lg:top-4 rounded-lg border border-border bg-card p-4 space-y-4">
            {/* Number grid */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Navigasi Soal</p>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => onNavigate(index)}
                    className={`h-8 w-8 rounded-md border text-xs font-semibold transition-colors ${getNumberButtonClass(index)}`}
                    aria-label={`Soal ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm bg-blue-600" /> Aktif
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm bg-green-100 border border-green-400" /> Terjawab
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm bg-gray-100 border border-gray-300" /> Belum
              </div>
            </div>

            {/* Submit button */}
            <Button
              onClick={onSubmit}
              disabled={!canSubmit || isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
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

            {!allAnswered && !timer.isExpired && (
              <p className="text-xs text-center text-muted-foreground">
                Jawab semua soal atau tunggu waktu habis
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
