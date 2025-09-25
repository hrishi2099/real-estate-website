"use client";
import Link from "next/link";
import OptimizedImage from "./OptimizedImage";
import { useState, useEffect } from "react";

interface Ad {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor?: string;
  textColor?: string;
  type: 'BANNER' | 'CARD' | 'FEATURED' | 'banner' | 'card' | 'featured';
}

const defaultAds: Ad[] = [
  {
    id: '1',
    title: 'Premium NA Plots Available',
    subtitle: 'Limited Time Offer',
    description: 'Secure your dream plot with 20% down payment. Premium locations with all amenities and clear titles.',
    imageUrl: '/images/na-plot-ad.jpg',
    ctaText: 'View Available Plots',
    ctaLink: '/properties?type=NA_PLOT',
    backgroundColor: 'bg-gradient-to-r from-blue-600 to-blue-800',
    textColor: 'text-white',
    type: 'banner'
  },
  {
    id: '2',
    title: 'Farmhouse Land Investment',
    description: 'Perfect for weekend getaways and agricultural ventures. Starting from ₹5 lakh per acre.',
    imageUrl: '/images/farmhouse-ad.jpg',
    ctaText: 'Explore Farmlands',
    ctaLink: '/properties?type=AGRICULTURAL_LAND',
    type: 'card'
  },
  {
    id: '3',
    title: 'Free Site Visit',
    subtitle: 'Book Now',
    description: 'Arrange an on-site consultation with our experts, with transportation provided.',
    imageUrl: '/images/site-visit-ad.jpg',
    ctaText: 'Book Site Visit',
    ctaLink: '/contact',
    backgroundColor: 'bg-gradient-to-r from-green-600 to-green-800',
    textColor: 'text-white',
    type: 'featured'
  }
];

interface CreativeAdsSectionProps {
  ads?: Ad[];
  title?: string;
  subtitle?: string;
}

export default function CreativeAdsSection({
  ads: propAds,
  title = "Special Offers & Opportunities",
  subtitle = "Don't miss out on these exclusive deals"
}: CreativeAdsSectionProps) {
  const [ads, setAds] = useState<Ad[]>(propAds || []);
  const [loading, setLoading] = useState(!propAds);

  useEffect(() => {
    if (!propAds) {
      fetchAds();

      // Fallback: ensure loading doesn't persist indefinitely
      const fallbackTimeout = setTimeout(() => {
        setLoading(false);
        setAds([]);
      }, 10000); // 10 second fallback

      return () => clearTimeout(fallbackTimeout);
    }
  }, [propAds]);

  const fetchAds = async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('/api/ads', {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const fetchedAds = await response.json();
        setAds(fetchedAds.length > 0 ? fetchedAds : []);
      } else {
        setAds([]);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdClick = async (adId: string) => {
    try {
      await fetch(`/api/ads/${adId}/click`, { method: 'POST' });
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  const bannerAds = ads.filter(ad => ad.type.toUpperCase() === 'BANNER');
  const cardAds = ads.filter(ad => ad.type.toUpperCase() === 'CARD');
  const featuredAds = ads.filter(ad => ad.type.toUpperCase() === 'FEATURED');

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  // Hide the section if there are no ads
  if (ads.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="space-y-8">
          {/* Banner Ads - Full Width */}
          {bannerAds.map((ad) => (
            <div
              key={ad.id}
              className={`relative overflow-hidden rounded-2xl ${ad.backgroundColor || 'bg-gray-100'} shadow-xl`}
            >
              <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className={ad.textColor || 'text-gray-900'}>
                    {ad.subtitle && (
                      <span className="inline-block px-3 py-1 text-xs font-semibold bg-white/20 rounded-full mb-4">
                        {ad.subtitle}
                      </span>
                    )}
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                      {ad.title}
                    </h3>
                    <p className="text-base sm:text-lg mb-6 opacity-90">
                      {ad.description}
                    </p>
                    <Link
                      href={ad.ctaLink}
                      onClick={() => handleAdClick(ad.id)}
                      className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                    >
                      {ad.ctaText}
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                  <div className="relative h-64 lg:h-80">
                    <OptimizedImage
                      src={ad.imageUrl}
                      alt={ad.title}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Card Ads Grid */}
          {cardAds.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cardAds.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="relative h-48">
                    <OptimizedImage
                      src={ad.imageUrl}
                      alt={ad.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {ad.subtitle && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full">
                          {ad.subtitle}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {ad.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {ad.description}
                    </p>
                    <Link
                      href={ad.ctaLink}
                      onClick={() => handleAdClick(ad.id)}
                      className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200"
                    >
                      {ad.ctaText}
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Featured Ads - Special Layout */}
          {featuredAds.map((ad) => (
            <div
              key={ad.id}
              className={`relative overflow-hidden rounded-2xl ${ad.backgroundColor || 'bg-gray-100'} shadow-xl`}
            >
              <div className="absolute inset-0">
                <OptimizedImage
                  src={ad.imageUrl}
                  alt={ad.title}
                  fill
                  className="object-cover opacity-20"
                  sizes="100vw"
                />
              </div>
              <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-12 text-center">
                <div className={`max-w-3xl mx-auto ${ad.textColor || 'text-gray-900'}`}>
                  {ad.subtitle && (
                    <span className="inline-block px-4 py-2 text-sm font-semibold bg-white/20 rounded-full mb-4">
                      {ad.subtitle}
                    </span>
                  )}
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                    {ad.title}
                  </h3>
                  <p className="text-lg sm:text-xl mb-8 opacity-90">
                    {ad.description}
                  </p>
                  <Link
                    href={ad.ctaLink}
                    onClick={() => handleAdClick(ad.id)}
                    className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-xl hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                  >
                    {ad.ctaText}
                    <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call-to-Action Strip */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Need a Custom Solution?
            </h3>
            <p className="text-gray-600 mb-4">
              Contact our team for personalized property investment advice and exclusive off-market deals.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Get in Touch
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.429L3 21l1.429-5.106A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}