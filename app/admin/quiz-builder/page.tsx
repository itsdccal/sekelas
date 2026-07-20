'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { curriculumApi } from '@/lib/api';
import { useUIStore } from '@/stores';
import type { Materi, Bab, Chapter, QuizType } from '@/lib/types';

type DrillLevel = 'materi' | 'bab' | 'chapter';

const QUIZ_TYPE_LABELS: Record<QuizType, string> = {
  CHAPTER_QUIZ: 'Kuis Chapter',
  PRE_TEST: 'Pre Test',
  POST_TEST: 'Post Test',
};

/**
 * Bank Soal index page.
 * Quiz type tabs: Kuis Chapter, Pre Test, Post Test.
 * - Kuis Chapter: Materi → Bab → Chapter → quiz builder
 * - Pre Test: Materi → Bab → pre test builder (bab level)
 * - Post Test: Materi → Bab → post test builder (bab level)
 *
 * Requirements: 21.1, 21.7
 */
export default function QuizBuilderIndexPage() {
  const router = useRouter();
  const selectedSemesterId = useUIStore((s) => s.selectedSemesterId);

  const [quizType, setQuizType] = useState<QuizType>('CHAPTER_QUIZ');
  const [level, setLevel] = useState<DrillLevel>('materi');
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [selectedMateri, setSelectedMateri] = useState<Materi | null>(null);
  const [babList, setBabList] = useState<Bab[]>([]);
  const [selectedBab, setSelectedBab] = useState<Bab | null>(null);
  const [chapterList, setChapterList] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reset drill-down when quiz type changes
  const handleQuizTypeChange = useCallback((type: QuizType) => {
    setQuizType(type);
    setLevel('materi');
    setSelectedMateri(null);
    setSelectedBab(null);
  }, []);

  // Fetch materi list
  useEffect(() => {
    if (!selectedSemesterId) return;
    setIsLoading(true);
    curriculumApi.getMateriList(selectedSemesterId)
      .then(data => {
        const sorted = Array.isArray(data) ? data.sort((a, b) => a.orderIndex - b.orderIndex) : [];
        setMateriList(sorted);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedSemesterId]);

  // Fetch bab when materi selected
  useEffect(() => {
    if (level !== 'bab' || !selectedMateri) return;
    setIsLoading(true);
    curriculumApi.getBabList(selectedMateri.id)
      .then(data => {
        const sorted = Array.isArray(data) ? data.sort((a, b) => a.orderIndex - b.orderIndex) : [];
        setBabList(sorted);
        setIsLoading(false);
      })
      .catch(() => { setBabList([]); setIsLoading(false); });
  }, [level, selectedMateri]);

  // Fetch chapters when bab selected (only for CHAPTER_QUIZ)
  useEffect(() => {
    if (quizType !== 'CHAPTER_QUIZ') return;
    if (level !== 'chapter' || !selectedBab) return;
    setIsLoading(true);
    curriculumApi.getChapterList(selectedBab.id)
      .then(data => {
        const sorted = Array.isArray(data) ? data.sort((a, b) => a.orderIndex - b.orderIndex) : [];
        setChapterList(sorted);
        setIsLoading(false);
      })
      .catch(() => { setChapterList([]); setIsLoading(false); });
  }, [level, selectedBab, quizType]);

  const handleSelectMateri = useCallback((materi: Materi) => {
    if (quizType === 'PRE_TEST' || quizType === 'POST_TEST') {
      // Pre Test and Post Test are at materi level
      router.push(`/admin/quiz-builder/${materi.id}?type=${quizType.toLowerCase()}`);
    } else {
      setSelectedMateri(materi);
      setSelectedBab(null);
      setLevel('bab');
    }
  }, [quizType, router]);

  const handleSelectBab = useCallback((bab: Bab) => {
    if (quizType === 'CHAPTER_QUIZ') {
      setSelectedBab(bab);
      setLevel('chapter');
    } else {
      router.push(`/admin/quiz-builder/${bab.id}?type=${quizType.toLowerCase()}`);
    }
  }, [quizType, router]);

  const handleSelectChapter = useCallback((chapterId: string) => {
    router.push(`/admin/quiz-builder/${chapterId}`);
  }, [router]);

  const handleBack = useCallback(() => {
    if (level === 'chapter') {
      setSelectedBab(null);
      setLevel('bab');
    } else if (level === 'bab') {
      setSelectedMateri(null);
      setLevel('materi');
    }
  }, [level]);

  // Determine max drill level based on quiz type
  const maxLevel: DrillLevel = quizType === 'CHAPTER_QUIZ' ? 'chapter' : 'bab';

  if (!selectedSemesterId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Bank Soal</h1>
        <p className="text-muted-foreground">Pilih semester terlebih dahulu pada header.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-lg sm:text-2xl font-semibold">
          Bank Soal
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Kelola pola soal dan pertanyaan untuk Kuis Chapter, Pre Test, dan Post Test.
        </p>
      </div>

      {/* Quiz Type Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1" role="tablist" aria-label="Tipe soal">
        {(['CHAPTER_QUIZ', 'PRE_TEST', 'POST_TEST'] as QuizType[]).map((type) => (
          <button
            key={type}
            role="tab"
            aria-selected={quizType === type}
            onClick={() => handleQuizTypeChange(type)}
            className={`flex-1 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
              quizType === type
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {QUIZ_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Breadcrumb navigasi Bank Soal">
        <button
          onClick={() => { setLevel('materi'); setSelectedMateri(null); setSelectedBab(null); }}
          className={`rounded px-1.5 py-0.5 transition-colors ${
            level === 'materi' ? 'font-semibold text-foreground' : 'text-primary-600 hover:underline'
          }`}
        >
          {QUIZ_TYPE_LABELS[quizType]}
        </button>
        {selectedMateri && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <button
              onClick={() => { setLevel('bab'); setSelectedBab(null); }}
              className={`rounded px-1.5 py-0.5 transition-colors truncate max-w-[120px] sm:max-w-none ${
                level === 'bab' ? 'font-semibold text-foreground' : 'text-primary-600 hover:underline'
              }`}
            >
              {selectedMateri.name}
            </button>
          </>
        )}
        {selectedBab && quizType === 'CHAPTER_QUIZ' && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="font-semibold text-foreground px-1.5 py-0.5 truncate max-w-[120px] sm:max-w-none">
              {selectedBab.name}
            </span>
          </>
        )}
      </nav>

      {/* Drill-down list panel */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {level === 'materi' && (
            <>
              {materiList.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Belum ada materi</p>
              ) : (
                materiList.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMateri(m)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-left transition-colors hover:border-primary-200 hover:bg-primary-50/50 group"
                  >
                    <span className="text-sm font-medium text-foreground">{m.name}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-600 transition-colors" />
                  </button>
                ))
              )}
            </>
          )}

          {level === 'bab' && (
            <>
              {babList.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Belum ada bab dalam materi ini</p>
              ) : (
                babList.map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBab(b)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-left transition-colors hover:border-primary-200 hover:bg-primary-50/50 group"
                  >
                    <div className="text-left">
                      <span className="text-sm font-medium text-foreground">{b.name}</span>
                      {quizType !== 'CHAPTER_QUIZ' && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Kelola soal {QUIZ_TYPE_LABELS[quizType]} untuk bab ini
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-600 transition-colors" />
                  </button>
                ))
              )}
            </>
          )}

          {level === 'chapter' && quizType === 'CHAPTER_QUIZ' && (
            <>
              {chapterList.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Belum ada chapter dalam bab ini</p>
              ) : (
                chapterList.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChapter(ch.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-left transition-colors hover:border-primary-200 hover:bg-primary-50/50 group"
                  >
                    <span className="text-sm font-medium text-foreground">{ch.name}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-600 transition-colors" />
                  </button>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
