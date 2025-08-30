import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadataHelper(
  "Contact Us",
  "Get in touch with our expert real estate team for any inquiries about buying, selling, or investing in properties. Contact us today for a free consultation.",
  null,
  {
    canonical: "/contact",
    keywords: [
        'contact real estate agent',
        'real estate inquiries',
        'property consultation',
        'buy a house contact',
        'sell a house contact'
    ]
  }
);
