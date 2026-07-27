'use client';

import { BookOpen, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PreTestResult } from '@/lib/types';

interface PreTestResultDisplayProps {
  result: PreTestResult;
  onContinue: () => void;
}

/**
 * Displays Pre Test result.
 *
 * Two states:
 * - PLACED: placement langsung, tampilkan bab mulai + XP
 * - PENDING_PLACEMENT: ada soal isian, siswa menunggu penilaian guru
 *
 * Requirements: 17.5
 */
export function PreTestResultDisplay({ result, onContinue }: PreTestResultDisplayProps) {
  // ─── Pending state ────────────────────────────────────────────────────────
  if (result.status === 'PENDING_PLACEMENT') {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto py-8">
        {/* Icon */}
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-100">
          <Clock className="h-9 w-9 text-amber-600" aria-hidden="true" />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Jawaban Diterima!
          </h2>
          <p className="text-sm text-muted-foreground">
            Pre Test kamu sudah berhasil dikumpulkan
          </p>
        </div>

        {/* Info card */}
        <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-800">
                Menunggu Penilaian Guru
              </p>
              <p className="text-sm text-amber-700 leading-relaxed">
                Pre Test kamu mengandung soal isian yang perlu diperiksa oleh guru.
                Penempatan bab akan ditentukan setelah penilaian selesai.
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="w-full rounded-xl border border-border bg-white p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Langkah selanjutnya
          </p>
          <div className="space-y-2.5">
            {[
              'Guru akan memeriksa jawaban isian kamu',
              'Kamu akan mendapat notifikasi setelah penilaian selesai',
              'Penempatan bab dan XP akan diberikan setelah dinilai',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back button */}
        <Button
          onClick={onContinue}
          variant="outline"
          className="w-full"
          aria-label="Kembali ke halaman materi"
        >
          Kembali ke Halaman Materi
        </Button>
      </div>
    );
  }

  // ─── Placed state ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto py-8">
      {/* Icon */}
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100">
        <BookOpen className="h-10 w-10 text-primary-600" aria-hidden="true" />
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Hasil Pre Test
        </h2>
        <p className="text-sm text-muted-foreground">
          Penempatan berdasarkan tingkat pemahaman kamu
        </p>
      </div>

      {/* Placement info */}
      <div className="w-full rounded-lg border border-primary-200 bg-primary-50 p-4 space-y-3">
        <p className="text-sm text-primary-800 font-medium">
          Kamu akan memulai dari:
        </p>
        <p className="text-lg font-semibold text-primary-700">
          {result.startSectionName}
        </p>
        {result.totalSectionsSkipped > 0 && (
          <p className="text-sm text-primary-700">
            {result.totalSectionsSkipped} bab dilewati berdasarkan pemahamanmu
          </p>
        )}
      </div>

      {/* XP earned (if any) */}
      {result.xpEarned > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
          <Zap className="h-5 w-5 text-yellow-600" aria-hidden="true" />
          <span className="text-sm font-medium text-yellow-800">
            +{result.xpEarned} XP diperoleh!
          </span>
        </div>
      )}

      {/* Message */}
      <p className="text-center text-sm text-foreground">
        {result.message}
      </p>

      {/* Continue button */}
      <Button
        onClick={onContinue}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white"
        aria-label="Mulai Belajar"
      >
        Mulai Belajar
      </Button>
    </div>
  );
}
