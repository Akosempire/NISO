'use client';

import { ArrowUpRight, CheckCircle2, Clock3, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import type { InterruptionRecord, LoadImpact } from './types';

interface InterruptionListItem {
  id: string;
  stationName: string;
  eventId: string;
  record: InterruptionRecord;
}

interface ActiveInterruptionsProps {
  interruptions: InterruptionListItem[];
  onOpen: (recordId: string) => void;
  onRestore: (recordId: string) => void;
}

function formatDuration(ms: number, isActive: boolean) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const prefix = isActive ? 'ACTIVE - ' : '';

  if (days > 0) {
    return `${prefix}${days}d ${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  }

  return `${prefix}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function describeLoadImpact(record: InterruptionRecord) {
  const labels: Record<LoadImpact, string> = {
    LOAD_LOST: record.loadLostMw ? `Load lost ${record.loadLostMw} MW` : 'Load lost',
    LOAD_DIVERTED:
      record.divertedLoadMw && record.divertedTo
        ? `Diverted ${record.divertedLoadMw} MW to ${record.divertedTo}`
        : 'Load diverted',
    PARTIALLY_DIVERTED:
      record.divertedLoadMw && record.divertedTo
        ? `Partial diversion ${record.divertedLoadMw} MW to ${record.divertedTo}`
        : 'Partially diverted',
    NO_LOAD_IMPACT: 'No load impact',
    OTHER: 'Other operational impact',
  };

  return labels[record.loadImpact];
}

export function ActiveInterruptions({
  interruptions,
  onOpen,
  onRestore,
}: ActiveInterruptionsProps) {
  const [elapsedTime, setElapsedTime] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const updated = { ...prev };
        interruptions.forEach((interruption) => {
          const tripTime = new Date(interruption.record.tripDateTime).getTime();
          const endTime =
            interruption.record.status === 'RESTORED' && interruption.record.restorationDateTime
              ? new Date(interruption.record.restorationDateTime).getTime()
              : Date.now();
          updated[interruption.id] = endTime - tripTime;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [interruptions]);

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="hidden grid-cols-[1.4fr_1fr_1.2fr_1.1fr_1fr_auto] gap-4 border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] md:grid">
        <span>Equipment</span>
        <span>Relay Indication</span>
        <span>Trip Time</span>
        <span>Load Impact</span>
        <span>Total Time Out</span>
        <span>Status</span>
      </div>

      {interruptions.map((interruption) => (
        <div
          key={interruption.id}
          className="border-b border-[var(--border)] px-5 py-4 last:border-b-0"
        >
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1.2fr_1.1fr_1fr_auto] md:items-center">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-[color:rgba(199,68,68,0.10)] p-2 text-[var(--danger)]">
                <TriangleAlert className="h-4 w-4" />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => onOpen(interruption.record.id)}
                  className="text-left text-sm font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--brand-teal)]"
                >
                  {interruption.record.equipment.name}
                </button>
                <p className="text-xs text-[var(--text-secondary)]">
                  {interruption.record.equipment.type}
                  {interruption.record.equipment.voltageLevel
                    ? ` | ${interruption.record.equipment.voltageLevel}`
                    : ''}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">{interruption.stationName}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {interruption.record.relayIndication}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Event {interruption.eventId}</p>
            </div>

            <div>
              <p className="text-sm text-[var(--text-primary)]">
                {new Intl.DateTimeFormat('en-NG', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(interruption.record.tripDateTime))}
              </p>
            </div>

            <div>
              <p className="text-sm text-[var(--text-primary)]">{describeLoadImpact(interruption.record)}</p>
              {interruption.record.remarks ? (
                <p className="mt-1 line-clamp-1 text-xs text-[var(--text-secondary)]">
                  {interruption.record.remarks}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <Clock3 className="h-4 w-4 text-[var(--text-secondary)]" />
              {formatDuration(
                elapsedTime[interruption.id] ??
                  Date.now() - new Date(interruption.record.tripDateTime).getTime(),
                interruption.record.status === 'ACTIVE'
              )}
            </div>

            <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
              <StatusBadge status={interruption.record.status} />
              <Button variant="outline" size="sm" onClick={() => onOpen(interruption.record.id)}>
                <ArrowUpRight className="mr-1 h-4 w-4" />
                Open
              </Button>
              {interruption.record.status === 'ACTIVE' ? (
                <Button size="sm" onClick={() => onRestore(interruption.record.id)}>
                  Restore
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ))}

      {interruptions.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:rgba(62,139,104,0.12)] text-[var(--success)]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">All systems normal</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            No active or recent interruptions are available in the current scope.
          </p>
        </div>
      ) : null}
    </div>
  );
}
