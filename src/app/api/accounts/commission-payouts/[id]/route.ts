import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updating payouts
const updatePayoutSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED', 'CANCELLED']).optional(),
  paidAt: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/accounts/commission-payouts/[id] - Get a single payout
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ACCOUNTS or ADMIN role
    if (session.user.role !== 'ACCOUNTS' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payout = await prisma.commissionPayout.findUnique({
      where: { id: params.id },
      include: {
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    // Parse JSON fields
    const payoutWithParsedData = {
      ...payout,
      referralIds: payout.referralIds ? JSON.parse(payout.referralIds) : [],
      dealIds: payout.dealIds ? JSON.parse(payout.dealIds) : [],
    };

    return NextResponse.json(payoutWithParsedData);
  } catch (error) {
    console.error('Error fetching payout:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout' },
      { status: 500 }
    );
  }
}

// PATCH /api/accounts/commission-payouts/[id] - Update a payout (approve/reject/mark paid)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ACCOUNTS or ADMIN role
    if (session.user.role !== 'ACCOUNTS' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updatePayoutSchema.parse(body);

    // Check if payout exists
    const existingPayout = await prisma.commissionPayout.findUnique({
      where: { id: params.id },
    });

    if (!existingPayout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    if (validatedData.status) {
      updateData.status = validatedData.status;

      // Set approvedAt when status changes to APPROVED
      if (validatedData.status === 'APPROVED') {
        updateData.approvedAt = new Date();
        updateData.approvedById = session.user.id;
      }

      // Set paidAt when status changes to PAID
      if (validatedData.status === 'PAID') {
        updateData.paidAt = new Date();
        if (!existingPayout.approvedAt) {
          updateData.approvedAt = new Date();
          updateData.approvedById = session.user.id;
        }
      }
    }

    if (validatedData.paidAt) {
      updateData.paidAt = new Date(validatedData.paidAt);
    }

    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    // Update payout in transaction
    const result = await prisma.$transaction(async (tx) => {
      const payout = await tx.commissionPayout.update({
        where: { id: params.id },
        data: updateData,
        include: {
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // If payout is marked as PAID, update partner referrals or lead assignments
      if (validatedData.status === 'PAID' && payout.recipientType === 'CHANNEL_PARTNER') {
        const referralIds = payout.referralIds ? JSON.parse(payout.referralIds) : [];

        if (referralIds.length > 0) {
          await tx.partnerReferral.updateMany({
            where: {
              id: {
                in: referralIds,
              },
            },
            data: {
              commissionPaidAt: new Date(),
            },
          });
        }
      }

      return payout;
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating payout:', error);
    return NextResponse.json(
      { error: 'Failed to update payout' },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/commission-payouts/[id] - Delete a payout
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ADMIN role (only admins can delete)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if payout exists
    const payout = await prisma.commissionPayout.findUnique({
      where: { id: params.id },
    });

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    // Don't allow deletion if payout is paid
    if (payout.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot delete paid payout. Please cancel it first.' },
        { status: 400 }
      );
    }

    await prisma.commissionPayout.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Payout deleted successfully' });
  } catch (error) {
    console.error('Error deleting payout:', error);
    return NextResponse.json(
      { error: 'Failed to delete payout' },
      { status: 500 }
    );
  }
}
