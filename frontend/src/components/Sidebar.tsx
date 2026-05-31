import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { AuthUser } from '../stores/authStore';
import Logo from './Logo';
import RoleBadge from './RoleBadge';
import './Sidebar.css';

export type NavSection =
  | 'dashboard'
  | 'readings'
  | 'sla'
  | 'interruptions'
  | 'inspections'
  | 'reports'
  | 'messages'
  | 'knowledge';

interface SidebarProps {
  user: AuthUser;
  current: NavSection;
  onNavigate: (section: NavSection) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  id: NavSection;
  label: string;
  status?: 'ready' | 'phase-2';
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_BY_ROLE: Record<string, NavGroup[]> = {
  OPERATOR: [
    {
      label: 'Workspace',
      items: [{ id: 'dashboard', label: 'Shift Dashboard', status: 'ready' }]
    },
    {
      label: 'Operations',
      items: [
        { id: 'readings', label: 'Readings', status: 'ready' },
        { id: 'sla', label: 'SLA', status: 'ready' },
        { id: 'interruptions', label: 'Interruptions', status: 'ready' },
        { id: 'inspections', label: 'Inspections', status: 'ready' }
      ]
    },
    {
      label: 'Records & Knowledge',
      items: [
        { id: 'reports', label: 'Reports', status: 'ready' },
        { id: 'knowledge', label: 'Knowledge Center', status: 'ready' }
      ]
    }
  ],
  SUPERVISOR: [
    {
      label: 'Workspace',
      items: [{ id: 'dashboard', label: 'Supervisor View', status: 'ready' }]
    },
    {
      label: 'Operations',
      items: [
        { id: 'readings', label: 'Readings', status: 'ready' },
        { id: 'sla', label: 'SLA', status: 'ready' },
        { id: 'interruptions', label: 'Interruptions', status: 'ready' },
        { id: 'inspections', label: 'Inspections', status: 'ready' }
      ]
    },
    {
      label: 'Records & Comms',
      items: [
        { id: 'reports', label: 'Reports', status: 'ready' },
        { id: 'messages', label: 'Messages', status: 'ready' },
        { id: 'knowledge', label: 'Knowledge Center', status: 'ready' }
      ]
    }
  ],
  STATION_ADMIN: [
    {
      label: 'Workspace',
      items: [{ id: 'dashboard', label: 'Administration', status: 'ready' }]
    },
    {
      label: 'Monitoring',
      items: [
        { id: 'readings', label: 'Readings', status: 'ready' },
        { id: 'sla', label: 'SLA', status: 'ready' },
        { id: 'interruptions', label: 'Interruptions', status: 'ready' },
        { id: 'inspections', label: 'Inspections', status: 'ready' }
      ]
    },
    {
      label: 'Records & Knowledge',
      items: [
        { id: 'reports', label: 'Reports', status: 'ready' },
        { id: 'knowledge', label: 'Knowledge Center', status: 'ready' }
      ]
    }
  ]
};

NAV_BY_ROLE.REGIONAL_ADMIN = NAV_BY_ROLE.STATION_ADMIN;
NAV_BY_ROLE.HQ_ADMIN = NAV_BY_ROLE.STATION_ADMIN;
NAV_BY_ROLE.ICT_ADMIN = NAV_BY_ROLE.STATION_ADMIN;

export default function Sidebar({
  user,
  current,
  onNavigate,
  isMobileOpen = false,
  onMobileClose
}: SidebarProps) {
  const { logout } = useAuth();
  const groups = NAV_BY_ROLE[user.role] || NAV_BY_ROLE.OPERATOR;

  // Close mobile drawer when Escape is pressed.
  useEffect(() => {
    if (!isMobileOpen || !onMobileClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMobileOpen, onMobileClose]);

  const handleNavigate = (id: NavSection) => {
    onNavigate(id);
    onMobileClose?.();
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onMobileClose}
          aria-hidden
        />
      )}
      <aside className={`sidebar ${isMobileOpen ? 'is-mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Logo height={32} className="sidebar-logo" onDark />
          <RoleBadge role={user.role} size="sm" />
          {onMobileClose && (
            <button
              type="button"
              className="sidebar-mobile-close"
              onClick={onMobileClose}
              aria-label="Close navigation"
            >
              ×
            </button>
          )}
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          {groups.map((group) => (
            <div key={group.label} className="nav-group">
              <div className="nav-group-label">{group.label}</div>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item ${current === item.id ? 'active' : ''}`}
                  onClick={() => handleNavigate(item.id)}
                  aria-current={current === item.id ? 'page' : undefined}
                >
                  <span className="nav-item-label">{item.label}</span>
                  {item.status === 'phase-2' && (
                    <span className="nav-tag" aria-label="Phase 2 — not yet built">Phase 2</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-block">
            <p className="user-name">{user.fullName}</p>
            <p className="user-email">{user.email}</p>
            {user.station && <p className="user-station">{user.station.name}</p>}
          </div>
          <button onClick={logout} className="btn-logout" type="button">
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
