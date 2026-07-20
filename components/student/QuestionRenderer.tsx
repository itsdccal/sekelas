'use client';

import type { Question } from '@/lib/types';

interface QuestionRendererProps {
  question: Question;
  answer: string | undefined; // selectedOptionId for MC, text for essay/short_answer
  onAnswer: (answer: string) => void;
}

/**
 * Multi-type question renderer.
 * Supports MULTIPLE_CHOICE, ESSAY, and SHORT_ANSWER question types.
 */
export function QuestionRenderer({ question, answer, onAnswer }: QuestionRendererProps) {
  const questionType = question.questionType || 'MULTIPLE_CHOICE';

  if (questionType === 'ESSAY') {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-base font-medium leading-relaxed">{question.text}</p>
        </div>
        <div className="space-y-2">
          <label htmlFor={`essay-${question.id}`} className="text-sm font-medium text-foreground">
            Jawaban Esai
          </label>
          <textarea
            id={`essay-${question.id}`}
            value={answer || ''}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Tulis jawaban esai kamu di sini (minimal 50 karakter)..."
            className="w-full min-h-[160px] rounded-lg border border-border bg-background p-4 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
            aria-label={`Jawaban esai untuk: ${question.text}`}
          />
          <p className={`text-xs ${(answer?.length || 0) >= 50 ? 'text-green-600' : 'text-muted-foreground'}`}>
            {answer?.length || 0}/50 karakter minimum
          </p>
        </div>
      </div>
    );
  }

  if (questionType === 'SHORT_ANSWER') {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-base font-medium leading-relaxed">{question.text}</p>
        </div>
        <div className="space-y-2">
          <label htmlFor={`short-${question.id}`} className="text-sm font-medium text-foreground">
            Jawaban Singkat
          </label>
          <input
            id={`short-${question.id}`}
            type="text"
            value={answer || ''}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Tulis jawaban singkat kamu..."
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
            aria-label={`Jawaban singkat untuk: ${question.text}`}
          />
        </div>
      </div>
    );
  }

  // Default: MULTIPLE_CHOICE
  const selectedOptionId = answer || null;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-base font-medium leading-relaxed">{question.text}</p>
      </div>
      <fieldset className="space-y-3" aria-label={`Opsi jawaban untuk: ${question.text}`}>
        <legend className="sr-only">Pilih jawaban</legend>
        {question.options.map((option) => {
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
                name={`question-${question.id}`}
                value={option.id}
                checked={isSelected}
                onChange={() => onAnswer(option.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-600 focus:ring-2"
                aria-label={option.text}
              />
              <span className="text-sm">{option.text}</span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
