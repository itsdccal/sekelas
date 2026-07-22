'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { pretestApi } from '@/lib/api';
import { useTimer } from '@/lib/hooks/useTimer';
import { UTBKTestLayout } from '@/components/student/UTBKTestLayout';
import type { Question, PreTestResult } from '@/lib/types';

interface PreTestComponentProps {
  subjectId: string;
  onComplete: (result: PreTestResult) => void;
}

/**
 * Pre Test Component — measures student understanding level at Materi level.
 * Uses UTBK-style layout with number grid navigation.
 * No right/wrong indicators shown to student.
 * After submit, returns placement result (which Bab to start from).
 *
 * Requirements: 17.1, 17.2, 17.3, 17.5, 17.7, 17.8
 */
export function PreTestComponent({ subjectId, onComplete }: PreTestComponentProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer: 20 minutes for pre test
  const handleTimeUp = useCallback(() => {
    if (questions.length > 0 && Object.keys(answers).length > 0) {
      const submission = {
        subjectId,
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId })),
      };
      pretestApi.submitPreTest(submission).then(onComplete).catch(() => {});
    }
  }, [questions.length, answers, subjectId, onComplete]);

  const timer = useTimer(20, handleTimeUp, !isLoading && questions.length > 0);

  // Load questions on mount
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    pretestApi.getPreTestQuestions(subjectId)
      .then((data) => {
        setQuestions(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat soal Pre Test. Silakan coba lagi.');
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
      const result = await pretestApi.submitPreTest(submission);
      onComplete(result);
    } catch {
      setError('Gagal mengirim jawaban. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  }, [subjectId, answers, onComplete]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    pretestApi.getPreTestQuestions(subjectId)
      .then((data) => {
        setQuestions(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat soal Pre Test. Silakan coba lagi.');
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
