'use client';

import { useEffect, useState, useRef } from 'react';
import { Menu, LogOut, Star, ChevronDown, Calendar } from 'lucide-react';
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
  const [semesterOpen, setSemesterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSemesterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSemesterName = availableSemesters.find(s => s.id === selectedSemesterId)?.name ?? 'Pilih Semester';

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

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Semester Dropdown - Custom */}
        {availableSemesters.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSemesterOpen(!semesterOpen)}
              className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-expanded={semesterOpen}
              aria-haspopup="listbox"
              aria-label="Pilih semester"
            >
              <Calendar className="h-4 w-4 hidden sm:block" aria-hidden="true" />
              <span className="max-w-[120px] truncate sm:max-w-none">{selectedSemesterName}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${semesterOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {semesterOpen && (
              <div
                className="absolute right-0 top-full mt-1 min-w-[200px] rounded-lg border border-border bg-white py-1 shadow-lg"
                role="listbox"
                aria-label="Daftar semester"
              >
                {availableSemesters.map((semester) => (
                  <button
                    key={semester.id}
                    role="option"
                    aria-selected={selectedSemesterId === semester.id}
                    onClick={() => {
                      setSelectedSemester(semester.id);
                      setSemesterOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      selectedSemesterId === semester.id
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {semester.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* XP Display - Student only */}
        {user?.role === 'STUDENT' && (
          <div className="hidden items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1.5 text-sm font-semibold text-amber-100 sm:flex" aria-label={`Total XP: ${formatXP(totalXP)}`}>
            <Star className="h-4 w-4 text-amber-300" aria-hidden="true" />
            <span>{formatXP(totalXP)}</span>
          </div>
        )}

        {/* Tombol Keluar */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-primary-600"
          onClick={logout}
          aria-label="Keluar"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </div>
    </header>
  );
}
