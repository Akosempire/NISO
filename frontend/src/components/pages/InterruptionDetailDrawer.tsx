import { useState } from 'react';
import './SLADetailDrawer.css'; // reuse drawer styles
import type { Interruption } from './InterruptionsTable';

interface InterruptionDetailDrawerProps {
  interruption: Interruption;
  user: any;
  onRestore: () => void;
  onUpdate: (values: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

function equipmentName(intr: Interruption): string {
  if (intr.equipment?.name) return intr.equipment.name;
  if (typeof intr.equipmentId === 'object' && intr.equipmentId?.name) return intr.equipmentId.name;
  if (typeof intr.equipmentId === 'string') return intr.equipmentId;
  return '—';
}

export default function InterruptionDetailDrawer({
  interruption,
  user,
  onRestore,
  onUpdate,
  onClose,
  isLoading
}: InterruptionDetailDrawerProps) {
  const [editMode, setEditMode] = useState(false);
  const [notes, setNotes] = useState(interruption.notes || '');

  const isActive =
    !interruption.restorationTime &&
    interruption.status !== 'Resolved' &&
    interruption.status !== 'Restored';
  const canRestore = ['OPERATOR', 'SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'].includes(user?.role ?? '');

  const handleSaveNotes = async () => {
    await onUpdate({ notes });
    setEditMode(false);
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>Interruption — {equipmentName(interruption)}</h3>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="drawer-content">
          <div className="field-group">
            <label>Status</label>
            <p className={`field-value ${isActive ? 'warning' : 'success'}`}>
              {isActive ? '⚠ Active' : '✓ Restored'}
            </p>
          </div>

          <div className="field-group">
            <label>Cause</label>
            <p className="field-value">
              {interruption.causeCode ? `${interruption.causeCode} — ${interruption.causeName || ''}` : '—'}
            </p>
          </div>

          <div className="field-group">
            <label>Trip</label>
            <p className="field-value">
              {interruption.tripDate} {interruption.tripTime}
            </p>
          </div>

          {!isActive && (
            <>
              <div className="field-group">
                <label>Restored</label>
                <p className="field-value">
                  {interruption.restorationTime
                    ? new Date(interruption.restorationTime).toLocaleString()
                    : `${interruption.restoreDate || ''} ${interruption.restoreTime || ''}`.trim() || '—'}
                </p>
              </div>
              <div className="field-group">
                <label>Duration</label>
                <p className="field-value">
                  {interruption.durationSeconds
                    ? `${Math.floor(interruption.durationSeconds / 60)} minutes`
                    : '—'}
                </p>
              </div>
            </>
          )}

          {editMode ? (
            <>
              <div className="field-group">
                <label>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  autoFocus
                />
              </div>
              <div className="drawer-actions">
                <button onClick={handleSaveNotes} disabled={isLoading} className="btn-primary">
                  {isLoading ? 'Saving…' : 'Save notes'}
                </button>
                <button onClick={() => { setEditMode(false); setNotes(interruption.notes || ''); }} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="field-group">
                <label>Notes</label>
                <p className="field-value">{interruption.notes || '—'}</p>
              </div>

              <div className="drawer-actions">
                <button onClick={() => setEditMode(true)} className="btn-secondary">
                  Edit notes
                </button>
                {isActive && canRestore && (
                  <button onClick={onRestore} disabled={isLoading} className="btn-primary">
                    {isLoading ? 'Restoring…' : '✓ Mark restored'}
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
