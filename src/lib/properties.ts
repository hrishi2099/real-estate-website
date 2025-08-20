// src/lib/properties.ts
import { prisma } from '@/lib/prisma';
import { PropertyStatus, PropertyType, Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';

interface GetPropertiesOptions {
  limit?: number;
  page?: number;
  filters?: {
    type?: PropertyType;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
  };
  sortBy?: 'createdAt' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export async function getProperties(options: GetPropertiesOptions = {}) {
  const {
    limit = 10,
    page = 1,
    filters = {},
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  try {
    const where: Prisma.PropertyWhereInput = {
      status: PropertyStatus.ACTIVE,
    };

    if (filters.type) where.type = filters.type;
    if (filters.location) where.location = { contains: filters.location };
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }
    if (filters.minArea) where.area = { gte: filters.minArea };

    const [properties, total] = await prisma.$transaction([
      prisma.property.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [sortBy]: sortOrder },
        include: { images: { where: { isPrimary: true }, take: 1 } },
      }),
      prisma.property.count({ where }),
    ]);

    const serializedProperties = properties.map((p) => ({
      ...p,
      price: p.price.toNumber(),
      area: p.area?.toNumber(),
    }));

    return {
      properties: serializedProperties,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error('Error fetching properties:', error);
    // During a production build, it's better to fail loudly if the database is unreachable.
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return {
      properties: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  }
}

/**
 * Fetches featured properties for the home page.
 * Tries to get 3 properties marked as 'featured'.
 * If none are found, it falls back to the 3 most recent available properties.
 */
export const getFeaturedProperties = unstable_cache(
  async () => {
    let properties = await prisma.property.findMany({
      where: { isFeatured: true, status: PropertyStatus.ACTIVE },
      take: 3,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        images: true,
      },
    });

    let isFeatured = true;

    if (properties.length === 0) {
      isFeatured = false;
      properties = await prisma.property.findMany({
        where: { status: PropertyStatus.ACTIVE },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { images: true },
      });
    }

    // Serialize Decimal fields to numbers to prevent issues in components.
    // Prisma returns 'Decimal' types for decimal fields, which are not directly
    // usable as numbers in components.
    const serializedProperties = properties.map((p) => ({
      ...p,
      price: p.price.toNumber(),
      area: p.area?.toNumber(),
    }));

    return { properties: serializedProperties, isFeatured };
  },
  ['featured-properties'], // Cache key
  {
    tags: ['properties', 'featured-properties'], // Tags for revalidation
  }
);

/**
 * Fetches a single property by its ID.
 * @param id The ID of the property to fetch.
 * @returns The property object or null if not found.
 */
export async function getProperty(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!property) {
    return null;
  }

  // Serialize Decimal and JSON fields
  return {
    ...property,
    price: property.price.toNumber(),
    area: property.area?.toNumber(),
    latitude: property.latitude?.toNumber(),
    longitude: property.longitude?.toNumber(),
    features: property.features ? JSON.parse(property.features) : [],
  };
}

/**
 * Fetches all active property IDs and their last update time for sitemap generation.
 * This is optimized to only fetch necessary data.
 * @returns An array of properties with id and updatedAt.
 */
export async function getSitemapProperties() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: PropertyStatus.ACTIVE,
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });
    return properties;
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error);
    return [];
  }
}
