import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';

// Maps backend broadcast `type` strings to the React Query keys that should
// invalidate when the event arrives. Backend currently emits these from the
// readings/sla/interruption routes via `global.broadcast(...)`.
const INVALIDATION_MAP: Record<string, string[]> = {
  reading_created:        ['readings'],
  reading_sealed:         ['readings'],
  reading_updated:        ['readings'],
  sla_created:            ['sla'],
  sla_approved:           ['sla'],
  sla_updated:            ['sla'],
  interruption_created:   ['interruptions'],
  interruption_restored:  ['interruptions'],
  interruption_updated:   ['interruptions'],
  inspection_created:     ['inspections'],
  inspection_approved:    ['inspections'],
  notification_created:   ['messages'],
  month_sealed:           ['month-seal', 'readings', 'sla'],
};

/** WebSocket URL derived from the API base. Falls back to localhost:3001. */
function deriveWsUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  try {
    const url = new URL(apiUrl);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${url.host}`;
  } catch {
    return 'ws://localhost:3001';
  }
}

/**
 * Subscribe to backend WebSocket broadcasts and invalidate the relevant
 * React Query caches so all open pages stay in sync with operational data.
 * Auto-reconnects with exponential backoff. Tears down on logout.
 */
export function useRealtime() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      const ws = new WebSocket(deriveWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const keys = INVALIDATION_MAP[message?.type];
          if (keys) {
            keys.forEach((key) => queryClient.invalidateQueries([key]));
          }
        } catch {
          // Ignore non-JSON frames.
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        const attempt = Math.min(reconnectAttempts.current + 1, 6);
        reconnectAttempts.current = attempt;
        const delay = Math.min(1000 * 2 ** attempt, 30_000);
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };

      ws.onerror = () => {
        // onclose handles reconnect.
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [token, queryClient]);
}
