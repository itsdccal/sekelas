'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { validateOverrideReason } from '@/lib/utils/validation';
import { adminApi } from '@/lib/api';
import type { ChapterStatus, AuditLogEntry } from '@/lib/types';
import { isOverrideAllowed } from '@/lib/utils/chapterStatus';
import { Shield, Clock } from 'lucide-react';

// --- OverrideForm Props ---

export interface OverrideFormProps {
  student: { id: string; name: string };
  chapter: { id: string; name: string };
  currentStatus: ChapterStatus;
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
}

// --- OverrideForm Dialog Component ---

export function OverrideForm({
  student,
  chapter,
  currentStatus,
  onConfirm,
  onCancel,
}: OverrideFormProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = useMemo(() => validateOverrideReason(reason), [reason]);
  const isDisabled = currentStatus === 'COMPLETED';
  const canSubmit = validation.valid && !isSubmitting && !isDisabled;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(reason);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal melakukan override. Silakan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, onConfirm, reason]);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent aria-labelledby="override-dialog-title">
        <DialogHeader>
          <DialogTitle id="override-dialog-title">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-600" aria-hidden="true" />
              Override Mastery Gate
            </span>
          </DialogTitle>
          <DialogDescription>
            Override status Chapter menjadi COMPLETED untuk siswa ini.
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
              Chapter ini sudah berstatus COMPLETED. Override tidak diperlukan.
            </p>
          )}

          {/* Reason field */}
          <div className="space-y-1.5">
            <label
              htmlFor="override-reason"
              className="text-sm font-medium text-foreground"
            >
              Alasan Override <span className="text-destructive">*</span>
            </label>
            <textarea
              id="override-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isDisabled || isSubmitting}
              placeholder="Jelaskan alasan override (minimal 10 karakter)..."
              rows={4}
              maxLength={500}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50 resize-none"
              aria-describedby="reason-hint reason-error"
              aria-invalid={reason.length > 0 && !validation.valid}
            />
            <div className="flex items-center justify-between">
              <div>
                {reason.length > 0 && validation.errors.reason && (
                  <p id="reason-error" className="text-xs text-destructive" role="alert">
                    {validation.errors.reason}
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
            aria-label="Konfirmasi override"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" aria-hidden="true" />
                Memproses...
              </>
            ) : (
              'Konfirmasi Override'
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
      <div className="space-y-3" role="status" aria-label="Memuat audit log...">
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
                colSpan={5}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                Belum ada riwayat override.
              </td>
            </tr>
          ) : (
            sortedEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-accent/50 transition-colors">
                <td className="px-4 py-3">{entry.adminName}</td>
                <td className="px-4 py-3">{entry.studentName}</td>
                <td className="px-4 py-3">{entry.chapterName}</td>
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

// --- Combined Override Section Component ---
// This is a higher-level wrapper used by the override page to manage state.

export interface OverrideSectionProps {
  student: { id: string; name: string } | null;
  chapter: { id: string; name: string } | null;
  currentStatus: ChapterStatus | null;
  onOverrideSuccess?: (userId: string, chapterId: string) => void;
}

export function OverrideSection({
  student,
  chapter,
  currentStatus,
  onOverrideSuccess,
}: OverrideSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);

  const fetchAuditLog = useCallback(async () => {
    setAuditLoading(true);
    setAuditError(null);
    try {
      const data = await adminApi.getAuditLog();
      setAuditLog(data);
    } catch {
      setAuditError('Gagal memuat audit log. Silakan coba lagi.');
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  const handleConfirm = useCallback(
    async (reason: string) => {
      if (!student || !chapter) return;

      await adminApi.overrideChapter({
        userId: student.id,
        chapterId: chapter.id,
        reason,
      });

      // Notify parent to update status without reload
      onOverrideSuccess?.(student.id, chapter.id);

      // Refresh audit log
      await fetchAuditLog();

      // Close the form dialog
      setShowForm(false);
    },
    [student, chapter, onOverrideSuccess, fetchAuditLog]
  );

  const overrideAllowed = currentStatus ? isOverrideAllowed(currentStatus) : false;

  return (
    <div className="space-y-6">
      {/* Override Button */}
      {student && chapter && currentStatus && (
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowForm(true)}
            disabled={!overrideAllowed}
            aria-label={
              overrideAllowed
                ? `Override status Chapter ${chapter.name} untuk ${student.name}`
                : 'Override tidak tersedia untuk status COMPLETED'
            }
          >
            <Shield className="h-4 w-4" aria-hidden="true" />
            Override
          </Button>
          {!overrideAllowed && (
            <span className="text-sm text-muted-foreground">
              Status sudah COMPLETED
            </span>
          )}
        </div>
      )}

      {/* Override Form Dialog */}
      {showForm && student && chapter && currentStatus && (
        <OverrideForm
          student={student}
          chapter={chapter}
          currentStatus={currentStatus}
          onConfirm={handleConfirm}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Audit Log */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Riwayat Override</h3>
        <AuditLogTable
          entries={auditLog}
          isLoading={auditLoading}
          error={auditError}
          onRetry={fetchAuditLog}
        />
      </div>
    </div>
  );
}
