import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service - Zaminseva Prime | Real Estate Terms & Conditions",
  description: "Read Zaminseva Prime's comprehensive Terms of Service for real estate services, property transactions, and legal guidelines. Your rights and responsibilities explained clearly.",
  keywords: [
    "zaminseva terms of service",
    "real estate terms conditions",
    "zaminseva prime legal",
    "property transaction terms",
    "real estate legal agreement",
    "zaminseva user agreement",
    "property investment terms",
    "real estate service terms"
  ],
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
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/terms-of-service`
      : "https://zaminseva.com/terms-of-service",
  },
  openGraph: {
    title: "Terms of Service - Zaminseva Prime",
    description: "Comprehensive terms and conditions for Zaminseva Prime real estate services and property transactions.",
    url: process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/terms-of-service`
      : "https://zaminseva.com/terms-of-service",
    siteName: "Zaminseva Prime",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - Zaminseva Prime",
    description: "Read our comprehensive terms and conditions for real estate services and property transactions.",
  },
};