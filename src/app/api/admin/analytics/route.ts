import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { analyticsQuerySchema, validateQueryParams } from '@/lib/validation'

// GET /api/admin/analytics - Get analytics dashboard data
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
    
    // Validate query parameters
    const queryValidation = validateQueryParams(analyticsQuerySchema, Object.fromEntries(searchParams));
    if (!queryValidation.success) {
      return NextResponse.json(
        { error: queryValidation.error, details: queryValidation.details },
        { status: 400 }
      )
    }
    
    const { timeframe } = queryValidation.data

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get basic stats
    const [
      totalProperties,
      activeProperties,
      totalUsers,
      activeUsers,
      totalInquiries,
      pendingInquiries,
      totalViews,
      recentViews,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'PENDING' } }),
      prisma.propertyAnalytics.count({ where: { event: 'VIEW' } }),
      prisma.propertyAnalytics.count({
        where: {
          event: 'VIEW',
          createdAt: { gte: startDate }
        }
      }),
    ])

    // Get top properties by views
    const topProperties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        location: true,
        _count: {
          select: {
            analytics: {
              where: {
                event: 'VIEW',
                createdAt: { gte: startDate }
              }
            },
            inquiries: {
              where: {
                createdAt: { gte: startDate }
              }
            }
          }
        }
      },
      orderBy: {
        analytics: {
          _count: 'desc'
        }
      },
      take: 10
    })

    // Get monthly stats for the last 6 months
    const monthlyStats = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const [views, inquiries, newUsers, newProperties] = await Promise.all([
        prisma.propertyAnalytics.count({
          where: {
            event: 'VIEW',
            createdAt: { gte: monthStart, lte: monthEnd }
          }
        }),
        prisma.inquiry.count({
          where: {
            createdAt: { gte: monthStart, lte: monthEnd }
          }
        }),
        prisma.user.count({
          where: {
            joinDate: { gte: monthStart, lte: monthEnd }
          }
        }),
        prisma.property.count({
          where: {
            createdAt: { gte: monthStart, lte: monthEnd }
          }
        }),
      ])

      monthlyStats.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        views,
        inquiries,
        newUsers,
        newProperties,
      })
    }

    // Get conversion rates
    const totalContacts = await prisma.propertyAnalytics.count({
      where: {
        event: 'CONTACT',
        createdAt: { gte: startDate }
      }
    })

    const conversionRate = recentViews > 0 ? (totalContacts / recentViews * 100).toFixed(2) : '0'

    // Get recent activity
    const recentActivity = await prisma.propertyAnalytics.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      include: {
        property: {
          select: {
            title: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({
      overview: {
        totalProperties,
        activeProperties,
        totalUsers,
        activeUsers,
        totalInquiries,
        pendingInquiries,
        totalViews,
        recentViews,
        conversionRate: parseFloat(conversionRate),
      },
      topProperties: topProperties.map(property => ({
        ...property,
        viewCount: property._count.analytics,
        inquiryCount: property._count.inquiries,
      })),
      monthlyStats,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        event: activity.event,
        propertyTitle: activity.property.title,
        createdAt: activity.createdAt,
        userAgent: activity.userAgent,
      })),
      timeframe,
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}