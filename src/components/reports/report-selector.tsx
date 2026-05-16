'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/status-badge';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  lastGenerated?: string;
  format: string[];
}

interface ReportSelectorProps {
  templates: ReportTemplate[];
  onSelect: (templateId: string) => void;
  onDownload: (reportId: string, format: string) => void;
}

export function ReportSelector({
  templates,
  onSelect,
  onDownload,
}: ReportSelectorProps) {
  const [search, setSearch] = useState('');

  const filtered = templates.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template) => (
          <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow flex flex-col">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{template.category}</p>
                </div>
                <Badge variant="secondary">{template.format.join(', ')}</Badge>
              </div>

              <p className="text-sm text-gray-600 mb-4 flex-1">{template.description}</p>

              {template.lastGenerated && (
                <p className="text-xs text-gray-500 mb-4">
                  Last generated: {new Date(template.lastGenerated).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(template.id)}
                className="flex-1 gap-1"
              >
                <Eye className="w-4 h-4" />
                Generate
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDownload(template.id, template.format[0])}
                className="gap-1"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
