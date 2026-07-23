'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PostTestComponent } from '@/components/student/PostTestComponent';
import { PostTestResultDisplay } from '@/components/student/PostTestResult';
import type { PostTestResult } from '@/lib/types';

/**
 * Post Test page at Materi level.
 * Available after all Babs in the Materi are completed.
 */
export default function PostTestPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;

  const [result, setResult] = useState<PostTestResult | null>(null);
  const [showTest, setShowTest] = useState(true);

  const handleComplete = useCallback((r: PostTestResult) => {
    setResult(r);
    setShowTest(false);
  }, []);

  const handleContinue = useCallback(() => {
    router.push('/student/courses');
  }, [router]);

  const handleWatchChapter = useCallback((chapterId: string) => {
    router.push(`/student/chapter/${chapterId}/video`);
  }, [router]);

  if (!showTest && result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <PostTestResultDisplay
          result={result}
          onContinue={handleContinue}
          onWatchChapter={handleWatchChapter}
          watchedChapterIds={[]}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PostTestComponent subjectId={subjectId} onComplete={handleComplete} />
    </div>
  );
}
