'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { curriculumApi } from '@/lib/api';
import type { Bab } from '@/lib/types';

export default function BabListPage() {
  const params = useParams();
  const router = useRouter();
  const materiId = params.materiId as string;

  const [babs, setBabs] = useState<Bab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBabs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await curriculumApi.getBabList(materiId);
      // Sort by orderIndex ascending
      const sorted = [...data].sort((a, b) => a.orderIndex - b.orderIndex);
      setBabs(sorted);
    } catch {
      setError('Gagal memuat daftar bab. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [materiId]);

  useEffect(() => {
    fetchBabs();
  }, [fetchBabs]);

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 animate-pulse rounded-md bg-gray-200" />
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border border-border bg-gray-100"
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
          onClick={() => router.push('/student/kurikulum')}
          aria-label="Kembali ke daftar materi"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
          <Button onClick={fetchBabs} size="sm">
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
          onClick={() => router.push('/student/kurikulum')}
          aria-label="Kembali ke daftar materi"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Daftar Bab</h1>
      </div>

      {/* Empty state */}
      {babs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-12">
          <BookOpen className="h-10 w-10 text-gray-400" />
          <p className="text-sm text-gray-500">
            Belum ada bab tersedia pada materi ini.
          </p>
        </div>
      ) : (
        /* Bab list */
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {babs.map((bab) => (
            <Link
              key={bab.id}
              href={`/student/kurikulum/${materiId}/${bab.id}`}
              className="group rounded-lg border border-border bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <h2 className="font-medium text-gray-900 group-hover:text-primary-700">
                {bab.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {bab.chapterCount} chapter
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
