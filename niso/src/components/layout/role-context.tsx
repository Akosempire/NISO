'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ROLE_LABEL, type RoleKey } from '@/lib/navigation';

const STORAGE_KEY = 'niso.role';
const DEFAULT_ROLE: RoleKey = 'operator';

interface RoleContextValue {
  role: RoleKey;
  setRole: (role: RoleKey) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<RoleKey>(DEFAULT_ROLE);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in ROLE_LABEL) {
      setRoleState(stored as RoleKey);
    }
  }, []);

  const setRole = (next: RoleKey) => {
    setRoleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
