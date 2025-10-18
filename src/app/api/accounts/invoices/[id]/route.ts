import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updating invoices
const updateInvoiceSchema = z.object({
  customerName: z.string().min(1).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  propertyTitle: z.string().optional(),
  description: z.string().optional(),
  subtotal: z.number().positive().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  taxAmount: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  totalAmount: z.number().positive().optional(),
  status: z.enum(['DRAFT', 'ISSUED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED']).optional(),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

// GET /api/accounts/invoices/[id] - Get a single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
          },
        },
        payments: {
          select: {
            id: true,
            paymentNumber: true,
            amount: true,
            paymentMethod: true,
            status: true,
            paymentDate: true,
            referenceNumber: true,
          },
          orderBy: {
            paymentDate: 'desc',
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

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Calculate payment summary
    const totalPaid = invoice.payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = Number(invoice.totalAmount) - totalPaid;

    return NextResponse.json({
      ...invoice,
      totalPaid,
      balance,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PATCH /api/accounts/invoices/[id] - Update an invoice
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateInvoiceSchema.parse(body);

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    if (validatedData.customerName) updateData.customerName = validatedData.customerName;
    if (validatedData.customerEmail) updateData.customerEmail = validatedData.customerEmail;
    if (validatedData.customerPhone !== undefined) updateData.customerPhone = validatedData.customerPhone;
    if (validatedData.customerAddress !== undefined) updateData.customerAddress = validatedData.customerAddress;
    if (validatedData.propertyTitle !== undefined) updateData.propertyTitle = validatedData.propertyTitle;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.subtotal) updateData.subtotal = validatedData.subtotal;
    if (validatedData.taxRate !== undefined) updateData.taxRate = validatedData.taxRate;
    if (validatedData.taxAmount !== undefined) updateData.taxAmount = validatedData.taxAmount;
    if (validatedData.discount !== undefined) updateData.discount = validatedData.discount;
    if (validatedData.totalAmount) updateData.totalAmount = validatedData.totalAmount;
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.dueDate) updateData.dueDate = new Date(validatedData.dueDate);
    if (validatedData.paidDate) updateData.paidDate = new Date(validatedData.paidDate);
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
    if (validatedData.terms !== undefined) updateData.terms = validatedData.terms;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
        payments: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/invoices/[id] - Delete an invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    // Check if invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Don't allow deletion if invoice has payments
    if (invoice.payments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete invoice with existing payments' },
        { status: 400 }
      );
    }

    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
