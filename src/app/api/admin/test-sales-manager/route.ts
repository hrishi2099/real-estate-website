import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Create a test sales manager for debugging
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, password, and name are required",
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
        email,
        password: hashedPassword,
        name,
        role: "SALES_MANAGER",
        status: "ACTIVE",
        territory: "Test Territory",
        commission: 5.0,
        emailVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        territory: true,
        commission: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: salesManager,
      message: "Test sales manager created successfully",
    });

  } catch (error) {
    console.error("Error creating test sales manager:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create test sales manager",
      },
      { status: 500 }
    );
  }
}

// Get existing sales managers for debugging
export async function GET() {
  try {
    const salesManagers = await prisma.user.findMany({
      where: {
        role: "SALES_MANAGER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        territory: true,
        commission: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: salesManagers,
      count: salesManagers.length,
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