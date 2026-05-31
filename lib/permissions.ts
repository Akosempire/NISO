// lib/permissions.ts
/**
 * Role-based permission matrix
 * Backend MUST enforce these at query layer, not just frontend
 */

export const ROLE_PERMISSIONS = {
  operator: {
    canRead: ['readings', 'sla', 'interruptions', 'inspections'],
    canCreate: ['readings', 'sla', 'interruptions', 'inspections'],
    canUpdate: ['readings', 'sla'],
    canDelete: [],
    canApprove: [],
    canExport: false,
    canSeal: false,
    scope: 'station', // Can only see own station
  },
  station_admin: {
    canRead: ['readings', 'sla', 'interruptions', 'inspections', 'audit_logs'],
    canCreate: ['readings', 'sla', 'interruptions', 'inspections'],
    canUpdate: ['readings', 'sla', 'interruptions', 'inspections'],
    canDelete: [],
    canApprove: [],
    canExport: true,
    canSeal: false,
    scope: 'station',
  },
  supervisor: {
    canRead: ['readings', 'sla', 'interruptions', 'inspections', 'audit_logs'],
    canCreate: ['readings', 'sla', 'interruptions', 'inspections'],
    canUpdate: ['readings', 'sla'],
    canDelete: [],
    canApprove: ['sla', 'inspections'],
    canExport: true,
    canSeal: false,
    scope: 'station',
  },
  regional_admin: {
    canRead: ['readings', 'sla', 'interruptions', 'inspections', 'audit_logs'],
    canCreate: ['readings', 'sla', 'interruptions', 'inspections'],
    canUpdate: ['readings', 'sla', 'interruptions', 'inspections'],
    canDelete: [],
    canApprove: ['sla', 'inspections'],
    canExport: true,
    canSeal: true,
    scope: 'region', // Can see all stations in region
  },
  headquarters_admin: {
    canRead: ['readings', 'sla', 'interruptions', 'inspections', 'audit_logs', 'users', 'roles'],
    canCreate: ['readings', 'sla', 'interruptions', 'inspections', 'users', 'roles'],
    canUpdate: ['readings', 'sla', 'interruptions', 'inspections', 'users', 'roles', 'templates', 'formulas'],
    canDelete: ['users'],
    canApprove: ['sla', 'inspections'],
    canExport: true,
    canSeal: true,
    scope: 'national', // Can see all data
  },
  viewer: {
    canRead: ['shared_reports', 'shared_data'],
    canCreate: [],
    canUpdate: [],
    canDelete: [],
    canApprove: [],
    canExport: true,
    canSeal: false,
    scope: 'shared_only',
  },
  knowledge_admin: {
    canRead: ['knowledge_articles', 'knowledge_categories'],
    canCreate: ['knowledge_articles'],
    canUpdate: ['knowledge_articles'],
    canDelete: ['knowledge_articles'],
    canApprove: [],
    canExport: false,
    canSeal: false,
    scope: 'knowledge_only',
  },
};

/**
 * Enforce permission at API layer
 * Example usage in any API route:
 *
 * const user = await getAuthenticatedUser(request);
 * const perms = ROLE_PERMISSIONS[user.role];
 *
 * if (!perms.canRead.includes('readings')) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
 * }
 *
 * // Also enforce scope
 * if (perms.scope === 'station' && query.station_id !== user.station_id) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
 * }
 */

export function hasPermission(role: string, action: string, resource: string): boolean {
  const perms = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
  if (!perms) return false;

  const actionMap: Record<string, keyof typeof perms> = {
    read: 'canRead',
    create: 'canCreate',
    update: 'canUpdate',
    delete: 'canDelete',
    approve: 'canApprove',
    export: 'canExport',
    seal: 'canSeal',
  };

  const permKey = actionMap[action];
  if (!permKey) return false;

  if (permKey === 'canExport' || permKey === 'canSeal') {
    return perms[permKey] === true;
  }

  return (perms[permKey] as string[]).includes(resource);
}
