import Image from "next/image";
import Link from "next/link";
import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import { Metadata } from "next";
import PropertiesClient from "@/components/PropertiesClient";
import Script from "next/script";
import ZaminsevaSchema from "@/components/ZaminsevaSchema";

export const metadata: Metadata = generateMetadataHelper(
  "Land Properties by Zaminseva Prime",
  "Explore our exclusive collection of premium agricultural land and NA plots. All properties are directly owned by Zaminseva Prime, ensuring clear titles and hassle-free transactions.",
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
  return (
    <>
      <ZaminsevaSchema pageType="properties" />
      <PropertiesClient />
    </>
  );
}