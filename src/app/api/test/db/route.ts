import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("Testing database connection...");

    // Test basic database connectivity
    await prisma.$connect();
    console.log("Database connected successfully");

    // Test if Ad table exists and can be queried
    const adCount = await prisma.ad.count();
    console.log(`Ad table accessible, found ${adCount} ads`);

    // Test if User table exists (required for ads creator relation)
    const userCount = await prisma.user.count();
    console.log(`User table accessible, found ${userCount} users`);

    return NextResponse.json({
      success: true,
      database: "connected",
      ads: adCount,
      users: userCount,
      message: "Database connection and Ad table access successful"
    });
  } catch (error) {
    console.error("Database test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}