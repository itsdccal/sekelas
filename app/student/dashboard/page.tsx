'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Play, Trophy, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { coursesApi } from '@/lib/api';
import { formatProgressSummary, formatXP } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';
import type { StudentProgress } from '@/lib/types';

function ProfileSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-white p-6" aria-busy="true" aria-label="Memuat profil">
      <div className="mb-4 h-5 w-32 animate-pulse rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function ProgressSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-white p-6" aria-busy="true" aria-label="Memuat progres">
      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function NextMilestoneCard() {
  const { totalXP, nextMilestone, fetchGamificationData } = useGamificationStore();

  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  if (!nextMilestone) return null;

  const progressPct = Math.min(
    Math.round((totalXP / nextMilestone.xpThreshold) * 100),
    100
  );
  const remaining = Math.max(nextMilestone.xpThreshold - totalXP, 0);

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex items-center gap-3">
        <Trophy className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">
            Milestone berikutnya: <span className="font-medium text-foreground">{nextMilestone.name}</span>
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-primary-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatXP(totalXP)} / {formatXP(nextMilestone.xpThreshold)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const selectedSemesterId = useUIStore((state) => state.selectedSemesterId);

  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!selectedSemesterId) {
      // Keep showing skeleton until semester is available
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await coursesApi.getStudentProgress(selectedSemesterId);
      setProgress(data);
    } catch {
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSemesterId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Find the selected semester name from available semesters
  const availableSemesters = useUIStore((state) => state.availableSemesters);
  const semesterName =
    availableSemesters.find((s) => s.id === selectedSemesterId)?.name ??
    'Semester aktif';

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Beranda</h1>
        <div className="rounded-lg border border-border bg-white p-6" role="alert" aria-live="polite">
          <p className="mb-4 text-sm text-destructive">{error}</p>
          <Button onClick={fetchDashboardData} variant="default" size="sm">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Beranda</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <ProfileSkeleton />
          <ProgressSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Beranda</h1>

      {/* Lanjutkan Belajar Card */}
      {progress && progress.completedChapters < progress.totalChapters && (
        <Link
          href="/student/courses"
          className="block rounded-lg border border-border bg-white p-4 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
              <Play className="h-4 w-4 ml-0.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Lanjutkan Belajar</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {progress.completedChapters} dari {progress.totalChapters} chapter selesai
              </p>
            </div>
          </div>
        </Link>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <div className="rounded-lg border border-border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Profil Siswa</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Nama Lengkap</dt>
              <dd className="font-medium text-foreground">{user?.name ?? '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Kelas</dt>
              <dd className="font-medium text-foreground">{user?.kelas ?? '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Semester Aktif</dt>
              <dd className="font-medium text-foreground">{semesterName}</dd>
            </div>
          </dl>
        </div>

        {/* Progress Summary Card */}
        <div className="rounded-lg border border-border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Ringkasan Progres</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Progres Chapter</dt>
              <dd className="font-medium text-foreground">
                {progress
                  ? formatProgressSummary(progress.completedChapters, progress.totalChapters)
                  : '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total XP</dt>
              <dd className="font-medium text-amber-600">
                {progress ? formatXP(progress.totalXP) : '-'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Next Milestone Card */}
      <NextMilestoneCard />

      {/* Materi yang Diikuti */}
      {progress && Array.isArray(progress.subjectProgress) && progress.subjectProgress.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Materi yang Diikuti</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {progress.subjectProgress.map((materi) => (
              <Link
                key={materi.subjectId}
                href={`/student/courses/${materi.subjectId}`}
                className="block rounded-lg border border-border bg-white p-5 hover:bg-muted/30"
              >
                <h3 className="mb-3 text-sm font-medium text-foreground">
                  {materi.subjectName}
                </h3>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progres</span>
                  <span className="font-medium text-foreground">
                    {materi.completionPercentage}%
                  </span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
                  role="progressbar"
                  aria-valuenow={materi.completionPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progres ${materi.subjectName}`}
                >
                  <div
                    className="h-full rounded-full bg-primary-500"
                    style={{ width: `${materi.completionPercentage}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
