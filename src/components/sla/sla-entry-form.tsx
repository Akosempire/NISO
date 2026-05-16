'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { Loader2, TrendingUp } from 'lucide-react';

interface SLAEntryFormProps {
  equipmentCode: string;
  equipmentName: string;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function SLAEntryForm({
  equipmentCode,
  equipmentName,
  onSubmit,
  isLoading = false,
}: SLAEntryFormProps) {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      readingDate: new Date().toISOString().split('T')[0],
      meterReading: '',
      mwValue: '',
      forecast: '',
      remarks: '',
    },
  });

  const mwValue = parseFloat(watch('mwValue') || '0');
  const forecast = parseFloat(watch('forecast') || '0');
  const difference = (mwValue - forecast).toFixed(2);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">{equipmentCode}</h2>
        <p className="text-sm text-gray-600">{equipmentName}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reading Date */}
          <div>
            <Label htmlFor="readingDate">Reading Date</Label>
            <Input
              id="readingDate"
              type="date"
              {...register('readingDate')}
              disabled={isLoading}
            />
          </div>

          {/* Meter Reading */}
          <div>
            <Label htmlFor="meterReading">Meter Reading (Units)</Label>
            <Input
              id="meterReading"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('meterReading')}
              disabled={isLoading}
            />
          </div>

          {/* MW Value */}
          <div>
            <Label htmlFor="mwValue">MW Value</Label>
            <Input
              id="mwValue"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('mwValue')}
              disabled={isLoading}
            />
          </div>

          {/* Forecast */}
          <div>
            <Label htmlFor="forecast">Forecast (MW)</Label>
            <Input
              id="forecast"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('forecast')}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Variance Card */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-blue-600">Variance (Actual - Forecast)</p>
              <p className="text-lg font-bold text-blue-900">{difference} MW</p>
            </div>
          </div>
        </Card>

        {/* Remarks */}
        <div>
          <Label htmlFor="remarks">Remarks</Label>
          <textarea
            id="remarks"
            placeholder="Add any observations or notes..."
            {...register('remarks')}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-20"
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
            'Save SLA Entry'
          )}
        </Button>
      </form>
    </Card>
  );
}
