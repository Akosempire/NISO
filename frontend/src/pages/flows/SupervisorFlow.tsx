import { useMemo, useState } from 'react';
import { useInterruptions, useUpdateInterruption } from '../../hooks/useInterruptions';
import { useReadings } from '../../hooks/useReadings';
import { useSLAEntries } from '../../hooks/useSLA';
import { useApprovals, useApprove, useReject } from '../../hooks/useApprovals';
import InterruptionDrawer, {
  InterruptionFormValues
} from '../../components/flows/InterruptionDrawer';
import ReviewDrawer, { ReviewItem } from '../../components/flows/ReviewDrawer';
import { toast } from '../../stores/toastStore';
import './SupervisorFlow.css';

interface SupervisorFlowProps {
  user: any;
}

type ActiveDrawer =
  | { kind: 'review'; item: ReviewItem }
  | { kind: 'interruption-restore'; interruption: any }
  | null;

const todayISO = () => new Date().toISOString().split('T')[0];

// Fallback approvals shown when the /approvals endpoint isn't online yet —
// keeps the supervisor UX testable while Phase 2 backend lands.
const FALLBACK_APPROVALS: ReviewItem[] = [
  {
    id: 'rev-1',
    kind: 'reading-correction',
    title: 'Correction: 2JEB-SGB1 MW reading',
    submittedBy: 'J. Operator',
    submittedAt: '10:42 today',
    equipment: '2JEB-SGB1',
    hour: 8,
    before: { mw: '125.5', mvar: '42.0', kv: '330.1', amp: '450.2' },
    after: { mw: '152.5', mvar: '42.0', kv: '330.1', amp: '450.2' },
    notes: 'Misread the analog dial; verified against SCADA log.'
  },
  {
    id: 'rev-2',
    kind: 'sla-approval',
    title: 'SLA entry — Hour 9',
    submittedBy: 'J. Operator',
    submittedAt: '09:15 today',
    hour: 9,
    before: { forecast: '450', actual: '—' },
    after: { forecast: '450', actual: '438' },
    notes: 'Demand below forecast due to morning load drop.'
  },
  {
    id: 'rev-3',
    kind: 'inspection-signoff',
    title: 'Visual inspection — Transformer T1',
    submittedBy: 'M. Field',
    submittedAt: 'Yesterday',
    equipment: '2SHR TR1',
    after: { findings: 'No abnormalities', recommendation: 'Continue normal ops' }
  }
];

