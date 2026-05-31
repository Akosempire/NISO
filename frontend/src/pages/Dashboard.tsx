import { useEffect, useState } from 'react';
import Sidebar, { NavSection } from '../components/Sidebar';
import CommandPalette from '../components/CommandPalette';
import OperatorFlow from './flows/OperatorFlow';
import SupervisorFlow from './flows/SupervisorFlow';
import AdminFlow from './flows/AdminFlow';
import SLAPage from './operations/SLAPage';
import ReadingsPage from './operations/ReadingsPage';
import InterruptionsPage from './operations/InterruptionsPage';
import InspectionsPage from './operations/InspectionsPage';
import ReportsPage from './records/ReportsPage';
import MessagesPage from './communication/MessagesPage';
import KnowledgePage from './knowledge/KnowledgePage';
import ComingSoon from '../components/ComingSoon';
import './Dashboard.css';

interface DashboardProps {
  user: any;
}

const SECTION_TITLE: Record<NavSection, string> = {
  dashboard: 'Workspace',
  readings: 'Hourly Readings',
  sla: 'SLA — Forecast vs Actual',
  interruptions: 'Interruptions',
  inspections: 'Inspections',
  reports: 'Reports',
  messages: 'Messages',
  knowledge: 'Knowledge Center'
};

export default function Dashboard({ user }: DashboardProps) {
  const [section, setSection] = useState<NavSection>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const renderFlow = () => {
    switch (user.role) {
      case 'OPERATOR':
        return <OperatorFlow user={user} />;
      case 'SUPERVISOR':
        return <SupervisorFlow user={user} />;
      case 'STATION_ADMIN':
      case 'REGIONAL_ADMIN':
      case 'HQ_ADMIN':
      case 'ICT_ADMIN':
        return <AdminFlow user={user} />;
      default:
        return (
          <ComingSoon
            title="Role not recognized"
            description={`The role "${user.role}" does not have an assigned workspace yet.`}
          />
        );
    }
  };

  const renderContent = () => {
    switch (section) {
      case 'dashboard':
        return renderFlow();
      case 'sla':
        return <SLAPage user={user} />;
      case 'readings':
        return <ReadingsPage user={user} />;
      case 'interruptions':
        return <InterruptionsPage user={user} />;
      case 'inspections':
        return <InspectionsPage user={user} />;
      case 'reports':
        return <ReportsPage user={user} />;
      case 'messages':
        return <MessagesPage user={user} />;
      case 'knowledge':
        return <KnowledgePage user={user} />;
      default:
        return (
          <ComingSoon
            title={SECTION_TITLE[section as NavSection] || 'Unknown'}
            description="This section is not wired up yet."
          />
        );
    }
  };

  return (
    <div className="dashboard-shell">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Sidebar
        user={user}
        current={section}
        onNavigate={setSection}
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />
      <div className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="topbar-hamburger"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation"
              aria-expanded={isSidebarOpen}
            >
              <span aria-hidden>☰</span>
            </button>
            <h1 className="topbar-title">{SECTION_TITLE[section]}</h1>
            {user.station && (
              <span className="topbar-meta">
                {user.station.name}
                {user.station.region ? ` • ${user.station.region}` : ''}
              </span>
            )}
          </div>
          <div className="topbar-right">
            <button
              type="button"
              className="topbar-search"
              onClick={() => setIsPaletteOpen(true)}
              aria-label="Open command palette"
              title="Jump to (Ctrl+K)"
            >
              <span className="topbar-search-icon" aria-hidden>⌕</span>
              <span className="topbar-search-label">Quick nav</span>
              <kbd className="topbar-search-kbd">Ctrl K</kbd>
            </button>
            <div className="topbar-user">
              <span className="topbar-user-name">{user.fullName}</span>
              <span className="topbar-user-role">{user.role.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </header>
        <main id="main-content" className="dashboard-content" tabIndex={-1}>
          {renderContent()}
        </main>
      </div>
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onNavigate={(s) => setSection(s)}
        userRole={user.role}
      />
    </div>
  );
}
