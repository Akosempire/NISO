import { useState } from 'react';
import { useReports, useExportReport } from '../../hooks/useReports';
import { toast } from '../../stores/toastStore';
import ReportsTable from '../../components/pages/ReportsTable';
import ReportDetailDrawer from '../../components/pages/ReportDetailDrawer';
import ReportBuilder from '../../components/pages/ReportBuilder';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import './ReportsPage.css';

export default function ReportsPage({ user }: any) {
  const stationId = user.station?.id;
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  const { data, isLoading, refetch } = useReports(stationId);
  const exportReport = useExportReport();

  const filteredData = data?.data?.filter((report: any) => {
    const matchesSearch = report.name?.includes(searchText);
    const matchesType =
      filterType === 'all' ||
      (filterType === 'daily' && report.frequency === 'DAILY') ||
      (filterType === 'weekly' && report.frequency === 'WEEKLY') ||
      (filterType === 'monthly' && report.frequency === 'MONTHLY');
    return matchesSearch && matchesType;
  }) || [];

  const handleExport = async (reportId: string, format: 'xlsx' | 'pdf' | 'csv') => {
    try {
      await exportReport.mutateAsync({ reportId, format });
      // File download handled by API
    } catch (error: any) {
      toast.error('Export failed', error.message);
    }
  };

  const stats = {
    total: data?.data?.length || 0,
    daily: data?.data?.filter((r: any) => r.frequency === 'DAILY').length || 0,
    weekly: data?.data?.filter((r: any) => r.frequency === 'WEEKLY').length || 0,
    monthly: data?.data?.filter((r: any) => r.frequency === 'MONTHLY').length || 0
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div className="page-title">
          <h2>Reports</h2>
          <p>Generate and manage operational reports</p>
        </div>
        <div className="page-actions">
          {user.role !== 'VIEWER' && user.role !== 'OPERATOR' && (
            <button
              onClick={() => setShowBuilder(!showBuilder)}
              className="btn-primary"
            >
              {showBuilder ? 'Cancel' : '+ Create Report'}
            </button>
          )}
        </div>
      </div>

      {showBuilder && (
        <ReportBuilder
          user={user}
          onCreate={() => {
            setShowBuilder(false);
            refetch();
          }}
          onCancel={() => setShowBuilder(false)}
        />
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Reports</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Daily</span>
          <span className="stat-value">{stats.daily}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Weekly</span>
          <span className="stat-value">{stats.weekly}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Monthly</span>
          <span className="stat-value">{stats.monthly}</span>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="filter-select"
        >
          <option value="all">All Frequencies</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState label="Loading reports…" />
      ) : filteredData.length === 0 ? (
        <EmptyState
          icon="📑"
          title="No reports yet"
          description="Generated reports across SLA, interruptions, readings, and inspections appear here."
          action={
            user.role !== 'VIEWER' && user.role !== 'OPERATOR'
              ? { label: 'Create your first report', onClick: () => setShowBuilder(true) }
              : undefined
          }
        />
      ) : (
        <ReportsTable
          data={filteredData}
          onRowClick={setSelectedReport}
          onExport={handleExport}
          selectedId={selectedReport?.id}
          isExporting={exportReport.isLoading}
        />
      )}

      {selectedReport && (
        <ReportDetailDrawer
          report={selectedReport}
          user={user}
          onExport={handleExport}
          onClose={() => setSelectedReport(null)}
          isExporting={exportReport.isLoading}
        />
      )}
    </div>
  );
}
