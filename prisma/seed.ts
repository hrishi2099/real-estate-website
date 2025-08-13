import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash password for admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create sample properties
  const properties = [
    {
      title: 'Modern Downtown Apartment',
      description: 'Beautiful modern apartment in the heart of the city with stunning views.',
      price: 350000,
      location: 'Downtown',
      address: '123 Main Street, Downtown',
      latitude: 40.7128,
      longitude: -74.0060,
      type: 'APARTMENT' as const,
      bedrooms: 2,
      bathrooms: 2,
      area: 950,
      yearBuilt: 2020,
      features: 'Balcony, Modern Kitchen, High Ceilings, City Views',
      isFeatured: true,
    },
    {
      title: 'Spacious Family House',
      description: 'Perfect family home with large backyard and quiet neighborhood.',
      price: 525000,
      location: 'Suburbs',
      address: '456 Oak Avenue, Suburbia',
      latitude: 40.7489,
      longitude: -73.9857,
      type: 'HOUSE' as const,
      bedrooms: 4,
      bathrooms: 3,
      area: 2200,
      yearBuilt: 2018,
      features: 'Large Backyard, Garage, Modern Appliances, Quiet Street',
      isFeatured: true,
    },
    {
      title: 'Luxury Villa with Pool',
      description: 'Stunning luxury villa with private pool and premium finishes.',
      price: 850000,
      location: 'Exclusive Hills',
      address: '789 Hillside Drive, Premium District',
      latitude: 40.7831,
      longitude: -73.9712,
      type: 'VILLA' as const,
      bedrooms: 5,
      bathrooms: 4,
      area: 3500,
      yearBuilt: 2021,
      features: 'Private Pool, Luxury Finishes, Mountain Views, Security System',
      isFeatured: true,
    },
  ]

  for (const propertyData of properties) {
    const property = await prisma.property.create({
      data: {
        ...propertyData,
        ownerId: adminUser.id,
      },
    })
    console.log('✅ Property created:', property.title)
  }


  // Create office settings
  await prisma.officeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'Premium Real Estate',
      address: '123 Business District, City Center',
      phone: '+1 (555) 123-4567',
      email: 'info@premiumrealestate.com',
      website: 'https://premiumrealestate.com',
      mondayHours: '9:00 AM - 6:00 PM',
      tuesdayHours: '9:00 AM - 6:00 PM',
      wednesdayHours: '9:00 AM - 6:00 PM',
      thursdayHours: '9:00 AM - 6:00 PM',
      fridayHours: '9:00 AM - 6:00 PM',
      saturdayHours: '10:00 AM - 4:00 PM',
      sundayHours: 'Closed',
    },
  })

  console.log('✅ Office settings created')
  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })