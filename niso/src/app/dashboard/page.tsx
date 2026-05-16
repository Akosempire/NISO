'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { useState, useEffect } from 'react';

const mockOperator = {
  id: 'user-1',
  email: 'operator@niso.gov',
  name: 'John Operator',
  role: 'OPERATOR',
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeInterruptions: 3,
    todaysReadings: 1247,
    activeUsers: 12,
    equipmentOnline: 98,
    averageOutageTime: '2h 35m',
    monthlyTrend: 8,
    uptime: 99.2,
  });

  return (
    <MainLayout user={mockOperator}>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">System overview and key metrics</p>
        </div>

        <DashboardOverview stats={stats} />
      </div>
    </MainLayout>
  );
}