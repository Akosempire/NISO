import React, { useState } from 'react';
import './SLACreateForm.css';

interface SLACreateFormProps {
  feederId: string;
  hour: number;
  onSubmit: (values: any) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export default function SLACreateForm({ 
  feederId, 
  hour, 
  onSubmit, 
  isLoading, 
  onCancel 
}: SLACreateFormProps) {
  const [actualMw, setActualMw] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      hour,
      feederId,
      actualMw: actualMw ? parseFloat(actualMw) : undefined,
      remarks
    });
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <p className="form-meta">
          <strong>Feeder:</strong> {feederId} | <strong>Hour:</strong> {hour}:00
        </p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Actual (MW) *</label>
          <input
            type="number"
            value={actualMw}
            onChange={(e) => setActualMw(e.target.value)}
            step="0.01"
            placeholder="e.g., 450.50"
            autoFocus
            required
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label>Remarks</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
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
