import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'

interface UpdateData {
  updatedAt: Date;
  salesManagerId?: string | null;
  assignedAt?: Date | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  responseDeadline?: Date;
  notes?: string;
}

export async function POST(request: NextRequest) {
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

    const { inquiryIds, salesManagerId, priority, responseDeadline, notes } = await request.json()

    if (!inquiryIds || !Array.isArray(inquiryIds) || inquiryIds.length === 0) {
      return NextResponse.json(
        { error: 'Inquiry IDs are required' },
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
            { role: 'USER' }
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
    const updateData: UpdateData = {
      updatedAt: new Date()
    }

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

    // Update multiple inquiries
    const result = await prisma.contactInquiry.updateMany({
      where: {
        id: {
          in: inquiryIds
        }
      },
      data: updateData
    })

    // Get updated inquiries with sales manager info
    const updatedInquiries = await prisma.contactInquiry.findMany({
      where: {
        id: {
          in: inquiryIds
        }
      },
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
      updatedCount: result.count,
      inquiries: updatedInquiries
    })
  } catch (error) {
    console.error('Assign contact inquiries error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Auto-distribution endpoint
export async function PUT(request: NextRequest) {
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

    // Get unassigned contact inquiries
    const unassignedInquiries = await prisma.contactInquiry.findMany({
      where: {
        salesManagerId: null,
        status: 'NEW'
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    if (unassignedInquiries.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unassigned inquiries found',
        distributedCount: 0
      })
    }

    // Get available sales managers (users with territory or admins)
    const salesManagers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ADMIN' },
          { 
            role: 'USER',
            territory: { not: null }
          }
        ],
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        territory: true,
        assignedContactInquiries: {
          where: {
            status: {
              in: ['NEW', 'REVIEWED']
            }
          }
        }
      }
    })

    if (salesManagers.length === 0) {
      return NextResponse.json(
        { error: 'No available sales managers found' },
        { status: 400 }
      )
    }

    // Simple round-robin distribution
    const distributionResults = []
    let currentManagerIndex = 0

    for (const inquiry of unassignedInquiries) {
      const selectedManager = salesManagers[currentManagerIndex]
      
      const updatedInquiry = await prisma.contactInquiry.update({
        where: { id: inquiry.id },
        data: {
          salesManagerId: selectedManager.id,
          assignedAt: new Date(),
          status: 'REVIEWED',
          updatedAt: new Date()
        },
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

      distributionResults.push(updatedInquiry)
      
      // Move to next manager (round-robin)
      currentManagerIndex = (currentManagerIndex + 1) % salesManagers.length
    }

    return NextResponse.json({
      success: true,
      message: `Successfully distributed ${distributionResults.length} inquiries`,
      distributedCount: distributionResults.length,
      inquiries: distributionResults
    })
  } catch (error) {
    console.error('Auto-distribute contact inquiries error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}