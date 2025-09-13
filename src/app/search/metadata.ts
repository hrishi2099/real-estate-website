import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Properties | Zaminseva Prime - Find Your Plot",
  description: "Search for your perfect property with Zaminseva Prime. Use our advanced search tools to find NA plots and farmhouse lands that match your criteria.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zaminseva.com'}/search`,
  },
  openGraph: {
    title: "Search Properties | Zaminseva Prime - Find Your Plot",
    description: "Search for your perfect property with Zaminseva Prime. Use our advanced search tools to find NA plots and farmhouse lands that match your criteria.",
  },
};