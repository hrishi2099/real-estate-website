"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import PropertyMap from "@/components/PropertyMapSimple";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  latitude?: number;
  longitude?: number;
  area?: number;
  type: string;
  status: string;
  images: { id: string; url: string; isPrimary: boolean }[];
  pricePerSqft?: number;
  walkScore?: number;
  localityScore?: number;
}

interface SearchFilters {
  location: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  pricePerSqft: string;
}

export default function PropertySearchPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  
  const [filters, setFilters] = useState<SearchFilters>({
    location: "",
    type: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    pricePerSqft: ""
  });


  const propertyTypes = [
    { value: "", label: "All Types" },
    { value: "LAND", label: "Land" },
    { value: "COMMERCIAL", label: "Commercial" },
    { value: "APARTMENT", label: "Apartment" },
    { value: "HOUSE", label: "House" },
    { value: "VILLA", label: "Villa" }
  ];

  const priceRanges = [
    { value: "", label: "Any Price" },
    { value: "0-1000000", label: "Under ₹10 Lakh" },
    { value: "1000000-5000000", label: "₹10L - ₹50L" },
    { value: "5000000-10000000", label: "₹50L - ₹1 Cr" },
    { value: "10000000-50000000", label: "₹1 Cr - ₹5 Cr" },
    { value: "50000000", label: "Above ₹5 Cr" }
  ];

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/properties?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        const enrichedProperties = data.properties.map((property: any) => ({
          ...property,
          pricePerSqft: property.area ? Math.round(Number(property.price) / Number(property.area)) : null,
          walkScore: Math.floor(Math.random() * 40) + 60, // 60-100
          localityScore: Math.floor(Math.random() * 30) + 70, // 70-100
        }));
        setProperties(enrichedProperties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      type: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      pricePerSqft: ""
    });
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const getPropertyImage = (property: Property) => {
    const primaryImage = property.images?.find(img => img.isPrimary);
    return primaryImage?.url || property.images?.[0]?.url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2232&q=80';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Property Search</h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">Find your perfect property from our collection</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                    viewMode === 'map' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Map View
                </button>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium touch-manipulation"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-full lg:w-80 lg:flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:sticky lg:top-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 touch-manipulation"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      placeholder="Enter city, state or area"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    />
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    >
                      {propertyTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        placeholder="Min Price"
                        className="px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      />
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        placeholder="Max Price"
                        className="px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                  </div>

                  {/* Area Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area (sq ft)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={filters.minArea}
                        onChange={(e) => handleFilterChange('minArea', e.target.value)}
                        placeholder="Min Area"
                        className="px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      />
                      <input
                        type="number"
                        value={filters.maxArea}
                        onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                        placeholder="Max Area"
                        className="px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                  </div>

                  {/* Price per Sq Ft */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Price per Sq Ft
                    </label>
                    <input
                      type="number"
                      value={filters.pricePerSqft}
                      onChange={(e) => handleFilterChange('pricePerSqft', e.target.value)}
                      placeholder="₹ per sq ft"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Summary */}
            <div className="mb-4 sm:mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm sm:text-base text-gray-600">
                      {loading ? 'Searching...' : `${properties.length} properties found`}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <select className="w-full sm:w-auto px-3 py-2.5 border border-gray-300 rounded-md text-sm">
                      <option>Sort by Relevance</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Area: Low to High</option>
                      <option>Area: High to Low</option>
                      <option>Newest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Results */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                      <div className="h-40 sm:h-48 bg-gray-300"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-6 bg-gray-300 rounded mb-4"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-4 bg-gray-300 rounded"></div>
                          <div className="h-4 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  properties.map((property) => (
                    <div key={property.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-40 sm:h-48">
                        <Image
                          src={getPropertyImage(property)}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1 sm:gap-2">
                          <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium">
                            {property.type}
                          </span>
                          <span className="bg-green-100 text-green-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium">
                            {property.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                          {property.title}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 flex items-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{property.location}</span>
                        </p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-1">
                          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                            {formatPrice(property.price)}
                          </div>
                          {property.pricePerSqft && (
                            <div className="text-xs sm:text-sm text-gray-600">
                              ₹{property.pricePerSqft.toLocaleString()}/sq ft
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 text-xs sm:text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Area:</span>
                            <span className="font-medium">{Number(property.area)?.toLocaleString() || 'N/A'} sq ft</span>
                          </div>
                          {property.walkScore && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Walk Score:</span>
                              <span className="font-medium text-green-600">{property.walkScore}/100</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Link
                            href={`/properties/${property.id}`}
                            className="flex-1 bg-blue-600 text-white text-center py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm touch-manipulation"
                          >
                            View Details
                          </Link>
                          <button className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm touch-manipulation">
                            Enquire
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Map View */
              <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[400px] sm:h-[500px] lg:h-[600px]">
                {properties.length > 0 && properties.some(p => p.latitude && p.longitude) ? (
                  <PropertyMap
                    latitude={Number(properties.find(p => p.latitude)?.latitude) || 19.076}
                    longitude={Number(properties.find(p => p.longitude)?.longitude) || 72.877}
                    propertyTitle="Property Search Results"
                    className="h-full w-full"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 p-4">
                    <div className="text-center">
                      <p className="text-base sm:text-lg mb-2">Map view available for properties with GPS coordinates</p>
                      <p className="text-sm">Switch to grid view to see all properties</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {!loading && properties.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 lg:p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">Try adjusting your search filters to see more results.</p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-4 py-2.5 sm:px-6 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base touch-manipulation"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}