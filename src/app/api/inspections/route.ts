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
    const inspections = await db.inspection.findMany({
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
        template: true,
      },
      orderBy: { inspectionDate: 'desc' },
      take: 100,
    });

    return NextResponse.json(inspections);
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return NextResponse.json({ error: 'Failed to fetch inspections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { equipmentId, templateId, inspectionDate, fieldValues, remarks } = body;

    const inspection = await db.inspection.create({
      data: {
        equipmentId,
        templateId,
        inspectionDate: new Date(inspectionDate),
        fieldValues,
        remarks,
        inspectedBy: mockUser.id,
      },
      include: {
        equipment: {
          include: {
            station: true,
          },
        },
        template: true,
      },
    });

    return NextResponse.json(inspection);
  } catch (error) {
    console.error('Error creating inspection:', error);
    return NextResponse.json({ error: 'Failed to create inspection' }, { status: 500 });
  }
}
