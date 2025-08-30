import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadataHelper(
  "About Us",
  "Learn about our company's history, mission, and the experienced team dedicated to helping you find the perfect property investment opportunity.",
  null,
  {
    canonical: "/about",
    keywords: [
        'about real estate company',
        'real estate team',
        'our mission in real estate',
        'property investment experts'
    ]
  }
);
