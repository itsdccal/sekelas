"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ChevronRight, Loader2, ClipboardList, Clock, Target, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { QuestionForm } from "./QuestionForm";
import { adminApi } from "@/lib/api";
import type { QuestionPattern, Question, QuizType } from "@/lib/types";

// --- Types ---

export interface BabTestBuilderPanelProps {
  sectionId: string;
  quizType: 'PRE_TEST' | 'POST_TEST';
}

const TYPE_LABELS: Record<string, string> = { PRE_TEST: 'Pre Test', POST_TEST: 'Post Test' };

// --- Subtest Form Dialog ---

function SubtestFormDialog({ open, onOpenChange, existingCodes, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void; existingCodes: string[];
  onSubmit: (data: { patternCode: string; description: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setApiError(null);
    const trimmed = name.trim();
    if (!trimmed) { setErrors({ name: "Nama subtest wajib diisi" }); return; }
    setErrors({});
    setIsSubmitting(true);
    const code = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').slice(0, 40) || `subtest-${Date.now()}`;
    let finalCode = code; let counter = 2;
    while (existingCodes.includes(finalCode)) { finalCode = `${code}-${counter}`; counter++; }
    try {
      await onSubmit({ patternCode: finalCode, description: trimmed });
      setName(""); onOpenChange(false);
    } catch (err: unknown) { setApiError(err instanceof Error ? err.message : "Gagal menyimpan"); }
    finally { setIsSubmitting(false); }
  };

  useEffect(() => { if (open) { setName(""); setErrors({}); setApiError(null); } }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Buat Subtest Baru</DialogTitle>
          <DialogDescription>
            Subtest mengelompokkan soal berdasarkan kategori (contoh: TU, PU, PPU, Literasi, dll).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {apiError && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{apiError}</div>}
          <div className="space-y-1.5">
            <label htmlFor="subtestName" className="text-sm font-medium">Nama Subtest *</label>
            <input id="subtestName" type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={100}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              placeholder="Contoh: Tes Potensi Skolastik — Penalaran Umum" />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Question List (manages questions inside a subtest — no pattern randomization) ---

function SubtestQuestionList({ pattern, quizType, onBack, onRefresh }: {
  pattern: QuestionPattern; quizType: QuizType; onBack: () => void; onRefresh: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  // Track which questions are "active" (will appear in test)
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  // Track per-question weight overrides
  const [weights, setWeights] = useState<Record<string, number>>({});

  const fetchQ = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getQuestions(pattern.id);
      setQuestions(data);
      // Default: all questions active
      setActiveIds(new Set(data.map(q => q.id)));
      // Init weights from question data
      const w: Record<string, number> = {};
      data.forEach(q => { w[q.id] = q.weight ?? 1; });
      setWeights(w);
    } catch {}
    finally { setIsLoading(false); }
  }, [pattern.id]);

  useEffect(() => { fetchQ(); }, [fetchQ]);

  const handleCreate = async (data: { text: string; questionType: string; imageUrl: string; options: { text: string; order: number }[]; correctOptionIndex: number | null; xpPerQuestion: number; weight: number }) => {
    await adminApi.createQuestion({ patternId: pattern.id, ...data }); await fetchQ(); onRefresh();
  };
  const handleUpdate = async (data: { text: string; questionType: string; imageUrl: string; options: { text: string; order: number }[]; correctOptionIndex: number | null; xpPerQuestion: number; weight: number }) => {
    if (!editing) return; await adminApi.updateQuestion(editing.id, data); await fetchQ(); setEditing(null);
  };

  const toggleActive = (id: string) => {
    setActiveIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleWeightChange = (id: string, value: number) => {
    setWeights(prev => ({ ...prev, [id]: value }));
  };

  const activeCount = activeIds.size;
  const totalWeight = questions.filter(q => activeIds.has(q.id)).reduce((s, q) => s + (weights[q.id] ?? 1), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>← Kembali</Button>
          <div>
            <h3 className="text-base font-semibold">{pattern.description || pattern.patternCode}</h3>
            <p className="text-xs text-muted-foreground">
              {activeCount}/{questions.length} soal aktif • Total bobot: {totalWeight}
            </p>
          </div>
        </div>
        <Button onClick={() => setIsFormOpen(true)}><Plus className="h-4 w-4" /> Tambah Soal</Button>
      </div>

      {/* Question list */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">Belum ada soal di subtest ini</p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q, idx) => {
            const isActive = activeIds.has(q.id);
            return (
              <div key={q.id} className={`rounded-lg border p-4 flex items-start gap-3 transition-all ${
                isActive ? 'bg-white border-border' : 'bg-gray-50 border-gray-200 opacity-60'
              }`}>
                {/* Toggle active */}
                <button type="button" onClick={() => toggleActive(q.id)}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    isActive ? 'border-primary-600 bg-primary-600' : 'border-gray-300 bg-white'
                  }`}
                  aria-label={isActive ? 'Nonaktifkan soal' : 'Aktifkan soal'}
                >
                  {isActive && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Question number */}
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-[11px] font-bold shrink-0">{idx + 1}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{q.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{q.options.length} opsi</p>
                </div>

                {/* Weight control */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-muted-foreground">Bobot</span>
                  <input type="number" min={1} max={100} value={weights[q.id] ?? 1}
                    onChange={(e) => handleWeightChange(q.id, Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    disabled={!isActive}
                    className="h-7 w-12 rounded border border-input px-1 text-xs text-center font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 disabled:opacity-40" />
                </div>

                {/* Edit button */}
                <Button size="sm" variant="ghost" className="shrink-0 h-7 px-2 text-xs" onClick={() => { setEditing(q); setIsFormOpen(true); }}>Ubah</Button>
              </div>
            );
          })}
        </div>
      )}

      <QuestionForm open={isFormOpen} onOpenChange={(o) => { setIsFormOpen(o); if (!o) setEditing(null); }}
        onSubmit={editing ? handleUpdate : handleCreate} initialData={editing ?? undefined} quizType={quizType} />
    </div>
  );
}

// --- Main Panel ---

export function BabTestBuilderPanel({ sectionId, quizType }: BabTestBuilderPanelProps) {
  const [patterns, setPatterns] = useState<QuestionPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubtestFormOpen, setIsSubtestFormOpen] = useState(false);
  const [selectedSubtest, setSelectedSubtest] = useState<QuestionPattern | null>(null);

  // Config
  const [timerMinutes, setTimerMinutes] = useState(20);
  const [passingGrade, setPassingGrade] = useState(70);

  const totalQuestions = patterns.reduce((s, p) => s + p.questionCount, 0);

  const fetchPatterns = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { setPatterns(await adminApi.getPatterns(sectionId)); }
    catch { setError("Gagal memuat subtest"); }
    finally { setIsLoading(false); }
  }, [sectionId]);

  useEffect(() => { fetchPatterns(); }, [fetchPatterns]);

  const handleCreate = async (data: { patternCode: string; description: string }) => {
    await adminApi.createPattern({ chapterId: sectionId, patternCode: data.patternCode, description: data.description });
    await fetchPatterns();
  };

  // If a subtest is selected, show its question list
  if (selectedSubtest) {
    return <SubtestQuestionList pattern={selectedSubtest} quizType={quizType} onBack={() => setSelectedSubtest(null)} onRefresh={fetchPatterns} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{TYPE_LABELS[quizType]}</h2>
          <p className="text-sm text-muted-foreground">
            {patterns.length} subtest • {totalQuestions} soal total
          </p>
        </div>
        <Button onClick={() => setIsSubtestFormOpen(true)}>
          <Plus className="h-4 w-4" /> Tambah Subtest
        </Button>
      </div>

      {/* Pengaturan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-primary-600" />
            <span className="text-xs font-medium text-muted-foreground">Waktu Pengerjaan</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <input type="number" min={5} max={180} value={timerMinutes}
              onChange={(e) => setTimerMinutes(Math.max(5, Math.min(180, parseInt(e.target.value) || 20)))}
              aria-label="Durasi dalam menit"
              className="h-9 w-16 rounded-lg border border-input px-2 text-center text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" />
            <span className="text-sm text-muted-foreground">menit</span>
          </div>
        </div>

        {quizType === 'POST_TEST' ? (
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary-600" />
              <span className="text-xs font-medium text-muted-foreground">KKM (Passing Grade)</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <input type="number" min={0} max={100} value={passingGrade}
                onChange={(e) => setPassingGrade(Math.max(0, Math.min(100, parseInt(e.target.value) || 70)))}
                aria-label="KKM persen"
                className="h-9 w-16 rounded-lg border border-input px-2 text-center text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-white p-4 flex items-center">
            <p className="text-xs text-muted-foreground">Pre Test tidak memiliki KKM — hasilnya berupa penempatan bab awal siswa.</p>
          </div>
        )}
      </div>

      {/* Daftar Subtest */}
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : patterns.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center">
          <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Belum ada subtest</p>
          <p className="text-xs text-muted-foreground">Buat subtest untuk mulai menambahkan soal.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {patterns.map((p, idx) => (
            <button key={p.id} onClick={() => setSelectedSubtest(p)}
              className="group flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left transition-all hover:shadow-md hover:border-primary-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700 font-bold text-sm shrink-0">
                {p.questionCount}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-primary-700 transition-colors">{p.description || p.patternCode}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.questionCount} soal</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary-500 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      )}

      <SubtestFormDialog open={isSubtestFormOpen} onOpenChange={setIsSubtestFormOpen} existingCodes={patterns.map(p => p.patternCode)} onSubmit={handleCreate} />
    </div>
  );
}
