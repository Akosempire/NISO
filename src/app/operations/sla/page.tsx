'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Download } from 'lucide-react';

interface FeederSLA {
  id: string;
  code: string;
  name: string;
  station: string;
  forecast: number;
  actual: number;
  uptime: number;
  status: 'on-target' | 'watch' | 'breach';
}

const mockFeeders: FeederSLA[] = [
  { id: '1', code: 'FDR-33-01', name: 'Industrial Feeder 01', station: 'Main Station', forecast: 12.5, actual: 12.3, uptime: 99.8, status: 'on-target' },
  { id: '2', code: 'FDR-33-02', name: 'Residential Feeder', station: 'Main Station', forecast: 8.0, actual: 7.4, uptime: 98.2, status: 'on-target' },
  { id: '3', code: 'FDR-33-03', name: 'Commercial Feeder', station: 'Sub Station A', forecast: 15.2, actual: 14.1, uptime: 96.5, status: 'watch' },
  { id: '4', code: 'FDR-33-04', name: 'Industrial Feeder 04', station: 'Sub Station A', forecast: 22.0, actual: 18.6, uptime: 94.1, status: 'breach' },
  { id: '5', code: 'FDR-33-05', name: 'Mixed Feeder 05', station: 'Sub Station B', forecast: 9.0, actual: 9.2, uptime: 99.3, status: 'on-target' },
  { id: '6', code: 'FDR-33-06', name: 'Mining Feeder', station: 'Sub Station C', forecast: 30.0, actual: 24.8, uptime: 92.7, status: 'breach' },
];

const statusBadge: Record<FeederSLA['status'], { label: string; variant: 'default' | 'destructive' | 'secondary' }> = {
  'on-target': { label: 'On target', variant: 'secondary' },
  watch: { label: 'Watch', variant: 'default' },
  breach: { label: 'Breach', variant: 'destructive' },
};

export default function SLAMonitoringPage() {
  const avgUptime = (mockFeeders.reduce((s, f) => s + f.uptime, 0) / mockFeeders.length).toFixed(1);
  const breaches = mockFeeders.filter((f) => f.status === 'breach').length;
  const onTarget = mockFeeders.filter((f) => f.status === 'on-target').length;
  const totalForecast = mockFeeders.reduce((s, f) => s + f.forecast, 0).toFixed(1);
  const totalActual = mockFeeders.reduce((s, f) => s + f.actual, 0).toFixed(1);

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="SLA Monitoring"
          description="Real-time service level performance across feeders"
          actions={
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Avg Uptime</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{avgUptime}%</p>
              </div>
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Last 30 days</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">On-Target</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{onTarget}<span className="text-sm font-medium text-gray-500"> / {mockFeeders.length}</span></p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Feeders meeting target</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Active Breaches</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{breaches}</p>
              </div>
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Require escalation</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Forecast vs Actual</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalActual}<span className="text-sm font-medium text-gray-500"> / {totalForecast} MW</span></p>
              </div>
              <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Aggregated MW</p>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Feeder Performance</h2>
              <p className="text-sm text-gray-500">Forecast vs actual demand and uptime</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Feeder</th>
                  <th className="px-5 py-3 text-left font-medium">Station</th>
                  <th className="px-5 py-3 text-right font-medium">Forecast (MW)</th>
                  <th className="px-5 py-3 text-right font-medium">Actual (MW)</th>
                  <th className="px-5 py-3 text-right font-medium">Variance</th>
                  <th className="px-5 py-3 text-right font-medium">Uptime</th>
                  <th className="px-5 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockFeeders.map((f) => {
                  const variance = f.actual - f.forecast;
                  const variancePct = ((variance / f.forecast) * 100).toFixed(1);
                  const cfg = statusBadge[f.status];
                  return (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{f.name}</p>
                        <p className="text-xs text-gray-500">{f.code}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{f.station}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-900">{f.forecast.toFixed(1)}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-900">{f.actual.toFixed(1)}</td>
                      <td className={`px-5 py-3 text-right tabular-nums font-medium ${variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {variance > 0 ? '+' : ''}{variance.toFixed(1)} ({variancePct}%)
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-900">{f.uptime}%</td>
                      <td className="px-5 py-3 text-right">
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
