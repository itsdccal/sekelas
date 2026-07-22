'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { posttestApi } from '@/lib/api';
import { useTimer } from '@/lib/hooks/useTimer';
import { UTBKTestLayout } from '@/components/student/UTBKTestLayout';
import type { Question, PostTestResult } from '@/lib/types';

interface PostTestComponentProps {
  subjectId: string;
  onComplete: (result: PostTestResult) => void;
}

/**
 * Post Test Component — evaluates student understanding after completing all chapters.
 * Uses UTBK-style layout with number grid navigation.
 * Has scoring, passing grade, and XP.
 *
 * Requirements: 19.2, 19.3, 19.7, 19.8
 */
export function PostTestComponent({ subjectId, onComplete }: PostTestComponentProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer: 20 minutes for post test
  const handleTimeUp = useCallback(() => {
    if (questions.length > 0 && Object.keys(answers).length > 0) {
      const submission = {
        subjectId,
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId })),
      };
      posttestApi.submitPostTest(submission).then(onComplete).catch(() => {});
    }
  }, [questions.length, answers, subjectId, onComplete]);

  const timer = useTimer(20, handleTimeUp, !isLoading && questions.length > 0);

  // Load questions on mount
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    posttestApi.getPostTestQuestions(subjectId)
      .then((data) => {
        setQuestions(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat soal Post Test. Silakan coba lagi.');
        setIsLoading(false);
      });
  }, [subjectId]);

  const handleAnswer = useCallback(
    (questionId: string, answer: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    },
    []
  );

  const handleNavigate = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const submission = {
        subjectId,
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
  }, [subjectId, answers, onComplete]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    posttestApi.getPostTestQuestions(subjectId)
      .then((data) => {
        setQuestions(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat soal Post Test. Silakan coba lagi.');
        setIsLoading(false);
      });
  }, [subjectId]);

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

  return (
    <UTBKTestLayout
      questions={questions}
      answers={answers}
      currentIndex={currentIndex}
      onNavigate={handleNavigate}
      onAnswer={handleAnswer}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      timer={timer}
      error={error}
    />
  );
}
