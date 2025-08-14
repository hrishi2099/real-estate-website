import type { MetadataRoute } from 'next'
<<<<<<< HEAD
import { getProperties } from '@/lib/properties';
=======
>>>>>>> a39292c552ade54da3e8cf4b38c762ba6ec31b0f

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  // Fetch dynamic property pages
  let propertyPages: MetadataRoute.Sitemap = []
  
  try {
<<<<<<< HEAD
    const properties = await getProperties(1000);
    
    propertyPages = properties.map((property) => ({
      url: `${baseUrl}/properties/${property.id}`,
      lastModified: new Date(property.updatedAt || property.createdAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
=======
    const response = await fetch(`${baseUrl}/api/properties?limit=1000`, {
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      propertyPages = data.properties.map((property: any) => ({
        url: `${baseUrl}/properties/${property.id}`,
        lastModified: new Date(property.updatedAt || property.createdAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
>>>>>>> a39292c552ade54da3e8cf4b38c762ba6ec31b0f
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error)
  }

  return [...staticPages, ...propertyPages]
}