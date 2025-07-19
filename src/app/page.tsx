import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import PropertyStats from "@/components/PropertyStats";
import Services from "@/components/Services";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedProperties />
      <PropertyStats />
      <Services />
    </div>
  );
}
