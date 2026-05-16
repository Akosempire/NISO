'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { InspectionForm } from '@/components/inspections/inspection-form';

const mockSupervisor = {
  id: 'user-2',
  email: 'supervisor@niso.gov',
  name: 'Sarah Supervisor',
  role: 'SUPERVISOR',
};

const mockTemplate = {
  id: '1',
  name: 'Monthly Equipment Inspection',
  type: 'EQUIPMENT',
  fields: [
    {
      id: 'f1',
      name: 'visual_inspection',
      label: 'Visual Inspection',
      type: 'CHECKBOX',
      required: true,
    },
    {
      id: 'f2',
      name: 'oil_level',
      label: 'Oil Level Check',
      type: 'SELECT',
      options: ['Normal', 'Low', 'High'],
      required: true,
    },
    {
      id: 'f3',
      name: 'temperature',
      label: 'Temperature Reading',
      type: 'NUMBER',
      unit: '°C',
      required: true,
    },
    {
      id: 'f4',
      name: 'remarks',
      label: 'Remarks',
      type: 'TEXTAREA',
      required: false,
    },
  ],
};

export default function InspectionsPage() {
  return (
    <MainLayout user={mockSupervisor}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inspections</h1>
          <p className="text-gray-600 mt-1">Conduct equipment inspections and maintenance checks</p>
        </div>

        <div className="max-w-2xl">
          <InspectionForm template={mockTemplate} />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Inspections</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-500 text-center">No recent inspections</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}