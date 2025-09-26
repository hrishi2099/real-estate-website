import type { MetadataRoute } from 'next'
import { getSitemapProperties } from '@/lib/properties';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaminseva.com'

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date('2024-12-15'),
      changeFrequency: 'weekly' as const,
      priority: 1,

    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date('2024-12-20'),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2024-12-10'),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date('2024-12-01'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date('2024-11-25'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date('2024-12-15'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date('2024-12-15'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date('2024-11-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date('2024-11-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    // Location-specific pages for geo-targeting
    {
      url: `${baseUrl}/properties?location=pune`,
      lastModified: new Date('2024-12-20'),
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/properties?location=mumbai`,
      lastModified: new Date('2024-12-20'),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/properties?location=satara`,
      lastModified: new Date('2024-12-20'),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/properties?location=maharashtra`,
      lastModified: new Date('2024-12-20'),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    // Category-specific pages
    {
      url: `${baseUrl}/properties?cat_slug=na-plot`,
      lastModified: new Date('2024-12-18'),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/properties?cat_slug=farmhouse`,
      lastModified: new Date('2024-12-18'),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/properties?cat_slug=gated-community`,
      lastModified: new Date('2024-12-18'),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/properties?cat_slug=villa`,
      lastModified: new Date('2024-12-18'),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/properties?cat_slug=eco-estate`,
      lastModified: new Date('2024-12-18'),
      changeFrequency: 'daily' as const,
      priority: 0.75,
    },
  ]

  let propertyPages: MetadataRoute.Sitemap = []
  try {
    const properties = await getSitemapProperties();

    propertyPages = properties.map((property) => ({
      url: `${baseUrl}/properties/${property.id}`,
      lastModified: property.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error);
  }

  return [...staticPages, ...propertyPages]
}