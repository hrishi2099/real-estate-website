import { NextRequest, NextResponse } from "next/server";
import { leadScoringEngine } from "@/lib/lead-scoring";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 }
      );
    }

    const scoreData = await leadScoringEngine.calculateUserScore(userId);

    return NextResponse.json({
      success: true,
      data: scoreData,
    });
  } catch (error) {
    console.error("Error calculating user score:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate user score",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 }
      );
    }

    await leadScoringEngine.updateUserScore(userId);

    return NextResponse.json({
      success: true,
      message: "Lead score updated successfully",
    });
  } catch (error) {
    console.error("Error updating user score:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user score",
      },
      { status: 500 }
    );
  }
}