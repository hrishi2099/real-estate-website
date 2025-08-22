import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { AnalyticsService } from '@/lib/analytics';

export async function GET(req: Request) {
  try {
    const userPayload = getUserFromRequest(req as any);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Sales managers should use the /sales dashboard, not the user dashboard.
    if (user.role === 'SALES_MANAGER') {
      return NextResponse.json(
        { error: 'Access denied for this role. Please use the Sales Dashboard.' },
        { status: 403 }
      );
    }

    const activity = await AnalyticsService.getRecentActivity(user.id, 5);
    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user activity.' },
      { status: 500 }
    );
  }
}