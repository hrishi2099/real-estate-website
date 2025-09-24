import Script from 'next/script';

interface StructuredDataProps {
  type?: 'homepage' | 'properties' | 'about' | 'contact';
}

export default function EnhancedStructuredData({ type = 'homepage' }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://zaminseva.com/#organization",
          "name": "Zaminseva Prime Pvt. Ltd.",
          "url": "https://zaminseva.com",
          "logo": "https://zaminseva.com/logos/logo.png",
          "sameAs": [
            "https://www.facebook.com/p/Zaminseva-Prime-Pvt-Ltd-61574607166718/",
            "https://x.com/DreamlandGen1",
            "https://www.instagram.com/zaminseva_prime/",
            "https://www.youtube.com/@ZaminsevaPrime"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-98765-43210",
            "contactType": "customer service",
            "availableLanguage": ["English", "Hindi", "Marathi"]
          },
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "IN",
            "addressRegion": "Maharashtra"
          }
        },
        {
          "@type": "WebSite",
          "@id": "https://zaminseva.com/#website",
          "url": "https://zaminseva.com",
          "name": "Zaminseva Prime - Premium Land Investments",
          "publisher": {
            "@id": "https://zaminseva.com/#organization"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://zaminseva.com/properties?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "RealEstateAgent",
          "@id": "https://zaminseva.com/#realestate",
          "name": "Zaminseva Prime Pvt. Ltd.",
          "url": "https://zaminseva.com",
          "logo": "https://zaminseva.com/logos/logo.png",
          "description": "Premium NA plots and agricultural land investments with clear titles and direct ownership",
          "serviceArea": {
            "@type": "State",
            "name": "Maharashtra",
            "containedInPlace": {
              "@type": "Country",
              "name": "India"
            }
          },
          "knowsAbout": [
            "NA Plots",
            "Agricultural Land",
            "Farmhouse Plots",
            "Land Investment",
            "Property Investment",
            "Real Estate Development"
          ]
        }
      ]
    };

    return baseData;
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  );
}