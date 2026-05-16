'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Building2 } from 'lucide-react';
import { useState } from 'react';

interface Region {
  id: string;
  code: string;
  name: string;
  stations: number;
  equipment: number;
  uptime: number;
  status: 'active' | 'review';
}

const mockRegions: Region[] = [
  { id: 'r1', code: 'NTH', name: 'North Region', stations: 12, equipment: 184, uptime: 99.4, status: 'active' },
  { id: 'r2', code: 'EST', name: 'East Region', stations: 9, equipment: 138, uptime: 98.7, status: 'active' },
  { id: 'r3', code: 'WST', name: 'West Region', stations: 8, equipment: 121, uptime: 99.1, status: 'active' },
  { id: 'r4', code: 'STH', name: 'South Region', stations: 11, equipment: 162, uptime: 97.9, status: 'review' },
  { id: 'r5', code: 'CTL', name: 'Central Region', stations: 14, equipment: 210, uptime: 99.6, status: 'active' },
];

export default function RegionsPage() {
  const [search, setSearch] = useState('');
  const filtered = mockRegions.filter(
    (r) => !search || `${r.name} ${r.code}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Regions"
          description="Manage operational regions and their assigned stations"
          actions={
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New region
            </Button>
          }
        />

        <Card className="p-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search regions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Region</th>
                  <th className="px-5 py-3 text-left font-medium">Code</th>
                  <th className="px-5 py-3 text-right font-medium">Stations</th>
                  <th className="px-5 py-3 text-right font-medium">Equipment</th>
                  <th className="px-5 py-3 text-right font-medium">30d Uptime</th>
                  <th className="px-5 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <p className="font-medium text-gray-900">{r.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-mono">{r.code}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-gray-900">{r.stations}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-gray-900">{r.equipment}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-gray-900">{r.uptime}%</td>
                    <td className="px-5 py-3 text-right">
                      <Badge variant={r.status === 'active' ? 'secondary' : 'default'}>
                        {r.status === 'active' ? 'Active' : 'Under review'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">
                      No regions match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
