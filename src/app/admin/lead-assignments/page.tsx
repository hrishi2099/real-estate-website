"use client";

import { useState, useEffect } from "react";

interface LeadAssignment {
  id: string;
  leadId: string;
  salesManagerId: string;
  assignedAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  notes?: string;
  expectedCloseDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  lead: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    leadScore?: {
      score: number;
      grade: string;
      seriousBuyerIndicator: boolean;
      budgetEstimate?: number;
    };
  };
  salesManager: {
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
}

export default function LeadAssignmentsManagement() {
  const [assignments, setAssignments] = useState<LeadAssignment[]>([]);
  const [salesManagers, setSalesManagers] = useState<SalesManager[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [salesManagerFilter, setSalesManagerFilter] = useState<string>('all');
  
  // Bulk operation settings
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'update_status' | 'update_priority' | 'reassign' | 'delete'>('update_status');
  const [bulkData, setBulkData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter, salesManagerFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (salesManagerFilter !== 'all') params.append('salesManagerId', salesManagerFilter);

      const [assignmentsResponse, salesManagersResponse] = await Promise.all([
        fetch(`/api/admin/lead-assignments?${params}`),
        fetch('/api/admin/sales-managers'),
      ]);

      const assignmentsData = await assignmentsResponse.json();
      const salesManagersData = await salesManagersResponse.json();

      if (assignmentsData.success) {
        let filteredAssignments = assignmentsData.data || [];
        
        // Apply priority filter on client side
        if (priorityFilter !== 'all') {
          filteredAssignments = filteredAssignments.filter(
            (assignment: LeadAssignment) => assignment.priority === priorityFilter
          );
        }
        
        setAssignments(filteredAssignments);
      } else {
        setError(assignmentsData.error || 'Failed to load assignments');
      }

      if (salesManagersData.success) {
        setSalesManagers(salesManagersData.data || []);
      }

    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkOperation = async () => {
    if (selectedAssignments.length === 0) {
      setError('Please select assignments to modify');
      return;
    }

    if (!bulkData.value && bulkAction !== 'delete') {
      setError('Please provide a value for the bulk operation');
      return;
    }

    if (!confirm(`Perform ${bulkAction} on ${selectedAssignments.length} assignments?`)) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      let requestData: any = {
        action: bulkAction,
        assignmentIds: selectedAssignments,
      };

      switch (bulkAction) {
        case 'update_status':
          requestData.data = { status: bulkData.value };
          break;
        case 'update_priority':
          requestData.data = { priority: bulkData.value };
          break;
        case 'reassign':
          requestData.data = {
            salesManagerId: bulkData.value,
            notes: bulkData.notes || 'Bulk reassignment',
            priority: bulkData.priority || 'MEDIUM',
            expectedCloseDate: bulkData.expectedCloseDate || null,
          };
          break;
        case 'delete':
          // No additional data needed
          break;
      }

      const response = await fetch('/api/admin/lead-assignments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setSelectedAssignments([]);
        setBulkData({});
        setShowBulkModal(false);
        await loadData();
      } else {
        setError(data.error || 'Bulk operation failed');
      }
    } catch (err) {
      setError('Failed to perform bulk operation');
      console.error('Error in bulk operation:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedAssignments.length === assignments.length) {
      setSelectedAssignments([]);
    } else {
      setSelectedAssignments(assignments.map(assignment => assignment.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'QUALIFIED': return 'bg-purple-100 text-purple-800';
      case 'HOT': return 'bg-red-100 text-red-800';
      case 'WARM': return 'bg-orange-100 text-orange-800';
      case 'COLD': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Lead Assignments</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading assignments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Assignments</h1>
          <p className="text-gray-600">Manage and track lead assignments to sales managers</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={loadData}
            disabled={loading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center"
          >
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          {selectedAssignments.length > 0 && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Bulk Actions ({selectedAssignments.length})
            </button>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-100"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
            <button 
              onClick={() => setSuccess(null)}
              className="ml-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg p-1.5 hover:bg-green-100"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sales Manager</label>
            <select
              value={salesManagerFilter}
              onChange={(e) => setSalesManagerFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Managers</option>
              {salesManagers.map(manager => (
                <option key={manager.id} value={manager.id}>{manager.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setSalesManagerFilter('all');
              }}
              className="w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Assignments ({assignments.length})
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedAssignments.length === assignments.length && assignments.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">Select All</label>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Close
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedAssignments.includes(assignment.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssignments([...selectedAssignments, assignment.id]);
                        } else {
                          setSelectedAssignments(selectedAssignments.filter(id => id !== assignment.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{assignment.lead.name}</div>
                      <div className="text-sm text-gray-500">{assignment.lead.email}</div>
                      {assignment.lead.phone && (
                        <div className="text-xs text-gray-400">{assignment.lead.phone}</div>
                      )}
                      {assignment.lead.leadScore && (
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs font-bold text-gray-900">
                            {assignment.lead.leadScore.score}
                          </span>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getGradeColor(assignment.lead.leadScore.grade)}`}>
                            {assignment.lead.leadScore.grade}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{assignment.salesManager.name}</div>
                      <div className="text-sm text-gray-500">{assignment.salesManager.email}</div>
                      {assignment.salesManager.territory && (
                        <div className="text-xs text-gray-400">{assignment.salesManager.territory}</div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                      <br />
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(assignment.assignedAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.expectedCloseDate 
                      ? new Date(assignment.expectedCloseDate).toLocaleDateString()
                      : 'Not set'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No assignments found for the selected criteria.</p>
          </div>
        )}
      </div>

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Bulk Actions ({selectedAssignments.length} selected)
                </h3>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                  <select
                    value={bulkAction}
                    onChange={(e) => {
                      setBulkAction(e.target.value as any);
                      setBulkData({});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="update_status">Update Status</option>
                    <option value="update_priority">Update Priority</option>
                    <option value="reassign">Reassign</option>
                    <option value="delete">Delete</option>
                  </select>
                </div>

                {bulkAction === 'update_status' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                    <select
                      value={bulkData.value || ''}
                      onChange={(e) => setBulkData({ ...bulkData, value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="ON_HOLD">On Hold</option>
                    </select>
                  </div>
                )}

                {bulkAction === 'update_priority' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Priority</label>
                    <select
                      value={bulkData.value || ''}
                      onChange={(e) => setBulkData({ ...bulkData, value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Priority</option>
                      <option value="URGENT">Urgent</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                )}

                {bulkAction === 'reassign' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Sales Manager</label>
                      <select
                        value={bulkData.value || ''}
                        onChange={(e) => setBulkData({ ...bulkData, value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Sales Manager</option>
                        {salesManagers.map(manager => (
                          <option key={manager.id} value={manager.id}>{manager.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={bulkData.priority || 'MEDIUM'}
                        onChange={(e) => setBulkData({ ...bulkData, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="URGENT">Urgent</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={bulkData.notes || ''}
                        onChange={(e) => setBulkData({ ...bulkData, notes: e.target.value })}
                        placeholder="Reason for reassignment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                  </>
                )}

                {bulkAction === 'delete' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">
                      This will permanently delete {selectedAssignments.length} assignments. This action cannot be undone.
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkOperation}
                    disabled={processing}
                    className={`flex-1 px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                      bulkAction === 'delete' ? 'bg-red-600' : 'bg-blue-600'
                    }`}
                  >
                    {processing ? 'Processing...' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}