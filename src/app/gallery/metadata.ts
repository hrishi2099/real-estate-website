import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadataHelper(
  "Property Gallery",
  "Explore our collection of premium properties through stunning imagery. Browse high-quality photos of apartments, houses, villas, and more.",
  null,
  {
    canonical: "/gallery"
  }
);
