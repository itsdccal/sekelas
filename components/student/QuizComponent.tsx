'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQuizStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { TimerDisplay } from '@/components/student/TimerDisplay';
import { useTimer } from '@/lib/hooks/useTimer';
import type { QuizResult } from '@/lib/types';

interface QuizComponentProps {
  chapterId: string;
  onComplete: (result: QuizResult) => void;
}

export function QuizComponent({ chapterId, onComplete }: QuizComponentProps) {
  const {
    questions,
    answers,
    isLoading,
    isSubmitting,
    error,
    loadQuestions,
    setAnswer,
    submitQuiz,
    reset,
  } = useQuizStore();

  const [currentIndex, setCurrentIndex] = useState(0);

  // Timer: 5 minutes for quiz chapter
  const handleTimeUp = useCallback(() => {
    // Auto-submit when time runs out
    if (questions.length > 0) {
      submitQuiz(chapterId).then(onComplete).catch(() => {});
    }
  }, [questions.length, submitQuiz, chapterId, onComplete]);

  const timer = useTimer(5, handleTimeUp, !isLoading && questions.length > 0);

  // Load questions on mount
  useEffect(() => {
    reset();
    loadQuestions(chapterId);
  }, [chapterId, loadQuestions, reset]);

  // Navigation-away confirmation (beforeunload)
  useEffect(() => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount === 0) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [answers]);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;
  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return;
      setAnswer(currentQuestion.id, optionId);
    },
    [currentQuestion, setAnswer]
  );

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
  }, [totalQuestions]);

  const handleSubmit = useCallback(async () => {
    try {
      const result = await submitQuiz(chapterId);
      onComplete(result);
    } catch {
      // Error is handled by the store — answers are preserved
    }
  }, [submitQuiz, chapterId, onComplete]);

  const handleRetry = useCallback(() => {
    if (error && questions.length === 0) {
      loadQuestions(chapterId);
    }
  }, [error, questions.length, loadQuestions, chapterId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Memuat soal kuis...</p>
      </div>
    );
  }

  // Error state (no questions loaded)
  if (error && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12" role="alert" aria-live="assertive">
        <p className="text-sm text-destructive mb-4">{error}</p>
        <Button onClick={handleRetry} variant="outline">
          Coba Lagi
        </Button>
      </div>
    );
  }

  // No questions available
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Tidak ada soal tersedia.</p>
      </div>
    );
  }

  const selectedOptionId = answers[currentQuestion.id] || null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Answer counter + Timer */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Soal {currentIndex + 1} dari {totalQuestions}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" aria-live="polite" aria-atomic="true">
            {answeredCount}/{totalQuestions} terjawab
          </span>
          <TimerDisplay formatted={timer.formatted} isWarning={timer.isWarning} />
        </div>
      </div>

      {/* Question text */}
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-base font-medium leading-relaxed">
          {currentQuestion.text}
        </p>
      </div>

      {/* Options */}
      <fieldset className="space-y-3" aria-label={`Opsi jawaban untuk soal ${currentIndex + 1}`}>
        <legend className="sr-only">Pilih jawaban</legend>
        {currentQuestion.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          return (
            <label
              key={option.id}
              className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                isSelected
                  ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
                  : 'border-border hover:border-primary-300 hover:bg-muted/50'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option.id}
                checked={isSelected}
                onChange={() => handleOptionSelect(option.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-600 focus:ring-2"
                aria-label={option.text}
              />
              <span className="text-sm">{option.text}</span>
            </label>
          );
        })}
      </fieldset>

      {/* Error message (submission error — answers preserved) */}
      {error && questions.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3" role="alert" aria-live="assertive">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          aria-label="Soal sebelumnya"
        >
          Sebelumnya
        </Button>

        <div className="flex gap-2">
          {currentIndex < totalQuestions - 1 ? (
            <Button
              onClick={handleNext}
              aria-label="Soal berikutnya"
            >
              Berikutnya
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              aria-label="Kirim jawaban"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Mengirim...
                </>
              ) : (
                'Kirim Jawaban'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
