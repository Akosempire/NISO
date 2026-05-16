import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/services/audit.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const entityType = searchParams.get('entityType');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '100');

    const filters = {
      ...(userId && { userId }),
      ...(entityType && { entityType }),
      ...(action && { action }),
    };

    const logs = await AuditService.getLog(filters, limit);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
