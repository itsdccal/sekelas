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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useUIStore } from '@/stores/uiStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { curriculumApi } from '@/lib/api';
import { formatXP } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';
import type {
  StudentProgress,
  MateriProgress,
  BabProgress,
  ChapterProgress,
  ChapterStatus,
} from '@/lib/types';

// ─── Status icon component ───

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
      return 'Remediasi';
    case 'READY_FOR_RETAKE':
      return 'Kuis Ulang';
    default:
      return '';
  }
}

// ─── Skeleton ───

function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Memuat raport">
      <div className="grid gap-3 grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-52 animate-pulse rounded-lg bg-muted" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}

// ─── Pre/Post Test Chart ───

function PrePostTestChart({ babs }: { babs: BabProgress[] }) {
  const chartData = babs
    .filter((bab) => bab.preTestScore !== null)
    .map((bab) => ({
      name: bab.babName.length > 12 ? bab.babName.substring(0, 12) + '…' : bab.babName,
      fullName: bab.babName,
      'Pre Test': bab.preTestScore ?? 0,
      'Post Test': bab.postTestScore ?? 0,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground">Belum ada data Pre/Post Test</p>
      </div>
    );
  }

  return (
    <div className="h-52 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            interval={0}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            width={35}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => [`${value}`, name]}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload;
              return item?.fullName ?? '';
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
          <Bar dataKey="Pre Test" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Post Test" fill="#16a34a" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Chapter Log — card-based for mobile ───

function ChapterLogCard({ chapter }: { chapter: ChapterProgress }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border/50 bg-gray-50 px-3 py-2.5">
      <ChapterStatusIcon status={chapter.status} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{chapter.chapterId}</p>
        <p className="text-xs text-muted-foreground">{statusLabel(chapter.status)}</p>
      </div>
      <div className="flex items-center gap-3 text-xs shrink-0">
        <div className="text-center">
          <p className={`font-semibold ${chapter.quizAttempts > 1 ? 'text-amber-600' : 'text-foreground'}`}>
            {chapter.quizAttempts}×
          </p>
          <p className="text-muted-foreground">Kuis</p>
        </div>
        <div className="text-center">
          <p className={`font-semibold ${chapter.videoWatchAttempts > 1 ? 'text-amber-600' : 'text-foreground'}`}>
            {chapter.videoWatchAttempts}×
          </p>
          <p className="text-muted-foreground">Video</p>
        </div>
        <div className="text-center w-8">
          {chapter.lastScore !== null ? (
            <p className={`font-bold ${chapter.lastScore >= 70 ? 'text-green-600' : 'text-red-500'}`}>
              {chapter.lastScore}
            </p>
          ) : (
            <p className="text-muted-foreground">—</p>
          )}
          <p className="text-muted-foreground">Skor</p>
        </div>
      </div>
    </div>
  );
}

// ─── Bab Accordion ───

function BabSection({ bab }: { bab: BabProgress }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center gap-2 p-3 sm:p-4 text-left hover:bg-accent/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={`bab-log-${bab.babId}`}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{bab.babName}</p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            {bab.preTestScore !== null && (
              <span>Pre: <strong className="text-amber-600">{bab.preTestScore}</strong></span>
            )}
            {bab.postTestScore !== null && (
              <span>Post: <strong className="text-green-600">{bab.postTestScore}</strong></span>
            )}
          </div>
        </div>
        <span className="text-xs font-medium text-muted-foreground shrink-0">
          {bab.chapters.filter((c) => c.status === 'COMPLETED').length}/{bab.chapters.length}
        </span>
      </button>

      {expanded && (
        <div id={`bab-log-${bab.babId}`} className="border-t border-border px-3 py-2.5 sm:px-4 sm:py-3 space-y-2">
          {bab.chapters.map((ch) => (
            <ChapterLogCard key={ch.chapterId} chapter={ch} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Materi Section ───

function MateriSection({ materi }: { materi: MateriProgress }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="flex w-full items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">{materi.materiName}</h3>
        <span className="ml-auto shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
          {materi.completionPercentage}%
        </span>
      </button>

      {expanded && (
        <div className="space-y-2">
          {materi.babs.map((bab) => (
            <BabSection key={bab.babId} bab={bab} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───

export default function RaportPage() {
  const selectedSemesterId = useUIStore((state) => state.selectedSemesterId);
  const { totalXP, badges, fetchGamificationData } = useGamificationStore();

  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRaportData = useCallback(async () => {
    if (!selectedSemesterId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await curriculumApi.getStudentProgress(selectedSemesterId);
      setProgress(data);
    } catch {
      setError('Gagal memuat data raport. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSemesterId]);

  useEffect(() => {
    fetchRaportData();
    fetchGamificationData();
  }, [fetchRaportData, fetchGamificationData]);

  // Derived data
  const earnedMilestones = badges
    .filter((b) => b.isEarned)
    .map((b) => ({ id: b.id, name: b.name }));

  const allBabs: BabProgress[] = progress
    ? progress.materiProgress.flatMap((m) => m.babs)
    : [];

  // ─── Error state ───
  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Raport</h1>
        <div className="rounded-lg border border-border bg-white p-5" role="alert" aria-live="polite">
          <p className="mb-3 text-sm text-destructive">{error}</p>
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
      <div className="space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Raport</h1>
        <PageSkeleton />
      </div>
    );
  }

  // ─── Empty state ───
  if (!progress || progress.materiProgress.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Raport</h1>
        <div className="rounded-lg border border-border bg-white p-10 text-center">
          <Star className="mx-auto h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">
            Belum ada aktivitas belajar yang tercatat
          </p>
        </div>
      </div>
    );
  }

  // ─── Content ───
  return (
    <div className="space-y-5">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground">Raport</h1>

      {/* Summary cards — always 3 columns, compact on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-lg border border-border bg-white p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Total XP</p>
          <p className="mt-0.5 text-lg sm:text-2xl font-bold text-primary-700">{formatXP(totalXP)}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Chapter</p>
          <p className="mt-0.5 text-lg sm:text-2xl font-bold text-foreground">
            {progress.completedChapters}
            <span className="text-sm sm:text-base font-normal text-muted-foreground">
              /{progress.totalChapters}
            </span>
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Milestone</p>
          <p className="mt-0.5 text-lg sm:text-2xl font-bold text-amber-600">{earnedMilestones.length}</p>
        </div>
      </div>

      {/* Pre Test vs Post Test Chart */}
      <div className="rounded-lg border border-border bg-white p-3 sm:p-5">
        <h2 className="mb-3 text-sm sm:text-base font-semibold text-foreground">
          Pre Test vs Post Test
        </h2>
        <PrePostTestChart babs={allBabs} />
      </div>

      {/* Milestones */}
      {earnedMilestones.length > 0 && (
        <div className="rounded-lg border border-border bg-white p-3 sm:p-5">
          <h2 className="mb-2 text-sm sm:text-base font-semibold text-foreground">Milestone Tercapai</h2>
          <ul className="space-y-1.5">
            {earnedMilestones.map((m) => (
              <li key={m.id} className="flex items-center gap-2 text-sm text-foreground">
                <Trophy className="h-4 w-4 text-yellow-500 shrink-0" aria-hidden="true" />
                {m.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Log per Chapter */}
      <div className="space-y-4">
        <h2 className="text-sm sm:text-lg font-semibold text-foreground">Log Aktivitas per Chapter</h2>
        {progress.materiProgress.map((materi) => (
          <MateriSection key={materi.materiId} materi={materi} />
        ))}
      </div>
    </div>
  );
}
