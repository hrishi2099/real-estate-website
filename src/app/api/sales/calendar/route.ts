import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface WhereClause {
  salesManagerId: string;
  startTime?: {
    gte: Date;
    lte: Date;
  };
}

// Get calendar events for a sales manager
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salesManagerId = searchParams.get("salesManagerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!salesManagerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Sales manager ID is required",
        },
        { status: 400 }
      );
    }

    const where: WhereClause = {
      salesManagerId,
    };

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const calendarEvents = await prisma.calendarEvent.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const formattedEvents = calendarEvents.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      type: event.eventType,
      leadId: event.leadId,
      leadName: event.lead?.name,
      propertyId: event.propertyId,
      propertyTitle: event.property?.title,
      status: event.status,
    }));

    return NextResponse.json({
      success: true,
      data: formattedEvents,
    });

  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch calendar events",
      },
      { status: 500 }
    );
  }
}

// Create new calendar event
export async function POST(request: NextRequest) {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      type = "OTHER",
      leadId,
      propertyId,
      salesManagerId,
    } = await request.json();

    if (!title || !startTime || !endTime || !salesManagerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, start time, end time, and sales manager ID are required",
        },
        { status: 400 }
      );
    }

    const calendarEvent = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        eventType: type,
        salesManagerId,
        leadId: leadId || null,
        propertyId: propertyId || null,
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
      },
    });

    const formattedEvent = {
      id: calendarEvent.id,
      title: calendarEvent.title,
      description: calendarEvent.description,
      startTime: calendarEvent.startTime.toISOString(),
      endTime: calendarEvent.endTime.toISOString(),
      type: calendarEvent.eventType,
      leadId: calendarEvent.leadId,
      leadName: calendarEvent.lead?.name,
      propertyId: calendarEvent.propertyId,
      propertyTitle: calendarEvent.property?.title,
      status: calendarEvent.status,
    };

    return NextResponse.json({
      success: true,
      data: formattedEvent,
      message: "Calendar event created successfully",
    });

  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create calendar event",
      },
      { status: 500 }
    );
  }
}