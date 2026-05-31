// Backend RBAC Middleware Implementation Examples
// All routes must use these middleware to enforce permissions

import { Request, Response, NextFunction } from 'express';
import { prisma } from './config';

// ============================================
// 1. SCOPE VERIFICATION
// ============================================

/**
 * Verify user has access to requested station
 * Station Admins: only own station
 * Regional Admins: only stations in own region
 * HQ Admins: all stations
 */
export const verifyStationAccess = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user; // Set by auth middleware
  const requestedStationId = req.params.stationId || req.body.stationId;

  if (!requestedStationId) {
    return next(); // No station parameter
  }

  if (user.role === 'OPERATOR' || user.role === 'SUPERVISOR' || user.role === 'STATION_ADMIN') {
    if (user.stationId !== requestedStationId) {
      return res.status(403).json({ error: 'Access denied: not your station' });
    }
  } else if (user.role === 'REGIONAL_ADMIN') {
    const station = await prisma.station.findUnique({
      where: { id: requestedStationId },
      include: { region: true }
    });

    if (!station || station.region.id !== user.regionId) {
      return res.status(403).json({ error: 'Access denied: not your region' });
    }
  }
  // HQ_ADMIN: no restriction

  next();
};

/**
 * Verify user has access to requested region
 */
export const verifyRegionAccess = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  const requestedRegionId = req.params.regionId || req.body.regionId;

  if (!requestedRegionId) return next();

  if (user.role === 'REGIONAL_ADMIN') {
    if (user.regionId !== requestedRegionId) {
      return res.status(403).json({ error: 'Access denied: not your region' });
    }
  }
  // HQ_ADMIN: no restriction

  next();
};

// ============================================
// 2. PERMISSION CHECKS (Role-based)
// ============================================

/**
 * Check if user can create readings
 * Allowed: Operator, Supervisor, Station Admin+
 */
export const canCreateReading = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  const allowedRoles = ['OPERATOR', 'SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ error: 'Not authorized to create readings' });
  }

  next();
};

/**
 * Check if user can approve/seal readings
 * Allowed: Supervisor+, Station Admin+
 */
export const canApproveReading = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  const allowedRoles = ['SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ error: 'Not authorized to approve readings' });
  }

  next();
};

/**
 * Check if user can create interruptions
 * Allowed: Operator+
 */
export const canCreateInterruption = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  const allowedRoles = ['OPERATOR', 'SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ error: 'Not authorized to create interruptions' });
  }

  next();
};

/**
 * Check if user can resolve interruptions
 * Allowed: Supervisor+
 */
export const canResolveInterruption = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  const allowedRoles = ['SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ error: 'Not authorized to resolve interruptions' });
  }

  next();
};

/**
 * Check if user can manage users
 * Allowed: ICT Admin+, Station Admin+
 */
export const canManageUsers = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  const allowedRoles = ['ICT_ADMIN', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ error: 'Not authorized to manage users' });
  }

  next();
};

/**
 * Check if user can create/modify formulas
 * Allowed: HQ Admin, ICT Admin, Regional Admin
 */
export const canModifyFormula = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  const allowedRoles = ['HQ_ADMIN', 'ICT_ADMIN', 'REGIONAL_ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ error: 'Not authorized to modify formulas' });
  }

  next();
};

/**
 * Check if user can export reports
 * Allowed: Supervisor+ (not Operator or Viewer)
 */
export const canExportReport = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  const allowedRoles = ['SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ error: 'Not authorized to export reports' });
  }

  next();
};

/**
 * Check if user can view audit logs
 * Allowed: Supervisor+ (not Operator or Viewer)
 */
export const canViewAuditLogs = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  const allowedRoles = ['SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN', 'ICT_ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ error: 'Not authorized to view audit logs' });
  }

  next();
};

// ============================================
// 3. SEALED RECORD PROTECTION
// ============================================

/**
 * Check if reading is sealed and prevent modifications
 */
