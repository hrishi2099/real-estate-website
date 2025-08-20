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
            lead: {
              include: {
                leadScore: true,
              },
            },
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