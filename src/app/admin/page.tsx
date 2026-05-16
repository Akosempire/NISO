'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { UserManagement } from '@/components/admin/user-management';
import { TemplateEditor } from '@/components/admin/template-editor';
import { AuditLogViewer } from '@/components/admin/audit-log-viewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

const mockUsers = [
  {
    id: 'user-1',
    email: 'admin@niso.com',
    name: 'Admin User',
    role: 'HEADQUARTERS_ADMIN',
    region: 'All Regions',
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: 'user-2',
    email: 'operator@niso.com',
    name: 'Station Operator',
    role: 'OPERATOR',
    station: 'Main Station',
    isActive: true,
    createdAt: '2024-02-15',
  },
];

const mockTemplateFields = [
  {
    id: 'field-1',
    name: 'voltage_330kv',
    label: '330kV Voltage',
    type: 'NUMBER',
    unit: 'kV',
    isRequired: true,
    isProtected: false,
    order: 1,
  },
  {
    id: 'field-2',
    name: 'current',
    label: 'Current',
    type: 'NUMBER',
    unit: 'A',
    isRequired: true,
    isProtected: false,
    order: 2,
  },
];

const mockAuditLogs = [
  {
    id: 'log-1',
    action: 'UPDATE',
    entityType: 'reading',
    entityId: 'rdg-001',
    user: 'John Operator',
    userRole: 'OPERATOR',
    timestamp: '2024-05-08T14:30:00Z',
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
    timestamp: '2024-05-08T13:15:00Z',
  },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-1">System administration and configuration</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UserManagement
              users={mockUsers}
              onAddUser={() => console.log('Add user')}
              onEditUser={(id) => console.log('Edit:', id)}
              onDeleteUser={(id) => console.log('Delete:', id)}
              onToggleActive={(id, active) => console.log('Toggle:', id, active)}
            />
          </TabsContent>

          <TabsContent value="templates" className="mt-6 space-y-6">
            <TemplateEditor
              templateId="tpl-330kv"
              templateName="330kV Circuit Template"
              fields={mockTemplateFields}
              onSave={(fields) => console.log('Save template:', fields)}
            />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <AuditLogViewer
              logs={mockAuditLogs}
              onExport={() => console.log('Export logs')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
