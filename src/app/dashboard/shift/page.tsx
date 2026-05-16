'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ClipboardList, AlertTriangle, CheckCircle2, TrendingUp, Zap, FileText } from 'lucide-react';
import Link from 'next/link';

const shift = {
  name: 'Day Shift',
  start: '06:00',
  end: '14:00',
  startedHoursAgo: 5.5,
  totalHours: 8,
};

const tasks = [
  { id: 't1', label: '14:00 hourly readings', status: 'pending', equipment: '12 of 18 done', href: '/readings' },
  { id: 't2', label: 'TR-132-01 inspection', status: 'pending', equipment: 'Due by end of shift', href: '/inspections' },
  { id: 't3', label: '12:00 readings', status: 'done', equipment: 'All complete', href: '/readings' },
  { id: 't4', label: 'Morning logbook entry', status: 'done', equipment: 'Submitted', href: '/operations/logbook' },
];

const alerts = [
  { id: 'a1', text: 'TR-132-01 oil temperature elevated (87 °C)', severity: 'warning', time: '10 min ago' },
  { id: 'a2', text: 'CKT-330-01 voltage anomaly logged for review', severity: 'info', time: '1 hr ago' },
];

export default function CurrentShiftPage() {
  const elapsedPct = Math.min(100, (shift.startedHoursAgo / shift.totalHours) * 100);

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader title="Current Shift" description={`${shift.name} · ${shift.start} – ${shift.end}`} />

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time on shift</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {Math.floor(shift.startedHoursAgo)}h {Math.round((shift.startedHoursAgo % 1) * 60)}m
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(shift.totalHours - shift.startedHoursAgo).toFixed(1)}h remaining
                </p>
              </div>
              <Clock className="w-10 h-10 text-indigo-500" />
            </div>
            <div className="mt-5">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${elapsedPct}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{shift.start}</span>
                <span>{shift.end}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Tasks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {tasks.filter((t) => t.status === 'done').length}<span className="text-sm font-medium text-gray-500"> / {tasks.length}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">completed this shift</p>
              </div>
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-gray-500" />
                  Shift tasks
                </h2>
              </div>
            </div>
            <ul className="divide-y divide-gray-100">
              {tasks.map((t) => (
                <li key={t.id}>
                  <Link
                    href={t.href}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {t.status === 'done' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <span className="w-5 h-5 border-2 border-gray-300 rounded-full shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className={`text-sm truncate ${t.status === 'done' ? 'text-gray-500 line-through' : 'font-medium text-gray-900'}`}>
                          {t.label}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{t.equipment}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-500" />
                Active alerts
              </h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {alerts.map((a) => (
                <li key={a.id} className="px-5 py-3 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{a.text}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.time}</p>
                  </div>
                </li>
              ))}
              {alerts.length === 0 && (
                <li className="p-6 text-center text-sm text-gray-500">No active alerts.</li>
              )}
            </ul>
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/readings" className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-left transition-colors">
              <TrendingUp className="w-6 h-6 text-indigo-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Log readings</p>
            </Link>
            <Link href="/interruptions" className="p-4 bg-red-50 hover:bg-red-100 rounded-lg text-left transition-colors">
              <Zap className="w-6 h-6 text-red-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Report interruption</p>
            </Link>
            <Link href="/inspections" className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
              <CheckCircle2 className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">New inspection</p>
            </Link>
            <Link href="/operations/logbook" className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
              <FileText className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Add logbook entry</p>
            </Link>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
