'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Zap, AlertTriangle, CheckCircle2, MessageSquare, Settings } from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: string;
  category: 'interruption' | 'sla' | 'review' | 'message' | 'system';
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const mock: Notification[] = [
  { id: 'n1', category: 'interruption', title: 'Trip on TR-132-01', body: 'Zone 1 distance protection operated at Sub Station A.', time: '2 min ago', unread: true },
  { id: 'n2', category: 'review', title: 'Reading correction submitted', body: 'M. Operator submitted a correction on FDR-33-04 for review.', time: '12 min ago', unread: true },
  { id: 'n3', category: 'sla', title: 'SLA breach risk on FDR-33-06', body: 'Forecast vs actual variance exceeded threshold.', time: '38 min ago', unread: true },
  { id: 'n4', category: 'message', title: 'Broadcast from Regional Control', body: 'Planned outage scheduled Friday 09:00–13:00.', time: '1 hr ago', unread: false },
  { id: 'n5', category: 'system', title: 'Monthly readings sealed', body: 'April 2026 readings have been sealed.', time: 'Yesterday', unread: false },
];

const cfg: Record<Notification['category'], { label: string; icon: React.ComponentType<{ className?: string }>; tint: string }> = {
  interruption: { label: 'Interruption', icon: Zap, tint: 'bg-red-50 text-red-600' },
  sla: { label: 'SLA', icon: AlertTriangle, tint: 'bg-yellow-50 text-yellow-600' },
  review: { label: 'Review', icon: CheckCircle2, tint: 'bg-indigo-50 text-indigo-600' },
  message: { label: 'Message', icon: MessageSquare, tint: 'bg-blue-50 text-blue-600' },
  system: { label: 'System', icon: Settings, tint: 'bg-gray-100 text-gray-600' },
};

export default function NotificationCenterPage() {
  const [filter, setFilter] = useState<'all' | Notification['category']>('all');
  const [items, setItems] = useState(mock);
  const filtered = items.filter((i) => filter === 'all' || i.category === filter);
  const markAllRead = () => setItems((p) => p.map((i) => ({ ...i, unread: false })));

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Notification Center"
          description="System-wide alerts, broadcasts, and review queue activity"
          actions={
            <Button variant="outline" size="sm" onClick={markAllRead}>
              Mark all read
            </Button>
          }
        />

        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'interruption', 'sla', 'review', 'message', 'system'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  filter === k
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {k === 'all' ? 'All' : cfg[k].label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {filtered.map((n) => {
              const c = cfg[n.category];
              const Icon = c.icon;
              return (
                <li key={n.id} className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors ${n.unread ? 'bg-indigo-50/30' : ''}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.tint}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm ${n.unread ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>{n.title}</p>
                      {n.unread && <span className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="!text-[10px]">{c.label}</Badge>
                      <span className="text-xs text-gray-500">{n.time}</span>
                    </div>
                  </div>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="p-10 text-center text-sm text-gray-500">
                <Bell className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                No notifications.
              </li>
            )}
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}
