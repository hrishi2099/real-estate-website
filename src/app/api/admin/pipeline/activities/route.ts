import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface WhereClause {
  createdAt: {
    gte: Date;
  };
  stage?: {
    assignmentId: string;
  };
  createdBy?: string;
  activityType?: string;
}

// Get all pipeline activities with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");
    const salesManagerId = searchParams.get("salesManagerId");
    const activityType = searchParams.get("activityType");
    const timeframe = searchParams.get("timeframe") || "30"; // days
    const limit = parseInt(searchParams.get("limit") || "100");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    const whereClause: WhereClause = {
      createdAt: {
        gte: startDate,
      },
    };

    if (assignmentId) {
      whereClause.stage = {
        assignmentId,
      };
    }

    if (salesManagerId) {
      whereClause.createdBy = salesManagerId;
    }

    if (activityType) {
      whereClause.activityType = activityType;
    }

    const activities = await prisma.pipelineActivity.findMany({
      where: whereClause,
      include: {
        stage: {
          include: {
            assignment: {
              include: {
                lead: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                salesManager: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: activities.map(activity => ({
        id: activity.id,
        activityType: activity.activityType,
        description: activity.description,
        outcome: activity.outcome,
        scheduledAt: activity.scheduledAt,
        completedAt: activity.completedAt,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        stage: {
          id: activity.stage.id,
          stage: activity.stage.stage,
          assignmentId: activity.stage.assignmentId,
        },
        lead: activity.stage.assignment.lead,
        salesManager: activity.stage.assignment.salesManager,
      })),
    });

  } catch (error) {
    console.error("Error fetching pipeline activities:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch pipeline activities",
      },
      { status: 500 }
    );
  }
}

// Create new pipeline activity
export async function POST(request: NextRequest) {
  try {
    const {
      assignmentId,
      stageId,
      activityType,
      description,
      outcome,
      scheduledAt,
      completedAt,
      salesManagerId,
    } = await request.json();

    if (!assignmentId && !stageId) {
      return NextResponse.json(
        {
          success: false,
          error: "Either assignmentId or stageId is required",
        },
        { status: 400 }
      );
    }

    if (!activityType || !description || !salesManagerId) {
      return NextResponse.json(
        {
          success: false,
          error: "activityType, description, and salesManagerId are required",
        },
        { status: 400 }
      );
    }

    let targetStageId = stageId;

    // If no stageId provided, get current active stage for assignment
    if (!targetStageId && assignmentId) {
      const currentStage = await prisma.pipelineStage.findFirst({
        where: {
          assignmentId,
          exitedAt: null,
        },
        orderBy: {
          enteredAt: 'desc',
        },
      });

      if (!currentStage) {
        return NextResponse.json(
          {
            success: false,
            error: "No active pipeline stage found for this assignment",
          },
          { status: 400 }
        );
      }

      targetStageId = currentStage.id;
    }

    const activity = await prisma.pipelineActivity.create({
      data: {
        stageId: targetStageId,
        activityType: activityType as ActivityType,
        description,
        outcome,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        completedAt: completedAt ? new Date(completedAt) : null,
        createdBy: salesManagerId,
      },
      include: {
        stage: {
          include: {
            assignment: {
              include: {
                lead: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Auto-update stage based on activity type
    await updateStageBasedOnActivity(activity.stage, activityType, salesManagerId);

    return NextResponse.json({
      success: true,
      data: {
        id: activity.id,
        activityType: activity.activityType,
        description: activity.description,
        outcome: activity.outcome,
        scheduledAt: activity.scheduledAt,
        completedAt: activity.completedAt,
        createdAt: activity.createdAt,
        stage: {
          id: activity.stage.id,
          stage: activity.stage.stage,
          assignmentId: activity.stage.assignmentId,
        },
        lead: activity.stage.assignment.lead,
      },
      message: "Pipeline activity created successfully",
    });

  } catch (error) {
    console.error("Error creating pipeline activity:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create pipeline activity",
      },
      { status: 500 }
    );
  }
}

type ActivityType = 'PHONE_CALL' | 'EMAIL_SENT' | 'MEETING_COMPLETED' | 'PROPERTY_SHOWING' | 'PROPOSAL_SENT' | 'APPLICATION_SUBMITTED' | 'CONTRACT_SENT' | 'CONTRACT_SIGNED' | 'DEAL_CLOSED' | 'DEAL_LOST';

interface Stage {
    id: string;
    stage: string;
    assignmentId: string;
    enteredAt: Date;
}

type AssignmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

// Helper function to auto-update stage based on activity
async function updateStageBasedOnActivity(
  stage: Stage,
  activityType: string,
  salesManagerId: string
) {
  const stageTransitions: Record<string, string> = {
    'PHONE_CALL': 'CONTACTED',
    'EMAIL_SENT': 'CONTACTED',
    'MEETING_COMPLETED': 'QUALIFIED',
    'PROPERTY_SHOWING': 'PROPERTY_VIEWING',
    'PROPOSAL_SENT': 'PROPOSAL_SENT',
    'APPLICATION_SUBMITTED': 'APPLICATION',
    'CONTRACT_SENT': 'CLOSING',
    'CONTRACT_SIGNED': 'CLOSING',
    'DEAL_CLOSED': 'WON',
    'DEAL_LOST': 'LOST',
  };

  const newStage = stageTransitions[activityType];
  
  if (newStage && stage.stage !== newStage) {
    // Check if this is a valid transition
    const validTransitions: Record<string, string[]> = {
      'NEW_LEAD': ['CONTACTED', 'QUALIFIED', 'LOST'],
      'CONTACTED': ['QUALIFIED', 'PROPOSAL_SENT', 'PROPERTY_VIEWING', 'LOST'],
      'QUALIFIED': ['PROPOSAL_SENT', 'PROPERTY_VIEWING', 'NEGOTIATION', 'LOST'],
      'PROPOSAL_SENT': ['NEGOTIATION', 'PROPERTY_VIEWING', 'APPLICATION', 'LOST'],
      'NEGOTIATION': ['APPLICATION', 'CLOSING', 'PROPOSAL_SENT', 'LOST'],
      'PROPERTY_VIEWING': ['APPLICATION', 'NEGOTIATION', 'QUALIFIED', 'LOST'],
      'APPLICATION': ['CLOSING', 'NEGOTIATION', 'LOST'],
      'CLOSING': ['WON', 'LOST'],
    };

    const allowedTransitions = validTransitions[stage.stage] || [];
    
    if (allowedTransitions.includes(newStage)) {
      // Close current stage
      const exitTime = new Date();
      const durationHours = Math.ceil(
        (exitTime.getTime() - stage.enteredAt.getTime()) / (1000 * 60 * 60)
      );

      await prisma.pipelineStage.update({
        where: { id: stage.id },
        data: {
          exitedAt: exitTime,
          durationHours,
        },
      });

      // Create new stage
      await prisma.pipelineStage.create({
        data: {
          assignmentId: stage.assignmentId,
          stage: newStage,
          probability: getDefaultProbability(newStage),
          createdBy: salesManagerId,
        },
      });

      // Update assignment status if needed
      let assignmentStatus: AssignmentStatus = 'ACTIVE';
      if (newStage === 'WON') {
        assignmentStatus = 'COMPLETED';
      } else if (newStage === 'LOST') {
        assignmentStatus = 'CANCELLED';
      }

      if (assignmentStatus !== 'ACTIVE') {
        await prisma.leadAssignment.update({
          where: { id: stage.assignmentId },
          data: { status: assignmentStatus },
        });
      }
    }
  }
}

function getDefaultProbability(stage: string): number {
  const probabilities: Record<string, number> = {
    'NEW_LEAD': 10,
    'CONTACTED': 20,
    'QUALIFIED': 35,
    'PROPOSAL_SENT': 50,
    'NEGOTIATION': 65,
    'PROPERTY_VIEWING': 60,
    'APPLICATION': 80,
    'CLOSING': 90,
    'WON': 100,
    'LOST': 0,
    'ON_HOLD': 25,
  };
  return probabilities[stage] || 0;
}