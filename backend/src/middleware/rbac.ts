import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config';

const ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
  OPERATOR: {
    readings: ['create', 'read'],
    sla: ['read'],
    interruptions: ['create', 'read', 'update'],
    inspections: ['read'],
    reports: ['read']
  },
  SUPERVISOR: {
    readings: ['create', 'read', 'update', 'approve'],
    sla: ['read', 'update'],
    interruptions: ['create', 'read', 'update', 'resolve'],
    inspections: ['read', 'approve'],
    reports: ['read', 'export'],
    audit: ['read']
  },
  STATION_ADMIN: {
    readings: ['create', 'read', 'update', 'approve', 'seal'],
    sla: ['create', 'read', 'update', 'approve'],
    interruptions: ['create', 'read', 'update', 'resolve'],
    inspections: ['create', 'read', 'update', 'approve'],
    reports: ['create', 'read', 'export'],
    users: ['create', 'read', 'update'],
    audit: ['read']
  },
  REGIONAL_ADMIN: {
    readings: ['create', 'read', 'update', 'approve', 'seal'],
    sla: ['create', 'read', 'update', 'approve'],
    interruptions: ['create', 'read', 'update', 'resolve'],
    inspections: ['create', 'read', 'update', 'approve'],
    templates: ['create', 'read', 'update'],
    formulas: ['create', 'read', 'update'],
    reports: ['create', 'read', 'export'],
    users: ['create', 'read', 'update'],
    audit: ['read']
  },
  ICT_ADMIN: {
    users: ['create', 'read', 'update', 'delete'],
    templates: ['create', 'read', 'update'],
    formulas: ['create', 'read', 'update'],
    system: ['configure'],
    audit: ['read']
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
    system: ['configure']
  },
  VIEWER: {
    readings: ['read'],
    sla: ['read'],
    interruptions: ['read'],
    inspections: ['read'],
    reports: ['read']
  },
  KNOWLEDGE_ADMIN: {
    knowledge: ['create', 'read', 'update', 'delete'],
    audit: ['read']
  }
};

export const checkPermission = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const permissions = ROLE_PERMISSIONS[req.user.role];
    if (!permissions || !permissions[resource] || !permissions[resource].includes(action)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};

export const verifyStationAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const stationId = req.params.stationId || req.body.stationId;

  if (!stationId) return next();

  const user = req.user!;

  // Operators, Supervisors, Station Admins can only access own station
  if (['OPERATOR', 'SUPERVISOR', 'STATION_ADMIN'].includes(user.role)) {
    if (user.stationId !== stationId) {
      return res.status(403).json({ error: 'Access denied: not your station' });
    }
  } else if (user.role === 'REGIONAL_ADMIN') {
    // Regional Admins can access stations in their region
    const station = await prisma.station.findUnique({
      where: { id: stationId }
    });

    if (!station || station.regionId !== user.regionId) {
      return res.status(403).json({ error: 'Access denied: not your region' });
    }
  }
  // HQ_ADMIN: no restriction

  next();
};

export const verifyRegionAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const regionId = req.params.regionId || req.body.regionId;

  if (!regionId) return next();

  const user = req.user!;

  if (user.role === 'REGIONAL_ADMIN') {
    if (user.regionId !== regionId) {
      return res.status(403).json({ error: 'Access denied: not your region' });
    }
  }
  // HQ_ADMIN, ICT_ADMIN: no restriction

  next();
};
