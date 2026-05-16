'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Menu, X } from 'lucide-react';
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
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, visible on md+ */}
      <div className={`
        fixed md:relative z-50 h-full
        transform transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar user={user} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header with Mobile Menu Toggle */}
        <div className="flex items-center md:hidden h-16 bg-white border-b px-4 gap-2 z-40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1"
          >
            {mobileSidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
          <span className="text-sm font-medium text-gray-900">NISO</span>
        </div>

        {/* Header */}
        <Header user={user} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto py-4 md:py-6 px-3 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}