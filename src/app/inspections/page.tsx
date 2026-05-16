'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { InspectionForm } from '@/components/inspections/inspection-form';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { useState } from 'react';

const mockTemplateFields = [
  { id: 'f1', label: 'Equipment Condition', type: 'SELECT', required: true },
  { id: 'f2', label: 'Visual Inspection Notes', type: 'TEXTAREA', required: false },
  { id: 'f3', label: 'Temperature Readings', type: 'NUMBER', required: true },
  { id: 'f4', label: 'All Safety Checks Completed', type: 'CHECKBOX', required: true },
];

const mockInspections = [
  {
    id: 'insp-1',
    equipment: 'TR-132-01',
    date: '2024-05-08',
    inspector: 'John Smith',
    status: 'COMPLETED',
  },
  {
    id: 'insp-2',
    equipment: 'CKT-330-01',
    date: '2024-05-05',
    inspector: 'Jane Doe',
    status: 'REVIEWED',
  },
];

export default function InspectionsPage() {
  const [inspections, setInspections] = useState(mockInspections);

  const handleSubmit = (data: any) => {
    console.log('Inspection:', data);
    setInspections([
      {
        id: `insp-${Date.now()}`,
        equipment: 'New Equipment',
        date: new Date().toISOString().split('T')[0],
        inspector: 'Current User',
        status: 'PENDING',
      },
      ...inspections,
    ]);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inspections</h1>
          <p className="text-gray-600 mt-1">Create and manage equipment inspections</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <InspectionForm
              templateFields={mockTemplateFields}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Inspections</h2>
              <div className="space-y-3">
                {inspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{inspection.equipment}</p>
                        <p className="text-xs text-gray-500">
                          {inspection.date} • by {inspection.inspector}
                        </p>
                      </div>
                      <StatusBadge status={inspection.status} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
