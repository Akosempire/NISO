'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { ReadingList } from '@/components/readings/reading-list';
import { ReadingDrawer } from '@/components/operational/reading-drawer';
import { BulkImportDialog } from '@/components/readings/bulk-import-dialog';
import { useState } from 'react';

const mockEquipment = [
  {
    id: '1',
    code: 'CKT-330-01',
    name: '330kV Circuit Breaker 01',
    type: 'CIRCUIT_330KV',
    station: 'Main Station',
    status: 'ACTIVE',
    voltage: 330,
    lastReading: '2024-05-08 14:30',
    template: {
      fields: [
        { id: 'v1', name: 'voltage', label: 'Voltage (kV)', type: 'NUMBER', unit: 'kV' },
        { id: 'c1', name: 'current', label: 'Current (A)', type: 'NUMBER', unit: 'A' },
      ]
    }
  },
  {
    id: '2',
    code: 'TR-132-01',
    name: 'Transformer 132/33kV',
    type: 'TRANSFORMER',
    station: 'Sub Station A',
    status: 'ACTIVE',
    voltage: 132,
    lastReading: '2024-05-08 13:45',
    template: {
      fields: [
        { id: 't1', name: 'temp_oil', label: 'Oil Temperature', type: 'NUMBER', unit: '°C' },
        { id: 't2', name: 'temp_winding', label: 'Winding Temperature', type: 'NUMBER', unit: '°C' },
      ]
    }
  },
];

export default function ReadingsPage() {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const currentEquipment = mockEquipment.find(e => e.id === selectedEquipment);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Readings</h1>
          <p className="text-gray-600 mt-1">Manage operational readings for all equipment</p>
        </div>

        <ReadingList
          equipment={mockEquipment}
          onSelectEquipment={(id) => {
            setSelectedEquipment(id);
            setShowDrawer(true);
          }}
          onBulkImport={() => setShowBulkImport(true)}
        />

        {showBulkImport && (
          <BulkImportDialog
            onClose={() => setShowBulkImport(false)}
            onImport={(file) => console.log('Import:', file)}
          />
        )}

        {currentEquipment && (
          <ReadingDrawer
            isOpen={showDrawer}
            onClose={() => setShowDrawer(false)}
            equipment={currentEquipment}
            selectedHour={new Date()}
            onSaveAndNext={() => console.log('Save and next')}
          />
        )}
      </div>
    </MainLayout>
  );
}
