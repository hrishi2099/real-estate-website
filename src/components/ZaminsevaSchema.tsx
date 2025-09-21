import Script from 'next/script'

interface ZaminsevaSchemaProps {
  pageType?: 'homepage' | 'properties' | 'property' | 'contact'
  propertyData?: {
    id: string
    title: string
    price: number
    location: string
    description: string
  }
}

export default function ZaminsevaSchema({ pageType = 'homepage', propertyData }: ZaminsevaSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaminseva.com'

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Zaminseva Prime Pvt. Ltd.",
    "alternateName": "Zaminseva",
    "url": baseUrl,
    "description": "Zaminseva - Premium real estate company specializing in NA plots and farmhouse land investments in India",
    "foundingDate": "2024",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service"
    },
    "sameAs": [
      baseUrl
    ]
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Zaminseva",
    "alternateName": "Zaminseva Prime Pvt. Ltd.",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/properties?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Zaminseva",
        "item": baseUrl
      },
      ...(pageType === 'properties' ? [{
        "@type": "ListItem",
        "position": 2,
        "name": "Properties",
        "item": `${baseUrl}/properties`
      }] : []),
      ...(pageType === 'property' && propertyData ? [{
        "@type": "ListItem",
        "position": 2,
        "name": "Properties",
        "item": `${baseUrl}/properties`
      }, {
        "@type": "ListItem",
        "position": 3,
        "name": propertyData.title,
        "item": `${baseUrl}/properties/${propertyData.id}`
      }] : [])
    ]
  }

  const realEstateAgentSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Zaminseva Prime Pvt. Ltd.",
    "alternateName": "Zaminseva",
    "url": baseUrl,
    "description": "Premium real estate services specializing in NA plots and farmhouse land",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    }
  }

  const propertySchema = propertyData ? {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": propertyData.title,
    "description": propertyData.description,
    "url": `${baseUrl}/properties/${propertyData.id}`,
    "offers": {
      "@type": "Offer",
      "price": propertyData.price,
      "priceCurrency": "INR"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": propertyData.location,
      "addressCountry": "IN"
    }
  } : null

  const schemas: any[] = [organizationSchema, websiteSchema, breadcrumbSchema, realEstateAgentSchema]
  if (propertySchema) schemas.push(propertySchema)

  return (
    <Script
      id="zaminseva-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas)
      }}
    />
  )
}