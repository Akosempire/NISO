'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { AuditLogViewer } from '@/components/admin/audit-log-viewer';

const mockAuditLogs = [
  {
    id: 'log-1',
    action: 'UPDATE',
    entityType: 'reading',
    entityId: 'rdg-001',
    user: 'John Operator',
    userRole: 'OPERATOR',
    timestamp: '2026-05-08T14:30:00Z',
    oldValues: { voltage: 330 },
    newValues: { voltage: 330.5 },
  },
  {
    id: 'log-2',
    action: 'CREATE',
    entityType: 'interruption',
    entityId: 'int-001',
    user: 'Jane Supervisor',
    userRole: 'SUPERVISOR',
    timestamp: '2026-05-08T13:15:00Z',
  },
  {
    id: 'log-3',
    action: 'SEAL_MONTH',
    entityType: 'month_lifecycle',
    entityId: '2026-04',
    user: 'Admin User',
    userRole: 'HEADQUARTERS_ADMIN',
    timestamp: '2026-05-01T09:00:00Z',
  },
];

export default function AuditLogsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Audit Logs"
          description="Immutable record of system actions and changes"
        />
        <AuditLogViewer
          logs={mockAuditLogs}
          onExport={() => console.log('Export logs')}
        />
      </div>
    </MainLayout>
  );
}
