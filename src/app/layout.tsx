import type { Metadata } from "next";
import { Playfair_Display, Montserrat, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import "../styles/editor.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { AuthProvider } from "@/contexts/AuthContext";
import { defaultMetadata } from "@/lib/metadata";
import { getSettings } from "@/lib/settings";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import StructuredData from "@/components/StructuredData";
import { Suspense } from "react";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  ...defaultMetadata,
  icons: {
    icon: '/2zameen seva2 (1) (1).png', // Path to your PNG favicon in the public directory
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  const siteUrl = settings?.website || process.env.NEXT_PUBLIC_SITE_URL || 'https://zaminseva.com';

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": settings?.companyName || "Zaminseva Prime Pvt. Ltd.",
    "alternateName": "Zaminseva",
    "url": siteUrl,
    "logo": settings?.logoUrl,
    "description": "Zaminseva - Premium real estate company specializing in NA plots and farmhouse land investments",
    "foundingDate": "2024",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "India",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": settings?.phone,
      "contactType": "Customer Service",
      "email": settings?.email
    },
    "sameAs": [
      "https://zaminseva.com"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/properties?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${sourceSans.variable} ${montserrat.variable} ${playfairDisplay.variable} font-sans antialiased force-light-mode`}>
        <StructuredData data={organizationSchema} />
        <StructuredData data={websiteSchema} />
        {settings && <AnalyticsScripts settings={settings} />}
        <AuthProvider>
          <Header settings={settings} />
          <main>{children}</main>
          <Footer settings={settings} />
          {settings?.phone && <WhatsAppButton settings={settings} />}
        </AuthProvider>
      </body>
    </html>
  );
}
