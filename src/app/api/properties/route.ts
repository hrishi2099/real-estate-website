import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { getMockProperties } from '@/lib/mock-data'
import { z } from 'zod'

const createPropertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'TOWNHOUSE', 'COMMERCIAL', 'LAND']),
  status: z.enum(['ACTIVE', 'SOLD', 'PENDING', 'INACTIVE']).optional(),
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
      const where: any = {}

      if (type) where.type = type
      if (status) where.status = status
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
            owner: {
              select: { name: true, email: true }
            },
            images: true,
            _count: {
              select: {
                inquiries: true,
                favorites: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.property.count({ where })
      ])

      const propertiesWithDetails = properties.map(property => {
        // Parse features safely - handle both JSON and comma-separated formats
        let parsedFeatures = [];
        if (property.features) {
          try {
            parsedFeatures = JSON.parse(property.features);
          } catch (parseError) {
            // If it's not valid JSON, treat it as comma-separated string
            parsedFeatures = property.features.split(',').map(f => f.trim()).filter(f => f.length > 0);
          }
        }
        
        return {
          ...property,
          features: parsedFeatures,
        };
      })

      return NextResponse.json({
        properties: propertiesWithDetails,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      })
    } catch (dbError) {
      console.log('Database unavailable, using mock data for properties list');
      
      // Fallback to mock data with filtering
      const mockData = getMockProperties();
      let filteredProperties = mockData.properties;
      
      // Apply featured filter to mock data
      if (featured === 'true') {
        filteredProperties = mockData.properties.filter(p => p.isFeatured === true);
      }
      
      // Apply other filters to mock data
      if (type) {
        filteredProperties = filteredProperties.filter(p => p.type === type);
      }
      if (status) {
        filteredProperties = filteredProperties.filter(p => p.status === status);
      }
      if (location) {
        filteredProperties = filteredProperties.filter(p => 
          p.location.toLowerCase().includes(location.toLowerCase())
        );
      }
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const paginatedProperties = filteredProperties.slice(startIndex, startIndex + limit);
      
      return NextResponse.json({
        properties: paginatedProperties,
        pagination: {
          page,
          limit,
          total: filteredProperties.length,
          totalPages: Math.ceil(filteredProperties.length / limit),
        },
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
        status: data.status || 'ACTIVE',
        ownerId: userPayload.userId,
      },
      include: {
        owner: {
          select: { name: true, email: true }
        },
        images: true,
      }
    })

    // Parse features safely for response
    let parsedFeatures = [];
    if (property.features) {
      try {
        parsedFeatures = JSON.parse(property.features);
      } catch (parseError) {
        parsedFeatures = property.features.split(', ').map(f => f.trim()).filter(f => f.length > 0);
      }
    }

    return NextResponse.json({
      message: 'Property created successfully',
      property: {
        ...property,
        features: parsedFeatures,
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