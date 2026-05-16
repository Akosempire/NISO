'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { KnowledgeArticleList } from '@/components/knowledge/knowledge-article-list';
import { KnowledgeEditor } from '@/components/knowledge/knowledge-editor';
import { useState } from 'react';

const mockArticles = [
  { id: 'art-1', title: 'Troubleshooting 330kV Circuit Breakers', category: 'Troubleshooting', status: 'PUBLISHED', author: 'John Admin', tags: ['circuit-breaker', '330kv', 'maintenance'], viewCount: 245, createdAt: '2026-05-01' },
  { id: 'art-2', title: 'SLA Entry Procedures', category: 'Procedures', status: 'PUBLISHED', author: 'Jane Operator', tags: ['sla', 'procedures', 'operations'], viewCount: 156, createdAt: '2026-04-28' },
  { id: 'art-3', title: 'Monthly Sealing Workflow', category: 'Procedures', status: 'DRAFT', author: 'Admin User', tags: ['monthly', 'lifecycle'], viewCount: 0, createdAt: '2026-05-05' },
];

export default function KnowledgeArticlesPage() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader title="Articles" description="Operational guides, procedures, and reference material" />

        <KnowledgeArticleList
          articles={mockArticles}
          onView={(id) => console.log('View:', id)}
          onEdit={() => setShowEditor(true)}
          onDelete={(id) => console.log('Delete:', id)}
          onCreate={() => setShowEditor(true)}
        />

        {showEditor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <KnowledgeEditor
                onClose={() => setShowEditor(false)}
                onSubmit={(data) => {
                  console.log('Save:', data);
                  setShowEditor(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
