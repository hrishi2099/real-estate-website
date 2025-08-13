import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { AnalyticsTracker } from '@/lib/analytics-tracker';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's favorite properties
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        property: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data for frontend
    const formattedFavorites = favorites.map(favorite => ({
      id: favorite.property.id,
      title: favorite.property.title,
      price: favorite.property.price,
      location: favorite.property.location,
      type: favorite.property.type,
      bedrooms: favorite.property.bedrooms || 0,
      bathrooms: favorite.property.bathrooms || 0,
      area: favorite.property.area || 0,
      image: favorite.property.images[0]?.url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      addedDate: favorite.createdAt.toISOString().split('T')[0]
    }));

    return NextResponse.json(formattedFavorites);

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { propertyId } = await request.json();

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId: propertyId
        }
      }
    });

    if (existingFavorite) {
      return NextResponse.json({ error: 'Property already in favorites' }, { status: 400 });
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        propertyId: propertyId
      }
    });

    // Track the favorite action
    await AnalyticsTracker.trackPropertyFavorite({
      userId: user.id,
      propertyId: propertyId,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 undefined
    });

    return NextResponse.json({ message: 'Property added to favorites', favoriteId: favorite.id });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { propertyId } = await request.json();

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    // Remove from favorites
    await prisma.favorite.deleteMany({
      where: {
        userId: user.id,
        propertyId: propertyId
      }
    });

    return NextResponse.json({ message: 'Property removed from favorites' });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}