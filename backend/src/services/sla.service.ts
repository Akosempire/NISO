import { prisma } from '../config';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateSLAEntryInput } from '../types';

export class SLAService {
  async createSLAEntry(data: CreateSLAEntryInput, userId: string) {
    const station = await prisma.station.findUnique({
      where: { id: data.stationId }
    });

    if (!station) throw new Error('Station not found');

    const difference = data.actualMw
      ? new Decimal(data.actualMw).minus(new Decimal(data.forecastMw))
      : null;

    return prisma.sLAEntry.create({
      data: {
        stationId: data.stationId,
        date: new Date(data.date),
        hour: data.hour,
        forecastMw: new Decimal(data.forecastMw),
        actualMw: data.actualMw ? new Decimal(data.actualMw) : null,
        meterReadingKwh: data.meterReadingKwh ? new Decimal(data.meterReadingKwh) : null,
        differenceMw: difference,
        remarks: data.remarks,
        createdById: userId
      },
      include: { createdBy: true }
    });
  }

  async getSLAEntries(stationId: string, filters: any) {
    const where: any = { stationId };

    if (filters.date) {
      const date = new Date(filters.date);
      where.date = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;

    const [data, total] = await Promise.all([
      prisma.sLAEntry.findMany({
        where,
        include: { createdBy: true },
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.sLAEntry.count({ where })
    ]);

    return { data, total };
  }

  async approveSLAEntry(entryId: string, userId: string) {
    const entry = await prisma.sLAEntry.findUnique({
      where: { id: entryId }
    });

    if (!entry) throw new Error('SLA entry not found');

    return prisma.sLAEntry.update({
      where: { id: entryId },
      data: {
        approvedBy: userId,
        approvedAt: new Date()
      }
    });
  }
}

export const slaService = new SLAService();
