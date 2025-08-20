"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  trackFilterUsage,
  trackPropertyListInteraction,
} from "@/lib/tracking";
import ExportButton from "@/components/ExportButton";

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

export default function PropertiesClient() {
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
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    trackFilterUsage(filterType, value, newFilters);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Properties</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Find your perfect property from our collection of premium real estate</p>
            </div>
            <div className="flex-shrink-0">
              <ExportButton
                data={properties.map(property => ({
                  id: property.id,
                  title: property.title,
                  price: property.price,
                  location: property.location,
                  area: property.area,
                  type: property.type,
                  status: property.status,
                  createdAt: new Date().toISOString()
                }))}
                type="properties"
                filters={filters}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 sm:mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="price-range" className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                id="price-range"
                value={filters.priceRange}
                onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation text-base"
              >
                <option value="">Any Price</option>
                <option value="0-50000000">Under ₹5 Cr</option>
                <option value="50000000-100000000">₹5 Cr - ₹10 Cr</option>
                <option value="100000000-200000000">₹10 Cr - ₹20 Cr</option>
                <option value="200000000">Above ₹20 Cr</option>
              </select>
            </div>

            <div>
              <label htmlFor="property-type" className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                id="property-type"
                value={filters.propertyType}
                onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation text-base"
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
              <label htmlFor="min-area" className="block text-sm font-medium text-gray-700 mb-2">Minimum Area (sq ft)</label>
              <select
                id="min-area"
                value={filters.minArea}
                onChange={(e) => handleFilterChange("minArea", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation text-base"
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
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                id="location"
                type="text"
                placeholder="Enter city or state"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation text-base"
              />
            </div>
          </div>
        </section>

        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Showing ${properties.length} of ${pagination.total} properties`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white overflow-hidden shadow-lg rounded-lg animate-pulse">
                <div className="h-48 sm:h-56 lg:h-64 bg-gray-300"></div>
                <div className="p-4 sm:p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <main>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {properties.map((property, index) => (
                <article key={property.id} className="bg-white overflow-hidden shadow-md hover:shadow-xl transition-shadow rounded-lg">
                  <div className="relative h-48 sm:h-56 lg:h-64">
                    <Image
                      src={getPropertyImage(property)}
                      alt={`${property.title} - ${property.type} in ${property.location}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1 sm:gap-1.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {property.type}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {property.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 lg:p-6">
                    <header className="mb-2 sm:mb-3">
                      <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 line-clamp-2">
                        {property.title}
                      </h2>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                        {formatPrice(property.price)}
                      </p>
                    </header>
                    <p className="text-gray-600 mb-2 sm:mb-3 text-xs sm:text-sm lg:text-base flex items-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{property.location}</span>
                    </p>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        {Number(property.area)?.toLocaleString() || 'N/A'} sqft
                      </span>
                    </div>
                    <Link
                      href={`/properties/${property.id}`}
                      className="w-full flex justify-center items-center px-3 py-2 sm:px-4 sm:py-2.5 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors touch-manipulation"
                      onClick={() => trackPropertyListInteraction('click', property.id, index)}
                      aria-label={`View details for ${property.title}`}
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </main>
        )}

        {!loading && properties.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <nav aria-label="Properties pagination" className="mt-6 sm:mt-8 flex justify-center">
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 sm:px-4 py-2 sm:py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                aria-label="Go to previous page"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden" aria-hidden="true">‹</span>
              </button>
              
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let page;
                if (pagination.totalPages <= 5) {
                  page = i + 1;
                } else {
                  const start = Math.max(1, pagination.page - 2);
                  const end = Math.min(pagination.totalPages, start + 4);
                  page = start + i;
                  if (page > end) return null;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`px-3 sm:px-4 py-2 border text-sm font-medium rounded-md touch-manipulation ${
                      page === pagination.page
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                    aria-label={page === pagination.page ? `Current page ${page}` : `Go to page ${page}`}
                    aria-current={page === pagination.page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                aria-label="Go to next page"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden" aria-hidden="true">›</span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}