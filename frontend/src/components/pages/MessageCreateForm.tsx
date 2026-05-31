import { useState } from 'react';
import './SLACreateForm.css';

interface MessageCreateFormProps {
  user: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const SEVERITIES = [
  { id: 'info', label: 'Info' },
  { id: 'warning', label: 'Warning' },
  { id: 'critical', label: 'Critical' }
];

export default function MessageCreateForm({
  user,
  onSubmit,
  onCancel,
  isLoading
}: MessageCreateFormProps) {
  const [form, setForm] = useState({
    type: 'BROADCAST' as 'BROADCAST' | 'DIRECT',
    severity: 'info' as 'info' | 'warning' | 'critical',
    toUserId: '',
    subject: '',
    content: ''
  });

  const isComplete =
    form.subject &&
    form.content &&
    (form.type === 'BROADCAST' || form.toUserId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;
    onSubmit({
      ...form,
      fromUserId: user?.id,
      fromName: user?.fullName
    });
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>Send message</h3>
        <p className="form-meta">
          Broadcasts notify every operator at the station. Direct messages target one user.
        </p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Type *</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as any })}
          >
            <option value="BROADCAST">📣 Broadcast (all operators)</option>
            <option value="DIRECT">✉ Direct (one recipient)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Severity</label>
          <select
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value as any })}
          >
            {SEVERITIES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        {form.type === 'DIRECT' && (
          <div className="form-group full-width">
            <label>Recipient *</label>
            <input
              type="text"
              value={form.toUserId}
              onChange={(e) => setForm({ ...form, toUserId: e.target.value })}
              placeholder="User ID or email"
              required
            />
          </div>
        )}

        <div className="form-group full-width">
          <label>Subject *</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="One-line summary"
            required
            autoFocus
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label>Message *</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Full content…"
          rows={5}
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={!isComplete || isLoading} className="btn-primary">
          {isLoading ? 'Sending…' : 'Send'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
