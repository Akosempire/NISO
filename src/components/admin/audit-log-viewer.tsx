'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download } from 'lucide-react';
import { useState } from 'react';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  user: string;
  userRole: string;
  timestamp: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
  onExport: () => void;
}

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  RESTORE: 'bg-green-100 text-green-800',
  SEAL: 'bg-purple-100 text-purple-800',
};

export function AuditLogViewer({ logs, onExport }: AuditLogViewerProps) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const actions = Array.from(new Set(logs.map((l) => l.action)));

  const filtered = logs.filter((item) => {
    const matchesSearch = item.user.toLowerCase().includes(search.toLowerCase()) ||
                         item.entityType.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'all' || item.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 flex-1 sm:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Actions</option>
            {actions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
        <Button variant="outline" onClick={onExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{log.user}</div>
                      <div className="text-xs text-gray-500">{log.userRole}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={actionColors[log.action] || 'bg-gray-100 text-gray-800'}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="font-medium">{log.entityType}</div>
                      <div className="text-xs text-gray-500 font-mono">{log.entityId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.action === 'UPDATE' && (
                        <details className="cursor-pointer">
                          <summary className="text-indigo-600 hover:underline">View changes</summary>
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs space-y-1">
                            {log.oldValues && (
                              <div>
                                <strong>Before:</strong> {JSON.stringify(log.oldValues)}
                              </div>
                            )}
                            {log.newValues && (
                              <div>
                                <strong>After:</strong> {JSON.stringify(log.newValues)}
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
