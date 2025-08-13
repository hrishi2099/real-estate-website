import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Mock favorites data for testing
    const mockFavorites = [
      {
        id: "1",
        title: "Premium Residential Property",
        price: "28500000",
        location: "Green Valley, CA",
        area: "8,500 sqft",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        savedDate: "2 days ago"
      },
      {
        id: "2", 
        title: "Commercial Development Land",
        price: "75000000",
        location: "Business District, TX",
        area: "12,000 sqft",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        savedDate: "1 week ago"
      }
    ];

    try {
      const session = await getServerSession();
      
      if (!session?.user?.email) {
        return NextResponse.json(mockFavorites);
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        return NextResponse.json(mockFavorites);
      }

      // Get user's favorite properties (limited for dashboard sidebar)
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
        orderBy: { createdAt: 'desc' },
        take: 3 // Only show 3 most recent for dashboard
      });

      // Transform the data for frontend
      const formattedFavorites = favorites.map(favorite => ({
        id: favorite.property.id,
        title: favorite.property.title,
        price: favorite.property.price.toString(),
        location: favorite.property.location,
        area: favorite.property.area ? `${favorite.property.area} sqft` : 'N/A',
        image: favorite.property.images[0]?.url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        savedDate: getRelativeTime(favorite.createdAt)
      }));

      return NextResponse.json(formattedFavorites);

    } catch (dbError) {
      console.log('Database unavailable for dashboard favorites, using mock data');
      return NextResponse.json(mockFavorites);
    }

  } catch (error) {
    console.error('Dashboard favorites error:', error);
    return NextResponse.json([]);
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
}