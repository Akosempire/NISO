'use client';

import { AlertTriangle, CheckCircle, Clock, MapPin, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';

interface Interruption {
  id: string;
  sessionId: string;
  tripTime: Date;
  cause: string;
  remarks?: string;
  duration: number;
  equipmentCount: number;
  records: Array<{
    id: string;
    equipment: {
      id: string;
      name: string;
      code: string;
      station: { name: string };
    };
    status: string;
    relayFault?: string;
  }>;
}

interface ActiveInterruptionsProps {
  interruptions: Interruption[];
  onRestore: (recordId: string) => void;
}

export function ActiveInterruptions({ interruptions, onRestore }: ActiveInterruptionsProps) {
  const [elapsedTime, setElapsedTime] = useState<Record<string, number>>({});

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const updated = { ...prev };
        interruptions.forEach(interruption => {
          const tripTime = new Date(interruption.tripTime).getTime();
          const now = Date.now();
          updated[interruption.id] = Math.floor((now - tripTime) / 1000);
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [interruptions]);

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `ACTIVE • ${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    return `ACTIVE • ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {interruptions.map((interruption) => (
        <div key={interruption.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <Zap className="absolute w-3 h-3 text-orange-500 -bottom-1 -right-1 bg-white rounded-full p-0.5" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    System Interruption
                  </h3>
                  <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4 animate-pulse" />
                    {formatDuration(elapsedTime[interruption.id] || interruption.duration)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Trip Time</p>
                    <p className="font-medium text-gray-900">{new Date(interruption.tripTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Duration</p>
                    <p className="font-medium text-red-600">
                      {Math.floor((elapsedTime[interruption.id] || interruption.duration) / 3600)}h {Math.floor(((elapsedTime[interruption.id] || interruption.duration) % 3600) / 60)}m
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cause</p>
                    <p className="font-medium text-gray-900">{interruption.cause}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Equipment Affected</p>
                    <p className="font-medium text-gray-900">{interruption.equipmentCount} units</p>
                  </div>
                </div>

                {interruption.remarks && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Remarks</p>
                    <p className="text-sm text-gray-900">{interruption.remarks}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Affected Equipment:
                  </h4>
                  {interruption.records.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${record.status === 'ACTIVE' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                        <div>
                          <p className="font-medium text-gray-900">{record.equipment.name}</p>
                          <p className="text-sm text-gray-600">
                            {record.equipment.code} • {record.equipment.station.name}
                          </p>
                          {record.relayFault && (
                            <p className="text-xs text-red-600 font-medium mt-1">⚠ Fault: {record.relayFault}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={record.status} />
                        {record.status === 'ACTIVE' && (
                          <Button
                            onClick={() => onRestore(record.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {interruptions.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All Systems Normal</h3>
          <p className="text-gray-600">No active interruptions at this time.</p>
        </div>
      )}
    </div>
  );
}