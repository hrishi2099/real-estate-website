"use client";

import OptimizedImage from "./OptimizedImage";
import { useState } from "react";

interface PropertyImage {
  id: string;
  url: string;
  filename?: string;
  isPrimary: boolean;
}

interface GalleryProps {
  images: PropertyImage[];
  propertyTitle?: string;
  className?: string;
}

export default function Gallery({ images, propertyTitle = "Property", className = "" }: GalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);




  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;
    
    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateImage('prev');
    if (e.key === 'ArrowRight') navigateImage('next');
  };

  if (!images || images.length === 0) {
    return (
      <div className={`${className} bg-gray-200 rounded-lg flex items-center justify-center min-h-[300px]`}>
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  // Find primary image or use the first one
  const primaryImage = images.find(img => img.isPrimary) || images[0];
  const thumbnails = images.filter(img => img.id !== primaryImage?.id);


  if (!primaryImage) {
    return (
      <div className={`${className} bg-gray-200 rounded-lg flex items-center justify-center min-h-[300px]`}>
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No primary image found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main Image */}
      <div className="relative mb-4">
        <div
          className="relative h-96 rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => openLightbox(images.findIndex(img => img.id === primaryImage.id))}
        >
          <img
            src={primaryImage.url}
            alt={`${propertyTitle} - Main Image`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
              {images.findIndex(img => img.id === primaryImage.id) + 1} / {images.length}
            </div>
          )}
        </div>
      </div>


      {/* Thumbnails */}
      {thumbnails.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {thumbnails.slice(0, 3).map((image, index) => (
            <div
              key={image.id}
              className="cursor-pointer group"
              onClick={() => openLightbox(images.findIndex(img => img.id === image.id))}
            >
              <img
                src={image.url}
                alt={`${propertyTitle} - Image ${index + 2}`}
                className="w-full h-20 object-cover rounded-md transition-transform duration-300 group-hover:scale-105 shadow-sm border border-gray-200"
              />
            </div>
          ))}

          {thumbnails.length > 3 && (
            <div
              className="relative cursor-pointer group"
              onClick={() => openLightbox(3)}
            >
              <img
                src={thumbnails[3].url}
                alt={`${propertyTitle} - More images`}
                className="w-full h-20 object-cover rounded-md opacity-60"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                <span className="text-white font-semibold text-sm">
                  +{thumbnails.length - 3} more
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
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

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-10 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full">
              {selectedImageIndex + 1} / {images.length}
            </div>

            {/* Previous Button */}
            {images.length > 1 && (
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
            )}

            {/* Next Button */}
            {images.length > 1 && (
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
            )}

            {/* Main Image */}
            <div
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[selectedImageIndex].url}
                alt={`${propertyTitle} - Image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 p-2 rounded-lg max-w-full overflow-x-auto">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative w-16 h-12 rounded cursor-pointer flex-shrink-0 ${
                      index === selectedImageIndex ? 'ring-2 ring-white' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(index);
                    }}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}