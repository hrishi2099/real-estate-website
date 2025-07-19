import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { InquiryStatus } from '@prisma/client'


// GET /api/admin/inquiries - Get all inquiries (admin only)
export async function GET(request: NextRequest) {
  // Apply rate limiting
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const propertyId = searchParams.get('propertyId')

    const where: { status?: InquiryStatus; propertyId?: string } = {}
    if (status) where.status = status as InquiryStatus
    if (propertyId) where.propertyId = propertyId

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              location: true,
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiry.count({ where })
    ])

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Get inquiries error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}