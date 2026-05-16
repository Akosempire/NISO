'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { TemplateEditor } from '@/components/admin/template-editor';

const mockFields = [
  { id: 'f1', name: 'voltage_330kv', label: '330kV Voltage', type: 'NUMBER', unit: 'kV', isRequired: true, isProtected: false, order: 1 },
  { id: 'f2', name: 'current', label: 'Current', type: 'NUMBER', unit: 'A', isRequired: true, isProtected: false, order: 2 },
  { id: 'f3', name: 'power_factor', label: 'Power Factor', type: 'NUMBER', isRequired: false, isProtected: true, order: 3 },
  { id: 'f4', name: 'remarks', label: 'Remarks', type: 'TEXTAREA', isRequired: false, isProtected: false, order: 4 },
];

export default function TemplatesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Input Templates"
          description="Define the fields operators capture for each equipment type"
        />
        <TemplateEditor
          templateId="tpl-330kv"
          templateName="330kV Circuit Template"
          fields={mockFields}
          onSave={(fields) => console.log('Save template:', fields)}
        />
      </div>
    </MainLayout>
  );
}
