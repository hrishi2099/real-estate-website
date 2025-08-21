"use client";

import { useState, useEffect } from "react";

interface UnassignedLead {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    joinDate: string;
  };
  leadScore: {
    score: number;
    grade: string;
    lastActivity?: Date;
    seriousBuyerIndicator: boolean;
    budgetEstimate?: number;
    lastCalculated: Date;
  };
  hasActiveAssignments: boolean;
}

interface SalesManager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  territory?: string;
  commission?: number;
  _count: {
    assignedLeads: number;
  };
}

interface DistributionStats {
  statusStats: Record<string, number>;
  priorityStats: Record<string, number>;
  salesManagerWorkload: Array<{
    salesManager: {
      id: string;
      name: string;
      email: string;
      territory?: string;
    };
    activeAssignments: number;
  }>;
}

type DistributionRule = 'round_robin' | 'load_balanced' | 'score_based' | 'manual';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export default function LeadDistribution() {
  const [unassignedLeads, setUnassignedLeads] = useState<UnassignedLead[]>([]);
  const [salesManagers, setSalesManagers] = useState<SalesManager[]>([]);
  const [stats, setStats] = useState<DistributionStats | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedSalesManagers, setSelectedSalesManagers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Distribution settings
  const [distributionRule, setDistributionRule] = useState<DistributionRule>('load_balanced');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [notes, setNotes] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load unassigned leads
      const leadsParams = new URLSearchParams();
      if (gradeFilter !== 'all') {
        leadsParams.append('grade', gradeFilter);
      }
      leadsParams.append('limit', '100');

      const [leadsResponse, salesManagersResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/leads/unassigned?${leadsParams}`),
        fetch('/api/admin/sales-managers'),
        fetch('/api/admin/lead-assignments/bulk'),
      ]);

      const leadsData = await leadsResponse.json();
      const salesManagersData = await salesManagersResponse.json();
      const statsData = await statsResponse.json();

      if (leadsData.success) {
        setUnassignedLeads(leadsData.data || []);
      }

      if (salesManagersData.success) {
        setSalesManagers(salesManagersData.data || []);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (!leadsData.success || !salesManagersData.success || !statsData.success) {
        setError('Failed to load some data');
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [gradeFilter]);

  const handleDistributeLeads = async () => {
    if (distributionRule === 'manual' && selectedLeads.length === 0) {
      setError('Please select leads to distribute');
      return;
    }

    if (selectedSalesManagers.length === 0) {
      setError('Please select at least one sales manager');
      return;
    }

    if (!confirm(`Distribute ${distributionRule === 'manual' ? selectedLeads.length : 'all available'} leads using ${distributionRule} method?`)) {
      return;
    }

    try {
      setDistributing(true);
      setError(null);
      setSuccess(null);

      const requestBody = {
        rule: {
          type: distributionRule,
          salesManagerIds: selectedSalesManagers,
          leadIds: distributionRule === 'manual' ? selectedLeads : undefined,
        },
        priority,
        notes: notes || undefined,
        expectedCloseDate: expectedCloseDate || undefined,
      };
      
      console.log('Lead distribution request:', requestBody);

      const response = await fetch('/api/admin/leads/distribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Lead distribution response status:', response.status);
      const data = await response.json();
      console.log('Lead distribution response:', data);

      if (data.success) {
        setSuccess(data.message);
        setSelectedLeads([]);
        setNotes('');
        setExpectedCloseDate('');
        await loadData(); // Reload data
      } else {
        setError(data.error || 'Failed to distribute leads');
      }
    } catch (err) {
      setError('Failed to distribute leads');
      console.error('Error distributing leads:', err);
    } finally {
      setDistributing(false);
    }
  };

  const handleSelectAllLeads = () => {
    if (selectedLeads.length === unassignedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(unassignedLeads.map(lead => lead.user.id));
    }
  };

  const handleSelectAllSalesManagers = () => {
    if (selectedSalesManagers.length === salesManagers.length) {
      setSelectedSalesManagers([]);
    } else {
      setSelectedSalesManagers(salesManagers.map(sm => sm.id));
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
          <h1 className="text-2xl font-bold text-gray-900">Lead Distribution</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading distribution data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Distribution</h1>
          <p className="text-gray-600">Distribute leads to sales managers efficiently</p>
        </div>
        <button 
          onClick={loadData}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
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

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Assignment Status</h3>
            <div className="space-y-2">
              {Object.entries(stats.statusStats).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="text-sm text-gray-600 capitalize">{status.toLowerCase()}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Priority Distribution</h3>
            <div className="space-y-2">
              {Object.entries(stats.priorityStats).map(([priority, count]) => (
                <div key={priority} className="flex justify-between">
                  <span className="text-sm text-gray-600 capitalize">{priority.toLowerCase()}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Sales Manager Workload</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {stats.salesManagerWorkload.map((item) => (
                <div key={item.salesManager.id} className="flex justify-between">
                  <span className="text-sm text-gray-600 truncate">{item.salesManager.name}</span>
                  <span className="text-sm font-medium">{item.activeAssignments}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Distribution Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Distribution Rule</label>
            <select
              value={distributionRule}
              onChange={(e) => setDistributionRule(e.target.value as DistributionRule)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="load_balanced">Load Balanced</option>
              <option value="round_robin">Round Robin</option>
              <option value="score_based">Score Based</option>
              <option value="manual">Manual Selection</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Close Date</label>
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Filter</label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Grades</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="HOT">Hot</option>
              <option value="WARM">Warm</option>
              <option value="COLD">Cold</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes for the assignment..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDistributeLeads}
            disabled={distributing || selectedSalesManagers.length === 0}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {distributing ? 'Distributing...' : `Distribute Leads (${distributionRule === 'manual' ? selectedLeads.length : unassignedLeads.length})`}
          </button>
        </div>
      </div>

      {/* Selection Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Managers Selection */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Sales Managers ({selectedSalesManagers.length}/{salesManagers.length} selected)
            </h3>
            <button
              onClick={handleSelectAllSalesManagers}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {selectedSalesManagers.length === salesManagers.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {salesManagers.map((manager) => (
              <div
                key={manager.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedSalesManagers.includes(manager.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (selectedSalesManagers.includes(manager.id)) {
                    setSelectedSalesManagers(selectedSalesManagers.filter(id => id !== manager.id));
                  } else {
                    setSelectedSalesManagers([...selectedSalesManagers, manager.id]);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{manager.name}</div>
                    <div className="text-sm text-gray-500">{manager.email}</div>
                    {manager.territory && (
                      <div className="text-xs text-gray-400">Territory: {manager.territory}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {manager._count.assignedLeads} leads
                    </div>
                    {manager.commission && (
                      <div className="text-xs text-gray-500">{manager.commission}% commission</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {salesManagers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No active sales managers found.</p>
            </div>
          )}
        </div>

        {/* Unassigned Leads */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Unassigned Leads ({selectedLeads.length}/{unassignedLeads.length} selected)
            </h3>
            <div className="flex items-center space-x-2">
              {distributionRule === 'manual' && (
                <button
                  onClick={handleSelectAllLeads}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {selectedLeads.length === unassignedLeads.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {unassignedLeads.map((lead) => (
              <div
                key={lead.user.id}
                className={`p-3 border rounded-lg transition-colors ${
                  distributionRule === 'manual' ? 'cursor-pointer' : ''
                } ${
                  distributionRule === 'manual' && selectedLeads.includes(lead.user.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (distributionRule === 'manual') {
                    if (selectedLeads.includes(lead.user.id)) {
                      setSelectedLeads(selectedLeads.filter(id => id !== lead.user.id));
                    } else {
                      setSelectedLeads([...selectedLeads, lead.user.id]);
                    }
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{lead.user.name}</div>
                    <div className="text-sm text-gray-500">{lead.user.email}</div>
                    {lead.user.phone && (
                      <div className="text-xs text-gray-400">{lead.user.phone}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-bold text-gray-900">{lead.leadScore.score}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(lead.leadScore.grade)}`}>
                        {lead.leadScore.grade}
                      </span>
                    </div>
                    {lead.leadScore.seriousBuyerIndicator && (
                      <div className="text-xs text-green-600 font-medium">Serious Buyer</div>
                    )}
                    {lead.leadScore.budgetEstimate && (
                      <div className="text-xs text-gray-500">
                        Budget: ${lead.leadScore.budgetEstimate.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {unassignedLeads.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No unassigned leads found for the selected criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}