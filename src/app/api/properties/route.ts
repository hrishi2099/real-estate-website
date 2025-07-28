import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { getMockProperties } from '@/lib/mock-data'
import { z } from 'zod'
import { PropertyType, PropertyStatus } from '@prisma/client'

const createPropertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'TOWNHOUSE', 'COMMERCIAL', 'LAND']),
  isFeatured: z.boolean().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  area: z.number().positive().optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  features: z.array(z.string()).optional(),
})

// GET /api/properties - List properties with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const location = searchParams.get('location')
    const bedrooms = searchParams.get('bedrooms')
    const bathrooms = searchParams.get('bathrooms')
    const minArea = searchParams.get('minArea')

    // Try database first, fallback to mock data if unavailable
    try {
      const where: {
        type?: PropertyType;
        status?: PropertyStatus;
        isFeatured?: boolean;
        location?: { contains: string; mode: 'insensitive' };
        bedrooms?: number;
        bathrooms?: number;
        price?: { gte?: number; lte?: number };
        area?: { gte: number };
      } = {}

      if (type) where.type = type as PropertyType
      if (status) where.status = status as PropertyStatus
      if (featured) where.isFeatured = featured === 'true'
      if (location) where.location = { contains: location, mode: 'insensitive' }
      if (bedrooms) where.bedrooms = parseInt(bedrooms)
      if (bathrooms) where.bathrooms = parseFloat(bathrooms)
      
      if (minPrice || maxPrice) {
        where.price = {}
        if (minPrice) where.price.gte = parseFloat(minPrice)
        if (maxPrice) where.price.lte = parseFloat(maxPrice)
      }

      if (minArea) {
        where.area = { gte: parseFloat(minArea) }
      }

      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where,
          include: {
            images: true,
            _count: {
              select: {
                inquiries: true,
                favorites: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.property.count({ where })
      ])

      return NextResponse.json({
        properties: properties.map(property => ({
          ...property,
          features: property.features ? JSON.parse(property.features) : [],
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      })
    } catch (dbError) {
      console.log('Database unavailable, using mock data for properties list');
      
      // Fallback to mock data
      const mockData = getMockProperties();
      
      return NextResponse.json({
        ...mockData,
        mockData: true
      })
    }
  } catch (error) {
    console.error('Get properties error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/properties - Create new property (admin only)
export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (userPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = createPropertySchema.parse(body)

    const property = await prisma.property.create({
      data: {
        ...data,
        features: data.features ? JSON.stringify(data.features) : null,
        ownerId: userPayload.userId,
      },
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Property created successfully',
      property: {
        ...property,
        features: property.features ? JSON.parse(property.features) : [],
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create property error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}