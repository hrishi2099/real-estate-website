import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'CHANNEL_PARTNER') {
      return NextResponse.json(
        { error: 'Access denied. Channel partners only.' },
        { status: 403 }
      );
    }

    // Get channel partner data
    const partner = await prisma.channelPartner.findUnique({
      where: { userId: user.userId },
      include: {
        referrals: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner profile not found' },
        { status: 404 }
      );
    }

    // Calculate stats
    const pendingReferrals = partner.referrals.filter(
      (r) => r.status === 'NEW' || r.status === 'CONTACTED'
    ).length;

    const activeReferrals = partner.referrals.filter(
      (r) =>
        r.status !== 'DEAL_WON' &&
        r.status !== 'DEAL_LOST' &&
        r.status !== 'NEW'
    ).length;

    const completedReferrals = partner.referrals.filter(
      (r) => r.status === 'DEAL_WON'
    ).length;

    const stats = {
      totalReferrals: partner.totalReferrals,
      successfulDeals: partner.successfulDeals,
      totalRevenue: parseFloat(partner.totalRevenue.toString()),
      pendingReferrals,
      activeReferrals,
      completedReferrals,
      performanceTier: partner.performanceTier,
      baseCommission: parseFloat(partner.baseCommission.toString()),
      isVerified: partner.isVerified,
      status: partner.status,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching partner stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
