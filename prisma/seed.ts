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
      title: 'Premium Agricultural Land',
      description: 'Fertile agricultural land perfect for farming with excellent soil quality and water access.',
      price: 2500000,
      location: 'Rural District',
      address: '123 Farm Road, Agricultural Zone',
      latitude: 40.7128,
      longitude: -74.0060,
      type: 'AGRICULTURAL_LAND' as const,
      area: 50000,
      yearBuilt: null,
      features: 'Water Connection, Irrigation Facility, Fertile Soil, Road Access',
      isFeatured: true,
    },
    {
      title: 'NA Plot for Development',
      description: 'Prime NA land approved for residential development with clear title.',
      price: 4200000,
      location: 'Development Zone',
      address: '456 Development Road, NA Zone',
      latitude: 40.7489,
      longitude: -73.9857,
      type: 'NA_LAND' as const,
      area: 10000,
      yearBuilt: null,
      features: 'Clear Title, Approved Layout, Electricity Connection, Corner Plot',
      isFeatured: true,
    },
    {
      title: 'Large Agricultural Estate',
      description: 'Expansive agricultural land suitable for multiple crops with modern irrigation.',
      price: 8500000,
      location: 'Farm Belt',
      address: '789 Estate Road, Agricultural District',
      latitude: 40.7831,
      longitude: -73.9712,
      type: 'AGRICULTURAL_LAND' as const,
      area: 150000,
      yearBuilt: null,
      features: 'Irrigation Facility, Tree Plantation, Boundary Wall, Near Highway',
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
      companyName: 'Zaminseva Prime Pvt. Ltd.',
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