import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
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

    // Get inquiry statistics
    const [
      totalInquiries,
      unassignedInquiries,
      newInquiries,
      reviewedInquiries,
      respondedInquiries,
      closedInquiries,
      salesManagers
    ] = await Promise.all([
      prisma.contactInquiry.count(),
      prisma.contactInquiry.count({ where: { salesManagerId: null } }),
      prisma.contactInquiry.count({ where: { status: 'NEW' } }),
      prisma.contactInquiry.count({ where: { status: 'REVIEWED' } }),
      prisma.contactInquiry.count({ where: { status: 'RESPONDED' } }),
      prisma.contactInquiry.count({ where: { status: 'CLOSED' } }),
      prisma.user.findMany({
        where: {
          OR: [
            { role: 'ADMIN' },
            { role: 'SALES_MANAGER' }
          ],
          status: 'ACTIVE'
        },
        select: {
          id: true,
          name: true,
          email: true,
          territory: true,
          assignedContactInquiries: {
            select: {
              id: true,
              status: true
            }
          }
        }
      })
    ])

    // Calculate manager workloads
    const managerWorkloads = salesManagers.map(manager => {
      const assignedInquiries = manager.assignedContactInquiries
      return {
        managerId: manager.id,
        managerName: manager.name,
        email: manager.email,
        territory: manager.territory,
        totalAssigned: assignedInquiries.length,
        newCount: assignedInquiries.filter(i => i.status === 'NEW').length,
        reviewedCount: assignedInquiries.filter(i => i.status === 'REVIEWED').length,
        respondedCount: assignedInquiries.filter(i => i.status === 'RESPONDED').length,
        closedCount: assignedInquiries.filter(i => i.status === 'CLOSED').length,
      }
    })

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentActivity = await prisma.contactInquiry.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        id: true,
        name: true,
        subject: true,
        status: true,
        createdAt: true,
        salesManager: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Get priority distribution
    const priorityStats = await prisma.contactInquiry.groupBy({
      by: ['priority'],
      _count: {
        priority: true
      },
      where: {
        priority: {
          not: null
        }
      }
    })

    const stats = {
      overview: {
        totalInquiries,
        unassignedInquiries,
        assignedInquiries: totalInquiries - unassignedInquiries,
        newInquiries,
        reviewedInquiries,
        respondedInquiries,
        closedInquiries
      },
      managerWorkloads,
      recentActivity,
      priorityDistribution: priorityStats.reduce((acc, stat) => {
        acc[stat.priority || 'NORMAL'] = stat._count.priority
        return acc
      }, {} as Record<string, number>),
      responseTime: {
        // Calculate average response time (placeholder for now)
        averageHours: 24,
        within24Hours: Math.floor(respondedInquiries * 0.7),
        within48Hours: Math.floor(respondedInquiries * 0.9)
      }
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Get contact inquiry stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
