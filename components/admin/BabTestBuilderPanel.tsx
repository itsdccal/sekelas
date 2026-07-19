"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ChevronRight, Loader2, FileQuestion, ClipboardList, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QuestionForm } from "./QuestionForm";
import { adminApi } from "@/lib/api";
import type { QuestionPattern, Question, QuizType } from "@/lib/types";

// --- Props ---

export interface BabTestBuilderPanelProps {
  babId: string;
  quizType: 'PRE_TEST' | 'POST_TEST';
}

const TYPE_LABELS: Record<string, string> = {
  PRE_TEST: 'Pre Test',
  POST_TEST: 'Post Test',
};

// --- Config Panel ---

interface TestConfigProps {
  quizType: 'PRE_TEST' | 'POST_TEST';
  passingGrade: number;
  questionsPerSession: number;
  onPassingGradeChange: (val: number) => void;
  onQuestionsPerSessionChange: (val: number) => void;
}

function TestConfigPanel({
  quizType,
  passingGrade,
  questionsPerSession,
  onPassingGradeChange,
  onQuestionsPerSessionChange,
}: TestConfigProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Pengaturan {TYPE_LABELS[quizType]}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Questions per session */}
        <div className="space-y-1.5">
          <label htmlFor="questionsPerSession" className="text-xs font-medium text-muted-foreground">
            Jumlah Soal Tampil
          </label>
          <div className="flex items-center gap-2">
            <input
              id="questionsPerSession"
              type="number"
              min={1}
              max={50}
              value={questionsPerSession}
              onChange={(e) => onQuestionsPerSessionChange(Math.max(1, Math.min(50, parseInt(e.target.value) || 5)))}
              className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm text-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1"
            />
            <span className="text-xs text-muted-foreground">soal per sesi (1 dari tiap topik)</span>
          </div>
        </div>

        {/* Passing grade (Post Test only) */}
        {quizType === 'POST_TEST' && (
          <div className="space-y-1.5">
            <label htmlFor="passingGrade" className="text-xs font-medium text-muted-foreground">
              Batas Kelulusan
            </label>
            <div className="flex items-center gap-2">
              <input
                id="passingGrade"
                type="number"
                min={0}
                max={100}
                value={passingGrade}
                onChange={(e) => onPassingGradeChange(Math.max(0, Math.min(100, parseInt(e.target.value) || 70)))}
                className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm text-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1"
              />
              <span className="text-xs text-muted-foreground">% minimum untuk lulus</span>
            </div>
          </div>
        )}
      </div>

      {quizType === 'PRE_TEST' && (
        <p className="text-xs text-muted-foreground italic">
          Pre Test tidak memiliki batas kelulusan — hasilnya berupa penempatan chapter berdasarkan jawaban benar.
        </p>
      )}
    </div>
  );
}

// --- Topic Form Dialog ---

interface TopicFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCodes: string[];
  onSubmit: (data: { patternCode: string; description: string }) => Promise<void>;
}

function generatePatternCode(name: string, existingCodes: string[]): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40);

  if (!base) return `topik-${Date.now()}`;

  let code = base;
  let counter = 2;
  while (existingCodes.includes(code)) {
    code = `${base}-${counter}`;
    counter++;
  }
  return code;
}

