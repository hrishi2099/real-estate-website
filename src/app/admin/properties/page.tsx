"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  type: string;
  status: 'ACTIVE' | 'SOLD' | 'PENDING';
  images: any[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  createdAt: string;
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

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await api.getProperties();
      if (response?.data) {
        // Handle both array and object responses
        const propertiesData = Array.isArray(response.data) 
          ? response.data 
          : response.data.properties || [];
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
        <a
          href="/admin/properties/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add New Property
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading properties...</span>
        </div>
      ) : (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar 
            placeholder="Search properties by title, location, or type..."
            onSearch={handleSearch}
            defaultValue={searchQuery}
            className="max-w-md"
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Properties ({filteredProperties.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'ACTIVE' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({properties.filter(p => p.status === 'ACTIVE').length})
          </button>
          <button
            onClick={() => setFilter('SOLD')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'SOLD' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sold ({properties.filter(p => p.status === 'SOLD').length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'PENDING' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({properties.filter(p => p.status === 'PENDING').length})
          </button>
        </div>

        <div className="overflow-x-auto">
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
                    <div className="text-sm font-medium text-gray-900">${property.price.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{property.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{property.bedrooms} bed, {property.bathrooms} bath</div>
                    <div>{property.area} sqft</div>
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