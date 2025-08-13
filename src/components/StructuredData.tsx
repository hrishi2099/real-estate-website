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
  images: { id: string; url: string; isPrimary: boolean }[];
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

interface StructuredDataProps {
  property: Property;
}

export default function StructuredData({ property }: StructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description || `${property.type} in ${property.location}`,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL}/properties/${property.id}`,
    "image": property.images?.map(img => img.url) || [],
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "INR",
      "availability": property.status === "AVAILABLE" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.location
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
    "propertyType": property.type,
    "listingAgent": property.owner ? {
      "@type": "Person",
      "name": property.owner.name,
      "email": property.owner.email
    } : undefined
  };

  // Remove undefined values
  const cleanStructuredData = JSON.parse(JSON.stringify(structuredData));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cleanStructuredData)
      }}
    />
  );
}