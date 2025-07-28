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

  // Create properties with GPS coordinates for map testing
  const properties = [
    {
      title: 'Premium Land Plot in Mumbai',
      description: 'Beautiful 10,000 sq ft land plot in prime location with excellent connectivity and all amenities nearby.',
      price: 15000000,
      location: 'Andheri West, Mumbai',
      address: 'Plot No. 123, Andheri West, Mumbai, Maharashtra',
      latitude: 19.1358,
      longitude: 72.8263,
      type: 'LAND' as const,
      area: 10000,
      yearBuilt: null,
      features: JSON.stringify(['Corner Plot', 'Clear Title', 'Ready for Construction', 'Near Metro Station', 'Gated Community']),
      ownerId: admin.id,
    },
    {
      title: 'Commercial Land in Pune',
      description: 'Excellent commercial land opportunity in developing area with high growth potential.',
      price: 25000000,
      location: 'Hinjewadi, Pune',
      address: 'Survey No. 456, Hinjewadi Phase 3, Pune, Maharashtra',
      latitude: 18.5912,
      longitude: 73.7389,
      type: 'COMMERCIAL' as const,
      area: 15000,
      yearBuilt: null,
      features: JSON.stringify(['Commercial Zone', 'Wide Road Access', 'IT Park Nearby', 'Future Metro Connectivity']),
      ownerId: admin.id,
    },
    {
      title: 'Residential Plot in Bangalore',
      description: 'Prime residential plot in well-established neighborhood with all modern amenities.',
      price: 8500000,
      location: 'Whitefield, Bangalore',
      address: 'Khata No. 789, Whitefield, Bangalore, Karnataka',
      latitude: 12.9698,
      longitude: 77.7500,
      type: 'LAND' as const,
      area: 5000,
      yearBuilt: null,
      features: JSON.stringify(['Residential Zone', 'Park Facing', '24/7 Security', 'Underground Utilities']),
      ownerId: admin.id,
    },
    {
      title: 'Modern Downtown Apartment',
      description: 'A beautiful modern apartment in the heart of the city with stunning views and premium amenities.',
      price: 450000,
      location: 'Downtown, City Center',
      address: '123 Main Street, Downtown',
      latitude: 19.076090,
      longitude: 72.877426,
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
      latitude: 18.520430,
      longitude: 73.856743,
      type: 'VILLA' as const,
      bedrooms: 4,
      bathrooms: 3.5,
      area: 3500,
      yearBuilt: 2019,
      features: JSON.stringify(['Swimming Pool', 'Garden', 'Garage', 'Fireplace', 'Security System']),
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

  // Create plot data
  const plotsData = [
    {
      plotNumber: 'P001',
      area: 2400,
      price: 1200000,
      location: 'Green Valley Estate, Mumbai',
      address: 'Plot P001, Green Valley Estate, Thane, Mumbai',
      latitude: 19.2183,
      longitude: 72.9781,
      status: 'AVAILABLE' as const,
      description: 'Corner plot with excellent road connectivity and utilities ready.',
      features: JSON.stringify(['Corner Plot', 'Utilities Ready', 'Wide Road Access', 'Gated Community']),
    },
    {
      plotNumber: 'P002',
      area: 1800,
      price: 900000,
      location: 'Green Valley Estate, Mumbai',
      address: 'Plot P002, Green Valley Estate, Thane, Mumbai',
      latitude: 19.2185,
      longitude: 72.9785,
      status: 'SOLD' as const,
      description: 'Beautiful residential plot with park facing location.',
      features: JSON.stringify(['Park Facing', 'East Facing', 'Quiet Location', 'Underground Utilities']),
      soldDate: new Date('2024-01-15'),
      buyerId: users[0].id,
    },
    {
      plotNumber: 'P003',
      area: 3000,
      price: 1800000,
      location: 'Green Valley Estate, Mumbai',
      address: 'Plot P003, Green Valley Estate, Thane, Mumbai',
      latitude: 19.2180,
      longitude: 72.9788,
      status: 'RESERVED' as const,
      description: 'Large plot suitable for luxury villa construction.',
      features: JSON.stringify(['Large Plot', 'North Facing', 'Premium Location', 'Mature Trees']),
    },
    {
      plotNumber: 'P004',
      area: 2200,
      price: 1100000,
      location: 'Sunrise Gardens, Pune',
      address: 'Plot P004, Sunrise Gardens, Wakad, Pune',
      latitude: 18.6059,
      longitude: 73.7629,
      status: 'AVAILABLE' as const,
      description: 'Well-located plot with easy access to IT hubs.',
      features: JSON.stringify(['IT Hub Nearby', 'Metro Connectivity', 'Shopping Mall', '24/7 Security']),
    },
    {
      plotNumber: 'P005',
      area: 2600,
      price: 1560000,
      location: 'Sunrise Gardens, Pune',
      address: 'Plot P005, Sunrise Gardens, Wakad, Pune',
      latitude: 18.6062,
      longitude: 73.7632,
      status: 'SOLD' as const,
      description: 'Premium plot with excellent investment potential.',
      features: JSON.stringify(['Premium Location', 'High ROI', 'Developed Infrastructure', 'Schools Nearby']),
      soldDate: new Date('2024-03-10'),
      buyerId: users[1].id,
    },
    {
      plotNumber: 'P006',
      area: 1600,
      price: 800000,
      location: 'Tech City, Bangalore',
      address: 'Plot P006, Tech City, Electronic City, Bangalore',
      latitude: 12.8456,
      longitude: 77.6640,
      status: 'AVAILABLE' as const,
      description: 'Compact plot perfect for modern home design.',
      features: JSON.stringify(['Modern Design Ready', 'Tech Hub', 'Airport Nearby', 'Green Spaces']),
    },
    {
      plotNumber: 'P007',
      area: 2800,
      price: 1680000,
      location: 'Tech City, Bangalore',
      address: 'Plot P007, Tech City, Electronic City, Bangalore',
      latitude: 18.6065,
      longitude: 73.7635,
      status: 'SOLD' as const,
      description: 'Spacious plot with panoramic city views.',
      features: JSON.stringify(['City Views', 'Spacious', 'Premium Amenities', 'Clubhouse Access']),
      soldDate: new Date('2024-02-20'),
      buyerId: users[2].id,
    },
    {
      plotNumber: 'P008',
      area: 2000,
      price: 1000000,
      location: 'Ocean View Heights, Chennai',
      address: 'Plot P008, Ocean View Heights, OMR, Chennai',
      latitude: 12.8735,
      longitude: 80.2209,
      status: 'AVAILABLE' as const,
      description: 'Coastal plot with sea breeze and modern amenities.',
      features: JSON.stringify(['Sea Breeze', 'Modern Amenities', 'IT Corridor', 'Beach Access']),
    },
    {
      plotNumber: 'P009',
      area: 3200,
      price: 2240000,
      location: 'Royal Gardens, Delhi',
      address: 'Plot P009, Royal Gardens, Gurgaon, Delhi NCR',
      latitude: 28.4595,
      longitude: 77.0266,
      status: 'RESERVED' as const,
      description: 'Luxury plot in prestigious gated community.',
      features: JSON.stringify(['Luxury Community', 'Golf Course View', 'Concierge Service', 'Helipad Access']),
    },
    {
      plotNumber: 'P010',
      area: 2100,
      price: 1260000,
      location: 'Emerald City, Hyderabad',
      address: 'Plot P010, Emerald City, HITEC City, Hyderabad',
      latitude: 17.4485,
      longitude: 78.3908,
      status: 'SOLD' as const,
      description: 'Tech-friendly plot in booming IT corridor.',
      features: JSON.stringify(['IT Corridor', 'Metro Station', 'Shopping Complex', 'International School']),
      soldDate: new Date('2024-04-05'),
      buyerId: users[3].id,
    }
  ];

  const createdPlots = [];
  for (const plotData of plotsData) {
    const plot = await prisma.plot.create({
      data: plotData
    });
    createdPlots.push(plot);
  }

  console.log('✅ Seed completed successfully!')
  console.log(`📊 Created:`)
  console.log(`   - 1 admin user (admin@zaminseva.com / admin123)`)
  console.log(`   - ${users.length} regular users`)
  console.log(`   - ${createdProperties.length} properties`)
  console.log(`   - ${createdPlots.length} plots`)
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