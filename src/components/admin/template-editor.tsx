'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit2, Save, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: string;
  unit?: string;
  isRequired: boolean;
  isProtected: boolean;
  order: number;
}

interface TemplateEditorProps {
  templateId: string;
  templateName: string;
  fields: TemplateField[];
  onSave: (fields: TemplateField[]) => void;
  isLoading?: boolean;
}

export function TemplateEditor({
  templateId,
  templateName,
  fields,
  onSave,
  isLoading = false,
}: TemplateEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingFields, setEditingFields] = useState(fields);

  const fieldTypes = ['NUMBER', 'TEXT', 'CODE', 'SELECT', 'DATE', 'TIME', 'DATETIME', 'BOOLEAN', 'TEXTAREA'];

  const handleFieldChange = (index: number, key: string, value: any) => {
    const updated = [...editingFields];
    updated[index] = { ...updated[index], [key]: value };
    setEditingFields(updated);
  };

  const handleAddField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      name: '',
      label: '',
      type: 'TEXT',
      isRequired: false,
      isProtected: false,
      order: editingFields.length + 1,
    };
    setEditingFields([...editingFields, newField]);
  };

  const handleRemoveField = (index: number) => {
    setEditingFields(editingFields.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(editingFields);
    setIsEditing(false);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{templateName}</h2>
          <p className="text-xs text-gray-500 mt-1">ID: {templateId}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          disabled={isLoading}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {editingFields.map((field, index) => (
          <Card
            key={field.id}
            className={`p-4 border-l-4 ${
              isEditing
                ? 'border-l-blue-500 bg-blue-50'
                : 'border-l-gray-300 hover:bg-gray-50'
            }`}
          >
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Field Name</Label>
                  <Input
                    value={field.name}
                    onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                    placeholder="e.g., voltage_reading"
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label className="text-xs">Display Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                    placeholder="e.g., Voltage Reading"
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label className="text-xs">Type</Label>
                  <select
                    value={field.type}
                    onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs mt-1"
                    disabled={isLoading}
                  >
                    {fieldTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Unit (optional)</Label>
                  <Input
                    value={field.unit || ''}
                    onChange={(e) => handleFieldChange(index, 'unit', e.target.value)}
                    placeholder="e.g., kV"
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={field.isRequired}
                      onChange={(e) => handleFieldChange(index, 'isRequired', e.target.checked)}
                      disabled={isLoading}
                    />
                    Required
                  </label>
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={field.isProtected}
                      onChange={(e) => handleFieldChange(index, 'isProtected', e.target.checked)}
                      disabled={isLoading}
                    />
                    Protected
                  </label>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveField(index)}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{field.label}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {field.name} ({field.type})
                    {field.unit && ` - ${field.unit}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  {field.isRequired && <Badge variant="secondary">Required</Badge>}
                  {field.isProtected && <Badge>Protected</Badge>}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {isEditing && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddField} disabled={isLoading}>
            + Add Field
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="ml-auto gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}
