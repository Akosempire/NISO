'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { SLAEntryForm } from '@/components/sla/sla-entry-form';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

const mockSLAData = [
  {
    date: '2024-05-08',
    meterReading: 15234.5,
    mwValue: 245.3,
    forecast: 250.0,
    difference: -4.7,
  },
  {
    date: '2024-05-07',
    meterReading: 15224.2,
    mwValue: 248.5,
    forecast: 248.0,
    difference: 0.5,
  },
];

export default function SLAPage() {
  const [entries, setEntries] = useState(mockSLAData);

  const handleSubmit = (data: any) => {
    console.log('SLA Entry:', data);
    setEntries([data, ...entries]);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SLA / Feeders</h1>
          <p className="text-gray-600 mt-1">Track SLA performance and feeder readings</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <SLAEntryForm
              equipmentCode="FDR-33-01"
              equipmentName="33kV Feeder 01"
              onSubmit={handleSubmit}
            />
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Entries</h2>
              <div className="space-y-3">
                {entries.map((entry, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-semibold text-gray-900">{entry.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">MW Value</p>
                        <p className="font-semibold text-gray-900">{entry.mwValue}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Forecast</p>
                        <p className="font-semibold text-gray-900">{entry.forecast}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Variance</p>
                        <p className={`font-semibold ${
                          entry.difference < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {entry.difference > 0 ? '+' : ''}{entry.difference}
                        </p>
                      </div>
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
