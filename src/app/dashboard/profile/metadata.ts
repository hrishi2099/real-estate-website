import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadataHelper(
  "My Profile",
  "View and manage your profile information, including your name, email, and phone number.",
  null,
  {
    canonical: "/dashboard/profile"
  }
);
