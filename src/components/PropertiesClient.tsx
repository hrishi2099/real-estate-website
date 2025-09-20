"use client";

import OptimizedImage from "./OptimizedImage";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  trackFilterUsage,
  trackPropertyListInteraction,
} from "@/lib/tracking";
import { getPropertyImageUrl } from "@/lib/imageUtils";
import { getPropertyTypeLabel } from "@/lib/propertyFeatures";
const ExportButton = dynamic(() => import('@/components/ExportButton'), { ssr: false });

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
    status: "",
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
      if (filters.status) queryParams.append('status', filters.status);

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
  }, [pagination.page, pagination.limit, filters.priceRange, filters.propertyType, filters.minArea, filters.location, filters.status]);

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
    return getPropertyImageUrl(property);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Land Properties</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Discover premium agricultural land and NA plots directly owned by Zaminseva Prime</p>
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
        <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filter Land Properties
            </h2>
            <button
              onClick={() => {
                setFilters({ priceRange: "", propertyType: "", minArea: "", location: "", status: "" });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label htmlFor="price-range" className="block text-sm font-semibold text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Price Range
              </label>
              <select
                id="price-range"
                value={filters.priceRange}
                onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
              >
                <option value="">Any Price Range</option>
                <option value="0-25000000">Under ₹2.5 Cr</option>
                <option value="25000000-50000000">₹2.5 Cr - ₹5 Cr</option>
                <option value="50000000-100000000">₹5 Cr - ₹10 Cr</option>
                <option value="100000000-200000000">₹10 Cr - ₹20 Cr</option>
                <option value="200000000">Above ₹20 Cr</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="property-type" className="block text-sm font-semibold text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Land Type
              </label>
              <select
                id="property-type"
                value={filters.propertyType}
                onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
              >
                <option value="">All Land Types</option>
                <option value="AGRICULTURAL_LAND">🌾 Agricultural Land</option>
                <option value="NA_LAND">🏗️ NA Land (Development)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="min-area" className="block text-sm font-semibold text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Minimum Area
              </label>
              <select
                id="min-area"
                value={filters.minArea}
                onChange={(e) => handleFilterChange("minArea", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
              >
                <option value="">Any Size</option>
                <option value="2500">2,500+ sq ft</option>
                <option value="5000">5,000+ sq ft</option>
                <option value="10000">10,000+ sq ft (0.23 acres)</option>
                <option value="20000">20,000+ sq ft (0.46 acres)</option>
                <option value="43560">1+ acres</option>
                <option value="87120">2+ acres</option>
                <option value="217800">5+ acres</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Availability
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
              >
                <option value="">All Properties</option>
                <option value="ACTIVE">🟢 Available</option>
                <option value="SOLD">🔴 Sold Out</option>
                <option value="PENDING">🟡 Pending</option>
                <option value="INACTIVE">⚫ Inactive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </label>
              <div className="relative">
                <input
                  id="location"
                  type="text"
                  placeholder="Search by city, district, or state"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Showing ${properties.length} of ${pagination.total} properties`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 animate-pulse">
                <div className="h-56 lg:h-64 bg-gray-300"></div>
                <div className="p-5">
                  <div className="h-5 bg-gray-300 rounded mb-3"></div>
                  <div className="h-8 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="flex justify-between mb-4">
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                  <div className="h-12 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <main>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Property Listings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {properties.map((property, index) => (
                <article key={property.id} className={`group bg-white overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 rounded-xl border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 ${property.status === 'SOLD' ? 'opacity-90' : ''}`}>
                  <div className="relative h-56 lg:h-64 overflow-hidden bg-gray-200">
                    <OptimizedImage
                      src={getPropertyImage(property)}
                      alt={`${property.title} - ${property.type} in ${property.location}`}
                      fill
                      className={`object-cover transition-transform duration-300 group-hover:scale-105 ${property.status === 'SOLD' ? 'grayscale' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        property.type === 'AGRICULTURAL_LAND'
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}>
                        {getPropertyTypeLabel(property.type)}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        property.status === 'SOLD'
                          ? 'bg-red-600 text-white'
                          : 'bg-white/90 text-gray-800'
                      }`}>
                        {property.status === 'SOLD' ? 'SOLD OUT' : property.status}
                      </span>
                    </div>
                    {property.status === 'SOLD' && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="bg-red-600/95 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold text-lg transform rotate-12 border-2 border-white shadow-lg">
                          SOLD OUT
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <header className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {property.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(property.price)}
                        </p>
                        <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                          ₹{Math.round(property.price / (property.area || 1))} /sqft
                        </span>
                      </div>
                    </header>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm truncate">{property.location}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span className="text-sm font-medium">
                            {Number(property.area)?.toLocaleString() || 'N/A'} sqft
                          </span>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm">Clear Title</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/properties/${property.id}`}
                      className="w-full flex justify-center items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                      onClick={() => trackPropertyListInteraction('click', property.id, index)}
                      aria-label={`View details for ${property.title}`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Land Details
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