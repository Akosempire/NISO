import './SLATable.css';

interface SLAEntry {
  id: string;
  hour: number;
  feederId: string;
  forecastMw: number;
  actualMw?: number;
  differenceMw?: number;
  remarks?: string;
  approvedAt?: string;
  approvedBy?: string;
}

interface SLATableProps {
  data: SLAEntry[];
  onRowClick: (entry: SLAEntry) => void;
  selectedId?: string;
}

export default function SLATable({ data, onRowClick, selectedId }: SLATableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Hour</th>
            <th>Feeder ID</th>
            <th>Forecast (MW)</th>
            <th>Actual (MW)</th>
            <th>Difference (MW)</th>
            <th>Status</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => {
            const isHighDifference = entry.differenceMw && Math.abs(entry.differenceMw) > 50;
            return (
              <tr
                key={entry.id}
                className={`table-row ${selectedId === entry.id ? 'selected' : ''}`}
                onClick={() => onRowClick(entry)}
              >
                <td className="cell-hour">{entry.hour}:00</td>
                <td className="cell-feeder">{entry.feederId}</td>
                <td className="cell-value">{entry.forecastMw?.toFixed(2)}</td>
                <td className="cell-value">{entry.actualMw?.toFixed(2) || '-'}</td>
                <td className={`cell-value ${isHighDifference ? 'alert' : ''}`}>
                  {entry.differenceMw ? entry.differenceMw.toFixed(2) : '-'}
                </td>
                <td className="cell-status">
                  <span
                    className={`badge ${entry.approvedAt ? 'approved' : 'pending'}`}
                  >
                    {entry.approvedAt ? '✓ Approved' : '○ Pending'}
                  </span>
                </td>
                <td className="cell-remarks">{entry.remarks || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
