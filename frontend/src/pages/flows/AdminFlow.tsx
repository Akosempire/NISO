import { useMonthSeal, useTransitionMonthSeal, SealState } from '../../hooks/useMonthSeal';
import { toast } from '../../stores/toastStore';
import './AdminFlow.css';

interface AdminFlowProps {
  user: any;
}

// Phase 2 features per BUILD_LOG — template builder, formula engine, user mgmt,
// audit log viewer, system settings. Placeholder banner on cards until those land.
type AdminAction =
  | { id: string; title: string; description: string; status: 'ready'; href?: string }
  | { id: string; title: string; description: string; status: 'phase-2' };

const ACTIONS: AdminAction[] = [
  {
    id: 'equipment',
    title: 'Manage Equipment',
    description: 'Add, edit, or retire equipment for this station.',
    status: 'phase-2'
  },
  {
    id: 'templates',
    title: 'Configure Templates',
    description: 'Define reading and inspection field schemas.',
    status: 'phase-2'
  },
  {
    id: 'formulas',
    title: 'Manage Formulas',
    description: 'Version SLA and derived-value calculations.',
    status: 'phase-2'
  },
  {
    id: 'users',
    title: 'User Management',
    description: 'Create, assign roles, and scope access.',
    status: 'phase-2'
  },
  {
    id: 'audit',
    title: 'Audit Logs',
    description: 'Review every create, edit, seal, and export.',
    status: 'phase-2'
  },
  {
    id: 'settings',
    title: 'System Settings',
    description: 'Integrations, notification routing, alert thresholds.',
    status: 'phase-2'
  }
];

export default function AdminFlow({ user }: AdminFlowProps) {
  const stationId = user?.station?.id;
  const stationName = user?.station?.name || 'Station';
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const monthLabel = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const sealQuery = useMonthSeal(stationId, currentYear, currentMonth);
  const transitionSeal = useTransitionMonthSeal();
  const sealState: SealState = sealQuery.data?.state || 'OPEN';

  const handleSealAction = async () => {
    if (!stationId) return;
    const next: 'REVIEW' | 'SEALED' | null =
      sealState === 'OPEN' ? 'REVIEW' : sealState === 'REVIEW' ? 'SEALED' : null;
    if (!next) return;
    if (next === 'SEALED' && !window.confirm('Sealing is irreversible. Continue?')) return;
    try {
      await transitionSeal.mutateAsync({
        stationId,
        year: currentYear,
        month: currentMonth,
        transition: next
      });
    } catch (error: any) {
      toast.error('Could not transition month', error?.response?.data?.error || error?.message);
    }
  };

  return (
    <div className="admin-flow">
      <header className="flow-header">
        <div>
          <h2>Administration</h2>
          <p className="flow-subtitle">
            {stationName} • configuration, audit, and month sealing
          </p>
        </div>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Equipment</div>
          <div className="kpi-value">{user?.station?.equipment?.length ?? 0}</div>
          <div className="kpi-meta">Registered devices</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Templates</div>
          <div className="kpi-value">—</div>
          <div className="kpi-meta">Phase 2</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Audit Events Today</div>
          <div className="kpi-value">—</div>
          <div className="kpi-meta">Phase 2</div>
        </div>
        <div className={`kpi-card seal-card seal-${sealState.toLowerCase()}`}>
          <div className="kpi-label">Month Sealing</div>
          <div className="kpi-value seal-state">{sealState}</div>
          <div className="kpi-meta">{monthLabel}</div>
        </div>
      </div>

      <section className="seal-panel">
        <div className="seal-panel-body">
          <div>
            <h3>Month seal — {monthLabel}</h3>
            <p className="seal-description">
              {sealState === 'OPEN' &&
                'Operators can edit raw records. Move to Review when data entry is complete.'}
              {sealState === 'REVIEW' &&
                'Records are locked from edits. Verify totals before sealing — sealing is irreversible.'}
              {sealState === 'SEALED' &&
                'This month is immutable. Formulas can still be re-evaluated for derived values.'}
            </p>
          </div>
          {sealState !== 'SEALED' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSealAction}
              disabled={transitionSeal.isLoading}
            >
              {transitionSeal.isLoading
                ? 'Working…'
                : sealState === 'OPEN'
                ? 'Move to Review →'
                : 'Seal month →'}
            </button>
          )}
        </div>
        <div className="seal-states">
          {(['OPEN', 'REVIEW', 'SEALED'] as SealState[]).map((s, idx) => (
            <div
              key={s}
              className={`seal-step ${s === sealState ? 'current' : ''} ${
                (['OPEN', 'REVIEW', 'SEALED'] as SealState[]).indexOf(sealState) > idx
                  ? 'done'
                  : ''
              }`}
            >
              <span className="seal-step-dot" />
              <span className="seal-step-label">{s}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="section-header">
        <h3>Administration tools</h3>
        <span className="section-hint">Phase 2 modules surface here as they land</span>
      </div>

      <div className="action-grid">
        {ACTIONS.map((action) => (
          <div
            key={action.id}
            className={`action-card ${action.status === 'phase-2' ? 'is-phase-2' : ''}`}
          >
            <div className="action-card-body">
              <h4>{action.title}</h4>
              <p>{action.description}</p>
            </div>
            {action.status === 'phase-2' ? (
              <span className="phase-badge">Phase 2</span>
            ) : (
              <span className="action-arrow">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
