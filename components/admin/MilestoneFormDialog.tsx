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
import type { AdminMilestone } from "@/lib/types";

export interface MilestoneFormData {
  name: string;
  description: string;
  imageUrl: string;
  xpThreshold: number;
  isActive: boolean;
}

interface MilestoneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MilestoneFormData) => Promise<void>;
  initialData?: AdminMilestone | null;
  mode: "create" | "edit";
}

function MilestoneFormContent({
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: Omit<MilestoneFormDialogProps, "open">) {
  const [name, setName] = useState(
    mode === "edit" && initialData ? initialData.name : ""
  );
  const [description, setDescription] = useState(
    mode === "edit" && initialData ? initialData.description : ""
  );
  const [imageUrl, setImageUrl] = useState(
    mode === "edit" && initialData ? initialData.imageUrl : ""
  );
  const [xpThreshold, setXpThreshold] = useState(
    mode === "edit" && initialData ? initialData.xpThreshold : 1000
  );
  const [isActive, setIsActive] = useState(
    mode === "edit" && initialData ? initialData.isActive : true
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Nama milestone wajib diisi";
    } else if (name.trim().length > 50) {
      newErrors.name = "Nama milestone maksimal 50 karakter";
    }

    if (!description.trim()) {
      newErrors.description = "Deskripsi wajib diisi";
    } else if (description.trim().length > 200) {
      newErrors.description = "Deskripsi maksimal 200 karakter";
    }

    if (!imageUrl.trim()) {
      newErrors.imageUrl = "URL gambar badge wajib diisi";
    }

    if (!xpThreshold || xpThreshold <= 0) {
      newErrors.xpThreshold = "XP Threshold harus lebih dari 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setApiError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        xpThreshold,
        isActive,
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
        <label htmlFor="milestone-name" className="text-sm font-medium text-foreground">
          Nama Milestone <span className="text-red-500">*</span>
        </label>
        <input
          id="milestone-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          placeholder="Contoh: Penjelajah, Ahli, Legenda"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "milestone-name-error" : undefined}
        />
        {errors.name && (
          <p id="milestone-name-error" className="text-xs text-red-600">{errors.name}</p>
        )}
        <p className="text-xs text-muted-foreground">{name.length}/50 karakter</p>
      </div>

      {/* Description Field */}
      <div className="space-y-1.5">
        <label htmlFor="milestone-description" className="text-sm font-medium text-foreground">
          Deskripsi <span className="text-red-500">*</span>
        </label>
        <textarea
          id="milestone-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 resize-none"
          placeholder="Deskripsi yang tampil saat siswa meraih milestone ini"
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "milestone-desc-error" : undefined}
        />
        {errors.description && (
          <p id="milestone-desc-error" className="text-xs text-red-600">{errors.description}</p>
        )}
        <p className="text-xs text-muted-foreground">{description.length}/200 karakter</p>
      </div>

      {/* XP Threshold Field */}
      <div className="space-y-1.5">
        <label htmlFor="milestone-xp" className="text-sm font-medium text-foreground">
          XP Threshold <span className="text-red-500">*</span>
        </label>
        <input
          id="milestone-xp"
          type="number"
          min={1}
          value={xpThreshold}
          onChange={(e) => setXpThreshold(Number(e.target.value))}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          placeholder="Contoh: 1000"
          aria-invalid={!!errors.xpThreshold}
          aria-describedby={errors.xpThreshold ? "milestone-xp-error" : undefined}
        />
        {errors.xpThreshold && (
          <p id="milestone-xp-error" className="text-xs text-red-600">{errors.xpThreshold}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Jumlah total XP yang harus dicapai siswa untuk mendapatkan badge milestone ini
        </p>
      </div>

      {/* Image URL Field */}
      <div className="space-y-1.5">
        <label htmlFor="milestone-image" className="text-sm font-medium text-foreground">
          URL Gambar Badge <span className="text-red-500">*</span>
        </label>
        <input
          id="milestone-image"
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          placeholder="/badges/nama-badge.png"
          aria-invalid={!!errors.imageUrl}
          aria-describedby={errors.imageUrl ? "milestone-image-error" : undefined}
        />
        {errors.imageUrl && (
          <p id="milestone-image-error" className="text-xs text-red-600">{errors.imageUrl}</p>
        )}
        {imageUrl && (
          <div className="mt-2 flex items-center gap-2">
            <img
              src={imageUrl}
              alt="Preview badge"
              className="h-10 w-10 rounded-md object-cover border border-border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-xs text-muted-foreground">Preview</span>
          </div>
        )}
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3">
        <input
          id="milestone-active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
        />
        <label htmlFor="milestone-active" className="text-sm font-medium text-foreground">
          Milestone aktif (tampil di halaman siswa)
        </label>
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

export function MilestoneFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: MilestoneFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="milestone-form-desc" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Milestone" : "Ubah Milestone"}
          </DialogTitle>
          <DialogDescription id="milestone-form-desc">
            {mode === "create"
              ? "Buat milestone baru. Siswa akan mendapat badge saat XP mereka mencapai threshold."
              : "Ubah data milestone yang sudah ada."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <MilestoneFormContent
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
