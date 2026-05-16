'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';

interface InterruptionRecord {
  id: string;
  sessionId: string;
  equipmentCode: string;
  equipmentName: string;
  stationName: string;
  regionName: string;
  tripTime: string;
  restorationTime?: string;
  status: string;
  totalTimeOut?: number;
  relayFault?: string;
}

interface ActiveInterruptionsProps {
  interruptions: InterruptionRecord[];
  onRestore: (recordId: string) => void;
  onDetails: (interruptionId: string) => void;
}

export function ActiveInterruptions({
  interruptions,
  onRestore,
  onDetails,
}: ActiveInterruptionsProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '—';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const calculateOutageTime = (tripTime: string, restorationTime?: string) => {
    if (!restorationTime) {
      const trip = new Date(tripTime);
      const now = new Date();
      const ms = now.getTime() - trip.getTime();
      return formatDuration(Math.floor(ms / 1000));
    }
    return '—';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Active Interruptions</h2>
        <Badge variant="destructive" className="text-sm">
          {interruptions.filter(i => i.status === 'ACTIVE').length} Active
        </Badge>
      </div>

      <div className="space-y-3">
        {interruptions.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">No active interruptions</p>
          </Card>
        ) : (
          interruptions.map((item) => (
            <Card
              key={item.id}
              className={`p-4 border-l-4 hover:shadow-md transition-shadow ${
                item.status === 'ACTIVE'
                  ? 'border-l-red-500 bg-red-50'
                  : 'border-l-green-500 bg-green-50'
              }`}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                {/* Equipment */}
                <div>
                  <p className="text-xs text-gray-600">Equipment</p>
                  <p className="text-sm font-semibold text-gray-900">{item.equipmentCode}</p>
                  <p className="text-xs text-gray-500">{item.equipmentName}</p>
                </div>

                {/* Location */}
                <div>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location
                  </p>
                  <p className="text-sm text-gray-700">{item.regionName}</p>
                  <p className="text-xs text-gray-500">{item.stationName}</p>
                </div>

                {/* Trip Time */}
                <div>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Trip Time
                  </p>
                  <p className="text-sm text-gray-900">
                    {new Date(item.tripTime).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.tripTime).toLocaleDateString()}
                  </p>
                </div>

                {/* Duration */}
                <div>
                  <p className="text-xs text-gray-600">Duration</p>
                  <p className="text-sm font-semibold text-red-600">
                    {calculateOutageTime(item.tripTime, item.restorationTime)}
                  </p>
                  <p className="text-xs text-gray-500">Ongoing...</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => onRestore(item.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark Restored
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDetails(item.sessionId)}
                  >
                    Details
                  </Button>
                </div>
              </div>

              {item.relayFault && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-600">
                  <AlertTriangle className="w-3 h-3 text-yellow-500" />
                  Relay: {item.relayFault}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
