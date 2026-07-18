"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { validateQuestion } from "@/lib/utils/validation";
import type { Question } from "@/lib/types";

// --- Props ---

export interface QuestionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    text: string;
    options: { text: string; order: number }[];
    correctOptionIndex: number;
  }) => Promise<void>;
  /** If provided, the form is in edit mode with pre-filled data */
  initialData?: Question;
}

// --- Constants ---

const MIN_OPTIONS = 4;
const MAX_OPTIONS = 6;

// --- QuestionForm Component ---

export function QuestionForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: QuestionFormProps) {
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Initialize form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Edit mode: pre-fill with existing data
        setText(initialData.text);
        const sortedOptions = [...initialData.options].sort(
          (a, b) => a.order - b.order
        );
        setOptions(sortedOptions.map((opt) => opt.text));
        // Find correct option index
        if (initialData.correctOptionId) {
          const correctIdx = sortedOptions.findIndex(
            (opt) => opt.id === initialData.correctOptionId
          );
          setCorrectOptionIndex(correctIdx >= 0 ? correctIdx : null);
        } else {
          setCorrectOptionIndex(null);
        }
      } else {
        // Create mode: reset
        setText("");
        setOptions(["", "", "", ""]);
        setCorrectOptionIndex(null);
      }
      setErrors({});
      setApiError(null);
    }
  }, [open, initialData]);

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddOption = () => {
    if (options.length < MAX_OPTIONS) {
      setOptions((prev) => [...prev, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
    // Adjust correctOptionIndex if needed
    if (correctOptionIndex !== null) {
      if (correctOptionIndex === index) {
        setCorrectOptionIndex(null);
      } else if (correctOptionIndex > index) {
        setCorrectOptionIndex(correctOptionIndex - 1);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validate using the utility
    const correctOptionValue =
      correctOptionIndex !== null ? String(correctOptionIndex) : null;
    const validation = validateQuestion(text, options, correctOptionValue);

    setErrors(validation.errors);
    if (!validation.valid) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        text,
        options: options.map((optText, idx) => ({
          text: optText,
          order: idx + 1,
        })),
        correctOptionIndex: correctOptionIndex!,
      });
      // Close on success
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan soal";
      setApiError(message);
      // Form data is preserved on failure
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = !!initialData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Soal" : "Tambah Soal"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Ubah teks soal, opsi jawaban, dan jawaban benar."
              : "Buat soal baru dengan minimal 4 opsi jawaban dan pilih satu jawaban benar."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* API Error */}
          {apiError && (
            <div
              className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200"
              role="alert"
              aria-live="polite"
            >
              {apiError}
            </div>
          )}

          {/* Question Text */}
          <div className="space-y-1.5">
            <label htmlFor="questionText" className="text-sm font-medium">
              Teks Soal <span className="text-red-500">*</span>
            </label>
            <textarea
              id="questionText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 resize-none"
              placeholder="Tulis pertanyaan di sini..."
              aria-invalid={!!errors.text}
              aria-describedby={errors.text ? "questionText-error" : undefined}
            />
            {errors.text && (
              <p id="questionText-error" className="text-xs text-red-600">
                {errors.text}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {text.length}/1000 karakter
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Opsi Jawaban <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-muted-foreground">
                {options.length}/{MAX_OPTIONS} opsi
              </span>
            </div>

            {errors.options && (
              <p className="text-xs text-red-600" role="alert">
                {errors.options}
              </p>
            )}

            <div className="space-y-2">
              {options.map((optionText, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  {/* Radio for correct answer */}
                  <div className="flex items-center pt-2.5">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctOptionIndex === idx}
                      onChange={() => setCorrectOptionIndex(idx)}
                      className="h-4 w-4 accent-primary-600 cursor-pointer"
                      aria-label={`Tandai opsi ${idx + 1} sebagai jawaban benar`}
                    />
                  </div>

                  {/* Option text input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={optionText}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      maxLength={500}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                      placeholder={`Opsi ${idx + 1}`}
                      aria-label={`Teks opsi ${idx + 1}`}
                    />
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {optionText.length}/500
                    </p>
                  </div>

                  {/* Remove option button (only if > MIN_OPTIONS) */}
                  {options.length > MIN_OPTIONS && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 mt-0.5"
                      onClick={() => handleRemoveOption(idx)}
                      aria-label={`Hapus opsi ${idx + 1}`}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Add option button */}
            {options.length < MAX_OPTIONS && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="w-full"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Tambah Opsi
              </Button>
            )}

            {/* Correct option error */}
            {errors.correctOption && (
              <p className="text-xs text-red-600" role="alert">
                {errors.correctOption}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Pilih radio di sebelah kiri untuk menandai jawaban benar.
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
              {isEditMode ? "Simpan Perubahan" : "Simpan Soal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
