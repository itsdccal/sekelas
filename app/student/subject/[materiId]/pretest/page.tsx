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
 * Pre Test page at Materi level.
 * Flow: Gate → Confirm → Test → Result (placement bab).
 */
export default function PreTestPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;

  const [pageState, setPageState] = useState<PageState>('gate');
  const [result, setResult] = useState<PreTestResult | null>(null);

  const handleComplete = useCallback((r: PreTestResult) => {
    setResult(r);
    setPageState('result');
  }, []);

  const handleContinue = useCallback(() => {
    router.push(`/student/courses/${subjectId}`);
  }, [router, subjectId]);

  if (pageState === 'result' && result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <PreTestResultDisplay result={result} onContinue={handleContinue} />
      </div>
    );
  }

  if (pageState === 'test') {
    return (
      <div className="flex flex-col">
        <PreTestComponent subjectId={subjectId} onComplete={handleComplete} />
      </div>
    );
  }

  if (pageState === 'confirm') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex items-center justify-center mx-auto h-16 w-16 rounded-full bg-amber-100">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Yakin mulai Pre Test?</h2>
            <p className="text-sm text-muted-foreground">
              Pre Test <span className="font-medium text-foreground">hanya bisa dikerjakan 1 kali</span> dan tidak bisa diulang.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => setPageState('test')} className="w-full bg-primary-600 hover:bg-primary-700 text-white">Ya, Mulai Sekarang</Button>
            <Button variant="outline" onClick={() => setPageState('gate')} className="w-full">Batal, Belum Siap</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-center mx-auto h-14 w-14 rounded-full bg-primary-100">
            <FileQuestion className="h-7 w-7 text-primary-600" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold">Pre Test</h1>
            <p className="text-sm text-muted-foreground">
              Pre Test mengukur tingkat pemahaman kamu. Berdasarkan hasilnya, kamu akan ditempatkan di bab yang sesuai kemampuanmu.
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0"><span className="text-xs font-medium text-primary-700">1</span></span>
              <p className="text-sm">Jawab sesuai kemampuanmu saat ini</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0"><span className="text-xs font-medium text-primary-700">2</span></span>
              <p className="text-sm">Hasilnya menentukan dari bab mana kamu mulai belajar</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><span className="text-xs font-medium text-amber-700">!</span></span>
              <p className="text-sm font-medium">Hanya bisa dikerjakan 1 kali — tidak bisa diulang</p>
            </div>
          </div>
          <Button onClick={() => setPageState('confirm')} className="w-full bg-primary-600 hover:bg-primary-700 text-white" size="lg">Mulai Pre Test</Button>
        </div>
      </div>
    </div>
  );
}
