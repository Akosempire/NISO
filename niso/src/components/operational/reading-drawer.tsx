'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, ArrowRight, ChevronLeft, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  readings: z.array(z.object({
    fieldId: z.string(),
    value: z.string(),
  })),
});

interface Equipment {
  id: string;
  code: string;
  name: string;
  type: string;
  station: string;
  status: string;
  voltage: number;
  lastReading: string;
  template: {
    fields: Array<{
      id: string;
      name: string;
      label: string;
      type: string;
      unit?: string;
      options?: string[];
      required?: boolean;
      hint?: string;
    }>;
  };
}

interface PreviousReading {
  hour: Date;
  values: Record<string, string>;
}

interface ReadingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment;
  selectedHour: Date;
  onHourChange?: (newHour: Date) => void;
  previousReading?: PreviousReading;
  onSaveAndNext: () => void;
  isSaved?: boolean;
}

export function ReadingDrawer({ 
  isOpen, 
  onClose, 
  equipment, 
  selectedHour, 
  onHourChange,
  previousReading,
  onSaveAndNext,
  isSaved = false
}: ReadingDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentHour, setCurrentHour] = useState(selectedHour);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      readings: equipment.template.fields.map(field => ({
        fieldId: field.id,
        value: '',
      })),
    },
    mode: 'onChange',
  });

  const handlePreviousHour = () => {
    const newHour = new Date(currentHour);
    newHour.setHours(newHour.getHours() - 1);
    setCurrentHour(newHour);
    onHourChange?.(newHour);
  };

  const handleNextHour = () => {
    const newHour = new Date(currentHour);
    newHour.setHours(newHour.getHours() + 1);
    setCurrentHour(newHour);
    onHourChange?.(newHour);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving readings:', data);
    } catch (error) {
      console.error('Error saving readings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onClose={onClose} direction="right">
      <DrawerContent className="w-full max-w-md">
        <DrawerHeader>
          <DrawerTitle>{equipment.name}</DrawerTitle>
          <DrawerDescription>
            {equipment.code} • {equipment.station} • {equipment.voltage}kV
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Hour Navigation */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Reading Hour
                </Label>
                {isSaved && (
                  <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Saved
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousHour}
                  className="p-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1 px-3 py-2 bg-gray-50 rounded-md text-center text-sm font-medium">
                  {currentHour.toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleNextHour}
                  className="p-1"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Previous Reading Reference */}
            {previousReading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-900 mb-2">
                  Previous Hour Reading ({previousReading.hour.toLocaleString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })})
                </p>
                <div className="space-y-1 text-xs text-blue-700">
                  {Object.entries(previousReading.values).slice(0, 2).map(([key, value]) => (
                    <div key={key} className="flex justify-between opacity-70">
                      <span>—</span>
                      <span>{value || 'No data'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {equipment.template.fields.map((field, index) => (
                <div key={field.id}>
                  <div className="flex items-start justify-between">
                    <Label htmlFor={`readings.${index}.value`} className="text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                      {field.unit && <span className="text-gray-500 ml-1">({field.unit})</span>}
                    </Label>
                  </div>
                  
                  {field.hint && (
                    <p className="text-xs text-gray-500 mt-1 mb-2">{field.hint}</p>
                  )}

                  {field.type === 'NUMBER' && (
                    <div>
                      <Input
                        {...register(`readings.${index}.value`)}
                        type="number"
                        step="0.01"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className={`mt-1 ${errors.readings?.[index] ? 'border-red-500' : ''}`}
                      />
                      {errors.readings?.[index] && (
                        <p className="text-xs text-red-500 mt-1">This field is required</p>
                      )}
                    </div>
                  )}

                  {field.type === 'TEXT' && (
                    <div>
                      <Input
                        {...register(`readings.${index}.value`)}
                        type="text"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className={`mt-1 ${errors.readings?.[index] ? 'border-red-500' : ''}`}
                      />
                      {errors.readings?.[index] && (
                        <p className="text-xs text-red-500 mt-1">This field is required</p>
                      )}
                    </div>
                  )}

                  {field.type === 'SELECT' && (
                    <div>
                      <select
                        {...register(`readings.${index}.value`)}
                        className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.readings?.[index] ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select {field.label.toLowerCase()}</option>
                        {field.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      {errors.readings?.[index] && (
                        <p className="text-xs text-red-500 mt-1">This field is required</p>
                      )}
                    </div>
                  )}

                  {field.type === 'CHECKBOX' && (
                    <div className="mt-2">
                      <label className="flex items-center">
                        <input
                          {...register(`readings.${index}.value`)}
                          type="checkbox"
                          value="true"
                          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{field.label}</span>
                      </label>
                    </div>
                  )}

                  {field.type === 'TEXTAREA' && (
                    <div>
                      <textarea
                        {...register(`readings.${index}.value`)}
                        rows={3}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.readings?.[index] ? 'border-red-500' : ''}`}
                      />
                      {errors.readings?.[index] && (
                        <p className="text-xs text-red-500 mt-1">This field is required</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleSubmit(onSubmit)();
                  onSaveAndNext();
                }}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Save & Next
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}