'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PenTool, ArrowRight, BookOpen, Layers, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { curriculumApi } from '@/lib/api';
import { useUIStore } from '@/stores';
import type { Materi, Bab, Chapter } from '@/lib/types';

/**
 * Quiz Builder index page.
 * Allows admin to select a Chapter to manage its quiz patterns/questions.
 */
export default function QuizBuilderIndexPage() {
  const router = useRouter();
  const selectedSemesterId = useUIStore((s) => s.selectedSemesterId);

  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [selectedMateri, setSelectedMateri] = useState<string | null>(null);
  const [babList, setBabList] = useState<Bab[]>([]);
  const [selectedBab, setSelectedBab] = useState<string | null>(null);
  const [chapterList, setChapterList] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch materi list
  useEffect(() => {
    if (!selectedSemesterId) return;
    setIsLoading(true);
    curriculumApi.getMateriList(selectedSemesterId)
      .then(data => {
        setMateriList(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedSemesterId]);

  // Fetch bab when materi selected
  useEffect(() => {
    if (!selectedMateri) { setBabList([]); return; }
    curriculumApi.getBabList(selectedMateri)
      .then(data => setBabList(Array.isArray(data) ? data : []))
      .catch(() => setBabList([]));
  }, [selectedMateri]);

  // Fetch chapters when bab selected
  useEffect(() => {
    if (!selectedBab) { setChapterList([]); return; }
    curriculumApi.getChapterList(selectedBab)
      .then(data => setChapterList(Array.isArray(data) ? data : []))
      .catch(() => setChapterList([]));
  }, [selectedBab]);

  const handleSelectChapter = (chapterId: string) => {
    router.push(`/admin/quiz-builder/${chapterId}`);
  };

  if (!selectedSemesterId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Pembangun Kuis</h1>
        <p className="text-muted-foreground">Pilih semester terlebih dahulu pada header.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <PenTool className="h-6 w-6 text-primary-600" />
          Pembangun Kuis
        </h1>
        <p className="text-sm text-muted-foreground">
          Pilih Chapter untuk mengelola pola soal dan pertanyaan kuis.
        </p>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 p-4">
        <Info className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
        <p className="text-sm text-primary-800">
          Pembangun Kuis dapat digunakan untuk membuat bank soal Kuis Chapter, Pre Test, dan Post Test.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Step 1: Pick Materi */}
          <div className="rounded-xl border border-border bg-gradient-to-b from-green-50/60 to-white p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-bold shrink-0">
                1
              </span>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-semibold text-foreground">Pilih Materi</span>
              </div>
            </div>
            <div className="space-y-1 rounded-lg border border-border bg-white p-2 max-h-60 overflow-y-auto">
              {materiList.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedMateri(m.id); setSelectedBab(null); }}
                  className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                    selectedMateri === m.id ? 'bg-primary-100 text-primary-800 font-medium ring-1 ring-primary-300' : 'hover:bg-muted'
                  }`}
                >
                  {m.name}
                </button>
              ))}
              {materiList.length === 0 && (
                <p className="px-3 py-4 text-sm text-muted-foreground text-center">Belum ada materi</p>
              )}
            </div>
          </div>

          {/* Step 2: Pick Bab */}
          <div className="rounded-xl border border-border bg-gradient-to-b from-emerald-50/60 to-white p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-bold shrink-0">
                2
              </span>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-semibold text-foreground">Pilih Bab</span>
              </div>
            </div>
            <div className="space-y-1 rounded-lg border border-border bg-white p-2 max-h-60 overflow-y-auto">
              {babList.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBab(b.id)}
                  className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                    selectedBab === b.id ? 'bg-primary-100 text-primary-800 font-medium ring-1 ring-primary-300' : 'hover:bg-muted'
                  }`}
                >
                  {b.name}
                </button>
              ))}
              {!selectedMateri && (
                <p className="px-3 py-4 text-sm text-muted-foreground text-center">Pilih materi terlebih dahulu</p>
              )}
              {selectedMateri && babList.length === 0 && (
                <p className="px-3 py-4 text-sm text-muted-foreground text-center">Belum ada bab</p>
              )}
            </div>
          </div>

          {/* Step 3: Pick Chapter */}
          <div className="rounded-xl border border-border bg-gradient-to-b from-teal-50/60 to-white p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-bold shrink-0">
                3
              </span>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-semibold text-foreground">Pilih Chapter</span>
              </div>
            </div>
            <div className="space-y-1 rounded-lg border border-border bg-white p-2 max-h-60 overflow-y-auto">
              {chapterList.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChapter(ch.id)}
                  className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-primary-50 hover:text-primary-700 transition-colors group"
                >
                  <span>{ch.name}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-600 transition-colors" />
                </button>
              ))}
              {!selectedBab && (
                <p className="px-3 py-4 text-sm text-muted-foreground text-center">Pilih bab terlebih dahulu</p>
              )}
              {selectedBab && chapterList.length === 0 && (
                <p className="px-3 py-4 text-sm text-muted-foreground text-center">Belum ada chapter</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
