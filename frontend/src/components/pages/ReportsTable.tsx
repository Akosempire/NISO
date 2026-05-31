import './SLATable.css';
import type { ReportFormat } from '../../hooks/useReports';

export interface Report {
  _id?: string;
  id?: string;
  name?: string;
  type?: string;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  generatedAt?: string;
  generatedBy?: string;
  rowCount?: number;
}

interface ReportsTableProps {
  data: Report[];
  onRowClick: (report: Report) => void;
  onExport: (reportId: string, format: ReportFormat) => void;
  selectedId?: string;
  isExporting?: boolean;
}

const FREQ_LABEL: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  CUSTOM: 'Custom'
};

export default function ReportsTable({
  data,
  onRowClick,
  onExport,
  selectedId,
  isExporting
}: ReportsTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Report</th>
            <th>Type</th>
            <th>Frequency</th>
            <th>Generated</th>
            <th>Rows</th>
            <th>Export</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => {
            const id = r._id || r.id || '';
            return (
              <tr
                key={id}
                className={`table-row ${selectedId === id ? 'selected' : ''}`}
                onClick={() => onRowClick(r)}
              >
                <td className="cell-feeder"><strong>{r.name || '—'}</strong></td>
                <td>{r.type || '—'}</td>
                <td>
                  <span className="badge active">
                    {FREQ_LABEL[r.frequency || 'CUSTOM'] || r.frequency}
                  </span>
                </td>
                <td className="cell-value">
                  {r.generatedAt ? new Date(r.generatedAt).toLocaleString() : '—'}
                </td>
                <td className="cell-value">{r.rowCount ?? '—'}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="export-buttons">
                    {(['pdf', 'xlsx', 'csv'] as ReportFormat[]).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        className="export-mini"
                        disabled={isExporting}
                        onClick={() => onExport(id, fmt)}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
