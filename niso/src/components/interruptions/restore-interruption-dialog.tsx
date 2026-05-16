'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  restorationTime: z.string().min(1, 'Restoration time is required'),
});

interface RestoreInterruptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  equipmentName: string;
  onRestore: (restorationTime: Date) => void;
}

export function RestoreInterruptionDialog({
  isOpen,
  onClose,
  recordId,
  equipmentName,
  onRestore,
}: RestoreInterruptionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      restorationTime: new Date().toISOString().slice(0, 16), // Current date/time in datetime-local format
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const restorationTime = new Date(data.restorationTime);
      onRestore(restorationTime);
      onClose();
    } catch (error) {
      console.error('Error restoring interruption:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Restore Equipment</DialogTitle>
          <DialogDescription>
            Record the restoration time for {equipmentName}. This will mark the equipment as operational again.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="restorationTime" className="text-sm font-medium text-gray-700">
              Restoration Time
            </Label>
            <Input
              {...register('restorationTime')}
              type="datetime-local"
              className="mt-1"
            />
            {errors.restorationTime && (
              <p className="mt-1 text-sm text-red-600">{errors.restorationTime.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              Record Restoration
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}