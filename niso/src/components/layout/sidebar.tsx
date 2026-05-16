'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Zap,
  CheckSquare,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

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
      label: 'Knowledge Base',
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } fixed md:static h-full z-40`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600">NISO</h1>
          <p className="text-xs text-gray-500">Power System Monitoring</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}