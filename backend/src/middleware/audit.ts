import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config';

export const auditLog = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') return next();

  const originalJson = res.json.bind(res);

  res.json = async function(data: any) {
    if (res.statusCode < 400 && req.user) {
      const resourceType = req.path.split('/')[2];
      const action = getActionFromMethod(req.method);

      try {
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action,
            resourceType,
            resourceId: data?.id || req.params.id || null,
            oldValue: (req as any)._previousValue || null,
            newValue: data,
            ipAddress: req.ip || 'unknown',
            userAgent: req.get('user-agent') || 'unknown',
            stationId: req.user.stationId || 'unknown',
            createdAt: new Date()
          }
        });
      } catch (error) {
        console.error('Audit log failed:', error);
      }
    }

    return originalJson(data);
  };

  next();
};

function getActionFromMethod(method: string): string {
  switch (method) {
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return 'unknown';
  }
}

export const protectSealedRecord = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') return next();

  const readingId = req.params.readingId;
  if (!readingId) return next();

  const reading = await prisma.reading.findUnique({
    where: { id: readingId }
  });

  if (!reading) {
    return res.status(404).json({ error: 'Reading not found' });
  }

  if (reading.sealedAt !== null) {
    return res.status(409).json({
      error: 'Cannot modify sealed record',
      code: 'RECORD_SEALED'
    });
  }

  next();
};
