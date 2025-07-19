import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { z } from 'zod'

const updateInquirySchema = z.object({
  status: z.enum(['PENDING', 'RESPONDED', 'CLOSED']),
})

// PUT /api/admin/inquiries/[id] - Update inquiry status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(rateLimitConfigs.adminStrict)(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const resolvedParams = await params;
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
    const { status } = updateInquirySchema.parse(body)

    // Check if inquiry exists
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingInquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      )
    }

    const inquiry = await prisma.inquiry.update({
      where: { id: resolvedParams.id },
      data: { status },
      include: {
        property: {
          select: {
            title: true,
            price: true,
            location: true,
          }
        },
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Inquiry updated successfully',
      inquiry
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Update inquiry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/inquiries/[id] - Delete inquiry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(rateLimitConfigs.adminStrict)(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const resolvedParams = await params;
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

    // Check if inquiry exists
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingInquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      )
    }

    await prisma.inquiry.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Inquiry deleted successfully'
    })
  } catch (error) {
    console.error('Delete inquiry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}