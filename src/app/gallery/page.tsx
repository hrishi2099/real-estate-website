"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface PropertyImage {
  id: string;
  url: string;
  filename: string;
  isPrimary: boolean;
  propertyId: string;
  property: {
    id: string;
    title: string;
    location: string;
    type: string;
  };
}

interface GalleryResponse {
  images: PropertyImage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function GalleryPage() {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<PropertyImage | null>(null);
  const [filters, setFilters] = useState({
    propertyType: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.propertyType) queryParams.append('type', filters.propertyType);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`/api/gallery?${queryParams}`);
      if (response.ok) {
        const data: GalleryResponse = await response.json();
        setImages(data.images);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.propertyType, filters.search]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const openLightbox = (image: PropertyImage) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    if (direction === 'prev') {
      const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      setSelectedImage(images[newIndex]);
    } else {
      const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      setSelectedImage(images[newIndex]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Property Gallery</h1>
            <p className="mt-4 text-xl text-gray-600">
              Explore our collection of premium properties through stunning imagery
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="VILLA">Villa</option>
                <option value="CONDO">Condo</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="LAND">Land</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Properties</label>
              <input
                type="text"
                placeholder="Search by property name or location"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Showing ${images.length} of ${pagination.total} images`}
          </p>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image) => (
              <div 
                key={image.id} 
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => openLightbox(image)}
              >
                <div className="relative h-48">
                  <Image
                    src={image.url}
                    alt={image.property.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                      Primary
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{image.property.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">📍 {image.property.location}</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {image.property.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        )}

        {/* Pagination */}
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
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
                if (page > pagination.totalPages) return null;
                return (
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
                );
              })}
              
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

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Info */}
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white p-4 rounded-lg max-w-md">
              <h3 className="font-semibold text-lg mb-1">{selectedImage.property.title}</h3>
              <p className="text-sm opacity-90 mb-2">📍 {selectedImage.property.location}</p>
              <Link 
                href={`/properties/${selectedImage.propertyId}`}
                className="inline-flex items-center text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                View Property
              </Link>
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                  className="absolute left-4 z-10 text-white hover:text-gray-300 transition-colors p-2"
                >
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                  className="absolute right-4 z-10 text-white hover:text-gray-300 transition-colors p-2"
                >
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Main Image */}
            <div 
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage.url}
                alt={selectedImage.property.title}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}