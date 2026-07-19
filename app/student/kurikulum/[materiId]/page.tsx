'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2, AlertCircle, Lock, CheckCircle, ClipboardCheck, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { curriculumApi, pretestApi, posttestApi } from '@/lib/api';
import type { Bab } from '@/lib/types';
import type { BabStatus } from '@/lib/types';

interface BabWithStatus extends Bab {
  babStatus: BabStatus;
  preTestCompleted: boolean;
  postTestCompleted: boolean;
  completedChapters: number;
}

/**
 * Bab list page with Duolingo-style progressive flow.
 * Bab 1 is unlocked, rest are locked until previous Bab's Post Test is passed.
 * Shows Pre Test / Post Test status indicators.
 *
 * Requirements: 18.1, 18.2, 18.7
 */
export default function BabListPage() {
  const params = useParams();
  const router = useRouter();
  const materiId = params.materiId as string;

  const [babs, setBabs] = useState<BabWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBabs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await curriculumApi.getBabList(materiId);
      const sorted = [...data].sort((a, b) => a.orderIndex - b.orderIndex);

      // Fetch pre/post test status for each bab
      const babsWithStatus: BabWithStatus[] = await Promise.all(
        sorted.map(async (bab, index) => {
          let preTestCompleted = false;
          let postTestCompleted = false;

          try {
            const preStatus = await pretestApi.getPreTestStatus(bab.id);
            preTestCompleted = preStatus.completed;
          } catch {
            // Default to not completed
          }

          try {
            const postStatus = await posttestApi.getPostTestStatus(bab.id);
            postTestCompleted = postStatus.passed;
          } catch {
            // Default to not completed
          }

          // Determine bab status based on progressive flow:
          // First bab is always unlocked
          // Subsequent babs are locked until previous bab's post test is passed
          let babStatus: BabStatus = 'LOCKED';
          if (index === 0) {
            babStatus = postTestCompleted ? 'COMPLETED' : (preTestCompleted ? 'IN_PROGRESS' : 'UNLOCKED');
          }
          // Will be updated below based on previous bab status

          return {
            ...bab,
            babStatus,
            preTestCompleted,
            postTestCompleted,
            completedChapters: 0, // Will be calculated per-chapter in detail view
          };
        })
      );

      // Recalculate status based on sequential logic
      for (let i = 1; i < babsWithStatus.length; i++) {
        const previousBab = babsWithStatus[i - 1];
        if (previousBab.postTestCompleted) {
          // Previous bab completed — this bab is at least unlocked
          const currentBab = babsWithStatus[i];
          if (currentBab.postTestCompleted) {
            babsWithStatus[i].babStatus = 'COMPLETED';
          } else if (currentBab.preTestCompleted) {
            babsWithStatus[i].babStatus = 'IN_PROGRESS';
          } else {
            babsWithStatus[i].babStatus = 'UNLOCKED';
          }
        }
        // else: stays LOCKED
      }

      setBabs(babsWithStatus);
    } catch {
      setError('Gagal memuat daftar bab. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [materiId]);

  useEffect(() => {
    fetchBabs();
  }, [fetchBabs]);

  const handleBabClick = useCallback(
    (bab: BabWithStatus) => {
      if (bab.babStatus === 'LOCKED') {
        // Do nothing — will show locked message via UI
        return;
      }

      if (!bab.preTestCompleted) {
        // Navigate to Pre Test gate
        router.push(`/student/bab/${bab.id}/pretest`);
      } else {
        // Navigate to chapter list
        router.push(`/student/kurikulum/${materiId}/${bab.id}`);
      }
    },
    [materiId, router]
  );

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 animate-pulse rounded-md bg-gray-200" />
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border border-border bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/student/kurikulum')}
          aria-label="Kembali ke daftar materi"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
          <Button onClick={fetchBabs} size="sm">
            <Loader2 className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/student/kurikulum')}
          aria-label="Kembali ke daftar materi"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Daftar Bab</h1>
      </div>

      {/* Empty state */}
      {babs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-12">
          <BookOpen className="h-10 w-10 text-gray-400" />
          <p className="text-sm text-gray-500">
            Belum ada bab tersedia pada materi ini.
          </p>
        </div>
      ) : (
        /* Bab list with progressive indicators */
        <div className="space-y-3">
          {babs.map((bab) => {
            const isLocked = bab.babStatus === 'LOCKED';
            const isCompleted = bab.babStatus === 'COMPLETED';

            return (
              <button
                key={bab.id}
                onClick={() => handleBabClick(bab)}
                disabled={isLocked}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  isLocked
                    ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60 grayscale'
                    : isCompleted
                      ? 'border-green-200 bg-green-50 hover:border-green-300'
                      : 'border-border bg-white hover:border-primary-300 hover:bg-primary-50'
                }`}
                aria-label={`${bab.name}${isLocked ? ' — Terkunci' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Status icon */}
                    {isLocked && <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />}
                    {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />}
                    {!isLocked && !isCompleted && <BookOpen className="h-5 w-5 text-primary-600" aria-hidden="true" />}

                    <div>
                      <h2 className={`font-medium ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                        {bab.name}
                      </h2>
                      <p className={`mt-0.5 text-xs ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
                        {bab.chapterCount} chapter
                      </p>
                    </div>
                  </div>

                  {/* Progress indicators */}
                  {!isLocked && (
                    <div className="flex items-center gap-2">
                      {/* Pre Test indicator */}
                      <div
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                          bab.preTestCompleted
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                        title={bab.preTestCompleted ? 'Pre Test selesai' : 'Pre Test belum dikerjakan'}
                      >
                        <FileQuestion className="h-3 w-3" aria-hidden="true" />
                        <span>Pre</span>
                      </div>

                      {/* Post Test indicator */}
                      <div
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                          bab.postTestCompleted
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                        title={bab.postTestCompleted ? 'Post Test lulus' : 'Post Test belum dikerjakan'}
                      >
                        <ClipboardCheck className="h-3 w-3" aria-hidden="true" />
                        <span>Post</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Locked message */}
                {isLocked && (
                  <p className="mt-2 text-xs text-gray-400">
                    Selesaikan Post Test bab sebelumnya untuk membuka bab ini
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
