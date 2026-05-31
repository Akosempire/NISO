import { useMemo } from 'react';
import './EquipmentQueue.css';

export interface QueueEquipment {
  id: string;
  name: string;
  type?: string;
}

interface EquipmentQueueProps {
  hour: number;
  selectedDate: string;
  equipment?: QueueEquipment[];
  readings: any[];
  onSelectEquipment: (equipmentId: string) => void;
  onBack: () => void;
  onComplete?: () => void;
}

const DEFAULT_EQUIPMENT: QueueEquipment[] = [
  { id: '2JEB-SGB1', name: '2JEB-SGB1', type: '330kV Feeder' },
  { id: '2JEB-KNJ1', name: '2JEB-KNJ1', type: '330kV Feeder' },
  { id: '2SHR TR1', name: '2SHR TR1', type: 'Transformer' },
  { id: '2SHR-KTP1', name: '2SHR-KTP1', type: '132kV Feeder' }
];

type ItemStatus = 'complete' | 'pending' | 'empty';

export default function EquipmentQueue({
  hour,
  selectedDate,
  equipment,
  readings,
  onSelectEquipment,
  onBack,
  onComplete
}: EquipmentQueueProps) {
  const list = equipment && equipment.length > 0 ? equipment : DEFAULT_EQUIPMENT;

  const statusByEquipment = useMemo(() => {
    const map = new Map<string, ItemStatus>();
    list.forEach((eq) => {
      const reading = readings.find((r) => r.hour === hour && r.equipmentId === eq.id);
      if (reading?.sealedAt) map.set(eq.id, 'complete');
      else if (reading) map.set(eq.id, 'pending');
      else map.set(eq.id, 'empty');
    });
    return map;
  }, [list, readings, hour]);

  const completed = Array.from(statusByEquipment.values()).filter((s) => s === 'complete').length;
  const remaining = list.length - completed;
  const allDone = remaining === 0;

  const nextTarget = list.find((eq) => statusByEquipment.get(eq.id) !== 'complete') || list[0];

  return (
    <section className="equipment-queue">
      <div className="queue-toolbar">
        <button onClick={onBack} className="btn-ghost" type="button">
          ← Back to shift
        </button>
        <div className="queue-progress">
          <span className="mono">{completed}/{list.length}</span> equipment recorded
        </div>
      </div>

      <header className="queue-header">
        <h2>
          Hour <span className="mono">{String(hour).padStart(2, '0')}:00</span>
        </h2>
        <p className="queue-date">{selectedDate}</p>
      </header>

      <div className="queue-section-title">Operation queue</div>
      <ul className="queue-list">
        {list.map((eq) => {
          const status = statusByEquipment.get(eq.id) || 'empty';
          const isNext = !allDone && eq.id === nextTarget.id;
          return (
            <li key={eq.id}>
              <button
                type="button"
                onClick={() => onSelectEquipment(eq.id)}
                className={`queue-item status-${status} ${isNext ? 'queue-next' : ''}`}
              >
                <span className={`queue-status-dot status-${status}`} aria-hidden />
                <div className="queue-item-body">
                  <div className="queue-item-name">{eq.name}</div>
                  {eq.type && <div className="queue-item-type">{eq.type}</div>}
                </div>
                <span className="queue-item-meta">
                  {status === 'complete' && '✓ Sealed'}
                  {status === 'pending' && '◐ Draft'}
                  {status === 'empty' && (isNext ? 'Next →' : 'Pending')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="queue-footer">
        {!allDone ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onSelectEquipment(nextTarget.id)}
          >
            Record {nextTarget.name} →
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onComplete || onBack}>
            Hour complete — back to shift
          </button>
        )}
        <p className="queue-hint">
          Enter readings in any order. Save & Next advances through the queue.
        </p>
      </div>
    </section>
  );
}
