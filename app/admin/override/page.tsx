'use client';

import { useState, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';
import { AuditLogTable } from '@/components/admin/OverrideForm';
import { adminApi } from '@/lib/api';
import type { AuditLogEntry } from '@/lib/types';

export default function OverridePage() {
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAuditLog();
      setAuditLog(data);
    } catch {
      setError('Gagal memuat riwayat penyesuaian. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Penyesuaian Nilai
        </h1>
        <p className="text-sm text-muted-foreground">
          Riwayat penyesuaian nilai Chapter yang telah dilakukan oleh admin.
        </p>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 p-4">
        <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary-600" aria-hidden="true" />
        <div className="text-sm text-primary-800">
          <p className="font-medium">Cara Melakukan Penyesuaian</p>
          <p className="mt-1">
            Buka halaman <span className="font-medium">Pemantauan</span>, klik baris siswa
            untuk melihat detail progres, lalu gunakan tombol{' '}
            <span className="font-medium">Penyesuaian</span> pada Chapter yang ingin diluluskan.
            Admin wajib mengisi skor (0–100%) dan alasan.
          </p>
        </div>
      </div>

      {/* Audit Log */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Riwayat Penyesuaian</h2>
        <AuditLogTable
          entries={auditLog}
          isLoading={isLoading}
          error={error}
          onRetry={fetchAuditLog}
        />
      </div>
    </div>
  );
}
