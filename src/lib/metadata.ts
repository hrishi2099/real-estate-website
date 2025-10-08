import type { Metadata } from "next";

interface OfficeSettings {
  companyName?: string;
  website?: string;
  email?: string;
  phone?: string;
}

export function generateMetadata(
  title?: string,
  description?: string,
  officeSettings?: OfficeSettings | null,
  options?: {
    canonical?: string;
    images?: string[];
    keywords?: string[];
  }
): Metadata {
  const companyName = officeSettings?.companyName || "Real Estate Platform";
  const baseTitle = title ? `${title} | ${companyName}` : `${companyName} - Premium Properties`;
  const baseDescription = description || `Premium real estate platform for NA plots and farmhouse land in Pune, Mumbai, and Satara, Maharashtra. Trusted property investments across Maharashtra with clear titles and expert guidance.`;
  const siteUrl = officeSettings?.website || process.env.NEXT_PUBLIC_SITE_URL || "https://zaminseva.com";

  return {
    title: baseTitle,
    description: baseDescription,
    keywords: options?.keywords || ["real estate Maharashtra", "properties Pune", "properties Mumbai", "properties Satara", "NA plots Maharashtra", "farmhouse land Pune", "land investment Mumbai", "agricultural land Satara", "Maharashtra real estate", "Pune land", "Mumbai plots", "Satara farmhouse", "Maharashtra properties", "real estate investment Maharashtra"],
    authors: [{ name: companyName }],
    creator: companyName,
    publisher: companyName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_IN", // Changed to India locale
      url: siteUrl,
      siteName: companyName,
      title: baseTitle,
      description: baseDescription,
      images: options?.images ? options.images.map(img => ({
        url: img,
        width: 1200,
        height: 630,
        alt: baseTitle,
      })) : [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: companyName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: baseTitle,
      description: baseDescription,
      images: options?.images || ["/og-image.jpg"],
      creator: "@realestate",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: options?.canonical ? new URL(options.canonical, siteUrl).toString() : siteUrl,
    },
  };
}

// Default metadata for the main layout
export const defaultMetadata: Metadata = {
  title: {
    default: "Zaminseva - Premium NA Plots & Farmhouse Land in Pune, Mumbai, Satara | Maharashtra",
    template: "%s | Zaminseva Maharashtra"
  },
  description: "Zaminseva - Premium NA plots & farmhouse land investments in Pune, Mumbai, and Satara, Maharashtra. Your trusted partner for exclusive real estate opportunities across Maharashtra with clear titles.",
  keywords: ["zaminseva", "Zaminseva Prime", "NA plots Maharashtra", "farmhouse land Pune", "real estate Mumbai", "properties Satara", "Maharashtra investment", "agricultural land Maharashtra", "Pune real estate", "Mumbai properties", "Satara land", "zaminseva.com", "Maharashtra real estate"],
  authors: [{ name: "Zaminseva Prime Pvt. Ltd." }],
  creator: "Zaminseva Prime Pvt. Ltd.",
  publisher: "Zaminseva Prime Pvt. Ltd.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: "website",
    locale: "en_IN", // Changed to India locale
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://zaminseva.com",
    siteName: "Zaminseva Maharashtra",
    title: "Zaminseva - Premium NA Plots & Farmhouse Land in Maharashtra",
    description: "Zaminseva - Premium NA plots & farmhouse land investments in Pune, Mumbai, and Satara, Maharashtra. Your trusted partner for exclusive real estate opportunities across Maharashtra with clear titles.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Zaminseva Prime Pvt. Ltd.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zaminseva - Premium NA Plots & Farmhouse Land in Maharashtra",
    description: "Zaminseva - Premium NA plots & farmhouse land investments in Pune, Mumbai, and Satara, Maharashtra. Your trusted partner for exclusive real estate opportunities across Maharashtra with clear titles.",
    images: ["/og-image.jpg"],
    creator: "@zaminseva",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://zaminseva.com"),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://zaminseva.com",
  },
};