import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED']),
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
    const { status } = statusSchema.parse(body);
    const { partnerId } = await params;

    // Update partner status
    const updatedPartner = await prisma.channelPartner.update({
      where: { id: partnerId },
      data: { status },
    });

    return NextResponse.json({
      message: 'Partner status updated successfully',
      partner: {
        ...updatedPartner,
        baseCommission: parseFloat(updatedPartner.baseCommission.toString()),
        totalRevenue: parseFloat(updatedPartner.totalRevenue.toString()),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid status value', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating partner status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
