"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  area?: number;
  type: string;
  status: string;
  images: { id: string; url: string; isPrimary: boolean }[];
}

interface PropertyResponse {
  properties: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    priceRange: "",
    propertyType: "",
    minArea: "",
    location: "",
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.propertyType) queryParams.append('type', filters.propertyType);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.minArea) queryParams.append('minArea', filters.minArea);
      
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split("-");
        if (min) queryParams.append('minPrice', min);
        if (max) queryParams.append('maxPrice', max);
      }

      const response = await fetch(`/api/properties?${queryParams}`);
      if (response.ok) {
        const data: PropertyResponse = await response.json();
        setProperties(data.properties);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.priceRange, filters.propertyType, filters.minArea, filters.location]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyImage = (property: Property) => {
    const primaryImage = property.images?.find(img => img.isPrimary);
    return primaryImage?.url || property.images?.[0]?.url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2232&q=80';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Land Plots</h1>
          <p className="mt-2 text-gray-600">Find your perfect plot from our collection of premium land parcels</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Land Plots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Price</option>
                <option value="0-50000000">Under ₹5 Cr</option>
                <option value="50000000-100000000">₹5 Cr - ₹10 Cr</option>
                <option value="100000000-200000000">₹10 Cr - ₹20 Cr</option>
                <option value="200000000">Above ₹20 Cr</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Land Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Type</option>
                <option value="LAND">Land</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="VILLA">Villa</option>
                <option value="CONDO">Condo</option>
                <option value="TOWNHOUSE">Townhouse</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Area (sq ft)</label>
              <select
                value={filters.minArea}
                onChange={(e) => handleFilterChange("minArea", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Size</option>
                <option value="5000">5,000+ sq ft</option>
                <option value="10000">10,000+ sq ft</option>
                <option value="20000">20,000+ sq ft</option>
                <option value="50000">50,000+ sq ft</option>
                <option value="100000">100,000+ sq ft</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                placeholder="Enter city or state"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Showing ${properties.length} of ${pagination.total} land plots`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white overflow-hidden shadow-lg rounded-lg animate-pulse">
                <div className="h-64 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div key={property.id} className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow">
                <div className="relative h-64">
                  <Image
                    src={getPropertyImage(property)}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {property.type}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {property.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {property.title}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(property.price)}
                    </p>
                  </div>
                  <p className="text-gray-600 mb-4">
                    📍 {property.location}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <span className="flex items-center">
                      📐 {property.area?.toLocaleString() || 'N/A'} sqft
                    </span>
                  </div>
                  <Link
                    href={`/properties/${property.id}`}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && properties.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No land plots found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, page }))}
                  className={`px-4 py-2 border text-sm font-medium rounded-md ${
                    page === pagination.page
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}