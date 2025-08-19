import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { getRelativeTime } from '@/lib/utils';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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