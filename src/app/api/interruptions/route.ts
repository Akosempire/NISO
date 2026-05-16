import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { InterruptionService } from '@/services/interruption.service';
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
    const interruptions = await InterruptionService.getActiveInterruptions();
    return NextResponse.json(interruptions);
  } catch (error) {
    console.error('Error fetching interruptions:', error);
    return NextResponse.json({ error: 'Failed to fetch interruptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { equipmentIds, tripTime, cause, remarks } = body;

    // Check permissions
    if (!PermissionService.canEditReadings(mockUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const interruption = await InterruptionService.createInterruption({
      equipmentIds,
      tripTime: new Date(tripTime),
      cause,
      remarks,
      userId: mockUser.id,
    });

    return NextResponse.json(interruption);
  } catch (error) {
    console.error('Error creating interruption:', error);
    return NextResponse.json({ error: 'Failed to create interruption' }, { status: 500 });
  }
}
