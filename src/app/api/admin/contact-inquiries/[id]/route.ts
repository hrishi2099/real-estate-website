import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ContactInquiryStatus, Prisma, User } from '@prisma/client';
import { NotificationService } from '@/lib/notification-service';

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
            territory: true,
          },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: 'Contact inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ contactInquiry: inquiry });
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
    if (salesManagerId) {
      const manager = await prisma.user.findFirst({
        where: { id: salesManagerId, OR: [{ role: 'SALES_MANAGER' }, { role: 'ADMIN' }] },
      });
      if (!manager) {
        return NextResponse.json({ error: 'Invalid sales manager ID' }, { status: 400 });
      }
    }
    if (priority && !['LOW', 'NORMAL', 'HIGH'].includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority. Must be one of: LOW, NORMAL, HIGH' }, { status: 400 });
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

    // --- Get current inquiry for comparison ---
    const currentInquiry = await prisma.contactInquiry.findUnique({
      where: { id },
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

    if (!currentInquiry) {
      return NextResponse.json({ error: 'Contact inquiry not found' }, { status: 404 });
    }

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

    // --- Send notifications for significant changes ---
    try {
      // Notify if sales manager was assigned
      if (salesManagerId && !currentInquiry.salesManagerId) {
        await NotificationService.notifyInquiryAssignment(
          salesManagerId,
          id,
          {
            name: updatedInquiry.name,
            email: updatedInquiry.email,
            subject: updatedInquiry.subject,
            priority: updatedInquiry.priority || 'NORMAL'
          }
        );
      }

      // Notify if status changed and there's an assigned sales manager
      if (status && status !== currentInquiry.status && updatedInquiry.salesManagerId) {
        await NotificationService.notifyInquiryUpdate(
          updatedInquiry.salesManagerId,
          id,
          currentInquiry.status,
          status,
          {
            name: updatedInquiry.name,
            subject: updatedInquiry.subject
          }
        );
      }
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the entire operation if notification fails
    }

    return NextResponse.json({ success: true, contactInquiry: updatedInquiry });
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

    return NextResponse.json({ success: true, message: 'Contact inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact inquiry:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Contact inquiry not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});