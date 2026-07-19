"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Settings, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { curriculumApi, adminApi } from "@/lib/api";
import type { Chapter, QuestionPattern } from "@/lib/types";

// --- Props ---

export interface BabTestBuilderPanelProps {
  babId: string;
  quizType: 'PRE_TEST' | 'POST_TEST';
}

const TYPE_LABELS: Record<string, string> = {
  PRE_TEST: 'Pre Test',
  POST_TEST: 'Post Test',
};

interface ChapterQuestionInfo {
  chapter: Chapter;
  availableQuestions: number; // jumlah soal tersedia dari semua topik chapter ini
  questionsToTake: number; // jumlah soal yang diambil untuk test
}

/**
 * BabTestBuilderPanel — konfigurasi distribusi soal Pre/Post Test.
 * 
 * Konsep: Pre Test dan Post Test TIDAK punya soal sendiri.
 * Soalnya diambil dari Bank Soal per chapter yang sudah dibuat via "Kuis Chapter".
 * Admin hanya mengatur:
 * - Berapa soal yang diambil dari tiap chapter
 * - KKM / passing grade (khusus Post Test)
 */
export function BabTestBuilderPanel({ babId, quizType }: BabTestBuilderPanelProps) {
  const [chapters, setChapters] = useState<ChapterQuestionInfo[]>([]);
  const [passingGrade, setPassingGrade] = useState(70);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch chapters + question count per chapter
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const chapterList = await curriculumApi.getChapterList(babId);
      const sorted = [...chapterList].sort((a, b) => a.orderIndex - b.orderIndex);

      // For each chapter, get patterns to count available questions
      const chaptersWithInfo: ChapterQuestionInfo[] = await Promise.all(
        sorted.map(async (chapter) => {
          let availableQuestions = 0;
          try {
            const patterns: QuestionPattern[] = await adminApi.getPatterns(chapter.id);
            availableQuestions = patterns.reduce((sum, p) => sum + p.questionCount, 0);
          } catch {
            // Default 0
          }
          return {
            chapter,
            availableQuestions,
            questionsToTake: Math.min(2, availableQuestions), // default: 2 soal per chapter
          };
        })
      );

      setChapters(chaptersWithInfo);
    } catch {
      setError("Gagal memuat data chapter");
    } finally {
      setIsLoading(false);
    }
  }, [babId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleQuestionsChange = useCallback((chapterIndex: number, value: number) => {
    setChapters((prev) => {
      const updated = [...prev];
      const max = updated[chapterIndex].availableQuestions;
      updated[chapterIndex] = {
        ...updated[chapterIndex],
        questionsToTake: Math.max(0, Math.min(max, value)),
      };
      return updated;
    });
    setSaveSuccess(false);
  }, []);

  const totalQuestions = chapters.reduce((sum, ch) => sum + ch.questionsToTake, 0);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // In production: save config to API
      // POST /api/v1/admin/quiz/config/{babId}
      // { quizType, passingGrade, distribution: [{chapterId, count}] }
      await new Promise((resolve) => setTimeout(resolve, 500)); // simulate
      setSaveSuccess(true);
    } catch {
      setError("Gagal menyimpan konfigurasi");
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="mt-3 text-sm text-muted-foreground">Memuat data chapter...</p>
      </div>
    );
  }

  // Error
  if (error && chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-red-700">{error}</p>
        <Button onClick={fetchData} size="sm" variant="outline">Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-semibold">Konfigurasi {TYPE_LABELS[quizType]}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {quizType === 'PRE_TEST'
            ? 'Atur berapa soal yang diambil dari tiap chapter untuk mengukur tingkat pemahaman siswa.'
            : 'Atur berapa soal yang diambil dari tiap chapter dan batas kelulusan untuk evaluasi akhir bab.'}
        </p>
      </div>

      {/* Passing Grade (Post Test only) */}
      {quizType === 'POST_TEST' && (
        <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2 shrink-0">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <label htmlFor="passingGrade" className="text-sm font-medium whitespace-nowrap">
              Batas Kelulusan (KKM)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="passingGrade"
              type="number"
              min={0}
              max={100}
              value={passingGrade}
              onChange={(e) => { setPassingGrade(Math.max(0, Math.min(100, parseInt(e.target.value) || 70))); setSaveSuccess(false); }}
              className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm text-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
      )}

      {quizType === 'PRE_TEST' && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
          <p className="text-sm text-primary-800">
            Pre Test tidak memiliki batas kelulusan. Jawaban benar digunakan untuk menentukan penempatan siswa
            (placement) — siswa mulai dari chapter pertama yang soalnya dijawab salah.
          </p>
        </div>
      )}

      {/* Distribution table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Distribusi Soal per Chapter</h3>
          <span className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{totalQuestions} soal</span> per sesi
          </span>
        </div>

        {chapters.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada chapter dalam bab ini</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border divide-y divide-border">
            {chapters.map((item, index) => (
              <div key={item.chapter.id} className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.chapter.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.availableQuestions} soal tersedia di Bank Soal
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">Ambil</span>
                  <input
                    type="number"
                    min={0}
                    max={item.availableQuestions}
                    value={item.questionsToTake}
                    onChange={(e) => handleQuestionsChange(index, parseInt(e.target.value) || 0)}
                    className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm text-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1"
                    aria-label={`Jumlah soal dari ${item.chapter.name}`}
                  />
                  <span className="text-xs text-muted-foreground">soal</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warning if some chapters have 0 questions */}
        {chapters.some((ch) => ch.availableQuestions === 0) && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            ⚠️ Beberapa chapter belum memiliki soal di Bank Soal. Buat soal terlebih dahulu di tab "Kuis Chapter".
          </p>
        )}
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={isSaving || totalQuestions === 0}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Konfigurasi
        </Button>
        {saveSuccess && (
          <span className="text-sm text-green-600 font-medium">✓ Tersimpan</span>
        )}
        {totalQuestions === 0 && (
          <span className="text-xs text-muted-foreground">Minimal 1 soal harus dipilih</span>
        )}
      </div>
    </div>
  );
}
