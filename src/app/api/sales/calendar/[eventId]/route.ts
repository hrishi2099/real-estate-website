import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// Update calendar event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const {
      title,
      description,
      startTime,
      endTime,
      type,
      leadId,
      propertyId,
      status = "SCHEDULED",
    } = await request.json();

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, start time, and end time are required",
        },
        { status: 400 }
      );
    }

    const calendarEvent = await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        eventType: type,
        leadId: leadId || null,
        propertyId: propertyId || null,
        status,
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
      message: "Calendar event updated successfully",
    });

  } catch (error) {
    console.error("Error updating calendar event:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update calendar event",
      },
      { status: 500 }
    );
  }
}

// Delete calendar event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    await prisma.calendarEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({
      success: true,
      message: "Calendar event deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete calendar event",
      },
      { status: 500 }
    );
  }
}