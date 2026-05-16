'use client';

import { StatsCard } from '@/components/shared/stats-card';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Users,
  Zap,
  Clock,
  BarChart3
} from 'lucide-react';

interface DashboardOverviewProps {
  stats: {
    activeInterruptions: number;
    readingsToday: number;
    activeUsers: number;
    equipmentOnline: number;
    averageOutageTime: string;
    monthlyTrend: number;
    uptime: number;
  };
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Interruptions"
          value={stats.activeInterruptions}
          trend={{ value: 12, direction: 'down', label: 'from yesterday' }}
          icon={<Zap className="w-6 h-6" />}
        />
        <StatsCard
          title="Readings Today"
          value={stats.readingsToday}
          description="Across all stations"
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          description="Online now"
          icon={<Users className="w-6 h-6" />}
        />
        <StatsCard
          title="Equipment Online"
          value={`${stats.equipmentOnline}%`}
          trend={{ value: 2, direction: 'up', label: 'from last week' }}
          icon={<CheckCircle className="w-6 h-6" />}
        />
      </div>

      {/* System Health */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Uptime */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">System Uptime</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.uptime}%</p>
              <p className="text-xs text-gray-500 mt-2">30-day average</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                <span className="text-sm font-semibold text-green-600">{stats.uptime}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Average Outage */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Outage Duration</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.averageOutageTime}</p>
              <p className="text-xs text-gray-500 mt-2">Across recent interruptions</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-left transition-colors">
            <TrendingUp className="w-6 h-6 text-indigo-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Reading</p>
          </button>
          <button className="p-4 bg-red-50 hover:bg-red-100 rounded-lg text-left transition-colors">
            <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Report Interruption</p>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">New Inspection</p>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
            <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">View Reports</p>
          </button>
        </div>
      </Card>
    </div>
  );
}
