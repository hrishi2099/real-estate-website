import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    interface WhereClause {
  status?: 'ACTIVE' | 'SOLD' | 'PENDING';
  type?: 'AGRICULTURAL_LAND' | 'NA_LAND';
  location?: {
    contains: string;
    mode: 'insensitive';
  };
  price?: {
    gte?: number;
    lte?: number;
  };
}

    // Build where clause
    const where: WhereClause = {};
    
    if (status && status !== 'all') {
      where.status = status as 'ACTIVE' | 'SOLD' | 'PENDING';
    }
    
    if (type && type !== 'all') {
      where.type = type as 'AGRICULTURAL_LAND' | 'NA_LAND';
    }
    
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive'
      };
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data for export
    const exportData = properties.map(property => ({
      id: property.id,
      title: property.title,
      price: Number(property.price),
      location: property.location,
      address: property.address,
      type: property.type,
      status: property.status,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area ? Number(property.area) : undefined,
      yearBuilt: property.yearBuilt,
      features: property.features,
      latitude: property.latitude ? Number(property.latitude) : undefined,
      longitude: property.longitude ? Number(property.longitude) : undefined,
      ownerId: property.ownerId,
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString()
    }));

    return NextResponse.json({
      data: exportData,
      count: exportData.length,
      exportedAt: new Date().toISOString(),
      filters: {
        status,
        type,
        location,
        minPrice,
        maxPrice
      }
    });

  } catch (error) {
    console.error('Error exporting properties:', error);
    return NextResponse.json(
      { error: 'Failed to export properties' },
      { status: 500 }
    );
  }
}