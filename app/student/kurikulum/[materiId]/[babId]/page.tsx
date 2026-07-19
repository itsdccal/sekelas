'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Lock, CheckCircle, AlertTriangle, RefreshCw, ClipboardCheck, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { curriculumApi, posttestApi } from '@/lib/api';
import { useChapterStore } from '@/stores/chapterStore';
import type { Chapter, ChapterStatus } from '@/lib/types';

function getStatusConfig(status: ChapterStatus | undefined) {
  switch (status) {
    case 'COMPLETED':
      return { icon: <CheckCircle className="h-4 w-4 text-white" />, bg: 'bg-green-500', label: 'Selesai', ring: 'ring-green-200' };
    case 'REMEDIATION_REQUIRED':
      return { icon: <AlertTriangle className="h-4 w-4 text-white" />, bg: 'bg-red-500', label: 'Tonton ulang video', ring: 'ring-red-200' };
    case 'READY_FOR_RETAKE':
      return { icon: <RefreshCw className="h-4 w-4 text-white" />, bg: 'bg-amber-500', label: 'Siap kuis ulang', ring: 'ring-amber-200' };
    case 'UNLOCKED':
      return { icon: <Play className="h-4 w-4 text-white" />, bg: 'bg-primary-500', label: 'Mulai belajar', ring: 'ring-primary-200' };
    case 'LOCKED':
    default:
      return { icon: <Lock className="h-4 w-4 text-gray-400" />, bg: 'bg-gray-200', label: 'Terkunci', ring: 'ring-gray-100' };
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
  const [postTestStatus, setPostTestStatus] = useState<{
    available: boolean;
    completed: boolean;
    passed: boolean;
  }>({ available: false, completed: false, passed: false });

  const { progressMap, fetchProgress, isLoading: progressLoading } = useChapterStore();

  const fetchChapters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await curriculumApi.getChapterList(babId);
      const sorted = [...data].sort((a, b) => a.orderIndex - b.orderIndex);
      setChapters(sorted);
      await fetchProgress(babId);

      try {
        const ptStatus = await posttestApi.getPostTestStatus(babId);
        setPostTestStatus(ptStatus);
      } catch { /* default */ }
    } catch {
      setError('Gagal memuat daftar chapter. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [babId, fetchProgress]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const allChaptersCompleted = useMemo(() => {
    if (chapters.length === 0) return false;
    return chapters.every((ch) => progressMap[ch.id]?.status === 'COMPLETED');
  }, [chapters, progressMap]);

  const completedCount = useMemo(() => {
    return chapters.filter((ch) => progressMap[ch.id]?.status === 'COMPLETED').length;
  }, [chapters, progressMap]);

  const loading = isLoading || progressLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-pulse rounded bg-muted" />
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/student/kurikulum/${materiId}`)}>
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
          <Button onClick={fetchChapters} size="sm">Coba Lagi</Button>
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
          onClick={() => router.push(`/student/kurikulum/${materiId}`)}
          aria-label="Kembali ke daftar bab"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Daftar Chapter</h1>
      </div>

      {/* Progress bar */}
      {chapters.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progres</span>
            <span className="font-medium">{completedCount}/{chapters.length}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${chapters.length > 0 ? (completedCount / chapters.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {chapters.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">Belum ada chapter tersedia</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chapters.map((chapter, index) => {
            const progress = progressMap[chapter.id];
            const status = progress?.status;

            let effectiveStatus = status;
            if (index > 0 && !status) {
              const prevChapter = chapters[index - 1];
              const prevStatus = progressMap[prevChapter.id]?.status;
              if (prevStatus !== 'COMPLETED') {
                effectiveStatus = 'LOCKED';
              }
            }
            if (index === 0 && !status) {
              effectiveStatus = 'UNLOCKED';
            }

            const isLocked = effectiveStatus === 'LOCKED';
            const config = getStatusConfig(effectiveStatus);

            return (
              <button
                key={chapter.id}
                disabled={isLocked}
                onClick={() => {
                  if (isLocked) return;
                  if (effectiveStatus === 'READY_FOR_RETAKE') {
                    router.push(`/student/chapter/${chapter.id}/quiz`);
                  } else {
                    router.push(`/student/chapter/${chapter.id}/video`);
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-xl p-3 sm:p-4 text-left transition-all ${
                  isLocked
                    ? 'cursor-not-allowed opacity-40'
                    : 'hover:bg-accent/50 active:scale-[0.99]'
                }`}
              >
                {/* Status circle */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-2 ${config.bg} ${config.ring}`}>
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isLocked ? 'text-gray-400' : 'text-foreground'}`}>
                    {chapter.name}
                  </p>
                  <p className={`text-xs ${isLocked ? 'text-gray-300' : 'text-muted-foreground'}`}>
                    {config.label}
                  </p>
                </div>

                {/* Chapter number */}
                <span className={`text-xs font-medium shrink-0 ${isLocked ? 'text-gray-300' : 'text-muted-foreground'}`}>
                  {index + 1}
                </span>
              </button>
            );
          })}

          {/* Post Test section */}
          <div className="mt-4 pt-4 border-t border-border">
            {postTestStatus.passed ? (
              <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 ring-2 ring-green-200">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">Post Test Selesai</p>
                  <p className="text-xs text-green-600">Bab ini telah diselesaikan</p>
                </div>
              </div>
            ) : allChaptersCompleted ? (
              <Button
                onClick={() => router.push(`/student/bab/${babId}/posttest`)}
                className="w-full h-12 gap-2 rounded-xl text-sm font-semibold"
              >
                <ClipboardCheck className="h-5 w-5" />
                Kerjakan Post Test
              </Button>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-gray-50 p-4 opacity-60">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 ring-2 ring-gray-100">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Post Test</p>
                  <p className="text-xs text-gray-400">Selesaikan semua chapter terlebih dahulu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
