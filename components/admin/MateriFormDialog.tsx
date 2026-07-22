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
import { validateSubject } from "@/lib/utils/validation";
import type { Subject } from "@/lib/types";

export interface MateriFormData {
  name: string;
  description: string;
}

interface MateriFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MateriFormData) => Promise<void>;
  initialData?: Subject | null;
  mode: "create" | "edit";
}

function MateriFormContent({
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: Omit<MateriFormDialogProps, "open">) {
  const [name, setName] = useState(mode === "edit" && initialData ? initialData.name : "");
  const [description, setDescription] = useState(
    mode === "edit" && initialData ? (initialData.description ?? "") : ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSubject(name, description || undefined);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setApiError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
      onOpenChange(false);
    } catch (err: unknown) {
      // Preserve form data on API error (Req 10.9)
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
          htmlFor="Subject-name"
          className="text-sm font-medium text-foreground"
        >
          Nama Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="Subject-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          placeholder="Masukkan nama Subject"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "Subject-name-error" : undefined}
        />
        {errors.name && (
          <p id="Subject-name-error" className="text-xs text-red-600">
            {errors.name}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {name.length}/100 karakter
        </p>
      </div>

      {/* Description Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="Subject-description"
          className="text-sm font-medium text-foreground"
        >
          Deskripsi
        </label>
        <textarea
          id="Subject-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 resize-none"
          placeholder="Masukkan deskripsi (opsional)"
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? "Subject-desc-error" : undefined
          }
        />
        {errors.description && (
          <p id="Subject-desc-error" className="text-xs text-red-600">
            {errors.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {description.length}/500 karakter
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
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function MateriFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: MateriFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="Subject-form-desc">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Subject" : "Ubah Subject"}
          </DialogTitle>
          <DialogDescription id="Subject-form-desc">
            {mode === "create"
              ? "Isi data untuk membuat Subject baru."
              : "Ubah data Subject yang sudah ada."}
          </DialogDescription>
        </DialogHeader>

        {/* Key-based reset: re-mount form content when dialog opens */}
        {open && (
          <MateriFormContent
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
