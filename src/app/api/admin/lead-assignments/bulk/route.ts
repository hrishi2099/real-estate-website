import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { action, assignmentIds, data } = await request.json();

    if (!action || !assignmentIds || !Array.isArray(assignmentIds)) {
      return NextResponse.json(
        {
          success: false,
          error: "Action and assignmentIds array are required",
        },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'update_status':
        if (!data?.status) {
          return NextResponse.json(
            {
              success: false,
              error: "Status is required for update_status action",
            },
            { status: 400 }
          );
        }

        result = await prisma.leadAssignment.updateMany({
          where: {
            id: { in: assignmentIds },
          },
          data: {
            status: data.status,
          },
        });
        break;

      case 'update_priority':
        if (!data?.priority) {
          return NextResponse.json(
            {
              success: false,
              error: "Priority is required for update_priority action",
            },
            { status: 400 }
          );
        }

        result = await prisma.leadAssignment.updateMany({
          where: {
            id: { in: assignmentIds },
          },
          data: {
            priority: data.priority,
          },
        });
        break;

      case 'reassign':
        if (!data?.salesManagerId) {
          return NextResponse.json(
            {
              success: false,
              error: "Sales manager ID is required for reassign action",
            },
            { status: 400 }
          );
        }

        // First, get the current assignments to extract leadIds
        const currentAssignments = await prisma.leadAssignment.findMany({
          where: { id: { in: assignmentIds } },
          select: { leadId: true },
        });

        const leadIds = currentAssignments.map(a => a.leadId);

        // Delete old assignments
        await prisma.leadAssignment.deleteMany({
          where: { id: { in: assignmentIds } },
        });

        // Create new assignments
        const newAssignments = leadIds.map(leadId => ({
          leadId,
          salesManagerId: data.salesManagerId,
          priority: data.priority || 'NORMAL',
          notes: data.notes || 'Bulk reassignment',
          expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
        }));

        result = await prisma.leadAssignment.createMany({
          data: newAssignments,
          skipDuplicates: true,
        });
        break;

      case 'delete':
        result = await prisma.leadAssignment.deleteMany({
          where: {
            id: { in: assignmentIds },
          },
        });
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unknown action: ${action}`,
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        affectedCount: result.count || assignmentIds.length,
        assignmentIds,
      },
      message: `Successfully performed ${action} on ${result.count || assignmentIds.length} assignments`,
    });

  } catch (error) {
    console.error("Error performing bulk operation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform bulk operation",
      },
      { status: 500 }
    );
  }
}

// Get bulk operation statistics
export async function GET() {
  try {
    const stats = await prisma.leadAssignment.groupBy({
      by: ['status', 'priority'],
      _count: {
        id: true,
      },
    });

    const salesManagerStats = await prisma.leadAssignment.groupBy({
      by: ['salesManagerId'],
      _count: {
        id: true,
      },
      where: {
        status: 'ACTIVE',
      },
    });

    // Get sales manager details
    const salesManagerIds = salesManagerStats.map(s => s.salesManagerId);
    const salesManagers = await prisma.user.findMany({
      where: {
        id: { in: salesManagerIds },
        role: 'SALES_MANAGER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        territory: true,
      },
    });

    const salesManagerWithStats = salesManagerStats.map(stat => {
      const manager = salesManagers.find(sm => sm.id === stat.salesManagerId);
      if (!manager) {
        return null;
      }
      return {
        salesManager: manager,
        activeAssignments: stat._count.id,
      };
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        statusStats: stats.filter(s => s.status).reduce((acc, stat) => {
          acc[stat.status] = stat._count.id;
          return acc;
        }, {} as Record<string, number>),
        priorityStats: stats.filter(s => s.priority).reduce((acc, stat) => {
          acc[stat.priority] = stat._count.id;
          return acc;
        }, {} as Record<string, number>),
        salesManagerWorkload: salesManagerWithStats,
      },
    });

  } catch (error) {
    console.error("Error fetching bulk operation stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics",
      },
      { status: 500 }
    );
  }
}