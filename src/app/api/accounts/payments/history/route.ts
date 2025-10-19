import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// GET /api/accounts/payments/history - Get payment history for customer/property
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
    const customerId = searchParams.get('customerId');
    const customerName = searchParams.get('customerName');
    const projectName = searchParams.get('projectName');

    if (!customerId && !customerName && !projectName) {
      return NextResponse.json(
        { error: 'Please provide customerId, customerName, or projectName' },
        { status: 400 }
      );
    }

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }
    if (customerName) {
      where.customerName = customerName;
    }
    if (projectName) {
      where.projectName = projectName;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
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
      orderBy: {
        paymentDate: 'asc',
      },
    });

    // Calculate summary
    const totalPaid = payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalPending = payments
      .filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Get total amount and current pending from the latest payment
    const latestPayment = payments[payments.length - 1];
    const totalAmount = latestPayment?.totalAmount ? Number(latestPayment.totalAmount) : null;
    const currentPending = totalAmount ? totalAmount - totalPaid : null;

    return NextResponse.json({
      payments,
      summary: {
        totalPayments: payments.length,
        totalPaid,
        totalPending,
        totalAmount,
        currentPending,
        customerName: payments[0]?.customerName,
        projectName: payments[0]?.projectName,
      },
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}
