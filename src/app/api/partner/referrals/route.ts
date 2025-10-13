import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const referralSchema = z.object({
  leadName: z.string().min(1, 'Lead name is required'),
  leadEmail: z.string().email('Invalid email address'),
  leadPhone: z.string().min(10, 'Valid phone number is required'),
  propertyInterest: z.string().optional(),
  budgetRange: z.string().optional(),
  notes: z.string().optional(),
});

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

    // Get channel partner
    const partner = await prisma.channelPartner.findUnique({
      where: { userId: user.userId },
    });

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner profile not found' },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = { partnerId: partner.id };
    if (status) {
      where.status = status;
    }

    // Fetch referrals
    const [referrals, total] = await Promise.all([
      prisma.partnerReferral.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.partnerReferral.count({ where }),
    ]);

    return NextResponse.json({
      referrals: referrals.map((r) => ({
        ...r,
        commissionEarned: r.commissionEarned
          ? parseFloat(r.commissionEarned.toString())
          : null,
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Get channel partner
    const partner = await prisma.channelPartner.findUnique({
      where: { userId: user.userId },
    });

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner profile not found' },
        { status: 404 }
      );
    }

    // Check if partner is verified and active
    if (partner.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your partner account is not active. Please contact support.' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = referralSchema.parse(body);

    // Create referral
    const referral = await prisma.partnerReferral.create({
      data: {
        partnerId: partner.id,
        leadName: validatedData.leadName,
        leadEmail: validatedData.leadEmail,
        leadPhone: validatedData.leadPhone,
        propertyInterest: validatedData.propertyInterest,
        budgetRange: validatedData.budgetRange,
        notes: validatedData.notes,
        status: 'NEW',
      },
    });

    // Update partner's total referrals count
    await prisma.channelPartner.update({
      where: { id: partner.id },
      data: { totalReferrals: { increment: 1 } },
    });

    return NextResponse.json(
      {
        message: 'Referral submitted successfully',
        referral: {
          ...referral,
          commissionEarned: referral.commissionEarned
            ? parseFloat(referral.commissionEarned.toString())
            : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
