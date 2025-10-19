import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { revalidateTag } from 'next/cache';
import { createPropertySchema } from '@/lib/validation';
import { getProperties } from '@/lib/properties';
import { getUserFromRequest } from '@/lib/auth';
import { PropertyType } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const type = searchParams.get('type') || undefined;
  const location = searchParams.get('location') || undefined;
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
  const minArea = searchParams.get('minArea') ? parseFloat(searchParams.get('minArea')!) : undefined;
  const status = searchParams.get('status') || undefined;

  const user = await getUserFromRequest(req);
  const isSalesManager = user?.role === 'SALES_MANAGER';

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
        status,
        ...(isSalesManager && { salesManagerId: user.userId }),
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
  console.log('Received property creation request with body:', JSON.stringify(body, null, 2));

  const validation = createPropertySchema.safeParse(body);
  if (!validation.success) {
    console.error('Validation failed with issues:', JSON.stringify(validation.error.issues, null, 2));
    return NextResponse.json({ error: 'Invalid input', details: validation.error.issues }, { status: 400 });
  }

  const { images, ...propertyData } = validation.data;

  try {
    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        ownerId: req.user.userId,
        price: propertyData.price,
        area: propertyData.area,
        features: propertyData.features ? JSON.stringify(propertyData.features) : undefined,
      },
    });

    if (images && images.length > 0) {
      await prisma.propertyImage.createMany({
        data: images.map(image => ({
          ...image,
          propertyId: newProperty.id,
        })),
      });
    }

    // Revalidate the cache for properties
    revalidateTag('properties');

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});