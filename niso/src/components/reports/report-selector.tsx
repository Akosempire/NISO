'use client';

import { Search, Download, Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  formats: string[];
  lastGenerated: string;
}

interface ReportSelectorProps {
  reports: Report[];
  onGenerate: (reportId: string, format: string) => void;
}

export function ReportSelector({ reports, onGenerate }: ReportSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(reports.map(r => r.category))];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{report.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span>Category: {report.category}</span>
                  <span>Last: {report.lastGenerated}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {report.formats.map((format) => (
                <span
                  key={format}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {format}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => onGenerate(report.id, 'PDF')}
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>

              <Button
                onClick={() => onGenerate(report.id, 'Excel')}
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Excel
              </Button>

              <Button
                onClick={() => onGenerate(report.id, 'CSV')}
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSV
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No reports found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}