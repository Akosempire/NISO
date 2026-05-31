import { useEffect, useState } from 'react';
import './ReviewDrawer.css';

export type ReviewKind = 'reading-correction' | 'sla-approval' | 'inspection-signoff';

export interface ReviewItem {
  id: string;
  kind: ReviewKind;
  title: string;
  submittedBy: string;
  submittedAt: string;
  equipment?: string;
  hour?: number;
  before?: Record<string, string | number | null>;
  after?: Record<string, string | number | null>;
  notes?: string;
}

interface ReviewDrawerProps {
  item: ReviewItem;
  onApprove: (id: string, comment: string) => void;
  onReject: (id: string, comment: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const KIND_LABEL: Record<ReviewKind, string> = {
  'reading-correction': 'Reading correction',
  'sla-approval': 'SLA entry',
  'inspection-signoff': 'Inspection sign-off'
};

const formatValue = (v: string | number | null | undefined) =>
  v === null || v === undefined || v === '' ? '—' : String(v);

export default function ReviewDrawer({
  item,
  onApprove,
  onReject,
  onClose,
  isLoading = false
}: ReviewDrawerProps) {
  const [comment, setComment] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const diffFields = new Set([
    ...Object.keys(item.before || {}),
    ...Object.keys(item.after || {})
  ]);

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside
        className="review-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-drawer-title"
      >
        <header className="drawer-header">
          <button className="drawer-close" onClick={onClose} aria-label="Close">×</button>
          <h2 id="review-drawer-title" className="drawer-title">{item.title}</h2>
          <p className="drawer-subtitle">
            {KIND_LABEL[item.kind]} • submitted by {item.submittedBy}
          </p>
        </header>

        <div className="drawer-body">
          <div className="review-meta">
            {item.equipment && <span><b>Equipment</b> {item.equipment}</span>}
            {item.hour !== undefined && (
              <span><b>Hour</b> <span className="mono">{String(item.hour).padStart(2, '0')}:00</span></span>
            )}
            <span><b>Submitted</b> {item.submittedAt}</span>
          </div>

          {diffFields.size > 0 && (
            <div className="diff-section">
              <div className="diff-section-title">Proposed change</div>
              <table className="diff-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Before</th>
                    <th>After</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(diffFields).map((field) => {
                    const before = item.before?.[field];
                    const after = item.after?.[field];
                    const changed = String(before ?? '') !== String(after ?? '');
                    return (
                      <tr key={field} className={changed ? 'diff-changed' : ''}>
                        <td>{field}</td>
                        <td className="mono">{formatValue(before)}</td>
                        <td className="mono">{formatValue(after)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {item.notes && (
            <div className="review-notes">
              <div className="review-notes-label">Submitter notes</div>
              <p>{item.notes}</p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="review-comment">Review comment</label>
            <textarea
              id="review-comment"
              className="form-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Required when rejecting; optional when approving."
              rows={3}
            />
          </div>
        </div>

        <footer className="drawer-footer review-footer">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onApprove(item.id, comment)}
            disabled={isLoading}
          >
            {isLoading ? 'Saving…' : 'Approve'}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onReject(item.id, comment)}
            disabled={isLoading || !comment.trim()}
            title={!comment.trim() ? 'Add a comment to reject' : ''}
          >
            Reject
          </button>
          <button type="button" className="btn" onClick={onClose} disabled={isLoading}>
            Close
          </button>
        </footer>
      </aside>
    </>
  );
}
