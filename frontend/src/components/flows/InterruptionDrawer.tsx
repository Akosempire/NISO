import React, { useState, useEffect } from 'react';
import './InterruptionDrawer.css';

export interface InterruptionFormValues {
  equipmentId: string;
  causeCode: string;
  causeName: string;
  tripDate: string;
  tripTime: string;
  restoreDate?: string;
  restoreTime?: string;
  notes?: string;
}

interface InterruptionDrawerProps {
  mode: 'create' | 'restore';
  initial?: Partial<InterruptionFormValues> & { id?: string; equipment?: { name?: string } };
  equipment?: { id: string; name: string }[];
  onSubmit: (values: InterruptionFormValues) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const CAUSES = [
  { code: 'OVL', name: 'Overload', category: 'Electrical' },
  { code: 'FLT', name: 'Fault', category: 'Electrical' },
  { code: 'MNT', name: 'Maintenance', category: 'Scheduled' },
  { code: 'WTR', name: 'Weather', category: 'External' },
  { code: 'EQF', name: 'Equipment Failure', category: 'Hardware' },
  { code: 'TST', name: 'Testing', category: 'Operational' },
  { code: 'OTH', name: 'Other', category: 'Unclassified' }
];

const DEFAULT_EQUIPMENT = [
  { id: '2JEB-SGB1', name: '2JEB-SGB1' },
  { id: '2JEB-KNJ1', name: '2JEB-KNJ1' },
  { id: '2SHR TR1', name: '2SHR TR1' },
  { id: '2SHR-KTP1', name: '2SHR-KTP1' }
];

const todayISO = () => new Date().toISOString().split('T')[0];
const nowHHMM = () => new Date().toTimeString().slice(0, 5);

export default function InterruptionDrawer({
  mode,
  initial,
  equipment,
  onSubmit,
  onClose,
  isLoading = false
}: InterruptionDrawerProps) {
  const list = equipment && equipment.length > 0 ? equipment : DEFAULT_EQUIPMENT;

  const [values, setValues] = useState<InterruptionFormValues>({
    equipmentId: initial?.equipmentId || '',
    causeCode: initial?.causeCode || '',
    causeName: initial?.causeName || '',
    tripDate: initial?.tripDate || todayISO(),
    tripTime: initial?.tripTime || nowHHMM(),
    restoreDate: initial?.restoreDate || (mode === 'restore' ? todayISO() : ''),
    restoreTime: initial?.restoreTime || (mode === 'restore' ? nowHHMM() : ''),
    notes: initial?.notes || ''
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = <K extends keyof InterruptionFormValues>(field: K, value: InterruptionFormValues[K]) =>
    setValues((v) => ({ ...v, [field]: value }));

  const pickCause = (code: string, name: string) =>
    setValues((v) => ({ ...v, causeCode: code, causeName: name }));

  const isComplete =
    values.equipmentId && values.causeCode && values.tripDate && values.tripTime &&
    (mode === 'create' || (values.restoreDate && values.restoreTime));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || isLoading) return;
    onSubmit(values);
  };

  const equipmentLabel =
    list.find((e) => e.id === values.equipmentId)?.name ||
    initial?.equipment?.name ||
    'Select equipment';

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside
        className="interruption-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="interruption-drawer-title"
      >
        <header className="drawer-header">
          <button className="drawer-close" onClick={onClose} aria-label="Close">×</button>
          <h2 id="interruption-drawer-title" className="drawer-title">
            {mode === 'restore' ? 'Restore Interruption' : 'New Interruption'}
          </h2>
          <p className="drawer-subtitle">{equipmentLabel}</p>
        </header>

        <form onSubmit={handleSubmit} className="drawer-body">
          <div className="form-group">
            <label className="form-label" htmlFor="int-equipment">
              Equipment <span className="form-required">*</span>
            </label>
            <select
              id="int-equipment"
              className="form-select"
              value={values.equipmentId}
              onChange={(e) => set('equipmentId', e.target.value)}
              disabled={mode === 'restore'}
              required
            >
              <option value="">Select equipment…</option>
              {list.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Cause <span className="form-required">*</span>
            </label>
            <div className="codes-grid">
              {CAUSES.map((c) => (
                <button
                  type="button"
                  key={c.code}
                  className={`code-chip ${values.causeCode === c.code ? 'selected' : ''}`}
                  onClick={() => pickCause(c.code, c.name)}
                  title={`${c.name} — ${c.category}`}
                >
                  {c.code}
                </button>
              ))}
            </div>
            {values.causeName && (
              <div className="cause-display mono">{values.causeCode} — {values.causeName}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="trip-date">
                Trip date <span className="form-required">*</span>
              </label>
              <input
                id="trip-date"
                className="form-input"
                type="date"
                value={values.tripDate}
                onChange={(e) => set('tripDate', e.target.value)}
                disabled={mode === 'restore'}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="trip-time">
                Trip time <span className="form-required">*</span>
              </label>
              <input
                id="trip-time"
                className="form-input mono"
                type="time"
                value={values.tripTime}
                onChange={(e) => set('tripTime', e.target.value)}
                disabled={mode === 'restore'}
                required
              />
            </div>
          </div>

          {mode === 'restore' && (
            <>
              <div className="restore-banner">
                Restoration logs end of outage. Equipment moves to history.
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="restore-date">
                    Restore date <span className="form-required">*</span>
                  </label>
                  <input
                    id="restore-date"
                    className="form-input"
                    type="date"
                    value={values.restoreDate}
                    onChange={(e) => set('restoreDate', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="restore-time">
                    Restore time <span className="form-required">*</span>
                  </label>
                  <input
                    id="restore-time"
                    className="form-input mono"
                    type="time"
                    value={values.restoreTime}
                    onChange={(e) => set('restoreTime', e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="int-notes">Notes</label>
            <textarea
              id="int-notes"
              className="form-textarea"
              value={values.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Operational details…"
              rows={3}
            />
          </div>
        </form>

        <footer className="drawer-footer">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!isComplete || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Saving…' : mode === 'restore' ? 'Log restoration' : 'Log interruption'}
          </button>
          <button type="button" onClick={onClose} className="btn" disabled={isLoading}>
            Cancel
          </button>
        </footer>
      </aside>
    </>
  );
}
