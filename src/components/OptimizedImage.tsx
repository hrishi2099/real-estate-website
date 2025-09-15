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
  className = "",
  priority = false,
  sizes,
  onClick
}: OptimizedImageProps) {
  // Simplified - just return a regular img tag like the working test
  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        onClick={onClick}
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
      src={src}
      alt={alt}
      width={width || 500}
      height={height || 300}
      className={className}
      onClick={onClick}
    />
  );
}