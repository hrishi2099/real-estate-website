import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { revalidateTag } from 'next/cache';
import { updatePropertySchema } from '@/lib/validation';
import { getProperty } from '@/lib/properties';

export async function GET(req: Request, context: any) {
  const { id } = context.params;

  try {
    const property = await getProperty(id);

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const PUT = requireAdmin(async (req, { params }: { params: { id: string } }) => {
  const { id } = params;
  const body = await req.json();

  const validation = updatePropertySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.issues }, { status: 400 });
  }

  try {
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...(() => {
          const { features, ...rest } = validation.data;
          return rest;
        })(),
        // Handle Decimal and JSON fields if necessary
        ...(validation.data.price && { price: validation.data.price }),
        ...(validation.data.features !== undefined && {
          features: Array.isArray(validation.data.features)
            ? validation.data.features.join(', ')
            : validation.data.features,
        }),
      },
    });

    // Revalidate the cache for properties
    revalidateTag('properties');

    return NextResponse.json(updatedProperty);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (req, { params }: { params: { id: string } }) => {
  const { id } = params;

  try {
    // First, delete related records if necessary (e.g., images, inquiries)
    await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
    await prisma.inquiry.deleteMany({ where: { propertyId: id } });
    await prisma.favorite.deleteMany({ where: { propertyId: id } });

    await prisma.property.delete({
      where: { id },
    });

    // Revalidate the cache for properties
    revalidateTag('properties');

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});