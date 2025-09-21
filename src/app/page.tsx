import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import PropertyStats from "@/components/PropertyStats";
import Services from "@/components/Services";
import PastEventsShowcase from "@/components/PastEventsShowcase";
import CreativeAdsSection from "@/components/CreativeAdsSection";
import { getFeaturedProperties } from "@/lib/properties";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zaminseva - Premium NA Plots & Farmhouse Land Investments",
  description: "Zaminseva offers premium NA plots and farmhouse land for investment. Discover exclusive real estate opportunities with India's trusted property partner - Zaminseva Prime Pvt. Ltd.",
  keywords: ["zaminseva", "Zaminseva Prime", "NA plots", "farmhouse land", "real estate investment", "agricultural land", "property investment", "zaminseva.com"],
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://zaminseva.com",
  },
};

export default async function Home() {
  const { properties, isFeatured } = await getFeaturedProperties();

  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedProperties properties={properties} isFeatured={isFeatured} />
      <CreativeAdsSection />
      <PropertyStats />
      <PastEventsShowcase />
      <Services />
    </div>
  );
}
