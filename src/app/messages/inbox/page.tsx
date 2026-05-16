'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PenSquare, Search, Reply, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Thread {
  id: string;
  sender: string;
  senderRole: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  unread: boolean;
  broadcast?: boolean;
}

const mockThreads: Thread[] = [
  { id: 't1', sender: 'A. Supervisor', senderRole: 'SUPERVISOR', subject: 'Reading correction approved', preview: 'Your correction on CKT-330-01 voltage at 14:00 has been approved…', body: 'Your correction on CKT-330-01 voltage at 14:00 has been approved. The updated value is now reflected in the readings ledger. Please continue using the SCADA reference for the rest of the shift.', time: '14:42', unread: true },
  { id: 't2', sender: 'Regional Control', senderRole: 'REGIONAL_ADMIN', subject: 'Planned outage 09:00–13:00 Friday', preview: 'Planned outage on Sub Station B 33kV bus on Friday, 09:00 to 13:00…', body: 'Planned outage on Sub Station B 33kV bus on Friday, 09:00 to 13:00. Please ensure all logbook entries are completed before 08:00 on Friday and notify customers per the standard SLA.', time: '13:10', unread: true, broadcast: true },
  { id: 't3', sender: 'J. Operator', senderRole: 'OPERATOR', subject: 'Handover notes — morning shift', preview: 'TR-132-01 oil temperature alarm cleared at 05:20…', body: 'TR-132-01 oil temperature alarm cleared at 05:20 after the cooling fan reset. Logbook entry e202605080012 has the full timeline. Please monitor for the rest of the shift.', time: '08:00', unread: false },
  { id: 't4', sender: 'System', senderRole: 'SYSTEM', subject: 'Monthly readings sealed for April 2026', preview: 'April readings have been sealed. Edits now require HQ approval…', body: 'April readings have been sealed. Edits now require HQ approval. Use the Corrections Queue to submit any remaining requests.', time: 'Yesterday', unread: false, broadcast: true },
];

export default function InboxPage() {
  const [activeId, setActiveId] = useState<string>(mockThreads[0].id);
  const [search, setSearch] = useState('');

  const filtered = mockThreads.filter((t) =>
    !search || `${t.subject} ${t.sender} ${t.preview}`.toLowerCase().includes(search.toLowerCase())
  );
  const active = mockThreads.find((t) => t.id === activeId);

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Inbox"
          description="Messages, broadcasts, and station communications"
          actions={
            <Button size="sm">
              <PenSquare className="w-4 h-4 mr-2" />
              Compose
            </Button>
          }
        />

        <div className="grid gap-4 lg:grid-cols-[360px_1fr] h-[600px]">
          <Card className="p-0 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search messages…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {filtered.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setActiveId(t.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      activeId === t.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm truncate ${t.unread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {t.sender}
                      </p>
                      <span className="text-[11px] text-gray-500 shrink-0">{t.time}</span>
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${t.unread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {t.subject}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500 truncate">{t.preview}</p>
                      {t.broadcast && <Badge variant="outline" className="shrink-0 !px-2 !py-0 text-[10px]">Broadcast</Badge>}
                    </div>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="p-8 text-center text-sm text-gray-500">No messages match your search.</li>
              )}
            </ul>
          </Card>

          <Card className="p-0 overflow-hidden flex flex-col">
            {active ? (
              <>
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{active.subject}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        From <span className="font-medium text-gray-900">{active.sender}</span>
                        <span className="text-gray-400"> · {active.senderRole}</span>
                        <span className="text-gray-400"> · {active.time}</span>
                      </p>
                    </div>
                    {active.broadcast && <Badge>Broadcast</Badge>}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{active.body}</p>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
                Select a message
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
