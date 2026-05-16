import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ReadingService } from '@/services/reading.service';
import { PermissionService } from '@/lib/auth/permissions';

// Mock user for now - replace with actual auth
const mockUser = {
  id: 'user-1',
  role: 'OPERATOR' as const,
  regionId: 'region-1',
  stationId: 'station-1',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const equipmentId = searchParams.get('equipmentId');

    let readings;

    if (equipmentId) {
      // Get readings for specific equipment
      readings = await db.reading.findMany({
        where: {
          equipmentId,
          equipment: {
            station: {
              regionId: mockUser.regionId,
            },
          },
        },
        include: {
          equipment: {
            include: {
              station: true,
            },
          },
        },
        orderBy: { readingHour: 'desc' },
      });
    } else {
      // Get all readings user can access
      const scope = PermissionService.getUserScope(mockUser.role, mockUser.regionId, mockUser.stationId);

      readings = await db.reading.findMany({
        where: {
          equipment: {
            station: scope.stationId ? { id: scope.stationId } : { regionId: scope.regionId },
          },
        },
        include: {
          equipment: {
            include: {
              station: true,
            },
          },
        },
        orderBy: { readingHour: 'desc' },
        take: 100,
      });
    }

    return NextResponse.json(readings);
  } catch (error) {
    console.error('Error fetching readings:', error);
    return NextResponse.json({ error: 'Failed to fetch readings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { equipmentId, readingHour, rawValues, calculatedValues } = body;

    // Check permissions
    if (!PermissionService.canEditReadings(mockUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Create reading using service
    const reading = await ReadingService.createReading({
      equipmentId,
      readingHour: new Date(readingHour),
      rawValues,
      calculatedValues,
      userId: mockUser.id,
    });

    return NextResponse.json(reading);
  } catch (error) {
    console.error('Error creating reading:', error);
    return NextResponse.json({ error: 'Failed to create reading' }, { status: 500 });
  }
}
