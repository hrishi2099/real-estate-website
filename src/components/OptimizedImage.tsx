"use client";

import { useState } from "react";
import Image from "next/image";

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
}

export default function OptimizedImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority = false,
  sizes,
  onClick
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  // Handle image error by showing a fallback
  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    // Don't change source if it's already a placeholder
    if (!src.includes('placeholder')) {
      setImgSrc('/placeholder-property.svg');
    }
  };

  // Check if source is valid
  const isValidSrc = src && src !== 'undefined' && src !== 'null';
  const finalSrc = isValidSrc ? src : '/placeholder-property.svg';
  
  
  
  // If it's a local upload, use regular img tag for better compatibility
  if (finalSrc.startsWith('/uploads/') || finalSrc.startsWith('/placeholder')) {
    if (fill) {
      return (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={finalSrc}
            alt={alt}
            className={className}
            onClick={onClick}
            onLoad={() => setIsLoading(false)}
            onError={handleError}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </>
      );
    }

    return (
      <img
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onClick={onClick}
        onError={handleError}
      />
    );
  }

  // For external images, use regular img tag as well for consistency
  if (fill) {
    return (
      <>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={finalSrc}
          alt={alt}
          className={className}
          onClick={onClick}
          onLoad={() => setIsLoading(false)}
          onError={handleError}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </>
    );
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      width={width || 500}
      height={height || 300}
      className={className}
      onClick={onClick}
      onError={handleError}
    />
  );
}