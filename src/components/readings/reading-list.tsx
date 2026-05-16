'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Download, Filter, Eye } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';

interface Equipment {
  id: string;
  code: string;
  name: string;
  type: string;
  station: string;
  status: string;
  voltage?: number;
  lastReading?: string;
}

interface ReadingListProps {
  equipment: Equipment[];
  onSelectEquipment: (id: string) => void;
  onBulkImport: () => void;
}

export function ReadingList({ equipment, onSelectEquipment, onBulkImport }: ReadingListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = equipment.filter(item => {
    const matchesSearch = item.code.toLowerCase().includes(search.toLowerCase()) ||
                         item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 flex-1 sm:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Types</option>
            <option value="CIRCUIT_330KV">330KV Circuit</option>
            <option value="CIRCUIT_132KV">132KV Circuit</option>
            <option value="FEEDER_33KV">33KV Feeder</option>
            <option value="TRANSFORMER">Transformer</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBulkImport}>
            <Download className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Reading
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Station</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Last Reading</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    No equipment found
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <Badge variant="secondary">{item.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.station}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.lastReading || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectEquipment(item.id)}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
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
