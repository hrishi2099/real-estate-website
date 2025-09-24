"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/imageUtils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onClick?: () => void;
  lazy?: boolean;
  threshold?: number;
}

export default function OptimizedImage({
  src,
  alt,
  fill,
  width,
  height,
  className = "",
  priority = false,
  sizes,
  onClick,
  lazy = true,
  threshold = 0.1
}: OptimizedImageProps) {
  const [imgError, setImgError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Fallback to a lighter placeholder
  const fallbackImage = '/images/property-placeholder.jpg';

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '50px' }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [lazy, priority, isInView, threshold]);

  const handleImageError = () => {
    console.warn(`Image failed to load: ${src}`);
    setImgError(true);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const imageSrc = imgError ? fallbackImage : getImageUrl(src);
  const shouldLoad = isInView || priority;

  if (fill) {
    return (
      <div
        ref={imgRef}
        className={`relative w-full h-full ${!isLoaded ? 'bg-gray-200 animate-pulse' : ''}`}
      >
        {shouldLoad && (
          <img
            src={imageSrc}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            onClick={onClick}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}
        {!isLoaded && shouldLoad && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={`relative ${!isLoaded ? 'bg-gray-200 animate-pulse' : ''}`}
      style={{ width: width || 500, height: height || 300 }}
    >
      {shouldLoad && (
        <img
          src={imageSrc}
          alt={alt}
          width={width || 500}
          height={height || 300}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onClick={onClick}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
      {!isLoaded && shouldLoad && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}