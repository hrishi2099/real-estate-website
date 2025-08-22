import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getRelativeTime } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const userPayload = getUserFromRequest(req as any);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Sales managers should use the /sales dashboard, not the user dashboard.
    if (user.role === 'SALES_MANAGER') {
      return NextResponse.json(
        { error: 'Access denied for this role. Please use the Sales Dashboard.' },
        { status: 403 }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        property: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3, // Limit to 3 for the dashboard preview
    });

    const formattedFavorites = favorites.map((fav) => ({
      id: fav.property.id,
      title: fav.property.title,
      price: fav.property.price.toString(),
      location: fav.property.location,
      area: fav.property.area ? `${fav.property.area} sqft` : 'N/A',
      image: fav.property.images[0]?.url || '/placeholder-image.jpg',
      savedDate: getRelativeTime(fav.createdAt),
    }));

    return NextResponse.json(formattedFavorites);
  } catch (error) {
    console.error('Error fetching dashboard favorites:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching dashboard favorites.' },
      { status: 500 }
    );
  }
}