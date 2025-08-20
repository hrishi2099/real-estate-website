import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Get specific sales manager
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const salesManager = await prisma.user.findUnique({
      where: {
        id: (await params).id,
        role: "SALES_MANAGER",
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedLeads: {
          include: {
            lead: {
              include: {
                leadScore: true,
              },
            },
          },
          orderBy: {
            assignedAt: "desc",
          },
        },
        _count: {
          select: {
            assignedLeads: true,
            properties: true,
          },
        },
      },
    });

    if (!salesManager) {
      return NextResponse.json(
        {
          success: false,
          error: "Sales manager not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: salesManager,
    });
  } catch (error) {
    console.error("Error fetching sales manager:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sales manager",
      },
      { status: 500 }
    );
  }
}

interface UpdateData {
  name?: string;
  email?: string;
  phone?: string;
  territory?: string;
  commission?: number | null;
  status?: string;
  managerId?: string;
  password?: string;
}

// Update sales manager
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {
      name,
      email,
      phone,
      territory,
      commission,
      status,
      managerId,
      password,
    } = await request.json();

    const updateData: UpdateData = {
      name,
      email,
      phone,
      territory,
      commission: commission ? parseFloat(commission) : null,
      status,
      managerId,
    };

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedSalesManager = await prisma.user.update({
      where: {
        id: (await params).id,
        role: "SALES_MANAGER",
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        territory: true,
        commission: true,
        status: true,
        managerId: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedSalesManager,
      message: "Sales manager updated successfully",
    });
  } catch (error) {
    console.error("Error updating sales manager:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update sales manager",
      },
      { status: 500 }
    );
  }
}

// Delete sales manager
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.user.delete({
      where: {
        id: (await params).id,
        role: "SALES_MANAGER",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sales manager deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sales manager:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete sales manager",
      },
      { status: 500 }
    );
  }
}