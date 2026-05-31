import './LoadingState.css';

interface LoadingStateProps {
  label?: string;
  inline?: boolean;
}

export default function LoadingState({ label = 'Loading…', inline = false }: LoadingStateProps) {
  if (inline) {
    return (
      <span className="loading-inline" role="status" aria-live="polite">
        <span className="loading-dot" aria-hidden />
        <span className="loading-dot" aria-hidden />
        <span className="loading-dot" aria-hidden />
        <span className="sr-only">{label}</span>
      </span>
    );
  }
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <p>{label}</p>
    </div>
  );
}
