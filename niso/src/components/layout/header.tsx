'use client';

import { Bell, ChevronDown, Clock3, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export function Header({ user }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle =
    pathname === '/'
      ? 'NISO System'
      : pathname
          .split('/')
          .filter(Boolean)
          .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join(' / ');
  const roleLabel = user?.role?.replace(/_/g, ' ') ?? 'User';
  const currentHour = `${new Date().getHours().toString().padStart(2, '0')}00hrs`;

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-teal)]">
            {pageTitle}
          </p>
          <h2 className="mt-1 text-sm text-[var(--text-secondary)]">
            Welcome back, <span className="font-semibold text-[var(--text-primary)]">{user?.name || 'User'}</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-secondary)]">
            <Clock3 className="h-4 w-4 text-[var(--brand-teal)]" />
            <span>{currentHour}</span>
            <span className="text-[var(--border)]">|</span>
            <span className="capitalize">{roleLabel.toLowerCase()}</span>
          </div>

          <button className="relative rounded-md p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)]">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--danger)]" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 transition-colors hover:bg-[var(--surface-muted)]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-teal)] text-sm font-semibold text-white">
                {user?.name?.[0] || 'U'}
              </div>
              <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
            </button>

            {isOpen ? (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_26px_rgba(27,36,36,0.12)]">
                <div className="border-b border-[var(--border)] px-4 py-3">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[var(--brand-teal)]">
                    {roleLabel}
                  </p>
                </div>
                <div className="p-2">
                  <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]">
                    <User className="h-4 w-4" />
                    Profile Settings
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
