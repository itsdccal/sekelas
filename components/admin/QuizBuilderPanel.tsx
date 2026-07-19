"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ChevronRight, Loader2, FileQuestion, ClipboardList } from "lucide-react";
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
import type { QuestionPattern, Question } from "@/lib/types";

// --- Props ---

export interface QuizBuilderPanelProps {
  chapterId: string;
}

// --- Pattern Form Dialog ---

interface PatternFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCodes: string[];
  onSubmit: (data: { patternCode: string; description: string }) => Promise<void>;
}

/**
 * Auto-generates a unique pattern code from the topic name.
 * e.g. "Persamaan Linear" → "persamaan-linear"
 * If duplicate, appends -2, -3, etc.
 */
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

function PatternFormDialog({
  open,
  onOpenChange,
  existingCodes,
  onSubmit,
}: PatternFormDialogProps) {
  const [topicName, setTopicName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validate topic name
    const newErrors: Record<string, string> = {};
    const trimmedName = topicName.trim();
    if (!trimmedName) {
      newErrors.topicName = "Nama topik wajib diisi";
    } else if (trimmedName.length > 100) {
      newErrors.topicName = "Nama topik maksimal 100 karakter";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Auto-generate pattern code from topic name
    const patternCode = generatePatternCode(trimmedName, existingCodes);

    setIsSubmitting(true);
    try {
      await onSubmit({ patternCode, description: trimmedName });
      // Reset form only on success
      setTopicName("");
      setErrors({});
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan topik soal";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTopicName("");
      setErrors({});
      setApiError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Buat Topik Baru</DialogTitle>
          <DialogDescription>
            Buat kelompok topik soal. Setiap topik berisi beberapa variasi soal yang akan diacak saat siswa mengerjakan kuis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {apiError && (
            <div
              className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200"
              role="alert"
              aria-live="polite"
            >
              {apiError}
            </div>
          )}

          {/* Topic Name */}
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
              aria-describedby={errors.topicName ? "topicName-error" : undefined}
            />
            {errors.topicName && (
              <p id="topicName-error" className="text-xs text-red-600">
                {errors.topicName}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Sistem akan mengambil 1 soal acak dari topik ini saat kuis berlangsung.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Delete Confirmation Dialog ---

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isDeleting,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent role="alertdialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Question List View ---

interface QuestionListViewProps {
  pattern: QuestionPattern;
  onBack: () => void;
  onRefreshPatterns: () => void;
}

function QuestionListView({ pattern, onBack, onRefreshPatterns }: QuestionListViewProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getQuestions(pattern.id);
      setQuestions(data);
    } catch {
      setError("Gagal memuat daftar soal");
    } finally {
      setIsLoading(false);
    }
  }, [pattern.id]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleCreateQuestion = async (data: {
    text: string;
    options: { text: string; order: number }[];
    correctOptionIndex: number | null;
    xpPerQuestion: number;
  }) => {
    await adminApi.createQuestion({
      patternId: pattern.id,
      ...data,
    });
    await fetchQuestions();
    onRefreshPatterns();
  };

  const handleUpdateQuestion = async (data: {
    text: string;
    options: { text: string; order: number }[];
    correctOptionIndex: number | null;
    xpPerQuestion: number;
  }) => {
    if (!editingQuestion) return;
    await adminApi.updateQuestion(editingQuestion.id, data);
    await fetchQuestions();
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteQuestion(deleteTarget.id);
      await fetchQuestions();
      onRefreshPatterns();
      setDeleteTarget(null);
    } catch {
      setError("Gagal menghapus soal");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-primary-600 hover:underline mb-1"
        >
          ← Kembali ke daftar topik
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm sm:text-base font-semibold truncate">{pattern.patternCode}</h3>
          <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
            {questions.length} soal
          </span>
        </div>
        {pattern.description && (
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{pattern.description}</p>
        )}
      </div>

      {/* Add question button */}
      <div className="flex justify-end">
        <Button onClick={() => setIsQuestionFormOpen(true)} className="shadow-sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah Soal
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div
          className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-3" role="status" aria-label="Memuat soal...">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-10 text-center">
          <FileQuestion className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Belum ada soal dalam pola ini</p>
          <p className="text-xs text-muted-foreground mt-1">
            Klik tombol &quot;Tambah Soal&quot; untuk menambahkan pertanyaan pertama.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, idx) => (
            <div
              key={question.id}
              className="rounded-lg border border-border bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                {/* Question number badge */}
                <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {question.text}
                  </p>
                  {/* Preview first option */}
                  {question.options.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-gray-100 text-[10px] font-medium text-gray-600 shrink-0">A</span>
                      <span className="truncate">{question.options[0].text}</span>
                      {question.options.length > 1 && (
                        <span className="text-muted-foreground/60 shrink-0">
                          (+{question.options.length - 1})
                        </span>
                      )}
                    </p>
                  )}
                  {/* Action buttons — below text on mobile */}
                  <div className="flex items-center gap-2 mt-2 sm:hidden">
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={() => {
                        setEditingQuestion(question);
                        setIsQuestionFormOpen(true);
                      }}
                      aria-label={`Edit soal ${idx + 1}`}
                    >
                      Ubah
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setDeleteTarget(question)}
                      aria-label={`Hapus soal ${idx + 1}`}
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                {/* Desktop action buttons */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setEditingQuestion(question);
                      setIsQuestionFormOpen(true);
                    }}
                    aria-label={`Edit soal ${idx + 1}`}
                  >
                    Ubah
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteTarget(question)}
                    aria-label={`Hapus soal ${idx + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Form Dialog */}
      <QuestionForm
        open={isQuestionFormOpen}
        onOpenChange={(open) => {
          setIsQuestionFormOpen(open);
          if (!open) setEditingQuestion(null);
        }}
        onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
        initialData={editingQuestion ?? undefined}
      />

      {/* Delete Question Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Hapus Soal"
        description="Apakah Anda yakin ingin menghapus soal ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDeleteQuestion}
        isDeleting={isDeleting}
      />
    </div>
  );
}

// --- Main QuizBuilderPanel ---

export function QuizBuilderPanel({ chapterId }: QuizBuilderPanelProps) {
  const [patterns, setPatterns] = useState<QuestionPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPatternFormOpen, setIsPatternFormOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<QuestionPattern | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestionPattern | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPatterns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getPatterns(chapterId);
      setPatterns(data);
    } catch {
      setError("Gagal memuat daftar pola soal");
    } finally {
      setIsLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  const existingCodes = patterns.map((p) => p.patternCode);

  const handleCreatePattern = async (data: {
    patternCode: string;
    description: string;
  }) => {
    await adminApi.createPattern({
      chapterId,
      patternCode: data.patternCode,
      description: data.description,
    });
    await fetchPatterns();
  };

  const handleDeletePattern = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminApi.deletePattern(deleteTarget.id);
      await fetchPatterns();
      setDeleteTarget(null);
    } catch {
      setError("Gagal menghapus pola soal");
    } finally {
      setIsDeleting(false);
    }
  };

  // If a pattern is selected, show question list
  if (selectedPattern) {
    return (
      <QuestionListView
        pattern={selectedPattern}
        onBack={() => setSelectedPattern(null)}
        onRefreshPatterns={fetchPatterns}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 pb-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold">Topik Soal</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Setiap topik berisi variasi soal yang akan diacak saat kuis
          </p>
        </div>
        <Button onClick={() => setIsPatternFormOpen(true)} className="shadow-sm w-full sm:w-auto">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Buat Topik Baru
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div
          className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-3" role="status" aria-label="Memuat topik soal...">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : patterns.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-10 text-center">
          <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Belum ada topik soal</p>
          <p className="text-xs text-muted-foreground mt-1">
            Klik tombol &quot;Buat Topik Baru&quot; untuk membuat topik soal pertama.
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
              aria-label={`Lihat soal topik ${pattern.description || pattern.patternCode}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedPattern(pattern);
                }
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-medium text-foreground">
                      {pattern.description || pattern.patternCode}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                      {pattern.questionCount} soal
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(pattern);
                    }}
                    aria-label={`Hapus topik ${pattern.description || pattern.patternCode}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <ChevronRight
                    className="h-5 w-5 text-muted-foreground group-hover:text-primary-600 transition-colors"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pattern Form Dialog */}
      <PatternFormDialog
        open={isPatternFormOpen}
        onOpenChange={setIsPatternFormOpen}
        existingCodes={existingCodes}
        onSubmit={handleCreatePattern}
      />

      {/* Delete Pattern Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Hapus Topik Soal"
        description={`Apakah Anda yakin ingin menghapus topik "${deleteTarget?.description || deleteTarget?.patternCode || ""}"? Seluruh soal di dalamnya juga akan terhapus.`}
        onConfirm={handleDeletePattern}
        isDeleting={isDeleting}
      />
    </div>
  );
}
