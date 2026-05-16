'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const schema = z.object({
  equipmentId: z.string().min(1, 'Equipment is required'),
  templateId: z.string().min(1, 'Template is required'),
  inspectionDate: z.string().min(1, 'Inspection date is required'),
  fieldValues: z.record(z.string(), z.any()),
  remarks: z.string().optional(),
});

interface Template {
  id: string;
  name: string;
  type: string;
  fields: Array<{
    id: string;
    name: string;
    label: string;
    type: string;
    options?: string[];
    required?: boolean;
    hint?: string;
  }>;
}

interface InspectionFormProps {
  template: Template;
  onSubmit?: (data: any) => void;
}

export function InspectionForm({ template, onSubmit }: InspectionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { register, handleSubmit, control, setValue, watch, formState: { errors, touchedFields } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      equipmentId: '',
      templateId: template.id,
      inspectionDate: new Date().toISOString().split('T')[0],
      fieldValues: {},
      remarks: '',
    },
    mode: 'onChange',
  });

  const onFormSubmit = async (data: any) => {
    setIsLoading(true);
    setSubmitStatus('idle');
    try {
      if (onSubmit) {
        onSubmit(data);
      } else {
        console.log('Inspection:', data);
      }
      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      console.error('Error submitting inspection:', error);
      setSubmitStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: Template['fields'][0]) => {
    const fieldName = `fieldValues.${field.id}`;
    const hasError = errors.fieldValues?.[field.id];

    switch (field.type) {
      case 'NUMBER':
        return (
          <Input
            {...register(fieldName as any)}
            type="number"
            step="0.01"
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={hasError ? 'border-red-500 bg-red-50' : ''}
          />
        );

      case 'TEXT':
        return (
          <Input
            {...register(fieldName as any)}
            type="text"
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={hasError ? 'border-red-500 bg-red-50' : ''}
          />
        );

      case 'SELECT':
        return (
          <select
            {...register(fieldName as any)}
            className={`w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'CHECKBOX':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              {...register(fieldName as any)}
              onChange={(e) => setValue(fieldName as any, e.target.checked)}
            />
            <Label className="text-sm text-gray-700">{field.label}</Label>
          </div>
        );

      case 'TEXTAREA':
        return (
          <textarea
            {...register(fieldName as any)}
            rows={3}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={`w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{template.name}</h2>
        <p className="text-sm text-gray-600">Complete the inspection form below</p>
      </div>

      {submitStatus === 'success' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Inspection saved successfully</p>
            <p className="text-sm text-green-700">Your inspection data has been recorded</p>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Failed to save inspection</p>
            <p className="text-sm text-red-700">Please try again or contact support</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="equipmentId" className="text-sm font-medium text-gray-700">
              Equipment <span className="text-red-500">*</span>
            </Label>
            <select
              {...register('equipmentId')}
              className={`mt-1 w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.equipmentId ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select Equipment</option>
              <option value="eq-1">330kV Circuit Breaker 01</option>
              <option value="eq-2">Transformer 132/33kV</option>
            </select>
            {errors.equipmentId && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠</span> {errors.equipmentId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="inspectionDate" className="text-sm font-medium text-gray-700">
              Inspection Date <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('inspectionDate')}
              type="date"
              className={`mt-1 ${
                errors.inspectionDate ? 'border-red-500 bg-red-50' : ''
              }`}
            />
            {errors.inspectionDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠</span> {errors.inspectionDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Inspection Fields</h3>
          <div className="space-y-5">
            {template.fields.map((field) => (
              <div key={field.id} className="pb-4 border-b last:border-b-0">
                <Label className="text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.hint && (
                  <p className="text-xs text-gray-500 mt-1">{field.hint}</p>
                )}
                <div className="mt-2">
                  {renderField(field)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="remarks" className="text-sm font-medium text-gray-700">
            Remarks <span className="text-gray-400">(Optional)</span>
          </Label>
          <textarea
            {...register('remarks')}
            rows={3}
            placeholder="Additional inspection notes..."
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-end pt-4 border-t gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isLoading ? 'Saving...' : 'Save Inspection'}
          </Button>
        </div>
      </form>
    </div>
  );
}