import OptimizedImage from "./OptimizedImage";
import Link from "next/link";
import { getPropertyImageUrl } from "@/lib/imageUtils";
import { getPropertyTypeLabel } from "@/lib/propertyFeatures";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  area?: number;
  type: string;
  status: string;
  images: { id: string; url: string; isPrimary: boolean }[];
}

interface FeaturedPropertiesProps {
  properties: Property[];
  isFeatured: boolean;
}

export default function FeaturedProperties({ properties, isFeatured }: FeaturedPropertiesProps) {

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyImage = (property: Property) => {
    return getPropertyImageUrl(property);
  };

  return (
    <div className="py-8 sm:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center lg:text-center">
          <h3 className="text-sm sm:text-base text-blue-600 font-semibold tracking-wide uppercase">
            {isFeatured ? 'Featured' : 'Latest Properties'}
          </h3>
          <h2 className="mt-2 text-xl sm:text-3xl leading-tight font-extrabold tracking-tight text-gray-900 sm:leading-8">
            Explore Our Premium Land Plots
          </h2>
          <p className="mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base lg:text-xl text-gray-600 lg:mx-auto leading-relaxed">
            Discover a curated collection of premium properties and exclusive investment opportunities. Each property is carefully selected to meet our high standards of quality and value, ensuring you find the perfect match for your investment goals.
          </p>
        </div>

        <div className="mt-6 sm:mt-10">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div key={property.id} className={`bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-lg ${property.status === 'SOLD' ? 'relative' : ''}`}>
                <div className="relative h-40 sm:h-48 bg-gray-200">
                  <OptimizedImage
                    src={getPropertyImage(property)}
                    alt={`Image of ${property.title}, a ${property.type} in ${property.location}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`object-cover ${property.status === 'SOLD' ? 'grayscale' : ''}`}
                  />
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-xs font-medium ${
                      property.type === 'AGRICULTURAL_LAND'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getPropertyTypeLabel(property.type)}
                    </span>
                    {property.status === 'SOLD' && (
                      <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-xs font-bold bg-red-600 text-white">
                        SOLD OUT
                      </span>
                    )}
                  </div>
                  {property.status === 'SOLD' && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="bg-red-600/95 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold text-lg transform rotate-12 border-2 border-white shadow-lg">
                        SOLD OUT
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-0 line-clamp-2">
                      {property.title}
                    </h3>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                      {formatPrice(property.price)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{property.location}</span>
                  </p>
                  <div className="mt-2 sm:mt-4 flex items-center justify-between text-xs sm:text-sm text-gray-600">
                    <span className="flex items-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      {property.area?.toLocaleString() || 'N/A'} sqft
                    </span>
                  </div>
                  <div className="mt-4 sm:mt-6">
                    <Link
                      href={`/properties/${property.id}`}
                      className={`w-full flex justify-center items-center px-3 sm:px-4 py-2 sm:py-2.5 border border-transparent text-sm font-medium rounded-md touch-manipulation transition-colors ${
                        property.status === 'SOLD'
                          ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                          : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                      }`}
                    >
                      {property.status === 'SOLD' ? 'View Sold Property' : 'View Details'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {properties.length === 0 && (
          <div className="mt-10 text-center">
            <p className="text-gray-600 sm:text-gray-500">We are currently curating a new collection of featured properties. Please check back soon for exciting new investment opportunities.</p>
            <p className="text-sm text-gray-400 mt-2">
              Check browser console for debug information, or visit{' '}
              <a href="/api/debug/properties" className="text-blue-600 hover:underline" target="_blank">
                /api/debug/properties
              </a>{' '}
              to see property data.
            </p>
          </div>
        )}

        <div className="mt-8 sm:mt-10 text-center">
          <Link
            href="/properties"
            className="inline-flex items-center px-4 py-2.5 sm:px-6 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 touch-manipulation transition-colors"
          >
            View All Properties
            <svg className="ml-2 -mr-1 w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}