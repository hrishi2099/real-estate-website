import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { getMockProperty } from '@/lib/mock-data'
import { z } from 'zod'

const updatePropertySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  location: z.string().min(1).optional(),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'TOWNHOUSE', 'COMMERCIAL', 'LAND']).optional(),
  status: z.enum(['ACTIVE', 'SOLD', 'PENDING', 'INACTIVE']).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  area: z.number().positive().optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  features: z.array(z.string()).optional(),
})

// GET /api/properties/[id] - Get single property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // Try database first, fallback to mock data if database unavailable
    try {
      const property = await prisma.property.findUnique({
        where: { id: resolvedParams.id },
        include: {
          images: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              inquiries: true,
              favorites: true,
            }
          }
        }
      })
      

      if (!property) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        )
      }

      // Track view analytics
      const userPayload = getUserFromRequest(request)
      const userAgent = request.headers.get('user-agent')
      const forwardedFor = request.headers.get('x-forwarded-for')
      const realIp = request.headers.get('x-real-ip')
      const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'

      // Create analytics record
      await prisma.propertyAnalytics.create({
        data: {
          propertyId: property.id,
          event: 'VIEW',
          userId: userPayload?.userId,
          userAgent: userAgent || undefined,
          ipAddress,
        }
      }).catch(() => {
        // Silently fail analytics to not affect main request
      })

      // Parse features safely
      let parsedFeatures = [];
      if (property.features) {
        try {
          parsedFeatures = JSON.parse(property.features);
        } catch (parseError) {
          // If it's not valid JSON, treat it as comma-separated string
          parsedFeatures = property.features.split(',').map(f => f.trim()).filter(f => f.length > 0);
        }
      }

      return NextResponse.json({
        property: {
          ...property,
          features: parsedFeatures,
        }
      })
    } catch (dbError) {
      console.log('Database unavailable, using mock data for property:', resolvedParams.id);
      
      // Fallback to mock data
      const mockProperty = getMockProperty(resolvedParams.id);
      
      if (!mockProperty) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        property: mockProperty,
        mockData: true
      })
    }
  } catch (error) {
    console.error('Get property error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/properties/[id] - Update property (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
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
    const data = updatePropertySchema.parse(body)

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const property = await prisma.property.update({
      where: { id: resolvedParams.id },
      data: {
        ...data,
        features: data.features ? JSON.stringify(data.features) : undefined,
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

    // Parse features safely for response
    let parsedFeatures = [];
    if (property.features) {
      try {
        parsedFeatures = JSON.parse(property.features);
      } catch (parseError) {
        parsedFeatures = property.features.split(',').map(f => f.trim()).filter(f => f.length > 0);
      }
    }

    return NextResponse.json({
      message: 'Property updated successfully',
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

    console.error('Update property error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id] - Delete property (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
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

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    await prisma.property.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Property deleted successfully'
    })
  } catch (error) {
    console.error('Delete property error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}