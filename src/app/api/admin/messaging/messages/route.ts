import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get all RCS messages
export async function GET() {
  try {
    const messages = await prisma.rCSMessage.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: messages,
    });

  } catch (error) {
    console.error("Error fetching RCS messages:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch messages",
      },
      { status: 500 }
    );
  }
}

// Create new RCS message
export async function POST(request: NextRequest) {
  try {
    const {
      title,
      content,
      richContent,
      messageType = "TEXT",
      targetAudience = "ALL_USERS",
      scheduledAt,
      createdById,
    } = await request.json();

    if (!title || !content || !createdById) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, content, and creator ID are required",
        },
        { status: 400 }
      );
    }

    // Create the message
    const message = await prisma.rCSMessage.create({
      data: {
        title,
        content,
        richContent,
        messageType,
        targetAudience,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
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

    // Generate recipients based on target audience
    await generateRecipients(message.id, targetAudience);

    return NextResponse.json({
      success: true,
      data: message,
      message: "RCS message created successfully",
    });

  } catch (error) {
    console.error("Error creating RCS message:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create message",
      },
      { status: 500 }
    );
  }
}

interface User {
  id: string;
}

// Helper function to generate recipients based on audience
async function generateRecipients(messageId: string, targetAudience: string) {
  let users: User[] = [];

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

  // Create recipients
  if (users.length > 0) {
    await prisma.rCSRecipient.createMany({
      data: users.map(user => ({
        messageId,
        userId: user.id,
      })),
    });
  }
}