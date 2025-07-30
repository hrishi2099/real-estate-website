import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Security check - only allow in development or with secret key
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get('key');
    
    if (process.env.NODE_ENV === 'production' && secretKey !== process.env.SEED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🌱 Starting database seed...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@zaminseva.com' }
    });

    if (existingAdmin) {
      return NextResponse.json({ 
        message: 'Database already seeded', 
        admin: existingAdmin.email 
      });
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@zaminseva.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
      }
    });

    // Create sample properties
    const sampleProperties = [
      {
        title: 'Premium Villa in Mumbai',
        description: 'Luxury 4BHK villa with modern amenities and great connectivity.',
        price: 15000000,
        location: 'Andheri West, Mumbai',
        address: '123 Premium Heights, Andheri West, Mumbai 400058',
        type: 'VILLA',
        status: 'ACTIVE',
        bedrooms: 4,
        bathrooms: 3,
        area: 2500,
        yearBuilt: 2020,
        features: JSON.stringify(['Swimming Pool', 'Gym', 'Parking', 'Security']),
        ownerId: admin.id,
      },
      {
        title: 'Commercial Plot in Pune',
        description: 'Prime commercial land in the heart of Pune IT hub.',
        price: 25000000,
        location: 'Hinjewadi, Pune',
        address: 'Plot 45, Hinjewadi Phase 1, Pune 411057',
        type: 'COMMERCIAL',
        status: 'ACTIVE',
        area: 5000,
        yearBuilt: null,
        features: JSON.stringify(['Corner Plot', 'Wide Road', 'IT Hub Proximity']),
        ownerId: admin.id,
      }
    ];

    const createdProperties = [];
    for (const propertyData of sampleProperties) {
      const property = await prisma.property.create({ data: propertyData });
      createdProperties.push(property);
    }

    // Create sample plots
    const samplePlots = [
      {
        plotNumber: 'P001',
        area: 1200,
        price: 5000000,
        location: 'Sector 15, Navi Mumbai',
        address: 'Plot P001, Sector 15, Navi Mumbai',
        status: 'AVAILABLE',
        description: 'Residential plot in prime location with all utilities.',
        features: JSON.stringify(['Water Connection', 'Electricity', 'Road Access']),
      },
      {
        plotNumber: 'P002',
        area: 800,
        price: 3500000,
        location: 'Wakad, Pune',
        address: 'Plot P002, Wakad, Pune',
        status: 'AVAILABLE',
        description: 'Commercial plot suitable for office development.',
        features: JSON.stringify(['Corner Plot', 'Metro Connectivity', 'IT Hub']),
      }
    ];

    const createdPlots = [];
    for (const plotData of samplePlots) {
      const plot = await prisma.plot.create({ data: plotData });
      createdPlots.push(plot);
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        admin: admin.email,
        properties: createdProperties.length,
        plots: createdPlots.length,
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      error: 'Failed to seed database', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}