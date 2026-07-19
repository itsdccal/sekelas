'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizBuilderPanel } from '@/components/admin/QuizBuilderPanel';
import { BabTestBuilderPanel } from '@/components/admin/BabTestBuilderPanel';

const TYPE_LABELS: Record<string, string> = {
  pre_test: 'Pre Test',
  post_test: 'Post Test',
};

/**
 * Admin Quiz Builder Page
 *
 * Handles both:
 * - Chapter-level quiz builder (no ?type param) → QuizBuilderPanel
 * - Bab-level pre/post test builder (?type=pre_test or ?type=post_test) → BabTestBuilderPanel
 *
 * Requirements: 11.1, 21.1, 21.2, 21.3
 */
export default function QuizBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const targetId = params.chapterId as string;
  const typeParam = searchParams.get('type'); // 'pre_test' or 'post_test' or null

  const isBabLevel = typeParam === 'pre_test' || typeParam === 'post_test';
  const quizType = typeParam === 'pre_test' ? 'PRE_TEST' : typeParam === 'post_test' ? 'POST_TEST' : null;

  const pageTitle = isBabLevel
    ? `Bank Soal — ${TYPE_LABELS[typeParam!]}`
    : 'Bank Soal';

  return (
    <div className="space-y-4">
      {/* Page header with back navigation */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Kembali"
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg sm:text-2xl font-semibold text-foreground truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Render appropriate panel based on type */}
      {isBabLevel && quizType ? (
        <BabTestBuilderPanel babId={targetId} quizType={quizType as 'PRE_TEST' | 'POST_TEST'} />
      ) : (
        <QuizBuilderPanel chapterId={targetId} />
      )}
    </div>
  );
}
