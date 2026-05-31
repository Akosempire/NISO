import { prisma } from '../config';
import { CreateReadingInput } from '../types';

export class ReadingService {
  async createReading(data: CreateReadingInput, userId: string) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: data.equipmentId },
      include: { template: true }
    });

    if (!equipment) throw new Error('Equipment not found');

    // Parse input based on type
    const parsed = this.parseInput(data.rawInput, data.valueType);

    // Check for duplicate
    const existing = await prisma.reading.findUnique({
      where: {
        equipmentId_date_hour: {
          equipmentId: data.equipmentId,
          date: new Date(data.date),
          hour: data.hour
        }
      }
    });

    if (existing && existing.sealedAt === null) {
      // Allow update if not sealed
      return this.updateReading(existing.id, parsed, userId);
    } else if (existing) {
      throw new Error('Duplicate entry for this hour/equipment (sealed)');
    }

    return prisma.reading.create({
      data: {
        equipmentId: data.equipmentId,
        stationId: equipment.stationId,
        date: new Date(data.date),
        hour: data.hour,
        rawInput: data.rawInput,
        numericValue: parsed.numericValue,
        codeReference: parsed.codeReference,
        valueType: data.valueType,
        remarks: data.remarks,
        createdById: userId
      },
      include: { createdBy: true }
    });
  }

  async getReadings(stationId: string, filters: any) {
    const where: any = { stationId };

    if (filters.date) {
      const date = new Date(filters.date);
      where.date = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    if (filters.hour !== undefined) {
      where.hour = filters.hour;
    }

    if (filters.sealed !== undefined) {
      where.sealedAt = filters.sealed ? { not: null } : null;
    }

    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;

    const [data, total] = await Promise.all([
      prisma.reading.findMany({
        where,
        include: { createdBy: true, equipment: true },
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.reading.count({ where })
    ]);

    return { data, total };
  }

  async updateReading(readingId: string, updates: any, userId: string) {
    const reading = await prisma.reading.findUnique({
      where: { id: readingId }
    });

    if (!reading) throw new Error('Reading not found');
    if (reading.sealedAt !== null) throw new Error('Cannot modify sealed record');

    return prisma.reading.update({
      where: { id: readingId },
      data: {
        ...updates,
        updatedBy: userId,
        updatedAt: new Date()
      },
      include: { createdBy: true }
    });
  }

  async sealReading(readingId: string) {
    const reading = await prisma.reading.findUnique({
      where: { id: readingId }
    });

    if (!reading) throw new Error('Reading not found');
    if (reading.sealedAt !== null) throw new Error('Already sealed');

    return prisma.reading.update({
      where: { id: readingId },
      data: { sealedAt: new Date() }
    });
  }

  private parseInput(input: string, type: string) {
    if (type === 'number') {
      return {
        numericValue: parseFloat(input),
        codeReference: null
      };
    } else if (type === 'code') {
      return {
        numericValue: null,
        codeReference: input.toUpperCase()
      };
    }
    return { numericValue: null, codeReference: null };
  }
}

export const readingService = new ReadingService();
