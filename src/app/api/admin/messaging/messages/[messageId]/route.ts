import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// Get specific message
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;

    const message = await prisma.rCSMessage.findUnique({
      where: { id: messageId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        recipients: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        deliveryReports: true,
      },
    });

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Message not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: message,
    });

  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch message",
      },
      { status: 500 }
    );
  }
}

// Update message
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const {
      title,
      content,
      richContent,
      messageType,
      targetAudience,
      scheduledAt,
    } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and content are required",
        },
        { status: 400 }
      );
    }

    // Check if message can be updated (only DRAFT messages)
    const existingMessage = await prisma.rCSMessage.findUnique({
      where: { id: messageId },
    });

    if (!existingMessage) {
      return NextResponse.json(
        {
          success: false,
          error: "Message not found",
        },
        { status: 404 }
      );
    }

    if (existingMessage.status !== 'DRAFT') {
      return NextResponse.json(
        {
          success: false,
          error: "Only draft messages can be updated",
        },
        { status: 400 }
      );
    }

    const message = await prisma.rCSMessage.update({
      where: { id: messageId },
      data: {
        title,
        content,
        richContent,
        messageType,
        targetAudience,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        recipients: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        deliveryReports: true,
      },
    });

    // If target audience changed, regenerate recipients
    if (targetAudience !== existingMessage.targetAudience) {
      // Delete existing recipients
      await prisma.rCSRecipient.deleteMany({
        where: { messageId },
      });

      // Generate new recipients
      await generateRecipients(messageId, targetAudience);
    }

    return NextResponse.json({
      success: true,
      data: message,
      message: "Message updated successfully",
    });

  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update message",
      },
      { status: 500 }
    );
  }
}

// Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;

    // Check if message exists and can be deleted
    const existingMessage = await prisma.rCSMessage.findUnique({
      where: { id: messageId },
    });

    if (!existingMessage) {
      return NextResponse.json(
        {
          success: false,
          error: "Message not found",
        },
        { status: 404 }
      );
    }

    if (existingMessage.status === 'SENDING') {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete message that is currently being sent",
        },
        { status: 400 }
      );
    }

    await prisma.rCSMessage.delete({
      where: { id: messageId },
    });

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete message",
      },
      { status: 500 }
    );
  }
}

// Helper function (same as in main route)
async function generateRecipients(messageId: string, targetAudience: string) {
  let users: any[] = [];

  switch (targetAudience) {
    case 'ALL_USERS':
      users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });
      break;
    
    case 'LEADS_ONLY':
      users = await prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          role: 'USER',
          leadScore: {
            isNot: null,
          },
        },
        select: { id: true },
      });
      break;
    
    case 'SALES_MANAGERS':
      users = await prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          role: 'SALES_MANAGER',
        },
        select: { id: true },
      });
      break;
    
    case 'PROPERTY_INQUIRERS':
      users = await prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          inquiries: {
            some: {},
          },
        },
        select: { id: true },
        distinct: ['id'],
      });
      break;
    
    case 'ACTIVE_USERS':
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      users = await prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          lastLogin: {
            gte: thirtyDaysAgo,
          },
        },
        select: { id: true },
      });
      break;
    
    default:
      users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });
  }

  if (users.length > 0) {
    await prisma.rCSRecipient.createMany({
      data: users.map(user => ({
        messageId,
        userId: user.id,
      })),
    });
  }
}