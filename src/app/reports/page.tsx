'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { ReportSelector } from '@/components/reports/report-selector';
import { useState } from 'react';

const mockReportTemplates = [
  {
    id: 'rpt-1',
    name: 'Monthly Operations Report',
    description: 'Comprehensive monthly operational summary with all readings and interruptions',
    category: 'Operations',
    lastGenerated: '2024-05-01T10:30:00Z',
    format: ['PDF', 'Excel'],
  },
  {
    id: 'rpt-2',
    name: 'SLA Performance Report',
    description: 'Detailed SLA metrics and variance analysis',
    category: 'Performance',
    lastGenerated: '2024-05-05T14:15:00Z',
    format: ['PDF', 'Excel', 'CSV'],
  },
  {
    id: 'rpt-3',
    name: 'Interruption Analysis',
    description: 'Analysis of system interruptions with statistics and trends',
    category: 'Analysis',
    format: ['PDF'],
  },
];

export default function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download system reports</p>
        </div>

        <ReportSelector
          templates={mockReportTemplates}
          onSelect={(templateId) => {
            setSelectedTemplate(templateId);
            console.log('Generate report:', templateId);
          }}
          onDownload={(reportId, format) => {
            console.log('Download:', reportId, 'as', format);
          }}
        />
      </div>
    </MainLayout>
  );
}
