import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { AuthProvider } from "@/contexts/AuthContext";
import { defaultMetadata } from "@/lib/metadata";
import { getSettings } from "@/lib/settings";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
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
  maximumScale: 5,
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

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased force-light-mode`}>
        <Suspense>
          {settings && <AnalyticsScripts settings={settings} />}
        </Suspense>
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
