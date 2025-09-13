import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Gallery | Zaminseva Prime - Visual Showcase",
  description: "Explore our property gallery and visualize your next investment. A stunning collection of images from our premium NA plots and farmhouse lands.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zaminseva.com'}/gallery`,
  },
  openGraph: {
    title: "Property Gallery | Zaminseva Prime - Visual Showcase",
    description: "Explore our property gallery and visualize your next investment. A stunning collection of images from our premium NA plots and farmhouse lands.",
  },
};