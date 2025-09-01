import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { revalidateTag } from 'next/cache';
import { createPropertySchema } from '@/lib/validation';
import { getProperties } from '@/lib/properties';

type PropertyType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CONDO' | 'TOWNHOUSE' | 'COMMERCIAL' | 'LAND';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const type = searchParams.get('type') || undefined;
  const location = searchParams.get('location') || undefined;
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
  const minArea = searchParams.get('minArea') ? parseFloat(searchParams.get('minArea')!) : undefined;

  try {
    const result = await getProperties({
      page,
      limit,
      filters: {
        type: type as PropertyType,
        location,
        minPrice,
        maxPrice,
        minArea,
      },
    });

    if (result.properties.length === 0) {
      return NextResponse.json(result, { headers: { 'x-robots-tag': 'noindex' } });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = requireAdmin(async (req) => {
  const body = await req.json();

  const validation = createPropertySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.issues }, { status: 400 });
  }

  try {
    const newProperty = await prisma.property.create({
      data: {
        ...validation.data,
        ownerId: req.user.userId,
        // Handle Decimal and JSON fields if necessary
        price: validation.data.price,
        area: validation.data.area,
        features: validation.data.features ? JSON.stringify(validation.data.features) : undefined,
      },
    });

    // Revalidate the cache for properties
    revalidateTag('properties');

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});