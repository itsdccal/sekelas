'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { GamificationOverlay } from '@/components/student/GamificationOverlay';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Skip to main content link for keyboard navigation (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary-700 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
      >
        Langsung ke konten utama
      </a>

      {/* Desktop Sidebar - hidden on mobile, visible from md breakpoint */}
      <aside
        className="hidden w-64 shrink-0 border-r border-border bg-white md:block lg:w-72"
        aria-label="Sidebar navigasi"
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-4">
          <img src="/logo-icon.png" alt="" className="h-7 w-7" aria-hidden="true" />
          <span className="text-lg font-semibold text-primary-700">Sekelas</span>
        </div>
        <div className="overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile Navigation Overlay */}
      <MobileNav />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 md:p-6"
          aria-label="Konten utama"
        >
          {children}
        </main>
      </div>

      {/* Gamification notifications/popups — always visible across all student pages */}
      <GamificationOverlay />
    </div>
  );
}
