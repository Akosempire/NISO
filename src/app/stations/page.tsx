'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

interface Station {
  id: string;
  code: string;
  name: string;
  region: string;
  equipment: number;
  operators: number;
  status: 'online' | 'partial' | 'offline';
}

const mockStations: Station[] = [
  { id: 's1', code: 'MAIN', name: 'Main Station', region: 'North', equipment: 24, operators: 6, status: 'online' },
  { id: 's2', code: 'SUB-A', name: 'Sub Station A', region: 'East', equipment: 18, operators: 4, status: 'partial' },
  { id: 's3', code: 'SUB-B', name: 'Sub Station B', region: 'East', equipment: 14, operators: 3, status: 'online' },
  { id: 's4', code: 'SUB-C', name: 'Sub Station C', region: 'South', equipment: 22, operators: 5, status: 'online' },
  { id: 's5', code: 'CTRL', name: 'Central Station', region: 'Central', equipment: 31, operators: 8, status: 'online' },
  { id: 's6', code: 'WST-1', name: 'Western Hub 1', region: 'West', equipment: 12, operators: 2, status: 'offline' },
];

const statusBadge: Record<Station['status'], { label: string; variant: 'secondary' | 'default' | 'destructive' }> = {
  online: { label: 'Online', variant: 'secondary' },
  partial: { label: 'Partial', variant: 'default' },
  offline: { label: 'Offline', variant: 'destructive' },
};

export default function StationsPage() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const filtered = mockStations.filter((s) => {
    if (region !== 'all' && s.region !== region) return false;
    if (search && !`${s.name} ${s.code}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Stations"
          description="Substations and operational sites across all regions"
          actions={
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New station
            </Button>
          }
        />

        <Card className="p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search stations…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="all">All regions</option>
              <option value="North">North</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="South">South</option>
              <option value="Central">Central</option>
            </select>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Station</th>
                  <th className="px-5 py-3 text-left font-medium">Code</th>
                  <th className="px-5 py-3 text-left font-medium">Region</th>
                  <th className="px-5 py-3 text-right font-medium">Equipment</th>
                  <th className="px-5 py-3 text-right font-medium">Operators</th>
                  <th className="px-5 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => {
                  const cfg = statusBadge[s.status];
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-5 py-3 text-gray-700 font-mono">{s.code}</td>
                      <td className="px-5 py-3 text-gray-700">{s.region}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-900">{s.equipment}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-900">{s.operators}</td>
                      <td className="px-5 py-3 text-right">
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">
                      No stations match the current filters.
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
