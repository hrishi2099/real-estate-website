"use client";
import { useEffect } from 'react';
import Script from 'next/script';

interface OptimizedResourceLoaderProps {
  defer?: boolean;
  onlyAfterInteraction?: boolean;
}

export default function OptimizedResourceLoader({
  defer = true,
  onlyAfterInteraction = true
}: OptimizedResourceLoaderProps) {

  useEffect(() => {
    if (onlyAfterInteraction) {
      // Load non-critical resources after user interaction
      const loadNonCriticalResources = () => {
        // Preload critical images that are likely to be needed
        const criticalImages = [
          '/images/hero-bg.jpg',
          '/images/property-placeholder.jpg',
          '/logos/logo.png'
        ];

        criticalImages.forEach(src => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          document.head.appendChild(link);
        });

        // Remove event listeners after loading
        document.removeEventListener('scroll', loadNonCriticalResources);
        document.removeEventListener('mousemove', loadNonCriticalResources);
        document.removeEventListener('touchstart', loadNonCriticalResources);
      };

      // Add event listeners for user interaction
      document.addEventListener('scroll', loadNonCriticalResources, { once: true, passive: true });
      document.addEventListener('mousemove', loadNonCriticalResources, { once: true, passive: true });
      document.addEventListener('touchstart', loadNonCriticalResources, { once: true, passive: true });

      return () => {
        document.removeEventListener('scroll', loadNonCriticalResources);
        document.removeEventListener('mousemove', loadNonCriticalResources);
        document.removeEventListener('touchstart', loadNonCriticalResources);
      };
    }
  }, [onlyAfterInteraction]);

  return (
    <>
      {/* DNS Prefetch for external domains */}
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//connect.facebook.net" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//images.unsplash.com" />

      {/* Preconnect to critical domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

      {/* Resource Hints */}
      {defer && (
        <>
          <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="" />
          <link rel="preload" href="/css/critical.css" as="style" />
        </>
      )}
    </>
  );
}