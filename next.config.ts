import type { NextConfig } from "next";

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googletagmanager.com *.google-analytics.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: images.unsplash.com *.google.com;
    font-src 'self';
    connect-src 'self' *.googletagmanager.com *.google-analytics.com vitals.vercel-insights.com *.googleadservices.com www.google.com *.google.com;
    frame-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@headlessui/react', '@heroicons/react'],
    bundlePagesExternals: true,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          // Cache static assets for 1 year
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Optimize font loading
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Optimize images
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=31536000',
          },
        ],
      },
    ]
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Optimize image loading
    minimumCacheTTL: 86400,
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000,
          },
          common: {
            name: 'common',
            chunks: 'all',
            minChunks: 2,
            enforce: true,
            maxSize: 244000,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
