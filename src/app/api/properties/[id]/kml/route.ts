import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { kmlContent } = await request.json();

    if (!kmlContent) {
      return NextResponse.json(
        { error: 'KML content is required' },
        { status: 400 }
      );
    }

    // Update the property with the KML content
    const property = await prisma.property.update({
      where: { id },
      data: {
        kmlContent: kmlContent,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'KML saved successfully',
      property: {
        id: property.id,
        title: property.title,
        kmlContent: property.kmlContent
      }
    });

  } catch (error) {
    console.error('Error saving KML:', error);
    return NextResponse.json(
      { error: 'Failed to save KML' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        kmlContent: true,
        latitude: true,
        longitude: true
      }
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      property
    });

  } catch (error) {
    console.error('Error fetching KML:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KML' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
