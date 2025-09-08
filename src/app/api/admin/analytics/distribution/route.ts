import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "30"; // days
    const salesManagerId = searchParams.get("salesManagerId");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Get distribution analytics
    const distributionStats = await prisma.leadAssignment.groupBy({
      by: ['salesManagerId', 'status', 'priority'],
      _count: {
        id: true,
      },
      where: {
        assignedAt: {
          gte: startDate,
        },
        ...(salesManagerId ? { salesManagerId } : {}),
      },
    });

    // Get sales manager performance
    const salesManagerPerformance = await prisma.user.findMany({
      where: {
        role: "SALES_MANAGER",
        status: "ACTIVE",
        ...(salesManagerId ? { id: salesManagerId } : {}),
      },
      include: {
        assignedLeads: {
          where: {
            assignedAt: {
              gte: startDate,
            },
          },
          include: {
            lead: true,
          },
        },
        _count: {
          select: {
            assignedLeads: {
              where: {
                assignedAt: {
                  gte: startDate,
                },
              },
            },
          },
        },
      },
    });

    // Calculate performance metrics for each sales manager
    const performanceMetrics = salesManagerPerformance.map(manager => {
      const assignments = manager.assignedLeads;
      const totalAssignments = assignments.length;
      const completedAssignments = assignments.filter(a => a.status === 'COMPLETED').length;
      const activeAssignments = assignments.filter(a => a.status === 'ACTIVE').length;
      const cancelledAssignments = assignments.filter(a => a.status === 'CANCELLED').length;

      // Calculate average lead score
      const leadScores = assignments
        .map(a => a.lead.score || 0) // Changed from lead.leadScore?.score to lead.score
        .filter(score => score > 0);
      const avgLeadScore = leadScores.length > 0 
        ? leadScores.reduce((sum, score) => sum + score, 0) / leadScores.length
        : 0;

      // Calculate conversion rate
      const conversionRate = totalAssignments > 0 
        ? (completedAssignments / totalAssignments) * 100
        : 0;

      // Calculate average time to close
      const completedWithTimes = assignments.filter(a => 
        a.status === 'COMPLETED' && a.expectedCloseDate
      );
      const avgTimeToClose = completedWithTimes.length > 0
        ? completedWithTimes.reduce((sum, assignment) => {
            const assignedDate = new Date(assignment.assignedAt);
            const closedDate = new Date(assignment.expectedCloseDate!);
            return sum + Math.ceil((closedDate.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24));
          }, 0) / completedWithTimes.length
        : null;

      // Get grade distribution of assigned leads
      const gradeDistribution = assignments.reduce((acc, assignment) => {
        const grade = assignment.lead.grade || 'UNKNOWN'; // Changed from lead.leadScore?.grade to lead.grade
        acc[grade] = (acc[grade] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        salesManager: {
          id: manager.id,
          name: manager.name,
          email: manager.email,
          territory: manager.territory,
        },
        metrics: {
          totalAssignments,
          activeAssignments,
          completedAssignments,
          cancelledAssignments,
          conversionRate: Math.round(conversionRate * 100) / 100,
          avgLeadScore: Math.round(avgLeadScore * 100) / 100,
          avgTimeToClose,
          gradeDistribution,
        },
        assignments: assignments.map(assignment => ({
          id: assignment.id,
          status: assignment.status,
          priority: assignment.priority,
          assignedAt: assignment.assignedAt,
          leadScore: assignment.lead.score || 0, // Changed from lead.leadScore?.score to lead.score
          leadGrade: assignment.lead.grade || 'UNKNOWN', // Changed from lead.leadScore?.grade to lead.grade
        })),
      };
    });

    // Overall distribution statistics
    const overallStats = {
      totalDistributed: distributionStats.reduce((sum, stat) => sum + stat._count.id, 0),
      byStatus: distributionStats.reduce((acc, stat) => {
        acc[stat.status] = (acc[stat.status] || 0) + stat._count.id;
        return acc;
      }, {} as Record<string, number>),
      byPriority: distributionStats.reduce((acc, stat) => {
        acc[stat.priority] = (acc[stat.priority] || 0) + stat._count.id;
        return acc;
      }, {} as Record<string, number>),
    };

    // Daily distribution trend
    let dailyTrend;
    if (salesManagerId) {
      dailyTrend = await prisma.$queryRaw<Array<{ date: Date, count: bigint }>>`
        SELECT 
          DATE(assignedAt) as date,
          COUNT(*) as count
        FROM lead_assignments
        WHERE assignedAt >= ${startDate}
        AND salesManagerId = ${salesManagerId}
        GROUP BY DATE(assignedAt)
        ORDER BY date ASC
      `;
    } else {
      dailyTrend = await prisma.$queryRaw<Array<{ date: Date, count: bigint }>>`
        SELECT 
          DATE(assignedAt) as date,
          COUNT(*) as count
        FROM lead_assignments
        WHERE assignedAt >= ${startDate}
        GROUP BY DATE(assignedAt)
        ORDER BY date ASC
      `;
    }

    // Top performing leads by score
    const topLeads = await prisma.leadAssignment.findMany({
      where: {
        assignedAt: {
          gte: startDate,
        },
        ...(salesManagerId ? { salesManagerId } : {}),
        lead: {
          score: {
            gte: 70, // High-scoring leads
          },
        },
      },
      include: {
        lead: true, // Changed from include: { leadScore: true } to true
        salesManager: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        lead: {
          score: 'desc',
        },
      },
      take: 10,
    });

    // Lead source analysis (if we have location data)
    const leadSources = await prisma.leadAssignment.findMany({
      where: {
        assignedAt: {
          gte: startDate,
        },
        ...(salesManagerId ? { salesManagerId } : {}),
        lead: {
          locationSearches: {
            not: null,
          },
        },
      },
      include: {
        lead: true, // Changed from include: { leadScore: true } to true
      },
    });

    const locationAnalysis = leadSources.reduce((acc, assignment) => {
      try {
        const locations = assignment.lead.locationSearches 
          ? JSON.parse(assignment.lead.locationSearches) 
          : [];
        
        locations.forEach((location: string) => {
          acc[location] = (acc[location] || 0) + 1;
        });
      } catch (error) {
        // Skip invalid JSON
      }
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        timeframe: `${timeframe} days`,
        overallStats,
        performanceMetrics,
        dailyTrend: dailyTrend.map(item => ({
          date: item.date.toISOString().split('T')[0],
          count: Number(item.count),
        })),
        topLeads: topLeads.map(assignment => ({
          leadName: assignment.lead.name,
          leadEmail: assignment.lead.email,
          score: assignment.lead.score || 0,
          grade: assignment.lead.grade || 'UNKNOWN',
          salesManagerName: assignment.salesManager.name,
          assignedAt: assignment.assignedAt,
          status: assignment.status,
        })),
        locationAnalysis: Object.entries(locationAnalysis)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([location, count]) => ({ location, count })),
      },
    });

  } catch (error) {
    console.error("Error fetching distribution analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch distribution analytics",
      },
      { status: 500 }
    );
  }
}
