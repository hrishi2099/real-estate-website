import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface WhereClause {
  stageId?: string;
}

// Get activities for a specific assignment's current stage
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get("stageId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const whereClause: WhereClause = {};

    if (stageId) {
      whereClause.stageId = stageId;
    } else {
      // Get activities for current active stage
      const currentStage = await prisma.pipelineStage.findFirst({
        where: {
          assignmentId: (await params).assignmentId,
          exitedAt: null,
        },
        orderBy: {
          enteredAt: 'desc',
        },
      });

      if (!currentStage) {
        return NextResponse.json({
          success: true,
          data: [],
        });
      }

      whereClause.stageId = currentStage.id;
    }

    const activities = await prisma.pipelineActivity.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: activities,
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

// Add new activity to a pipeline stage
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const {
      activityType,
      description,
      outcome,
      scheduledAt,
      completedAt,
      salesManagerId,
      stageId,
    } = await request.json();

    let targetStageId = stageId;

    // If no stageId provided, use current active stage
    if (!targetStageId) {
      const currentStage = await prisma.pipelineStage.findFirst({
        where: {
          assignmentId: (await params).assignmentId,
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
        activityType,
        description,
        outcome,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        completedAt: completedAt ? new Date(completedAt) : null,
        createdBy: salesManagerId,
      },
    });

    return NextResponse.json({
      success: true,
      data: activity,
      message: "Pipeline activity added successfully",
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