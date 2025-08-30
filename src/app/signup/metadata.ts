import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadataHelper(
  "Sign Up",
  "Create an account to save your favorite properties, get personalized alerts, and manage your real estate investments.",
  null,
  {
    canonical: "/signup"
  }
);
