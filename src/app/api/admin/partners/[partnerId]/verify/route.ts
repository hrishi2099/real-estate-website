import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const verifySchema = z.object({
  isVerified: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isVerified } = verifySchema.parse(body);
    const { partnerId } = await params;

    // Update partner verification status
    const updatedPartner = await prisma.channelPartner.update({
      where: { id: partnerId },
      data: {
        isVerified,
        verificationDate: isVerified ? new Date() : null,
      },
    });

    return NextResponse.json({
      message: `Partner ${isVerified ? 'verified' : 'unverified'} successfully`,
      partner: {
        ...updatedPartner,
        baseCommission: parseFloat(updatedPartner.baseCommission.toString()),
        totalRevenue: parseFloat(updatedPartner.totalRevenue.toString()),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid verification value', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating partner verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
