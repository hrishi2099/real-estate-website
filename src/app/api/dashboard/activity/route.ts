import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { AnalyticsService } from '@/lib/analytics';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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