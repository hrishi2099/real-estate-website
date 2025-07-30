import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {} as any
  };

  try {
    // Check environment variables
    diagnostics.checks.environmentVariables = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20) + '...' || 'NOT_SET'
    };

    // Test database connection
    try {
      await prisma.$connect();
      diagnostics.checks.databaseConnection = { status: 'SUCCESS', message: 'Connected to database' };
    } catch (error) {
      diagnostics.checks.databaseConnection = { 
        status: 'FAILED', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    // Test database query
    try {
      const userCount = await prisma.user.count();
      diagnostics.checks.databaseQuery = { 
        status: 'SUCCESS', 
        userCount,
        message: `Found ${userCount} users in database`
      };
    } catch (error) {
      diagnostics.checks.databaseQuery = { 
        status: 'FAILED', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    // Check for admin user
    try {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true, email: true, role: true, status: true }
      });
      
      diagnostics.checks.adminUser = adminUser 
        ? { status: 'FOUND', admin: adminUser }
        : { status: 'NOT_FOUND', message: 'No admin user found - database needs seeding' };
    } catch (error) {
      diagnostics.checks.adminUser = { 
        status: 'ERROR', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    return NextResponse.json(diagnostics);

  } catch (error) {
    diagnostics.checks.globalError = {
      status: 'CRITICAL_ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return NextResponse.json(diagnostics, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}