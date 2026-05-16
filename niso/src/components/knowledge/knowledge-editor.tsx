'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  tags: z.string(),
  isPublished: z.boolean(),
});

interface Article {
  id?: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublished: boolean;
}

interface KnowledgeEditorProps {
  article?: Article | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function KnowledgeEditor({ article, onClose, onSave }: KnowledgeEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(article?.tags || []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: article?.title || '',
      content: article?.content || '',
      category: article?.category || '',
      tags: article?.tags?.join(', ') || '',
      isPublished: article?.isPublished || false,
    },
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags.join(', '));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags.join(', '));
  };

  const onFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const formData = {
        ...data,
        tags,
      };
      onSave(formData);
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {article ? 'Edit Article' : 'Create New Article'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Title
              </Label>
              <Input
                {...register('title')}
                placeholder="Article title"
                className="mt-1"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category
              </Label>
              <select
                {...register('category')}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Category</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Operations">Operations</option>
                <option value="Safety">Safety</option>
                <option value="Testing">Testing</option>
                <option value="Procedures">Procedures</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">
              Tags
            </Label>
            <div className="mt-1 flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="content" className="text-sm font-medium text-gray-700">
              Content
            </Label>
            <textarea
              {...register('content')}
              rows={10}
              placeholder="Article content (supports markdown)"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              {...register('isPublished')}
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
            />
            <Label className="text-sm text-gray-700">Publish immediately</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {article ? 'Update Article' : 'Create Article'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}