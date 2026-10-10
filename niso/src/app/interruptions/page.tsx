'use client';

import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActiveInterruptions } from '@/components/interruptions/active-interruptions';
import {
  InterruptionRecordDrawer,
  NewInterruptionDrawer,
} from '@/components/interruptions/interruption-drawer';
import type {
  EquipmentOption,
  InterruptionEvent,
} from '@/components/interruptions/types';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';

const mockSupervisor = {
  id: 'user-2',
  email: 'supervisor@niso.gov',
  name: 'Sarah Supervisor',
  role: 'SUPERVISOR',
};

const stationName = 'Jebba Station';

const equipmentRegistry: EquipmentOption[] = [
  { id: 'eq-1', name: '2JEB-KNJ1', type: '330kV Circuit', voltageLevel: '330kV' },
  { id: 'eq-2', name: '2JEB-SGB2', type: '330kV Circuit', voltageLevel: '330kV' },
  { id: 'eq-3', name: 'TR1', type: 'Transformer', voltageLevel: '132/33kV' },
  { id: 'eq-4', name: '33kV Feeder 4', type: '33kV Feeder', voltageLevel: '33kV' },
];

function createSeedEvents(): InterruptionEvent[] {
  const now = Date.now();

  return [
    {
      id: 'evt-aug-1',
      stationName,
      createdBy: 'Sarah Supervisor',
      createdAt: new Date(now - 1000 * 60 * 55).toISOString(),
      records: [
        {
          id: 'evt-aug-1-rec-1',
          equipment: equipmentRegistry[0],
          tripDateTime: new Date(now - 1000 * 60 * 55).toISOString(),
          relayIndication: 'Distance Relay',
          loadImpact: 'LOAD_LOST',
          loadLostMw: '82',
          remarks: 'Breaker opened following relay operation on the Jebba corridor.',
          moreDetails: {
            causeClassification: 'Line fault',
            coordinatedBy: 'Regional Control',
          },
          status: 'ACTIVE',
        },
        {
          id: 'evt-aug-1-rec-2',
          equipment: equipmentRegistry[2],
          tripDateTime: new Date(now - 1000 * 60 * 42).toISOString(),
          relayIndication: 'Differential',
          loadImpact: 'PARTIALLY_DIVERTED',
          divertedLoadMw: '34',
          divertedTo: '33kV Feeder 4',
          remarks: 'Load transferred to maintain station supply.',
          status: 'ACTIVE',
        },
      ],
    },
    {
      id: 'evt-aug-2',
      stationName,
      createdBy: 'Sarah Supervisor',
      createdAt: new Date(now - 1000 * 60 * 60 * 28).toISOString(),
      records: [
        {
          id: 'evt-aug-2-rec-1',
          equipment: equipmentRegistry[1],
          tripDateTime: new Date(now - 1000 * 60 * 60 * 28).toISOString(),
          relayIndication: 'Earth Fault',
          loadImpact: 'LOAD_DIVERTED',
          divertedLoadMw: '65',
          divertedTo: '2JEB-KNJ1',
          remarks: 'Temporary diversion completed after switching instructions.',
          status: 'RESTORED',
          restorationDateTime: new Date(now - 1000 * 60 * 60 * 25).toISOString(),
          restorationNotes: 'Circuit restored after patrol confirmation.',
          restorationState: 'Fully Restored',
        },
      ],
    },
  ];
}

export default function InterruptionsPage() {
  const [interruptions, setInterruptions] = useState<InterruptionEvent[]>(() => createSeedEvents());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const flattenedRecords = useMemo(
    () =>
      interruptions.flatMap((event) =>
        event.records.map((record) => ({
          id: record.id,
          eventId: event.id,
          stationName: event.stationName,
          record,
        }))
      ),
    [interruptions]
  );

  const selectedRecord = useMemo(() => {
    for (const event of interruptions) {
      const record = event.records.find((item) => item.id === selectedRecordId);
      if (record) {
        return {
          stationName: event.stationName,
          record,
        };
      }
    }
    return null;
  }, [interruptions, selectedRecordId]);

  const activeCount = flattenedRecords.filter((item) => item.record.status === 'ACTIVE').length;
  const restoredCount = flattenedRecords.filter((item) => item.record.status === 'RESTORED').length;

  const handleCreate = (event: InterruptionEvent) => {
    setInterruptions((current) => [event, ...current]);
  };

  const handleRestore = (
    recordId: string,
    payload: {
      restorationDateTime: string;
      restorationNotes?: string;
      restorationState?: string;
    }
  ) => {
    setInterruptions((current) =>
      current.map((event) => ({
        ...event,
        records: event.records.map((record) =>
          record.id === recordId
            ? {
                ...record,
                status: 'RESTORED',
                restorationDateTime: payload.restorationDateTime,
                restorationNotes: payload.restorationNotes,
                restorationState: payload.restorationState,
              }
            : record
        ),
      }))
    );
  };

  return (
    <MainLayout user={mockSupervisor}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-teal)]">
              Operational workflow
            </p>
            <h1 className="mt-2 text-[30px] font-semibold tracking-tight text-[var(--text-primary)]">
              Interruptions
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
              Record trips quickly, keep each equipment interruption separate, and restore service
              later without losing the original event history.
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Interruption
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Active
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--danger)]">{activeCount}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Equipment currently out of service</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Restored
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--success)]">{restoredCount}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Completed restorations retained for review</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Station Scope
            </p>
            <p className="mt-3 text-lg font-semibold text-[var(--text-primary)]">{stationName}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Configured equipment registry drives the drawer selection.</p>
          </div>
        </div>

        <ActiveInterruptions
          interruptions={flattenedRecords}
          onOpen={(recordId) => setSelectedRecordId(recordId)}
          onRestore={(recordId) => setSelectedRecordId(recordId)}
        />

        <NewInterruptionDrawer
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          availableEquipment={equipmentRegistry}
          stationName={stationName}
          currentUserName={mockSupervisor.name}
          onSave={handleCreate}
        />

        <InterruptionRecordDrawer
          open={Boolean(selectedRecordId)}
          onClose={() => setSelectedRecordId(null)}
          record={selectedRecord?.record ?? null}
          stationName={selectedRecord?.stationName}
          onRestore={handleRestore}
        />
      </div>
    </MainLayout>
  );
}
