"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

interface Plot {
  id: string;
  plotNumber: string;
  area: number;
  price: number;
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'INACTIVE';
  description?: string;
  features?: string;
  soldDate?: string;
  buyer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminPlotsManagement() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'INACTIVE'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; plot: Plot | null; loading: boolean }>({
    isOpen: false,
    plot: null,
    loading: false
  });

  useEffect(() => {
    loadPlots();
  }, []);

  const loadPlots = async () => {
    try {
      setLoading(true);
      const response = await api.getPlots();
      if (response?.data) {
        // Handle both array and object responses
        const data = response.data as any;
        const plotsData = Array.isArray(data) 
          ? data 
          : data.plots || [];
        setPlots(plotsData);
      }
    } catch (error) {
      if (typeof console !== 'undefined' && console.error) {
        console.error("Failed to load plots:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (plot: Plot) => {
    setDeleteDialog({
      isOpen: true,
      plot,
      loading: false
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      plot: null,
      loading: false
    });
  };

  const handleDeletePlot = async () => {
    if (!deleteDialog.plot) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));
    
    try {
      await api.deletePlot(deleteDialog.plot.id);
      setPlots(plots.filter(p => p.id !== deleteDialog.plot!.id));
      closeDeleteDialog();
    } catch (error) {
      if (typeof console !== 'undefined' && console.error) {
        console.error("Failed to delete plot:", error);
      }
    } finally {
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // Filter and search plots
  const filteredPlots = plots.filter(plot => {
    const matchesFilter = filter === 'all' || plot.status === filter;
    const matchesSearch = !searchQuery || 
      plot.plotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plot.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plot.address && plot.address.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPlots.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPlots = filteredPlots.slice(startIndex, startIndex + itemsPerPage);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'SOLD':
        return 'bg-red-100 text-red-800';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading plots...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Plot Management</h1>
        <a
          href="/admin/plots/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add New Plot
        </a>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={(query) => setSearchQuery(query)}
              placeholder="Search by plot number, location, or address..."
            />
          </div>
          <div className="flex gap-2">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({plots.length})
          </button>
          <button
            onClick={() => setFilter('AVAILABLE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'AVAILABLE' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Available ({plots.filter(p => p.status === 'AVAILABLE').length})
          </button>
          <button
            onClick={() => setFilter('SOLD')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'SOLD' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sold ({plots.filter(p => p.status === 'SOLD').length})
          </button>
          <button
            onClick={() => setFilter('RESERVED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'RESERVED' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Reserved ({plots.filter(p => p.status === 'RESERVED').length})
          </button>
          <button
            onClick={() => setFilter('INACTIVE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'INACTIVE' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inactive ({plots.filter(p => p.status === 'INACTIVE').length})
          </button>
        </div>
      </div>

      {/* Plots Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plot Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GPS Coordinates
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
              {paginatedPlots.map((plot) => (
                <tr key={plot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Plot #{plot.plotNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {plot.area.toLocaleString()} sq ft
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{plot.location}</div>
                    {plot.address && (
                      <div className="text-sm text-gray-500">{plot.address}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(plot.price)}
                    </div>
                    {plot.buyer && (
                      <div className="text-sm text-gray-500">
                        Buyer: {plot.buyer.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {plot.latitude && plot.longitude ? (
                      <div className="text-sm text-gray-900">
                        <div>Lat: {plot.latitude.toFixed(6)}</div>
                        <div>Lng: {plot.longitude.toFixed(6)}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No coordinates</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plot.status)}`}>
                      {plot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <a
                        href={`/admin/plots/${plot.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </a>
                      <a
                        href={`/plots`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                      >
                        View
                      </a>
                      <button
                        onClick={() => openDeleteDialog(plot)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredPlots.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {filteredPlots.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchQuery ? 'No plots found matching your search.' : 'No plots available.'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onCancel={closeDeleteDialog}
        onConfirm={handleDeletePlot}
        title="Delete Plot"
        message={`Are you sure you want to delete plot #${deleteDialog.plot?.plotNumber}? This action cannot be undone.`}
        loading={deleteDialog.loading}
        confirmText="Delete Plot"
        confirmButtonColor="red"
      />
    </div>
  );
}