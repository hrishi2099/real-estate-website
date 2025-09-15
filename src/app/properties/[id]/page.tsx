import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import PropertyDetails from "@/components/PropertyDetails";
import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import type { Metadata } from "next";
import { getProperty } from "@/lib/properties";
import StructuredData from "@/components/StructuredData";

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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  
  if (!property) {
    return {
      title: 'Property Not Found',
      description: 'The requested property could not be found.',
    };
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const title = `${property.title} - ${formatPrice(property.price)}`;
  const description = `${property.description || `${property.type} in ${property.location}`}. ${property.area ? `${property.area} sqft. ` : ''}${property.bedrooms ? `${property.bedrooms} bedrooms. ` : ''}${property.bathrooms ? `${property.bathrooms} bathrooms. ` : ''}Price: ${formatPrice(property.price)}`;
  const images = property.images?.find(img => img.isPrimary)?.url || property.images?.[0]?.url;

  return generateMetadataHelper(title, description, {
    companyName: "Zaminseva Prime Pvt. Ltd.",
  }, {
    canonical: `/properties/${id}`,
    images: images ? [images] : undefined,
    keywords: [
      'real estate',
      'property',
      property.type.toLowerCase(),
      property.location.toLowerCase(),
      'buy property',
      'investment',
      ...(property.features || [])
    ]
  });
}

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  const propertyForDetails = {
    ...property,
    description: property.description || undefined,
    area: property.area || undefined,
    latitude: property.latitude || undefined,
    longitude: property.longitude || undefined,
    bedrooms: property.bedrooms || undefined,
    bathrooms: property.bathrooms || undefined,
    yearBuilt: property.yearBuilt || undefined,
    owner: property.owner || undefined,
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getSchemaAvailability = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "https://schema.org/InStock";
      case "SOLD":
        return "https://schema.org/SoldOut";
      case "PENDING":
        return "https://schema.org/InStock";
      case "INACTIVE":
        return "https://schema.org/Discontinued";
      default:
        return "https://schema.org/InStock";
    }
  };

  const getSchemaPropertyType = (type: string) => {
    switch (type) {
      case "APARTMENT":
        return "Apartment";
      case "HOUSE":
        return "House";
      case "VILLA":
        return "House";
      case "CONDO":
        return "Apartment";
      case "TOWNHOUSE":
        return "House";
      case "COMMERCIAL":
        return "Place";
      case "LAND":
        return "Landform";
      default:
        return "Place";
    }
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaminseva.com';
  const realEstateListingSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description || `${property.type} in ${property.location}`,
    "url": `${siteUrl}/properties/${property.id}`,
    "image": property.images?.map(img => img.url) || [],
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "INR",
      "availability": getSchemaAvailability(property.status)
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.location,
      "addressRegion": property.location,
      "addressCountry": "IN"
    },
    "geo": property.latitude && property.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": property.latitude,
      "longitude": property.longitude
    } : undefined,
    "floorSize": property.area ? {
      "@type": "QuantitativeValue",
      "value": property.area,
      "unitCode": "FTK"
    } : undefined,
    "numberOfRooms": property.bedrooms,
    "numberOfBathroomsTotal": property.bathrooms,
    "yearBuilt": property.yearBuilt,
    "propertyType": getSchemaPropertyType(property.type),
  };

  return (
    <div className="min-h-screen bg-white">
      <StructuredData data={realEstateListingSchema} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li>
              <Link href="/properties" className="text-blue-600 hover:text-blue-800">
                Properties
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">
              {property.title}
            </li>
          </ol>
        </nav>

        <Link href="/properties" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Properties
        </Link>

        <article>
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">{property.title}</h1>
              {property.status === 'SOLD' && (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-600 text-white">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-gray-600">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {property.location}
              </span>
              <span className={`text-2xl font-bold ${property.status === 'SOLD' ? 'text-gray-500 line-through' : 'text-blue-600'}`}>
                {formatPrice(property.price)}
              </span>
              {property.status === 'SOLD' && (
                <span className="text-lg font-semibold text-red-600">
                  SOLD
                </span>
              )}
            </div>
          </header>

          <section className="mb-8" aria-label="Property Images">
            <Gallery
              images={property.images}
              propertyTitle={property.title}
              className="w-full"
            />
          </section>

          <section aria-label="Property Details">
            <PropertyDetails property={propertyForDetails} />
          </section>
        </article>
      </div>
    </div>
  );
}