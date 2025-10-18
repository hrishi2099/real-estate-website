import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating commission payouts
const createPayoutSchema = z.object({
  recipientType: z.enum(['CHANNEL_PARTNER', 'SALES_MANAGER']),
  recipientId: z.string(),
  amount: z.number().positive(),
  taxDeducted: z.number().min(0).default(0),
  netAmount: z.number().positive(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'CARD', 'NET_BANKING', 'OTHER']),
  referenceNumber: z.string().optional(),
  periodStart: z.string(),
  periodEnd: z.string(),
  referralIds: z.array(z.string()).optional(),
  dealIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Generate payout number in format: PAYOUT-YYYY-MM-001
async function generatePayoutNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `PAYOUT-${year}-${month}`;

  // Get the last payout for this month
  const lastPayout = await prisma.commissionPayout.findFirst({
    where: {
      payoutNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      payoutNumber: 'desc',
    },
  });

  let sequence = 1;
  if (lastPayout) {
    const lastSequence = parseInt(lastPayout.payoutNumber.split('-')[3]);
    sequence = lastSequence + 1;
  }

  return `${prefix}-${String(sequence).padStart(3, '0')}`;
}

// GET /api/accounts/commission-payouts - List payouts with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ACCOUNTS or ADMIN role
    if (session.user.role !== 'ACCOUNTS' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const recipientType = searchParams.get('recipientType');
    const recipientId = searchParams.get('recipientId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    const where: any = {};

    if (status) where.status = status;
    if (recipientType) where.recipientType = recipientType;
    if (recipientId) where.recipientId = recipientId;
    if (search) {
      where.OR = [
        { payoutNumber: { contains: search } },
        { recipientName: { contains: search } },
        { referenceNumber: { contains: search } },
      ];
    }

    const [payouts, total] = await Promise.all([
      prisma.commissionPayout.findMany({
        where,
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
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.commissionPayout.count({ where }),
    ]);

    return NextResponse.json({
      payouts,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

// POST /api/accounts/commission-payouts - Create a new payout
export async function POST(request: NextRequest) {
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
    const validatedData = createPayoutSchema.parse(body);

    // Generate payout number
    const payoutNumber = await generatePayoutNumber();

    // Get recipient information
    let recipientName = '';
    let bankAccountNumber = '';
    let bankIFSC = '';

    if (validatedData.recipientType === 'CHANNEL_PARTNER') {
      const partner = await prisma.channelPartner.findUnique({
        where: { id: validatedData.recipientId },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!partner) {
        return NextResponse.json(
          { error: 'Channel partner not found' },
          { status: 404 }
        );
      }

      recipientName = partner.user.name;
      bankAccountNumber = partner.bankAccountNumber || '';
      bankIFSC = partner.bankIFSC || '';
    } else if (validatedData.recipientType === 'SALES_MANAGER') {
      const user = await prisma.user.findUnique({
        where: { id: validatedData.recipientId },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Sales manager not found' },
          { status: 404 }
        );
      }

      recipientName = user.name;
    }

    // Create payout
    const payout = await prisma.commissionPayout.create({
      data: {
        payoutNumber,
        recipientType: validatedData.recipientType,
        recipientId: validatedData.recipientId,
        recipientName,
        amount: validatedData.amount,
        taxDeducted: validatedData.taxDeducted,
        netAmount: validatedData.netAmount,
        paymentMethod: validatedData.paymentMethod,
        referenceNumber: validatedData.referenceNumber,
        bankAccountNumber,
        bankIFSC,
        periodStart: new Date(validatedData.periodStart),
        periodEnd: new Date(validatedData.periodEnd),
        referralIds: validatedData.referralIds
          ? JSON.stringify(validatedData.referralIds)
          : null,
        dealIds: validatedData.dealIds
          ? JSON.stringify(validatedData.dealIds)
          : null,
        notes: validatedData.notes,
        status: 'PENDING',
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(payout, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating payout:', error);
    return NextResponse.json(
      { error: 'Failed to create payout' },
      { status: 500 }
    );
  }
}
