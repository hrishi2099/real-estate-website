"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import ExportButton from "@/components/ExportButton";
import ExportModal from "@/components/ExportModal";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  type: string;
  status: 'ACTIVE' | 'SOLD' | 'PENDING';
  images: Image[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  createdAt: string;
}

interface Image {
  url: string;
  alt: string;
}

export default function PropertiesManagement() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'SOLD' | 'PENDING'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; property: Property | null; loading: boolean }>({
    isOpen: false,
    property: null,
    loading: false
  });
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await api.getProperties();
      if (response?.data) {
        // Handle both array and object responses
        const data = response.data as { properties: Property[] } | Property[];
        const propertiesData = Array.isArray(data) 
          ? data 
          : data.properties || [];
        setProperties(propertiesData);
      }
    } catch (error) {
      if (typeof console !== 'undefined' && console.error) {
        console.error("Failed to load properties:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (property: Property) => {
    setDeleteDialog({
      isOpen: true,
      property,
      loading: false
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      property: null,
      loading: false
    });
  };

  const handleDeleteProperty = async () => {
    if (!deleteDialog.property) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));
    
    try {
      await api.deleteProperty(deleteDialog.property.id);
      setProperties(properties.filter(p => p.id !== deleteDialog.property!.id));
      closeDeleteDialog();
    } catch (error) {
      if (typeof console !== 'undefined' && console.error) {
        console.error("Failed to delete property:", error);
      }
      alert('Failed to delete property');
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // Filter and search properties
  const filteredProperties = properties.filter(property => {
    const matchesFilter = filter === 'all' || property.status === filter;
    const matchesSearch = !searchQuery || 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SOLD': return 'bg-gray-100 text-gray-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Property Management</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex gap-2">
            <ExportButton
              data={filteredProperties.map(property => ({
                id: property.id,
                title: property.title,
                price: Number(property.price),
                location: property.location,
                type: property.type,
                status: property.status,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                area: property.area ? Number(property.area) : undefined,
                createdAt: property.createdAt
              }))}
              type="properties"
              filters={{
                status: filter === 'all' ? undefined : filter,
                search: searchQuery
              }}
              className="flex-1 sm:flex-none"
            />
            <button
              onClick={() => setShowExportModal(true)}
              className="flex-1 sm:flex-none bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm touch-manipulation"
            >
              <span className="hidden sm:inline">📊 Advanced Export</span>
              <span className="sm:hidden">📊 Export</span>
            </button>
          </div>
          <a
            href="/admin/properties/new"
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm touch-manipulation text-center"
          >
            + Add New Property
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading properties...</span>
        </div>
      ) : (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <SearchBar 
            placeholder="Search properties by title, location, or type..."
            onSearch={handleSearch}
            defaultValue={searchQuery}
            className="w-full sm:max-w-md"
          />
        </div>

        <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium touch-manipulation ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="hidden sm:inline">All Properties</span>
            <span className="sm:hidden">All</span>
            <span className="block sm:inline"> ({filteredProperties.length})</span>
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium touch-manipulation ${
              filter === 'ACTIVE' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({properties.filter(p => p.status === 'ACTIVE').length})
          </button>
          <button
            onClick={() => setFilter('SOLD')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium touch-manipulation ${
              filter === 'SOLD' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sold ({properties.filter(p => p.status === 'SOLD').length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium touch-manipulation ${
              filter === 'PENDING' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({properties.filter(p => p.status === 'PENDING').length})
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500">{property.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{Number(property.price).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{property.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{property.bedrooms} bed, {property.bathrooms} bath</div>
                    <div>{Number(property.area)} sqft</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <a
                      href={`/admin/properties/${property.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </a>
                    <button 
                      onClick={() => openDeleteDialog(property)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {paginatedProperties.map((property) => (
            <div key={property.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="h-16 w-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{property.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{property.location}</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">₹{Number(property.price).toLocaleString()}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)} ml-2`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <div>
                      <span>{property.type}</span>
                      <span className="mx-1">•</span>
                      <span>{property.bedrooms}B/{property.bathrooms}B</span>
                      <span className="mx-1">•</span>
                      <span>{Number(property.area)} sqft</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex space-x-3">
                    <a
                      href={`/admin/properties/${property.id}/edit`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm touch-manipulation"
                    >
                      Edit
                    </a>
                    <button 
                      onClick={() => openDeleteDialog(property)}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm touch-manipulation"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchQuery ? `No properties found matching "${searchQuery}"` : 'No properties found for the selected filter.'}
            </p>
          </div>
        )}
      </div>
      )}

      {/* Pagination */}
      {filteredProperties.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProperties.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          showItemsPerPage={true}
        />
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        type="properties"
        filters={{
          status: filter === 'all' ? undefined : filter,
          search: searchQuery
        }}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Property"
        message={`Are you sure you want to delete "${deleteDialog.property?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="red"
        onConfirm={handleDeleteProperty}
        onCancel={closeDeleteDialog}
        loading={deleteDialog.loading}
      />
    </div>
  );
}