import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const addImageSchema = z.object({
  url: z.string().url('Invalid URL'),
  filename: z.string().min(1, 'Filename is required'),
  isPrimary: z.boolean().default(false),
})

// POST /api/properties/[id]/images - Add images to property
export async function POST(
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
    const property = await prisma.property.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const images = Array.isArray(body) ? body : [body]

    // Validate each image
    const validatedImages = images.map(img => addImageSchema.parse(img))

    // If setting a new primary image, unset existing primary
    const hasPrimary = validatedImages.some(img => img.isPrimary)
    if (hasPrimary) {
      await prisma.propertyImage.updateMany({
        where: {
          propertyId: resolvedParams.id,
          isPrimary: true,
        },
        data: { isPrimary: false }
      })
    }

    // Create images
    const createdImages = await Promise.all(
      validatedImages.map(imageData =>
        prisma.propertyImage.create({
          data: {
            ...imageData,
            propertyId: resolvedParams.id,
          }
        })
      )
    )

    return NextResponse.json({
      message: 'Images added successfully',
      images: createdImages
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Add images error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/properties/[id]/images - Get property images
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const images = await prisma.propertyImage.findMany({
      where: { propertyId: resolvedParams.id },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Get images error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}