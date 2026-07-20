'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TimerDisplay } from '@/components/student/TimerDisplay';
import { QuestionRenderer } from '@/components/student/QuestionRenderer';
import { ChevronUp, ChevronDown } from 'lucide-react';
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

/**
 * UTBK-style test layout.
 * Desktop: soal kiri (flex-1), nomor grid kanan (fixed 220px).
 * Mobile: soal full width + bottom drawer untuk nomor grid.
 */
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
    return 'bg-white text-gray-600 border-gray-300';
  };

  if (!currentQuestion) {
    return <div className="flex items-center justify-center h-60"><p className="text-sm text-muted-foreground">Tidak ada soal.</p></div>;
  }

  // Number grid content (reused in both desktop sidebar and mobile drawer)
  const NumberGrid = (
    <div className="grid grid-cols-5 gap-1.5">
      {questions.map((_, i) => (
        <button key={i} onClick={() => handleNavigate(i)}
          className={`h-8 w-8 rounded border text-xs font-bold transition-all ${getNumClass(i)}`}>
          {i + 1}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] w-full">
      {/* TOP BAR */}
      <div className="shrink-0 flex items-center justify-between px-3 sm:px-4 py-2 border-b border-border bg-white">
        <div className="flex items-center gap-2">
          {currentQuestion.materiLabel && (
            <span className="hidden sm:inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-medium text-primary-700">
              {currentQuestion.materiLabel}
            </span>
          )}
          <span className="text-sm font-medium text-foreground">Soal {currentIndex + 1}/{totalQuestions}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{answeredCount}/{totalQuestions}</span>
          <TimerDisplay formatted={timer.formatted} isWarning={timer.isWarning} />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Question (scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          {currentQuestion.materiLabel && (
            <span className="sm:hidden inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-medium text-primary-700 mb-2">
              {currentQuestion.materiLabel}
            </span>
          )}

          <QuestionRenderer question={currentQuestion} answer={answers[currentQuestion.id]} onAnswer={handleAnswer} />

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 mt-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Right: Sidebar (desktop only) */}
        <div className="hidden lg:flex w-56 shrink-0 border-l border-border bg-gray-50/50 flex-col p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Nomor Soal</p>
          {NumberGrid}
          <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-blue-600" />Aktif</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-green-500" />Jawab</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-white border border-gray-300" />Belum</span>
          </div>
          <div className="mt-auto pt-3">
            <Button onClick={onSubmit} disabled={!canSubmit || isSubmitting} className="w-full bg-primary-600 hover:bg-primary-700 text-white" size="sm">
              {isSubmitting ? 'Mengirim...' : 'Kirim Jawaban'}
            </Button>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR (nav + mobile drawer trigger) */}
      <div className="shrink-0 border-t border-border bg-white">
        {/* Navigation */}
        <div className="flex items-center justify-between px-3 py-2">
          <Button variant="outline" size="sm" onClick={() => onNavigate(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
            ←
          </Button>

          {/* Mobile: drawer trigger */}
          <button onClick={() => setDrawerOpen(!drawerOpen)} className="lg:hidden flex items-center gap-1 text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-full border border-border bg-gray-50">
            Soal {currentIndex + 1}/{totalQuestions}
            {drawerOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>

          {/* Desktop: submit inline */}
          <div className="hidden lg:block" />

          <div className="flex items-center gap-2">
            {/* Mobile submit */}
            <Button onClick={onSubmit} disabled={!canSubmit || isSubmitting} className="lg:hidden bg-primary-600 hover:bg-primary-700 text-white" size="sm">
              {isSubmitting ? '...' : 'Kirim'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate(Math.min(totalQuestions - 1, currentIndex + 1))} disabled={currentIndex >= totalQuestions - 1}>
              →
            </Button>
          </div>
        </div>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="lg:hidden border-t border-border bg-white px-3 py-3 animate-in slide-in-from-bottom-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Nomor Soal</p>
            {NumberGrid}
          </div>
        )}
      </div>
    </div>
  );
}
