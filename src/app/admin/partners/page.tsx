"use client";

import { useState, useEffect } from "react";

interface Partner {
  id: string;
  userId: string;
  companyName: string;
  companyRegistration?: string;
  website?: string;
  city: string;
  state: string;
  country: string;
  baseCommission: number;
  performanceTier: string;
  totalReferrals: number;
  successfulDeals: number;
  totalRevenue: number;
  isVerified: boolean;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone?: string;
    status: string;
  };
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, [filter]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const url = filter === "all"
        ? '/api/admin/partners'
        : `/api/admin/partners?status=${filter}`;

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPartners(data.partners || []);
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (partnerId: string, newStatus: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/partners/${partnerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchPartners();
        setShowDetailModal(false);
        alert(`Partner status updated to ${newStatus}`);
      } else {
        const data = await response.json();
        alert(`Failed to update status: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating partner status:", error);
      alert("Failed to update partner status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerificationToggle = async (partnerId: string, currentVerified: boolean) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/partners/${partnerId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isVerified: !currentVerified }),
      });

      if (response.ok) {
        await fetchPartners();
        if (selectedPartner && selectedPartner.id === partnerId) {
          setSelectedPartner({
            ...selectedPartner,
            isVerified: !currentVerified,
          });
        }
        alert(`Partner ${!currentVerified ? 'verified' : 'unverified'} successfully`);
      } else {
        const data = await response.json();
        alert(`Failed to update verification: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating verification:", error);
      alert("Failed to update verification");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommissionUpdate = async (partnerId: string, newCommission: number) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/partners/${partnerId}/commission`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ baseCommission: newCommission }),
      });

      if (response.ok) {
        await fetchPartners();
        alert(`Commission updated to ${newCommission}%`);
      } else {
        const data = await response.json();
        alert(`Failed to update commission: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating commission:", error);
      alert("Failed to update commission");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ACTIVE: "bg-green-100 text-green-800 border-green-200",
      INACTIVE: "bg-gray-100 text-gray-800 border-gray-200",
      SUSPENDED: "bg-red-100 text-red-800 border-red-200",
      TERMINATED: "bg-red-200 text-red-900 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
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

  const pendingCount = partners.filter(p => p.status === 'PENDING').length;
  const activeCount = partners.filter(p => p.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Channel Partners</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and approve channel partner applications
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200">
            <span className="font-semibold">{pendingCount}</span> Pending
          </div>
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200">
            <span className="font-semibold">{activeCount}</span> Active
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Partners
          </button>
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "PENDING"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setFilter("ACTIVE")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "ACTIVE"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("INACTIVE")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "INACTIVE"
                ? "bg-gray-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Inactive
          </button>
          <button
            onClick={() => setFilter("SUSPENDED")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "SUSPENDED"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Suspended
          </button>
        </div>
      </div>

      {/* Partners List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading partners...</p>
          </div>
        ) : partners.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-600 text-lg">No partners found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {partner.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{partner.user.name}</div>
                          <div className="text-sm text-gray-500">{partner.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{partner.companyName}</div>
                      {partner.website && (
                        <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                          Visit Website
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{partner.city}</div>
                      <div className="text-sm text-gray-500">{partner.state}, {partner.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold mb-1 ${getTierBadge(partner.performanceTier).color}`}>
                        {getTierBadge(partner.performanceTier).icon} {partner.performanceTier}
                      </div>
                      <div className="text-xs text-gray-600">
                        {partner.totalReferrals} referrals | {partner.successfulDeals} deals
                      </div>
                      <div className="text-xs text-gray-600">
                        Commission: {partner.baseCommission}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(partner.status)}`}>
                        {partner.status}
                      </span>
                      {partner.isVerified && (
                        <div className="mt-1">
                          <span className="inline-flex items-center text-xs text-green-700">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedPartner(partner);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Partner Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedPartner.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedPartner.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedPartner.user.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registered On</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedPartner.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Company Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Company Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedPartner.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration</p>
                    <p className="text-sm font-medium text-gray-900">{selectedPartner.companyRegistration || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedPartner.city}, {selectedPartner.state}
                    </p>
                  </div>
                  {selectedPartner.website && (
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a href={selectedPartner.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        {selectedPartner.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 mb-1">Total Referrals</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedPartner.totalReferrals}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 mb-1">Successful Deals</p>
                    <p className="text-2xl font-bold text-green-900">{selectedPartner.successfulDeals}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-purple-900">₹{selectedPartner.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Commission Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Commission & Tier</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Base Commission</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="20"
                        defaultValue={selectedPartner.baseCommission}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        id={`commission-${selectedPartner.id}`}
                      />
                      <span className="text-sm text-gray-600">%</span>
                      <button
                        onClick={() => {
                          const input = document.getElementById(`commission-${selectedPartner.id}`) as HTMLInputElement;
                          const newCommission = parseFloat(input.value);
                          if (newCommission >= 0 && newCommission <= 20) {
                            handleCommissionUpdate(selectedPartner.id, newCommission);
                          } else {
                            alert("Commission must be between 0 and 20%");
                          }
                        }}
                        disabled={actionLoading}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Performance Tier</p>
                    <div className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold ${getTierBadge(selectedPartner.performanceTier).color}`}>
                      {getTierBadge(selectedPartner.performanceTier).icon} {selectedPartner.performanceTier}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Actions</h3>

                <div className="flex flex-wrap gap-3">
                  {selectedPartner.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedPartner.id, 'ACTIVE')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                      >
                        ✓ Approve Partner
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedPartner.id, 'TERMINATED')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                      >
                        ✗ Reject Application
                      </button>
                    </>
                  )}

                  {selectedPartner.status === 'ACTIVE' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedPartner.id, 'SUSPENDED')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
                      >
                        Suspend Partner
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedPartner.id, 'INACTIVE')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium"
                      >
                        Mark Inactive
                      </button>
                    </>
                  )}

                  {(selectedPartner.status === 'SUSPENDED' || selectedPartner.status === 'INACTIVE') && (
                    <button
                      onClick={() => handleStatusChange(selectedPartner.id, 'ACTIVE')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                    >
                      Reactivate Partner
                    </button>
                  )}

                  <button
                    onClick={() => handleVerificationToggle(selectedPartner.id, selectedPartner.isVerified)}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${
                      selectedPartner.isVerified
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {selectedPartner.isVerified ? 'Remove Verification' : 'Verify Partner'}
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
