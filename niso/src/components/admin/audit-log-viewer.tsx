'use client';

import { Search, Filter, Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuditLog {
  id: string;
  user: { name: string };
  action: string;
  entityType: string;
  entityId: string;
  oldValues: any;
  newValues: any;
  createdAt: string;
}

interface AuditLogViewerProps {
  logs: AuditLog[];
  onExport: (filters: any) => void;
}

export function AuditLogViewer({ logs, onExport }: AuditLogViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.entityType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = !selectedAction || log.action === selectedAction;
    const matchesEntityType = !selectedEntityType || log.entityType === selectedEntityType;
    return matchesSearch && matchesAction && matchesEntityType;
  });

  const actions = [...new Set(logs.map(l => l.action))];
  const entityTypes = [...new Set(logs.map(l => l.entityType))];

  const formatChanges = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) return 'No changes';

    const changes = [];
    if (newValues) {
      for (const [key, value] of Object.entries(newValues)) {
        const oldValue = oldValues?.[key];
        if (oldValue !== value) {
          changes.push(`${key}: ${oldValue || 'null'} → ${value}`);
        }
      }
    }
    return changes.length > 0 ? changes.join(', ') : 'Created';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Actions</option>
            {actions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          <select
            value={selectedEntityType}
            onChange={(e) => setSelectedEntityType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Entity Types</option>
            {entityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <Button onClick={() => onExport({ searchTerm, selectedAction, selectedEntityType })} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Changes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      log.action === 'CREATE'
                        ? 'bg-green-100 text-green-800'
                        : log.action === 'UPDATE'
                        ? 'bg-blue-100 text-blue-800'
                        : log.action === 'DELETE'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.entityType}</div>
                    <div className="text-xs text-gray-500">{log.entityId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {formatChanges(log.oldValues, log.newValues)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No audit logs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}