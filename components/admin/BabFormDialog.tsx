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
import type { Bab } from "@/lib/types";

export interface BabFormData {
  name: string;
  orderIndex: number;
}

interface BabFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BabFormData) => Promise<void>;
  initialData?: Bab | null;
  mode: "create" | "edit";
}

function BabFormContent({
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: Omit<BabFormDialogProps, "open">) {
  const [name, setName] = useState(mode === "edit" && initialData ? initialData.name : "");
  const [orderIndex, setOrderIndex] = useState(
    mode === "edit" && initialData ? initialData.orderIndex : 0
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name || name.trim().length === 0) {
      errs.name = "Nama bab wajib diisi";
    } else if (name.length > 100) {
      errs.name = "Nama bab maksimal 100 karakter";
    }
    if (orderIndex < 0) {
      errs.orderIndex = "Urutan harus bernilai positif";
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
      await onSubmit({ name: name.trim(), orderIndex });
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
          htmlFor="bab-name"
          className="text-sm font-medium text-foreground"
        >
          Nama Bab <span className="text-red-500">*</span>
        </label>
        <input
          id="bab-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          placeholder="Masukkan nama bab"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "bab-name-error" : undefined}
        />
        {errors.name && (
          <p id="bab-name-error" className="text-xs text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      {/* Order Index Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="bab-order"
          className="text-sm font-medium text-foreground"
        >
          Urutan <span className="text-red-500">*</span>
        </label>
        <input
          id="bab-order"
          type="number"
          value={orderIndex}
          onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)}
          min={0}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          aria-invalid={!!errors.orderIndex}
          aria-describedby={
            errors.orderIndex ? "bab-order-error" : undefined
          }
        />
        {errors.orderIndex && (
          <p id="bab-order-error" className="text-xs text-red-600">
            {errors.orderIndex}
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

export function BabFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: BabFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="bab-form-desc">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Bab" : "Ubah Bab"}
          </DialogTitle>
          <DialogDescription id="bab-form-desc">
            {mode === "create"
              ? "Isi data untuk membuat Bab baru."
              : "Ubah data Bab yang sudah ada."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <BabFormContent
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
