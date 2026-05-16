'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { ReportSelector } from '@/components/reports/report-selector';

const mockSupervisor = {
  id: 'user-2',
  email: 'supervisor@niso.gov',
  name: 'Sarah Supervisor',
  role: 'SUPERVISOR',
};

const mockReports = [
  {
    id: '1',
    name: 'Monthly Operations Report',
    description: 'Comprehensive monthly operational summary',
    category: 'Operations',
    formats: ['PDF', 'Excel', 'CSV'],
    lastGenerated: '2024-05-01',
  },
  {
    id: '2',
    name: 'SLA Performance Report',
    description: 'Service level agreement performance metrics',
    category: 'SLA',
    formats: ['PDF', 'Excel'],
    lastGenerated: '2024-05-01',
  },
  {
    id: '3',
    name: 'Interruption Analysis',
    description: 'Detailed analysis of system interruptions',
    category: 'Reliability',
    formats: ['PDF', 'Excel', 'CSV'],
    lastGenerated: '2024-04-30',
  },
];

export default function ReportsPage() {
  return (
    <MainLayout user={mockSupervisor}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download system reports</p>
        </div>

        <ReportSelector
          reports={mockReports}
          onGenerate={(reportId, format) => {
            console.log('Generate report:', reportId, format);
          }}
        />
      </div>
    </MainLayout>
  );
}