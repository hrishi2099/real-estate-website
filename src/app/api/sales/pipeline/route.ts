import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get pipeline data for a specific sales manager
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salesManagerId = searchParams.get("salesManagerId");
    const stage = searchParams.get("stage");
    const timeframe = searchParams.get("timeframe") || "30"; // days

    if (!salesManagerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Sales manager ID is required",
        },
        { status: 400 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Get sales manager's pipeline stages
    const pipelineStages = await prisma.pipelineStage.findMany({
      where: {
        assignment: {
          salesManagerId,
          assignedAt: {
            gte: startDate,
          },
        },
        ...(stage ? { stage: stage as any } : {}),
      },
      include: {
        assignment: {
          include: {
            lead: {
              include: {
                leadScore: true,
              },
            },
          },
        },
        stageActivities: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 3, // Recent activities
        },
      },
      orderBy: [
        { enteredAt: 'desc' },
      ],
    });

    // Get sales manager's performance metrics
    const performanceMetrics = await prisma.pipelineStage.groupBy({
      by: ['stage'],
      _count: {
        id: true,
      },
      _avg: {
        durationHours: true,
        probability: true,
        estimatedValue: true,
      },
      where: {
        assignment: {
          salesManagerId,
          assignedAt: {
            gte: startDate,
          },
        },
      },
    });

    // Get upcoming actions
    const upcomingActions = await prisma.pipelineStage.findMany({
      where: {
        assignment: {
          salesManagerId,
        },
        nextActionDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
        exitedAt: null, // Only active stages
      },
      include: {
        assignment: {
          include: {
            lead: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        nextActionDate: 'asc',
      },
    });

    // Calculate win rate and conversion metrics
    const totalDeals = await prisma.pipelineStage.count({
      where: {
        assignment: {
          salesManagerId,
          assignedAt: {
            gte: startDate,
          },
        },
        stage: {
          in: ['WON', 'LOST'],
        },
      },
    });

    const wonDeals = await prisma.pipelineStage.count({
      where: {
        assignment: {
          salesManagerId,
          assignedAt: {
            gte: startDate,
          },
        },
        stage: 'WON',
      },
    });

    const winRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;

    // Revenue metrics
    const revenueMetrics = await prisma.pipelineStage.aggregate({
      where: {
        assignment: {
          salesManagerId,
          assignedAt: {
            gte: startDate,
          },
        },
        stage: 'WON',
      },
      _sum: {
        estimatedValue: true,
      },
      _count: {
        id: true,
      },
    });

    const pipelineValue = await prisma.pipelineStage.aggregate({
      where: {
        assignment: {
          salesManagerId,
        },
        exitedAt: null, // Only active deals
        estimatedValue: {
          not: null,
        },
      },
      _sum: {
        estimatedValue: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        stages: pipelineStages.map(stage => ({
          id: stage.id,
          stage: stage.stage,
          enteredAt: stage.enteredAt,
          exitedAt: stage.exitedAt,
          durationHours: stage.durationHours,
          probability: stage.probability,
          estimatedValue: stage.estimatedValue,
          nextAction: stage.nextAction,
          nextActionDate: stage.nextActionDate,
          notes: stage.notes,
          lead: stage.assignment.lead,
          recentActivities: stage.stageActivities.map(activity => ({
            id: activity.id,
            activityType: activity.activityType,
            description: activity.description,
            createdAt: activity.createdAt,
          })),
        })),
        performance: {
          stageMetrics: performanceMetrics.reduce((acc, metric) => {
            acc[metric.stage] = {
              count: metric._count.id,
              avgDuration: Math.round(metric._avg.durationHours || 0),
              avgProbability: Math.round(metric._avg.probability || 0),
              avgValue: metric._avg.estimatedValue ? Number(metric._avg.estimatedValue) : 0,
            };
            return acc;
          }, {} as Record<string, any>),
          winRate: Math.round(winRate * 100) / 100,
          totalDeals,
          wonDeals,
          revenue: {
            closed: Number(revenueMetrics._sum.estimatedValue || 0),
            pipeline: Number(pipelineValue._sum.estimatedValue || 0),
            avgDealSize: revenueMetrics._count.id > 0 
              ? Number(revenueMetrics._sum.estimatedValue || 0) / revenueMetrics._count.id 
              : 0,
          },
        },
        upcomingActions: upcomingActions.map(stage => ({
          id: stage.id,
          stage: stage.stage,
          nextAction: stage.nextAction,
          nextActionDate: stage.nextActionDate,
          lead: stage.assignment.lead,
          probability: stage.probability,
          estimatedValue: stage.estimatedValue,
        })),
      },
    });

  } catch (error) {
    console.error("Error fetching sales pipeline:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sales pipeline",
      },
      { status: 500 }
    );
  }
}