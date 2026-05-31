import './ComingSoon.css';

interface ComingSoonProps {
  title: string;
  description?: string;
  features?: string[];
}

export default function ComingSoon({ title, description, features }: ComingSoonProps) {
  return (
    <div className="coming-soon">
      <div className="coming-soon-card">
        <div className="coming-soon-tag">Phase 2</div>
        <h2>{title}</h2>
        {description && <p className="coming-soon-description">{description}</p>}
        {features && features.length > 0 && (
          <>
            <div className="coming-soon-label">Planned scope</div>
            <ul className="coming-soon-features">
              {features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </>
        )}
        <p className="coming-soon-footnote">
          Tracked in BUILD_LOG.md under Phase 2. The data model, role permissions,
          and design tokens are already in place — only the UI module is pending.
        </p>
      </div>
    </div>
  );
}
