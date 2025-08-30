import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadataHelper(
  "My Favorites",
  "View and manage your saved properties. Keep track of your favorite real estate listings all in one place.",
  null,
  {
    canonical: "/dashboard/favorites"
  }
);
