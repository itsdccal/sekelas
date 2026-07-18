'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Info } from 'lucide-react';
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
      setError('Gagal memuat audit log. Silakan coba lagi.');
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
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
          <Shield className="h-6 w-6 text-primary-600" aria-hidden="true" />
          Override Mastery Gate
        </h1>
        <p className="text-sm text-muted-foreground">
          Riwayat override status Chapter yang telah dilakukan oleh admin.
        </p>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 p-4">
        <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary-600" aria-hidden="true" />
        <div className="text-sm text-primary-800">
          <p className="font-medium">Melakukan Override</p>
          <p className="mt-1">
            Untuk melakukan override status Chapter siswa, buka halaman{' '}
            <span className="font-medium">Monitoring</span>, klik nama siswa untuk melihat
            detail, lalu gunakan tombol Override pada Chapter yang diinginkan.
          </p>
        </div>
      </div>

      {/* Audit Log */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Riwayat Override</h2>
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
