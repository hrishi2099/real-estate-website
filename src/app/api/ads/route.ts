import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const currentDate = new Date();

    const ads = await prisma.ad.findMany({
      where: {
        isActive: true,
        ...(type && { type: type as any }),
        OR: [
          { startDate: null },
          { startDate: { lte: currentDate } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: currentDate } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        imageUrl: true,
        ctaText: true,
        ctaLink: true,
        backgroundColor: true,
        textColor: true,
        type: true,
        displayOrder: true
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Track impressions (you might want to implement this more efficiently)
    if (ads.length > 0) {
      await prisma.ad.updateMany({
        where: {
          id: { in: ads.map(ad => ad.id) }
        },
        data: {
          impressionCount: { increment: 1 }
        }
      });
    }

    return NextResponse.json(ads);
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json(
      { error: "Failed to fetch ads" },
      { status: 500 }
    );
  }
}