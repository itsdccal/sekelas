'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  Lock,
  Circle,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { OverrideForm } from '@/components/admin/OverrideForm';
import type {
  StudentProgress,
  MateriProgress,
  BabProgress,
  ChapterProgress,
  ChapterStatus,
  OverrideAction,
} from '@/lib/types';

// ─── Props ───

export interface StudentDetailViewProps {
  userId: string;
  onBack: () => void;
}

// ─── Status icon component per Req 14.3 ───

function StatusIcon({ status }: { status: ChapterStatus }) {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4 text-green-600" aria-label="Selesai" />;
    case 'REMEDIATION_REQUIRED':
      return <AlertTriangle className="h-4 w-4 text-red-500" aria-label="Perlu remediasi" />;
    case 'READY_FOR_RETAKE':
      return <Clock className="h-4 w-4 text-yellow-600" aria-label="Siap kuis ulang" />;
    case 'LOCKED':
      return <Lock className="h-4 w-4 text-gray-400" aria-label="Terkunci" />;
    case 'UNLOCKED':
      return <Circle className="h-4 w-4 text-gray-500" aria-label="Terbuka" />;
    default:
      return null;
  }
}

function statusLabel(status: ChapterStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'Selesai';
    case 'REMEDIATION_REQUIRED':
      return 'Perlu Remediasi';
    case 'READY_FOR_RETAKE':
      return 'Siap Kuis Ulang';
    case 'LOCKED':
      return 'Terkunci';
    case 'UNLOCKED':
      return 'Terbuka';
    default:
      return '';
  }
}

// ─── Skeleton components ───

function DetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Memuat detail siswa">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Chapter row with Override button (Req 13.1) ───

interface ChapterRowProps {
  chapter: ChapterProgress;
  onOverrideClick: (chapter: ChapterProgress) => void;
}

function ChapterRow({ chapter, onOverrideClick }: ChapterRowProps) {
  const remediationAttempts = chapter.videoWatchAttempts > 0
    ? chapter.videoWatchAttempts - 1
    : 0;

  const canOverride = chapter.status !== 'COMPLETED';

  return (
    <div className="flex flex-col gap-1.5 rounded px-2 py-2 text-sm hover:bg-accent/20 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <StatusIcon status={chapter.status} />
        <span className="font-medium text-foreground truncate">
          {statusLabel(chapter.status)}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {chapter.lastScore !== null
            ? `Skor: ${chapter.lastScore}%`
            : 'Belum kuis'}
        </span>
        {remediationAttempts > 0 && (
          <span className="text-xs text-muted-foreground shrink-0">
            {remediationAttempts} remediasi
          </span>
        )}
      </div>
      <div className="ml-6 sm:ml-auto">
        {canOverride ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onOverrideClick(chapter)}
            aria-label={`Penyesuaian chapter ${chapter.chapterId}`}
          >
            Penyesuaian
          </Button>
        ) : (
          <span className="text-xs text-green-600 font-medium">✓ Selesai</span>
        )}
      </div>
    </div>
  );
}

// ─── Bab detail (expandable) ───

interface BabDetailProps {
  bab: BabProgress;
  onOverrideClick: (chapter: ChapterProgress) => void;
}

function BabDetail({ bab, onOverrideClick }: BabDetailProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-l-2 border-muted pl-4">
      <button
        type="button"
        className="flex w-full items-center gap-2 py-2 text-left text-sm font-medium text-foreground hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={`detail-bab-${bab.babId}-chapters`}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
        )}
        <span>{bab.babName}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {bab.chapters.filter((c) => c.status === 'COMPLETED').length}/{bab.chapters.length} chapter
        </span>
      </button>

      {expanded && (
        <div id={`detail-bab-${bab.babId}-chapters`} className="mt-1 space-y-1 pb-2">
          {bab.chapters.map((chapter) => (
            <ChapterRow
              key={chapter.chapterId}
              chapter={chapter}
              onOverrideClick={onOverrideClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Materi accordion item ───

interface MateriItemProps {
  materi: MateriProgress;
  onOverrideClick: (chapter: ChapterProgress) => void;
}

function MateriItem({ materi, onOverrideClick }: MateriItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-t-lg"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={`detail-materi-${materi.materiId}-content`}
      >
        {expanded ? (
          <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        )}
        <span className="flex-1 font-medium text-foreground">{materi.materiName}</span>
        <span className="text-sm font-semibold text-primary-700">
          {materi.completionPercentage}%
        </span>
      </button>

      {expanded && (
        <div id={`detail-materi-${materi.materiId}-content`} className="border-t border-border px-4 py-3 space-y-2">
          {!materi.babs || materi.babs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada Bab.</p>
          ) : (
            materi.babs.map((bab) => (
              <BabDetail key={bab.babId} bab={bab} onOverrideClick={onOverrideClick} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───

export default function StudentDetailView({ userId, onBack }: StudentDetailViewProps) {
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Override dialog state
  const [overrideTarget, setOverrideTarget] = useState<ChapterProgress | null>(null);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminApi.getStudentDetail(userId);
      setProgress(data);
    } catch {
      setError('Gagal memuat detail progres siswa. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Handle override confirm
  const handleOverrideConfirm = useCallback(async (data: { action: OverrideAction; reason: string; score?: number }) => {
    if (!overrideTarget) return;

    await adminApi.overrideChapter({
      userId,
      chapterId: overrideTarget.chapterId,
      action: data.action,
      reason: data.reason,
      score: data.score,
    });

    // Update local state: set chapter status to COMPLETED with score
    setProgress((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        completedChapters: prev.completedChapters + 1,
        materiProgress: prev.materiProgress.map((materi) => ({
          ...materi,
          babs: materi.babs.map((bab) => ({
            ...bab,
            chapters: bab.chapters.map((ch) =>
              ch.chapterId === overrideTarget.chapterId
                ? { ...ch, status: 'COMPLETED' as ChapterStatus, lastScore: data.score ?? ch.lastScore }
                : ch
            ),
          })),
        })),
      };
    });

    setOverrideTarget(null);
  }, [overrideTarget, userId]);

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar
      </Button>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-border bg-white p-6" role="alert" aria-live="polite">
          <p className="mb-4 text-sm text-destructive">{error}</p>
          <Button onClick={fetchDetail} variant="default" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && <DetailSkeleton />}

      {/* Empty state */}
      {!isLoading && !error && progress && progress.materiProgress.length === 0 && (
        <div className="rounded-lg border border-border bg-white p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Belum ada data progres untuk siswa ini.
          </p>
        </div>
      )}

      {/* Content state */}
      {!isLoading && !error && progress && progress.materiProgress.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {progress.completedChapters}/{progress.totalChapters} Chapter selesai
            </span>
            <span>•</span>
            <span>{progress.totalXP} XP</span>
          </div>
          {progress.materiProgress.map((materi) => (
            <MateriItem
              key={materi.materiId}
              materi={materi}
              onOverrideClick={(chapter) => setOverrideTarget(chapter)}
            />
          ))}
        </div>
      )}

      {/* Override Dialog */}
      {overrideTarget && (
        <OverrideForm
          student={{ id: userId, name: userId }}
          chapter={{ id: overrideTarget.chapterId, name: overrideTarget.chapterId }}
          currentStatus={overrideTarget.status}
          onConfirm={handleOverrideConfirm}
          onCancel={() => setOverrideTarget(null)}
        />
      )}
    </div>
  );
}
