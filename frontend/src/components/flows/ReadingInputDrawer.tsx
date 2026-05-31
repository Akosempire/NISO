import React, { useState, useEffect, useMemo } from 'react';
import './ReadingInputDrawer.css';

interface ReadingValues {
  amp: string;
  mw: string;
  mvar: string;
  kv: string;
  remarks: string;
}

interface ReadingInputDrawerProps {
  hour: number;
  equipmentId: string;
  equipmentName?: string;
  readings: any[];
  onSubmit: (values: ReadingValues) => void;
  onClose: () => void;
  isLoading: boolean;
}

const EMPTY: ReadingValues = { amp: '', mw: '', mvar: '', kv: '', remarks: '' };

export default function ReadingInputDrawer({
  hour,
  equipmentId,
  equipmentName,
  readings,
  onSubmit,
  onClose,
  isLoading
}: ReadingInputDrawerProps) {
  const [values, setValues] = useState<ReadingValues>(EMPTY);

  useEffect(() => {
    setValues(EMPTY);
  }, [equipmentId, hour]);

  const previous = useMemo(() => {
    const candidates = readings
      .filter((r) => r.equipmentId === equipmentId && r.hour < hour)
      .sort((a, b) => b.hour - a.hour);
    return candidates[0];
  }, [readings, equipmentId, hour]);

  const isComplete = values.amp && values.mw && values.mvar && values.kv;

  const handleField = (field: keyof ReadingValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || isLoading) return;
    onSubmit(values);
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="reading-drawer" role="dialog" aria-modal="true" aria-labelledby="reading-drawer-title">
        <header className="drawer-header">
          <button className="drawer-close" onClick={onClose} aria-label="Close">×</button>
          <h2 id="reading-drawer-title" className="drawer-title">Record Reading</h2>
          <p className="drawer-subtitle">
            {equipmentName || equipmentId} • Hour {String(hour).padStart(2, '0')}:00
          </p>
        </header>

        <form onSubmit={handleSave} className="drawer-body">
          {previous && (
            <div className="prev-reading">
              <div className="prev-label">Previous hour ({String(previous.hour).padStart(2, '0')}:00)</div>
              <div className="prev-grid">
                <div><span>AMP</span><b>{previous.amp ?? '—'}</b></div>
                <div><span>MW</span><b>{previous.mw ?? '—'}</b></div>
                <div><span>MVAR</span><b>{previous.mvar ?? '—'}</b></div>
                <div><span>KV</span><b>{previous.kv ?? '—'}</b></div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="reading-amp">
              Amperage (AMP) <span className="form-required">*</span>
            </label>
            <input
              id="reading-amp"
              className="form-input mono"
              type="number"
              step="0.1"
              value={values.amp}
              onChange={handleField('amp')}
              placeholder="e.g. 450.2"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reading-mw">
              MW (Real Power) <span className="form-required">*</span>
            </label>
            <input
              id="reading-mw"
              className="form-input mono"
              type="number"
              step="0.1"
              value={values.mw}
              onChange={handleField('mw')}
              placeholder="e.g. 125.5"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reading-mvar">
              MVAR (Reactive Power) <span className="form-required">*</span>
            </label>
            <input
              id="reading-mvar"
              className="form-input mono"
              type="number"
              step="0.1"
              value={values.mvar}
              onChange={handleField('mvar')}
              placeholder="e.g. 42.3"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reading-kv">
              Voltage (KV) <span className="form-required">*</span>
            </label>
            <input
              id="reading-kv"
              className="form-input mono"
              type="number"
              step="0.1"
              value={values.kv}
              onChange={handleField('kv')}
              placeholder="e.g. 330.1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reading-remarks">Remarks</label>
            <textarea
              id="reading-remarks"
              className="form-textarea"
              value={values.remarks}
              onChange={handleField('remarks')}
              placeholder="Optional context"
              rows={3}
            />
          </div>
        </form>

        <footer className="drawer-footer">
          <button
            type="submit"
            onClick={handleSave}
            disabled={!isComplete || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Saving…' : 'Save & Next'}
          </button>
          <button type="button" onClick={onClose} className="btn" disabled={isLoading}>
            Cancel
          </button>
        </footer>
      </aside>
    </>
  );
}
