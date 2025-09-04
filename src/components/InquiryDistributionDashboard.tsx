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
  salesManagerId?: string;
  assignedAt?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
  responseDeadline?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  salesManager?: {
    id: string;
    name: string;
    email: string;
    territory?: string;
  };
}

interface SalesManager {
  id: string;
  name: string;
  email: string;
  territory?: string;
  _count?: {
    assignedContactInquiries: number;
  };
}

interface DistributionStats {
  totalInquiries: number;
  unassignedInquiries: number;
  assignedInquiries: number;
  newInquiries: number;
  respondedInquiries: number;
  closedInquiries: number;
  managerWorkloads: Array<{
    managerId: string;
    managerName: string;
    territory?: string;
    assignedCount: number;
    newCount: number;
    respondedCount: number;
  }>;
}

export default function InquiryDistributionDashboard() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [salesManagers, setSalesManagers] = useState<SalesManager[]>([]);
  const [stats, setStats] = useState<DistributionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInquiries, setSelectedInquiries] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'assigned'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [inquiriesResponse, managersResponse] = await Promise.all([
        fetch('/api/admin/contact-inquiries'),
        fetch('/api/admin/sales-managers')
      ]);

      if (!inquiriesResponse.ok || !managersResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const inquiriesData = await inquiriesResponse.json();
      const managersData = await managersResponse.json();

      setInquiries(inquiriesData.contactInquiries || []);
      setSalesManagers(managersData.data || []);
      
      // Calculate stats
      calculateStats(inquiriesData.contactInquiries || [], managersData.data || []);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (inquiriesData: ContactInquiry[], managersData: SalesManager[]) => {
    const totalInquiries = inquiriesData.length;
    const unassignedInquiries = inquiriesData.filter(i => !i.salesManagerId).length;
    const assignedInquiries = totalInquiries - unassignedInquiries;
    const newInquiries = inquiriesData.filter(i => i.status === 'NEW').length;
    const respondedInquiries = inquiriesData.filter(i => i.status === 'RESPONDED').length;
    const closedInquiries = inquiriesData.filter(i => i.status === 'CLOSED').length;

    const managerWorkloads = managersData.map(manager => {
      const managerInquiries = inquiriesData.filter(i => i.salesManagerId === manager.id);
      return {
        managerId: manager.id,
        managerName: manager.name,
        territory: manager.territory,
        assignedCount: managerInquiries.length,
        newCount: managerInquiries.filter(i => i.status === 'NEW').length,
        respondedCount: managerInquiries.filter(i => i.status === 'RESPONDED').length,
      };
    });

    setStats({
      totalInquiries,
      unassignedInquiries,
      assignedInquiries,
      newInquiries,
      respondedInquiries,
      closedInquiries,
      managerWorkloads
    });
  };

  const autoDistribute = async () => {
    try {
      setDistributing(true);
      const response = await fetch('/api/admin/contact-inquiries/assign', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to auto-distribute inquiries');
      }

      const data = await response.json();
      alert(`Successfully distributed ${data.distributedCount} inquiries to sales managers.`);
      await loadData();
    } catch (err) {
      console.error('Error auto-distributing inquiries:', err);
      alert('Failed to auto-distribute inquiries. Please try again.');
    } finally {
      setDistributing(false);
    }
  };

  const assignToSalesManager = async (inquiryIds: string[], salesManagerId: string) => {
    try {
      const response = await fetch('/api/admin/contact-inquiries/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inquiryIds,
          salesManagerId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to assign inquiries');
      }

      const data = await response.json();
      alert(`Successfully assigned ${data.updatedCount} inquiries.`);
      setSelectedInquiries([]);
      setShowAssignModal(false);
      await loadData();
    } catch (err) {
      console.error('Error assigning inquiries:', err);
      alert('Failed to assign inquiries. Please try again.');
    }
  };

  const handleSelectInquiry = (inquiryId: string) => {
    setSelectedInquiries(prev => 
      prev.includes(inquiryId) 
        ? prev.filter(id => id !== inquiryId)
        : [...prev, inquiryId]
    );
  };

  const handleSelectAll = () => {
    const filteredInquiries = getFilteredInquiries();
    if (selectedInquiries.length === filteredInquiries.length) {
      setSelectedInquiries([]);
    } else {
      setSelectedInquiries(filteredInquiries.map(inquiry => inquiry.id));
    }
  };

  const getFilteredInquiries = () => {
    switch (filter) {
      case 'unassigned':
        return inquiries.filter(i => !i.salesManagerId);
      case 'assigned':
        return inquiries.filter(i => i.salesManagerId);
      default:
        return inquiries;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-red-100 text-red-800';
      case 'REVIEWED': return 'bg-yellow-100 text-yellow-800';
      case 'RESPONDED': return 'bg-blue-100 text-blue-800';
      case 'CLOSED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'NORMAL': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading distribution dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button 
              onClick={loadData}
              className="mt-2 text-sm text-red-600 hover:text-red-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredInquiries = getFilteredInquiries();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Inquiry Distribution Dashboard</h2>
        <div className="flex gap-3">
          <button 
            onClick={loadData}
            disabled={loading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <button 
            onClick={autoDistribute}
            disabled={distributing}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {distributing ? 'Distributing...' : 'Auto Distribute'}
          </button>

          {selectedInquiries.length > 0 && (
            <button 
              onClick={() => setShowAssignModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Assign Selected ({selectedInquiries.length})
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.totalInquiries}</div>
            <div className="text-sm text-gray-600">Total Inquiries</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">{stats.unassignedInquiries}</div>
            <div className="text-sm text-gray-600">Unassigned</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.assignedInquiries}</div>
            <div className="text-sm text-gray-600">Assigned</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.respondedInquiries}</div>
            <div className="text-sm text-gray-600">Responded</div>
          </div>
        </div>
      )}

      {/* Manager Workload */}
      {stats && stats.managerWorkloads.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Manager Workload</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.managerWorkloads.map((workload) => (
              <div key={workload.managerId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{workload.managerName}</h4>
                  <span className="text-sm text-gray-500">{workload.territory || 'No territory'}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Assigned:</span>
                    <span className="font-medium">{workload.assignedCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">New:</span>
                    <span className="font-medium text-red-600">{workload.newCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Responded:</span>
                    <span className="font-medium text-green-600">{workload.respondedCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inquiries Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Inquiries
            </button>
            <button
              onClick={() => setFilter('unassigned')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'unassigned' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unassigned
            </button>
            <button
              onClick={() => setFilter('assigned')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'assigned' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Assigned
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedInquiries.length === filteredInquiries.length && filteredInquiries.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Manager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedInquiries.includes(inquiry.id)}
                      onChange={() => handleSelectInquiry(inquiry.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    {inquiry.salesManager ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{inquiry.salesManager.name}</div>
                        <div className="text-sm text-gray-500">{inquiry.salesManager.territory || 'No territory'}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(inquiry.priority)}`}>
                      {inquiry.priority || 'NORMAL'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredInquiries.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No inquiries found for the selected filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Assign to Sales Manager</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Assigning {selectedInquiries.length} inquiries to a sales manager.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Sales Manager
                </label>
                <select
                  id="salesManagerSelect"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue=""
                >
                  <option value="">Select a sales manager</option>
                  {salesManagers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} {manager.territory ? `(${manager.territory})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const selectElement = document.getElementById('salesManagerSelect') as HTMLSelectElement;
                    const salesManagerId = selectElement.value;
                    if (salesManagerId) {
                      assignToSalesManager(selectedInquiries, salesManagerId);
                    } else {
                      alert('Please select a sales manager.');
                    }
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
