import { prisma } from '../config';
import { CreateInterruptionInput } from '../types';

export class InterruptionService {
  async createInterruption(data: CreateInterruptionInput, userId: string) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: data.equipmentId }
    });

    if (!equipment) throw new Error('Equipment not found');

    const tripTime = new Date(data.tripTime);
    const restorationTime = data.restorationTime ? new Date(data.restorationTime) : null;

    let durationSeconds: number | null = null;
    if (restorationTime) {
      durationSeconds = Math.round((restorationTime.getTime() - tripTime.getTime()) / 1000);
    }

    return prisma.interruption.create({
      data: {
        equipmentId: data.equipmentId,
        tripTime,
        restorationTime,
        causeCode: data.causeCode,
        durationSeconds,
        notes: data.notes,
        status: 'Active',
        createdById: userId
      },
      include: { createdBy: true, equipment: true }
    });
  }

  async getInterruptions(filters: any) {
    const where: any = {};

    if (filters.stationId) {
      where.equipment = { stationId: filters.stationId };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.status === 'Active') {
      where.restorationTime = null;
    }

    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;

    const [data, total] = await Promise.all([
      prisma.interruption.findMany({
        where,
        include: { equipment: true, createdBy: true },
        orderBy: { tripTime: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.interruption.count({ where })
    ]);

    return { data, total };
  }

  async updateInterruption(
    interruptionId: string,
    updates: any,
    userId: string
  ) {
    const interruption = await prisma.interruption.findUnique({
      where: { id: interruptionId }
    });

    if (!interruption) throw new Error('Interruption not found');

    // Calculate duration if restoration time provided
    let durationSeconds = interruption.durationSeconds;
    if (updates.restorationTime && !interruption.restorationTime) {
      const restTime = new Date(updates.restorationTime);
      durationSeconds = Math.round(
        (restTime.getTime() - interruption.tripTime.getTime()) / 1000
      );
    }

    return prisma.interruption.update({
      where: { id: interruptionId },
      data: {
        ...updates,
        durationSeconds,
        resolvedBy: ['Resolved', 'Cleared'].includes(updates.status) ? userId : undefined,
        resolvedAt: ['Resolved', 'Cleared'].includes(updates.status) ? new Date() : undefined
      },
      include: { equipment: true, createdBy: true }
    });
  }
}

export const interruptionService = new InterruptionService();
