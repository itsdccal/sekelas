'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { coursesApi } from '@/lib/api';
import { useUIStore } from '@/stores';
import type { Subject, Section, Chapter, QuizType } from '@/lib/types';

type DrillLevel = 'Subject' | 'Section' | 'chapter';

const QUIZ_TYPE_LABELS: Record<QuizType, string> = {
  CHAPTER_QUIZ: 'Kuis Chapter',
  PRE_TEST: 'Pre Test',
  POST_TEST: 'Post Test',
};

/**
 * Bank Soal index page.
 * Quiz type tabs: Kuis Chapter, Pre Test, Post Test.
 * - Kuis Chapter: Materi → Section → Chapter → quiz builder
 * - Pre Test: Materi → Section → pre test builder (Section level)
 * - Post Test: Materi → Section → post test builder (Section level)
 *
 * Requirements: 21.1, 21.7
 */
export default function QuizBuilderIndexPage() {
  const router = useRouter();
  const selectedSemesterId = useUIStore((s) => s.selectedSemesterId);

  const [quizType, setQuizType] = useState<QuizType>('CHAPTER_QUIZ');
  const [level, setLevel] = useState<DrillLevel>('Subject');
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [sectionList, setSectionList] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [chapterList, setChapterList] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reset drill-down when quiz type changes
  const handleQuizTypeChange = useCallback((type: QuizType) => {
    setQuizType(type);
    setLevel('Subject');
    setSelectedSubject(null);
    setSelectedSection(null);
  }, []);

  // Fetch subject list
  useEffect(() => {
    if (!selectedSemesterId) return;
    setIsLoading(true);
    coursesApi.getSubjectList(selectedSemesterId)
      .then(data => {
        const sorted = Array.isArray(data) ? data.sort((a, b) => a.orderIndex - b.orderIndex) : [];
        setSubjectList(sorted);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedSemesterId]);

  // Fetch sections when subject selected
  useEffect(() => {
    if (level !== 'Section' || !selectedSubject) return;
    setIsLoading(true);
    coursesApi.getSectionList(selectedSubject.id)
      .then(data => {
        const sorted = Array.isArray(data) ? data.sort((a, b) => a.orderIndex - b.orderIndex) : [];
        setSectionList(sorted);
        setIsLoading(false);
      })
      .catch(() => { setSectionList([]); setIsLoading(false); });
  }, [level, selectedSubject]);

  // Fetch chapters when Section selected (only for CHAPTER_QUIZ)
  useEffect(() => {
    if (quizType !== 'CHAPTER_QUIZ') return;
    if (level !== 'chapter' || !selectedSection) return;
    setIsLoading(true);
    coursesApi.getChapterList(selectedSection.id)
      .then(data => {
        const sorted = Array.isArray(data) ? data.sort((a, b) => a.orderIndex - b.orderIndex) : [];
        setChapterList(sorted);
        setIsLoading(false);
      })
      .catch(() => { setChapterList([]); setIsLoading(false); });
  }, [level, selectedSection, quizType]);

  const handleSelectSubject = useCallback((subject: Subject) => {
    if (quizType === 'PRE_TEST' || quizType === 'POST_TEST') {
      router.push(`/admin/quiz-builder/${subject.id}?type=${quizType.toLowerCase()}`);
    } else {
      setSelectedSubject(subject);
      setSelectedSection(null);
      setLevel('Section');
    }
  }, [quizType, router]);

  const handleSelectSection = useCallback((section: Section) => {
    if (quizType === 'CHAPTER_QUIZ') {
      setSelectedSection(section);
      setLevel('chapter');
    } else {
      router.push(`/admin/quiz-builder/${section.id}?type=${quizType.toLowerCase()}`);
    }
  }, [quizType, router]);

  const handleSelectChapter = useCallback((chapterId: string) => {
    router.push(`/admin/quiz-builder/${chapterId}`);
  }, [router]);

  const handleBack = useCallback(() => {
    if (level === 'chapter') {
      setSelectedSection(null);
      setLevel('Section');
    } else if (level === 'Section') {
      setSelectedSubject(null);
      setLevel('Subject');
    }
  }, [level]);

  // Determine max drill level based on quiz type
  const maxLevel: DrillLevel = quizType === 'CHAPTER_QUIZ' ? 'chapter' : 'Section';

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
          onClick={() => { setLevel('Subject'); setSelectedSubject(null); setSelectedSection(null); }}
          className={`rounded px-1.5 py-0.5 transition-colors ${
            level === 'Subject' ? 'font-semibold text-foreground' : 'text-primary-600 hover:underline'
          }`}
        >
          {QUIZ_TYPE_LABELS[quizType]}
        </button>
        {selectedSubject && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <button
              onClick={() => { setLevel('Section'); setSelectedSection(null); }}
              className={`rounded px-1.5 py-0.5 transition-colors truncate max-w-[120px] sm:max-w-none ${
                level === 'Section' ? 'font-semibold text-foreground' : 'text-primary-600 hover:underline'
              }`}
            >
              {selectedSubject.name}
            </button>
          </>
        )}
        {selectedSection && quizType === 'CHAPTER_QUIZ' && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="font-semibold text-foreground px-1.5 py-0.5 truncate max-w-[120px] sm:max-w-none">
              {selectedSection.name}
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
          {level === 'Subject' && (
            <>
              {subjectList.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Belum ada Subject</p>
              ) : (
                subjectList.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectSubject(m)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-left transition-colors hover:border-primary-200 hover:bg-primary-50/50 group"
                  >
                    <span className="text-sm font-medium text-foreground">{m.name}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-600 transition-colors" />
                  </button>
                ))
              )}
            </>
          )}

          {level === 'Section' && (
            <>
              {sectionList.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Belum ada Section dalam materi ini</p>
              ) : (
                sectionList.map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleSelectSection(b)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-left transition-colors hover:border-primary-200 hover:bg-primary-50/50 group"
                  >
                    <div className="text-left">
                      <span className="text-sm font-medium text-foreground">{b.name}</span>
                      {quizType !== 'CHAPTER_QUIZ' && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Kelola soal {QUIZ_TYPE_LABELS[quizType]} untuk Section ini
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
                <p className="py-8 text-center text-sm text-muted-foreground">Belum ada chapter dalam Section ini</p>
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
