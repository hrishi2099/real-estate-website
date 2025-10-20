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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState(false);
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

  // Auto-calculate pending amount when total amount or current payment changes
  useEffect(() => {
    if (!showCreateModal && !showEditModal) return;

    const totalAmount = parseFloat(formData.totalAmount) || 0;
    const currentPayment = parseFloat(formData.amount) || 0;

    let calculatedPending = 0;

    // If payment history exists with currentPending, use it as base
    if (paymentHistory && paymentHistory.summary.currentPending !== null) {
      const existingPending = paymentHistory.summary.currentPending;

      // For subsequent installments: newPending = currentPending - currentPayment
      if (currentPayment > 0) {
        calculatedPending = existingPending - currentPayment;
      } else {
        // If no payment entered yet, show the existing pending
        calculatedPending = existingPending;
      }
    } else if (totalAmount > 0) {
      // For first payment: pending = totalAmount - currentPayment
      calculatedPending = totalAmount - currentPayment;
    }

    // Update pending amount if it changed and is valid
    if (calculatedPending >= 0 && formData.pendingAccount !== calculatedPending.toString()) {
      setFormData((prev) => ({
        ...prev,
        pendingAccount: calculatedPending.toString(),
      }));
    } else if (totalAmount === 0 && currentPayment === 0 && formData.pendingAccount !== '') {
      // Clear pending amount if both values are removed
      setFormData((prev) => ({
        ...prev,
        pendingAccount: '',
      }));
    }
  }, [formData.amount, formData.totalAmount, showCreateModal, showEditModal, paymentHistory]);

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

        // Auto-fill from payment history (takes priority over form calculation)
        if (data.summary.currentPending !== null) {
          setFormData((prev) => ({
            ...prev,
            pendingAccount: data.summary.currentPending.toString(),
            totalAmount: prev.totalAmount || data.summary.totalAmount?.toString() || '',
          }));
        } else if (data.summary.totalAmount) {
          // If no pending but we have total amount, auto-fill it
          setFormData((prev) => ({
            ...prev,
            totalAmount: prev.totalAmount || data.summary.totalAmount.toString(),
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

  const handleDeleteClick = (payment: Payment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;

    try {
      setDeletingPayment(true);
      const response = await fetch(`/api/accounts/payments/${paymentToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove from local state
        setPayments(payments.filter(p => p.id !== paymentToDelete.id));
        setShowDeleteModal(false);
        setPaymentToDelete(null);
        alert('Payment deleted successfully');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Error deleting payment. Check console for details.');
    } finally {
      setDeletingPayment(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPaymentToDelete(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with Indian numbering system (lakhs, crores)
  const formatIndianNumber = (value: string) => {
    if (!value) return '';

    // Remove all non-digits except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');

    // Split into integer and decimal parts
    const parts = cleanValue.split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];

    // Format integer part with Indian grouping
    if (integerPart.length > 3) {
      const lastThree = integerPart.slice(-3);
      const remaining = integerPart.slice(0, -3);
      integerPart = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }

    return decimalPart !== undefined ? `${integerPart}.${decimalPart}` : integerPart;
  };

  // Parse Indian formatted number back to plain number string
  const parseIndianNumber = (value: string) => {
    return value.replace(/,/g, '');
  };

  // Convert number to words (Indian system - Lakhs, Crores)
  const numberToWords = (num: string) => {
    if (!num || num === '0') return '';

    const amount = parseFloat(num);
    if (isNaN(amount)) return '';

    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(2)} Crores`;
    } else if (amount >= 100000) {
      return `${(amount / 100000).toFixed(2)} Lakhs`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)} Thousand`;
    }
    return '';
  };

  // Generate unique payment plan identifier
  const generatePaymentPlanId = (customerName: string, projectName: string) => {
    if (!customerName || !projectName) return '';

    // Create a simple hash-like identifier
    const cleanCustomer = customerName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
    const cleanProject = projectName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
    const timestamp = Date.now().toString().slice(-6);

    return `PP-${cleanCustomer}-${cleanProject}-${timestamp}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate actual pending amount for a payment based on all payments in the same plan
  const calculateActualPending = (payment: any) => {
    if (!payment.totalAmount || !payment.customerName || !payment.projectName) {
      return payment.pendingAccount ? Number(payment.pendingAccount) : null;
    }

    // Find all payments for the same customer and project
    const relatedPayments = payments.filter(
      (p) =>
        p.customerName === payment.customerName &&
        p.projectName === payment.projectName &&
        p.status === 'COMPLETED'
    );

    // Sum all completed payments
    const totalPaid = relatedPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    // Calculate actual pending
    const actualPending = Number(payment.totalAmount) - totalPaid;

    return actualPending >= 0 ? actualPending : 0;
  };

  // Get installment count for a payment
  const getInstallmentInfo = (payment: any) => {
    if (!payment.customerName || !payment.projectName) {
      return null;
    }

    // Find all payments for the same customer and project
    const relatedPayments = payments
      .filter(
        (p) =>
          p.customerName === payment.customerName &&
          p.projectName === payment.projectName
      )
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());

    const totalInstallments = relatedPayments.length;
    const installmentNumber = relatedPayments.findIndex((p) => p.id === payment.id) + 1;

    return { installmentNumber, totalInstallments };
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
                        {(() => {
                          const installmentInfo = getInstallmentInfo(payment);
                          return installmentInfo && installmentInfo.totalInstallments > 1 && (
                            <div className="text-xs text-indigo-600 font-semibold">
                              💳 Installment #{installmentInfo.installmentNumber} of {installmentInfo.totalInstallments}
                            </div>
                          );
                        })()}
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
                        {(() => {
                          const actualPending = calculateActualPending(payment);
                          if (actualPending === null) return null;

                          const totalAmount = Number(payment.totalAmount);
                          const paidAmount = totalAmount - actualPending;
                          const percentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

                          return (
                            <>
                              <div className="text-xs text-orange-600 font-semibold">
                                Balance: {formatCurrency(actualPending)}
                              </div>
                              {totalAmount > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="bg-green-600 h-1.5 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-600">{percentage}%</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
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
                            <>
                              <button
                                onClick={() => updatePaymentStatus(payment.id, 'COMPLETED')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => updatePaymentStatus(payment.id, 'FAILED')}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Failed
                              </button>
                            </>
                          )}
                          {payment.status === 'COMPLETED' && (
                            <button
                              onClick={() => updatePaymentStatus(payment.id, 'CANCELLED')}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Cancel this completed payment"
                            >
                              Cancel
                            </button>
                          )}
                          {payment.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleDeleteClick(payment)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete payment"
                            >
                              Delete
                            </button>
                          )}
                          {payment.status === 'COMPLETED' && (
                            <span className="text-xs text-gray-500 italic" title="Cancel first to delete">
                              (Cancel to delete)
                            </span>
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
                        type="text"
                        required
                        value={formatIndianNumber(formData.amount)}
                        onChange={(e) => {
                          const rawValue = parseIndianNumber(e.target.value);
                          // Only allow valid numbers
                          if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                            setFormData({ ...formData, amount: rawValue });
                          }
                        }}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      {formData.amount && numberToWords(formData.amount) && (
                        <p className="text-xs text-blue-600 mt-1">
                          ≈ {numberToWords(formData.amount)}
                        </p>
                      )}
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

              {!showEditModal && !(paymentHistory && paymentHistory.summary.totalPayments > 0) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Property (Optional but Recommended)
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

              {/* Simplified Info Banner for Existing Payment Plans */}
              {paymentHistory && paymentHistory.summary.totalPayments > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 rounded-full p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-900 text-base">
                        Adding Installment #{paymentHistory.summary.totalPayments + 1}
                      </h4>
                      <p className="text-sm text-green-700">
                        Customer & Project details auto-filled. Just enter the payment amount and method.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment History Ledger */}
              {paymentHistory && paymentHistory.summary.totalPayments > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-5 shadow-md">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-blue-600 rounded-full p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-900 text-lg mb-1">Payment Ledger Found</h4>
                      <p className="text-sm text-blue-700">
                        <span className="font-semibold">{paymentHistory.summary.customerName}</span>
                        {paymentHistory.summary.projectName && <> • {paymentHistory.summary.projectName}</>}
                      </p>
                      <div className="mt-2 inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-mono">
                        ID: {generatePaymentPlanId(
                          paymentHistory.summary.customerName || formData.customerName,
                          paymentHistory.summary.projectName || formData.projectName
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <span className="text-xs text-gray-600 block">Total Installments</span>
                      <span className="font-bold text-blue-900 text-lg">{paymentHistory.summary.totalPayments}</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <span className="text-xs text-gray-600 block">Amount Paid</span>
                      <span className="font-bold text-green-700 text-sm">{formatCurrency(paymentHistory.summary.totalPaid)}</span>
                    </div>
                    {paymentHistory.summary.totalAmount && (
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <span className="text-xs text-gray-600 block">Total Amount</span>
                        <span className="font-bold text-blue-900 text-sm">{formatCurrency(paymentHistory.summary.totalAmount)}</span>
                      </div>
                    )}
                    {paymentHistory.summary.currentPending !== null && (
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <span className="text-xs text-gray-600 block">Balance Due</span>
                        <span className="font-bold text-orange-700 text-sm">{formatCurrency(paymentHistory.summary.currentPending)}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {paymentHistory.summary.totalAmount && paymentHistory.summary.currentPending !== null && (
                    <div className="bg-white rounded-lg p-3 shadow-sm mb-4">
                      <div className="flex justify-between text-xs font-medium text-gray-700 mb-2">
                        <span>Payment Progress</span>
                        <span className="text-blue-600">{Math.round((paymentHistory.summary.totalPaid / paymentHistory.summary.totalAmount) * 100)}% Complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{
                            width: `${Math.min((paymentHistory.summary.totalPaid / paymentHistory.summary.totalAmount) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Payment Installments Ledger */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2">
                      <h5 className="text-white font-semibold text-sm">Payment Installments History</h5>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-600 font-semibold">#</th>
                            <th className="px-3 py-2 text-left text-gray-600 font-semibold">Date</th>
                            <th className="px-3 py-2 text-right text-gray-600 font-semibold">Amount</th>
                            <th className="px-3 py-2 text-center text-gray-600 font-semibold">Status</th>
                            <th className="px-3 py-2 text-right text-gray-600 font-semibold">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paymentHistory.payments
                            .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime())
                            .map((payment, index) => {
                              const totalPaidUpToThis = paymentHistory.payments
                                .slice(0, index + 1)
                                .filter(p => p.status === 'COMPLETED')
                                .reduce((sum, p) => sum + Number(p.amount), 0);
                              const balanceAfter = (paymentHistory.summary.totalAmount || 0) - totalPaidUpToThis;

                              return (
                                <tr key={payment.id} className="hover:bg-blue-50 transition-colors">
                                  <td className="px-3 py-2 font-mono font-semibold text-blue-900">#{index + 1}</td>
                                  <td className="px-3 py-2 text-gray-700">{formatDate(payment.paymentDate)}</td>
                                  <td className="px-3 py-2 text-right font-semibold text-gray-900">
                                    {formatCurrency(Number(payment.amount))}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                      payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                      payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {payment.status}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-right font-semibold text-orange-700">
                                    {formatCurrency(balanceAfter)}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-blue-700 bg-blue-100 rounded-lg p-2">
                    💡 <span className="font-semibold">This is installment #{paymentHistory.summary.totalPayments + 1}</span> for this payment plan
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payer Type *
                    {paymentHistory && paymentHistory.summary.totalPayments > 0 && (
                      <span className="text-xs text-gray-500 ml-2">(Locked)</span>
                    )}
                  </label>
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
                    disabled={!!(paymentHistory && paymentHistory.summary.totalPayments > 0)}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 ${
                      paymentHistory && paymentHistory.summary.totalPayments > 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="EXISTING_USER">Existing User (Has Login)</option>
                    <option value="NON_USER">Non-User (No Login Yet)</option>
                  </select>
                </div>
                {!showEditModal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name * {formData.propertyId && '(Auto-filled)'}
                      {paymentHistory && paymentHistory.summary.totalPayments > 0 && (
                        <span className="text-xs text-gray-500 ml-2">(Locked)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      disabled={!!(paymentHistory && paymentHistory.summary.totalPayments > 0)}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 ${
                        paymentHistory && paymentHistory.summary.totalPayments > 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="e.g., Green Valley Phase 2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {paymentHistory && paymentHistory.summary.totalPayments > 0
                        ? '🔒 Locked from previous installments'
                        : 'Required for payment tracking - links all installments together'}
                    </p>
                  </div>
                )}
              </div>

              {/* Customer Selection - Conditional based on Payer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer {formData.payerType === 'EXISTING_USER' ? '*' : ''}
                  {paymentHistory && paymentHistory.summary.totalPayments > 0 && (
                    <span className="text-xs text-gray-500 ml-2">(Locked)</span>
                  )}
                </label>
                {formData.payerType === 'EXISTING_USER' ? (
                  <div>
                    <select
                      required
                      value={formData.customerId}
                      onChange={(e) => handleUserSelect(e.target.value)}
                      disabled={loadingUsers || !!(paymentHistory && paymentHistory.summary.totalPayments > 0)}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 ${
                        paymentHistory && paymentHistory.summary.totalPayments > 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
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
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      onBlur={() => {
                        // Fetch payment history when customer name is entered manually
                        if (formData.customerName && formData.customerName.length > 2) {
                          fetchPaymentHistory(undefined, formData.customerName, formData.projectName || undefined);
                        }
                      }}
                      disabled={!!(paymentHistory && paymentHistory.summary.totalPayments > 0)}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 ${
                        paymentHistory && paymentHistory.summary.totalPayments > 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Enter customer full name"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {paymentHistory && paymentHistory.summary.totalPayments > 0
                        ? '🔒 Locked from previous installments'
                        : 'Required for tracking - Enter name and click outside to check payment history'}
                    </p>
                  </div>
                )}
              </div>

              {!showEditModal && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount (₹)
                      {paymentHistory && paymentHistory.summary.totalPayments > 0 && (
                        <span className="text-xs text-gray-500 ml-2">(Locked)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formatIndianNumber(formData.totalAmount)}
                      onChange={(e) => {
                        const rawValue = parseIndianNumber(e.target.value);
                        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                          setFormData({ ...formData, totalAmount: rawValue });
                        }
                      }}
                      disabled={!!(paymentHistory && paymentHistory.summary.totalPayments > 0)}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 ${
                        paymentHistory && paymentHistory.summary.totalPayments > 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Total contract amount"
                    />
                    {formData.totalAmount && numberToWords(formData.totalAmount) && (
                      <p className="text-xs text-blue-600 mt-1">
                        ≈ {numberToWords(formData.totalAmount)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      Pending Account (₹)
                      {paymentHistory && paymentHistory.summary.currentPending !== null ? (
                        <span className="text-xs text-green-600 font-normal">✓ From History</span>
                      ) : formData.totalAmount && formData.amount && formData.pendingAccount ? (
                        <span className="text-xs text-blue-600 font-normal">✓ Auto-calculated</span>
                      ) : null}
                    </label>
                    <input
                      type="text"
                      value={formatIndianNumber(formData.pendingAccount)}
                      onChange={(e) => {
                        const rawValue = parseIndianNumber(e.target.value);
                        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                          setFormData({ ...formData, pendingAccount: rawValue });
                        }
                      }}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 ${
                        paymentHistory && paymentHistory.summary.currentPending !== null ? 'bg-green-50' :
                        formData.totalAmount && formData.amount && formData.pendingAccount ? 'bg-blue-50' : ''
                      }`}
                      placeholder="Outstanding balance"
                    />
                    {paymentHistory && paymentHistory.summary.currentPending !== null ? (
                      <p className="text-xs text-gray-500 mt-1">
                        From payment history: Total - Completed Payments
                      </p>
                    ) : formData.totalAmount && formData.amount && formData.pendingAccount ? (
                      <p className="text-xs text-blue-600 mt-1">
                        Total ({formatIndianNumber(formData.totalAmount)}) - Current Payment ({formatIndianNumber(formData.amount)})
                        {numberToWords(formData.pendingAccount) && ` ≈ ${numberToWords(formData.pendingAccount)}`}
                      </p>
                    ) : formData.pendingAccount && numberToWords(formData.pendingAccount) ? (
                      <p className="text-xs text-orange-600 mt-1">
                        ≈ {numberToWords(formData.pendingAccount)}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plot Area (sqft) {formData.propertyId && '(Auto-filled)'}
                      {paymentHistory && paymentHistory.summary.totalPayments > 0 && (
                        <span className="text-xs text-gray-500 ml-2">(Locked)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formatIndianNumber(formData.plotArea)}
                      onChange={(e) => {
                        const rawValue = parseIndianNumber(e.target.value);
                        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                          setFormData({ ...formData, plotArea: rawValue });
                        }
                      }}
                      disabled={!!(paymentHistory && paymentHistory.summary.totalPayments > 0)}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 ${
                        paymentHistory && paymentHistory.summary.totalPayments > 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && paymentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-4 rounded-t-xl">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-xl font-bold">Confirm Delete</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">
                  Are you sure you want to delete this payment record?
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Number:</span>
                    <span className="font-semibold text-gray-900">{paymentToDelete.paymentNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-semibold text-gray-900">{paymentToDelete.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(paymentToDelete.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${paymentToDelete.status === 'COMPLETED' ? 'text-red-600' : 'text-gray-900'}`}>
                      {paymentToDelete.status}
                    </span>
                  </div>
                </div>
              </div>

              {paymentToDelete.status === 'COMPLETED' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>
                      <strong>Warning:</strong> This payment is marked as COMPLETED. Deleting it may affect payment history and balances. Consider canceling it instead.
                    </span>
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500">
                ⚠️ This action cannot be undone. The payment record will be permanently deleted.
              </p>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingPayment}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {deletingPayment ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={handleDeleteCancel}
                disabled={deletingPayment}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
