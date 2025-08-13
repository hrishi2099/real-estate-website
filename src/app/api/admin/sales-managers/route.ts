import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Get all sales managers
export async function GET(request: NextRequest) {
  try {
    const salesManagers = await prisma.user.findMany({
      where: {
        role: "SALES_MANAGER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        territory: true,
        commission: true,
        joinDate: true,
        lastLogin: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            assignedLeads: true,
            properties: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: salesManagers,
    });
  } catch (error) {
    console.error("Error fetching sales managers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sales managers",
      },
      { status: 500 }
    );
  }
}

// Create new sales manager
export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      phone,
      territory,
      commission,
      managerId,
    } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email, and password are required",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create sales manager
    const salesManager = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: "SALES_MANAGER",
        territory,
        commission: commission ? parseFloat(commission) : null,
        managerId,
        status: "ACTIVE",
        emailVerified: true, // Sales managers are pre-verified
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        territory: true,
        commission: true,
        status: true,
        joinDate: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: salesManager,
      message: "Sales manager created successfully",
    });
  } catch (error) {
    console.error("Error creating sales manager:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create sales manager",
      },
      { status: 500 }
    );
  }
}