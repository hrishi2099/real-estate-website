import { prisma } from './prisma';

export async function checkDatabaseSetup() {
  try {
    // Try to connect to the database
    await prisma.$connect();
    
    // Check if we can query the database
    const userCount = await prisma.user.count();
    console.log(`Database connected successfully. Found ${userCount} users.`);
    
    return { success: true, userCount };
  } catch (error) {
    console.error('Database setup check failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return { success: true, existed: true, user: existingAdmin };
    }

    // Create admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        joinDate: new Date().toISOString(),
      }
    });

    console.log('Admin user created successfully:', adminUser.email);
    return { success: true, existed: false, user: adminUser };
  } catch (error) {
    console.error('Failed to create admin user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}