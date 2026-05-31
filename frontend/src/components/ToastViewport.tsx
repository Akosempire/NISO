import { useEffect } from 'react';
import { useToastStore, Toast } from '../stores/toastStore';
import './ToastViewport.css';

const ICON_BY_KIND: Record<Toast['kind'], string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕'
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const duration = toast.durationMs ?? 5000;
    if (duration <= 0) return;
    const handle = window.setTimeout(() => dismiss(toast.id), duration);
    return () => window.clearTimeout(handle);
  }, [toast.id, toast.durationMs, dismiss]);

  return (
    <div className={`toast toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
      <span className="toast-icon" aria-hidden>{ICON_BY_KIND[toast.kind]}</span>
      <div className="toast-body">
        <div className="toast-message">{toast.message}</div>
        {toast.description && <div className="toast-description">{toast.description}</div>}
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

export default function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
