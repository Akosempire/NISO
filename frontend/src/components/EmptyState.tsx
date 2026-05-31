import './EmptyState.css';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="empty-state-card" role="status">
      {icon && <div className="empty-state-icon" aria-hidden>{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && (
        <button type="button" className="btn-secondary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
