'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity, Zap, Wrench, PowerOff, RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

type EquipmentStatus = 'ACTIVE' | 'TRIPPED' | 'MAINTENANCE' | 'OFFLINE';

interface GridEquipment {
  id: string;
  code: string;
  name: string;
  voltage: number;
  station: string;
  region: string;
  status: EquipmentStatus;
  lastReading: string;
  load?: number;
}

const mockEquipment: GridEquipment[] = [
  { id: '1', code: 'CKT-330-01', name: '330kV Circuit 01', voltage: 330, station: 'Main Station', region: 'North', status: 'ACTIVE', lastReading: '2 min ago', load: 78 },
  { id: '2', code: 'CKT-330-02', name: '330kV Circuit 02', voltage: 330, station: 'Main Station', region: 'North', status: 'ACTIVE', lastReading: '2 min ago', load: 64 },
  { id: '3', code: 'TR-132-01', name: 'Transformer A1', voltage: 132, station: 'Sub Station A', region: 'East', status: 'TRIPPED', lastReading: '12 min ago' },
  { id: '4', code: 'FDR-33-04', name: '33kV Feeder 04', voltage: 33, station: 'Sub Station A', region: 'East', status: 'ACTIVE', lastReading: '1 min ago', load: 45 },
  { id: '5', code: 'FDR-33-05', name: '33kV Feeder 05', voltage: 33, station: 'Sub Station B', region: 'East', status: 'MAINTENANCE', lastReading: '3 hr ago' },
  { id: '6', code: 'CKT-132-03', name: '132kV Circuit 03', voltage: 132, station: 'Main Station', region: 'North', status: 'ACTIVE', lastReading: '3 min ago', load: 82 },
  { id: '7', code: 'TR-330-02', name: 'Transformer B2', voltage: 330, station: 'Central Station', region: 'West', status: 'ACTIVE', lastReading: '2 min ago', load: 59 },
  { id: '8', code: 'REC-330-01', name: 'Reactor 01', voltage: 330, station: 'Central Station', region: 'West', status: 'OFFLINE', lastReading: '1 day ago' },
  { id: '9', code: 'FDR-33-12', name: '33kV Feeder 12', voltage: 33, station: 'Sub Station C', region: 'South', status: 'ACTIVE', lastReading: '4 min ago', load: 71 },
  { id: '10', code: 'BUS-132-01', name: 'Bus Bar 01', voltage: 132, station: 'Sub Station C', region: 'South', status: 'ACTIVE', lastReading: '2 min ago', load: 88 },
];

const statusConfig: Record<EquipmentStatus, { label: string; dot: string; bg: string; text: string; ring: string }> = {
  ACTIVE: { label: 'Online', dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200' },
  TRIPPED: { label: 'Tripped', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' },
  MAINTENANCE: { label: 'Maintenance', dot: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', ring: 'ring-yellow-200' },
  OFFLINE: { label: 'Offline', dot: 'bg-gray-400', bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-200' },
};

export default function LiveGridPage() {
  const [region, setRegion] = useState<string>('all');
  const [voltage, setVoltage] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return mockEquipment.filter((e) => {
      if (region !== 'all' && e.region !== region) return false;
      if (voltage !== 'all' && String(e.voltage) !== voltage) return false;
      if (search && !`${e.name} ${e.code}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [region, voltage, search]);

  const counts = useMemo(() => {
    const all = mockEquipment;
    return {
      total: all.length,
      active: all.filter((e) => e.status === 'ACTIVE').length,
      tripped: all.filter((e) => e.status === 'TRIPPED').length,
      maintenance: all.filter((e) => e.status === 'MAINTENANCE').length,
      offline: all.filter((e) => e.status === 'OFFLINE').length,
    };
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Live Grid Overview"
          description="Real-time status of all equipment across the national grid"
          actions={
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Online</p>
                <p className="text-2xl font-bold text-gray-900">{counts.active}</p>
                <p className="text-xs text-gray-500 mt-0.5">of {counts.total} equipment</p>
              </div>
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Tripped</p>
                <p className="text-2xl font-bold text-red-600">{counts.tripped}</p>
                <p className="text-xs text-gray-500 mt-0.5">requires attention</p>
              </div>
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{counts.maintenance}</p>
                <p className="text-xs text-gray-500 mt-0.5">scheduled</p>
              </div>
              <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Offline</p>
                <p className="text-2xl font-bold text-gray-700">{counts.offline}</p>
                <p className="text-xs text-gray-500 mt-0.5">not reporting</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center">
                <PowerOff className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name or code…"
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
            </select>
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
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((e) => {
            const cfg = statusConfig[e.status];
            return (
              <Card key={e.id} className={`p-4 ring-1 ${cfg.ring}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 truncate">{e.code}</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{e.name}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Voltage</p>
                    <p className="font-medium text-gray-900">{e.voltage} kV</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Load</p>
                    <p className="font-medium text-gray-900">{e.load !== undefined ? `${e.load}%` : '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Station</p>
                    <p className="font-medium text-gray-900 truncate">{e.station} · {e.region}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Last reading</span>
                  <span className="text-gray-700 font-medium">{e.lastReading}</span>
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <Card className="p-8 col-span-full text-center text-sm text-gray-500">
              No equipment matches the current filters.
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
