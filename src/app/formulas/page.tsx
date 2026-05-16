'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Code2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Formula {
  id: string;
  name: string;
  expression: string;
  template: string;
  targetField: string;
  version: number;
  isValid: boolean;
  errorMsg?: string;
}

const mock: Formula[] = [
  { id: 'f1', name: 'Total feeder load', expression: 'SUM(feeders.mw_value)', template: '330kV Bus', targetField: 'total_load', version: 3, isValid: true },
  { id: 'f2', name: 'Apparent power', expression: 'voltage * current * SQRT(3) / 1000', template: '330kV Circuit', targetField: 'apparent_power', version: 2, isValid: true },
  { id: 'f3', name: 'SLA variance %', expression: '(actual - forecast) / forecast * 100', template: 'SLA Feeder', targetField: 'variance_pct', version: 1, isValid: true },
  { id: 'f4', name: 'Power factor', expression: 'real_power / apparent_powr', template: '330kV Circuit', targetField: 'power_factor', version: 1, isValid: false, errorMsg: 'Unknown field: apparent_powr' },
];

export default function FormulaEnginePage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Formula Engine"
          description="Excel-style formulas computed across reading values"
          actions={
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New formula
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <p className="text-xs text-gray-600">Active formulas</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{mock.filter(f => f.isValid).length}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-600">With errors</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{mock.filter(f => !f.isValid).length}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-600">Templates affected</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{new Set(mock.map(f => f.template)).size}</p>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {mock.map((f) => (
              <li key={f.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${f.isValid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {f.isValid ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <Code2 className="w-3 h-3" />
                        <code className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{f.expression}</code>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {f.template} → <span className="font-medium text-gray-700">{f.targetField}</span> · v{f.version}
                      </p>
                      {f.errorMsg && <p className="text-xs text-red-600 mt-1.5">{f.errorMsg}</p>}
                    </div>
                  </div>
                  <Badge variant={f.isValid ? 'secondary' : 'destructive'}>
                    {f.isValid ? 'Valid' : 'Error'}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}
