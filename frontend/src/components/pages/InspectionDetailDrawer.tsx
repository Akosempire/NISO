import './SLADetailDrawer.css';
import type { Inspection } from './InspectionsTable';

interface InspectionDetailDrawerProps {
  inspection: Inspection;
  user: any;
  onApprove: () => void;
  onClose: () => void;
  isLoading: boolean;
}

function inspectorLabel(insp: Inspection): string {
  if (typeof insp.inspector === 'string') return insp.inspector;
  if (insp.inspector?.fullName) return insp.inspector.fullName;
  return insp.inspectorName || '—';
}

export default function InspectionDetailDrawer({
  inspection,
  user,
  onApprove,
  onClose,
  isLoading
}: InspectionDetailDrawerProps) {
  const canApprove = ['SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'].includes(user?.role ?? '');
  const isApproved = !!inspection.approvedAt;
  const isSubmitted = !!inspection.submittedAt;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>Inspection — {inspection.equipment?.name || inspection.equipmentId || '—'}</h3>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="drawer-content">
          <div className="field-group">
            <label>Status</label>
            <p className={`field-value ${isApproved ? 'success' : isSubmitted ? 'warning' : ''}`}>
              {isApproved ? '✓ Approved' : isSubmitted ? '◐ Pending approval' : '◌ Draft'}
            </p>
          </div>

          <div className="field-group">
            <label>Template / Type</label>
            <p className="field-value">
              {inspection.template?.name || inspection.templateName || inspection.type || '—'}
            </p>
          </div>

          <div className="field-group">
            <label>Inspector</label>
            <p className="field-value">{inspectorLabel(inspection)}</p>
          </div>

          <div className="field-group">
            <label>Inspection date</label>
            <p className="field-value">{inspection.date || inspection.scheduledFor || '—'}</p>
          </div>

          <div className="field-group">
            <label>Findings</label>
            <p className="field-value" style={{ whiteSpace: 'pre-wrap' }}>
              {inspection.findings || '—'}
            </p>
          </div>

          {isApproved && (
            <div className="field-group">
              <label>Approved by</label>
              <p className="field-value success">
                {inspection.approvedBy || '—'}
                {' • '}
                {inspection.approvedAt ? new Date(inspection.approvedAt).toLocaleString() : ''}
              </p>
            </div>
          )}

          <div className="drawer-actions">
            {isSubmitted && !isApproved && canApprove && (
              <button
                onClick={onApprove}
                disabled={isLoading}
                className="btn-primary"
                title="Approval is irreversible — record becomes immutable"
              >
                {isLoading ? 'Approving…' : '✓ Approve & seal'}
              </button>
            )}
            <button onClick={onClose} className="btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
