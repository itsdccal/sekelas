'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TimerDisplay } from '@/components/student/TimerDisplay';
import { QuestionRenderer } from '@/components/student/QuestionRenderer';
import { ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Question } from '@/lib/types';

interface UTBKTestLayoutProps {
  questions: Question[];
  answers: Record<string, string>;
  currentIndex: number;
  onNavigate: (index: number) => void;
  onAnswer: (questionId: string, answer: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  timer: { formatted: string; isWarning: boolean; isExpired: boolean };
  error?: string | null;
}

export function UTBKTestLayout({
  questions, answers, currentIndex, onNavigate, onAnswer, onSubmit, isSubmitting, timer, error,
}: UTBKTestLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;
  const currentQuestion = questions[currentIndex];
  const canSubmit = allAnswered || timer.isExpired;

  const handleAnswer = useCallback((answer: string) => {
    if (!currentQuestion) return;
    onAnswer(currentQuestion.id, answer);
  }, [currentQuestion, onAnswer]);

  const handleNavigate = useCallback((index: number) => {
    onNavigate(index);
    setDrawerOpen(false);
  }, [onNavigate]);

  const getNumClass = (index: number): string => {
    const qId = questions[index]?.id;
    const answered = qId ? !!answers[qId] : false;
    const current = index === currentIndex;
    if (current) return 'bg-blue-600 text-white border-blue-600';
    if (answered) return 'bg-green-500 text-white border-green-500';
    return 'bg-white text-gray-600 border-gray-200 hover:border-gray-400';
  };

  if (!currentQuestion) {
    return <div className="flex items-center justify-center h-60"><p className="text-sm text-muted-foreground">Tidak ada soal.</p></div>;
  }

  const NumberGrid = (
    <div className="grid grid-cols-5 gap-2">
      {questions.map((_, i) => (
        <button key={i} onClick={() => handleNavigate(i)}
          className={`h-9 w-9 rounded-lg border text-xs font-semibold transition-all ${getNumClass(i)}`}>
          {i + 1}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full">
      {/* TOP BAR */}
      <div className="shrink-0 flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-border bg-white">
        {/* Prev */}
        <button
          onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground disabled:opacity-30 hover:bg-gray-50 transition-colors"
          aria-label="Soal sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Center */}
        <div className="flex items-center gap-3 min-w-0">
          {currentQuestion.subjectLabel && (
            <span className="hidden sm:inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700">
              {currentQuestion.subjectLabel}
            </span>
          )}
          <span className="text-sm font-semibold text-foreground">
            {currentIndex + 1} / {totalQuestions}
          </span>
          <TimerDisplay formatted={timer.formatted} isWarning={timer.isWarning} />
        </div>

        {/* Next */}
        <button
          onClick={() => onNavigate(Math.min(totalQuestions - 1, currentIndex + 1))}
          disabled={currentIndex >= totalQuestions - 1}
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground disabled:opacity-30 hover:bg-gray-50 transition-colors"
          aria-label="Soal berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Question */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {currentQuestion.subjectLabel && (
            <span className="sm:hidden inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700 mb-3">
              {currentQuestion.subjectLabel}
            </span>
          )}

          <QuestionRenderer question={currentQuestion} answer={answers[currentQuestion.id]} onAnswer={handleAnswer} />

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 mt-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Right: Sidebar (desktop) */}
        <div className="hidden lg:flex w-60 shrink-0 border-l border-border bg-gray-50/30 flex-col p-4">
          <p className="text-xs font-semibold text-foreground mb-3">Nomor Soal</p>
          {NumberGrid}

          {/* Compact stats */}
          <p className="text-xs text-muted-foreground mt-3">
            {answeredCount} dari {totalQuestions} terjawab
          </p>

          <div className="mt-auto pt-4">
            <Button onClick={onSubmit} disabled={!canSubmit || isSubmitting} className="w-full bg-primary-600 hover:bg-primary-700 text-white" size="default">
              {isSubmitting ? 'Mengirim...' : 'Kirim Jawaban'}
            </Button>
            {!allAnswered && !timer.isExpired && (
              <p className="text-[11px] text-center text-muted-foreground mt-2">
                Jawab semua soal untuk mengirim
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM */}
      <div className="lg:hidden shrink-0 border-t border-border bg-white px-3 py-2 flex items-center justify-between gap-2">
        <button onClick={() => setDrawerOpen(!drawerOpen)} className="flex items-center gap-1.5 text-xs font-semibold text-primary-700 px-3 py-2 rounded-lg border-2 border-primary-200 bg-primary-50 transition-colors">
          <ChevronUp className={`h-3.5 w-3.5 transition-transform ${drawerOpen ? 'rotate-180' : ''}`} />
          Nomor Soal
        </button>
        <span className="text-xs text-muted-foreground">{answeredCount}/{totalQuestions}</span>
        <Button onClick={onSubmit} disabled={!canSubmit || isSubmitting} className="bg-primary-600 hover:bg-primary-700 text-white" size="sm">
          {isSubmitting ? '...' : 'Kirim'}
        </Button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden border-t border-border bg-white px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-foreground">Nomor Soal</p>
            <button onClick={() => setDrawerOpen(false)} className="text-xs font-medium text-primary-600 px-2.5 py-1 rounded-md border border-primary-200 hover:bg-primary-50">
              Tutup
            </button>
          </div>
          {NumberGrid}
        </div>
      )}
    </div>
  );
}
