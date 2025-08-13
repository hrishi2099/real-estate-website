import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// Get specific template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;

    const template = await prisma.messageTemplate.findUnique({
      where: { id: templateId },
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

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: "Template not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
    });

  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch template",
      },
      { status: 500 }
    );
  }
}

// Update template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
    const {
      name,
      description,
      content,
      richContent,
      messageType,
      category,
      isActive,
    } = await request.json();

    if (!name || !content) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and content are required",
        },
        { status: 400 }
      );
    }

    const template = await prisma.messageTemplate.update({
      where: { id: templateId },
      data: {
        name,
        description,
        content,
        richContent,
        messageType,
        category,
        isActive,
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
      message: "Template updated successfully",
    });

  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update template",
      },
      { status: 500 }
    );
  }
}

// Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;

    await prisma.messageTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete template",
      },
      { status: 500 }
    );
  }
}