'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  FileText,
  User,
  PenTool,
  BarChart3,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/stores/authStore';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const studentMenuItems: NavItem[] = [
  { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Kurikulum', href: '/student/kurikulum', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Raport', href: '/student/raport', icon: <FileText className="h-5 w-5" /> },
  { label: 'Badge', href: '/student/badges', icon: <User className="h-5 w-5" /> },
];

const adminMenuItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Kurikulum', href: '/admin/kurikulum', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Quiz Builder', href: '/admin/quiz-builder', icon: <PenTool className="h-5 w-5" /> },
  { label: 'Monitoring', href: '/admin/monitoring', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Override', href: '/admin/override', icon: <Settings className="h-5 w-5" /> },
];

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';
  const menuItems = isAdmin ? adminMenuItems : studentMenuItems;

  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Navigasi utama">
      {menuItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-600 text-white'
                : 'text-foreground hover:bg-primary-50 hover:text-primary-700'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
