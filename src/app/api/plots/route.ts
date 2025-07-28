import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const where = status ? { status: status as any } : {};
    
    const plots = await prisma.plot.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        plotNumber: 'asc'
      }
    });

    // Get statistics
    const stats = await prisma.plot.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const plotStats = {
      total: plots.length,
      available: stats.find(s => s.status === 'AVAILABLE')?._count.status || 0,
      sold: stats.find(s => s.status === 'SOLD')?._count.status || 0,
      reserved: stats.find(s => s.status === 'RESERVED')?._count.status || 0,
      inactive: stats.find(s => s.status === 'INACTIVE')?._count.status || 0,
    };

    return NextResponse.json({
      plots,
      stats: plotStats
    });
  } catch (error) {
    console.error('Error fetching plots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const plot = await prisma.plot.create({
      data: {
        plotNumber: body.plotNumber,
        area: parseFloat(body.area),
        price: parseFloat(body.price),
        location: body.location,
        address: body.address,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        status: body.status || 'AVAILABLE',
        description: body.description,
        features: body.features,
      },
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
    console.error('Error creating plot:', error);
    return NextResponse.json(
      { error: 'Failed to create plot' },
      { status: 500 }
    );
  }
}