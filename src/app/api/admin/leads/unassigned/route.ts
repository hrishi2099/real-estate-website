import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserStatus, LeadAssignmentStatus, Prisma, LeadGrade } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");
    const minScore = searchParams.get("minScore");
    const maxScore = searchParams.get("maxScore");
    const limit = searchParams.get("limit");

    const whereClause: Prisma.UserWhereInput = {
      role: "USER",
      status: UserStatus.ACTIVE,
      leadAssignments: {
        none: {
          status: LeadAssignmentStatus.ACTIVE,
        },
      },
      leadScore: {
        isNot: null,
      },
    };

    if (grade) {
      (whereClause.leadScore as Prisma.LeadScoreWhereInput).grade = grade as LeadGrade;
    }

    if (minScore || maxScore) {
      (whereClause.leadScore as Prisma.LeadScoreWhereInput).score = {
        gte: minScore ? parseInt(minScore) : undefined,
        lte: maxScore ? parseInt(maxScore) : undefined,
      };
    }

    const unassignedLeads = await prisma.user.findMany({
      where: whereClause,
      include: {
        leadScore: true,
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
        { leadScore: { score: "desc" } },
        { leadScore: { lastCalculated: "desc" } },
      ],
      take: limit ? parseInt(limit) : 50,
    });

    const formattedLeads = unassignedLeads.map(lead => ({
      user: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        joinDate: lead.joinDate,
      },
      leadScore: {
        score: lead.leadScore?.score || 0,
        grade: lead.leadScore?.grade || 'COLD',
        lastActivity: lead.leadScore?.lastActivity,
        seriousBuyerIndicator: lead.leadScore?.seriousBuyerIndicator || false,
        budgetEstimate: lead.leadScore?.budgetEstimate ? 
          parseFloat(lead.leadScore.budgetEstimate.toString()) : undefined,
        lastCalculated: lead.leadScore?.lastCalculated,
      },
      hasActiveAssignments: lead.leadAssignments.length > 0,
    }));

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