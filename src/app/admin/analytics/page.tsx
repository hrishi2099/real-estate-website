"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  inquiries: number;
  conversions: number;
  revenue: string;
  avgTimeOnSite: string;
  totalProperties: number;
  totalUsers: number;
  totalRevenue: number;
  totalInquiries: number;
}

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminAnalytics(`?timeframe=${timeframe}`);
      if (response?.data) {
        const data = response.data as AnalyticsData;
        setAnalyticsData({
          totalViews: data.totalViews || 0,
          uniqueVisitors: data.uniqueVisitors || 0,
          inquiries: data.totalInquiries || 0,
          conversions: data.conversions || 0,
          revenue: `₹${(data.totalRevenue || 0).toLocaleString()}`,
          avgTimeOnSite: data.avgTimeOnSite || "0m 0s",
          totalProperties: data.totalProperties || 0,
          totalUsers: data.totalUsers || 0,
          totalRevenue: data.totalRevenue || 0,
          totalInquiries: data.totalInquiries || 0,
        });
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
      // Fallback data
      setAnalyticsData({
        totalViews: 0,
        uniqueVisitors: 0,
        inquiries: 0,
        conversions: 0,
        revenue: "₹0",
        avgTimeOnSite: "0m 0s",
        totalProperties: 0,
        totalUsers: 0,
        totalRevenue: 0,
        totalInquiries: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const topProperties = [
    { id: 1, title: "Modern Downtown Apartment", views: 1250, inquiries: 45, price: "₹4,50,00,000" },
    { id: 2, title: "Luxury Villa with Pool", views: 980, inquiries: 38, price: "₹8,50,00,000" },
    { id: 3, title: "Cozy Family House", views: 750, inquiries: 22, price: "₹3,20,00,000" },
    { id: 4, title: "Penthouse Suite", views: 650, inquiries: 19, price: "₹12,00,00,000" },
    { id: 5, title: "Suburban Townhouse", views: 540, inquiries: 15, price: "₹3,80,00,000" }
  ];

  const monthlyData = [
    { month: "Jan", sales: 8, inquiries: 45, revenue: 2400000 },
    { month: "Feb", sales: 12, inquiries: 67, revenue: 3200000 },
    { month: "Mar", sales: 6, inquiries: 34, revenue: 1800000 },
    { month: "Apr", sales: 15, inquiries: 78, revenue: 4100000 },
    { month: "May", sales: 10, inquiries: 56, revenue: 2900000 },
    { month: "Jun", sales: 18, inquiries: 89, revenue: 5200000 }
  ];


  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={loadAnalytics}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm touch-manipulation"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
            disabled={loading}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      ) : analyticsData ? (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl sm:text-3xl mr-2 sm:mr-3">👁️</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{analyticsData.totalViews.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-green-600">+12% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl sm:text-3xl mr-2 sm:mr-3">👥</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Unique Visitors</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{analyticsData.uniqueVisitors.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-green-600">+8% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl sm:text-3xl mr-2 sm:mr-3">📧</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Inquiries</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{analyticsData.inquiries}</p>
              <p className="text-xs sm:text-sm text-green-600">+15% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl sm:text-3xl mr-2 sm:mr-3">✅</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{analyticsData.conversions}</p>
              <p className="text-xs sm:text-sm text-green-600">+22% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl sm:text-3xl mr-2 sm:mr-3">💰</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{analyticsData.revenue}</p>
              <p className="text-xs sm:text-sm text-green-600">+18% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl sm:text-3xl mr-2 sm:mr-3">⏱️</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Avg. Time on Site</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{analyticsData.avgTimeOnSite}</p>
              <p className="text-xs sm:text-sm text-green-600">+5% from last period</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Top Performing Properties</h3>
          <div className="space-y-3 sm:space-y-4">
            {topProperties.map((property, index) => (
              <div key={property.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{property.title}</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{property.price}</p>
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">{property.views} views</p>
                  <p className="text-xs sm:text-sm text-gray-500">{property.inquiries} inquiries</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Monthly Performance</h3>
          <div className="space-y-3 sm:space-y-4">
            {monthlyData.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <div className="text-xs sm:text-sm font-medium text-gray-900 w-8 sm:w-12 flex-shrink-0">{month.month}</div>
                <div className="flex-1 mx-2 sm:mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div 
                      className="bg-blue-600 h-1.5 sm:h-2 rounded-full" 
                      style={{ width: `${(month.sales / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">{month.sales} sales</p>
                  <p className="text-xs sm:text-sm text-gray-500">{month.inquiries} inquiries</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Traffic Sources</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-2 sm:p-0">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">45%</div>
            <div className="text-xs sm:text-sm text-gray-600">Direct Traffic</div>
          </div>
          <div className="text-center p-2 sm:p-0">
            <div className="text-lg sm:text-2xl font-bold text-green-600">28%</div>
            <div className="text-xs sm:text-sm text-gray-600">Search Engines</div>
          </div>
          <div className="text-center p-2 sm:p-0">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">18%</div>
            <div className="text-xs sm:text-sm text-gray-600">Social Media</div>
          </div>
          <div className="text-center p-2 sm:p-0">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">9%</div>
            <div className="text-xs sm:text-sm text-gray-600">Referrals</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Export Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <button className="px-3 sm:px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm touch-manipulation">
            <span className="hidden sm:inline">📊 Export Analytics Data</span>
            <span className="sm:hidden">📊 Analytics</span>
          </button>
          <button className="px-3 sm:px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm touch-manipulation">
            <span className="hidden sm:inline">📈 Sales Report</span>
            <span className="sm:hidden">📈 Sales</span>
          </button>
          <button className="px-3 sm:px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm touch-manipulation">
            <span className="hidden sm:inline">👥 User Activity Report</span>
            <span className="sm:hidden">👥 Users</span>
          </button>
        </div>
      </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Failed to load analytics data</p>
          <button
            onClick={loadAnalytics}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}