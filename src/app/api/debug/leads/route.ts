import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/debug/leads - Debug endpoint to check lead distribution data
export async function GET() {
  try {
    // Count total users
    const totalUsers = await prisma.user.count()
    
    // Count users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    })
    
    // Count users with lead scores
    const usersWithLeadScores = await prisma.user.count({
      where: {
        leadScore: { isNot: null },
        role: 'USER'
      }
    })
    
    // Count unassigned leads (users who are leads with no active assignments)
    const unassignedLeads = await prisma.user.count({
      where: {
        role: 'USER',
        status: 'ACTIVE',
        leadScore: { isNot: null },
        leadAssignments: {
          none: {
            status: 'ACTIVE'
          }
        }
      }
    })
    
    // Count active sales managers
    const activeSalesManagers = await prisma.user.count({
      where: {
        role: 'SALES_MANAGER',
        status: 'ACTIVE'
      }
    })
    
    // Get sample data
    const sampleLeads = await prisma.user.findMany({
      where: {
        role: 'USER',
        status: 'ACTIVE',
        leadScore: { isNot: null },
        leadAssignments: {
          none: {
            status: 'ACTIVE'
          }
        }
      },
      include: {
        leadScore: true,
        leadAssignments: {
          where: { status: 'ACTIVE' }
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
      where: { status: 'ACTIVE' }
    })

    return NextResponse.json({
      totalUsers,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.id
        return acc
      }, {} as Record<string, number>),
      usersWithLeadScores,
      unassignedLeads,
      activeSalesManagers,
      totalAssignments,
      activeAssignments,
      sampleData: {
        leads: sampleLeads.map(lead => ({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          leadScore: lead.leadScore,
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