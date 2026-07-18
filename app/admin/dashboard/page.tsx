'use client';

import { useAuthStore } from '@/stores/authStore';

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Beranda Admin</h1>

      <div className="rounded-lg border border-border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Selamat datang, {user?.firstName || 'Admin'}!</h2>
        <p className="text-sm text-muted-foreground">
          Gunakan menu di sidebar untuk mengelola kurikulum, quiz, dan memantau progres siswa.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5">
          <p className="text-sm text-muted-foreground">Total Materi</p>
          <p className="mt-1 text-2xl font-bold text-primary-700">3</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5">
          <p className="text-sm text-muted-foreground">Total Siswa</p>
          <p className="mt-1 text-2xl font-bold text-primary-700">24</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5">
          <p className="text-sm text-muted-foreground">Override Bulan Ini</p>
          <p className="mt-1 text-2xl font-bold text-primary-700">2</p>
        </div>
      </div>
    </div>
  );
}
