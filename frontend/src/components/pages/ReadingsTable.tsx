import './SLATable.css'; // reuse table styles

interface Reading {
  _id: string;
  id?: string;
  hour: number;
  date: string;
  equipmentId?: { _id: string; name: string; type: string } | string;
  mw?: number | null;
  mvar?: number | null;
  kv?: number | null;
  amperage?: number | null;
  temperature?: number | null;
  rawInput?: string | null;
  valueType?: string;
  status: 'pending' | 'sealed';
  sealedAt?: string | null;
  remarks?: string | null;
}

interface ReadingsTableProps {
  data: Reading[];
  onRowClick: (reading: Reading) => void;
  selectedId?: string;
}

function fmtNum(val: number | null | undefined, decimals = 2): string {
  if (val == null) return '—';
  return val.toFixed(decimals);
}

export default function ReadingsTable({ data, onRowClick, selectedId }: ReadingsTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Hour</th>
            <th>Equipment</th>
            <th>MW</th>
            <th>MVAR</th>
            <th>KV</th>
            <th>Amperage</th>
            <th>Temp (°C)</th>
            <th>Input</th>
            <th>Status</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => {
            const rid = r._id || r.id!;
            const eqName =
              typeof r.equipmentId === 'object' && r.equipmentId
                ? r.equipmentId.name
                : '—';

            return (
              <tr
                key={rid}
                className={`table-row ${selectedId === rid ? 'selected' : ''}`}
                onClick={() => onRowClick(r)}
              >
                <td className="cell-hour">{r.hour}:00</td>
                <td className="cell-feeder">{eqName}</td>
                <td className="cell-value">{fmtNum(r.mw)}</td>
                <td className="cell-value">{fmtNum(r.mvar)}</td>
                <td className="cell-value">{fmtNum(r.kv)}</td>
                <td className="cell-value">{fmtNum(r.amperage)}</td>
                <td className="cell-value">{fmtNum(r.temperature, 1)}</td>
                <td className="cell-feeder">
                  {r.rawInput ? (
                    <span title="Hybrid / code input">{r.rawInput}</span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="cell-status">
                  <span className={`badge ${r.status === 'sealed' ? 'approved' : 'pending'}`}>
                    {r.status === 'sealed' ? '🔒 Sealed' : '○ Pending'}
                  </span>
                </td>
                <td className="cell-remarks">{r.remarks || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
