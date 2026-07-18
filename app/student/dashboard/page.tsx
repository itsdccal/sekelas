'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { curriculumApi } from '@/lib/api';
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
      const data = await curriculumApi.getStudentProgress(selectedSemesterId);
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
    </div>
  );
}
