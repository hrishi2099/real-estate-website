import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import PropertyDetails from "@/components/PropertyDetails";
import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import type { Metadata } from "next";
import { getProperty } from "@/lib/properties";

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

  return (
    <div className="min-h-screen bg-white">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {property.location}
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(property.price)}
              </span>
            </div>
          </header>

          <section className="mb-8 relative" aria-label="Property Images">
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