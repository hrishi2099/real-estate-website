import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeadAssignmentStatus, Prisma, LeadGrade } from "@prisma/client"; // UserStatus is no longer needed for Lead model

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");
    const minScore = searchParams.get("minScore");
    const maxScore = searchParams.get("maxScore");
    const limit = searchParams.get("limit");

    const whereClause: Prisma.leadWhereInput = { // Changed to Prisma.leadWhereInput
      leadAssignments: {
        none: {
          status: LeadAssignmentStatus.ACTIVE,
        },
      },
      // leadScore filtering now directly on Lead model
    };

    if (grade) {
      whereClause.grade = grade as LeadGrade; // Directly on Lead model
    }

    if (minScore || maxScore) {
      whereClause.score = { // Directly on Lead model
        gte: minScore ? parseInt(minScore) : undefined,
        lte: maxScore ? parseInt(maxScore) : undefined,
      };
    }

    const unassignedLeads = await prisma.lead.findMany({ // Changed to prisma.lead.findMany
      where: whereClause,
      include: {
        // leadScore is now directly on Lead model, no need to include
        leadAssignments: {
          where: {
            status: LeadAssignmentStatus.ACTIVE,
          },
          include: {
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
      },
      orderBy: [
        { score: "desc" }, // Directly on Lead model
        { lastCalculated: "desc" }, // Directly on Lead model
      ],
      take: limit ? parseInt(limit) : 50,
    });

    console.log('Unassigned Leads from Prisma:', unassignedLeads);

    const formattedLeads = unassignedLeads.map(lead => {
      console.log('Mapping lead:', lead);
      const mappedLead = {
        lead: { // Renamed from 'user' to 'lead' for clarity
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          createdAt: lead.createdAt, // Using createdAt from Lead model
        },
        leadScore: { // Directly map from Lead model
          score: lead.score || 0,
          grade: lead.grade || 'COLD',
          lastActivity: lead.lastActivity,
          seriousBuyerIndicator: lead.seriousBuyerIndicator || false,
          budgetEstimate: lead.budgetEstimate ? 
            parseFloat(lead.budgetEstimate.toString()) : undefined,
          lastCalculated: lead.lastCalculated,
        },
        hasActiveAssignments: lead.leadAssignments.length > 0,
      };
      console.log('Mapped lead:', mappedLead);
      return mappedLead;
    });

    console.log('Formatted Leads for response:', formattedLeads);

    return NextResponse.json({
      success: true,
      data: formattedLeads,
      total: formattedLeads.length,
    });
  } catch (error) {
    console.error("Error fetching unassigned leads:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch unassigned leads",
      },
      { status: 500 }
    );
  }
}