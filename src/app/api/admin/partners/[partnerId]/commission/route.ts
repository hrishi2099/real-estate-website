import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const commissionSchema = z.object({
  baseCommission: z.number().min(0).max(20),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { partnerId: string } }
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
    const { baseCommission } = commissionSchema.parse(body);
    const partnerId = params.partnerId;

    // Update partner commission
    const updatedPartner = await prisma.channelPartner.update({
      where: { id: partnerId },
      data: { baseCommission },
    });

    return NextResponse.json({
      message: 'Commission updated successfully',
      partner: {
        ...updatedPartner,
        baseCommission: parseFloat(updatedPartner.baseCommission.toString()),
        totalRevenue: parseFloat(updatedPartner.totalRevenue.toString()),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid commission value. Must be between 0 and 20.', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating partner commission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
