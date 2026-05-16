'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { SLAEntryForm } from '@/components/sla/sla-entry-form';

const mockOperator = {
  id: 'user-1',
  email: 'operator@niso.gov',
  name: 'John Operator',
  role: 'OPERATOR',
};

export default function SLAPage() {
  return (
    <MainLayout user={mockOperator}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SLA / Feeders</h1>
          <p className="text-gray-600 mt-1">Manage SLA entries and feeder performance</p>
        </div>

        <div className="max-w-2xl">
          <SLAEntryForm />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Entries</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-500 text-center">No recent SLA entries</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}