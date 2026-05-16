'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Wrench, FileEdit, CheckCircle2, AlertTriangle, Download, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

type Severity = 'info' | 'warning' | 'critical';
type EventType = 'INTERRUPTION' | 'RESTORATION' | 'INSPECTION' | 'READING_EDIT' | 'MAINTENANCE';

interface LogEvent {
  id: string;
  timestamp: string;
  type: EventType;
  severity: Severity;
  title: string;
  description: string;
  equipment?: string;
  station: string;
  user: string;
}

const mockEvents: LogEvent[] = [
  { id: 'e1', timestamp: '2026-05-08T14:32:00Z', type: 'INTERRUPTION', severity: 'critical', title: 'Trip on 132kV Transformer A1', description: 'Zone 1 distance protection operated. Investigating root cause.', equipment: 'TR-132-01', station: 'Sub Station A', user: 'J. Operator' },
  { id: 'e2', timestamp: '2026-05-08T13:55:00Z', type: 'INSPECTION', severity: 'info', title: 'Routine inspection completed', description: 'Monthly visual inspection of 330kV bay equipment passed all checks.', equipment: 'CKT-330-02', station: 'Main Station', user: 'A. Supervisor' },
  { id: 'e3', timestamp: '2026-05-08T13:20:00Z', type: 'READING_EDIT', severity: 'info', title: 'Reading correction submitted', description: 'Operator-flagged anomaly on hourly voltage reading. Sent for supervisor review.', equipment: 'FDR-33-04', station: 'Sub Station A', user: 'M. Operator' },
  { id: 'e4', timestamp: '2026-05-08T12:10:00Z', type: 'RESTORATION', severity: 'info', title: 'Feeder restored after planned outage', description: 'Maintenance window completed ahead of schedule. Load picked up cleanly.', equipment: 'FDR-33-05', station: 'Sub Station B', user: 'K. Engineer' },
  { id: 'e5', timestamp: '2026-05-08T10:45:00Z', type: 'MAINTENANCE', severity: 'warning', title: 'Planned maintenance commenced', description: 'Scheduled overhaul of 33kV feeder breaker started. ETA 4 hours.', equipment: 'FDR-33-05', station: 'Sub Station B', user: 'K. Engineer' },
  { id: 'e6', timestamp: '2026-05-08T08:02:00Z', type: 'INTERRUPTION', severity: 'warning', title: 'Brief sag on 33kV bus', description: 'Voltage dipped to 28kV for ~600ms. Cause under analysis.', equipment: 'BUS-132-01', station: 'Sub Station C', user: 'System' },
  { id: 'e7', timestamp: '2026-05-07T22:15:00Z', type: 'RESTORATION', severity: 'info', title: 'Feeder 12 restored', description: 'Auto-recloser successful after vegetation contact.', equipment: 'FDR-33-12', station: 'Sub Station C', user: 'System' },
];

const typeConfig: Record<EventType, { label: string; icon: React.ComponentType<{ className?: string }>; tint: string }> = {
  INTERRUPTION: { label: 'Interruption', icon: Zap, tint: 'bg-red-50 text-red-600' },
  RESTORATION: { label: 'Restoration', icon: CheckCircle2, tint: 'bg-green-50 text-green-600' },
  INSPECTION: { label: 'Inspection', icon: CheckCircle2, tint: 'bg-blue-50 text-blue-600' },
  READING_EDIT: { label: 'Reading edit', icon: FileEdit, tint: 'bg-indigo-50 text-indigo-600' },
  MAINTENANCE: { label: 'Maintenance', icon: Wrench, tint: 'bg-yellow-50 text-yellow-600' },
};

const severityBadge: Record<Severity, 'default' | 'destructive' | 'secondary'> = {
  info: 'secondary',
  warning: 'default',
  critical: 'destructive',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function EventLogbookPage() {
  const [type, setType] = useState<string>('all');
  const [severity, setSeverity] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return mockEvents.filter((e) => {
      if (type !== 'all' && e.type !== type) return false;
      if (severity !== 'all' && e.severity !== severity) return false;
      if (search && !`${e.title} ${e.description} ${e.equipment ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [type, severity, search]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Event Logbook"
          description="Chronological record of operational events across the system"
          actions={
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          }
        />

        <Card className="p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search events…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="all">All event types</option>
              <option value="INTERRUPTION">Interruptions</option>
              <option value="RESTORATION">Restorations</option>
              <option value="INSPECTION">Inspections</option>
              <option value="READING_EDIT">Reading edits</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="all">All severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {filtered.map((event) => {
              const cfg = typeConfig[event.type];
              const Icon = cfg.icon;
              return (
                <li key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.tint}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-600 mt-0.5">{event.description}</p>
                        </div>
                        <Badge variant={severityBadge[event.severity]} className="shrink-0">
                          {event.severity}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>{formatTime(event.timestamp)}</span>
                        {event.equipment && <span>· {event.equipment}</span>}
                        <span>· {event.station}</span>
                        <span>· by {event.user}</span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="p-8 text-center text-sm text-gray-500">
                No events match the current filters.
              </li>
            )}
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}
