import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Mock user for now - replace with actual auth
const mockUser = {
  id: 'user-1',
  role: 'ADMIN' as const,
};

export async function GET(request: NextRequest) {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        regionId: true,
        stationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role, regionId, stationId } = body;

    const user = await db.user.create({
      data: {
        email,
        name,
        role,
        regionId,
        stationId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        regionId: true,
        stationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
