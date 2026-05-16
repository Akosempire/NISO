import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Mock user for now - replace with actual auth
const mockUser = {
  id: 'user-1',
  role: 'OPERATOR' as const,
  regionId: 'region-1',
  stationId: 'station-1',
};

export async function GET(request: NextRequest) {
  try {
    // Get active interruptions count
    const activeInterruptions = await db.interruptionRecord.count({
      where: { status: 'ACTIVE' },
    });

    // Get today's readings count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysReadings = await db.reading.count({
      where: {
        readingHour: {
          gte: today,
          lt: tomorrow,
        },
        equipment: {
          station: {
            regionId: mockUser.regionId,
          },
        },
      },
    });

    // Get active users count (simplified)
    const activeUsers = await db.user.count({
      where: { isActive: true },
    });

    // Get equipment online percentage (mock calculation)
    const totalEquipment = await db.equipment.count({
      where: {
        station: {
          regionId: mockUser.regionId,
        },
      },
    });

    // Mock online percentage - in real app, this would come from monitoring
    const equipmentOnline = Math.floor(totalEquipment * 0.98);

    // Get system uptime (mock)
    const uptime = 99.2;

    // Get average outage duration (mock calculation)
    const avgOutageDuration = 45; // minutes

    const stats = {
      activeInterruptions,
      todaysReadings,
      activeUsers,
      equipmentOnline: Math.round((equipmentOnline / totalEquipment) * 100),
      uptime,
      avgOutageDuration,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
