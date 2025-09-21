import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserFromRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { id: true, role: true, status: true }
    });

    if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ad = await prisma.ad.findUnique({
      where: { id },
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

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error fetching ad:", error);
    return NextResponse.json(
      { error: "Failed to fetch ad" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

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

    const { id } = await params;
    const ad = await prisma.ad.update({
      where: { id },
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
        isActive,
        displayOrder,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
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

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json(
      { error: "Failed to update ad" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { id: true, role: true, status: true }
    });

    if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.ad.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Ad deleted successfully" });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return NextResponse.json(
      { error: "Failed to delete ad" },
      { status: 500 }
    );
  }
}