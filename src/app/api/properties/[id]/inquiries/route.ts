import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const createInquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
})

// POST /api/properties/[id]/inquiries - Create inquiry for property
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json()
    const data = createInquirySchema.parse(body)

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

    // Get user if authenticated
    const userPayload = getUserFromRequest(request)

    const inquiry = await prisma.inquiry.create({
      data: {
        ...data,
        propertyId: resolvedParams.id,
        userId: userPayload?.userId,
      },
      include: {
        property: {
          select: {
            title: true,
            price: true,
            location: true,
          }
        }
      }
    })

    // Create analytics record
    await prisma.propertyAnalytics.create({
      data: {
        propertyId: resolvedParams.id,
        event: 'CONTACT',
        userId: userPayload?.userId,
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                  request.headers.get('x-real-ip') || 'unknown',
      }
    }).catch(() => {
      // Silently fail analytics
    })

    return NextResponse.json({
      message: 'Inquiry submitted successfully',
      inquiry
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create inquiry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/properties/[id]/inquiries - Get inquiries for property (admin only)
export async function GET(
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

    const inquiries = await prisma.inquiry.findMany({
      where: { propertyId: resolvedParams.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ inquiries })
  } catch (error) {
    console.error('Get inquiries error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}