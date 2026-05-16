'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { KnowledgeArticleList } from '@/components/knowledge/knowledge-article-list';
import { KnowledgeEditor } from '@/components/knowledge/knowledge-editor';
import { useState } from 'react';

const mockOperator = {
  id: 'user-1',
  email: 'operator@niso.gov',
  name: 'John Operator',
  role: 'OPERATOR',
};

const mockArticles = [
  {
    id: '1',
    title: 'Circuit Breaker Maintenance Procedures',
    content: 'Detailed procedures for maintaining circuit breakers...',
    category: 'Maintenance',
    tags: ['circuit-breaker', 'maintenance', 'procedures'],
    isPublished: true,
    author: { name: 'John Smith' },
    createdAt: '2024-04-15',
    viewCount: 45,
  },
  {
    id: '2',
    title: 'Transformer Oil Testing Guidelines',
    content: 'Guidelines for testing transformer oil quality...',
    category: 'Testing',
    tags: ['transformer', 'oil', 'testing'],
    isPublished: true,
    author: { name: 'Sarah Johnson' },
    createdAt: '2024-04-10',
    viewCount: 32,
  },
];

export default function KnowledgePage() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);

  return (
    <MainLayout user={mockOperator}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-gray-600 mt-1">Access documentation and procedures</p>
          </div>
          <button
            onClick={() => setShowEditor(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Add Article
          </button>
        </div>

        <KnowledgeArticleList
          articles={mockArticles}
          onEdit={(article) => {
            setEditingArticle(article);
            setShowEditor(true);
          }}
          onDelete={(id) => console.log('Delete:', id)}
        />

        {showEditor && (
          <KnowledgeEditor
            article={editingArticle}
            onClose={() => {
              setShowEditor(false);
              setEditingArticle(null);
            }}
            onSave={(data) => {
              console.log('Save:', data);
              setShowEditor(false);
              setEditingArticle(null);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}