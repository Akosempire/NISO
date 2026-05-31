import { useState } from 'react';
import './SLACreateForm.css'; // reuse form styles

interface InterruptionCreateFormProps {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  equipmentOptions?: { id: string; name: string }[];
}

const CAUSES = [
  { code: 'OVL', name: 'Overload' },
  { code: 'FLT', name: 'Fault' },
  { code: 'MNT', name: 'Maintenance' },
  { code: 'WTR', name: 'Weather' },
  { code: 'EQF', name: 'Equipment Failure' },
  { code: 'TST', name: 'Testing' },
  { code: 'OTH', name: 'Other' }
];

const todayISO = () => new Date().toISOString().split('T')[0];
const nowHHMM = () => new Date().toTimeString().slice(0, 5);

export default function InterruptionCreateForm({
  onSubmit,
  onCancel,
  isLoading,
  equipmentOptions = []
}: InterruptionCreateFormProps) {
  const [form, setForm] = useState({
    equipmentId: '',
    causeCode: '',
    causeName: '',
    tripDate: todayISO(),
    tripTime: nowHHMM(),
    notes: ''
  });

  const isComplete = form.equipmentId && form.causeCode && form.tripDate && form.tripTime;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;
    onSubmit({ ...form, status: 'Active' });
  };

  const pickCause = (code: string, name: string) =>
    setForm((f) => ({ ...f, causeCode: code, causeName: name }));

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>Log new interruption</h3>
        <p className="form-meta">Equipment will move to Active until restored.</p>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Equipment *</label>
          {equipmentOptions.length > 0 ? (
            <select
              value={form.equipmentId}
              onChange={(e) => setForm({ ...form, equipmentId: e.target.value })}
              required
            >
              <option value="">Select equipment…</option>
              {equipmentOptions.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={form.equipmentId}
              onChange={(e) => setForm({ ...form, equipmentId: e.target.value })}
              placeholder="Equipment ID (e.g. 2JEB-SGB1)"
              required
              autoFocus
            />
          )}
        </div>

        <div className="form-group full-width">
          <label>Cause *</label>
          <div className="cause-chips">
            {CAUSES.map((c) => (
              <button
                key={c.code}
                type="button"
                className={`cause-chip ${form.causeCode === c.code ? 'selected' : ''}`}
                onClick={() => pickCause(c.code, c.name)}
                title={c.name}
              >
                {c.code}
              </button>
            ))}
          </div>
          {form.causeName && (
            <small className="cause-display">{form.causeCode} — {form.causeName}</small>
          )}
        </div>

        <div className="form-group">
          <label>Trip date *</label>
          <input
            type="date"
            value={form.tripDate}
            onChange={(e) => setForm({ ...form, tripDate: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Trip time *</label>
          <input
            type="time"
            value={form.tripTime}
            onChange={(e) => setForm({ ...form, tripTime: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label>Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Operational details…"
          rows={2}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={!isComplete || isLoading} className="btn-primary">
          {isLoading ? 'Logging…' : 'Log interruption'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
