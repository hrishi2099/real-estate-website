import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plot = await prisma.plot.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!plot) {
      return NextResponse.json(
        { error: 'Plot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(plot);
  } catch (error) {
    console.error('Error fetching plot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plot' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const updateData: any = {
      plotNumber: body.plotNumber,
      area: parseFloat(body.area),
      price: parseFloat(body.price),
      location: body.location,
      address: body.address,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      status: body.status,
      description: body.description,
      features: body.features,
    };

    // If marking as sold, add buyer info and sold date
    if (body.status === 'SOLD' && body.buyerId) {
      updateData.buyerId = body.buyerId;
      updateData.soldDate = new Date();
    }

    // If changing from sold to available, clear buyer info
    if (body.status !== 'SOLD') {
      updateData.buyerId = null;
      updateData.soldDate = null;
    }

    const plot = await prisma.plot.update({
      where: { id: params.id },
      data: updateData,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json(plot);
  } catch (error) {
    console.error('Error updating plot:', error);
    return NextResponse.json(
      { error: 'Failed to update plot' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.plot.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Plot deleted successfully' });
  } catch (error) {
    console.error('Error deleting plot:', error);
    return NextResponse.json(
      { error: 'Failed to delete plot' },
      { status: 500 }
    );
  }
}