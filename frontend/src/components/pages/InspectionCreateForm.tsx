import { useState } from 'react';
import './SLACreateForm.css';

interface InspectionCreateFormProps {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  equipmentOptions?: { id: string; name: string }[];
}

const TYPES = [
  { code: 'VIS', name: 'Visual Inspection' },
  { code: 'OIL', name: 'Oil Test & Analysis' },
  { code: 'ELE', name: 'Electrical Test' },
  { code: 'THM', name: 'Thermal Imaging' },
  { code: 'PRV', name: 'Preventive Maintenance' }
];

export default function InspectionCreateForm({
  onSubmit,
  onCancel,
  isLoading,
  equipmentOptions = []
}: InspectionCreateFormProps) {
  const [form, setForm] = useState({
    equipmentId: '',
    type: '',
    typeName: '',
    date: new Date().toISOString().split('T')[0],
    inspector: '',
    findings: ''
  });

  const isComplete = form.equipmentId && form.type && form.date && form.inspector;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;
    onSubmit(form);
  };

  const pickType = (code: string, name: string) =>
    setForm((f) => ({ ...f, type: code, typeName: name }));

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>New inspection</h3>
        <p className="form-meta">Saves as draft. Submit for supervisor approval afterward.</p>
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
              placeholder="Equipment ID"
              required
              autoFocus
            />
          )}
        </div>

        <div className="form-group full-width">
          <label>Inspection type *</label>
          <div className="cause-chips">
            {TYPES.map((t) => (
              <button
                key={t.code}
                type="button"
                className={`cause-chip ${form.type === t.code ? 'selected' : ''}`}
                onClick={() => pickType(t.code, t.name)}
                title={t.name}
              >
                {t.code}
              </button>
            ))}
          </div>
          {form.typeName && (
            <small className="cause-display">{form.type} — {form.typeName}</small>
          )}
        </div>

        <div className="form-group">
          <label>Date *</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Inspector *</label>
          <input
            type="text"
            value={form.inspector}
            onChange={(e) => setForm({ ...form, inspector: e.target.value })}
            placeholder="Name"
            required
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label>Findings</label>
        <textarea
          value={form.findings}
          onChange={(e) => setForm({ ...form, findings: e.target.value })}
          placeholder="Observations, measurements, anomalies…"
          rows={4}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={!isComplete || isLoading} className="btn-primary">
          {isLoading ? 'Saving…' : 'Save draft'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
