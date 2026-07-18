'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizBuilderPanel } from '@/components/admin/QuizBuilderPanel';

/**
 * Admin Quiz Builder Page
 *
 * Renders the QuizBuilderPanel for a specific Chapter, allowing admin
 * to manage QuestionPatterns and Questions.
 *
 * Validates: Requirements 11.1
 */
export default function QuizBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.chapterId as string;

  return (
    <div className="space-y-4">
      {/* Page header with back navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/kurikulum')}
          aria-label="Kembali ke Kurikulum"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">
          Quiz Builder
        </h1>
      </div>

      {/* Quiz Builder Panel handles all CRUD logic */}
      <QuizBuilderPanel chapterId={chapterId} />
    </div>
  );
}
