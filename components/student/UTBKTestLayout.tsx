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
 * UTBK-style test layout — full viewport height, no scrolling page.
 * Left: question area (scrollable content).
 * Right: number grid panel (fixed sidebar).
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

    if (isCurrent) return 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200';
    if (isAnswered) return 'bg-green-500 text-white border-green-500';
    return 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50';
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-sm text-muted-foreground">Tidak ada soal tersedia.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] w-full max-w-6xl mx-auto gap-0 lg:gap-4">
      {/* LEFT: Question area — takes remaining space, scrollable */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top bar: timer + progress + info */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-border bg-white">
          <div className="flex items-center gap-3">
            {currentQuestion.materiLabel && (
              <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                {currentQuestion.materiLabel}
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              Soal {currentIndex + 1}/{totalQuestions}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {answeredCount}/{totalQuestions} terjawab
            </span>
            <TimerDisplay formatted={timer.formatted} isWarning={timer.isWarning} />
          </div>
        </div>

        {/* Question content — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {headerInfo && (
            <div className={`rounded-lg border ${headerBorderClass} ${headerBgClass} p-3 mb-4`}>
              <p className={`text-xs ${headerTextClass}`}>{headerInfo}</p>
            </div>
          )}

          <QuestionRenderer
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswer={handleAnswer}
          />

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 mt-3" role="alert">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-border bg-white">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            ← Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate(Math.min(totalQuestions - 1, currentIndex + 1))}
            disabled={currentIndex >= totalQuestions - 1}
          >
            Berikutnya →
          </Button>
        </div>
      </div>

      {/* RIGHT: Number grid sidebar — fixed height, no scroll */}
      <div className="w-full lg:w-56 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-white">
        <div className="h-full flex flex-col p-3 lg:p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Nomor Soal</p>

          {/* Number grid */}
          <div className="grid grid-cols-5 gap-1.5 mb-3">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => onNavigate(index)}
                className={`h-8 w-8 rounded border text-xs font-bold transition-all ${getNumberButtonClass(index)}`}
                aria-label={`Soal ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />Aktif</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-green-500" />Jawab</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-white border border-gray-300" />Belum</span>
          </div>

          {/* Submit */}
          <div className="mt-auto">
            <Button
              onClick={onSubmit}
              disabled={!canSubmit || isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm"
              size="sm"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Jawaban'}
            </Button>
            {!allAnswered && !timer.isExpired && (
              <p className="text-[10px] text-center text-muted-foreground mt-1.5">
                Jawab semua atau tunggu waktu habis
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
