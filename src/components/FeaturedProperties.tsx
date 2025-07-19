"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  area?: number;
  type: string;
  images: { id: string; url: string; isPrimary: boolean }[];
}

interface PropertyResponse {
  properties: Property[];
}

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await fetch('/api/properties?featured=true&limit=3');
        if (response.ok) {
          const data: PropertyResponse = await response.json();
          setProperties(data.properties);
        }
      } catch (error) {
        console.error('Error fetching featured properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyImage = (property: Property) => {
    const primaryImage = property.images?.find(img => img.isPrimary);
    return primaryImage?.url || property.images?.[0]?.url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2232&q=80';
  };

  if (loading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Featured</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Premium Land Plots
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Featured</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Premium Land Plots
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Explore our handpicked selection of prime land plots and development opportunities.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div key={property.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="relative h-48">
                  <Image
                    src={getPropertyImage(property)}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {property.type}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {property.title}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(property.price)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    📍 {property.location}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>📐 {property.area?.toLocaleString() || 'N/A'} sqft</span>
                  </div>
                  <div className="mt-6">
                    <Link
                      href={`/properties/${property.id}`}
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {properties.length === 0 && !loading && (
          <div className="mt-10 text-center">
            <p className="text-gray-500">No featured properties available at the moment.</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/properties"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            View All Land Plots
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}