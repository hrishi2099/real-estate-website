import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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
    const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@zaminseva.com' } });

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
        title: 'Agricultural Land in Mumbai',
        description: 'Fertile agricultural land suitable for farming with great irrigation.',
        price: 15000000,
        location: 'Andheri West, Mumbai',
        address: '123 Farm Heights, Andheri West, Mumbai 400058',
        type: 'AGRICULTURAL_LAND' as const,
        status: 'ACTIVE' as const,
        area: 2500,
        yearBuilt: null,
        features: 'Irrigation, Road Access, Fertile Soil',
        ownerId: admin.id,
      },
      {
        title: 'NA Land in Pune',
        description: 'Prime NA land ready for development in Pune IT hub.',
        price: 25000000,
        location: 'Hinjewadi, Pune',
        address: 'Plot 45, Hinjewadi Phase 1, Pune 411057',
        type: 'NA_LAND' as const,
        status: 'ACTIVE' as const,
        area: 5000,
        yearBuilt: null,
        features: 'Corner Location, Wide Road Access, IT Hub Proximity',
        ownerId: admin.id,
      }
    ];

    const createdProperties = [];
    for (const propertyData of sampleProperties) {
      const property = await prisma.property.create({ data: propertyData });
      createdProperties.push(property);
    }

    // Note: Plot functionality has been removed from this application

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        admin: admin.email,
        properties: createdProperties.length,
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