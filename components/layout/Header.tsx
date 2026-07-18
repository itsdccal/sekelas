'use client';

import { useEffect, useState } from 'react';
import { Menu, LogOut, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { formatXP } from '@/lib/utils/formatters';

export function Header() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar, availableSemesters, selectedSemesterId, setSelectedSemester } = useUIStore();
  const totalXP = useGamificationStore((state) => state.totalXP);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const formatDateTime = () => {
      const now = new Date();
      return now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    setCurrentTime(formatDateTime());
    const interval = setInterval(() => {
      setCurrentTime(formatDateTime());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-primary-200 bg-primary-700 px-4 text-white shadow-sm">
      <div className="flex items-center gap-3">
        {/* Hamburger button - visible only on mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-primary-600"
          onClick={toggleSidebar}
          aria-label="Toggle navigasi"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </Button>

        <div className="flex flex-col">
          <span className="text-sm font-semibold">
            Halo, {user?.firstName || 'Pengguna'}
          </span>
          <span className="hidden text-xs text-primary-200 sm:block">
            {currentTime}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Semester Dropdown */}
        {availableSemesters.length > 0 && (
          <select
            value={selectedSemesterId ?? ''}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="rounded border border-primary-200 bg-primary-600 px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Pilih semester"
          >
            {availableSemesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))}
          </select>
        )}

        {/* XP Display - Student only */}
        {user?.role === 'STUDENT' && (
          <div className="hidden items-center gap-1 rounded bg-amber-500/20 px-2 py-1 text-sm font-medium text-amber-100 sm:flex" aria-label={`Total XP: ${formatXP(totalXP)}`}>
            <Star className="h-4 w-4 text-amber-300" aria-hidden="true" />
            <span>{formatXP(totalXP)}</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-primary-600"
          onClick={logout}
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </div>
    </header>
  );
}
