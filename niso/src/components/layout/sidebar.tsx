'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { BrandLogo } from './brand-logo';

interface SidebarProps {
  user?: { role: string };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['HEADQUARTERS_ADMIN', 'ICT_ADMIN', 'REGIONAL_ADMIN', 'STATION_ADMIN', 'SUPERVISOR', 'OPERATOR', 'VIEWER'],
    },
    {
      label: 'Readings',
      href: '/readings',
      icon: TrendingUp,
      roles: ['OPERATOR', 'SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN'],
    },
    {
      label: 'Interruptions',
      href: '/interruptions',
      icon: Zap,
      roles: ['SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HEADQUARTERS_ADMIN'],
    },
    {
      label: 'SLA / Feeders',
      href: '/sla',
      icon: TrendingUp,
      roles: ['OPERATOR', 'SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN'],
    },
    {
      label: 'Inspections',
      href: '/inspections',
      icon: CheckSquare,
      roles: ['SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN'],
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: BarChart3,
      roles: ['SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HEADQUARTERS_ADMIN'],
    },
    {
      label: 'Knowledge Center',
      href: '/knowledge',
      icon: BookOpen,
      roles: ['OPERATOR', 'SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'KNOWLEDGE_ADMIN', 'VIEWER'],
    },
    {
      label: 'Admin',
      href: '/admin',
      icon: Settings,
      roles: ['HEADQUARTERS_ADMIN', 'ICT_ADMIN', 'REGIONAL_ADMIN'],
    },
  ];

  const filteredItems = menuItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : true
  );

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-md bg-[var(--brand-teal)] p-2 text-white md:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed z-40 flex h-full w-[248px] flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-300 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="border-b border-[var(--border)] p-5">
          <BrandLogo className="h-10 w-auto" variant="wordmark" />
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">
            Power System Monitoring
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-[var(--brand-mint-soft)] text-[var(--brand-teal)]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--surface-muted)]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-[var(--border)] p-4">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]">
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {isOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}
    </>
  );
}
