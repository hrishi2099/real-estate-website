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
  plotNumber?: string;
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
  plotType: string;
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
    pricePerSqft: "",
    plotType: ""
  });

  const plotTypes = [
    { value: "", label: "All Plots" },
    { value: "developed", label: "Developed Plots" },
    { value: "undeveloped", label: "Undeveloped Plots" },
    { value: "agricultural", label: "Agricultural Land" },
    { value: "commercial", label: "Commercial Plots" },
    { value: "residential", label: "Residential Plots" }
  ];

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
          plotNumber: `P${Math.floor(Math.random() * 90000) + 10000}`,
          pricePerSqft: property.area ? Math.round(property.price / property.area) : null,
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
      pricePerSqft: "",
      plotType: ""
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Search</h1>
              <p className="mt-1 text-gray-600">Find your perfect plot from our collection</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {propertyTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Plot Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plot Category
                    </label>
                    <select
                      value={filters.plotType}
                      onChange={(e) => handleFilterChange('plotType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {plotTypes.map(type => (
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
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        placeholder="Min Price"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        placeholder="Max Price"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Area Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area (sq ft)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={filters.minArea}
                        onChange={(e) => handleFilterChange('minArea', e.target.value)}
                        placeholder="Min Area"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={filters.maxArea}
                        onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                        placeholder="Max Area"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Summary */}
            <div className="mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">
                      {loading ? 'Searching...' : `${properties.length} properties found`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-300"></div>
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
                      <div className="relative h-48">
                        <Image
                          src={getPropertyImage(property)}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {property.type}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            {property.status}
                          </span>
                        </div>
                        {property.plotNumber && (
                          <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                            Plot {property.plotNumber}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {property.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {property.location}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatPrice(property.price)}
                          </div>
                          {property.pricePerSqft && (
                            <div className="text-sm text-gray-600">
                              ₹{property.pricePerSqft.toLocaleString()}/sq ft
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Area:</span>
                            <span className="font-medium">{property.area?.toLocaleString() || 'N/A'} sq ft</span>
                          </div>
                          {property.walkScore && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Walk Score:</span>
                              <span className="font-medium text-green-600">{property.walkScore}/100</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Link
                            href={`/properties/${property.id}`}
                            className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            View Details
                          </Link>
                          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
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
              <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[600px]">
                {properties.length > 0 && properties.some(p => p.latitude && p.longitude) ? (
                  <PropertyMap
                    latitude={properties.find(p => p.latitude)?.latitude || 19.076}
                    longitude={properties.find(p => p.longitude)?.longitude || 72.877}
                    propertyTitle="Property Search Results"
                    className="h-full w-full"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <p className="text-lg mb-2">Map view available for properties with GPS coordinates</p>
                      <p className="text-sm">Switch to grid view to see all properties</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {!loading && properties.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search filters to see more results.</p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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