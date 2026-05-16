'use client';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig = {
  ACTIVE: { label: 'Active', variant: 'default' as const },
  INACTIVE: { label: 'Inactive', variant: 'secondary' as const },
  PENDING: { label: 'Pending', variant: 'secondary' as const },
  REVIEW: { label: 'Review', variant: 'secondary' as const },
  SEALED: { label: 'Sealed', variant: 'default' as const },
  COMPLETED: { label: 'Completed', variant: 'default' as const },
  IN_PROGRESS: { label: 'In Progress', variant: 'default' as const },
  RESTORED: { label: 'Restored', variant: 'default' as const },
  ESCALATED: { label: 'Escalated', variant: 'destructive' as const },
  OPEN: { label: 'Open', variant: 'secondary' as const },
  DRAFT: { label: 'Draft', variant: 'secondary' as const },
  PUBLISHED: { label: 'Published', variant: 'default' as const },
  ARCHIVED: { label: 'Archived', variant: 'secondary' as const },
  MAINTENANCE: { label: 'Maintenance', variant: 'secondary' as const },
  DECOMMISSIONED: { label: 'Decommissioned', variant: 'destructive' as const },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    variant: 'secondary' as const,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        config.variant === 'default'
          ? 'bg-indigo-100 text-indigo-800'
          : config.variant === 'destructive'
          ? 'bg-red-100 text-red-800'
          : 'bg-gray-100 text-gray-800'
      } ${className}`}
    >
      {config.label}
    </span>
  );
}