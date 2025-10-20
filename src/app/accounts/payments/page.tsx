'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Payment {
  id: string;
  paymentNumber: string;
  amount: number;
  paymentMethod: string;
  paymentMode: string;
  status: string;
  paymentDate: string;
  referenceNumber?: string;
  customerName?: string;
  invoice?: { invoiceNumber: string };
  // New fields
  projectName?: string;
  pendingAccount?: number;
  plotArea?: number;
  totalAmount?: number;
  payerType?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  area?: number;
  type: string;
  status: string;
}

interface PaymentHistory {
  payments: Payment[];
  summary: {
    totalPayments: number;
    totalPaid: number;
    totalPending: number;
    totalAmount: number | null;
    currentPending: number | null;
    customerName?: string;
    projectName?: string;
  };
}

export default function PaymentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    paymentMode: 'ONLINE',
    referenceNumber: '',
    bankName: '',
    invoiceId: '',
    customerId: '',
    customerName: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
    // New fields
    propertyId: '',
    projectName: '',
    pendingAccount: '',
    plotArea: '',
    totalAmount: '',
    payerType: 'EXISTING_USER',
  });

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'ACCOUNTS' && user.role !== 'ADMIN'))) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && (user.role === 'ACCOUNTS' || user.role === 'ADMIN')) {
      fetchPayments();
    }
  }, [user, statusFilter, searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      let url = '/api/accounts/payments?limit=100';
      if (statusFilter) url += `&status=${statusFilter}`;
      if (searchTerm) url += `&search=${searchTerm}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/accounts/users', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch users:', errorData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      console.log('Fetching properties from /api/accounts/properties...');
      const response = await fetch('/api/accounts/properties', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Properties response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Properties data received:', data);
        console.log('Number of properties:', data.properties?.length || 0);
        setProperties(data.properties || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch properties:', errorData);
        alert(`Failed to load properties: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      alert('Error loading properties. Check console for details.');
    } finally {
      setLoadingProperties(false);
    }
  };

  // Fetch users and properties when modal opens
  useEffect(() => {
    if (showCreateModal || showEditModal) {
      console.log('Modal opened, fetching users and properties...');
      fetchUsers();
      fetchProperties();
    }
  }, [showCreateModal, showEditModal]);

  const handleUserSelect = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setFormData({
        ...formData,
        customerId: selectedUser.id,
        customerName: selectedUser.name,
      });
      // Fetch payment history for this customer
      fetchPaymentHistory(selectedUser.id, selectedUser.name, formData.projectName || undefined);
    }
  };

  const handlePropertySelect = (propertyId: string) => {
    const selectedProperty = properties.find(p => p.id === propertyId);
    if (selectedProperty) {
      const newProjectName = selectedProperty.title;
      setFormData({
        ...formData,
        propertyId: selectedProperty.id,
        projectName: newProjectName,
        plotArea: selectedProperty.area?.toString() || '',
      });
      // Fetch payment history for this project
      fetchPaymentHistory(
        formData.customerId || undefined,
        formData.customerName || undefined,
        newProjectName
      );
    }
  };

  const fetchPaymentHistory = async (customerId?: string, customerName?: string, projectName?: string) => {
    if (!customerId && !customerName && !projectName) {
      setPaymentHistory(null);
      return;
    }

    try {
      setLoadingHistory(true);
      const params = new URLSearchParams();
      if (customerId) params.append('customerId', customerId);
      if (customerName) params.append('customerName', customerName);
      if (projectName) params.append('projectName', projectName);

      const response = await fetch(`/api/accounts/payments/history?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data);

        // Auto-calculate pending balance
        if (data.summary.currentPending !== null) {
          setFormData((prev) => ({
            ...prev,
            pendingAccount: data.summary.currentPending.toString(),
          }));
        }
      } else {
        setPaymentHistory(null);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setPaymentHistory(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/accounts/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
          paymentMode: formData.paymentMode,
          referenceNumber: formData.referenceNumber || undefined,
          bankName: formData.bankName || undefined,
          invoiceId: formData.invoiceId || undefined,
          customerId: formData.customerId || undefined,
          customerName: formData.customerName || undefined,
          paymentDate: formData.paymentDate,
          notes: formData.notes || undefined,
          // New fields
          projectName: formData.projectName || undefined,
          pendingAccount: formData.pendingAccount ? parseFloat(formData.pendingAccount) : undefined,
          plotArea: formData.plotArea ? parseFloat(formData.plotArea) : undefined,
          totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : undefined,
          payerType: formData.payerType || undefined,
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          amount: '',
          paymentMethod: 'BANK_TRANSFER',
          paymentMode: 'ONLINE',
          referenceNumber: '',
          bankName: '',
          invoiceId: '',
          customerId: '',
          customerName: '',
          paymentDate: new Date().toISOString().split('T')[0],
          notes: '',
          propertyId: '',
          projectName: '',
          pendingAccount: '',
          plotArea: '',
          totalAmount: '',
          payerType: 'EXISTING_USER',
        });
        fetchPayments();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to create payment');
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      amount: payment.amount.toString(),
      paymentMethod: payment.paymentMethod,
      paymentMode: payment.paymentMode,
      referenceNumber: payment.referenceNumber || '',
      bankName: '',
      invoiceId: '',
      customerId: '',
      customerName: payment.customerName || '',
      paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
      notes: '',
      propertyId: '',
      projectName: payment.projectName || '',
      pendingAccount: payment.pendingAccount?.toString() || '',
      plotArea: payment.plotArea?.toString() || '',
      totalAmount: payment.totalAmount?.toString() || '',
      payerType: payment.payerType || 'EXISTING_USER',
    });
    setShowEditModal(true);
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/accounts/payments/${editingPayment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: formData.customerId || undefined,
          customerName: formData.customerName || undefined,
          payerType: formData.payerType || undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingPayment(null);
        setFormData({
          amount: '',
          paymentMethod: 'BANK_TRANSFER',
          paymentMode: 'ONLINE',
          referenceNumber: '',
          bankName: '',
          invoiceId: '',
          customerId: '',
          customerName: '',
          paymentDate: new Date().toISOString().split('T')[0],
          notes: '',
          propertyId: '',
          projectName: '',
          pendingAccount: '',
          plotArea: '',
          totalAmount: '',
          payerType: 'EXISTING_USER',
        });
        fetchPayments();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment');
    } finally {
      setSaving(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/accounts/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          clearedDate: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
        }),
      });

      if (response.ok) {
        fetchPayments();
      }
    } catch (error) {
      console.error('Error updating payment:', error);
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
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return '💵';
      case 'UPI':
        return '📱';
      case 'BANK_TRANSFER':
        return '🏦';
      case 'CHEQUE':
        return '📝';
      case 'CARD':
        return '💳';
      default:
        return '💰';
    }
  };

  if (isLoading || !user) {
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
              <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
              <p className="mt-1 text-sm text-gray-500">Record and track customer payments</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              + Record Payment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by payment number, reference, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loadingPayments ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500 mb-4">Record your first payment to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Record Payment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer / Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount / Plot</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.paymentNumber}</div>
                        {payment.referenceNumber && (
                          <div className="text-xs text-gray-500">Ref: {payment.referenceNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{payment.customerName || 'N/A'}</div>
                        {payment.projectName && (
                          <div className="text-xs text-gray-500">🏗️ {payment.projectName}</div>
                        )}
                        {payment.payerType && (
                          <div className="text-xs text-blue-600">
                            {payment.payerType === 'EXISTING_USER' ? '👤 Has Login' : '👥 No Login'}
                          </div>
                        )}
                        {payment.invoice && (
                          <div className="text-xs text-gray-500">{payment.invoice.invoiceNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                        {payment.totalAmount && (
                          <div className="text-xs text-gray-500">Total: {formatCurrency(payment.totalAmount)}</div>
                        )}
                        {payment.pendingAccount && (
                          <div className="text-xs text-orange-600">Pending: {formatCurrency(payment.pendingAccount)}</div>
                        )}
                        {payment.plotArea && (
                          <div className="text-xs text-green-600">📐 {payment.plotArea} sqft</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                          <div>
                            <div className="text-sm text-gray-900">{payment.paymentMethod.replace('_', ' ')}</div>
                            <div className="text-xs text-gray-500">{payment.paymentMode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleEditPayment(payment)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          {payment.status === 'PENDING' && (
                            <button
                              onClick={() => updatePaymentStatus(payment.id, 'COMPLETED')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Complete
                            </button>
                          )}
                          {payment.status === 'PENDING' && (
                            <button
                              onClick={() => updatePaymentStatus(payment.id, 'FAILED')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Failed
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
      </div>

      {/* Create/Edit Payment Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {showEditModal ? 'Edit Payment' : 'Record New Payment'}
              </h2>
            </div>
            <form onSubmit={showEditModal ? handleUpdatePayment : handleCreatePayment} className="p-6 space-y-4">
              {!showEditModal && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.paymentDate}
                        onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                      <select
                        required
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="CASH">Cash</option>
                        <option value="CHEQUE">Cheque</option>
                        <option value="CARD">Card</option>
                        <option value="NET_BANKING">Net Banking</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
                      <select
                        required
                        value={formData.paymentMode}
                        onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="ONLINE">Online</option>
                        <option value="OFFLINE">Offline</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                      <input
                        type="text"
                        value={formData.referenceNumber}
                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Transaction ID / UTR"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {showEditModal && editingPayment && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Details (Read-Only)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Payment Number:</span>
                      <span className="ml-2 font-medium">{editingPayment.paymentNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="ml-2 font-medium">{formatCurrency(editingPayment.amount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Method:</span>
                      <span className="ml-2 font-medium">{editingPayment.paymentMethod.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-medium">{formatDate(editingPayment.paymentDate)}</span>
                    </div>
                    {editingPayment.referenceNumber && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Reference:</span>
                        <span className="ml-2 font-medium">{editingPayment.referenceNumber}</span>
                      </div>
                    )}
                    {editingPayment.projectName && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Project:</span>
                        <span className="ml-2 font-medium">{editingPayment.projectName}</span>
                      </div>
                    )}
                    {editingPayment.totalAmount && (
                      <div>
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="ml-2 font-medium">{formatCurrency(editingPayment.totalAmount)}</span>
                      </div>
                    )}
                    {editingPayment.pendingAccount && (
                      <div>
                        <span className="text-gray-600">Pending:</span>
                        <span className="ml-2 font-medium text-orange-600">{formatCurrency(editingPayment.pendingAccount)}</span>
                      </div>
                    )}
                    {editingPayment.plotArea && (
                      <div>
                        <span className="text-gray-600">Plot Area:</span>
                        <span className="ml-2 font-medium">{editingPayment.plotArea} sqft</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!showEditModal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Property (Optional)
                    {properties.length > 0 && (
                      <span className="text-xs text-gray-500 ml-2">({properties.length} available)</span>
                    )}
                  </label>
                  <select
                    value={formData.propertyId}
                    onChange={(e) => {
                      console.log('Property selected:', e.target.value);
                      if (e.target.value) {
                        handlePropertySelect(e.target.value);
                      } else {
                        setFormData({ ...formData, propertyId: '', projectName: '', plotArea: '' });
                        setPaymentHistory(null);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    disabled={loadingProperties}
                  >
                    <option value="">
                      {loadingProperties ? 'Loading properties...' :
                       properties.length === 0 ? 'No properties found - enter details manually below' :
                       'Select a property or enter manually below'}
                    </option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.title} - {property.location} {property.area ? `(${property.area} sqft)` : ''} [{property.status}]
                      </option>
                    ))}
                  </select>
                  {formData.propertyId && (
                    <p className="text-xs text-green-600 mt-1">✓ Property selected - project details auto-filled below</p>
                  )}
                  {!loadingProperties && properties.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠ No properties loaded. Check browser console for errors or create properties first.
                    </p>
                  )}
                </div>
              )}

              {/* Payment History Summary */}
              {paymentHistory && paymentHistory.summary.totalPayments > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 mb-2">Previous Payment History Found</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-blue-600 block">Total Payments</span>
                          <span className="font-semibold text-blue-900">{paymentHistory.summary.totalPayments}</span>
                        </div>
                        <div>
                          <span className="text-blue-600 block">Amount Paid</span>
                          <span className="font-semibold text-green-700">{formatCurrency(paymentHistory.summary.totalPaid)}</span>
                        </div>
                        {paymentHistory.summary.totalAmount && (
                          <div>
                            <span className="text-blue-600 block">Total Amount</span>
                            <span className="font-semibold text-blue-900">{formatCurrency(paymentHistory.summary.totalAmount)}</span>
                          </div>
                        )}
                        {paymentHistory.summary.currentPending !== null && (
                          <div>
                            <span className="text-blue-600 block">Pending (Auto-filled)</span>
                            <span className="font-semibold text-orange-700">{formatCurrency(paymentHistory.summary.currentPending)}</span>
                          </div>
                        )}
                      </div>
                      {paymentHistory.summary.totalAmount && paymentHistory.summary.currentPending !== null && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-blue-600 mb-1">
                            <span>Payment Progress</span>
                            <span>{Math.round((paymentHistory.summary.totalPaid / paymentHistory.summary.totalAmount) * 100)}%</span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min((paymentHistory.summary.totalPaid / paymentHistory.summary.totalAmount) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payer Type *</label>
                  <select
                    value={formData.payerType}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        payerType: e.target.value,
                        customerId: '',
                        customerName: '',
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="EXISTING_USER">Existing User (Has Login)</option>
                    <option value="NON_USER">Non-User (No Login Yet)</option>
                  </select>
                </div>
                {!showEditModal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name {formData.propertyId && '(Auto-filled)'}
                    </label>
                    <input
                      type="text"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Green Valley Phase 2"
                    />
                  </div>
                )}
              </div>

              {/* Customer Selection - Conditional based on Payer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer {formData.payerType === 'EXISTING_USER' ? '*' : ''}
                </label>
                {formData.payerType === 'EXISTING_USER' ? (
                  <div>
                    <select
                      required
                      value={formData.customerId}
                      onChange={(e) => handleUserSelect(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={loadingUsers}
                    >
                      <option value="">
                        {loadingUsers ? 'Loading users...' : 'Select a user...'}
                      </option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email}) {user.phone ? `- ${user.phone}` : ''}
                        </option>
                      ))}
                    </select>
                    {formData.customerName && (
                      <p className="text-xs text-green-600 mt-1">✓ Selected: {formData.customerName}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      onBlur={() => {
                        // Fetch payment history when customer name is entered manually
                        if (formData.customerName && formData.customerName.length > 2) {
                          fetchPaymentHistory(undefined, formData.customerName, formData.projectName || undefined);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Enter customer name"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter name and click outside to check payment history
                    </p>
                  </div>
                )}
              </div>

              {!showEditModal && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Total contract amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      Pending Account (₹)
                      {paymentHistory && paymentHistory.summary.currentPending !== null && (
                        <span className="text-xs text-green-600 font-normal">✓ Auto-calculated</span>
                      )}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pendingAccount}
                      onChange={(e) => setFormData({ ...formData, pendingAccount: e.target.value })}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 ${
                        paymentHistory && paymentHistory.summary.currentPending !== null ? 'bg-green-50' : ''
                      }`}
                      placeholder="Outstanding balance"
                    />
                    {paymentHistory && paymentHistory.summary.currentPending !== null && (
                      <p className="text-xs text-gray-500 mt-1">
                        Calculated from: Total Amount - Completed Payments
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plot Area (sqft) {formData.propertyId && '(Auto-filled)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.plotArea}
                      onChange={(e) => setFormData({ ...formData, plotArea: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Area in sqft"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : (showEditModal ? 'Update Payment' : 'Record Payment')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingPayment(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
