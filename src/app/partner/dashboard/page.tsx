"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface PartnerStats {
  totalReferrals: number;
  successfulDeals: number;
  totalRevenue: number;
  pendingReferrals: number;
  activeReferrals: number;
  completedReferrals: number;
  performanceTier: string;
  baseCommission: number;
}

interface Referral {
  id: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  propertyInterest?: string;
  budgetRange?: string;
  status: string;
  commissionEarned?: number;
  createdAt: string;
}

export default function PartnerDashboard() {
  const { isChannelPartner, isAuthenticated, isLoading, isHydrated, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [recentReferrals, setRecentReferrals] = useState<Referral[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (isHydrated && !isLoading) {
      if (!isAuthenticated) {
        router.push("/partner/login");
      } else if (!isChannelPartner) {
        router.push("/dashboard");
      } else {
        fetchDashboardData();
      }
    }
  }, [isChannelPartner, isAuthenticated, isLoading, isHydrated, router]);

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      const [statsRes, referralsRes] = await Promise.all([
        fetch('/api/partner/stats', { credentials: 'include' }),
        fetch('/api/partner/referrals?limit=5', { credentials: 'include' })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (referralsRes.ok) {
        const referralsData = await referralsRes.json();
        setRecentReferrals(referralsData.referrals || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isChannelPartner) {
    return null;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-blue-100 text-blue-800",
      CONTACTED: "bg-yellow-100 text-yellow-800",
      QUALIFIED: "bg-purple-100 text-purple-800",
      SITE_VISIT_SCHEDULED: "bg-indigo-100 text-indigo-800",
      SITE_VISIT_COMPLETED: "bg-cyan-100 text-cyan-800",
      NEGOTIATION: "bg-orange-100 text-orange-800",
      DEAL_WON: "bg-green-100 text-green-800",
      DEAL_LOST: "bg-red-100 text-red-800",
      ON_HOLD: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getTierBadge = (tier: string) => {
    const badges: Record<string, { color: string; icon: string }> = {
      BRONZE: { color: "bg-amber-700 text-white", icon: "🥉" },
      SILVER: { color: "bg-gray-400 text-white", icon: "🥈" },
      GOLD: { color: "bg-yellow-500 text-white", icon: "🥇" },
      PLATINUM: { color: "bg-slate-600 text-white", icon: "💎" },
      DIAMOND: { color: "bg-cyan-500 text-white", icon: "💠" },
    };
    return badges[tier] || badges.BRONZE;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Partner Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">Welcome back, {user?.name || 'Partner'}!</p>
            </div>
            {stats && (
              <div className={`px-4 py-2 rounded-xl font-semibold ${getTierBadge(stats.performanceTier).color}`}>
                {getTierBadge(stats.performanceTier).icon} {stats.performanceTier} Tier
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {dataLoading ? "..." : stats?.totalReferrals || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful Deals</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {dataLoading ? "..." : stats?.successfulDeals || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {dataLoading ? "..." : `₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Rate</p>
                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {dataLoading ? "..." : `${stats?.baseCommission || 0}%`}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/partner/referrals/new" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-lg font-semibold">Submit New Referral</h3>
                <p className="text-sm text-emerald-100 mt-1">Refer a potential client</p>
              </div>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </Link>

          <Link href="/partner/referrals" className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">View All Referrals</h3>
                <p className="text-sm text-gray-600 mt-1">Track your submissions</p>
              </div>
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </Link>

          <Link href="/partner/commissions" className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">Commission History</h3>
                <p className="text-sm text-gray-600 mt-1">View payment details</p>
              </div>
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Recent Referrals */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Referrals</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Interest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dataLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Loading referrals...
                    </td>
                  </tr>
                ) : recentReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No referrals yet. Submit your first referral to get started!
                    </td>
                  </tr>
                ) : (
                  recentReferrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{referral.leadName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{referral.leadEmail}</div>
                        <div className="text-sm text-gray-500">{referral.leadPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {referral.propertyInterest || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(referral.status)}`}>
                          {referral.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {referral.commissionEarned ? `₹${referral.commissionEarned.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
