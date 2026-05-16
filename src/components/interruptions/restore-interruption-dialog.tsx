'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { Loader2, Clock } from 'lucide-react';

interface RestoreInterruptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recordId?: string;
  equipmentName?: string;
  tripTime?: Date;
  onSubmit: (data: { restorationTime: Date; notes?: string }) => void;
  isLoading?: boolean;
}

export function RestoreInterruptionDialog({
  isOpen,
  onClose,
  recordId,
  equipmentName,
  tripTime,
  onSubmit,
  isLoading = false,
}: RestoreInterruptionDialogProps) {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      restorationTime: new Date().toISOString().slice(0, 16),
      notes: '',
    },
  });

  const restorationTime = watch('restorationTime');

  const calculateDuration = () => {
    if (!tripTime || !restorationTime) return null;
    const trip = new Date(tripTime);
    const restoration = new Date(restorationTime);
    const ms = restoration.getTime() - trip.getTime();
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const onSubmitForm = (data: any) => {
    onSubmit({
      restorationTime: new Date(data.restorationTime),
      notes: data.notes,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Interruption as Restored</DialogTitle>
          <DialogDescription>
            Record the restoration time for {equipmentName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Trip Time Display */}
          {tripTime && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Trip Time</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(tripTime).toLocaleString()}
              </p>
            </div>
          )}

          {/* Restoration Time */}
          <div className="space-y-2">
            <Label htmlFor="restorationTime">Restoration Time</Label>
            <Input
              id="restorationTime"
              type="datetime-local"
              {...register('restorationTime')}
            />
          </div>

          {/* Duration */}
          {calculateDuration() && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-900">
                <Clock className="w-4 h-4" />
                <span>
                  Outage Duration: <span className="font-semibold">{calculateDuration()}</span>
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              placeholder="Any additional notes about the restoration..."
              {...register('notes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-20"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Mark as Restored'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
