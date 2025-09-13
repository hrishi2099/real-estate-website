import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Dashboard | Zaminseva Prime",
  description: "Sales dashboard for Zaminseva Prime team members. Monitor leads, deals, and performance.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zaminseva.com'}/sales`,
  },
  robots: {
    index: false, // This page is behind authentication, so it should not be indexed
    follow: false,
  },
};