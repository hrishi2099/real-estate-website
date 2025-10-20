import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating payments
const createPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'CARD', 'NET_BANKING', 'OTHER']),
  paymentMode: z.enum(['ONLINE', 'OFFLINE']).default('ONLINE'),
  referenceNumber: z.string().optional(),
  bankName: z.string().optional(),
  invoiceId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  paymentDate: z.string().optional(),
  notes: z.string().optional(),
  // New fields
  projectName: z.string().optional(),
  pendingAccount: z.number().optional(),
  plotArea: z.number().optional(),
  totalAmount: z.number().optional(),
  payerType: z.enum(['EXISTING_USER', 'NON_USER']).optional(),
});

// Generate payment number in format: PAY-YYYY-MM-001
async function generatePaymentNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `PAY-${year}-${month}`;

  // Get the last payment for this month
  const lastPayment = await prisma.payment.findFirst({
    where: {
      paymentNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      paymentNumber: 'desc',
    },
  });

  let sequence = 1;
  if (lastPayment) {
    const lastSequence = parseInt(lastPayment.paymentNumber.split('-')[3]);
    sequence = lastSequence + 1;
  }

  return `${prefix}-${String(sequence).padStart(3, '0')}`;
}

// GET /api/accounts/payments - List payments with filtering
export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { id: true, role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ACCOUNTS or ADMIN role
    if (user.role !== 'ACCOUNTS' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const invoiceId = searchParams.get('invoiceId');
    const customerId = searchParams.get('customerId');
    const paymentMethod = searchParams.get('paymentMethod');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    const where: any = {};

    if (status) where.status = status;
    if (invoiceId) where.invoiceId = invoiceId;
    if (customerId) where.customerId = customerId;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (search) {
      where.OR = [
        { paymentNumber: { contains: search } },
        { customerName: { contains: search } },
        { referenceNumber: { contains: search } },
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              totalAmount: true,
              status: true,
            },
          },
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
        orderBy: {
          paymentDate: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST /api/accounts/payments - Create a new payment
export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { id: true, role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ACCOUNTS or ADMIN role
    if (user.role !== 'ACCOUNTS' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createPaymentSchema.parse(body);

    // Generate payment number
    const paymentNumber = await generatePaymentNumber();

    // If invoiceId is provided, verify it exists
    if (validatedData.invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: validatedData.invoiceId },
      });

      if (!invoice) {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }
    }

    // Create payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          amount: validatedData.amount,
          paymentMethod: validatedData.paymentMethod,
          paymentMode: validatedData.paymentMode,
          referenceNumber: validatedData.referenceNumber,
          bankName: validatedData.bankName,
          invoiceId: validatedData.invoiceId,
          customerId: validatedData.customerId,
          customerName: validatedData.customerName,
          paymentDate: validatedData.paymentDate
            ? new Date(validatedData.paymentDate)
            : new Date(),
          notes: validatedData.notes,
          status: 'PENDING',
          recordedById: user.id,
          // New fields
          projectName: validatedData.projectName,
          pendingAccount: validatedData.pendingAccount,
          plotArea: validatedData.plotArea,
          totalAmount: validatedData.totalAmount,
          payerType: validatedData.payerType,
        },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              totalAmount: true,
              status: true,
            },
          },
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

      // If linked to invoice, update invoice status if needed
      if (validatedData.invoiceId) {
        const invoice = await tx.invoice.findUnique({
          where: { id: validatedData.invoiceId },
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
          if (balance <= 0) {
            newStatus = 'PAID';
          } else if (totalPaid > 0) {
            newStatus = 'PARTIALLY_PAID';
          }

          if (newStatus !== invoice.status) {
            await tx.invoice.update({
              where: { id: validatedData.invoiceId },
              data: {
                status: newStatus,
                paidDate: balance <= 0 ? new Date() : null,
              },
            });
          }
        }
      }

      return payment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
