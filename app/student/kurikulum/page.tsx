'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { curriculumApi } from '@/lib/api';
import { useUIStore } from '@/stores';
import { getErrorMessage } from '@/lib/api/retry';
import type { Materi } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function KurikulumPage() {
  const selectedSemesterId = useUIStore((s) => s.selectedSemesterId);

  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSemesterId) {
      setMateriList([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchMateri() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await curriculumApi.getMateriList(selectedSemesterId!);
        if (!cancelled) {
          // Sort by orderIndex ascending for safety (API should already sort)
          const sorted = [...data].sort((a, b) => a.orderIndex - b.orderIndex);
          setMateriList(sorted);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchMateri();

    return () => {
      cancelled = true;
    };
  }, [selectedSemesterId]);

  function handleRetry() {
    if (!selectedSemesterId) return;
    setIsLoading(true);
    setError(null);

    curriculumApi
      .getMateriList(selectedSemesterId)
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.orderIndex - b.orderIndex);
        setMateriList(sorted);
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Kurikulum</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-border bg-white p-5"
            >
              <div className="mb-3 h-5 w-3/4 rounded bg-muted" />
              <div className="mb-2 h-4 w-full rounded bg-muted" />
              <div className="h-4 w-1/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Kurikulum</h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-white p-10 text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-destructive" />
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
          <Button onClick={handleRetry} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (materiList.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Kurikulum</h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-white p-10 text-center">
          <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Belum ada materi tersedia untuk semester ini
          </p>
        </div>
      </div>
    );
  }

  // Materi list
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Kurikulum</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {materiList.map((materi) => (
          <Link
            key={materi.id}
            href={`/student/kurikulum/${materi.id}`}
            className="group rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          >
            <h2 className="mb-1 text-base font-semibold text-foreground group-hover:text-primary-700">
              {materi.name}
            </h2>
            {materi.description && (
              <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                {materi.description}
              </p>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span>
                {materi.babCount} {materi.babCount === 1 ? 'Bab' : 'Bab'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
