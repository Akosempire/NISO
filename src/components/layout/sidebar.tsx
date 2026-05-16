'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { roleNavigation, type NavNode, type RoleKey } from '@/lib/navigation/config';

interface SidebarProps {
  user?: { role?: string };
}

const DEFAULT_ROLE: RoleKey = 'OPERATOR';
const PREVIEW_STORAGE_KEY = 'niso.previewRole';

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [previewRole, setPreviewRole] = useState<RoleKey>(
    (user?.role as RoleKey) in roleNavigation ? (user!.role as RoleKey) : DEFAULT_ROLE
  );
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.role) return;
    const stored = localStorage.getItem(PREVIEW_STORAGE_KEY);
    if (stored && stored in roleNavigation) {
      setPreviewRole(stored as RoleKey);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role) return;
    localStorage.setItem(PREVIEW_STORAGE_KEY, previewRole);
  }, [previewRole, user?.role]);

  const tree = roleNavigation[previewRole] ?? roleNavigation[DEFAULT_ROLE];

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const containsActive = (node: NavNode): boolean => {
    if (isActive(node.href)) return true;
    return (node.children ?? []).some(containsActive);
  };

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const renderLeaf = (item: NavNode, depth: number) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    const baseClass =
      depth === 0
        ? 'px-3 py-2 text-sm font-medium'
        : 'pl-11 pr-3 py-1.5 text-sm';
    return (
      <Link
        key={item.href ?? item.label}
        href={item.href ?? '#'}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-3 rounded-lg transition-colors ${baseClass} ${
          active
            ? 'bg-indigo-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {Icon ? <Icon className="w-5 h-5 shrink-0" /> : null}
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  const renderGroup = (group: NavNode) => {
    const hasActive = containsActive(group);
    const isCollapsed = collapsed.has(group.label) && !hasActive;
    const groupActive = group.href ? pathname === group.href : false;
    const Icon = group.icon;

    const headerInner = (
      <>
        {Icon ? <Icon className="w-5 h-5 shrink-0" /> : null}
        <span className="flex-1 text-left truncate">{group.label}</span>
      </>
    );

    const headerClass = `flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      groupActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`;

    const header = group.href ? (
      <Link
        href={group.href}
        onClick={() => setIsOpen(false)}
        className={headerClass}
      >
        {headerInner}
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => toggleGroup(group.label)}
        className={headerClass}
      >
        {headerInner}
      </button>
    );

    return (
      <div key={group.label}>
        <div className="flex items-center gap-1">
          {header}
          <button
            type="button"
            onClick={() => toggleGroup(group.label)}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg shrink-0"
            aria-label={isCollapsed ? `Expand ${group.label}` : `Collapse ${group.label}`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
        {!isCollapsed && (
          <div className="mt-1 space-y-0.5">
            {(group.children ?? []).map((child) => renderLeaf(child, 1))}
          </div>
        )}
      </div>
    );
  };

  const renderNode = (node: NavNode) => {
    if (node.children && node.children.length > 0) {
      return renderGroup(node);
    }
    return renderLeaf(node, 0);
  };

  const roleLabel = previewRole.replace(/_/g, ' ').toLowerCase();

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
          <p className="text-xs text-gray-500 capitalize">{roleLabel}</p>
        </div>

        {/* Dev role-preview switcher — remove once auth is wired up */}
        {!user?.role && (
          <div className="px-4 pt-4">
            <label className="text-[10px] uppercase tracking-wide text-gray-400">
              Preview as
            </label>
            <select
              value={previewRole}
              onChange={(e) => setPreviewRole(e.target.value as RoleKey)}
              className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700"
            >
              {(Object.keys(roleNavigation) as RoleKey[]).map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {tree.map(renderNode)}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
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
