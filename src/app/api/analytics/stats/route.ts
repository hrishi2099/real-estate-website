import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalProperties,
      totalSoldProperties,
      totalArea
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: 'SOLD' } }),
      prisma.property.aggregate({
        _sum: { area: true }
      })
    ]);

    const stats = [
      {
        id: 1,
        number: totalSoldProperties || 0,
        label: "Properties Sold",
        suffix: "+",
        icon: "🏠",
        description: "Successfully completed property transactions"
      },
      {
        id: 2,
        number: 90300,
        label: "Acres Sold",
        prefix: "",
        suffix: "+",
        icon: "🌾",
        description: "Total land area sold in acres"
      },
      {
        id: 3,
        number: 23,
        label: "Years Experience",
        suffix: "+",
        icon: "⏰",
        description: "In real estate market"
      },
      {
        id: 4,
        number: 99,
        label: "Client Satisfaction",
        suffix: "%",
        icon: "⭐",
        description: "Happy property owners rating"
      },
      {
        id: 5,
        number: totalProperties - totalSoldProperties || 0,
        label: "Available Properties",
        suffix: "+",
        icon: "🏗️",
        description: "Ready for purchase"
      },
      {
        id: 6,
        number: 30, // Static average for now
        label: "Days Average Sale",
        suffix: "",
        icon: "📈",
        description: "Time to complete transaction"
      }
    ];

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics stats' },
      { status: 500 }
    );
  }
}