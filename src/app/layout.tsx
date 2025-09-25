import type { Metadata } from "next";
import { Playfair_Display, Montserrat, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import "../styles/editor.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ContactPopupWrapper from "@/components/ContactPopupWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import { defaultMetadata } from "@/lib/metadata";
import { getSettings } from "@/lib/settings";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import StructuredData from "@/components/StructuredData";
import OptimizedResourceLoader from "@/components/OptimizedResourceLoader";
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
    "@type": "RealEstateAgent",
    "name": settings?.companyName || "Zaminseva Prime Pvt. Ltd.",
    "alternateName": "Zaminseva",
    "url": siteUrl,
    "logo": settings?.logoUrl,
    "description": "Zaminseva - Premium real estate company specializing in NA plots and farmhouse land investments in Pune, Mumbai, and Satara, Maharashtra",
    "foundingDate": "2024",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "Maharashtra",
      "addressLocality": "Pune, Mumbai, Satara",
      "addressCountry": "IN"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Pune",
        "containedInPlace": {
          "@type": "State",
          "name": "Maharashtra",
          "containedInPlace": {
            "@type": "Country",
            "name": "India"
          }
        }
      },
      {
        "@type": "City",
        "name": "Mumbai",
        "containedInPlace": {
          "@type": "State",
          "name": "Maharashtra",
          "containedInPlace": {
            "@type": "Country",
            "name": "India"
          }
        }
      },
      {
        "@type": "City",
        "name": "Satara",
        "containedInPlace": {
          "@type": "State",
          "name": "Maharashtra",
          "containedInPlace": {
            "@type": "Country",
            "name": "India"
          }
        }
      }
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": settings?.phone,
      "contactType": "Customer Service",
      "email": settings?.email,
      "areaServed": "Maharashtra, India"
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
    <html lang="en-IN">
      <head>
        <meta name="geo.region" content="IN-MH" />
        <meta name="geo.placename" content="Maharashtra, India" />
        <meta name="geo.position" content="19.0760;72.8777" />
        <meta name="ICBM" content="19.0760, 72.8777" />
        <meta name="DC.title" content="Zaminseva - Real Estate in Pune, Mumbai, Satara, Maharashtra" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="Pune, Mumbai, Satara" />
        <link rel="manifest" href="/manifest.json" />
        <OptimizedResourceLoader />
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
          <ContactPopupWrapper settings={settings} />
        </AuthProvider>
      </body>
    </html>
  );
}
