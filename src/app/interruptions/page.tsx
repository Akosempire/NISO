'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { ActiveInterruptions } from '@/components/interruptions/active-interruptions';
import { RestoreInterruptionDialog } from '@/components/interruptions/restore-interruption-dialog';
import { useState } from 'react';

const mockInterruptions = [
  {
    id: 'int-1',
    sessionId: 'INT-2024-001',
    equipmentCode: 'CKT-330-01',
    equipmentName: '330kV Circuit Breaker 01',
    stationName: 'Main Station',
    regionName: 'North Region',
    tripTime: new Date(Date.now() - 3600000).toISOString(),
    status: 'ACTIVE',
    relayFault: 'Zone 1 Distance',
  },
  {
    id: 'int-2',
    sessionId: 'INT-2024-002',
    equipmentCode: 'TR-132-01',
    equipmentName: 'Transformer 132/33kV',
    stationName: 'Sub Station A',
    regionName: 'East Region',
    tripTime: new Date(Date.now() - 7200000).toISOString(),
    restorationTime: new Date(Date.now() - 3600000).toISOString(),
    status: 'RESTORED',
    totalTimeOut: 3600,
  },
];

export default function InterruptionsPage() {
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);

  const handleRestore = (recordId: string) => {
    setSelectedRecord(recordId);
    setShowRestoreDialog(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interruptions</h1>
          <p className="text-gray-600 mt-1">Track and manage system interruptions</p>
        </div>

        <ActiveInterruptions
          interruptions={mockInterruptions}
          onRestore={handleRestore}
          onDetails={(id) => console.log('View details:', id)}
        />

        {selectedRecord && (
          <RestoreInterruptionDialog
            isOpen={showRestoreDialog}
            onClose={() => setShowRestoreDialog(false)}
            recordId={selectedRecord}
            equipmentName="Equipment Name"
            tripTime={new Date(Date.now() - 3600000)}
            onSubmit={(data) => {
              console.log('Restore:', data);
              setShowRestoreDialog(false);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
