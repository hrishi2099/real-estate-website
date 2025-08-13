import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get pipeline stages for a specific assignment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const assignment = await prisma.leadAssignment.findUnique({
      where: {
        id: (await params).assignmentId,
      },
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
        pipelineStages: {
          include: {
            stageActivities: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            enteredAt: 'asc',
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          error: "Assignment not found",
        },
        { status: 404 }
      );
    }

    // Calculate stage durations
    const stagesWithDuration = assignment.pipelineStages.map((stage, index) => {
      let duration = 0;
      if (stage.exitedAt) {
        duration = Math.ceil((stage.exitedAt.getTime() - stage.enteredAt.getTime()) / (1000 * 60 * 60));
      } else if (index === assignment.pipelineStages.length - 1) {
        // Current stage - calculate duration from entry to now
        duration = Math.ceil((new Date().getTime() - stage.enteredAt.getTime()) / (1000 * 60 * 60));
      }

      return {
        ...stage,
        calculatedDurationHours: duration,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        assignment: {
          id: assignment.id,
          assignedAt: assignment.assignedAt,
          status: assignment.status,
          priority: assignment.priority,
          expectedCloseDate: assignment.expectedCloseDate,
          notes: assignment.notes,
        },
        lead: assignment.lead,
        salesManager: assignment.salesManager,
        stages: stagesWithDuration,
      },
    });

  } catch (error) {
    console.error("Error fetching assignment pipeline:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch assignment pipeline",
      },
      { status: 500 }
    );
  }
}

// Update pipeline stage for an assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const {
      stage,
      probability,
      estimatedValue,
      nextAction,
      nextActionDate,
      notes,
      salesManagerId,
    } = await request.json();

    // First, get the current active stage
    const currentStage = await prisma.pipelineStage.findFirst({
      where: {
        assignmentId: (await params).assignmentId,
        exitedAt: null,
      },
      orderBy: {
        enteredAt: 'desc',
      },
    });

    // Close the current stage if it exists and we're moving to a new stage
    if (currentStage && currentStage.stage !== stage) {
      const exitTime = new Date();
      const durationHours = Math.ceil(
        (exitTime.getTime() - currentStage.enteredAt.getTime()) / (1000 * 60 * 60)
      );

      await prisma.pipelineStage.update({
        where: {
          id: currentStage.id,
        },
        data: {
          exitedAt: exitTime,
          durationHours,
        },
      });
    }

    // Create new stage if we're moving to a different stage
    let newStage;
    if (!currentStage || currentStage.stage !== stage) {
      newStage = await prisma.pipelineStage.create({
        data: {
          assignmentId: (await params).assignmentId,
          stage,
          probability,
          estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
          nextAction,
          nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
          notes,
          createdBy: salesManagerId,
        },
      });

      // Update assignment status based on stage
      let assignmentStatus = 'ACTIVE';
      if (stage === 'WON') {
        assignmentStatus = 'COMPLETED';
      } else if (stage === 'LOST') {
        assignmentStatus = 'CANCELLED';
      } else if (stage === 'ON_HOLD') {
        assignmentStatus = 'ON_HOLD';
      }

      await prisma.leadAssignment.update({
        where: {
          id: (await params).assignmentId,
        },
        data: {
          status: assignmentStatus as any,
        },
      });
    } else {
      // Update existing stage
      newStage = await prisma.pipelineStage.update({
        where: {
          id: currentStage.id,
        },
        data: {
          probability,
          estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
          nextAction,
          nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
          notes,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: newStage,
      message: "Pipeline stage updated successfully",
    });

  } catch (error) {
    console.error("Error updating pipeline stage:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update pipeline stage",
      },
      { status: 500 }
    );
  }
}