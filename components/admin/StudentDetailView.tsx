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
import type {
  StudentProgress,
  MateriProgress,
  BabProgress,
  ChapterProgress,
  ChapterStatus,
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

// ─── Chapter row (displays status icon, label, last score, remediation attempts) ───

function ChapterRow({ chapter }: { chapter: ChapterProgress }) {
  const remediationAttempts = chapter.videoWatchAttempts > 0
    ? chapter.videoWatchAttempts - 1
    : 0;

  return (
    <div className="flex items-center gap-3 rounded px-2 py-2 text-sm hover:bg-accent/20">
      <StatusIcon status={chapter.status} />
      <span className="min-w-[120px] font-medium text-foreground">
        {statusLabel(chapter.status)}
      </span>
      <span className="text-xs text-muted-foreground">
        {chapter.lastScore !== null
          ? `Skor: ${chapter.lastScore}%`
          : 'Belum kuis'}
      </span>
      <span className="ml-auto text-xs text-muted-foreground">
        {remediationAttempts > 0
          ? `${remediationAttempts} remediasi`
          : ''}
      </span>
    </div>
  );
}

// ─── Bab detail (expandable) ───

function BabDetail({ bab }: { bab: BabProgress }) {
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
            <ChapterRow key={chapter.chapterId} chapter={chapter} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Materi accordion item ───

function MateriItem({ materi }: { materi: MateriProgress }) {
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
          {materi.babs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada Bab.</p>
          ) : (
            materi.babs.map((bab) => <BabDetail key={bab.babId} bab={bab} />)
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
            <MateriItem key={materi.materiId} materi={materi} />
          ))}
        </div>
      )}
    </div>
  );
}
