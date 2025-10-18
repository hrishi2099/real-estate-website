'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  period: string;
  summary: {
    totalRevenue: number;
    totalOutstanding: number;
    totalCommissionsPaid: number;
    totalCommissionsPending: number;
    netCashFlow: number;
    cashInflow: number;
    cashOutflow: number;
  };
  invoices: {
    total: { count: number; amount: number };
    paid: { count: number; amount: number };
    pending: { count: number; amount: number };
    overdue: { count: number; amount: number };
  };
  payments: {
    total: { count: number; amount: number };
    completed: { count: number; amount: number };
    pending: { count: number; amount: number };
  };
  commissionPayouts: {
    total: { count: number; amount: number };
    paid: { count: number; amount: number };
    pending: { count: number; amount: number };
    byRecipientType: {
      channelPartners: { count: number; amount: number };
      salesManagers: { count: number; amount: number };
    };
  };
  recent: {
    invoices: any[];
    payments: any[];
    payouts: any[];
  };
}

export default function AccountsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [period, setPeriod] = useState('month');
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'ACCOUNTS' && user.role !== 'ADMIN'))) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && (user.role === 'ACCOUNTS' || user.role === 'ADMIN')) {
      fetchStats();
    }
  }, [user, period]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch(`/api/accounts/stats?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading || loadingStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'ACCOUNTS' && user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Accounts Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Comprehensive financial management and reporting
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats?.summary.totalRevenue || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Completed payments</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats?.summary.totalOutstanding || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Pending invoices</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commissions Paid</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats?.summary.totalCommissionsPaid || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total payouts</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${stats && stats.summary.netCashFlow >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
                <p className={`text-2xl font-bold mt-2 ${stats && stats.summary.netCashFlow >= 0 ? 'text-gray-900' : 'text-orange-600'}`}>
                  {formatCurrency(stats?.summary.netCashFlow || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Revenue - Commissions</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stats && stats.summary.netCashFlow >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                <svg className={`w-6 h-6 ${stats && stats.summary.netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/accounts/invoices" className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Invoices</h3>
                <p className="text-sm opacity-90 mt-1">Manage all invoices</p>
                <p className="text-2xl font-bold mt-3">{stats?.invoices.total.count || 0}</p>
              </div>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </Link>

          <Link href="/accounts/payments" className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Payments</h3>
                <p className="text-sm opacity-90 mt-1">Track all payments</p>
                <p className="text-2xl font-bold mt-3">{stats?.payments.total.count || 0}</p>
              </div>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </Link>

          <Link href="/accounts/commission-payouts" className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Commission Payouts</h3>
                <p className="text-sm opacity-90 mt-1">Approve & process</p>
                <p className="text-2xl font-bold mt-3">{stats?.commissionPayouts.pending.count || 0}</p>
              </div>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Invoice Breakdown */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Paid</span>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-700">{stats?.invoices.paid.count || 0}</p>
                  <p className="text-xs text-gray-600">{formatCurrency(stats?.invoices.paid.amount || 0)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Pending</span>
                <div className="text-right">
                  <p className="text-sm font-bold text-yellow-700">{stats?.invoices.pending.count || 0}</p>
                  <p className="text-xs text-gray-600">{formatCurrency(stats?.invoices.pending.amount || 0)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Overdue</span>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-700">{stats?.invoices.overdue.count || 0}</p>
                  <p className="text-xs text-gray-600">{formatCurrency(stats?.invoices.overdue.amount || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Commission Breakdown */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Channel Partners</span>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-700">{stats?.commissionPayouts.byRecipientType.channelPartners.count || 0}</p>
                  <p className="text-xs text-gray-600">{formatCurrency(stats?.commissionPayouts.byRecipientType.channelPartners.amount || 0)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Sales Managers</span>
                <div className="text-right">
                  <p className="text-sm font-bold text-purple-700">{stats?.commissionPayouts.byRecipientType.salesManagers.count || 0}</p>
                  <p className="text-xs text-gray-600">{formatCurrency(stats?.commissionPayouts.byRecipientType.salesManagers.amount || 0)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Pending Approval</span>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-700">{stats?.commissionPayouts.pending.count || 0}</p>
                  <p className="text-xs text-gray-600">{formatCurrency(stats?.commissionPayouts.pending.amount || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
