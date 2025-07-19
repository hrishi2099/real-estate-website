"use client";

import { useState, useEffect } from "react";

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'NEW' | 'REVIEWED' | 'RESPONDED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export default function ContactInquiriesManagement() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | 'NEW' | 'REVIEWED' | 'RESPONDED' | 'CLOSED'>('all');

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/contact-inquiries');
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact inquiries');
      }
      
      const data = await response.json();
      setInquiries(data.contactInquiries || []);
    } catch (err) {
      setError('Failed to load contact inquiries');
      console.error('Error loading contact inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (inquiryId: string, newStatus: 'NEW' | 'REVIEWED' | 'RESPONDED' | 'CLOSED') => {
    try {
      setUpdatingStatus(inquiryId);
      const response = await fetch(`/api/admin/contact-inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update inquiry status');
      }
      
      // Refresh the inquiries list
      await loadInquiries();
    } catch (err) {
      console.error('Error updating inquiry status:', err);
      alert('Failed to update inquiry status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/admin/contact-inquiries/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to export contact inquiries');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const currentDate = new Date().toISOString().split('T')[0];
      link.download = `contact-inquiries-${currentDate}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting contact inquiries:', err);
      alert('Failed to export contact inquiries. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => 
    statusFilter === 'all' || inquiry.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-red-100 text-red-800';
      case 'REVIEWED': return 'bg-yellow-100 text-yellow-800';
      case 'RESPONDED': return 'bg-blue-100 text-blue-800';
      case 'CLOSED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Contact Inquiries</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading contact inquiries...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Contact Inquiries</h1>
          <button 
            onClick={loadInquiries}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading contact inquiries</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contact Inquiries</h1>
        <div className="flex space-x-3">
          <button 
            onClick={loadInquiries}
            disabled={loading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button 
            onClick={exportToExcel}
            disabled={exporting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exporting ? 'Exporting...' : 'Export to Excel'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{inquiries.length}</div>
          <div className="text-sm text-gray-600">Total Inquiries</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{inquiries.filter(i => i.status === 'NEW').length}</div>
          <div className="text-sm text-gray-600">New</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{inquiries.filter(i => i.status === 'RESPONDED').length}</div>
          <div className="text-sm text-gray-600">Responded</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{inquiries.filter(i => i.status === 'CLOSED').length}</div>
          <div className="text-sm text-gray-600">Closed</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                statusFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('NEW')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                statusFilter === 'NEW' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setStatusFilter('REVIEWED')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                statusFilter === 'REVIEWED' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Reviewed
            </button>
            <button
              onClick={() => setStatusFilter('RESPONDED')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                statusFilter === 'RESPONDED' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Responded
            </button>
            <button
              onClick={() => setStatusFilter('CLOSED')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                statusFilter === 'CLOSED' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Closed
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                    <div className="text-sm text-gray-500">{inquiry.email}</div>
                    {inquiry.phone && <div className="text-sm text-gray-500">{inquiry.phone}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{inquiry.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {inquiry.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <select
                        value={inquiry.status}
                        onChange={(e) => updateInquiryStatus(inquiry.id, e.target.value as 'NEW' | 'REVIEWED' | 'RESPONDED' | 'CLOSED')}
                        disabled={updatingStatus === inquiry.id}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="NEW">New</option>
                        <option value="REVIEWED">Reviewed</option>
                        <option value="RESPONDED">Responded</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                      {updatingStatus === inquiry.id && (
                        <div className="flex items-center">
                          <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredInquiries.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No contact inquiries found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}