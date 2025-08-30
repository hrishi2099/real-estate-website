import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadataHelper(
  "Login to Your Account",
  "Sign in to your account to access your dashboard, saved properties, and personalized real estate services.",
  null,
  {
    canonical: "/login"
  }
);
