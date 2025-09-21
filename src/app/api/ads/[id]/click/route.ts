import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.ad.update({
      where: { id },
      data: {
        clickCount: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking ad click:", error);
    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 }
    );
  }
}