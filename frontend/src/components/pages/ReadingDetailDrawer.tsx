import { useState } from 'react';
import './SLADetailDrawer.css'; // reuse drawer styles

interface ReadingDetailDrawerProps {
  reading: any;
  user: any;
  onSeal: () => void;
  onUpdate: (values: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function ReadingDetailDrawer({
  reading,
  user,
  onSeal,
  onUpdate,
  onClose,
  isLoading,
}: ReadingDetailDrawerProps) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    mw:          reading.mw          ?? '',
    mvar:        reading.mvar        ?? '',
    kv:          reading.kv          ?? '',
    amperage:    reading.amperage    ?? '',
    temperature: reading.temperature ?? '',
    rawInput:    reading.rawInput    ?? '',
    valueType:   reading.valueType   ?? 'number',
    remarks:     reading.remarks     ?? '',
  });

  const isSealed  = reading.status === 'sealed';
  const canSeal   = ['SUPERVISOR', 'STATION_ADMIN', 'HQ_ADMIN'].includes(user?.role ?? '');
  const canEdit   = !isSealed && canSeal;

  const eqName =
    typeof reading.equipmentId === 'object' && reading.equipmentId
      ? reading.equipmentId.name
      : reading.equipmentId ?? '—';

  const handleUpdate = async () => {
    const payload: any = {};
    if (form.valueType === 'code') {
      payload.rawInput  = form.rawInput;
      payload.valueType = 'code';
    } else {
      ['mw', 'mvar', 'kv', 'amperage', 'temperature'].forEach((key) => {
        const v = form[key as keyof typeof form];
        payload[key] = v !== '' ? parseFloat(v as string) : null;
      });
      payload.valueType = 'number';
    }
    payload.remarks = form.remarks;
    await onUpdate(payload);
    setEditMode(false);
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>Reading — {reading.hour}:00</h3>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="drawer-content">
          <div className="field-group">
            <label>Equipment</label>
            <p className="field-value">{eqName}</p>
          </div>

          <div className="field-group">
            <label>Date</label>
            <p className="field-value">
              {reading.date ? new Date(reading.date).toLocaleDateString() : '—'}
            </p>
          </div>

          <div className="field-group">
            <label>Status</label>
            <p className={`field-value ${isSealed ? 'success' : 'warning'}`}>
              {isSealed ? '🔒 Sealed' : '○ Pending'}
            </p>
          </div>

          {editMode ? (
            <>
              <div className="field-group">
                <label>Input Type</label>
                <select
                  value={form.valueType}
                  onChange={(e) => setForm({ ...form, valueType: e.target.value })}
                >
                  <option value="number">Numeric</option>
                  <option value="code">Code (O/S, etc.)</option>
                </select>
              </div>

              {form.valueType === 'code' ? (
                <div className="field-group">
                  <label>Operational Code</label>
                  <input
                    type="text"
                    value={form.rawInput}
                    onChange={(e) => setForm({ ...form, rawInput: e.target.value })}
                    placeholder="e.g. O/S, N/A"
                    autoFocus
                  />
                </div>
              ) : (
                <>
                  {(['mw', 'mvar', 'kv', 'amperage', 'temperature'] as const).map((field) => (
                    <div className="field-group" key={field}>
                      <label>{field.toUpperCase()}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={form[field]}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      />
                    </div>
                  ))}
                </>
              )}

              <div className="field-group">
                <label>Remarks</label>
                <textarea
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  rows={2}
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
                <button onClick={() => setEditMode(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {reading.valueType === 'code' ? (
                <div className="field-group">
                  <label>Operational Code</label>
                  <p className="field-value">{reading.rawInput || '—'}</p>
                </div>
              ) : (
                <>
                  <div className="field-group"><label>MW</label><p className="field-value">{reading.mw ?? '—'}</p></div>
                  <div className="field-group"><label>MVAR</label><p className="field-value">{reading.mvar ?? '—'}</p></div>
                  <div className="field-group"><label>KV</label><p className="field-value">{reading.kv ?? '—'}</p></div>
                  <div className="field-group"><label>Amperage</label><p className="field-value">{reading.amperage ?? '—'}</p></div>
                  <div className="field-group"><label>Temperature</label><p className="field-value">{reading.temperature ?? '—'}</p></div>
                </>
              )}

              <div className="field-group">
                <label>Remarks</label>
                <p className="field-value">{reading.remarks || '—'}</p>
              </div>

              {isSealed && (
                <div className="field-group">
                  <label>Sealed At</label>
                  <p className="field-value success">
                    {reading.sealedAt ? new Date(reading.sealedAt).toLocaleString() : '—'}
                  </p>
                </div>
              )}

              <div className="drawer-actions">
                {canEdit && (
                  <button onClick={() => setEditMode(true)} className="btn-secondary">
                    Edit
                  </button>
                )}
                {!isSealed && canSeal && (
                  <button
                    onClick={onSeal}
                    disabled={isLoading}
                    className="btn-primary"
                    title="Seal this reading — cannot be undone"
                  >
                    {isLoading ? 'Sealing...' : '🔒 Seal Reading'}
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