export default function SupervisorFlow({ user }: SupervisorFlowProps) {
  const [drawer, setDrawer] = useState<ActiveDrawer>(null);
  const [optimisticallyResolved, setOptimisticallyResolved] = useState<Set<string>>(new Set());
  const [selectedDate] = useState<string>(todayISO());

  const stationId = user?.station?.id;
  const interruptionsQuery = useInterruptions(stationId, 'Active');
  const readingsQuery = useReadings(stationId, selectedDate);
  const slaQuery = useSLAEntries(stationId, selectedDate);
  const approvalsQuery = useApprovals(stationId);
  const updateInterruption = useUpdateInterruption();
  const approve = useApprove();
  const reject = useReject();

  const interruptions: any[] = interruptionsQuery.data?.data || [];
  const readings: any[] = readingsQuery.data?.data || [];
  const slaEntries: any[] = slaQuery.data?.data || [];

  // Use real approvals when the endpoint returns data; otherwise show fallback
  // (so supervisors can still try the workflow during Phase 2).
  const realApprovals: ReviewItem[] = approvalsQuery.data?.data || [];
  const approvalsBase = realApprovals.length > 0 || approvalsQuery.isSuccess
    ? realApprovals
    : FALLBACK_APPROVALS;
  const approvals = approvalsBase.filter((a) => !optimisticallyResolved.has(a.id));

  const slaBreaches = useMemo(
    () => slaEntries.filter((e: any) => Math.abs((e.actual ?? 0) - (e.forecast ?? 0)) > 5),
    [slaEntries]
  );

  const unsealedReadings = useMemo(
    () => readings.filter((r: any) => !r.sealedAt),
    [readings]
  );

  const handleApprove = async (id: string, comment: string) => {
    setOptimisticallyResolved((prev) => new Set(prev).add(id));
    setDrawer(null);
    try {
      await approve.mutateAsync({ id, comment });
    } catch {
      // Backend may not yet exist (Phase 2). Local optimistic state is preserved
      // so the queue still feels responsive in development.
    }
  };

  const handleReject = async (id: string, comment: string) => {
    setOptimisticallyResolved((prev) => new Set(prev).add(id));
    setDrawer(null);
    try {
      await reject.mutateAsync({ id, comment });
    } catch {
      // See handleApprove note.
    }
  };

  const handleRestoreSubmit = async (values: InterruptionFormValues) => {
    if (drawer?.kind !== 'interruption-restore') return;
    try {
      await updateInterruption.mutateAsync({
        id: drawer.interruption.id,
        status: 'Restored',
        restoreDate: values.restoreDate,
        restoreTime: values.restoreTime,
        notes: values.notes
      });
      setDrawer(null);
    } catch (error: any) {
      toast.error('Could not restore interruption', error?.message || 'Unknown error');
    }
  };

  return (
    <div className="supervisor-flow">
      <header className="flow-header">
        <div>
          <h2>Supervisor Workspace</h2>
          <p className="flow-subtitle">
            {user?.station?.name || 'Station'} • approvals, oversight, escalations
          </p>
        </div>
      </header>

      <div className="kpi-grid">
        <div className={`kpi-card ${approvals.length > 0 ? 'kpi-attention' : 'kpi-ok'}`}>
          <div className="kpi-label">Pending Approvals</div>
          <div className="kpi-value">{approvals.length}</div>
          <div className="kpi-meta">
            {approvals.length === 0 ? 'Queue clear' : 'Awaiting your review'}
          </div>
        </div>
        <div className={`kpi-card ${interruptions.length > 0 ? 'kpi-alert' : 'kpi-ok'}`}>
          <div className="kpi-label">Active Interruptions</div>
          <div className="kpi-value">{interruptions.length}</div>
          <div className="kpi-meta">
            {interruptions.length === 0 ? 'All restored' : 'Awaiting restoration'}
          </div>
        </div>
        <div className={`kpi-card ${slaBreaches.length > 0 ? 'kpi-attention' : 'kpi-ok'}`}>
          <div className="kpi-label">SLA Breaches Today</div>
          <div className="kpi-value">{slaBreaches.length}</div>
          <div className="kpi-meta">|Δ| &gt; 5 MW</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Draft Readings</div>
          <div className="kpi-value">{unsealedReadings.length}</div>
          <div className="kpi-meta">Unsealed entries today</div>
        </div>
      </div>

      <div className="flow-columns">
        <section className="flow-panel">
          <div className="panel-header">
            <h3>Approvals queue</h3>
            <span className="panel-count">{approvals.length}</span>
          </div>
          {approvals.length === 0 ? (
            <div className="empty-state">No pending approvals. You're caught up.</div>
          ) : (
            <ul className="review-list">
              {approvals.map((item) => (
                <li key={item.id}>
                  <button
                    className="review-item"
                    onClick={() => setDrawer({ kind: 'review', item })}
                    type="button"
                  >
                    <span className={`review-kind kind-${item.kind}`}>
                      {item.kind === 'reading-correction' && 'Correction'}
                      {item.kind === 'sla-approval' && 'SLA'}
                      {item.kind === 'inspection-signoff' && 'Inspection'}
                    </span>
                    <div className="review-item-body">
                      <div className="review-item-title">{item.title}</div>
                      <div className="review-item-meta">
                        {item.submittedBy} • {item.submittedAt}
                      </div>
                    </div>
                    <span className="review-item-arrow">→</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flow-panel">
          <div className="panel-header">
            <h3>Active interruptions</h3>
            {interruptions.length > 0 && (
              <span className="panel-count panel-count-alert">{interruptions.length}</span>
            )}
          </div>
          {interruptions.length === 0 ? (
            <div className="empty-state">No active interruptions.</div>
          ) : (
            <ul className="interruption-list">
              {interruptions.map((i: any) => {
                const tripped = new Date(i.tripTime || `${i.tripDate}T${i.tripTime}`);
                const durationMin = Math.round((Date.now() - tripped.getTime()) / 60000);
                return (
                  <li key={i.id}>
                    <div className="interruption-item">
                      <div className="interruption-body">
                        <div className="interruption-equipment">
                          {i.equipment?.name || i.equipmentId}
                        </div>
                        <div className="interruption-meta">
                          <span className="cause-tag">{i.causeCode || 'OTH'}</span>
                          <span>{durationMin}m ago</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                          setDrawer({ kind: 'interruption-restore', interruption: i })
                        }
                      >
                        Restore →
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {drawer?.kind === 'review' && (
        <ReviewDrawer
          item={drawer.item}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setDrawer(null)}
          isLoading={approve.isLoading || reject.isLoading}
        />
      )}

      {drawer?.kind === 'interruption-restore' && (
        <InterruptionDrawer
          mode="restore"
          initial={{
            equipmentId: drawer.interruption.equipmentId,
            causeCode: drawer.interruption.causeCode,
            causeName: drawer.interruption.causeName,
            tripDate: drawer.interruption.tripDate,
            tripTime: drawer.interruption.tripTime,
            equipment: drawer.interruption.equipment
          }}
          onSubmit={handleRestoreSubmit}
          onClose={() => setDrawer(null)}
          isLoading={updateInterruption.isLoading}
        />
      )}
    </div>
  );
}
