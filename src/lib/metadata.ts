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
  officeSettings?: OfficeSettings | null
): Metadata {
  const companyName = officeSettings?.companyName || "Real Estate Platform";
  const baseTitle = title ? `${title} | ${companyName}` : `${companyName} - Premium Properties`;
  const baseDescription = description || `Professional real estate platform for buying, selling, and investing in premium properties. Browse luxury homes, condos, and land plots with expert guidance.`;
  const siteUrl = officeSettings?.website || process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  return {
    title: baseTitle,
    description: baseDescription,
    keywords: ["real estate", "properties", "homes", "luxury", "investment", "land", "condos", "apartments", "buy", "sell"],
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
      images: [
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
      images: ["/og-image.jpg"],
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
  };
}

// Default metadata for the main layout
export const defaultMetadata: Metadata = {
  title: {
    default: "Real Estate Platform - Premium Properties",
    template: "%s | Real Estate Platform"
  },
  description: "Professional real estate platform for buying, selling, and investing in premium properties. Browse luxury homes, condos, and land plots with expert guidance.",
  keywords: ["real estate", "properties", "homes", "luxury", "investment", "land", "condos", "apartments", "buy", "sell"],
  authors: [{ name: "Real Estate Platform" }],
  creator: "Real Estate Platform",
  publisher: "Real Estate Platform",
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
    siteName: "Real Estate Platform",
    title: "Real Estate Platform - Premium Properties",
    description: "Professional real estate platform for buying, selling, and investing in premium properties.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Real Estate Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Real Estate Platform - Premium Properties",
    description: "Professional real estate platform for buying, selling, and investing in premium properties.",
    images: ["/og-image.jpg"],
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  },
};