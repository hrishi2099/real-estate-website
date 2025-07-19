import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { ContactInquiryStatus } from '@prisma/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const { status } = await request.json()

    if (!status || !Object.values(ContactInquiryStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: NEW, REVIEWED, RESPONDED, CLOSED' },
        { status: 400 }
      )
    }

    const contactInquiry = await prisma.contactInquiry.update({
      where: { id },
      data: { 
        status: status as ContactInquiryStatus,
        updatedAt: new Date()
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
  { params }: { params: { id: string } }
) {
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

    const { id } = params

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