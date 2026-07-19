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
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
          <Shield className="h-6 w-6 text-primary-600" aria-hidden="true" />
          Penyesuaian Nilai
        </h1>
        <p className="text-sm text-muted-foreground">
          Riwayat penyesuaian status dan nilai Chapter yang telah dilakukan oleh admin.
        </p>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 p-4">
        <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary-600" aria-hidden="true" />
        <div className="text-sm text-primary-800">
          <p className="font-medium">Melakukan Penyesuaian Nilai</p>
          <p className="mt-1">
            Untuk melakukan penyesuaian status atau nilai Chapter siswa, buka halaman{' '}
            <span className="font-medium">Pemantauan</span>, klik baris siswa untuk melihat
            detail, lalu gunakan tombol <span className="font-medium">Penyesuaian</span> pada Chapter yang diinginkan.
          </p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-primary-700">
            <li><span className="font-medium">Luluskan Chapter</span> — set status ke Selesai + input skor manual</li>
            <li><span className="font-medium">Reset Kuis</span> — kembalikan chapter ke status Terbuka (bisa kuis ulang)</li>
            <li><span className="font-medium">Buka Chapter Berikutnya</span> — unlock chapter selanjutnya</li>
            <li><span className="font-medium">Reset Progress</span> — kembalikan progress dari awal</li>
          </ul>
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
