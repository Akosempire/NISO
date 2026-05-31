import './SLADetailDrawer.css';
import './KnowledgeArticlesList.css'; // reuse category/version/tag styles
import type { Article } from './KnowledgeArticlesList';

interface KnowledgeDetailDrawerProps {
  article: Article;
  onClose: () => void;
}

export default function KnowledgeDetailDrawer({ article, onClose }: KnowledgeDetailDrawerProps) {
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer drawer-wide" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>{article.title || 'Untitled'}</h3>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="drawer-content">
          <div className="field-group" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            {article.category && (
              <span className="article-category">{article.category}</span>
            )}
            {article.version != null && (
              <span className="article-version">v{article.version}</span>
            )}
            {article.updatedAt && (
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary, #6b7280)' }}>
                Updated {new Date(article.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {article.summary && (
            <div className="field-group">
              <label>Summary</label>
              <p className="field-value">{article.summary}</p>
            </div>
          )}

          <div className="field-group">
            <label>Content</label>
            <div className="article-body">{article.body || '(no content)'}</div>
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="field-group">
              <label>Tags</label>
              <div className="article-tags">
                {article.tags.map((tag) => (
                  <span key={tag} className="article-tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="drawer-actions">
            <button onClick={onClose} className="btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
