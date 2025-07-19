"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  image: string;
  addedDate: string;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading favorites from API
    const loadFavorites = async () => {
      setIsLoading(true);
      
      // Mock data for demonstration
      const mockFavorites: Property[] = [
        {
          id: "1",
          title: "Modern Downtown Apartment",
          price: "$450,000",
          location: "Downtown, City Center",
          type: "Apartment",
          bedrooms: 2,
          bathrooms: 2,
          area: "1,200 sqft",
          image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
          addedDate: "2024-01-15"
        },
        {
          id: "2",
          title: "Luxury Villa with Pool",
          price: "$850,000",
          location: "Suburbs, Green Valley",
          type: "Villa",
          bedrooms: 4,
          bathrooms: 3,
          area: "3,500 sqft",
          image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
          addedDate: "2024-01-10"
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFavorites(mockFavorites);
      setIsLoading(false);
    };

    if (user) {
      loadFavorites();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const removeFavorite = (propertyId: string) => {
    setFavorites(prev => prev.filter(property => property.id !== propertyId));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your saved properties.</p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Properties</h1>
          <p className="mt-2 text-gray-600">
            Properties you&apos;ve saved for later consideration
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No saved properties</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start browsing properties and save the ones you&apos;re interested in.
            </p>
            <div className="mt-6">
              <Link
                href="/properties"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Properties
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img
                    className="w-full h-48 object-cover"
                    src={property.image}
                    alt={property.title}
                  />
                  <button
                    onClick={() => removeFavorite(property.id)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50"
                    title="Remove from favorites"
                  >
                    <svg
                      className="h-5 w-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {property.title}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">
                    {property.price}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {property.location}
                  </p>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>{property.bedrooms} bed</span>
                    <span>{property.bathrooms} bath</span>
                    <span>{property.area}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      Saved {new Date(property.addedDate).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/properties/${property.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {favorites.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/properties"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
            >
              Browse More Properties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}