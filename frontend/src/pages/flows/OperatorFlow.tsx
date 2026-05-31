import { useMemo, useState } from 'react';
import { useReadings, useCreateReading } from '../../hooks/useReadings';
import {
  useInterruptions,
  useCreateInterruption,
  useUpdateInterruption
} from '../../hooks/useInterruptions';
import ShiftDashboard from '../../components/flows/ShiftDashboard';
import EquipmentQueue, { QueueEquipment } from '../../components/flows/EquipmentQueue';
import ReadingInputDrawer from '../../components/flows/ReadingInputDrawer';
import InterruptionAlert from '../../components/flows/InterruptionAlert';
import InterruptionDrawer, {
  InterruptionFormValues
} from '../../components/flows/InterruptionDrawer';
import { toast } from '../../stores/toastStore';
import './OperatorFlow.css';

interface OperatorFlowProps {
  user: any;
}

type Stage = 'dashboard' | 'queue';
type ActiveDrawer =
  | { kind: 'reading'; equipmentId: string }
  | { kind: 'interruption-new' }
  | { kind: 'interruption-restore'; interruption: any }
  | null;

const todayISO = () => new Date().toISOString().split('T')[0];

export default function OperatorFlow({ user }: OperatorFlowProps) {
  const [stage, setStage] = useState<Stage>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [selectedHour, setSelectedHour] = useState<number>(new Date().getHours());
  const [drawer, setDrawer] = useState<ActiveDrawer>(null);

  const stationId = user?.station?.id;
  const equipmentList: QueueEquipment[] = user?.station?.equipment || [];

  const readingsQuery = useReadings(stationId, selectedDate);
  const interruptionsQuery = useInterruptions(stationId, 'Active');
  const createReading = useCreateReading();
  const createInterruption = useCreateInterruption();
  const updateInterruption = useUpdateInterruption();

  const readings: any[] = readingsQuery.data?.data || [];
  const interruptions: any[] = interruptionsQuery.data?.data || [];
  const activeInterruption = interruptions[0];

  const handleStartHour = (hour: number) => {
    setSelectedHour(hour);
    setStage('queue');
  };

  const handleSelectEquipment = (equipmentId: string) => {
    setDrawer({ kind: 'reading', equipmentId });
  };

  const advanceToNextEquipment = (justSavedEquipmentId: string) => {
    if (equipmentList.length === 0) return null;
    const idx = equipmentList.findIndex((e) => e.id === justSavedEquipmentId);
    for (let i = 1; i <= equipmentList.length; i += 1) {
      const next = equipmentList[(idx + i) % equipmentList.length];
      const hasReading = readings.some(
        (r) => r.hour === selectedHour && r.equipmentId === next.id && r.sealedAt
      );
      if (!hasReading && next.id !== justSavedEquipmentId) return next.id;
    }
    return null;
  };

  const handleReadingSubmit = async (values: any) => {
    if (!drawer || drawer.kind !== 'reading') return;
    const equipmentId = drawer.equipmentId;
    try {
      await createReading.mutateAsync({
        stationId,
        equipmentId,
        date: selectedDate,
        hour: selectedHour,
        ...values
      });
      const nextEquipmentId = advanceToNextEquipment(equipmentId);
      if (nextEquipmentId) {
        setDrawer({ kind: 'reading', equipmentId: nextEquipmentId });
      } else {
        setDrawer(null);
      }
    } catch (error: any) {
      toast.error('Could not save reading', error?.message || 'Unknown error');
    }
  };

  const handleInterruptionSubmit = async (values: InterruptionFormValues) => {
    try {
      if (drawer?.kind === 'interruption-restore') {
        await updateInterruption.mutateAsync({
          id: drawer.interruption.id,
          status: 'Restored',
          restoreDate: values.restoreDate,
          restoreTime: values.restoreTime,
          notes: values.notes
        });
      } else {
        await createInterruption.mutateAsync({
          equipmentId: values.equipmentId,
          causeCode: values.causeCode,
          causeName: values.causeName,
          tripDate: values.tripDate,
          tripTime: values.tripTime,
          notes: values.notes,
          status: 'Active'
        });
      }
      setDrawer(null);
    } catch (error: any) {
      toast.error('Could not save interruption', error?.message || 'Unknown error');
    }
  };

  const selectedEquipmentName = useMemo(() => {
    if (!drawer || drawer.kind !== 'reading') return undefined;
    return equipmentList.find((e) => e.id === drawer.equipmentId)?.name;
  }, [drawer, equipmentList]);

  const drawerIsLoading =
    createReading.isLoading || createInterruption.isLoading || updateInterruption.isLoading;

  return (
    <div className="operator-flow">
      {activeInterruption && stage === 'dashboard' && (
        <InterruptionAlert
          interruption={activeInterruption}
          onOpen={() => setDrawer({ kind: 'interruption-restore', interruption: activeInterruption })}
        />
      )}

      <div className="operator-content">
        {stage === 'dashboard' && (
          <ShiftDashboard
            user={user}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onStartHour={handleStartHour}
            readings={readings}
            activeInterruptions={interruptions.length}
            equipmentTotal={equipmentList.length}
          />
        )}

        {stage === 'queue' && (
          <EquipmentQueue
            hour={selectedHour}
            selectedDate={selectedDate}
            equipment={equipmentList}
            readings={readings}
            onSelectEquipment={handleSelectEquipment}
            onBack={() => setStage('dashboard')}
          />
        )}
      </div>

      <div className="operator-actions">
        <button
          type="button"
          className="btn-fab"
          onClick={() => setDrawer({ kind: 'interruption-new' })}
          aria-label="Log new interruption"
        >
          ⚠ Log interruption
        </button>
      </div>

      {drawer?.kind === 'reading' && (
        <ReadingInputDrawer
          hour={selectedHour}
          equipmentId={drawer.equipmentId}
          equipmentName={selectedEquipmentName}
          readings={readings}
          onSubmit={handleReadingSubmit}
          onClose={() => setDrawer(null)}
          isLoading={createReading.isLoading}
        />
      )}

      {drawer?.kind === 'interruption-new' && (
        <InterruptionDrawer
          mode="create"
          equipment={equipmentList.map((e) => ({ id: e.id, name: e.name }))}
          onSubmit={handleInterruptionSubmit}
          onClose={() => setDrawer(null)}
          isLoading={drawerIsLoading}
        />
      )}

      {drawer?.kind === 'interruption-restore' && (
        <InterruptionDrawer
          mode="restore"
          initial={{
            equipmentId: drawer.interruption.equipmentId,
            causeCode: drawer.interruption.causeCode,
            causeName: drawer.interruption.causeName,
            tripDate: drawer.interruption.tripDate,
            tripTime: drawer.interruption.tripTime,
            equipment: drawer.interruption.equipment
          }}
          equipment={equipmentList.map((e) => ({ id: e.id, name: e.name }))}
          onSubmit={handleInterruptionSubmit}
          onClose={() => setDrawer(null)}
          isLoading={drawerIsLoading}
        />
      )}
    </div>
  );
}
