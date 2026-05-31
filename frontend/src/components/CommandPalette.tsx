import { useEffect, useMemo, useRef, useState } from 'react';
import type { NavSection } from './Sidebar';
import './CommandPalette.css';

export interface Command {
  id: string;
  label: string;
  group: string;
  hint?: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: NavSection) => void;
  userRole: string;
}

const NAV_COMMANDS: { id: NavSection; label: string; hint: string }[] = [
  { id: 'dashboard', label: 'Workspace', hint: 'Role-based home view' },
  { id: 'readings', label: 'Readings', hint: 'Hourly operational values' },
  { id: 'sla', label: 'SLA', hint: 'Forecast vs actual' },
  { id: 'interruptions', label: 'Interruptions', hint: 'Equipment trips' },
  { id: 'inspections', label: 'Inspections', hint: 'Maintenance checks' },
  { id: 'reports', label: 'Reports', hint: 'Generated reports' },
  { id: 'messages', label: 'Messages', hint: 'Broadcasts and direct messages' },
  { id: 'knowledge', label: 'Knowledge Center', hint: 'Procedures + AI assistant' }
];

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  userRole
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Operator can't access /messages (not in their nav). Filter accordingly.
  const allowedNav = useMemo(() => {
    if (userRole === 'OPERATOR') return NAV_COMMANDS.filter((c) => c.id !== 'messages');
    return NAV_COMMANDS;
  }, [userRole]);

  const commands: Command[] = useMemo(
    () =>
      allowedNav.map((nav) => ({
        id: `nav-${nav.id}`,
        label: `Go to ${nav.label}`,
        group: 'Navigation',
        hint: nav.hint,
        action: () => onNavigate(nav.id)
      })),
    [allowedNav, onNavigate]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint?.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      // Focus next tick — the input mounts with the dialog.
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filtered[activeIndex];
        if (cmd) {
          cmd.action();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, filtered, activeIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div
        className="command-palette"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="command-palette-input-row">
          <span className="command-palette-icon" aria-hidden>⌕</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a section…"
            className="command-palette-input"
            aria-label="Command search"
          />
          <kbd className="command-palette-kbd">esc</kbd>
        </div>

        <div className="command-palette-list" role="listbox">
          {filtered.length === 0 ? (
            <div className="command-palette-empty">No commands match "{query}"</div>
          ) : (
            filtered.map((cmd, idx) => (
              <button
                key={cmd.id}
                type="button"
                role="option"
                aria-selected={idx === activeIndex}
                className={`command-palette-item ${idx === activeIndex ? 'active' : ''}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
              >
                <div className="command-palette-item-main">
                  <div className="command-palette-item-label">{cmd.label}</div>
                  {cmd.hint && <div className="command-palette-item-hint">{cmd.hint}</div>}
                </div>
                <span className="command-palette-item-group">{cmd.group}</span>
              </button>
            ))
          )}
        </div>

        <div className="command-palette-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
