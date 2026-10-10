'use client';

import { ReactNode, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Header } from './header';
import { BrandLogo } from './brand-logo';
import { Sidebar } from './sidebar';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: ReactNode;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function MainLayout({ children, user }: MainLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-[var(--background)] md:flex-row">
      {mobileSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      <div
        className={`
          fixed z-50 h-full transform transition-transform duration-300 ease-in-out md:relative
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar user={user} />
      </div>

      <div className="flex w-full flex-1 flex-col overflow-hidden">
        <div className="z-40 flex h-16 items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-4 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1"
          >
            {mobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <BrandLogo className="h-6 w-auto" variant="wordmark" />
        </div>

        <Header user={user} />

        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 md:py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
