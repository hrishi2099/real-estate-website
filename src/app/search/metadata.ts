import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadataHelper(
  "Property Search",
  "Find your perfect property with our advanced search filters. Search by location, property type, price, and more to find the best real estate listings.",
  null,
  {
    canonical: "/search"
  }
);
