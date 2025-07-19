import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PropertyStatus, PropertyType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const where: {
      property: {
        status: PropertyStatus;
        type?: PropertyType;
        OR?: Array<{
          title?: { contains: string; mode: 'insensitive' };
          location?: { contains: string; mode: 'insensitive' };
        }>;
      };
    } = {
      property: {
        status: PropertyStatus.ACTIVE // Only show images from active properties
      }
    };

    // Filter by property type
    if (type) {
      where.property.type = type as PropertyType;
    }

    // Search in property title or location
    if (search) {
      where.property.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [images, total] = await Promise.all([
      prisma.propertyImage.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              location: true,
              type: true,
            }
          }
        },
        orderBy: [
          { isPrimary: 'desc' }, // Primary images first
          { createdAt: 'desc' }   // Then newest first
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.propertyImage.count({ where })
    ]);

    return NextResponse.json({
      images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}