'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  notes?: string;
}

interface InspectionFormProps {
  templateFields: Array<{ id: string; label: string; type: string; required: boolean }>;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function InspectionForm({
  templateFields,
  onSubmit,
  isLoading = false,
}: InspectionFormProps) {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      inspectionDate: new Date().toISOString().split('T')[0],
      remarks: '',
      findings: templateFields.reduce((acc, field) => {
        acc[field.id] = '';
        return acc;
      }, {} as Record<string, string>),
    },
  });

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Equipment Inspection</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Inspection Date */}
        <div>
          <Label htmlFor="inspectionDate">Inspection Date</Label>
          <Input
            id="inspectionDate"
            type="date"
            {...register('inspectionDate')}
            disabled={isLoading}
          />
        </div>

        {/* Template Fields */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Inspection Findings</h3>
          {templateFields.map((field) => (
            <div key={field.id}>
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {field.type === 'CHECKBOX' ? (
                <Checkbox {...register(`findings.${field.id}`)} disabled={isLoading} />
              ) : field.type === 'TEXTAREA' ? (
                <textarea
                  id={field.id}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  {...register(`findings.${field.id}`)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-20"
                />
              ) : (
                <Input
                  id={field.id}
                  type={field.type === 'NUMBER' ? 'number' : 'text'}
                  {...register(`findings.${field.id}`)}
                  disabled={isLoading}
                />
              )}
            </div>
          ))}
        </div>

        {/* Remarks */}
        <div>
          <Label htmlFor="remarks">Overall Remarks</Label>
          <textarea
            id="remarks"
            placeholder="Add overall observations..."
            {...register('remarks')}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-24"
          />
        </div>

        {/* Submit */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Submit Inspection'
          )}
        </Button>
      </form>
    </Card>
  );
}
