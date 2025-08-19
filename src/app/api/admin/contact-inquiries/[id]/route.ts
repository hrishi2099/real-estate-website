import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ContactInquiryStatus, Priority, Prisma } from '@prisma/client';

/**
 * GET a single contact inquiry by ID
 */
export const GET = requireAdmin(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id: params.id },
      include: {
        salesManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: 'Contact inquiry not found' }, { status: 404 });
    }

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error('Error fetching contact inquiry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

/**
 * PATCH (update) a single contact inquiry by ID
 */
export const PATCH = requireAdmin(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, salesManagerId, priority, responseDeadline, notes } = body;

    // --- Validation ---
    if (status && !Object.values(ContactInquiryStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be one of: NEW, REVIEWED, RESPONDED, CLOSED' }, { status: 400 });
    }
    if (salesManagerId && !(await prisma.user.findFirst({ where: { id: salesManagerId, role: 'SALES_MANAGER' } }))) {
      return NextResponse.json({ error: 'Invalid sales manager ID' }, { status: 400 });
    }
    if (priority && !Object.values(Priority).includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority. Must be one of: LOW, MEDIUM, HIGH' }, { status: 400 });
    }

    // --- Build update data object ---
    const updateData: Prisma.ContactInquiryUpdateInput = {
      updatedAt: new Date(),
    };
    if (status) updateData.status = status;
    if (salesManagerId !== undefined) {
      updateData.salesManager = salesManagerId ? { connect: { id: salesManagerId } } : { disconnect: true };
      updateData.assignedAt = salesManagerId ? new Date() : null;
    }
    if (priority) updateData.priority = priority;
    if (responseDeadline) updateData.responseDeadline = new Date(responseDeadline);
    if (notes !== undefined) updateData.notes = notes;

    // --- Perform update ---
    const updatedInquiry = await prisma.contactInquiry.update({
      where: { id },
      data: updateData,
      include: {
        salesManager: {
          select: {
            id: true,
            name: true,
            email: true,
            territory: true,
          },
        },
      },
    });

    return NextResponse.json(updatedInquiry);
  } catch (error) {
    console.error('Error updating contact inquiry:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Contact inquiry not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

/**
 * DELETE a single contact inquiry by ID
 */
export const DELETE = requireAdmin(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;

    await prisma.contactInquiry.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Contact inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact inquiry:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Contact inquiry not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});