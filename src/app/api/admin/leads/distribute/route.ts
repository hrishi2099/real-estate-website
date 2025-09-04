import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadDistributionEngine } from "@/lib/lead-distribution";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Distribute leads request body:', body); // Debug log
    
    const {
      rule,
      leadIds,
      salesManagerIds,
      priority = 'NORMAL',
      notes,
      expectedCloseDate,
    } = body;
    
    // Extract salesManagerIds from rule if they're nested there
    const actualSalesManagerIds = salesManagerIds || rule?.salesManagerIds;
    const actualLeadIds = leadIds || rule?.leadIds;

    if (!rule || !rule.type) {
      return NextResponse.json(
        {
          success: false,
          error: "Distribution rule and type are required",
        },
        { status: 400 }
      );
    }

    if (!actualSalesManagerIds || actualSalesManagerIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one sales manager must be selected",
        },
        { status: 400 }
      );
    }

    console.log('Using salesManagerIds:', actualSalesManagerIds);
    console.log('Using leadIds:', actualLeadIds);

    // Use the advanced distribution engine
    const distributionResult = await leadDistributionEngine.distributeLeads(
      {
        type: rule.type,
        maxLeadsPerManager: rule.maxLeadsPerManager,
        minLeadScore: rule.minLeadScore,
        territoryMapping: rule.territoryMapping,
        prioritizeHighScorers: rule.prioritizeHighScorers,
        respectWorkingHours: rule.respectWorkingHours,
      },
      actualLeadIds,
      actualSalesManagerIds
    );

    if (distributionResult.assignments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No assignments could be made with the current criteria",
        },
        { status: 400 }
      );
    }

    // Create assignments in database
    const assignmentsToCreate = distributionResult.assignments.map(assignment => ({
      leadId: assignment.leadId,
      salesManagerId: assignment.salesManagerId,
      priority,
      notes: notes || assignment.reason,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      status: "ACTIVE" as const,
    }));

    const createdAssignments = await prisma.leadAssignment.createMany({
      data: assignmentsToCreate,
      skipDuplicates: true,
    });

    // Get detailed assignment data for response
    const assignmentDetails = await prisma.leadAssignment.findMany({
      where: {
        leadId: { in: distributionResult.assignments.map(a => a.leadId) },
        salesManagerId: { in: distributionResult.assignments.map(a => a.salesManagerId) },
        status: "ACTIVE",
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
      },
      orderBy: {
        assignedAt: "desc",
      },
      take: 50, // Limit response size
    });

    return NextResponse.json({
      success: true,
      data: {
        totalAssigned: createdAssignments.count,
        distributionRule: rule.type,
        distributionStats: distributionResult.stats,
        assignments: assignmentDetails.map(assignment => ({
          ...assignment,
          distributionReason: distributionResult.assignments.find(
            a => a.leadId === assignment.leadId && a.salesManagerId === assignment.salesManagerId
          )?.reason,
        })),
      },
      message: `Successfully distributed ${createdAssignments.count} leads using ${rule.type} algorithm`,
    });

  } catch (error) {
    console.error("Error distributing leads:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to distribute leads",
      },
      { status: 500 }
    );
  }
}