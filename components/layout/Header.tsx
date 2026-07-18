'use client';

import { useEffect, useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

export function Header() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
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
          <Menu className="h-6 w-6" />
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

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-primary-600"
          onClick={logout}
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
