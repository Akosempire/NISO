import { NextRequest, NextResponse } from 'next/server';
import { InterruptionService } from '@/services/interruption.service';

// Mock user for now - replace with actual auth
const mockUser = {
  id: 'user-1',
  role: 'OPERATOR' as const,
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { restorationTime } = body;

    const result = await InterruptionService.restoreInterruption(
      params.id,
      new Date(restorationTime),
      mockUser.id
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error restoring interruption:', error);
    return NextResponse.json({ error: 'Failed to restore interruption' }, { status: 500 });
  }
}
