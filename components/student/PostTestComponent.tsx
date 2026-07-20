'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { posttestApi } from '@/lib/api';
import type { Question, PostTestResult } from '@/lib/types';

interface PostTestComponentProps {
  materiId: string;
  onComplete: (result: PostTestResult) => void;
}

/**
 * Post Test Component — evaluates student understanding after completing all chapters.
 * Similar to QuizComponent but for Bab-level evaluation.
 * Has scoring, passing grade, and XP.
 *
 * Requirements: 19.2, 19.3, 19.7, 19.8
 */
export function PostTestComponent({ materiId, onComplete }: PostTestComponentProps) {
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
    posttestApi.getPostTestQuestions(materiId)
      .then((data) => {
        setQuestions(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat soal Post Test. Silakan coba lagi.');
        setIsLoading(false);
      });
  }, [materiId]);

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
        materiId,
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      };
      const result = await posttestApi.submitPostTest(submission);
      onComplete(result);
    } catch {
      setError('Gagal mengirim jawaban. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  }, [materiId, answers, onComplete]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    posttestApi.getPostTestQuestions(materiId)
      .then((data) => {
        setQuestions(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat soal Post Test. Silakan coba lagi.');
        setIsLoading(false);
      });
  }, [materiId]);

  // Navigation away confirmation
  useEffect(() => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount === 0) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [answers]);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;
  const currentQuestion = questions[currentIndex];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Memuat soal Post Test...</p>
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
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          Post Test mengevaluasi pemahaman kamu terhadap seluruh materi di Bab ini.
          Kamu harus mencapai batas kelulusan untuk membuka Bab berikutnya.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Soal {currentIndex + 1} dari {totalQuestions}
        </span>
        <span className="text-sm font-medium" aria-live="polite" aria-atomic="true">
          {answeredCount}/{totalQuestions} terjawab
        </span>
      </div>

      {/* Question */}
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
                name={`posttest-${currentQuestion.id}`}
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

      {/* Error (submit error — preserves answers) */}
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
              aria-label="Kirim jawaban Post Test"
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
