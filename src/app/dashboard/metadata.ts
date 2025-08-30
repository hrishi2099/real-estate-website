import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadataHelper(
  "Dashboard",
  "Access your personal dashboard to manage your property investments, track your favorite listings, and view recent activity.",
  null,
  {
    canonical: "/dashboard"
  }
);
