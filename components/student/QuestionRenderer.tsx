'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { Question } from '@/lib/types';

interface QuestionRendererProps {
  question: Question;
  answer: string | undefined;
  onAnswer: (answer: string) => void;
}

/**
 * Renders text with LaTeX support using KaTeX.
 * $$...$$ = block math, $..$ = inline math.
 */
function renderLatex(text: string): string {
  // Block math: $$...$$
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch { return `<code>${math}</code>`; }
  });

  // Inline math: $...$
  result = result.replace(/\$(.*?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch { return `<code>${math}</code>`; }
  });

  return result;
}

function MathText({ text, className }: { text: string; className?: string }) {
  const html = useMemo(() => renderLatex(text), [text]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Multi-type question renderer.
 * Supports MULTIPLE_CHOICE, ESSAY, SHORT_ANSWER.
 * Supports images and LaTeX (KaTeX).
 */
export function QuestionRenderer({ question, answer, onAnswer }: QuestionRendererProps) {
  const questionType = question.questionType || 'MULTIPLE_CHOICE';

  const QuestionCard = (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3">
      <div className="text-sm sm:text-base font-medium leading-relaxed">
        <MathText text={question.text} />
      </div>
      {question.imageUrl && (
        <div className="relative w-full max-w-md rounded-lg overflow-hidden border border-border">
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

  if (questionType === 'SHORT_ANSWER') {
    return (
      <div className="space-y-3">
        {QuestionCard}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Jawaban Isian</label>
          <input
            type="text"
            value={answer || ''}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Tulis jawaban kamu..."
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
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
              <span className="text-sm">
                <MathText text={option.text} />
              </span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
