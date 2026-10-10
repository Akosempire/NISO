'use client';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig = {
  ACTIVE: { label: 'Active', variant: 'destructive' as const },
  INACTIVE: { label: 'Inactive', variant: 'secondary' as const },
  PENDING: { label: 'Pending', variant: 'secondary' as const },
  REVIEW: { label: 'Review', variant: 'secondary' as const },
  SEALED: { label: 'Sealed', variant: 'default' as const },
  COMPLETED: { label: 'Completed', variant: 'success' as const },
  IN_PROGRESS: { label: 'In Progress', variant: 'default' as const },
  RESTORED: { label: 'Restored', variant: 'success' as const },
  PARTIAL: { label: 'Partial', variant: 'warning' as const },
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
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${
        config.variant === 'default'
          ? 'border-[color:rgba(67,106,109,0.16)] bg-[var(--brand-mint-soft)] text-[var(--brand-teal)]'
          : config.variant === 'success'
          ? 'border-[color:rgba(62,139,104,0.16)] bg-[color:rgba(62,139,104,0.10)] text-[var(--success)]'
          : config.variant === 'warning'
          ? 'border-[color:rgba(197,138,36,0.18)] bg-[color:rgba(197,138,36,0.10)] text-[var(--warning)]'
          : config.variant === 'destructive'
          ? 'border-[color:rgba(199,68,68,0.16)] bg-[color:rgba(199,68,68,0.10)] text-[var(--danger)]'
          : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)]'
      } ${className}`}
    >
      {config.label}
    </span>
  );
}
