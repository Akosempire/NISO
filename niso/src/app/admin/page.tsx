'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { UserManagement } from '@/components/admin/user-management';
import { TemplateEditor } from '@/components/admin/template-editor';
import { AuditLogViewer } from '@/components/admin/audit-log-viewer';
import { useState } from 'react';

const mockAdmin = {
  id: 'user-3',
  email: 'admin@niso.gov',
  name: 'Admin User',
  role: 'HEADQUARTERS_ADMIN',
};

const mockUsers = [
  {
    id: '1',
    email: 'john.smith@niso.gov',
    name: 'John Smith',
    role: 'OPERATOR',
    isActive: true,
    regionId: 'region-1',
    stationId: 'station-1',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    email: 'sarah.johnson@niso.gov',
    name: 'Sarah Johnson',
    role: 'SUPERVISOR',
    isActive: true,
    regionId: 'region-1',
    stationId: 'station-1',
    createdAt: '2024-02-01',
  },
];

const mockTemplates = [
  {
    id: '1',
    name: 'Circuit Breaker Inspection',
    description: 'Standard inspection template for circuit breakers',
    type: 'EQUIPMENT',
    fields: [
      { id: 'f1', name: 'visual', label: 'Visual Inspection', type: 'CHECKBOX' },
      { id: 'f2', name: 'operation', label: 'Operation Test', type: 'SELECT', options: ['Pass', 'Fail'] },
    ],
  },
];

const mockAuditLogs = [
  {
    id: '1',
    user: { name: 'John Smith' },
    action: 'CREATE',
    entityType: 'READING',
    entityId: 'reading-123',
    oldValues: null,
    newValues: { voltage: 330, current: 150 },
    createdAt: '2024-05-08T14:30:00Z',
  },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'templates' | 'audit'>('users');

  return (
    <MainLayout user={mockAdmin}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          <p className="text-gray-600 mt-1">Manage users, templates, and system audit logs</p>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'users', label: 'Users' },
              { id: 'templates', label: 'Templates' },
              { id: 'audit', label: 'Audit Log' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'users' && (
            <UserManagement
              users={mockUsers}
              onEdit={(user) => console.log('Edit user:', user)}
              onDelete={(id) => console.log('Delete user:', id)}
              onToggleStatus={(id) => console.log('Toggle status:', id)}
            />
          )}

          {activeTab === 'templates' && (
            <TemplateEditor
              templates={mockTemplates}
              onSave={(template) => console.log('Save template:', template)}
              onDelete={(id) => console.log('Delete template:', id)}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogViewer
              logs={mockAuditLogs}
              onExport={(filters) => console.log('Export logs:', filters)}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}