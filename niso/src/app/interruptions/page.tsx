'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { ActiveInterruptions } from '@/components/interruptions/active-interruptions';
import { RestoreInterruptionDialog } from '@/components/interruptions/restore-interruption-dialog';
import { useState } from 'react';

const mockSupervisor = {
  id: 'user-2',
  email: 'supervisor@niso.gov',
  name: 'Sarah Supervisor',
  role: 'SUPERVISOR',
};

const mockInterruptions = [
  {
    id: '1',
    sessionId: 'INT-1715174400000-abc123',
    tripTime: new Date('2024-05-08T10:30:00'),
    cause: 'Lightning Strike',
    remarks: 'Direct hit on transmission line',
    duration: 7200, // 2 hours in seconds
    equipmentCount: 3,
    records: [
      {
        id: 'r1',
        equipment: {
          id: 'e1',
          name: '330kV Line A',
          code: 'LINE-330-A',
          station: { name: 'Main Station' },
        },
        status: 'ACTIVE',
        relayFault: 'Distance Protection',
      },
      {
        id: 'r2',
        equipment: {
          id: 'e2',
          name: '330kV Line B',
          code: 'LINE-330-B',
          station: { name: 'Main Station' },
        },
        status: 'ACTIVE',
        relayFault: 'Overcurrent Protection',
      },
    ],
  },
];

export default function InterruptionsPage() {
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  const selectedInterruption = mockInterruptions.find(int =>
    int.records.some(r => r.id === selectedRecord)
  );

  return (
    <MainLayout user={mockSupervisor}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interruptions</h1>
          <p className="text-gray-600 mt-1">Monitor and manage system outages</p>
        </div>

        <ActiveInterruptions
          interruptions={mockInterruptions}
          onRestore={(recordId) => {
            setSelectedRecord(recordId);
            setShowRestoreDialog(true);
          }}
        />

        {showRestoreDialog && selectedRecord && selectedInterruption && (
          <RestoreInterruptionDialog
            isOpen={showRestoreDialog}
            onClose={() => setShowRestoreDialog(false)}
            recordId={selectedRecord}
            equipmentName={selectedInterruption.records.find(r => r.id === selectedRecord)?.equipment.name || ''}
            onRestore={(time) => {
              console.log('Restore:', selectedRecord, time);
              setShowRestoreDialog(false);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}