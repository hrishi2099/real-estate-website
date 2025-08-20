import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get all message templates
export async function GET() {
  try {
    const templates = await prisma.messageTemplate.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: templates,
    });

  } catch (error) {
    console.error("Error fetching message templates:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch templates",
      },
      { status: 500 }
    );
  }
}

// Create new message template
export async function POST(request: NextRequest) {
  try {
    const {
      name,
      description,
      content,
      richContent,
      messageType = "TEXT",
      category = "GENERAL",
      isActive = true,
      createdById,
    } = await request.json();

    if (!name || !content || !createdById) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, content, and creator ID are required",
        },
        { status: 400 }
      );
    }

    const template = await prisma.messageTemplate.create({
      data: {
        name,
        description,
        content,
        richContent,
        messageType,
        category,
        isActive,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: template,
      message: "Template created successfully",
    });

  } catch (error) {
    console.error("Error creating message template:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create template",
      },
      { status: 500 }
    );
  }
}