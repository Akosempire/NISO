import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Mock user for now - replace with actual auth
const mockUser = {
  id: 'user-1',
  role: 'ADMIN' as const,
};

export async function GET(request: NextRequest) {
  try {
    const templates = await db.template.findMany({
      include: {
        fields: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, fields } = body;

    const template = await db.template.create({
      data: {
        name,
        description,
        type,
        fields: {
          create: fields,
        },
      },
      include: {
        fields: true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
