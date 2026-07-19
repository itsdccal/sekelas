'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileQuestion, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PreTestComponent } from '@/components/student/PreTestComponent';
import { PreTestResultDisplay } from '@/components/student/PreTestResult';
import type { PreTestResult } from '@/lib/types';

type PageState = 'gate' | 'confirm' | 'test' | 'result';

/**
 * Pre Test page for a Bab.
 * Flow: Gate (info) → Confirm dialog → PreTestComponent → Result.
 * Confirmation prevents accidental start since Pre Test can only be taken once.
 *
 * Requirements: 17.1, 17.5, 17.6
 */
export default function PreTestPage() {
  const params = useParams();
  const router = useRouter();
  const babId = params.babId as string;

  const [pageState, setPageState] = useState<PageState>('gate');
  const [result, setResult] = useState<PreTestResult | null>(null);

  const handleStartConfirm = useCallback(() => {
    setPageState('confirm');
  }, []);

  const handleConfirmStart = useCallback(() => {
    setPageState('test');
  }, []);

  const handleCancelConfirm = useCallback(() => {
    setPageState('gate');
  }, []);

  const handleComplete = useCallback((preTestResult: PreTestResult) => {
    setResult(preTestResult);
    setPageState('result');
  }, []);

  const handleContinue = useCallback(() => {
    router.back();
  }, [router]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  // Result screen
  if (pageState === 'result' && result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <PreTestResultDisplay result={result} onContinue={handleContinue} />
      </div>
    );
  }

  // Active test
  if (pageState === 'test') {
    return (
      <div className="flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-2xl space-y-4">
          <h1 className="text-xl font-semibold text-center text-foreground">Pre Test</h1>
          <PreTestComponent babId={babId} onComplete={handleComplete} />
        </div>
      </div>
    );
  }

  // Confirmation dialog
  if (pageState === 'confirm') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          {/* Warning icon */}
          <div className="flex items-center justify-center mx-auto h-16 w-16 rounded-full bg-amber-100">
            <AlertTriangle className="h-8 w-8 text-amber-600" aria-hidden="true" />
          </div>

          {/* Confirmation text */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Yakin mulai Pre Test?
            </h2>
            <p className="text-sm text-muted-foreground">
              Pre Test <span className="font-medium text-foreground">hanya bisa dikerjakan 1 kali</span> dan tidak bisa diulang.
              Pastikan kamu siap sebelum memulai.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleConfirmStart}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
              aria-label="Ya, mulai Pre Test sekarang"
            >
              Ya, Mulai Sekarang
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelConfirm}
              className="w-full"
              aria-label="Batal, kembali"
            >
              Batal, Belum Siap
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Gate screen (default) — info + start button
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Kembali"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>

        {/* Main card */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-5">
          {/* Icon */}
          <div className="flex items-center justify-center mx-auto h-14 w-14 rounded-full bg-primary-100">
            <FileQuestion className="h-7 w-7 text-primary-600" aria-hidden="true" />
          </div>

          {/* Title & description */}
          <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold text-foreground">Pre Test</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pre Test mengukur tingkat pemahaman kamu terhadap materi di bab ini.
              Berdasarkan hasilnya, kamu akan ditempatkan di chapter yang sesuai kemampuanmu.
            </p>
          </div>

          {/* Info points */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-primary-700">1</span>
              </span>
              <p className="text-sm text-foreground">
                Jawab sesuai kemampuanmu saat ini
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-primary-700">2</span>
              </span>
              <p className="text-sm text-foreground">
                Hasilnya menentukan dari chapter mana kamu mulai belajar
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-amber-700">!</span>
              </span>
              <p className="text-sm font-medium text-foreground">
                Hanya bisa dikerjakan 1 kali — tidak bisa diulang
              </p>
            </div>
          </div>

          {/* Start button */}
          <Button
            onClick={handleStartConfirm}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            size="lg"
            aria-label="Mulai Pre Test"
          >
            Mulai Pre Test
          </Button>
        </div>
      </div>
    </div>
  );
}
