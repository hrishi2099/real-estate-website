import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// GET /api/accounts/stats - Get financial dashboard statistics
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
    const period = searchParams.get('period') || 'all'; // all, month, quarter, year

    // Calculate date ranges
    const now = new Date();
    let startDate = new Date(0); // Beginning of time

    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // Run all queries in parallel
    const [
      // Invoice stats
      totalInvoicesCount,
      totalInvoicesAmount,
      paidInvoicesCount,
      paidInvoicesAmount,
      pendingInvoicesCount,
      pendingInvoicesAmount,
      overdueInvoicesCount,
      overdueInvoicesAmount,

      // Payment stats
      totalPaymentsCount,
      totalPaymentsAmount,
      completedPaymentsCount,
      completedPaymentsAmount,
      pendingPaymentsCount,
      pendingPaymentsAmount,

      // Commission payout stats
      totalPayoutsCount,
      totalPayoutsAmount,
      paidPayoutsCount,
      paidPayoutsAmount,
      pendingPayoutsCount,
      pendingPayoutsAmount,
      partnerPayoutsCount,
      partnerPayoutsAmount,
      salesManagerPayoutsCount,
      salesManagerPayoutsAmount,

      // Recent items
      recentInvoices,
      recentPayments,
      recentPayouts,
    ] = await Promise.all([
      // Invoice stats
      prisma.invoice.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.invoice.aggregate({
        where: { createdAt: { gte: startDate } },
        _sum: { totalAmount: true },
      }),
      prisma.invoice.count({
        where: {
          createdAt: { gte: startDate },
          status: 'PAID',
        },
      }),
      prisma.invoice.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: 'PAID',
        },
        _sum: { totalAmount: true },
      }),
      prisma.invoice.count({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['DRAFT', 'ISSUED', 'SENT'] },
        },
      }),
      prisma.invoice.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['DRAFT', 'ISSUED', 'SENT'] },
        },
        _sum: { totalAmount: true },
      }),
      prisma.invoice.count({
        where: {
          createdAt: { gte: startDate },
          status: 'OVERDUE',
        },
      }),
      prisma.invoice.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: 'OVERDUE',
        },
        _sum: { totalAmount: true },
      }),

      // Payment stats
      prisma.payment.count({
        where: { paymentDate: { gte: startDate } },
      }),
      prisma.payment.aggregate({
        where: { paymentDate: { gte: startDate } },
        _sum: { amount: true },
      }),
      prisma.payment.count({
        where: {
          paymentDate: { gte: startDate },
          status: 'COMPLETED',
        },
      }),
      prisma.payment.aggregate({
        where: {
          paymentDate: { gte: startDate },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
      prisma.payment.count({
        where: {
          paymentDate: { gte: startDate },
          status: { in: ['PENDING', 'PROCESSING'] },
        },
      }),
      prisma.payment.aggregate({
        where: {
          paymentDate: { gte: startDate },
          status: { in: ['PENDING', 'PROCESSING'] },
        },
        _sum: { amount: true },
      }),

      // Commission payout stats
      prisma.commissionPayout.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.commissionPayout.aggregate({
        where: { createdAt: { gte: startDate } },
        _sum: { netAmount: true },
      }),
      prisma.commissionPayout.count({
        where: {
          createdAt: { gte: startDate },
          status: 'PAID',
        },
      }),
      prisma.commissionPayout.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: 'PAID',
        },
        _sum: { netAmount: true },
      }),
      prisma.commissionPayout.count({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] },
        },
      }),
      prisma.commissionPayout.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] },
        },
        _sum: { netAmount: true },
      }),
      prisma.commissionPayout.count({
        where: {
          createdAt: { gte: startDate },
          recipientType: 'CHANNEL_PARTNER',
        },
      }),
      prisma.commissionPayout.aggregate({
        where: {
          createdAt: { gte: startDate },
          recipientType: 'CHANNEL_PARTNER',
        },
        _sum: { netAmount: true },
      }),
      prisma.commissionPayout.count({
        where: {
          createdAt: { gte: startDate },
          recipientType: 'SALES_MANAGER',
        },
      }),
      prisma.commissionPayout.aggregate({
        where: {
          createdAt: { gte: startDate },
          recipientType: 'SALES_MANAGER',
        },
        _sum: { netAmount: true },
      }),

      // Recent items
      prisma.invoice.findMany({
        where: { createdAt: { gte: startDate } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          invoiceNumber: true,
          customerName: true,
          totalAmount: true,
          status: true,
          issueDate: true,
        },
      }),
      prisma.payment.findMany({
        where: { paymentDate: { gte: startDate } },
        take: 5,
        orderBy: { paymentDate: 'desc' },
        select: {
          id: true,
          paymentNumber: true,
          amount: true,
          paymentMethod: true,
          status: true,
          paymentDate: true,
          invoice: {
            select: {
              invoiceNumber: true,
            },
          },
        },
      }),
      prisma.commissionPayout.findMany({
        where: { createdAt: { gte: startDate } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          payoutNumber: true,
          recipientName: true,
          recipientType: true,
          netAmount: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate revenue and outstanding
    const totalRevenue = Number(completedPaymentsAmount._sum.amount || 0);
    const totalOutstanding = Number(pendingInvoicesAmount._sum.totalAmount || 0);
    const totalCommissionsPaid = Number(paidPayoutsAmount._sum.netAmount || 0);
    const totalCommissionsPending = Number(pendingPayoutsAmount._sum.netAmount || 0);

    // Calculate cash flow
    const cashInflow = totalRevenue;
    const cashOutflow = totalCommissionsPaid;
    const netCashFlow = cashInflow - cashOutflow;

    return NextResponse.json({
      period,
      summary: {
        totalRevenue,
        totalOutstanding,
        totalCommissionsPaid,
        totalCommissionsPending,
        netCashFlow,
        cashInflow,
        cashOutflow,
      },
      invoices: {
        total: {
          count: totalInvoicesCount,
          amount: Number(totalInvoicesAmount._sum.totalAmount || 0),
        },
        paid: {
          count: paidInvoicesCount,
          amount: Number(paidInvoicesAmount._sum.totalAmount || 0),
        },
        pending: {
          count: pendingInvoicesCount,
          amount: Number(pendingInvoicesAmount._sum.totalAmount || 0),
        },
        overdue: {
          count: overdueInvoicesCount,
          amount: Number(overdueInvoicesAmount._sum.totalAmount || 0),
        },
      },
      payments: {
        total: {
          count: totalPaymentsCount,
          amount: Number(totalPaymentsAmount._sum.amount || 0),
        },
        completed: {
          count: completedPaymentsCount,
          amount: Number(completedPaymentsAmount._sum.amount || 0),
        },
        pending: {
          count: pendingPaymentsCount,
          amount: Number(pendingPaymentsAmount._sum.amount || 0),
        },
      },
      commissionPayouts: {
        total: {
          count: totalPayoutsCount,
          amount: Number(totalPayoutsAmount._sum.netAmount || 0),
        },
        paid: {
          count: paidPayoutsCount,
          amount: Number(paidPayoutsAmount._sum.netAmount || 0),
        },
        pending: {
          count: pendingPayoutsCount,
          amount: Number(pendingPayoutsAmount._sum.netAmount || 0),
        },
        byRecipientType: {
          channelPartners: {
            count: partnerPayoutsCount,
            amount: Number(partnerPayoutsAmount._sum.netAmount || 0),
          },
          salesManagers: {
            count: salesManagerPayoutsCount,
            amount: Number(salesManagerPayoutsAmount._sum.netAmount || 0),
          },
        },
      },
      recent: {
        invoices: recentInvoices,
        payments: recentPayments,
        payouts: recentPayouts,
      },
    });
  } catch (error) {
    console.error('Error fetching accounts stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts stats' },
      { status: 500 }
    );
  }
}
