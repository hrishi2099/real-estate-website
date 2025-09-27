import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EventData {
  id: string;
  url: string;
  title: string;
  date: string;
  description: string;
  category: string;
}

export async function GET() {
  try {
    // Get section info
    let sectionInfo = await prisma.memorableMomentsSection.findFirst();

    // If no section exists, create default
    if (!sectionInfo) {
      sectionInfo = await prisma.memorableMomentsSection.create({
        data: {
          title: "Memorable Moments",
          subtitle: "Our Journey",
          description: "Explore the highlights of our journey through captivating moments that showcase our commitment to excellence, community engagement, and industry leadership."
        }
      });
    }

    // Get events
    const events = await prisma.memorableMoment.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });

    // Transform events to match expected format
    const transformedEvents = events.map(event => ({
      id: event.id,
      url: event.imageUrl,
      title: event.title,
      date: event.date,
      description: event.description,
      category: event.category
    }));

    return NextResponse.json({
      sectionInfo: {
        title: sectionInfo.title,
        subtitle: sectionInfo.subtitle,
        description: sectionInfo.description
      },
      events: transformedEvents
    });
  } catch (error) {
    console.error('Error reading memorable moments data:', error);
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log('Received memorable moments data:', {
      sectionInfo: data.sectionInfo,
      eventsCount: data.events?.length || 0,
      events: data.events?.map((e: any, i: number) => ({
        index: i,
        id: e.id,
        title: e.title,
        hasUrl: !!e.url,
        hasDate: !!e.date,
        hasDescription: !!e.description,
        hasCategory: !!e.category
      }))
    });

    // Validate data structure
    if (!data.sectionInfo || !data.events || !Array.isArray(data.events)) {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredSectionFields = ['title', 'subtitle', 'description'];
    for (const field of requiredSectionFields) {
      if (!data.sectionInfo[field]) {
        return NextResponse.json(
          { error: `Missing required field: sectionInfo.${field}` },
          { status: 400 }
        );
      }
    }

    // Validate events - only validate non-empty events
    for (const event of data.events as EventData[]) {
      // Skip validation for empty events (they won't be saved)
      if (!event.title && !event.url && !event.description) {
        continue;
      }

      // For non-empty events, ensure required fields are present
      const requiredEventFields: (keyof EventData)[] = ['title', 'date', 'description', 'category'];
      for (const field of requiredEventFields) {
        if (!event[field] || event[field].trim() === '') {
          return NextResponse.json(
            { error: `Missing required field: events.${field} for event "${event.title || 'untitled'}"` },
            { status: 400 }
          );
        }
      }

      // URL is optional but should be a string if provided
      if (event.url && typeof event.url !== 'string') {
        return NextResponse.json(
          { error: `Invalid URL format for event "${event.title}"` },
          { status: 400 }
        );
      }
    }

    // Update section info
    const existingSection = await prisma.memorableMomentsSection.findFirst();
    if (existingSection) {
      await prisma.memorableMomentsSection.update({
        where: { id: existingSection.id },
        data: {
          title: data.sectionInfo.title,
          subtitle: data.sectionInfo.subtitle,
          description: data.sectionInfo.description
        }
      });
    } else {
      await prisma.memorableMomentsSection.create({
        data: {
          title: data.sectionInfo.title,
          subtitle: data.sectionInfo.subtitle,
          description: data.sectionInfo.description
        }
      });
    }

    // Clear existing events and create new ones
    await prisma.memorableMoment.deleteMany();

    // Filter out empty events and save only valid ones
    const validEvents = data.events.filter((event: EventData) =>
      event.title && event.title.trim() !== '' &&
      event.description && event.description.trim() !== '' &&
      event.date && event.date.trim() !== '' &&
      event.category && event.category.trim() !== ''
    );

    for (let i = 0; i < validEvents.length; i++) {
      const event = validEvents[i];
      await prisma.memorableMoment.create({
        data: {
          title: event.title.trim(),
          description: event.description.trim(),
          imageUrl: event.url ? event.url.trim() : '',
          date: event.date.trim(),
          category: event.category.trim(),
          displayOrder: i,
          isActive: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Memorable moments data updated successfully'
    });

  } catch (error) {
    console.error('Error updating memorable moments data:', error);

    // Provide more specific error message
    let errorMessage = 'Failed to update data';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack
      });
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}