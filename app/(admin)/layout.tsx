'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar - hidden on mobile, visible from md breakpoint */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-white md:block lg:w-72">
        <div className="flex h-16 items-center border-b border-border px-4">
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
