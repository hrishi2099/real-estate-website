import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { AuthProvider } from "@/contexts/AuthContext";
import { defaultMetadata } from "@/lib/metadata";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = defaultMetadata;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  );
}
