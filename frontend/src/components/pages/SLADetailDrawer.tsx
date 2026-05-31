import { useState } from 'react';
import './SLADetailDrawer.css';

interface SLADetailDrawerProps {
  entry: any;
  user: any;
  onApprove: () => void;
  onUpdate: (values: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function SLADetailDrawer({
  entry,
  user,
  onApprove,
  onUpdate,
  onClose,
  isLoading
}: SLADetailDrawerProps) {
  const [editMode, setEditMode] = useState(false);
  const [actualMw, setActualMw] = useState(entry.actualMw || '');
  const [remarks, setRemarks] = useState(entry.remarks || '');

  const canApprove = ['SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'].includes(user.role);
  const difference = actualMw ? (parseFloat(actualMw) - entry.forecastMw).toFixed(2) : null;
  const isHighDifference = difference && Math.abs(parseFloat(difference)) > 50;

  const handleUpdate = async () => {
    await onUpdate({
      actualMw: actualMw ? parseFloat(actualMw) : undefined,
      remarks
    });
    setEditMode(false);
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>SLA Entry Details</h3>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="drawer-content">
          <div className="field-group">
            <label>Hour</label>
            <p className="field-value">{entry.hour}:00</p>
          </div>

          <div className="field-group">
            <label>Feeder ID</label>
            <p className="field-value">{entry.feederId}</p>
          </div>

          <div className="field-group">
            <label>Forecast (MW)</label>
            <p className="field-value">{entry.forecastMw.toFixed(2)}</p>
          </div>

          {editMode ? (
            <>
              <div className="field-group">
                <label>Actual (MW) *</label>
                <input
                  type="number"
                  value={actualMw}
                  onChange={(e) => setActualMw(e.target.value)}
                  step="0.01"
                  autoFocus
                />
              </div>

              <div className="field-group">
                <label>Difference (MW)</label>
                <p className={`field-value ${isHighDifference ? 'alert' : ''}`}>
                  {difference || '-'} MW
                </p>
              </div>

              <div className="field-group">
                <label>Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="drawer-actions">
                <button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setActualMw(entry.actualMw || '');
                    setRemarks(entry.remarks || '');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="field-group">
                <label>Actual (MW)</label>
                <p className="field-value">{entry.actualMw?.toFixed(2) || '-'}</p>
              </div>

              <div className="field-group">
                <label>Difference (MW)</label>
                <p
                  className={`field-value ${
                    entry.differenceMw && Math.abs(entry.differenceMw) > 50
                      ? 'alert'
                      : ''
                  }`}
                >
                  {entry.differenceMw?.toFixed(2) || '-'} MW
                </p>
              </div>

              <div className="field-group">
                <label>Status</label>
                <p
                  className={`field-value ${
                    entry.approvedAt ? 'success' : 'warning'
                  }`}
                >
                  {entry.approvedAt ? '✓ Approved' : '○ Pending Approval'}
                </p>
              </div>

              <div className="field-group">
                <label>Remarks</label>
                <p className="field-value">{entry.remarks || '-'}</p>
              </div>

              <div className="drawer-actions">
                {!entry.approvedAt && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="btn-secondary"
                  >
                    Edit
                  </button>
                )}
                {!entry.approvedAt && canApprove && (
                  <button
                    onClick={onApprove}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? 'Approving...' : 'Approve'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
