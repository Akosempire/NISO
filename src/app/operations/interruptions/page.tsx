'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { ActiveInterruptions } from '@/components/interruptions/active-interruptions';

const mock = [
  { id: 'int-1', sessionId: 'INT-2026-001', equipmentCode: 'CKT-330-01', equipmentName: '330kV Circuit 01', stationName: 'Main Station', regionName: 'North', tripTime: new Date(Date.now() - 3600000).toISOString(), status: 'ACTIVE', relayFault: 'Zone 1 Distance' },
  { id: 'int-2', sessionId: 'INT-2026-002', equipmentCode: 'TR-132-01', equipmentName: 'Transformer A1', stationName: 'Sub Station A', regionName: 'East', tripTime: new Date(Date.now() - 7200000).toISOString(), restorationTime: new Date(Date.now() - 1800000).toISOString(), status: 'RESTORED', totalTimeOut: 5400 },
];

export default function ActiveInterruptionsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader title="Active Interruptions" description="System-wide interruptions and restoration status" />
        <ActiveInterruptions
          interruptions={mock}
          onRestore={(id) => console.log('Restore:', id)}
          onDetails={(id) => console.log('Details:', id)}
        />
      </div>
    </MainLayout>
  );
}
