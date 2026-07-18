'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Loader2, AlertCircle, Lock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { curriculumApi } from '@/lib/api';
import { useChapterStore } from '@/stores/chapterStore';
import type { Chapter } from '@/lib/types';
import type { ChapterStatus } from '@/lib/types';

function getStatusIcon(status: ChapterStatus | undefined) {
  switch (status) {
    case 'LOCKED':
      return <Lock className="h-4 w-4 text-gray-400" />;
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'REMEDIATION_REQUIRED':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'READY_FOR_RETAKE':
      return <RefreshCw className="h-4 w-4 text-yellow-500" />;
    case 'UNLOCKED':
    default:
      return null;
  }
}

function getStatusLabel(status: ChapterStatus | undefined): string | null {
  switch (status) {
    case 'LOCKED':
      return 'Terkunci';
    case 'COMPLETED':
      return 'Selesai';
    case 'REMEDIATION_REQUIRED':
      return 'Perlu tonton ulang';
    case 'READY_FOR_RETAKE':
      return 'Siap kuis ulang';
    case 'UNLOCKED':
      return 'Tersedia';
    default:
      return null;
  }
}

export default function ChapterListPage() {
  const params = useParams();
  const router = useRouter();
  const materiId = params.materiId as string;
  const babId = params.babId as string;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { progressMap, fetchProgress, isLoading: progressLoading } = useChapterStore();

  const fetchChapters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await curriculumApi.getChapterList(babId);
      // Sort by orderIndex ascending
      const sorted = [...data].sort((a, b) => a.orderIndex - b.orderIndex);
      setChapters(sorted);
      // Fetch progress for this bab
      await fetchProgress(babId);
    } catch {
      setError('Gagal memuat daftar chapter. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [babId, fetchProgress]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const loading = isLoading || progressLoading;

  // Skeleton loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 animate-pulse rounded-md bg-gray-200" />
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg border border-border bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/student/kurikulum/${materiId}`)}
          aria-label="Kembali ke daftar bab"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
          <Button onClick={fetchChapters} size="sm">
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
          onClick={() => router.push(`/student/kurikulum/${materiId}`)}
          aria-label="Kembali ke daftar bab"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Daftar Chapter</h1>
      </div>

      {/* Empty state */}
      {chapters.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-12">
          <FileText className="h-10 w-10 text-gray-400" />
          <p className="text-sm text-gray-500">
            Belum ada chapter tersedia pada bab ini.
          </p>
        </div>
      ) : (
        /* Chapter list - basic cards (ChapterCard component comes in task 7.3) */
        <div className="space-y-3">
          {chapters.map((chapter) => {
            const progress = progressMap[chapter.id];
            const status = progress?.status;
            const isLocked = status === 'LOCKED';
            const icon = getStatusIcon(status);
            const label = getStatusLabel(status);

            return (
              <div
                key={chapter.id}
                className={`rounded-lg border border-border bg-white p-4 transition-colors ${
                  isLocked
                    ? 'pointer-events-none opacity-50 grayscale'
                    : status === 'REMEDIATION_REQUIRED'
                      ? 'cursor-pointer hover:border-red-300 hover:bg-red-50'
                      : 'cursor-pointer hover:border-primary-300 hover:bg-primary-50'
                }`}
                role="listitem"
                onClick={() => {
                  if (!isLocked) {
                    router.push(`/student/chapter/${chapter.id}/video`);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {icon}
                    <div>
                      <h2 className="font-medium text-gray-900">
                        {chapter.name}
                      </h2>
                      {label && (
                        <p className="mt-0.5 text-xs text-gray-500">{label}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
