import Image from "next/image";
import Link from "next/link";
import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import { Metadata } from "next";
import PropertiesClient from "@/components/PropertiesClient";

export const metadata: Metadata = generateMetadataHelper(
  "Properties - Find Your Perfect Property",
  "Browse our extensive collection of premium real estate properties. Find apartments, houses, villas, and commercial spaces for sale and rent. Advanced filters to help you find exactly what you're looking for.",
  null,
  {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/properties`,
    keywords: [
      'real estate properties',
      'houses for sale',
      'apartments for rent',
      'commercial properties',
      'luxury homes',
      'property search',
      'real estate listings',
      'buy property',
      'rent property'
    ]
  }
);

export default function PropertiesPage() {
  return <PropertiesClient />;
}