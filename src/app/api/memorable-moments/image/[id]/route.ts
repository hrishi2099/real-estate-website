import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the memorable moment with image data
    const moment = await prisma.memorableMoment.findUnique({
      where: { id },
      select: {
        imageData: true,
        imageMimeType: true,
        imageUrl: true,
      },
    });

    if (!moment) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // If we have image data in database, serve it
    if (moment.imageData && moment.imageMimeType) {
      return new NextResponse(moment.imageData, {
        headers: {
          'Content-Type': moment.imageMimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // If no image data in database, return 404
    return NextResponse.json(
      { error: 'Image data not available' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
