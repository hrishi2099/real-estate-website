import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Validate events
    const requiredEventFields = ['url', 'title', 'date', 'description', 'category'];
    for (const event of data.events) {
      for (const field of requiredEventFields) {
        if (!event[field]) {
          return NextResponse.json(
            { error: `Missing required field: events.${field}` },
            { status: 400 }
          );
        }
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

    for (let i = 0; i < data.events.length; i++) {
      const event = data.events[i];
      await prisma.memorableMoment.create({
        data: {
          title: event.title,
          description: event.description,
          imageUrl: event.url,
          date: event.date,
          category: event.category,
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
    return NextResponse.json(
      { error: 'Failed to update data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}