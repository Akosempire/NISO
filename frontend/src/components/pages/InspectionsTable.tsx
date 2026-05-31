import './SLATable.css';

export interface Inspection {
  _id?: string;
  id?: string;
  equipment?: { name?: string };
  equipmentId?: string;
  template?: { name?: string };
  templateName?: string;
  type?: string;
  inspector?: { fullName?: string } | string;
  inspectorName?: string;
  date?: string;
  scheduledFor?: string;
  findings?: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

interface InspectionsTableProps {
  data: Inspection[];
  onRowClick: (inspection: Inspection) => void;
  selectedId?: string;
}

function inspectorLabel(insp: Inspection): string {
  if (typeof insp.inspector === 'string') return insp.inspector;
  if (insp.inspector?.fullName) return insp.inspector.fullName;
  return insp.inspectorName || '—';
}

function statusBadge(insp: Inspection) {
  if (insp.approvedAt) return { cls: 'approved', label: '✓ Approved' };
  if (insp.submittedAt) return { cls: 'pending', label: '◐ Pending' };
  return { cls: 'active', label: '◌ Draft' };
}

export default function InspectionsTable({ data, onRowClick, selectedId }: InspectionsTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Equipment</th>
            <th>Template / Type</th>
            <th>Inspector</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((insp) => {
            const id = insp._id || insp.id || '';
            const status = statusBadge(insp);
            return (
              <tr
                key={id}
                className={`table-row ${selectedId === id ? 'selected' : ''}`}
                onClick={() => onRowClick(insp)}
              >
                <td className="cell-feeder"><strong>{insp.equipment?.name || insp.equipmentId || '—'}</strong></td>
                <td>{insp.template?.name || insp.templateName || insp.type || '—'}</td>
                <td>{inspectorLabel(insp)}</td>
                <td>{insp.date || insp.scheduledFor || '—'}</td>
                <td className="cell-status">
                  <span className={`badge ${status.cls}`}>{status.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
