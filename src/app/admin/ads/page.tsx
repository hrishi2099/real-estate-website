"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    active: ''
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "ADMIN") {
      router.push("/admin");
      return;
    }
    fetchAds();
  }, [session, status, router, filter]);

  const fetchAds = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.active) params.append('active', filter.active);

      const response = await fetch(`/api/admin/ads?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAds(data);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ads Management</h1>
          <p className="text-gray-600 mt-2">Manage promotional content and advertisements</p>
        </div>
        <Link
          href="/admin/ads/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Create New Ad
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              <option value="BANNER">Banner</option>
              <option value="CARD">Card</option>
              <option value="FEATURED">Featured</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filter.active}
              onChange={(e) => setFilter(prev => ({ ...prev, active: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{ads.length}</div>
          <div className="text-sm text-gray-600">Total Ads</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {ads.filter(ad => ad.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Ads</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {ads.reduce((sum, ad) => sum + ad.clickCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Clicks</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {ads.reduce((sum, ad) => sum + ad.impressionCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Impressions</div>
        </div>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-4">
                      {ad.imageUrl && (
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {ad.title}
                        </div>
                        {ad.subtitle && (
                          <div className="text-xs text-gray-500 mb-1">
                            {ad.subtitle}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {ad.description}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          CTA: {ad.ctaText}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(ad.type)}`}>
                      {ad.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>Clicks: {ad.clickCount}</div>
                      <div>Views: {ad.impressionCount}</div>
                      <div className="text-xs text-gray-500">
                        Order: {ad.displayOrder}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAdStatus(ad.id, ad.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ad.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors`}
                    >
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link
                        href={`/admin/ads/${ad.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteAd(ad.id)}
                        className="text-red-600 hover:text-red-900"
                      >
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
          <div className="text-center py-12">
            <div className="text-gray-500">No ads found</div>
            <Link
              href="/admin/ads/new"
              className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              Create your first ad
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}