"use client";

import { useState } from "react";
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
  onClick
}: OptimizedImageProps) {
  const [imgError, setImgError] = useState(false);

  // Fallback image for production
  const fallbackImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2232&q=80';

  const handleImageError = () => {
    console.warn(`Image failed to load: ${src}`);
    setImgError(true);
  };

  const imageSrc = imgError ? fallbackImage : getImageUrl(src);

  if (fill) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        onClick={onClick}
        onError={handleImageError}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width || 500}
      height={height || 300}
      className={className}
      onClick={onClick}
      onError={handleImageError}
    />
  );
}