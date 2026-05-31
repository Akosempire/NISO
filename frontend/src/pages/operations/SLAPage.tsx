import { useState } from 'react';
import { useSLAEntries, useCreateSLA, useApproveSLA, useUpdateSLA } from '../../hooks/useSLA';
import { toast } from '../../stores/toastStore';
import SLATable from '../../components/pages/SLATable';
import SLADetailDrawer from '../../components/pages/SLADetailDrawer';
import SLACreateForm from '../../components/pages/SLACreateForm';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import './SLAPage.css';

export default function SLAPage({ user }: any) {
  const stationId = user.station?.id;
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSLA, setSelectedSLA] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [nextFeederId, setNextFeederId] = useState<string | null>(null);
  const [nextHour, setNextHour] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');

  const { data, isLoading, refetch } = useSLAEntries(stationId, date);
  const createSLA = useCreateSLA();
  const approveSLA = useApproveSLA();
  const updateSLA = useUpdateSLA();

  // Auto-detect next pending feeder/hour
  const getNextPending = () => {
    if (!data?.data) return { feederId: null, hour: null };
    const pending = data.data.find((e: any) => !e.approvedAt);
    if (pending) {
      return { feederId: pending.feederId, hour: pending.hour };
    }
    return { feederId: null, hour: null };
  };

  const handleAddNewSLA = () => {
    const { feederId, hour } = getNextPending();
    if (feederId && hour !== null) {
      setNextFeederId(feederId);
      setNextHour(hour);
      setShowCreate(true);
    } else {
      toast.info('All SLA entries for this date are approved');
    }
  };

  const filteredData = data?.data?.filter((entry: any) => {
    const matchesSearch = entry.feederId?.includes(searchText) || entry.remarks?.includes(searchText);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !entry.approvedAt) ||
      (filterStatus === 'approved' && entry.approvedAt);
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreate = async (values: any) => {
    try {
      await createSLA.mutateAsync({
        stationId,
        date,
        hour: nextHour,
        feederId: nextFeederId,
        ...values
      });
      setShowCreate(false);
      setNextFeederId(null);
      setNextHour(null);
      refetch();
    } catch (error: any) {
      toast.error('Operation failed', error.message);
    }
  };

  const handleApprove = async (entryId: string) => {
    try {
      await approveSLA.mutateAsync(entryId);
      refetch();
      setSelectedSLA(null);
    } catch (error: any) {
      toast.error('Operation failed', error.message);
    }
  };

  const handleUpdate = async (entryId: string, values: any) => {
    try {
      await updateSLA.mutateAsync({ id: entryId, ...values });
      refetch();
      setSelectedSLA(null);
    } catch (error: any) {
      toast.error('Operation failed', error.message);
    }
  };

  const stats = {
    total: data?.data?.length || 0,
    approved: data?.data?.filter((e: any) => e.approvedAt).length || 0,
    pending: data?.data?.filter((e: any) => !e.approvedAt).length || 0,
    avgDifference: filteredData.length > 0
      ? (filteredData.reduce((sum: number, e: any) => sum + Math.abs(e.differenceMw || 0), 0) / filteredData.length).toFixed(2)
      : '0.00'
  };

  const { feederId: nextPendingFeederId, hour: nextPendingHour } = getNextPending();

  return (
    <div className="sla-page">
      <div className="page-header">
        <div className="page-title">
          <h2>SLA Tracking</h2>
          <p>Forecast vs Actual Meter Energy Readings</p>
        </div>
        <div className="page-actions">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="date-input"
          />
          {user.role !== 'VIEWER' && nextPendingFeederId && nextPendingHour !== null && (
            <button
              onClick={handleAddNewSLA}
              className="btn-primary"
              title={`Add SLA for ${nextPendingFeederId} at ${nextPendingHour}:00`}
            >
              + Add New SLA Entry
            </button>
          )}
        </div>
      </div>

      {showCreate && nextFeederId && nextHour !== null && (
        <SLACreateForm
          feederId={nextFeederId}
          hour={nextHour}
          onSubmit={handleCreate}
          isLoading={createSLA.isLoading}
          onCancel={() => {
            setShowCreate(false);
            setNextFeederId(null);
            setNextHour(null);
          }}
        />
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Entries</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Approved</span>
          <span className="stat-value">{stats.approved}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value alert">{stats.pending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Difference</span>
          <span className="stat-value">{stats.avgDifference} MW</span>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search feeder or remarks..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState label="Loading SLA entries…" />
      ) : filteredData.length === 0 ? (
        <EmptyState
          icon="📊"
          title={`No SLA entries for ${date}`}
          description="Forecast vs. actual energy readings recorded per hour will appear here."
          action={
            user.role !== 'VIEWER' && nextPendingFeederId && nextPendingHour !== null
              ? { label: 'Add first entry', onClick: handleAddNewSLA }
              : undefined
          }
        />
      ) : (
        <SLATable
          data={filteredData}
          onRowClick={setSelectedSLA}
          selectedId={selectedSLA?.id}
        />
      )}

      {selectedSLA && (
        <SLADetailDrawer
          entry={selectedSLA}
          user={user}
          onApprove={() => handleApprove(selectedSLA.id)}
          onUpdate={(values) => handleUpdate(selectedSLA.id, values)}
          onClose={() => setSelectedSLA(null)}
          isLoading={approveSLA.isLoading || updateSLA.isLoading}
        />
      )}
    </div>
  );
}
