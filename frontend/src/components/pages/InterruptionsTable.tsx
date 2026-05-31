import './SLATable.css'; // reuse table styles

export interface Interruption {
  _id?: string;
  id?: string;
  equipmentId?: string | { _id?: string; id?: string; name?: string };
  equipment?: { name?: string };
  causeCode?: string;
  causeName?: string;
  tripDate?: string;
  tripTime?: string;
  restorationTime?: string | null;
  restoreDate?: string;
  restoreTime?: string;
  durationSeconds?: number;
  status?: 'Active' | 'Resolved' | 'Restored';
  notes?: string;
}

interface InterruptionsTableProps {
  data: Interruption[];
  onRowClick: (interruption: Interruption) => void;
  selectedId?: string;
}

function fmtDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function fmtTripWhen(intr: Interruption): string {
  if (intr.tripDate && intr.tripTime) return `${intr.tripDate} ${intr.tripTime}`;
  if (intr.tripDate) return intr.tripDate;
  return '—';
}

function equipmentName(intr: Interruption): string {
  if (intr.equipment?.name) return intr.equipment.name;
  if (typeof intr.equipmentId === 'object' && intr.equipmentId?.name) return intr.equipmentId.name;
  if (typeof intr.equipmentId === 'string') return intr.equipmentId;
  return '—';
}

export default function InterruptionsTable({ data, onRowClick, selectedId }: InterruptionsTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Equipment</th>
            <th>Cause</th>
            <th>Trip</th>
            <th>Restored</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((intr) => {
            const id = intr._id || intr.id || '';
            const isActive = !intr.restorationTime && intr.status !== 'Resolved' && intr.status !== 'Restored';
            return (
              <tr
                key={id}
                className={`table-row ${selectedId === id ? 'selected' : ''} ${isActive ? 'row-alert' : ''}`}
                onClick={() => onRowClick(intr)}
              >
                <td className="cell-feeder"><strong>{equipmentName(intr)}</strong></td>
                <td>
                  {intr.causeCode ? (
                    <span className="cause-tag" title={intr.causeName}>{intr.causeCode}</span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="cell-value">{fmtTripWhen(intr)}</td>
                <td className="cell-value">
                  {intr.restorationTime
                    ? new Date(intr.restorationTime).toLocaleString()
                    : intr.restoreDate && intr.restoreTime
                    ? `${intr.restoreDate} ${intr.restoreTime}`
                    : '—'}
                </td>
                <td className="cell-value">{fmtDuration(intr.durationSeconds)}</td>
                <td className="cell-status">
                  {isActive ? (
                    <span className="badge pending">⚠ Active</span>
                  ) : (
                    <span className="badge approved">✓ Restored</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
