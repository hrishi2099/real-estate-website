import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updating payments
const updatePaymentSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED']).optional(),
  clearedDate: z.string().optional(),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
  // Allow editing customer details
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  payerType: z.enum(['EXISTING_USER', 'NON_USER']).optional(),
});

// GET /api/accounts/payments/[id] - Get a single payment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ACCOUNTS or ADMIN role
    if (user.role !== 'ACCOUNTS' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            status: true,
            customerName: true,
            customerEmail: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

// PATCH /api/accounts/payments/[id] - Update a payment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ACCOUNTS or ADMIN role
    if (user.role !== 'ACCOUNTS' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updatePaymentSchema.parse(body);

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: true,
      },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {};

      if (validatedData.status) updateData.status = validatedData.status;
      if (validatedData.clearedDate) updateData.clearedDate = new Date(validatedData.clearedDate);
      if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
      if (validatedData.receiptUrl !== undefined) updateData.receiptUrl = validatedData.receiptUrl;
      // Allow editing customer details
      if (validatedData.customerId !== undefined) updateData.customerId = validatedData.customerId || null;
      if (validatedData.customerName !== undefined) updateData.customerName = validatedData.customerName;
      if (validatedData.payerType !== undefined) updateData.payerType = validatedData.payerType;

      const payment = await tx.payment.update({
        where: { id },
        data: updateData,
        include: {
          invoice: true,
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          recordedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // If status changed to COMPLETED or payment was linked to invoice, update invoice status
      if (payment.invoiceId && (validatedData.status === 'COMPLETED' || validatedData.status === 'CANCELLED' || validatedData.status === 'REFUNDED')) {
        const invoice = await tx.invoice.findUnique({
          where: { id: payment.invoiceId },
          include: {
            payments: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        });

        if (invoice) {
          const totalPaid = invoice.payments.reduce(
            (sum, p) => sum + Number(p.amount),
            0
          );
          const balance = Number(invoice.totalAmount) - totalPaid;

          let newStatus = invoice.status;
          if (balance <= 0 && totalPaid > 0) {
            newStatus = 'PAID';
          } else if (totalPaid > 0) {
            newStatus = 'PARTIALLY_PAID';
          } else if (totalPaid === 0 && invoice.status === 'PAID') {
            newStatus = 'ISSUED';
          }

          if (newStatus !== invoice.status) {
            await tx.invoice.update({
              where: { id: payment.invoiceId },
              data: {
                status: newStatus,
                paidDate: balance <= 0 && totalPaid > 0 ? new Date() : null,
              },
            });
          }
        }
      }

      return payment;
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/payments/[id] - Delete a payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ADMIN or ACCOUNTS role
    if (user.role !== 'ADMIN' && user.role !== 'ACCOUNTS') {
      return NextResponse.json({ error: 'Forbidden - Only ADMIN or ACCOUNTS can delete payments' }, { status: 403 });
    }

    const { id } = await params;
    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Don't allow deletion if payment is completed
    if (payment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete completed payment. Please cancel it first.' },
        { status: 400 }
      );
    }

    await prisma.payment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
