'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { pretestApi } from '@/lib/api';
import type { Question, PreTestResult } from '@/lib/types';

interface PreTestComponentProps {
  babId: string;
  onComplete: (result: PreTestResult) => void;
}

/**
 * Pre Test Component — measures student understanding level.
 * No right/wrong indicators. Shows one question at a time.
 * After submit, returns placement result.
 *
 * Requirements: 17.1, 17.2, 17.3, 17.5, 17.7, 17.8
 */
export function PreTestComponent({ babId, onComplete }: PreTestComponentProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load questions on mount
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    pretestApi.getPreTestQuestions(babId)
      .then((data) => {
        setQuestions(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat soal Pre Test. Silakan coba lagi.');
        setIsLoading(false);
      });
  }, [babId]);

  const handleOptionSelect = useCallback(
    (optionId: string) => {
      const currentQuestion = questions[currentIndex];
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
    },
    [questions, currentIndex]
  );

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
  }, [questions.length]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const submission = {
        babId,
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      };
      const result = await pretestApi.submitPreTest(submission);
      onComplete(result);
    } catch {
      setError('Gagal mengirim jawaban. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  }, [babId, answers, onComplete]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    pretestApi.getPreTestQuestions(babId)
      .then((data) => {
        setQuestions(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat soal Pre Test. Silakan coba lagi.');
        setIsLoading(false);
      });
  }, [babId]);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;
  const currentQuestion = questions[currentIndex];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Memuat soal Pre Test...</p>
      </div>
    );
  }

  // Error state (no questions)
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
      {/* Header info */}
      <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
        <p className="text-sm text-primary-800">
          Pre Test ini mengukur tingkat pemahaman kamu. Jawab sesuai kemampuanmu saat ini —
          hasilnya menentukan dari chapter mana kamu mulai belajar.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Soal {currentIndex + 1} dari {totalQuestions}
        </span>
        <span className="text-sm font-medium" aria-live="polite" aria-atomic="true">
          {answeredCount}/{totalQuestions} terjawab
        </span>
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
                name={`pretest-${currentQuestion.id}`}
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

      {/* Error (submit error) */}
      {error && questions.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3" role="alert" aria-live="assertive">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Navigation */}
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
            <Button onClick={handleNext} aria-label="Soal berikutnya">
              Berikutnya
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              aria-label="Kirim jawaban Pre Test"
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
