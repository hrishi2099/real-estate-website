import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import PropertyStats from "@/components/PropertyStats";
import Services from "@/components/Services";
import PastEventsShowcase from "@/components/PastEventsShowcase";
import CreativeAdsSection from "@/components/CreativeAdsSection";
import { getFeaturedProperties } from "@/lib/properties";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NA Plots & Farmhouse Land | Zaminseva Prime Pvt. Ltd.",
  description: "Discover premium NA plots and farmhouse land with Zaminseva Prime Pvt. Ltd. Your trusted partner for real estate investments and dream properties.",
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
