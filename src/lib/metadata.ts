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
  const baseDescription = description || `Professional real estate platform for buying, selling, and investing in premium properties. Browse luxury homes, condos, and apartments with expert guidance.`;
  const siteUrl = officeSettings?.website || process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  return {
    title: baseTitle,
    description: baseDescription,
    keywords: options?.keywords || ["real estate", "properties", "homes", "luxury", "investment", "condos", "apartments", "villas", "buy", "sell"],
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
      locale: "en_US",
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
      canonical: options?.canonical || siteUrl,
    },
  };
}

// Default metadata for the main layout
export const defaultMetadata: Metadata = {
  title: {
    default: "Zaminseva Prime Pvt. Ltd. - NA Plots & Farmhouse Land",
    template: "%s | Zaminseva Prime Pvt. Ltd."
  },
  description: "Zaminseva Prime Pvt. Ltd. - Your trusted partner for NA plots and farmhouse land. We specialize in providing premium properties for investment and personal use.",
  keywords: ["real estate", "properties", "homes", "luxury", "investment", "condos", "apartments", "villas", "buy", "sell"],
  authors: [{ name: "Zaminseva Prime Pvt. Ltd." }],
  creator: "Zaminseva Prime Pvt. Ltd.",
  publisher: "Zaminseva Prime Pvt. Ltd.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
    siteName: "Zaminseva Prime Pvt. Ltd.",
    title: "Zaminseva Prime Pvt. Ltd. - NA Plots & Farmhouse Land",
    description: "Zaminseva Prime Pvt. Ltd. - Your trusted partner for NA plots and farmhouse land. We specialize in providing premium properties for investment and personal use.",
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
    title: "Zaminseva Prime Pvt. Ltd. - NA Plots & Farmhouse Land",
    description: "Zaminseva Prime Pvt. Ltd. - Your trusted partner for NA plots and farmhouse land. We specialize in providing premium properties for investment and personal use.",
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  },
};