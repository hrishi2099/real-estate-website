import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import PropertyStats from "@/components/PropertyStats";
import Services from "@/components/Services";
import PastEventsShowcase from "@/components/PastEventsShowcase";
import CreativeAdsSection from "@/components/CreativeAdsSection";
import PartnersAndResources from "@/components/PartnersAndResources";
import EnhancedStructuredData from "@/components/EnhancedStructuredData";
import { getFeaturedProperties } from "@/lib/properties";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zaminseva - Premium NA Plots & Farmhouse Land in Pune, Mumbai, Satara | Maharashtra",
  description: "Zaminseva offers premium NA plots and farmhouse land for investment in Pune, Mumbai, and Satara, Maharashtra. Discover exclusive real estate opportunities across Maharashtra with India's trusted property partner - Zaminseva Prime Pvt. Ltd.",
  keywords: ["zaminseva", "Zaminseva Prime", "NA plots Maharashtra", "farmhouse land Pune", "real estate investment Mumbai", "agricultural land Satara", "property investment Maharashtra", "Pune properties", "Mumbai land", "Satara farmhouse", "Maharashtra real estate", "zaminseva.com"],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://zaminseva.com",
  },
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
  },
};

export default async function Home() {
  const { properties, isFeatured } = await getFeaturedProperties();

  return (
    <div className="min-h-screen">
      <EnhancedStructuredData type="homepage" />
      <Hero />
      <FeaturedProperties properties={properties} isFeatured={isFeatured} />
      <CreativeAdsSection />
      <PropertyStats />
      <PartnersAndResources />
      <PastEventsShowcase />
      <Services />
    </div>
  );
}
