"use client";

import { useState, useEffect } from "react";

interface PipelineStage {
  id: string;
  stage: string;
  enteredAt: string;
  exitedAt?: string;
  durationHours?: number;
  probability?: number;
  estimatedValue?: number;
  nextAction?: string;
  nextActionDate?: string;
  notes?: string;
  lead: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    leadScore?: {
      score: number;
      grade: string;
    };
  };
  salesManager: {
    id: string;
    name: string;
    email: string;
    territory?: string;
  };
  activities: Array<{
    id: string;
    activityType: string;
    description: string;
    createdAt: string;
  }>;
}

interface PipelineData {
  stages: PipelineStage[];
  statistics: {
    dealsByStage: Record<string, {
      count: number;
      avgDuration: number;
      avgProbability: number;
      avgValue: number;
    }>;
    conversionRates: Record<string, number>;
    pipelineVelocityDays: number;
    revenue: {
      won: number;
      wonCount: number;
      pipeline: number;
      avgDealSize: number;
    };
  };
}

export default function PipelineDashboard() {
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [salesManagers, setSalesManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedManager, setSelectedManager] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<string>("30");
  const [viewMode, setViewMode] = useState<'overview' | 'kanban' | 'list'>('overview');

  const stageLabels: Record<string, string> = {
    NEW_LEAD: "New Lead",
    CONTACTED: "Contacted",
    QUALIFIED: "Qualified", 
    PROPOSAL_SENT: "Proposal Sent",
    NEGOTIATION: "Negotiation",
    PROPERTY_VIEWING: "Property Viewing",
    APPLICATION: "Application",
    CLOSING: "Closing",
    WON: "Won",
    LOST: "Lost",
    ON_HOLD: "On Hold",
  };

  const stageColors: Record<string, string> = {
    NEW_LEAD: "bg-gray-100 text-gray-800",
    CONTACTED: "bg-blue-100 text-blue-800",
    QUALIFIED: "bg-indigo-100 text-indigo-800",
    PROPOSAL_SENT: "bg-purple-100 text-purple-800",
    NEGOTIATION: "bg-yellow-100 text-yellow-800",
    PROPERTY_VIEWING: "bg-orange-100 text-orange-800",
    APPLICATION: "bg-teal-100 text-teal-800",
    CLOSING: "bg-cyan-100 text-cyan-800",
    WON: "bg-green-100 text-green-800",
    LOST: "bg-red-100 text-red-800",
    ON_HOLD: "bg-gray-100 text-gray-600",
  };

  useEffect(() => {
    loadData();
  }, [selectedManager, selectedStage, timeframe]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedManager !== "all") params.append("salesManagerId", selectedManager);
      if (selectedStage !== "all") params.append("stage", selectedStage);
      params.append("timeframe", timeframe);

      const [pipelineResponse, managersResponse] = await Promise.all([
        fetch(`/api/admin/pipeline?${params}`),
        fetch("/api/admin/sales-managers"),
      ]);

      const pipelineData = await pipelineResponse.json();
      const managersData = await managersResponse.json();

      if (pipelineData.success) {
        setPipelineData(pipelineData.data);
      } else {
        setError(pipelineData.error || "Failed to load pipeline data");
      }

      if (managersData.success) {
        setSalesManagers(managersData.data || []);
      }

    } catch (err) {
      setError("Failed to load data");
      console.error("Error loading pipeline data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderOverviewCards = () => {
    if (!pipelineData) return null;

    const { statistics } = pipelineData;
    const totalDeals = Object.values(statistics.dealsByStage)
      .reduce((sum, stage) => sum + stage.count, 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Deals</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDeals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(statistics.revenue.pipeline)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Won Deals</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(statistics.revenue.won)}
              </p>
              <p className="text-xs text-gray-500">
                {statistics.revenue.wonCount} deals
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Cycle Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.pipelineVelocityDays}
              </p>
              <p className="text-xs text-gray-500">days</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStageDistribution = () => {
    if (!pipelineData) return null;

    const { dealsByStage } = pipelineData.statistics;
    const stageEntries = Object.entries(dealsByStage).sort((a, b) => b[1].count - a[1].count);

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Stage Distribution</h3>
        <div className="space-y-4">
          {stageEntries.map(([stage, data]) => (
            <div key={stage} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stageColors[stage] || 'bg-gray-100 text-gray-800'}`}>
                  {stageLabels[stage] || stage}
                </span>
                <span className="ml-3 text-sm text-gray-600">
                  {data.count} deals
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{data.avgProbability}% avg</span>
                <span>{formatCurrency(data.avgValue)} avg</span>
                <span>{data.avgDuration}h avg</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderKanbanView = () => {
    if (!pipelineData) return null;

    // Group stages by current stage
    const stageGroups = pipelineData.stages
      .filter(stage => !stage.exitedAt) // Only active stages
      .reduce((acc, stage) => {
        if (!acc[stage.stage]) {
          acc[stage.stage] = [];
        }
        acc[stage.stage].push(stage);
        return acc;
      }, {} as Record<string, PipelineStage[]>);

    const allStages = [
      'NEW_LEAD', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT',
      'NEGOTIATION', 'PROPERTY_VIEWING', 'APPLICATION', 'CLOSING'
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Pipeline Kanban</h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-x-auto">
          {allStages.map(stage => (
            <div key={stage} className="min-w-80">
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-sm font-medium px-2 py-1 rounded ${stageColors[stage] || 'bg-gray-100 text-gray-800'}`}>
                  {stageLabels[stage] || stage}
                </h4>
                <span className="text-xs text-gray-500">
                  {(stageGroups[stage] || []).length}
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(stageGroups[stage] || []).map(stageItem => (
                  <div key={stageItem.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-900">
                        {stageItem.lead.name}
                      </h5>
                      {stageItem.probability && (
                        <span className="text-xs text-gray-500">
                          {stageItem.probability}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {stageItem.lead.email}
                    </p>
                    {stageItem.estimatedValue && (
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(stageItem.estimatedValue)}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {stageItem.salesManager.name}
                      </span>
                      {stageItem.nextActionDate && (
                        <span className="text-xs text-orange-600">
                          Due: {formatDate(stageItem.nextActionDate)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading pipeline...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600">Track deals through your sales process</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sales Manager</label>
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sales Managers</option>
              {salesManagers.map(manager => (
                <option key={manager.id} value={manager.id}>{manager.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stages</option>
              {Object.entries(stageLabels).map(([stage, label]) => (
                <option key={stage} value={stage}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedManager("all");
                setSelectedStage("all");
                setTimeframe("30");
              }}
              className="w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <>
          {renderOverviewCards()}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderStageDistribution()}
            {/* Conversion Rates Chart could go here */}
          </div>
        </>
      )}

      {viewMode === 'kanban' && renderKanbanView()}
    </div>
  );
}