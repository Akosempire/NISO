import { useState } from 'react';
import { useKnowledgeArticles, useSearchKnowledge } from '../../hooks/useKnowledge';
import KnowledgeArticlesList from '../../components/pages/KnowledgeArticlesList';
import KnowledgeDetailDrawer from '../../components/pages/KnowledgeDetailDrawer';
import AIAssistant from '../../components/pages/AIAssistant';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import './KnowledgePage.css';

export default function KnowledgePage({ user }: any) {
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showAI, setShowAI] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const { data: articles, isLoading } = useKnowledgeArticles();
  const { data: searchResults, isLoading: isSearching } = useSearchKnowledge(searchText);

  const displayData = searchText ? searchResults?.data : articles?.data;

  const filteredData = displayData?.filter((article: any) => {
    const matchesCategory =
      filterCategory === 'all' || article.category === filterCategory;
    return matchesCategory;
  }) || [];

  const categories: string[] = Array.from(
    new Set<string>(
      (articles?.data || []).map((a: any) => a.category).filter(Boolean)
    )
  );

  return (
    <div className="knowledge-page">
      <div className="page-header">
        <div className="page-title">
          <h2>Knowledge Center</h2>
          <p>Procedures, manuals, and operational guides</p>
        </div>
        <div className="page-actions">
          <button
            onClick={() => setShowAI(!showAI)}
            className="btn-primary"
          >
            {showAI ? 'Hide' : '🤖 Ask NISO AI'}
          </button>
        </div>
      </div>

      {showAI && (
        <AIAssistant user={user} onClose={() => setShowAI(false)} />
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="Search procedures, manuals, guides..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          {categories.map((cat: string) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {isLoading || isSearching ? (
        <LoadingState label={searchText ? 'Searching…' : 'Loading articles…'} />
      ) : filteredData.length === 0 ? (
        <EmptyState
          icon="📚"
          title={searchText ? 'No matches' : 'No articles yet'}
          description={
            searchText
              ? `Nothing matches "${searchText}". Try different terms or clear the search.`
              : 'Operational procedures, safety manuals, and policies will appear here.'
          }
          action={searchText ? { label: 'Clear search', onClick: () => setSearchText('') } : undefined}
        />
      ) : (
        <KnowledgeArticlesList
          data={filteredData}
          onSelect={setSelectedArticle}
          selectedId={selectedArticle?.id}
        />
      )}

      {selectedArticle && (
        <KnowledgeDetailDrawer
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
