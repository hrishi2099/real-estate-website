import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AnalyticsTracker } from '@/lib/analytics-tracker';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const { event, propertyId, metadata } = await request.json();

    if (!event || !propertyId) {
      return NextResponse.json(
        { error: 'Event type and property ID are required' },
        { status: 400 }
      );
    }

    // Get user if authenticated
    let userId: string | undefined;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      userId = user?.id;
    }

    // Extract IP address and user agent
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     undefined;

    const trackingData = {
      userId,
      propertyId,
      userAgent,
      ipAddress,
      metadata
    };

    // Track based on event type
    switch (event.toUpperCase()) {
      case 'VIEW':
        await AnalyticsTracker.trackPropertyView(trackingData);
        break;
      case 'CONTACT':
      case 'INQUIRY':
        await AnalyticsTracker.trackPropertyInquiry(trackingData);
        break;
      case 'FAVORITE':
        await AnalyticsTracker.trackPropertyFavorite(trackingData);
        break;
      case 'SHARE':
        await AnalyticsTracker.trackPropertyShare(trackingData);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, message: 'Event tracked successfully' });

  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}