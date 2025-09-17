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
    console.error('Validation failed:', validation.error.issues);
    console.error('Request body:', body);
    return NextResponse.json({ error: 'Invalid input', details: validation.error.issues }, { status: 400 });
  }

  const { images, ...propertyData } = validation.data;

  try {
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...propertyData,
        features: propertyData.features ? JSON.stringify(propertyData.features) : undefined,
      },
    });

    if (images) {
      // Delete existing images
      await prisma.propertyImage.deleteMany({
        where: { propertyId: id },
      });

      // Create new images
      if (images.length > 0) {
        await prisma.propertyImage.createMany({
          data: images.map(image => ({
            ...image,
            propertyId: id,
          })),
        });
      }
    }

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