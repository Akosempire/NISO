import { useState } from 'react';
import { useInterruptions, useCreateInterruption, useUpdateInterruption } from '../../hooks/useInterruptions';
import { toast } from '../../stores/toastStore';
import InterruptionsTable from '../../components/pages/InterruptionsTable';
import InterruptionDetailDrawer from '../../components/pages/InterruptionDetailDrawer';
import InterruptionCreateForm from '../../components/pages/InterruptionCreateForm';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import './InterruptionsPage.css';

export default function InterruptionsPage({ user }: any) {
  const stationId = user.station?.id;
  const [selectedInterruption, setSelectedInterruption] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('active');

  const { data, isLoading, refetch } = useInterruptions(stationId, filterStatus === 'active' ? 'Active' : 'All');
  const createInterruption = useCreateInterruption();
  const updateInterruption = useUpdateInterruption();

  const filteredData = data?.data?.filter((intr: any) => {
    const matchesSearch =
      intr.equipment?.name?.includes(searchText) ||
      intr.causeCode?.includes(searchText);
    return matchesSearch;
  }) || [];

  const handleCreate = async (values: any) => {
    try {
      await createInterruption.mutateAsync({
        stationId,
        ...values
      });
      setShowCreate(false);
      refetch();
    } catch (error: any) {
      toast.error('Operation failed', error.message);
    }
  };

  const handleUpdate = async (interruptionId: string, values: any) => {
    try {
      await updateInterruption.mutateAsync({ id: interruptionId, ...values });
      refetch();
      setSelectedInterruption(null);
    } catch (error: any) {
      toast.error('Operation failed', error.message);
    }
  };

  const handleRestore = async (interruptionId: string) => {
    try {
      await updateInterruption.mutateAsync({
        id: interruptionId,
        restorationTime: new Date().toISOString(),
        status: 'Resolved'
      });
      refetch();
      setSelectedInterruption(null);
    } catch (error: any) {
      toast.error('Operation failed', error.message);
    }
  };

  const activeCount = data?.data?.filter((i: any) => !i.restorationTime).length || 0;
  const totalCount = data?.data?.length || 0;
  const avgDuration = totalCount > 0
    ? Math.round(
        data.data
          .filter((i: any) => i.durationSeconds)
          .reduce((sum: number, i: any) => sum + i.durationSeconds, 0) / totalCount / 60
      )
    : 0;

  return (
    <div className="interruptions-page">
      <div className="page-header">
        <div className="page-title">
          <h2>Interruptions</h2>
          <p>Equipment trips and restoration tracking</p>
        </div>
        <div className="page-actions">
          {user.role !== 'VIEWER' && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="btn-primary"
            >
              {showCreate ? 'Cancel' : '⚠ Log Interruption'}
            </button>
          )}
        </div>
      </div>

      {showCreate && (
        <InterruptionCreateForm
          onSubmit={handleCreate}
          isLoading={createInterruption.isLoading}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <div className="stats-grid">
        <div className="stat-card alert-card">
          <span className="stat-label">Active Now</span>
          <span className="stat-value">{activeCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total (Today)</span>
          <span className="stat-value">{totalCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Duration</span>
          <span className="stat-value">{avgDuration}m</span>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search equipment or cause code..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="filter-select"
        >
          <option value="active">Active Only</option>
          <option value="all">All</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState label="Loading interruptions…" />
      ) : filteredData.length === 0 ? (
        <EmptyState
          icon={filterStatus === 'active' ? '✓' : '⚡'}
          title={filterStatus === 'active' ? 'No active interruptions' : 'No interruptions found'}
          description={
            filterStatus === 'active'
              ? 'System operating normally. Equipment trips will appear here.'
              : 'Adjust filters above or change the date range.'
          }
        />
      ) : (
        <InterruptionsTable
          data={filteredData}
          onRowClick={setSelectedInterruption}
          selectedId={selectedInterruption?.id}
        />
      )}

      {selectedInterruption && (
        <InterruptionDetailDrawer
          interruption={selectedInterruption}
          user={user}
          onRestore={() => handleRestore(selectedInterruption.id)}
          onUpdate={(values) => handleUpdate(selectedInterruption.id, values)}
          onClose={() => setSelectedInterruption(null)}
          isLoading={updateInterruption.isLoading}
        />
      )}
    </div>
  );
}
