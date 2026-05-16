'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface Correction {
  id: string;
  equipment: string;
  field: string;
  hour: string;
  originalValue: string;
  proposedValue: string;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const mock: Correction[] = [
  { id: 'c1', equipment: 'CKT-330-01 · Voltage', field: 'voltage', hour: '2026-05-08 14:00', originalValue: '328.4 kV', proposedValue: '330.4 kV', reason: 'Operator misread analog meter; SCADA confirms 330.4 kV.', requestedBy: 'M. Operator', requestedAt: '2026-05-08T14:35:00Z', status: 'pending' },
  { id: 'c2', equipment: 'TR-132-01 · Oil Temp', field: 'temp_oil', hour: '2026-05-08 12:00', originalValue: '85 °C', proposedValue: '65 °C', reason: 'Sensor malfunction logged at 12:03; corrected manually from gauge.', requestedBy: 'J. Operator', requestedAt: '2026-05-08T12:25:00Z', status: 'pending' },
  { id: 'c3', equipment: 'FDR-33-04 · Current', field: 'current', hour: '2026-05-08 10:00', originalValue: '120 A', proposedValue: '210 A', reason: 'Typo on input.', requestedBy: 'A. Operator', requestedAt: '2026-05-08T11:02:00Z', status: 'approved' },
  { id: 'c4', equipment: 'BUS-132-01 · MW', field: 'mw_load', hour: '2026-05-07 18:00', originalValue: '88.0', proposedValue: '78.0', reason: 'Conflicting with downstream feeder totals.', requestedBy: 'K. Operator', requestedAt: '2026-05-07T19:14:00Z', status: 'rejected' },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function CorrectionRow({ item, onApprove, onReject }: { item: Correction; onApprove?: () => void; onReject?: () => void }) {
  return (
    <li className="p-5 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">{item.equipment}</p>
          <p className="text-xs text-gray-500 mt-0.5">Reading hour: {item.hour}</p>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <div className="bg-red-50 border border-red-100 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-red-600 font-medium">Original</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{item.originalValue}</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-green-600 font-medium">Proposed</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{item.proposedValue}</p>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 text-sm text-gray-700">
            <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <p>{item.reason}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Requested by {item.requestedBy} · {formatTime(item.requestedAt)}
          </p>
        </div>
        {item.status === 'pending' && (
          <div className="flex flex-col gap-2 shrink-0">
            <Button size="sm" onClick={onApprove}>
              <Check className="w-4 h-4 mr-1.5" /> Approve
            </Button>
            <Button size="sm" variant="outline" onClick={onReject}>
              <X className="w-4 h-4 mr-1.5" /> Reject
            </Button>
          </div>
        )}
        {item.status !== 'pending' && (
          <Badge variant={item.status === 'approved' ? 'secondary' : 'destructive'} className="shrink-0">
            {item.status}
          </Badge>
        )}
      </div>
    </li>
  );
}

export default function CorrectionsQueuePage() {
  const [items, setItems] = useState(mock);

  const decide = (id: string, decision: 'approved' | 'rejected') => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: decision } : i)));
  };

  const pending = items.filter((i) => i.status === 'pending');
  const approved = items.filter((i) => i.status === 'approved');
  const rejected = items.filter((i) => i.status === 'rejected');

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Corrections Queue"
          description="Review reading correction requests submitted by operators"
        />

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <Card className="p-0 overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {pending.map((c) => (
                  <CorrectionRow key={c.id} item={c} onApprove={() => decide(c.id, 'approved')} onReject={() => decide(c.id, 'rejected')} />
                ))}
                {pending.length === 0 && (
                  <li className="p-10 text-center text-sm text-gray-500">No corrections awaiting review.</li>
                )}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <Card className="p-0 overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {approved.map((c) => <CorrectionRow key={c.id} item={c} />)}
                {approved.length === 0 && (
                  <li className="p-10 text-center text-sm text-gray-500">No approved corrections yet.</li>
                )}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <Card className="p-0 overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {rejected.map((c) => <CorrectionRow key={c.id} item={c} />)}
                {rejected.length === 0 && (
                  <li className="p-10 text-center text-sm text-gray-500">No rejected corrections.</li>
                )}
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
