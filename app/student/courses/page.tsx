'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { coursesApi } from '@/lib/api';
import { useUIStore } from '@/stores';
import { getErrorMessage } from '@/lib/api/retry';
import type { Subject } from '@/lib/types';
import { Button } from '@/components/ui/button';

/** Accent colors for materi cards */
const CARD_ACCENTS = [
  'border-l-primary-500',
  'border-l-blue-500',
  'border-l-amber-500',
  'border-l-purple-500',
  'border-l-rose-500',
  'border-l-teal-500',
];

export default function CoursesPage() {
  const selectedSemesterId = useUIStore((s) => s.selectedSemesterId);

  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSemesterId) {
      setSubjectList([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchMateri() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await coursesApi.getSubjectList(selectedSemesterId!);
        if (!cancelled) {
          const sorted = [...data].sort((a, b) => a.orderIndex - b.orderIndex);
          setSubjectList(sorted);
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
    return () => { cancelled = true; };
  }, [selectedSemesterId]);

  function handleRetry() {
    if (!selectedSemesterId) return;
    setIsLoading(true);
    setError(null);

    coursesApi
      .getSubjectList(selectedSemesterId)
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.orderIndex - b.orderIndex);
        setSubjectList(sorted);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Materi Pembelajaran</h1>
        <p className="text-sm text-muted-foreground">Pilih materi untuk mulai belajar</p>
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
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Materi Pembelajaran</h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-white p-8 text-center">
          <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
          <Button onClick={handleRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (subjectList.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Materi Pembelajaran</h1>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary-200 bg-primary-50/50 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
            <BookOpen className="h-7 w-7 text-primary-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">Belum ada Subject</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Materi untuk semester ini belum tersedia. Hubungi pengajar untuk informasi lebih lanjut.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Materi Pembelajaran</h1>
        <p className="text-sm text-muted-foreground">Pilih materi untuk mulai belajar</p>
      </div>

      <div className="space-y-3">
        {subjectList.map((Subject, index) => (
          <Link
            key={Subject.id}
            href={`/student/courses/${Subject.id}`}
            className={`block rounded-lg border border-l-4 ${CARD_ACCENTS[index % CARD_ACCENTS.length]} border-border bg-white p-4 transition-all hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-foreground">
                  {Subject.name}
                </h2>
                {Subject.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                    {Subject.description}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {Subject.sectionCount} Section
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
