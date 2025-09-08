import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LeadAssignmentStatus } from '@prisma/client' // Import LeadAssignmentStatus

// GET /api/debug/leads - Debug endpoint to check lead distribution data
export async function GET() {
  try {
    // Count total users (still relevant for overall user base)
    const totalUsers = await prisma.user.count()

    // Count users by role (still relevant for overall user base)
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    })

    // Count leads with lead scores (now all Lead records have scores)
    const totalLeads = await prisma.lead.count()

    // Count unassigned leads (Lead records with no active assignments)
    const unassignedLeads = await prisma.lead.count({
      where: {
        leadAssignments: {
          none: {
            status: LeadAssignmentStatus.ACTIVE
          }
        }
      }
    })

    // Count active sales managers (still relevant)
    const activeSalesManagers = await prisma.user.count({
      where: {
        role: 'SALES_MANAGER',
        status: 'ACTIVE'
      }
    })

    // Get sample leads
    const sampleLeads = await prisma.lead.findMany({
      where: {
        leadAssignments: {
          none: {
            status: LeadAssignmentStatus.ACTIVE
          }
        }
      },
      include: {
        leadAssignments: {
          where: { status: LeadAssignmentStatus.ACTIVE }
        }
      },
      take: 3
    })

    const sampleSalesManagers = await prisma.user.findMany({
      where: {
        role: 'SALES_MANAGER',
        status: 'ACTIVE'
      },
      include: {
        _count: {
          select: {
            assignedLeads: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      },
      take: 3
    })

    // Count lead assignments
    const totalAssignments = await prisma.leadAssignment.count()
    const activeAssignments = await prisma.leadAssignment.count({
      where: { status: LeadAssignmentStatus.ACTIVE }
    })

    return NextResponse.json({
      totalUsers,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.id
        return acc
      }, {} as Record<string, number>),
      totalLeads, // Renamed from usersWithLeadScores
      unassignedLeads,
      activeSalesManagers,
      totalAssignments,
      activeAssignments,
      sampleData: {
        leads: sampleLeads.map(lead => ({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          score: lead.score, // Directly from Lead model
          grade: lead.grade, // Directly from Lead model
          activeAssignments: lead.leadAssignments.length
        })),
        salesManagers: sampleSalesManagers.map(sm => ({
          id: sm.id,
          name: sm.name,
          email: sm.email,
          territory: sm.territory,
          currentLoad: sm._count.assignedLeads
        }))
      },
      debug: {
        message: 'Lead distribution debug information',
        timestamp: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Debug leads error:', error)
    return NextResponse.json({
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        message: 'Failed to query lead distribution data',
        timestamp: new Date().toISOString(),
      }
    }, { status: 500 })
  }
}