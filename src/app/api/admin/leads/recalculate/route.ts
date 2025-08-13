import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadScoringEngine } from "@/lib/lead-scoring";

export async function POST(request: NextRequest) {
  try {
    const { userIds } = await request.json();

    if (userIds && Array.isArray(userIds)) {
      // Recalculate for specific users
      const promises = userIds.map((userId: string) => 
        leadScoringEngine.updateUserScore(userId)
      );
      await Promise.all(promises);

      return NextResponse.json({
        success: true,
        message: `Recalculated scores for ${userIds.length} users`,
      });
    } else {
      // Recalculate for all users
      const users = await prisma.user.findMany({
        where: {
          role: "USER",
          status: "ACTIVE",
        },
        select: {
          id: true,
        },
      });

      const promises = users.map(user => 
        leadScoringEngine.updateUserScore(user.id)
      );
      await Promise.all(promises);

      return NextResponse.json({
        success: true,
        message: `Recalculated scores for ${users.length} users`,
      });
    }
  } catch (error) {
    console.error("Error recalculating lead scores:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to recalculate lead scores",
      },
      { status: 500 }
    );
  }
}