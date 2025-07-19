import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit";

async function verifyAdmin(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    
    if (!userPayload) {
      return null;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId }
    });
    
    if (!user || user.role !== "ADMIN") {
      return null;
    }
    
    return user;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  // Allow public access to GET office settings for contact page
  try {
    let settings = await prisma.officeSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.officeSettings.create({
        data: {}
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching office settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(rateLimitConfigs.adminStrict)(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    const { 
      companyName, address, phone, email, website, logoUrl,
      mondayHours, tuesdayHours, wednesdayHours, thursdayHours, 
      fridayHours, saturdayHours, sundayHours 
    } = data;
    
    // Filter out undefined values and empty strings
    const updateData: {
      companyName?: string | null;
      address?: string | null;
      phone?: string | null;
      email?: string | null;
      website?: string | null;
      logoUrl?: string | null;
      mondayHours?: string | null;
      tuesdayHours?: string | null;
      wednesdayHours?: string | null;
      thursdayHours?: string | null;
      fridayHours?: string | null;
      saturdayHours?: string | null;
      sundayHours?: string | null;
    } = {};
    if (companyName !== undefined) updateData.companyName = companyName || null;
    if (address !== undefined) updateData.address = address || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (email !== undefined) updateData.email = email || null;
    if (website !== undefined) updateData.website = website || null;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl || null;
    
    // Office hours
    if (mondayHours !== undefined) updateData.mondayHours = mondayHours || null;
    if (tuesdayHours !== undefined) updateData.tuesdayHours = tuesdayHours || null;
    if (wednesdayHours !== undefined) updateData.wednesdayHours = wednesdayHours || null;
    if (thursdayHours !== undefined) updateData.thursdayHours = thursdayHours || null;
    if (fridayHours !== undefined) updateData.fridayHours = fridayHours || null;
    if (saturdayHours !== undefined) updateData.saturdayHours = saturdayHours || null;
    if (sundayHours !== undefined) updateData.sundayHours = sundayHours || null;
    
    let settings = await prisma.officeSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.officeSettings.create({
        data: updateData
      });
    } else {
      settings = await prisma.officeSettings.update({
        where: { id: settings.id },
        data: updateData
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating office settings:", error);
    return NextResponse.json({ 
      error: "Failed to update settings", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}