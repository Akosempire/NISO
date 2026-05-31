import './SLATable.css';

export interface Message {
  _id?: string;
  id?: string;
  subject?: string;
  content?: string;
  type?: 'BROADCAST' | 'DIRECT';
  severity?: 'info' | 'warning' | 'critical';
  fromName?: string;
  toName?: string;
  sentAt?: string;
  readAt?: string;
}

interface MessagesTableProps {
  data: Message[];
  onRowClick: (msg: Message) => void;
  selectedId?: string;
}

export default function MessagesTable({ data, onRowClick, selectedId }: MessagesTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Subject</th>
            <th>From</th>
            <th>To</th>
            <th>Sent</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m) => {
            const id = m._id || m.id || '';
            const isUnread = !m.readAt;
            return (
              <tr
                key={id}
                className={`table-row ${selectedId === id ? 'selected' : ''} ${isUnread ? 'msg-unread' : ''}`}
                onClick={() => onRowClick(m)}
              >
                <td>
                  <span className={`badge ${m.type === 'BROADCAST' ? 'active' : 'approved'}`}>
                    {m.type === 'BROADCAST' ? '📣 Broadcast' : '✉ Direct'}
                  </span>
                </td>
                <td className="cell-feeder">
                  <strong className={isUnread ? 'unread-subject' : ''}>{m.subject || '(no subject)'}</strong>
                </td>
                <td>{m.fromName || '—'}</td>
                <td>{m.toName || (m.type === 'BROADCAST' ? 'All' : '—')}</td>
                <td className="cell-value">
                  {m.sentAt ? new Date(m.sentAt).toLocaleString() : '—'}
                </td>
                <td className="cell-status">
                  {isUnread ? (
                    <span className="badge pending">● Unread</span>
                  ) : (
                    <span className="badge approved">✓ Read</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
