import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface WhereClause {
  role: string;
  status: string;
  leadScore: {
    isNot: null;
    grade?: string;
    score?: {
      gte?: number;
      lte?: number;
    };
  };
  leadAssignments: {
    none: {
      status: string;
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");
    const minScore = searchParams.get("minScore");
    const maxScore = searchParams.get("maxScore");
    const limit = searchParams.get("limit");

    // Get users with lead scores who are not assigned to any sales manager
    const whereClause: WhereClause = {
      role: "USER",
      status: "ACTIVE",
      leadScore: {
        isNot: null,
      },
      leadAssignments: {
        none: {
          status: "ACTIVE", // Only exclude leads that have active assignments
        },
      },
    };

    // Filter by lead score grade if specified
    if (grade) {
      whereClause.leadScore.grade = grade;
    }

    // Filter by score range if specified
    if (minScore || maxScore) {
      whereClause.leadScore.score = {};
      if (minScore) whereClause.leadScore.score.gte = parseInt(minScore);
      if (maxScore) whereClause.leadScore.score.lte = parseInt(maxScore);
    }

    const unassignedLeads = await prisma.user.findMany({
      where: whereClause,
      include: {
        leadScore: true,
        leadAssignments: {
          where: {
            status: "ACTIVE",
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

    // Format the response
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