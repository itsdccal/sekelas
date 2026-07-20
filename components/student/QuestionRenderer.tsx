'use client';

import Image from 'next/image';
import type { Question } from '@/lib/types';

interface QuestionRendererProps {
  question: Question;
  answer: string | undefined;
  onAnswer: (answer: string) => void;
}

/**
 * Renders question text with LaTeX support.
 * LaTeX wrapped in $..$ (inline) or $$...$$ (block) is rendered in a styled span.
 * In production, integrate KaTeX or MathJax for proper rendering.
 */
function QuestionText({ text }: { text: string }) {
  // Simple LaTeX detection — wrap in code-styled spans for now
  // Replace $$...$$ with block math, $..$ with inline math
  const rendered = text
    .replace(/\$\$(.*?)\$\$/g, '<span class="block my-2 text-center font-mono bg-gray-50 rounded px-3 py-2 text-sm">$1</span>')
    .replace(/\$(.*?)\$/g, '<span class="font-mono bg-gray-50 rounded px-1.5 py-0.5 text-sm">$1</span>');

  return (
    <p
      className="text-sm sm:text-base font-medium leading-relaxed"
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}

/**
 * Multi-type question renderer.
 * Supports MULTIPLE_CHOICE, ESSAY, SHORT_ANSWER.
 * Supports images and LaTeX in question text.
 */
export function QuestionRenderer({ question, answer, onAnswer }: QuestionRendererProps) {
  const questionType = question.questionType || 'MULTIPLE_CHOICE';

  // Shared question card (text + optional image)
  const QuestionCard = (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3">
      <QuestionText text={question.text} />
      {question.imageUrl && (
        <div className="relative w-full max-w-md mx-auto rounded-lg overflow-hidden border border-border">
          <Image
            src={question.imageUrl}
            alt="Gambar soal"
            width={500}
            height={300}
            className="w-full h-auto object-contain"
            unoptimized
          />
        </div>
      )}
    </div>
  );

  if (questionType === 'ESSAY') {
    return (
      <div className="space-y-3">
        {QuestionCard}
        <textarea
          value={answer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Tulis jawaban esai kamu di sini (minimal 50 karakter)..."
          className="w-full min-h-[140px] rounded-lg border border-border bg-background p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
        <p className={`text-xs ${(answer?.length || 0) >= 50 ? 'text-green-600' : 'text-muted-foreground'}`}>
          {answer?.length || 0}/50 karakter minimum
        </p>
      </div>
    );
  }

  if (questionType === 'SHORT_ANSWER') {
    return (
      <div className="space-y-3">
        {QuestionCard}
        <input
          type="text"
          value={answer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Tulis jawaban singkat..."
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
      </div>
    );
  }

  // MULTIPLE_CHOICE
  const selectedOptionId = answer || null;

  return (
    <div className="space-y-3">
      {QuestionCard}
      <fieldset className="space-y-2" aria-label="Pilih jawaban">
        <legend className="sr-only">Pilih jawaban</legend>
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          return (
            <label
              key={option.id}
              className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                isSelected
                  ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
                  : 'border-border hover:border-primary-300 hover:bg-muted/50'
              }`}
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                value={option.id}
                checked={isSelected}
                onChange={() => onAnswer(option.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-600"
              />
              <span className="text-sm">{option.text}</span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
