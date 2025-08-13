import { NextRequest, NextResponse } from "next/server";
import { leadScoringEngine } from "@/lib/lead-scoring";
import { LeadActivityType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { userId, activityType, propertyId, metadata } = await request.json();

    if (!userId || !activityType) {
      return NextResponse.json(
        {
          success: false,
          error: "userId and activityType are required",
        },
        { status: 400 }
      );
    }

    // Validate activity type
    if (!Object.values(LeadActivityType).includes(activityType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid activity type",
        },
        { status: 400 }
      );
    }

    await leadScoringEngine.trackActivity(
      userId,
      activityType as LeadActivityType,
      propertyId,
      metadata
    );

    return NextResponse.json({
      success: true,
      message: "Activity tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking lead activity:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track activity",
      },
      { status: 500 }
    );
  }
}