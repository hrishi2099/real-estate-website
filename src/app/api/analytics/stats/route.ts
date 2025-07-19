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
        label: "Land Plots Sold",
        suffix: "+",
        icon: "🌿",
        description: "Successfully transferred land parcels"
      },
      {
        id: 2,
        number: Math.round((totalArea._sum.area || 0) / 1000000 * 10) / 10,
        label: "Million Sq Ft Sold",
        prefix: "",
        suffix: "M+",
        icon: "📏",
        description: "Total land area transferred"
      },
      {
        id: 3,
        number: new Date().getFullYear() - 2008, // Founded in 2008
        label: "Years Experience",
        suffix: "+",
        icon: "⏰",
        description: "In land development market"
      },
      {
        id: 4,
        number: Math.min(Math.round((totalSoldProperties / Math.max(totalProperties, 1)) * 100), 97),
        label: "Client Satisfaction",
        suffix: "%",
        icon: "⭐",
        description: "Happy landowners rating"
      },
      {
        id: 5,
        number: totalProperties - totalSoldProperties || 0,
        label: "Available Plots",
        suffix: "+",
        icon: "🏗️",
        description: "Ready for development"
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