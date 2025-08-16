import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/debug/properties - Debug endpoint to check properties
export async function GET(request: NextRequest) {
  try {
    // Get all properties with their featured status
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        isFeatured: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit to 10 for debugging
    })

    const featuredCount = await prisma.property.count({
      where: { isFeatured: true }
    })

    const totalCount = await prisma.property.count()

    return NextResponse.json({
      totalProperties: totalCount,
      featuredCount: featuredCount,
      sampleProperties: properties,
      debug: {
        message: 'This endpoint shows property counts and sample data for debugging',
        timestamp: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Debug properties error:', error)
    return NextResponse.json({
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        message: 'Failed to connect to database or query properties',
        timestamp: new Date().toISOString(),
      }
    }, { status: 500 })
  }
}