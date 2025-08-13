import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { AnalyticsTracker } from '@/lib/analytics-tracker';

export async function GET() {
  try {
    // Mock activity data for testing
    const mockActivity = [
      {
        id: "1",
        action: "Viewed property",
        property: "Premium Residential Property in Green Valley",
        date: "2 hours ago",
        type: "view"
      },
      {
        id: "2",
        action: "Saved property", 
        property: "Commercial Development Land in Business District",
        date: "1 day ago",
        type: "favorite"
      },
      {
        id: "3",
        action: "Contacted agent",
        property: "Farmland Investment Property in Rural County", 
        date: "3 days ago",
        type: "contact"
      }
    ];

    try {
      const session = await getServerSession();
      
      if (!session?.user?.email) {
        return NextResponse.json(mockActivity);
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        return NextResponse.json(mockActivity);
      }

      // Get recent activity using the analytics tracker
      const recentActivity = await AnalyticsTracker.getRecentActivity(user.id, 5);
      return NextResponse.json(recentActivity);

    } catch (dbError) {
      console.log('Database unavailable for dashboard activity, using mock data');
      return NextResponse.json(mockActivity);
    }

  } catch (error) {
    console.error('Dashboard activity error:', error);
    return NextResponse.json([]);
  }
}