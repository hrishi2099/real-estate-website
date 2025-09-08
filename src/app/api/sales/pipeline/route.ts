import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface WhereClause {
  assignedAt: {
    gte: Date;
  };
  salesManagerId?: string;
}

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

    // Base where clause
    const whereClause: WhereClause = {
      assignedAt: {
        gte: startDate,
      },
      salesManagerId,
    };

    type Stage = 'NEW_LEAD' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'PROPERTY_VIEWING' | 'APPLICATION' | 'CLOSING' | 'WON';

interface DealsByStage {
  [key: string]: {
    count: number;
    avgDuration: number;
    avgProbability: number;
    avgValue: number;
  };
}

    // Get pipeline stages with assignments
    const pipelineStages = await prisma.pipelineStage.findMany({
      where: {
        assignment: whereClause,
        ...(stage ? { stage: stage as Stage } : {}),
      },
      include: {
        assignment: {
          include: {
            lead: true,
            salesManager: {
              select: {
                id: true,
                name: true,
                email: true,
                territory: true,
              },
            },
          },
        },
        stageActivities: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Recent activities
        },
      },
      orderBy: [
        { enteredAt: 'desc' },
      ],
    });

    // Calculate stage statistics
    const stageStats = await prisma.pipelineStage.groupBy({
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
        assignment: whereClause,
        exitedAt: null, // Only active stages
      },
    });

    // Get conversion rates (stage progression)
    const conversionRates: Record<string, number> = {};
    const allStages: Stage[] = [
      'NEW_LEAD', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT',
      'NEGOTIATION', 'PROPERTY_VIEWING', 'APPLICATION', 'CLOSING', 'WON'
    ];

    for (let i = 0; i < allStages.length - 1; i++) {
      const currentStage = allStages[i];
      const nextStage = allStages[i + 1];
      
      const currentStageCount = await prisma.pipelineStage.count({
        where: {
          stage: currentStage,
          assignment: whereClause,
        },
      });

      const nextStageCount = await prisma.pipelineStage.count({
        where: {
          stage: nextStage,
          assignment: whereClause,
        },
      });

      conversionRates[`${currentStage}_to_${nextStage}`] = 
        currentStageCount > 0 ? (nextStageCount / currentStageCount) * 100 : 0;
    }

    // Get deals by stage
    const dealsByStage: DealsByStage = stageStats.reduce((acc, stat) => {
      acc[stat.stage] = {
        count: stat._count.id,
        avgDuration: Math.round(stat._avg.durationHours || 0),
        avgProbability: Math.round(stat._avg.probability || 0),
        avgValue: stat._avg.estimatedValue ? Number(stat._avg.estimatedValue) : 0,
      };
      return acc;
    }, {} as DealsByStage);

    // Calculate pipeline velocity (average time from NEW_LEAD to WON)
    const wonDeals = await prisma.pipelineStage.findMany({
      where: {
        stage: 'WON',
        assignment: whereClause,
      },
      include: {
        assignment: {
          include: {
            pipelineStages: {
              where: {
                stage: 'NEW_LEAD',
              },
              orderBy: {
                enteredAt: 'asc',
              },
              take: 1,
            },
          },
        },
      },
    });

    const pipelineVelocity = wonDeals
      .filter(stage => stage.assignment.pipelineStages.length > 0)
      .reduce((acc, stage) => {
        const startDate = stage.assignment.pipelineStages[0].enteredAt;
        const endDate = stage.enteredAt;
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return acc + days;
      }, 0) / Math.max(wonDeals.length, 1);

    // Revenue metrics
    const revenueMetrics = await prisma.pipelineStage.aggregate({
      where: {
        stage: 'WON',
        assignment: whereClause,
      },
      _sum: {
        estimatedValue: true,
      },
      _count: {
        id: true,
      },
    });

    const totalPipelineValue = await prisma.pipelineStage.aggregate({
      where: {
        assignment: whereClause,
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
          lead: {
            id: stage.assignment.lead.id,
            name: stage.assignment.lead.name,
            email: stage.assignment.lead.email,
            phone: stage.assignment.lead.phone,
            leadScore: stage.assignment.lead,
          },
          salesManager: stage.assignment.salesManager,
          activities: stage.stageActivities.map(activity => ({
            id: activity.id,
            activityType: activity.activityType,
            description: activity.description,
            outcome: activity.outcome,
            scheduledAt: activity.scheduledAt,
            completedAt: activity.completedAt,
            createdAt: activity.createdAt,
          })),
        })),
        statistics: {
          dealsByStage,
          conversionRates,
          pipelineVelocityDays: Math.round(pipelineVelocity),
          revenue: {
            won: Number(revenueMetrics._sum.estimatedValue || 0),
            wonCount: revenueMetrics._count.id,
            pipeline: Number(totalPipelineValue._sum.estimatedValue || 0),
            avgDealSize: revenueMetrics._count.id > 0 
              ? Number(revenueMetrics._sum.estimatedValue || 0) / revenueMetrics._count.id 
              : 0,
          },
        },
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