'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Cpu } from 'lucide-react';
import { useState } from 'react';

interface Device {
  id: string;
  code: string;
  name: string;
  type: string;
  station: string;
  voltage: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';
  lastReading: string;
}

const mock: Device[] = [
  { id: '1', code: 'CKT-330-01', name: '330kV Circuit 01', type: 'Circuit Breaker', station: 'Main Station', voltage: 330, status: 'ACTIVE', lastReading: '2 min ago' },
  { id: '2', code: 'TR-132-01', name: 'Transformer A1', type: 'Transformer', station: 'Sub Station A', voltage: 132, status: 'ACTIVE', lastReading: '4 min ago' },
  { id: '3', code: 'FDR-33-04', name: '33kV Feeder 04', type: 'Feeder', station: 'Sub Station A', voltage: 33, status: 'ACTIVE', lastReading: '1 min ago' },
  { id: '4', code: 'FDR-33-05', name: '33kV Feeder 05', type: 'Feeder', station: 'Sub Station B', voltage: 33, status: 'MAINTENANCE', lastReading: '3 hr ago' },
  { id: '5', code: 'REC-330-01', name: 'Reactor 01', type: 'Reactor', station: 'Central Station', voltage: 330, status: 'ACTIVE', lastReading: '2 min ago' },
  { id: '6', code: 'BUS-132-01', name: 'Bus Bar 01', type: 'Bus', station: 'Sub Station C', voltage: 132, status: 'ACTIVE', lastReading: '2 min ago' },
  { id: '7', code: 'TR-330-99', name: 'Transformer Old', type: 'Transformer', station: 'Main Station', voltage: 330, status: 'DECOMMISSIONED', lastReading: '—' },
];

const statusBadge: Record<Device['status'], { label: string; variant: 'secondary' | 'default' | 'destructive' }> = {
  ACTIVE: { label: 'Active', variant: 'secondary' },
  MAINTENANCE: { label: 'Maintenance', variant: 'default' },
  DECOMMISSIONED: { label: 'Decommissioned', variant: 'destructive' },
};

export default function DevicesPage() {
  const [search, setSearch] = useState('');
  const [voltage, setVoltage] = useState('all');
  const [type, setType] = useState('all');

  const filtered = mock.filter((d) => {
    if (voltage !== 'all' && String(d.voltage) !== voltage) return false;
    if (type !== 'all' && d.type !== type) return false;
    if (search && !`${d.name} ${d.code}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Device Registry"
          description="Equipment registered across stations, with template, voltage, and status"
          actions={
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Register device
            </Button>
          }
        />

        <Card className="p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search devices…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="all">All voltages</option>
              <option value="330">330 kV</option>
              <option value="132">132 kV</option>
              <option value="33">33 kV</option>
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="all">All types</option>
              <option value="Circuit Breaker">Circuit</option>
              <option value="Transformer">Transformer</option>
              <option value="Feeder">Feeder</option>
              <option value="Reactor">Reactor</option>
              <option value="Bus">Bus</option>
            </select>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Device</th>
                  <th className="px-5 py-3 text-left font-medium">Type</th>
                  <th className="px-5 py-3 text-left font-medium">Station</th>
                  <th className="px-5 py-3 text-right font-medium">Voltage</th>
                  <th className="px-5 py-3 text-right font-medium">Last reading</th>
                  <th className="px-5 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((d) => {
                  const cfg = statusBadge[d.status];
                  return (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center">
                            <Cpu className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{d.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{d.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{d.type}</td>
                      <td className="px-5 py-3 text-gray-700">{d.station}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-900">{d.voltage} kV</td>
                      <td className="px-5 py-3 text-right text-gray-700">{d.lastReading}</td>
                      <td className="px-5 py-3 text-right">
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">
                      No devices match the current filters.
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
