'use client';

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { validateOverrideReason, validateOverrideScore } from '@/lib/utils/validation';
import type { ChapterStatus, OverrideAction, AuditLogEntry } from '@/lib/types';
import { isOverrideAllowed } from '@/lib/utils/chapterStatus';
import { Clock } from 'lucide-react';

// --- OverrideForm Props ---

export interface OverrideFormProps {
  student: { id: string; name: string };
  chapter: { id: string; name: string };
  currentStatus: ChapterStatus;
  onConfirm: (data: { action: OverrideAction; reason: string; score?: number }) => Promise<void>;
  onCancel: () => void;
}

// --- OverrideForm Dialog Component ("Penyesuaian Nilai") ---

export function OverrideForm({
  student,
  chapter,
  currentStatus,
  onConfirm,
  onCancel,
}: OverrideFormProps) {
  const [reason, setReason] = useState('');
  const [score, setScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = currentStatus === 'COMPLETED';

  const reasonValidation = useMemo(() => validateOverrideReason(reason), [reason]);
  const scoreValidation = useMemo(() => validateOverrideScore(score, true), [score]);

  const canSubmit =
    reasonValidation.valid &&
    scoreValidation.valid &&
    !isSubmitting &&
    !isDisabled;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm({
        action: 'FORCE_COMPLETE',
        reason,
        score: Number(score),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal melakukan penyesuaian. Silakan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, onConfirm, reason, score]);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent aria-labelledby="override-dialog-title">
        <DialogHeader>
          <DialogTitle id="override-dialog-title">
            Penyesuaian Nilai
          </DialogTitle>
          <DialogDescription>
            Luluskan Chapter ini untuk siswa dengan skor yang ditentukan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Student & Chapter Info */}
          <div className="rounded-md border border-border bg-muted/50 p-3 space-y-1 text-sm">
            <p>
              <span className="font-medium text-muted-foreground">Siswa:</span>{' '}
              <span className="font-semibold">{student.name}</span>
            </p>
            <p>
              <span className="font-medium text-muted-foreground">Chapter:</span>{' '}
              <span className="font-semibold">{chapter.name}</span>
            </p>
            <p>
              <span className="font-medium text-muted-foreground">Status saat ini:</span>{' '}
              <span className="font-semibold">{currentStatus}</span>
            </p>
          </div>

          {/* Disabled warning for COMPLETED status */}
          {isDisabled && (
            <p className="text-sm text-muted-foreground bg-muted rounded-md p-2">
              Chapter ini sudah berstatus COMPLETED. Penyesuaian tidak diperlukan.
            </p>
          )}

          {/* Score field */}
          <div className="space-y-1.5">
            <label
              htmlFor="override-score"
              className="text-sm font-medium text-foreground"
            >
              Skor yang diberikan <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="override-score"
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                disabled={isDisabled || isSubmitting}
                placeholder="0–100"
                className="h-10 w-24 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50"
                aria-describedby="score-hint score-error"
                aria-invalid={score !== '' && !scoreValidation.valid}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            {score !== '' && scoreValidation.errors.score && (
              <p id="score-error" className="text-xs text-destructive" role="alert">
                {scoreValidation.errors.score}
              </p>
            )}
            <p id="score-hint" className="text-xs text-muted-foreground">
              Nilai yang akan dicatat sebagai skor kuis siswa
            </p>
          </div>

          {/* Reason field */}
          <div className="space-y-1.5">
            <label
              htmlFor="override-reason"
              className="text-sm font-medium text-foreground"
            >
              Alasan <span className="text-destructive">*</span>
            </label>
            <textarea
              id="override-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isDisabled || isSubmitting}
              placeholder="Jelaskan alasan penyesuaian (minimal 10 karakter)..."
              rows={3}
              maxLength={500}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50 resize-none"
              aria-describedby="reason-hint reason-error"
              aria-invalid={reason.length > 0 && !reasonValidation.valid}
            />
            <div className="flex items-center justify-between">
              <div>
                {reason.length > 0 && reasonValidation.errors.reason && (
                  <p id="reason-error" className="text-xs text-destructive" role="alert">
                    {reasonValidation.errors.reason}
                  </p>
                )}
              </div>
              <p id="reason-hint" className="text-xs text-muted-foreground">
                {reason.length}/500
              </p>
            </div>
          </div>

          {/* API Error */}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md p-2" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Konfirmasi penyesuaian"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" aria-hidden="true" />
                Memproses...
              </>
            ) : (
              'Konfirmasi Penyesuaian'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Audit Log Table Component ---

export interface AuditLogTableProps {
  entries?: AuditLogEntry[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function AuditLogTable({
  entries,
  isLoading = false,
  error = null,
  onRetry,
}: AuditLogTableProps) {
  // Sort entries by createdAt descending (newest first)
  const sortedEntries = useMemo(() => {
    if (!entries || !Array.isArray(entries)) return [];
    return [...entries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [entries]);

  if (isLoading) {
    return (
      <div className="space-y-3" role="status" aria-label="Memuat riwayat penyesuaian...">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="h-10 flex-1 rounded-md bg-muted" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-2">
        <p className="text-sm text-destructive">{error}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Coba Lagi
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm" role="table">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-foreground" scope="col">
              Admin
            </th>
            <th className="px-4 py-3 text-left font-medium text-foreground" scope="col">
              Siswa
            </th>
            <th className="px-4 py-3 text-left font-medium text-foreground" scope="col">
              Chapter
            </th>
            <th className="px-4 py-3 text-left font-medium text-foreground" scope="col">
              Skor
            </th>
            <th className="px-4 py-3 text-left font-medium text-foreground" scope="col">
              Alasan
            </th>
            <th className="px-4 py-3 text-left font-medium text-foreground" scope="col">
              Waktu
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedEntries.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                Belum ada riwayat penyesuaian.
              </td>
            </tr>
          ) : (
            sortedEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-accent/50 transition-colors">
                <td className="px-4 py-3">{entry.adminName}</td>
                <td className="px-4 py-3">{entry.studentName}</td>
                <td className="px-4 py-3">{entry.chapterName}</td>
                <td className="px-4 py-3 font-medium">
                  {entry.score != null ? `${entry.score}%` : '—'}
                </td>
                <td className="px-4 py-3 max-w-[200px] truncate" title={entry.reason}>
                  {entry.reason}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatTimestamp(entry.createdAt)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// --- Helper: Format timestamp for display ---

function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}
