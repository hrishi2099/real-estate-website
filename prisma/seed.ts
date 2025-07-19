import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zaminseva.com' },
    update: {},
    create: {
      email: 'admin@zaminseva.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    }
  })

  // Create regular users
  const users = []
  for (let i = 1; i <= 5; i++) {
    const password = await bcrypt.hash('user123', 12)
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        name: `User ${i}`,
        password,
        phone: `+1 (555) 000-000${i}`,
        role: 'USER',
        status: 'ACTIVE',
      }
    })
    users.push(user)
  }

  // Create properties
  const properties = [
    {
      title: 'Modern Downtown Apartment',
      description: 'A beautiful modern apartment in the heart of the city with stunning views and premium amenities.',
      price: 450000,
      location: 'Downtown, City Center',
      address: '123 Main Street, Downtown',
      type: 'APARTMENT' as const,
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      yearBuilt: 2020,
      features: JSON.stringify(['Air Conditioning', 'Balcony', 'Dishwasher', 'Gym/Fitness Center']),
      ownerId: admin.id,
    },
    {
      title: 'Luxury Villa with Pool',
      description: 'Spacious luxury villa featuring a private pool, garden, and premium finishes throughout.',
      price: 850000,
      location: 'Suburbs, Green Valley',
      address: '456 Oak Avenue, Green Valley',
      type: 'VILLA' as const,
      bedrooms: 4,
      bathrooms: 3.5,
      area: 3500,
      yearBuilt: 2019,
      features: JSON.stringify(['Swimming Pool', 'Garden', 'Garage', 'Fireplace', 'Security System']),
      ownerId: admin.id,
    },
    {
      title: 'Cozy Family House',
      description: 'Perfect family home in a quiet neighborhood with excellent schools nearby.',
      price: 320000,
      location: 'Residential Area, Maple District',
      address: '789 Elm Street, Maple District',
      type: 'HOUSE' as const,
      bedrooms: 3,
      bathrooms: 2,
      area: 1800,
      yearBuilt: 2015,
      features: JSON.stringify(['Garage', 'Garden', 'Laundry Room']),
      ownerId: admin.id,
    },
    {
      title: 'Penthouse Suite',
      description: 'Exclusive penthouse with panoramic city views and luxury amenities.',
      price: 1200000,
      location: 'Downtown, Premium Tower',
      address: '999 Skyline Boulevard, Premium Tower',
      type: 'APARTMENT' as const,
      bedrooms: 3,
      bathrooms: 3,
      area: 2500,
      yearBuilt: 2021,
      features: JSON.stringify(['Air Conditioning', 'Balcony', 'Dishwasher', 'Gym/Fitness Center', 'Security System']),
      ownerId: admin.id,
    },
    {
      title: 'Suburban Townhouse',
      description: 'Well-maintained townhouse in a family-friendly community.',
      price: 380000,
      location: 'Suburbs, Riverside',
      address: '321 River Road, Riverside',
      type: 'TOWNHOUSE' as const,
      bedrooms: 3,
      bathrooms: 2.5,
      area: 2000,
      yearBuilt: 2018,
      features: JSON.stringify(['Garage', 'Walk-in Closet', 'Heating']),
      ownerId: admin.id,
    }
  ]

  const createdProperties = []
  for (const propertyData of properties) {
    const property = await prisma.property.create({
      data: propertyData
    })
    createdProperties.push(property)
  }

  // Create some inquiries
  const inquiries = [
    {
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      message: 'Hi, I\'m interested in this property. Could you please provide more details about the viewing schedule?',
      propertyId: createdProperties[0].id,
      userId: users[0].id,
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 987-6543',
      message: 'I would like to schedule a viewing for this beautiful villa. What times are available this week?',
      propertyId: createdProperties[1].id,
      userId: users[1].id,
    },
    {
      name: 'Mike Davis',
      email: 'mike.davis@email.com',
      message: 'Is this property still available? I\'m very interested and can make an offer.',
      propertyId: createdProperties[2].id,
    }
  ]

  for (const inquiryData of inquiries) {
    await prisma.inquiry.create({
      data: inquiryData
    })
  }

  // Create some analytics data
  const analyticsEvents = ['VIEW', 'CONTACT', 'FAVORITE', 'SHARE'] as const
  for (let i = 0; i < 100; i++) {
    const randomProperty = createdProperties[Math.floor(Math.random() * createdProperties.length)]
    const randomEvent = analyticsEvents[Math.floor(Math.random() * analyticsEvents.length)]
    const randomUser = Math.random() > 0.5 ? users[Math.floor(Math.random() * users.length)] : null
    
    // Random date within last 30 days
    const randomDate = new Date()
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30))

    await prisma.propertyAnalytics.create({
      data: {
        event: randomEvent,
        propertyId: randomProperty.id,
        userId: randomUser?.id,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        createdAt: randomDate,
      }
    })
  }

  // Create some favorites
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const favoriteCount = Math.floor(Math.random() * 3) + 1 // 1-3 favorites per user
    
    for (let j = 0; j < favoriteCount; j++) {
      const randomProperty = createdProperties[Math.floor(Math.random() * createdProperties.length)]
      
      try {
        await prisma.favorite.create({
          data: {
            userId: user.id,
            propertyId: randomProperty.id,
          }
        })
      } catch (error) {
        // Ignore duplicate favorites
      }
    }
  }

  console.log('✅ Seed completed successfully!')
  console.log(`📊 Created:`)
  console.log(`   - 1 admin user (admin@zaminseva.com / admin123)`)
  console.log(`   - ${users.length} regular users`)
  console.log(`   - ${createdProperties.length} properties`)
  console.log(`   - ${inquiries.length} inquiries`)
  console.log(`   - 100 analytics records`)
  console.log(`   - Random favorites`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })