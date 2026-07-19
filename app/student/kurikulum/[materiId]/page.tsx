'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, AlertCircle, Lock, CheckCircle, ClipboardCheck, FileQuestion } from 'lucide-react';
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

      const babsWithStatus: BabWithStatus[] = await Promise.all(
        sorted.map(async (bab, index) => {
          let preTestCompleted = false;
          let postTestCompleted = false;

          try {
            const preStatus = await pretestApi.getPreTestStatus(bab.id);
            preTestCompleted = preStatus.completed;
          } catch { /* default */ }

          try {
            const postStatus = await posttestApi.getPostTestStatus(bab.id);
            postTestCompleted = postStatus.passed;
          } catch { /* default */ }

          let babStatus: BabStatus = 'LOCKED';
          if (index === 0) {
            babStatus = postTestCompleted ? 'COMPLETED' : (preTestCompleted ? 'IN_PROGRESS' : 'UNLOCKED');
          }

          return { ...bab, babStatus, preTestCompleted, postTestCompleted, completedChapters: 0 };
        })
      );

      for (let i = 1; i < babsWithStatus.length; i++) {
        const previousBab = babsWithStatus[i - 1];
        if (previousBab.postTestCompleted) {
          const currentBab = babsWithStatus[i];
          if (currentBab.postTestCompleted) {
            babsWithStatus[i].babStatus = 'COMPLETED';
          } else if (currentBab.preTestCompleted) {
            babsWithStatus[i].babStatus = 'IN_PROGRESS';
          } else {
            babsWithStatus[i].babStatus = 'UNLOCKED';
          }
        }
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
      if (bab.babStatus === 'LOCKED') return;
      if (!bab.preTestCompleted) {
        router.push(`/student/bab/${bab.id}/pretest`);
      } else {
        router.push(`/student/kurikulum/${materiId}/${bab.id}`);
      }
    },
    [materiId, router]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-pulse rounded bg-muted" />
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/student/kurikulum')}>
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
          <Button onClick={fetchBabs} size="sm">Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => router.push('/student/kurikulum')}
          aria-label="Kembali ke daftar materi"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Daftar Bab</h1>
      </div>

      {babs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-10 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Belum ada bab tersedia</p>
        </div>
      ) : (
        <div className="space-y-3">
          {babs.map((bab, index) => {
            const isLocked = bab.babStatus === 'LOCKED';
            const isCompleted = bab.babStatus === 'COMPLETED';
            const isInProgress = bab.babStatus === 'IN_PROGRESS';

            return (
              <button
                key={bab.id}
                onClick={() => handleBabClick(bab)}
                disabled={isLocked}
                className={`w-full rounded-xl p-4 text-left transition-all ${
                  isLocked
                    ? 'cursor-not-allowed border border-gray-200 bg-gray-50 opacity-50'
                    : isCompleted
                      ? 'border border-green-200 bg-gradient-to-r from-green-50 to-white shadow-sm hover:shadow-md'
                      : 'border border-border bg-white shadow-sm hover:shadow-md hover:border-primary-300 active:scale-[0.99]'
                }`}
                aria-label={`${bab.name}${isLocked ? ' — Terkunci' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Number badge */}
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    isLocked
                      ? 'bg-gray-200 text-gray-400'
                      : isCompleted
                        ? 'bg-green-100 text-green-700'
                        : 'bg-primary-100 text-primary-700'
                  }`}>
                    {isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-sm font-semibold ${isLocked ? 'text-gray-400' : 'text-foreground'}`}>
                      {bab.name}
                    </h2>
                    <p className={`mt-0.5 text-xs ${isLocked ? 'text-gray-300' : 'text-muted-foreground'}`}>
                      {bab.chapterCount} chapter
                    </p>

                    {/* Progress indicators — only when not locked */}
                    {!isLocked && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          bab.preTestCompleted
                            ? 'bg-green-100 text-green-700'
                            : isInProgress || isCompleted
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-500'
                        }`}>
                          <FileQuestion className="h-3 w-3" />
                          Pre Test
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          bab.postTestCompleted
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          <ClipboardCheck className="h-3 w-3" />
                          Post Test
                        </span>
                      </div>
                    )}

                    {isLocked && (
                      <p className="mt-1.5 text-[11px] text-gray-400">
                        Selesaikan Post Test bab sebelumnya
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
