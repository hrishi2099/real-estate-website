import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Zaminseva Prime - Get in Touch",
  description: "Contact Zaminseva Prime for all your real estate needs. Our expert team is ready to assist you with buying, selling, or investing in properties. Reach out to us today!",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zaminseva.com'}/contact`,
  },
  openGraph: {
    title: "Contact Us | Zaminseva Prime - Get in Touch",
    description: "Contact Zaminseva Prime for all your real estate needs. Our expert team is ready to assist you with buying, selling, or investing in properties. Reach out to us today!",
  },
};