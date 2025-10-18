'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CommissionPayout {
  id: string;
  payoutNumber: string;
  recipientType: string;
  recipientName: string;
  amount: number;
  taxDeducted: number;
  netAmount: number;
  paymentMethod: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  approvedAt?: string;
  paidAt?: string;
  approvedBy?: { name: string };
}

export default function CommissionPayoutsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [recipientTypeFilter, setRecipientTypeFilter] = useState('');

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'ACCOUNTS' && user.role !== 'ADMIN'))) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && (user.role === 'ACCOUNTS' || user.role === 'ADMIN')) {
      fetchPayouts();
    }
  }, [user, statusFilter, recipientTypeFilter]);

  const fetchPayouts = async () => {
    try {
      setLoadingPayouts(true);
      let url = '/api/accounts/commission-payouts?limit=100';
      if (statusFilter) url += `&status=${statusFilter}`;
      if (recipientTypeFilter) url += `&recipientType=${recipientTypeFilter}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPayouts(data.payouts);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoadingPayouts(false);
    }
  };

  const updatePayoutStatus = async (payoutId: string, newStatus: string) => {
    if (newStatus === 'APPROVED' || newStatus === 'REJECTED') {
      if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this payout?`)) {
        return;
      }
    }

    try {
      const response = await fetch(`/api/accounts/commission-payouts/${payoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchPayouts();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating payout:', error);
      alert('Failed to update payout');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
        return 'bg-orange-100 text-orange-800';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecipientTypeBadge = (type: string) => {
    if (type === 'CHANNEL_PARTNER') {
      return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">Partner</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">Sales Manager</span>;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/accounts" className="text-indigo-600 hover:text-indigo-800 text-sm mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Commission Payout Management</h1>
              <p className="mt-1 text-sm text-gray-500">Approve and process commission payouts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`p-4 rounded-xl shadow-md transition-all ${
              statusFilter === 'PENDING'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                : 'bg-white text-gray-700 hover:shadow-lg'
            }`}
          >
            <div className="text-sm font-medium">Pending Approval</div>
            <div className="text-2xl font-bold mt-1">
              {payouts.filter((p) => p.status === 'PENDING').length}
            </div>
          </button>

          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`p-4 rounded-xl shadow-md transition-all ${
              statusFilter === 'APPROVED'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : 'bg-white text-gray-700 hover:shadow-lg'
            }`}
          >
            <div className="text-sm font-medium">Approved</div>
            <div className="text-2xl font-bold mt-1">
              {payouts.filter((p) => p.status === 'APPROVED').length}
            </div>
          </button>

          <button
            onClick={() => setStatusFilter('PAID')}
            className={`p-4 rounded-xl shadow-md transition-all ${
              statusFilter === 'PAID'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : 'bg-white text-gray-700 hover:shadow-lg'
            }`}
          >
            <div className="text-sm font-medium">Paid</div>
            <div className="text-2xl font-bold mt-1">
              {payouts.filter((p) => p.status === 'PAID').length}
            </div>
          </button>

          <button
            onClick={() => setStatusFilter('')}
            className={`p-4 rounded-xl shadow-md transition-all ${
              statusFilter === ''
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                : 'bg-white text-gray-700 hover:shadow-lg'
            }`}
          >
            <div className="text-sm font-medium">All Payouts</div>
            <div className="text-2xl font-bold mt-1">{payouts.length}</div>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Type</label>
              <select
                value={recipientTypeFilter}
                onChange={(e) => setRecipientTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="CHANNEL_PARTNER">Channel Partners</option>
                <option value="SALES_MANAGER">Sales Managers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loadingPayouts ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payouts...</p>
            </div>
          ) : payouts.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payouts found</h3>
              <p className="text-gray-500">No commission payouts match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payout.payoutNumber}</div>
                        <div className="text-xs text-gray-500">{payout.paymentMethod.replace('_', ' ')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payout.recipientName}</div>
                        <div className="mt-1">{getRecipientTypeBadge(payout.recipientType)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(payout.netAmount)}</div>
                        {payout.taxDeducted > 0 && (
                          <div className="text-xs text-gray-500">
                            Gross: {formatCurrency(payout.amount)} (TDS: {formatCurrency(payout.taxDeducted)})
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{formatDate(payout.periodStart)}</div>
                        <div className="text-xs">to {formatDate(payout.periodEnd)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                          {payout.status}
                        </span>
                        {payout.approvedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Approved: {formatDate(payout.approvedAt)}
                          </div>
                        )}
                        {payout.paidAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Paid: {formatDate(payout.paidAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col gap-2">
                          {payout.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => updatePayoutStatus(payout.id, 'APPROVED')}
                                className="text-green-600 hover:text-green-900 text-left"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updatePayoutStatus(payout.id, 'REJECTED')}
                                className="text-red-600 hover:text-red-900 text-left"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {payout.status === 'APPROVED' && (
                            <button
                              onClick={() => updatePayoutStatus(payout.id, 'PAID')}
                              className="text-blue-600 hover:text-blue-900 text-left"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {payouts.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-600">Total Pending Payouts</div>
                <div className="text-2xl font-bold text-orange-600 mt-1">
                  {formatCurrency(
                    payouts
                      .filter((p) => p.status === 'PENDING')
                      .reduce((sum, p) => sum + Number(p.netAmount), 0)
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {payouts.filter((p) => p.status === 'PENDING').length} payouts
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Approved</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {formatCurrency(
                    payouts
                      .filter((p) => p.status === 'APPROVED')
                      .reduce((sum, p) => sum + Number(p.netAmount), 0)
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {payouts.filter((p) => p.status === 'APPROVED').length} payouts
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Paid Out</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(
                    payouts
                      .filter((p) => p.status === 'PAID')
                      .reduce((sum, p) => sum + Number(p.netAmount), 0)
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {payouts.filter((p) => p.status === 'PAID').length} payouts
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
