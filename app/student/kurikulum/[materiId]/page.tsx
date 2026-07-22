'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2, AlertCircle, Lock, CheckCircle, ClipboardCheck, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { curriculumApi, pretestApi, posttestApi } from '@/lib/api';
import type { Bab, BabStatus } from '@/lib/types';

interface BabWithStatus extends Bab {
  babStatus: BabStatus;
}

/**
 * Bab list page with progressive flow.
 * Pre Test gate at materi level (before seeing babs).
 * Bab 1 unlocked after Pre Test, rest locked until all chapters of previous bab completed.
 * Post Test available when all babs completed.
 */
export default function BabListPage() {
  const params = useParams();
  const router = useRouter();
  const materiId = params.materiId as string;

  const [babs, setBabs] = useState<BabWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preTestCompleted, setPreTestCompleted] = useState(false);
  const [postTestStatus, setPostTestStatus] = useState<{ available: boolean; passed: boolean }>({ available: false, passed: false });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Check pre test status
      const preStatus = await pretestApi.getPreTestStatus(materiId);
      setPreTestCompleted(preStatus.completed);

      if (!preStatus.completed) {
        // Pre test not done — redirect to pre test
        setIsLoading(false);
        return;
      }

      // Fetch babs
      const data = await curriculumApi.getBabList(materiId);
      const sorted = [...data].sort((a, b) => a.orderIndex - b.orderIndex);

      // For now, simple sequential: bab 1 unlocked, rest locked
      // In production, backend returns bab status based on chapter completion
      const babsWithStatus: BabWithStatus[] = sorted.map((bab, index) => ({
        ...bab,
        babStatus: index === 0 ? 'IN_PROGRESS' : 'LOCKED' as BabStatus,
      }));

      setBabs(babsWithStatus);

      // Check post test
      try {
        const ptStatus = await posttestApi.getPostTestStatus(materiId);
        setPostTestStatus(ptStatus);
      } catch { /* default */ }
    } catch {
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [materiId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Loading
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />)}
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/student/kurikulum')}>
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>
        <div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
          <Button onClick={fetchData} size="sm"><Loader2 className="h-4 w-4" /> Coba Lagi</Button>
        </div>
      </div>
    );
  }

  // Pre Test gate — redirect to pre test page
  if (!preTestCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-sm space-y-5 text-center">
          <div className="flex items-center justify-center mx-auto h-14 w-14 rounded-full bg-primary-100">
            <FileQuestion className="h-7 w-7 text-primary-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Pre Test Diperlukan</h2>
            <p className="text-sm text-muted-foreground">
              Kerjakan Pre Test terlebih dahulu untuk menentukan dari bab mana kamu mulai belajar.
            </p>
          </div>
          <Button onClick={() => router.push(`/student/materi/${materiId}/pretest`)} className="w-full bg-primary-600 hover:bg-primary-700 text-white" size="lg">
            Mulai Pre Test
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push('/student/kurikulum')} className="w-full text-muted-foreground">
            ← Kembali ke Kurikulum
          </Button>
        </div>
      </div>
    );
  }

  // Bab list
  const allBabsCompleted = babs.length > 0 && babs.every(b => b.babStatus === 'COMPLETED');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/student/kurikulum')}>
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <ol className="flex items-center gap-1">
            <li><a href="/student/kurikulum" className="hover:text-primary-600">Kurikulum</a></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground">Daftar Bab</li>
          </ol>
        </nav>
      </div>

      {babs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-300 p-12">
          <BookOpen className="h-10 w-10 text-gray-400" />
          <p className="text-sm text-gray-500">Belum ada bab tersedia.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {babs.map((bab) => {
            const isLocked = bab.babStatus === 'LOCKED';
            const isCompleted = bab.babStatus === 'COMPLETED';

            return (
              <button
                key={bab.id}
                onClick={() => !isLocked && router.push(`/student/kurikulum/${materiId}/${bab.id}`)}
                disabled={isLocked}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  isLocked ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60 grayscale'
                    : isCompleted ? 'border-green-200 bg-green-50 hover:border-green-300'
                    : 'border-border bg-white hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isLocked && <Lock className="h-5 w-5 text-gray-400" />}
                  {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {!isLocked && !isCompleted && <BookOpen className="h-5 w-5 text-primary-600" />}
                  <div>
                    <h2 className={`font-medium ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{bab.name}</h2>
                    <p className={`mt-0.5 text-xs ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>{bab.chapterCount} chapter</p>
                  </div>
                </div>
                {isLocked && <p className="mt-2 text-xs text-gray-400">Selesaikan bab sebelumnya untuk membuka</p>}
              </button>
            );
          })}

          {/* Post Test section */}
          <div className="mt-4 pt-4 border-t border-border">
            {postTestStatus.passed ? (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-800">Post Test Selesai</p>
                  <p className="text-xs text-green-600">Materi ini telah diselesaikan</p>
                </div>
              </div>
            ) : allBabsCompleted ? (
              <Button onClick={() => router.push(`/student/materi/${materiId}/posttest`)} className="w-full gap-2 bg-primary-600 hover:bg-primary-700 text-white">
                <ClipboardCheck className="h-4 w-4" /> Kerjakan Post Test
              </Button>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 opacity-60">
                <Lock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Post Test</p>
                  <p className="text-xs text-gray-400">Selesaikan semua bab untuk membuka Post Test</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
