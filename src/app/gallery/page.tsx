"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/imageUtils";

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
    sortBy: "newest",
    layout: "grid"
  });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid");
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
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);

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
  }, [pagination.page, pagination.limit, filters.propertyType, filters.search, filters.sortBy]);

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

  const toggleFavorite = (imageId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(imageId)) {
        newFavorites.delete(imageId);
      } else {
        newFavorites.add(imageId);
      }
      return newFavorites;
    });
  };

  const shareImage = async (image: PropertyImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.property.title,
          text: `Check out this property: ${image.property.title}`,
          url: `${window.location.origin}/properties/${image.propertyId}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/properties/${image.propertyId}`);
      alert('Link copied to clipboard!');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedImage) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateImage('prev');
        if (e.key === 'ArrowRight') navigateImage('next');
        if (e.key === 'f' || e.key === 'F') toggleFavorite(selectedImage.id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage]);

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
        {/* Enhanced Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filter & Sort Gallery</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
                title="Grid View"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("masonry")}
                className={`p-2 rounded-md transition-colors ${viewMode === "masonry" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
                title="Masonry View"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="APARTMENT">🏠 Apartment</option>
                <option value="HOUSE">🏡 House</option>
                <option value="VILLA">🏰 Villa</option>
                <option value="CONDO">🏢 Condo</option>
                <option value="TOWNHOUSE">🏘️ Townhouse</option>
                <option value="COMMERCIAL">🏬 Commercial</option>
                <option value="LAND">🌍 Land</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">📅 Newest First</option>
                <option value="oldest">📅 Oldest First</option>
                <option value="name-asc">🔤 Name A-Z</option>
                <option value="name-desc">🔤 Name Z-A</option>
                <option value="location">📍 By Location</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filter</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange("search", "featured")}
                  className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  ⭐ Featured
                </button>
                <button
                  onClick={() => {
                    setFilters({ propertyType: "", search: "", sortBy: "newest", layout: "grid" });
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results count and favorites */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Showing ${images.length} of ${pagination.total} images`}
          </p>
          
          <div className="flex items-center gap-4">
            {favorites.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {favorites.size} favorite{favorites.size !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => {
                    // Filter to show only favorites - you would implement this in the backend
                    console.log('Show favorites:', Array.from(favorites));
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Favorites
                </button>
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">ESC</kbd> Close
              </span>
              <span className="inline-flex items-center gap-1 ml-3">
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">F</kbd> Favorite
              </span>
              <span className="inline-flex items-center gap-1 ml-3">
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">←</kbd>
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">→</kbd> Navigate
              </span>
            </div>
          </div>
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
          <div className={viewMode === "masonry" 
            ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6" 
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          }>
            {images.map((image) => (
              <div 
                key={image.id} 
                className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group relative ${
                  viewMode === "masonry" ? "break-inside-avoid mb-6" : ""
                }`}
              >
                <div 
                  className={`relative ${viewMode === "masonry" ? "aspect-auto" : "h-48"}`}
                  onClick={() => openLightbox(image)}
                >
                  <Image
                    src={getImageUrl(image.url)}
                    alt={image.property.title}
                    fill={viewMode !== "masonry"}
                    width={viewMode === "masonry" ? 400 : undefined}
                    height={viewMode === "masonry" ? 300 : undefined}
                    className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                      viewMode === "masonry" ? "w-full h-auto" : ""
                    }`}
                  />
                  
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {image.isPrimary && (
                      <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        ⭐ Primary
                      </div>
                    )}
                    {favorites.has(image.id) && (
                      <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        ❤️ Favorited
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">{image.property.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {image.property.location}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {image.property.type}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(image.id);
                        }}
                        className={`p-1 rounded-full transition-colors ${
                          favorites.has(image.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                        }`}
                      >
                        <svg className="h-4 w-4" fill={favorites.has(image.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      
                      <Link 
                        href={`/properties/${image.propertyId}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View →
                      </Link>
                    </div>
                  </div>
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

            {/* Enhanced Image Info */}
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-70 backdrop-blur-sm text-white p-4 rounded-lg max-w-sm">
              <h3 className="font-semibold text-lg mb-2">{selectedImage.property.title}</h3>
              <p className="text-sm opacity-90 mb-3 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {selectedImage.property.location}
              </p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                  {selectedImage.property.type}
                </span>
                {selectedImage.isPrimary && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white">
                    ⭐ Primary
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Link 
                  href={`/properties/${selectedImage.propertyId}`}
                  className="inline-flex items-center text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Property
                </Link>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(selectedImage.id);
                  }}
                  className={`p-2 rounded-full transition-colors ${
                    favorites.has(selectedImage.id) ? "bg-red-500 text-white" : "bg-white bg-opacity-20 text-white hover:bg-red-500"
                  }`}
                  title={favorites.has(selectedImage.id) ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <svg className="h-4 w-4" fill={favorites.has(selectedImage.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    shareImage(selectedImage);
                  }}
                  className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-colors"
                  title="Share Image"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Fullscreen Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  document.documentElement.requestFullscreen();
                }
              }}
              className="absolute top-4 right-16 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
              title="Toggle Fullscreen"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>

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
                src={getImageUrl(selectedImage.url)}
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