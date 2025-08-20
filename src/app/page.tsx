import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import PropertyStats from "@/components/PropertyStats";
import Services from "@/components/Services";
import { getFeaturedProperties } from "@/lib/properties";

export default async function Home() {
  const { properties, isFeatured } = await getFeaturedProperties();

  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedProperties properties={properties} isFeatured={isFeatured} />
      <PropertyStats />
      <Services />
    </div>
  );
}
