import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pipelineTracker } from "@/lib/pipeline-tracker";

// Initialize pipelines for existing lead assignments
export async function POST() {
  try {
    // Get all active assignments that don't have pipeline stages
    const assignmentsWithoutPipeline = await prisma.leadAssignment.findMany({
      where: {
        status: "ACTIVE",
        pipelineStages: {
          none: {},
        },
      },
      include: {
        salesManager: true,
        lead: true,
      },
    });

    const results = [];

    // Initialize pipeline for each assignment
    for (const assignment of assignmentsWithoutPipeline) {
      try {
        const initialStage = await pipelineTracker.initializePipeline(
          assignment.id,
          assignment.salesManagerId
        );

        // Set initial estimated value based on lead score if available
        let estimatedValue = null;
        if (assignment.lead.budgetEstimate) {
          estimatedValue = assignment.lead.budgetEstimate;
        }

        // Update the stage with estimated value if available
        if (estimatedValue && initialStage) {
          await prisma.pipelineStage.update({
            where: {
              id: initialStage.id,
            },
            data: {
              estimatedValue,
            },
          });
        }

        results.push({
          assignmentId: assignment.id,
          leadName: assignment.lead.name,
          salesManager: assignment.salesManager.name,
          success: true,
          stageId: initialStage.id,
        });
      } catch (error) {
        console.error(`Error initializing pipeline for assignment ${assignment.id}:`, error);
        results.push({
          assignmentId: assignment.id,
          leadName: assignment.lead.name,
          salesManager: assignment.salesManager.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Initialized pipelines for ${results.filter(r => r.success).length} assignments`,
      data: {
        totalProcessed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      },
    });

  } catch (error) {
    console.error("Error initializing pipelines:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize pipelines",
      },
      { status: 500 }
    );
  }
}