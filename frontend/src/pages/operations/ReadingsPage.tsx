import { useState } from 'react';
import { useReadings, useCreateReading, useSealReading, useUpdateReading } from '../../hooks/useReadings';
import { toast } from '../../stores/toastStore';
import ReadingsTable from '../../components/pages/ReadingsTable';
import ReadingDetailDrawer from '../../components/pages/ReadingDetailDrawer';
import ReadingCreateForm from '../../components/pages/ReadingCreateForm';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import './ReadingsPage.css';

export default function ReadingsPage({ user }: any) {
  const stationId = user.station?.id;
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedReading, setSelectedReading] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [nextHourForForm, setNextHourForForm] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'sealed' | 'pending'>('all');

  const { data, isLoading, refetch } = useReadings(stationId, selectedDate);
  const createReading = useCreateReading();
  const sealReading = useSealReading();
  const updateReading = useUpdateReading();

  // Auto-detect next hour based on last completed
  const getNextHour = () => {
    if (!data?.data) return 0;
    const lastCompleted = data.data
      .filter((r: any) => r.sealedAt)
      .sort((a: any, b: any) => b.hour - a.hour)[0];
    const nextHour = lastCompleted ? lastCompleted.hour + 1 : 0;
    return nextHour < 24 ? nextHour : null;
  };

  const handleAddNewHour = () => {
    const next = getNextHour();
    if (next !== null) {
      setNextHourForForm(next);
      setShowCreate(true);
    } else {
      toast.info('All hours for this date are complete');
    }
  };

  const filteredData = data?.data?.filter((reading: any) => {
    const matchesSearch =
      reading.equipment?.name?.includes(searchText) ||
      reading.rawInput?.includes(searchText);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'sealed' && reading.sealedAt) ||
      (filterStatus === 'pending' && !reading.sealedAt);
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreate = async (values: any) => {
    try {
      await createReading.mutateAsync({
        stationId,
        date: selectedDate,
        hour: nextHourForForm,
        ...values
      });
      setShowCreate(false);
      setNextHourForForm(null);
      refetch();
    } catch (error: any) {
      toast.error('Operation failed', error.message);
    }
  };

  const handleSeal = async (readingId: string) => {
    if (!window.confirm('Seal this reading? It cannot be modified afterward.')) return;
    try {
      await sealReading.mutateAsync(readingId);
      refetch();
      setSelectedReading(null);
    } catch (error: any) {
      toast.error('Operation failed', error.message);
    }
  };

  const handleUpdate = async (readingId: string, values: any) => {
    try {
      await updateReading.mutateAsync({ id: readingId, ...values });
      refetch();
      setSelectedReading(null);
    } catch (error: any) {
      toast.error('Operation failed', error.message);
    }
  };

  const stats = {
    total: data?.data?.length || 0,
    sealed: data?.data?.filter((r: any) => r.sealedAt).length || 0,
    pending: data?.data?.filter((r: any) => !r.sealedAt).length || 0
  };

  const nextHour = getNextHour();

  return (
    <div className="readings-page">
      <div className="page-header">
        <div className="page-title">
          <h2>Hourly Readings</h2>
          <p>Meter values and operational data</p>
        </div>
        <div className="page-actions">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
          {user.role !== 'VIEWER' && nextHour !== null && (
            <button
              onClick={handleAddNewHour}
              className="btn-primary"
              title={`Add reading for ${nextHour}:00`}
            >
              + Add New Hour Reading
            </button>
          )}
        </div>
      </div>

      {showCreate && nextHourForForm !== null && (
        <ReadingCreateForm
          hour={nextHourForForm}
          onSubmit={handleCreate}
          isLoading={createReading.isLoading}
          onCancel={() => {
            setShowCreate(false);
            setNextHourForForm(null);
          }}
        />
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Readings</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Sealed</span>
          <span className="stat-value">{stats.sealed}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value alert">{stats.pending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completion</span>
          <span className="stat-value">{Math.round((stats.sealed / Math.max(stats.total, 1)) * 100)}%</span>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search equipment or value..."
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
          <option value="pending">Pending</option>
          <option value="sealed">Sealed</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState label="Loading readings…" />
      ) : filteredData.length === 0 ? (
        <EmptyState
          icon="📋"
          title={`No readings for ${selectedDate}`}
          description="Hourly operational values from equipment meters appear here once entered."
          action={
            user.role !== 'VIEWER' && nextHour !== null
              ? { label: 'Add first reading', onClick: handleAddNewHour }
              : undefined
          }
        />
      ) : (
        <ReadingsTable
          data={filteredData}
          onRowClick={setSelectedReading}
          selectedId={selectedReading?.id}
        />
      )}

      {selectedReading && (
        <ReadingDetailDrawer
          reading={selectedReading}
          user={user}
          onSeal={() => handleSeal(selectedReading.id)}
          onUpdate={(values) => handleUpdate(selectedReading.id, values)}
          onClose={() => setSelectedReading(null)}
          isLoading={sealReading.isLoading || updateReading.isLoading}
        />
      )}
    </div>
  );
}
