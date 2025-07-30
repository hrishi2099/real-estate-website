#!/usr/bin/env node

/**
 * Production Database Seeding Script
 * Run this to seed your production database on Vercel
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding production database...');

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@zaminseva.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
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

    console.log('✅ Admin user created:', admin.email);

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

    for (const propertyData of sampleProperties) {
      await prisma.property.create({ data: propertyData });
    }

    console.log(`✅ Created ${sampleProperties.length} sample properties`);

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

    for (const plotData of samplePlots) {
      await prisma.plot.create({ data: plotData });
    }

    console.log(`✅ Created ${samplePlots.length} sample plots`);

    console.log('🎉 Production database seeded successfully!');
    console.log('Admin credentials: admin@zaminseva.com / admin123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });