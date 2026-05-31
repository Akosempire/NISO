import { useState } from 'react';
import { useCreateReport } from '../../hooks/useReports';
import { toast } from '../../stores/toastStore';
import './SLACreateForm.css';

interface ReportBuilderProps {
  user: any;
  onCreate: () => void;
  onCancel: () => void;
}

const TYPES = [
  { id: 'DAILY_OPS', label: 'Daily Operations Summary' },
  { id: 'SLA_REPORT', label: 'SLA Compliance Report' },
  { id: 'INTERRUPTIONS', label: 'Interruptions Report' },
  { id: 'READINGS', label: 'Readings Export' },
  { id: 'INSPECTIONS', label: 'Inspections Log' }
];

const FREQUENCIES: { id: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'; label: string }[] = [
  { id: 'DAILY', label: 'Daily' },
  { id: 'WEEKLY', label: 'Weekly' },
  { id: 'MONTHLY', label: 'Monthly' },
  { id: 'CUSTOM', label: 'Custom range' }
];

export default function ReportBuilder({ user, onCreate, onCancel }: ReportBuilderProps) {
  const createReport = useCreateReport();
  const [form, setForm] = useState({
    name: '',
    type: TYPES[0].id,
    frequency: 'DAILY' as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM',
    rangeStart: new Date().toISOString().split('T')[0],
    rangeEnd: new Date().toISOString().split('T')[0]
  });

  const isComplete = form.name && form.type && form.frequency;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;
    try {
      await createReport.mutateAsync({
        ...form,
        stationId: user.station?.id
      });
      onCreate();
    } catch (error: any) {
      toast.error('Report generation failed', error.message);
    }
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>Create report</h3>
        <p className="form-meta">Generated reports stay attached to the station for export.</p>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Report name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. December SLA Compliance"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>Type *</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            required
          >
            {TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Frequency *</label>
          <select
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}
            required
          >
            {FREQUENCIES.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>

        {form.frequency === 'CUSTOM' && (
          <>
            <div className="form-group">
              <label>From</label>
              <input
                type="date"
                value={form.rangeStart}
                onChange={(e) => setForm({ ...form, rangeStart: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>To</label>
              <input
                type="date"
                value={form.rangeEnd}
                onChange={(e) => setForm({ ...form, rangeEnd: e.target.value })}
              />
            </div>
          </>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          disabled={!isComplete || createReport.isLoading}
          className="btn-primary"
        >
          {createReport.isLoading ? 'Generating…' : 'Generate report'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
