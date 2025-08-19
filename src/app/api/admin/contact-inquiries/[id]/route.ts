import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { ContactInquiryStatus } from '@prisma/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rateLimitResponse = rateLimit(rateLimitConfigs.admin)(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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

    const { status, salesManagerId, priority, responseDeadline, notes } = await request.json()

    // Validate status if provided
    if (status && !Object.values(ContactInquiryStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: NEW, REVIEWED, RESPONDED, CLOSED' },
        { status: 400 }
      )
    }

    // Validate sales manager if provided
    if (salesManagerId) {
      const salesManager = await prisma.user.findFirst({
        where: { 
          id: salesManagerId,
          OR: [
            { role: 'ADMIN' },
            { role: 'USER' } // Assuming sales managers might have USER role with specific territory
          ]
        }
      })

      if (!salesManager) {
        return NextResponse.json(
          { error: 'Invalid sales manager' },
          { status: 400 }
        )
      }
    }

    // Validate priority if provided
    if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be one of: LOW, MEDIUM, HIGH' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (status) updateData.status = status as ContactInquiryStatus
    if (salesManagerId !== undefined) {
      updateData.salesManagerId = salesManagerId
      if (salesManagerId) {
        updateData.assignedAt = new Date()
      } else {
        updateData.assignedAt = null
      }
    }
    if (priority) updateData.priority = priority
    if (responseDeadline) updateData.responseDeadline = new Date(responseDeadline)
    if (notes !== undefined) updateData.notes = notes

    const contactInquiry = await prisma.contactInquiry.update({
      where: { id },
      data: updateData,
      include: {
        salesManager: {
          select: {
            id: true,
            name: true,
            email: true,
            territory: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      contactInquiry
    })
  } catch (error: unknown) {
    console.error('Update contact inquiry error:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Contact inquiry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rateLimitResponse = rateLimit(rateLimitConfigs.admin)(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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

    const contactInquiry = await prisma.contactInquiry.findUnique({
      where: { id }
    })

    if (!contactInquiry) {
      return NextResponse.json(
        { error: 'Contact inquiry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      contactInquiry
    })
  } catch (error) {
    console.error('Get contact inquiry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}