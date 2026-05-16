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
    const slaEntries = await db.sLAEntry.findMany({
      where: {
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
      orderBy: { readingDate: 'desc' },
      take: 100,
    });

    return NextResponse.json(slaEntries);
  } catch (error) {
    console.error('Error fetching SLA entries:', error);
    return NextResponse.json({ error: 'Failed to fetch SLA entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { equipmentId, readingDate, meterReading, forecast, remarks } = body;

    const slaEntry = await db.sLAEntry.create({
      data: {
        equipmentId,
        readingDate: new Date(readingDate),
        meterReading: parseFloat(meterReading),
        forecast: parseFloat(forecast),
        variance: parseFloat(meterReading) - parseFloat(forecast),
        remarks,
        createdBy: mockUser.id,
      },
      include: {
        equipment: {
          include: {
            station: true,
          },
        },
      },
    });

    return NextResponse.json(slaEntry);
  } catch (error) {
    console.error('Error creating SLA entry:', error);
    return NextResponse.json({ error: 'Failed to create SLA entry' }, { status: 500 });
  }
}
