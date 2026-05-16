'use client';

import { StatsCard } from '@/components/shared/stats-card';
import { Activity, Users, Zap, TrendingUp, Clock, Server } from 'lucide-react';

interface DashboardOverviewProps {
  stats: {
    activeInterruptions: number;
    todaysReadings: number;
    activeUsers: number;
    equipmentOnline: number;
    averageOutageTime: string;
    monthlyTrend: number;
    uptime: number;
  };
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard
        title="Active Interruptions"
        value={stats.activeInterruptions}
        description="Currently affecting power supply"
        icon={<Zap className="w-8 h-8" />}
      />

      <StatsCard
        title="Today's Readings"
        value={stats.todaysReadings.toLocaleString()}
        trend={{ value: stats.monthlyTrend, isPositive: true }}
        description="Operational readings recorded"
        icon={<Activity className="w-8 h-8" />}
      />

      <StatsCard
        title="Active Users"
        value={stats.activeUsers}
        description="Currently logged in"
        icon={<Users className="w-8 h-8" />}
      />

      <StatsCard
        title="Equipment Online"
        value={`${stats.equipmentOnline}%`}
        description="System availability"
        icon={<Server className="w-8 h-8" />}
      />

      <StatsCard
        title="System Uptime"
        value={`${stats.uptime}%`}
        description="Last 30 days"
        icon={<TrendingUp className="w-8 h-8" />}
      />

      <StatsCard
        title="Avg Outage Duration"
        value={stats.averageOutageTime}
        description="Current active interruptions"
        icon={<Clock className="w-8 h-8" />}
      />
    </div>
  );
}