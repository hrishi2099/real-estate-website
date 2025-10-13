"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Referral {
  id: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  propertyInterest?: string;
  budgetRange?: string;
  status: string;
  commissionEarned?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AllReferralsPage() {
  const { isChannelPartner, isAuthenticated, isLoading, isHydrated } = useAuth();
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
  });

  useEffect(() => {
    if (isHydrated && !isLoading) {
      if (!isAuthenticated) {
        router.push("/partner/login");
      } else if (!isChannelPartner) {
        router.push("/dashboard");
      } else {
        fetchReferrals();
      }
    }
  }, [isChannelPartner, isAuthenticated, isLoading, isHydrated, router, filter, pagination.offset]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });

      if (filter !== "all") {
        params.append("status", filter);
      }

      const response = await fetch(`/api/partner/referrals?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setReferrals(data.referrals || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
    } finally {
      setLoading(false);
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
      NEW: "bg-blue-100 text-blue-800 border-blue-200",
      CONTACTED: "bg-yellow-100 text-yellow-800 border-yellow-200",
      QUALIFIED: "bg-purple-100 text-purple-800 border-purple-200",
      SITE_VISIT_SCHEDULED: "bg-indigo-100 text-indigo-800 border-indigo-200",
      SITE_VISIT_COMPLETED: "bg-cyan-100 text-cyan-800 border-cyan-200",
      NEGOTIATION: "bg-orange-100 text-orange-800 border-orange-200",
      DEAL_WON: "bg-green-100 text-green-800 border-green-200",
      DEAL_LOST: "bg-red-100 text-red-800 border-red-200",
      ON_HOLD: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const filteredReferrals = referrals.filter(referral =>
    searchTerm === "" ||
    referral.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.leadEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.leadPhone.includes(searchTerm)
  );

  const statusCounts = {
    all: referrals.length,
    NEW: referrals.filter(r => r.status === 'NEW').length,
    active: referrals.filter(r => !['DEAL_WON', 'DEAL_LOST', 'NEW'].includes(r.status)).length,
    DEAL_WON: referrals.filter(r => r.status === 'DEAL_WON').length,
    DEAL_LOST: referrals.filter(r => r.status === 'DEAL_LOST').length,
  };

  const handlePageChange = (newOffset: number) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                All Referrals
              </h1>
              <p className="mt-1 text-sm text-gray-600">Track and manage all your referrals</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/partner/dashboard"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                ← Dashboard
              </Link>
              <Link
                href="/partner/referrals/new"
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-medium shadow-lg"
              >
                + New Referral
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-200">
            <p className="text-sm text-blue-600">New</p>
            <p className="text-2xl font-bold text-blue-900">{statusCounts.NEW}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 shadow-sm border border-purple-200">
            <p className="text-sm text-purple-600">In Progress</p>
            <p className="text-2xl font-bold text-purple-900">{statusCounts.active}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-200">
            <p className="text-sm text-green-600">Won</p>
            <p className="text-2xl font-bold text-green-900">{statusCounts.DEAL_WON}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 shadow-sm border border-red-200">
            <p className="text-sm text-red-600">Lost</p>
            <p className="text-2xl font-bold text-red-900">{statusCounts.DEAL_LOST}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "all"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("NEW")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "NEW"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                New
              </button>
              <button
                onClick={() => setFilter("QUALIFIED")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "QUALIFIED"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Qualified
              </button>
              <button
                onClick={() => setFilter("DEAL_WON")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "DEAL_WON"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Won
              </button>
            </div>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading referrals...</p>
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 text-lg mb-4">No referrals found</p>
              <Link
                href="/partner/referrals/new"
                className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-medium shadow-lg"
              >
                Submit Your First Referral
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReferrals.map((referral) => (
                      <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {referral.leadName.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{referral.leadName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{referral.leadEmail}</div>
                          <div className="text-sm text-gray-500">{referral.leadPhone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {referral.propertyInterest || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {referral.budgetRange || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(referral.status)}`}>
                            {referral.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                          {referral.commissionEarned ? (
                            <span className="text-green-600">₹{referral.commissionEarned.toLocaleString()}</span>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} referrals
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange((pageNum - 1) * pagination.limit)}
                              className={`px-4 py-2 rounded-lg font-medium ${
                                currentPage === pageNum
                                  ? "bg-emerald-600 text-white"
                                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => handlePageChange(Math.min((totalPages - 1) * pagination.limit, pagination.offset + pagination.limit))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
