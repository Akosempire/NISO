'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { Loader2, Plus, X } from 'lucide-react';

interface KnowledgeEditorProps {
  initialData?: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  };
  onSubmit: (data: any) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function KnowledgeEditor({
  initialData,
  onSubmit,
  onClose,
  isLoading = false,
}: KnowledgeEditorProps) {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: initialData || {
      title: '',
      content: '',
      category: '',
      tags: [],
    },
  });

  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const onSubmitForm = (data: any) => {
    onSubmit({
      ...data,
      tags,
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          {initialData ? 'Edit Article' : 'Create Article'}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        {/* Title */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Article title"
            {...register('title')}
            disabled={isLoading}
          />
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            {...register('category')}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Select category</option>
            <option value="Troubleshooting">Troubleshooting</option>
            <option value="Operations">Operations</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Safety">Safety</option>
            <option value="Procedures">Procedures</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTag}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  disabled={isLoading}
                  className="hover:text-indigo-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="content">Content</Label>
          <textarea
            id="content"
            placeholder="Article content (Markdown supported)..."
            {...register('content')}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono min-h-64"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Article'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
