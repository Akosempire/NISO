import React, { useState } from 'react';
import './SLACreateForm.css'; // reuse form styles

interface ReadingCreateFormProps {
  hour: number;
  equipmentId?: string;
  equipmentName?: string;
  onSubmit: (values: any) => void;
  isLoading: boolean;
  onCancel: () => void;
}

type ValueType = 'number' | 'code';

export default function ReadingCreateForm({
  hour,
  equipmentId,
  equipmentName,
  onSubmit,
  isLoading,
  onCancel,
}: ReadingCreateFormProps) {
  const [valueType, setValueType] = useState<ValueType>('number');
  const [form, setForm] = useState({
    mw:          '',
    mvar:        '',
    kv:          '',
    amperage:    '',
    temperature: '',
    rawInput:    '',
    remarks:     '',
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = { valueType };
    if (equipmentId) payload.equipmentId = equipmentId;

    if (valueType === 'code') {
      if (!form.rawInput.trim()) return;
      payload.rawInput = form.rawInput.trim();
    } else {
      (['mw', 'mvar', 'kv', 'amperage', 'temperature'] as const).forEach((key) => {
        payload[key] = form[key] !== '' ? parseFloat(form[key]) : null;
      });
    }

    payload.remarks = form.remarks.trim() || null;

    onSubmit(payload);
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <p className="form-meta">
          {equipmentName && <><strong>Equipment:</strong> {equipmentName} | </>}
          <strong>Hour:</strong> {hour}:00
        </p>
      </div>

      {/* Value type toggle */}
      <div className="form-group">
        <label>Input Type</label>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            type="button"
            className={valueType === 'number' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setValueType('number')}
            style={{ flex: 1 }}
          >
            Numeric
          </button>
          <button
            type="button"
            className={valueType === 'code' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setValueType('code')}
            style={{ flex: 1 }}
            title="For operational codes like O/S (Out of Service)"
          >
            Code (O/S)
          </button>
        </div>
      </div>

      {valueType === 'code' ? (
        <div className="form-group">
          <label>Operational Code *</label>
          <input
            type="text"
            value={form.rawInput}
            onChange={set('rawInput')}
            placeholder="e.g. O/S, N/A, MAINT"
            autoFocus
            required
          />
          <small style={{ color: '#888', fontSize: '11px' }}>
            Use O/S for Out of Service, N/A for Not Available, etc.
          </small>
        </div>
      ) : (
        <div className="form-grid">
          <div className="form-group">
            <label>MW</label>
            <input
              type="number"
              step="0.01"
              value={form.mw}
              onChange={set('mw')}
              placeholder="e.g. 450.50"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>MVAR</label>
            <input
              type="number"
              step="0.01"
              value={form.mvar}
              onChange={set('mvar')}
              placeholder="e.g. 120.00"
            />
          </div>
          <div className="form-group">
            <label>KV</label>
            <input
              type="number"
              step="0.01"
              value={form.kv}
              onChange={set('kv')}
              placeholder="e.g. 132.5"
            />
          </div>
          <div className="form-group">
            <label>Amperage</label>
            <input
              type="number"
              step="0.01"
              value={form.amperage}
              onChange={set('amperage')}
              placeholder="e.g. 850.0"
            />
          </div>
          <div className="form-group">
            <label>Temperature (°C)</label>
            <input
              type="number"
              step="0.1"
              value={form.temperature}
              onChange={set('temperature')}
              placeholder="e.g. 42.5"
            />
          </div>
        </div>
      )}

      <div className="form-group full-width">
        <label>Remarks</label>
        <textarea
          value={form.remarks}
          onChange={set('remarks')}
          placeholder="Any additional context..."
          rows={2}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Saving...' : 'Save & Next'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