export const protectSealedReading = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') return next(); // Read is always allowed

  const readingId = req.params.readingId;
  if (!readingId) return next(); // No reading parameter

  const reading = await prisma.reading.findUnique({
    where: { id: readingId }
  });

  if (!reading) {
    return res.status(404).json({ error: 'Reading not found' });
  }

  if (reading.sealedAt !== null) {
    return res.status(409).json({
      error: 'Cannot modify sealed record',
      sealedAt: reading.sealedAt,
      code: 'RECORD_SEALED'
    });
  }

  next();
};

/**
 * Check if SLA entry is sealed
 */
export const protectSealedSLA = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') return next();

  const entryId = req.params.entryId;
  if (!entryId) return next();

  const entry = await prisma.sLAEntry.findUnique({
    where: { id: entryId }
  });

  if (!entry) {
    return res.status(404).json({ error: 'SLA entry not found' });
  }

  if (entry.sealedAt !== null) {
    return res.status(409).json({
      error: 'Cannot modify sealed SLA entry',
      code: 'RECORD_SEALED'
    });
  }

  next();
};

/**
 * Check if month is sealed (prevents any modifications for that month)
 */
export const protectSealedMonth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') return next();

  const stationId = req.params.stationId || req.body.stationId;
  const date = req.params.date || req.body.date;

  if (!stationId || !date) return next();

  // Check if month is sealed
  const month = await prisma.sealedMonth.findUnique({
    where: {
      stationId_month: {
        stationId,
        month: new Date(date).toISOString().slice(0, 7) // YYYY-MM
      }
    }
  });

  if (month && month.sealedAt !== null) {
    return res.status(409).json({
      error: 'Cannot modify sealed month',
      month: month.month,
      sealedAt: month.sealedAt,
      code: 'MONTH_SEALED'
    });
  }

  next();
};

// ============================================
// 4. AUDIT LOGGING
// ============================================

/**
 * Log all mutations to audit trail
 * Applied to POST/PUT/DELETE/PATCH routes
 */
export const auditLog = async (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);

  // Intercept response to log successful mutations
  res.json = function(data: any) {
    if (req.method !== 'GET' && res.statusCode < 400) {
      // Log to audit trail
      const resourceType = req.path.split('/')[2]; // e.g., 'readings' from /api/readings

      prisma.auditLog.create({
        data: {
          userId: req.user?.id || 'system',
          action: getActionFromMethod(req.method),
          resourceType,
          resourceId: data?.id || req.params.id,
          oldValue: req.body._previousValue || null, // Set by updateReading service
          newValue: data,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          stationId: req.user?.stationId || 'unknown',
          createdAt: new Date()
        }
      }).catch(err => console.error('Audit log failed:', err));
    }

    return originalJson(data);
  };

  next();
};

function getActionFromMethod(method: string): string {
  switch (method) {
    case 'POST': return 'create';
    case 'PUT': return 'update';
    case 'PATCH': return 'update';
    case 'DELETE': return 'delete';
    default: return 'unknown';
  }
}

// ============================================
// 5. QUERY FILTERING (Scope-based)
// ============================================

/**
 * Filter query results by user scope
 * Operators: only own station
 * Regional Admins: only own region
 * HQ Admins: all records
 */
export const filterByScope = (user: any) => {
  if (user.role === 'OPERATOR' || user.role === 'SUPERVISOR' || user.role === 'STATION_ADMIN') {
    return { stationId: user.stationId };
  } else if (user.role === 'REGIONAL_ADMIN') {
    return { station: { regionId: user.regionId } };
  }
  // HQ_ADMIN: no filter
  return {};
};

// ============================================
// 6. EXAMPLE ROUTE USAGE
// ============================================

/**
 * Example: Create Reading Route
 *
 * router.post(
 *   '/stations/:stationId/readings',
 *   authMiddleware,           // Verify JWT
 *   verifyStationAccess,      // Check station scope
 *   canCreateReading,         // Check role permission
 *   protectSealedMonth,       // Check month not sealed
 *   auditLog,                 // Log to audit trail
 *   readingController.create  // Handler
 * );
 */

