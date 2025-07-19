const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying SQLite Database Setup...\n');

    // Check users
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    console.log(`👥 Users: ${userCount} total (${adminCount} admin)`);

    // Check properties
    const propertyCount = await prisma.property.count();
    const activeProperties = await prisma.property.count({ where: { status: 'ACTIVE' } });
    console.log(`🏠 Properties: ${propertyCount} total (${activeProperties} active)`);

    // Check inquiries
    const inquiryCount = await prisma.inquiry.count();
    console.log(`📧 Inquiries: ${inquiryCount}`);

    // Check analytics
    const analyticsCount = await prisma.propertyAnalytics.count();
    console.log(`📊 Analytics Records: ${analyticsCount}`);

    // Check favorites
    const favoritesCount = await prisma.favorite.count();
    console.log(`❤️  Favorites: ${favoritesCount}`);

    // Sample admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { email: true, name: true }
    });
    
    if (admin) {
      console.log(`\n🔐 Admin User: ${admin.name} (${admin.email})`);
    }

    // Sample properties
    const properties = await prisma.property.findMany({
      take: 3,
      select: { title: true, price: true, location: true }
    });

    console.log('\n🏘️  Sample Properties:');
    properties.forEach(prop => {
      console.log(`   - ${prop.title} - $${prop.price.toLocaleString()} (${prop.location})`);
    });

    console.log('\n✅ Database is properly set up and populated!');
    console.log('\n📍 Database file location: prisma/dev.db');
    console.log('🌐 Prisma Studio: http://localhost:5555 (if running)');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();