import { useEffect } from 'react';
import { useAcknowledgeMessage } from '../../hooks/useMessages';
import './SLADetailDrawer.css';
import type { Message } from './MessagesTable';

interface MessageDetailDrawerProps {
  message: Message;
  user: any;
  onClose: () => void;
}

export default function MessageDetailDrawer({ message, onClose }: MessageDetailDrawerProps) {
  const acknowledge = useAcknowledgeMessage();
  const id = message._id || message.id || '';

  useEffect(() => {
    if (!message.readAt && id) {
      acknowledge.mutate(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>{message.subject || '(no subject)'}</h3>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="drawer-content">
          <div className="field-group">
            <label>Type</label>
            <p className="field-value">
              {message.type === 'BROADCAST' ? '📣 Broadcast' : '✉ Direct message'}
            </p>
          </div>
          <div className="field-group">
            <label>From</label>
            <p className="field-value">{message.fromName || '—'}</p>
          </div>
          <div className="field-group">
            <label>To</label>
            <p className="field-value">
              {message.toName || (message.type === 'BROADCAST' ? 'All operators' : '—')}
            </p>
          </div>
          <div className="field-group">
            <label>Sent</label>
            <p className="field-value">
              {message.sentAt ? new Date(message.sentAt).toLocaleString() : '—'}
            </p>
          </div>
          <div className="field-group">
            <label>Message</label>
            <div className="message-body">{message.content || '(no content)'}</div>
          </div>

          <div className="drawer-actions">
            <button onClick={onClose} className="btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
