"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface Ad {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor?: string;
  textColor?: string;
  type: 'BANNER' | 'CARD' | 'FEATURED';
  isActive: boolean;
  displayOrder: number;
  startDate?: string;
  endDate?: string;
  clickCount: number;
  impressionCount: number;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdsManagement() {
  const { user, isAdmin, isLoading, isHydrated } = useAuth();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    type: '',
    active: ''
  });

  useEffect(() => {
    if (!isHydrated || isLoading) return;
    if (!user || !isAdmin) {
      router.push("/login");
      return;
    }
    fetchAds();
  }, [user, isAdmin, isLoading, isHydrated, router, filter]);

  const fetchAds = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.active) params.append('active', filter.active);

      const response = await fetch(`/api/admin/ads?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAds(data);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setError(`Failed to fetch ads: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        fetchAds();
      }
    } catch (error) {
      console.error("Error updating ad status:", error);
    }
  };

  const deleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAds();
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BANNER': return 'bg-blue-100 text-blue-800';
      case 'CARD': return 'bg-green-100 text-green-800';
      case 'FEATURED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="space-y-8">
        {/* Error Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 -mx-6 -mt-6 px-6 py-8 mb-8">
          <div className="text-white">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold">Error Loading Ads</h1>
            </div>
            <p className="text-red-100 text-lg">Something went wrong while loading the ads management page</p>
          </div>
        </div>

        {/* Error Content */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Application Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchAds();
              }}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 -mx-6 -mt-6 px-6 py-8 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse"></div>
            <div className="h-8 bg-white/20 rounded-lg w-64 animate-pulse"></div>
          </div>
          <div className="mt-4 h-4 bg-white/20 rounded-lg w-96 animate-pulse"></div>
        </div>

        {/* Loading Content */}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="mt-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading ads...</h3>
            <p className="text-gray-500">Please wait while we fetch your advertisement campaigns</p>
          </div>
        </div>

        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-8 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 -mx-6 -mt-6 px-6 py-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="text-white">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold">Ads Management</h1>
            </div>
            <p className="text-blue-100 text-lg">Create and manage promotional content across your platform</p>
          </div>
          <div className="mt-6 lg:mt-0">
            <Link
              href="/admin/ads/new"
              className="inline-flex items-center bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg transform hover:scale-105 duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Ad
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900">Filter Ads</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Ad Type</label>
              <select
                value={filter.type}
                onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                className="w-full rounded-lg border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              >
                <option value="">All Types</option>
                <option value="BANNER">🎯 Banner Ads</option>
                <option value="CARD">📋 Card Ads</option>
                <option value="FEATURED">⭐ Featured Ads</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Status</label>
              <select
                value={filter.active}
                onChange={(e) => setFilter(prev => ({ ...prev, active: e.target.value }))}
                className="w-full rounded-lg border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              >
                <option value="">All Status</option>
                <option value="true">✅ Active</option>
                <option value="false">⏸️ Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilter({ type: '', active: '' })}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">{ads.length}</div>
              <div className="text-sm font-medium text-gray-600 mt-1">Total Ads</div>
            </div>
            <div className="bg-gray-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-700">
                {ads.filter(ad => ad.isActive).length}
              </div>
              <div className="text-sm font-medium text-green-600 mt-1">Active Ads</div>
            </div>
            <div className="bg-green-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-700">
                {ads.reduce((sum, ad) => sum + ad.clickCount, 0).toLocaleString()}
              </div>
              <div className="text-sm font-medium text-blue-600 mt-1">Total Clicks</div>
            </div>
            <div className="bg-blue-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-700">
                {ads.reduce((sum, ad) => sum + ad.impressionCount, 0).toLocaleString()}
              </div>
              <div className="text-sm font-medium text-purple-600 mt-1">Total Views</div>
            </div>
            <div className="bg-purple-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Ads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2m-2 2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
            </div>
            <div className="text-sm text-gray-500">
              {ads.length} total ads
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ad Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type & Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {ads.map((ad, index) => (
                <tr key={ad.id} className="hover:bg-blue-50/30 transition-colors duration-200">
                  <td className="px-6 py-6">
                    <div className="flex items-start space-x-4">
                      {ad.imageUrl ? (
                        <div className="relative w-20 h-20">
                          <Image
                            src={ad.imageUrl}
                            alt={ad.title}
                            fill
                            className="object-cover rounded-xl shadow-sm"
                          />
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-gray-900 mb-1">
                          {ad.title}
                        </div>
                        {ad.subtitle && (
                          <div className="text-sm text-blue-600 mb-2 font-medium">
                            {ad.subtitle}
                          </div>
                        )}
                        <div className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {ad.description}
                        </div>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">
                            CTA: {ad.ctaText}
                          </span>
                          <span className="text-gray-500">
                            Order: {ad.displayOrder}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${getTypeColor(ad.type)}`}>
                        {ad.type === 'BANNER' && '🎯'}
                        {ad.type === 'CARD' && '📋'}
                        {ad.type === 'FEATURED' && '⭐'}
                        {ad.type}
                      </span>
                      <div>
                        <button
                          onClick={() => toggleAdStatus(ad.id, ad.isActive)}
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            ad.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 hover:scale-105'
                              : 'bg-red-100 text-red-800 hover:bg-red-200 hover:scale-105'
                          }`}
                        >
                          {ad.isActive ? '✅ Active' : '⏸️ Inactive'}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">{ad.clickCount.toLocaleString()} clicks</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">{ad.impressionCount.toLocaleString()} views</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        CTR: {ad.impressionCount > 0 ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2) : 0}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col space-y-2">
                      <Link
                        href={`/admin/ads/${ad.id}/edit`}
                        className="inline-flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteAd(ad.id)}
                        className="inline-flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ads.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ads created yet</h3>
              <p className="text-gray-500 mb-6">Start promoting your content by creating your first advertisement campaign.</p>
              <Link
                href="/admin/ads/new"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg transform hover:scale-105 duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create your first ad
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}