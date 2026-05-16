'use client';

import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  REVIEW: 'bg-blue-100 text-blue-800',
  SEALED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESTORED: 'bg-green-100 text-green-800',
  ESCALATED: 'bg-red-100 text-red-800',
  OPEN: 'bg-blue-100 text-blue-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  DECOMMISSIONED: 'bg-red-100 text-red-800',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  
  return (
    <Badge className={`${colorClass} font-semibold`}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
