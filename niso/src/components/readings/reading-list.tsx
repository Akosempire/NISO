'use client';

import { Search, Plus, Download, Filter, Eye } from 'lucide-react';
import { useState, useMemo } from 'react';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 10;

interface Equipment {
  id: string;
  code: string;
  name: string;
  type: string;
  station: string;
  status: string;
  voltage: number;
  lastReading: string;
  template: {
    fields: any[];
  };
}

interface ReadingListProps {
  equipment: Equipment[];
  onSelectEquipment: (id: string) => void;
  onBulkImport: () => void;
}

export function ReadingList({ equipment, onSelectEquipment, onBulkImport }: ReadingListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || item.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [equipment, searchTerm, selectedType]);

  const paginatedEquipment = useMemo(() => {
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    return filteredEquipment.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredEquipment, currentPage]);

  const totalPages = Math.ceil(filteredEquipment.length / PAGE_SIZE);
  const equipmentTypes = [...new Set(equipment.map(e => e.type))];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleTypeFilter = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1); // Reset to first page on filter
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">All Types</option>
            {equipmentTypes.map(type => (
              <option key={type} value={type}>{type.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <Button onClick={onBulkImport} className="flex items-center gap-2 whitespace-nowrap">
          <Download className="w-4 h-4" />
          Bulk Import
        </Button>
      </div>

      {/* Table or Empty State */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredEquipment.length === 0 ? (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title="No equipment found"
            description={
              searchTerm || selectedType
                ? 'Try adjusting your search or filter criteria'
                : 'No equipment available in this system'
            }
            action={
              searchTerm || selectedType
                ? {
                    label: 'Clear filters',
                    onClick: () => {
                      setSearchTerm('');
                      setSelectedType('');
                    },
                  }
                : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment
                    </th>
                    <th className="hidden sm:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="hidden md:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Station
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden lg:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Reading
                    </th>
                    <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEquipment.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs md:text-sm text-gray-500">{item.code}</div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.type.replace('_', ' ')}</div>
                        <div className="text-xs text-gray-500">{item.voltage}kV</div>
                      </td>
                      <td className="hidden md:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.station}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="hidden lg:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.lastReading}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          onClick={() => onSelectEquipment(item.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 ml-auto"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageSize={PAGE_SIZE}
                totalItems={filteredEquipment.length}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}