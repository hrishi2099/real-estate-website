"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Gallery from "@/components/Gallery";
import PropertyDetails from "@/components/PropertyDetails";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  latitude?: number;
  longitude?: number;
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
        console.log('Fetching property with ID:', propertyId);
        const response = await fetch(`/api/properties/${propertyId}`);
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Property data received:', data);
          
          // Validate required data
          if (!data.property) {
            throw new Error('No property data in response');
          }
          
          setProperty({
            ...data.property,
            features: data.property.features ? 
              (Array.isArray(data.property.features) ? data.property.features : JSON.parse(data.property.features)) 
              : []
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.log('API Error response:', errorData);
          setError(`Property not found (${response.status}): ${errorData.error || 'Unknown error'}`);
        }
      } catch (err) {
        setError('Failed to load property');
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">Loading Property...</h3>
            <p className="text-blue-800 text-sm">Property ID: {propertyId}</p>
          </div>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500 mb-6">
            <p>Property ID: {propertyId}</p>
            <p>Check console for detailed error information</p>
          </div>
          <div className="space-y-3">
            <Link 
              href="/properties" 
              className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ← Back to Properties
            </Link>
          </div>
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

        {/* Gallery Component */}
        <div className="mb-8 relative">
          <Gallery 
            images={property.images} 
            propertyTitle={property.title}
            className="w-full"
          />
        </div>

        {/* Enhanced Property Details */}
        <PropertyDetails property={property} />
      </div>
    </div>
  );
}