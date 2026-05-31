import { useState } from 'react';
import { useMessages, useCreateMessage } from '../../hooks/useMessages';
import { toast } from '../../stores/toastStore';
import MessagesTable from '../../components/pages/MessagesTable';
import MessageDetailDrawer from '../../components/pages/MessageDetailDrawer';
import MessageCreateForm from '../../components/pages/MessageCreateForm';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import './MessagesPage.css';

export default function MessagesPage({ user }: any) {
  const stationId = user.station?.id;
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'broadcast' | 'direct'>('all');

  const { data, isLoading, refetch } = useMessages(stationId);
  const createMessage = useCreateMessage();

  const filteredData = data?.data?.filter((message: any) => {
    const matchesSearch =
      message.subject?.includes(searchText) ||
      message.content?.includes(searchText);
    const matchesType =
      filterType === 'all' ||
      (filterType === 'broadcast' && message.type === 'BROADCAST') ||
      (filterType === 'direct' && message.type === 'DIRECT');
    return matchesSearch && matchesType;
  }) || [];

  const handleCreate = async (values: any) => {
    try {
      await createMessage.mutateAsync({
        stationId,
        ...values
      });
      setShowCreate(false);
      refetch();
    } catch (error: any) {
      toast.error('Could not send message', error.message);
    }
  };

  const unreadCount = data?.data?.filter((m: any) => !m.readAt).length || 0;
  const broadcastCount = data?.data?.filter((m: any) => m.type === 'BROADCAST').length || 0;

  return (
    <div className="messages-page">
      <div className="page-header">
        <div className="page-title">
          <h2>Messages</h2>
          <p>Operational communications and broadcasts</p>
        </div>
        <div className="page-actions">
          {user.role !== 'VIEWER' && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="btn-primary"
            >
              {showCreate ? 'Cancel' : '✉ Send Message'}
            </button>
          )}
        </div>
      </div>

      {showCreate && (
        <MessageCreateForm
          user={user}
          onSubmit={handleCreate}
          isLoading={createMessage.isLoading}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Messages</span>
          <span className="stat-value">{data?.data?.length || 0}</span>
        </div>
        <div className="stat-card alert-card">
          <span className="stat-label">Unread</span>
          <span className="stat-value">{unreadCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Broadcasts</span>
          <span className="stat-value">{broadcastCount}</span>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search messages..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="filter-select"
        >
          <option value="all">All Types</option>
          <option value="broadcast">Broadcasts</option>
          <option value="direct">Direct Messages</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState label="Loading messages…" />
      ) : filteredData.length === 0 ? (
        <EmptyState
          icon="✉"
          title="No messages"
          description="Operational broadcasts and direct messages will appear here."
          action={
            user.role !== 'VIEWER'
              ? { label: 'Send first message', onClick: () => setShowCreate(true) }
              : undefined
          }
        />
      ) : (
        <MessagesTable
          data={filteredData}
          onRowClick={setSelectedMessage}
          selectedId={selectedMessage?.id}
        />
      )}

      {selectedMessage && (
        <MessageDetailDrawer
          message={selectedMessage}
          user={user}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
}
