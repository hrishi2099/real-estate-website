// src/lib/properties.ts
import { prisma } from '@/lib/prisma';

export async function getProperties(limit: number = 1000) {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    return properties;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}
