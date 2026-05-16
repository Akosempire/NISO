// src/services/audit.service.ts

import { db } from '@/lib/db';

export class AuditService {
  static async log(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await db.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          oldValues: data.oldValues || null,
          newValues: data.newValues || null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
        },
      });
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  }

  static async getLog(
    filters?: {
      userId?: string;
      entityType?: string;
      action?: string;
    },
    limit = 100
  ) {
    return db.auditLog.findMany({
      where: filters,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
