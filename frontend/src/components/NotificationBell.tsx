import { useEffect, useRef, useState } from 'react';
import { useMessages, useAcknowledgeMessage } from '../hooks/useMessages';
import type { NavSection } from './Sidebar';
import './NotificationBell.css';

interface NotificationBellProps {
  stationId?: string;
  onOpenMessages?: (section: NavSection) => void;
}

const SEVERITY_GLYPH: Record<string, string> = {
  info: 'ℹ',
  warning: '⚠',
  critical: '⛔'
};

export default function NotificationBell({ stationId, onOpenMessages }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { data } = useMessages(stationId);
  const acknowledge = useAcknowledgeMessage();

  const messages: any[] = data?.data || [];
  const unread = messages.filter((m: any) => !m.readAt);
  const recent = messages.slice(0, 6);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('mousedown', handler);
    window.addEventListener('keydown', escHandler);
    return () => {
      window.removeEventListener('mousedown', handler);
      window.removeEventListener('keydown', escHandler);
    };
  }, [isOpen]);

  const handleItemClick = (msg: any) => {
    const id = msg._id || msg.id;
    if (!msg.readAt && id) acknowledge.mutate(id);
    setIsOpen(false);
  };

  const formatRelative = (dt?: string): string => {
    if (!dt) return '';
    const diff = Date.now() - new Date(dt).getTime();
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return `${Math.floor(diff / 86_400_000)}d ago`;
  };

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        className="notification-trigger"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`Notifications${unread.length > 0 ? ` (${unread.length} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="notification-icon" aria-hidden>🔔</span>
        {unread.length > 0 && (
          <span className="notification-badge" aria-hidden>
            {unread.length > 99 ? '99+' : unread.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-popover" role="dialog" aria-label="Notifications">
          <div className="notification-popover-header">
            <h3>Notifications</h3>
            {unread.length > 0 && <span className="notification-count">{unread.length} unread</span>}
          </div>

          <div className="notification-popover-list">
            {recent.length === 0 ? (
              <div className="notification-popover-empty">
                <span className="notification-empty-icon" aria-hidden>🔕</span>
                <p>You're all caught up.</p>
              </div>
            ) : (
              recent.map((msg: any) => {
                const id = msg._id || msg.id;
                const isUnread = !msg.readAt;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`notification-item ${isUnread ? 'unread' : ''}`}
                    onClick={() => handleItemClick(msg)}
                  >
                    <span
                      className={`notification-severity sev-${msg.severity || 'info'}`}
                      aria-hidden
                    >
                      {SEVERITY_GLYPH[msg.severity || 'info']}
                    </span>
                    <div className="notification-item-body">
                      <div className="notification-item-subject">
                        {msg.subject || '(no subject)'}
                      </div>
                      <div className="notification-item-meta">
                        <span>{msg.fromName || 'System'}</span>
                        <span>·</span>
                        <span>{formatRelative(msg.sentAt)}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {onOpenMessages && (
            <div className="notification-popover-footer">
              <button
                type="button"
                className="notification-view-all"
                onClick={() => {
                  setIsOpen(false);
                  onOpenMessages('messages');
                }}
              >
                View all messages →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
