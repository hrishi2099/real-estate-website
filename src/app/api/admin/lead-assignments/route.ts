import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface WhereClause {
  salesManagerId?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
}

// Get all lead assignments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salesManagerId = searchParams.get("salesManagerId");
    const status = searchParams.get("status");

    const where: WhereClause = {};
    if (salesManagerId) where.salesManagerId = salesManagerId;
    if (status) where.status = status as 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';

    const assignments = await prisma.leadAssignment.findMany({
      where,
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
    });

    return NextResponse.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error("Error fetching lead assignments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch lead assignments",
      },
      { status: 500 }
    );
  }
}

// Create new lead assignment
export async function POST(request: NextRequest) {
  try {
    const {
      leadId,
      salesManagerId,
      notes,
      expectedCloseDate,
      priority = "MEDIUM",
    } = await request.json();

    if (!leadId || !salesManagerId) {
      return NextResponse.json(
        {
          success: false,
          error: "leadId and salesManagerId are required",
        },
        { status: 400 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.leadAssignment.findUnique({
      where: {
        leadId_salesManagerId: {
          leadId,
          salesManagerId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        {
          success: false,
          error: "Lead is already assigned to this sales manager",
        },
        { status: 400 }
      );
    }

    const assignment = await prisma.leadAssignment.create({
      data: {
        leadId,
        salesManagerId,
        notes,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        priority,
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
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: assignment,
      message: "Lead assigned successfully",
    });
  } catch (error) {
    console.error("Error creating lead assignment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to assign lead",
      },
      { status: 500 }
    );
  }
}