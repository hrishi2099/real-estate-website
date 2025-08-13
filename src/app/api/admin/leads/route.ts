import { NextRequest, NextResponse } from "next/server";
import { leadScoringEngine } from "@/lib/lead-scoring";
import { LeadGrade } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade") as LeadGrade | null;
    const minScore = searchParams.get("minScore");
    const maxScore = searchParams.get("maxScore");
    const limit = searchParams.get("limit");

    const options: Parameters<typeof leadScoringEngine.getLeadScores>[0] = {};

    if (grade) options.grade = grade;
    if (minScore) options.minScore = parseInt(minScore);
    if (maxScore) options.maxScore = parseInt(maxScore);
    if (limit) options.limit = parseInt(limit);

    const leadScores = await leadScoringEngine.getLeadScores(options);

    return NextResponse.json({
      success: true,
      data: leadScores,
    });
  } catch (error) {
    console.error("Error fetching lead scores:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch lead scores",
      },
      { status: 500 }
    );
  }
}