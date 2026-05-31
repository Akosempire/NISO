import './KnowledgeArticlesList.css';

export interface Article {
  _id?: string;
  id?: string;
  title?: string;
  category?: string;
  summary?: string;
  body?: string;
  version?: number | string;
  updatedAt?: string;
  tags?: string[];
}

interface KnowledgeArticlesListProps {
  data: Article[];
  onSelect: (article: Article) => void;
  selectedId?: string;
}

export default function KnowledgeArticlesList({
  data,
  onSelect,
  selectedId
}: KnowledgeArticlesListProps) {
  return (
    <ul className="article-list">
      {data.map((a) => {
        const id = a._id || a.id || '';
        return (
          <li key={id}>
            <button
              type="button"
              className={`article-item ${selectedId === id ? 'selected' : ''}`}
              onClick={() => onSelect(a)}
            >
              <div className="article-item-head">
                <div>
                  <h3>{a.title || 'Untitled'}</h3>
                  {a.category && <span className="article-category">{a.category}</span>}
                </div>
                {a.version != null && (
                  <span className="article-version">v{a.version}</span>
                )}
              </div>
              {a.summary && <p className="article-summary">{a.summary}</p>}
              <div className="article-meta">
                {a.updatedAt && <span>Updated {new Date(a.updatedAt).toLocaleDateString()}</span>}
                {a.tags && a.tags.length > 0 && (
                  <span className="article-tags">
                    {a.tags.map((tag) => <span key={tag} className="article-tag">#{tag}</span>)}
                  </span>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
