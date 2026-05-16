'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { ReportSelector } from './report-selector';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  lastGenerated?: string;
  format: string[];
}

const allTemplates: ReportTemplate[] = [
  { id: 'rpt-nat-1', name: 'National Operations Summary', description: 'Cross-region operational metrics with grid-level KPIs', category: 'National', lastGenerated: '2026-05-01T10:30:00Z', format: ['PDF', 'Excel'] },
  { id: 'rpt-reg-1', name: 'Regional Performance Report', description: 'Region-level uptime, interruption count, and SLA compliance', category: 'Regional', lastGenerated: '2026-05-05T14:15:00Z', format: ['PDF', 'Excel'] },
  { id: 'rpt-st-1', name: 'Station Daily Report', description: 'Per-station readings, events, and operator activity', category: 'Station', lastGenerated: '2026-05-08T08:00:00Z', format: ['PDF', 'Excel', 'CSV'] },
  { id: 'rpt-sla-1', name: 'SLA Performance Report', description: 'Detailed SLA metrics and variance analysis', category: 'SLA', lastGenerated: '2026-05-05T14:15:00Z', format: ['PDF', 'Excel', 'CSV'] },
  { id: 'rpt-int-1', name: 'Interruption Analysis', description: 'Trip frequency, duration, and recovery analysis with cause breakdown', category: 'Interruption', format: ['PDF'] },
  { id: 'rpt-insp-1', name: 'Inspection Compliance', description: 'Equipment inspection coverage and findings summary', category: 'Inspection', format: ['PDF', 'Excel'] },
  { id: 'rpt-mon-1', name: 'Monthly Operations Report', description: 'Comprehensive monthly operational summary', category: 'Monthly', lastGenerated: '2026-05-01T10:30:00Z', format: ['PDF', 'Excel'] },
  { id: 'rpt-shr-1', name: 'Shared Stakeholder Report', description: 'Externally shared summary for partners and regulators', category: 'Shared', format: ['PDF'] },
  { id: 'rpt-my-1', name: 'My Recent Activity', description: 'Personal activity, completed tasks, and submitted readings', category: 'My', format: ['PDF', 'CSV'] },
  { id: 'rpt-exp-1', name: 'Bulk Reading Export', description: 'Filtered data export for offline analysis', category: 'Exports', format: ['CSV', 'Excel'] },
];

export function ReportsPageBase({
  title,
  description,
  category,
}: {
  title: string;
  description: string;
  category?: string;
}) {
  const templates = category
    ? allTemplates.filter((t) => t.category === category)
    : allTemplates;

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader title={title} description={description} />
        <ReportSelector
          templates={templates}
          onSelect={(id) => console.log('Generate:', id)}
          onDownload={(id, format) => console.log('Download:', id, format)}
        />
      </div>
    </MainLayout>
  );
}
