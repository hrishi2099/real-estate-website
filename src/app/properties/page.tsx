import Image from "next/image";
import Link from "next/link";
import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import { Metadata } from "next";
import PropertiesClient from "@/components/PropertiesClient";
import Script from "next/script";
import ZaminsevaSchema from "@/components/ZaminsevaSchema";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = generateMetadataHelper(
  "Land Properties by Zaminseva Prime",
  "Explore premium agricultural land & NA plots. Directly owned by Zaminseva Prime with clear titles and hassle-free transactions.",
  null,
  {
    canonical: "/properties",
    keywords: [
      'agricultural land for sale',
      'NA plots for sale',
      'land properties',
      'zaminseva prime properties',
      'agricultural plots',
      'NA land plots',
      'land investment',
      'farmland for sale',
      'development plots'
    ]
  }
);

export default function PropertiesPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaminseva.com';

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Properties",
        "item": `${siteUrl}/properties`
      }
    ]
  };

  return (
    <>
      <ZaminsevaSchema pageType="properties" />
      <StructuredData data={breadcrumbSchema} />
      <PropertiesClient />
    </>
  );
}