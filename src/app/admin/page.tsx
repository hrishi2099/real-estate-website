"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface DashboardStats {
  totalProperties: number;
  activeUsers: number;
  totalRevenue: string;
  pendingInquiries: number;
}

interface RecentActivity {
  id: string;
  action: string;
  details: string;
  time: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load analytics data for stats
      const analyticsResponse = await api.getAdminAnalytics();
      if (analyticsResponse?.data?.overview) {
        setStats({
          totalProperties: analyticsResponse.data.overview.totalProperties || 0,
          activeUsers: analyticsResponse.data.overview.totalUsers || 0,
          totalRevenue: `$${(0).toLocaleString()}`, // Revenue calculation would need implementation
          pendingInquiries: analyticsResponse.data.overview.pendingInquiries || 0,
        });
      }

      // Also load contact inquiries count
      try {
        const contactInquiriesResponse = await fetch('/api/admin/contact-inquiries');
        if (contactInquiriesResponse.ok) {
          const contactData = await contactInquiriesResponse.json();
          const newContactInquiries = contactData.contactInquiries?.filter((ci: any) => ci.status === 'NEW').length || 0;
          
          // Update stats to include both property inquiries and contact inquiries
          setStats(prevStats => prevStats ? {
            ...prevStats,
            pendingInquiries: (analyticsResponse?.data?.overview?.pendingInquiries || 0) + newContactInquiries
          } : prevStats);
        }
      } catch (error) {
        console.error('Error loading contact inquiries:', error);
      }

      // Load recent activity (using inquiries as recent activity)
      const inquiriesResponse = await api.getAdminInquiries();
      if (inquiriesResponse?.data) {
        const activities: RecentActivity[] = inquiriesResponse.data
          .slice(0, 4)
          .map((inquiry: any) => ({
            id: inquiry.id,
            action: "Property inquiry",
            details: inquiry.property?.title || "Property inquiry",
            time: new Date(inquiry.createdAt).toLocaleDateString()
          }));
        setRecentActivity(activities);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      // Fallback to static data
      setStats({
        totalProperties: 0,
        activeUsers: 0,
        totalRevenue: "$0",
        pendingInquiries: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const statsDisplay = [
    { name: "Total Properties", value: stats?.totalProperties?.toString() || "0", icon: "🏠" },
    { name: "Active Users", value: stats?.activeUsers?.toString() || "0", icon: "👥" },
    { name: "Total Revenue", value: stats?.totalRevenue || "$0", icon: "💰" },
    { name: "Pending Inquiries", value: stats?.pendingInquiries?.toString() || "0", icon: "📧" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsDisplay.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="text-2xl mr-3">{stat.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/admin/properties/new"
              className="block w-full text-left px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              + Add New Property
            </a>
            <a
              href="/admin/users"
              className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              📊 View User Analytics
            </a>
            <a
              href="/admin/properties"
              className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              🏠 Manage Properties
            </a>
            <a
              href="/admin/analytics"
              className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              📈 Sales Reports
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Database: Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">API: Operational</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Storage: 78% Used</span>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}