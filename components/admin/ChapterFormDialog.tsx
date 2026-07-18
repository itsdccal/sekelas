"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Chapter } from "@/lib/types";

export interface ChapterFormData {
  name: string;
  orderIndex: number;
  videoUrl: string;
  passingGrade: number;
}

interface ChapterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ChapterFormData) => Promise<void>;
  initialData?: Chapter | null;
  mode: "create" | "edit";
}

function ChapterFormContent({
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: Omit<ChapterFormDialogProps, "open">) {
  const [name, setName] = useState(mode === "edit" && initialData ? initialData.name : "");
  const [orderIndex, setOrderIndex] = useState(
    mode === "edit" && initialData ? initialData.orderIndex : 0
  );
  const [videoUrl, setVideoUrl] = useState(
    mode === "edit" && initialData ? initialData.videoUrl : ""
  );
  const [passingGrade, setPassingGrade] = useState(
    mode === "edit" && initialData ? initialData.passingGrade : 70
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name || name.trim().length === 0) {
      errs.name = "Nama chapter wajib diisi";
    } else if (name.length > 100) {
      errs.name = "Nama chapter maksimal 100 karakter";
    }
    if (orderIndex < 0) {
      errs.orderIndex = "Urutan harus bernilai positif";
    }
    if (passingGrade < 0 || passingGrade > 100) {
      errs.passingGrade = "Passing grade harus antara 0-100";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setApiError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        orderIndex,
        videoUrl: videoUrl.trim(),
        passingGrade,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
          aria-live="polite"
        >
          {apiError}
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="chapter-name"
          className="text-sm font-medium text-foreground"
        >
          Nama Chapter <span className="text-red-500">*</span>
        </label>
        <input
          id="chapter-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          placeholder="Masukkan nama chapter"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "chapter-name-error" : undefined}
        />
        {errors.name && (
          <p id="chapter-name-error" className="text-xs text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      {/* Order Index Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="chapter-order"
          className="text-sm font-medium text-foreground"
        >
          Urutan (Order Index) <span className="text-red-500">*</span>
        </label>
        <input
          id="chapter-order"
          type="number"
          value={orderIndex}
          onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)}
          min={0}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          aria-invalid={!!errors.orderIndex}
          aria-describedby={
            errors.orderIndex ? "chapter-order-error" : undefined
          }
        />
        {errors.orderIndex && (
          <p id="chapter-order-error" className="text-xs text-red-600">
            {errors.orderIndex}
          </p>
        )}
      </div>

      {/* Video URL / Upload field */}
      <div className="space-y-1.5">
        <label
          htmlFor="chapter-video"
          className="text-sm font-medium text-foreground"
        >
          Video URL
        </label>
        <input
          id="chapter-video"
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          placeholder="URL video (opsional — upload terpisah)"
        />
        <p className="text-xs text-muted-foreground">
          Upload video dapat dilakukan setelah Chapter dibuat.
        </p>
      </div>

      {/* Passing Grade */}
      <div className="space-y-1.5">
        <label
          htmlFor="chapter-passing-grade"
          className="text-sm font-medium text-foreground"
        >
          Passing Grade (%)
        </label>
        <input
          id="chapter-passing-grade"
          type="number"
          value={passingGrade}
          onChange={(e) =>
            setPassingGrade(parseInt(e.target.value, 10) || 0)
          }
          min={0}
          max={100}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          aria-invalid={!!errors.passingGrade}
          aria-describedby={
            errors.passingGrade ? "chapter-grade-error" : undefined
          }
        />
        {errors.passingGrade && (
          <p id="chapter-grade-error" className="text-xs text-red-600">
            {errors.passingGrade}
          </p>
        )}
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
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ChapterFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: ChapterFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="chapter-form-desc" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Chapter" : "Ubah Chapter"}
          </DialogTitle>
          <DialogDescription id="chapter-form-desc">
            {mode === "create"
              ? "Isi data untuk membuat Chapter baru."
              : "Ubah data Chapter yang sudah ada."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <ChapterFormContent
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
            initialData={initialData}
            mode={mode}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
