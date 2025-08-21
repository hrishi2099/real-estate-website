import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { defaultMetadata } from "@/lib/metadata";
import { getSettings } from "@/lib/settings";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import { Suspense } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = defaultMetadata;

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
          <LayoutWrapper settings={settings}>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
