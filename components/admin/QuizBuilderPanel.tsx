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
import { validatePatternCode } from "@/lib/utils/validation";
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

function PatternFormDialog({
  open,
  onOpenChange,
  existingCodes,
  onSubmit,
}: PatternFormDialogProps) {
  const [patternCode, setPatternCode] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validate patternCode
    const codeValidation = validatePatternCode(patternCode, existingCodes);
    // Validate description (max 200 chars)
    const descErrors: Record<string, string> = {};
    if (description.length > 200) {
      descErrors.description = "Deskripsi maksimal 200 karakter";
    }

    const allErrors = { ...codeValidation.errors, ...descErrors };
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ patternCode, description });
      // Reset form only on success
      setPatternCode("");
      setDescription("");
      setErrors({});
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan pola soal";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setPatternCode("");
      setDescription("");
      setErrors({});
      setApiError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Buat Pola Baru</DialogTitle>
          <DialogDescription>
            Buat pola soal (QuestionPattern) untuk chapter ini.
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

          {/* Pattern Code */}
          <div className="space-y-1.5">
            <label htmlFor="patternCode" className="text-sm font-medium">
              Kode Pola <span className="text-red-500">*</span>
            </label>
            <input
              id="patternCode"
              type="text"
              value={patternCode}
              onChange={(e) => setPatternCode(e.target.value)}
              maxLength={50}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              placeholder="Contoh: POLA-01"
              aria-invalid={!!errors.code}
              aria-describedby={errors.code ? "patternCode-error" : undefined}
            />
            {errors.code && (
              <p id="patternCode-error" className="text-xs text-red-600">
                {errors.code}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {patternCode.length}/50 karakter
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="patternDescription" className="text-sm font-medium">
              Deskripsi
            </label>
            <textarea
              id="patternDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 resize-none"
              placeholder="Deskripsi pola soal (opsional)"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-xs text-red-600">
                {errors.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {description.length}/200 karakter
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
    correctOptionIndex: number;
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
    correctOptionIndex: number;
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
      {/* Header with back button */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Kembali
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">{pattern.patternCode}</h3>
            <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
              {questions.length} soal
            </span>
          </div>
          {pattern.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{pattern.description}</p>
          )}
        </div>
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
              className="rounded-lg border border-border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                {/* Question number badge */}
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold shrink-0 mt-0.5">
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
                          (+{question.options.length - 1} opsi lain)
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
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
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold">Pola Soal</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola pola dan bank soal untuk chapter ini
          </p>
        </div>
        <Button onClick={() => setIsPatternFormOpen(true)} className="shadow-sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Buat Pola Baru
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
        <div className="space-y-3" role="status" aria-label="Memuat pola soal...">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : patterns.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-10 text-center">
          <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Belum ada pola soal</p>
          <p className="text-xs text-muted-foreground mt-1">
            Klik tombol &quot;Buat Pola Baru&quot; untuk membuat pola soal pertama.
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
              aria-label={`Lihat soal pola ${pattern.patternCode}`}
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
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-mono font-medium text-gray-700">
                      {pattern.patternCode}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                      {pattern.questionCount} soal
                    </span>
                  </div>
                  {pattern.description && (
                    <p className="text-sm text-muted-foreground mt-1.5 truncate">
                      {pattern.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(pattern);
                    }}
                    aria-label={`Hapus pola ${pattern.patternCode}`}
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
        title="Hapus Pola Soal"
        description={`Apakah Anda yakin ingin menghapus pola "${deleteTarget?.patternCode ?? ""}"? Seluruh soal di dalamnya juga akan terhapus.`}
        onConfirm={handleDeletePattern}
        isDeleting={isDeleting}
      />
    </div>
  );
}
