'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Lock,
  AlertTriangle,
  RefreshCw,
  Circle,
  Trophy,
  Star,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { curriculumApi } from '@/lib/api';
import { formatCompletionPercentage, formatXP } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';
import type { StudentProgress, MateriProgress, BabProgress, ChapterProgress, ChapterStatus } from '@/lib/types';

// ─── Status icon component (same mapping as ChapterCard) ───

function ChapterStatusIcon({ status }: { status: ChapterStatus }) {
  switch (status) {
    case 'LOCKED':
      return <Lock className="h-4 w-4 text-gray-400" aria-label="Terkunci" />;
    case 'UNLOCKED':
      return <Circle className="h-4 w-4 text-blue-500" aria-label="Terbuka" />;
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4 text-green-600" aria-label="Selesai" />;
    case 'REMEDIATION_REQUIRED':
      return <AlertTriangle className="h-4 w-4 text-red-500" aria-label="Perlu remediasi" />;
    case 'READY_FOR_RETAKE':
      return <RefreshCw className="h-4 w-4 text-yellow-600" aria-label="Siap kuis ulang" />;
    default:
      return null;
  }
}

function statusLabel(status: ChapterStatus): string {
  switch (status) {
    case 'LOCKED':
      return 'Terkunci';
    case 'UNLOCKED':
      return 'Terbuka';
    case 'COMPLETED':
      return 'Selesai';
    case 'REMEDIATION_REQUIRED':
      return 'Perlu Remediasi';
    case 'READY_FOR_RETAKE':
      return 'Siap Kuis Ulang';
    default:
      return '';
  }
}

// ─── Skeleton components ───

function XPSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-white p-6" aria-busy="true" aria-label="Memuat XP">
      <div className="mb-3 h-5 w-24 animate-pulse rounded bg-muted" />
      <div className="h-8 w-36 animate-pulse rounded bg-muted" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function MateriListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Memuat raport">
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
        aria-controls={`bab-${bab.babId}-chapters`}
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
        <div id={`bab-${bab.babId}-chapters`} className="mt-1 space-y-1 pb-2">
          {bab.chapters.map((chapter) => (
            <ChapterRow key={chapter.chapterId} chapter={chapter} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChapterRow({ chapter }: { chapter: ChapterProgress }) {
  return (
    <div className="flex items-center gap-3 rounded px-2 py-1.5 text-sm">
      <ChapterStatusIcon status={chapter.status} />
      <span className="flex-1 text-foreground">{statusLabel(chapter.status)}</span>
      <span className="text-xs text-muted-foreground">
        {chapter.quizAttempts > 0
          ? `${chapter.quizAttempts} percobaan kuis`
          : 'Belum kuis'}
      </span>
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
        aria-controls={`materi-${materi.materiId}-content`}
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
        <div id={`materi-${materi.materiId}-content`} className="border-t border-border px-4 py-3 space-y-2">
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

// ─── Milestone list ───

function MilestoneList({ milestones }: { milestones: { id: string; name: string }[] }) {
  if (milestones.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="mb-2 text-sm font-semibold text-foreground">Milestone Tercapai</h3>
      <ul className="space-y-1">
        {milestones.map((m) => (
          <li key={m.id} className="flex items-center gap-2 text-sm text-foreground">
            <Trophy className="h-4 w-4 text-yellow-500" aria-hidden="true" />
            {m.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main page ───

export default function RaportPage() {
  const selectedSemesterId = useUIStore((state) => state.selectedSemesterId);
  const { totalXP, badges } = useGamificationStore();

  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRaportData = useCallback(async () => {
    if (!selectedSemesterId) return;

    setIsLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setError('Waktu permintaan habis. Silakan coba lagi.');
    }, 10000);

    try {
      const data = await curriculumApi.getStudentProgress(selectedSemesterId);
      clearTimeout(timeoutId);
      setProgress(data);
    } catch {
      clearTimeout(timeoutId);
      setError('Gagal memuat data raport. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSemesterId]);

  useEffect(() => {
    fetchRaportData();
  }, [fetchRaportData]);

  // Derive milestones from earned badges (badges with isEarned=true represent achieved milestones)
  const earnedMilestones = badges
    .filter((b) => b.isEarned)
    .map((b) => ({ id: b.id, name: b.name }));

  // ─── Error state ───
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Raport</h1>
        <div className="rounded-lg border border-border bg-white p-6" role="alert" aria-live="polite">
          <p className="mb-4 text-sm text-destructive">{error}</p>
          <Button onClick={fetchRaportData} variant="default" size="sm">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  // ─── Loading state ───
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Raport</h1>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <MateriListSkeleton />
          </div>
          <div>
            <XPSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // ─── Empty state ───
  if (!progress || progress.materiProgress.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Raport</h1>
        <div className="rounded-lg border border-border bg-white p-12 text-center">
          <Star className="mx-auto h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
          <p className="mt-4 text-sm text-muted-foreground">
            Belum ada aktivitas belajar yang tercatat
          </p>
        </div>
      </div>
    );
  }

  // ─── Content state ───
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Raport</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Materi list with completion % */}
        <div className="md:col-span-2 space-y-4">
          {progress.materiProgress.map((materi) => (
            <MateriItem key={materi.materiId} materi={materi} />
          ))}
        </div>

        {/* XP + Milestones sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-white p-6">
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Total XP</h2>
            <p className="text-2xl font-bold text-primary-700">
              {formatXP(progress.totalXP)}
            </p>
            <MilestoneList milestones={earnedMilestones} />
          </div>
        </div>
      </div>
    </div>
  );
}
