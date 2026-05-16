'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  equipmentId: z.string().min(1, 'Equipment is required'),
  readingDate: z.string().min(1, 'Reading date is required'),
  meterReading: z.string().refine(
    (val) => val === '' || !isNaN(parseFloat(val)),
    'Meter reading must be a valid number'
  ).refine(
    (val) => val !== '' && parseFloat(val) >= 0,
    'Meter reading must be a positive number'
  ),
  forecast: z.string().refine(
    (val) => val === '' || !isNaN(parseFloat(val)),
    'Forecast must be a valid number'
  ).refine(
    (val) => val !== '' && parseFloat(val) >= 0,
    'Forecast must be a positive number'
  ),
  remarks: z.string().optional(),
});

interface SLAEntryFormProps {
  onSubmit?: (data: any) => void;
}

export function SLAEntryForm({ onSubmit }: SLAEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [variance, setVariance] = useState<number | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const meterReading = watch('meterReading');
  const forecast = watch('forecast');

  // Calculate variance when both values are present
  useEffect(() => {
    if (meterReading && forecast) {
      const reading = parseFloat(meterReading);
      const forecastValue = parseFloat(forecast);
      if (!isNaN(reading) && !isNaN(forecastValue)) {
        setVariance(reading - forecastValue);
      } else {
        setVariance(null);
      }
    } else {
      setVariance(null);
    }
  }, [meterReading, forecast]);

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const formData = {
        ...data,
        meterReading: parseFloat(data.meterReading),
        forecast: parseFloat(data.forecast),
        variance: variance || 0,
      };

      if (onSubmit) {
        onSubmit(formData);
      } else {
        console.log('SLA Entry:', formData);
      }
    } catch (error) {
      console.error('Error submitting SLA entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">SLA Entry</h2>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
            <Label htmlFor="readingDate" className="text-sm font-medium text-gray-700">
              Reading Date <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('readingDate')}
              type="date"
              className={`mt-1 ${
                errors.readingDate ? 'border-red-500 bg-red-50' : ''
              }`}
            />
            {errors.readingDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠</span> {errors.readingDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="meterReading" className="text-sm font-medium text-gray-700">
              Meter Reading (MW) <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('meterReading')}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={`mt-1 ${
                errors.meterReading ? 'border-red-500 bg-red-50' : ''
              }`}
            />
            {errors.meterReading && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠</span> {errors.meterReading.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="forecast" className="text-sm font-medium text-gray-700">
              Forecast (MW) <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('forecast')}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={`mt-1 ${
                errors.forecast ? 'border-red-500 bg-red-50' : ''
              }`}
            />
            {errors.forecast && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠</span> {errors.forecast.message}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">
              Variance (Actual - Forecast)
            </Label>
            <div className={`mt-1 p-3 rounded-md border-2 ${
              variance === null ? 'bg-gray-50 border-gray-200' :
              variance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <span className={`text-sm font-bold ${
                variance === null ? 'text-gray-500' :
                variance >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {variance === null ? '—' : `${variance > 0 ? '+' : ''}${variance.toFixed(2)} MW`}
              </span>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="remarks" className="text-sm font-medium text-gray-700">
            Remarks <span className="text-gray-400">(Optional)</span>
          </Label>
          <textarea
            {...register('remarks')}
            rows={3}
            placeholder="Additional notes..."
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            Submit SLA Entry
          </Button>
        </div>
      </form>
    </div>
  );
}