function TopicFormDialog({ open, onOpenChange, existingCodes, onSubmit }: TopicFormDialogProps) {
  const [topicName, setTopicName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const trimmedName = topicName.trim();
    const newErrors: Record<string, string> = {};
    if (!trimmedName) newErrors.topicName = "Nama topik wajib diisi";
    else if (trimmedName.length > 100) newErrors.topicName = "Maksimal 100 karakter";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const patternCode = generatePatternCode(trimmedName, existingCodes);

    setIsSubmitting(true);
    try {
      await onSubmit({ patternCode, description: trimmedName });
      setTopicName("");
      setErrors({});
      onOpenChange(false);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Gagal menyimpan topik");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (open) { setTopicName(""); setErrors({}); setApiError(null); }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Buat Topik Baru</DialogTitle>
          <DialogDescription>
            Setiap topik berisi variasi soal. Sistem mengambil 1 soal acak dari tiap topik saat tes berlangsung.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {apiError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200" role="alert">{apiError}</div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="topicName" className="text-sm font-medium">
              Nama Topik <span className="text-red-500">*</span>
            </label>
            <input
              id="topicName"
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              maxLength={100}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              placeholder="Contoh: Persamaan Linear Satu Variabel"
              aria-invalid={!!errors.topicName}
            />
            {errors.topicName && <p className="text-xs text-red-600">{errors.topicName}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Delete Confirm ---

function DeleteConfirmDialog({ open, onOpenChange, title, description, onConfirm, isDeleting }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string; onConfirm: () => void; isDeleting?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent role="alertdialog">
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>Batal</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />} Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Question List View ---

function QuestionListView({ pattern, quizType, onBack, onRefreshPatterns }: {
  pattern: QuestionPattern; quizType: QuizType; onBack: () => void; onRefreshPatterns: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { setQuestions(await adminApi.getQuestions(pattern.id)); }
    catch { setError("Gagal memuat soal"); }
    finally { setIsLoading(false); }
  }, [pattern.id]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleCreate = async (data: { text: string; options: { text: string; order: number }[]; correctOptionIndex: number | null; xpPerQuestion: number; }) => {
    await adminApi.createQuestion({ patternId: pattern.id, ...data });
    await fetchQuestions(); onRefreshPatterns();
  };

  const handleUpdate = async (data: { text: string; options: { text: string; order: number }[]; correctOptionIndex: number | null; xpPerQuestion: number; }) => {
    if (!editingQuestion) return;
    await adminApi.updateQuestion(editingQuestion.id, data);
    await fetchQuestions(); setEditingQuestion(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try { await adminApi.deleteQuestion(deleteTarget.id); await fetchQuestions(); onRefreshPatterns(); setDeleteTarget(null); }
    catch { setError("Gagal menghapus soal"); }
    finally { setIsDeleting(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <Button variant="outline" size="sm" onClick={onBack}>← Kembali</Button>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">{pattern.description || pattern.patternCode}</h3>
            <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">{questions.length} soal</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setIsFormOpen(true)} className="shadow-sm">
          <Plus className="h-4 w-4" /> Tambah Soal
        </Button>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200" role="alert">{error}</div>}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-10 text-center">
          <FileQuestion className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Belum ada soal dalam topik ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-lg border border-border bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{q.text}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted-foreground">{q.options.length} opsi</span>
                    {q.xpPerQuestion != null && q.xpPerQuestion > 0 && (
                      <span className="text-xs text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded">⚡ {q.xpPerQuestion} XP</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="default" size="sm" onClick={() => { setEditingQuestion(q); setIsFormOpen(true); }}>Ubah</Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(q)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <QuestionForm
        open={isFormOpen}
        onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingQuestion(null); }}
        onSubmit={editingQuestion ? handleUpdate : handleCreate}
        initialData={editingQuestion ?? undefined}
        quizType={quizType}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Hapus Soal"
        description="Soal ini akan dihapus permanen. Lanjutkan?"
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

// --- Main BabTestBuilderPanel ---

export function BabTestBuilderPanel({ babId, quizType }: BabTestBuilderPanelProps) {
  const [patterns, setPatterns] = useState<QuestionPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTopicFormOpen, setIsTopicFormOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<QuestionPattern | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestionPattern | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Config state
  const [passingGrade, setPassingGrade] = useState(70);
  const [questionsPerSession, setQuestionsPerSession] = useState(5);

  const fetchPatterns = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { setPatterns(await adminApi.getPatterns(babId)); }
    catch { setError("Gagal memuat daftar topik soal"); }
    finally { setIsLoading(false); }
  }, [babId]);

  useEffect(() => { fetchPatterns(); }, [fetchPatterns]);

  const existingCodes = patterns.map((p) => p.patternCode);
  const totalQuestions = patterns.reduce((sum, p) => sum + p.questionCount, 0);
  const totalXP = quizType === 'POST_TEST' ? patterns.reduce((sum, p) => sum + p.questionCount * 50, 0) : 0; // Estimate

  const handleCreatePattern = async (data: { patternCode: string; description: string }) => {
    await adminApi.createPattern({ chapterId: babId, patternCode: data.patternCode, description: data.description });
    await fetchPatterns();
  };

  const handleDeletePattern = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try { await adminApi.deletePattern(deleteTarget.id); await fetchPatterns(); setDeleteTarget(null); }
    catch { setError("Gagal menghapus topik"); }
    finally { setIsDeleting(false); }
  };

  if (selectedPattern) {
    return (
      <QuestionListView
        pattern={selectedPattern}
        quizType={quizType}
        onBack={() => setSelectedPattern(null)}
        onRefreshPatterns={fetchPatterns}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold">Topik Soal {TYPE_LABELS[quizType]}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola topik dan soal untuk {TYPE_LABELS[quizType]} pada bab ini
          </p>
        </div>
        <Button onClick={() => setIsTopicFormOpen(true)} className="shadow-sm">
          <Plus className="h-4 w-4" /> Buat Topik Baru
        </Button>
      </div>

      {/* Config Panel */}
      <TestConfigPanel
        quizType={quizType}
        passingGrade={passingGrade}
        questionsPerSession={questionsPerSession}
        onPassingGradeChange={setPassingGrade}
        onQuestionsPerSessionChange={setQuestionsPerSession}
      />

      {/* Stats summary */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{patterns.length} topik</span>
        <span>•</span>
        <span>{totalQuestions} soal total</span>
        {quizType === 'POST_TEST' && (
          <>
            <span>•</span>
            <span>~{totalXP} XP potensial</span>
          </>
        )}
      </div>

      {/* Error */}
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200" role="alert">{error}</div>}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : patterns.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-10 text-center">
          <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Belum ada topik soal</p>
          <p className="text-xs text-muted-foreground mt-1">
            Buat topik pertama untuk mulai menambahkan soal {TYPE_LABELS[quizType]}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {patterns.map((pattern) => (
            <div
              key={pattern.id}
              className="rounded-lg border border-border bg-white border-l-4 border-l-primary-500 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setSelectedPattern(pattern)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedPattern(pattern); } }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{pattern.description || pattern.patternCode}</span>
                    <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">{pattern.questionCount} soal</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteTarget(pattern); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary-600 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TopicFormDialog open={isTopicFormOpen} onOpenChange={setIsTopicFormOpen} existingCodes={existingCodes} onSubmit={handleCreatePattern} />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Hapus Topik"
        description={`Hapus "${deleteTarget?.description || deleteTarget?.patternCode || ""}" beserta seluruh soalnya?`}
        onConfirm={handleDeletePattern}
        isDeleting={isDeleting}
      />
    </div>
  );
}
