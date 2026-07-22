'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Users, PenTool, Award, FileText, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { adminApi, curriculumApi } from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import type { AuditLogEntry } from '@/lib/types';

interface DashboardStats {
  totalMateri: number;
  totalSiswa: number;
  overrideBulanIni: number;
  totalMilestone: number;
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Memuat statistik">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const selectedSemesterId = useUIStore((s) => s.selectedSemesterId);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOverrides, setRecentOverrides] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [monitoringRes, auditRes, milestoneRes] = await Promise.allSettled([
        adminApi.getStudentMonitoring({ page: 1, pageSize: 1 }),
        adminApi.getAuditLog(),
        adminApi.getMilestones(),
      ]);

      // Count subjects from curriculum if semester available
      let totalMateri = 0;
      if (selectedSemesterId) {
        try {
          const subjects = await curriculumApi.getSubjectList(selectedSemesterId);
          totalMateri = subjects.length;
        } catch { /* fallback */ }
      }

      const totalSiswa = monitoringRes.status === 'fulfilled' ? monitoringRes.value.total : 0;
      const auditLog = auditRes.status === 'fulfilled' ? auditRes.value : [];
      const milestones = milestoneRes.status === 'fulfilled' ? milestoneRes.value : [];

      // Count overrides this month
      const now = new Date();
      const thisMonth = auditLog.filter((entry) => {
        const d = new Date(entry.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      setStats({
        totalMateri,
        totalSiswa,
        overrideBulanIni: thisMonth.length,
        totalMilestone: milestones.length,
      });

      setRecentOverrides(auditLog.slice(0, 5));
    } catch {
      // Partial data is fine
    } finally {
      setIsLoading(false);
    }
  }, [selectedSemesterId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Selamat datang, {user?.firstName || 'Admin'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan aktivitas dan akses cepat ke fitur admin.
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <StatsSkeleton />
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Materi</p>
                <p className="text-xl font-bold text-foreground">{stats.totalMateri}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Siswa</p>
                <p className="text-xl font-bold text-foreground">{stats.totalSiswa}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Milestone</p>
                <p className="text-xl font-bold text-foreground">{stats.totalMilestone}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Override Bulan Ini</p>
                <p className="text-xl font-bold text-foreground">{stats.overrideBulanIni}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Akses Cepat</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/curriculum"
            className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 hover:bg-muted/30"
          >
            <BookOpen className="h-5 w-5 text-primary-600" />
            <div>
              <p className="text-sm font-medium text-foreground">Kurikulum</p>
              <p className="text-xs text-muted-foreground">Kelola materi, bab, chapter</p>
            </div>
          </Link>
          <Link
            href="/admin/quiz-builder"
            className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 hover:bg-muted/30"
          >
            <PenTool className="h-5 w-5 text-primary-600" />
            <div>
              <p className="text-sm font-medium text-foreground">Bank Soal</p>
              <p className="text-xs text-muted-foreground">Buat & kelola soal kuis</p>
            </div>
          </Link>
          <Link
            href="/admin/monitoring"
            className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 hover:bg-muted/30"
          >
            <BarChart3 className="h-5 w-5 text-primary-600" />
            <div>
              <p className="text-sm font-medium text-foreground">Pemantauan Siswa</p>
              <p className="text-xs text-muted-foreground">Lihat progres & override</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Overrides */}
      {recentOverrides.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Penyesuaian Terbaru</h2>
            <Link href="/admin/override" className="text-xs text-primary-600 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="rounded-lg border border-border bg-white divide-y divide-border">
            {recentOverrides.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">
                    <span className="font-medium">{entry.studentName}</span>
                    {' — '}
                    {entry.chapterName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{entry.reason}</p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </time>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