/**
 * Example: Approve Reading Route
 *
 * router.post(
 *   '/readings/:readingId/seal',
 *   authMiddleware,
 *   protectSealedReading,     // Ensure not already sealed
 *   canApproveReading,        // Only supervisors+
 *   auditLog,
 *   readingController.seal
 * );
 */

/**
 * Example: Create User Route (Admin only)
 *
 * router.post(
 *   '/admin/users',
 *   authMiddleware,
 *   verifyRegionAccess,       // Admin scope
 *   canManageUsers,           // Admin permission
 *   auditLog,
 *   userController.create
 * );
 */

// ============================================
// 7. PERMISSION MATRIX GENERATOR (Optional)
// ============================================

export const ROLE_PERMISSIONS = {
  OPERATOR: {
    readings: ['create', 'read'],
    sla: ['read'],
    interruptions: ['create', 'read', 'update'],
    inspections: ['create', 'read'],
    reports: ['read'],
    knowledge: ['read'],
    users: []
  },
  SUPERVISOR: {
    readings: ['create', 'read', 'update', 'approve'],
    sla: ['read', 'update'],
    interruptions: ['create', 'read', 'update', 'resolve'],
    inspections: ['read', 'approve'],
    reports: ['read', 'export'],
    knowledge: ['read'],
    users: []
  },
  STATION_ADMIN: {
    readings: ['create', 'read', 'update', 'approve', 'seal'],
    sla: ['create', 'read', 'update', 'approve'],
    interruptions: ['create', 'read', 'update', 'resolve'],
    inspections: ['create', 'read', 'update', 'approve'],
    reports: ['create', 'read', 'export'],
    knowledge: ['read', 'upload'],
    users: ['create', 'read', 'update']
  },
  REGIONAL_ADMIN: {
    readings: ['create', 'read', 'update', 'approve', 'seal'],
    sla: ['create', 'read', 'update', 'approve'],
    interruptions: ['create', 'read', 'update', 'resolve'],
    inspections: ['create', 'read', 'update', 'approve'],
    templates: ['create', 'read', 'update'],
    formulas: ['create', 'read', 'update'],
    reports: ['create', 'read', 'export'],
    knowledge: ['read', 'upload'],
    users: ['create', 'read', 'update'],
    audit: ['read']
  },
  ICT_ADMIN: {
    readings: ['read'],
    templates: ['create', 'read', 'update'],
    formulas: ['create', 'read', 'update'],
    users: ['create', 'read', 'update', 'delete'],
    audit: ['read'],
    system: ['configure']
  },
  HQ_ADMIN: {
    readings: ['create', 'read', 'update', 'approve', 'seal'],
    sla: ['create', 'read', 'update', 'approve', 'seal'],
    interruptions: ['create', 'read', 'update', 'resolve'],
    inspections: ['create', 'read', 'update', 'approve'],
    templates: ['create', 'read', 'update'],
    formulas: ['create', 'read', 'update'],
    reports: ['create', 'read', 'export'],
    users: ['create', 'read', 'update', 'delete'],
    audit: ['read'],
    system: ['configure'],
    integrations: ['manage']
  },
  VIEWER: {
    readings: ['read'],
    sla: ['read'],
    interruptions: ['read'],
    inspections: ['read'],
    reports: ['read'],
    knowledge: ['read']
  },
  KNOWLEDGE_ADMIN: {
    knowledge: ['create', 'read', 'update', 'delete'],
    audit: ['read']
  }
};

/**
 * Check if user has permission for action
 */
export const hasPermission = (user: any, resource: string, action: string): boolean => {
  const permissions = ROLE_PERMISSIONS[user.role] || {};
  const resourceActions = permissions[resource] || [];
  return resourceActions.includes(action);
};
