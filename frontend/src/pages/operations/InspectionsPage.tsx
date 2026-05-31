import { useState } from 'react';
import { useInspections, useCreateInspection, useApproveInspection } from '../../hooks/useInspections';
import { toast } from '../../stores/toastStore';
import InspectionsTable from '../../components/pages/InspectionsTable';
import InspectionDetailDrawer from '../../components/pages/InspectionDetailDrawer';
import InspectionCreateForm from '../../components/pages/InspectionCreateForm';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import './InspectionsPage.css';

export default function InspectionsPage({ user }: any) {
  const stationId = user.station?.id;
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'pending' | 'approved'>('all');

  const { data, isLoading, refetch } = useInspections(stationId);
  const createInspection = useCreateInspection();
  const approveInspection = useApproveInspection();

  const filteredData = data?.data?.filter((inspection: any) => {
    const matchesSearch =
      inspection.equipment?.name?.includes(searchText) ||
      inspection.template?.name?.includes(searchText);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'draft' && !inspection.submittedAt && !inspection.approvedAt) ||
      (filterStatus === 'pending' && inspection.submittedAt && !inspection.approvedAt) ||
      (filterStatus === 'approved' && inspection.approvedAt);
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreate = async (values: any) => {
    try {
      await createInspection.mutateAsync({
        stationId,
        ...values
      });
      setShowCreate(false);
      refetch();
    } catch (error: any) {
      toast.error('Operation failed', error.message);
    }
  };

  const handleApprove = async (inspectionId: string) => {
    try {
      await approveInspection.mutateAsync(inspectionId);
      refetch();
      setSelectedInspection(null);
    } catch (error: any) {
      toast.error('Operation failed', error.message);
    }
  };

  const stats = {
    total: data?.data?.length || 0,
    draft: data?.data?.filter((i: any) => !i.submittedAt && !i.approvedAt).length || 0,
    pending: data?.data?.filter((i: any) => i.submittedAt && !i.approvedAt).length || 0,
    approved: data?.data?.filter((i: any) => i.approvedAt).length || 0
  };

  return (
    <div className="inspections-page">
      <div className="page-header">
        <div className="page-title">
          <h2>Inspections</h2>
          <p>Equipment maintenance and condition checks</p>
        </div>
        <div className="page-actions">
          {user.role !== 'VIEWER' && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="btn-primary"
            >
              {showCreate ? 'Cancel' : '+ New Inspection'}
            </button>
          )}
        </div>
      </div>

      {showCreate && (
        <InspectionCreateForm
          onSubmit={handleCreate}
          isLoading={createInspection.isLoading}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Draft</span>
          <span className="stat-value">{stats.draft}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Approval</span>
          <span className="stat-value alert">{stats.pending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Approved</span>
          <span className="stat-value">{stats.approved}</span>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search equipment or template..."
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
          <option value="draft">Draft</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState label="Loading inspections…" />
      ) : filteredData.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No inspections found"
          description="Equipment maintenance and condition checks will appear here."
          action={
            user.role !== 'VIEWER'
              ? { label: 'Create first inspection', onClick: () => setShowCreate(true) }
              : undefined
          }
        />
      ) : (
        <InspectionsTable
          data={filteredData}
          onRowClick={setSelectedInspection}
          selectedId={selectedInspection?.id}
        />
      )}

      {selectedInspection && (
        <InspectionDetailDrawer
          inspection={selectedInspection}
          user={user}
          onApprove={() => handleApprove(selectedInspection.id)}
          onClose={() => setSelectedInspection(null)}
          isLoading={approveInspection.isLoading}
        />
      )}
    </div>
  );
}
