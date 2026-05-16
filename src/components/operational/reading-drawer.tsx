'use client';

import { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, ArrowRight } from 'lucide-react';

interface ReadingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: {
    id: string;
    code: string;
    name: string;
    template: {
      fields: Array<{
        id: string;
        name: string;
        label: string;
        type: string;
        unit?: string;
      }>;
    };
  };
  selectedHour: Date;
  previousReading?: Record<string, any>;
  onSaveAndNext: () => void;
}

export function ReadingDrawer({
  isOpen,
  onClose,
  equipment,
  selectedHour,
  previousReading,
  onSaveAndNext
}: ReadingDrawerProps) {
  const [isAutosaving, setIsAutosaving] = useState(false);
  const queryClient = useQueryClient();

  // Build schema from template fields
  const schemaShape = equipment.template.fields.reduce((acc, field) => {
    acc[field.name] = field.type === 'NUMBER' ? z.number().optional() : z.string().optional();
    return acc;
  }, {} as Record<string, any>);

  const schema = z.object(schemaShape);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: previousReading || {}
  });

  const formValues = watch();

  // Autosave every 30 seconds if dirty
  useEffect(() => {
    if (!isDirty) return;

    const interval = setInterval(() => {
      if (isDirty && !isAutosaving) {
        handleAutosave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isDirty, formValues]);

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await fetch('/api/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: equipment.id,
          readingHour: selectedHour,
          values
        })
      });
      if (!response.ok) throw new Error('Failed to save');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readings'] });
      setIsAutosaving(false);
    }
  });

  const handleAutosave = async () => {
    setIsAutosaving(true);
    await saveMutation.mutateAsync(formValues);
  };

  const onSubmit = async (values: any) => {
    await saveMutation.mutateAsync(values);
    onSaveAndNext();
  };

  return (
    <Drawer open={isOpen} onClose={onClose} direction="right">
      <DrawerContent className="w-[480px] right-0 left-auto top-0 bottom-0 rounded-none">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-semibold">
            {equipment.code} - {equipment.name}
          </DrawerTitle>
          <DrawerDescription>
            Reading for {selectedHour.toLocaleString()}
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 space-y-6">
          {/* Field Inputs */}
          {equipment.template.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
                {field.unit && <span className="text-gray-500 ml-2">({field.unit})</span>}
              </Label>
              
              {field.type === 'NUMBER' ? (
                <Input
                  id={field.name}
                  type="number"
                  step="any"
                  placeholder="Enter value"
                  {...register(field.name, { valueAsNumber: true })}
                  className="w-full"
                />
              ) : field.type === 'SELECT' ? (
                <select
                  id={field.name}
                  {...register(field.name)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select...</option>
                </select>
              ) : field.type === 'TEXTAREA' ? (
                <textarea
                  id={field.name}
                  placeholder="Enter text"
                  {...register(field.name)}
                  className="w-full px-3 py-2 border rounded-md min-h-24"
                />
              ) : (
                <Input
                  id={field.name}
                  type="text"
                  placeholder="Enter value"
                  {...register(field.name)}
                  className="w-full"
                />
              )}

              {errors[field.name] && (
                <p className="text-xs text-red-500">
                  {errors[field.name]?.message as string}
                </p>
              )}
            </div>
          ))}

          {/* Status Card */}
          {isAutosaving && (
            <Card className="p-3 bg-blue-50 border-blue-200">
              <p className="text-xs text-blue-700 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Autosaving...
              </p>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 gap-2"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={saveMutation.isPending}
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Save & Next
                </>
              )}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
