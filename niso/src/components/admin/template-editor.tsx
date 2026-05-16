'use client';

import { Edit2, Save, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Template {
  id: string;
  name: string;
  description: string;
  type: string;
  fields: Array<{
    id: string;
    name: string;
    label: string;
    type: string;
    options?: string[];
  }>;
}

interface TemplateEditorProps {
  templates: Template[];
  onSave: (template: Template) => void;
  onDelete: (id: string) => void;
}

export function TemplateEditor({ templates, onSave, onDelete }: TemplateEditorProps) {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (template: Template) => {
    setIsLoading(true);
    try {
      await onSave(template);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {templates.map((template) => (
        <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6">
          {editingTemplate?.id === template.id ? (
            <TemplateForm
              template={editingTemplate}
              onSave={handleSave}
              onCancel={() => setEditingTemplate(null)}
              isLoading={isLoading}
            />
          ) : (
            <TemplateView
              template={template}
              onEdit={() => setEditingTemplate(template)}
              onDelete={() => handleDelete(template.id)}
            />
          )}
        </div>
      ))}

      {templates.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No templates found.</p>
        </div>
      )}
    </div>
  );
}

function TemplateView({ template, onEdit, onDelete }: {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
          <p className="text-sm text-gray-600">{template.description}</p>
          <span className="inline-flex px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full mt-2">
            {template.type}
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button onClick={onDelete} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Fields:</h4>
        {template.fields.map((field) => (
          <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-gray-900">{field.label}</span>
              <span className="text-sm text-gray-500 ml-2">({field.type})</span>
              {field.options && (
                <span className="text-xs text-gray-600 ml-2">
                  Options: {field.options.join(', ')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplateForm({ template, onSave, onCancel, isLoading }: {
  template: Template;
  onSave: (template: Template) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState(template);

  const addField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      name: '',
      label: '',
      type: 'TEXT',
      options: [],
    };
    setFormData({
      ...formData,
      fields: [...formData.fields, newField],
    });
  };

  const updateField = (index: number, field: any) => {
    const newFields = [...formData.fields];
    newFields[index] = field;
    setFormData({ ...formData, fields: newFields });
  };

  const removeField = (index: number) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: newFields });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Template name"
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="EQUIPMENT">Equipment</option>
            <option value="READING">Reading</option>
            <option value="INSPECTION">Inspection</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Template description"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Fields</h4>
          <Button onClick={addField} variant="outline" size="sm">
            Add Field
          </Button>
        </div>

        {formData.fields.map((field, index) => (
          <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Field Name</Label>
                <Input
                  value={field.name}
                  onChange={(e) => updateField(index, { ...field, name: e.target.value })}
                  placeholder="field_name"
                />
              </div>
              <div>
                <Label>Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(index, { ...field, label: e.target.value })}
                  placeholder="Field Label"
                />
              </div>
              <div>
                <Label>Type</Label>
                <select
                  value={field.type}
                  onChange={(e) => updateField(index, { ...field, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="TEXT">Text</option>
                  <option value="NUMBER">Number</option>
                  <option value="SELECT">Select</option>
                  <option value="CHECKBOX">Checkbox</option>
                  <option value="TEXTAREA">Textarea</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => removeField(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {field.type === 'SELECT' && (
              <div className="mt-4">
                <Label>Options (comma-separated)</Label>
                <Input
                  value={field.options?.join(', ') || ''}
                  onChange={(e) => updateField(index, {
                    ...field,
                    options: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Template
        </Button>
      </div>
    </div>
  );
}