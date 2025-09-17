"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getImageUrl } from "@/lib/imageUtils";

interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  yearBuilt?: number;
  status: string;
  featured: boolean;
  images: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
  inquiries?: number;
  views?: number;
  favorites?: number;
}

export default function SalesProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");

  const statusColors = {
    AVAILABLE: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    SOLD: "bg-red-100 text-red-800",
    OFF_MARKET: "bg-gray-100 text-gray-800",
  };

  const propertyTypes = {
    HOUSE: "House",
    APARTMENT: "Apartment",
    CONDO: "Condo",
    TOWNHOUSE: "Townhouse",
    LAND: "Land",
    COMMERCIAL: "Commercial",
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/properties');
      const data = await response.json();

      if (data.success) {
        setProperties(data.data);
      } else {
        setError(data.error || "Failed to load properties");
      }
    } catch (err) {
      setError("Failed to load properties");
      console.error("Error loading properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredAndSortedProperties = properties
    .filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (selectedFilter === "all") return matchesSearch;
      if (selectedFilter === "available") return matchesSearch && property.status === "AVAILABLE";
      if (selectedFilter === "featured") return matchesSearch && property.featured;
      if (selectedFilter === "pending") return matchesSearch && property.status === "PENDING";
      
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return a.price - b.price;
        case "price_high":
          return b.price - a.price;
        case "newest":
          return new Date(b.id).getTime() - new Date(a.id).getTime();
        case "popularity":
          return (b.views || 0) - (a.views || 0);
        default:
          return a.title.localeCompare(b.title);
      }
    });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading properties...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Browse and manage property listings</p>
        </div>
        <button 
          onClick={loadProperties}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-semibold text-gray-900">{properties.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-semibold text-gray-900">
                {properties.filter(p => p.status === 'AVAILABLE').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {properties.filter(p => p.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Featured</p>
              <p className="text-2xl font-semibold text-gray-900">
                {properties.filter(p => p.featured).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Properties</option>
              <option value="available">Available</option>
              <option value="featured">Featured</option>
              <option value="pending">Pending</option>
            </select>

            <label className="block text-sm font-medium text-gray-700">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="title">Name A-Z</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium text-gray-700">Search:</label>
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAndSortedProperties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Property Image */}
            <div className="relative h-48">
              {property.images.length > 0 ? (
                <img
                  src={getImageUrl(property.images[0].url)}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  statusColors[property.status as keyof typeof statusColors]
                }`}>
                  {property.status.replace('_', ' ')}
                </span>
              </div>
              
              {/* Featured Badge */}
              {property.featured && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    Featured
                  </span>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                  {property.title}
                </h3>
                <p className="text-lg font-bold text-blue-600 ml-2">
                  {formatCurrency(property.price)}
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-2">{property.location}</p>
              
              <p className="text-sm text-gray-500 mb-4">
                {propertyTypes[property.propertyType as keyof typeof propertyTypes] || property.propertyType}
              </p>

              {/* Property Features */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                {property.bedrooms && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    {property.bedrooms} bed
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    {property.bathrooms} bath
                  </div>
                )}
                {property.area && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4a1 1 0 011-1h4M4 8l4-4m0 0h8m-8 0v8m8-8v8a1 1 0 01-1 1h-4m4-4H8" />
                    </svg>
                    {property.area.toLocaleString()} sq ft
                  </div>
                )}
              </div>

              {/* Property Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center space-x-3">
                  <span>{property.views || 0} views</span>
                  <span>{property.inquiries || 0} inquiries</span>
                  <span>{property.favorites || 0} favorites</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <a
                  href={`/properties/${property.id}`}
                  className="flex-1 bg-blue-600 text-white text-center px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View Details
                </a>
                <button
                  onClick={() => navigator.share ? navigator.share({
                    title: property.title,
                    text: `Check out this property: ${property.title}`,
                    url: `${window.location.origin}/properties/${property.id}`
                  }) : navigator.clipboard.writeText(`${window.location.origin}/properties/${property.id}`)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedProperties.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No properties found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}