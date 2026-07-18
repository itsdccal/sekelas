'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/layout/Sidebar';
import { useUIStore } from '@/stores/uiStore';

export function MobileNav() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, setSidebarOpen]);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  if (!sidebarOpen) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Navigasi mobile">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-xl">
        {/* Close button */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <span className="text-lg font-semibold text-primary-700">Sekelas</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup navigasi"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto">
          <Sidebar onItemClick={() => setSidebarOpen(false)} />
        </div>
      </div>
    </div>
  );
}
