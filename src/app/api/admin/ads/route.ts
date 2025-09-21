import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserFromRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/admin/ads - Starting request");

    const userPayload = getUserFromRequest(request);
    console.log("User payload:", userPayload);

    if (!userPayload) {
      console.log("No authentication token found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user data to check role
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { id: true, role: true, status: true }
    });

    console.log("User data:", user);

    if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
      console.log("Unauthorized access attempt - not admin or inactive");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('active');
    console.log("Search params:", { type, isActive });

    console.log("Attempting to fetch ads from database...");
    const ads = await prisma.ad.findMany({
      where: {
        ...(type && { type: type as any }),
        ...(isActive !== null && { isActive: isActive === 'true' })
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    console.log(`Successfully fetched ${ads.length} ads`);
    return NextResponse.json(ads);
  } catch (error) {
    console.error("Error fetching ads:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        error: "Failed to fetch ads",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user data to check role
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { id: true, role: true, status: true }
    });

    if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      imageUrl,
      ctaText,
      ctaLink,
      backgroundColor,
      textColor,
      type,
      isActive,
      displayOrder,
      startDate,
      endDate
    } = body;

    if (!title || !description || !ctaText || !ctaLink || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ad = await prisma.ad.create({
      data: {
        title,
        subtitle,
        description,
        imageUrl,
        ctaText,
        ctaLink,
        backgroundColor,
        textColor,
        type,
        isActive: isActive ?? true,
        displayOrder: displayOrder ?? 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: userPayload.userId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json(
      { error: "Failed to create ad" },
      { status: 500 }
    );
  }
}