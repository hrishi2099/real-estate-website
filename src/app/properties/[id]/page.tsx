"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Gallery from "@/components/Gallery";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  area?: number;
  type: string;
  status: string;
  description?: string;
  features?: string[];
  images: PropertyImage[];
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

interface PropertyImage {
  id: string;
  url: string;
  filename: string;
  isPrimary: boolean;
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${propertyId}`);
        if (response.ok) {
          const data = await response.json();
          setProperty({
            ...data.property,
            features: data.property.features ? JSON.parse(data.property.features) : []
          });
        } else {
          setError('Property not found');
        }
      } catch (err) {
        setError('Failed to load property');
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-300 rounded-lg mb-6"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-64 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Land Plot Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/properties" className="text-blue-600 hover:text-blue-800">
            ← Back to Land Plots
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/properties" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Land Plots
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Gallery Component */}
            <div className="mb-6 relative">
              <Gallery 
                images={property.images} 
                propertyTitle={property.title}
                className="w-full"
              />
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {property.type}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {property.status}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                <p className="text-3xl font-bold text-blue-600">{formatPrice(property.price)}</p>
              </div>
              <p className="text-xl text-gray-600 mb-6">📍 {property.location}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📐</div>
                  <div className="text-2xl font-bold text-gray-900">{property.area?.toLocaleString() || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                {property.bedrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-2">🛏️</div>
                    <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-2">🚿</div>
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                )}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🏠</div>
                  <div className="text-2xl font-bold text-gray-900">{property.type}</div>
                  <div className="text-sm text-gray-600">Property Type</div>
                </div>
                {property.yearBuilt && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-2">📅</div>
                    <div className="text-2xl font-bold text-gray-900">{property.yearBuilt}</div>
                    <div className="text-sm text-gray-600">Year Built</div>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {property.features && property.features.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Property Owner</h3>
              
              {property.owner ? (
                <>
                  <div className="flex items-center mb-6">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4 bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {property.owner.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{property.owner.name}</h4>
                      <p className="text-gray-600">Property Owner</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700">{property.owner.email}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-600 mb-6">
                  <p>Contact our team for property inquiries</p>
                </div>
              )}

              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Schedule Site Visit
                </button>
                <button className="w-full bg-white text-blue-600 border-2 border-blue-600 py-3 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Contact Agent
                </button>
                <button className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                  Save Land Plot
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Property Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type:</span>
                    <span className="text-gray-900">{property.type}</span>
                  </div>
                  {property.area && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="text-gray-900">{property.area.toLocaleString()} sq ft</span>
                    </div>
                  )}
                  {property.yearBuilt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year Built:</span>
                      <span className="text-gray-900">{property.yearBuilt}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">{property.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}