"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PerformanceMetrics {
  overview: {
    totalLeads: number;
    activeLeads: number;
    closedDeals: number;
    revenue: number;
    winRate: number;
    avgDealSize: number;
    conversionRate: number;
    avgSalesCycle: number;
  };
  monthly: Array<{
    month: string;
    leads: number;
    deals: number;
    revenue: number;
    activities: number;
  }>;
  pipeline: Record<string, {
    count: number;
    value: number;
    avgDuration: number;
  }>;
  activities: Array<{
    type: string;
    count: number;
    lastWeek: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  goals: {
    monthlyRevenue: {
      target: number;
      current: number;
      progress: number;
    };
    monthlyDeals: {
      target: number;
      current: number;
      progress: number;
    };
    quarterlyRevenue: {
      target: number;
      current: number;
      progress: number;
    };
  };
}

export default function SalesPerformance() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("30");

  useEffect(() => {
    if (user?.id) {
      loadPerformanceMetrics();
    }
  }, [user?.id, timeframe]);

  const loadPerformanceMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/sales/performance?salesManagerId=${user?.id}&timeframe=${timeframe}`);
      const data = await response.json();

      if (data.success) {
        setMetrics(data.data);
      } else {
        setError(data.error || "Failed to load performance metrics");
      }
    } catch (err) {
      setError("Failed to load performance metrics");
      console.error("Error loading performance metrics:", err);
    } finally {
      setLoading(false);
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

  const formatPercent = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7M17 17H7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10M7 7h10" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading performance data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
          <p className="text-gray-600">Track your sales performance and goals</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last 12 months</option>
          </select>
          <button 
            onClick={loadPerformanceMetrics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Leads</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.overview.activeLeads}</p>
              <p className="text-xs text-gray-500">of {metrics.overview.totalLeads} total</p>
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
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(metrics.overview.revenue)}</p>
              <p className="text-xs text-gray-500">{metrics.overview.closedDeals} deals closed</p>
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
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{formatPercent(metrics.overview.winRate)}</p>
              <p className="text-xs text-gray-500">{formatPercent(metrics.overview.conversionRate)} conversion</p>
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
              <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(metrics.overview.avgDealSize)}</p>
              <p className="text-xs text-gray-500">{metrics.overview.avgSalesCycle}d avg cycle</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Goals Progress</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900">Monthly Revenue</span>
                <span className="text-gray-600">
                  {formatCurrency(metrics.goals.monthlyRevenue.current)} / {formatCurrency(metrics.goals.monthlyRevenue.target)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(metrics.goals.monthlyRevenue.progress)}`}
                  style={{ width: `${Math.min(100, metrics.goals.monthlyRevenue.progress)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{formatPercent(metrics.goals.monthlyRevenue.progress)} completed</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900">Monthly Deals</span>
                <span className="text-gray-600">
                  {metrics.goals.monthlyDeals.current} / {metrics.goals.monthlyDeals.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(metrics.goals.monthlyDeals.progress)}`}
                  style={{ width: `${Math.min(100, metrics.goals.monthlyDeals.progress)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{formatPercent(metrics.goals.monthlyDeals.progress)} completed</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900">Quarterly Revenue</span>
                <span className="text-gray-600">
                  {formatCurrency(metrics.goals.quarterlyRevenue.current)} / {formatCurrency(metrics.goals.quarterlyRevenue.target)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(metrics.goals.quarterlyRevenue.progress)}`}
                  style={{ width: `${Math.min(100, metrics.goals.quarterlyRevenue.progress)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{formatPercent(metrics.goals.quarterlyRevenue.progress)} completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Value by Stage */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pipeline by Stage</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(metrics.pipeline).map(([stage, data]) => (
                <div key={stage} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900">
                        {stage.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="text-gray-600">{data.count} deals</span>
                    </div>
                    <div className="text-sm text-green-600 font-semibold">
                      {formatCurrency(data.value)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Avg: {data.avgDuration}d duration
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Activity Summary</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {metrics.activities.map((activity) => (
                <div key={activity.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium text-gray-900">
                      {activity.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    {getTrendIcon(activity.trend)}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{activity.count}</div>
                    <div className="text-xs text-gray-500">
                      {activity.lastWeek} last week
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Monthly Performance</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-sm font-medium text-gray-600 pb-2">Month</th>
                  <th className="text-right text-sm font-medium text-gray-600 pb-2">Leads</th>
                  <th className="text-right text-sm font-medium text-gray-600 pb-2">Deals</th>
                  <th className="text-right text-sm font-medium text-gray-600 pb-2">Revenue</th>
                  <th className="text-right text-sm font-medium text-gray-600 pb-2">Activities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.monthly.map((month) => (
                  <tr key={month.month}>
                    <td className="py-3 text-sm font-medium text-gray-900">{month.month}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">{month.leads}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">{month.deals}</td>
                    <td className="py-3 text-sm text-green-600 text-right font-semibold">
                      {formatCurrency(month.revenue)}
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-right">{month.activities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}