'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { UserManagement } from '@/components/admin/user-management';

const mockUsers = [
  { id: 'u1', email: 'admin@niso.com', name: 'Admin User', role: 'HEADQUARTERS_ADMIN', region: 'All Regions', isActive: true, createdAt: '2024-01-01' },
  { id: 'u2', email: 'regional.north@niso.com', name: 'North Regional Admin', role: 'REGIONAL_ADMIN', region: 'North Region', isActive: true, createdAt: '2024-01-15' },
  { id: 'u3', email: 'station.main@niso.com', name: 'Main Station Admin', role: 'STATION_ADMIN', station: 'Main Station', isActive: true, createdAt: '2024-02-10' },
  { id: 'u4', email: 'supervisor.a@niso.com', name: 'A. Supervisor', role: 'SUPERVISOR', station: 'Main Station', isActive: true, createdAt: '2024-02-20' },
  { id: 'u5', email: 'operator@niso.com', name: 'M. Operator', role: 'OPERATOR', station: 'Main Station', isActive: true, createdAt: '2024-02-15' },
  { id: 'u6', email: 'viewer@niso.com', name: 'Public Viewer', role: 'VIEWER', isActive: false, createdAt: '2024-03-01' },
];

export default function UsersPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Manage user accounts, roles, and access scopes"
        />
        <UserManagement
          users={mockUsers}
          onAddUser={() => console.log('Add user')}
          onEditUser={(id) => console.log('Edit:', id)}
          onDeleteUser={(id) => console.log('Delete:', id)}
          onToggleActive={(id, active) => console.log('Toggle:', id, active)}
        />
      </div>
    </MainLayout>
  );
}
